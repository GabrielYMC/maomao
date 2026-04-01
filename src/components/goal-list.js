import { sheetGet, sheetAppend } from '../services/sheets.js'
import { genId, today } from '../utils/helpers.js'
import { setSyncStatus } from './sync-bar.js'
import { appendMsg } from './chat.js'

export async function loadGoals() {
  try {
    const rows = await sheetGet('Goals!A2:G')
    const list = document.getElementById('goal-list')
    if (!rows.length) {
      list.innerHTML = '<div class="loading">還沒有目標，新增一個吧！</div>'
      return
    }
    list.innerHTML = ''
    document.getElementById('stat-goals').textContent = rows.length
    const colors = ['var(--accent-coral)', 'var(--accent-gold)', 'var(--accent-sage)', 'var(--accent-dusty)']
    rows.forEach((r, i) => {
      const [id, title, category, progress, deadline] = r
      const pct = parseInt(progress) || 0
      const item = document.createElement('div')
      item.className = 'goal-item fade-in'
      item.innerHTML = `
        <div class="goal-header">
          <div class="goal-name">${title || ''}</div>
          <div class="goal-pct">${pct}%</div>
        </div>
        <div class="goal-bar-bg"><div class="goal-bar" style="width:${pct}%;background:${colors[i % colors.length]}"></div></div>
        <div class="goal-tag">${category || ''} ${deadline ? '· ' + deadline : ''}</div>`
      list.appendChild(item)
    })
  } catch (e) { /* error already shown in loadTasks */ }
}

export function initGoalEvents() {
  document.getElementById('btn-add-goal').addEventListener('click', () => {
    document.getElementById('modal-goal').style.display = 'flex'
  })
  document.getElementById('btn-cancel-goal').addEventListener('click', () => {
    document.getElementById('modal-goal').style.display = 'none'
  })
  document.getElementById('btn-confirm-goal').addEventListener('click', confirmAddGoal)
}

async function confirmAddGoal() {
  const title = document.getElementById('g-title').value.trim()
  if (!title) { alert('請填入目標名稱'); return }
  const category = document.getElementById('g-category').value
  const deadline = document.getElementById('g-deadline').value
  document.getElementById('modal-goal').style.display = 'none'
  setSyncStatus('syncing', '新增目標到 Sheets…')
  try {
    await sheetAppend('Goals', [genId(), title, category, '0', deadline, today(), today()])
    setSyncStatus('ok', '目標已新增 ✓')
    await loadGoals()
    appendMsg('mao', `「${title}」這個目標很棒！我們一起追蹤進度 🎯`)
  } catch (e) {
    setSyncStatus('error', '新增失敗，請確認設定')
  }
}
