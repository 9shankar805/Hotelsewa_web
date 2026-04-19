'use client'
import { useState } from 'react'
import Navbar from '@/components/Navbar'
import { getUser } from '@/lib/auth'
import toast from 'react-hot-toast'
import { FiCopy, FiShare2, FiGift, FiUsers, FiDollarSign } from 'react-icons/fi'

const REFERRAL_HISTORY = [
  { name: 'Rahul S.', date: '2025-03-10', status: 'completed', earned: 200 },
  { name: 'Priya M.', date: '2025-02-28', status: 'pending', earned: 0 },
  { name: 'Amit K.', date: '2025-02-15', status: 'completed', earned: 200 },
]

export default function InvitePage() {
  const user = getUser()
  const referralCode = `HS${(user?.name || 'USER').slice(0,4).toUpperCase()}${Math.floor(1000 + Math.random() * 9000)}`
  const [copied, setCopied] = useState(false)

  function copyCode() {
    navigator.clipboard.writeText(referralCode)
    setCopied(true)
    toast.success('Referral code copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  function share() {
    if (navigator.share) {
      navigator.share({ title: 'Join HotelSewa', text: `Use my code ${referralCode} to get ₹200 off your first booking!`, url: `https://hotelsewa.com/signup?ref=${referralCode}` })
    } else { copyCode() }
  }

  const totalEarned = REFERRAL_HISTORY.filter(r => r.status === 'completed').reduce((s, r) => s + r.earned, 0)

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16 max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="font-poppins font-bold text-2xl text-dark-gray mb-6">Invite & Earn</h1>

        {/* Hero */}
        <div className="bg-gradient-to-br from-primary to-primary-dark rounded-3xl p-6 mb-6 text-white text-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FiGift className="text-3xl" />
          </div>
          <h2 className="font-poppins font-bold text-2xl mb-2">Earn ₹200 per referral</h2>
          <p className="text-white/80 text-sm">Invite friends to HotelSewa. When they complete their first booking, you both get ₹200 wallet credit.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total Invited', value: REFERRAL_HISTORY.length, icon: FiUsers },
            { label: 'Completed', value: REFERRAL_HISTORY.filter(r => r.status === 'completed').length, icon: FiGift },
            { label: 'Total Earned', value: `₹${totalEarned}`, icon: FiDollarSign },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="card p-4 text-center">
              <Icon className="text-primary text-xl mx-auto mb-2" />
              <p className="font-poppins font-bold text-xl text-dark-gray">{value}</p>
              <p className="text-xs text-gray-400">{label}</p>
            </div>
          ))}
        </div>

        {/* Referral code */}
        <div className="card p-6 mb-5">
          <p className="font-semibold text-dark-gray mb-3">Your Referral Code</p>
          <div className="flex items-center gap-3 bg-surface rounded-2xl p-4 mb-4">
            <p className="font-poppins font-extrabold text-2xl text-primary tracking-widest flex-1 text-center">{referralCode}</p>
            <button onClick={copyCode} className={`flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl transition-all ${copied ? 'bg-green-50 text-green-600' : 'bg-primary/10 text-primary hover:bg-primary/20'}`}>
              <FiCopy className="text-xs" /> {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <button onClick={share} className="btn-primary w-full flex items-center justify-center gap-2">
            <FiShare2 /> Share with Friends
          </button>
        </div>

        {/* How it works */}
        <div className="card p-5 mb-5">
          <p className="font-semibold text-dark-gray mb-4">How it works</p>
          <div className="space-y-4">
            {[
              { step: '1', title: 'Share your code', desc: 'Send your unique referral code to friends' },
              { step: '2', title: 'Friend signs up', desc: 'They register using your referral code' },
              { step: '3', title: 'First booking', desc: 'They complete their first hotel booking' },
              { step: '4', title: 'Both earn ₹200', desc: 'You and your friend get ₹200 wallet credit each' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex items-start gap-4">
                <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0">{step}</div>
                <div>
                  <p className="font-semibold text-sm text-dark-gray">{title}</p>
                  <p className="text-xs text-gray-400">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* History */}
        <div className="card p-5">
          <p className="font-semibold text-dark-gray mb-4">Referral History</p>
          {REFERRAL_HISTORY.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No referrals yet</p>
          ) : (
            <div className="space-y-3">
              {REFERRAL_HISTORY.map((r, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center font-bold text-primary text-sm">{r.name[0]}</div>
                    <div>
                      <p className="text-sm font-medium text-dark-gray">{r.name}</p>
                      <p className="text-xs text-gray-400">{r.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`badge text-xs ${r.status === 'completed' ? 'text-green-600 bg-green-50' : 'text-orange-600 bg-orange-50'}`}>{r.status}</span>
                    {r.earned > 0 && <p className="text-xs font-semibold text-green-600 mt-0.5">+₹{r.earned}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
