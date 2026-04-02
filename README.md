# 毛毛先生 🐾

> 佳穎的溫暖個人生活小助理 — 一個以隱私為核心設計的 PWA

[![Deploy to GitHub Pages](https://github.com/GabrielYMC/maomao/actions/workflows/deploy.yml/badge.svg)](https://github.com/GabrielYMC/maomao/actions/workflows/deploy.yml)

---

## ✨ 功能特色

| 功能 | 說明 |
|------|------|
| 🌅 **晨間簡報** | 每天開啟時，AI 根據任務、目標、心情自動生成溫暖問候 |
| 📋 **任務管理** | 新增、完成、刪除任務，支援優先級、截止日、重複設定 |
| 🎯 **長期目標** | 追蹤長期目標進度（手動更新 %），進度條視覺化 |
| 😊 **心情紀錄** | 每日 emoji 心情 + 文字備注，計算連續打卡天數 |
| 💬 **AI 聊天** | 與 Claude 對話；AI 能偵測新增任務意圖並確認 |
| 📊 **每週回顧** | 一鍵生成 AI 週報，總結任務、目標、心情趨勢 |
| 🔔 **到期提醒** | 任務到期日當天推播通知（使用 Web Notification API）|
| 📱 **PWA 可安裝** | 支援安裝到手機主畫面，離線開啟 |

## 🔒 隱私架構（BYOK）

所有 API 金鑰和資料均儲存在**你自己的瀏覽器 localStorage** 中，不經過任何第三方伺服器。

- **Google Sheets** — 作為資料庫（你自己的帳號）
- **Google Apps Script** — 作為寫入代理（部署在你的 Google 帳號）
- **Anthropic Claude API** — AI 功能（你自己的 Key）

## 🚀 快速開始

請參閱 [部署說明文件](./docs/deployment.md) 取得完整設定步驟。

**概覽：**
1. Fork 此 Repo，啟用 GitHub Pages（Actions 部署）
2. 在 Google Sheets 建立資料表
3. 在 Google Apps Script 部署代理腳本
4. 開啟 App → 設定頁面填入三組憑證

## 🛠 技術棧

- **前端框架**：Vite + Vanilla JS（ES Modules）
- **樣式**：Vanilla CSS + CSS Variables
- **AI**：Anthropic Claude Sonnet
- **資料儲存**：Google Sheets API v4
- **寫入代理**：Google Apps Script Web App
- **PWA**：Service Worker + Web App Manifest
- **部署**：GitHub Actions → GitHub Pages

## 📁 專案結構

```
maomao_v2/
├── src/
│   ├── components/       # UI 元件
│   │   ├── chat.js       # 聊天 + AI 任務意圖偵測
│   │   ├── dashboard.js  # 儀表板 + 週報
│   │   ├── task-list.js  # 任務清單
│   │   ├── goal-list.js  # 長期目標
│   │   ├── sidebar.js    # 側邊欄 + 心情記錄
│   │   └── settings.js   # 設定頁面
│   ├── services/
│   │   ├── anthropic.js  # Anthropic API（聊天/簡報/週報）
│   │   ├── sheets.js     # Google Sheets 讀取
│   │   ├── script.js     # Apps Script 寫入代理
│   │   ├── notifications.js # 到期提醒
│   │   └── config.js     # localStorage 設定管理
│   └── styles/           # CSS 模組
├── public/
│   ├── sw.js             # Service Worker
│   ├── manifest.json     # PWA Manifest
│   └── icons/            # App 圖示
├── apps-script-template.js  # 🔑 部署到 Google Apps Script 的腳本
└── docs/
    └── deployment.md     # 完整部署教學
```

## 🔧 本地開發

```bash
git clone https://github.com/YOUR_USERNAME/maomao_v2.git
cd maomao_v2
npm install
npm run dev    # 開啟 http://localhost:5173
```

## 📄 授權

MIT License — 自由使用、修改、分享。
