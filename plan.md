# 毛毛先生 PWA — 功能規劃與排錯分析報告

## 一、專案概覽

「毛毛先生」是一款以 **BYOK (Bring Your Own Key)** 架構打造的個人生活小助理 PWA，核心功能包括：

| 模組 | 資料來源 | 功能 |
|------|----------|------|
| 任務清單 | Google Sheets (Tasks) | 新增/勾選任務 |
| 長期目標 | Google Sheets (Goals) | 新增目標、進度條顯示 |
| 心情紀錄 | Google Sheets (MoodLog) | emoji 心情記錄 |
| AI 聊天 | Anthropic API (Claude) | 溫暖對話互動 |
| 連續打卡 | 側邊欄顯示 | 顯示 streak（未接通資料） |

---

## 二、功能缺口分析：應有但尚未加入的功能

### 🔴 P0 — 核心缺失（影響基本使用體驗）

#### 1. 任務刪除/編輯功能
目前任務只能「新增」和「勾選完成」（且勾選只是前端 toggle 不寫回 Sheets），**無法刪除、編輯任務內容、修改截止日期或優先級**。對一個任務管理工具來說，這是基本必備功能。

#### 2. 目標進度更新功能
目標新增後進度永遠是 0%，**沒有任何 UI 可以更新進度**。進度條淪為裝飾品。

#### 3. 連續打卡 (Streak) 資料接通
側邊欄的「天連續打卡 🔥」永遠顯示「—」，**沒有任何程式碼計算連續打卡天數**（`loadMoodCount` 只統計心情筆數，不計算 streak）。

#### 4. 任務完成狀態寫回 Sheets
目前勾選任務完成只是 **前端 DOM toggle**（`task-list.js:52-53`），不會寫回 Google Sheets。重新載入頁面後，狀態會重置。

### 🟡 P1 — 體驗提升（對一個生活助理 PWA 很重要）

#### 5. 通知與提醒系統
PWA 可使用 Notification API + Service Worker 推播。作為一個任務管理/生活助理 APP，**到期提醒、每日打卡提醒**是非常典型的功能：
- 任務截止日提醒
- 每日心情記錄提醒
- 目標里程碑提醒

#### 6. 離線支援與本地資料快取
現有的 Service Worker (`sw.js`) 只快取了 `./` 和 `./index.html` 兩個檔案，**未快取 JS/CSS 打包檔**。離線時也完全無法使用任何功能（因為資料完全依賴 Google Sheets API），應設計 **離線暫存 + 上線同步** 的機制。

#### 7. 資料匯出/備份功能
所有資料存在 Google Sheets 中，但使用者可能想要：
- JSON/CSV 格式匯出
- 週報/月報摘要產出（搭配 AI 功能特別適合）

#### 8. 心情紀錄歷史查看
目前只能「記錄」心情，看不到歷史。應有：
- 心情日曆/時間軸視圖
- 週/月心情趨勢圖表
- 心情搭配備忘文字

### 🟢 P2 — 功能擴展（讓產品更完善）

#### 9. 深色模式 (Dark Mode)
具備 CSS 變數架構，加入 dark mode 非常容易，且是現代 PWA 的標配。

#### 10. 聊天紀錄持久化
目前 `chatHistory` 是記憶體陣列，**關閉/重整頁面後聊天記錄全部消失**。應持久化到 `localStorage` 或 Google Sheets。

#### 11. 使用者名稱可自訂
目前 UI 硬編碼了「佳穎」這個名字（出現在問候語、AI 系統提示詞等多處），應改為可在設定中自訂。

#### 12. 多語系支援 (i18n)
雖然目前就是單純的繁體中文，但若希望分享給其他人使用，可考慮抽出語言包。

---

## 三、程式碼排錯報告

### 🔴 嚴重問題

