---
title: NuxtにThree.jsを導入する
description: 'Nuxt.jsにThree.jsを導入する方法をご紹介します。'
author: Naoki
tags: [Tech]
pubDate: '2023-04-16'
---

## 環境情報

- node 16.14.0
- nuxt 2.16.1

## インストールコマンド

```bash
npm install three --save
```

## エラーが出た場合の対処方法

自分の環境では下記のvue-server-rendererとThree.jsのバージョンが互換性がないというエラーが出ました。

```
require() of ES Module /hoge/node_modules/three/build/three.js from /hoge/node_modules/vue-server-renderer/build.dev.js not supported. three.js is treated as an ES module file as it is a .js file whose nearest parent package.json contains "type": "module" which declares all .js files in that package scope as ES modules. Instead rename three.js to end in .cjs, change the requiring code to use dynamic import() which is available in all CommonJS modules, or change "type": "module" to "type": "commonjs" in /hoge/node_modules/three/package.json to treat all .js files as CommonJS (using .mjs for all ES modules instead).
```

このエラーは`node_modules/three/package.json`のtypeプロパティを`module`から`commonjs`に変更することで解消しました。

```diff
{
  "name": "three",
  "version": "0.151.3",
  "description": "JavaScript 3D library",
- "type": "module",
+ "type": "commonjs",
// 省略
}
```
