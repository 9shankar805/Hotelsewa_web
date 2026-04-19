'use client'
import { useState, useEffect } from 'react'
import { chatApi } from '@/lib/api'
import toast from 'react-hot-toast'
import { FiSend, FiMessageSquare, FiZap } from 'react-icons/fi'

interface Conversation {
  id: string
  guest_name?: string
  last_message?: string
  updated_at?: string
  unread?: number
  booking_id?: string
}

interface Message {
  id: string
  message?: string
  content?: string
  sender?: string
  sender_type?: string
  created_at?: string
}

export default function MessagingPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [selected, setSelected] = useState<Conversation | null>(null)
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'inbox' | 'automated'>('inbox')

  const TEMPLATES = [
    { label: 'Welcome', msg: 'Welcome to our hotel! We are delighted to have you. Please let us know if you need anything.' },
    { label: 'Check-in Reminder', msg: 'Your check-in is tomorrow. Please bring a valid ID. Check-in time is 2:00 PM.' },
    { label: 'Check-out Reminder', msg: 'Reminder: Check-out is at 11:00 AM tomorrow. We hope you enjoyed your stay!' },
    { label: 'Thank You', msg: 'Thank you for staying with us! We hope to see you again soon. Please leave us a review.' },
  ]

  useEffect(() => { loadConversations() }, [])

  async function loadConversations() {
    setLoading(true)
    try {
      const res = await chatApi.getOwnerChats()
      const raw = res.data?.data || res.data
      setConversations(Array.isArray(raw) ? raw : [])
    } catch { setConversations([]) }
    finally { setLoading(false) }
  }

  async function selectConversation(conv: Conversation) {
    setSelected(conv)
    try {
      const res = await chatApi.getMessages(conv.booking_id || String(conv.id))
      const raw = res.data?.data || res.data
      setMessages(Array.isArray(raw) ? raw : [])
    } catch { setMessages([]) }
  }

  async function sendMessage() {
    if (!text.trim() || !selected) return
    try {
      await chatApi.sendMessage({ booking_id: selected.booking_id || selected.id, message: text })
      setMessages(m => [...m, { id: Date.now().toString(), message: text, sender_type: 'owner', created_at: new Date().toISOString() }])
      setText('')
    } catch { toast.error('Failed to send message') }
  }

  return (
    <div className="p-6 max-w-6xl">
      <h1 className="font-poppins font-bold text-2xl text-dark-gray mb-6">Messaging</h1>
      <div className="flex bg-white rounded-2xl p-1 shadow-card border border-gray-100 w-fit mb-5">
        {(['inbox', 'automated'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-xl text-sm font-semibold capitalize transition-all ${tab === t ? 'bg-primary text-white' : 'text-gray-500'}`}>
            {t === 'automated' ? 'Automated Messages' : 'Inbox'}
          </button>
        ))}
      </div>

      {tab === 'inbox' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 h-[600px]">
          {/* Conversations */}
          <div className="card overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-100">
              <p className="font-semibold text-dark-gray text-sm">Conversations</p>
            </div>
            <div className="flex-1 overflow-y-auto">
              {loading ? Array.from({ length: 5 }).map((_, i) => <div key={i} className="shimmer h-16 m-3 rounded-xl" />) :
                conversations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400 p-6">
                    <FiMessageSquare className="text-4xl mb-2 text-gray-300" />
                    <p className="text-sm">No conversations yet</p>
                  </div>
                ) : conversations.map((c, i) => (
                  <button key={i} onClick={() => selectConversation(c)}
                    className={`w-full text-left p-4 border-b border-gray-50 hover:bg-surface transition-colors ${selected?.id === c.id ? 'bg-primary/5' : ''}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center font-bold text-primary text-sm flex-shrink-0">
                        {String(c.guest_name || 'G')[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-dark-gray truncate">{c.guest_name || 'Guest'}</p>
                        <p className="text-xs text-gray-400 truncate">{c.last_message || 'No messages'}</p>
                      </div>
                      {(c.unread || 0) > 0 && (
                        <span className="w-5 h-5 bg-primary rounded-full text-white text-xs flex items-center justify-center">{c.unread}</span>
                      )}
                    </div>
                  </button>
                ))
              }
            </div>
          </div>

          {/* Chat */}
          <div className="lg:col-span-2 card overflow-hidden flex flex-col">
            {!selected ? (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                <FiMessageSquare className="text-5xl mb-3 text-gray-300" />
                <p className="font-semibold">Select a conversation</p>
              </div>
            ) : (
              <>
                <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                  <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center font-bold text-primary">
                    {String(selected.guest_name || 'G')[0]}
                  </div>
                  <p className="font-semibold text-dark-gray">{selected.guest_name || 'Guest'}</p>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map((m, i) => {
                    const isOwner = m.sender_type === 'owner' || m.sender === 'owner'
                    return (
                      <div key={i} className={`flex ${isOwner ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs px-4 py-2.5 rounded-2xl text-sm ${isOwner ? 'bg-primary text-white rounded-br-sm' : 'bg-surface text-dark-gray rounded-bl-sm'}`}>
                          {m.message || m.content}
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div className="p-4 border-t border-gray-100 flex gap-2">
                  <input value={text} onChange={e => setText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendMessage()}
                    placeholder="Type a message..." className="input-field flex-1 text-sm py-2.5" />
                  <button onClick={sendMessage} className="btn-primary px-4 py-2.5">
                    <FiSend />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4 max-w-2xl">
          <p className="text-sm text-gray-500 mb-4">Set up automated messages sent to guests at key moments.</p>
          {TEMPLATES.map((t, i) => (
            <div key={i} className="card p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center">
                    <FiZap className="text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-dark-gray text-sm">{t.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5 max-w-sm">{t.msg}</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                  <input type="checkbox" defaultChecked={i < 2} className="sr-only peer" />
                  <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-5 peer-checked:bg-primary after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all" />
                </label>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
