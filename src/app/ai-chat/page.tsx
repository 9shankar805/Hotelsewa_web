'use client'
import { useState, useRef, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import { FiSend, FiRefreshCw } from 'react-icons/fi'
import { MdSmartToy } from 'react-icons/md'
import api from '@/lib/api'

interface Message { role: 'user' | 'assistant'; content: string }

const SUGGESTIONS = [
  'Find me a budget hotel in Mumbai',
  'What are the best hotels in Goa?',
  'I need a hotel with a pool in Delhi',
  'Show me luxury hotels under ₹10,000',
]

export default function AIChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hi! I\'m your HotelSewa AI assistant. I can help you find the perfect hotel, answer questions about bookings, and more. How can I help you today?' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  async function startSession() {
    try {
      const res = await api.post('/ai-chat/start')
      setToken(res.data?.data?.token || res.data?.token || null)
    } catch { /* ignore */ }
  }

  useEffect(() => { startSession() }, [])

  async function sendMessage() {
    if (!input.trim() || loading) return
    const userMsg = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setLoading(true)
    try {
      const res = await api.post('/ai-chat/message', { message: userMsg, token })
      const reply = res.data?.data?.message || res.data?.message || 'I\'m here to help! Could you please rephrase your question?'
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I\'m having trouble connecting. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setMessages([{ role: 'assistant', content: 'Hi! I\'m your HotelSewa AI assistant. How can I help you today?' }])
    setToken(null)
    startSession()
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="pt-16 flex-1 flex flex-col max-w-3xl mx-auto w-full px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center shadow-primary">
              <MdSmartToy className="text-white text-xl" />
            </div>
            <div>
              <h1 className="font-poppins font-bold text-dark-gray">AI Assistant</h1>
              <p className="text-xs text-green-500 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full" /> Online
              </p>
            </div>
          </div>
          <button onClick={reset} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary transition-colors">
            <FiRefreshCw className="text-sm" /> New Chat
          </button>
        </div>

        <div className="card flex-1 flex flex-col overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                    <MdSmartToy className="text-white text-sm" />
                  </div>
                )}
                <div className={`max-w-sm px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user' ? 'bg-primary text-white rounded-br-sm' : 'bg-surface text-dark-gray rounded-bl-sm'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start animate-fade-in">
                <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center mr-2 flex-shrink-0">
                  <MdSmartToy className="text-white text-sm" />
                </div>
                <div className="bg-surface rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1.5 items-center">
                  {[0, 1, 2].map(i => (
                    <span key={i} className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions */}
          {messages.length === 1 && (
            <div className="px-5 pb-3 flex flex-wrap gap-2">
              {SUGGESTIONS.map(s => (
                <button key={s} onClick={() => { setInput(s); }}
                  className="text-xs bg-surface text-gray-600 px-3 py-1.5 rounded-xl hover:bg-primary/10 hover:text-primary transition-all">
                  {s}
                </button>
              ))}
            </div>
          )}

          <div className="p-4 border-t border-gray-100 flex gap-3">
            <input value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="Ask me anything about hotels..." className="input-field flex-1 py-2.5" />
            <button onClick={sendMessage} disabled={loading || !input.trim()}
              className="w-11 h-11 bg-primary text-white rounded-2xl flex items-center justify-center hover:bg-primary-dark transition-all disabled:opacity-50">
              <FiSend />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
