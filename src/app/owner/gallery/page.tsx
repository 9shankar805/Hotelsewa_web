'use client'
import { useState, useEffect, useRef } from 'react'
import { ownerApi } from '@/lib/api'
import toast from 'react-hot-toast'
import { FiUpload, FiTrash2, FiImage } from 'react-icons/fi'

export default function GalleryPage() {
  const [images, setImages] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => { loadGallery() }, [])

  async function loadGallery() {
    setLoading(true)
    try {
      const res = await ownerApi.getGallery()
      const raw = res.data?.data
      const imgs: string[] = []

      function fixUrl(url: string): string {
        const match = url.match(/https?:\/\/[^/]+\/storage\/(https?:\/\/.+)/)
        return match ? match[1] : url
      }

      if (Array.isArray(raw)) raw.forEach(item => {
        if (typeof item === 'string') imgs.push(fixUrl(item))
        else if (item?.url) imgs.push(fixUrl(String(item.url)))
        else if (item?.image) imgs.push(fixUrl(String(item.image)))
        // Handle gallery category structure: { category, items: [{url}] }
        else if (item?.items && Array.isArray(item.items)) {
          item.items.forEach((sub: Record<string, unknown>) => {
            if (sub?.url) imgs.push(fixUrl(String(sub.url)))
          })
        }
      })
      setImages(imgs)
    } catch {
      setImages([])
    } finally {
      setLoading(false)
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return
    setUploading(true)
    try {
      const formData = new FormData()
      Array.from(files).forEach(f => formData.append('images[]', f))
      await ownerApi.uploadImages(formData)
      toast.success('Images uploaded!')
      loadGallery()
    } catch {
      toast.error('Upload failed')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-poppins font-bold text-2xl text-dark-gray">Gallery</h1>
        <button onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="btn-primary flex items-center gap-2 text-sm py-2.5">
          {uploading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FiUpload />}
          Upload Photos
        </button>
        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} />
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="shimmer aspect-square rounded-2xl" />
          ))}
        </div>
      ) : images.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-3xl cursor-pointer hover:border-primary transition-colors"
          onClick={() => fileRef.current?.click()}>
          <FiImage className="text-6xl text-gray-300 mx-auto mb-4" />
          <h3 className="font-poppins font-bold text-xl text-dark-gray mb-2">No photos yet</h3>
          <p className="text-gray-500 mb-4">Upload photos to showcase your hotel</p>
          <span className="btn-primary inline-flex items-center gap-2"><FiUpload /> Upload Photos</span>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((img, i) => (
            <div key={i} className="relative aspect-square rounded-2xl overflow-hidden group shadow-card">
              <img src={img} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                <button className="w-9 h-9 bg-red-500 text-white rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600">
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))}
          {/* Upload tile */}
          <div onClick={() => fileRef.current?.click()}
            className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all">
            <FiUpload className="text-2xl text-gray-400 mb-2" />
            <span className="text-xs text-gray-400 font-medium">Add more</span>
          </div>
        </div>
      )}
    </div>
  )
}
