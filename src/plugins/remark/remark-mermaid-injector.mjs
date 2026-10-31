import { visit } from 'unist-util-visit';

// UMDビルドはwindow.mermaidを生やすのでscriptタグ1つで読める。
// v12系は同ビルドが5.5MBとブログには重く、サーバーレンダリング時に使っていた
// mermaid-cliと同系統でもあるためv11系に固定する。
const MERMAID_CDN =
  'https://cdn.jsdelivr.net/npm/mermaid@11.17.2/dist/mermaid.min.js';

// mermaid本体のlook:'handDrawn'は図種によって非対応のため、
// レンダリング後のSVGをsvg2roughjsで後処理し全図種で手描き風にする(rough.js同梱で95KB)
const SVG2ROUGHJS_CDN =
  'https://cdn.jsdelivr.net/npm/svg2roughjs@3.2.3/dist/svg2roughjs.umd.min.js';

// mermaidは配色をSVG内のidスコープ付き<style>として書き出すため、
// 外側のCSSからは上書きできずここで指定する(D2のNeutral defaultテーマに合わせている)。
// レイアウト(.diagram-container/.diagram-frame)はBlogLayout.astro側のCSS。
const MERMAID_CONFIG = {
  startOnLoad: false,
  // 失敗時にmermaidがbody直下へエラー図を描き足すのを止める(元のコードブロックを残す)
  suppressErrorRendering: true,
  theme: 'base',
  themeVariables: {
    background: '#ffffff',
    primaryColor: '#e3e9fd',
    primaryTextColor: '#0a0f25',
    primaryBorderColor: '#0d32b2',
    secondaryColor: '#edf0fd',
    secondaryBorderColor: '#0d32b2',
    secondaryTextColor: '#0a0f25',
    tertiaryColor: '#f7f8fe',
    tertiaryBorderColor: '#0d32b2',
    tertiaryTextColor: '#0a0f25',
    noteBkgColor: '#eef1f8',
    noteBorderColor: '#0d32b2',
    noteTextColor: '#0a0f25',
    lineColor: '#0d32b2',
    textColor: '#0a0f25',
    mainBkg: '#e3e9fd',
    errorBkgColor: '#ffffff',
    errorTextColor: 'red',
    nodeBorder: '#0d32b2',
    clusterBkg: '#eef1f8',
    clusterBorder: '#9499ab',
    defaultLinkColor: '#0d32b2',
    titleColor: '#0a0f25',
    edgeLabelBackground: '#eef1f8',
    nodeTextColor: '#0a0f25',
    actorBkg: '#e3e9fd',
    actorBorder: '#0d32b2',
    actorTextColor: '#0a0f25',
    actorLineColor: '#0d32b2',
    signalColor: '#0d32b2',
    signalTextColor: '#0a0f25',
    labelBoxBkgColor: '#edf0fd',
    labelBoxBorderColor: '#0d32b2',
    labelTextColor: '#0a0f25',
    loopTextColor: '#0a0f25',
    activationBorderColor: '#0d32b2',
    activationBkgColor: '#f7f8fe',
    sequenceNumberColor: '#ffffff',
    pie1: '#e3e9fd',
    pie2: '#a4b4f7',
    pie3: '#4a6ff3',
    pieOpacity: 0.9,
    pieStrokeColor: '#0d32b2',
    pieOuterStrokeColor: '#0d32b2',
    pieTitleTextColor: '#0a0f25',
    pieSectionTextColor: '#0a0f25',
    pieLegendTextColor: '#0a0f25',
    labelColor: '#0a0f25',
    altBackground: '#eef1f8',
    classText: '#0a0f25',
  },
  // htmlLabels:falseがないとラベルがforeignObject(HTML)になり
  // svg2roughjsが正しく手描き風に変換できない
  htmlLabels: false,
  flowchart: { htmlLabels: false },
};

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

const clientScript = `<script>
  (async () => {
    const blocks = document.querySelectorAll('pre[data-mermaid]');
    if (blocks.length === 0) return;

    const loadScript = src =>
      new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });

    // getBBox()はdisplay:noneだと壊れるため、画面外に置いて隠す
    const stage = document.createElement('div');
    stage.style.cssText = 'position:absolute;left:-9999px;top:-9999px';

    const sketch = async markup => {
      stage.innerHTML = markup;
      const source = stage.querySelector('svg');
      // mermaidはwidth="100%"を吐くのでsvg2roughjsが実寸を決められない。viewBoxから与える
      const box = source.viewBox.baseVal;
      if (box && box.width) {
        source.setAttribute('width', box.width);
        source.setAttribute('height', box.height);
        source.style.maxWidth = 'none';
      }
      const target = stage.appendChild(document.createElement('div'));
      const converter = new svg2roughjs.Svg2Roughjs(target);
      converter.seed = 1;
      // デフォルトフォントは日本語グリフがなく文字化けするため元のSVGのフォントを使う
      converter.fontFamily = null;
      converter.svg = source;
      const result = await converter.sketch();
      // svg2roughjsの出力はviewBoxを持たず、max-widthで縮めると中身が切れるので付け直す
      result.setAttribute(
        'viewBox',
        '0 0 ' + result.getAttribute('width') + ' ' + result.getAttribute('height')
      );
      return result.outerHTML;
    };

    try {
      await Promise.all([
        loadScript(${JSON.stringify(MERMAID_CDN)}),
        loadScript(${JSON.stringify(SVG2ROUGHJS_CDN)}),
      ]);

      mermaid.initialize(${JSON.stringify(MERMAID_CONFIG)});
      document.body.appendChild(stage);

      for (let i = 0; i < blocks.length; i++) {
        try {
          const { svg } = await mermaid.render(
            'mermaid-' + i,
            blocks[i].textContent.trim()
          );
          blocks[i].outerHTML = await sketch(svg);
        } catch (error) {
          console.warn('[mermaid] diagram ' + i + ' failed, keeping code block', error);
        }
      }
    } catch (error) {
      console.warn('[mermaid] library failed to load, keeping code blocks', error);
    } finally {
      stage.remove();
    }
  })();
</script>`;

/**
 * remarkプラグイン
 *
 * mermaidコードブロックをクライアント描画用のプレースホルダに置き換え、
 * mermaidブロックを含むページにだけCDN読み込みスクリプトを末尾へ挿入する。
 *
 * astro-expressive-codeはコードブロックを行ごとにラップするためcode.textContentから
 * 改行付きのソースを取り出せなくなる。言語単位の除外オプションが無いので、
 * ここでrawなHTMLノードに置き換えてexpressive-codeの処理対象から外す。
 */
export function remarkMermaidInjector() {
  return function (tree) {
    let mermaidFound = false;

    visit(tree, 'code', (node, index, parent) => {
      if (node.lang !== 'mermaid' || !parent) return;

      mermaidFound = true;
      // 描画前・描画失敗時はこのコードブロックがそのまま残る
      parent.children[index] = {
        type: 'html',
        value: `<div class="diagram-container"><div class="diagram-frame"><pre data-mermaid><code>${escapeHtml(node.value)}</code></pre></div></div>`,
      };
    });

    if (mermaidFound) {
      tree.children.push({ type: 'html', value: clientScript });
    }
  };
}
