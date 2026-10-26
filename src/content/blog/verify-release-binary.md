---
title: GitHub Releaseの不正差し替えに備える検証入門
pubDate: '2026-10-25'
description: リリースバイナリが差し替えられても気づけるか。ダイジェスト検証、GPG・Cosign署名、attestationによる来歴検証までを整理
author: RiiiM
tags: [Tech, Security, CI/CD]
---



GitHub Releaseや公式サイトから落ちてくるバイナリは、無条件に信頼しがち

ただリリースタグが正しくても、中身のバイナリが差し替えられている可能性も否定できない

最近ではリポジトリソースやワークフローが侵害されなくてもリリースバイナリを直接スワップされた報告もある

https://www.stepsecurity.io/blog/ovhcloud-cli-github-release-swap-glassworm


## ダイジェスト検証

初歩的な防御は、ダウンロードしたバイナリのダイジェストを配布元と照合

```zsh
# ビルド側がダイジェスト生成
% sha256sum app > checksums.txt
% cat checksums.txt
17643e9dfd020fcd61d1502e713788767bb58f86cedda27a1d483a223a32af35  app

# ダウンロード側が検証
% sha256sum -c checksums.txt 
```

しかしバイナリとダイジェストをセットで配布するだけでは、
バイナリと一緒にダイジェストが差し替えられる可能性がある

これを回避するには

- checksums.txt自体に署名し、公開鍵で検証させる
もしくは
- checksums.txtを別の信頼ストアに置く

いずれもバイナリのダイジェストを配信経路と隔離させるのが根本的対策

これを使う側(CIやユーザ)が検証をしてくれるかは別問題

## 署名

署名する方式

リリースでは以下ファイルを配る

```
checksums.txt        # バイナリ
checksums.txt.asc (or .sig)    # 分離署名
```

GPGツールが使える

開発側ではGPGキーを`gpg --full-generate-key`で作成後、リリースバイナリの署名を生成

```zsh
% gpg --detach-sign --armor checksums.txt
# checksums.txt.asc ができる
```

署名に使った公開鍵は配信経路を分けるためキーサーバー(`hkps://keys.openpgp.org`,`hkps://keyserver.ubuntu.com`)に置く
公開鍵のフィンガープリントを公式サイトの別ページ、開発者のプロフィールなど利用者が分かる場所に置く

利用者側での検証

```zsh "Good signature from"
# キーインポート
% gpg --keyserver hkps://keys.openpgp.org --recv-keys 178A19E8CF54D2B8785EBF7CD090DF3D23DC0ED6

% gpg --verify  checksums.txt.asc 
gpg: assuming signed data in 'checksums.txt'
gpg: Signature made Mon Oct 26 02:50:34 2026 JST
gpg:                using RSA key 178A19E8CF54D2B8785EBF7CD090DF3D23DC0ED6
gpg: Good signature from "hoge <riiimparm@catgroup.uk>" [unknown]
gpg: WARNING: This key is not certified with a trusted signature!
gpg:          There is no indication that the signature belongs to the owner.
Primary key fingerprint: 178A 19E8 CF54 D2B8 785E  BF7C D090 DF3D 23DC 0ED6
```

改ざんがあると"Good signature"が"BAD signature"になる

## Cosign

SigstoreというオープンソースプロジェクトのCLIがCosign

GPGは長期の鍵ペアと公開鍵配布だが
Cosignはこの管理がない

```zsh
% cosign sign-blob \
  --yes \
  --bundle app.sigstore.json \
  app
```

これでダイジェストに署名が行われる

鍵を長期保管せずに署名したら捨てるのだが、検証時に秘密鍵がない状態でどうするのか

1. 開発者 / GitHub ActionsがOIDCで認証
2. Cosignは一時的な鍵ペアを作成
3. CosignはSigstoreのCAにIDトークン、公開鍵を渡す
4. CAが受け取り、短命なX.509証明書を発行
5. Cosignはダイジェストに署名
6. Cosignが署名値、ダイジェスト、証明書をSigstoreのログサーバーに記録
7. Cosignは鍵ペアを破棄

一時的な鍵ペアとIDが紐づき、その鍵ペアでの署名タイミングはログサーバーに残っている
この仕組みで秘密鍵がなくても「あの時確かにあのIDがこのダイジェストに署名をした」といえる

