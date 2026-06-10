# バージョン 1.0.1 リリース手順

非エンジニア向けに、App Store へ再提出するまでの流れをまとめたものです。

## このバージョンで直したこと

1. **iCloud 上だけにある古い写真・動画を追加できない問題**
   - iPhone のストレージ最適化で端末から消え、iCloud にだけ残っている素材を選んだとき、保存に失敗することがあった
   - iOS の写真取得処理を修正し、iCloud からのダウンロードを許可するようにした

2. **写真・動画の取り込み中の表示**
   - iCloud からの取得に時間がかかる場合、「写真や動画を準備しています」と表示するようにした

3. **エラーメッセージの改善**
   - iCloud から取得できなかったとき、原因が分かりやすい文言を表示するようにした

4. **（1.0.0 却下分）iPad でのクラッシュ**
   - 初回審査で指摘された、iPad 互換表示で内部画面が表示されクラッシュする問題は、すでに main ブランチに修正済み

---

## コード側で変更したファイル（参考）

エンジニア向けメモです。提出作業そのものには不要です。

| ファイル | 内容 |
|---------|------|
| `app.json` / `package.json` | バージョン `1.0.1` |
| `patches/expo-image-picker+17.0.11.patch` | iCloud 取得許可のネイティブ修正 |
| `src/lib/visit-media.ts` | エラーメッセージ改善 |
| `src/features/visit-media/media-processing-indicator.tsx` | 処理中表示 |
| 各画面 | 処理中表示の組み込み |

---

## 手順 1：変更を Git に保存する

ターミナルでプロジェクトフォルダに移動し、以下を実行します。

```bash
cd /Users/kazuma/dev/tabi-log-app
git add -A
git status
```

表示を確認してからコミットします。

```bash
git commit -m "$(cat <<'EOF'
Fix iCloud-only photo and video import for visit media.

EOF
)"
```

---

## 手順 2：ビルド前の確認

```bash
npm install
npm run check
```

エラーが出なければ OK です。

---

## 手順 3：EAS のバージョンを 1.0.1 に設定する

このプロジェクトは EAS 側でビルド番号を管理しています（現在のビルド番号は `2`）。

次のコマンドを実行し、表示される質問に答えます。

```bash
npx eas-cli build:version:set -p ios -e production
```

- **What version would you like to set?** → `1.0.1` と入力
- ビルド番号について聞かれた場合 → そのまま Enter（自動で `3` になる想定）か、案内に従う

設定後の確認:

```bash
npx eas-cli build:version:get -p ios
```

---

## 手順 4：production ビルドを作成する

```bash
npx eas-cli build --platform ios --profile production
```

- 完了まで 10〜30 分ほどかかることがあります
- ビルド番号は `3`（前回 `2` の次）になる想定です

---

## 手順 5：App Store Connect へアップロードする

```bash
npx eas-cli submit --platform ios --profile production
```

- 直前のビルドを選ぶか、ビルド ID を指定します
- Apple 側の処理が終わるまで、App Store Connect にビルドが表示されないことがあります（数分〜1 時間程度）

---

## 手順 6：App Store Connect で 1.0.1 を用意する

