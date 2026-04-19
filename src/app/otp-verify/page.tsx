'use client'
import { useState, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { authApi } from '@/lib/api'
import { saveSession } from '@/lib/auth'
import toast from 'react-hot-toast'
import { FiArrowLeft, FiSmartphone } from 'react-icons/fi'
import Link from 'next/link'

function OtpForm() {
  const router = useRouter()
  const params = useSearchParams()
  const mobile = params.get('mobile') || ''
  const redirect = params.get('redirect') || '/'

  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const inputs = useRef<(HTMLInputElement | null)[]>([])

  function handleChange(i: number, val: string) {
    if (!/^\d*$/.test(val)) return
    const next = [...otp]
    next[i] = val.slice(-1)
    setOtp(next)
    if (val && i < 5) inputs.current[i + 1]?.focus()
  }

  function handleKeyDown(i: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !otp[i] && i > 0) inputs.current[i - 1]?.focus()
  }

  function handlePaste(e: React.ClipboardEvent) {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (text.length === 6) {
      setOtp(text.split(''))
      inputs.current[5]?.focus()
    }
  }

  async function verify() {
    const code = otp.join('')
    if (code.length < 6) { toast.error('Enter 6-digit OTP'); return }
    setLoading(true)
    try {
      const res = await authApi.verifyOtp(mobile, code)
      const data = res.data?.data || res.data
      if (data?.token || data?.access_token) {
        saveSession(data)
        toast.success('Verified successfully!')
        router.push(redirect)
      } else { toast.error(res.data?.message || 'Invalid OTP') }
    } catch { toast.error('Verification failed') }
    finally { setLoading(false) }
  }

  async function resend() {
    setResending(true)
    try {
      await authApi.getOtp(mobile)
      toast.success('OTP resent!')
      setCountdown(30)
      const timer = setInterval(() => setCountdown(c => { if (c <= 1) { clearInterval(timer); return 0 } return c - 1 }), 1000)
    } catch { toast.error('Failed to resend OTP') }
    finally { setResending(false) }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16 flex items-center justify-center min-h-[80vh] px-4">
        <div className="w-full max-w-md">
          <div className="card p-8">
            <div className="flex items-center gap-3 mb-6">
              <Link href="/login" className="w-9 h-9 rounded-xl bg-surface flex items-center justify-center">
                <FiArrowLeft className="text-gray-600" />
              </Link>
              <div>
                <h1 className="font-poppins font-bold text-2xl text-dark-gray">Verify OTP</h1>
                <p className="text-sm text-gray-400">Sent to {mobile || 'your phone'}</p>
              </div>
            </div>

            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <FiSmartphone className="text-primary text-2xl" />
            </div>

            <p className="text-center text-sm text-gray-500 mb-6">
              Enter the 6-digit code sent to <span className="font-semibold text-dark-gray">{mobile}</span>
            </p>

            {/* OTP inputs */}
            <div className="flex gap-3 justify-center mb-6" onPaste={handlePaste}>
              {otp.map((digit, i) => (
                <input key={i} ref={el => { inputs.current[i] = el }}
                  type="text" inputMode="numeric" maxLength={1} value={digit}
                  onChange={e => handleChange(i, e.target.value)}
                  onKeyDown={e => handleKeyDown(i, e)}
                  className={`w-12 h-12 text-center text-xl font-bold rounded-xl border-2 outline-none transition-all ${digit ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200 bg-surface text-dark-gray'} focus:border-primary`}
                />
              ))}
            </div>

            <button onClick={verify} disabled={loading || otp.join('').length < 6}
              className="btn-primary w-full flex items-center justify-center gap-2 mb-4">
              {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>

            <div className="text-center">
              {countdown > 0 ? (
                <p className="text-sm text-gray-400">Resend OTP in <span className="font-semibold text-primary">{countdown}s</span></p>
              ) : (
                <button onClick={resend} disabled={resending} className="text-sm text-primary font-semibold hover:underline disabled:opacity-50">
                  {resending ? 'Sending...' : 'Resend OTP'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function OtpVerifyPage() {
  return <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"/></div>}><OtpForm /></Suspense>
}
