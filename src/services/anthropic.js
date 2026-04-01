import { getConfig } from './config.js'

const SYSTEM_PROMPT = `你是毛毛先生，佳穎的溫暖生活小助理。個性活潑開朗、有溫度，偶爾帶點輕鬆幽默。
說話規則：
- 簡潔不囉嗦，說重點
- 主動關心但不過度干涉
- 鼓勵要具體，不說空洞的加油話
- 情緒低落時先傾聽，再視情況給建議
- 不用敬語，像朋友說話
- 回覆用繁體中文
- 遇到醫療或健康問題，可以提供公開資訊整理後的建議，像聰明朋友一樣`

export async function sendMessage(chatHistory) {
  const { anthropicApiKey } = getConfig()
  if (!anthropicApiKey) {
    throw new Error('請先到設定頁面填入 Anthropic API Key')
  }

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': anthropicApiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: SYSTEM_PROMPT,
      messages: chatHistory,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error('Anthropic API error:', err)
    throw new Error(err)
  }

  const data = await res.json()
  return data.content?.map(b => b.text || '').join('') || '（毛毛先生暫時沒有回應）'
}
