---
title: 【僕がClaude Codeを従えるまで】1日目 CLAUDE.md
pubDate: '2026-02-21'
description: "使いこなすまでの実践ログ、その1日目。ブラウザ拡張機能の開発を通してのCLAUDE.mdのベストプラクティス。"
author: RiiiM
tags: [Tech, AI]
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

Claudeチャット にお願いする
Claude CodeのベストプラクティスはやはりClaudeのモデルに聞くのがいいのではないだろうかと思った

Claudeチャットは設計補助、Claude Codeは実装エージェントという捉え方をしているので使い分けた

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

さらにGithubアクセストークンを平文で保存しようとしていたので指摘

```
セキュリティ考慮事項にてGithubトークンを平文保存しているけど
web crypto api 使うようにして
```

ここで出力されたCLAUDE.mdはドラフトの仕様書のようなもので、自分はこれをみて問題がないかチェックする役割だ

問題はなさそうな内容になったところで

今回出力させたmdのセクションは以下だった

- プロジェクト概要
- 技術スタック
- ディレクトリ構成
- 主要機能
- GitHub API 仕様
- chrome.storage スキーマ
- エスカレーションロジック（escalation.js）
- Discord Webhook ペイロード仕様
- ブラウザ通知仕様
- manifest.json 必須設定
- 設定ページ（options）の項目
- エラーハンドリング方針
- セキュリティ考慮事項
- コーディング規約

結構多い
とりあえずこの時点でプロジェクトに出力されたものをファイルとして用意しておいた

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

今回はCLAUDE.mdが仕様書代わりとなっているため、指示は「これに従って」とだけにした

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

やはり**このClaude Codeはものにしなければいけない**

今回は指示一言だけで終わったが、既存コードの改修作業などは指示出しの順序やその粒度をよく考える必要がありそうだ

## CLAUDE.mdはどう書けば良いのか

CLAUDE.mdのどこまで書くべきなのか気になる

今回使ったものはセクションが多く感じられた

ここで\Anthropic社が出しているClaude Codeベストプラクティスを見た

https://code.claude.com/docs/ja/best-practices

ベストプラクティスからは以下が言えるようだ

- **短く、人間が読んで理解できるレベルにとどめる**
- **「これが無いとClaudeがミスる」行だけを残す**（その他は削る）

**含めるべきもの**は以下だ

- ビルド・テスト・デプロイなどのコマンド
- コードスタイルルール
- テスト指示

逆に**除外したほうがいい**内容もある

- Claude がコードを読めば理解できること
- 一般的なスタイルガイド
- 詳細なAPIドキュメント
- 頻繁に変わる情報

大雑把に言えばCLAUDE.mdは**プロジェクトのコードだけではわからないこと、これだけはどのセッションでも守ってほしいこと**のみを書くように意識したほうがいい

文中では以下のようにあった

> 膨らんだ CLAUDE.md ファイルは Claude に実際の指示を無視させます。

Claude Codeの全セッションで読まれるものであるため、内容がコンテキストを逼迫しない工夫が必要そうだ

先ほどのClaudeチャットとCLAUDE.mdをやりとりする中で指摘を受けて内容が増えていったが、実はここで内容を削るか他の参照ファイルとして切り出す必要があった

### 共通して伝えたいこと以外は退避せよ

実装がうまくいったので気にしていなかったが、それが終わったあとでClaude Codeに相談をしてみる

```
CLAUDE.mdの内容長い気がするんだ。どうするのがベストだと思う？
```

```md
現状291行あり、大きく 2 つの問題があります。
// ...省略
推奨する削り方

  残すべきもの（Claude がファイルを読んでも分からない情報）
  - プロジェクト概要・技術スタック・ディレクトリ構成
  - 主要機能の概要（仕様のコード例は不要）
  - エラーハンドリング方針
  - セキュリティ方針の理由と制約（コード例は不要、実装は crypto.js にある）
  - コーディング規約

  削るべきもの（実装から読み取れる）
  - GitHub API / Discord / ブラウザ通知のコード例・仕様
  - manifest.json のコード例
  - crypto.js のコード例
  - 古いストレージスキーマ（旧版・更新版の両方）
```

実装してコードからプロジェクトを把握できるようになったことで不要なものがあるらしい

```
おけ、退避して
```

結果 `docs/spec.md` が作成され、設計仕様書関連の内容が移動した

最終的にCLAUDE.mdに残った内容は以下であり、ファイル行数は291から71に削減した

- プロジェクト概要
- 技術スタック・制約
- ディレクトリ構成
- 主要機能
- エラーハンドリング方針
- セキュリティ方針
- コーディング規約

これで他セッションを立てた時にトークン消費を抑えることができる
今回はプロジェクトを1から立ち上げたため、色々な注文が混じったCLAUDE.mdを用いたが、

実装が始まってからは**プロジェクト規約部分のみ残し、その他を切り出す**ように指示だしするのが良さそうだ



とりあえず求めていたツールを作れたので満足
このツールを拡張するとしたら
iPhoneからもブックマーク操作をしたいので、Cloudflare WorkersにwebhookをたててiPhoneショートカットで叩くようにしたい

あと、この記事シリーズ"僕がClaude Codeを従えるまで"は続くだろうか
AI駆動開発の実践ログとして続けていきたい

"愚痴を吐かず0秒で行動に移すClaude Code"の対極にいる怠慢な私のモチベにかかっている




