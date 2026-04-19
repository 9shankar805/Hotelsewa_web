'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { profileApi } from '@/lib/api'
import { logout } from '@/lib/auth'
import toast from 'react-hot-toast'
import { FiAlertTriangle, FiArrowLeft, FiTrash2 } from 'react-icons/fi'
import Link from 'next/link'

const REASONS = ['I no longer need this account', 'I have a duplicate account', 'Privacy concerns', 'Too many emails/notifications', 'Other']

export default function DeleteAccountPage() {
  const router = useRouter()
  const [reason, setReason] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)

  async function handleDelete() {
    if (confirm !== 'DELETE') { toast.error('Type DELETE to confirm'); return }
    setLoading(true)
    try {
      await profileApi.deleteAccount()
      logout()
      toast.success('Account deleted')
      router.push('/')
    } catch { toast.error('Failed to delete account') }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16 max-w-lg mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/profile" className="w-9 h-9 rounded-xl bg-white shadow-card flex items-center justify-center">
            <FiArrowLeft className="text-gray-600" />
          </Link>
          <h1 className="font-poppins font-bold text-2xl text-dark-gray">Delete Account</h1>
        </div>

        {/* Warning */}
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <FiAlertTriangle className="text-red-500 text-xl flex-shrink-0" />
            <p className="font-semibold text-red-700">This action is permanent</p>
          </div>
          <ul className="text-sm text-red-600 space-y-1 list-disc list-inside">
            <li>All your bookings and history will be deleted</li>
            <li>Your loyalty points will be forfeited</li>
            <li>You will lose access to all saved hotels</li>
            <li>This cannot be undone</li>
          </ul>
        </div>

        {step === 1 && (
          <div className="card p-6">
            <p className="font-semibold text-dark-gray mb-4">Why are you leaving?</p>
            <div className="space-y-2 mb-5">
              {REASONS.map(r => (
                <button key={r} onClick={() => setReason(r)}
                  className={`w-full text-left p-3 rounded-xl border-2 text-sm transition-all ${reason === r ? 'border-red-400 bg-red-50 text-red-700' : 'border-gray-100 text-gray-600 hover:border-gray-200'}`}>
                  {r}
                </button>
              ))}
            </div>
            <button onClick={() => reason && setStep(2)} disabled={!reason}
              className="btn-primary w-full bg-red-500 hover:bg-red-600 disabled:opacity-50">
              Continue
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="card p-6">
            <p className="font-semibold text-dark-gray mb-2">Confirm deletion</p>
            <p className="text-sm text-gray-500 mb-4">Type <span className="font-bold text-red-500">DELETE</span> to confirm you want to permanently delete your account.</p>
            <input value={confirm} onChange={e => setConfirm(e.target.value)}
              placeholder="Type DELETE here" className="input-field mb-4 border-red-200 focus:border-red-400" />
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="btn-outline flex-1">Back</button>
              <button onClick={handleDelete} disabled={loading || confirm !== 'DELETE'}
                className="flex-1 flex items-center justify-center gap-2 bg-red-500 text-white py-3 rounded-xl font-semibold hover:bg-red-600 transition-colors disabled:opacity-50">
                {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FiTrash2 />}
                Delete Account
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
