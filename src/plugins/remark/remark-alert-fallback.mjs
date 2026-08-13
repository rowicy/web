import { visit } from 'unist-util-visit';

const calloutRegex = /^\[!([^\]]+)\]/;

/**
 * remark プラグイン
 *
 * `remarkAlert`(remark-github-blockquote-alert)が対応する
 * note/tip/important/warning/caution 以外の `> [!XXX]` 記法を、
 * 無彩色のデフォルトコールアウト(markdown-alert-default)として変換する。
 * 必ず remarkAlert の後に実行すること。
 */
export function remarkAlertFallback() {
  return function (tree) {
    visit(tree, 'blockquote', node => {
      // remarkAlert で既に変換済み(note/tip/...)のものはスキップ
      if (node.data?.hProperties?.className?.includes('markdown-alert')) {
        return;
      }

      const firstParagraph = node.children.find(
        child => child.type === 'paragraph'
      );
      const firstText = firstParagraph?.children?.[0];
      if (firstText?.type !== 'text') return;

      const match = firstText.value.match(calloutRegex);
      if (!match) return;

      const title = match[1];
      const rest = firstText.value
        .replace(calloutRegex, '')
        .replace(/^\n+/, '');
      if (rest) {
        // 同じテキストノード内に本文が続く場合(例: "[!X]\n本文" が1つのtextノード)
        firstParagraph.children[0] = { type: 'text', value: rest };
      } else {
        // タイトル行のみのtextノードを除去(直後のbreakノードも除去)
        firstParagraph.children.shift();
        if (firstParagraph.children[0]?.type === 'break') {
          firstParagraph.children.shift();
        }
      }

      node.data = {
        hName: 'div',
        hProperties: {
          className: ['markdown-alert', 'markdown-alert-default'],
          dir: 'auto',
        },
      };
      node.children.unshift({
        type: 'paragraph',
        children: [{ type: 'text', value: title }],
        data: {
          hProperties: {
            className: 'markdown-alert-title',
            dir: 'auto',
          },
        },
      });
    });
  };
}
