'use client'
import { usePeriodStore } from '@/store/usePeriodStore'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const YEARS = [2026, 2027, 2028]
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1)

export function MonthYearPicker() {
  const { year, month, setYear, setMonth } = usePeriodStore()
  return (
    <div className="flex gap-2">
      <Select value={String(month)} onValueChange={(v) => v && setMonth(Number(v))}>
        <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
        <SelectContent>
          {MONTHS.map((m) => <SelectItem key={m} value={String(m)}>Tháng {m}</SelectItem>)}
        </SelectContent>
      </Select>
      <Select value={String(year)} onValueChange={(v) => v && setYear(Number(v))}>
        <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
        <SelectContent>
          {YEARS.map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  )
}
