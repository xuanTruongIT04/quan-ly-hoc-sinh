import { ExtraFeesTable } from '@/components/extra-fees/ExtraFeesTable'

export default function ExtraFeesPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold text-[#c2185b]">💰 Bảng phụ phí</h1>
      <ExtraFeesTable />
    </div>
  )
}
