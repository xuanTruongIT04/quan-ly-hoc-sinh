'use client'
import { useRef, useState } from 'react'
import html2canvas from 'html2canvas'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import { useAppStore } from '@/store/useAppStore'
import { ReceiptCard } from './ReceiptCard'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1)
const YEARS = [2026, 2027, 2028]

export function ReceiptDialog({
  studentId,
  defaultYear,
  defaultMonth,
  trigger,
}: {
  studentId: string
  defaultYear: number
  defaultMonth: number
  trigger: React.ReactElement
}) {
  const t = useTranslations('receipt')
  const { students, setComment, getComment } = useAppStore()
  const [open, setOpen] = useState(false)
  const [year, setYear] = useState(defaultYear)
  const [month, setMonth] = useState(defaultMonth)
  const [comment, setLocalComment] = useState('')
  const cardRef = useRef<HTMLDivElement>(null)
  const student = students.find((s) => s.id === studentId)

  function syncComment(y: number, m: number) {
    setLocalComment(getComment(studentId, y, m))
  }

  function onOpenChange(o: boolean) {
    setOpen(o)
    if (o) syncComment(year, month)
  }

  function save() {
    setComment(studentId, year, month, comment)
    toast.success(t('saveComment'))
  }

  async function download() {
    if (!cardRef.current) return
    const canvas = await html2canvas(cardRef.current, { backgroundColor: null, scale: 2 })
    const link = document.createElement('a')
    link.download = `phieu-hoc-phi-${student?.fullName ?? 'hs'}-${year}-${String(month).padStart(2, '0')}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger render={trigger} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t('title')} — {student?.fullName}
          </DialogTitle>
        </DialogHeader>
        <div className="flex gap-2">
          <Select
            value={String(month)}
            onValueChange={(v) => {
              if (v) {
                setMonth(Number(v))
                syncComment(year, Number(v))
              }
            }}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((m) => (
                <SelectItem key={m} value={String(m)}>
                  Tháng {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={String(year)}
            onValueChange={(v) => {
              if (v) {
                setYear(Number(v))
                syncComment(Number(v), month)
              }
            }}
          >
            <SelectTrigger className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {YEARS.map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="max-h-[60vh] overflow-auto py-2">
          <ReceiptCard ref={cardRef} studentId={studentId} year={year} month={month} comment={comment} />
        </div>
        <textarea
          className="min-h-16 w-full rounded-md border p-2 text-sm"
          placeholder={t('commentPlaceholder')}
          value={comment}
          onChange={(e) => setLocalComment(e.target.value)}
        />
        <DialogFooter>
          <Button variant="outline" onClick={save}>
            ✨ {t('saveComment')}
          </Button>
          <Button onClick={download}>{t('download')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
