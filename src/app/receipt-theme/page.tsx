import { ThemeChooser } from '@/components/receipt-theme/ThemeChooser'

export default function ReceiptThemePage() {
  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold text-[#c2185b]">🎨 Giao diện phiếu</h1>
      <ThemeChooser />
    </div>
  )
}
