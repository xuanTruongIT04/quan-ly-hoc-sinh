# Phase 2b-2 — Phụ phí + Nhắc nợ — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Thêm phụ phí (số + ghi chú /HS/tháng, cộng vào tổng phiếu + doanh thu) và nhắc nợ (đã trả/chưa trả /HS/tháng, badge trên phiếu + Dashboard).

**Architecture:** Đụng data model Phase 1 nhẹ (thêm extraFees + payments vào store, đổi chữ ký doanh thu). Giữ 48 test cũ xanh bằng tham số `extraFees` OPTIONAL ở cuối các hàm doanh thu. Nhập phụ phí + trạng thái trả trong ReceiptDialog; badge trên ReceiptCard + Dashboard.

**Tech Stack:** Next.js 16 + React 19 + TS · Zustand persist · Vitest · (tái dùng html2canvas-pro, themes).

## Global Constraints

- **Phụ phí = `{ amount: number (VND), note: string }` /HS/tháng**, key `commentKey(studentId,year,month)`. Cộng vào TỔNG phiếu + doanh thu Tháng/Năm.
- **Nhắc nợ = boolean đã-trả /HS/tháng**, key giống trên. Chưa trả → badge phiếu + badge "⚠️ Nợ" Dashboard.
- **Doanh thu = học phí + phụ phí, PHẢI THU** (kể cả chưa trả). `revenueForDay` (Hôm nay) KHÔNG cộng phụ phí (phụ phí theo tháng).
- **KHÔNG phá 48 test cũ:** tham số `extraFees?: Record<string, ExtraFee>` thêm ở CUỐI revenueForMonth/Year, mặc định `{}`.
- Học phí VND (không chia 100). Route/file/id English; chữ tiếng Việt (messages/vi.json). shadcn base-nova. No `any`, no eslint-disable.
- Git: branch `feat/phase2b2-fees` từ main. Commit thường xuyên. KHÔNG push nếu chưa yêu cầu. Mỗi task build+test+tsc+lint sạch trước commit.

## File Structure

| File | Trách nhiệm |
|------|-------------|
| `src/types/index.ts` | MODIFY — `ExtraFee` interface |
| `src/store/useAppStore.ts` | MODIFY — extraFees/payments + actions + partialize |
| `src/lib/fees.ts` | MODIFY — `receiptTotal`; revenueForMonth/Year cộng phụ phí (extraFees optional) |
| `src/components/receipt/ReceiptCard.tsx` | MODIFY — dòng phụ phí + TỔNG gồm phụ phí + badge trạng thái |
| `src/components/receipt/ReceiptDialog.tsx` | MODIFY — ô phụ phí/ghi chú + nút đã-trả |
| `src/components/receipt/BatchReceiptExport.tsx` | MODIFY — truyền extraFee/paid cho ReceiptCard |
| `src/components/dashboard/StatCards.tsx` | MODIFY — revenue* nhận extraFees |
| `src/components/dashboard/StudentTable.tsx` | MODIFY — badge "⚠️ Nợ" |
| `messages/vi.json` | MODIFY — key extraFee/payment |

**TDD:** nghiêm cho `fees.ts` (doanh thu + receiptTotal — tiền, dễ sai, phải giữ test cũ) và store (extraFees/payments). UI verify bằng build + smoke (mở PNG).

---

### Task 1: Branch + types ExtraFee + store (extraFees + payments)

**Files:** MODIFY `src/types/index.ts`, `src/store/useAppStore.ts`, Test `src/store/useAppStore.test.ts`

**Interfaces:**
- Consumes: `commentKey` (đã có ở @/types).
- Produces:
  - `interface ExtraFee { amount: number; note: string }`
  - store state `extraFees: Record<string, ExtraFee>`, `payments: Record<string, boolean>`
  - `setExtraFee(studentId, year, month, amount, note): void`, `getExtraFee(studentId, year, month): ExtraFee`
  - `setPaid(studentId, year, month, paid): void`, `isPaid(studentId, year, month): boolean`
  - partialize thêm `extraFees`, `payments`.

- [ ] **Step 1: Branch**

