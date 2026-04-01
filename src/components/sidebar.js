import { sheetGet, sheetAppend } from '../services/sheets.js'
import { today } from '../utils/helpers.js'
import { setSyncStatus } from './sync-bar.js'
import { appendMsg } from './chat.js'

export async function loadMoodCount() {
  try {
    const rows = await sheetGet('MoodLog!A2:E')
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    const count = rows.filter(r => r[0] && new Date(r[0]) >= weekAgo).length
    document.getElementById('stat-mood').textContent = count
  } catch (e) { /* silent */ }
}

export function initSidebarEvents() {
  // Mood selection
  document.getElementById('mood-emojis').addEventListener('click', (e) => {
    const btn = e.target.closest('.mood-btn')
    if (!btn) return
    selectMood(btn)
  })

  // Nav items - view switching
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'))
      item.classList.add('active')

      const view = item.dataset.view
      document.getElementById('view-dashboard').style.display = view === 'settings' ? 'none' : ''
      document.getElementById('view-settings').style.display = view === 'settings' ? '' : 'none'
      document.getElementById('chat-area').style.display = view === 'settings' ? 'none' : ''

      // Close mobile sidebar
      closeMobileSidebar()
    })
  })

  // Mobile hamburger
  const hamburger = document.getElementById('hamburger-btn')
  const overlay = document.getElementById('sidebar-overlay')
  const sidebar = document.getElementById('sidebar')

  hamburger.addEventListener('click', () => {
    sidebar.classList.add('open')
    overlay.classList.add('visible')
  })

  overlay.addEventListener('click', closeMobileSidebar)
}

function closeMobileSidebar() {
  document.getElementById('sidebar').classList.remove('open')
  document.getElementById('sidebar-overlay').classList.remove('visible')
}

async function selectMood(el) {
  document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('selected'))
  el.classList.add('selected')
  const score = el.dataset.score
  const emojis = ['', '😔', '😕', '😐', '🙂', '😄']
  setSyncStatus('syncing', '儲存心情中…')
  try {
    await sheetAppend('MoodLog', [today(), score, emojis[score], '', ''])
    setSyncStatus('ok', '心情已儲存到 Sheets ✓')
    appendMsg('mao', score >= 4 ? '心情不錯呢！今天繼續保持 😊' : '有什麼讓你不開心的嗎？可以說說看。')
  } catch (e) {
    setSyncStatus('error', '儲存失敗')
  }
}
