'use client'
import { useState } from 'react'
import { FiUpload, FiFileText, FiCheck, FiClock } from 'react-icons/fi'
import toast from 'react-hot-toast'

const REQUIRED_DOCS = [
  { name: 'Hotel Registration Certificate', required: true, status: 'pending' },
  { name: 'GST Certificate', required: true, status: 'approved' },
  { name: 'Fire Safety Certificate', required: true, status: 'pending' },
  { name: 'Food License (FSSAI)', required: false, status: 'not_uploaded' },
  { name: 'Police NOC', required: true, status: 'approved' },
  { name: 'Trade License', required: false, status: 'not_uploaded' },
]

export default function DocumentsPage() {
  const [docs, setDocs] = useState(REQUIRED_DOCS)

  const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    approved: { label: 'Approved', color: 'text-green-600 bg-green-50', icon: <FiCheck /> },
    pending: { label: 'Under Review', color: 'text-yellow-600 bg-yellow-50', icon: <FiClock /> },
    not_uploaded: { label: 'Not Uploaded', color: 'text-gray-500 bg-gray-50', icon: <FiUpload /> },
    rejected: { label: 'Rejected', color: 'text-red-600 bg-red-50', icon: <FiFileText /> },
  }

  return (
    <div className="p-6 max-w-3xl">
      <h1 className="font-poppins font-bold text-2xl text-dark-gray mb-2">Documents</h1>
      <p className="text-gray-500 text-sm mb-6">Upload required documents to verify your hotel listing</p>

      {/* Progress */}
      <div className="card p-5 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-dark-gray">Verification Progress</span>
          <span className="text-sm font-bold text-primary">{docs.filter(d => d.status === 'approved').length}/{docs.filter(d => d.required).length} Required</span>
        </div>
        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all"
            style={{ width: `${(docs.filter(d => d.status === 'approved').length / docs.filter(d => d.required).length) * 100}%` }} />
        </div>
      </div>

      <div className="space-y-3">
        {docs.map((doc, i) => {
          const config = STATUS_CONFIG[doc.status] || STATUS_CONFIG.not_uploaded
          return (
            <div key={i} className="card p-5 flex items-center gap-4">
              <div className="w-10 h-10 bg-surface rounded-xl flex items-center justify-center flex-shrink-0">
                <FiFileText className="text-gray-400 text-lg" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-dark-gray text-sm">{doc.name}</p>
                  {doc.required && <span className="text-xs text-red-500 font-medium">Required</span>}
                </div>
                <span className={`badge text-xs mt-1 flex items-center gap-1 w-fit ${config.color}`}>
                  {config.icon} {config.label}
                </span>
              </div>
              {doc.status !== 'approved' && (
                <button onClick={() => toast.success('Upload feature coming soon')}
                  className="flex items-center gap-1.5 text-sm text-primary font-semibold hover:underline">
                  <FiUpload className="text-xs" /> Upload
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
