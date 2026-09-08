import { visit } from 'unist-util-visit';
import { mkdir, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

function extractSize(svg) {
  const match = svg.match(
    /<svg[^>]*viewBox="[\d.-]+ [\d.-]+ ([\d.]+) ([\d.]+)"/
  );
  return match ? { width: match[1], height: match[2] } : null;
}

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
      // 事前削除すると並行リクエスト(dev prefetch等)が404を踏むため上書きのみ行う
      await mkdir(outDir, { recursive: true });

      const { D2 } = await import('@terrastruct/d2');
      const d2 = new D2();
      await d2.ready;

      try {
        // D2インスタンスは並行呼び出しで結果が混線するため逐次処理する
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
        // workerを閉じないとastro buildが終了せずハングする
        if (d2.worker && typeof d2.worker.terminate === 'function') {
          await d2.worker.terminate();
        }
      }

      // 孤児ファイルの削除は全件書き終わった後に行う(先に消すと404を踏む)
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
