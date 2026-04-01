import { formatDate, getGreeting } from '../utils/helpers.js'

export function initDashboard() {
  document.getElementById('date-display').textContent = formatDate()

  const greeting = document.querySelector('.dash-greeting')
  greeting.textContent = `${getGreeting()}，佳穎 ☀️`
}
