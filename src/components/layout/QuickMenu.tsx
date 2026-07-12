'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

type MenuAction = { type: 'nav'; href: string } | { type: 'toast'; message: string }
type MenuItem = { icon: string; label: string; action: MenuAction }
type MenuGroup = { icon: string; label: string; items: MenuItem[] }

const MENU_GROUPS: MenuGroup[] = [
  {
    icon: '📊', label: 'BẢNG & THỐNG KÊ',
    items: [
      { icon: '📋', label: 'Xem Điểm Danh Tháng', action: { type: 'nav', href: '/attendance' } },
      { icon: '💳', label: 'Quản lý Thu nợ', action: { type: 'nav', href: '/debts' } },
      { icon: '💰', label: 'Bảng phụ phí', action: { type: 'nav', href: '/extra-fees' } },
      { icon: '📊', label: 'Xuất Excel', action: { type: 'nav', href: '/summary' } },
      { icon: '📋', label: 'Bảng tổng hợp', action: { type: 'nav', href: '/summary' } },
    ],
  },
  {
    icon: '🔧', label: 'QUẢN LÝ',
    items: [
      { icon: '👶', label: 'Quản lý học sinh', action: { type: 'nav', href: '/students' } },
      { icon: '📋', label: 'Điểm danh hàng loạt', action: { type: 'nav', href: '/attendance' } },
      { icon: '⚙️', label: 'Thiết lập trung tâm', action: { type: 'nav', href: '/settings' } },
    ],
  },
  {
    icon: '🎨', label: 'CẤU HÌNH GIAO DIỆN',
    items: [
      { icon: '🎨', label: 'Giao diện phiếu', action: { type: 'toast', message: 'Mở phiếu bất kỳ (nút 🧾 Phiếu) để đổi giao diện' } },
    ],
  },
]

export function QuickMenu() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [openGroups, setOpenGroups] = useState<number[]>([0])
  const [hidden, setHidden] = useState(false)
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{ startX: number; startY: number; moved: boolean } | null>(null)

  useEffect(() => {
    if (!open) return
    function onDocClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  // Đọc vị trí đã lưu SAU mount (localStorage không có ở SSR → tránh hydration mismatch).
  // set-state-in-effect là chủ ý ở đây: sync-once từ external store (localStorage) sau khi mount.
  useEffect(() => {
    try {
      const raw = localStorage.getItem('qlhs_quickmenu_pos')
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setPos(JSON.parse(raw))
    } catch {}
  }, [])

  function onPointerDown(e: React.PointerEvent) {
    dragRef.current = { startX: e.clientX, startY: e.clientY, moved: false }
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }
  function onPointerMove(e: React.PointerEvent) {
    const d = dragRef.current
    if (!d) return
    if (Math.abs(e.clientX - d.startX) > 5 || Math.abs(e.clientY - d.startY) > 5) d.moved = true
    if (d.moved) {
      const x = Math.min(window.innerWidth - 60, Math.max(4, e.clientX - 28))
      const y = Math.min(window.innerHeight - 60, Math.max(4, e.clientY - 28))
      setPos({ x, y })
    }
  }
  function onPointerUp() {
    const d = dragRef.current
    dragRef.current = null
    if (d && d.moved) {
      setPos((p) => {
        if (p) localStorage.setItem('qlhs_quickmenu_pos', JSON.stringify(p))
        return p
      })
    } else {
      setOpen((o) => !o) // không kéo = click = toggle panel
    }
  }

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

  if (hidden) return null

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
            onClick={() => { setHidden(true); setOpen(false) }}
            className="flex w-full items-center gap-2 bg-[#faf3fb] px-[18px] py-3 text-left text-[13px] font-bold text-[#9333ea] hover:bg-[#f5e9f7]"
          >
            👁️ Ẩn menu nổi
          </button>
        </div>
      )}
      <button
        type="button"
        aria-label="Quick Menu"
        aria-haspopup="menu"
        aria-expanded={open}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        style={pos ? { left: pos.x, top: pos.y, right: 'auto', bottom: 'auto' } : undefined}
        className="fixed bottom-[90px] right-6 z-50 grid h-14 w-14 cursor-grab touch-none place-items-center rounded-full border-[3px] border-white/85 bg-gradient-to-br from-purple-500 to-[#c2185b] text-2xl text-white shadow-[0_8px_24px_rgba(168,85,247,0.4)] active:cursor-grabbing"
      >
        ⚡
      </button>
    </div>
  )
}
