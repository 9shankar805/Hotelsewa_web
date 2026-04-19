'use client'
import { useState, useEffect } from 'react'
import { ownerApi } from '@/lib/api'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'
import { FiStar, FiMessageSquare, FiSend } from 'react-icons/fi'

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)
  const [replyModal, setReplyModal] = useState<{ id: string; guestName: string } | null>(null)
  const [reply, setReply] = useState('')
  const [filter, setFilter] = useState<number | null>(null)

  useEffect(() => { loadReviews() }, [])

  async function loadReviews() {
    setLoading(true)
    try {
      const res = await ownerApi.getReviews()
      const raw = res.data?.data
      setReviews(Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [])
    } catch {
      setReviews([])
    } finally {
      setLoading(false)
    }
  }

  async function handleReply() {
    if (!replyModal || !reply.trim()) return
    try {
      await ownerApi.replyReview(replyModal.id, reply)
      toast.success('Reply sent!')
      setReplyModal(null)
      setReply('')
      loadReviews()
    } catch {
      toast.error('Failed to send reply')
    }
  }

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) / reviews.length).toFixed(1)
    : '0.0'

  const filtered = filter ? reviews.filter(r => Number(r.rating) === filter) : reviews

  return (
    <div className="p-6">
      <h1 className="font-poppins font-bold text-2xl text-dark-gray mb-6">Reviews</h1>

      {/* Summary */}
      <div className="card p-6 mb-6 flex items-center gap-8">
        <div className="text-center">
          <p className="font-poppins font-extrabold text-5xl text-dark-gray">{avgRating}</p>
          <div className="flex gap-1 justify-center mt-2">
            {[1,2,3,4,5].map(n => (
              <FiStar key={n} className={`text-lg ${n <= Number(avgRating) ? 'text-gold fill-gold' : 'text-gray-300'}`} />
            ))}
          </div>
          <p className="text-sm text-gray-400 mt-1">{reviews.length} reviews</p>
        </div>
        <div className="flex-1 space-y-2">
          {[5,4,3,2,1].map(n => {
            const count = reviews.filter(r => Number(r.rating) === n).length
            const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0
            return (
              <div key={n} className="flex items-center gap-3">
                <button onClick={() => setFilter(filter === n ? null : n)} className="flex items-center gap-1 text-xs font-medium text-gray-600 w-8">
                  {n} <FiStar className="text-gold fill-gold text-xs" />
                </button>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gold rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-xs text-gray-400 w-6">{count}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Reviews list */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card p-5 space-y-3">
              <div className="flex gap-3">
                <div className="shimmer w-10 h-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="shimmer h-4 w-1/3 rounded-lg" />
                  <div className="shimmer h-3 w-1/4 rounded-lg" />
                </div>
              </div>
              <div className="shimmer h-12 rounded-xl" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <FiStar className="text-5xl mx-auto mb-3" />
          <p>No reviews yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((r, i) => {
            const user = (r.user as Record<string, unknown>) || {}
            return (
              <div key={i} className="card p-5 animate-fade-in">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-primary font-bold">{String(user.name || r.user_name || 'G')[0]}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-dark-gray text-sm">{String(user.name || r.user_name || 'Guest')}</p>
                      <div className="flex gap-0.5 mt-0.5">
                        {[1,2,3,4,5].map(n => (
                          <FiStar key={n} className={`text-xs ${n <= Number(r.rating) ? 'text-gold fill-gold' : 'text-gray-300'}`} />
                        ))}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">{formatDate(String(r.created_at || ''))}</span>
                </div>
                <p className="text-sm text-gray-600 mt-3 leading-relaxed">{String(r.comment || r.review || '')}</p>

                {r.reply ? (
                  <div className="mt-3 bg-primary/5 rounded-2xl p-3 border-l-2 border-primary">
                    <p className="text-xs font-semibold text-primary mb-1">Your Reply</p>
                    <p className="text-sm text-gray-600">{String(r.reply)}</p>
                  </div>
                ) : (
                  <button onClick={() => setReplyModal({ id: String(r.id), guestName: String(user.name || r.user_name || 'Guest') })}
                    className="mt-3 flex items-center gap-1.5 text-xs text-primary font-semibold hover:underline">
                    <FiMessageSquare /> Reply to this review
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Reply modal */}
      {replyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md animate-fade-in">
            <h3 className="font-poppins font-bold text-xl mb-2">Reply to {replyModal.guestName}</h3>
            <p className="text-sm text-gray-500 mb-4">Your reply will be visible to all guests</p>
            <textarea value={reply} onChange={e => setReply(e.target.value)}
              placeholder="Write your reply..." rows={4}
              className="input-field resize-none mb-4" />
            <div className="flex gap-3">
              <button onClick={() => setReplyModal(null)} className="btn-outline flex-1">Cancel</button>
              <button onClick={handleReply} className="btn-primary flex-1 flex items-center justify-center gap-2">
                <FiSend /> Send Reply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
