import { formatDate, getGreeting } from '../utils/helpers.js'
import { generateWeeklyReview } from '../services/anthropic.js'
import { sheetGet } from '../services/sheets.js'
import { appendMsg } from './chat.js'
import { setSyncStatus } from './sync-bar.js'

const GREETING_EMOJI = { '早安': '☀️', '午安': '🌤️', '晚安': '🌙' }

export function initDashboard() {
  document.getElementById('date-display').textContent = formatDate()
  const g = getGreeting()
  document.querySelector('.dash-greeting').textContent = `${g}，佳穎 ${GREETING_EMOJI[g] || '✨'}`
  document.getElementById('btn-weekly-review').addEventListener('click', handleWeeklyReview)
}

async function handleWeeklyReview() {
  const btn = document.getElementById('btn-weekly-review')
  btn.disabled = true
  btn.textContent = '生成中…'
  setSyncStatus('syncing', '生成週報中…')
  try {
    const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7)
    const [taskRows, goalRows, moodRows] = await Promise.all([
      sheetGet('Tasks!A2:G'),
      sheetGet('Goals!A2:G'),
      sheetGet('MoodLog!A2:E'),
    ])
    const recentMoods = moodRows.filter(r => r[0] && new Date(r[0]) >= weekAgo)
    const avgMood = recentMoods.length
      ? (recentMoods.reduce((s, r) => s + (parseInt(r[1]) || 0), 0) / recentMoods.length).toFixed(1)
      : '—'
    const review = await generateWeeklyReview({
      doneTasks: taskRows.filter(r => r[2] === '完成').length,
      pendingTasks: taskRows.filter(r => r[2] !== '完成').length,
      goalCount: goalRows.length,
      goalSummary: goalRows.map(r => `${r[1] || ''}（${r[3] || 0}%）`).join('、'),
      moodCount: recentMoods.length,
      avgMood,
    })
    setSyncStatus('ok', '週報已生成')
    appendMsg('mao', '📊 **本週回顧**\n\n' + review)
  } catch (e) {
    setSyncStatus('error', '生成失敗')
    appendMsg('mao', '週報生成失敗了，請確認 Anthropic API Key 有設定好喔。')
  }
  btn.disabled = false
  btn.textContent = '📊 週報'
}
