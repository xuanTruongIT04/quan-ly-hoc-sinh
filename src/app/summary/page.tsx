import { SummaryTable } from '@/components/summary/SummaryTable'

export default function SummaryPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold text-[#c2185b]">📋 Bảng tổng hợp</h1>
      <SummaryTable />
    </div>
  )
}
