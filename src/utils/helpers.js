export function genId() {
  return Date.now().toString(36)
}

export function today() {
  return new Date().toISOString().split('T')[0]
}

export function formatDate(date) {
  const d = date || new Date()
  const days = ['日', '一', '二', '三', '四', '五', '六']
  return `${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日　星期${days[d.getDay()]}`
}

export function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return '早安'
  if (hour < 18) return '午安'
  return '晚安'
}
