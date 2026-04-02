import { sendMessage } from '../services/anthropic.js'
import { sheetAppend } from '../services/sheets.js'
import { genId, today } from '../utils/helpers.js'
import { setSyncStatus } from './sync-bar.js'

export const chatHistory = []
let isWaiting = false

function esc(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
}

export function appendMsg(role, text) {
  const c = document.getElementById('chat-messages')
  const el = document.createElement('div')
  el.className = `msg fade-in${role === 'user' ? ' user' : ''}`
  const safeText = esc(text).replace(/\n/g, '<br>')
  el.innerHTML = role === 'mao'
    ? `<div class="msg-av">🐾</div><div class="msg-bubble mao">${safeText}</div>`
    : `<div class="msg-av u">佳</div><div class="msg-bubble user">${safeText}</div>`
  c.appendChild(el)
  c.scrollTop = c.scrollHeight
}

function showTyping() {
  const c = document.getElementById('chat-messages')
  const el = document.createElement('div')
  el.className = 'msg fade-in'; el.id = 'typing-indicator'
  el.innerHTML = `<div class="msg-av">🐾</div><div class="msg-bubble mao"><div class="typing"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div></div>`
  c.appendChild(el); c.scrollTop = c.scrollHeight
}

function removeTyping() {
  document.getElementById('typing-indicator')?.remove()
}

/** 解析 AI 回覆中的 [[TASK:{...}]] 標記 */
function parseTaskTag(text) {
  const m = text.match(/\[\[TASK:(\{.*?\})\]\]/s)
  if (!m) return { cleanText: text, task: null }
  try {
    return { cleanText: text.replace(/\[\[TASK:.*?\]\]/s, '').trim(), task: JSON.parse(m[1]) }
  } catch { return { cleanText: text, task: null } }
}

/** 顯示任務新增確認氣泡 */
function showTaskConfirm(task) {
  const c = document.getElementById('chat-messages')
  const el = document.createElement('div')
  el.className = 'msg fade-in'
  el.innerHTML = `
    <div class="msg-av">🐾</div>
    <div class="msg-bubble mao task-confirm">
      <div class="task-confirm-label">幫你建立這個任務？</div>
      <div class="task-confirm-info">📋 ${esc(task.title)}${task.priority ? ' · ' + esc(task.priority) + '優先' : ''}${task.due ? ' · ' + esc(task.due) : ''}</div>
      <div class="task-confirm-btns">
        <button class="btn-tc-yes">✓ 新增</button>
        <button class="btn-tc-no">✗ 不用</button>
      </div>
    </div>`
  c.appendChild(el); c.scrollTop = c.scrollHeight

  el.querySelector('.btn-tc-yes').addEventListener('click', async () => {
    el.remove()
    setSyncStatus('syncing', '新增任務中…')
    try {
      await sheetAppend('Tasks', [genId(), task.title, '待辦', task.priority || '中', task.due || '', '', today()])
      setSyncStatus('ok', '任務已新增 ✓')
      appendMsg('mao', `好，「${task.title}」加進去了！💪`)
      const { loadTasks } = await import('./task-list.js')
      await loadTasks()
    } catch { setSyncStatus('error', '新增失敗'); appendMsg('mao', '新增失敗，請確認 Apps Script 網址。') }
  })
  el.querySelector('.btn-tc-no').addEventListener('click', () => { el.remove(); appendMsg('mao', '好，沒加。') })
}

async function sendChat() {
  if (isWaiting) return
  const input = document.getElementById('chat-input')
  const text = input.value.trim()
  if (!text) return
  appendMsg('user', text)
  input.value = ''
  input.style.height = 'auto'
  chatHistory.push({ role: 'user', content: text })
  isWaiting = true
  showTyping()
  try {
    const reply = await sendMessage(chatHistory)
    removeTyping()
    const { cleanText, task } = parseTaskTag(reply)
    appendMsg('mao', cleanText)
    chatHistory.push({ role: 'assistant', content: cleanText })
    if (task) showTaskConfirm(task)
  } catch (e) {
    removeTyping()
    appendMsg('mao', e.message.includes('請先到設定')
      ? '還沒設定 Anthropic API Key 喔！請到「⚙️ 設定」填入。'
      : '連線好像有點問題，稍後再試試看？')
  }
  isWaiting = false
}

export function initChatEvents() {
  document.getElementById('btn-send-chat').addEventListener('click', sendChat)
  const input = document.getElementById('chat-input')

  // textarea 自動撐高
  input.addEventListener('input', () => {
    input.style.height = 'auto'
    input.style.height = Math.min(input.scrollHeight, 120) + 'px'
  })

  // Enter 送出，Shift+Enter 換行
  input.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' || e.shiftKey) return
    e.preventDefault()
    sendChat()
  })
}