SigstoreのCAはFulcio、ログサーバーはRekorという

| コンポーネント    | 役割                              |
| ---------- | ------------------------------- |
| **Fulcio** | 署名者のOIDC IDを検証し、短命の署名証明書を発行するCA |
| **Rekor**  | 署名イベントをログに記録する                  |

app.sigstore.jsonを検証者に渡す

```zsh
% cosign verify-blob \
  --bundle app.sigstore.json \
  --certificate-identity riiim@rowicy.com \
  --certificate-oidc-issuer https://github.com/login/oauth \
  app
Verified OK
```

GPGと根本的に違うのが
秘密鍵を長期保管しない、署名の記録を第三者が担う部分
(GPGのように自前管理もできるが)

## バイナリのメタデータ

メタデータに正規バイナリとの違いが出ることがある

Goを例に

```zsh {4,7,18}
% go version -m dist/app                                 
dist/app: go1.24.5
        path    example.com/go-vcs-test
        mod     example.com/go-vcs-test v0.0.0-20261025092218-a32cb5e50fb8+dirty
        build   -buildmode=exe
        build   -compiler=gc
        build   -ldflags="-X main.version=1.2.3"
        build   DefaultGODEBUG=asynctimerchan=1,gotestjsonbuildtext=1,gotypesalias=0,httpservecontentkeepheaders=1,multipathtcp=0,randseednop=0,rsa1024min=0,tls3des=1,tlsmlkem=0,winreadlinkvolume=0,winsymlink=0,x509keypairleaf=0,x509negativeserial=1,x509rsacrt=0,x509usepolicies=0
        build   CGO_ENABLED=1
        build   CGO_CFLAGS=
        build   CGO_CPPFLAGS=
        build   CGO_CXXFLAGS=
        build   CGO_LDFLAGS=
        build   GOARCH=arm64
        build   GOOS=darwin
        build   GOARM64=v8.0
        build   vcs=git
        build   vcs.revision=a32cb5e50fb81984382614e3a14e60bdf07ade8b
        build   vcs.time=2026-10-25T09:22:18Z
        build   vcs.modified=true
```

不正バイナリなら以下が指標になりうる

- vcs.revision がリリースタグのコミットと一致しない -> 不正コミットからビルドされている
- vcs.time がリリースタグのコミット時刻と一致しない
- vcs.modified が true -> ビルド時点で未コミットの変更があった
- mod のバージョンが+dirty -> 上に同じ
- -ldflags指定が正規と違う -> ビルド時のフラグ設定が違う
- その他`CGO_*` や `GO*` のenvが正規と違う -> 通常と異なる環境でビルドされた

(`+dirty`, `vcs.modified`は正規ビルドでも出ることはある)

攻撃者がコードリポジトリを侵害できない場合、 vcs.revision のコミットSHAはリリースタグのものとずれている事が考えられる、ここの比較は有効でもある
しかしビルド中に悪意ある変更を混ぜる可能性もあり、バイナリメタデータだけでは信頼はできない

## 成果物の作られ方を検証する

完全性だけでなく真正性も
バイナリ単体の検証から広げてバイナリ生成の来歴をたどることができる

そのバイナリが誰によって・どのワークフローで・どのコミットから作られたかを検証

これには、SLSA準拠のGitHub attestationで生成・署名する方法がある
これはリリース側CIで導入する必要がある

ワークフローにattestation(証拠)生成のjobを追加

```yaml {36-38}
# .github/workflows/build.yml

name: build-and-attest

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read

jobs:
  build:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      id-token: write
      attestations: write
      artifact-metadata: write

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-go@v5
        with:
          go-version: '1.24'

      - name: Build
        run: |
          mkdir -p dist
          go build -o dist/slsa-workshop main.go
          sha256sum dist/slsa-workshop

      - name: Generate provenance
        uses: actions/attest@v4
        with:
          subject-path: dist/slsa-workshop

      - name: Upload binary
        uses: actions/upload-artifact@v4
        with:
          name: slsa-workshop
          path: dist/slsa-workshop
```

ワークフロー内でattestationファイルが生成される
抜粋内容は以下

