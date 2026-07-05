# Phase 2b-1 — 5 theme phiếu + Phiếu lớp — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Thêm 5 theme giao diện phiếu (chọn trong dialog, đổi tức thì, nhớ mặc định) + xuất phiếu cả lớp (mỗi HS 1 file PNG).

**Architecture:** Mở rộng UI phiếu P2a, KHÔNG đụng mô hình dữ liệu. Theme = bộ class Tailwind trong `receipt-themes.ts`; ReceiptCard nhận prop theme; theme chọn lưu store persist. Phiếu lớp render từng ReceiptCard vào container ẩn off-screen rồi html2canvas-pro → tải tuần tự nhiều PNG.

**Tech Stack:** Next.js 16 + React 19 + TS · Tailwind v4 + shadcn base-nova · Zustand persist · Vitest · html2canvas-pro (đã cài P2a).

## Global Constraints

- KHÔNG đụng data model Phase 1. Chỉ thêm/sửa: `receipt-themes.ts`, store (receiptTheme), ReceiptCard/ReceiptDialog, ThemePicker, BatchReceiptExport, StudentTable, messages.
- 5 theme: `default` (Mặc Định 🌿 xanh lá) · `ocean` (Đại Dương 🌊 xanh dương) · `lavender` (Oải Hương 🌸 tím) · `strawberry` (Dâu Tây 🍭 hồng — MẶC ĐỊNH, giữ giống hiện tại) · `luxury` (Sang Trọng ✨ vàng/đen).
- Chọn theme trong ReceiptDialog, đổi tức thì, persist (thêm `receiptTheme` vào partialize). Mặc định `'strawberry'`.
- Phiếu lớp = nhiều PNG (mỗi HS 1 ảnh, tải tuần tự, delay ~300ms giữa file). Nút ở CẢ Dashboard + ReceiptDialog. Lớp rỗng → toast. 1 HS lỗi → tiếp tục lô.
- Màu theme dùng class palette Tailwind v4 (oklch) — html2canvas-pro chụp được (đã verify P2a).
- Route/file/id English; chữ hiển thị tiếng Việt (messages/vi.json). shadcn base-nova: Dialog `render` prop. KHÔNG `any`, KHÔNG `eslint-disable`.
- Git: branch `feat/phase2b1-theme` từ main. Commit thường xuyên. KHÔNG push nếu chưa yêu cầu.
- Mỗi task: build PASS + test PASS + tsc + lint sạch trước commit.

## File Structure

| File | Trách nhiệm |
|------|-------------|
| `src/lib/receipt-themes.ts` | NEW — ThemeId, ReceiptTheme, RECEIPT_THEMES (5), getTheme |
| `src/store/useAppStore.ts` | MODIFY — receiptTheme + setReceiptTheme + partialize |
| `src/components/receipt/ReceiptCard.tsx` | MODIFY — nhận prop theme, dùng class theo theme |
| `src/components/receipt/ThemePicker.tsx` | NEW — 5 nút chọn theme |
| `src/components/receipt/BatchReceiptExport.tsx` | NEW — render off-screen + tải nhiều PNG |
| `src/components/receipt/ReceiptDialog.tsx` | MODIFY — ThemePicker + nút Tải phiếu lớp |
| `src/components/dashboard/StudentTable.tsx` | MODIFY — nút Tải phiếu lớp |
| `messages/vi.json` | MODIFY — key theme/batch |

**Ghi chú TDD:** TDD cho `receipt-themes.ts` (getTheme + tính đủ) và store (setReceiptTheme). UI (ReceiptCard theme-aware, ThemePicker, BatchReceiptExport, nút) verify bằng build + smoke test Chrome (bao gồm MỞ PNG tải về — bài học P2a).

---

### Task 1: Branch + receipt-themes.ts

**Files:** Create `src/lib/receipt-themes.ts`, Test `src/lib/receipt-themes.test.ts`

**Interfaces:**
- Consumes: (không có)
- Produces:
  - `type ThemeId = 'default' | 'ocean' | 'lavender' | 'strawberry' | 'luxury'`
  - `interface ReceiptTheme { id: ThemeId; name: string; emoji: string; cardBg: string; accentText: string; subText: string; badgeBg: string; totalBg: string; border: string }`
  - `RECEIPT_THEMES: ReceiptTheme[]` (5, theo thứ tự trên)
  - `getTheme(id: ThemeId): ReceiptTheme` (fallback phần tử `default`)

