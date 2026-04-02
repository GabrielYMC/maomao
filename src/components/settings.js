import { getConfig, saveConfig } from '../services/config.js'
import { sheetGet } from '../services/sheets.js'

export function initSettingsEvents() {
  const cfg = getConfig()
  document.getElementById('cfg-sheet-id').value = cfg.sheetId
  document.getElementById('cfg-google-key').value = cfg.googleApiKey
  document.getElementById('cfg-anthropic-key').value = cfg.anthropicApiKey
  document.getElementById('cfg-script-url').value = cfg.scriptUrl

  document.getElementById('btn-settings-save').addEventListener('click', handleSave)
  document.getElementById('btn-settings-test').addEventListener('click', handleTest)
}

function showStatus(msg, type) {
  const el = document.getElementById('settings-status')
  el.className = `settings-status ${type}`
  el.textContent = msg
}

function handleSave() {
  saveConfig({
    sheetId: document.getElementById('cfg-sheet-id').value.trim(),
    googleApiKey: document.getElementById('cfg-google-key').value.trim(),
    anthropicApiKey: document.getElementById('cfg-anthropic-key').value.trim(),
    scriptUrl: document.getElementById('cfg-script-url').value.trim(),
  })
  showStatus('設定已儲存！重新載入頁面即可生效。', 'success')
}

async function handleTest() {
  const sheetId = document.getElementById('cfg-sheet-id').value.trim()
  const googleKey = document.getElementById('cfg-google-key').value.trim()

  if (!sheetId || !googleKey) {
    showStatus('請先填入 Google Sheet ID 和 API Key', 'error')
    return
  }

  saveConfig({
    sheetId,
    googleApiKey: googleKey,
    anthropicApiKey: document.getElementById('cfg-anthropic-key').value.trim(),
    scriptUrl: document.getElementById('cfg-script-url').value.trim(),
  })

  try {
    showStatus('測試連線中…', 'success')
    await sheetGet('Tasks!A1:A1')
    showStatus('✓ 連線成功！Google Sheets 可正常讀取。', 'success')
  } catch (e) {
    showStatus(`連線失敗：${e.message}`, 'error')
  }
}

export function showSettingsIfNeeded() {
  const cfg = getConfig()
  if (!cfg.sheetId || !cfg.googleApiKey) {
    document.getElementById('view-dashboard').style.display = 'none'
    document.getElementById('view-settings').style.display = ''
    document.getElementById('chat-area').style.display = 'none'
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'))
    document.querySelector('.nav-item[data-view="settings"]').classList.add('active')
    return true
  }
  return false
}
