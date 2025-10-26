---
title: includeで引数に応じて出力の分岐をする方法
description: 'EJSのincludeで引数に応じて出力の分岐を行う方法をご紹介します。'
author: Naoki
tags: [Tech]
pubDate: '2023-03-14'
---

## include するファイルを作成する

今回は例として、`hoge.ejs`というファイルを作成します。  
flagが`true`の場合は`○`を、  
`false`の場合は`×`を出力するようif文を書きます。

```ejs
<%# hoge.ejs %>
<p class="hoge">
  <% if(flag === true){ %>
    ○
  <% }else{ %>
    ×
  <% } %>
</p>
```

## hoge.ejs を includeする

作成した`hoge.ejs`をincludeします。  
このとき、引数も渡してあげます。

```ejs
<%- include('hoge.ejs', {flag: true}); %>
```

上記のように`true`を設定すると`○`が出力されます。  
ローカルファイルとアップ用ファイルで内容を切り替えたい時などに便利ですのでぜひ使ってみてください。

