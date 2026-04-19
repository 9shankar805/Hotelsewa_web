'use client'
import Link from 'next/link'
import { FiHeart, FiMapPin, FiStar, FiWifi } from 'react-icons/fi'
import { parseHotelImage } from '@/lib/utils'

// Accept any hotel-shaped object
export type HotelData = Record<string, unknown>

export default function HotelCard({ hotel, index = 0 }: { hotel: HotelData; index?: number }) {
  const image = parseHotelImage(hotel.image || hotel.images)
  const price = Number(hotel.min_price ?? hotel.price ?? 2500)
  const originalPrice = Math.round(price * 1.25)
  const discount = Number(hotel.discount ?? 20)
  const rating = Number(hotel.rating ?? 4.0)
  const reviews = Number(hotel.total_reviews ?? hotel.review_count ?? 0)
  const address = String(hotel.address ?? `${hotel.city ?? ''}, ${hotel.state ?? ''}`.trim().replace(/^,|,$/, ''))
  const amenities = Array.isArray(hotel.amenities) ? hotel.amenities.slice(0, 3).map(String) : ['WiFi', 'AC', 'Parking']
  const tag = hotel.tag ?? hotel.badge
  const hotelId = String(hotel.id ?? '')

  return (
    <Link href={`/hotels/${hotelId}`}>
      <div className="hotel-card card overflow-hidden cursor-pointer group">
        {/* Image */}
        <div className="relative h-52 overflow-hidden">
          <img src={image} alt={String(hotel.name ?? 'Hotel')} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          {discount > 0 && (
            <div className="absolute top-3 left-3 bg-primary text-white text-xs font-bold px-2.5 py-1 rounded-lg">
              {discount}% OFF
            </div>
          )}
          {!!tag && (
            <div className="absolute top-3 right-12 bg-[#FFB800] text-white text-xs font-bold px-2.5 py-1 rounded-lg">
              {String(tag)}
            </div>
          )}
          <button className="absolute top-2.5 right-2.5 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-card hover:scale-110 transition-transform">
            <FiHeart className="text-primary text-sm" />
          </button>
          <div className="absolute bottom-3 left-3 bg-white rounded-lg px-2 py-1 flex items-center gap-1">
            <FiStar className="text-[#FFB800] text-xs" />
            <span className="text-xs font-bold text-dark-gray">{rating.toFixed(1)}</span>
            {reviews > 0 && <span className="text-xs text-gray-500">({reviews})</span>}
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="font-poppins font-bold text-dark-gray text-base truncate">{String(hotel.name ?? 'Hotel')}</h3>
          <div className="flex items-center gap-1 mt-1">
            <FiMapPin className="text-gray-400 text-xs flex-shrink-0" />
            <span className="text-xs text-gray-500 truncate">{address}</span>
          </div>
          <div className="flex gap-1.5 mt-3 flex-wrap">
            {amenities.map((a, i) => (
              <span key={i} className="text-xs bg-[#F0F2F5] text-gray-500 font-medium px-2 py-1 rounded-lg flex items-center gap-1">
                {a === 'WiFi' && <FiWifi className="text-xs" />} {a}
              </span>
            ))}
          </div>
          <div className="flex items-center justify-between mt-3">
            <div>
              <span className="text-xs text-gray-400 line-through">₹{originalPrice.toLocaleString()}</span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-extrabold text-primary font-poppins">₹{price.toLocaleString()}</span>
                <span className="text-xs text-gray-400">/night</span>
              </div>
            </div>
            <button className="btn-primary text-xs py-2 px-4">Book Now</button>
          </div>
        </div>
      </div>
    </Link>
  )
}
