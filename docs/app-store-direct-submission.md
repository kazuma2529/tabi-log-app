# App Store 直接申請手順

## 方針

- TestFlight のテスター配信は行わない。
- EAS の production ビルドを App Store Connect へアップロードする。
- App Store Connect で提出ビルドと初回 In-App Purchase を選び、App Review へ直接提出する。

アップロードしたビルドは Apple の仕組み上、App Store Connect の TestFlight 欄にも自動表示される。表示されても、テスター追加、TestFlight 配信、TestFlight App Review は行わない。

## 1. Developer Mode をオフにする

Development Build を今後使わない場合は、iPhone で以下を行う。

1. 「設定」を開く。
2. 「プライバシーとセキュリティ」を開く。
3. 「デベロッパモード」をオフにする。
4. 案内に従って iPhone を再起動する。
5. 不要になった Development Build の「旅ログ」を削除する。
6. Expo の端末登録用プロファイルが残っている場合は、「設定 → 一般 → VPNとデバイス管理」から削除する。

Developer Mode は開発署名されたアプリを実機で動かすための機能であり、App Store 申請や App Store からインストールしたアプリには不要。

## 2. ビルド前の確認

1. `npm run check` が成功することを確認する。
2. `npm run routecheck` が成功し、`app/` 配下に内部コンポーネントや画面用 `default export` のないルートが存在しないことを確認する。
3. EAS の `production` 環境に `EXPO_PUBLIC_REVENUECAT_IOS_API_KEY` が登録されていることを確認する。
4. App Store Connect の In-App Purchase `com.tabilog.premium` を開く。
5. 表示名、説明、価格、配信地域、審査用スクリーンショット、審査メモを入力する。
6. In-App Purchase のステータスが「提出準備完了」相当になっていることを確認する。
7. App Store 用スクリーンショット、説明文、キーワード、サポート URL、プライバシーポリシー URLを準備する。

## 2.0 バージョン 1.0.1 を出す場合

`1.0.0` から `1.0.1` へ上げて再提出する手順と、審査用メモの文案は `docs/release-1.0.1.md` を参照する。

コード側では少なくとも以下を更新する。

- `app.json` の `expo.version` → `1.0.1`
- `package.json` の `version` → `1.0.1`
- iCloud 写真・動画修正を含む変更をコミットする
- `npx eas-cli build:version:set -p ios -e production` で EAS 側のバージョンを `1.0.1` に設定する

## 2.1 App Review 却下後の再申請確認

2026-06-08 の初回審査では、iPadで内部コンポーネントのルートが未完成メニューとして表示され、押下時にクラッシュした。

再申請前に以下を必ず確認する。

1. App Store Connect の添付クラッシュログをシンボリケートし、修正した原因と一致するか照合する。
2. iPhoneで、新規インストール状態からオンボーディングと主要フローを確認する。
3. iPadのiPhone互換表示で、オンボーディングと主要導線がクラッシュしないことを確認する。
4. タブに「ホーム・地図・追加・記録・統計」以外が表示されないことを確認する。
5. 全タブ、訪問追加、国詳細、バケットリスト、年別分析、購入・復元導線を操作する。
6. 新しいビルド処理後、App Store ConnectでiPad用スクリーンショットが必須表示されないことを確認する。

App Review への返信例：

```txt
We identified that internal Expo Router component files were unintentionally exposed as menu routes on iPad. Opening one of those routes caused the crash because it was not an app screen.

We moved all internal components and hooks outside the app route directory, removed the incomplete menu routes, and made the add action route safe when opened directly. We also added an automated route audit to prevent recurrence.

We configured the app as an iPhone-only app and verified the onboarding flow and all primary navigation flows on iPhone, as well as basic compatibility behavior on iPad. The fix is included in build [BUILD_NUMBER].
```

## 3. production ビルドを作成する

```bash
npx eas-cli build --platform ios --profile production
```

質問が表示された場合は、App Store 配信用の認証情報を作成・利用する。ビルド完了まで待つ。

## 4. App Store Connect へアップロードする

```bash
npx eas-cli submit --platform ios --profile production
```

EAS Submit はビルドを App Store Connect へアップロードする。これだけでは App Review への本提出は完了しない。

Apple 側の処理完了後、App Store Connect にビルドが表示される。処理には時間がかかる場合がある。

## 5. App Store Connect で提出ビルドを選ぶ

1. App Store Connect の「アプリ」から「旅ログ - 世界制覇ログ」を開く。
2. App Store タブで iOS バージョン `1.0.1` を開く。まだ `1.0.1` が無い場合は、左の「＋バージョンまたはプラットフォーム」から `1.0.1` を新規作成する。
3. 必須のアプリ情報、スクリーンショット、App Privacy、年齢制限、価格と配信地域を入力する。
4. 「ビルド」セクションの追加ボタンから、アップロードした production ビルドを選ぶ。
5. 輸出コンプライアンスの質問が表示された場合は回答する。

## 6. 初回 In-App Purchase を申請に含める

初回の In-App Purchase は、新しいアプリバージョンと一緒に提出する必要がある。

1. iOS バージョン画面の「アプリ内課金とサブスクリプション」セクションを開く。
2. `Tabi Log Premium` / `com.tabilog.premium` を選択する。
3. App Review 用メモに、購入画面への移動方法と復元方法を記載する。

審査メモ例：

```txt
統計タブの「プレミアム機能」カードから、買い切り商品を購入できます。
購入済みの場合は、同じカード下部の「購入済みの方はこちらから復元」から復元できます。
購入後は、6か国目以降の訪問国登録、写真・動画の無制限追加、年別分析が利用できます。
```

## 7. App Review へ提出する

1. 入力内容と提出ビルドを最終確認する。
2. リリース方法を選択する。初回は「手動リリース」にすると、承認後の公開タイミングを自分で決められる。
3. 「レビューに追加」を押す。
4. App Review のドラフト提出画面で内容を確認する。
5. 「審査へ提出」を押す。
6. ステータスが「審査待ち」になったことを確認する。

## 注意点

- production ビルドは App Store 経由でのみインストールでき、直接実機へインストールできない。
- TestFlight を使わない場合、アップロードした production ビルドそのものを提出前に実機確認できない。
- App Review は品質確認の代わりではない。申請前は、これまで確認した Development Build の主要機能・購入・復元結果を基準にする。
- Developer Mode を再びオンにする必要があるのは、Development Build を実機で動かす場合だけ。