```bash
cd /Users/toney/projects/quan-ly-hoc-sinh
git checkout main && git checkout -b feat/phase2b2-fees
```

- [ ] **Step 2: Thêm `ExtraFee` vào `src/types/index.ts`**

Thêm vào cuối:
```ts
export interface ExtraFee {
  amount: number   // VND, KHÔNG chia 100
  note: string     // ghi chú tùy chọn, '' nếu không có
}
```

- [ ] **Step 3: Viết failing test store**

Thêm vào `src/store/useAppStore.test.ts`:
```ts
describe('extraFees + payments', () => {
  beforeEach(() => useAppStore.setState({ extraFees: {}, payments: {} }))

  it('setExtraFee rồi getExtraFee trả đúng số + note theo tháng', () => {
    useAppStore.getState().setExtraFee('s1', 2026, 7, 50000, 'Tiền sách')
    expect(useAppStore.getState().getExtraFee('s1', 2026, 7)).toEqual({ amount: 50000, note: 'Tiền sách' })
  })
  it('getExtraFee mặc định {amount:0, note:""} khi chưa có', () => {
    expect(useAppStore.getState().getExtraFee('s1', 2026, 9)).toEqual({ amount: 0, note: '' })
  })
  it('phụ phí tách biệt theo tháng', () => {
    const st = useAppStore.getState()
    st.setExtraFee('s1', 2026, 7, 50000, 'T7')
    st.setExtraFee('s1', 2026, 8, 30000, 'T8')
    expect(useAppStore.getState().getExtraFee('s1', 2026, 7).amount).toBe(50000)
    expect(useAppStore.getState().getExtraFee('s1', 2026, 8).amount).toBe(30000)
  })
  it('setPaid/isPaid theo tháng, mặc định false', () => {
    expect(useAppStore.getState().isPaid('s1', 2026, 7)).toBe(false)
    useAppStore.getState().setPaid('s1', 2026, 7, true)
    expect(useAppStore.getState().isPaid('s1', 2026, 7)).toBe(true)
    expect(useAppStore.getState().isPaid('s1', 2026, 8)).toBe(false)
  })
})
```

- [ ] **Step 4: Chạy test — FAIL**

```bash
npm test -- src/store/useAppStore.test.ts
```
Kỳ vọng: FAIL (extraFees/payments chưa có).

- [ ] **Step 5: Sửa `src/store/useAppStore.ts`**

Thêm import: `import { commentKey, type ExtraFee } from '@/types'` (gộp với import types hiện có).
Trong interface `AppState`:
```ts
  extraFees: Record<string, ExtraFee>
  payments: Record<string, boolean>
  setExtraFee: (studentId: string, year: number, month: number, amount: number, note: string) => void
  getExtraFee: (studentId: string, year: number, month: number) => ExtraFee
  setPaid: (studentId: string, year: number, month: number, paid: boolean) => void
  isPaid: (studentId: string, year: number, month: number) => boolean
```
Trong initializer (cạnh comments/receiptTheme):
```ts
      extraFees: {},
      payments: {},
      setExtraFee: (studentId, year, month, amount, note) =>
        set((st) => ({ extraFees: { ...st.extraFees, [commentKey(studentId, year, month)]: { amount, note } } })),
      getExtraFee: (studentId, year, month) =>
        get().extraFees[commentKey(studentId, year, month)] ?? { amount: 0, note: '' },
      setPaid: (studentId, year, month, paid) =>
        set((st) => ({ payments: { ...st.payments, [commentKey(studentId, year, month)]: paid } })),
      isPaid: (studentId, year, month) => get().payments[commentKey(studentId, year, month)] ?? false,
```
Sửa `partialize` thêm `extraFees`, `payments`:
```ts
      partialize: (s) => ({ students: s.students, attendance: s.attendance, comments: s.comments, receiptTheme: s.receiptTheme, extraFees: s.extraFees, payments: s.payments }),
```

- [ ] **Step 6: Chạy test — PASS**

```bash
npm test -- src/store/useAppStore.test.ts
```
Kỳ vọng: PASS (cả cũ + mới).

