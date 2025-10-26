---
title: Vite ベースの TypeScript, Sass, Bulma の簡易設定を行った開発用テンプレートを作成してみた
description: Vite ベースの TypeScript, Sass, Bulma などの簡易設定を行った開発用テンプレートを作成したので、ご紹介します。
author: Naoki
tags: [Tech]
pubDate: '2024-08-24'
---

[Vite](https://ja.vitejs.dev/) ベースの [TypeScript](https://www.typescriptlang.org/), [Sass](https://sass-lang.com/), [Bulma](https://bulma.io/) などの簡易設定を行った開発用テンプレートを作成しました。

本記事では、作成に至った経緯や、作成の流れをご紹介します。

## リポジトリ

下記が実際に作成したテンプレートです。

https://github.com/naoki-00-ito/vite-ts-bulma-sass-template

## 作成経緯

直近で Python のテンプレートエンジンである [Jinja](https://jinja.palletsprojects.com/en/3.1.x/) を使った開発を行う機会があるのですが、Jinja は、シンプルに CSS や JavaScript を読み込む形を基本としております。

ただ、普段慣れ親しんでいる TypeScript から JavaScript へのコンパイルや、Sass から CSS へのコンパイルを行える環境がないと開発パフォーマンスが落ちてしまいそうだなと思ったため、これらの簡易的な設定を行ったテンプレートを作成するに至りました。

また、私自身 Python を利用したアプリケーションの開発経験が無く、こちらの学習に時間を要する可能性があるため、スタイリングにかかる工数を極力抑えることを目的として CSS フレームワークである Bulma の設定も行うことにしました。

実際の成果物はこれらの悩みを一通り解決できるものになったかなと思います！

[今回作成したテンプレートの特徴](https://github.com/naoki-00-ito/vite-ts-bulma-sass-template?tab=readme-ov-file#%E7%89%B9%E5%BE%B4)

## 作成の流れ

ご自身で作成したいという方はこちらをご参考ください！

### 前提

下記環境で作成しました。

- Node.js: 22.4.1
- pnpm: 9.2.0

### Vite の 生 TypeSCript テンプレートを生成

```bash
pnpm create vite vite-ts-bulma-sass-template --template vanilla-ts
```

### @types/estree を install する

私の環境だと、生成されたテンプレートで `pnpm build` を行ったところ、 `estree` の型定義エラーが発生しました。

```bash
error TS2688: Cannot find type definition file for 'estree'.
  The file is in the program because:
    Entry point for implicit type library 'estree'


Found 1 error.
```

なので、 `@types/estree` を install しました。

```bash
pnpm add -D @types/estree
```

その後、 `pnpm build` を行ったところ解消しました。

```bash
vite v5.4.1 building for production...
✓ 7 modules transformed.
dist/index.html                 0.46 kB │ gzip: 0.29 kB
dist/assets/index-Cz4zGhbH.css  1.21 kB │ gzip: 0.62 kB
dist/assets/index-Bd-pKGJy.js   3.05 kB │ gzip: 1.64 kB
✓ built in 99ms
```

### Sass コンパイル設定を行う

Sass と Autoprefixer を install します。

```bash
pnpm add -D sass autoprefixer
```

その後、 `vite.config.ts` を作成し、下記のように記述します。  
(build 関連はお好みで変更してください。)

```ts
import autoprefixer from 'autoprefixer';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    build: {
      outDir: 'static',
      assetsDir: 'assets',
      rollupOptions: {
        input: 'src/index.ts',
        output: {
          entryFileNames: '[name].js',
          chunkFileNames: '[name].js',
          assetFileNames: '[name].[ext]',
        },
      },
    },
    css: {
      postcss: {
        plugins: [autoprefixer],
      },
    },
  };
});
```

Sass ファイルを作成し、 `input` に指定しているファイルに import を追加します。

```ts
import './styles/index.scss';
```

`pnpm build` を実行して、 `dist/assets` に CSSファイル が出力されればOKです！

### Bulma を導入する

install します。

```bash
pnpm add bulma
```

その後、 Sassファイル に Bulma用スタイル の読み込み & 設定を追加します。  
私の場合は[公式ドキュメントの内容](https://bulma.io/documentation/customize/with-sass/#create-your-sass-file)をベースとして、フォント指定のみ変更したものを記載しました。

```scss
$purple: #8a4d76;
$pink: #fa7c91;
$brown: #757763;
$beige-light: #d0d1cd;
$beige-lighter: #eff0eb;

@use "bulma/sass" with (
  $family-primary: '"Noto Sans JP", sans-serif',
  $grey-dark: $brown,
  $grey-light: $beige-light,
  $primary: $purple,
  $link: $pink,
  $control-border-width: 2px,
  $input-shadow: none
);
@import "https://fonts.googleapis.com/css?family=Noto+Sans+JP:400,500,700";
```

htmlにも[公式ドキュメント](https://bulma.io/documentation/customize/with-sass/#add-an-html-page)のような Bulma用 の要素を追加します。  
私は下記のような内容を追加しました。

```html
<section class="section">
  <div class="container">
    <h1 class="title">Bulma</h1>
    <p class="subtitle">
      Modern CSS framework based on
      <a
        href="https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Flexible_Box_Layout/Basic_Concepts_of_Flexbox"
        >Flexbox</a
      >
    </p>
    <div class="field">
      <div class="control">
        <input class="input" type="text" placeholder="Input" />
      </div>
    </div>
    <div class="field">
      <p class="control">
        <span class="select">
          <select>
            <option>Select dropdown</option>
            <option>option 1</option>
            <option>option 2</option>
          </select>
        </span>
      </p>
    </div>
    <div class="buttons">
      <a class="button is-primary">Primary</a>
      <a class="button is-link">Link</a>
    </div>
  </div>
</section>
```

`pnpm dev` で起動し、スタイルが適応されていればOKです！

![スタイルが適応されたhtmlの表示](/images/blog/vite-ts-bulma-sass-template/01.png)

### watch コマンドを追加する

別のテンプレートエンジンと組み合わせて使う場合、 watch コマンド があると便利なので、 `package.json` の scripts に追加します。

```diff
  "scripts": {
    :
+   "build:watch": "vite build --watch",
    :
  },
```

`pnpm build:watch` を実行し、ファイル保存でビルドが走ればOKです！

### Biome を導入する

TypeScript 用の何らかの Formatter / Linter が欲しいので設定します。  
今回は [Biome](https://biomejs.dev/) を採用しました。

#### Biome を install する

```bash
pnpm add --save-dev --save-exact @biomejs/biome
```

#### init する

```bash
pnpm biome init
```

`biome.json` が生成されるので、お好みの設定を記述してください。

#### Biome用 npm scripts を追加

format, Lint, Lint + format 用の計3種類のコマンドを追加します。

```diff
  "scripts": {
    :
+   "format": "biome format --write src/ *.ts *.json",
+   "lint": "biome lint --write src/ *.ts *.json",
+   "check": "biome check --write src/ *.ts *.json",
    :
  },
```

下記コマンドがそれぞれ動作すればOKです！

##### format

```bash
pnpm format
```

##### Lint

```bash
pnpm lint
```

##### Lint + format

```bash
pnpm check
```

### Stylelint を導入する

最後に、 Sass のLinter として [Stylelint](https://stylelint.io/) を導入します。

#### Stylelint と ルールセット を install する

```bash
pnpm add -D stylelint stylelint-config-standard-scss
```

#### ルールセットを適応する

`.stylelintrc.json` を作成し、ルールセット適応の記述をします。

```json
{
  "extends": "stylelint-config-standard-scss"
}
```

#### Stylelint用 npm scripts を追加

```diff
  "scripts": {
    :
+   "stylelint": "stylelint --fix 'src/**/*.scss'",
    :
  },
```

対象パスの指定 `src/**/*.scss` は環境に合わせて置き換えてください。

下記コマンドで実行されればOKです！

```bash
pnpm stylelint
```

## まとめ

最近はライブラリやフレームワークの標準設定に任せきりのことが多かったのですが、自分が欲しいものを調査して導入していく楽しさを改めて感じました。  
これから実際にこのテンプレートを使う中での気づきをもとにブラッシュアップもしていければなと思っております。

最後までお読みいただきありがとうございました！
