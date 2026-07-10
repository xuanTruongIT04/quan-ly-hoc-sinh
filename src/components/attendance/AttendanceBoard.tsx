'use client'
import { useState } from 'react'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import { useAppStore } from '@/store/useAppStore'
import { localTodayISO } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BulkAttendanceDialog } from './BulkAttendanceDialog'

export function AttendanceBoard() {
  const t = useTranslations('attendance')
  const { students, attendance, setAttendance, markClassPresent, classNames } = useAppStore()
  const classes = classNames()
  const [cls, setCls] = useState(classes[0] ?? '')
  const [date, setDate] = useState(localTodayISO())

  if (classes.length === 0) {
    return <div className="candy-card p-8 text-center text-[#8d6e63]">{t('noClass')}</div>
  }

  const inClass = students
    .filter((s) => s.className === cls)
    .filter((s) => date >= s.startDate)
    .sort((a, b) => a.sortOrder - b.sortOrder)
  const statusOf = (id: string) => attendance.find((a) => a.studentId === id && a.date === date)?.status

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-2">
        <div>
          <div className="mb-1 text-xs font-semibold text-[#8d6e63]">{t('selectClass')}</div>
          <Select value={cls} onValueChange={(v) => v && setCls(v)}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>{classes.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <div className="mb-1 text-xs font-semibold text-[#8d6e63]">{t('date')}</div>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-44" />
        </div>
        <button type="button" className="candy-btn-outline" onClick={() => { markClassPresent(inClass.map((s) => s.id), date); toast.success(t('saved')) }}>
          {t('markAllPresent')}
        </button>
        <BulkAttendanceDialog className={cls} studentIds={inClass.map((s) => s.id)} />
      </div>

      <div className="candy-card divide-y divide-[#fbe4ee] p-0">
        {inClass.map((s) => {
          const st = statusOf(s.id)
          return (
            <div key={s.id} className="flex items-center justify-between p-4">
              <span className="font-bold text-[#4e342e]">{s.fullName}</span>
              <div className="flex gap-2">
                <Button size="sm" variant={st === 'present' ? 'default' : 'outline'} className="rounded-full"
                  onClick={() => { setAttendance(s.id, date, 'present'); toast.success(t('saved')) }}>
                  {t('present')}
                </Button>
                <Button size="sm" variant="outline"
                  className={st === 'present2' ? 'rounded-full bg-amber-500 text-white hover:bg-amber-600' : 'rounded-full'}
                  onClick={() => { setAttendance(s.id, date, 'present2'); toast.success(t('saved')) }}>
                  {t('present2')}
                </Button>
                <Button size="sm" variant={st === 'absent' ? 'destructive' : 'outline'} className="rounded-full"
                  onClick={() => { setAttendance(s.id, date, 'absent'); toast.success(t('saved')) }}>
                  {t('absent')}
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
