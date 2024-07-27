---
title: テンプレート
pubDate: '2024-07-27'
description: burp拡張機能 burpeeを開発した話
author: RiiiM
tags: [Tech]
---

## 概要

Burp Suiteとは、ウェブアプリケーションのセキュリティテストを行うための統合プラットフォームです。セキュリティ業界ではかなり有名なツールですね。

今回は、そんなツールでHTTPリクエスト情報をExcelに書き出せる拡張機能「**burpee**」を作ったので、その紹介をさせていただきます🙃

![head_image](https://github.com/user-attachments/assets/82dbe607-3847-4d04-b720-6867a33e10f8)

## 目次

- [はじめに](#はじめに)
  - [拡張機能の開発環境](#🛠️拡張機能の開発環境)
- [開発の動機](#✔️開発の動機)
- [使用方法](#🛼使用方法)
  - [インストール](#インストール)
  - [機能](#機能)
- [開発してみて](#👩‍🚀開発してみて)
  - [苦戦したところ](#苦戦したところ)
  - [うれしかったところ](#うれしかったところ)
  - [今後つけたい機能](#今後つけたい機能)
- [まだまだ開発中です](#🎠まだまだ開発中です)
- [URLs](#🔗urls)

## はじめに

知っているかたは読み飛ばしてかまいませんが、簡単にBurp Suiteとその拡張機能の開発環境について紹介します。

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

Burp Suiteの拡張機能を使うにはMontoya APIを使います。

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

まず動画を見るのが早いと思うので、簡単な紹介動画を作りました。これみればあと読まなくても大丈夫です

[![image](https://github.com/user-attachments/assets/77d1bf6a-dbca-4dae-a955-72b9a85e641d)](https://youtu.be/no15BP_kVHA)

### インストール

次はGitHubから拡張機能(主にjarファイル)をインストールする方法です。

1. [こちら](https://github.com/riiim400th/burpee/releases/)から最新版のリリースでzipファイルをインストール
2. zip展開
3. Burp Suiteの Extensions > Add > Extension FIle(.jar)から 展開後のjarファイルを選択
4. Outputにロード完了の内容が出力

ほかのGitHub上のファイルも同じ手順でインストールできます。

ただ、releasがない場合はcloneして自分でjarファイルをビルドする必要があります。ここではその方法やpythonのファイルのインストール方法は割愛します。

### 機能

機能は主に2つです。リクエスト情報(パラメータやヘッダ)を**クリップボードにコピー** もしくは **Excelに出力**できます。

### 機能1. クリップボードにコピー

   情報を取得したいHTTPリクエストのメニューからburpeeをクリック、これだけでクリップボードに内容がコピーされています。
  
   ![image](https://github.com/user-attachments/assets/047ec80c-9fc6-4114-a720-fd738af409d4)

　　クリップボードではtsv形式で文字列が取得されているため、そのままExcelに貼り付けができます。

   ![image](https://github.com/user-attachments/assets/ab6e9f0e-0033-4954-a9ce-0a591a7af003)

### ファイル書き込み

 拡張機能ロード時点でburpeeタブが作成されています。
    ![image](https://github.com/user-attachments/assets/669295e3-0706-492d-be52-48dcbf1cd09b)

Select Fileからエクセルファイルを新規作成して、Proxyタブやloggerタブから先ほど同様にburpeeに送信しましょう。複数選択もできます。

   Requests Summary Sheet

   ![image](https://github.com/user-attachments/assets/4cdec456-82e4-4797-ba10-cff76b472c1f)

   Requests Detail Sheet

   ![image](https://github.com/user-attachments/assets/c7f41d03-1355-4abe-ac90-1b31f1fef513)

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
- パスツリーの表示

引き継ぎパラメータを判別してマクロをより正確に作る機能も欲しいなと思いましたが、それは別の拡張機能に盛り込んだほうがいいかもしれません。

## 🎠まだまだ開発中です

Githubの [Issue](https://github.com/riiim400th/burpee/issues) で欲しい機能を受け付けています! 気軽に書いていただけると嬉しいです。

## 🔗URLs

### ダウンロード

[Jarファイルのダウンロード](https://github.com/riiim400th/burpee/releases/)

### Githubリポジトリ

[GitHubリポジトリ](https://github.com/riiim400th/burpee)
