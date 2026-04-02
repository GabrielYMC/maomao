# 毛毛先生 — 完整部署說明

本文件將一步步帶你完成毛毛先生的設定，大約需要 **15-20 分鐘**。

---

## 目錄

1. [Fork 專案到 GitHub](#1-fork-專案到-github)
2. [建立 Google Sheets 資料表](#2-建立-google-sheets-資料表)
3. [取得 Google Sheets API Key](#3-取得-google-sheets-api-key)
4. [部署 Google Apps Script 代理](#4-部署-google-apps-script-代理)
5. [啟用 GitHub Pages 自動部署](#5-啟用-github-pages-自動部署)
6. [填入 App 設定](#6-填入-app-設定)
7. [取得 Anthropic API Key（選填）](#7-取得-anthropic-api-key選填)

---

## 1. Fork 專案到 GitHub

1. 前往 [github.com/GabrielYMC/maomao](https://github.com/GabrielYMC/maomao)
2. 點右上角 **Fork** → **Create fork**
3. Fork 完成後，你有了自己的 `YOUR_USERNAME/maomao` 副本

---

## 2. 建立 Google Sheets 資料表

在你的 Google Drive 新建一個 Google 試算表，並建立以下三個工作表（Sheet）：

### 工作表一：`Tasks`（任務）

| A | B | C | D | E | F | G | H |
|---|---|---|---|---|---|---|---|
| id | title | status | priority | due | notes | created_at | repeat |
| （資料從第 2 列開始）| | | | | | | |

- **status** 欄的值：`待辦` 或 `完成`
- **priority** 欄的值：`高`、`中`、`低`
- **repeat** 欄的值：`daily`、`weekly`、`monthly` 或留空

### 工作表二：`Goals`（長期目標）

| A | B | C | D | E | F | G |
|---|---|---|---|---|---|---|
| id | title | category | progress | deadline | created_at | updated_at |

- **category** 範例：健康、工作、學習、人際、財務、其他
- **progress** 範例：`0` ~ `100`（整數，不含 %）

### 工作表三：`MoodLog`（心情紀錄）

| A | B | C | D | E |
|---|---|---|---|---|
| date | score | emoji | note | (備用) |

- **date** 格式：`YYYY-MM-DD`（例如 `2026-04-03`）
- **score** 範圍：`1`~`5`

> ⚠️ **重要**：工作表名稱（Tab 名稱）必須完全一致：`Tasks`、`Goals`、`MoodLog`（大小寫有別）

### 設定試算表公開可讀

Google Sheets API 讀取需要試算表設為「任何知道連結的人皆可檢視」：

1. 點右上角「共用」
2. 一般存取 → 選「**知道連結的任何人**」→ 權限設「**檢視者**」
3. 點「完成」

---

## 3. 取得 Google Sheets API Key

1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 建立新專案（或使用現有專案）
3. 左側選單 → **APIs & Services** → **Library**
4. 搜尋 `Google Sheets API` → **啟用**
5. 回到 **APIs & Services** → **Credentials**
6. 點「**+ CREATE CREDENTIALS**」→「**API Key**」
7. 複製產生的 API Key（格式：`AIzaSyXXXXXXX`）
8. 建議點「限制 API Key」→ 限制 API 只能用於 Google Sheets API

---

## 4. 部署 Google Apps Script 代理

這個步驟讓 App 能夠「寫入」資料到 Google Sheets（新增、刪除、更新）。

### 4.1 開啟 Apps Script

1. 打開你的 Google 試算表
2. 上方選單 → **擴充功能** → **Apps Script**

### 4.2 貼入腳本

1. 刪除編輯器中所有預設內容
2. 開啟專案根目錄的 **`apps-script-template.js`**，全選複製內容
3. 貼入 Apps Script 編輯器，點左上角💾儲存

### 4.3 部署為 Web App

1. 右上角點「**部署**」→「**新增部署作業**」
2. 點⚙️齒輪選「**網路應用程式**」
3. 設定如下：
   - **說明**：毛毛先生代理
   - **以誰的身分執行**：**我（你的帳號）**
   - **誰可以存取**：**所有人**
4. 點「**部署**」
5. 系統會要求授權，點「授予存取權」→ 選你的帳號 → 進階 → 繼續 → 允許
6. 複製「**網路應用程式**」網址（格式：`https://script.google.com/macros/s/XXXXX/exec`）

> ⚠️ **每次修改腳本後**，需要「部署」→「管理部署作業」→「✏️ 編輯」→ 版本選「新版本」→「部署」，才能讓修改生效。

---

## 5. 啟用 GitHub Pages 自動部署

1. 打開你 Fork 後的 GitHub Repo
2. 上方 → **Settings** → 左側 **Pages**
3. **Source** 選「**GitHub Actions**」
4. 回到 **Actions** 確認 workflow 啟動（或 push 一個 commit 觸發）
5. 部署完成後，你的 App 網址格式為：
   ```
   https://YOUR_USERNAME.github.io/maomao/
   ```

---

## 6. 填入 App 設定

開啟你的毛毛先生網址，第一次進入會直接跳到設定頁面。

填入以下資料：

| 欄位 | 填入內容 |
|------|----------|
| **Google Sheet ID** | 試算表網址中 `/d/` 和 `/edit` 之間的字串 |
| **Google Sheets API Key** | 第 3 步取得的 `AIzaSyXXX` |
| **Google Apps Script 網址** | 第 4 步取得的 `https://script.google.com/...` |
| **Anthropic API Key** | 第 7 步取得（選填，AI 功能需要）|

點「**儲存設定**」，然後「**測試 Google Sheets 連線**」確認讀取正常。

> 💡 **Sheet ID 在哪？** 
> 試算表網址範例：`https://docs.google.com/spreadsheets/d/`**`1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms`**`/edit`
> 粗體部分就是 Sheet ID。

---

## 7. 取得 Anthropic API Key（選填）

AI 聊天、晨間簡報、週報功能需要此 Key。

1. 前往 [console.anthropic.com](https://console.anthropic.com/)
2. 登入或註冊帳號
3. 左側 → **API Keys** → **Create Key**
4. 複製 Key（格式：`sk-ant-XXXXX`）
5. 填入 App 設定頁面的「Anthropic API Key」欄位

---

## 常見問題

### Q: 讀取失敗，顯示 403 錯誤？
→ 確認試算表已設定「知道連結的任何人可檢視」（步驟 2 末段）

### Q: 新增任務失敗？
→ 確認 Apps Script 已部署，且 App 設定頁已填入正確的 Apps Script 網址

### Q: AI 功能沒有反應？
→ 確認 Anthropic API Key 正確，且帳號有足夠額度

### Q: PWA 無法安裝到手機？
→ 確認使用 HTTPS 網址（GitHub Pages 預設是 HTTPS），並等待 Service Worker 完成安裝

### Q: 修改 Apps Script 後功能沒更新？
→ 必須重新部署新版本（見步驟 4.3 注意事項）

---

## 安全性說明

- 所有 API Key 只儲存在**你自己瀏覽器的 localStorage**，不會傳送給毛毛先生的任何伺服器
- Google Apps Script 只會對你自己的試算表執行操作
- Anthropic API 直接從你的瀏覽器呼叫，毛毛先生不會看到你的對話內容
