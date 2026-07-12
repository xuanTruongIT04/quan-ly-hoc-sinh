'use client'
import { useState } from 'react'
import { toast } from 'sonner'
import { useAppStore } from '@/store/useAppStore'
import { usePeriodStore } from '@/store/usePeriodStore'
import { formatPrice } from '@/lib/utils'
import { MonthYearPicker } from '@/components/dashboard/MonthYearPicker'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { Student } from '@/types'

function ExtraFeeRow({ student, year, month }: { student: Student; year: number; month: number }) {
  const { getExtraFee, setExtraFee } = useAppStore()
  const initial = getExtraFee(student.id, year, month)
  const [amount, setAmount] = useState(initial.amount)
  const [note, setNote] = useState(initial.note)

  function save() {
    const amt = Number.isFinite(amount) && amount > 0 ? amount : 0
    setAmount(amt)
    setExtraFee(student.id, year, month, amt, note)
    toast.success(`Đã lưu phụ phí cho ${student.fullName}`)
  }

  return (
    <TableRow>
      <TableCell className="font-bold">{student.fullName}</TableCell>
      <TableCell><span className="candy-pill">{student.className}</span></TableCell>
      <TableCell>
        <input type="number" min={0} className="candy-input w-32" value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
      </TableCell>
      <TableCell>
        <input type="text" className="candy-input w-full" placeholder="Ghi chú (VD: tiền tài liệu)" value={note} onChange={(e) => setNote(e.target.value)} />
      </TableCell>
      <TableCell className="text-right">
        <button type="button" className="candy-btn text-xs" onClick={save}>💾 Lưu</button>
      </TableCell>
    </TableRow>
  )
}

export function ExtraFeesTable() {
  const { students, getExtraFee } = useAppStore()
  const { year, month } = usePeriodStore()

  const sorted = [...students].sort((a, b) => a.sortOrder - b.sortOrder)
  const totalExtra = sorted.reduce((sum, s) => sum + getExtraFee(s.id, year, month).amount, 0)

  if (students.length === 0) {
    return <div className="candy-card p-8 text-center text-[#8d6e63]">Chưa có học sinh nào.</div>
  }

  return (
    <div className="space-y-4">
      <MonthYearPicker />
      <div className="candy-card max-w-xs">
        <div className="text-xs font-semibold text-[#8d6e63]">💰 Tổng phụ phí tháng</div>
        <div className="mt-1 font-heading text-2xl font-bold text-[#c2185b]">{formatPrice(totalExtra)}</div>
      </div>
      <div className="candy-table">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Học sinh</TableHead>
              <TableHead>Lớp</TableHead>
              <TableHead>Phụ phí (VND)</TableHead>
              <TableHead>Ghi chú</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((s) => (
              <ExtraFeeRow key={`${s.id}:${year}-${month}`} student={s} year={year} month={month} />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