1. [App Store Connect](https://appstoreconnect.apple.com/) を開く
2. 「アプリ」→「旅ログ - 世界制覇ログ」
3. 左メニュー「App Store」→「iOS アプリ」
4. **まだ `1.0.1` が無い場合**  
   - 「＋バージョンまたはプラットフォーム」→ バージョン `1.0.1` を作成
5. **すでに `1.0.0` で審査中の場合**  
   - 却下または取り下げ後に `1.0.1` を新規作成するか、Apple の案内に従ってビルドを差し替える

### ビルドを紐づける

1. `1.0.1` のバージョン画面を開く
2. 「ビルド」セクション → 「追加」
3. アップロードした新しいビルド（ビルド番号 `3`）を選択

### このバージョンの最新情報（ユーザー向け・日本語）

App Store Connect の「このバージョンの最新情報」に、以下をコピーして貼り付けてください。

```txt
・iCloud上にだけ保存されている古い写真や動画も、訪問記録に追加しやすくなりました
・写真や動画の取り込み中に、処理状況が分かる表示を追加しました
・一部の写真・動画を追加できなかった不具合を修正しました
```

英語が必要な場合:

```txt
• Improved adding older photos and videos stored only in iCloud
• Added a status indicator while importing photos and videos
• Fixed an issue that prevented some photos and videos from being added
```

---

## 手順 7：審査用メモ（App Review 向け）

### App Review への返信・審査メモ欄用（日本語）

「App 審査情報」→「メモ」、または却下後の返信欄に使えます。  
`[BUILD_NUMBER]` は、App Store Connect に表示された実際のビルド番号（例: `3`）に置き換えてください。

```txt
バージョン 1.0.1 では、以下を修正しました。

【iCloud 上の写真・動画】
写真ライブラリから、端末内ではなく iCloud 上にのみ保存されている古い写真や動画を選択した際に、訪問記録へ追加できないことがありました。iOS の写真取得処理を修正し、iCloud からのダウンロードを許可しました。取得に時間がかかる場合は「写真や動画を準備しています」と表示されます。

【iPad 互換表示（初回却下分）】
内部の Expo Router コンポーネントが iPad 互換表示でメニュー項目として表示され、タップ時にクラッシュする問題を修正済みです。アプリは iPhone 専用として構成しています。

【確認手順】
1. 訪問記録の追加（下部タブ中央の＋）または国詳細画面から写真・動画を追加
2. 写真ライブラリから任意の写真または動画を選択して保存
3. 国詳細画面またはアルバム画面で、追加した写真・動画が表示されることを確認

修正はバージョン 1.0.1、ビルド [BUILD_NUMBER] に含まれています。
```

### 英語版（Apple 審査員向け）

```txt
Version 1.0.1 includes the following fixes:

[iCloud photos and videos]
Some older photos and videos stored only in iCloud could not be added to visit records. We updated the iOS photo library handling to allow downloading assets from iCloud. A brief "Preparing photos and videos" indicator is shown when retrieval takes longer.

[iPad compatibility (initial rejection)]
We fixed a crash on iPad compatibility mode caused by internal Expo Router component routes being exposed as menu items. The app is configured as iPhone-only.

[How to verify]
1. Add photos or videos from the add-visit flow (center + tab) or country detail screen
2. Select any photo or video from the photo library and save
3. Confirm the added media appears on the country detail or album screen

The fixes are included in version 1.0.1, build [BUILD_NUMBER].
```

### アプリ内課金の審査メモ（変更がなければ前回と同じ）

```txt
統計タブの「プレミアム機能」カードから、買い切り商品を購入できます。
購入済みの場合は、同じカード下部の「購入済みの方はこちらから復元」から復元できます。
購入後は、6か国目以降の訪問国登録、写真・動画の無制限追加、年別分析が利用できます。
```

---

## 手順 8：審査へ提出

1. `1.0.1` の入力内容とビルドを最終確認
2. リリース方法は「手動リリース」推奨（承認後に自分で公開できる）
3. 「レビューに追加」→「審査へ提出」
4. ステータスが「審査待ち」になれば完了

---

## よくある質問

### バージョンとビルド番号の違いは？

| 名前 | 例 | 意味 |
|------|-----|------|
| バージョン | 1.0.1 | ユーザーに見える番号。App Store の「バージョン」 |
| ビルド番号 | 3 | 同じバージョン内の何回目のビルドか。審査のたびに増やす |

### Expo Go や Development Build で確認できる？

iCloud 修正はネイティブのパッチを含むため、**production ビルド**で反映されます。  
TestFlight を使わない方針の場合、提出前の実機確認は Development Build で近似確認するか、審査通過後の App Store 版で確認します。

### スクリーンショットは撮り直す？

機能の見た目が大きく変わっていなければ、1.0.0 のものを流用できることが多いです。  
「処理中」のオーバーレイは一時的な表示なので、スクショ必須ではありません。

### 1.0.0 の審査がまだ続いている場合は？

新しいビルドだけ差し替えられる場合と、一度却下・取り下げして `1.0.1` を新規作成する場合があります。  
App Store Connect の画面表示に従ってください。

---

## コマンド一覧（コピー用）

```bash
cd /Users/kazuma/dev/tabi-log-app
npm install
npm run check
npx eas-cli build:version:set -p ios -e production
npx eas-cli build --platform ios --profile production
npx eas-cli submit --platform ios --profile production
```
