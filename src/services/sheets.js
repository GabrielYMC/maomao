import { getConfig } from './config.js'

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

export async function sheetAppend(sheet, row) {
  const { base, key } = getBase()
  const url = `${base}/${encodeURIComponent(sheet + '!A1')}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS&key=${key}`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ values: [row] }),
  })
  if (!res.ok) {
    const err = await res.text()
    console.error('sheetAppend error:', err)
    throw new Error(err)
  }
  return res.json()
}
