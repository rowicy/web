import { visit } from 'unist-util-visit';

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * remark プラグイン
 *
 * markdown ASTにてD2コードブロックがある場合、クライアントでの描画スクリプト(@terrastruct/d2処理)を末尾に挿入
 *
 * astro-expressive-codeには言語単位の除外オプションが無いため、
 * D2ノードは生HTMLに置き換えて処理対象から外す(remark-mermaid-injector.mjsと同じ対策)。
 */
export function remarkD2Injector() {
  return function (tree) {
    let d2Found = false;

    visit(tree, 'code', (node, index, parent) => {
      if (node.lang !== 'd2' || !parent) return;

      d2Found = true;
      parent.children[index] = {
        type: 'html',
        value: `<pre data-language="d2"><code>${escapeHtml(node.value)}</code></pre>`,
      };
    });

    if (d2Found) {
      const scriptNode = {
        type: 'html',
        value: `<style>
  /* 縦長ではみ出す場合にアスペクト比を保ってスケールダウン(imgのobject-fit:contain相当)。 */
  .d2-diagram svg {
    width: auto;
    height: auto;
    max-width: 100%;
    max-height: 90vh;
  }
  @media (min-width: 1024px) {
    .d2-container {
      max-width: 80vw;
    }
  }

  /* D2はthemeIDによらず共通の意味的クラス(N1-N7/B1-B6/AA・AB1-5)をSVGに
     付与するため、組み込みthemeIDに頼らずmermaidと同じ配色値を直接指定する。
     未対応の図種(SQLテーブル等)向けクラスが出てきたら追記する。 */
  .d2-diagram svg .fill-N1,
  .d2-diagram svg .fill-N2,
  .d2-diagram svg .fill-N3,
  .d2-diagram svg .fill-N4,
  .d2-diagram svg .fill-N5 {
    fill: #e2e8f0 !important;
  }
  .d2-diagram svg .fill-N6,
  .d2-diagram svg .fill-N7 {
    fill: #0f172a !important;
  }
  .d2-diagram svg .fill-B1,
  .d2-diagram svg .fill-B2,
  .d2-diagram svg .fill-B3,
  .d2-diagram svg .fill-B4 {
    fill: #38bdf8 !important;
  }
  .d2-diagram svg .fill-B5,
  .d2-diagram svg .fill-B6 {
    fill: #1e293b !important;
  }
  .d2-diagram svg .fill-AA1,
  .d2-diagram svg .fill-AA2,
  .d2-diagram svg .fill-AA3 {
    fill: #22d3ee !important;
  }
  .d2-diagram svg .fill-AA4,
  .d2-diagram svg .fill-AA5 {
    fill: #1e293b !important;
  }
  .d2-diagram svg .fill-AB1,
  .d2-diagram svg .fill-AB2,
  .d2-diagram svg .fill-AB3 {
    fill: #22d3ee !important;
  }
  .d2-diagram svg .fill-AB4,
  .d2-diagram svg .fill-AB5 {
    fill: #1e293b !important;
  }

  .d2-diagram svg .stroke-N1,
  .d2-diagram svg .stroke-N2,
  .d2-diagram svg .stroke-N3,
  .d2-diagram svg .stroke-N4,
  .d2-diagram svg .stroke-N5 {
    stroke: #e2e8f0 !important;
  }
  .d2-diagram svg .stroke-N6,
  .d2-diagram svg .stroke-N7 {
    stroke: #0f172a !important;
  }
  .d2-diagram svg .stroke-B1,
  .d2-diagram svg .stroke-B2,
  .d2-diagram svg .stroke-B3,
  .d2-diagram svg .stroke-B4 {
    stroke: #38bdf8 !important;
  }
  .d2-diagram svg .stroke-B5,
  .d2-diagram svg .stroke-B6 {
    stroke: #1e293b !important;
  }
  .d2-diagram svg .stroke-AA1,
  .d2-diagram svg .stroke-AA2,
  .d2-diagram svg .stroke-AA3 {
    stroke: #22d3ee !important;
  }
  .d2-diagram svg .stroke-AA4,
  .d2-diagram svg .stroke-AA5 {
    stroke: #1e293b !important;
  }
  .d2-diagram svg .stroke-AB1,
  .d2-diagram svg .stroke-AB2,
  .d2-diagram svg .stroke-AB3 {
    stroke: #22d3ee !important;
  }
  .d2-diagram svg .stroke-AB4,
  .d2-diagram svg .stroke-AB5 {
    stroke: #1e293b !important;
  }
  /* fill-B1(矢印先端マーカー)とstroke-B1(矢印線、fill="none")を同一
     セレクタでまとめてfill/strokeを両方上書きすると、線のfill="none"が
     上書きされ開いたpathが塗りつぶされて太いリボン状になるため分離する。 */
  .d2-diagram svg .connection.fill-B1 {
    fill: #22d3ee !important;
  }
  .d2-diagram svg .connection.stroke-B1 {
    stroke: #22d3ee !important;
  }
</style>
<script>
  async function initD2Diagrams() {
    const blocks = document.querySelectorAll(
      'pre[data-language="d2"] code'
    );

    if (blocks.length === 0) return;

    try {
      const { D2 } = await import(
        "https://esm.sh/@terrastruct/d2@0.1.33"
      );
      const d2 = new D2();

      for (let i = 0; i < blocks.length; i++) {
        const code = blocks[i];
        const pre = code.parentElement;
        // astro-expressive-codeが1行ずつ.ec-line divでラップするため、
        // textContentだけでは改行が失われ1行に潰れてパースに失敗する。
        // .ec-lineがあれば行ごとに改行で結合し直す。
        const lines = code.querySelectorAll(':scope > .ec-line');
        let script = (
          lines.length > 0
            ? Array.from(lines)
                .map(line => line.textContent)
                .join('\\n')
            : code.textContent
        ).trim();

        try {
          const { diagram, renderOptions } = await d2.compile(script);
          const svg = await d2.render(diagram, renderOptions);

          const container = document.createElement("div");
          container.className = "d2-container";
          container.style.margin = "2rem 0";

          const wrapper = document.createElement("div");
          wrapper.className = "d2-diagram";
          // .mjs内の文字列はTailwindのcontentスキャン対象外でpurgeされるため、
          // ユーティリティクラスに頼らずインラインstyleで指定する。
          wrapper.style.cssText = [
            "background-color: #0f172a",
            "border-radius: 0.75rem",
            "min-height: 100px",
            "display: flex",
            "justify-content: center",
            "overflow-x: auto",
            "padding: 1.5rem",
          ].join("; ");

          wrapper.innerHTML = svg;
          container.appendChild(wrapper);
          pre.parentNode.replaceChild(container, pre);
        } catch (error) {
          console.warn(
            \`D2 diagram \${i + 1} failed, keeping as code block\`,
            error
          );
        }
      }
    } catch (error) {
      console.warn("D2 library failed to load, keeping code blocks", error);
    }
  }

  document.addEventListener("DOMContentLoaded", initD2Diagrams);
</script>`,
      };

      tree.children.push(scriptNode);
    }
  };
}
