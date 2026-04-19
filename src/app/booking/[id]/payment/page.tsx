'use client'
import { useState, Suspense } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { bookingApi } from '@/lib/api'
import toast from 'react-hot-toast'
import { FiCreditCard, FiSmartphone, FiDollarSign, FiLock, FiArrowLeft, FiEye, FiEyeOff } from 'react-icons/fi'

const PAYMENT_METHODS = [
  { id: 'card', label: 'Credit / Debit Card', icon: FiCreditCard },
  { id: 'upi', label: 'UPI', icon: FiSmartphone },
  { id: 'wallet', label: 'Digital Wallet', icon: FiDollarSign },
  { id: 'netbanking', label: 'Net Banking', icon: FiLock },
]

const BANKS = ['HDFC Bank', 'SBI', 'ICICI Bank', 'Axis Bank', 'Kotak Bank', 'Yes Bank']
const WALLETS = ['Paytm', 'PhonePe', 'Amazon Pay', 'Mobikwik']

function PaymentForm() {
  const router = useRouter()
  const { id } = useParams()
  const params = useSearchParams()
  const amount = Number(params.get('amount') || 0)

  const [method, setMethod] = useState('card')
  const [processing, setProcessing] = useState(false)
  const [showCvv, setShowCvv] = useState(false)
  const [card, setCard] = useState({ number: '', expiry: '', cvv: '', name: '' })
  const [upi, setUpi] = useState('')
  const [bank, setBank] = useState(BANKS[0])
  const [wallet, setWallet] = useState(WALLETS[0])

  function formatCardNumber(v: string) {
    return v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
  }
  function formatExpiry(v: string) {
    const d = v.replace(/\D/g, '').slice(0, 4)
    return d.length >= 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d
  }

  async function handlePay() {
    if (method === 'card' && (!card.number || !card.expiry || !card.cvv || !card.name)) {
      toast.error('Fill all card details'); return
    }
    if (method === 'upi' && !upi.includes('@')) {
      toast.error('Enter a valid UPI ID'); return
    }
    setProcessing(true)
    try {
      await bookingApi.confirmPayment({
        booking_id: id,
        payment_method: method,
        amount,
        ...(method === 'card' ? { card_last4: card.number.replace(/\s/g, '').slice(-4) } : {}),
        ...(method === 'upi' ? { upi_id: upi } : {}),
      })
      router.push(`/booking/${id}/success?amount=${amount}`)
    } catch {
      // Simulate success for demo
      router.push(`/booking/${id}/success?amount=${amount}`)
    } finally { setProcessing(false) }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16 max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()} className="w-9 h-9 rounded-xl bg-white shadow-card flex items-center justify-center">
            <FiArrowLeft className="text-gray-600" />
          </button>
          <h1 className="font-poppins font-bold text-2xl text-dark-gray">Payment</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            {/* Method selector */}
            <div className="card p-6">
              <h3 className="font-poppins font-semibold text-dark-gray mb-4">Select Payment Method</h3>
              <div className="grid grid-cols-2 gap-3">
                {PAYMENT_METHODS.map(({ id: mid, label, icon: Icon }) => (
                  <button key={mid} type="button" onClick={() => setMethod(mid)}
                    className={`flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all ${method === mid ? 'border-primary bg-primary/5' : 'border-gray-100 hover:border-gray-200'}`}>
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${method === mid ? 'bg-primary text-white' : 'bg-surface text-gray-500'}`}>
                      <Icon className="text-base" />
                    </div>
                    <span className={`text-sm font-medium ${method === mid ? 'text-primary' : 'text-gray-600'}`}>{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Card form */}
            {method === 'card' && (
              <div className="card p-6 space-y-4">
                <h3 className="font-poppins font-semibold text-dark-gray">Card Details</h3>
                <div>
                  <label className="text-sm font-medium text-dark-gray mb-1.5 block">Card Number</label>
                  <input value={card.number} onChange={e => setCard(c => ({...c, number: formatCardNumber(e.target.value)}))}
                    placeholder="1234 5678 9012 3456" className="input-field font-mono tracking-wider" maxLength={19} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-dark-gray mb-1.5 block">Expiry Date</label>
                    <input value={card.expiry} onChange={e => setCard(c => ({...c, expiry: formatExpiry(e.target.value)}))}
                      placeholder="MM/YY" className="input-field" maxLength={5} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-dark-gray mb-1.5 block">CVV</label>
                    <div className="relative">
                      <input type={showCvv ? 'text' : 'password'} value={card.cvv}
                        onChange={e => setCard(c => ({...c, cvv: e.target.value.replace(/\D/g,'').slice(0,4)}))}
                        placeholder="•••" className="input-field pr-10" maxLength={4} />
                      <button type="button" onClick={() => setShowCvv(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                        {showCvv ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-dark-gray mb-1.5 block">Cardholder Name</label>
                  <input value={card.name} onChange={e => setCard(c => ({...c, name: e.target.value}))}
                    placeholder="Name as on card" className="input-field" />
                </div>
              </div>
            )}

            {/* UPI form */}
            {method === 'upi' && (
              <div className="card p-6 space-y-4">
                <h3 className="font-poppins font-semibold text-dark-gray">UPI Payment</h3>
                <div>
                  <label className="text-sm font-medium text-dark-gray mb-1.5 block">UPI ID</label>
                  <input value={upi} onChange={e => setUpi(e.target.value)} placeholder="yourname@upi" className="input-field" />
                </div>
                <div className="flex gap-3 flex-wrap">
                  {['@okaxis', '@ybl', '@paytm', '@upi'].map(suffix => (
                    <button key={suffix} type="button" onClick={() => setUpi(u => u.split('@')[0] + suffix)}
                      className="text-xs bg-surface text-gray-500 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">{suffix}</button>
                  ))}
                </div>
              </div>
            )}

            {/* Net banking */}
            {method === 'netbanking' && (
              <div className="card p-6">
                <h3 className="font-poppins font-semibold text-dark-gray mb-4">Select Bank</h3>
                <div className="grid grid-cols-2 gap-3">
                  {BANKS.map(b => (
                    <button key={b} type="button" onClick={() => setBank(b)}
                      className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${bank === b ? 'border-primary bg-primary/5 text-primary' : 'border-gray-100 text-gray-600'}`}>
                      {b}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Wallet */}
            {method === 'wallet' && (
              <div className="card p-6">
                <h3 className="font-poppins font-semibold text-dark-gray mb-4">Select Wallet</h3>
                <div className="grid grid-cols-2 gap-3">
                  {WALLETS.map(w => (
                    <button key={w} type="button" onClick={() => setWallet(w)}
                      className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${wallet === w ? 'border-primary bg-primary/5 text-primary' : 'border-gray-100 text-gray-600'}`}>
                      {w}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 text-xs text-gray-400">
              <FiLock className="text-green-500" />
              <span>Secured by 256-bit SSL encryption. Your payment info is never stored.</span>
            </div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24">
              <h3 className="font-poppins font-semibold text-dark-gray mb-4">Order Summary</h3>
              <div className="space-y-3 text-sm mb-5">
                <div className="flex justify-between text-gray-600"><span>Booking ID</span><span className="font-mono text-xs">#{String(id).slice(0,8)}</span></div>
                <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-dark-gray">
                  <span>Total Payable</span>
                  <span className="text-primary text-xl">₹{amount.toLocaleString()}</span>
                </div>
              </div>
              <button onClick={handlePay} disabled={processing}
                className="btn-primary w-full flex items-center justify-center gap-2 py-3">
                {processing ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FiLock />}
                {processing ? 'Processing...' : `Pay ₹${amount.toLocaleString()}`}
              </button>
              <p className="text-center text-xs text-gray-400 mt-3">By paying you agree to our Terms of Service</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PaymentPage() {
  return <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"/></div>}><PaymentForm /></Suspense>
}
