import { getConfig } from './config.js'

/**
 * 所有寫入操作（新增/更新/刪除）都透過 Google Apps Script Web App 代理，
 * 因為 Google Sheets API 的 API Key 僅支援讀取，無法執行寫入。
 */
export async function scriptAction(payload) {
  const { scriptUrl, sheetId } = getConfig()
  if (!scriptUrl) {
    throw new Error('請先到設定頁面填入 Apps Script 網址才能儲存資料')
  }

  const res = await fetch(scriptUrl, {
    method: 'POST',
    redirect: 'follow',
    // 使用 text/plain 避免觸發 CORS preflight（Apps Script 不支援 OPTIONS）
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ ...payload, sheetId }),
  })

  const text = await res.text()
  try {
    const json = JSON.parse(text)
    if (json.error) throw new Error(json.error)
    return json
  } catch (parseErr) {
    if (parseErr.message && !parseErr.message.startsWith('JSON')) throw parseErr
    throw new Error('Apps Script 回應格式錯誤，請確認部署設定是否正確')
  }
}
