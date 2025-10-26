---
title: JavaScriptでWebスクレイピングをする
description: 'JavaScriptでWebスクレイピングをする方法をご紹介します。'
author: Naoki
tags: [Tech]
pubDate: '2023-04-28'
---

## 環境情報

- node 14.16.0
- npm 6.14.11
- puppeteer 19.11.1

## 手順

### puppeteerをインストールする

```bash
npm install puppeteer
```

### puppeteerを読み込む

scraping.jsを作成し、puppeteerの読み込む。

```javascript
const puppeteer = require('puppeteer');
```

### スクレイピングの処理を書く

今回は例として、本サイトの記事一覧の各タイトルを抽出する処理を書いていきます。

```javascript
const puppeteer = require('puppeteer');

const scrape = async () => {
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 250,
    defaultViewport: null
  });

  const page = await browser.newPage();
  const url = "https://www.rowicy.com/blog/";
  await page.goto(url, { waitUntil: 'domcontentloaded' });

  const target = "h3.font-semibold.tracking-tight.text-xl.md\\:text-2xl";

  const results = await page.$$eval(target, elements => elements.map(element => element.textContent));
  console.log(results);

  browser.close();
};

scrape();
```

### スクレイピングを実行する

下記コマンドでスクレイピングを実行する。

```bash
node scraping.js
```

下記画像のように、ターミナルに結果が出力されれば成功です！

![](/images/blog/js-scraping/01.png)


## 応用

今回はタイトルのみを抽出しましたが、他のテキストやリンク先等、複数要素を取得したい場合は配列やループ処理を駆使することで実現できます。  
また、結果をCSVに出力することも可能です。  
下記にデモを作成していますので、よろしければご覧ください。

https://github.com/naoki-00-ito/js-scraping
