'use client'
import { useState, useEffect } from 'react'
import { ownerApi } from '@/lib/api'
import { formatDate, getStatusColor } from '@/lib/utils'
import { TableRowShimmer } from '@/components/Shimmer'
import toast from 'react-hot-toast'
import { FiShoppingBag, FiCheck, FiX } from 'react-icons/fi'

export default function OrdersPage() {
  const [orders, setOrders] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadOrders() }, [])

  async function loadOrders() {
    setLoading(true)
    try {
      const res = await ownerApi.getOrders()
      const raw = res.data?.data
      setOrders(Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [])
    } catch {
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  async function updateStatus(id: string, status: string) {
    try {
      await ownerApi.updateOrderStatus(id, status)
      toast.success(`Order ${status}`)
      loadOrders()
    } catch {
      toast.error('Failed to update order')
    }
  }

  return (
    <div className="p-6">
      <h1 className="font-poppins font-bold text-2xl text-dark-gray mb-6">In-Stay Orders</h1>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface">
              <tr>
                {['Order ID', 'Guest', 'Room', 'Items', 'Total', 'Date', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left py-3.5 px-4 text-xs font-semibold text-gray-400 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? Array.from({ length: 6 }).map((_, i) => <TableRowShimmer key={i} cols={8} />) :
                orders.length > 0 ? orders.map((o, i) => {
                  const status = String(o.status || 'pending')
                  const items = (o.items as Record<string, unknown>[]) || []
                  return (
                    <tr key={i} className="border-t border-gray-50 hover:bg-surface/50">
                      <td className="py-3.5 px-4 font-mono text-xs text-gray-500">#{String(o.id || '').slice(-6)}</td>
                      <td className="py-3.5 px-4 font-medium text-dark-gray">{String((o.user as Record<string, unknown>)?.name || o.guest_name || 'Guest')}</td>
                      <td className="py-3.5 px-4 text-gray-600">{String(o.room_number || o.room || '-')}</td>
                      <td className="py-3.5 px-4 text-gray-600">{items.length} item{items.length !== 1 ? 's' : ''}</td>
                      <td className="py-3.5 px-4 font-semibold text-dark-gray">₹{Number(o.total || o.amount || 0).toLocaleString()}</td>
                      <td className="py-3.5 px-4 text-gray-500">{formatDate(String(o.created_at || ''))}</td>
                      <td className="py-3.5 px-4"><span className={`badge ${getStatusColor(status)}`}>{status}</span></td>
                      <td className="py-3.5 px-4">
                        <div className="flex gap-1">
                          {status === 'pending' && (
                            <button onClick={() => updateStatus(String(o.id), 'preparing')}
                              className="w-7 h-7 rounded-lg bg-green-50 text-green-600 flex items-center justify-center hover:bg-green-100">
                              <FiCheck className="text-xs" />
                            </button>
                          )}
                          {status === 'preparing' && (
                            <button onClick={() => updateStatus(String(o.id), 'delivered')}
                              className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100">
                              <FiCheck className="text-xs" />
                            </button>
                          )}
                          {['pending', 'preparing'].includes(status) && (
                            <button onClick={() => updateStatus(String(o.id), 'cancelled')}
                              className="w-7 h-7 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100">
                              <FiX className="text-xs" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                }) : (
                  <tr>
                    <td colSpan={8} className="py-16 text-center">
                      <FiShoppingBag className="text-5xl text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-400">No orders yet</p>
                    </td>
                  </tr>
                )
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
