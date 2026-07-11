# QUICK MENU nổi — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Thêm QUICK MENU nổi (nút ⚡ kéo được + panel accordion tím 4 nhóm, 14 mục) giống phieuhocphi, hiện ở mọi trang.

**Architecture:** Một client component `QuickMenu.tsx` gắn vào `layout.tsx`. State cục bộ (useState): panel open, nhóm nào bung, đã ẩn, vị trí nút. Data menu là hằng số trong file. Nav dùng `useRouter`, toast dùng Sonner. Drag bằng pointer events, lưu vị trí localStorage.

**Tech Stack:** Next.js 16 App Router + React 19 + TS, Tailwind v4, next/navigation, sonner.

## Global Constraints

- CHỈ THÊM UI — KHÔNG đổi `src/types/`, `src/store/`, `src/lib/fees.ts`, `src/lib/stats.ts`, `src/lib/repositories/`, các trang/sidebar hiện có.
- KHÔNG phá 71 test. UI work → verify bằng Chrome DevTools MCP, KHÔNG bắt buộc unit test mới.
- Client component `'use client'`; đọc localStorage trong `useEffect` (sau mount) tránh hydration mismatch.
- Route/file/identifier tiếng Anh; UI + toast tiếng Việt.
- Giống gốc 100%: KHÔNG thêm nhãn "→/sắp có" trên item.
- Vị trí nút lưu key `qlhs_quickmenu_pos`. "Ẩn menu nổi" KHÔNG lưu localStorage (reload hiện lại).
- Mỗi task: verify Chrome (console sạch + đúng hành vi) → `npm test` (71 pass) → `tsc` + `lint` sạch → commit. Commit `Co-Authored-By: Claude Opus 4.8`.
- Mockup tham chiếu đã duyệt: `scratchpad/mockup-quickmenu.html`.

---

## Task 1: Component khung tĩnh + data + gắn layout

**Files:**
- Create: `src/components/layout/QuickMenu.tsx`
- Modify: `src/app/layout.tsx` (thêm import + `<QuickMenu />`)

**Interfaces:**
- Produces: component `QuickMenu` (default-less named export `export function QuickMenu()`); hằng `MENU_GROUPS` nội bộ.

- [ ] **Step 1: Tạo `QuickMenu.tsx` — data + panel tĩnh (mở sẵn để dựng UI)**

```tsx
'use client'
import { useState } from 'react'
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
  const [open, setOpen] = useState(true) // TẠM true để dựng UI; Task 2 đổi về false
  const [openGroups, setOpenGroups] = useState<number[]>([0])

  function toggleGroup(i: number) {
    setOpenGroups((g) => (g.includes(i) ? g.filter((x) => x !== i) : [...g, i]))
  }
  function runAction(a: MenuAction) {
    if (a.type === 'nav') { router.push(a.href); setOpen(false) }
    else toast.info(a.message)
  }

  return (
    <>
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
                  <span className="grid h-[22px] min-w-[22px] place-items-center rounded-full bg-[#e9d5f5] px-1.5 text-xs font-extrabold text-[#9333ea]">{grp.items.length}</span>
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
          <button type="button" className="flex w-full items-center gap-2 bg-[#faf3fb] px-[18px] py-3 text-left text-[13px] font-bold text-[#9333ea] hover:bg-[#f5e9f7]">
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
    </>
  )
}
```

- [ ] **Step 2: Gắn `<QuickMenu />` vào `layout.tsx`**

Thêm import (cạnh import AppSidebar):

```tsx
import { QuickMenu } from "@/components/layout/QuickMenu";
```

Thêm `<QuickMenu />` trong `StoreHydration`, ngay trước `</StoreHydration>` (sau `<div className="flex min-h-screen flex-1">...</div>`):

```tsx
          <StoreHydration>
            <div className="flex min-h-screen flex-1">
              <AppSidebar />
              <main className="flex-1 p-6">{children}</main>
            </div>
            <QuickMenu />
          </StoreHydration>
```

- [ ] **Step 3: Verify khung tĩnh qua Chrome**

