---
title: 【超初級編】React の useState, useReducer, useContextの使い方
description: '初心者向け、ReactのuseState,useReducer,useContextの使い方についての記事です。'
author: Naoki
tags: [Tech]
pubDate: '2023-06-04'
---

## useState

ボタンをクリックすると数値が1ずつ加算されるプログラム

```jsx
import { useState } from "react";

const Hoge = () => {
  const [state, setState] = useState(0);

  const upStateVal = () => {
    setState((prev) => prev + 1);
  };

  return (
    <>
      <p className="result">{state}</p>
      <button onClick={upStateVal}>+</button>
    </>
  );
};

export default Hoge;

```

## useReducer

ボタンをクリックすると数値が1ずつ加算されるプログラム

```jsx
import { useReducer } from "react";

const Hoge = () => {
  const [rstate, dispatch] = useReducer((prev, { type }) => {
    switch (type) {
      case "+":
        return ++prev;
      default:
        throw new Error("不明なtypeが指定されています。")  
    }
  }, 0);

  const upRstateVal = () => {
    dispatch({ type: "+" });
  };

  return (
    <>
      <p className="result">{rstate}</p>
      <button onClick={upRstateVal}>+</button>
    </>
  );
};

export default Hoge;
```

## useContext

▼Parent.jsx
```jsx
import Child from "./components/Child";
import { createContext } from "react";

export const MyContext = createContext("useContext");

const Parent = () => {
  return <Child />;
};

export default Parent;

```

▼components/Child.jsx
```jsx
import { useContext } from "react";
import { MyContext } from "../Parent";

const Child = () => {
  const value = useContext(MyContext);
  return (
    <p>{value}</p>
  );
};

export default Child;

```

コード例は子コンポーネントまでなので恩恵が少ないが、孫コンポーネントに値を渡したいときなどにuseContextを使うことでpropsバケツリレーを回避することができる。

## useContextを使ってstateを管理する

▼context/StateContext.jsx

```jsx
import { useContext, useState, createContext } from "react";

export const StateContext = createContext();

export const StateProvider = ({ children }) => {
  const [state, setState] = useState("hoge");

  return (
    <StateContext.Provider value={[state, setState]}>
      {children}
    </StateContext.Provider>
  );
};

export const useStateContext = () => useContext(StateContext);

```

▼App.jsx

```jsx
import Child from "./components/Child";
import { StateProvider } from "./context/StateContext";

const App = () => {
  return (
    <StateProvider>
      <Child />
    </StateProvider>
  );
};

export default App;
```

▼components/Child.jsx
```jsx
import { useStateContext } from "../context/StateContext";

const Child = () => {
  const [state, setState] = useStateContext();

  return (
    {
      // 省略
    }
  )
};

export default Child;
```