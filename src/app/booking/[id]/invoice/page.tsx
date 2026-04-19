'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { bookingApi } from '@/lib/api'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'
import { FiDownload, FiPrinter, FiArrowLeft } from 'react-icons/fi'
import Link from 'next/link'

export default function InvoicePage() {
  const { id } = useParams()
  const [invoice, setInvoice] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [id])

  async function load() {
    setLoading(true)
    try {
      const res = await bookingApi.previewInvoice(String(id))
      setInvoice(res.data?.data || res.data)
    } catch {
      // Use fallback invoice data
      setInvoice({
        booking_id: id, invoice_number: `INV-${String(id).slice(0,8).toUpperCase()}`,
        hotel_name: 'Hotel', guest_name: 'Guest', check_in: '', check_out: '',
        room_type: 'Standard Room', nights: 1, room_charges: 0, tax: 0, total: 0,
        payment_method: 'Card', payment_status: 'Paid', created_at: new Date().toISOString(),
      })
    } finally { setLoading(false) }
  }

  async function downloadPdf() {
    try {
      const res = await bookingApi.downloadInvoice(String(id))
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement('a')
      a.href = url
      a.download = `invoice-${id}.pdf`
      a.click()
    } catch { toast.error('Download failed') }
  }

  if (loading) return (
    <div className="min-h-screen bg-background"><Navbar />
      <div className="pt-16 max-w-2xl mx-auto px-4 py-8 space-y-4">
        {Array.from({length:5}).map((_,i)=><div key={i} className="shimmer h-12 rounded-xl"/>)}
      </div>
    </div>
  )

  const inv = invoice || {}
  const roomCharges = Number(inv.room_charges || inv.subtotal || 0)
  const tax = Number(inv.tax || inv.tax_amount || 0)
  const total = Number(inv.total || inv.total_amount || roomCharges + tax)

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16 max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link href="/trips" className="w-9 h-9 rounded-xl bg-white shadow-card flex items-center justify-center">
              <FiArrowLeft className="text-gray-600" />
            </Link>
            <h1 className="font-poppins font-bold text-2xl text-dark-gray">Invoice</h1>
          </div>
          <div className="flex gap-2">
            <button onClick={() => window.print()} className="btn-outline flex items-center gap-2 text-sm py-2">
              <FiPrinter /> Print
            </button>
            <button onClick={downloadPdf} className="btn-primary flex items-center gap-2 text-sm py-2">
              <FiDownload /> Download PDF
            </button>
          </div>
        </div>

        {/* Invoice card */}
        <div className="card p-8 print:shadow-none" id="invoice">
          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <h2 className="font-poppins font-extrabold text-2xl text-primary">HOTELSEWA</h2>
              <p className="text-xs text-gray-400 mt-1">Your trusted hotel booking partner</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-dark-gray text-lg">INVOICE</p>
              <p className="text-sm text-gray-500">{String(inv.invoice_number || `INV-${String(id).slice(0,8).toUpperCase()}`)}</p>
              <p className="text-xs text-gray-400 mt-1">{formatDate(String(inv.created_at || new Date().toISOString()))}</p>
            </div>
          </div>

          {/* Booking & Guest info */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Billed To</p>
              <p className="font-semibold text-dark-gray">{String(inv.guest_name || 'Guest')}</p>
              <p className="text-sm text-gray-500">{String(inv.guest_email || '')}</p>
              <p className="text-sm text-gray-500">{String(inv.guest_phone || '')}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Hotel</p>
              <p className="font-semibold text-dark-gray">{String(inv.hotel_name || 'Hotel')}</p>
              <p className="text-sm text-gray-500">{String(inv.hotel_address || '')}</p>
            </div>
          </div>

          {/* Stay details */}
          <div className="bg-surface rounded-2xl p-4 mb-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              {[
                { label: 'Check-in', value: formatDate(String(inv.check_in || '')) },
                { label: 'Check-out', value: formatDate(String(inv.check_out || '')) },
                { label: 'Room Type', value: String(inv.room_type || 'Standard') },
                { label: 'Nights', value: String(inv.nights || 1) },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs text-gray-400">{label}</p>
                  <p className="font-semibold text-dark-gray mt-0.5">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Line items */}
          <table className="w-full text-sm mb-6">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 text-xs font-semibold text-gray-400 uppercase">Description</th>
                <th className="text-right py-2 text-xs font-semibold text-gray-400 uppercase">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-50">
                <td className="py-3 text-gray-600">{String(inv.room_type || 'Room')} × {String(inv.nights || 1)} night{Number(inv.nights || 1) > 1 ? 's' : ''}</td>
                <td className="py-3 text-right font-medium text-dark-gray">₹{roomCharges.toLocaleString()}</td>
              </tr>
              <tr className="border-b border-gray-50">
                <td className="py-3 text-gray-600">GST & Taxes (18%)</td>
                <td className="py-3 text-right font-medium text-dark-gray">₹{tax.toLocaleString()}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-200">
                <td className="py-3 font-bold text-dark-gray">Total Amount</td>
                <td className="py-3 text-right font-poppins font-extrabold text-primary text-xl">₹{total.toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>

          {/* Payment status */}
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-2xl border border-green-100">
            <div>
              <p className="text-xs text-gray-400">Payment Method</p>
              <p className="font-semibold text-dark-gray capitalize">{String(inv.payment_method || 'Card')}</p>
            </div>
            <span className="badge text-green-600 bg-green-100 font-semibold">
              {String(inv.payment_status || 'Paid')}
            </span>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-100 text-center text-xs text-gray-400">
            <p>Thank you for choosing HotelSewa. For support: support@hotelsewa.com</p>
            <p className="mt-1">This is a computer-generated invoice and does not require a signature.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
