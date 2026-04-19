'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { profileApi } from '@/lib/api'
import { isLoggedIn } from '@/lib/auth'
import { FiStar, FiGift, FiShare2 } from 'react-icons/fi'
import toast from 'react-hot-toast'

export default function LoyaltyPage() {
  const router = useRouter()
  const [data, setData] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoggedIn()) { router.push('/login?redirect=/loyalty'); return }
    load()
  }, [])

  async function load() {
    setLoading(true)
    try {
      const res = await profileApi.getLoyaltyBalance()
      setData(res.data?.data || res.data)
    } catch { setData(null) } finally { setLoading(false) }
  }

  const balance = Number(data?.balance || data?.points || 0)
  const referralCode = String(data?.referral_code || 'HSEWA' + Math.random().toString(36).slice(2, 7).toUpperCase())

  const TIERS = [
    { name: 'Silver', min: 0, max: 999, color: 'from-gray-400 to-gray-500', perks: ['5% discount', 'Priority support'] },
    { name: 'Gold', min: 1000, max: 4999, color: 'from-yellow-400 to-yellow-500', perks: ['10% discount', 'Free breakfast', 'Late checkout'] },
    { name: 'Platinum', min: 5000, max: Infinity, color: 'from-purple-500 to-purple-600', perks: ['15% discount', 'Free upgrades', 'Airport transfer', 'Dedicated manager'] },
  ]

  const currentTier = TIERS.find(t => balance >= t.min && balance <= t.max) || TIERS[0]

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16 max-w-3xl mx-auto px-4 py-8">
        <h1 className="font-poppins font-bold text-2xl text-dark-gray mb-6">Loyalty Program</h1>

        {/* Points card */}
        <div className={`bg-gradient-to-br ${currentTier.color} rounded-3xl p-6 text-white mb-6 shadow-elevated`}>
          <div className="flex items-center gap-2 mb-4">
            <FiStar className="text-white/80" />
            <span className="text-white/80 text-sm">{currentTier.name} Member</span>
          </div>
          {loading ? (
            <div className="shimmer h-12 w-32 rounded-xl bg-white/20" />
          ) : (
            <p className="font-poppins font-extrabold text-5xl">{balance.toLocaleString()}</p>
          )}
          <p className="text-white/70 text-sm mt-1">Loyalty Points</p>
          <div className="mt-4 bg-white/20 rounded-2xl p-3">
            <p className="text-white/70 text-xs mb-1">Progress to next tier</p>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full transition-all"
                style={{ width: `${Math.min(100, (balance / (currentTier.max === Infinity ? balance + 1000 : currentTier.max)) * 100)}%` }} />
            </div>
          </div>
        </div>

        {/* Perks */}
        <div className="card p-6 mb-6">
          <h3 className="font-poppins font-semibold text-dark-gray mb-4 flex items-center gap-2">
            <FiGift className="text-primary" /> Your {currentTier.name} Perks
          </h3>
          <div className="space-y-2">
            {currentTier.perks.map(perk => (
              <div key={perk} className="flex items-center gap-2">
                <span className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center text-xs text-primary">✓</span>
                <span className="text-sm text-gray-600">{perk}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Referral */}
        <div className="card p-6 mb-6">
          <h3 className="font-poppins font-semibold text-dark-gray mb-2 flex items-center gap-2">
            <FiShare2 className="text-primary" /> Refer & Earn
          </h3>
          <p className="text-sm text-gray-500 mb-4">Share your referral code and earn 200 points for each friend who books</p>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-surface rounded-2xl px-4 py-3 font-mono font-bold text-dark-gray tracking-wider">
              {referralCode}
            </div>
            <button onClick={() => { navigator.clipboard.writeText(referralCode); toast.success('Copied!') }}
              className="btn-primary px-5 py-3 text-sm">Copy</button>
          </div>
        </div>

        {/* All tiers */}
        <h3 className="font-poppins font-semibold text-dark-gray mb-4">Membership Tiers</h3>
        <div className="space-y-3">
          {TIERS.map(tier => (
            <div key={tier.name} className={`card p-5 ${currentTier.name === tier.name ? 'border-2 border-primary' : ''}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${tier.color} flex items-center justify-center`}>
                    <FiStar className="text-white text-sm" />
                  </div>
                  <span className="font-semibold text-dark-gray">{tier.name}</span>
                  {currentTier.name === tier.name && <span className="badge text-primary bg-primary/10 text-xs">Current</span>}
                </div>
                <span className="text-xs text-gray-400">{tier.max === Infinity ? `${tier.min.toLocaleString()}+ pts` : `${tier.min.toLocaleString()} - ${tier.max.toLocaleString()} pts`}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {tier.perks.map(p => <span key={p} className="text-xs bg-surface text-gray-500 px-2.5 py-1 rounded-lg">{p}</span>)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
