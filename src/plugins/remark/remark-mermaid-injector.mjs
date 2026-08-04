import { visit } from 'unist-util-visit';

function escapeHtml(value) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * remark プラグイン
 *
 * markdown ASTにてmermaidコードブロックがある場合、クライアントでの描画スクリプト(mermaid.js処理)を末尾に挿入
 *
 * mermaidブロックはastro-expressive-codeが行ごとにラップして描画するため、
 * code.textContentから改行付きのソースを取り出せなくなる。
 * astro-expressive-codeには言語単位の除外オプションが無いため、
 * ここでrawなHTMLノードに置き換えてexpressive-codeの処理対象から外す。
 */
export function remarkMermaidInjector() {
  return function (tree) {
    let mermaidFound = false;

    visit(tree, 'code', (node, index, parent) => {
      if (node.lang !== 'mermaid' || !parent) return;

      mermaidFound = true;
      parent.children[index] = {
        type: 'html',
        value: `<pre data-language="mermaid"><code>${escapeHtml(node.value)}</code></pre>`,
      };
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
