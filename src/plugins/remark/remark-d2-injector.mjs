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
        value: `<script>
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
          container.className = \`d2-container my-8\`;

          const wrapper = document.createElement("div");
          wrapper.className = \`d2-diagram rounded-lg min-h-[100px] bg-transparent\`;

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
