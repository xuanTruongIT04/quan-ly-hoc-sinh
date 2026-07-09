'use client'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { buttonVariants } from '@/components/ui/button'

export function ViewTodayAttendanceButton() {
  const t = useTranslations('dashboard')
  return (
    <Link href="/attendance" className={buttonVariants({ variant: 'outline' })}>
      {t('viewTodayAttendance')}
    </Link>
  )
}
