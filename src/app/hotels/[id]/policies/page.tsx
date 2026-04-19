'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { hotelApi } from '@/lib/api'
import { FiArrowLeft, FiCheck, FiX, FiInfo } from 'react-icons/fi'
import Link from 'next/link'

export default function HotelPoliciesPage() {
  const { id } = useParams()
  const [hotel, setHotel] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [id])

  async function load() {
    setLoading(true)
    try {
      const [detailRes, policyRes] = await Promise.allSettled([
        hotelApi.getHotelDetails(String(id)),
        hotelApi.getHotelPolicies(String(id)),
      ])
      let data = detailRes.status === 'fulfilled' ? detailRes.value.data?.data : null
      if (data?.data) data = data.data
      const policies = policyRes.status === 'fulfilled' ? policyRes.value.data?.data || policyRes.value.data : null
      setHotel({ ...data, ...policies })
    } catch { setHotel(null) }
    finally { setLoading(false) }
  }

  const policies = [
    {
      title: 'Check-in & Check-out',
      icon: '🕐',
      items: [
        { label: 'Check-in time', value: String(hotel?.check_in_time || '2:00 PM'), type: 'info' },
        { label: 'Check-out time', value: String(hotel?.check_out_time || '11:00 AM'), type: 'info' },
        { label: 'Early check-in', value: 'Subject to availability (extra charge may apply)', type: 'info' },
        { label: 'Late check-out', value: 'Subject to availability (extra charge may apply)', type: 'info' },
      ]
    },
    {
      title: 'Cancellation Policy',
      icon: '📋',
      items: [
        { label: 'Free cancellation', value: String(hotel?.cancellation_policy || 'Up to 24 hours before check-in'), type: 'good' },
        { label: 'Late cancellation', value: '1 night charge for cancellations within 24 hours', type: 'bad' },
        { label: 'No-show', value: 'Full booking amount will be charged', type: 'bad' },
      ]
    },
    {
      title: 'House Rules',
      icon: '🏠',
      items: [
        { label: 'Smoking', value: String(hotel?.smoking_policy || 'Not allowed in rooms'), type: 'bad' },
        { label: 'Pets', value: String(hotel?.pet_policy || 'Not allowed'), type: 'bad' },
        { label: 'Parties/Events', value: 'Not allowed', type: 'bad' },
        { label: 'Quiet hours', value: '10:00 PM – 7:00 AM', type: 'info' },
      ]
    },
    {
      title: 'Payment',
      icon: '💳',
      items: [
        { label: 'Accepted methods', value: 'Credit/Debit Card, UPI, Net Banking, Wallet', type: 'good' },
        { label: 'Security deposit', value: String(hotel?.security_deposit || 'May be required at check-in'), type: 'info' },
        { label: 'Invoice', value: 'GST invoice available on request', type: 'good' },
      ]
    },
    {
      title: 'Children & Extra Beds',
      icon: '👨‍👩‍👧',
      items: [
        { label: 'Children', value: 'Children of all ages are welcome', type: 'good' },
        { label: 'Extra beds', value: 'Available on request (extra charge)', type: 'info' },
        { label: 'Cribs', value: 'Available on request (free)', type: 'good' },
      ]
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16 max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link href={`/hotels/${id}`} className="w-9 h-9 rounded-xl bg-white shadow-card flex items-center justify-center">
            <FiArrowLeft className="text-gray-600" />
          </Link>
          <div>
            <h1 className="font-poppins font-bold text-2xl text-dark-gray">Hotel Policies</h1>
            {hotel && <p className="text-sm text-gray-400">{String(hotel.name || '')}</p>}
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">{Array.from({length:4}).map((_,i)=><div key={i} className="shimmer h-40 rounded-2xl"/>)}</div>
        ) : (
          <div className="space-y-4">
            {policies.map(({ title, icon, items }) => (
              <div key={title} className="card p-5">
                <h3 className="font-poppins font-semibold text-dark-gray mb-4 flex items-center gap-2">
                  <span>{icon}</span> {title}
                </h3>
                <div className="space-y-3">
                  {items.map(({ label, value, type }) => (
                    <div key={label} className="flex items-start gap-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${type === 'good' ? 'bg-green-50' : type === 'bad' ? 'bg-red-50' : 'bg-blue-50'}`}>
                        {type === 'good' ? <FiCheck className="text-green-600 text-xs" /> :
                         type === 'bad' ? <FiX className="text-red-500 text-xs" /> :
                         <FiInfo className="text-blue-500 text-xs" />}
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">{label}</p>
                        <p className="text-sm text-dark-gray font-medium">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
