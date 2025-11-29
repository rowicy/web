---
title: ゲーム開発で例えるinterface
pubDate: '2025-11-24'
description: ゲーム開発で例えるinterface
author: Millin
tags: [Tech, C#]
---

こんにちは！ゲームエンジニアのMillinです。

今回はinterfaceについてゲーム開発での活用例を交えて解説したいと思います。

今回、例題のコードはC#で書きますが、たいていの言語で同様の活用ができるかと思います。

## インターフェイスとは

特定の関数やプロパティを持つことを明示する型です。

以下のように記述し、定義したInterface型の変数から関数やプロパティを呼び出すことができます。

```cs
interface ITest
{
    int Value { get; }
    void Test();
}

class Foo : ITest
{
    int value;
    public int Value => value;

    public void Test()
    {
        value = 3;
        Console.WriteLine("Hello, World!");
    }
}

class Program
{
    static void Main(string[] args)
    {
        ITest test = new Foo();
        //Hello, World!が表示される。
        test.Test();
        //3が表示される。
        Console.WriteLine(test.Value);
    }
}
```

変数を持つことはできません。(C#ではコンパイルエラーになります。)

```cs
interface ITest
{
    int test;
    void Test();
}
```

interfaceに定義された関数やプロパティがinterfaceを適用したクラスにない場合もコンパイルエラーになります。

```cs
interface ITest
{
   void Test();
}

//interfaceで定義されているTest()がない
class Foo : ITest
{
}
```

継承と違い複数のインターフェースをクラスに適用することができます。(C++などの多重継承できる言語は除く)

```cs
interface ITest
{
   void Test();
}

interface ITest2
{
    void Test2();
}

class Foo : ITest, ITest2
{
    public void Test()
    {
        Console.WriteLine("Hello, World!");
    }

    public void Test2()
    {
        Console.WriteLine("Hello, World!");
    }
}
```

## ゲームでの活用例

以下のような仕様を想定します。(この段階ではInterfaceは必要ありません)

- すべてのクラスはObjectを継承する
- キャラクター・弾があり、弾はキャラクターにダメージを与える。

```cs
class Object
{
}

class Character : Object
{
    //体力
    int hp;

    public void Damage()
    {
        hp--;
    }
}

class Bullet : Object
{
    public void Hit(Character character)
    {
        character.Damage();
    }
}
```

シンプルですね。ここで以下の追加仕様があった場合のinterfaceを使用しない場合と使用した場合の違いを比較してみます。

- 弾で壊せる箱(BreakableBox)・壊せない箱(Box)がある。
- 箱は持ち運ぶことができる。

### インターフェースを使用しない場合1(Bullet内でキャストして分岐)

```cs
class Object
{
}

class Character : Object
{
    //体力
    int hp;

    public void Damage()
    {
        hp--;
    }
}

class Bullet : Object
{
    public void Hit(Object obj)
    {
        if(obj is Character character)
        {
            character.Damage();
        }
        else if( obj is BreakableBox breakableBox)
        {
            breakableBox.Damage();
        }
    }
}

class BoxBase : Object
{
    public void Carry()
    {
        //運ぶ処理
    }
}

class Box : BoxBase
{
}

class BreakableBox : BoxBase
{
    public void Damage()
    {
        //壊れる処理
    }
}
```

Bullet内でCharacterとBreakableBoxの二つに依存し、多態性が全く実現できていない状態になります。

### インターフェースを使用しない場合2(ObjectにDamage処理を持たせる)

```cs
class Object
{
    public virtual void Damage()
    {
    }
}

class Character : Object
{
    //体力
    int hp;

    public override void Damage()
    {
        hp--;
    }
}

class Bullet : Object
{
    public void Hit(Object obj)
    {
        obj.Damage();
    }
}

class BoxBase : Object
{
    public void Carry()
    {
        //運ぶ処理
    }
}

class Box : BoxBase
{
}

class BreakableBox : BoxBase
{
    public override void Damage()
    {
        //壊れる処理
    }
}
```

特定のサブクラス（BreakableBox や Character）のための処理が基底に書かれるのは継承関係として正しくないです。

### インターフェースを使用した場合

```cs
interface IDamageable
{
    void Damage();
}

class Object
{
}

class Character : Object, IDamageable
{
    //体力
    int hp;

    public void Damage()
    {
        hp--;
    }
}

class Bullet : Object
{
    public void Hit(IDamageable damageable)
    {
        damageable.Damage();
    }
}

class BoxBase : Object
{
    public void Carry()
    {
        //運ぶ処理
    }
}

class Box : BoxBase
{
}

class BreakableBox : BoxBase, IDamageable
{
    public void Damage()
    {
        //壊れる処理
    }
}
```

多態性や継承関係が適切に保たれます！
