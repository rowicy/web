import { visit } from 'unist-util-visit';
import { mkdir, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

function extractSize(svg) {
  const match = svg.match(
    /<svg[^>]*viewBox="[\d.-]+ [\d.-]+ ([\d.]+) ([\d.]+)"/
  );
  return match ? { width: match[1], height: match[2] } : null;
}

/**
 * remark プラグイン
 *
 * markdown AST中のD2コードブロックをビルド時にNode上でSVGへレンダリングし、
 * public/images/blog/<slug>/ に保存して<img>で埋め込む。
 */
export function remarkD2Injector() {
  return async function (tree, file) {
    try {
      const targets = [];
      visit(tree, 'code', (node, index, parent) => {
        if (node.lang !== 'd2' || !parent) return;
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

      const { D2 } = await import('@terrastruct/d2');
      const d2 = new D2();
      await d2.ready;

      try {
        // d2のD2クラスは1インスタンスにつき同時に1リクエストしか処理できない
        // (内部のsendMessageがresolverを使い回しており並行呼び出しで結果が
        // 混線する)ため、Promise.allではなく1件ずつ逐次処理する。
        let i = 0;
        for (const { node, index, parent } of targets) {
          const { diagram, renderOptions } = await d2.compile(node.value, {
            themeID: 0,
            sketch: true,
          });
          const svg = await d2.render(diagram, renderOptions);
          const size = extractSize(svg);

          const filename = `d2-${i}.svg`;
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
        // Nodeのworker_threadsを明示的に閉じないとプロセス(astro build)が
        // 終了できずハングするため、使い終わったら必ず止める。
        if (d2.worker && typeof d2.worker.terminate === 'function') {
          await d2.worker.terminate();
        }
      }

      // 記事編集でD2ブロックが減った場合の古いsvgだけ、全件書き終わった
      // 後にまとめて削除する(書き込み前に一括削除すると、並行リクエスト
      // 中の一瞬だけ画像が存在せず404になりうるため)。
      const currentFiles = new Set(targets.map((_, i) => `d2-${i}.svg`));
      const existingFiles = await readdir(outDir);
      await Promise.all(
        existingFiles
          .filter(f => f.startsWith('d2-') && !currentFiles.has(f))
          .map(f => rm(path.join(outDir, f), { force: true }))
      );
    } catch (error) {
      console.error('[remark-d2-injector] FAILED:', error);
      throw error;
    }
  };
}
