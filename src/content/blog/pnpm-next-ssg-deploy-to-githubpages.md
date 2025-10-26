---
title: pnpm + Next.js SSG で作成したページを GitHub Pages にデプロイする
description: 'pnpm + Next.js SSG で作成したページを GitHub Pages にデプロイする方法をご紹介します。'
author: Naoki
tags: [Tech]
pubDate: '2024-03-20'
---

## ソース

実際に各種設定を行い、動作確認済みのソースです。  
参考にどうぞ。

https://github.com/naoki-00-ito/lecture-demo-app

## 手順

### Next.jsのソースを準備する

下記を参考にソースを用意します。

https://naoki.site/articles/next-setup/

### Next.jsのビルド形式をSSGに変更する

next.config.jsを下記のように変更し、SSGにします。

```typescript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
};

module.exports = nextConfig;
```

### GitHub Actionsの設定を行う

Next.jsのSSGの設定が完了したら、下記記事の手順で、GitHub Actionsの設定を行います。

https://dev.classmethod.jp/articles/github-pages-by-actions/

一通り完了すると、GitHub Pagesデプロイ用のYAMLが生成され、ワークフローが実行されます。  
ただ、このYAMLにはpnpm用の記述が入っていないため、下記のようなエラーが出てビルドが失敗すると思います。

```
Error: Unable to locate executable file: pnpm. Please verify either the file path exists or the file can be found within a directory specified by the PATH environment variable. Also check the file mode to verify the file is executable.
```

### pnpm用の記述を追加する

pnpm用の記述を追加します。

#### 全文

```yaml
# Sample workflow for building and deploying a Next.js site to GitHub Pages
#
# To get started with Next.js see: https://nextjs.org/docs/getting-started
#
name: Deploy Next.js site to Pages

on:
  # Runs on pushes targeting the default branch
  push:
    branches: ['master']

  # Allows you to run this workflow manually from the Actions tab
  workflow_dispatch:

# Sets permissions of the GITHUB_TOKEN to allow deployment to GitHub Pages
permissions:
  contents: read
  pages: write
  id-token: write

# Allow only one concurrent deployment, skipping runs queued between the run in-progress and latest queued.
# However, do NOT cancel in-progress runs as we want to allow these production deployments to complete.
concurrency:
  group: 'pages'
  cancel-in-progress: false

jobs:
  # Build job
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Detect package manager
        id: detect-package-manager
        run: |
          if [ -f "${{ github.workspace }}/yarn.lock" ]; then
            echo "manager=yarn" >> $GITHUB_OUTPUT
            echo "command=install" >> $GITHUB_OUTPUT
            echo "runner=yarn" >> $GITHUB_OUTPUT
            exit 0
          elif [ -f "${{ github.workspace }}/pnpm-lock.yaml" ]; then
            echo "manager=pnpm" >> $GITHUB_OUTPUT
            echo "command=install --frozen-lockfile" >> $GITHUB_OUTPUT
            echo "runner=pnpm" >> $GITHUB_OUTPUT
            npm install -g pnpm
            exit 0
          elif [ -f "${{ github.workspace }}/package.json" ]; then
            echo "manager=npm" >> $GITHUB_OUTPUT
            echo "command=ci" >> $GITHUB_OUTPUT
            echo "runner=npx --no-install" >> $GITHUB_OUTPUT
            exit 0
          else
            echo "Unable to determine package manager"
            exit 1
          fi
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version-file: '.node-version'
          cache: ${{ steps.detect-package-manager.outputs.manager }}
      - name: Setup Pages
        uses: actions/configure-pages@v4
        with:
          # Automatically inject basePath in your Next.js configuration file and disable
          # server side image optimization (https://nextjs.org/docs/api-reference/next/image#unoptimized).
          #
          # You may remove this line if you want to manage the configuration yourself.
          static_site_generator: next
      - name: Restore cache
        uses: actions/cache@v4
        with:
          path: |
            .next/cache
          # Generate a new cache whenever packages or source files change.
          key: ${{ runner.os }}-nextjs-${{ hashFiles('**/package-lock.json', '**/yarn.lock', '**/pnpm-lock.yaml') }}-${{ hashFiles('**.[jt]s', '**.[jt]sx') }}
          # If source files changed but packages didn't, rebuild from a prior cache.
          restore-keys: |
            ${{ runner.os }}-nextjs-${{ hashFiles('**/package-lock.json', '**/yarn.lock', '**/pnpm-lock.yaml') }}-
      - name: Install dependencies
        run: ${{ steps.detect-package-manager.outputs.runner }} ${{ steps.detect-package-manager.outputs.command }}
      - name: Build with Next.js
        run: ${{ steps.detect-package-manager.outputs.runner }} next build
      - name: List files after build
        run: ls -al
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./out

  # Deployment job
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

#### 修正箇所抜粋

##### `Detect package manager` に pnpmコマンド設定と、pnpmインストールコマンドを追加する

```yaml
elif [ -f "${{ github.workspace }}/pnpm-lock.yaml" ]; then
  echo "manager=pnpm" >> $GITHUB_OUTPUT
  echo "command=install --frozen-lockfile" >> $GITHUB_OUTPUT
  echo "runner=pnpm" >> $GITHUB_OUTPUT
  npm install -g pnpm
  exit 0
```

##### `Restore cache` に pnpm用記述を追加する

`key` と `restore-keys` に pnpm-lock.yaml 参照用記述を追加

```yaml
key: ${{ runner.os }}-nextjs-${{ hashFiles('**/package-lock.json', '**/yarn.lock', '**/pnpm-lock.yaml') }}-${{ hashFiles('**.[jt]s', '**.[jt]sx') }}
```

```yaml
restore-keys: |
  ${{ runner.os }}-nextjs-${{ hashFiles('**/package-lock.json', '**/yarn.lock', '**/pnpm-lock.yaml') }}-
```

再度ワークフローを実行し、ビルドが成功すればOKです。

## 備考

### 画像について

SSGでは `next/image` がエラーとなるので、

- 独自で設定を調整する
- `next/image` を使わない

上記どちらかの対応を行う必要があります。  
今回は後者の「`next/image` を使わない」方法で対応しました。

### ファイルの格納パスについて

GitHub Pages は公開URLが `https://{ユーザー名}.github.io/{リポジトリ名}/` のような形式になるため、ビルド時のパスを変更する必要があります。

今回は環境に応じてパスを変更する関数を作成し、この関数を通してパス指定を行う形で対応しました。

### 環境に応じてパスを変更する関数を作成

下記記事を参考にさせていただきました。

https://zenn.dev/chot/articles/99ae6acca1429b

```typescript
const updateEnvPath = (filename: string) => {
  const isProd = process.env.NODE_ENV === 'production';
  const prefixPath = isProd ? '/repository-name' : '';

  return prefixPath + filename;
};

export default updateEnvPath;
```

### 関数を通してパスを指定する

```jsx
<img src={updateEnvPath('hoge.jpg')} alt='' />
```
