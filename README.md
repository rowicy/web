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
