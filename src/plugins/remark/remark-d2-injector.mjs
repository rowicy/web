import { visit } from 'unist-util-visit';
import { mkdir, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

// D2はthemeIDによらず共通の意味的クラス(N1-N7/B1-B6/AA・AB1-5)をSVGに
// 付与するため、組み込みthemeIDに頼らずmermaidと同じ配色値を直接指定する。
// SVGファイル自体に埋め込むため、ページ側のCSSに依存せず<img>経由でも効く。
// fill-B1(矢印先端マーカー)とstroke-B1(矢印線、fill="none")を同一セレクタで
// まとめてfill/strokeを両方上書きすると、線のfill="none"が上書きされ開いた
// pathが塗りつぶされて太いリボン状になるため分離している。
const D2_SVG_STYLE = `
  .fill-N1, .fill-N2, .fill-N3, .fill-N4, .fill-N5 { fill: #e2e8f0 !important; }
  .fill-N6, .fill-N7 { fill: #0f172a !important; }
  .fill-B1, .fill-B2, .fill-B3, .fill-B4 { fill: #38bdf8 !important; }
  .fill-B5, .fill-B6 { fill: #1e293b !important; }
  .fill-AA1, .fill-AA2, .fill-AA3 { fill: #22d3ee !important; }
  .fill-AA4, .fill-AA5 { fill: #1e293b !important; }
  .fill-AB1, .fill-AB2, .fill-AB3 { fill: #22d3ee !important; }
  .fill-AB4, .fill-AB5 { fill: #1e293b !important; }
  .stroke-N1, .stroke-N2, .stroke-N3, .stroke-N4, .stroke-N5 { stroke: #e2e8f0 !important; }
  .stroke-N6, .stroke-N7 { stroke: #0f172a !important; }
  .stroke-B1, .stroke-B2, .stroke-B3, .stroke-B4 { stroke: #38bdf8 !important; }
  .stroke-B5, .stroke-B6 { stroke: #1e293b !important; }
  .stroke-AA1, .stroke-AA2, .stroke-AA3 { stroke: #22d3ee !important; }
  .stroke-AA4, .stroke-AA5 { stroke: #1e293b !important; }
  .stroke-AB1, .stroke-AB2, .stroke-AB3 { stroke: #22d3ee !important; }
  .stroke-AB4, .stroke-AB5 { stroke: #1e293b !important; }
  .connection.fill-B1 { fill: #22d3ee !important; }
  .connection.stroke-B1 { stroke: #22d3ee !important; }
`;

function injectSvgStyle(svg) {
  return svg.replace(
    /<svg[^>]*>/,
    match => `${match}<style>${D2_SVG_STYLE}</style>`
  );
}

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
          const { diagram, renderOptions } = await d2.compile(node.value);
          const rawSvg = await d2.render(diagram, renderOptions);
          const svg = injectSvgStyle(rawSvg);
          const size = extractSize(svg);

          const filename = `d2-${i}.svg`;
          await writeFile(path.join(outDir, filename), svg, 'utf8');

          const sizeAttrs = size
            ? ` width="${size.width}" height="${size.height}"`
            : '';
          parent.children[index] = {
            type: 'html',
            value: `<div class="d2-container"><div class="d2-diagram"><img src="/images/blog/${slug}/${filename}"${sizeAttrs} alt="" /></div></div>`,
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

      tree.children.push({
        type: 'html',
        value: `<style>
  .d2-container {
    margin: 2rem 0;
  }
  @media (min-width: 1024px) {
    .d2-container {
      max-width: 80vw;
    }
  }
  .d2-diagram {
    background-color: #0f172a;
    border-radius: 0.75rem;
    display: flex;
    justify-content: center;
    padding: 1.5rem;
  }
  .d2-diagram img {
    width: auto;
    height: auto;
    max-width: 100%;
    max-height: 90vh;
  }
</style>`,
      });
    } catch (error) {
      console.error('[remark-d2-injector] FAILED:', error);
      throw error;
    }
  };
}
