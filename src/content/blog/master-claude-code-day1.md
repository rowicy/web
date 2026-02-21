---
title: 【僕がClaude Codeを従えるまで】1日目 CLAUDE.md
pubDate: '2026-02-21'
description: "Claude Codeを使わなければ、やばい 時代に置いていかれるのだ Claude.aiのチャットからコピペするのはもうごめんだ 半年ぐらい遅れをとったが導入してやる 血眼でClade Consoleにクレジット番号を入力する こいつと親友になってやる ## CLAUDE.md ファーストステップはこれでいいだろう CLAUDE.mdはプロジェクトルートに配置して中身にClaude Codeに伝えたいプロジェクト説明を書いておく - プロジェクトの概要（どんなコードベースか） - よく使うコマンド（ビル"
author: RiiiM
tags: [Tech, AI]
mentions:
---

<img src="/images/blog/master-claude-code-day1/b8f45351-9281-4362-9435-354fa1351812.png" alt="" style="height: 50vh; width: auto; max-width: 100%; object-fit: contain;">

**Claude Codeを使わなければ、やばい**

時代に置いていかれるのだ

Claude.aiのチャットからコピペするのはもうごめんだ

半年ぐらい遅れをとったが導入してやる
血眼でClade Consoleにクレジット番号を入力する

こいつを使いこなしてやる

## CLAUDE.md

ファーストステップはこれでいいだろう

CLAUDE.mdはプロジェクトルートに配置して中身にClaude Codeに伝えたいプロジェクト説明を書いておく

- プロジェクトの概要（どんなコードベースか）
- よく使うコマンド（ビルド・テスト・デプロイの手順）
- コーディング規約（命名規則・スタイルガイドなど）
- 注意事項（触ってはいけないファイルや特殊な制約）

毎回説明しなくても**これを読んでプロジェクトのコンテキストを自動的に把握してくれる**

## おためしの拡張機能開発

Claude Codeの動きを見るためにまずは
ずっと個人的に作りたいと思っていたブラウザ拡張機能を作ることにした

リーディングリストをgithub issueで管理するchrome拡張機能が欲しかった

機能は2つ
- ページurlをブックマーク保存できる
- 保存して放置していたらケツ叩いてくれる

## CLAUDE.md生成

CLAUDE.mdも自分で一から入力なんてしない

claude.ai/chat にお願いする
Claude CodeのベストプラクティスはやはりClaudeのモデルに聞くのがいいのではないだろうか

Claude Codeベストプラクティスも \Anthropic社が出しているのであとで読む

https://code.claude.com/docs/ja/best-practices

```md
このツールのCLAUDE.mdを出力

　リーディングリストをgithub issueで管理するchrome拡張機能
```

出力してくれた

```md
# CLAUDE.md

## プロジェクト概要

GitHubのIssueをリーディングリストとして活用するChrome拡張機能。現在のタブのURLとタイトルをGitHub Issueとして登録。

## 技術スタック

- **フロントエンド**: Vanilla JS + HTML + CSS（フレームワークなし）
- **Chrome API**: `chrome.tabs`, `chrome.storage`, `chrome.action`, `chrome.notifications`, `chrome.alarms`
- **外部API**: GitHub REST API v3、Discord Webhook
- **認証**: GitHub Personal Access Token（PAT）

## ディレクトリ構成

// ...省略

## 主要機能

### 1. Issue登録

現在のタブのURL・タイトルをGitHub Issueとして登録する。

// ...省略


## GitHub API 仕様

// ...省略

## セキュリティ考慮事項

- GitHubトークンは `chrome.storage.sync` に保存（平文）
- 最小権限のPATを使用推奨（`repo` または `public_repo` スコープのみ）

## コーディング規約

- ES Modules は使用しない（Manifest V3のservice workerとの互換性のため）
- `async/await` を使用してAPI呼び出しを処理
- エラーはコンソールとUIの両方に出力
- コメントは日本語で記述可
```

ざっとみて想像との乖離がないか確かめ,
自分の想像してた機能で記載されていないものを指摘する

