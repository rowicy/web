---
title: TypeScriptの型(type)の拡張
description: '型の拡張方法の備忘用記事です。'
author: Naoki
tags: [Tech]
pubDate: '2024-01-15'
---

自分用メモなので殴り書きです。。(他にも記法ありますが、個人的に好きな書き方です。)

## 型を定義する

```typescript
type Args = {
  name: string;
  value: string;
};
```

## 値を追加する(≒ 型を拡張する)

```typescript
type ExArgs =  Args & {items: string[]};
```

下記と同義

```typescript
type ExArgs = {
  name: string;
  value: string;
  items: string[];
}
```
