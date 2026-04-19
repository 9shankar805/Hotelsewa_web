'use client'
// Firebase is initialized via @/lib/firebase — no wrapper needed
// This component is kept as a passthrough for future auth context if needed
export default function GoogleAuthProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
