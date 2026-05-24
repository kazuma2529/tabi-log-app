# 世界旅記録（tabi-log-app）

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
| `npm run ios` | iOS シミュレーターで起動 |
| `npm run typecheck` | TypeScript の型チェック |
| `npm run lint` | ESLint |
| `npm run check` | 型チェック + lint |

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
