'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useAppStore } from '@/store/useAppStore'
import { usePeriodStore } from '@/store/usePeriodStore'
import { countSessions, receiptTotal, classSessionsInMonth } from '@/lib/fees'
import { formatPrice } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ReceiptDialog } from '@/components/receipt/ReceiptDialog'
import { BatchReceiptExport } from '@/components/receipt/BatchReceiptExport'

export function StudentTable() {
  const t = useTranslations('dashboard')
  const { students, attendance, classNames, isPaid, getExtraFee } = useAppStore()
  const { year, month } = usePeriodStore()
  const [q, setQ] = useState('')
  const [cls, setCls] = useState('__all__')

  const rows = students
    .filter((s) => (cls === '__all__' ? true : s.className === cls))
    .filter((s) => s.fullName.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => a.sortOrder - b.sortOrder)

  if (students.length === 0) {
    return <div className="candy-card p-8 text-center text-[#8d6e63]">{t('empty')}</div>
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Input placeholder={t('searchPlaceholder')} value={q} onChange={(e) => setQ(e.target.value)} className="candy-input max-w-xs" />
        <Select value={cls} onValueChange={(v) => v && setCls(v)}>
          <SelectTrigger className="w-48">
            <SelectValue>{(v: string) => (v === '__all__' ? t('allClasses') : v)}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">{t('allClasses')}</SelectItem>
            {classNames().map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        {rows.length > 0 && (
          <BatchReceiptExport studentIds={rows.map((s) => s.id)} year={year} month={month} label={t('batchReceipt')} />
        )}
      </div>
      <div className="candy-table">
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
              <TableCell colSpan={6} className="text-center text-[#8d6e63] py-8">{t('noResults')}</TableCell>
            </TableRow>
          ) : (
            rows.map((s) => {
              const total = receiptTotal(s, attendance, getExtraFee(s.id, year, month), year, month)
              return (
              <TableRow key={s.id}>
                <TableCell className="font-bold">
                  {s.fullName}
                  {!isPaid(s.id, year, month) && total > 0 && (
                    <span className="ml-2 inline-flex items-center rounded-full bg-[#fff3cd] px-2 py-0.5 text-xs font-bold text-[#b8860b]">{t('debtBadge')}</span>
                  )}
                </TableCell>
                <TableCell><span className="candy-pill">{s.className}</span></TableCell>
                <TableCell className="text-center">
                  {countSessions(s.id, attendance, year, month)}/{classSessionsInMonth(s.className, students, attendance, year, month)}
                </TableCell>
                <TableCell className="text-center">{countSessions(s.id, attendance, year, month)}</TableCell>
                <TableCell className="text-right font-extrabold text-[#c2185b]">{formatPrice(total)}</TableCell>
                <TableCell className="text-right">
                  <ReceiptDialog
                    studentId={s.id}
                    defaultYear={year}
                    defaultMonth={month}
                    trigger={<button className="candy-btn-outline text-xs">🧾 Phiếu</button>}
                  />
                </TableCell>
              </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
      </div>
    </div>
  )
}
