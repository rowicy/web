---
title: npmからpnpmへの移行方法
description: 'npmからpnpmへの移行方法をご紹介します。'
author: Naoki
tags: [Tech]
pubDate: '2023-10-15'
---

## 移行手順

### pnpm をインストールする

```bash
npm install -g pnpm
```

### pnpmコマンドが使えるか確認

```bash
pnpm -v
```

### node_modules削除

```bash
rm -rf node_modules/
```

### package-lock.json削除

```bash
rm -rf package-lock.json
```

### パッケージインストール

```bash
pnpm i
```

## メモ

### コマンド早見表

一旦個人的によく使うもののみ記載

|  | npm | pnpm |
| - | - | - |
| パッケージインストール | npm i | pnpm i |
| パッケージインストール（バージョン固定） | npm ci | pnpm install --frozen-lockfile |
| Nextプロジェクト作成 | npx create-next-app project-name | pnpx create-next-app project-name |
| Nuxtプロジェクト作成 | npx nuxi init project-name | pnpx nuxi init project-name |

### pnpmコマンドのみ許可(npm iなどを打つとエラーを出す)

package.jsonに`"preinstall": "npx only-allow pnpm"`を追記

```diff
{
  "scripts": {
    ~~ 省略 ~~
+   "preinstall": "npx only-allow pnpm"
  }
}
```