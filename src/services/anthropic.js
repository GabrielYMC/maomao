import { getConfig } from './config.js'

const BASE_SYSTEM = `你是毛毛先生，佳穎的溫暖生活小助理。個性活潑開朗、有溫度，偶爾帶點輕鬆幽默。
說話規則：
- 簡潔不囉嗦，說重點
- 主動關心但不過度干涉
- 鼓勵要具體，不說空洞的加油話
- 情緒低落時先傾聽，再視情況給建議
- 不用敬語，像朋友說話
- 回覆用繁體中文
- 遇到醫療或健康問題，可以提供公開資訊整理後的建議，像聰明朋友一樣

【任務新增偵測】
當使用者明確說想新增任務、要記下某件事或幫我記時，在正常回覆後，最後一行加上：
[[TASK:{"title":"任務名稱","priority":"高/中/低","due":"YYYY-MM-DD或空字串"}]]
日常聊天、問問題、心情分享時絕對不要加這個標記。`

/** 一般聊天訊息 */
export async function sendMessage(chatHistory) {
  return callClaude(BASE_SYSTEM, chatHistory)
}

/** 晨間簡報：載入資料後自動生成 */
export async function generateMorningBrief({ date, taskCount, pendingCount, goalCount, moodCount, lastMoodScore }) {
  const prompt = `請用你的風格給佳穎一句溫暖的早晨問候（2-4 句，自然輕鬆不要像報告）。
今天：${date}
任務：共 ${taskCount} 項，還有 ${pendingCount} 項未完成
長期目標：${goalCount} 個進行中
本週心情記錄：${moodCount} 筆${lastMoodScore ? '，最近心情 ' + lastMoodScore + '/5' : ''}`
  return callClaude(BASE_SYSTEM, [{ role: 'user', content: prompt }])
}

/** 每週 AI 回顧 */
export async function generateWeeklyReview({ doneTasks, pendingTasks, goalCount, goalSummary, moodCount, avgMood }) {
  const prompt = `請幫佳穎生成這週的溫暖週報（適當加 emoji，不超過 180 字，自然口吻）。
【任務】完成 ${doneTasks} 件，未完成 ${pendingTasks} 件
【目標】${goalCount} 個目標進行中${goalSummary ? '\n進度：' + goalSummary : ''}
【心情】本週記錄 ${moodCount} 次，平均 ${avgMood}/5
請在最後給一個具體的小建議。`
  return callClaude(BASE_SYSTEM, [{ role: 'user', content: prompt }])
}

async function callClaude(system, messages) {
  const { anthropicApiKey } = getConfig()
  if (!anthropicApiKey) throw new Error('請先到設定頁面填入 Anthropic API Key')
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': anthropicApiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 1000, system, messages }),
  })
  if (!res.ok) { const err = await res.text(); throw new Error(err) }
  const data = await res.json()
  return data.content?.map(b => b.text || '').join('') || '（毛毛先生暫時沒有回應）'
}
