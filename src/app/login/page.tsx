'use client'
import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { FiMail, FiLock, FiEye, FiEyeOff, FiPhone } from 'react-icons/fi'
import { MdHotel } from 'react-icons/md'
import { authApi } from '@/lib/api'
import { saveSession } from '@/lib/auth'
import toast from 'react-hot-toast'
import GoogleLoginButton from '@/components/GoogleLoginButton'

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'

  const [tab, setTab] = useState<'email' | 'otp'>('email')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) return toast.error('Please fill all fields')
    setLoading(true)
    try {
      const res = await authApi.login(email, password)
      const data = res.data
      console.log('[Login] API response:', JSON.stringify(data).slice(0, 300))
      // Token is at root level: { token, data: {...user}, message, error }
      if (data?.token || data?.access_token) {
        saveSession(data)
        toast.success('Welcome back!')
        window.location.href = redirect
      } else {
        toast.error(data?.message || 'Login failed')
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Login failed'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault()
    if (!phone) return toast.error('Enter phone number')
    setLoading(true)
    try {
      const res = await authApi.getOtp(phone)
      if (res.data?.success !== false) {
        setOtpSent(true)
        toast.success('OTP sent!')
      } else {
        toast.error(res.data?.message || 'Failed to send OTP')
      }
    } catch {
      toast.error('Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault()
    if (!otp) return toast.error('Enter OTP')
    setLoading(true)
    try {
      const res = await authApi.verifyOtp(phone, otp)
      const data = res.data
      if (data?.token || data?.access_token) {
        saveSession(data)
        toast.success('Welcome!')
        window.location.href = redirect
      } else {
        toast.error(data?.message || 'Invalid OTP')
      }
    } catch {
      toast.error('OTP verification failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-primary-dark items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="absolute rounded-full bg-white"
              style={{ width: `${20 + Math.random() * 60}px`, height: `${20 + Math.random() * 60}px`, top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`, opacity: Math.random() * 0.5 }} />
          ))}
        </div>
        <div className="relative text-center text-white">
          <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <MdHotel className="text-white text-4xl" />
          </div>
          <h2 className="font-poppins font-extrabold text-4xl mb-4">Welcome Back!</h2>
          <p className="text-white/80 text-lg">Sign in to access your bookings, saved hotels, and exclusive deals.</p>
          <div className="mt-10 grid grid-cols-3 gap-4 text-center">
            {[['50K+', 'Happy Guests'], ['1000+', 'Hotels'], ['4.8★', 'Rating']].map(([v, l]) => (
              <div key={l} className="bg-white/15 rounded-2xl p-4">
                <div className="font-poppins font-bold text-2xl">{v}</div>
                <div className="text-white/70 text-xs mt-1">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center">
              <MdHotel className="text-white" />
            </div>
            <span className="font-poppins font-extrabold text-xl text-primary">HOTELSEWA</span>
          </div>

          <h1 className="font-poppins font-bold text-2xl text-dark-gray mb-2">Sign In</h1>
          <p className="text-gray-500 text-sm mb-8">Welcome back! Please enter your details.</p>

          {/* Tabs */}
          <div className="flex bg-surface rounded-2xl p-1 mb-6">
            {(['email', 'otp'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${tab === t ? 'bg-white text-primary shadow-card' : 'text-gray-500'}`}>
                {t === 'email' ? '📧 Email' : '📱 OTP'}
              </button>
            ))}
          </div>

          {tab === 'email' ? (
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-dark-gray mb-1.5 block">Email</label>
                <div className="relative">
                  <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com" className="input-field pl-11" required />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-dark-gray mb-1.5 block">Password</label>
                <div className="relative">
                  <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••" className="input-field pl-11 pr-11" required />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary">
                    {showPass ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>
              <div className="flex justify-end">
                <Link href="/forgot-password" className="text-sm text-primary font-medium hover:underline">Forgot password?</Link>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Sign In'}
              </button>
            </form>
          ) : (
            <form onSubmit={otpSent ? handleVerifyOtp : handleSendOtp} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-dark-gray mb-1.5 block">Phone Number</label>
                <div className="relative">
                  <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                    placeholder="+91 9876543210" className="input-field pl-11" required disabled={otpSent} />
                </div>
              </div>
              {otpSent && (
                <div>
                  <label className="text-sm font-medium text-dark-gray mb-1.5 block">Enter OTP</label>
                  <input type="text" value={otp} onChange={e => setOtp(e.target.value)}
                    placeholder="6-digit OTP" className="input-field text-center text-xl tracking-widest" maxLength={6} required />
                  <button type="button" onClick={() => setOtpSent(false)} className="text-xs text-primary mt-2 hover:underline">
                    Change number
                  </button>
                </div>
              )}
              <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : otpSent ? 'Verify OTP' : 'Send OTP'}
              </button>
            </form>
          )}

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium">OR</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Google Login */}
          <GoogleLoginButton redirect={redirect} />

          <p className="text-center text-sm text-gray-500 mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-primary font-semibold hover:underline">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><span className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div>}>
      <LoginContent />
    </Suspense>
  )
}
