'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useAppStore } from '@/store/useAppStore'
import { usePeriodStore } from '@/store/usePeriodStore'
import { countSessions, monthlyFee, classSessionsInMonth } from '@/lib/fees'
import { formatPrice } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ReceiptDialog } from '@/components/receipt/ReceiptDialog'

export function StudentTable() {
  const t = useTranslations('dashboard')
  const { students, attendance, classNames } = useAppStore()
  const { year, month } = usePeriodStore()
  const [q, setQ] = useState('')
  const [cls, setCls] = useState('__all__')

  const rows = students
    .filter((s) => (cls === '__all__' ? true : s.className === cls))
    .filter((s) => s.fullName.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => a.sortOrder - b.sortOrder)

  if (students.length === 0) {
    return <div className="rounded-lg border p-8 text-center text-gray-500">{t('empty')}</div>
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Input placeholder={t('searchPlaceholder')} value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
        <Select value={cls} onValueChange={(v) => v && setCls(v)}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">{t('allClasses')}</SelectItem>
            {classNames().map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('colStudent')}</TableHead>
            <TableHead>{t('colClass')}</TableHead>
            <TableHead className="text-center">{t('colAttendance')}</TableHead>
            <TableHead className="text-center">{t('colSessions')}</TableHead>
            <TableHead className="text-right">{t('colFee')}</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-gray-500 py-8">{t('noResults')}</TableCell>
            </TableRow>
          ) : (
            rows.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-medium">{s.fullName}</TableCell>
                <TableCell>{s.className}</TableCell>
                <TableCell className="text-center">
                  {countSessions(s.id, attendance, year, month)}/{classSessionsInMonth(s.className, students, attendance, year, month)}
                </TableCell>
                <TableCell className="text-center">{countSessions(s.id, attendance, year, month)}</TableCell>
                <TableCell className="text-right">{formatPrice(monthlyFee(s, attendance, year, month))}</TableCell>
                <TableCell className="text-right">
                  <ReceiptDialog
                    studentId={s.id}
                    defaultYear={year}
                    defaultMonth={month}
                    trigger={<Button size="sm" variant="outline">🧾 Phiếu</Button>}
                  />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
