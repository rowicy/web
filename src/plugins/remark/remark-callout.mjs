import { visit } from 'unist-util-visit';

const calloutRegex = /^\[!([^\]]+)\]/;

/**
 * remark プラグイン
 *
 * `> [!任意の文字列]` から始まる blockquote を、既存の blockquote スタイルの
 * まま「ラベル部分だけ少し強調する」コールアウトに変換する。
 * 種別による色分けは行わない(全種別で見た目は同じ)。
 */
export function remarkCallout() {
  return function (tree) {
    visit(tree, 'blockquote', node => {
      const firstParagraph = node.children.find(
        child => child.type === 'paragraph'
      );
      const firstText = firstParagraph?.children?.[0];
      if (firstText?.type !== 'text') return;

      const match = firstText.value.match(calloutRegex);
      if (!match) return;

      const label = match[1];
      const rest = firstText.value
        .replace(calloutRegex, '')
        .replace(/^\n+/, '');
      if (rest) {
        // 同じテキストノード内に本文が続く場合(例: "[!X]\n本文" が1つのtextノード)
        firstParagraph.children[0] = { type: 'text', value: rest };
      } else {
        // ラベル行のみのtextノードを除去(直後のbreakノードも除去)
        firstParagraph.children.shift();
        if (firstParagraph.children[0]?.type === 'break') {
          firstParagraph.children.shift();
        }
      }

      node.data = {
        hProperties: { className: ['callout'] },
      };
      node.children.unshift({
        type: 'paragraph',
        children: [{ type: 'text', value: label }],
        data: {
          hProperties: { className: 'callout-label' },
        },
      });
    });
  };
}
