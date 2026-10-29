import { definePlugin, isInlineStyleAnnotation } from 'astro-expressive-code';

const SHELL_LANGS = new Set(['sh', 'bash', 'zsh', 'shell', 'shellscript']);
// 行頭の `$` / `%` をプロンプトとみなす(インデントは許容)
const PROMPT = /^\s*[$%](\s|$)/;
const COMMENT = /^\s*#/;
const CONTINUATION = /\\$/;

/**
 * プロンプト付きのシェルブロックで、標準出力の行だけハイライトを外す。
 * プロンプトが1つも無いブロック(=コマンドのみ)には手を加えない。
 */
export function shellSession() {
  return definePlugin({
    name: 'shell-session',
    hooks: {
      postprocessAnalyzedCode({ codeBlock }) {
        if (!SHELL_LANGS.has(codeBlock.language)) return;
        const lines = codeBlock.getLines();
        if (!lines.some(line => PROMPT.test(line.text))) return;

        let continued = false;
        for (const line of lines) {
          const text = line.text.trimEnd();
          const isCommand =
            continued || PROMPT.test(text) || COMMENT.test(text);
          continued = isCommand && CONTINUATION.test(text);
          if (isCommand) continue;
          for (const annotation of [...line.getAnnotations()]) {
            if (isInlineStyleAnnotation(annotation))
              line.deleteAnnotation(annotation);
          }
        }
      },
    },
  });
}
