import { DebtsBoard } from '@/components/debts/DebtsBoard'

export default function DebtsPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold text-[#c2185b]">💳 Quản lý thu nợ</h1>
      <DebtsBoard />
    </div>
  )
}
