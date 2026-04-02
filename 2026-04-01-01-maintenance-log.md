# 2026-04-01 工作日誌

## 工作項目摘要

- **Git 儲存庫初始化與同步**：
    - 在本地目錄成功初始化 Git 儲存庫。
    - 解決了目錄路徑包含特殊字元 `[` 與 `]` 導致的 Git 命令執行錯誤，改用顯式路徑參照。
    - 將遠端位址從 SSH (`git@github.com:...`) 改為 HTTPS (`https://github.com/...`)，成功解決權限驗證問題。
    - 成功將所有專案程式碼推送到 GitHub `main` 分支。
- **專案安全性機制檢查**：
    - 深入分析 `src/services/` 原始碼，確認採取 **BYOK (Bring Your Own Key)** 與 `localStorage` 本地儲存機制。
    - 確認敏感資訊（API 金鑰）完全由使用者端控制，不經由第三方伺服器，保證極高隱私。
- **GitHub Pages 自動化部署設定**：
    - 修正並啟用 GitHub Actions 自動部署流程 (`deploy.yml`)。
    - 將部署環境中使用的 Node.js 版本由 20 更新至 **22 (LTS)**，消除過時警告並提升編譯效能。
    - 引導使用者在 GitHub 設定中將 Pages 來源切換為 GitHub Actions，成功完成網頁部署上線。

## 知識點：GitHub Actions 原理與部署流程

本次部署使用了 GitHub Actions 作為 **CI/CD（持續整合與持續部署）** 的核心工具。以下是專案中 `.github/workflows/deploy.yml` 各個關鍵動作 (Actions) 的功能說明：

1.  **`actions/checkout@v4` (拿程式碼)**：
    - 將倉庫中的原始碼下載至 GitHub 的雲端虛擬機器中，作為後續編譯的基礎。
2.  **`actions/setup-node@v4` (環境建置)**：
    - 在雲端環境安裝 Node.js。本次指派使用 **Node.js 22** 版本，以獲得最佳效能與長期支援 (LTS)。
3.  **`actions/configure-pages@v4` (網頁設定)**：
    - 自動對接 GitHub Pages 的 API 設定，準備下發部署指令。
4.  **`actions/upload-pages-artifact@v3` (成品打包)**：
    - 將 Vite 編譯後的 `dist` 靜態目錄打包成一個「部署包裹 (Artifact)」。
5.  **`actions/deploy-pages@v4` (正式發布)**：
    - 將成品包裹正式部署至 GitHub Pages 服務器，完成網頁上線。

**自動化價值**：透過此設定，開發者僅需執行 `git push`，系統即會自動完成下載、編譯、打包與部署的全自動流程。

## 知識點：RWD 與 PWA 概念解析

本專案同時具備了 **RWD (Responsive Web Design)** 與 **PWA (Progressive Web App)** 兩大現代網頁特性，使其在不同裝置上皆能提供最佳體驗：

1.  **RWD (響應式網頁設計)**：
    - **核心理念**：透過一組程式碼，讓網頁版面隨螢幕寬度自動調整（呈現「變形金剛」般的適應性）。
    - **專案實踐**：在 `src/styles/responsive.css` 中定義了不同斷點 (Breakpoints) 的排列規則，確保專案在寬螢幕電腦與窄螢幕手機上皆具備良好的易讀性與操作性。
2.  **PWA (漸進式網路應用程式)**：
    - **核心理念**：讓網頁「具備 APP 特性的網頁服務」。使用者無需透過 App Store 下載，即可將網頁直接「安裝」至手機主畫面。
    - **專案實踐**：
        - **`public/manifest.json`**：定義了應用程式的名稱、圖示與主題色彩（APP 的名片）。
        - **`public/sw.js` (Service Worker)**：充當「離線機器人」，負責將網頁內容快取至本地。這使得專案支援**離線查看**與**秒開加速**，使用體驗更貼近原生行動 App。

**價值總結**：RWD 解決了「視覺美感」的跨裝置適應，PWA 則提升了「使用性能」與「便利性」，共同打造出高品質的小助理使用體驗。