#### Bug #1：Google Sheets API 寫入權限問題（`sheetAppend` 無法真正運作）
- **檔案**：[sheets.js](file:///c:/Users/Gabriel%20Chen/Desktop/%5Bpr%5Dmaomao_v2/src/services/sheets.js#L27-L41)
- **問題**：`sheetAppend` 使用 API Key 進行 POST 請求（寫入操作）。然而，**Google Sheets API 的 API Key 僅支援讀取 (GET) 操作**，寫入（`append`）必須使用 **OAuth 2.0 授權**。目前的實作在呼叫 `sheetAppend` 時必定會收到 `403 Forbidden` 或 `401 Unauthorized` 錯誤。
- **影響**：**所有寫入功能（新增任務、新增目標、儲存心情）都無法正常運作。**

#### Bug #2：XSS 安全漏洞
- **檔案**：[chat.js](file:///c:/Users/Gabriel%20Chen/Desktop/%5Bpr%5Dmaomao_v2/src/components/chat.js#L12-L14)、[task-list.js](file:///c:/Users/Gabriel%20Chen/Desktop/%5Bpr%5Dmaomao_v2/src/components/task-list.js#L23-L31)、[goal-list.js](file:///c:/Users/Gabriel%20Chen/Desktop/%5Bpr%5Dmaomao_v2/src/components/goal-list.js#L22-L28)
- **問題**：多處使用 `innerHTML` 直接插入來自 Google Sheets 或使用者輸入的文字，**未經任何 HTML 跳脫 (escaping)**。如果 Sheets 中有人寫入 `<script>alert(1)</script>` 或 `<img onerror=alert(1)>` 之類的內容，就會觸發 XSS。
- **影響**：雖然是個人使用的 BYOK 工具，但 AI 回覆內容也可能包含 HTML 標籤，仍有風險。

#### Bug #3：Service Worker 路徑在 GitHub Pages 會失敗
- **檔案**：[main.js](file:///c:/Users/Gabriel%20Chen/Desktop/%5Bpr%5Dmaomao_v2/src/main.js#L48)
- **問題**：`navigator.serviceWorker.register('/sw.js')` 使用絕對路徑 `/sw.js`。但部署在 GitHub Pages 時，實際路徑是 `/maomao_v2/sw.js`（帶有 repo 子目錄），導致 **Service Worker 註冊失敗**。
- **解法**：應改為 `'./sw.js'`，與 `vite.config.js` 設定的 `base: './'` 保持一致。

#### Bug #4：Manifest 路徑同樣在 GitHub Pages 會失敗
- **檔案**：[index.html](file:///c:/Users/Gabriel%20Chen/Desktop/%5Bpr%5Dmaomao_v2/index.html#L7)
- **問題**：`<link rel="manifest" href="/manifest.json">` 使用絕對路徑。同 Bug #3，部署在子目錄時會 404。
- **解法**：改為 `href="./manifest.json"`。

### 🟡 中等問題

#### Bug #5：Manifest 中 icon 路徑也是絕對路徑
- **檔案**：[manifest.json](file:///c:/Users/Gabriel%20Chen/Desktop/%5Bpr%5Dmaomao_v2/public/manifest.json#L11-L18)
- **問題**：`"src": "/icons/icon-192.svg"` 使用絕對路徑。同理，在 GitHub Pages 子目錄部署會 404。
- **解法**：改為 `"src": "./icons/icon-192.svg"`。

#### Bug #6：Apple Touch Icon 路徑問題
- **檔案**：[index.html](file:///c:/Users/Gabriel%20Chen/Desktop/%5Bpr%5Dmaomao_v2/index.html#L11)
- **問題**：`<link rel="apple-touch-icon" href="/icons/icon-192.svg">` — 同上，子目錄部署會失效。

#### Bug #7：`sync-bar.js` 模組頂層直接查詢 DOM
- **檔案**：[sync-bar.js](file:///c:/Users/Gabriel%20Chen/Desktop/%5Bpr%5Dmaomao_v2/src/components/sync-bar.js#L1-L2)
- **問題**：`const dot = document.getElementById('sync-dot')` 和 `const txt = document.getElementById('sync-status')` 在模組頂層執行。然而 ES Module 的載入時機可能早於 DOM 完全解析（雖然目前 `<script>` 放在 `</body>` 前，看起來是安全的，但這是一個隱性的「計時炸彈」——一旦有人改變 script 位置就會壞掉）。
- **建議**：應使用懶初始化或在 function 內查詢 DOM。

#### Bug #8：`loadGoals` 的 catch 區塊默默吞掉錯誤
- **檔案**：[goal-list.js](file:///c:/Users/Gabriel%20Chen/Desktop/%5Bpr%5Dmaomao_v2/src/components/goal-list.js#L31)
- **問題**：`catch (e) { /* error already shown in loadTasks */ }` — 但如果只有 Goals sheet 有問題而 Tasks 正常呢？使用者完全看不到任何錯誤訊息。

#### Bug #9：`chat-input` 應該是 `<textarea>` 而非 `<input>`
- **檔案**：[index.html](file:///c:/Users/Gabriel%20Chen/Desktop/%5Bpr%5Dmaomao_v2/index.html#L162)
- **問題**：聊天輸入框是 `<input>` 標籤，但程式碼在 `chat.js:70` 會插入換行符 `\n` 到 input 的 value 中。**`<input>` 不會顯示換行**，使用者看到的是一段擠在一起的文字，體驗不佳。
- **解法**：改為 `<textarea>`。

### 🟢 輕微問題

#### Bug #10：`getGreeting()` 的 emoji 與問候語不匹配
- **檔案**：[dashboard.js](file:///c:/Users/Gabriel%20Chen/Desktop/%5Bpr%5Dmaomao_v2/src/components/dashboard.js#L7)
- **問題**：`greeting.textContent = `${getGreeting()}，佳穎 ☀️``。不管是早安、午安還是晚安，emoji 永遠是 ☀️（太陽）。晚安配太陽有點奇怪。

#### Bug #11：`maomao_v2.html` 殘留舊版檔案
- **檔案**：[maomao_v2.html](file:///c:/Users/Gabriel%20Chen/Desktop/%5Bpr%5Dmaomao_v2/maomao_v2.html)
- **問題**：根目錄有一個 29KB 的 `maomao_v2.html` 殘留檔案，應該是重構前的舊版。建議從 repo 移除以避免混淆。

---

## 四、問題優先級摘要

| 優先級 | 項目 | 類型 |
|--------|------|------|
| 🔴 P0 | Bug #1：Sheets API 寫入用 API Key 無法運作 | Bug |
| 🔴 P0 | Bug #2：XSS 安全漏洞 | Bug |
| 🔴 P0 | Bug #3：SW 路徑在 GitHub Pages 失敗 | Bug |
| 🔴 P0 | Bug #4：Manifest 路徑問題 | Bug |
| 🔴 P0 | 功能 #1：任務刪除/編輯 | 功能缺口 |
| 🔴 P0 | 功能 #4：任務完成狀態寫回 Sheets | 功能缺口 |
| 🟡 P1 | Bug #5/6：Icon 路徑問題 | Bug |
| 🟡 P1 | Bug #7：sync-bar DOM 查詢時機 | Bug |
| 🟡 P1 | Bug #8：Goals 錯誤被吞掉 | Bug |
| 🟡 P1 | Bug #9：聊天輸入框應為 textarea | Bug |
| 🟡 P1 | 功能 #2：目標進度更新 | 功能缺口 |
| 🟡 P1 | 功能 #3：打卡 Streak 資料接通 | 功能缺口 |
| 🟡 P1 | 功能 #5：通知與提醒 | 功能缺口 |
| 🟡 P1 | 功能 #6：離線支援強化 | 功能缺口 |
| 🟢 P2 | Bug #10：問候語 emoji 不匹配 | Bug |
| 🟢 P2 | Bug #11：殘留舊版檔案 | Bug |
| 🟢 P2 | 功能 #7-12：匯出、歷史查看、深色模式等 | 功能缺口 |

## Open Questions

> [!IMPORTANT]
> **Bug #1 是最關鍵的問題**：Google Sheets API Key 無法執行寫入操作。要修復這個問題有兩條路：
> 1. **改用 OAuth 2.0** — 需要設定 Google Cloud Console 的 OAuth consent screen 和 redirect URI，複雜度較高但功能完整。
> 2. **改用 Google Apps Script 作為 proxy** — 部署一個 Apps Script Web App 來接收 POST 請求並寫入 Sheet，對使用者更簡單。
> 
> 你希望我先修哪些問題？要全部修還是先處理特定的？

> [!IMPORTANT]
> 功能規劃部分，你希望我先實作哪幾項？我建議先處理 P0 級別的功能缺口（任務編輯/刪除、狀態回寫、Streak 計算）。
