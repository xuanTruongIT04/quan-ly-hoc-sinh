'use client'
import { useSyncExternalStore } from 'react'

const emptySubscribe = () => () => {}

// Chỉ render children sau khi client mount → tránh hydration mismatch do localStorage/Zustand persist.
// Dùng useSyncExternalStore (thay vì setState trong useEffect) vì đây là cách React khuyến nghị
// để phát hiện "đã mount trên client": getServerSnapshot() luôn trả false (khớp lần render SSR đầu),
// getSnapshot() trả true trên client sau hydrate — không gây cascading render qua effect.
export function StoreHydration({ children }: { children: React.ReactNode }) {
  const hydrated = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  )
  if (!hydrated) return null
  return <>{children}</>
}
