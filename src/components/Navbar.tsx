'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { FiSearch, FiBell, FiHeart, FiUser, FiMenu, FiX, FiLogOut, FiSettings, FiTag, FiGift, FiAlertCircle } from 'react-icons/fi'
import { MdHotel } from 'react-icons/md'
import { isLoggedIn, getUser, logout, isOwner } from '@/lib/auth'
import { authApi } from '@/lib/api'
import toast from 'react-hot-toast'

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [loggedIn, setLoggedIn] = useState(false)
  const [user, setUser] = useState<ReturnType<typeof getUser>>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    function syncAuth() {
      setLoggedIn(isLoggedIn())
      setUser(getUser())
    }
    syncAuth()
    // Re-sync on auth-change event (fired by saveSession after login)
    window.addEventListener('auth-change', syncAuth)
    // Re-sync on tab focus (handles cross-tab login)
    window.addEventListener('focus', syncAuth)
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => {
      window.removeEventListener('auth-change', syncAuth)
      window.removeEventListener('focus', syncAuth)
      window.removeEventListener('scroll', onScroll)
    }
  }, [pathname])

  const handleLogout = async () => {
    try { await authApi.logout() } catch { /* ignore */ }
    logout()
    setLoggedIn(false)
    setUser(null)
    toast.success('Logged out successfully')
    router.push('/')
  }

  const navLinks = [
    { href: '/hotels', label: 'Hotels' },
    { href: '/deals', label: 'Deals' },
    { href: '/search', label: 'Search' },
    { href: '/about', label: 'About' },
  ]

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-card' : 'bg-white/95 backdrop-blur-md'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center">
              <MdHotel className="text-white text-lg" />
            </div>
            <span className="font-poppins font-extrabold text-xl text-primary tracking-wide">HOTELSEWA</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(l => (
              <Link key={l.href} href={l.href}
                className={`nav-link ${pathname.startsWith(l.href) ? 'active' : ''}`}>
                {l.label}
              </Link>
            ))}
          </div>

          {/* Search bar */}
          <div className="hidden lg:flex items-center gap-2 bg-surface rounded-2xl px-4 py-2 w-64 cursor-pointer hover:shadow-card transition-all"
            onClick={() => router.push('/search')}>
            <FiSearch className="text-primary" />
            <span className="text-sm text-placeholder">Search hotels...</span>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {loggedIn ? (
              <>
                <button onClick={() => router.push('/notifications')}
                  className="w-9 h-9 rounded-xl bg-surface flex items-center justify-center hover:bg-primary/10 transition-all relative">
                  <FiBell className="text-dark-gray" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
                </button>
                <button onClick={() => router.push('/saved')}
                  className="w-9 h-9 rounded-xl bg-surface flex items-center justify-center hover:bg-primary/10 transition-all">
                  <FiHeart className="text-dark-gray" />
                </button>
                {isOwner() && (
                  <Link href="/owner/dashboard"
                    className="hidden md:flex items-center gap-1.5 bg-primary text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-primary-dark transition-all">
                    <MdHotel /> Dashboard
                  </Link>
                )}
                {/* Profile dropdown */}
                <div className="relative">
                  <button onClick={() => setProfileOpen(!profileOpen)}
                    className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-all">
                    {user?.profileImageUrl
                      ? <img src={user.profileImageUrl} alt="" className="w-9 h-9 rounded-xl object-cover" />
                      : <span className="text-primary font-bold text-sm">{user?.name?.[0]?.toUpperCase() || 'U'}</span>
                    }
                  </button>
                  {profileOpen && (
                    <div className="absolute right-0 top-12 w-52 bg-white rounded-2xl shadow-elevated border border-gray-100 py-2 animate-fade-in">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="font-semibold text-dark-gray text-sm">{user?.name}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>
                      <Link href="/profile" className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-surface transition-all" onClick={() => setProfileOpen(false)}>
                        <FiUser className="text-gray-500" /> My Profile
                      </Link>
                      <Link href="/trips" className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-surface transition-all" onClick={() => setProfileOpen(false)}>
                        <MdHotel className="text-gray-500" /> My Trips
                      </Link>
                      <Link href="/wallet" className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-surface transition-all" onClick={() => setProfileOpen(false)}>
                        <FiTag className="text-gray-500" /> Wallet
                      </Link>
                      <Link href="/loyalty" className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-surface transition-all" onClick={() => setProfileOpen(false)}>
                        <FiGift className="text-gray-500" /> Loyalty Points
                      </Link>
                      <Link href="/invite" className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-surface transition-all" onClick={() => setProfileOpen(false)}>
                        <FiGift className="text-gray-500" /> Invite & Earn
                      </Link>
                      <Link href="/price-alerts" className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-surface transition-all" onClick={() => setProfileOpen(false)}>
                        <FiAlertCircle className="text-gray-500" /> Price Alerts
                      </Link>
                      <Link href="/settings" className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-surface transition-all" onClick={() => setProfileOpen(false)}>
                        <FiSettings className="text-gray-500" /> Settings
                      </Link>
                      <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-all">
                        <FiLogOut /> Logout
                      </button>                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm font-semibold text-dark-gray hover:text-primary transition-all px-3 py-2">Login</Link>
                <Link href="/signup" className="btn-primary text-sm py-2 px-4">Sign Up</Link>
              </>
            )}
            {/* Mobile menu */}
            <button className="md:hidden w-9 h-9 rounded-xl bg-surface flex items-center justify-center" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <FiX /> : <FiMenu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-1 animate-fade-in">
          {navLinks.map(l => (
            <Link key={l.href} href={l.href} className="block px-4 py-3 rounded-xl text-sm font-medium hover:bg-surface" onClick={() => setMenuOpen(false)}>
              {l.label}
            </Link>
          ))}
          {loggedIn && isOwner() && (
            <Link href="/owner/dashboard" className="block px-4 py-3 rounded-xl text-sm font-semibold text-primary" onClick={() => setMenuOpen(false)}>
              Owner Dashboard
            </Link>
          )}
        </div>
      )}
    </nav>
  )
}
