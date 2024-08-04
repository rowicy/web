---
title: Node.jsバージョン管理 n コマンドについて
pubDate: '2024-07-30'
description: Node.jsを簡単に管理できるツールnコマンドを紹介します。
author: RiiiM
tags: [Tech, Node.js]
---

## Node.js管理してますか？

Node.jsインストールして...

```bash
apt install nodejs
```

npxインストールして...

```bash
npm install -g npx
```

Next.jsのプロジェクトたてて...よし

```bash
npx create-next-app@latest
```

STOP✋✋✋✋

Node.jsのバージョン管理も入れておきましょう。

JavaScriptランタイムを整えるならバージョン管理ツールはないと後々後悔。

今回はNode.jsバージョン管理ツールの"n"について紹介します。

[![Repository](https://camo.githubusercontent.com/edf19d2f89b6b3c61ae6156f9b55fc146970d78de6f854ea3d87306173e1f276/68747470733a2f2f6e696d69742e696f2f696d616765732f6e2f6e2e676966)](https://github.com/tj/n)

## インストール

sudo が必要です

```bash
$ sudo npm install -g n
```

sudoなしでやるには/usr/localの所有を自分にします。

```bash
$ sudo mkdir -p /usr/local/n
$ sudo chown -R $(whoami) /usr/local/n
$ sudo mkdir -p /usr/local/bin /usr/local/lib /usr/local/include /usr/local/share
$ sudo chown -R $(whoami) /usr/local/bin /usr/local/lib /usr/local/include /usr/local/share
$ npm install -g n
```

### 確認

現バージョン確認

```
$ n
    node/20.14.0
  ο node/22.5.1
```

`↑` `↓` `space`でバージョン切り替え可能

### Node.jsインストール

最新版のNode.js インストール

```bash
$ n latest
```

安定版インストール

```bash
$ n lts
```

インストールしたバージョン一覧

```bash
$ n ls
```

バージョン指定してインストール

```bash
$ n v8.11.3
```

バージョンの詳細指定はこのように省略も可能です。

```bash
$ n 8 
# v8.x.x の中での最新版
```

バージョン指定して実行

```bash
$ n run v8.11.3 
```

バージョン指定して削除

```bash
$ n rm 0.9.4 v0.10.0
```

CPUアーキテクチャを変更してインストール

```bash
$ n --arch x64 v0.10.0
```

元々インストールしたNode.jsを削除
```
$ n uninstall
```

## Node.jsのバージョン管理は必要なの？

どんなソフトウェアにも言えることですが、デプロイとその運用管理を行う場合、それを同じツールで管理できている状態は理想です。

セキュリティ的にも常に最新の状態に更新できる準備が整っていることは運用上のボトルネックが一つクリアされていることになります。

バージョンをコマンド一つで管理できるメリットは覚えるコマンドが一つ増えることより大きいです。

## まとめ

ということでバージョン管理ツール n を紹介しました。

今回紹介した他にも **[nvm](https://github.com/nvm-sh/nvm)**, **[fnm](https://github.com/Schniz/fnm)**, **[nodebrew](https://github.com/hokaccha/nodebrew)** などがあります。

これらを用いてcoolに Node.js を切り替えて行きましょう。
