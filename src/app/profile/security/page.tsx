'use client'
import { useState } from 'react'
import Navbar from '@/components/Navbar'
import toast from 'react-hot-toast'
import { FiLock, FiShield, FiSmartphone, FiArrowLeft, FiEye, FiEyeOff } from 'react-icons/fi'
import Link from 'next/link'

export default function SecurityPage() {
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' })
  const [show, setShow] = useState({ current: false, new: false, confirm: false })
  const [twoFa, setTwoFa] = useState(false)
  const [biometric, setBiometric] = useState(false)
  const [loading, setLoading] = useState(false)

  async function changePassword(e: React.FormEvent) {
    e.preventDefault()
    if (passwords.new !== passwords.confirm) { toast.error('Passwords do not match'); return }
    if (passwords.new.length < 8) { toast.error('Password must be at least 8 characters'); return }
    setLoading(true)
    setTimeout(() => { toast.success('Password changed successfully'); setPasswords({ current: '', new: '', confirm: '' }); setLoading(false) }, 1000)
  }

  const sessions = [
    { device: 'Chrome on Windows', location: 'Mumbai, India', time: 'Active now', current: true },
    { device: 'Safari on iPhone', location: 'Mumbai, India', time: '2 hours ago', current: false },
    { device: 'Firefox on Mac', location: 'Delhi, India', time: '3 days ago', current: false },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16 max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/profile" className="w-9 h-9 rounded-xl bg-white shadow-card flex items-center justify-center">
            <FiArrowLeft className="text-gray-600" />
          </Link>
          <h1 className="font-poppins font-bold text-2xl text-dark-gray">Security Settings</h1>
        </div>

        {/* Change Password */}
        <div className="card p-6 mb-4">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center">
              <FiLock className="text-primary" />
            </div>
            <p className="font-semibold text-dark-gray">Change Password</p>
          </div>
          <form onSubmit={changePassword} className="space-y-4">
            {(['current', 'new', 'confirm'] as const).map(field => (
              <div key={field}>
                <label className="text-sm font-medium text-dark-gray mb-1.5 block capitalize">
                  {field === 'confirm' ? 'Confirm New Password' : `${field} Password`}
                </label>
                <div className="relative">
                  <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type={show[field] ? 'text' : 'password'} value={passwords[field]}
                    onChange={e => setPasswords(p => ({ ...p, [field]: e.target.value }))}
                    className="input-field pl-11 pr-11" />
                  <button type="button" onClick={() => setShow(s => ({ ...s, [field]: !s[field] }))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                    {show[field] ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>
            ))}
            <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
              {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FiLock />}
              Change Password
            </button>
          </form>
        </div>

        {/* 2FA */}
        <div className="card p-6 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center">
                <FiShield className="text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-dark-gray">Two-Factor Authentication</p>
                <p className="text-xs text-gray-400">Add an extra layer of security</p>
              </div>
            </div>
            <button onClick={() => { setTwoFa(v => !v); toast.success(twoFa ? '2FA disabled' : '2FA enabled') }}
              className={`relative w-12 h-6 rounded-full transition-colors ${twoFa ? 'bg-primary' : 'bg-gray-200'}`}>
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${twoFa ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
        </div>

        {/* Biometric */}
        <div className="card p-6 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
                <FiSmartphone className="text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-dark-gray">Biometric Login</p>
                <p className="text-xs text-gray-400">Use fingerprint or face ID</p>
              </div>
            </div>
            <button onClick={() => { setBiometric(v => !v); toast.success(biometric ? 'Biometric disabled' : 'Biometric enabled') }}
              className={`relative w-12 h-6 rounded-full transition-colors ${biometric ? 'bg-primary' : 'bg-gray-200'}`}>
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${biometric ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
        </div>

        {/* Active Sessions */}
        <div className="card p-6">
          <p className="font-semibold text-dark-gray mb-4">Active Sessions</p>
          <div className="space-y-3">
            {sessions.map((s, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-surface">
                <div>
                  <p className="text-sm font-medium text-dark-gray">{s.device}</p>
                  <p className="text-xs text-gray-400">{s.location} · {s.time}</p>
                </div>
                {s.current ? (
                  <span className="badge text-green-600 bg-green-50 text-xs">Current</span>
                ) : (
                  <button onClick={() => toast.success('Session revoked')} className="text-xs text-red-500 font-semibold">Revoke</button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