```json
{
  "verificationMaterial": {
    "tlogEntries": [
      {
        // 署名時刻。リリース公開時刻と整合するか
        "integratedTime": "1792916251"
      }
    ],
    "certificate": {
      // リポジトリ、ワークフロー証明
      "SAN": "https://github.com/riiimparm/slsa-test/.github/workflows/build.yml@refs/heads/main",
      "extensions": {
        "1.3.6.1.4.1.57264.1.15": "1432971462" // リポジトリID
      }
    }
  },
  "dsseEnvelope": {
    "payload": {
      "subject": [
        {
          // バイナリダイジェスト
          "digest": { "sha256": "980b696cacb87f74cf3fa93731607cb2d5acebd530635ea296e5a27ba86d70e3" }
        }
      ],
      "predicate": {
        "buildDefinition": {
          "resolvedDependencies": [
            {
              // コミットSHA
              "digest": { "gitCommit": "a97744f8f410d031339d72c075b725c6a15851be" }
            }
          ]
        },
        "runDetails": {
          "metadata": {
            // Actionログ
            "invocationId": "https://github.com/riiimparm/slsa-test/actions/runs/40176019483/attempts/1"
          }
        }
      }
    }
  }
}
```

attestationファイルはGitHubのストアに保存される

検証したい手元のバイナリからダイジェストを出し、
リポジトリにattestationファイルがあるか当たることができる

当たればその内容から来歴の調査ができ、
信頼できるCI/CDからのリリースを通ったことを調査できる

```zsh
% gh attestation verify ./slsa-workshop --repo riiimparm/slsa-test
Loaded digest sha256:980b696cacb87f74cf3fa93731607cb2d5acebd530635ea296e5a27ba86d70e3 for file://slsa-test
Loaded 1 attestation from GitHub API

The following policy criteria will be enforced:
- Predicate type must match:................ https://slsa.dev/provenance/v1
- Source Repository Owner URI must match:... https://github.com/riiimparm
- Source Repository URI must match:......... https://github.com/riiimparm/slsa-test
- Subject Alternative Name must match regex: (?i)^https://github\.com/riiimparm/slsa-test/
- OIDC Issuer must match:................... https://token.actions.githubusercontent.com

✓ Verification succeeded!

The following 1 attestation matched the policy criteria

- Attestation #1
  - Build repo:..... riiimparm/slsa-test
  - Build workflow:. .github/workflows/build.yml@refs/heads/main
  - Signer repo:.... riiimparm/slsa-test
  - Signer workflow: .github/workflows/build.yml@refs/heads/main

```

ログを見るとビルド元と署名元のリポジトリ、ワークフローが検証されている
コマンドオプションで検証をゆるくしたり厳しくもできる

このように検証時に手元ファイルがリポジトリと検証で結びつくと正規のワークフロー由来だと確認できる

しかし、ワークフローまで侵害された場合はこのattestationも正規発行されてしまう
もちろんこの場合、侵害範囲が広がっているため範囲外でまたの別の検証方法が必要になる

## 一番大事:CI/CD・配布側でリリースアセットを不変にする

利用者検証からはなれて根本的な解決

それはリリースの上書きをリポジトリ設定で防ぐこと

今回のような差し替えは、公開済みのリリースのファイルを上げ直せることが前提

GitHubのImmutable releasesを有効にすると、公開後のアセットの変更ができなくなる

署名やattestationは利用者が検証してはじめて効くが、
不変性は検証しない利用者もまとめて守れる

設定だけで済むので、導入コストも低い

有効化したあとに公開するリリースが対象になるためそこは注意

不変リリースにはファイルを記録したリリースattestationが付く
利用者は`gh release verify-asset <tag> <binary> <repo>`で照合できる

```zsh
% gh release verify-asset v0.1.0 slsa-workshop --repo riiimparm/slsa-test
Calculated digest for slsa-workshop: sha256:5b1476d571704d855eeabad34cbcfc2fc95573c0e4f18836c299b497dae7b94e
Resolved tag v0.1.0 to sha1:a97744f8f410d031339d72c075b725c6a15851be
Loaded attestation from GitHub API

✓ Verification succeeded! slsa-workshop is present in release v0.1.0
```

## 二次配布経路

Homebrew tapのformula/caskに書く `sha256` は、後から差し替えられたファイルを弾く

GoReleaserなどのリリースツールを使っていれば、ビルド時点のハッシュが自動でtapに反映される