- [ ] **Step 7: Commit**

```bash
git add src/types/index.ts src/store/useAppStore.ts src/store/useAppStore.test.ts
git commit -m "feat: store phụ phí (extraFees) + thanh toán (payments) + ExtraFee type (+test)"
```

---

### Task 2: fees.ts — receiptTotal + doanh thu cộng phụ phí (TDD nghiêm)

**Files:** MODIFY `src/lib/fees.ts`, Test `src/lib/fees.test.ts`

**Interfaces:**
- Consumes: `Student`, `AttendanceRecord`, `ExtraFee`, `commentKey` (@/types); `monthlyFee` (đã có).
- Produces:
  - `receiptTotal(student, attendance, extraFee: ExtraFee, year, month): number` = monthlyFee + extraFee.amount
  - `revenueForMonth(students, attendance, year, month, extraFees?: Record<string, ExtraFee>): number` (cộng phụ phí mỗi HS)
  - `revenueForYear(students, attendance, year, extraFees?): number`
  - `revenueForDay` GIỮ NGUYÊN (không cộng phụ phí).

- [ ] **Step 1: Viết failing test (thêm vào fees.test.ts)**

```ts
import { receiptTotal } from './fees'
import type { ExtraFee } from '@/types'

describe('receiptTotal + doanh thu có phụ phí', () => {
  const perSession = { id: 'p', fullName: 'P', className: 'L', feeMode: 'per_session' as const, fee: 100000, startDate: '2026-07-01', sortOrder: 1 }
  const att = [
    { studentId: 'p', date: '2026-07-02', status: 'present' as const },
    { studentId: 'p', date: '2026-07-04', status: 'present' as const },
  ]
  const noFee: ExtraFee = { amount: 0, note: '' }
  const fee50: ExtraFee = { amount: 50000, note: 'Tiền sách' }

  it('receiptTotal = học phí + phụ phí', () => {
    expect(receiptTotal(perSession, att, noFee, 2026, 7)).toBe(200000)      // 2 buổi × 100k
    expect(receiptTotal(perSession, att, fee50, 2026, 7)).toBe(250000)      // + 50k phụ phí
  })
  it('revenueForMonth KHÔNG có extraFees = như cũ (không phá test cũ)', () => {
    expect(revenueForMonth([perSession], att, 2026, 7)).toBe(200000)
  })
  it('revenueForMonth CÓ extraFees cộng phụ phí đúng HS/tháng', () => {
    // key phụ phí của p tháng 7
    const extraFees = { 'p:2026-07': fee50 }
    expect(revenueForMonth([perSession], att, 2026, 7, extraFees)).toBe(250000)
    // phụ phí tháng khác không tính vào tháng 7
    expect(revenueForMonth([perSession], att, 2026, 8, { 'p:2026-08': fee50 })).toBe(0 + 50000)
  })
  it('revenueForYear cộng phụ phí các tháng', () => {
    const extraFees = { 'p:2026-07': fee50 }
    // T7: 200k + 50k = 250k; các tháng khác 0 → 250k
    expect(revenueForYear([perSession], att, 2026, extraFees)).toBe(250000)
  })
})
```

- [ ] **Step 2: Chạy test — FAIL**

```bash
npm test -- src/lib/fees.test.ts
```
Kỳ vọng: FAIL (`receiptTotal` chưa có; revenueForMonth chưa nhận extraFees).

- [ ] **Step 3: Sửa `src/lib/fees.ts`**

Thêm import: `import { commentKey, type ExtraFee } from '@/types'`.
Thêm `receiptTotal` (sau monthlyFee):
```ts
export function receiptTotal(
  student: Student, attendance: AttendanceRecord[], extraFee: ExtraFee, year: number, month: number,
): number {
  return monthlyFee(student, attendance, year, month) + (extraFee?.amount ?? 0)
}
```
Sửa `revenueForMonth` (thêm tham số optional cuối):
```ts
export function revenueForMonth(
  students: Student[], attendance: AttendanceRecord[], year: number, month: number,
  extraFees: Record<string, ExtraFee> = {},
): number {
  return students.reduce((sum, s) => {
    const extra = extraFees[commentKey(s.id, year, month)]?.amount ?? 0
    return sum + monthlyFee(s, attendance, year, month) + extra
  }, 0)
}
```
Sửa `revenueForYear` (truyền extraFees qua):
```ts
export function revenueForYear(
  students: Student[], attendance: AttendanceRecord[], year: number,
  extraFees: Record<string, ExtraFee> = {},
): number {
  let total = 0
  for (let m = 1; m <= 12; m++) total += revenueForMonth(students, attendance, year, m, extraFees)
  return total
}
```
`revenueForDay` GIỮ NGUYÊN.

