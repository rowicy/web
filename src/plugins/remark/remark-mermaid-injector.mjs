import { visit } from 'unist-util-visit';
import { mkdir, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import puppeteer from 'puppeteer';
import { renderMermaid } from '@mermaid-js/mermaid-cli';

function extractSize(svg) {
  const match = svg.match(
    /<svg[^>]*viewBox="[\d.-]+ [\d.-]+ ([\d.]+) ([\d.]+)"/
  );
  return match ? { width: match[1], height: match[2] } : null;
}

/**
 * remark プラグイン
 *
 * markdown AST中のmermaidコードブロックをビルド時にNode(puppeteer)上でSVGへ
 * レンダリングし、public/images/blog/<slug>/ に保存して<img>で埋め込む。
 */
export function remarkMermaidInjector() {
  return async function (tree, file) {
    try {
      const targets = [];
      visit(tree, 'code', (node, index, parent) => {
        if (node.lang !== 'mermaid' || !parent) return;
        targets.push({ node, index, parent });
      });
      if (targets.length === 0) return;

      const slug =
        file.stem || path.basename(file.path, path.extname(file.path));
      const outDir = path.join(process.cwd(), 'public', 'images', 'blog', slug);
      // devはprefetchAll等で同じ記事が並行に複数回処理されうるため、
      // 事前にディレクトリを消してから作り直すと、片方が削除した直後
      // (まだ書き直していない間)にもう片方がその画像を読みに行き404に
      // なる競合が起きる。削除はせず上書きし、不要になった古いファイル
      // だけ処理の最後に削除する。
      await mkdir(outDir, { recursive: true });

      const browser = await puppeteer.launch();

      try {
        let i = 0;
        for (const { node, index, parent } of targets) {
          const { data } = await renderMermaid(browser, node.value, 'svg', {
            mermaidConfig: { theme: 'default' },
          });
          const svg = Buffer.from(data).toString('utf8');
          const size = extractSize(svg);

          const filename = `mermaid-${i}.svg`;
          await writeFile(path.join(outDir, filename), svg, 'utf8');

          const sizeAttrs = size
            ? ` width="${size.width}" height="${size.height}"`
            : '';
          parent.children[index] = {
            type: 'html',
            value: `<div class="diagram-container"><div class="diagram-frame"><img src="/images/blog/${slug}/${filename}"${sizeAttrs} alt="" /></div></div>`,
          };
          i++;
        }
      } finally {
        await browser.close();
      }

      // 記事編集でmermaidブロックが減った場合の古いsvgだけ、全件書き終わった
      // 後にまとめて削除する(書き込み前に一括削除すると、並行リクエスト
      // 中の一瞬だけ画像が存在せず404になりうるため)。
      const currentFiles = new Set(targets.map((_, i) => `mermaid-${i}.svg`));
      const existingFiles = await readdir(outDir);
      await Promise.all(
        existingFiles
          .filter(f => f.startsWith('mermaid-') && !currentFiles.has(f))
          .map(f => rm(path.join(outDir, f), { force: true }))
      );
    } catch (error) {
      console.error('[remark-mermaid-injector] FAILED:', error);
      throw error;
    }
  };
}
