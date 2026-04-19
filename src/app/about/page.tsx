import Navbar from '@/components/Navbar'
import Link from 'next/link'
import { MdHotel } from 'react-icons/md'
import { FiUsers, FiStar, FiMapPin, FiAward } from 'react-icons/fi'

export default function AboutPage() {
  const stats = [
    { icon: FiUsers, value: '50,000+', label: 'Happy Travelers' },
    { icon: MdHotel, value: '1,000+', label: 'Partner Hotels' },
    { icon: FiMapPin, value: '100+', label: 'Cities' },
    { icon: FiStar, value: '4.8★', label: 'Average Rating' },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16">
        {/* Hero */}
        <div className="bg-gradient-to-br from-dark-gray to-[#2D1B69] py-20 text-center text-white">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center">
              <MdHotel className="text-white text-2xl" />
            </div>
            <span className="font-poppins font-extrabold text-3xl text-primary">HOTELSEWA</span>
          </div>
          <h1 className="font-poppins font-extrabold text-4xl mb-4">About Us</h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            HotelSewa is India&apos;s trusted hotel booking platform, connecting travelers with the best hotels at the best prices.
          </p>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-12">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-12">
            {stats.map(({ icon: Icon, value, label }) => (
              <div key={label} className="card p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Icon className="text-primary text-xl" />
                </div>
                <p className="font-poppins font-extrabold text-2xl text-dark-gray">{value}</p>
                <p className="text-sm text-gray-500 mt-1">{label}</p>
              </div>
            ))}
          </div>

          {/* Mission */}
          <div className="card p-8 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <FiAward className="text-primary text-2xl" />
              <h2 className="font-poppins font-bold text-2xl text-dark-gray">Our Mission</h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              At HotelSewa, we believe everyone deserves a great place to stay. Our mission is to make hotel booking simple, transparent, and affordable for every traveler in India. We partner with thousands of hotels to bring you the best deals, verified reviews, and seamless booking experience.
            </p>
          </div>

          {/* Values */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
            {[
              { title: 'Transparency', desc: 'No hidden fees. What you see is what you pay.', emoji: '🔍' },
              { title: 'Trust', desc: 'Verified hotels and genuine guest reviews.', emoji: '🤝' },
              { title: 'Value', desc: 'Best price guarantee on every booking.', emoji: '💰' },
            ].map(v => (
              <div key={v.title} className="card p-6 text-center">
                <div className="text-4xl mb-3">{v.emoji}</div>
                <h3 className="font-poppins font-semibold text-dark-gray mb-2">{v.title}</h3>
                <p className="text-sm text-gray-500">{v.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link href="/hotels" className="btn-primary inline-flex items-center gap-2">
              Explore Hotels
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
