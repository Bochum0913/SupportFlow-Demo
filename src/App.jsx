
import { useEffect, useState } from 'react'
import './App.css'
import AIChat from './AIChat'

const API = '/api/tickets'
const DEMO = import.meta.env.VITE_DEMO_MODE === 'true'

function App() {
  const [tickets, setTickets] = useState([])
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [selected, setSelected] = useState(null)
  const [assignee, setAssignee] = useState('')
  const [newComment, setNewComment] = useState('')
  const [issue, setIssue] = useState('')
  const [category, setCategory] = useState('Software')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [chatOpenRequest, setChatOpenRequest] = useState(0)

  async function loadTickets() {
    setLoading(true)
    setError('')

    try {
      const response = await fetch(API)
      if (!response.ok) throw new Error('Failed to load tickets')
      setTickets(await response.json())
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTickets()
  }, [])

  
  const filteredTickets = tickets.filter(ticket => {
    const matchesStatus =
      !statusFilter || ticket.status === statusFilter

    const matchesPriority =
      !priorityFilter || ticket.priority === priorityFilter

    const matchesCategory =
      !categoryFilter || ticket.category === categoryFilter

    return matchesStatus && matchesPriority && matchesCategory && (!search.trim() || `${ticket.id} ${ticket.issue} ${ticket.category}`.toLowerCase().includes(search.trim().toLowerCase()))
  })


  async function createTicket(event) {
    event.preventDefault()
    setError('')

    try {
      const response = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ issue, category })
      })

      if (!response.ok) throw new Error('Failed to create ticket')

      setIssue('')
      await loadTickets()
    } catch (err) {
      setError(err.message)
    }
  }

  async function viewTicket(id) {
    setError('')

    try {
      const response = await fetch(`${API}/${encodeURIComponent(id)}`)
      if (!response.ok) throw new Error('Failed to load ticket')
      const ticket = await response.json()
      setSelected(ticket)
      setAssignee(ticket.assignedTo || '')
    } catch (err) {
      setError(err.message)
    }
  }

  async function updateStatus(id, status) {
    setError('')

    try {
      const response = await fetch(
        `${API}/${encodeURIComponent(id)}/status`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status })
        }
      )

      if (!response.ok) throw new Error('Failed to update status')

      await loadTickets()
      await viewTicket(id)
    } catch (err) {
      setError(err.message)
    }
  }

  
async function updatePriority(id, priority) {
  setError('')

  try {
    const response = await fetch(
      `${API}/${encodeURIComponent(id)}/priority`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priority })
      }
    )

    if (!response.ok) throw new Error('Failed to update priority')

    await loadTickets()
    await viewTicket(id)
  } catch (err) {
    setError(err.message)
  }
}

async function saveAssignee(id) {
  setError('')

  try {
    const response = await fetch(
      `${API}/${encodeURIComponent(id)}/assignee`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignedTo: assignee })
      }
    )

    if (!response.ok) throw new Error('Failed to assign ticket')

    await loadTickets()
    await viewTicket(id)
  } catch (err) {
    setError(err.message)
  }
}

