---
title: React Native の環境構築方法
description: 'React Native の環境構築方法をご紹介します。'
author: Naoki
tags: [Tech]
pubDate: '2023-08-26'
---

## 環境情報

- MacBook Air M1, 2020
- node 16.14.0
- expo 6.3.10
- create-expo-app 2.0.4

## 手順

### Expo をインストールする

```bash
npm i -g expo-cli
```

下記コマンドでバージョンが表示されればOK。

```bash
expo --version
```

### Create Expo App をインストールする

```bash
npm i create-expo-app
```

下記コマンドでバージョンが表示されればOK。

```bash
npx create-expo-app -v
```

### プロジェクトを作成する

`react-native-tutorial` は任意のプロジェクト名に変更する。

```bash
npx create-expo-app react-native-tutorial -t expo-template-blank-typescript
```

### 起動する

**※デバッグ用アプリのインストールが必要**

- iOSの場合は [Expo Go](https://apps.apple.com/jp/app/expo-go/id982107779)
- Androidの場合は [Expo](https://play.google.com/store/apps/details?id=host.exp.exponent&pli=1)

下記コマンドを実行する。

```bash
npm run start
```

ターミナル上にQRが表示されるので、デバッグ用デバイスで読み取ると確認ができる。

![](/images/blog/react-native-setup/01.png)

#### その他起動方法

**Android Studioエミュレーター**

※[Android Studio](https://developer.android.com/studio/install?hl=ja) のインストールと設定が必要

▼設定方法  
https://docs.expo.dev/workflow/android-studio-emulator/

```bash
npm run android
```

**MacのiOSシミュレータ**

※[Xcode](https://apps.apple.com/us/app/xcode/id497799835)とXcodeコマンドラインツールをインストール
が必要

▼設定方法  
https://docs.expo.dev/workflow/ios-simulator/

```bash
npm run ios
```

Web

```bash
npm run web
```

## トラブルシューティング

### `npm run web`でエラーが出る

筆者の環境では、下記のようなエラーが発生。

```bash
CommandError: It looks like you're trying to use web support but don't have the required
dependencies installed.

Please install react-native-web@~0.19.6, react-dom@18.2.0,
@expo/webpack-config@^19.0.0 by running:

npx expo install react-native-web@~0.19.6 react-dom@18.2.0
@expo/webpack-config@^19.0.0

If you're not using web, please ensure you remove the "web" string from the
platforms array in the project Expo config.
```

下記コマンドで不足しているパッケージをインストール。

```bash
npx expo install react-native-web@~0.19.6 react-dom@18.2.0
```

```bash
npx expo install @expo/webpack-config@^19.0.0
```

その後再度`npm run web`を実行で無事に起動。

![](/images/blog/react-native-setup/02.png)