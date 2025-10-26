---
title: Nuxt.jsにSentryを導入する
description: 'Nuxt.jsにSentryを導入する方法をご紹介します。'
author: Naoki
tags: [Tech]
pubDate: '2023-07-16'
---

## Sentryとは

https://sentry.io/welcome/

アプリケーションやウェブサイトで発生するエラーや例外を検知できるツールです。  
エラーが発生した箇所やスタックトレース、リクエスト情報、デバイス情報などの詳細な情報をリアルタイムで取得できるので、導入することでエラーの早期発見及び原因特定までの時短が期待できます。

本記事では、Nuxt.jsにSentryを導入する方法をご紹介します。


## 環境情報

- node 16.14.0
- nuxt 2.16.1

## 導入手順

### Sentryアカウントを作成する

下記ページから新規アカウントを作成します。

https://sentry.io/signup/

アカウントを作成すると、Welcome画面が表示される。  
設定はあとから変更できるのでSkipする。

![](/images/blog/sentry-to-nuxt/01.png)

### Projectを作成する

Projectを作成します。

![](/images/blog/sentry-to-nuxt/02.png)

「Choose your platform」「Set your alert frequency」「Name your project and assign it a team」を入力してProjectを作成する。

![](/images/blog/sentry-to-nuxt/03.png)

Project作成後、Configure Vue SDKというページが表示される。 (「Choose your platform」で選択した環境に合わせた設定手順を教えてくれる)  
ただ今回はNuxt.jsを利用しているので手動で設定を行う。

### nuxtjs/sentry をインストールする

https://www.npmjs.com/package/@nuxtjs/sentry

下記コマンドを実行してインストールする。

```bash
npm i @nuxtjs/sentry
```

インストール後、nuxt.config.jsにmodule読み込みを追記する。

```diff
  modules: [
    // 省略
+   '@nuxtjs/sentry',
  ],
```

### nuxt.config.js に Sentry DSNの設定を記述する

DSNは Settings > Projects > {Project名} > Client Keys から確認できます。

DSNの確認ができたら、nuxt.config.js内にSentry設定を記述します。  
下記はenvファイルを利用したコード例で、process.env.ENVがproductionの場合のみSentryのDSNを設定する、という構文です。  
production分岐が不要であれば構文を変えても問題ないですし、process.env.SENTRY_DSNの部分も直接記述でも問題ないです。  

```javascript
  sentry: {
    dsn: process.env.ENV === 'production' ? process.env.SENTRY_DSN : false,
  },
```

以上で設定は完了です。  
設定内容に問題がなければ、エラーを検知した際にIssuesに内容が保存されます。

![](/images/blog/sentry-to-nuxt/04.png)





