---
title: GitHubリポジトリにプロジェクトディレクトリ配下のファイルのみをpushする方法
description: 'GitHubリポジトリにプロジェクトディレクトリ配下のファイルのみをpushする方法をご紹介します。'
author: Naoki
tags: [Tech]
pubDate: '2023-05-28'
---

## はじめに

大抵のフレームワークではプロジェクトディレクトリの配下に色々ファイルが格納されている構成になっているかと思います。  
例えば Next.jsの場合 `create-next-app` コマンドで `hoge` という名称のプロジェクトを作成すると下記のようなディレクトリ構成になります。

```bash
hoge
├ .next
├ node_modules
├ public
├ src
├ next.config.js 
  ・
  ・
  ・
```

このプロジェクトの親ディレクトリである`hoge`の中身のみGitHubリポジトリにpushする方法について、稀に忘れてしまうので備忘用に記事にします。


## 手順

### プロジェクトを作成する

使用するライブラリやフレームワーク等のコマンドを実行してプロジェクトを作成します。  
(Next.js の `create-next-app`, Nuxt.js の `create-nuxt-app`, Ruby on Rails の `rails new` のようなコマンド)

### cdコマンドでプロジェクトディレクトリ配下に移動する

```bash
cd hoge
```

### ローカルリポジトリを作成する

```bash
git init
```

### ローカルリポジトリの全ファイルをステージングする

```bash
git add -A
```

### コミットする

```bash
git commit -m "first commit"
```

### ローカルリポジトリとリモートリポジトリを紐付ける(SSH接続)

```bash
git remote add origin git@github.com:{ユーザー名}/{リポジトリ名}.git
```

下記コマンドで紐づけができているかの確認ができます。

```bash
git remote -v 
```

SSH接続の設定方法は割愛します。 

▼参考  
https://qiita.com/shizuma/items/2b2f873a0034839e47ce

### リモートリポジトリにpushする

```bash
git push origin master
```

リモートリポジトリにpushできれば成功です！
