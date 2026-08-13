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
          // pie chart: default theme leaves every slice nearly the same
          // dark navy, making them indistinguishable. Give each slice a
          // distinct step along the dark-navy -> cyan accent range.
          pieOpacity: 1,
          pieOuterStrokeColor: "#38bdf8",
          pieSectionTextColor: "#e2e8f0",
          pieLegendTextColor: "#e2e8f0",
          pieStrokeColor: "#0f172a",
          pieTitleTextColor: "#e2e8f0",
          pie1: "#38bdf8",
          pie2: "#22d3ee",
          pie3: "#0ea5e9",
          pie4: "#0891b2",
          pie5: "#334155",
          pie6: "#475569",
          pie7: "#64748b",
          pie8: "#7dd3fc",
          pie9: "#67e8f9",
          pie10: "#1e293b",
          pie11: "#94a3b8",
          pie12: "#155e75",
          // gitGraph: default branch label chips render in a light
          // gray/lavender that clashes with the dark background.
          git0: "#38bdf8",
          git1: "#22d3ee",
          git2: "#0ea5e9",
          git3: "#0891b2",
          git4: "#7dd3fc",
          git5: "#67e8f9",
          git6: "#94a3b8",
          git7: "#475569",
          gitBranchLabel0: "#0f172a",
          gitBranchLabel1: "#0f172a",
          gitBranchLabel2: "#0f172a",
          gitBranchLabel3: "#0f172a",
          gitBranchLabel4: "#0f172a",
          gitBranchLabel5: "#0f172a",
          gitBranchLabel6: "#0f172a",
          gitBranchLabel7: "#0f172a",
          commitLabelColor: "#e2e8f0",
          commitLabelBackground: "#1e293b",
          tagLabelColor: "#e2e8f0",
          tagLabelBackground: "#1e293b",
          tagLabelBorder: "#38bdf8",
        },
        flowchart: {
          curve: "basis",
          padding: 12,
        },
      });

      for (let i = 0; i < blocks.length; i++) {
        const code = blocks[i];
        const pre = code.parentElement;
        // astro-expressive-codeは素のHTMLとして埋め込んだ<pre><code>も
        // 1行ずつ.ec-line divでラップしてしまい、code.textContentだけでは
        // 行間の改行が失われて1行に潰れ、mermaidのパースに失敗する
        // (flowchart等インデント依存の構文で顕著)。.ec-lineがあれば
        // 行ごとのtextContentを改行で結合し、無ければそのまま使う。
        const lines = code.querySelectorAll(':scope > .ec-line');
        let chart = (
          lines.length > 0
            ? Array.from(lines)
                .map(line => line.textContent)
                .join('\\n')
            : code.textContent
        ).trim();

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
