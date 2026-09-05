---
title: GitHub Actions "concurrency" とは
pubDate: '2026-09-06'
description: GitHubとGitlabのCIのキャンセル処理についてまとめた
author: RiiiM
tags: [Tech,CI/CD]
---
## CI安定化

最近、RowicyのCIを少し安定させるための修正を行った

[https://github.com/rowicy/web/pull/191](https://github.com/rowicy/web/pull/191)

pnpmのバージョンを固定し、pnpm installを`--frozen-lockfile`するのが目的

付加的に、concurrencyを追加した

```yaml
# .github/workflows/test.yml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
...
```

concurrencyとはなんだろか

## concurrencyとは

GitHub Actionsでは、同じブランチへの複数pushするとCIインスタンスはその度に起動し、各々のタイミングで開始し完了まで走る

しかしlintやテストは最新コミットのCI結果を見れば十分で
古いJobを完了まで走らせるよりはキャンセルしちゃったほうがいい

```
Job ───────×
            ↑
            │
            │
Job         ▶ ─────────────────────
```

これにはconcurrencyキーが使える

```yaml
concurrency:
  group: test
  cancel-in-progress: true
```

## groupの指定

並行制御グループをつくる

```yaml
concurrency:
  group: hoge
```

と書けば、これがグルーピング指定

名前は何でもいい

しかしこうすると、Jobはすべてhogeグループになる
コミット先ブランチ、ワークフロー関係なく

なので変数でわける

```yaml
name: 'Test'

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

これでTestワークフローなら`Test-refs/heads/<branch>`というgroup名になり
他ブランチのCIがJobをキャンセルすることはない

## cancel-in-progress

キャンセル制御をグループと合わせて宣言

グループ内で新しいJobがきたら、今走っているJobはどうするかを宣言

`cancel-in-progress: true` 

```
Job ───────×
            ↑
            │
            │
Job         ▶ ───────────────────── ✓
```

`cancel-in-progress: false` 

```
Job ──────────────── ✓
            ↑
            │
            │
Job         ----wait--- ▶ ───────────────────── ✓
```

| 設定                          | 挙動             | ユースケース           | 例                                       |
| --------------------------- | -------------- | ---------------- | --------------------------------------- |
| `cancel-in-progress: true`  | 中断        | 最新のコミットのみ実行でいい      | - PR 毎のテスト<br>- lint / 単体テスト<br>- ビルド確認 |
| `cancel-in-progress: false` | 中断せずに、新しい実行を待機 | 途中でキャンセルされると困る | - 本番デプロイ<br>- データ移行ジョブ<br>- 夜間バッチ処理     |



## 待機は1件のみ

`cancel-in-progress: false`のとき
待機できるのは最新の1件のみ

ここで`queue: max`つけると最大100件まで待機させられる

```yaml
concurrency:
  group: deploy
  cancel-in-progress: false
  queue: max
```

今回は必要がなかったのでつけてない

## WorkflowにもJobにも設定できる

GitHub ActionsではWorkflowにJobが含まれる

```txt "Workflow" "<job_name>"
Workflow
└── jobs
    └── <job_name>
        ├── runs-on
        └── steps
```

並行制御のグルーピングはWorkflow単位とJob単位でできる
`concurrency`の階層を変えるだけ

- Workflow

```yaml
name: 'Test'

concurrency:
  group: hoge
  cancel-in-progress: true

jobs:
    ...
```

- Job

```yaml
name: 'Test'
...

jobs:
  test:
    concurrency:
      group: hoge
      cancel-in-progress: true
```

## GitLab CI

GitLab CIにも同様のキャンセル機能があるが少し制御が異なる

```yaml "interruptible: true" "on_new_commit: interruptible"
# .gitlab-ci.yml
workflow:
  auto_cancel:
    on_new_commit: interruptible #キャンセル判断をワークフローで指定

stages:
  - test

unit_test:
  interruptible: true # 割り込みOK
  stage: test
  script:
    - npm run test

integration_test:
  interruptible: true # 割り込みOK
  stage: test
  script:
    - npm run test:e2e
```

Githubとちがい、ワークフローレベルでワークフローのキャンセル判断を指定
Job側でキャンセル可否を宣言する

キャンセル判断とは`on_new_commit`の値だが以下が指定できる


| 設定値           | 動作                          | 主なユースケース       |
| ------------- | --------------------------- | -------------- |
| interruptible | 割り込み可能OKと言ってるJobあったらキャンセルして | テストやビルドは途中で止める |
| conservative  | 割り込み可能NGのJobあったら最後まで完了させて   | 不整合を極力避けたい     |
| none          | キャンセル判断なし                   | 無設定と同じ         |


これに対してJob側で`interruptible`を指定
キャンセルされて構わないかどうかを指示する

ここで`conservative`を指定するとGitHubの `cancel-in-progress: false` のように待機列に入るかというとそうではない
Jobはキャンセルされず完了まで各々走るだけ
`on_new_commit`の指示に待機列は関係ない

### resource_group

Jobの同時実行数制御は`resource_group`で行う

```yaml
deploy_production:
  stage: deploy
  script:
    - ./deploy.sh
  resource_group: production
```

resource_groupが同じJobは直列に実行される
deploy_productionジョブが複数発生しても順番に実行される

Githubは並行制御用グルーピングだったが、Gitlabは直列実行用グルーピングであることに注意
キューと同等

### GithubとGitlabのJob制御の違い

GitHubとGitLabでは並行制御とグルーピングの考え方が違う

GitHubは**Workflow, Job単位でグルーピング、そこでキャンセルか、直列実行**

GitLabは**Workflowでキャンセル判断を示すがキャンセルの意思表示はJob側で** 直列実行はまた別でJob側でグルーピング指定


こんな感じに分けられる


