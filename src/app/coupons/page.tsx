'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { bookingApi } from '@/lib/api'
import { isLoggedIn } from '@/lib/auth'
import toast from 'react-hot-toast'
import { FiTag, FiCopy, FiCheck } from 'react-icons/fi'

const SAMPLE_COUPONS = [
  { code: 'SAVE20', discount: 20, description: '20% off on all bookings', minAmount: 2000, expiry: '2026-12-31' },
  { code: 'FIRST50', discount: 50, description: '50% off on your first booking', minAmount: 1000, expiry: '2026-06-30' },
  { code: 'WEEKEND30', discount: 30, description: '30% off on weekend stays', minAmount: 3000, expiry: '2026-09-30' },
  { code: 'LUXURY15', discount: 15, description: '15% off on luxury hotels', minAmount: 5000, expiry: '2026-12-31' },
]

export default function CouponsPage() {
  const router = useRouter()
  const [couponCode, setCouponCode] = useState('')
  const [validating, setValidating] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  function copyCode(code: string) {
    navigator.clipboard.writeText(code)
    setCopied(code)
    toast.success('Coupon code copied!')
    setTimeout(() => setCopied(null), 2000)
  }

  async function validateCoupon(e: React.FormEvent) {
    e.preventDefault()
    if (!isLoggedIn()) { router.push('/login?redirect=/coupons'); return }
    if (!couponCode.trim()) return toast.error('Enter a coupon code')
    setValidating(true)
    try {
      const res = await bookingApi.validateCoupon({ couponCode: couponCode.trim(), bookingId: '' })
      if (res.data?.success) {
        toast.success(`Coupon valid! ${res.data?.data?.discount || ''}% discount applied`)
      } else {
        toast.error(res.data?.message || 'Invalid coupon code')
      }
    } catch {
      toast.error('Failed to validate coupon')
    } finally {
      setValidating(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16 max-w-3xl mx-auto px-4 py-8">
        <h1 className="font-poppins font-bold text-2xl text-dark-gray mb-6">Coupons & Offers</h1>

        {/* Validate coupon */}
        <div className="card p-6 mb-8">
          <h3 className="font-poppins font-semibold text-dark-gray mb-4">Have a coupon code?</h3>
          <form onSubmit={validateCoupon} className="flex gap-3">
            <div className="flex-1 flex items-center gap-2 bg-surface rounded-2xl px-4 py-3">
              <FiTag className="text-primary flex-shrink-0" />
              <input type="text" value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())}
                placeholder="Enter coupon code" className="bg-transparent text-sm w-full outline-none font-mono tracking-wider" />
            </div>
            <button type="submit" disabled={validating} className="btn-primary px-6 flex items-center gap-2">
              {validating ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Apply'}
            </button>
          </form>
        </div>

        {/* Available coupons */}
        <h3 className="font-poppins font-semibold text-dark-gray mb-4">Available Coupons</h3>
        <div className="space-y-4">
          {SAMPLE_COUPONS.map((c, i) => (
            <div key={i} className="card p-5 flex items-center gap-4">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                <FiTag className="text-primary text-2xl" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono font-bold text-dark-gray text-lg">{c.code}</span>
                  <span className="badge text-primary bg-primary/10 font-bold">{c.discount}% OFF</span>
                </div>
                <p className="text-sm text-gray-500">{c.description}</p>
                <p className="text-xs text-gray-400 mt-1">Min. ₹{c.minAmount.toLocaleString()} · Expires {c.expiry}</p>
              </div>
              <button onClick={() => copyCode(c.code)}
                className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center hover:bg-primary/10 transition-all">
                {copied === c.code ? <FiCheck className="text-green-600" /> : <FiCopy className="text-gray-500" />}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
