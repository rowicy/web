---
title: 【Vul】CodeBuildの設定ミスによるフィルタバイパス
pubDate: '2026-01-16'
description: AWS CodeBuildにおける設定ミスにより、AWS提供のGitHubリポジトリがサプライチェーン攻撃のリスクにあった件
author: RiiiM
tags: [Tech, Vul]
---

今回はこちらの記事から

https://www.wiz.io/blog/wiz-research-codebreach-vulnerability-aws-codebuild

## 概要
code buildにはgithubのコミットを受けてビルドする際に, 「だれからのpushなのか」を判定し、
特定のgithubアカウントによるコミットのみビルドを起動するように設定でき、
webhook Actor IDにGithubユーザーIDをリストアップする

(Actor ID（アクターID）とは、Webhookイベントを発生させた主体（ユーザー、アプリケーション、システムなど）を識別するためのユニークなID)

そこの設定値は正規表現で絞れるのだが、
`^` と`$` が抜けていた

例: 543678453

これはID: 543678453のユーザーからのコミットのみをビルドトリガにしているが、これが正規表現ならば、部分一致となってしまい, XHJKSD**543678453**SKL や 111**543678453**111 がフィルタを通ってしまう 

実際確認された設定値

![](https://www.datocms-assets.com/75231/1768486384-image2.png)

フィルタを抜かれるアカウントはコミット内容にて CIランナー上のgithub PATを漏洩できる -> mainブランチコードを汚染してサプライチェーン攻撃可能

> GitHubは毎日約20万件の新しいIDを作成しています。このペースでいくと、6桁のメンテナーIDの場合、それを含む新しい長いIDが約5日ごとに登録可能になる

カウントアップで生成されるGithub IDでACTOR_IDのIDを含むユーザーを生成することは現実的

## 問題の本質

完全一致の想定が部分一致

## 設定ミスがあったcode buildプロジェクト
- aws-sdk-js-v3
- aws-lc
- amazon-corretto-crypto-provider
- awslabs/open-data-registry

> この脆弱性は、攻撃者がCI/CD環境を標的とする理由を示す典型的な例です。
巧妙で見落とされやすい欠陥が、悪用されれば甚大な被害をもたらす可能性があります

**正規表現の書き漏れはサプライチェーン攻撃に直結することがある**