async function addComment(id) {
  if (!newComment.trim()) return

  setError('')

  try {
    const response = await fetch(
      `${API}/${encodeURIComponent(id)}/comments`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newComment.trim()
        })
      }
    )

    if (!response.ok) {
      throw new Error('Failed to add comment')
    }

    setNewComment('')
    await viewTicket(id)
  } catch (err) {
    setError(err.message)
  }
}

  return (
    <main className="dashboard">
      {DEMO && <div role="status" style={{background:"#fff3d6",border:"1px solid #e5b95d",borderRadius:10,padding:"12px 16px",marginBottom:18,color:"#684600",fontWeight:600}}>Portfolio demo — simulated AI replies and browser-only ticket data. No live AI or server connection. Data stays in this browser.</div>}
      <header className="page-header">
        <div className="brand-row"><span className="brand-mark" aria-hidden="true">✦</span><span className="brand-name">SupportFlow <span className="brand-suffix">/ Workspace</span></span></div>
        <div className="header-heading"><div><p className="eyebrow">SUPPORT OPERATIONS / INTERACTIVE DEMO</p><h1>Support that moves forward.</h1><p className="subtitle">Explore a support workspace: troubleshoot first, then track each request from open to resolved.</p><div className="hero-actions"><button type="button" onClick={() => setChatOpenRequest(n => n + 1)}>✦ Try the assistant</button><a className="hero-link" href="#new-ticket">Create a ticket <span aria-hidden="true">↗</span></a></div></div><span className="environment-pill"><span className="online-dot" /> Interactive portfolio</span></div>
      </header>

      {DEMO && <div className="demo-guide"><strong>Explore the demo</strong><span>1. Ask the simulated assistant for help</span><span>2. Confirm a ticket if needed</span><span>3. Update its status or priority</span></div>}
      <section className="stats">
        <div className="stat"><div className="stat-label">Total tickets <span className="stat-icon">▤</span></div>
          <h2>{tickets.length}</h2>
          <p>All recorded requests</p>
        </div>
        <div className="stat"><div className="stat-label">Open tickets <span className="stat-icon">◷</span></div>
          <h2>{tickets.filter(t => t.status === 'Open').length}</h2>
          <p>Awaiting assistance</p>
        </div>
        <div className="stat"><div className="stat-label">Resolved <span className="stat-icon">✓</span></div>
          <h2>{tickets.filter(t => t.status === 'Resolved').length}</h2>
          <p>Successfully closed</p>
        </div>
      </section>

      {error && <p className="error">{error}</p>}

      <section className="panel" id="new-ticket">
        <div className="panel-heading"><div><h2>New support ticket</h2><p>Describe an issue to add it to the queue.</p></div><span className="panel-kicker">QUICK ACTION</span></div>

        <form className="create-form" onSubmit={createTicket}>
          <label htmlFor="issue-input" className="sr-only">Issue description</label>
          <input id="issue-input"
            value={issue}
            onChange={e => setIssue(e.target.value)}
            placeholder="Describe the issue..."
            required
          />

          <label htmlFor="category-input" className="sr-only">Issue category</label>
          <select id="category-input"
            value={category}
            onChange={e => setCategory(e.target.value)}
          >
            {['Network', 'Email', 'Account', 'Hardware',
              'Software', 'Other'].map(c => (
              <option key={c}>{c}</option>
            ))}
          </select>

          <button type="submit">Create Ticket</button>
        </form>
      </section>

      <section className="panel">
        <div className="section-heading">
          <div><h2>Support tickets <span className="ticket-count">{filteredTickets.length}</span></h2><p>Browse and update all service requests.</p></div>
          <button className="secondary-button" onClick={loadTickets} disabled={loading}>↻ Refresh</button>
        </div>

        
        <div className="filters">
          <input className="ticket-search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by ID or issue…" aria-label="Search tickets" />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            aria-label="Filter by status"
          >
            <option value="">All Statuses</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>

          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
            aria-label="Filter by priority"
          >
            <option value="">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Normal">Normal</option>
            <option value="High">High</option>
          </select>

          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            aria-label="Filter by category"
          >
            <option value="">All Categories</option>
            {['Network', 'Email', 'Account', 'Hardware',
              'Software', 'Other'].map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <button
            className="clear-button"
            type="button"
            onClick={() => {
              setStatusFilter('')
              setPriorityFilter('')
              setCategoryFilter('')
              setSearch('')
            }}
          >
            Clear Filters
          </button>
        </div>


        {loading ? <p role="status">Loading...</p> : (
          <div className="table-scroll"><table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Issue</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map(ticket => (
                <tr
                  key={ticket.id}
                  onClick={() => viewTicket(ticket.id)}
                  onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); viewTicket(ticket.id) } }}
                  tabIndex={0}
                  aria-label={`View details for ${ticket.id}`}
                >
                  <td><span className="ticket-id">{ticket.id}</span></td>
                  <td className="issue-cell">{ticket.issue}</td>
                  <td><span className="category-chip">{ticket.category}</span></td>
                  <td><span className={`priority-chip ${ticket.priority?.toLowerCase()}`}>{ticket.priority}</span></td>
                  <td><span className={`status-chip ${ticket.status?.toLowerCase().replace(/\s+/g, '-')}`}>{ticket.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>{filteredTickets.length === 0 && <div className="empty-state"><span className="empty-icon">⌕</span><strong>No matching tickets</strong><p>Try changing your filters or create a new support ticket.</p></div>}</div>
        )}
      </section>

      
      {selected && (
        <div className="drawer-overlay" onClick={() => setSelected(null)}>
          <aside
            className="ticket-drawer"
            role="dialog"
            aria-modal="true"
            aria-label={`Details for ticket ${selected.id}`}
            onKeyDown={(event) => { if (event.key === 'Escape') setSelected(null) }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="drawer-header">
              <div>
                <h2>Ticket details</h2>
                <p>{selected.id}</p>
              </div>
              <button onClick={() => setSelected(null)}>Close</button>
            </div>

            <div className="drawer-content">
              <h3>Issue</h3>
              <p className="ticket-issue">{selected.issue}</p>

              <h3>Category</h3>
              <p>{selected.category}</p>
         
              <h3>Priority</h3>
              <select
                value={selected.priority}
                onChange={(e) => updatePriority(selected.id, e.target.value)}
              >
                <option>Low</option>
                <option>Normal</option>
                <option>High</option>
              </select>

              <h3>Assigned To</h3>
              <div className="assignee-form">
                <input
                  value={assignee}
                  onChange={(e) => setAssignee(e.target.value)}
                  placeholder="Enter technician name"
                />
                <button
                  type="button"
                  onClick={() => saveAssignee(selected.id)}
                  disabled={!assignee.trim()}
                >
                  Save
                </button>
              </div>

              <h3>Status</h3>
              <select
                value={selected.status}
                onChange={(e) =>
                  updateStatus(selected.id, e.target.value)
                }
              >
                <option>Open</option>
                <option>In Progress</option>
                <option>Resolved</option>
              </select>

              <h3>Comments</h3>
              {selected.comments?.length ? (
                selected.comments.map((comment, index) => (
                  <div className="ticket-comment" key={index}>
                    <p>{comment.content}</p>
                  </div>
                ))
              ) : (
                <p>No comments yet.</p>
              )}
              
              <div className="comment-form">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  rows={4}
                />

                <button
                  type="button"
                  onClick={() => addComment(selected.id)}
                  disabled={!newComment.trim()}
                >
                  Add Comment
                </button>
              </div>

            </div>
          </aside>
        </div>
      )}

      <footer className="site-footer"><span>SupportFlow / Front-end portfolio experience</span><span>React · JavaScript · CSS · Simulated API</span><a href="https://github.com/Bochum0913/SupportFlow-Demo" target="_blank" rel="noreferrer">View source ↗</a></footer>
      <AIChat onActionComplete={loadTickets} openRequest={chatOpenRequest} />
    </main>
  )
}

export default App
