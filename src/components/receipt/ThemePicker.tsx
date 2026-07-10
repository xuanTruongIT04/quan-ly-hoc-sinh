'use client'
import { useAppStore } from '@/store/useAppStore'
import { RECEIPT_THEMES } from '@/lib/receipt-themes'
import { cn } from '@/lib/utils'

export function ThemePicker() {
  const { receiptTheme, setReceiptTheme } = useAppStore()
  return (
    <div className="flex flex-wrap gap-1">
      {RECEIPT_THEMES.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => setReceiptTheme(t.id)}
          className={cn(
            'rounded-full border px-2 py-1 text-xs transition-colors',
            receiptTheme === t.id ? `${t.border} ${t.badgeBg} font-semibold` : 'border-[#fbdce7] hover:bg-[#fff0f5]',
          )}
        >
          {t.emoji} {t.name}
        </button>
      ))}
    </div>
  )
}
