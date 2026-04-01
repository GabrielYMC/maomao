const dot = document.getElementById('sync-dot')
const txt = document.getElementById('sync-status')

export function setSyncStatus(state, msg) {
  dot.className = 'sync-dot' + (state === 'syncing' ? ' syncing' : state === 'error' ? ' error' : '')
  txt.textContent = msg
}
