---
title: CSSで親要素のwidthを無視して背景を画面幅いっぱいに広げる方法
description: 'CSSで親要素のwidthを無視して背景を画面幅いっぱいに広げる方法をご紹介します。'
author: Naoki
tags: [Tech]
pubDate: '2023-03-16'
---

本記事では親要素のwidthを無視して背景を広げる方法をご紹介します。

## 調整前構造

### HTML

```html
<main class="l-main">
  <div class="p-hoge">
    <div class="p-hoge__bg">
      <p class="p-hoge__text">texttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttext</p>
    </div>
  </div>
</main>
```

### CSS

```css
.l-main {
  width: 90%;
  margin-left: auto;
  margin-right: auto;
}

.p-hoge {
  width: 100%;
}

.p-hoge__bg {
  background-color: #f00;
}
```

### 表示イメージ

<style>
.l-main {
  width: 90%;
  margin: 40px auto;
  background-color: #00f;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 30px;
}

.p-hoge {
  width: 100%;
}

.p-hoge__bg {
  background-color: #f00;
}

.p-hoge__bg--full {
  margin-left: calc(((100vw - 100%) / 2) * -1);
  margin-right: calc(((100vw - 100%) / 2) * -1);
  padding-left: calc((100vw - 100%) / 2);
  padding-right: calc((100vw - 100%) / 2);
}

.p-hoge__text {
  word-wrap: break-word;
  margin: 0 !important;
  
}
</style>

<main class="l-main">
  <div class="p-hoge">
    <div class="p-hoge__bg">
      <p class="p-hoge__text">
texttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttext
      </p>
    </div>
  </div>
</main>
 
※青背景部分が`.l-main`, 赤背景部分が`p-hoge`

## 背景を画面幅いっぱいに広げるCSSを追記する

```css
.p-hoge__bg {
  background-color: #f00;
  /*  ↓ Add */
  margin-left: calc(((100vw - 100%) / 2) * -1);
  margin-right: calc(((100vw - 100%) / 2) * -1);
  padding-left: calc((100vw - 100%) / 2);
  padding-right: calc((100vw - 100%) / 2);
  /*  ↑ Add */
}
```

## 下記のように背景が画面幅いっぱいになります

<main class="l-main">
  <div class="p-hoge">
    <div class="p-hoge__bg p-hoge__bg--full">
      <p class="p-hoge__text">
texttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttext
      </p>
    </div>
  </div>
</main>

## Sassを使う場合はmixinを作っておくと便利です

```scss
@mixin contents-full {
  margin-left: calc(((100vw - 100%) / 2) * -1);
  margin-right: calc(((100vw - 100%) / 2) * -1);
  padding-left: calc((100vw - 100%) / 2);
  padding-right: calc((100vw - 100%) / 2);
}
```

GitHubでよく使うmixinを公開していますのでご参考ください！

https://github.com/naoki-00-ito/flocss-set/blob/master/scss/_foundation/_mixin.scss

