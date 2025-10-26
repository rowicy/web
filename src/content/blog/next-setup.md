---
title: Next.jsのインストール方法
description: 'Next.jsのインストール方法をご紹介します。'
author: Naoki
tags: [Tech]
pubDate: '2023-08-26'
---

## 環境情報

- MacBook Air M1, 2020
- node 16.14.0
- react 18.2.0
- create-next-app 13.4.4

## 手順

### create-next-app をインストールする

```bash
npm install -g create-next-app
```

下記コマンドを実行して、バージョンが表示されれば成功。

```bash
create-next-app --version
```

### プロジェクトの雛形を作成する

cdコマンドでプロジェクトを作成したいディレクトリに移動し、下記コマンドでプロジェクトの雛形を作成する。

```bash
npx create-next-app hoge
```

下記コマンドを実行してサーバーを立ち上げる。

```bash
npm run dev
```

http://localhost:3000 にアクセスして下記画面が表示されれば成功。

![](/images/blog/next-setup/01.png)
