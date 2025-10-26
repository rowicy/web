---
title: XServer Domainで契約したドメインをCloudflare Registrarに移管する
description: XServer Domainで契約したドメインをCloudflare Registrarに移管する方法をご紹介します。
author: Naoki
tags: [Tech]
pubDate: '2025-03-01'
---

## はじめに

本記事では、XServer Domainで契約したドメインをCloudflare Registrarに移管する方法をご紹介します。

## なぜ移管するのか

今現在、3つほどのドメインをそれぞれ別のレジストラで管理しています。
（ちなみに、特に意図はありません。）

ただ、管理するドメインが増えてきて、流石に管理が煩雑になってきたので、１つのレジストラにまとめたいと思い、移管することにしました。

## 選定レジストラ

今回、移管先として[Cloudflare Registrar](https://www.cloudflare.com/products/registrar/)を選定しました。
選定理由は様々ありますが、何より管理費用が安いことが決め手となりました。
複数ドメインを保持していると、毎年のドメイン更新費用もばかにならないですからね...

## 移管手順

### 前提

- XServer Domainで契約したドメインがある
- Cloudflareにアカウントを作成している

### 1. XServer Domainでドメインを解約する

まずは、公式のよくある質問にも記載の通り、XServer Domainで契約したドメインを解約します。

[ドメインを他社へ移管するにはどうすればいいですか？](https://support.xserver.ne.jp/faq/transfer_domain_other.php)

解約は以下の手順で行います。

[解約手順](https://support.xserver.ne.jp/manual/man_order_quit.php)

契約情報の「解約する」をクリックするだけです。すごく簡単。
その後メールが届くので、指示に従って解約手続きを進めていきます。

### 2. Whois情報の変更

Whois情報の「XServer Inc.（弊社）名義で代理公開する」のチェックを外し、自分の情報に変更します。

***※Whois情報は公開情報です。個人情報を公開したくない場合は一時的にサイトを非公開にしておくと良いです。***

![Whois情報入力](/images/blog/transfer-domain/01.png)

入力後、メールアドレス認証用のメールが届くので、認証を行うと変更が完了します。

### 3. Whois情報の変更反映確認

Whois情報の変更が反映されるまで待ちます。
反映されるまで最大1日程度かかるらしいので、気長に待ちましょう。
下記コマンドで確認できます。

```bash
whois example.com
```

下記などが変わっていれば反映されています。

- Registrant Name
- Registrant Organization
- Registrant Street
- Registrant City
- Registrant State/Province:
- Registrant Postal Code
- Registrant Country
- Registrant Phone
- Registrant Phone Ext
- Registrant Fax
- Registrant Fax Ext
- Registrant Email

変更が反映されたら、次の手順に進みます。

### 4. 認証鍵を取得

契約情報の「認証鍵を確認」をクリックし、認証鍵を取得します。

![認証鍵を確認](/images/blog/transfer-domain/02.png)

こちらの認証鍵は移管先のレジストラに入力するので、保管しておきます。

### 5. レジストラロックの解除

レジストラロック情報の「設定変更」をクリックし、レジストラロックを解除します。

![レジストラロック情報](/images/blog/transfer-domain/03.png)

「解除する」を選択し、「設定を変更する」をクリックすると解除完了です。

![レジストラロック情報](/images/blog/transfer-domain/04.png)

### 6. Cloudflareにドメインを追加

[Cloudflareにログイン](https://dash.cloudflare.com/)し、ドメインを追加します。

アカウントホームの「ドメインを追加する」をクリック

![ドメインを追加する](/images/blog/transfer-domain/05.png)

「既存のドメインを入力」に移管するドメインを入力します。  
DNSの設定方法は任意のものを選択し、続行をクリックします。  
私は推奨の「DNSレコードのクイックスキャン」を選択しました。

![ドメインを入力する](/images/blog/transfer-domain/06.png)

プランはプロジェクトの要件に合わせて選択します。  
個人利用であればFreeで良いと思います。

![プランを選択する](/images/blog/transfer-domain/07.png)

「DNSレコードのクイックスキャン」を選択した場合、スキャンが終わると確認画面が表示されます。  
不足や誤りがあれば追加・修正し、ページの下の方にある、「アクティベーションに進む」をクリックします。

![DNSレコード確認画面](/images/blog/transfer-domain/08.png)

最後にネームサーバーの変更指示が表示されます。
1.2は必要であれば変更してください。
私は特に何もしませんでした。

![ネームサーバー変更指示](/images/blog/transfer-domain/09.png)

「3. 現在のネームサーバーを Cloudflare ネームサーバーに置き換える」は必須なので設定します。  
指示通り、CloudflareネームサーバーをXServer Domainの管理画面で設定します。

![ネームサーバー変更指示](/images/blog/transfer-domain/10.png)

Xserver Domainの「ネームサーバー設定」を変更します。

![ネームサーバー設定](/images/blog/transfer-domain/11.png)

変更したら、Cloudflareの「ネームサーバを今すぐ確認」をクリックします。

![ネームサーバー変更確認](/images/blog/transfer-domain/12.png)

反映に時間がかかる可能性があるので、その場合はしばらく待ちましょう。

### 7. Cloudflare にドメインを移管する

サイドバーの「ドメインの移管」を開き、移管手続きを進めます。  
支払い金額を確認したら、「ドメインを確認する」をクリックします。  
(現在の有効期限が XServer Domain の利用期限日と一致していること、新しい有効期限が伸びていることを確認しましょう。)

![ドメインの移管](/images/blog/transfer-domain/13.png)

Xserver Domain の認証鍵を入力し、「確認して続行する」をクリックします。　　
認証鍵が認識されない場合は、 XServer Domain の管理画面で認証鍵を再生成すると良いです。

![認証鍵入力](/images/blog/transfer-domain/14.png)

その後、支払い情報を入力する画面が表示されるので、画面の指示通り進めると手続きが完了します。

ドメインの一覧に追加されていることを確認しましょう。  
尚、移管完了までに最大5日かかるとのことなので、こちらもしばらく待ちましょう。

![ドメイン一覧](/images/blog/transfer-domain/15.png)

私の場合、5日で移管が完了しました。  
移管完了後、Cloudflare からメールが届くので、移管が完了したことを確認しましょう。

![移管が完了すると、ステータスがアクティブになる](/images/blog/transfer-domain/16.png)

## 費用 Before & After

移管したドメイン更新費用の比較です。

| 　| 金額 | 備考 |
| --- | --- | --- |
| 移管前 | **4,908**円/年 | |
| 移管後 | $27.70(支払い時のレートで約**4,350**円)/年 | 通貨換算手数料を含むため、画像の金額より少し高くなっている |

年間で約**550**円ほど安くなりました。  

## 最後に

待ち時間が長いので少し面倒な作業でしたが、費用が削減できて大満足です！
また、ドメインの管理も楽になったので、残りのドメインも移管していこうと思います。  

最後までお読みいただき、ありがとうございました！
