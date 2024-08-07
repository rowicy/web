---
title: Burp Suite Extension を作ってみました
pubDate: '2024-07-28'
description: 今回は個人的に開発したBurp Suite拡張機能と、開発してみての体験談を紹介します。
author: RiiiM
tags: [Tech]
---

## 概要

[Burp Suite](https://portswigger.net/burp)とは、ウェブアプリケーションのセキュリティテストを行うための統合プラットフォームです。セキュリティ業界ではかなり有名なツールですね。

今回は、そんなツールでHTTPリクエスト情報をExcelに書き出せる拡張機能「**burpee**」を作ったので、その紹介をさせていただきます🙃

[![Burpee Repository](https://opengraph.githubassets.com/1/riiim400th/burpee)](https://github.com/riiim400th/burpee)

![head_image](https://github.com/user-attachments/assets/82dbe607-3847-4d04-b720-6867a33e10f8)

## はじめに

知っている方は読み飛ばしてかまいませんが、簡単にBurp Suiteとその拡張機能の開発環境について紹介します。

### 🛠️拡張機能の開発環境

#### Kotlin

Kotlinはモダンなプログラミング言語で、Javaと互換性があり、シンプルで安全なコードを書くことができます。Javaのエコシステムを活用しながら、よりスッキリとしたコードを書くことができます。

#### Jarファイルとは？

Jar（Java ARchive）ファイルは、Javaで作成されたクラスファイルやリソースファイルを一つのアーカイブにまとめたものです。これにより、アプリケーションの配布や実行が簡単になります。

##### KotlinとJarファイルのサイズ

Kotlinで作成されたJarファイルは、Javaで作成されたものよりも**少し大きくなってしまいます**。

Kotlinのランタイムライブラリが含まれるためです。

ファイルサイズが大きいこと自体は問題ないのですが、Burp側にファイルのサイズが大きいことで**システムへの負荷レベルが高く評価される可能性もあります**

でも書きやすさ優先で自分はKotlin派ですね✨

#### Montoya API

Burp Suiteの拡張機能を使うには[Montoya API](https://portswigger.github.io/burp-extensions-montoya-api/javadoc/burp/api/montoya/MontoyaApi.html)を使います。

2023年7月に登場した、新しいAPIで、このAPIからBurpのコア機能を呼び出すことができます。

リクエストやレスポンスの操作がメソッドで呼び出せて、ユーティリティも豊富です。

ツールの説明はこの辺にして、今回作った拡張機能を紹介します!

## ✔️開発の動機

普段エクセルに出力する機会が多かったのですが、
Burp SuiteとExcelを行き来しながらコピペ繰り返すのが**大変だるいんですね**

コピペって凄い発明だと思うんですよ、

ただ、ただね、
それを数回繰り返すだけでもう嫌になっちゃうんですよ

平然な顔してるけど、`ctrl+C` 、、、 `ctrl+V` 、、、 `Win+V` ってやってるときの内心 😒😒😒😒😒 これです。

あと、Windowsユーザーです。はい。

直接Excelに欲しい情報書き込めるツールが欲しいなぁと感じ、今回作ってみました。

## 🛼使用方法

### 機能

動画を見るのが早いと思うので、簡単な紹介動画を作りました。詳細は[README](https://github.com/riiim400th/burpee/)にありますが、動画の内容と同じなので読まなくても大丈夫です

[![image](https://github.com/user-attachments/assets/77d1bf6a-dbca-4dae-a955-72b9a85e641d)](https://youtu.be/no15BP_kVHA)

機能は主に2つです。リクエスト情報(パラメータやヘッダ)を**クリップボードにコピー** もしくは **Excelに出力**できます。

拡張機能専用のタブも用意して、出力内容の調整をできるようにしました。

- どのヘッダーを除くか
- URLデコードするか
- Cookieも載せるか
- ハイライトをExcelのセル色にも反映するか

など...

### インストール

次はGitHubから拡張機能(主にjarファイル)をインストールする方法です。

1. [こちら](https://github.com/riiim400th/burpee/releases/)から最新版のリリースでzipファイルをインストール
2. zip展開
3. Burp Suiteの Extensions > Add > Extension FIle(.jar)から 展開後のjarファイルを選択
4. Outputにロード完了の内容が出力

ほかのGitHub上のファイルも同じ手順でインストールできます。

ただ、releasがない場合はcloneして自分でjarファイルをビルドする必要があります。ここではその方法やpythonのファイルのインストール方法は割愛します。

## 👩‍🚀開発してみて

### 苦戦したところ

実はエクセルファイルに書き込む部分は割とスムーズに実装できました。

個人に時間がかかったのは設定タブですね。

- Java.swingの配置が面倒

- プルダウン選択時のチェック処理 (ファイルが選択されていないときにファイル出力のメニューをonにできないようにする工夫)

- チェックボックスによる出力処理の分岐

などです。

特に2番目の処理を実装するなかで、アノテーションは勉強になりました。

```kotlin
fileButton.addActionListener {
    ...
    // 拡張子の確認
    if (selectedFile.extension != "xlsx") {
        alert("File extension must be '.xlsx'")
        return@addActionListener
    }
```

[src/main/kotlin/TabTask.kt](https://github.com/riiim400th/burpee/blob/443e708f2acf9eaf624ca5a6fda02bdd65e50612/src/main/kotlin/TabTask.kt#L97-L101)

return@addActionListenerを使用することで、このラムダ式からのみ抜け出し、他の外部関数やラムダ式への影響を避けています。

### うれしかったところ

これで楽になったーー!!!!

もうこれだけです。あとは趣味の範囲で欲しい機能でもつけますかね。

### 今後つけたい機能

- リファクタリング
- JSONに出力
- パスツリーの出力

引き継ぎパラメータを判別してマクロをより正確に作る機能も欲しいなと思いましたが、それは別の拡張機能に盛り込んだほうがいいかもしれません。

## 🎠まだまだ開発中です

Githubの [Issue](https://github.com/riiim400th/burpee/issues) で欲しい機能を受け付けています! 気軽に書いていただけると嬉しいです。

## 🔗URLs

### ダウンロード

[Jarファイルのダウンロード](https://github.com/riiim400th/burpee/releases/)

### Githubリポジトリ

[GitHubリポジトリ](https://github.com/riiim400th/burpee)
