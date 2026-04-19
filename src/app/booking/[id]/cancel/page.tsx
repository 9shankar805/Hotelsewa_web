'use client'
import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { bookingApi } from '@/lib/api'
import toast from 'react-hot-toast'
import { FiAlertTriangle, FiArrowLeft, FiX } from 'react-icons/fi'
import Link from 'next/link'

const REASONS = [
  'Change of plans', 'Found a better deal', 'Travel dates changed',
  'Emergency / health issue', 'Hotel not meeting expectations', 'Duplicate booking', 'Other',
]

export default function CancelBookingPage() {
  const { id } = useParams()
  const router = useRouter()
  const [reason, setReason] = useState('')
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  async function handleCancel() {
    setLoading(true)
    try {
      await bookingApi.cancelBooking(String(id))
      toast.success('Booking cancelled successfully')
      router.push('/trips')
    } catch {
      toast.error('Failed to cancel booking')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16 max-w-lg mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/trips" className="w-9 h-9 rounded-xl bg-white shadow-card flex items-center justify-center">
            <FiArrowLeft className="text-gray-600" />
          </Link>
          <h1 className="font-poppins font-bold text-2xl text-dark-gray">Cancel Booking</h1>
        </div>

        {/* Warning */}
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <FiAlertTriangle className="text-orange-500 text-xl flex-shrink-0" />
            <p className="font-semibold text-orange-700">Before you cancel</p>
          </div>
          <ul className="text-sm text-orange-600 space-y-1 list-disc list-inside">
            <li>Free cancellation is available up to 24 hours before check-in</li>
            <li>Cancellations within 24 hours may incur a fee</li>
            <li>Refunds are processed within 5–7 business days</li>
          </ul>
        </div>

        {step === 1 && (
          <div className="card p-6">
            <p className="font-semibold text-dark-gray mb-4">Why are you cancelling?</p>
            <div className="space-y-2 mb-5">
              {REASONS.map(r => (
                <button key={r} onClick={() => setReason(r)}
                  className={`w-full text-left p-3 rounded-xl border-2 text-sm transition-all ${reason === r ? 'border-primary bg-primary/5 text-primary' : 'border-gray-100 text-gray-600 hover:border-gray-200'}`}>
                  {r}
                </button>
              ))}
            </div>
            <button onClick={() => reason && setStep(2)} disabled={!reason}
              className="btn-primary w-full disabled:opacity-50">Continue</button>
          </div>
        )}

        {step === 2 && (
          <div className="card p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <FiX className="text-red-500 text-2xl" />
              </div>
              <p className="font-poppins font-bold text-xl text-dark-gray">Confirm Cancellation</p>
              <p className="text-sm text-gray-500 mt-1">Booking #{String(id).slice(0,8).toUpperCase()}</p>
            </div>

            <div className="bg-surface rounded-2xl p-4 mb-5">
              <p className="text-xs text-gray-400 mb-1">Reason</p>
              <p className="text-sm font-medium text-dark-gray">{reason}</p>
            </div>

            <div className="bg-green-50 rounded-2xl p-4 mb-5 border border-green-100">
              <p className="text-xs text-gray-400 mb-1">Refund Policy</p>
              <p className="text-sm text-green-700 font-medium">Full refund will be processed within 5–7 business days</p>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="btn-outline flex-1">Go Back</button>
              <button onClick={handleCancel} disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 bg-red-500 text-white py-3 rounded-xl font-semibold hover:bg-red-600 transition-colors disabled:opacity-50">
                {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FiX />}
                Cancel Booking
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
