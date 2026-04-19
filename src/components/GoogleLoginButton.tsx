'use client'
import { useState } from 'react'
import { auth, googleProvider, signInWithPopup } from '@/lib/firebase'
import { authApi } from '@/lib/api'
import { saveSession } from '@/lib/auth'
import toast from 'react-hot-toast'

interface Props {
  role?: string
  redirect?: string
  label?: string
}

export default function GoogleLoginButton({ role = 'customer', redirect = '/', label = 'Continue with Google' }: Props) {
  const [loading, setLoading] = useState(false)

  async function handleGoogleLogin() {
    setLoading(true)
    try {
      // Step 1: Sign in with Google via Firebase — gets a real Firebase ID token
      const result = await signInWithPopup(auth, googleProvider)
      const user = result.user

      // Step 2: Get the Firebase ID token (this is what the backend needs as firebase_id)
      const firebaseIdToken = await user.getIdToken()

      // Step 3: Send to our backend — matches exactly what Flutter sends
      const res = await authApi.googleLogin(
        firebaseIdToken,
        user.email || '',
        user.displayName || user.email?.split('@')[0] || 'User',
        role
      )

      const data = res.data

      if (data?.token || data?.access_token) {
        saveSession(data)
        toast.success(`Welcome, ${user.displayName?.split(' ')[0] || 'there'}!`)
        const userRole = (data.data as Record<string,unknown>)?.role ||
          ((data.data as Record<string,unknown>)?.roles as Array<Record<string,unknown>>)?.[0]?.name ||
          role
        if (String(userRole).toLowerCase().includes('owner')) {
          window.location.href = '/owner/dashboard'
        } else {
          window.location.href = redirect
        }
      } else {
        toast.error(data?.message || 'Google sign-in failed')
      }
    } catch (err: unknown) {
      const firebaseErr = err as { code?: string; message?: string; response?: { data?: { message?: string } } }
      // User closed the popup — not an error
      if (firebaseErr?.code === 'auth/popup-closed-by-user' || firebaseErr?.code === 'auth/cancelled-popup-request') {
        setLoading(false)
        return
      }
      const msg = firebaseErr?.response?.data?.message || firebaseErr?.message || 'Google sign-in failed'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleGoogleLogin}
      disabled={loading}
      className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-dark-gray font-semibold py-3 px-4 rounded-2xl transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
    >
      {loading ? (
        <span className="w-5 h-5 border-2 border-gray-300 border-t-primary rounded-full animate-spin" />
      ) : (
        <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
      )}
      <span className="text-sm">{loading ? 'Signing in...' : label}</span>
    </button>
  )
}
