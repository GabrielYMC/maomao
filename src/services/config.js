const KEYS = {
  sheetId: 'maomao_sheet_id',
  googleApiKey: 'maomao_google_api_key',
  anthropicApiKey: 'maomao_anthropic_api_key',
}

export function getConfig() {
  return {
    sheetId: localStorage.getItem(KEYS.sheetId) || '',
    googleApiKey: localStorage.getItem(KEYS.googleApiKey) || '',
    anthropicApiKey: localStorage.getItem(KEYS.anthropicApiKey) || '',
  }
}

export function saveConfig({ sheetId, googleApiKey, anthropicApiKey }) {
  localStorage.setItem(KEYS.sheetId, sheetId)
  localStorage.setItem(KEYS.googleApiKey, googleApiKey)
  localStorage.setItem(KEYS.anthropicApiKey, anthropicApiKey)
}

export function isConfigured() {
  const cfg = getConfig()
  return !!(cfg.sheetId && cfg.googleApiKey)
}
