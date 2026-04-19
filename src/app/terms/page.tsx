import Navbar from '@/components/Navbar'

const SECTIONS = [
  { title: '1. Acceptance of Terms', content: 'By accessing and using HotelSewa, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.' },
  { title: '2. Booking Policy', content: 'All bookings are subject to availability. Prices displayed are per room per night unless stated otherwise. HotelSewa acts as an intermediary between guests and hotels.' },
  { title: '3. Cancellation Policy', content: 'Cancellation policies vary by hotel and rate type. Free cancellation is available for most bookings up to 24 hours before check-in. Non-refundable rates cannot be cancelled.' },
  { title: '4. Payment', content: 'Payment is processed securely through our payment partners. We accept major credit/debit cards, UPI, and net banking. All prices are in Indian Rupees (INR) unless stated otherwise.' },
  { title: '5. User Accounts', content: 'You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized use of your account.' },
  { title: '6. Privacy', content: 'Your privacy is important to us. Please review our Privacy Policy to understand how we collect, use, and protect your personal information.' },
  { title: '7. Limitation of Liability', content: 'HotelSewa is not liable for any indirect, incidental, or consequential damages arising from your use of our service or any hotel stay booked through our platform.' },
  { title: '8. Changes to Terms', content: 'We reserve the right to modify these terms at any time. Continued use of the service after changes constitutes acceptance of the new terms.' },
]

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16 max-w-3xl mx-auto px-4 py-10">
        <h1 className="font-poppins font-extrabold text-3xl text-dark-gray mb-2">Terms of Service</h1>
        <p className="text-gray-500 mb-8">Last updated: January 2026</p>
        <div className="space-y-6">
          {SECTIONS.map(s => (
            <div key={s.title} className="card p-6">
              <h2 className="font-poppins font-semibold text-dark-gray mb-3">{s.title}</h2>
              <p className="text-gray-600 text-sm leading-relaxed">{s.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
