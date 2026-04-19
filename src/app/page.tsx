'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import HotelCard from '@/components/HotelCard'
import { HotelCardShimmer } from '@/components/Shimmer'
import { hotelApi } from '@/lib/api'
import { parseHotelImage } from '@/lib/utils'
import { FiSearch, FiCalendar, FiUsers, FiMapPin, FiArrowRight, FiStar } from 'react-icons/fi'
import { MdHotel, MdBeachAccess, MdBusiness, MdDiamond, MdSavings, MdVilla } from 'react-icons/md'

const CATEGORIES = [
  { name: 'All', icon: MdHotel },
  { name: 'Budget', icon: MdSavings },
  { name: 'Luxury', icon: MdDiamond },
  { name: 'Business', icon: MdBusiness },
  { name: 'Resort', icon: MdBeachAccess },
  { name: 'Boutique', icon: MdVilla },
]

const CITIES = [
  { name: 'Mumbai', hotels: 150, image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=200' },
  { name: 'Delhi', hotels: 120, image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=200' },
  { name: 'Bangalore', hotels: 90, image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=200' },
  { name: 'Goa', hotels: 60, image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=200' },
  { name: 'Jaipur', hotels: 75, image: 'https://images.unsplash.com/photo-1477587458883-47145ed68b2a?w=200' },
  { name: 'Pune', hotels: 55, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200' },
]

const OFFERS = [
  { title: 'Weekend Getaway', subtitle: 'Up to 40% off', color: '#667EEA', image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600' },
  { title: 'Business Travel', subtitle: 'Free breakfast included', color: '#11998E', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600' },
  { title: 'Luxury Escape', subtitle: 'Starting ₹4999/night', color: '#E60023', image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600' },
]

const FALLBACK_HOTELS = [
  { id: 1, name: 'The Grand Hyatt', address: 'Andheri West, Mumbai', rating: 4.8, total_reviews: 2341, min_price: 4500, discount: 25, image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600', amenities: ['WiFi', 'Pool', 'Spa'], tag: 'Best Seller' },
  { id: 2, name: 'Taj Palace Hotel', address: 'Connaught Place, Delhi', rating: 4.9, total_reviews: 3120, min_price: 8500, discount: 23, image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600', amenities: ['WiFi', 'Gym', 'Restaurant'], tag: 'Top Rated' },
  { id: 3, name: 'Leela Palace', address: 'MG Road, Bangalore', rating: 4.7, total_reviews: 1890, min_price: 6200, discount: 22, image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600', amenities: ['WiFi', 'Pool', 'Bar'], tag: 'Trending' },
  { id: 4, name: 'ITC Grand Goa', address: 'Panaji, Goa', rating: 4.6, total_reviews: 2100, min_price: 5500, discount: 24, image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600', amenities: ['Beach', 'Pool', 'Spa'], tag: 'Beach View' },
]

export default function HomePage() {
  const router = useRouter()
  const [hotels, setHotels] = useState<typeof FALLBACK_HOTELS>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guests, setGuests] = useState(1)

  useEffect(() => {
    loadHotels()
  }, [])

  async function loadHotels() {
    setLoading(true)
    try {
      let data: typeof FALLBACK_HOTELS = []
      try {
        const res = await hotelApi.getTrending()
        const raw = res.data?.data
        if (Array.isArray(raw) && raw.length > 0) data = raw
        else if (raw?.data && Array.isArray(raw.data)) data = raw.data
      } catch { /* ignore */ }

      if (!data.length) {
        const res = await hotelApi.getHotels()
        const raw = res.data?.data
        if (Array.isArray(raw)) data = raw
        else if (raw?.data && Array.isArray(raw.data)) data = raw.data
      }

      setHotels(data.length ? data.slice(0, 6) : FALLBACK_HOTELS)
    } catch {
      setHotels(FALLBACK_HOTELS)
    } finally {
      setLoading(false)
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchQuery) params.set('q', searchQuery)
    if (checkIn) params.set('checkIn', checkIn)
    if (checkOut) params.set('checkOut', checkOut)
    if (guests > 1) params.set('guests', String(guests))
    router.push(`/hotels?${params.toString()}`)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-[580px] flex items-center justify-center overflow-hidden pt-16">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1600" alt="Hero" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
        </div>
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white text-sm font-medium px-4 py-2 rounded-full mb-6 border border-white/30">
            <FiStar className="text-gold fill-gold" /> Trusted by 50,000+ travelers
          </div>
          <h1 className="font-poppins font-extrabold text-4xl md:text-6xl text-white mb-4 leading-tight">
            Find Your Perfect<br /><span className="text-primary-light">Hotel Stay</span>
          </h1>
          <p className="text-white/80 text-lg mb-10">Discover amazing hotels at unbeatable prices across India</p>

          {/* Search Box */}
          <form onSubmit={handleSearch} className="bg-white rounded-3xl p-4 shadow-elevated max-w-3xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="md:col-span-2 flex items-center gap-3 bg-surface rounded-2xl px-4 py-3">
                <FiMapPin className="text-primary flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Where are you going?"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="bg-transparent text-sm w-full outline-none text-dark-gray placeholder-placeholder"
                />
              </div>
              <div className="flex items-center gap-3 bg-surface rounded-2xl px-4 py-3">
                <FiCalendar className="text-primary flex-shrink-0" />
                <input type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)}
                  className="bg-transparent text-sm w-full outline-none text-dark-gray" />
              </div>
              <div className="flex items-center gap-3 bg-surface rounded-2xl px-4 py-3">
                <FiUsers className="text-primary flex-shrink-0" />
                <select value={guests} onChange={e => setGuests(Number(e.target.value))}
                  className="bg-transparent text-sm w-full outline-none text-dark-gray">
                  {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} Guest{n > 1 ? 's' : ''}</option>)}
                </select>
              </div>
            </div>
            <button type="submit" className="w-full mt-3 btn-primary flex items-center justify-center gap-2">
              <FiSearch /> Search Hotels
            </button>
          </form>
        </div>
      </section>

      {/* Hot Deals */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="section-title text-xl">Hot Deals 🔥</h2>
          <Link href="/deals" className="text-sm text-primary font-semibold flex items-center gap-1 hover:gap-2 transition-all">
            See all <FiArrowRight />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {OFFERS.map((offer, i) => (
            <div key={i} className="relative h-44 rounded-3xl overflow-hidden cursor-pointer group shadow-card">
              <img src={offer.image} alt={offer.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-4 left-4">
                <h3 className="text-white font-bold text-lg font-poppins">{offer.title}</h3>
                <span className="inline-block mt-1 bg-white/25 backdrop-blur-sm text-white text-xs font-medium px-3 py-1 rounded-full">
                  {offer.subtitle}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <h2 className="section-title text-xl mb-5">Browse by Type</h2>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {CATEGORIES.map((cat, i) => {
            const Icon = cat.icon
            const active = selectedCategory === i
            return (
              <button key={i} onClick={() => setSelectedCategory(i)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-semibold whitespace-nowrap transition-all ${
                  active ? 'bg-primary text-white shadow-primary' : 'bg-white text-gray-600 shadow-card hover:shadow-md'
                }`}>
                <Icon className={active ? 'text-white' : 'text-gray-400'} />
                {cat.name}
              </button>
            )
          })}
        </div>
      </section>

      {/* Popular Cities */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="section-title text-xl">Popular Cities</h2>
          <Link href="/hotels" className="text-sm text-primary font-semibold flex items-center gap-1 hover:gap-2 transition-all">
            View all <FiArrowRight />
          </Link>
        </div>
        <div className="flex gap-5 overflow-x-auto pb-2">
          {CITIES.map((city, i) => (
            <Link key={i} href={`/hotels?city=${city.name}`}
              className="flex flex-col items-center gap-2 flex-shrink-0 group cursor-pointer">
              <div className="w-20 h-20 rounded-full overflow-hidden shadow-card group-hover:shadow-elevated transition-all group-hover:scale-105">
                <img src={city.image} alt={city.name} className="w-full h-full object-cover" />
              </div>
              <span className="text-xs font-bold text-dark-gray">{city.name}</span>
              <span className="text-xs text-gray-400">{city.hotels}+ hotels</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Recommended Hotels */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="section-title text-xl">Recommended for You</h2>
          <Link href="/hotels" className="text-sm text-primary font-semibold flex items-center gap-1 hover:gap-2 transition-all">
            See all <FiArrowRight />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <HotelCardShimmer key={i} />)
            : hotels.map((hotel, i) => <HotelCard key={hotel.id} hotel={hotel} index={i} />)
          }
        </div>
      </section>

      {/* CTA for Hotel Owners */}
      <section className="bg-gradient-to-r from-primary to-primary-light py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="font-poppins font-extrabold text-3xl text-white mb-4">Own a Hotel?</h2>
          <p className="text-white/80 text-lg mb-8">List your property on HotelSewa and reach thousands of travelers</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup?role=hotel_owner" className="bg-white text-primary font-bold px-8 py-3.5 rounded-2xl hover:shadow-elevated transition-all">
              List Your Property
            </Link>
            <Link href="/owner/dashboard" className="border-2 border-white text-white font-bold px-8 py-3.5 rounded-2xl hover:bg-white/10 transition-all">
              Owner Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark-gray text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center">
                  <MdHotel className="text-white" />
                </div>
                <span className="font-poppins font-extrabold text-lg text-primary">HOTELSEWA</span>
              </div>
              <p className="text-white/60 text-sm">Your trusted hotel booking platform across India.</p>
            </div>
            {[
              { title: 'Company', links: ['About Us', 'Careers', 'Blog', 'Press'] },
              { title: 'Support', links: ['Help Center', 'Contact Us', 'Privacy Policy', 'Terms'] },
              { title: 'Explore', links: ['Hotels', 'Deals', 'Cities', 'Reviews'] },
            ].map(col => (
              <div key={col.title}>
                <h4 className="font-semibold mb-4">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map(l => (
                    <li key={l}><a href="#" className="text-white/60 text-sm hover:text-white transition-colors">{l}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-white/10 pt-6 text-center text-white/40 text-sm">
            © 2026 HotelSewa. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
