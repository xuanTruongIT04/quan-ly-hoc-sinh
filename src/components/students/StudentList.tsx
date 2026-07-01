'use client'
import { useState } from 'react'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import { useAppStore } from '@/store/useAppStore'
import { formatPrice } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { StudentForm } from './StudentForm'

export function StudentList() {
  const t = useTranslations('students')
  const { students, removeStudent } = useAppStore()
  const [q, setQ] = useState('')
  const rows = students
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
      <Input placeholder="🔍" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
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
