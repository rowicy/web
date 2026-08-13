---
title: リンクカードOGPフォールバック検証用デモ
pubDate: '2026-08-13'
description: OGP画像が無いリンクをカードリンク化した際に、ダミー画像へフォールバックすることを確認するための検証用記事
author: RiiiM
tags: [Tech]
---

## OGP画像が無いリンクのフォールバック検証用

以下は `og:image` を持たないURLです。前後を空行にして単独行で記載するとリンクカード化されます。

https://example.com

上記のリンクカードのサムネイル欄に、`public/images/link-card-fallback.svg` のダミー画像が表示されていれば、`astro.config.mjs` の `ogTransformer` によるフォールバックが正しく機能しています。
