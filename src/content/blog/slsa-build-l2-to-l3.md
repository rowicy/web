---
title: SLSA Build L2からL3へ
pubDate: '2026-11-10'
description: actions/attestのSLSA Build L2から再利用ワークフローでのL3強化と検証について
author: RiiiM
tags: [Tech, Security, CI/CD]
---

前回はGitHub Releaseのバイナリ差し替えに備えて
actions/attestでSLSA provenanceを作り`gh attestation verify`で検証するところまでやった

https://www.rowicy.com/blog/verify-release-binary

SLSA provenanceでの課題はビルドステップまで侵害されたら正規のattestationが出てしまう、これの対策はあるだろうか

## SLSA Buildレベルをあげる

SLSAでは成果物の成熟度モデルとして
Build trackがある

| レベル | 要件 | 防ぐもの |
| --- | --- | --- |
| Build L0 | なし | なし |
| Build L1 | ビルド方法を示すprovenanceがある | ビルドミス|
| Build L2 | ホストされたビルド基盤がprovenanceを生成・署名 | ビルド後の改ざん |
| Build L3 | 堅牢化されたビルド基盤 | ビルド中の改ざん |

L3でビルド基盤に求められるのは2つ

- ワークフローが影響し合わないようにする
- provenanceの署名に使う秘密情報に、ビルドステップから触れないようにする

### GitHub actions/attestのレベルは？

artifact attestation単体ではSLSA v1.0のL2に該当

前回のワークフローはビルド基盤のランナーからprovenanceを生成・署名していた

```yaml
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

`id-token: write`の権限はjobの全ステップに及ぶため、
侵害されると同じjobのOIDCトークンで署名されうる

これをBuild track L3にするには、分離をする

GitHub Actionsで実践するなら以下

1. ビルドとattestを再利用ワークフローに移す
2. 呼び出し側ワークフローで必要権限とともに呼び出し


### 再利用ワークフロー

```yaml "build:" "attest:" {29-32,52-57}
# .github/workflows/reusable-build.yml

name: reusable-build

on:
  workflow_call:

permissions:
  contents: read

jobs:
  build:
    runs-on: ubuntu-latest
    permissions:
      contents: read # id-token: writeを持たせない
    outputs:
      digest: ${{ steps.hash.outputs.digest }}

    steps:
      - uses: actions/checkout@<sha>
        with:
          persist-credentials: false

      - uses: actions/setup-go@<sha>
        with:
          go-version: '1.24'
          cache: false # 信頼できないワークフローのキャッシュを読まないようにキャッシュを切る

      - name: Build
        run: |
          mkdir -p dist
          go build -o dist/slsa-workshop main.go

      - name: Digest
        id: hash
        run: echo "digest=sha256:$(sha256sum dist/slsa-workshop | cut -d' ' -f1)" >> "$GITHUB_OUTPUT"

      - name: Upload binary
        uses: actions/upload-artifact@<sha>
        with:
          name: slsa-workshop
          path: dist/slsa-workshop

  attest:
    needs: build
    runs-on: ubuntu-latest
    permissions:
      id-token: write
      attestations: write
      artifact-metadata: write

    steps:
      - name: Generate provenance
        uses: actions/attest@<sha>
        with:
          subject-name: slsa-workshop
          subject-digest: ${{ needs.build.outputs.digest }}
```

再利用ワークフローの中の`github`コンテキストは呼び出し側のものになる

### 呼び出しワークフロー

前回のbuild.ymlは呼び出すだけのワークフローになる

```yml
# .github/workflows/build.yml
name: build-and-attest

# 省略
permissions:
  contents: read

jobs:
  build:
    permissions:
      contents: read
      id-token: write
      attestations: write
      artifact-metadata: write
    uses: ./.github/workflows/reusable-build.yml
