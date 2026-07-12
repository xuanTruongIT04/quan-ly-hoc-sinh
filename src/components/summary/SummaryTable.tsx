'use client'
import { useAppStore } from '@/store/useAppStore'
import { usePeriodStore } from '@/store/usePeriodStore'
import { receiptTotal } from '@/lib/fees'
import { formatPrice } from '@/lib/utils'
import { exportSummaryXlsx } from '@/lib/export-excel'
import { toast } from 'sonner'
import { MonthYearPicker } from '@/components/dashboard/MonthYearPicker'

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1)

export function SummaryTable() {
  const { students, attendance, getExtraFee } = useAppStore()
  const { year, month } = usePeriodStore()

  const sorted = [...students].sort((a, b) => a.sortOrder - b.sortOrder)
  const cell = (id: string, m: number) => {
    const s = students.find((x) => x.id === id)!
    return receiptTotal(s, attendance, getExtraFee(id, year, m), year, m)
  }

  // ma trận + tổng
  const rows = sorted.map((s) => {
    const months = MONTHS.map((m) => cell(s.id, m))
    return { s, months, yearTotal: months.reduce((a, b) => a + b, 0) }
  })
  const colTotals = MONTHS.map((_, i) => rows.reduce((sum, r) => sum + r.months[i], 0))
  const grandTotal = colTotals.reduce((a, b) => a + b, 0)

  const money = (n: number) => (n > 0 ? formatPrice(n) : '—')

  if (students.length === 0) {
    return <div className="candy-card p-8 text-center text-[#8d6e63]">Chưa có học sinh nào.</div>
  }

  function onExport() {
    exportSummaryXlsx(students, attendance, getExtraFee, year)
    toast.success(`Đã xuất bảng tổng hợp ${year} ra Excel 📊`)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <MonthYearPicker />
        <button type="button" className="candy-btn" onClick={onExport}>📊 Xuất Excel</button>
      </div>
      <div className="overflow-x-auto rounded-[28px] border border-[#fbdce7] bg-white shadow-[0_8px_22px_rgba(216,27,96,0.12)]">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 bg-[#f8bbd0] px-4 py-4 text-left text-xs font-extrabold uppercase tracking-wide text-[#c2185b]">Học sinh</th>
              {MONTHS.map((m) => (
                <th key={m} className={`px-3 py-4 text-right text-xs font-extrabold uppercase text-[#c2185b] ${m === month ? 'bg-[#fbc4dc]' : 'bg-[#fce4ec]'}`}>T{m}</th>
              ))}
              <th className="px-4 py-4 text-right text-xs font-extrabold uppercase text-[#c2185b] bg-[#f8bbd0]">Tổng năm</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ s, months, yearTotal }, ri) => (
              <tr key={s.id} className={ri % 2 === 1 ? 'bg-[#fff9fb]' : ''}>
                <td className={`sticky left-0 z-10 border-t border-[#fbe4ee] px-4 py-3 font-bold text-[#4e342e] ${ri % 2 === 1 ? 'bg-[#fff9fb]' : 'bg-white'}`}>{s.fullName}</td>
                {months.map((v, mi) => (
                  <td key={mi} className={`border-t border-[#fbe4ee] px-3 py-3 text-right font-bold ${MONTHS[mi] === month ? 'bg-[#fff0f5]' : ''} ${v > 0 ? 'text-[#4e342e]' : 'text-[#d4b8c4]'}`}>{money(v)}</td>
                ))}
                <td className="border-t border-[#fbe4ee] px-4 py-3 text-right font-extrabold text-[#c2185b]">{money(yearTotal)}</td>
              </tr>
            ))}
            <tr className="bg-[#fce4ec]">
              <td className="sticky left-0 z-10 border-t-2 border-[#f7a8c4] bg-[#fce4ec] px-4 py-3 font-heading font-bold text-[#c2185b]">TỔNG LỚP</td>
              {colTotals.map((v, i) => (
                <td key={i} className="border-t-2 border-[#f7a8c4] px-3 py-3 text-right font-extrabold text-[#c2185b]">{money(v)}</td>
              ))}
              <td className="border-t-2 border-[#f7a8c4] px-4 py-3 text-right font-extrabold text-[#c2185b]">{money(grandTotal)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
