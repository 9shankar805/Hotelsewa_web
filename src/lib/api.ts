import axios from 'axios'
import Cookies from 'js-cookie'

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://209.50.241.46:2000/api'

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
  timeout: 30000,
})

api.interceptors.request.use((config) => {
  const token = Cookies.get('authToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      Cookies.remove('authToken')
      Cookies.remove('userRole')
      if (typeof window !== 'undefined') window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/user-signup', {
      email,
      password,
      type: 'email',
      firebase_id: `email_${email.replace(/[^a-zA-Z0-9]/g, '_')}`,
    }),
  signup: (name: string, email: string, password: string, phone: string, role = 'customer') =>
    api.post('/user-signup', {
      name,
      email,
      password,
      phone,
      type: 'email',
      role,
      firebase_id: `email_${email.replace(/[^a-zA-Z0-9]/g, '_')}`,
    }),
  googleLogin: (firebaseIdToken: string, email: string, name: string, role = 'customer') =>
    api.post('/user-signup', {
      email,
      name,
      type: 'google',
      firebase_id: firebaseIdToken,
      role,
    }),
  getOtp: (mobile: string) => api.get('/get-otp', { params: { mobile } }),
  verifyOtp: (mobile: string, otp: string) => api.get('/verify-otp', { params: { mobile, otp } }),
  logout: () => api.post('/logout'),
  getSystemSettings: () => api.get('/get-system-settings'),
}

// ── Hotels ────────────────────────────────────────────────────────────────────
export const hotelApi = {
  getHotels: (params?: Record<string, unknown>) => api.get('/hotels', { params }),
  getHotelDetails: (id: string | number) => api.get(`/hotel-details/${id}`),
  getHotelPolicies: (id: string | number) => api.get(`/hotel-policies/${id}`),
  getNearbyHotels: (lat: number, lng: number) => api.get('/hotels/nearby', { params: { latitude: lat, longitude: lng } }),
  getHomeData: () => api.get('/get-home-data'),
  getTrending: () => api.get('/recommendations/trending'),
  getForYou: () => api.get('/recommendations/for-you'),
  searchHotels: (params: Record<string, unknown>) => api.get('/filters/search', { params }),
  getFilterOptions: () => api.get('/filters/options'),
}

// ── Bookings (Customer) ───────────────────────────────────────────────────────
export const bookingApi = {
  createBooking: (data: Record<string, unknown>) => api.post('/create-booking', data),
  createHourlyBooking: (data: {
    hotel_id: string | number
    room_type_id: string | number
    booking_type: 'hourly'
    check_in_datetime: string   // "2026-05-01 14:00:00"
    check_out_datetime: string  // "2026-05-01 18:00:00"
    adults: number
    children?: number
    special_requests?: string
    redeem_points?: number
  }) => api.post('/create-booking', { ...data, booking_type: 'hourly' }),
  previewHourlyPrice: (params: {
    hotel_id: string | number
    room_type_id: string | number
    booking_type: 'hourly'
    check_in_datetime: string
    check_out_datetime: string
  }) => api.get('/preview-price', { params }),
  confirmPayment: (data: Record<string, unknown>) => api.post('/confirm-payment', data),
  getMyBookings: () => api.get('/my-bookings'),
  cancelBooking: (id: string) => api.post(`/cancel-booking/${id}`),
  rateHotel: (data: Record<string, unknown>) => api.post('/rate-hotel', data),
  validateCoupon: (data: Record<string, unknown>) => api.post('/validate-coupon', data),
  previewPrice: (params: Record<string, unknown>) => api.get('/preview-price', { params }),
  downloadInvoice: (bookingId: string) => api.get(`/invoice/${bookingId}/download`),
  previewInvoice: (bookingId: string) => api.get(`/invoice/${bookingId}/preview`),
  getCheckinQr: (bookingId: string) => api.get(`/checkin/qr/${bookingId}`),
}

// ── Owner Dashboard ───────────────────────────────────────────────────────────
export const ownerApi = {
  getDashboard: (period = 'today') => api.get('/hotel-owner/dashboard', { params: { period } }),
  getBookings: (params?: Record<string, unknown>) => api.get('/hotel-owner/bookings', { params }),
  updateBookingStatus: (id: string, status: string) => api.post(`/update-booking-status/${id}`, { status }),
  getEarnings: (params?: Record<string, unknown>) => api.get('/hotel-owner/earnings', { params }),
  getAnalytics: (params?: Record<string, unknown>) => api.get('/hotel-owner/analytics', { params }),
  getReviews: (params?: Record<string, unknown>) => api.get('/hotel-owner/reviews', { params }),
  replyReview: (id: string, reply: string) => api.post(`/hotel-owner/reviews/${id}/reply`, { reply }),
  getOffers: () => api.get('/hotel-owner/offers'),
  createOffer: (data: Record<string, unknown>) => api.post('/hotel-owner/offers', data),
  deleteOffer: (id: string) => api.delete(`/hotel-owner/offers/${id}`),
  getGallery: () => api.get('/hotel-owner/gallery'),
  uploadImages: (formData: FormData) => api.post('/hotel-owner/media/images', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getAmenities: () => api.get('/hotel-owner/amenities'),
  getMyHotels: () => api.get('/my-hotels'),
  storeHotel: (data: Record<string, unknown>) => api.post('/store-hotel', data),
  updateHotel: (id: string, data: Record<string, unknown>) => api.post(`/update-hotel/${id}`, data),
  getRooms: () => api.get('/rooms'),
  storeRoom: (data: Record<string, unknown>) => api.post('/store-room', data),
  updateRoom: (id: string, data: Record<string, unknown>) => api.post(`/update-room/${id}`, data),
  deleteRoom: (id: string) => api.delete(`/delete-room/${id}`),
  getCalendar: (params?: Record<string, unknown>) => api.get('/hotel-owner/bookings', { params }),
  getReports: (params?: Record<string, unknown>) => api.get('/hotel-owner/reports', { params }),
  getTransactions: () => api.get('/hotel-owner/transactions'),
  getWithdrawals: () => api.get('/hotel-owner/withdrawals'),
  getOrders: () => api.get('/hotel-owner/orders'),
  updateOrderStatus: (id: string, status: string) => api.post(`/hotel-owner/orders/${id}/status`, { status }),
}

// ── Profile ───────────────────────────────────────────────────────────────────
export const profileApi = {
  updateProfile: (data: Record<string, unknown>) => api.post('/update-profile', data),
  getNotifications: () => api.get('/get-notification-list'),
  getFavourites: () => api.get('/get-favourite-item'),
  manageFavourite: (data: Record<string, unknown>) => api.post('/manage-favourite', data),
  getLoyaltyBalance: () => api.get('/loyalty/balance'),
  getWalletTransactions: () => api.get('/payment-transactions'),
  deleteAccount: () => api.delete('/delete-user'),
}

// ── Chat ──────────────────────────────────────────────────────────────────────
export const chatApi = {
  getMessages: (bookingId: string) => api.get(`/chat/${bookingId}/messages`),
  sendMessage: (data: Record<string, unknown>) => api.post('/chat/send', data),
  getOwnerChats: () => api.get('/chat/owner/all'),
}
