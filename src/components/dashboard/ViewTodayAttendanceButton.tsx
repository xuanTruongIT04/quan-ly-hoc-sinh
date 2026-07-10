'use client'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

export function ViewTodayAttendanceButton() {
  const t = useTranslations('dashboard')
  return (
    <Link href="/attendance" className="candy-btn-outline">
      📅 {t('viewTodayAttendance')}
    </Link>
  )
}
