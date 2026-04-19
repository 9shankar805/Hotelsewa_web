'use client'
import { useState, useEffect, useRef } from 'react'
import { chatApi } from '@/lib/api'
import { getUser } from '@/lib/auth'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'
import { FiSend, FiMessageSquare } from 'react-icons/fi'

export default function OwnerChatPage() {
  const user = getUser()
  const [chats, setChats] = useState<Record<string, unknown>[]>([])
  const [selected, setSelected] = useState<Record<string, unknown> | null>(null)
  const [messages, setMessages] = useState<Record<string, unknown>[]>([])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => { loadChats() }, [])
  useEffect(() => { if (selected) loadMessages(String(selected.booking_id || selected.id)) }, [selected])
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  async function loadChats() {
    setLoading(true)
    try {
      const res = await chatApi.getOwnerChats()
      const raw = res.data?.data
      setChats(Array.isArray(raw) ? raw : [])
    } catch {
      setChats([])
    } finally {
      setLoading(false)
    }
  }

  async function loadMessages(bookingId: string) {
    try {
      const res = await chatApi.getMessages(bookingId)
      const raw = res.data?.data
      setMessages(Array.isArray(raw) ? raw : [])
    } catch {
      setMessages([])
    }
  }

  async function sendMessage() {
    if (!message.trim() || !selected) return
    const bookingId = String(selected.booking_id || selected.id)
    try {
      await chatApi.sendMessage({ booking_id: bookingId, message })
      setMessage('')
      loadMessages(bookingId)
    } catch {
      toast.error('Failed to send message')
    }
  }

  return (
    <div className="p-6 h-[calc(100vh-2rem)]">
      <h1 className="font-poppins font-bold text-2xl text-dark-gray mb-4">Messages</h1>
      <div className="flex gap-4 h-[calc(100%-4rem)]">
        {/* Chat list */}
        <div className="w-72 flex-shrink-0 card overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-100">
            <p className="font-semibold text-sm text-dark-gray">Conversations</p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="shimmer w-10 h-10 rounded-full flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="shimmer h-4 w-2/3 rounded-lg" />
                      <div className="shimmer h-3 w-1/2 rounded-lg" />
                    </div>
                  </div>
                ))}
              </div>
            ) : chats.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">No conversations yet</div>
            ) : (
              chats.map((chat, i) => {
                const guest = (chat.user as Record<string, unknown>) || {}
                const isSelected = selected?.id === chat.id
                return (
                  <button key={i} onClick={() => setSelected(chat)}
                    className={`w-full flex items-center gap-3 p-4 hover:bg-surface transition-all text-left ${isSelected ? 'bg-primary/5 border-r-2 border-primary' : ''}`}>
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-primary font-bold text-sm">{String(guest.name || 'G')[0]}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-dark-gray truncate">{String(guest.name || 'Guest')}</p>
                      <p className="text-xs text-gray-400 truncate">{String(chat.last_message || 'No messages yet')}</p>
                    </div>
                    {!!chat.unread_count && Number(chat.unread_count) > 0 && (
                      <span className="w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center flex-shrink-0">
                        {String(chat.unread_count)}
                      </span>
                    )}
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* Chat window */}
        <div className="flex-1 card overflow-hidden flex flex-col">
          {selected ? (
            <>
              <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-primary font-bold text-sm">
                    {String((selected.user as Record<string, unknown>)?.name || 'G')[0]}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-sm text-dark-gray">{String((selected.user as Record<string, unknown>)?.name || 'Guest')}</p>
                  <p className="text-xs text-gray-400">Booking #{String(selected.booking_id || selected.id || '').slice(-6)}</p>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg, i) => {
                  const isOwner = String(msg.sender_id) === String(user?.id) || msg.sender_type === 'owner'
                  return (
                    <div key={i} className={`flex ${isOwner ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs px-4 py-2.5 rounded-2xl text-sm ${isOwner ? 'bg-primary text-white rounded-br-sm' : 'bg-surface text-dark-gray rounded-bl-sm'}`}>
                        <p>{String(msg.message || msg.content || '')}</p>
                        <p className={`text-xs mt-1 ${isOwner ? 'text-white/60' : 'text-gray-400'}`}>
                          {new Date(String(msg.created_at || '')).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>
              <div className="p-4 border-t border-gray-100 flex gap-3">
                <input value={message} onChange={e => setMessage(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendMessage()}
                  placeholder="Type a message..." className="input-field flex-1 py-2.5" />
                <button onClick={sendMessage} className="w-11 h-11 bg-primary text-white rounded-2xl flex items-center justify-center hover:bg-primary-dark transition-all">
                  <FiSend />
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center">
              <div>
                <FiMessageSquare className="text-6xl text-gray-300 mx-auto mb-4" />
                <p className="text-gray-400">Select a conversation to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