```
登録だけでなく、読んだらissue closeする機能も。 
また、優先度付けを行えるように。デフォルトはmid そして3日すぎてcloseされていないものはエスカレーションして。
discord webhookに送信することと拡張機能側からもブラウザに向けて通知。それも設定できるように。
```

改善されたCLAUDE.mdを見て問題はなさそうだ
想定にマッチしている

今回出力させたmdのセクションは以下だった

- プロジェクト概要
- 技術スタック
- ディレクトリ構成
- 主要機能
- GitHub API 仕様
- chrome.storage スキーマ
- エスカレーションロジック
- Discord Webhook ペイロード仕様
- ブラウザ通知仕様
- manifest.json 必須設定
- 設定ページ（options）の項目
- エラーハンドリング方針
- セキュリティ考慮事項
- コーディング規約

プロジェクトルートに内容を貼り付ける

## 実装

### Claude Codeをインストール

homebrewでもnpmでもなくネイティブインストールにした
これだとバックグラウンドで自動的に更新されるらしい

```zsh
curl -fsSL https://claude.ai/install.sh | zsh
```


### 指示出し

一言指示する

```
CLAUDE.mdにしたがって実装して
```

Claude Codeが実装を始めた

コンテキストを読み込み、トークン数が増え、みるみるファイルが生成されていく

**CLAUDE.mdが仕様書となっているため、指示は「これに従って」とだけでいい**

### 完成

一発目で動きそうなものができた

拡張機能は作った経験があるのでできたファイルやマニフェストを見た
ファイルの不足はなさそうだ

iconだけnano bananaで生成した

<img src="/images/blog/master-claude-code-day1/dbb1cb2d-3f58-4bb8-bc3d-2c12e4877619.jpeg" alt="" style="height: 10vh; width: auto; max-width: 100%; object-fit: contain;">

このアイコンはちょっとダサいが動作検証したいのでこれでよし

これの複数サイズが必要なのでリサイズしたものを一括で出してくれるサイトを[perplexity](https://www.perplexity.ai/)から検索
おすすめされたここを使った

https://www.appicongenerator.org/?utm_source=perplexity


早速プロジェクトをブラウザに読み込んでみる

<img src="/images/blog/master-claude-code-day1/bc69e683-5314-408b-846a-c0d8269444be.png" alt="" style="height: 50vh; width: auto; max-width: 100%; object-fit: contain;">

おお

<img src="/images/blog/master-claude-code-day1/16bf4408-6195-4b97-9d3d-d3214bd875a8.png" alt="" style="height: 50vh; width: auto; max-width: 100%; object-fit: contain;">

設定画面も意図した通り
この拡張機能が使うGithubリポジトリとAccess Token, Discord Webhookだけ作成して設定した

アイコンから拡張機能を起動すると

<img src="/images/blog/master-claude-code-day1/d385c08c-76e9-45d9-b685-ac03cf4134fd.png" alt="" style="height: 50vh; width: auto; max-width: 100%; object-fit: contain;">

ちゃんと動く

"登録する" ボタンから保存されたサイトもIssueになっている
"読んだ" を押せばCloseされる

<img src="/images/blog/master-claude-code-day1/7ea76028-eaf5-478d-90e2-39f6697749d0.png" alt="" style="height: 50vh; width: auto; max-width: 100%; object-fit: contain;">

この実装に使ったトークンは最終的に4.2kほど、料金は$0.07(10円ほど)だ

求めていた機能の最低限をこのコストで実装できる時代になってしまった
このコストでツール1つ作れるのなら、MAXプランを使い切流には一体どれほどの機能を実装できるのか...

やはり**このClaude Codeはものにしなければいけない**(自分崇めはしない、コイツを使う側だから)

今回は指示一言だけで終わったが、既存コードの改修作業などは指示出しの順序やその粒度をよく考える必要がありそうだ

とりあえず求めていたツールを作れたので満足
このツールを拡張するとしたら
iPhoneからもブックマーク操作をしたいので、Cloudflare WorkersにwebhookをたててiPhoneショートカットで叩くようにしたい

あと、この記事シリーズ"僕がClaude Codeを従えるまで"は続くだろうか
愚痴を吐かず0秒で行動に移すClaude Codeの対極にいる怠慢な私のモチベにかかっている