Run: `npm run dev` (nếu chưa chạy) → Chrome DevTools MCP:
- `navigate_page` → `http://localhost:3000`
- `evaluate_script`: `await document.fonts.load("700 15px Comfortaa"); await document.fonts.ready; return true`
- `take_screenshot` → panel tím góc phải hiện đủ 4 nhóm + badge (5/5/1/3); nhóm đầu bung 5 mục; nút ⚡; so mockup `scratchpad/mockup-quickmenu.html`
- Click nhóm "QUẢN LÝ" (bằng click uid) → bung 5 mục
- `list_console_messages` → KHÔNG có error/warning

Run: `npx tsc --noEmit` → no errors. `npm run lint` → clean. `npm test` → 71 pass.

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/QuickMenu.tsx src/app/layout.tsx
git commit -m "feat(ui): QuickMenu — khung panel accordion tím + 4 nhóm 14 mục + gắn layout

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 2: Hành vi — panel đóng mặc định + nav + toast + đóng khi click ngoài

**Files:**
- Modify: `src/components/layout/QuickMenu.tsx`

**Interfaces:**
- Consumes: `QuickMenu`, `runAction`, `open` state (Task 1).
- Produces: panel mặc định đóng; click ngoài đóng panel.

- [ ] **Step 1: Đổi panel mặc định ĐÓNG + đóng khi click ngoài**

Đổi dòng `const [open, setOpen] = useState(true)` → `false`.

Thêm `useRef` + `useEffect` bắt click ngoài. Thêm import: `import { useState, useRef, useEffect } from 'react'`. Bọc toàn bộ 2 phần tử (panel + nút ⚡) trong 1 `<div ref={rootRef}>` KHÔNG có class layout (chỉ để bắt DOM). Thêm:

```tsx
  const rootRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    function onDocClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [open])
```

Đổi `return (<>...</>)` thành `return (<div ref={rootRef}>...</div>)` — bọc cả panel lẫn nút. Lưu ý: `<div>` bọc này KHÔNG cần class (các con đã `fixed`).

- [ ] **Step 2: Verify hành vi**

Chrome:
- `navigate_page` reload → panel ẩn, chỉ thấy nút ⚡ (`take_screenshot`)
- Click nút ⚡ (uid) → panel mở; click nút ⚡ lần nữa → đóng
- Mở panel → click 1 mục nav "Quản lý học sinh" → chuyển `/students` + panel đóng (kiểm URL)
- Mở panel → click 1 mục toast "Xuất Excel" → toast "Tính năng đang phát triển 🚧" hiện, panel vẫn mở
- Mở panel → click ra vùng trống ngoài panel → panel đóng
- `list_console_messages` → sạch

Run: `npx tsc --noEmit` + `npm run lint` + `npm test` → sạch + 71 pass.

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/QuickMenu.tsx
git commit -m "feat(ui): QuickMenu — panel đóng mặc định + nav/toast + đóng khi click ngoài

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 3: Kéo nút (drag + lưu vị trí) + Ẩn menu nổi

**Files:**
- Modify: `src/components/layout/QuickMenu.tsx`

**Interfaces:**
- Consumes: `QuickMenu`, nút ⚡, `open`/`setOpen` (Task 1-2).
- Produces: nút kéo được (lưu `qlhs_quickmenu_pos`); "Ẩn menu nổi" ẩn cả menu.

- [ ] **Step 1: Thêm state ẩn + vị trí + logic drag**

Thêm state (cạnh các useState khác):

```tsx
  const [hidden, setHidden] = useState(false)
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)
  const dragRef = useRef<{ startX: number; startY: number; moved: boolean } | null>(null)
```

Đọc vị trí đã lưu sau mount (tránh hydration mismatch):

```tsx
  useEffect(() => {
    try {
      const raw = localStorage.getItem('qlhs_quickmenu_pos')
      if (raw) setPos(JSON.parse(raw))
    } catch {}
  }, [])
```

Handlers drag cho nút ⚡:

```tsx
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
  function onPointerUp(e: React.PointerEvent) {
    const d = dragRef.current
    dragRef.current = null
    if (d && d.moved) {
      setPos((p) => { if (p) localStorage.setItem('qlhs_quickmenu_pos', JSON.stringify(p)); return p })
    } else {
      setOpen((o) => !o) // không kéo = click = toggle panel
    }
  }
```

- [ ] **Step 2: Áp vị trí + drag vào nút ⚡, ẩn khi hidden, nối nút "Ẩn menu nổi"**

Đổi nút ⚡: bỏ `onClick`, thêm pointer handlers + style vị trí động. Khi có `pos` dùng `left/top`, không thì giữ `bottom-[90px] right-6`:

