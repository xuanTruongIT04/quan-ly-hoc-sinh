'use client'
import { useState } from 'react'
import { toast } from 'sonner'
import { useAppStore } from '@/store/useAppStore'
import { usePeriodStore } from '@/store/usePeriodStore'
import { receiptTotal } from '@/lib/fees'
import { formatPrice } from '@/lib/utils'
import { MonthYearPicker } from '@/components/dashboard/MonthYearPicker'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

type Filter = 'all' | 'unpaid' | 'paid'

export function DebtsBoard() {
  const { students, attendance, getExtraFee, isPaid, setPaid } = useAppStore()
  const { year, month } = usePeriodStore()
  const [filter, setFilter] = useState<Filter>('all')

  const rows = students
    .map((s) => ({
      s,
      total: receiptTotal(s, attendance, getExtraFee(s.id, year, month), year, month),
      paid: isPaid(s.id, year, month),
    }))
    .filter((r) => r.total > 0)
    .sort((a, b) => a.s.sortOrder - b.s.sortOrder)

  const collected = rows.filter((r) => r.paid).reduce((sum, r) => sum + r.total, 0)
  const owed = rows.filter((r) => !r.paid).reduce((sum, r) => sum + r.total, 0)
  const paidCount = rows.filter((r) => r.paid).length
  const ratio = rows.length > 0 ? Math.round((paidCount / rows.length) * 100) : 0

  const shown = rows.filter((r) => (filter === 'all' ? true : filter === 'paid' ? r.paid : !r.paid))

  function toggle(id: string, next: boolean) {
    setPaid(id, year, month, next)
    toast.success(next ? 'Đã đánh dấu ĐÃ TRẢ' : 'Đã đánh dấu CHƯA TRẢ')
  }

  return (
    <div className="space-y-4">
      <MonthYearPicker />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="candy-card">
          <div className="text-xs font-semibold text-[#8d6e63]">💰 Đã thu</div>
          <div className="mt-1 font-heading text-2xl font-bold text-[#22a06b]">{formatPrice(collected)}</div>
        </div>
        <div className="candy-card">
          <div className="text-xs font-semibold text-[#8d6e63]">⚠️ Còn nợ</div>
          <div className="mt-1 font-heading text-2xl font-bold text-[#e11d48]">{formatPrice(owed)}</div>
        </div>
        <div className="candy-card">
          <div className="text-xs font-semibold text-[#8d6e63]">✅ Tỉ lệ đã trả</div>
          <div className="mt-1 font-heading text-2xl font-bold text-[#c2185b]">{ratio}% <span className="text-sm font-bold text-[#8d6e63]">({paidCount}/{rows.length})</span></div>
        </div>
      </div>

      <div className="flex gap-2">
        {([['all', 'Tất cả'], ['unpaid', 'Chỉ còn nợ'], ['paid', 'Chỉ đã trả']] as [Filter, string][]).map(([f, label]) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={filter === f ? 'candy-btn' : 'candy-btn-outline'}
          >
            {label}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <div className="candy-card p-8 text-center text-[#8d6e63]">Không có học sinh nào trong mục này.</div>
      ) : (
        <div className="candy-table">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Học sinh</TableHead>
                <TableHead>Lớp</TableHead>
                <TableHead className="text-right">Học phí tháng</TableHead>
                <TableHead className="text-center">Trạng thái</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shown.map(({ s, total, paid }) => (
                <TableRow key={s.id}>
                  <TableCell className="font-bold">{s.fullName}</TableCell>
                  <TableCell><span className="candy-pill">{s.className}</span></TableCell>
                  <TableCell className="text-right font-extrabold text-[#c2185b]">{formatPrice(total)}</TableCell>
                  <TableCell className="text-center">
                    {paid ? (
                      <span className="inline-flex items-center rounded-full bg-[#dcfce7] px-3 py-1 text-xs font-bold text-[#15803d]">✓ Đã trả</span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-[#fee2e2] px-3 py-1 text-xs font-bold text-[#b91c1c]">⚠️ Còn nợ</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <button
                      type="button"
                      onClick={() => toggle(s.id, !paid)}
                      className={paid ? 'candy-btn-outline text-xs' : 'candy-btn text-xs'}
                    >
                      {paid ? 'Bỏ đánh dấu' : 'Đánh dấu đã trả'}
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
