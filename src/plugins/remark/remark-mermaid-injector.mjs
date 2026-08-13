import { visit } from 'unist-util-visit';

/**
 * remark プラグイン
 *
 * markdown ASTにてmermaidコードブロックがある場合、クライアントでの描画スクリプト(mermaid.js処理)を末尾に挿入
 *
 */
export function remarkMermaidInjector() {
  return function (tree) {
    let mermaidFound = false;

    // mermaidコードブロックの存在を確認
    visit(tree, 'code', node => {
      if (node.lang === 'mermaid') {
        mermaidFound = true;
        return false;
      }
    });

    // mermaidブロックがある場合、末尾にスクリプトを追加
    if (mermaidFound) {
      const scriptNode = {
        type: 'html',
        value: `<style>
  /* 縦がビューポートをはみ出す場合はアスペクト比を保ってスケールダウン。
     幅・高さ両方をautoにしつつmax-width/max-heightを指定することで、
     imgのobject-fit:contain相当の挙動をbrowserに任せる。画面幅を問わず適用。 */
  .mermaid-diagram svg {
    width: auto;
    height: auto;
    max-width: 100%;
    max-height: 90vh;
  }
  @media (min-width: 1024px) {
    .mermaid-container {
      max-width: 80vw;
    }
  }
</style>
<script>
  async function initMermaidDiagrams() {
    const blocks = document.querySelectorAll(
      'pre[data-language="mermaid"] code'
    );

    if (blocks.length === 0) return;

    try {
      if (!window.mermaid) {
        const script = document.createElement("script");
        script.src =
          "https://cdn.jsdelivr.net/npm/mermaid@latest/dist/mermaid.min.js";
        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }

      mermaid.initialize({
        startOnLoad: false,
        theme: "base",
        fontFamily: "Inter Variable, Noto Sans JP Variable, sans-serif",
        themeVariables: {
          fontFamily: "Inter Variable, Noto Sans JP Variable, sans-serif",
          darkMode: true,
          background: "#0f172a",
          primaryColor: "#1e293b",
          primaryTextColor: "#e2e8f0",
          primaryBorderColor: "#38bdf8",
          secondaryColor: "#1e293b",
          tertiaryColor: "#0f172a",
          lineColor: "#22d3ee",
          textColor: "#e2e8f0",
          mainBkg: "#1e293b",
          nodeBorder: "#38bdf8",
          clusterBkg: "#1e293b",
          clusterBorder: "#22d3ee",
          edgeLabelBackground: "#0f172a",
          actorBkg: "#1e293b",
          actorBorder: "#38bdf8",
          actorTextColor: "#e2e8f0",
          actorLineColor: "#22d3ee",
          signalColor: "#22d3ee",
          signalTextColor: "#e2e8f0",
          labelBoxBkgColor: "#1e293b",
          labelBoxBorderColor: "#38bdf8",
          labelTextColor: "#e2e8f0",
          loopTextColor: "#e2e8f0",
          noteBkgColor: "#1e293b",
          noteBorderColor: "#38bdf8",
          noteTextColor: "#e2e8f0",
          activationBkgColor: "#1e293b",
          activationBorderColor: "#22d3ee",
        },
        flowchart: {
          curve: "basis",
          padding: 12,
        },
      });

      for (let i = 0; i < blocks.length; i++) {
        const code = blocks[i];
        const pre = code.parentElement;
        let chart = code.textContent.trim();

        try {
          const { svg } = await mermaid.render(
            \`mermaid-\${i}\`,
            chart
          );
          
          const container = document.createElement("div");
          container.className = "mermaid-container";
          container.style.margin = "2rem 0";

          const wrapper = document.createElement("div");
          wrapper.className = "mermaid-diagram";
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
            \`Mermaid diagram \${i + 1} failed, keeping as code block\`,
            error
          );
        }
      }
    } catch (error) {
      console.warn("Mermaid library failed to load, keeping code blocks", error);
    }
  }
  
  document.addEventListener("DOMContentLoaded", initMermaidDiagrams);
</script>`,
      };

      tree.children.push(scriptNode);
    }
  };
}
