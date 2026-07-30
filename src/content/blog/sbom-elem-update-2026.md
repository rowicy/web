---
title: SBOMの最小構成要素が増えた
description: 'CISAの公開した2026 Minimum Elements for a Software Bill of Materialsの新要素を軽く解説'
author: RiiiM
tags: [Tech, Security]
pubDate: '2026-07-31'
---

# SBOM最小要素の変更

**SBOMの構成要素がアップデートされた**

最低限の項目定義が更新された

2026年7月29日、CISAは`2026 Minimum Elements for a Software Bill of Materials`を発行した

https://www.cisa.gov/resources-tools/resources/2026-minimum-elements-software-bill-materials-sbom

これは[2021年にNTIAが定めたSBOM最小要素](
https://www.ntia.gov/report/2021/minimum-elements-software-bill-materials-sbom)の改訂版になる


## 変わったよ


> オリジナルのNTIA文書の核心的原則を維持しつつ、現在のSBOMツールやニーズを反映しています

4年もたちセキュリティ状況が大きく変わった
SBOMの運用も当初から更新され続けている

新設された要素をみていく

## 新要素たち

### Component Hash Value / Component Hash Algorithm

<span style="font-size: 90%; color: #525151;"> [既存主要フォーマットでのサポート]<br>SPDX 2.x: 任意　SPDX 3.x: 任意　CycloneDX: 任意</span>


コンポーネントの実行ファイルに対するハッシュ値と算出アルゴリズムのペア
改ざん検知が目的

CycloneDXの例

```json
{
  "components": [
    {
      "type": "library",
      "name": "libssl",
      "version": "3.0.13",
      "hashes": [
        {
          "alg": "SHA-256",
          "content": "b4c2a1e9f7d3..."
        }
      ]
    }
  ]
}
```

アルゴリズムの命名は[IANAのHash Function Textual Names](https://www.iana.org/assignments/hash-function-text-names)に従う

### Component License

<span style="font-size: 90%; color: #525151;"> [既存主要フォーマットでのサポート]<br>SPDX 2.x: 必須だが値で回避できるので実質任意　SPDX 3.x: 任意　CycloneDX: 任意</span>

コンポーネントが依拠するライセンス識別子

識別子がない場合はURLで詳細への導線を示すか、「unknown」と明記

プロプライエタリライセンスの存在有無もここに含めろとあるので、社内ライブラリを混ぜていると手間が増えそう


```json
{
  "name": "libssl",
  "version": "3.0.13",
  "licenses": [
    { "license": { "id": "Apache-2.0" } }
  ]
}
```

### SBOM Author Signature

<span style="font-size: 90%; color: #525151;"> [既存主要フォーマットでのサポート]<br>SPDX 2.x: 仕様外　SPDX 3.x: 仕様外　CycloneDX: 任意</span>

SBOM自体に対するデジタル署名

CycloneDXならJSF(JSON Signature Format)を使った署名ブロックを付与する

```json
{
  "signature": {
    "algorithm": "ES256",
    "value": "MEUCIQDx...",
    "publicKey": {
      "kty": "EC",
      "crv": "P-256",
      "x": "f83OJ3D2...",
      "y": "x_FEzRu9..."
    }
  }
}
```

### SBOM Data Format Name / SBOM Data Format Version

<span style="font-size: 90%; color: #525151;"> [既存主要フォーマットでのサポート]<br>SPDX 2.x: 必須(一体化`"spdxVersion": "SPDX-2.3"`)　SPDX 3.x: 必須(一体化)　CycloneDX: 必須</span>

SBOM自体のフォーマットとバージョンを記載

```json
{
  "bomFormat": "CycloneDX",
  "specVersion": "1.6"
}
```

非推奨バージョンのSBOMは受け取り拒否していい、というルールも合わせて明記された

### SBOM Generation Context

<span style="font-size: 90%; color: #525151;"> [既存主要フォーマットでのサポート]<br>SPDX 2.x: 非対応　SPDX 3.x: 非対応　CycloneDX: 任意</span>

SBOMがソフトウェアライフサイクルのどの段階で生成されたかを示す項目

SBOMはどの段階で生成したかで依存網羅性が変わる

リポジトリからは開発者の意図した依存を
イメージからは本番デプロイの全容を
ランタイム生成では実際に呼び出され、到達可能性のあるものを映す

リファレンスには

> この要素には、「ビルド前」「ビルド中」「ビルド後」といった一般的なソフトウェアライフサイクルの参照だけでなく、より具体的な識別子も使用できます

とあるが、任意の値でOKでいいのだろうか

```json
{
  "metadata": {
    "lifecycles": [
      { "phase": "post-build" }
    ]
  }
}
```


### SBOM Tool Name / SBOM Tool Version

<span style="font-size: 90%; color: #525151;"> [既存主要フォーマットでのサポート]<br>SPDX 2.x: 任意　SPDX 3.x: 任意　CycloneDX: 任意</span>

SBOMの生成に使ったツール名とそのバージョン

```json
{
  "metadata": {
    "tools": {
      "components": [
        { "type": "application", "name": "cyclonedx-npm", "version": "3.4.1" }
      ]
    }
  }
}
```

### SBOM Version

<span style="font-size: 90%; color: #525151;"> [既存主要フォーマットでのサポート]<br>SPDX 2.x: 非対応　SPDX 3.x: 非対応　CycloneDX: 任意</span>

SBOMドキュメントそのもののバージョン, SemVer

SBOMは一度作って終わりではなく、SDLCに伴って更新され続ける
VEXや推移依存関係の更新によりアプリバージョンとはタイミングがことなることに注意

```json
{
  "metadata": {
    "properties": [
      { "name": "sbom:version", "value": "1.2.0" }
    ]
  }
}
```

CycloneDXはSemVerを表現できないので`properties`にカスタムフィールドとして持たせることになる


## ついでに既存フィールドの用語も変わった

新設フィールドとは別に、既存フィールドの名称・定義変更もいくつかある

- `Supplier Name` → `Component Producer` に改称
    「サプライヤー」という語が流通業者と製造元の区別で混乱を招いていたための変更
- `Other Unique Identifiers` → `Component Identifiers` に改称
    CPEやPURLなど、共通識別子を最低1つ含めることが必須になった
- `Depth` → `Coverage` に改称
    「深さ」ではなく「網羅性」という考え方に変わり、推移的依存も対象に含むことが明記された
- `Access Controls` は廃止
    内容は `Distribution and Delivery` に統合された

命名の話だけに見えて、実際はSBOM管理システム側のフィールドマッピングに直結する変更
パーサー自前のプロジェクトでは面倒になりそう

## 所感

SBOMの運用はただ収集して保管することから変わった
サプライチェーン攻撃の激化もあり、鮮度と生成時点、網羅性が運用に重要なことが明らかになった
今回の変更はこの状況を反映していると思っている

管理ツール側での対応が進むかには言及しないが、普及したら運用はより良くなると思った

個人的に整理するなら、SBOM運用は3つの軸を改善しながら実態のマッピングを進める必要がある

依存・コンポーネント間・時間

「依存」は推移的関係を含めた網羅性と実際の呼び出しの依存性が追跡できているか

「コンポーネント間」は識別の正確性, コンポーネントをまたいだ共通依存が整理できているか

「時間」はSDLCのどのフェーズで生成されたのか、そしてアプリ更新とは非同期に回る運用フローがあるか

依存性を追うことが主目的だった線の運用から
面のつながりへと強化するために今回の改訂が後押しになればいいんじゃなかろうか

