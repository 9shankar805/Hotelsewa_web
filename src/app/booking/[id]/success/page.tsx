'use client'
import { Suspense } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import { FiCheckCircle, FiCalendar, FiDownload, FiHome, FiCopy } from 'react-icons/fi'
import { MdHotel } from 'react-icons/md'
import toast from 'react-hot-toast'

function SuccessContent() {
  const { id } = useParams()
  const params = useSearchParams()
  const amount = Number(params.get('amount') || 0)
  const bookingId = String(id)

  function copyId() {
    navigator.clipboard.writeText(bookingId)
    toast.success('Booking ID copied!')
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16 max-w-2xl mx-auto px-4 py-12">
        {/* Success hero */}
        <div className="card p-8 text-center mb-5">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiCheckCircle className="text-green-500 text-4xl" />
          </div>
          <h1 className="font-poppins font-bold text-2xl text-dark-gray mb-2">Booking Confirmed!</h1>
          <p className="text-gray-500 text-sm mb-5">Your reservation has been successfully confirmed. A confirmation email has been sent to you.</p>

          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 inline-flex flex-col items-center gap-1">
            <p className="text-xs text-gray-400">Booking ID</p>
            <div className="flex items-center gap-2">
              <p className="font-poppins font-bold text-primary text-lg tracking-wider">{bookingId.slice(0, 12).toUpperCase()}</p>
              <button onClick={copyId} className="text-gray-400 hover:text-primary transition-colors">
                <FiCopy className="text-sm" />
              </button>
            </div>
          </div>
        </div>

        {/* QR Code placeholder */}
        <div className="card p-6 text-center mb-5">
          <h3 className="font-poppins font-semibold text-dark-gray mb-2">Check-in QR Code</h3>
          <p className="text-xs text-gray-400 mb-4">Show this at hotel reception for quick check-in</p>
          <div className="w-48 h-48 bg-surface rounded-2xl mx-auto flex items-center justify-center border-2 border-primary/20">
            <div className="text-center">
              <MdHotel className="text-5xl text-primary/30 mx-auto mb-2" />
              <p className="text-xs text-gray-400 font-mono">{bookingId.slice(0, 8).toUpperCase()}</p>
            </div>
          </div>
          <p className="text-xs text-blue-500 mt-3 bg-blue-50 rounded-xl p-2">Save a screenshot of this page for offline access</p>
        </div>

        {/* Important info */}
        <div className="card p-5 mb-5">
          <h3 className="font-poppins font-semibold text-dark-gray mb-3">Important Information</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            {[
              'Carry a valid government-issued ID proof at check-in',
              'Check-in time: 2:00 PM · Check-out time: 11:00 AM',
              'Free cancellation up to 24 hours before check-in',
              'Contact hotel directly for special requests',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Amount paid */}
        {amount > 0 && (
          <div className="card p-5 mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400">Amount Paid</p>
              <p className="font-poppins font-bold text-2xl text-primary">₹{amount.toLocaleString()}</p>
            </div>
            <Link href={`/booking/${id}/invoice`}
              className="flex items-center gap-2 text-sm text-primary font-semibold bg-primary/10 px-4 py-2.5 rounded-xl hover:bg-primary/20 transition-colors">
              <FiDownload /> Download Invoice
            </Link>
          </div>
        )}

        {/* Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Link href="/trips" className="btn-primary flex items-center justify-center gap-2">
            <FiCalendar /> View My Trips
          </Link>
          <Link href="/" className="btn-outline flex items-center justify-center gap-2">
            <FiHome /> Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function BookingSuccessPage() {
  return <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"/></div>}><SuccessContent /></Suspense>
}
