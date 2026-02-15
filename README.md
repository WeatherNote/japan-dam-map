# 🌊 日本ダム貯水量マップ / Japan Dam Reservoir Map

全国のダム貯水率をリアルタイムで地図上に表示するWebアプリケーションです。

A web application that visualizes real-time reservoir storage rates of dams across Japan on an interactive map.

## Features / 機能

- **リアルタイム貯水率表示** — 国土交通省 川の防災情報からデータを取得
- **マップビュー** — 全国のダムを地図上に色分け表示（貯水率に応じた色）
- **リストビュー** — テーブル形式でのダム一覧
- **フィルター** — 地方・都道府県・ダム形式・貯水率での絞り込み
- **検索** — ダム名での全文検索
- **CSVエクスポート** — 表示中のデータをCSV形式でダウンロード
- **水力発電ダッシュボード** — 水力発電関連ダムの専用ビュー
- **多言語対応** — 日本語 / English 切り替え
- **ダークモード** — ライト / ダーク切り替え

## Data / データ

- **735+ ダム** のリアルタイム貯水率データ
- データ元: [国土交通省 川の防災情報](https://www.river.go.jp/kawabou/)
- ダム情報: [国土数値情報](https://nlftp.mlit.go.jp/) + [Wikipedia](https://ja.wikipedia.org/)

## Tech Stack / 技術スタック

- HTML / CSS / JavaScript（フレームワーク不使用）
- [Leaflet.js](https://leafletjs.com/) — 地図表示
- Python — データ取得スクリプト

## Setup / セットアップ

### ローカル実行

```bash
# サーバー起動
python3 -m http.server 8080

# ブラウザで開く
open http://localhost:8080
```

### データ更新

```bash
# 川防マスターデータの更新
python3 scripts/fetch_kawabou_master_v2.py

# リアルタイムデータの更新
python3 scripts/fetch_realtime.py
```

## Project Structure / プロジェクト構成

```
japan-dam-map/
├── index.html          # メインアプリ
├── hydro.html          # 水力発電ダッシュボード
├── src/
│   ├── style.css       # スタイルシート
│   ├── main.js         # メインロジック
│   ├── data.js         # データ管理
│   ├── filter.js       # フィルター機能
│   ├── detail.js       # ダム詳細表示
│   ├── export.js       # CSVエクスポート
│   ├── auth.js         # 認証
│   ├── i18n.js         # 国際化
│   └── hydro_map.js    # 水力発電マップ
├── data/
│   ├── dams.json       # ダム基本データ
│   └── realtime.json   # リアルタイム貯水率データ
└── scripts/
    ├── fetch_realtime.py         # リアルタイムデータ取得
    └── fetch_kawabou_master_v2.py # 川防マスターデータ取得
```

## License / ライセンス

データ: CC BY 4.0（国土交通省 国土数値情報）

## Credits / クレジット

- [国土交通省 川の防災情報](https://www.river.go.jp/kawabou/)
- [国土数値情報ダウンロードサービス](https://nlftp.mlit.go.jp/)
- [水文水質データベース](https://www1.river.go.jp/)
