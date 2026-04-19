'use client'
import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { chatApi } from '@/lib/api'
import { isLoggedIn, getUser } from '@/lib/auth'
import toast from 'react-hot-toast'
import { FiSend, FiMessageSquare } from 'react-icons/fi'

function ChatContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const bookingId = searchParams.get('bookingId') || ''
  const user = getUser()
  const [messages, setMessages] = useState<Record<string, unknown>[]>([])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isLoggedIn()) { router.push('/login?redirect=/chat'); return }
    if (bookingId) loadMessages()
    else setLoading(false)
  }, [bookingId])

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  async function loadMessages() {
    setLoading(true)
    try {
      const res = await chatApi.getMessages(bookingId)
      const raw = res.data?.data
      setMessages(Array.isArray(raw) ? raw : [])
    } catch { setMessages([]) } finally { setLoading(false) }
  }

  async function sendMessage() {
    if (!message.trim() || !bookingId) return
    const text = message
    setMessage('')
    try {
      await chatApi.sendMessage({ booking_id: bookingId, message: text })
      loadMessages()
    } catch { toast.error('Failed to send message') }
  }

  if (!bookingId) return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <FiMessageSquare className="text-6xl text-gray-300 mx-auto mb-4" />
          <h3 className="font-poppins font-bold text-xl text-dark-gray mb-2">No booking selected</h3>
          <p className="text-gray-500 mb-6">Chat is available for active bookings</p>
          <button onClick={() => router.push('/trips')} className="btn-primary">View My Trips</button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="pt-16 flex-1 flex flex-col max-w-2xl mx-auto w-full px-4 py-4">
        <div className="card flex-1 flex flex-col overflow-hidden" style={{ height: 'calc(100vh - 120px)' }}>
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-poppins font-semibold text-dark-gray">Hotel Chat</h2>
            <p className="text-xs text-gray-400">Booking #{bookingId.slice(-6)}</p>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <span className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                No messages yet. Start the conversation!
              </div>
            ) : (
              messages.map((msg, i) => {
                const isMe = String(msg.sender_id) === String(user?.id) || msg.sender_type === 'user'
                return (
                  <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs px-4 py-2.5 rounded-2xl text-sm ${isMe ? 'bg-primary text-white rounded-br-sm' : 'bg-surface text-dark-gray rounded-bl-sm'}`}>
                      <p>{String(msg.message || msg.content || '')}</p>
                      <p className={`text-xs mt-1 ${isMe ? 'text-white/60' : 'text-gray-400'}`}>
                        {new Date(String(msg.created_at || '')).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                )
              })
            )}
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
        </div>
      </div>
    </div>
  )
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"/></div>}>
      <ChatContent />
    </Suspense>
  )
}