```

再利用ワークフローは、呼び出し側が渡した以上の権限を持てないので呼び出し側のjobにも`id-token: write`などが要る

これで分離はできた
しかし、L3が防ぐのは署名鍵の盗難とprovenanceの偽造で、ワークフロー定義を書き換えられる場合には耐えない
侵害されたビルドが悪意あるバイナリを正しくハッシュし、それに正規のprovenanceを出すことまでは防げない

そこまで防ぐなら再利用ワークフローを別リポジトリに置くなどの工夫が考えられる

## 利用側の検証ポリシーを締める

前回の検証コマンドをもう一度

```zsh
% gh attestation verify ./slsa-workshop --repo riiimparm/slsa-test
...
- Subject Alternative Name must match regex: (?i)^https://github\.com/riiimparm/slsa-test/
```

バイナリ生成元のリポジトリだけ指定しているが、
これはデフォルトではSANはリポジトリ内ワークフローなら何でも通る

攻撃者がリポジトリに`evil.yml`を足して適当なブランチで動かしても通る

SANを厳格にするオプションがあるのでそれで検証を強めるほうがいいかもしれない

| フラグ                          | 照合先                                        |
| ---------------------------- | ------------------------------------------ |
| `--signer-workflow`          | 署名したワークフロー(SAN)`[host/]<owner>/<repo>/<path>`で指定 |
| `--signer-repo`              | 署名したワークフローのリポジトリ                           |
| `--signer-digest`            | 署名したワークフローのコミット(Build Signer Digest)       |
| `--source-ref`               | ビルド元のgit ref(Source Repository Ref)        |
| `--source-digest`            | ビルド元のコミット(Source Repository Digest)        |
| `--deny-self-hosted-runners` | self-hosted runnerで作られたものを拒否               |
| `--cert-identity`            | SANの完全一致                                   |

再利用ワークフローで署名した場合、`--signer-workflow`か`--signer-repo`を使うのがよさそう

以下で「slsa-testのv0.2.0タグから、reusable-build.ymlがGitHubホストのrunnerでビルド・署名したもの」だけが通る

```zsh
% gh attestation verify ./slsa-workshop \
  --repo riiimparm/slsa-test \
  --signer-workflow riiimparm/slsa-test/.github/workflows/reusable-build.yml \
  --source-ref refs/tags/v0.2.0 \
  --deny-self-hosted-runners
The following policy criteria will be enforced:
- Predicate type must match:..................... https://slsa.dev/provenance/v1
- Source Repository Owner URI must match:........ https://github.com/riiimparm
- Source Repository URI must match:.............. https://github.com/riiimparm/slsa-test
- Source repo ref must match:.................... refs/tags/v0.2.0
- Subject Alternative Name must match regex:..... ^https://github.com/riiimparm/slsa-test/.github/workflows/reusable-build.yml
- OIDC Issuer must match:........................ https://token.actions.githubusercontent.com
- Action workflow Runner Environment must match : github-hosted

✓ Verification succeeded!
```


## 再利用ワークフローを別リポジトリに置く

ワークフロー定義の書き換え耐性として、再利用ワークフローを別リポジトリに移す案がある

```yaml
# .github/workflows/build.yml
jobs:
  build:
    permissions:
      contents: read
      id-token: write
      attestations: write
      artifact-metadata: write
    uses: <別リポジトリ>/.github/workflows/go-build.yml@<コミットSHA>
```

しかしこのリポジトリ管理も増える
ここで外部ビルダー(slsa-github-generator)を呼ぶ方法もあるが、現状推奨されていない
slsa-github-generatorは積極的にはメンテナンスされておらず、GitHub artifact attestationsへ移行するよう案内されている

## 今できること

現実的な範囲ではここらへん

- ビルドと署名のjobを分離する（署名権限をビルドステップから外す）
- 再利用ワークフローを別リポジトリに置く（定義の書き換えを少し難しくする）
- 検証時に `--signer-workflow` で署名したワークフローを固定する

