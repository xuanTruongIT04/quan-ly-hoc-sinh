export interface NavItem { href: string; labelKey: string; icon: string }

// Chỉ 3 mục Phase 1. Phiếu học phí/nhận xét/lịch dạy: Phase 2/3.
export const NAV_ITEMS: NavItem[] = [
  { href: '/', labelKey: 'nav.dashboard', icon: '📊' },
  { href: '/students', labelKey: 'nav.students', icon: '🎓' },
  { href: '/attendance', labelKey: 'nav.attendance', icon: '📅' },
]
