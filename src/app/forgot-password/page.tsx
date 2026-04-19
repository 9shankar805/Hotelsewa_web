'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FiMail, FiArrowLeft } from 'react-icons/fi'
import { MdHotel } from 'react-icons/md'
import { authApi } from '@/lib/api'
import toast from 'react-hot-toast'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [loading, setLoading] = useState(false)

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return toast.error('Enter your email')
    setLoading(true)
    try {
      const res = await authApi.getOtp(email)
      if (res.data?.success !== false) {
        setStep('otp')
        toast.success('Reset code sent to your email')
      } else {
        toast.error(res.data?.message || 'Failed to send reset code')
      }
    } catch { toast.error('Failed to send reset code') } finally { setLoading(false) }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault()
    if (!otp) return toast.error('Enter the OTP')
    setLoading(true)
    try {
      const res = await authApi.verifyOtp(email, otp)
      if (res.data?.success !== false) {
        toast.success('OTP verified! You can now reset your password.')
        router.push('/login')
      } else {
        toast.error(res.data?.message || 'Invalid OTP')
      }
    } catch { toast.error('OTP verification failed') } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center">
            <MdHotel className="text-white" />
          </div>
          <span className="font-poppins font-extrabold text-xl text-primary">HOTELSEWA</span>
        </div>

        <div className="card p-8">
          <Link href="/login" className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary mb-6 transition-colors">
            <FiArrowLeft /> Back to login
          </Link>

          {step === 'email' ? (
            <>
              <h1 className="font-poppins font-bold text-2xl text-dark-gray mb-2">Forgot Password?</h1>
              <p className="text-gray-500 text-sm mb-6">Enter your email and we&apos;ll send you a reset code</p>
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-dark-gray mb-1.5 block">Email Address</label>
                  <div className="relative">
                    <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="you@example.com" className="input-field pl-11" required />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                  {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Send Reset Code'}
                </button>
              </form>
            </>
          ) : (
            <>
              <h1 className="font-poppins font-bold text-2xl text-dark-gray mb-2">Enter Reset Code</h1>
              <p className="text-gray-500 text-sm mb-6">We sent a code to <strong>{email}</strong></p>
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-dark-gray mb-1.5 block">OTP Code</label>
                  <input type="text" value={otp} onChange={e => setOtp(e.target.value)}
                    placeholder="Enter 6-digit code" className="input-field text-center text-xl tracking-widest" maxLength={6} required />
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                  {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Verify Code'}
                </button>
                <button type="button" onClick={() => setStep('email')} className="w-full text-sm text-gray-500 hover:text-primary transition-colors">
                  Resend code
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
