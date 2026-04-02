import { sheetGet, sheetAppend, sheetUpdate, sheetDelete } from '../services/sheets.js'
import { genId, today } from '../utils/helpers.js'
import { setSyncStatus } from './sync-bar.js'
import { appendMsg } from './chat.js'

function esc(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')
}

const REPEAT_LABEL = { daily: '每天', weekly: '每週', monthly: '每月' }

export async function loadTasks() {
  try {
    const rows = await sheetGet('Tasks!A2:H')
    const list = document.getElementById('task-list')
    if (!rows.length) {
      list.innerHTML = '<div class="loading">還沒有任務，新增一個吧！</div>'
      updateStats(0, 0); return []
    }
    list.innerHTML = ''
    let done = 0
    rows.forEach(r => {
      const [id, title, status, priority, due, , , repeat] = r
      const isDone = status === '完成'
      if (isDone) done++
      const item = document.createElement('div')
      item.className = 'task-item fade-in'
      const tagClass = priority === '高' ? 'tag-high' : priority === '低' ? 'tag-low' : 'tag-mid'
      item.innerHTML = `
        <div class="task-check ${isDone ? 'done' : ''}" data-task-id="${esc(id)}"></div>
        <div class="task-body">
          <div class="task-text ${isDone ? 'done' : ''}">${esc(title)}</div>
          <div class="task-meta">
            <span class="task-tag ${tagClass}">${esc(priority || '中')}</span>
            ${repeat ? `<span class="task-repeat">🔄 ${REPEAT_LABEL[repeat] || repeat}</span>` : ''}
            ${due ? `<span class="task-due">${esc(due)}</span>` : ''}
          </div>
        </div>
        ${!isDone ? `<button class="task-pomo" data-task-id="${esc(id)}" data-task-title="${esc(title)}" title="開始番茄鐘">🍅</button>` : ''}
        <button class="task-delete" data-task-id="${esc(id)}" title="刪除">×</button>`
      list.appendChild(item)
    })
    updateStats(rows.length, done)
    // 回傳結構化資料供晨間簡報 + 通知使用
    return rows.map(r => ({ id: r[0], title: r[1], status: r[2], priority: r[3], due: r[4] }))
  } catch (e) {
    console.error('loadTasks:', e)
    document.getElementById('task-list').innerHTML =
      `<div class="loading" style="color:var(--accent-coral)">讀取失敗：${esc(e.message)}</div>`
    setSyncStatus('error', '連線失敗')
    return []
  }
}

function updateStats(total, done) {
  const rem = total - done
  document.getElementById('stat-tasks').textContent = total
  document.getElementById('stat-tasks-sub').textContent =
    total === 0 ? '新增你的第一個任務吧' : rem > 0 ? `還有 ${rem} 項未完成` : '全部完成了 🎉'
}

export function initTaskEvents() {
  const list = document.getElementById('task-list')
  list.addEventListener('click', async (e) => {
    const pomo = e.target.closest('.task-pomo')
    if (pomo) {
      const { startPomodoro } = await import('./pomodoro.js')
      startPomodoro(pomo.dataset.taskId, pomo.dataset.taskTitle)
      return
    }
    const del = e.target.closest('.task-delete')
    if (del) { await handleDelete(del.dataset.taskId); return }
    const chk = e.target.closest('.task-check')
    if (chk) await handleToggle(chk)
  })
  document.getElementById('btn-add-task').addEventListener('click', () => {
    ['t-title','t-notes'].forEach(id => document.getElementById(id).value = '')
    document.getElementById('t-priority').value = '中'
    document.getElementById('t-due').value = ''
    document.getElementById('t-repeat').value = ''
    document.getElementById('modal-task').style.display = 'flex'
  })
  document.getElementById('btn-cancel-task').addEventListener('click', () =>
    document.getElementById('modal-task').style.display = 'none')
  document.getElementById('btn-confirm-task').addEventListener('click', confirmAdd)
}

async function handleToggle(check) {
  const id = check.dataset.taskId
  const isNowDone = !check.classList.contains('done')
  check.classList.toggle('done')
  check.nextElementSibling?.querySelector('.task-text')?.classList.toggle('done')
  updateStats(
    document.querySelectorAll('.task-item').length,
    document.querySelectorAll('.task-check.done').length
  )
  appendMsg('mao', isNowDone ? '完成一項，繼續加油 💪' : '好，已取消完成狀態。')
  setSyncStatus('syncing', '同步中…')
  try {
    await sheetUpdate('Tasks', id, 3, isNowDone ? '完成' : '待辦')
    setSyncStatus('ok', '已同步 ✓')
  } catch { setSyncStatus('error', '同步失敗，請確認 Apps Script 設定') }
}

async function handleDelete(id) {
  setSyncStatus('syncing', '刪除中…')
  try {
    await sheetDelete('Tasks', id)
    setSyncStatus('ok', '任務已刪除 ✓')
    await loadTasks()
    appendMsg('mao', '好，任務刪掉了。')
  } catch { setSyncStatus('error', '刪除失敗') }
}

async function confirmAdd() {
  const title = document.getElementById('t-title').value.trim()
  if (!title) { alert('請填入任務名稱'); return }
  const priority = document.getElementById('t-priority').value
  const due = document.getElementById('t-due').value
  const notes = document.getElementById('t-notes').value
  const repeat = document.getElementById('t-repeat').value
  document.getElementById('modal-task').style.display = 'none'
  setSyncStatus('syncing', '新增任務中…')
  try {
    await sheetAppend('Tasks', [genId(), title, '待辦', priority, due, notes, today(), repeat])
    setSyncStatus('ok', '任務已新增 ✓')
    await loadTasks()
    appendMsg('mao', `好，「${title}」已記下來了！加油 💪`)
  } catch {
    setSyncStatus('error', '新增失敗')
    appendMsg('mao', '新增失敗，請確認 Apps Script 網址有設定好喔。')
  }
}
