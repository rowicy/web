---
title: push後にコミットメッセージを変更する
description: push後にコミットメッセージを変更する方法をご紹介します。
author: Naoki
tags: [Tech]
pubDate: '2024-11-23'
---

## コマンド

### 何個前のコミットを編集するか指定

```bash
git rebase -i HEAD~2
```

### 変更対象のコミットの「pick」→「edit」に変更

「i」を押下してINSERTモードに変更し、

![INSERTに変更](/images/blog/update-commit-message/01.png)

```diff
- pick b3ca748 ✨ feat(#120): 記事作成
+ edit b3ca748 ✨ feat(#120): 記事作成
```

![editに変更](/images/blog/update-commit-message/02.png)

「esc」→「:wq」で保存して閉じます。

### コミットを編集する

```bash
git commit --amend
```

前の手順と同様に、「i」を押下してINSERTモードに変更し、コミットメッセージを変更します。

![コミットメッセージ変更](/images/blog/update-commit-message/03.png)

上記では

```diff
- ✨ feat(#120): 記事作成
+ ✨ feat(#120): コミットメッセージ変更方法記事作成
```

に変更しています。  
変更が完了したら「esc」→「:wq」で保存して閉じます。

### pushする

```bash
git push --force-with-lease origin {branchname}
```

**※`{branchname}` は置き換えてください**

リモート側のコミットメッセージが変更されていればOKです！

#### 変更前

![コミットメッセージ変更前](/images/blog/update-commit-message/04.png)

#### 変更後

![コミットメッセージ変更後](/images/blog/update-commit-message/05.png)
