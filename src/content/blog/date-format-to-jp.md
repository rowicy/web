---
title: JavaScriptで日付をフォーマットする
description: 'JavaScriptでの日付けフォーマット方法をご紹介します。'
author: Naoki
tags: [Tech]
pubDate: '2024-01-18'
---

## コード

```js
// yyyy-mm-dd HH:MM:SS → yyyy/mm/dd → yyyy.mm.dd
const date = '2024-01-01 11:22:33';
const formatDate = new Date(date)
  .toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  .replace(/\//g, '.');
```

区切り文字を変えたい場合は `replace` の第二引数 `.` を任意の文字に差し替える。