'use client'
import Navbar from '@/components/Navbar'
import Link from 'next/link'

const SECTIONS = [
  {
    title: '1. Information We Collect',
    content: `We collect information you provide directly to us, such as when you create an account, make a booking, or contact us for support. This includes:
    
• Personal identification: name, email address, phone number, date of birth
• Payment information: card details (processed securely, never stored on our servers)
• Booking information: hotel preferences, check-in/check-out dates, guest details
• Device information: IP address, browser type, operating system
• Usage data: pages visited, features used, search queries`
  },
  {
    title: '2. How We Use Your Information',
    content: `We use the information we collect to:

• Process and manage your hotel bookings
• Send booking confirmations, invoices, and updates
• Provide customer support and respond to inquiries
• Personalize your experience and show relevant recommendations
• Send promotional offers (with your consent)
• Improve our services and develop new features
• Comply with legal obligations`
  },
  {
    title: '3. Information Sharing',
    content: `We do not sell your personal information. We may share your information with:

• Hotels and accommodation providers to fulfill your bookings
• Payment processors to handle transactions securely
• Service providers who assist in our operations (under strict confidentiality)
• Law enforcement when required by law
• Business partners with your explicit consent`
  },
  {
    title: '4. Data Security',
    content: `We implement industry-standard security measures to protect your data:

• 256-bit SSL encryption for all data transmission
• Secure storage with access controls
• Regular security audits and vulnerability assessments
• PCI DSS compliance for payment processing
• Two-factor authentication options for your account`
  },
  {
    title: '5. Cookies & Tracking',
    content: `We use cookies and similar technologies to:

• Keep you logged in across sessions
• Remember your preferences and settings
• Analyze usage patterns to improve our service
• Show relevant advertisements (you can opt out)

You can control cookie settings through your browser preferences.`
  },
  {
    title: '6. Your Rights',
    content: `You have the right to:

• Access the personal data we hold about you
• Correct inaccurate or incomplete data
• Request deletion of your account and data
• Opt out of marketing communications
• Data portability — receive your data in a machine-readable format
• Lodge a complaint with a supervisory authority

To exercise these rights, contact us at privacy@hotelsewa.com`
  },
  {
    title: '7. Data Retention',
    content: `We retain your personal data for as long as necessary to provide our services and comply with legal obligations. Booking records are retained for 7 years for tax and legal purposes. You may request deletion of your account at any time.`
  },
  {
    title: '8. Children\'s Privacy',
    content: `Our services are not directed to children under 18. We do not knowingly collect personal information from minors. If you believe we have inadvertently collected such information, please contact us immediately.`
  },
  {
    title: '9. Changes to This Policy',
    content: `We may update this Privacy Policy from time to time. We will notify you of significant changes via email or a prominent notice on our website. Your continued use of our services after changes constitutes acceptance of the updated policy.`
  },
  {
    title: '10. Contact Us',
    content: `For privacy-related questions or to exercise your rights:

Email: privacy@hotelsewa.com
Address: HotelSewa Technologies Pvt. Ltd., Mumbai, Maharashtra, India
Phone: +91 1800-XXX-XXXX (toll-free)`
  },
]

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16 max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="font-poppins font-bold text-3xl text-dark-gray mb-2">Privacy Policy</h1>
          <p className="text-gray-500 text-sm">Last updated: April 14, 2026</p>
          <p className="text-gray-600 mt-3">At HotelSewa, we take your privacy seriously. This policy explains how we collect, use, and protect your personal information.</p>
        </div>

        <div className="space-y-5">
          {SECTIONS.map(({ title, content }) => (
            <div key={title} className="card p-6">
              <h2 className="font-poppins font-semibold text-dark-gray mb-3">{title}</h2>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{content}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex gap-4 text-sm">
          <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link>
          <Link href="/about" className="text-primary hover:underline">About Us</Link>
          <Link href="/help" className="text-primary hover:underline">Help Center</Link>
        </div>
      </div>
    </div>
  )
}
