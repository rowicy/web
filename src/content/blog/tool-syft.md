---
title: Syftでコンテナの中身を把握する
pubDate: '2026-11-16'
description: DockerイメージをSyftでスキャンしてcyclonedx-jsonのSBOMを出し、Grypeにパイプして脆弱性まで確認する流れ
author: RiiiM
tags:
  - Tech
  - Security
  - Tool
---

https://github.com/anchore/syft

SyftというSBOM生成特化のツールを紹介
Trivyを使うことが多いだろうが、ツールのサイズとしてはこちらが軽量

Dockerでイメージをスキャンして、SBOMを出し、Grypeで脆弱性まで見る流れ

Anchoreは、ソフトウェアサプライチェーンセキュリティ、脆弱性管理対応に特化した米国企業

https://anchore.com/security/

## コンテナのSBOMをどう出すか

Dockerデーモンが動いていれば、イメージ名を渡すだけでスキャンできる

```zsh
% docker run --rm anchore/syft alpine:latest
Status: Downloaded newer image for anchore/syft:latest
NAME                    VERSION      TYPE  
alpine-baselayout       3.7.2-r1     apk   
alpine-baselayout-data  3.7.2-r1     apk   
alpine-keys             2.6-r0       apk   
alpine-release          3.24.4-r0    apk   
apk-tools               3.0.9-r0     apk   
busybox                 1.37.0-r31   apk   
busybox-binsh           1.37.0-r31   apk   
ca-certificates-bundle  20261020-r0  apk   
libapk                  3.0.9-r0     apk   
libcrypto3              3.5.9-r0     apk   
libssl3                 3.5.9-r0     apk   
musl                    1.2.6-r3     apk   
musl-utils              1.2.6-r3     apk   
scanelf                 1.3.9-r1     apk   
ssl_client              1.37.0-r31   apk   
zlib                    1.3.2-r1     apk
```

パッケージ一覧がテーブルで出る
Alpineのapkパッケージが並ぶ

結構少ない

イメージはsyftコンテナ内からregistryを見てpullされる
ホストのDockerデーモンにあるイメージを見るならソケットをマウントする

```zsh
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock anchore/syft alpine:latest
```

## 形式

sbom形式では以下に対応

- `syft-json` : 情報量が一番多い
- `cyclonedx-json` : CycloneDX, 他のツールやプラットフォームで扱いやすい
- `spdx-json` : SPDX, コンプライアンスで求められることが多い

```zsh
docker run --rm -v "$PWD:/out" anchore/syft alpine:latest -o cyclonedx-json=/out/alpine.cdx.json
```

## 脆弱性スキャン

Anchoreは脆弱性DBとスキャンツールもOSSで提供している

https://github.com/anchore/grype

SBOMの脆弱性照合ツール

DBはこれ

https://github.com/anchore/grype-db

Syftで出したSBOMをそのままGrypeに渡せる


直接 `grype alpine:latest` でもスキャンはできるがSBOMを残しておきたいときはこの流れが使いやすい

```zsh
% docker run --rm anchore/syft alpine:latest -o cyclonedx-json \
  | docker run --rm -i anchore/grype
NAME           INSTALLED   FIXED IN  TYPE  VULNERABILITY   SEVERITY  EPSS         RISK  
zlib           1.3.2-r1    1.4-r0    apk   CVE-2026-4738   Critical  0.3% (19th)  0.2   
busybox        1.37.0-r31            apk   CVE-2025-60876  Medium    0.3% (24th)  0.2   
busybox-binsh  1.37.0-r31            apk   CVE-2025-60876  Medium    0.3% (24th)  0.2   
ssl_client     1.37.0-r31            apk   CVE-2025-60876  Medium    0.3% (24th)  0.2
```


