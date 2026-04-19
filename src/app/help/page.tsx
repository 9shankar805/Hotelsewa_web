'use client'
import { useState } from 'react'
import Navbar from '@/components/Navbar'
import { FiChevronDown, FiChevronUp, FiMail, FiPhone, FiMessageSquare } from 'react-icons/fi'

const FAQS = [
  { q: 'How do I book a hotel?', a: 'Search for hotels by city or name, select your dates and guests, choose a hotel, and click "Book Now". You\'ll need to be logged in to complete the booking.' },
  { q: 'Can I cancel my booking?', a: 'Yes, you can cancel bookings from My Trips. Cancellation policies vary by hotel. Free cancellation is available up to 24 hours before check-in for most hotels.' },
  { q: 'How do I get my invoice?', a: 'After your stay, go to My Trips, find your booking, and click the Invoice button to download your invoice.' },
  { q: 'What payment methods are accepted?', a: 'We accept credit/debit cards, UPI, net banking, and wallet payments. All transactions are secured with SSL encryption.' },
  { q: 'How do I earn loyalty points?', a: 'You earn points on every booking. Points can be redeemed for discounts on future bookings. Check your balance in the Profile section.' },
  { q: 'How do I list my hotel?', a: 'Sign up as a Hotel Owner, complete your profile, and add your property details. Our team will review and approve your listing within 24 hours.' },
]

export default function HelpPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16 max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-10">
          <h1 className="font-poppins font-extrabold text-3xl text-dark-gray mb-3">How can we help?</h1>
          <p className="text-gray-500">Find answers to common questions or contact our support team</p>
        </div>

        {/* Contact cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
          {[
            { icon: FiMail, title: 'Email Support', desc: 'support@hotelsewa.com', action: 'Send Email' },
            { icon: FiPhone, title: 'Phone Support', desc: '+91 1800-XXX-XXXX', action: 'Call Now' },
            { icon: FiMessageSquare, title: 'Live Chat', desc: 'Available 24/7', action: 'Start Chat' },
          ].map(({ icon: Icon, title, desc, action }) => (
            <div key={title} className="card p-6 text-center hover:shadow-elevated transition-all cursor-pointer">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Icon className="text-primary text-xl" />
              </div>
              <h3 className="font-semibold text-dark-gray mb-1">{title}</h3>
              <p className="text-sm text-gray-500 mb-3">{desc}</p>
              <button className="text-sm text-primary font-semibold hover:underline">{action}</button>
            </div>
          ))}
        </div>

        {/* FAQs */}
        <h2 className="font-poppins font-bold text-xl text-dark-gray mb-5">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div key={i} className="card overflow-hidden">
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-surface/50 transition-all">
                <span className="font-semibold text-dark-gray text-sm">{faq.q}</span>
                {openFaq === i ? <FiChevronUp className="text-primary flex-shrink-0" /> : <FiChevronDown className="text-gray-400 flex-shrink-0" />}
              </button>
              {openFaq === i && (
                <div className="px-5 pb-5 text-sm text-gray-600 leading-relaxed border-t border-gray-50 pt-3 animate-fade-in">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
