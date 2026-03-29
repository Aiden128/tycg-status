# 桃園市政府系統健康監控

即時監控桃園市政府 **896 個子網域**的服務狀態、回應時間與歷史紀錄。

**線上版本：** https://aiden128.github.io/tycg-status/

## 功能特色

- **即時監控**：每 5 分鐘自動檢測所有子網域
- **狀態分類**：🟢 正常 / 🔴 中斷 / 🟡 緩慢（>3 秒）
- **分類瀏覽**：依照市府核心、交通、衛生、教育等 14 個分類整理
- **搜尋篩選**：可依網域名稱、分類、狀態即時篩選
- **訂閱通知**：支援 RSS 訂閱服務狀態變更
- **深色介面**：參考 Vercel Status 設計風格

## 技術架構

| 元件 | 技術 |
|------|------|
| 前端框架 | Next.js 15 (App Router, Static Export) |
| 語言 | TypeScript (strict mode) |
| 樣式 | Tailwind CSS v4 |
| 部署 | GitHub Pages |
| 監控排程 | GitHub Actions (cron 每 5 分鐘) |

## 本地開發

```bash
# 安裝相依套件
npm install

# 啟動開發伺服器
npm run dev

# 執行健康檢查（產生 public/data/status-latest.json）
npm run check

# 建置靜態網站
npm run build
```

## 專案結構

```
.
├── .github/workflows/
│   ├── monitor.yml      # 每 5 分鐘執行健康檢查
│   └── deploy.yml       # Push 到 main 時自動部署
├── data/
│   └── domains.json     # 896 個監控網域清單
├── scripts/
│   └── check.ts         # 健康檢查腳本
├── src/
│   ├── app/
│   │   ├── page.tsx     # 主要儀表板
│   │   ├── layout.tsx   # HTML 根佈局
│   │   ├── globals.css  # 全域樣式
│   │   └── feed.xml/    # RSS Feed 路由
│   ├── components/      # React 元件
│   └── lib/
│       ├── types.ts     # TypeScript 型別定義
│       └── categories.ts # 網域自動分類邏輯
└── public/data/
    └── status-latest.json  # 最新狀態資料
```

## 健康檢查規則

| 狀態 | 條件 |
|------|------|
| 🟢 正常 | HTTP 2xx / 3xx，回應時間 ≤ 3 秒 |
| 🟡 緩慢 | HTTP 2xx / 3xx，回應時間 > 3 秒 |
| 🔴 中斷 | HTTP 4xx / 5xx、連線逾時（10 秒）、或其他錯誤 |

檢查方式：HTTP HEAD 請求，並行批次 50 個，每批次間無延遲。

## 分類說明

| 分類 | 關鍵字範例 |
|------|-----------|
| 🏛️ 市府核心 | www, eng, cas, 1950, portal |
| 🚌 交通/公車/停車 | ebus, traffic, parking, bus |
| 💳 市民卡/支付 | card, typass, mpay, pay |
| 🏢 局處官網 | doit, legal, tytax, budget |
| 🏥 衛生/醫療 | health, dph, vaccine, hospital |
| 👨‍👩‍👧 社會福利/托育 | care, baby, family, labor |
| 🗺️ 地政/GIS | gis, land, addr, map |
| 🎪 觀光/活動 | travel, event, tourism, festival |
| 📚 教育/文化 | edu, culture, library, school |
| 🌱 環保/農業 | env, agriculture, water, recycle |
| 📊 開放資料 | opendata, data, ckan, api |
| 🚒 警消/災害 | disaster, fire, police, eoc |
| 🏘️ 區公所 | daxi, zhongli, bade, yangmei |
| 📋 其他 | 其餘網域 |

## GitHub Actions 設定

### 啟用 GitHub Pages

1. 至 **Settings > Pages**
2. Source 選擇 **GitHub Actions**

### 監控排程

`monitor.yml` 每 5 分鐘執行一次健康檢查，結果自動 commit 至 `public/data/`，並觸發重新部署。

## RSS 訂閱

訂閱 RSS Feed 以接收服務異常通知：

```
https://aiden128.github.io/tycg-status/feed.xml
```

推薦閱讀器：[Feedly](https://feedly.com)、[Inoreader](https://inoreader.com)、[NetNewsWire](https://netnewswire.com)

## 授權

MIT License
