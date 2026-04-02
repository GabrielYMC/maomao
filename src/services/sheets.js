import { getConfig } from './config.js'
import { scriptAction } from './script.js'

function getBase() {
  const { sheetId, googleApiKey } = getConfig()
  if (!sheetId || !googleApiKey) {
    throw new Error('請先到設定頁面填入 Google Sheet ID 和 API Key')
  }
  return {
    base: `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values`,
    key: googleApiKey,
  }
}

/** 讀取（使用 API Key，需 Sheet 為公開可讀） */
export async function sheetGet(range) {
  const { base, key } = getBase()
  const url = `${base}/${encodeURIComponent(range)}?key=${key}`
  const res = await fetch(url)
  if (!res.ok) {
    const err = await res.text()
    console.error('sheetGet error:', err)
    throw new Error(err)
  }
  const data = await res.json()
  return data.values || []
}

/** 新增一列（透過 Apps Script） */
export async function sheetAppend(sheet, row) {
  return scriptAction({ action: 'append', sheet, row })
}

/** 更新某列的單一欄位（透過 Apps Script）
 * @param {string} sheet 工作表名稱
 * @param {string} id    第一欄 ID 值
 * @param {number} col   欄號（1-indexed，例如 status 欄是 3）
 * @param {string} value 新值
 */
export async function sheetUpdate(sheet, id, col, value) {
  return scriptAction({ action: 'update', sheet, id, col, value })
}

/** 刪除指定 ID 的列（透過 Apps Script） */
export async function sheetDelete(sheet, id) {
  return scriptAction({ action: 'delete', sheet, id })
}
