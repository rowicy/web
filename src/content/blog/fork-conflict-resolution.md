---
title: フォークリポジトリのコンフリクト解消
description: フォークリポジトリのコンフリクト解消方法をご紹介します。
author: Naoki
tags: [Tech]
pubDate: '2025-01-19'
---

https://github.com/vitejs/awesome-vite/pull/991

上記のようなOSSのフォークリポジトリからのプルリクエスト作成時のコンフリクト解消方法を備忘録として残します。

## 前提

- フォークリポジトリで作業している
- masterブランチで作業している(別ブランチで作業している場合は、適宜コマンドを読み替えてください)

## 手順

### (紐づいているリモートリポジトリの確認)

フォークしたリモートリポジトリのみが追加されている。

```bash
git remote -v
origin  git@github.com:{user_name}/{repository_name}.git (fetch)
origin  git@github.com:{user_name}/{repository_name}.git (push)
```

### フォーク元を upstream として追加

```bash
git remote add upstream https://github.com/{organization_name}/{repository_name}.git
```

### (紐づいているリモートリポジトリの確認 2)

フォーク元のリモートリポジトリが追加されている。

```bash
git remote -v
origin  git@github.com:{user_name}/{repository_name}.git (fetch)
origin  git@github.com:{user_name}/{repository_name}.git (push)
upstream        https://github.com/{organization_name}/{repository_name}.git (fetch)
upstream        https://github.com/{organization_name}/{repository_name}.git (push)
```

### ローカルブランチに最新の変更を取り込む

```bash
git merge upstream/master
git push origin master
```
