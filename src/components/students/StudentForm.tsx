'use client'
import { useEffect, useState } from 'react'
import { z } from 'zod'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import { useAppStore } from '@/store/useAppStore'
import { CONFIG } from '@/lib/config'
import { localTodayISO } from '@/lib/utils'
import type { Student, FeeMode } from '@/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const schema = z.object({
  fullName: z.string().min(1, 'Nhập họ tên'),
  className: z.string().min(1, 'Nhập lớp'),
  feeMode: z.enum(['per_session', 'fixed_monthly']),
  fee: z.number().nonnegative(),
  fee2: z.number().nonnegative().optional(),
  startDate: z.string().min(1),
  sortOrder: z.number(),
})

export function StudentForm({ editing, trigger }: { editing?: Student; trigger: React.ReactElement }) {
  const t = useTranslations('students')
  const { addStudent, updateStudent, classNames } = useAppStore()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    fullName: editing?.fullName ?? '',
    className: editing?.className ?? '',
    feeMode: (editing?.feeMode ?? 'per_session') as FeeMode,
    fee: editing?.fee ?? CONFIG.defaultFee,
    fee2: editing?.fee2 ?? 0,
    startDate: editing?.startDate ?? localTodayISO(),
    sortOrder: editing?.sortOrder ?? 999,
  })

  useEffect(() => {
    if (open) {
      const newForm = {
        fullName: editing?.fullName ?? '',
        className: editing?.className ?? '',
        feeMode: (editing?.feeMode ?? 'per_session') as FeeMode,
        fee: editing?.fee ?? CONFIG.defaultFee,
        fee2: editing?.fee2 ?? 0,
        startDate: editing?.startDate ?? localTodayISO(),
        sortOrder: editing?.sortOrder ?? 999,
      }
      if (JSON.stringify(form) !== JSON.stringify(newForm)) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setForm(newForm)
      }
    }
  }, [open, editing, form])

  function submit() {
    const parsed = schema.safeParse(form)
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return }
    if (editing) updateStudent(editing.id, parsed.data)
    else addStudent(parsed.data)
    toast.success(t('saved'))
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent>
        <DialogHeader><DialogTitle>{editing ? t('edit') : t('add')}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label>{t('fullName')}</Label><Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} /></div>
          <div>
            <Label>{t('className')}</Label>
            <Input list="class-suggestions" value={form.className} onChange={(e) => setForm({ ...form, className: e.target.value })} />
            <datalist id="class-suggestions">{classNames().map((c) => <option key={c} value={c} />)}</datalist>
          </div>
          <div>
            <Label>{t('feeMode')}</Label>
            <Select value={form.feeMode} onValueChange={(v) => v && setForm({ ...form, feeMode: v as FeeMode })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="per_session">{t('perSession')}</SelectItem>
                <SelectItem value="fixed_monthly">{t('fixedMonthly')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div><Label>{t('fee')}</Label><Input type="number" value={form.fee} onChange={(e) => setForm({ ...form, fee: Number(e.target.value) })} /></div>
          <div><Label>{t('fee2')}</Label><Input type="number" value={form.fee2} onChange={(e) => setForm({ ...form, fee2: Number(e.target.value) })} /></div>
          <div><Label>{t('startDate')}</Label><Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></div>
          <div><Label>{t('sortOrder')}</Label><Input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Hủy</Button>
          <Button onClick={submit}>Lưu</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
