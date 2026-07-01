'use client'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'

export function ViewTodayAttendanceButton() {
  const t = useTranslations('dashboard')
  return (
    <Button variant="outline" render={<Link href="/attendance" />}>
      {t('viewTodayAttendance')}
    </Button>
  )
}
