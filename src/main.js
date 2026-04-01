// Styles
import './styles/variables.css'
import './styles/base.css'
import './styles/sidebar.css'
import './styles/dashboard.css'
import './styles/tasks.css'
import './styles/goals.css'
import './styles/chat.css'
import './styles/modal.css'
import './styles/settings.css'
import './styles/responsive.css'

// Components
import { initDashboard } from './components/dashboard.js'
import { loadTasks, initTaskEvents } from './components/task-list.js'
import { loadGoals, initGoalEvents } from './components/goal-list.js'
import { appendMsg, initChatEvents } from './components/chat.js'
import { initSidebarEvents, loadMoodCount } from './components/sidebar.js'
import { initSettingsEvents, showSettingsIfNeeded } from './components/settings.js'
import { setSyncStatus } from './components/sync-bar.js'
import { isConfigured } from './services/config.js'

// Init
document.addEventListener('DOMContentLoaded', async () => {
  initDashboard()
  initTaskEvents()
  initGoalEvents()
  initChatEvents()
  initSidebarEvents()
  initSettingsEvents()

  // If not configured, show settings first
  if (showSettingsIfNeeded()) {
    appendMsg('mao', '歡迎使用毛毛先生！請先到設定頁面填入你的 API 金鑰。')
    return
  }

  // Load data from Google Sheets
  setSyncStatus('syncing', '同步 Google Sheets 中…')
  await Promise.all([loadTasks(), loadGoals(), loadMoodCount()])
  setSyncStatus('ok', '已與 Google Sheets 同步')
  appendMsg('mao', '資料讀取完成！今天有什麼想搞定的嗎？😊')
})

// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  })
}
