import './styles/variables.css'
import './styles/base.css'
import './styles/sidebar.css'
import './styles/dashboard.css'
import './styles/tasks.css'
import './styles/goals.css'
import './styles/chat.css'
import './styles/modal.css'
import './styles/settings.css'
import './styles/pomodoro.css'
import './styles/responsive.css'

import { initDashboard } from './components/dashboard.js'
import { loadTasks, initTaskEvents } from './components/task-list.js'
import { loadGoals, initGoalEvents } from './components/goal-list.js'
import { appendMsg, initChatEvents } from './components/chat.js'
import { initSidebarEvents, loadMoodCount, lastMoodScore } from './components/sidebar.js'
import { initSettingsEvents, showSettingsIfNeeded } from './components/settings.js'
import { setSyncStatus } from './components/sync-bar.js'
import { isConfigured } from './services/config.js'
import { generateMorningBrief } from './services/anthropic.js'
import { initNotifications, checkDueTasks } from './services/notifications.js'
import { initPomodoroEvents } from './components/pomodoro.js'
import { formatDate } from './utils/helpers.js'

document.addEventListener('DOMContentLoaded', async () => {
  initDashboard()
  initTaskEvents()
  initGoalEvents()
  initChatEvents()
  initSidebarEvents()
  initSettingsEvents()
  initPomodoroEvents()

  if (showSettingsIfNeeded()) {
    appendMsg('mao', '歡迎使用毛毛先生！請先到設定頁面填入你的 API 金鑰 🐾')
    return
  }

  // 載入所有資料
  setSyncStatus('syncing', '同步 Google Sheets 中…')
  const [tasks] = await Promise.all([
    loadTasks(),
    loadGoals(),
    loadMoodCount(),
  ])
  setSyncStatus('ok', '已與 Google Sheets 同步')

  // 晨間簡報（若有 Anthropic Key）
  try {
    const brief = await generateMorningBrief({
      date: formatDate(),
      taskCount: parseInt(document.getElementById('stat-tasks').textContent) || 0,
      pendingCount: parseInt((document.getElementById('stat-tasks-sub').textContent.match(/\d+/) || ['0'])[0]) || 0,
      goalCount: parseInt(document.getElementById('stat-goals').textContent) || 0,
      moodCount: parseInt(document.getElementById('stat-mood').textContent) || 0,
      lastMoodScore,
    })
    if (brief) appendMsg('mao', brief)
  } catch {
    appendMsg('mao', '資料讀取完成！今天有什麼想搞定的嗎？😊')
  }

  // 到期任務通知
  await initNotifications(tasks)
})

// 通知權限請求（在使用者首次互動後）
document.addEventListener('click', async () => {
  if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
    await Notification.requestPermission()
  }
}, { once: true })

// Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {})
  })
}
