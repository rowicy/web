---
title: Nmapで自動脆弱性スキャンを組んでみた
pubDate: '2025-01-29'
description: vulners.nseを利用した脆弱性スキャン、systemdでの自動実行手順を紹介します。
author: RiiiM
tags: [Tech, Nmap, Security]
---

# Nmapで自動脆弱性スキャンを組んでみた

## 🚀 はじめに

`nmap` はネットワークスキャンツールとして有名ですが、Nmap Scripting Engine (NSE) を活用することで、脆弱性の診断もできます。

今回は、`vulners.nse` を利用した脆弱性スキャンの方法、さらにこれを用いた **定期実行** の設定までを紹介します！

📖 **読む時間:** 約 8〜10 分  
🛠 **実装時間:** 約 15〜20 分

---

[![GitHub - vulnersCom/nmap-vulners](https://opengraph.githubassets.com/0a70712b9edf7a397812dd8d8ccf02de51211d0d2d63fc924fc9f8f5eac9f9b5/vulnersCom/nmap-vulners)](https://github.com/vulnersCom/nmap-vulners)

## 1. 🤖 Vulners.nse とは？

`vulners.nse` は、Nmap のスクリプトのひとつで、[Vulners](https://vulners.com/) のデータベースと連携してターゲットの脆弱性を検出します。

###  特徴
- `-sV` オプションで取得したサービスバージョン情報を元に、脆弱性を検索
- `CVE` 番号とともに脆弱性を一覧表示
- Nmap 公式スクリプトとして簡単に利用可能

---

## 2. 🔧 Vulners.nse のインストールと準備

### 2.1 Nmap のインストール

まず、Nmap がインストールされていることを確認します。

```sh
nmap --version
```

インストールされていない場合は、以下のコマンドでインストールできます。

```sh
# Debian/Ubuntu
sudo apt install nmap

# RHEL/CentOS
sudo yum install nmap

# macOS
brew install nmap
```

### 2.2 Vulners.nse の確認

Nmap には `vulners.nse` が標準で含まれています。以下のコマンドで確認できます。

```sh
ls /usr/share/nmap/scripts/vulners.nse
```

もし `vulners.nse` がない場合は、手動でダウンロードしてスクリプトデータベースを更新します。

```sh
cd /usr/share/nmap/scripts/
wget https://svn.nmap.org/nmap/scripts/vulners.nse
sudo nmap --script-updatedb
```

---

## 3. 🏹 Vulners.nse の使用方法

### 3.1 基本的なスキャン

以下のコマンドで `vulners.nse` を利用したスキャンを実行できます。

```sh
nmap --script vulners -sV <ターゲットIP>
```

#### 📝 出力例

```
PORT   STATE SERVICE VERSION
80/tcp open  http    Apache httpd 2.4.49
| vulners:
|   CVE-2021-41773  7.5  https://vulners.com/cve/CVE-2021-41773
|   CVE-2021-42013  7.5  https://vulners.com/cve/CVE-2021-42013
```

ポート80番にApacheサービスを検知してますねー。

この結果から、対象の `Apache httpd 2.4.49` が `CVE-2021-41773` などの脆弱性を持っている可能性があります。

ただ、ここで注意なのが、 **脆弱性が報告されたライブラリが最新版と同じバージョン数値でなくても、OSコミュニティでパッチが当てられているかもしれない** ということです。

例えば `apt info apache2` から現在(2025/1/29)のUbuntuのaptでは `2.4.52-1ubuntu4.13` にアップデートされますが、公式のバージョンでは `2.4.62` がリリースされています。

```
$ apt info apache2
Package: apache2
Version: 2.4.52-1ubuntu4.13 
...
```

より数字の大きい `2.4.62` にアップデートしなければと思っても、報告されている脆弱性対策に必要なパッチはすでにあたっている可能性があります。


### 3.2 🎯 詳細なスキャン (スコア付き)

CVE の脆弱性スコアを含めて詳細な情報を取得するには、以下のコマンドを使用します。

```sh
nmap --script vulners --script-args mincvss=5.0 -sV <ターゲットIP>
```

このオプションにより、CVSS スコアが `5.0` 以上の脆弱性のみを表示できます。

---

## 4. 🔐 セキュリティ対策

### 4.1 🛠️ アップデートの適用

スキャンで検出された脆弱性の情報をもとに、
- ソフトウェアのアップデート
- パッチ適用
- 設定の見直し

を行いましょう！

### 4.2 🚧 ファイアウォールとアクセス制御

- 不要なポートを閉じる
- 不審な IP アドレスをブロックする
- IDS/IPS の導入を検討する

---

## 5. 🕰️ 定期実行の設定

定期的にスキャンを実行するようにスクリプトを組んでみました。

### 5.1 スクリプト作成

以下のスクリプトを `/usr/local/bin/nmap_vulners_scan.sh` として作成します。

まず `/path/to/ip_list.txt` にスキャン対象IPもしくはドメインが複数書かれたテキストを用意します。

```sh
#!/bin/bash

IP_LIST="/path/to/ip_list.txt"  # Path to the file containing IP addresses
LOGFILE="/var/log/nmap_vulners.log"

if [[ ! -f "$IP_LIST" ]]; then
    echo "Error: IP list file not found: $IP_LIST"
    exit 1
fi

echo "Starting Nmap vulnerability scan ($(date))"
echo "--------------------------------------" >> "$LOGFILE"
echo "Scan Date: $(date)" >> "$LOGFILE"

TOTAL_IPS=$(wc -l < "$IP_LIST")
COUNT=0

while read -r TARGET; do
    ((COUNT++))
    echo "Scanning [$COUNT/$TOTAL_IPS]: $TARGET"
    
    nmap --script vulners -sV "$TARGET" >> "$LOGFILE" 2>&1
    
    echo "Completed: $TARGET"
    echo "--------------------------------------" >> "$LOGFILE"
done < "$IP_LIST"

echo "All scans completed."
```

実行権限を付与します。

```sh
chmod +x /usr/local/bin/nmap_vulners_scan.sh
```

### 5.2 systemd サービス作成

以下のファイルを `/etc/systemd/system/nmap_vulners.service` として作成します。

```ini
[Unit]
Description=Nmap Vulners Scanner
After=network.target

[Service]
ExecStart=/usr/local/bin/nmap_vulners_scan.sh

[Install]
WantedBy=multi-user.target
```

サービスを有効化します。

```sh
sudo systemctl enable nmap_vulners.service
sudo systemctl start nmap_vulners.service
```

### 5.3 定期実行 (systemd timer)

以下のファイルを `/etc/systemd/system/nmap_vulners.timer` として作成します。

```ini
[Unit]
Description=Run Nmap Vulners Scan Daily

[Timer]
OnCalendar=daily
Persistent=true

[Install]
WantedBy=timers.target
```

タイマーを有効化します。

```sh
sudo systemctl enable nmap_vulners.timer
sudo systemctl start nmap_vulners.timer
```

これで毎日スキャンが行われるようになります。結果をメール通知してもいいですね。

---

## 🎉 おわり

`vulners.nse` を活用して脆弱性を定期的にチェックし、セキュリティを強化しましょう！💪

