import { appendMsg } from './chat.js'

const WORK_SECS = 25 * 60
const BREAK_SECS = 5 * 60

let countdown = null
let secondsLeft = WORK_SECS
let totalSecs = WORK_SECS
let isPaused = false
let isBreak = false
let currentTask = { id: '', title: '' }

const DONE_MSGS = [
  t => `太棒了！「${t}」專注了 25 分鐘 🎉 先休息 5 分鐘，喝杯水 💧`,
  t => `一個番茄完成！「${t}」很厲害 🍅 休息一下再繼續！`,
  t => `哇，25 分鐘過去啦！「${t}」有進展嗎？☕ 休息 5 分鐘繼續加油！`,
]

export function startPomodoro(taskId, taskTitle) {
  stopTimer()
  currentTask = { id: taskId, title: taskTitle }
  secondsLeft = WORK_SECS
  totalSecs = WORK_SECS
  isPaused = false
  isBreak = false

  showBar(false)
  document.getElementById('pomo-task-name').textContent = taskTitle
  document.getElementById('pomo-phase').textContent = '專注中'
  document.getElementById('pomo-pause').textContent = '⏸'
  updateDisplay()

  appendMsg('mao', `好，開始為「${taskTitle}」計時 25 分鐘，專注模式開啟 🍅`)
  countdown = setInterval(tick, 1000)
}

function tick() {
  if (isPaused) return
  secondsLeft--
  updateDisplay()
  if (secondsLeft > 0) return

  if (!isBreak) {
    // 工作結束 → 開始休息
    stopTimer()
    if (Notification.permission === 'granted') {
      new Notification('🍅 番茄鐘完成！', {
        body: `「${currentTask.title}」25 分鐘結束，休息一下吧！`,
        icon: './icons/icon-192.svg',
        tag: 'pomo-done',
      })
    }
    const msg = DONE_MSGS[Math.floor(Math.random() * DONE_MSGS.length)](currentTask.title)
    appendMsg('mao', msg)
    startBreak()
  } else {
    // 休息結束
    stopTimer()
    if (Notification.permission === 'granted') {
      new Notification('☕ 休息結束！', {
        body: '可以開始下一個番茄了！點任務旁邊的 🍅 繼續。',
        icon: './icons/icon-192.svg',
        tag: 'pomo-break-done',
      })
    }
    appendMsg('mao', '休息結束啦！點任務旁邊的 🍅 開始下一個番茄吧 💪')
    hideBar()
  }
}

function startBreak() {
  isBreak = true
  secondsLeft = BREAK_SECS
  totalSecs = BREAK_SECS
  showBar(true)
  document.getElementById('pomo-phase').textContent = '休息中'
  updateDisplay()
  countdown = setInterval(tick, 1000)
}

function updateDisplay() {
  const m = String(Math.floor(secondsLeft / 60)).padStart(2, '0')
  const s = String(secondsLeft % 60).padStart(2, '0')
  document.getElementById('pomo-time').textContent = `${m}:${s}`
  const pct = ((totalSecs - secondsLeft) / totalSecs * 100).toFixed(1)
  document.getElementById('pomo-progress-fill').style.width = pct + '%'
}

function showBar(break_mode) {
  const bar = document.getElementById('pomo-bar')
  bar.style.display = 'flex'
  bar.classList.toggle('pomo-bar--break', break_mode)
  // 重播入場動畫
  bar.style.animation = 'none'
  bar.offsetHeight
  bar.style.animation = ''
}

function hideBar() {
  document.getElementById('pomo-bar').style.display = 'none'
  stopTimer()
}

function stopTimer() {
  if (countdown) { clearInterval(countdown); countdown = null }
}

export function initPomodoroEvents() {
  document.getElementById('pomo-pause').addEventListener('click', () => {
    isPaused = !isPaused
    document.getElementById('pomo-pause').textContent = isPaused ? '▶' : '⏸'
  })
  document.getElementById('pomo-stop').addEventListener('click', () => {
    appendMsg('mao', '番茄鐘取消囉，沒關係，下次繼續！🌿')
    hideBar()
  })
}
