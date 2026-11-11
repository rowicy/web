---
title: GitHub Releaseの不正差し替えに備える検証 ~ SLSA Build Track ~
pubDate: '2026-11-10'
description: actions/attestのSLSA Build L2から再利用ワークフローでのL3強化と検証について
author: RiiiM
tags:
  - Tech
  - Security
  - CI/CD
---

前回はGitHub Releaseのバイナリ差し替えに備えて
actions/attestでSLSA provenanceを作り`gh attestation verify`で検証するところまでやった

https://www.rowicy.com/blog/verify-release-binary

SLSAはソースコード、コンテナイメージ、ファームウェア、ファイル、ディレクトリなど、改変されない成果物全般の成果過程を証明する仕組み

SLSAの成果物をAttestasion(署名付きの主張)と呼ぶ
これには成果物の来歴情報がつく

この来歴証明をProvenanceと呼ぶ

リリースバイナリで言うとビルドのワークフロー、コミットSHAなどが情報として入り、ワークフローがこれに署名する

これを利用者側で検証するときにProvenanceの照合がずれたら不正リリースを疑うことができる

## Build track

SLSAには成果物の成熟度モデルがある

いまでいうリリースバイナリの生成ステップ

Build trackとよばれる

| レベル      | 要件                                | 防ぐもの           |
| -------- | --------------------------------- | -------------- |
| Build L0 | なし                                | なし             |
| Build L1 | Provenanceがある                     | ビルド来歴の不透明さ     |
| Build L2 | Provenanceがあり<br>ビルド基盤がそれを生成・署名する | Provenanceの改ざん |
| Build L3 | Provenanceがあり<br>ビルド基盤を堅牢化している    | ビルドの干渉         |

L3での堅牢化は具体的に以下

- ビルド間の隔離。並行・過去の別ビルドから影響を受けないこと
- provenanceの署名に使う秘密情報に、ビルドステップから触れないようにすること

## Build Level上げ

前回のワークフローは同一jobからprovenanceを生成・署名していた

```yaml "id-token: write" "steps" 
# .github/workflows/build.yml (前回)

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
	- uses: actions/checkout@<sha>
	- uses: actions/setup-go@<sha>
	  with:
		 go-version: '1.24'
	- name: Build
	  run: |
		 mkdir -p dist
		 go build -o dist/slsa-workshop main.go
	- name: Generate provenance
	  uses: actions/attest@<sha>
	  with:
		 subject-path: dist/slsa-workshop
```

`id-token: write`の権限は全ステップに及ぶ
そのためトークン盗取が署名の偽造につながる

これの対策としてBuildとGenerate provenanceをjob分離する

### job分離

わけてみた

```yml {13,31} "id-token: write"
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
    steps:
      - uses: actions/checkout@<sha>
      - uses: actions/setup-go@<sha>
        with:
          go-version: '1.24'
          cache: false # 自動キャッシュをクリア
      - name: Build
        run: |
          mkdir -p dist
          go build -o dist/slsa-workshop main.go
      - uses: actions/upload-artifact@<sha>
        with:
          name: dist
          path: dist/slsa-workshop

  attest:
    needs: build
    runs-on: ubuntu-latest
    permissions:
      id-token: write
      attestations: write
      artifact-metadata: write
    steps:
      - uses: actions/download-artifact@<sha>
        with:
          name: dist
          path: dist
      - name: Generate provenance
        uses: actions/attest@<sha>
        with:
          subject-path: dist/slsa-workshop
```

`id-token: write` を署名側だけに付与しており、権限もスコープを絞る

### 切り出し

当たり前だが今のワークフロー内を書き換えればビルドステップも書き換わる

`go build -o dist/slsa-workshop main.go`にパラメータを好きに追加でき、ビルドに関わる環境変数も入れ放題、チェックアウトして別コミットのビルドもできる

build jobが侵害されたらそのまま署名まで通る
attestはそれを防がない

ここでbuild と attestだけ取ったワークフローを別リポジトリの再利用可能なワークフローに切り出し、管理を分ける

```yml
# <別リポジトリ>/.github/workflows/build.yml
name: build-and-attest

on:
  workflow_call:

(...先程同様の内容...)

jobs:
  build:
    runs-on: ubuntu-latest
    (...)

  attest:
    needs: build
    (...)
```

元のワークフローはそれを呼ぶだけにする

```yaml {8}
jobs:
  build:
    permissions:
      contents: read
      id-token: write
      attestations: write
      artifact-metadata: write
    uses: <別リポジトリ>/.github/workflows/build.yml@<sha>
```

