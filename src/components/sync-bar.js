/** 懶初始化查詢 DOM，避免模組頂層執行時 DOM 尚未準備好的計時問題 */
export function setSyncStatus(state, msg) {
  const dot = document.getElementById('sync-dot')
  const txt = document.getElementById('sync-status')
  if (!dot || !txt) return
  dot.className = 'sync-dot' + (state === 'syncing' ? ' syncing' : state === 'error' ? ' error' : '')
  txt.textContent = msg
}
