'use client'
import { useState } from 'react'
import Navbar from '@/components/Navbar'
import toast from 'react-hot-toast'
import { FiArrowLeft, FiSave } from 'react-icons/fi'
import Link from 'next/link'

const ROOM_TYPES = ['Standard', 'Deluxe', 'Suite', 'Executive', 'Family Room']
const BED_TYPES = ['Single', 'Double', 'Twin', 'King', 'Queen']
const AMENITIES = ['Swimming Pool', 'Gym', 'Spa', 'Restaurant', 'Free WiFi', 'Parking', 'Airport Shuttle', 'Room Service']
const MEAL_PREFS = ['No Preference', 'Breakfast Included', 'Half Board', 'Full Board', 'All Inclusive']
const PURPOSES = ['Leisure', 'Business', 'Family', 'Honeymoon', 'Adventure']

export default function TravelPreferencesPage() {
  const [roomType, setRoomType] = useState('Deluxe')
  const [bedType, setBedType] = useState('King')
  const [meal, setMeal] = useState('Breakfast Included')
  const [purpose, setPurpose] = useState('Leisure')
  const [amenities, setAmenities] = useState<string[]>(['Free WiFi', 'Swimming Pool'])
  const [budget, setBudget] = useState([1000, 10000])
  const [earlyCheckin, setEarlyCheckin] = useState(false)
  const [lateCheckout, setLateCheckout] = useState(false)
  const [quietRoom, setQuietRoom] = useState(false)
  const [highFloor, setHighFloor] = useState(false)

  function toggleAmenity(a: string) {
    setAmenities(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a])
  }

  function save() { toast.success('Travel preferences saved') }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16 max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/profile" className="w-9 h-9 rounded-xl bg-white shadow-card flex items-center justify-center">
            <FiArrowLeft className="text-gray-600" />
          </Link>
          <h1 className="font-poppins font-bold text-2xl text-dark-gray">Travel Preferences</h1>
        </div>

        <div className="space-y-5">
          {/* Room Type */}
          <div className="card p-5">
            <p className="font-semibold text-dark-gray mb-3">Preferred Room Type</p>
            <div className="flex flex-wrap gap-2">
              {ROOM_TYPES.map(t => (
                <button key={t} onClick={() => setRoomType(t)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all ${roomType === t ? 'border-primary bg-primary/5 text-primary' : 'border-gray-100 text-gray-600'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Bed Type */}
          <div className="card p-5">
            <p className="font-semibold text-dark-gray mb-3">Preferred Bed Type</p>
            <div className="flex flex-wrap gap-2">
              {BED_TYPES.map(t => (
                <button key={t} onClick={() => setBedType(t)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all ${bedType === t ? 'border-primary bg-primary/5 text-primary' : 'border-gray-100 text-gray-600'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Meal */}
          <div className="card p-5">
            <p className="font-semibold text-dark-gray mb-3">Meal Preference</p>
            <div className="flex flex-wrap gap-2">
              {MEAL_PREFS.map(m => (
                <button key={m} onClick={() => setMeal(m)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all ${meal === m ? 'border-primary bg-primary/5 text-primary' : 'border-gray-100 text-gray-600'}`}>
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Purpose */}
          <div className="card p-5">
            <p className="font-semibold text-dark-gray mb-3">Travel Purpose</p>
            <div className="flex flex-wrap gap-2">
              {PURPOSES.map(p => (
                <button key={p} onClick={() => setPurpose(p)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all ${purpose === p ? 'border-primary bg-primary/5 text-primary' : 'border-gray-100 text-gray-600'}`}>
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Amenities */}
          <div className="card p-5">
            <p className="font-semibold text-dark-gray mb-3">Must-Have Amenities</p>
            <div className="flex flex-wrap gap-2">
              {AMENITIES.map(a => (
                <button key={a} onClick={() => toggleAmenity(a)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all ${amenities.includes(a) ? 'border-primary bg-primary/5 text-primary' : 'border-gray-100 text-gray-600'}`}>
                  {a}
                </button>
              ))}
            </div>
          </div>

          {/* Budget */}
          <div className="card p-5">
            <p className="font-semibold text-dark-gray mb-1">Budget Range</p>
            <p className="text-sm text-gray-400 mb-3">₹{budget[0].toLocaleString()} – ₹{budget[1].toLocaleString()} per night</p>
            <input type="range" min={500} max={5000} value={budget[0]} onChange={e => setBudget([Number(e.target.value), budget[1]])} className="w-full accent-primary mb-2" />
            <input type="range" min={5000} max={50000} value={budget[1]} onChange={e => setBudget([budget[0], Number(e.target.value)])} className="w-full accent-primary" />
          </div>

          {/* Special requests */}
          <div className="card p-5">
            <p className="font-semibold text-dark-gray mb-3">Special Requests</p>
            <div className="space-y-3">
              {[
                { label: 'Early Check-in', val: earlyCheckin, set: setEarlyCheckin },
                { label: 'Late Check-out', val: lateCheckout, set: setLateCheckout },
                { label: 'Quiet Room', val: quietRoom, set: setQuietRoom },
                { label: 'High Floor', val: highFloor, set: setHighFloor },
              ].map(({ label, val, set }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{label}</span>
                  <button onClick={() => set((v: boolean) => !v)}
                    className={`relative w-10 h-5 rounded-full transition-colors ${val ? 'bg-primary' : 'bg-gray-200'}`}>
                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${val ? 'left-5' : 'left-0.5'}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button onClick={save} className="btn-primary w-full flex items-center justify-center gap-2">
            <FiSave /> Save Preferences
          </button>
        </div>
      </div>
    </div>
  )
}
