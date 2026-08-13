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
        value: `<script>
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
          primaryColor: "hsl(210 40% 96.1%)",
          primaryTextColor: "hsl(222.2 84% 4.9%)",
          primaryBorderColor: "hsl(222.2 47.4% 11.2%)",
          secondaryColor: "hsl(210 40% 96.1%)",
          tertiaryColor: "hsl(0 0% 100%)",
          lineColor: "hsl(215.4 16.3% 46.9%)",
          textColor: "hsl(222.2 84% 4.9%)",
          mainBkg: "hsl(210 40% 96.1%)",
          nodeBorder: "hsl(222.2 47.4% 11.2%)",
          clusterBkg: "hsl(210 40% 96.1%)",
          clusterBorder: "hsl(214.3 31.8% 91.4%)",
          edgeLabelBackground: "hsl(0 0% 100%)",
          actorBkg: "hsl(210 40% 96.1%)",
          actorBorder: "hsl(222.2 47.4% 11.2%)",
          actorTextColor: "hsl(222.2 84% 4.9%)",
          signalColor: "hsl(222.2 47.4% 11.2%)",
          signalTextColor: "hsl(222.2 84% 4.9%)",
          labelBoxBkgColor: "hsl(210 40% 96.1%)",
          labelBoxBorderColor: "hsl(222.2 47.4% 11.2%)",
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
          container.className = \`mermaid-container my-8\`;

          const wrapper = document.createElement("div");
          wrapper.className = \`mermaid-diagram rounded-lg min-h-[100px] bg-transparent\`;
          
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
