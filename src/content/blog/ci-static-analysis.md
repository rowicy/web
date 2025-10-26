---
title: CIで静的解析を実行する
description: 'GitHub Actionsを利用したCIで、各種ツールでの静的解析の実行方法をご紹介します。本記事では筆者がよく使う「Prettier」「Biome」「Stylelint」の例を取り上げます。'
pubDate: '2024-12-15'
author: Naoki
tags: [Tech]
---

本記事では、GitHub Actionsを利用したCIで、各種ツールでの静的解析の実行方法をご紹介します。  
静的解析ツールは様々ありますが、今回はその中でも筆者がよく使う「[Prettier](https://prettier.io/)」「[Biome](https://biomejs.dev/ja/)」「[Stylelint](https://stylelint.io/)」の3つを取り上げます。

## 前提

パッケージマネージャーには [pnpm](https://pnpm.io/) を採用しています。  
また、プロジェクトルート直下に使用する Node.js のバージョンを記述した `.node-version` を設置し、CI で使う Node.js のバージョンとして参照するようにしています。

```bash
.
├── .github
│   └── workflows
├── .node-version
└── src
```

今回ご紹介するサンプルはこれらの前提に則ったものになっているので、必要に応じて読み替えてください。

## CI YML ベース構文

基本的には `/.github/workflows/` 配下に `test.yml` のようなファイルを作成し、以下のような記述をしています。  
また、 `{実行内容が分かる見出しを記述}` `{実行するコマンドを記述}` を任意のものに書き換えたり、複数実行したい場合は書き足したりしています。

```yml
name: "Test"

on:
  pull_request:
    branches:
      - develop
      - main

jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4.1.1
      - uses: pnpm/action-setup@v4
        with:
          version: 9.1.0
      - name: Use Node.js
        uses: actions/setup-node@v4
        with:
          node-version-file: ".node-version"
          cache: "pnpm"
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      - name: {実行内容が分かる見出しを記述}
        run: {実行するコマンドを記述}
```

## 各種ツールでの設定方法

### Prettier

公式ドキュメントの以下ページの、 `--check` オプションでフォーマット済みかの確認ができます。

https://prettier.io/docs/en/cli.html#--check

#### サンプルコード

##### `package.json` に npm script を追加

```diff
  "scripts": {
    "format": "prettier --write .",
+   "format:check": "prettier . --check"
  },
```

##### Job を追加する

```diff
name: "Test"

on:
  pull_request:
    branches:
      - develop
      - main

jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4.1.1
      - uses: pnpm/action-setup@v4
        with:
          version: 9.1.0
      - name: Use Node.js
        uses: actions/setup-node@v4
        with:
          node-version-file: ".node-version"
          cache: "pnpm"
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
+     - name: Check with Prettier
+       run: pnpm run format:check
```

以下リポジトリにも同様の設定をしているのでご参考ください。

https://github.com/rowicy/web

### Biome

こちらも公式ドキュメントに例が載っています。

https://biomejs.dev/ja/recipes/continuous-integration/

公式通りに記載いただければ間違いないですが、一応[CI用YMLベース構文](#ci-yml-ベース構文)に合わせた場合のサンプルも記載しておきます。

#### サンプルコード

##### `package.json` に npm script を追加

```diff
  "scripts": {
    "format": "biome format --write src/ *.ts *.json",
    "lint": "biome lint --write src/ *.ts *.json",
+   "biome:ci": "biome ci src/ *.ts *.json"
  },
```

##### Job を追加する

```diff
name: "Test"

on:
  pull_request:
    branches:
      - develop
      - main

jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4.1.1
      - uses: pnpm/action-setup@v4
        with:
          version: 9.1.0
      - name: Use Node.js
        uses: actions/setup-node@v4
        with:
          node-version-file: ".node-version"
          cache: "pnpm"
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
+     - name: Check with Biome
+       run: pnpm run biome:ci
```

以下リポジトリにも同様の設定をしているのでご参考ください。  
(事項の [Stylelint](#stylelint) の設定もしております。)

https://github.com/naoki-00-ito/vite-ts-bulma-sass-template

### Stylelint

[公式ドキュメント](https://stylelint.io/)

#### サンプルコード

##### `package.json` に npm script を追加

```diff
  "scripts": {
    "stylelint": "stylelint --fix 'src/**/*.scss'",
+   "stylelint:ci": "stylelint 'src/**/*.scss'"
  },
```

##### Job を追加する

```diff
name: "Test"

on:
  pull_request:
    branches:
      - develop
      - main

jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4.1.1
      - uses: pnpm/action-setup@v4
        with:
          version: 9.1.0
      - name: Use Node.js
        uses: actions/setup-node@v4
        with:
          node-version-file: ".node-version"
          cache: "pnpm"
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
+     - name: Check with Stylelint
+       run: pnpm run stylelint:ci
```
