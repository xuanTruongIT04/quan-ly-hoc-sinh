export type ThemeId = 'default' | 'ocean' | 'lavender' | 'strawberry' | 'luxury'

export interface ReceiptTheme {
  id: ThemeId
  name: string
  emoji: string
  cardBg: string // nền card
  accentText: string // chữ nhấn (tiêu đề, tổng)
  subText: string // chữ phụ (nhãn trường)
  badgeBg: string // nền badge ngày đi học
  totalBg: string // nền khối TỔNG
  border: string // viền phân cách
}

export const RECEIPT_THEMES: ReceiptTheme[] = [
  {
    id: 'default', name: 'Mặc Định', emoji: '🌿',
    cardBg: 'bg-gradient-to-b from-green-50 to-emerald-50', accentText: 'text-emerald-600',
    subText: 'text-gray-500', badgeBg: 'bg-emerald-100', totalBg: 'bg-white/70', border: 'border-emerald-200',
  },
  {
    id: 'ocean', name: 'Đại Dương', emoji: '🌊',
    cardBg: 'bg-gradient-to-b from-sky-50 to-blue-50', accentText: 'text-blue-600',
    subText: 'text-gray-500', badgeBg: 'bg-sky-100', totalBg: 'bg-white/70', border: 'border-sky-200',
  },
  {
    id: 'lavender', name: 'Oải Hương', emoji: '🌸',
    cardBg: 'bg-gradient-to-b from-purple-50 to-violet-50', accentText: 'text-violet-600',
    subText: 'text-gray-500', badgeBg: 'bg-violet-100', totalBg: 'bg-white/70', border: 'border-violet-200',
  },
  {
    id: 'strawberry', name: 'Dâu Tây', emoji: '🍭',
    cardBg: 'bg-gradient-to-b from-pink-50 to-purple-50', accentText: 'text-pink-600',
    subText: 'text-gray-500', badgeBg: 'bg-purple-100', totalBg: 'bg-white/70', border: 'border-pink-200',
  },
  {
    id: 'luxury', name: 'Sang Trọng', emoji: '✨',
    cardBg: 'bg-gradient-to-b from-amber-50 to-yellow-50', accentText: 'text-amber-700',
    subText: 'text-gray-600', badgeBg: 'bg-amber-100', totalBg: 'bg-white/80', border: 'border-amber-300',
  },
]

export function getTheme(id: ThemeId): ReceiptTheme {
  return RECEIPT_THEMES.find((t) => t.id === id) ?? RECEIPT_THEMES[0]
}