- [ ] **Step 4: Chạy test — PASS**

```bash
npm test -- src/lib/fees.test.ts
```
Kỳ vọng: PASS. Toàn suite `npm test` cũng PASS (25 test fees/revenue cũ không truyền extraFees → mặc định {} → giá trị như cũ).

- [ ] **Step 5: Commit**

```bash
git add src/lib/fees.ts src/lib/fees.test.ts
git commit -m "feat: receiptTotal + doanh thu cộng phụ phí (extraFees optional, giữ test cũ xanh)"
```

---

### Task 3: ReceiptCard — dòng phụ phí + TỔNG gồm phụ phí + badge trạng thái

**Files:** MODIFY `src/components/receipt/ReceiptCard.tsx`, `messages/vi.json`

**Interfaces:**
- Consumes: `useAppStore` (getExtraFee, isPaid), `receiptTotal` (Task 2), `ExtraFee`.
- Produces: ReceiptCard nhận thêm prop `extraFee?: ExtraFee`, `paid?: boolean` (fallback lấy từ store nếu không truyền); hiện dòng phụ phí + TỔNG cộng phụ phí + badge.

- [ ] **Step 1: Thêm key i18n**

`messages/vi.json` namespace `receipt`, thêm: `"extraFee": "Phụ phí", "paid": "✅ ĐÃ THANH TOÁN", "unpaid": "⚠️ CHƯA THANH TOÁN", "extraFeeLabel": "Phụ phí", "extraFeeNote": "Ghi chú phụ phí", "saveExtraFee": "Lưu phụ phí", "markPaid": "✅ Đánh dấu đã trả", "markUnpaid": "⚠️ Đánh dấu chưa trả"`.

- [ ] **Step 2: Sửa `ReceiptCard.tsx`**

Thêm import: `import { receiptTotal } from '@/lib/fees'` và `import type { ExtraFee } from '@/types'`.
Đổi props: thêm `extraFee?: ExtraFee; paid?: boolean`.
Trong body, lấy từ store nếu không truyền (ReceiptCard đã dùng useAppStore):
```ts
const { students, attendance, getExtraFee, isPaid } = useAppStore()
// ...
const ef = extraFee ?? getExtraFee(student.id, year, month)
const isPaidNow = paid ?? isPaid(student.id, year, month)
const total = receiptTotal(student, attendance, ef, year, month)   // thay monthlyFee cũ
```
(Xóa dòng `const total = monthlyFee(...)` cũ, thay bằng `receiptTotal`.)
- Sau dòng "📝 Số buổi học", nếu `ef.amount > 0` thêm dòng:
```tsx
{ef.amount > 0 && (
  <div className="flex justify-between">
    <span>➕ {t('extraFee')}{ef.note ? ` (${ef.note})` : ''}</span>
    <span>{formatPrice(ef.amount)}</span>
  </div>
)}
```
- Khối TỔNG dùng `total` (đã gồm phụ phí — không đổi cấu trúc, `total` đã tính lại).
- Thêm badge trạng thái ngay dưới header (sau dòng Tháng N/năm):
```tsx
<div className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${isPaidNow ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
  {isPaidNow ? t('paid') : t('unpaid')}
</div>
```

- [ ] **Step 3: Xác minh build**

```bash
npm run build && npm test
```
Kỳ vọng: PASS. tsc + eslint (`src/components/receipt`, `messages`) sạch.

- [ ] **Step 4: Commit**

