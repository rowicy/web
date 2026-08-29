import { visit } from 'unist-util-visit';
import { mkdir, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import puppeteer from 'puppeteer';
import { renderMermaid } from '@mermaid-js/mermaid-cli';

const require = createRequire(import.meta.url);
const SVG2ROUGHJS_PATH = require.resolve(
  'svg2roughjs/dist/svg2roughjs.umd.min.js'
);

function extractSize(svg) {
  const viewBoxMatch = svg.match(
    /<svg[^>]*viewBox="[\d.-]+ [\d.-]+ ([\d.]+) ([\d.]+)"/
  );
  if (viewBoxMatch) {
    return { width: viewBoxMatch[1], height: viewBoxMatch[2] };
  }
  const tag = svg.match(/<svg[^>]*>/)?.[0];
  const width = tag?.match(/\swidth="([\d.]+)"/)?.[1];
  const height = tag?.match(/\sheight="([\d.]+)"/)?.[1];
  return width && height ? { width, height } : null;
}

// mermaidのlook:'handDrawn'は一部の図種(flowchart等)にしか効かないため、
// レンダリング後のSVGをsvg2roughjs(rough.js)で後処理し、図種によらず
// 一様に手描き風へ変換する。
async function sketchify(browser, svgMarkup) {
  const page = await browser.newPage();
  try {
    // display:none(hidden属性)だとgetBBox()が正しい値を返せず、テキストが
    // 意味不明な線描画にフォールバックしてしまうため、画面外配置で隠す。
    await page.setContent(
      '<div id="src" style="position:absolute;left:-9999px;top:-9999px"></div><div id="out"></div>'
    );
    await page.addScriptTag({ path: SVG2ROUGHJS_PATH });
    return await page.evaluate(async markup => {
      document.getElementById('src').innerHTML = markup;
      const svgEl = document.querySelector('#src svg');
      const converter = new svg2roughjs.Svg2Roughjs('#out');
      converter.seed = 1;
      // デフォルトの'Comic Sans MS, cursive'は日本語グリフを持たず、
      // 幅計測がずれて文字が重なり読めなくなるため、元のSVGのフォントを使う。
      converter.fontFamily = null;
      converter.svg = svgEl;
      const result = await converter.sketch();
      return result.outerHTML;
    }, svgMarkup);
  } finally {
    await page.close();
  }
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
            // htmlLabelsをfalseにしないとラベルがforeignObject(HTML)で
            // 描画され、svg2roughjsが正しく手描き風に変換できないため、
            // ネイティブSVGの<text>を使うよう強制する。
            mermaidConfig: {
              theme: 'default',
              htmlLabels: false,
              flowchart: { htmlLabels: false },
            },
          });
          const svg = await sketchify(
            browser,
            Buffer.from(data).toString('utf8')
          );
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
