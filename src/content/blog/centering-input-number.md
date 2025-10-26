---
title: input[type="number"] のテキストが中央揃えにならない
description: input[type="number"] のテキストが中央揃えにならない場合の対処法をご紹介します。
author: Naoki
tags: [Tech]
pubDate: '2025-01-29'
---

## 事象

下記のような `width` が狭い `input[type="number"]` に `text-align: center;` を指定しても中央揃えにならない。

```html
<input class="input-number" type="number" min="0" max="9" />
```

```scss
.input-number {
  text-align: center;
  min-width: 4rem;
  max-width: 100%;
}
```

### サンプル(調整前)

<style>
.sample .input-number {
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: #1d2020;
  text-align: center;
  min-width: 4rem;
  max-width: 100%;
  background-color: #fff;
}

.sample .input-number::-webkit-outer-spin-button,
.sample .input-number::-webkit-inner-spin-button {
  appearance: auto;
  -webkit-appearance: auto;
}
</style>

<div class="sample">
  <input class="input-number" type="number" min="0" max="9" value="1" />
</div>

## 原因

スピンボタン分、テキストの位置がずれてしまっている

## 対処法

- `input`にスピンボタン分の`padding`を設ける
- スピンボタンの位置を`position`で指定する

```scss
.input-number {
  text-align: center;
  position: relative;
  padding: 0 1rem; // スピンボタン分の横padding 値は適宜調整してください
  
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    right: 0;
    height: calc(100% - 0.2rem); // スピンボタンのheight 値は適宜調整してください
  }
}
```

### サンプル(調整後)

<style>
.sample .input-number--center {
  position: relative;
  padding: 0 1rem;
}

.sample .input-number--center::-webkit-outer-spin-button,
.sample .input-number--center::-webkit-inner-spin-button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  right: 0;
  height: calc(100% - 0.2rem);
}
</style>

<div class="sample">
  <input class="input-number input-number--center" type="number" min="0" max="9" value="1" />
</div>
