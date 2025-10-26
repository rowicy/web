---
title: EJSで改行位置調整関数を作成する
description: 'EJSで改行位置調整関数を作成する方法をご紹介します。'
author: Naoki
tags: [Tech]
pubDate: '2023-04-29'
---

下記のように単一のpタグ内にカンマ区切りで商品名が入力されている場合、微妙な位置で改行されてしまいます。

```html
<p>
yyyy年mm月dd日発売商品 - 1,yyyy年mm月dd日発売商品 - 2,yyyy年mm月dd日発売商品 - 3,yyyy年mm月dd日発売商品 - 4,yyyy年mm月dd日発売商品 - 5,yyyy年mm月dd日発売商品 - 6,yyyy年mm月dd日発売商品 - 7,yyyy年mm月dd日発売商品 - 8
</p>
```

**▼表示イメージ**

<p>
yyyy年mm月dd日発売商品 - 1,yyyy年mm月dd日発売商品 - 2,yyyy年mm月dd日発売商品 - 3,yyyy年mm月dd日発売商品 - 4,yyyy年mm月dd日発売商品 - 5,yyyy年mm月dd日発売商品 - 6,yyyy年mm月dd日発売商品 - 7,yyyy年mm月dd日発売商品 - 8
</p>  


## 区切り文字(,)を基準にspanタグで囲う関数を作成する

商品名1つ1つを`display: inline-block`が効いたタグで囲うことで調整ができそうですね。  
今回はカンマを基準に各商品名をinline-block用classがついたspanタグで囲う関数を作っていきます。

```ejs
<%
const encloseWithSpan = (name) => {
  const splitStr = ","; // 区切り文字
  const splitNameArray = name.split(splitStr);

  const formatNameArray = splitNameArray.map((text) => {
    return `<span class="u-inline-block">${text}</span>`;
  });

  const formatName = formatNameArray.join(splitStr);
  return formatName;
}
%>
```

## 関数を通す

pタグのテキストを、関数を通して入力します。

```ejs
<p>
  <%- encloseWithSpan("yyyy年mm月dd日発売商品 - 1,yyyy年mm月dd日発売商品 - 2,yyyy年mm月dd日発売商品 - 3,yyyy年mm月dd日発売商品 - 4,yyyy年mm月dd日発売商品 - 5,yyyy年mm月dd日発売商品 - 6,yyyy年mm月dd日発売商品 - 7,yyyy年mm月dd日発売商品 - 8"); %>
</p>
```

下記のように各商品名がspanタグで囲われていれば成功です。

```html
<p>
  <span class="u-inline-block">yyyy年mm月dd日発売商品 - 1</span>,<span class="u-inline-block">yyyy年mm月dd日発売商品 - 2</span>,<span class="u-inline-block">yyyy年mm月dd日発売商品 - 3</span>,<span class="u-inline-block">yyyy年mm月dd日発売商品 - 4</span>,<span class="u-inline-block">yyyy年mm月dd日発売商品 - 5</span>,<span class="u-inline-block">yyyy年mm月dd日発売商品 - 6</span>,<span class="u-inline-block">yyyy年mm月dd日発売商品 - 7</span>,<span class="u-inline-block">yyyy年mm月dd日発売商品 - 8</span>
</p>
```

**▼表示イメージ**

<style>
  .u-inline-block {
    display: inline-block;
  }
</style>

<p>
  <span class="u-inline-block">yyyy年mm月dd日発売商品 - 1</span>,<span class="u-inline-block">yyyy年mm月dd日発売商品 - 2</span>,<span class="u-inline-block">yyyy年mm月dd日発売商品 - 3</span>,<span class="u-inline-block">yyyy年mm月dd日発売商品 - 4</span>,<span class="u-inline-block">yyyy年mm月dd日発売商品 - 5</span>,<span class="u-inline-block">yyyy年mm月dd日発売商品 - 6</span>,<span class="u-inline-block">yyyy年mm月dd日発売商品 - 7</span>,<span class="u-inline-block">yyyy年mm月dd日発売商品 - 8</span>
</p>