```bash
git add src/components/receipt/ReceiptCard.tsx messages/vi.json
git commit -m "feat: ReceiptCard — dòng phụ phí + TỔNG gồm phụ phí + badge thanh toán"
```

---

### Task 4: ReceiptDialog — nhập phụ phí + nút đã-trả

**Files:** MODIFY `src/components/receipt/ReceiptDialog.tsx`

**Interfaces:**
- Consumes: `useAppStore` (setExtraFee/getExtraFee, setPaid/isPaid) (Task 1); ReceiptCard (Task 3).
- Produces: dialog có ô phụ phí + ghi chú + nút lưu phụ phí + nút toggle đã-trả; ReceiptCard nhận extraFee/paid live.

- [ ] **Step 1: Sửa `ReceiptDialog.tsx`**

Trong `useAppStore()` destructure thêm `setExtraFee, getExtraFee, setPaid, isPaid`.
Thêm state: `const [feeAmount, setFeeAmount] = useState(0)`, `const [feeNote, setFeeNote] = useState('')`, `const [paidState, setPaidState] = useState(false)`.
Sửa `syncComment(y, m)` (đổi tên hoặc thêm) để nạp cả phụ phí + trạng thái trả khi mở/đổi tháng:
```ts
function syncMonth(y: number, m: number) {
  setLocalComment(getComment(studentId, y, m))
  const ef = getExtraFee(studentId, y, m)
  setFeeAmount(ef.amount); setFeeNote(ef.note)
  setPaidState(isPaid(studentId, y, m))
}
```
(Thay mọi lời gọi `syncComment(...)` thành `syncMonth(...)`.)
Thêm handlers:
```ts
function saveExtraFee() {
  setExtraFee(studentId, year, month, feeAmount, feeNote)
  toast.success(t('saveExtraFee'))
}
function togglePaid() {
  const next = !paidState
  setPaidState(next)
  setPaid(studentId, year, month, next)
}
```
Truyền cho ReceiptCard: `extraFee={{ amount: feeAmount, note: feeNote }}` và `paid={paidState}` (để preview live).
Thêm UI (trên/dưới textbox nhận xét):
```tsx
<div className="flex flex-wrap gap-2">
  <input type="number" className="w-32 rounded-md border p-2 text-sm" placeholder={t('extraFeeLabel')} value={feeAmount} onChange={(e) => setFeeAmount(Number(e.target.value))} />
  <input type="text" className="flex-1 rounded-md border p-2 text-sm" placeholder={t('extraFeeNote')} value={feeNote} onChange={(e) => setFeeNote(e.target.value)} />
  <Button variant="outline" onClick={saveExtraFee}>💾 {t('saveExtraFee')}</Button>
</div>
<Button variant={paidState ? 'default' : 'outline'} onClick={togglePaid}>
  {paidState ? t('markUnpaid') : t('markPaid')}
</Button>
```

- [ ] **Step 2: Xác minh build + smoke**

```bash
npm run build && npm test
```
Kỳ vọng: PASS. Smoke (Chrome MCP): mở phiếu → nhập phụ phí 50000 + note "Tiền sách" → Lưu → dòng phụ phí hiện trên phiếu + TỔNG tăng 50k; bấm "đánh dấu đã trả" → badge phiếu đổi "ĐÃ THANH TOÁN"; đổi tháng → phụ phí/trạng thái đổi theo; reload → còn. Tải PNG kiểm (mở ảnh).

- [ ] **Step 3: Commit**

```bash
git add src/components/receipt/ReceiptDialog.tsx
git commit -m "feat: ReceiptDialog — nhập phụ phí + ghi chú + nút đánh dấu đã/chưa trả"
```

---

### Task 5: BatchReceiptExport truyền phụ phí/paid + Dashboard (doanh thu + badge Nợ)

**Files:** MODIFY `src/components/receipt/BatchReceiptExport.tsx`, `src/components/dashboard/StatCards.tsx`, `src/components/dashboard/StudentTable.tsx`, `messages/vi.json`

**Interfaces:**
- Consumes: `useAppStore` (extraFees, payments, getExtraFee, isPaid); `revenueForMonth/Year` với extraFees (Task 2).
- Produces: phiếu lớp có phụ phí; doanh thu Dashboard gồm phụ phí; badge Nợ trên bảng HS.

