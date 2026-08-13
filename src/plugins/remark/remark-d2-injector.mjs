import { visit } from 'unist-util-visit';

/**
 * remark プラグイン
 *
 * markdown ASTにてD2コードブロックがある場合、クライアントでの描画スクリプト(@terrastruct/d2処理)を末尾に挿入
 *
 */
export function remarkD2Injector() {
  return function (tree) {
    let d2Found = false;

    // D2コードブロックの存在を確認
    visit(tree, 'code', node => {
      if (node.lang === 'd2') {
        d2Found = true;
        return false;
      }
    });

    // D2ブロックがある場合、末尾にスクリプトを追加
    if (d2Found) {
      const scriptNode = {
        type: 'html',
        value: `<style>
  /* 縦がビューポートをはみ出す場合はアスペクト比を保ってスケールダウン。
     幅・高さ両方をautoにしつつmax-width/max-heightを指定することで、
     imgのobject-fit:contain相当の挙動をbrowserに任せる。画面幅を問わず適用。 */
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

  /*
   * D2のテーマシステムはthemeIDによらず共通の意味的クラス(N1-N7: 中間色,
   * B1-B6: プライマリ色相, AA/AB1-5: アクセント色相)をSVGに付与するため、
   * 組み込みthemeIDで近似させるのではなく、mermaidダークテーマ
   * (feature/mermaid-theme)と同じ配色値をこのクラスに直接上書きする。
   * ponytail: 一般的なshape/connection/labelのクラスのみ対応。
   * SQLテーブルやシーケンス図など特殊な図では未対応の配色クラスが
   * 出てくる可能性がある(その場合はここに追記)。
   */
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
  /* connection(矢印)はノード枠と同じB1クラスを共有しているため、
     mermaidのlineColorに合わせて水色アクセントで上書きする */
  .d2-diagram svg .connection.fill-B1,
  .d2-diagram svg .connection.stroke-B1 {
    fill: #22d3ee !important;
    stroke: #22d3ee !important;
  }
</style>
<script>
  async function initD2Diagrams() {
    const blocks = document.querySelectorAll(
      'pre code.language-d2'
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
        let script = code.textContent.trim();

        try {
          const { diagram, renderOptions } = await d2.compile(script);
          const svg = await d2.render(diagram, renderOptions);

          const container = document.createElement("div");
          container.className = "d2-container";
          container.style.margin = "2rem 0";

          const wrapper = document.createElement("div");
          wrapper.className = "d2-diagram";
          // Tailwind can't scan classes generated inside this .mjs client
          // script (content globs don't include .mjs), so styling here is
          // inline to avoid silent purge instead of relying on utility
          // classes that only exist in this string.
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
