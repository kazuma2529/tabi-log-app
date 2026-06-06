# 旅ログ（tabi-log-app）

人生で訪れた国を記録する iOS 専用の世界制覇ログアプリです。

## 前提

- Node.js 20 以上推奨
- iOS シミュレーター、または Expo Go（SDK 54）
- 要件・計画: `docs/requirements.md`, `docs/plan.md`
- UI ゴール: `images/app-image.png`, `images/app-image2.png`

## セットアップ

```bash
npm install
```

## 開発コマンド

| コマンド | 説明 |
| --- | --- |
| `npm start` | Expo 開発サーバーを起動 |
| `npm run start:dev-client` | 実機のDevelopment Build用サーバーを起動 |
| `npm run ios` | iOS シミュレーターで起動 |
| `npm run typecheck` | TypeScript の型チェック |
| `npm run lint` | ESLint |
| `npm run check` | 型チェック + lint |

## RevenueCat

RevenueCat の `Tabi Log iOS` 用 Public SDK API Key を `.env.local` に設定します。

```bash
cp .env.example .env.local
```

```env
EXPO_PUBLIC_REVENUECAT_IOS_API_KEY=appl_xxxxxxxxxxxxxxxxxxxxxxxx
```

キーは RevenueCat の `API keys` → `Public app-specific API keys` から取得します。`.p8`、Secret API Key、REST API Identifier は使用しません。実購入の確認には Expo Development Build / EAS Build が必要です。

RevenueCat のセットアップ画面に表示される `test_` から始まるキーは Test Store 用です。本アプリでは App Store Connect の商品と Apple Sandbox を確認するため、`Tabi Log iOS` に紐づく `appl_` から始まるキーを使用します。

EAS Buildでは`.env.local`がアップロードされないため、App Store申請用の`production`環境にも同じ値を`EXPO_PUBLIC_REVENUECAT_IOS_API_KEY`として登録します。Development Buildを再び使う場合のみ、`development`環境にも登録します。

## App Storeへの直接申請

本アプリはTestFlightでのテスター配信を行わず、productionビルドをApp Store ConnectへアップロードしてApp Reviewへ直接提出します。

```bash
npx eas-cli build --platform ios --profile production
npx eas-cli submit --platform ios --profile production
```

アップロードしたビルドはAppleの仕組み上、App Store ConnectのTestFlight欄にも表示されますが、TestFlight配信やベータ審査は行いません。App Store ConnectのApp Store用バージョン画面でビルドを選択し、本審査へ提出します。

iPhoneのDeveloper ModeはDevelopment Buildを実機で動かす場合だけ必要です。App Store申請やApp Store版の利用には不要なため、Development Buildを使わない期間はオフにして構いません。

- 無料版: 訪問国登録は5か国まで、写真・動画は1訪問10件まで、年別分析はロック
- 有料版: 6か国目以降の訪問国登録、写真・動画無制限、年別分析を解放

## フォルダ構成

```txt
app/          # Expo Router の画面
src/
  components/
  constants/
  data/
  db/
  features/
  hooks/
  lib/
  theme/
  types/
assets/
docs/
images/
```
