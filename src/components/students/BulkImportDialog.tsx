'use client'
import { useState } from 'react'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import { useAppStore } from '@/store/useAppStore'
import { CONFIG } from '@/lib/config'
import { localTodayISO } from '@/lib/utils'
import type { Student } from '@/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export function BulkImportDialog() {
  const t = useTranslations('students')
  const tc = useTranslations('common')
  const { addStudentsBulk } = useAppStore()
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')

  function submit() {
    const list: Omit<Student, 'id'>[] = text.split('\n').map((line) => line.trim()).filter(Boolean).map((line, i) => {
      const [fullName, className, fee] = line.split(',').map((x) => x.trim())
      return {
        fullName: fullName ?? '',
        className: className ?? '',
        feeMode: 'per_session' as const,
        fee: Number(fee) || CONFIG.defaultFee,
        startDate: localTodayISO(),
        sortOrder: 100 + i,
      }
    }).filter((s) => s.fullName)
    if (list.length === 0) { toast.error(t('importError')); return }
    addStudentsBulk(list)
    toast.success(t('imported'))
    setText('')
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline">{t('bulkImport')}</Button>} />
      <DialogContent>
        <DialogHeader><DialogTitle>{t('bulkImport')}</DialogTitle></DialogHeader>
        <textarea
          className="min-h-40 w-full rounded-md border p-2 text-sm"
          placeholder={t('bulkPlaceholder')}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>{tc('cancel')}</Button>
          <Button onClick={submit}>{tc('save')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
