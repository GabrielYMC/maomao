import { sheetGet, sheetAppend } from '../services/sheets.js'
import { genId, today } from '../utils/helpers.js'
import { setSyncStatus } from './sync-bar.js'
import { appendMsg } from './chat.js'

export async function loadTasks() {
  try {
    const rows = await sheetGet('Tasks!A2:G')
    const list = document.getElementById('task-list')
    if (!rows.length) {
      list.innerHTML = '<div class="loading">還沒有任務，新增一個吧！</div>'
      return
    }
    list.innerHTML = ''
    let done = 0
    rows.forEach(r => {
      const [id, title, status, priority, due] = r
      const isDone = status === '完成'
      if (isDone) done++
      const item = document.createElement('div')
      item.className = 'task-item fade-in'
      const tagClass = priority === '高' ? 'tag-high' : priority === '低' ? 'tag-low' : 'tag-mid'
      item.innerHTML = `
        <div class="task-check ${isDone ? 'done' : ''}" data-task-id="${id}"></div>
        <div>
          <div class="task-text ${isDone ? 'done' : ''}">${title || ''}</div>
          <div class="task-meta">
            <span class="task-tag ${tagClass}">${priority || '中'}</span>
            ${due ? `<span class="task-due">${due}</span>` : ''}
          </div>
        </div>`
      list.appendChild(item)
    })
    const total = rows.length
    const remaining = total - done
    document.getElementById('stat-tasks').textContent = total
    document.getElementById('stat-tasks-sub').textContent =
      remaining > 0 ? `還有 ${remaining} 項未完成` : '全部完成了 🎉'
  } catch (e) {
    console.error('loadTasks failed:', e)
    document.getElementById('task-list').innerHTML =
      `<div class="loading" style="color:var(--accent-coral)">讀取失敗：${e.message}<br><small>請按 F12 查看 Console 取得詳細錯誤</small></div>`
    setSyncStatus('error', '連線失敗，請按 F12 查看錯誤')
  }
}

export function initTaskEvents() {
  // Toggle task (visual only)
  document.getElementById('task-list').addEventListener('click', (e) => {
    const el = e.target.closest('.task-check')
    if (!el) return
    el.classList.toggle('done')
    const txt = el.nextElementSibling.querySelector('.task-text')
    txt.classList.toggle('done')
    const done = document.querySelectorAll('.task-check.done').length
    const total = document.querySelectorAll('.task-item').length
    document.getElementById('stat-tasks-sub').textContent =
      (total - done) > 0 ? `還有 ${total - done} 項未完成` : '全部完成了 🎉'
    appendMsg('mao', el.classList.contains('done') ? '完成一項，繼續加油 💪' : '好，已取消完成狀態。')
  })

  // Add task modal
  document.getElementById('btn-add-task').addEventListener('click', () => {
    document.getElementById('modal-task').style.display = 'flex'
  })
  document.getElementById('btn-cancel-task').addEventListener('click', () => {
    document.getElementById('modal-task').style.display = 'none'
  })
  document.getElementById('btn-confirm-task').addEventListener('click', confirmAddTask)
}

async function confirmAddTask() {
  const title = document.getElementById('t-title').value.trim()
  if (!title) { alert('請填入任務名稱'); return }
  const priority = document.getElementById('t-priority').value
  const due = document.getElementById('t-due').value
  const notes = document.getElementById('t-notes').value
  document.getElementById('modal-task').style.display = 'none'
  setSyncStatus('syncing', '新增任務到 Sheets…')
  try {
    await sheetAppend('Tasks', [genId(), title, '待辦', priority, due, notes, today()])
    setSyncStatus('ok', '任務已新增 ✓')
    await loadTasks()
    appendMsg('mao', `好，「${title}」已記下來了！加油 💪`)
  } catch (e) {
    setSyncStatus('error', '新增失敗，請確認設定')
  }
}
