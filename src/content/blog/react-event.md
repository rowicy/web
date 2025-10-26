---
title: Reactでよく使うイベントハンドラ
description: '個人的に利用頻度が高いReactイベントハンドラの備忘用記事です。'
author: Naoki
tags: [Tech]
pubDate: '2023-05-03'
---

**hogeは任意のものに書き換える**

## クリックしたとき

```jsx
<button onClick={hoge}>ボタン</button>
```

## 入力値が変更されたとき

```jsx
<input type="text" onChange={hoge} />
```

## フォーカスが当たったとき

```jsx
<input type="text" onFocus={hoge} />
```

## フォーカスが外れたとき

```jsx
<input type="text" onBlur={hoge} />
```

## マウスオンしたとき

```jsx
<div onMouseEnter={hoge} >
```

## マウスアウトしたとき

```jsx
<div onMouseLeave={hoge} >
```

## 【補足】マウスオン・マウスアウトイベントについて

本記事で紹介している `onMouseEnter` `onMouseLeave` に似たイベントハンドラで、`onMouseOver` `onMouseOut`というものがあるのですが、若干挙動が違うようです。

### onMouseEnterとonMouseOverの違い

▼ChatGPTの回答

>onMouseEnterとonMouseOverは、マウスカーソルが要素に乗ったときに実行されるイベントハンドラですが、微妙な違いがあります。

>onMouseEnterは、要素にマウスカーソルが入った瞬間に1回だけ実行され、その後は要素内でのマウス移動には反応しません。一方、onMouseOverは、マウスカーソルが要素上にある限り、常に実行され続けます。

>この違いは、要素内に別の要素がある場合に重要になります。onMouseOverは、子要素の上にマウスカーソルが移動したときにも実行されますが、onMouseEnterは、子要素に移動したときには実行されません。

### onMouseLeaveとonMouseOutの違い

▼ChatGPTの回答

>onMouseLeaveとonMouseOutは、マウスカーソルが要素から離れたときに実行されるイベントハンドラですが、微妙な違いがあります。

>onMouseLeaveは、要素からマウスカーソルが出た瞬間に1回だけ実行され、その後は要素外でのマウス移動には反応しません。一方、onMouseOutは、マウスカーソルが要素外に出る限り、常に実行され続けます。

>この違いは、要素内に別の要素がある場合に重要になります。onMouseOutは、子要素にマウスカーソルが移動したときにも実行されますが、onMouseLeaveは、子要素から親要素に戻ってきたときには実行されません。

子要素の有無と反応させたいか否かで使い分けが必要そうです。  
動作の違いについては下記記事のデモがわかりやすかったので参考にしてみてください。

https://takamints.hatenablog.jp/entry/mouseenter-vs-mouseover