```tsx
      <button
        type="button"
        aria-label="Quick Menu"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        style={pos ? { left: pos.x, top: pos.y, right: 'auto', bottom: 'auto' } : undefined}
        className="fixed bottom-[90px] right-6 z-50 grid h-14 w-14 cursor-grab touch-none place-items-center rounded-full border-[3px] border-white/85 bg-gradient-to-br from-purple-500 to-[#c2185b] text-2xl text-white shadow-[0_8px_24px_rgba(168,85,247,0.4)] active:cursor-grabbing"
      >
        ⚡
      </button>
```

Nếu có `pos`, panel cũng nên bám gần nút — nhưng để đơn giản (YAGNI), panel GIỮ cố định `bottom-[90px] right-6` (không theo nút). Chấp nhận: kéo nút đi xa thì panel vẫn ở góc phải.

Nối nút "Ẩn menu nổi": thêm `onClick={() => { setHidden(true); setOpen(false) }}`.

Bọc điều kiện ẩn: đầu return, nếu `hidden` thì return `null`:

```tsx
  if (hidden) return null
```

(đặt NGAY TRƯỚC `return (<div ref={rootRef}>`)

- [ ] **Step 3: Verify drag + ẩn**

Chrome:
- Reload → nút ⚡ góc phải-dưới
- Drag nút ⚡ sang vị trí khác (dùng `drag` tool hoặc pointer events): nút di chuyển, thả nằm đó
- Reload → nút VẪN ở vị trí đã kéo (đọc `localStorage.qlhs_quickmenu_pos` qua evaluate_script)
- Click (không kéo) nút ⚡ → panel mở
- Click "Ẩn menu nổi" → cả nút + panel biến mất
- Reload → menu hiện lại (hidden reset)
- `list_console_messages` → sạch

Run: `npx tsc --noEmit` + `npm run lint` + `npm test` → sạch + 71 pass.

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/QuickMenu.tsx
git commit -m "feat(ui): QuickMenu — kéo nút lưu vị trí + Ẩn menu nổi (reload hiện lại)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 4: Final verify + build

- [ ] **Step 1: Rà toàn diện qua Chrome** — mở `/`, `/students`, `/attendance`: nút ⚡ hiện mọi trang; mở panel, bung cả 4 nhóm, bấm thử 4 mục nav (mỗi cái chuyển đúng trang) + vài mục toast; kéo nút; ẩn menu. `list_console_messages` mỗi màn sạch. `resize_page` 390px → panel không tràn khỏi màn (nếu tràn: chấp nhận vì desktop-first, ghi nhận).

- [ ] **Step 2: Full check** — `npm test` (71 pass), `npx tsc --noEmit`, `npm run lint`, `npm run build` (PASS).

- [ ] **Step 3: Final review độc lập (opus)** — dispatch 1 review agent đọc diff `QuickMenu.tsx` + `layout.tsx`: bắt (a) hydration mismatch (đọc localStorage ngoài useEffect?), (b) pointer capture/leak listener, (c) đụng logic ngoài phạm vi, (d) a11y (button có type/aria?), (e) z-index/overlap. Sửa mọi phát hiện.

- [ ] **Step 4: Dọn scratchpad** nếu không cần mockup nữa.

---

## Self-Review (đã chạy)

**1. Spec coverage:** nút ⚡ nổi (T1,T3) · panel accordion 4 nhóm 14 mục (T1) · badge số (T1) · nav 4 mục + toast 10 mục (T1,T2) · panel đóng mặc định + click ngoài (T2) · nhiều nhóm mở đồng thời (T1 `openGroups[]`) · kéo lưu vị trí (T3) · ẩn menu reload hiện lại (T3) · gắn layout (T1) · giống gốc không nhãn (T1). Mọi mục spec có task. ✅

**2. Placeholder scan:** code đầy đủ mọi step, không TBD. `open=useState(true)` ở T1 có chú thích rõ "Task 2 đổi về false" (không phải placeholder — là bước dựng UI trước, đổi sau). ✅

**3. Type consistency:** `MenuAction`/`MenuItem`/`MenuGroup`, `runAction`, `openGroups`, `pos`, `hidden`, `dragRef`, key `qlhs_quickmenu_pos`, `MENU_GROUPS` — nhất quán T1→T3. ✅
