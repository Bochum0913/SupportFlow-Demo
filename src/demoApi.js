// Public portfolio demo: simulated API and rule-based chat. No network requests or API keys.
const KEY = 'supportflow-public-demo-v1'
const sampleTickets = [
  { id: 'INC-1001', issue: 'VPN disconnects after sign-in', category: 'Network', priority: 'High', status: 'In Progress', assignedTo: 'Support Team', createdAt: '2026-10-17T12:00:00.000Z', comments: [{ content: 'Checking connection logs.', createdAt: '2026-10-17T12:30:00.000Z' }] },
  { id: 'INC-1002', issue: 'Cannot access shared calendar', category: 'Email', priority: 'Normal', status: 'Open', assignedTo: '', createdAt: '2026-10-18T10:00:00.000Z', comments: [] },
  { id: 'INC-1003', issue: 'Printer setup on new laptop', category: 'Hardware', priority: 'Low', status: 'Resolved', assignedTo: 'Support Team', createdAt: '2026-10-19T09:00:00.000Z', comments: [{ content: 'Printer configured and tested.', createdAt: '2026-10-19T09:40:00.000Z' }] },
]
const load = () => {
  try {
    const stored = localStorage.getItem(KEY)
    if (stored === null) {
      const initial = sampleTickets.map(t => ({ ...t, comments: [...t.comments] }))
      localStorage.setItem(KEY, JSON.stringify(initial))
      return initial
    }
    const parsed = JSON.parse(stored)
    return Array.isArray(parsed) ? parsed : []
  } catch { return sampleTickets.map(t => ({ ...t, comments: [...t.comments] })) }
}
const save = tickets => localStorage.setItem(KEY, JSON.stringify(tickets))
const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } })
const nextId = tickets => `INC-${Math.max(1000, ...tickets.map(t => Number(t.id?.split('-')[1]) || 1000)) + 1}`
const create = (tickets, issue, category = 'Other', priority = 'Normal') => {
  const ticket = { id: nextId(tickets), issue, category, priority, status: 'Open', assignedTo: '', createdAt: new Date().toISOString(), comments: [] }
  tickets.unshift(ticket); save(tickets); return ticket
}

export function installDemoApi() {
  const nativeFetch = window.fetch.bind(window)
  window.fetch = async (input, init = {}) => {
    const path = new URL(typeof input === 'string' ? input : input.url, location.origin).pathname
    if (!path.startsWith('/api/')) return nativeFetch(input, init)
    const method = (init.method || 'GET').toUpperCase()
    let body = {}
    try { body = init.body ? JSON.parse(init.body) : {} } catch { return json({ message: 'Invalid JSON' }, 400) }
    const tickets = load()
    if (path === '/api/agent/chat' && method === 'POST') {
      const message = String(body.message || '')
      const lower = message.toLowerCase()
      if (/(create|open|make).*(ticket|request)/i.test(message)) {
        return json('DEMO SIMULATION — I can help with that. For safety, this demo only creates a ticket after you click “Review & create ticket” and confirm. No ticket has been created yet.')
      }
      const match = message.match(/INC-\d+/i)
      if (match && /(priority|status)/i.test(message)) {
        const ticket = tickets.find(t => t.id.toLowerCase() === match[0].toLowerCase())
        if (!ticket) return json(`DEMO SIMULATION — Ticket ${match[0]} not found.`)
        if (/priority/i.test(message)) ticket.priority = /high/i.test(message) ? 'High' : /low/i.test(message) ? 'Low' : 'Normal'
        if (/status/i.test(message)) ticket.status = /resolved/i.test(message) ? 'Resolved' : /progress/i.test(message) ? 'In Progress' : 'Open'
        save(tickets)
        return json(`DEMO SIMULATION — Updated ${ticket.id}. Priority: ${ticket.priority}; status: ${ticket.status}.`)
      }
      if (/vpn|outlook|crash|wifi|network/i.test(lower)) return json('DEMO SIMULATION — Try restarting the application, checking your network connection, and recording any error messages. Would you like me to create a support ticket? To try it, say: Create a ticket for my VPN issue.')
      return json('DEMO SIMULATION — This public version uses scripted responses, not a live AI model. Try “Create a ticket for my VPN issue and set priority to High” or “Change INC-1001 priority to High”.')
    }
    if (path === '/api/tickets' && method === 'GET') return json(tickets)
    if (path === '/api/tickets' && method === 'POST') {
      if (!String(body.issue || '').trim()) return json({ message: 'Issue is required' }, 400)
      const ticket = create(tickets, String(body.issue).slice(0, 500), body.category || 'Other', ['Low', 'Normal', 'High'].includes(body.priority) ? body.priority : 'Normal')
      return json({ message: `Created ${ticket.id}` })
    }
    const match = path.match(/^\/api\/tickets\/([^/]+)(?:\/(status|priority|assignee|comments))?$/)
    if (match) {
      const ticket = tickets.find(t => t.id === decodeURIComponent(match[1]))
      if (!ticket) return json({ message: 'Ticket not found' }, 404)
      const action = match[2]
      if (method === 'GET' && !action) return json(ticket)
      if (method === 'PUT') {
        if (action === 'status') ticket.status = body.status
        else if (action === 'priority') ticket.priority = body.priority
        else if (action === 'assignee') ticket.assignedTo = body.assignedTo
        else return json({ message: 'Unsupported action' }, 400)
        save(tickets); return json({ message: 'Updated' })
      }
      if (method === 'POST' && action === 'comments') {
        ticket.comments.push({ content: body.content || '', createdAt: new Date().toISOString() }); save(tickets)
        return json({ message: 'Comment added' })
      }
    }
    return json({ message: 'Unsupported demo request' }, 404)
  }
}
