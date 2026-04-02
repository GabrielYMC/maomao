import { sheetGet, sheetAppend } from '../services/sheets.js'
import { today } from '../utils/helpers.js'
import { setSyncStatus } from './sync-bar.js'
import { appendMsg } from './chat.js'

export let lastMoodScore = 0

export async function loadMoodCount() {
  try {
    const rows = await sheetGet('MoodLog!A2:E')
    const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7)
    const count = rows.filter(r => r[0] && new Date(r[0]) >= weekAgo).length
    document.getElementById('stat-mood').textContent = count

    // 最近一次心情分數（供晨間簡報使用）
    const sorted = rows.filter(r => r[0]).sort((a, b) => (b[0] > a[0] ? 1 : -1))
    lastMoodScore = sorted.length ? (parseInt(sorted[0][1]) || 0) : 0

    // 連續打卡天數
    document.getElementById('streak-num').textContent = calcStreak(rows)
    return { count, lastMoodScore }
  } catch { return { count: 0, lastMoodScore: 0 } }
}

function calcStreak(rows) {
  if (!rows.length) return 0
  const dates = new Set(rows.map(r => (r[0] || '').trim()).filter(Boolean))
  let streak = 0
  const check = new Date(); check.setHours(0, 0, 0, 0)
  if (!dates.has(check.toISOString().split('T')[0])) check.setDate(check.getDate() - 1)
  while (streak < 365) {
    const d = check.toISOString().split('T')[0]
    if (!dates.has(d)) break
    streak++; check.setDate(check.getDate() - 1)
  }
  return streak
}

export function initSidebarEvents() {
  // 心情選擇
  document.getElementById('mood-emojis').addEventListener('click', (e) => {
    const btn = e.target.closest('.mood-btn')
    if (!btn) return
    document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('selected'))
    btn.classList.add('selected')
    // 顯示文字備注輸入框
    const noteArea = document.getElementById('mood-note-area')
    noteArea.style.display = 'block'
    document.getElementById('mood-note-input').value = ''
    document.getElementById('mood-note-input').focus()
    // 暫存選擇的分數
    noteArea.dataset.score = btn.dataset.score
  })

  // 心情備注 Enter 儲存
  document.getElementById('mood-note-input').addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return
    e.preventDefault()
    saveMood()
  })

  // 點擊備注外側也會觸發儲存（blur 時）
  document.getElementById('mood-note-input').addEventListener('blur', () => {
    const noteArea = document.getElementById('mood-note-area')
    if (noteArea.style.display !== 'none') saveMood()
  })

  // 導覽切換
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'))
      item.classList.add('active')
      const view = item.dataset.view
      document.getElementById('view-dashboard').style.display = view === 'settings' ? 'none' : ''
      document.getElementById('view-settings').style.display = view === 'settings' ? '' : 'none'
      document.getElementById('chat-area').style.display = view === 'settings' ? 'none' : ''
      closeMobileSidebar()
    })
  })

  document.getElementById('hamburger-btn').addEventListener('click', () => {
    document.getElementById('sidebar').classList.add('open')
    document.getElementById('sidebar-overlay').classList.add('visible')
  })
  document.getElementById('sidebar-overlay').addEventListener('click', closeMobileSidebar)
}

function closeMobileSidebar() {
  document.getElementById('sidebar').classList.remove('open')
  document.getElementById('sidebar-overlay').classList.remove('visible')
}

async function saveMood() {
  const noteArea = document.getElementById('mood-note-area')
  const score = noteArea.dataset.score
  if (!score) return
  noteArea.style.display = 'none'
  noteArea.dataset.score = ''
  const note = document.getElementById('mood-note-input').value.trim()
  const emojis = ['', '😔', '😕', '😐', '🙂', '😄']
  setSyncStatus('syncing', '儲存心情中…')
  try {
    await sheetAppend('MoodLog', [today(), score, emojis[score], note, ''])
    setSyncStatus('ok', '心情已儲存 ✓')
    const msg = parseInt(score) >= 4
      ? '心情不錯呢！今天繼續保持 😊'
      : note ? `嗯，我聽到了。「${note}」，要說說為什麼嗎？` : '有什麼讓你不開心的嗎？可以說說看。'
    appendMsg('mao', msg)
    await loadMoodCount()
  } catch { setSyncStatus('error', '儲存失敗') }
}
