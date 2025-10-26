---
title: Cloudflare Pages で動かしている Nuxt.js で HierarchyRequestError が発生する
description: Cloudflare Pages で動かしている Nuxt.js で HierarchyRequestError が発生する場合の対処方法をご紹介します。
author: Naoki
tags: [Tech]
pubDate: '2025-03-16'
---

## 事象

Cloudflare Pages で動かしている Nuxt.js で、特定のページに直リンクでアクセスすると以下のエラーが発生する。

```bash
HierarchyRequestError: Failed to execute 'appendChild' on 'Node': This node type does not support this method.
```

尚、ページ遷移でのアクセスではこのエラーは発生しない。

## 原因

HTML の minify が原因で発生していた可能性が高い。  
リンク遷移でのアクセスと直接リンクでアクセスした際にソースの差分が生じ、エラーが発生していた...？

## 解決方法

`nuxt.config.js` に HTML の minify 設定を追加する。

- タグ間の空白を削除
- コメントを削除

```js
export default {
  // ...
  build: {
    html: {
      minify: {
        collapseWhitespace: true,
        removeComments: true,
      },
    },
  },
  // ...
}
```
