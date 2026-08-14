# Rowicy Web

## 環境情報

- pnpm
- Node.js
- Astro
- shadcn/ui

## コンポーネント追加

```sh
pnpm dlx shadcn-ui@latest add
```

追加できるコンポーネントは[shadcn/ui](https://ui.shadcn.com/docs/components/)を参照してください。

## セットアップ

依存インストール

```bash
pnpm install --frozen-lockfile
```

開発サーバー起動

```bash
pnpm dev
```

ビルド

```bash
pnpm build
```

プレビュー

```bash
pnpm preview
```

コード整形

```bash
pnpm format
```

## 記事内MD記法

### 基本

標準的な Markdown 記法（見出し、リスト、リンク等）に対応しています。

### コードブロック

コードブロックの言語指定以降に以下属性を付与することで、多様なマーカーや装飾を追加できます。

| 属性                      | 用途               | 例                         |
| ----------------------- | ---------------- | ------------------------- |
| 先頭行のファイル名コメント           | ファイルパス/タイトルを自動推測 | ```ts の1行目に // src/a.ts   |
| title="..."             | ファイルパス/タイトル表示    | ```ts title="src/a.ts"    |
| {2-4}                   | マーカーライン（行ハイライト）  | ```ts {2-4}               |
| ins={n} / del={n}       | 行単位の追加/削除マーカー    | ```ts ins={2} del={3}     |
| "word" / /regex/        | ワードマーカー          | ```ts "greet" /Hi.*!/     |
| ins="word" / del="word" | 単語単位の追加/削除マーカー   | ```ts ins="foo" del="bar" |
| wrap                    | 長い行の折り返し         | ```ts wrap                |
| frame="terminal"        | ターミナル風フレーム       | ```bash frame="terminal"  |
| showLineNumbers         | 行番号表示            | ```ts showLineNumbers     |
| collapse={1-3}          | 指定行の折りたたみ        | ```ts collapse={1-3}      |
| ```diff                 | diff構文（+/-表示）    | ```diff title="x.ts"      |

さらに詳しく [Text & Line Markers](https://expressive-code.com/key-features/text-markers/)


### ダイアグラム（Mermaid）

コードブロックの言語指定に `mermaid` を記述することで、フローチャートやシーケンス図などをレンダリングできます。


## ブログ記事投稿

1. ブログ記事執筆用ブランチを作成する
   - (`blog-title`はタイトル等、記事を識別できる名称に置き換える)

     ```bash
     git flow feature start blog/blog-title
     ```

2. [/src/content](/src/content) 配下に .md ファイルを作成する
   - 参考:
     [/src/content/blog/\_template/blog-title.md](/src/content/blog/_template/blog-title.md)
3. ブログ記事執筆用をdevelopブランチへマージする
   - **マージ前にローカルで表示確認を行うこと**
4. developブランチをmainブランチへマージする
   - **プルリクエスト作成時にプレビューURLが発行されるので、表示の確認を行うこと**