- [ ] **Step 1: BatchReceiptExport — truyền extraFee/paid**

Trong `BatchReceiptExport.tsx`, `useAppStore()` thêm `getExtraFee, isPaid`. Trong ReceiptCard ẩn, thêm:
```tsx
extraFee={getExtraFee(currentId, year, month)}
paid={isPaid(currentId, year, month)}
```

- [ ] **Step 2: StatCards — doanh thu gồm phụ phí**

Trong `StatCards.tsx`, `useAppStore()` thêm `extraFees`. Truyền vào các hàm:
```tsx
revenueForYear(students, attendance, year, extraFees)
revenueForMonth(students, attendance, year, month, extraFees)
// revenueForDay giữ nguyên (không phụ phí)
```

- [ ] **Step 3: StudentTable — badge Nợ**

Trong `StudentTable.tsx`, `useAppStore()` thêm `isPaid`. Ở cell tên HS, nếu chưa trả tháng đang xem → badge:
```tsx
<TableCell className="font-medium">
  {s.fullName}
  {!isPaid(s.id, year, month) && (
    <span className="ml-2 rounded bg-red-100 px-1.5 py-0.5 text-xs text-red-600">{t('debtBadge')}</span>
  )}
</TableCell>
```
Thêm key `dashboard.debtBadge = "⚠️ Nợ"` vào messages/vi.json.

- [ ] **Step 4: Xác minh build + smoke**

```bash
npm run build && npm test
```
Kỳ vọng: PASS. Smoke: nhập phụ phí 1 HS → Dashboard doanh thu Tháng tăng đúng; HS chưa trả → badge "⚠️ Nợ" ở bảng; đánh dấu đã trả → badge biến mất; phiếu lớp tải ra có phụ phí (mở PNG kiểm 1 cái).

- [ ] **Step 5: Commit**

```bash
git add src/components/receipt/BatchReceiptExport.tsx src/components/dashboard/StatCards.tsx src/components/dashboard/StudentTable.tsx messages/vi.json
git commit -m "feat: phụ phí vào phiếu lớp + doanh thu Dashboard + badge Nợ"
```

---

## Self-Review

**1. Spec coverage:**
- Phụ phí {amount,note}/HS/tháng, store persist → Task 1 ✅
- Nhắc nợ boolean/HS/tháng, store persist → Task 1 ✅
- receiptTotal = học phí + phụ phí; doanh thu Tháng/Năm cộng phụ phí; Ngày không → Task 2 (TDD) ✅
- Giữ 48 test cũ (extraFees optional) → Task 2 ✅
- ReceiptCard dòng phụ phí + TỔNG + badge → Task 3 ✅
- ReceiptDialog nhập phụ phí/ghi chú + nút đã-trả → Task 4 ✅
- Phiếu lớp có phụ phí → Task 5 ✅
- Dashboard doanh thu gồm phụ phí + badge Nợ → Task 5 ✅

**2. Placeholder scan:** không có TODO/TBD; mọi step code thật. ✅

**3. Type consistency:** `ExtraFee` Task 1 → dùng Task 2/3/5. `extraFees: Record<string,ExtraFee>` key commentKey nhất quán Task 1/2. `receiptTotal(student,attendance,extraFee,year,month)` Task 2 → dùng Task 3. `getExtraFee/isPaid/setExtraFee/setPaid` Task 1 → dùng Task 3/4/5. ReceiptCard props `extraFee?/paid?` Task 3 → truyền Task 4/5. revenue* extraFees optional cuối Task 2 → gọi Task 5. ✅

**Rủi ro:** (a) đổi chữ ký revenue* — đã dùng optional cuối + test "không extraFees = như cũ" để bảo 48 test cũ xanh. (b) ReceiptCard lấy extraFee/paid từ store nếu prop không truyền → dialog truyền live (preview realtime), batch truyền snapshot; nhất quán. (c) revenueForDay KHÔNG đổi — phụ phí theo tháng, ghi rõ test.
