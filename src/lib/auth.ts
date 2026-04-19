import Cookies from 'js-cookie'

export interface AuthUser {
  id: string
  name: string
  email: string
  phone?: string
  role: string
  profileImageUrl?: string
  hasHotel?: boolean
}

export function saveSession(data: Record<string, unknown>) {
  // Backend response shape: { error, message, data: {...user}, token: "...", code: 200 }
  // token is at ROOT level, user is in data.data
  const token = (data.token || data.access_token) as string

  if (!token) {
    console.warn('[saveSession] No token found in response:', JSON.stringify(data).slice(0, 200))
    return
  }

  Cookies.set('authToken', token, { expires: 30, sameSite: 'lax' })

  // User object is in data.data
  const user = (data.data && typeof data.data === 'object' ? data.data : data) as Record<string, unknown>

  if (user && typeof user === 'object') {
    const roles = user.roles as Array<Record<string, unknown>> | undefined
    const userData: AuthUser = {
      id: String(user.id || ''),
      name: String(user.name || ''),
      email: String(user.email || ''),
      phone: String(user.mobile || user.phone || ''),
      role: String(user.role || (Array.isArray(roles) && roles[0]?.name) || 'customer'),
      profileImageUrl: (user.profile || user.profileImage || user.avatar) as string | undefined,
      hasHotel: Boolean(user.hasHotel || user.has_hotel),
    }
    Cookies.set('userData', JSON.stringify(userData), { expires: 30, sameSite: 'lax' })
  }

  // Notify all components that auth state changed
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('auth-change'))
  }
}

export function getToken(): string | undefined {
  return Cookies.get('authToken')
}

export function getUser(): AuthUser | null {
  const raw = Cookies.get('userData')
  if (!raw) return null
  try { return JSON.parse(raw) } catch { return null }
}

export function isLoggedIn(): boolean {
  return !!Cookies.get('authToken')
}

export function getUserRole(): string {
  const user = getUser()
  return user?.role || 'customer'
}

export function isOwner(): boolean {
  const role = getUserRole().toLowerCase()
  return role === 'hotel_owner' || role === 'owner' || role === 'hotel owner' || role === 'hotelowner'
}

export function logout() {
  Cookies.remove('authToken')
  Cookies.remove('userData')
  Cookies.remove('userRole')
}
