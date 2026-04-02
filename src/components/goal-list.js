import { sheetGet, sheetAppend, sheetUpdate } from '../services/sheets.js'
import { genId, today } from '../utils/helpers.js'
import { setSyncStatus } from './sync-bar.js'
import { appendMsg } from './chat.js'

function esc(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export async function loadGoals() {
  try {
    const rows = await sheetGet('Goals!A2:G')
    const list = document.getElementById('goal-list')
    if (!rows.length) {
      list.innerHTML = '<div class="loading">還沒有目標，新增一個吧！</div>'
      document.getElementById('stat-goals').textContent = '0'
      return
    }
    list.innerHTML = ''
    document.getElementById('stat-goals').textContent = rows.length
    const colors = ['var(--accent-coral)', 'var(--accent-gold)', 'var(--accent-sage)', 'var(--accent-dusty)']
    rows.forEach((r, i) => {
      const [id, title, category, progress, deadline] = r
      const pct = Math.min(100, Math.max(0, parseInt(progress) || 0))
      const item = document.createElement('div')
      item.className = 'goal-item fade-in'
      item.innerHTML = `
        <div class="goal-header">
          <div class="goal-name">${esc(title)}</div>
          <div class="goal-actions">
            <span class="goal-pct">${pct}%</span>
            <button class="goal-update-btn" data-goal-id="${esc(id)}" data-goal-pct="${pct}" title="更新進度">✏️</button>
          </div>
        </div>
        <div class="goal-bar-bg"><div class="goal-bar" style="width:${pct}%;background:${colors[i % colors.length]}"></div></div>
        <div class="goal-tag">${esc(category || '')}${deadline ? ' · ' + esc(deadline) : ''}</div>`
      list.appendChild(item)
    })
  } catch (e) {
    console.error('loadGoals failed:', e)
    document.getElementById('goal-list').innerHTML =
      `<div class="loading" style="color:var(--accent-coral)">目標讀取失敗：${esc(e.message)}</div>`
  }
}

export function initGoalEvents() {
  // 新增目標 Modal
  document.getElementById('btn-add-goal').addEventListener('click', () => {
    document.getElementById('g-title').value = ''
    document.getElementById('g-deadline').value = ''
    document.getElementById('modal-goal').style.display = 'flex'
  })
  document.getElementById('btn-cancel-goal').addEventListener('click', () => {
    document.getElementById('modal-goal').style.display = 'none'
  })
  document.getElementById('btn-confirm-goal').addEventListener('click', confirmAdd)

  // 更新進度按鈕（事件委派）
  document.getElementById('goal-list').addEventListener('click', (e) => {
    const btn = e.target.closest('.goal-update-btn')
    if (!btn) return
    document.getElementById('gu-id').value = btn.dataset.goalId
    document.getElementById('gu-progress').value = btn.dataset.goalPct
    document.getElementById('modal-goal-update').style.display = 'flex'
  })

  // 更新進度 Modal
  document.getElementById('btn-cancel-goal-update').addEventListener('click', () => {
    document.getElementById('modal-goal-update').style.display = 'none'
  })
  document.getElementById('btn-confirm-goal-update').addEventListener('click', confirmUpdate)
}

async function confirmUpdate() {
  const id = document.getElementById('gu-id').value
  const raw = parseInt(document.getElementById('gu-progress').value)
  if (isNaN(raw) || raw < 0 || raw > 100) { alert('請輸入 0 到 100 之間的數字'); return }
  document.getElementById('modal-goal-update').style.display = 'none'
  setSyncStatus('syncing', '更新進度中…')
  try {
    // progress 是第 4 欄
    await sheetUpdate('Goals', id, 4, String(raw))
    setSyncStatus('ok', '進度已更新 ✓')
    await loadGoals()
    appendMsg('mao', raw === 100 ? '目標達成了！！超棒的 🎉' : `進度更新到 ${raw}%，繼續加油 💪`)
  } catch (e) {
    setSyncStatus('error', '更新失敗：' + e.message)
    appendMsg('mao', '更新失敗，請確認 Apps Script 網址有設定好喔。')
  }
}

async function confirmAdd() {
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
    setSyncStatus('error', '新增失敗')
    appendMsg('mao', '新增失敗，請確認設定頁面的 Apps Script 網址有填入。')
  }
}