- [ ] **Step 1: Tạo branch**

```bash
cd /Users/toney/projects/quan-ly-hoc-sinh
git checkout main && git checkout -b feat/phase2b1-theme
```

- [ ] **Step 2: Viết failing test**

`src/lib/receipt-themes.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { RECEIPT_THEMES, getTheme } from './receipt-themes'

describe('receipt-themes', () => {
  it('có đúng 5 theme với id mong đợi', () => {
    expect(RECEIPT_THEMES.map((t) => t.id)).toEqual(['default', 'ocean', 'lavender', 'strawberry', 'luxury'])
  })
  it('mỗi theme có đủ field class không rỗng', () => {
    for (const t of RECEIPT_THEMES) {
      for (const k of ['name', 'emoji', 'cardBg', 'accentText', 'subText', 'badgeBg', 'totalBg', 'border'] as const) {
        expect(t[k]).toBeTruthy()
      }
    }
  })
  it('getTheme trả đúng theme theo id', () => {
    expect(getTheme('ocean').id).toBe('ocean')
    expect(getTheme('luxury').emoji).toBe('✨')
  })
  it('getTheme fallback default cho id lạ', () => {
    // @ts-expect-error test id không hợp lệ
    expect(getTheme('xxx').id).toBe('default')
  })
})
```

- [ ] **Step 3: Chạy test — FAIL**

```bash
npm test -- src/lib/receipt-themes.test.ts
```
Kỳ vọng: FAIL (module chưa có).

- [ ] **Step 4: Viết `src/lib/receipt-themes.ts`**

```ts
export type ThemeId = 'default' | 'ocean' | 'lavender' | 'strawberry' | 'luxury'

export interface ReceiptTheme {
  id: ThemeId
  name: string
  emoji: string
  cardBg: string      // nền card
  accentText: string  // chữ nhấn (tiêu đề, tổng)
  subText: string     // chữ phụ (nhãn trường)
  badgeBg: string     // nền badge ngày đi học
  totalBg: string     // nền khối TỔNG
  border: string      // viền phân cách
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
```

- [ ] **Step 5: Chạy test — PASS**

```bash
npm test -- src/lib/receipt-themes.test.ts
```
Kỳ vọng: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/lib/receipt-themes.ts src/lib/receipt-themes.test.ts
git commit -m "feat: receipt-themes — 5 theme phiếu (+test)"
```

---

### Task 2: Store receiptTheme

**Files:** MODIFY `src/store/useAppStore.ts`, Test `src/store/useAppStore.test.ts`

**Interfaces:**
- Consumes: `ThemeId` (Task 1).
- Produces: state `receiptTheme: ThemeId` (mặc định 'strawberry'), `setReceiptTheme(id: ThemeId): void`, partialize thêm `receiptTheme`.

- [ ] **Step 1: Viết failing test (thêm vào file test store)**

Thêm vào `src/store/useAppStore.test.ts`:
```ts
describe('receiptTheme', () => {
  it('mặc định là strawberry', () => {
    // reset về mặc định
    useAppStore.setState({ receiptTheme: 'strawberry' })
    expect(useAppStore.getState().receiptTheme).toBe('strawberry')
  })
  it('setReceiptTheme đổi theme', () => {
    useAppStore.getState().setReceiptTheme('ocean')
    expect(useAppStore.getState().receiptTheme).toBe('ocean')
  })
})
```

- [ ] **Step 2: Chạy test — FAIL**

```bash
npm test -- src/store/useAppStore.test.ts
```
Kỳ vọng: FAIL (receiptTheme/setReceiptTheme chưa có).

- [ ] **Step 3: Sửa `src/store/useAppStore.ts`**

Thêm import: `import type { ThemeId } from '@/lib/receipt-themes'`.
Trong interface `AppState`:
```ts
  receiptTheme: ThemeId
  setReceiptTheme: (id: ThemeId) => void
```
Trong initializer (cạnh comments):
```ts
      receiptTheme: 'strawberry',
      setReceiptTheme: (id) => set({ receiptTheme: id }),
```
Sửa `partialize` thêm `receiptTheme`:
```ts
      partialize: (s) => ({ students: s.students, attendance: s.attendance, comments: s.comments, receiptTheme: s.receiptTheme }),
