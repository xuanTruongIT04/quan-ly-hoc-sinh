'use client'
import { useState } from 'react'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import { useAppStore } from '@/store/useAppStore'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

// Điểm danh hàng loạt: nhập nhiều ngày (mỗi dòng 1 ngày yyyy-mm-dd), đánh 'present' cho cả lớp.
export function BulkAttendanceDialog({ className, studentIds }: { className: string; studentIds: string[] }) {
  const t = useTranslations('attendance')
  const tc = useTranslations('common')
  const { markClassPresent } = useAppStore()
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')

  function submit() {
    const dates = text.split('\n').map((x) => x.trim()).filter((x) => /^\d{4}-\d{2}-\d{2}$/.test(x))
    if (dates.length === 0) { toast.error('Nhập ngày dạng yyyy-mm-dd'); return }
    dates.forEach((d) => markClassPresent(studentIds, d))
    toast.success(t('saved'))
    setText('')
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline">{t('bulk')}</Button>} />
      <DialogContent>
        <DialogHeader><DialogTitle>{t('bulk')} — {className}</DialogTitle></DialogHeader>
        <textarea
          className="min-h-40 w-full rounded-md border p-2 text-sm"
          placeholder={'2026-07-02\n2026-07-04\n2026-07-06'}
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
