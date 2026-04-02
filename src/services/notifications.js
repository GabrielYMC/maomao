/**
 * 到期任務通知服務（使用 Web Notification API）
 * 不需要後端，由 PWA 在前端直接推播。
 */

export async function initNotifications(tasks) {
  if (!('Notification' in window)) return
  if (Notification.permission !== 'granted') return
  checkDueTasks(tasks)
}

export async function requestNotificationPermission() {
  if (!('Notification' in window)) return false
  const perm = await Notification.requestPermission()
  return perm === 'granted'
}

export function checkDueTasks(tasks) {
  if (!tasks?.length || Notification.permission !== 'granted') return
  const todayStr = new Date().toISOString().split('T')[0]
  const overdue = tasks.filter(t => t.due && t.due <= todayStr && t.status !== '完成')
  if (!overdue.length) return
  new Notification('毛毛先生提醒 🐾', {
    body: overdue.length === 1
      ? `「${overdue[0].title}」今天到期囉！`
      : `你有 ${overdue.length} 個任務今天到期，加油！`,
    icon: './icons/icon-192.svg',
    tag: 'maomao-due-tasks',
  })
}