```

- [ ] **Step 4: Chạy test — PASS**

```bash
npm test -- src/store/useAppStore.test.ts
```
Kỳ vọng: PASS (cả test cũ + mới).

- [ ] **Step 5: Commit**

```bash
git add src/store/useAppStore.ts src/store/useAppStore.test.ts
git commit -m "feat: store receiptTheme + setReceiptTheme (persist, +test)"
```

---

### Task 3: ReceiptCard theme-aware

**Files:** MODIFY `src/components/receipt/ReceiptCard.tsx`

**Interfaces:**
- Consumes: `ReceiptTheme` (Task 1).
- Produces: `ReceiptCard` nhận thêm prop `theme: ReceiptTheme`, dùng class từ theme thay class hard-code.

- [ ] **Step 1: Sửa `ReceiptCard.tsx`**

Thêm import: `import type { ReceiptTheme } from '@/lib/receipt-themes'`.
Đổi props type thành `{ studentId: string; year: number; month: number; comment: string; theme: ReceiptTheme }`.
Thay các class hard-code bằng class từ `theme`:
- div gốc: `className={\`mx-auto w-[360px] rounded-2xl ${theme.cardBg} p-5 text-sm text-gray-700\`}`
- schoolName: `className={\`text-xs font-semibold ${theme.subText}\`}` (dùng subText cho chữ phụ; hoặc giữ text-purple-500 → đổi sang theme.accentText nhạt). Dùng `theme.accentText` cho tiêu đề "🧾 {t('title')}" (`text-lg font-extrabold ${theme.accentText}`).
- Khối TỔNG: nền `${theme.totalBg}`, số tổng `${theme.accentText}`.
- Badge ngày: `${theme.badgeBg}`.
- Viền phân cách NHẬN XÉT: `${theme.border}`.
- Chữ lời chào: `${theme.accentText}`.
Giữ nguyên bố cục + emoji + VietQrCode + text bank.

- [ ] **Step 2: Xác minh build**

```bash
npm run build && npm test
```
Kỳ vọng: build FAIL nếu ReceiptDialog chưa truyền prop `theme` (bắt buộc) — sẽ sửa ở Task 5. Để tránh vỡ build giữa chừng, đặt prop `theme` **optional với fallback**: `theme?: ReceiptTheme` và trong body `const th = theme ?? getTheme('strawberry')` (import getTheme). Dùng `th.*`. Như vậy build vẫn PASS trước khi Task 5 nối. Chạy lại:
```bash
npm run build
```
Kỳ vọng: PASS. tsc + eslint (`src/components/receipt`) sạch.

- [ ] **Step 3: Commit**

```bash
git add src/components/receipt/ReceiptCard.tsx
git commit -m "feat: ReceiptCard theme-aware (prop theme, fallback strawberry)"
```

---

### Task 4: ThemePicker

**Files:** Create `src/components/receipt/ThemePicker.tsx`, MODIFY `messages/vi.json`

**Interfaces:**
- Consumes: `RECEIPT_THEMES` (Task 1), `useAppStore` (receiptTheme/setReceiptTheme) (Task 2).
- Produces: `<ThemePicker />` — hàng 5 nút chọn theme, highlight theme đang chọn.

- [ ] **Step 1: Thêm key i18n**

Trong `messages/vi.json` namespace `receipt`, thêm: `"theme": "Giao diện phiếu", "batchExport": "📥 Tải phiếu lớp", "batchDone": "Đã tải {n}/{total} phiếu", "batchEmpty": "Lớp không có học sinh", "batchError": "Lỗi tải phiếu của {name}"`.

- [ ] **Step 2: Viết `ThemePicker.tsx`**

```tsx
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
            receiptTheme === t.id ? 'border-pink-500 bg-pink-100 font-semibold' : 'border-gray-200 hover:bg-gray-50',
          )}
        >
          {t.emoji} {t.name}
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 3: Xác minh build**

```bash
npm run build
```
Kỳ vọng: PASS. eslint sạch.

- [ ] **Step 4: Commit**

```bash
git add src/components/receipt/ThemePicker.tsx messages/vi.json
git commit -m "feat: ThemePicker — 5 nút chọn giao diện phiếu"
```

---

### Task 5: BatchReceiptExport (phiếu lớp)

**Files:** Create `src/components/receipt/BatchReceiptExport.tsx`

**Interfaces:**
- Consumes: `useAppStore` (students, receiptTheme, getComment), `ReceiptCard` (Task 3), `getTheme` (Task 1), `html2canvas-pro`, `toast`.
- Produces: `<BatchReceiptExport className studentIds year month trigger />` — nút mở → render off-screen từng HS → tải PNG tuần tự.

- [ ] **Step 1: Viết `BatchReceiptExport.tsx`**

```tsx
'use client'
import { useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import html2canvas from 'html2canvas-pro'
import { toast } from 'sonner'
import { useAppStore } from '@/store/useAppStore'
import { getTheme } from '@/lib/receipt-themes'
import { ReceiptCard } from './ReceiptCard'
import { Button } from '@/components/ui/button'

function sleep(ms: number) {
  return new Promise<void>((resolve) => {
    let n = 0
    function tick() {
      n += 16
      if (n >= ms) resolve()
      else requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  })
}

export function BatchReceiptExport({
  studentIds, year, month, label,
}: { studentIds: string[]; year: number; month: number; label: string }) {
  const { students, receiptTheme, getComment } = useAppStore()
  const [busy, setBusy] = useState(false)
  const [currentId, setCurrentId] = useState<string | null>(null)
  const hiddenRef = useRef<HTMLDivElement>(null)
  const theme = getTheme(receiptTheme)

  async function run() {
    const ids = studentIds.filter((id) => students.some((s) => s.id === id))
    if (ids.length === 0) {
      toast.error('Lớp không có học sinh')
      return
    }
    setBusy(true)
    let done = 0
    for (const id of ids) {
      const student = students.find((s) => s.id === id)
      try {
        flushSync(() => setCurrentId(id))
        await sleep(120) // chờ QR canvas vẽ xong
        if (hiddenRef.current) {
          const canvas = await html2canvas(hiddenRef.current, { backgroundColor: null, scale: 2 })
          const link = document.createElement('a')
          link.download = `phieu-hoc-phi-${student?.fullName ?? id}-${year}-${String(month).padStart(2, '0')}.png`
          link.href = canvas.toDataURL('image/png')
          link.click()
          done++
          toast.success(`Đã tải ${done}/${ids.length} phiếu`)
        }
        await sleep(300) // tránh trình duyệt chặn multi-download
      } catch {
        toast.error(`Lỗi tải phiếu của ${student?.fullName ?? id}`)
      }
    }
    setCurrentId(null)
    setBusy(false)
  }

  return (
    <>
      <Button variant="outline" size="sm" disabled={busy} onClick={run}>
        {busy ? '⏳ Đang tải...' : label}
      </Button>
      {/* container ẩn off-screen để chụp từng phiếu */}
      <div style={{ position: 'absolute', left: -9999, top: 0 }} aria-hidden>
        {currentId && (
          <div ref={hiddenRef}>
            <ReceiptCard
              studentId={currentId}
              year={year}
              month={month}
              comment={getComment(currentId, year, month)}
              theme={theme}
            />
          </div>
        )}
      </div>
    </>
  )
}
```

- [ ] **Step 2: Xác minh build**

```bash
npm run build
```
Kỳ vọng: PASS. tsc + eslint sạch.

- [ ] **Step 3: Commit**

```bash
git add src/components/receipt/BatchReceiptExport.tsx
git commit -m "feat: BatchReceiptExport — tải phiếu cả lớp (nhiều PNG, render off-screen)"
```

---

### Task 6: Nối ThemePicker + phiếu lớp vào ReceiptDialog + truyền theme

**Files:** MODIFY `src/components/receipt/ReceiptDialog.tsx`

**Interfaces:**
- Consumes: `ThemePicker` (Task 4), `BatchReceiptExport` (Task 5), `getTheme`/`useAppStore.receiptTheme` (Task 1/2).
- Produces: dialog có ThemePicker + nút Tải phiếu lớp; truyền `theme` cho ReceiptCard.

- [ ] **Step 1: Sửa `ReceiptDialog.tsx`**

Thêm import: `ThemePicker`, `BatchReceiptExport`, `getTheme`; lấy `receiptTheme` từ store.
- Trong `useAppStore()` destructure thêm `receiptTheme`.
- Tính `const theme = getTheme(receiptTheme)`.
- Truyền `theme={theme}` cho `<ReceiptCard ... />`.
- Ngay trên phần preview (dưới 2 Select tháng/năm), thêm `<ThemePicker />`.
- Trong `DialogFooter`, thêm nút phiếu lớp cho lớp của HS đang mở:
```tsx
<BatchReceiptExport
  studentIds={students.filter((s) => s.className === student?.className).map((s) => s.id)}
  year={year}
  month={month}
  label={t('batchExport')}
/>
```

- [ ] **Step 2: Xác minh build + smoke**

```bash
npm run build && npm test
```
Kỳ vọng: build PASS, test PASS, tsc + eslint sạch. Smoke (Chrome MCP): mở dialog phiếu → thấy 5 nút theme, bấm từng cái → màu phiếu đổi tức thì; reload → theme vừa chọn vẫn giữ; bấm "Tải phiếu lớp" → tải nhiều PNG (MỞ 1 PNG kiểm màu theme đúng).

- [ ] **Step 3: Commit**

```bash
git add src/components/receipt/ReceiptDialog.tsx
git commit -m "feat: ReceiptDialog — ThemePicker + nút Tải phiếu lớp + truyền theme"
```

---

### Task 7: Nút Tải phiếu lớp ở Dashboard

**Files:** MODIFY `src/components/dashboard/StudentTable.tsx`

**Interfaces:**
- Consumes: `BatchReceiptExport` (Task 5), `usePeriodStore` (year/month), lớp đang lọc (`cls`).
- Produces: nút Tải phiếu lớp trên Dashboard (theo lớp đang lọc + tháng đang chọn).

- [ ] **Step 1: Sửa `StudentTable.tsx`**

Thêm import `BatchReceiptExport`.
Ở hàng filter (cạnh Input tìm + Select lớp), thêm nút phiếu lớp cho tập HS đang hiển thị (`rows`):
```tsx
<BatchReceiptExport
  studentIds={rows.map((s) => s.id)}
  year={year}
  month={month}
  label={t('batchReceipt')}
/>
```
Thêm key i18n `dashboard.batchReceipt = "📥 Tải phiếu lớp"` vào messages/vi.json. (`rows` = HS sau lọc lớp/tìm tên → "Tải phiếu lớp" tôn trọng bộ lọc hiện tại.)

- [ ] **Step 2: Xác minh build + smoke**

```bash
npm run build && npm test
```
Kỳ vọng: PASS. Smoke: Dashboard lọc lớp "Lớp Sao Mai" → bấm Tải phiếu lớp → tải PNG cho các HS lớp đó (mở kiểm).

- [ ] **Step 3: Commit**

```bash
git add src/components/dashboard/StudentTable.tsx messages/vi.json
git commit -m "feat: nút Tải phiếu lớp ở Dashboard (theo lớp đang lọc)"
```

---

## Self-Review

**1. Spec coverage:**
- 5 theme (default/ocean/lavender/strawberry/luxury) → Task 1 ✅
- Chọn theme trong dialog, đổi tức thì, persist mặc định → Task 2 (store) + 4 (picker) + 6 (nối) ✅
- ReceiptCard theme-aware → Task 3 ✅
- Phiếu lớp nhiều PNG, render off-screen, delay, lớp rỗng→toast, lỗi 1 HS→tiếp → Task 5 ✅
- Nút phiếu lớp ở CẢ Dashboard + dialog → Task 6 (dialog) + 7 (dashboard) ✅
- Không đụng data model → chỉ sửa UI + store field theme ✅

**2. Placeholder scan:** không có TODO/TBD; mọi step code có nội dung thật. ✅

**3. Type consistency:** `ThemeId`/`ReceiptTheme`/`getTheme`/`RECEIPT_THEMES` Task 1 → dùng Task 2/3/5/6. `receiptTheme`/`setReceiptTheme` Task 2 → dùng Task 4/6. `ReceiptCard` prop `theme` Task 3 → truyền Task 5/6. `BatchReceiptExport` props `{studentIds,year,month,label}` Task 5 → gọi Task 6/7. ✅

**Rủi ro:** (a) Task 3 làm prop theme optional+fallback để build không vỡ trước khi Task 6 nối — nhất quán. (b) Phiếu lớp render off-screen: dùng `flushSync` + `requestAnimationFrame` sleep để QR canvas kịp vẽ trước khi chụp; nếu QR chưa kịp, tăng sleep. (c) Đã dùng html2canvas-pro (P2a) nên màu theme oklch chụp được. (d) Multi-download: delay 300ms + có thể trình duyệt vẫn hỏi cho phép tải nhiều file — chấp nhận (bản gốc cũng vậy).
