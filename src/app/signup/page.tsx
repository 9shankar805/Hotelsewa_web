'use client'
import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { FiMail, FiLock, FiEye, FiEyeOff, FiPhone, FiUser } from 'react-icons/fi'
import { MdHotel } from 'react-icons/md'
import { authApi } from '@/lib/api'
import { saveSession } from '@/lib/auth'
import toast from 'react-hot-toast'
import GoogleLoginButton from '@/components/GoogleLoginButton'

function SignupContent() {
  const searchParams = useSearchParams()
  const defaultRole = searchParams.get('role') || 'customer'

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState(defaultRole)
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !email || !phone || !password) return toast.error('Please fill all fields')
    if (password !== confirmPassword) return toast.error('Passwords do not match')
    if (password.length < 6) return toast.error('Password must be at least 6 characters')

    setLoading(true)
    try {
      const res = await authApi.signup(name, email, password, phone, role)
      const data = res.data

      if (data?.token || data?.access_token) {
        saveSession(data)
        toast.success('Account created successfully!')
        window.location.href = role === 'hotel_owner' ? '/owner/dashboard' : '/'
      } else {
        toast.error(data?.message || 'Signup failed')
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Signup failed'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-dark-gray to-[#2D1B69] items-center justify-center p-12 relative overflow-hidden">
        <div className="relative text-center text-white">
          <div className="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-primary">
            <MdHotel className="text-white text-4xl" />
          </div>
          <h2 className="font-poppins font-extrabold text-4xl mb-4">Join HotelSewa</h2>
          <p className="text-white/70 text-lg mb-10">Create your account and start exploring amazing hotels or list your property.</p>
          <div className="space-y-4">
            {['Access exclusive deals & discounts', 'Manage bookings easily', 'Earn loyalty points', 'List your hotel & earn more'].map(f => (
              <div key={f} className="flex items-center gap-3 text-left">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs">✓</span>
                </div>
                <span className="text-white/80 text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
        <div className="w-full max-w-md py-8">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center">
              <MdHotel className="text-white" />
            </div>
            <span className="font-poppins font-extrabold text-xl text-primary">HOTELSEWA</span>
          </div>

          <h1 className="font-poppins font-bold text-2xl text-dark-gray mb-2">Create Account</h1>
          <p className="text-gray-500 text-sm mb-6">Join thousands of happy travelers</p>

          {/* Role selector */}
          <div className="flex bg-surface rounded-2xl p-1 mb-6">
            {[['customer', '🧳 Traveler'], ['hotel_owner', '🏨 Hotel Owner']].map(([r, label]) => (
              <button key={r} onClick={() => setRole(r)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${role === r ? 'bg-white text-primary shadow-card' : 'text-gray-500'}`}>
                {label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-dark-gray mb-1.5 block">Full Name</label>
              <div className="relative">
                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" value={name} onChange={e => setName(e.target.value)}
                  placeholder="John Doe" className="input-field pl-11" required />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-dark-gray mb-1.5 block">Email</label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com" className="input-field pl-11" required />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-dark-gray mb-1.5 block">Phone Number</label>
              <div className="relative">
                <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                  placeholder="+91 9876543210" className="input-field pl-11" required />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-dark-gray mb-1.5 block">Password</label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Min. 6 characters" className="input-field pl-11 pr-11" required />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary">
                  {showPass ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-dark-gray mb-1.5 block">Confirm Password</label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password" className="input-field pl-11" required />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
              {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Create Account'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium">OR</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Google Signup */}
          <GoogleLoginButton role={role} label="Sign up with Google" />

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-primary font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><span className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div>}>
      <SignupContent />
    </Suspense>
  )
}
