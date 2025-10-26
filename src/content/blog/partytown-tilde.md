---
title: ディレクトリ名にチルダ(~) が使えないサーバーで Partytown を使う
description: ディレクトリ名にチルダ(~) が使えないサーバーで Partytown を使う方法をご紹介します。
author: Naoki
tags: [Tech]
pubDate: '2025-02-08'
---

## Partytown とは

外部ツールの埋め込み用スクリプトなどの読み込みを [メインスレッド](https://developer.mozilla.org/ja/docs/Glossary/Main_thread) から [ウェブワーカー](https://developer.mozilla.org/ja/docs/Web/API/Web_Workers_API) に移動させることで、メインスレッドの負荷を軽減することができるライブラリです。  
導入することで、パフォーマンスの向上が期待できます。

[公式ドキュメント](https://partytown.builder.io/)

## 事象

Partytown を使う場合、ビルド時に `~partytown` というディレクトリ名称で関連スクリプトが書き出しされる。  
ただ、サーバーの仕様・設定によっては名称にチルダを含めることができないため、エラーが発生する。

## 対策

私の場合、下記で対策しました。

①[ビルド後に生成された `~partytown` ディレクトリのチルダを削除する](#ビルド後に生成された-partytown-ディレクトリのチルダを削除する)

②[`partytown` ディレクトリを参照するよう設定を変更する](#partytown-ディレクトリを参照するよう設定を変更する)

以下リポジトリでは実際にこの対策を行っています。

https://github.com/INxST/st-portfolio

### ビルド後に生成された `~partytown` ディレクトリのチルダを削除する

ディレクトリ名からチルダを削除するシェルスクリプト `scripts/rename-dist-dirs.sh` を作成します。

```bash
#!/bin/bash

DIST_DIR="./dist"

# Check if dist directory exists
if [ -d "$DIST_DIR" ]; then
  # Iterate over directories in dist
  for dir in "$DIST_DIR"/~*; do
    if [ -d "$dir" ]; then
      # Remove the tilde from the directory name
      new_dir=$(echo "$dir" | sed 's/~//')
      mv "$dir" "$new_dir"
      echo "Renamed $dir to $new_dir"
    fi
  done
else
  echo "Dist directory does not exist."
fi
```

そして、ビルド後にこのシェルスクリプトを実行するように、`package.json` の `scripts` に追加します。  
(下記は Astro の場合の例。 `&& sh scripts/rename-dist-dirs.sh` を追加します。)

```diff
{
  "scripts": {
-   "build": "astro check && astro build",
+   "build": "astro check && astro build && sh scripts/rename-dist-dirs.sh",
  }
}
```

### `partytown` ディレクトリを参照するよう設定を変更する

`lib` プロパティに参照パスを明記します。  
チルダを削除したディレクトリ名を指定します。  
(下記は Astro の場合の例。)

```diff
export default defineConfig({
  site: site,
  base: base,
  prefetch: {
    prefetchAll: true,
  },
  integrations: [
    tailwind(),
    sitemap(),
    react(),
    partytown({
      config: {
        forward: ['dataLayer.push'],
+       lib: '/partytown/',
      },
    }),
  ],
  vite: {
    optimizeDeps: {
      exclude: ['fsevents'],
    },
  },
});
```
