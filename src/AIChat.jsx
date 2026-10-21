import { useEffect, useRef, useState } from 'react'
import './AIChat.css'

const API = '/api/agent/chat'
const initialMessages = [
  { role: 'assistant', content: 'Hi! I’m your AI support assistant. Describe an IT issue, or ask me to look up and manage a support ticket.' },
]

function getConversationId() {
  try {
    let id = sessionStorage.getItem('aiSupportConversationId')
    if (!id) {
      id = crypto.randomUUID()
      sessionStorage.setItem('aiSupportConversationId', id)
    }
    return id
  } catch {
    return crypto.randomUUID()
  }
}

export default function AIChat({ onActionComplete }) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState(initialMessages)
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const conversationId = useRef(null)
  const bottom = useRef(null)
  const input = useRef(null)

  if (!conversationId.current) conversationId.current = getConversationId()

  useEffect(() => {
    if (open) {
      bottom.current?.scrollIntoView({ behavior: 'smooth' })
      input.current?.focus()
    }
  }, [open, messages, busy])

  async function send(event) {
    event.preventDefault()
    const message = draft.trim()
    if (!message || busy) return
    setDraft('')
    setError('')
    setMessages(prev => [...prev, { role: 'user', content: message }])
    setBusy(true)
    try {
      const response = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId: conversationId.current, message }),
      })
      if (!response.ok) throw new Error(`AI request failed (HTTP ${response.status}).`)
      // ASP.NET returns the service's string response as JSON or plain text.
      const raw = await response.text()
      let reply
      try { reply = JSON.parse(raw) } catch { reply = raw }
      if (typeof reply !== 'string') throw new Error('Unexpected AI response format.')
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
      onActionComplete?.()
    } catch (err) {
      setError(err.message || 'Unable to contact the AI service.')
    } finally {
      setBusy(false)
    }
  }

  function resetChat() {
    if (busy) return
    conversationId.current = crypto.randomUUID()
    try { sessionStorage.setItem('aiSupportConversationId', conversationId.current) } catch { /* optional */ }
    setMessages(initialMessages)
    setError('')
  }

  return (
    <div className="ai-chat-root">
      {open && <section className="ai-chat-window" role="dialog" aria-label="AI support chat">
        <div className="ai-chat-header">
          <div><strong>AI Support</strong><small>IT troubleshooting assistant</small></div>
          <div className="ai-chat-header-actions">
            <button type="button" onClick={resetChat} disabled={busy} title="New conversation" aria-label="New conversation">↻</button>
            <button type="button" onClick={() => setOpen(false)} title="Close chat" aria-label="Close chat">×</button>
          </div>
        </div>
        <div className="ai-chat-history" role="log" aria-live="polite" aria-relevant="additions">
          {messages.map((item, index) => <div key={index} className={`ai-chat-message ${item.role}`}>{item.content}</div>)}
          {busy && <div className="ai-chat-message assistant">Thinking…</div>}
          <div ref={bottom} />
        </div>
        {error && <div className="ai-chat-error" role="alert">{error}</div>}
        <form className="ai-chat-form" onSubmit={send}>
          <input ref={input} value={draft} onChange={e => setDraft(e.target.value)} placeholder="Ask about an IT issue…" aria-label="Your message" disabled={busy} maxLength={4000} />
          <button type="submit" disabled={busy || !draft.trim()} aria-label="Send message">Send</button>
        </form>
        <p className="ai-chat-footnote">AI may make mistakes. Confirm changes to important tickets.</p>
      </section>}
      <button type="button" className="ai-chat-launcher" aria-label={open ? 'Close AI chat' : 'Open AI chat'} aria-expanded={open} onClick={() => setOpen(!open)}>{open ? '×' : '✦'} <span>{open ? 'Close' : 'Ask AI'}</span></button>
    </div>
  )
}