buildに不要な`id-token`や`attestations: write`を呼び出し側で付与しているが、
再利用ワークフローのbuild job内でもpermissionsを定義していなければ使えないので、呼び出し元でまとめて権限を付与してok

再利用ワークフローの利点として再利用性もだが、
呼び出し先で定義した変数経由でしかビルドに介入できないことがあげれる

ここまできてL3といえる

## 利用側の検証ポリシー

別リポジトリの再利用ワークフローに切り出したバイナリを検証してみる

前回のコマンドを打ってみる

```zsh {9,12}
% gh attestation verify ./slsa-workshop --repo riiimparm/slsa-test
Loaded digest sha256:2701e4f26f820d52d3335d3aaa9f097f7945bdfa2c844a9cd6a4ccc25f4cee88 for file://slsa-workshop
Loaded 1 attestation from GitHub API

The following policy criteria will be enforced:
- Predicate type must match:................ https://slsa.dev/provenance/v1
- Source Repository Owner URI must match:... https://github.com/riiimparm
- Source Repository URI must match:......... https://github.com/riiimparm/slsa-test
- Subject Alternative Name must match regex: (?i)^https://github\.com/riiimparm/slsa-test/
- OIDC Issuer must match:................... https://token.actions.githubusercontent.com

✗ Sigstore verification failed
```

失敗した

SANが別リポジトリワークフローになったからだ

--repoの指定だけだとそのリポジトリのワークフローを探してしまう

SANを指定するオプションがあるのでそちらを足して検証する

| フラグ                          | 照合先                                              |
| ---------------------------- | ------------------------------------------------ |
| `--signer-workflow`          | 署名したワークフロー(SAN)`[host/]<owner>/<repo>/<path>`で指定 |
| `--signer-repo`              | 署名したワークフローのリポジトリ                                 |
| `--signer-digest`            | 署名したワークフローのコミット(Build Signer Digest)             |
| `--cert-identity`            | SANの完全一致                                         |

> [!note] また、同リポジトリに再利用ワークフローを置く場合、これらをつけなくてもSANの検証は通るが、SAN値に入るワークフローrefの前方一致しか見ない
>(上にもある通り`Subject Alternative Name must match regex: (?i)^https://github\.com/riiimparm/slsa-test/` )
> そのため攻撃者がリポジトリに`evil.yml`を差し込み、そこから署名しても検証が通る

再利用ワークフローで署名した場合、`--signer-workflow`か`--signer-repo`を使うのがよさそう

```zsh "riiimparm/slsa-test-reusable" {16}
%  gh attestation verify ./slsa-workshop \                         
  --repo riiimparm/slsa-test \
  --signer-repo riiimparm/slsa-test-reusable \
  --source-ref refs/tags/v0.3.2
Loaded digest sha256:2701e4f26f820d52d3335d3aaa9f097f7945bdfa2c844a9cd6a4ccc25f4cee88 for file://slsa-workshop
Loaded 1 attestation from GitHub API

The following policy criteria will be enforced:
- Predicate type must match:................ https://slsa.dev/provenance/v1
- Source Repository Owner URI must match:... https://github.com/riiimparm
- Source Repository URI must match:......... https://github.com/riiimparm/slsa-test
- Source repo ref must match:............... refs/tags/v0.3.2
- Subject Alternative Name must match regex: (?i)^https://github\.com/riiimparm/slsa-test-reusable/
- OIDC Issuer must match:................... https://token.actions.githubusercontent.com

✓ Verification succeeded!

The following 1 attestation matched the policy criteria

- Attestation #1
  - Build repo:..... riiimparm/slsa-test
  - Build workflow:. .github/workflows/build.yml@refs/tags/v0.3.2
  - Signer repo:.... riiimparm/slsa-test-reusable
  - Signer workflow: .github/workflows/reusable-build.yml@fce2a39b6a6ec8975652c6b991ce717db34c4cdc
```

## 外部ビルダー

別リポジトリだと管理が増える
信頼できるビルド先として外部ビルダー(slsa-github-generator)のワークフロー呼ぶ方法もあるが、現状推奨されていない
slsa-github-generatorは積極的にはメンテナンスされておらず、GitHub artifact attestationsへ移行するよう案内されている

## 今できること

現実的な範囲ではここらへん

- ビルドと署名のjobを分離する（署名権限をビルドステップから外す）
- 再利用ワークフローを別リポジトリに置く（定義の書き換えを少し難しくする）
- 検証時に `--signer-workflow`か`--signer-repo`