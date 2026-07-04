'use client'
import { useState } from 'react'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import { useAppStore } from '@/store/useAppStore'
import { formatPrice, localTodayISO } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { StudentForm } from './StudentForm'
import { ReceiptDialog } from '@/components/receipt/ReceiptDialog'

export function StudentList() {
  const t = useTranslations('students')
  const { students, removeStudent, classNames } = useAppStore()
  const [curYear, curMonth] = (() => {
    const [y, m] = localTodayISO().split('-')
    return [Number(y), Number(m)]
  })()
  const [q, setQ] = useState('')
  const [cls, setCls] = useState('__all__')
  const rows = students
    .filter((s) => (cls === '__all__' ? true : s.className === cls))
    .filter((s) => s.fullName.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => a.sortOrder - b.sortOrder)

  function onDelete(id: string) {
    if (window.confirm(t('confirmDelete'))) {
      removeStudent(id)
      toast.success(t('deleted'))
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Input placeholder="🔍" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
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
            <TableHead>STT</TableHead>
            <TableHead>{t('fullName')}</TableHead>
            <TableHead>{t('className')}</TableHead>
            <TableHead className="text-right">{t('fee')}</TableHead>
            <TableHead className="text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((s) => (
            <TableRow key={s.id}>
              <TableCell>{s.sortOrder}</TableCell>
              <TableCell className="font-medium">{s.fullName}</TableCell>
              <TableCell>{s.className}</TableCell>
              <TableCell className="text-right">{formatPrice(s.fee)}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <ReceiptDialog
                    studentId={s.id}
                    defaultYear={curYear}
                    defaultMonth={curMonth}
                    trigger={<Button variant="outline" size="sm">🧾 Phiếu</Button>}
                  />
                  <StudentForm editing={s} trigger={<Button variant="outline" size="sm">{t('edit')}</Button>} />
                  <Button variant="destructive" size="sm" onClick={() => onDelete(s.id)}>{t('delete')}</Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
