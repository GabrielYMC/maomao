import { sendMessage } from '../services/anthropic.js'

const chatHistory = []
let enterCount = 0
let enterTimer = null
let isWaiting = false

export function appendMsg(role, text) {
  const c = document.getElementById('chat-messages')
  const el = document.createElement('div')
  el.className = `msg fade-in${role === 'user' ? ' user' : ''}`
  el.innerHTML = role === 'mao'
    ? `<div class="msg-av">🐾</div><div class="msg-bubble mao">${text}</div>`
    : `<div class="msg-av u">佳</div><div class="msg-bubble user">${text}</div>`
  c.appendChild(el)
  c.scrollTop = c.scrollHeight
}

function showTyping() {
  const c = document.getElementById('chat-messages')
  const el = document.createElement('div')
  el.className = 'msg fade-in'
  el.id = 'typing-indicator'
  el.innerHTML = `<div class="msg-av">🐾</div><div class="msg-bubble mao"><div class="typing"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div></div>`
  c.appendChild(el)
  c.scrollTop = c.scrollHeight
}

function removeTyping() {
  const t = document.getElementById('typing-indicator')
  if (t) t.remove()
}

async function sendChat() {
  if (isWaiting) return
  const input = document.getElementById('chat-input')
  const text = input.value.trim()
  if (!text) return
  appendMsg('user', text)
  input.value = ''
  chatHistory.push({ role: 'user', content: text })
  isWaiting = true
  showTyping()
  try {
    const reply = await sendMessage(chatHistory)
    removeTyping()
    appendMsg('mao', reply)
    chatHistory.push({ role: 'assistant', content: reply })
  } catch (e) {
    removeTyping()
    if (e.message.includes('請先到設定')) {
      appendMsg('mao', '還沒設定 Anthropic API Key 喔！請到左邊選單的「⚙️ 設定」填入。')
    } else {
      appendMsg('mao', '連線好像有點問題，稍後再試試看？')
    }
  }
  isWaiting = false
}

export function initChatEvents() {
  document.getElementById('btn-send-chat').addEventListener('click', sendChat)

  const input = document.getElementById('chat-input')
  input.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return
    e.preventDefault()
    enterCount++
    if (enterCount === 1) {
      const pos = input.selectionStart
      input.value = input.value.slice(0, pos) + '\n' + input.value.slice(pos)
      input.selectionStart = input.selectionEnd = pos + 1
      clearTimeout(enterTimer)
      enterTimer = setTimeout(() => { enterCount = 0 }, 1500)
    } else if (enterCount >= 2) {
      clearTimeout(enterTimer)
      enterCount = 0
      input.value = input.value.replace(/\n$/, '')
      sendChat()
    }
  })
}
