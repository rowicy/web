---
title: Reactのインストール方法
description: 'Reactのインストール方法をご紹介します。'
author: Naoki
tags: [Tech]
pubDate: '2023-04-22'
---

## 環境情報

- MacBook Air M1, 2020
- node 16.14.0
- react 18.2.0

## 手順

### create-react-app をインストールする

```bash
npm i -g create-react-app 
```

### プロジェクトの雛形を作成する

cdコマンドで任意のディレクトリに移動し、下記コマンドでプロジェクトの雛形を作成する。  

**hogehoge は任意のプロジェクト名に書き換える**

```bash
create-react-app hogehoge
```

TypeScriptを使う場合は `--template typescript` をつける。
```bash
create-react-app hogehoge --template typescript
```

### サーバーを立ち上げる

cdコマンドでプロジェクトディレクトリに移動する。

```bash
cd hogehoge
```

下記コマンドを実行してサーバーを立ち上げる。

```bash
npm start
```

http://localhost:3000 にアクセスして下記画面が表示されれば成功。

![](/images/blog/react-setup/01.png)