'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

type MenuAction = { type: 'nav'; href: string } | { type: 'toast'; message: string }
type MenuItem = { icon: string; label: string; action: MenuAction }
type MenuGroup = { icon: string; label: string; items: MenuItem[] }

const SOON = 'Tính năng đang phát triển 🚧'

const MENU_GROUPS: MenuGroup[] = [
  {
    icon: '📊', label: 'BẢNG & THỐNG KÊ',
    items: [
      { icon: '📋', label: 'Xem Điểm Danh Tháng', action: { type: 'nav', href: '/attendance' } },
      { icon: '💳', label: 'Quản lý Thu nợ', action: { type: 'toast', message: SOON } },
      { icon: '💰', label: 'Bảng phụ phí', action: { type: 'toast', message: SOON } },
      { icon: '📊', label: 'Xuất Excel', action: { type: 'toast', message: SOON } },
      { icon: '📋', label: 'Bảng tổng hợp', action: { type: 'nav', href: '/' } },
    ],
  },
  {
    icon: '🔧', label: 'QUẢN LÝ',
    items: [
      { icon: '👶', label: 'Quản lý học sinh', action: { type: 'nav', href: '/students' } },
      { icon: '📋', label: 'Điểm danh hàng loạt', action: { type: 'nav', href: '/attendance' } },
      { icon: '☑️', label: 'Chấm công GV', action: { type: 'toast', message: SOON } },
      { icon: '⚙️', label: 'Thiết lập trung tâm', action: { type: 'toast', message: SOON } },
      { icon: '🛡️', label: 'Quản trị tài khoản', action: { type: 'toast', message: SOON } },
    ],
  },
  {
    icon: '🎨', label: 'CẤU HÌNH GIAO DIỆN',
    items: [
      { icon: '🎨', label: 'Giao diện phiếu', action: { type: 'toast', message: 'Mở phiếu bất kỳ (nút 🧾 Phiếu) để đổi giao diện' } },
    ],
  },
  {
    icon: '📖', label: 'HƯỚNG DẪN & HỖ TRỢ',
    items: [
      { icon: '🚀', label: 'Tính năng hệ thống', action: { type: 'toast', message: SOON } },
      { icon: '🎬', label: 'Xem hướng dẫn', action: { type: 'toast', message: SOON } },
      { icon: '💬', label: 'Zalo hỗ trợ', action: { type: 'toast', message: SOON } },
    ],
  },
]

export function QuickMenu() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [openGroups, setOpenGroups] = useState<number[]>([0])
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onDocClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [open])

  function toggleGroup(i: number) {
    setOpenGroups((g) => (g.includes(i) ? g.filter((x) => x !== i) : [...g, i]))
  }
  function runAction(a: MenuAction) {
    if (a.type === 'nav') {
      router.push(a.href)
      setOpen(false)
    } else {
      toast.info(a.message)
    }
  }

  return (
    <div ref={rootRef}>
      {open && (
        <div className="fixed bottom-[90px] right-6 z-40 w-[290px] overflow-hidden rounded-[22px] bg-white shadow-[0_14px_40px_rgba(120,40,140,0.28)]">
          <div className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-fuchsia-600 px-[18px] py-[14px] font-heading text-[15px] font-bold text-white">
            ⚡ QUICK MENU
          </div>
          {MENU_GROUPS.map((grp, i) => {
            const isOpen = openGroups.includes(i)
            return (
              <div key={grp.label} className="border-b border-[#f3e4f0]">
                <button
                  type="button"
                  onClick={() => toggleGroup(i)}
                  className="flex w-full items-center gap-2 bg-[#faf3fb] px-[18px] py-[13px] text-left text-[13.5px] font-extrabold text-[#7b2a86] hover:bg-[#f5e9f7]"
                >
                  <span className="text-base">{grp.icon}</span>
                  <span className="flex-1">{grp.label}</span>
                  <span className="grid h-[22px] min-w-[22px] place-items-center rounded-full bg-[#e9d5f5] px-1.5 text-xs font-extrabold text-[#9333ea]">
                    {grp.items.length}
                  </span>
                  <span className={`text-xs text-[#b07bc0] transition-transform ${isOpen ? 'rotate-90' : ''}`}>▸</span>
                </button>
                {isOpen && (
                  <div className="bg-white">
                    {grp.items.map((it) => (
                      <button
                        key={it.label}
                        type="button"
                        onClick={() => runAction(it.action)}
                        className="flex w-full items-center gap-2.5 px-[18px] py-[11px] pl-[30px] text-left text-[13px] font-bold text-[#4e342e] hover:bg-[#fdf2fb] hover:text-[#c2185b]"
                      >
                        <span className="w-[18px] text-[15px]">{it.icon}</span>
                        {it.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
          <button
            type="button"
            className="flex w-full items-center gap-2 bg-[#faf3fb] px-[18px] py-3 text-left text-[13px] font-bold text-[#9333ea] hover:bg-[#f5e9f7]"
          >
            👁️ Ẩn menu nổi
          </button>
        </div>
      )}
      <button
        type="button"
        aria-label="Quick Menu"
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-[90px] right-6 z-50 grid h-14 w-14 place-items-center rounded-full border-[3px] border-white/85 bg-gradient-to-br from-purple-500 to-[#c2185b] text-2xl text-white shadow-[0_8px_24px_rgba(168,85,247,0.4)]"
      >
        ⚡
      </button>
    </div>
  )
}
