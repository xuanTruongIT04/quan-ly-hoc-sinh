# Phase 2b-3 — 2 cột điểm + Buổi 2 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Thêm buổi 2 (trạng thái điểm danh present2, màu riêng trên phiếu, tính theo fee2) và 2 cột điểm (2 số/HS/tháng, nhãn cấu hình config).

**Architecture:** Lát đụng data model nhiều nhất P2b. Đổi `AttendanceRecord.status` thêm 'present2'; tách `countSessions1/2` để `monthlyFee` tính buổi 2 theo fee2; `countSessions` (tổng = present+present2) cho hiển thị. GIỮ 59 test cũ xanh (dữ liệu cũ không có present2 → present2 count = 0 → mọi công thức = như cũ). Điểm số thêm store scores; điểm danh 3 nút.

**Tech Stack:** Next.js 16 + React 19 + TS · Zustand persist · Vitest · (tái dùng shadcn base-nova, html2canvas-pro).

## Global Constraints

- **Buổi 2 = status 'present2'**. Số buổi (hiển thị) = present + present2. Học phí per_session = buổi1×fee + buổi2×feeForSession2, với `feeForSession2 = student.fee2 && student.fee2 > 0 ? student.fee2 : student.fee`. fixed_monthly giữ nguyên.
- **GIỮ 59 test cũ xanh:** dữ liệu cũ chỉ present/absent → countSessions2=0 → công thức = như cũ. countSessions (tổng) với dữ liệu cũ = số present.
- **2 cột điểm = ScorePair {s1:number|null; s2:number|null}** /HS/tháng, key commentKey, persist. Nhãn `CONFIG.scoreLabels: [string,string]`.
- Điểm danh: 3 nút Có(present)/Có B2(present2)/Vắng(absent). markClassPresent + hàng loạt giữ 'present'.
- Buổi 2 badge màu KHÁC trên phiếu. Học phí VND (no /100). Route/file/id English; chữ tiếng Việt. No `any`, no eslint-disable.
- Git: branch `feat/phase2b3-score-session2` từ main. Commit thường xuyên. KHÔNG push nếu chưa yêu cầu. Mỗi task build+test+tsc+lint sạch.

## File Structure

| File | Trách nhiệm |
|------|-------------|
| `src/types/index.ts` | MODIFY — status +'present2'; ScorePair interface |
| `src/lib/config.ts` | MODIFY — scoreLabels |
| `src/lib/fees.ts` | MODIFY — countSessions (tổng) + countSessions1/2 + feeForSession2; monthlyFee; revenueForDay |
| `src/store/useAppStore.ts` | MODIFY — scores + setScore/getScore + partialize |
| `src/components/attendance/AttendanceBoard.tsx` | MODIFY — 3 nút Có/Có B2/Vắng |
| `src/components/receipt/ReceiptCard.tsx` | MODIFY — badge buổi 2 màu khác + 2 dòng điểm |
| `src/components/receipt/ReceiptDialog.tsx` | MODIFY — 2 ô nhập điểm + nút lưu |
| `messages/vi.json` | MODIFY — key score/buổi 2 |

**TDD:** nghiêm cho `fees.ts` (đếm buổi + tính fee2, GIỮ test cũ) và store (scores). UI (điểm danh 3 nút, phiếu) verify bằng build + smoke (mở PNG).

---

### Task 1: Branch + types (present2 + ScorePair) + config scoreLabels

**Files:** MODIFY `src/types/index.ts`, `src/lib/config.ts`

**Interfaces:**
- Produces:
  - `AttendanceRecord.status: 'present' | 'present2' | 'absent'`
  - `interface ScorePair { s1: number | null; s2: number | null }`
  - `CONFIG.scoreLabels: [string, string]`

- [ ] **Step 1: Branch**

```bash
cd /Users/toney/projects/quan-ly-hoc-sinh
git checkout main && git checkout -b feat/phase2b3-score-session2
```

- [ ] **Step 2: Sửa `src/types/index.ts`**

Đổi `AttendanceRecord`:
```ts
export interface AttendanceRecord {
  studentId: string
  date: string
  status: 'present' | 'present2' | 'absent'
}
```
Thêm ScorePair (cuối file):
```ts
export interface ScorePair {
  s1: number | null   // điểm cột 1 (0-10), null = chưa nhập
  s2: number | null   // điểm cột 2
}
```

- [ ] **Step 3: Sửa `src/lib/config.ts`**

Thêm vào CONFIG (sau receiptGreeting):
```ts
  scoreLabels: ['Điểm miệng', 'Điểm viết'] as [string, string],
```

- [ ] **Step 4: Xác minh build + test**

```bash
npm run build && npm test
```
Kỳ vọng: build PASS, 59 test PASS (thêm 'present2' vào union không phá gì; io.ts Zod schema attendance status enum có thể cần cập nhật — xem Step 5).

- [ ] **Step 5: Cập nhật Zod schema import (nếu io.ts validate status)**

Kiểm `src/lib/repositories/io.ts`: nếu `attendanceSchema` có `status: z.enum(['present','absent'])`, đổi thành `z.enum(['present','present2','absent'])` để Import JSON chấp nhận buổi 2. Chạy lại `npm test` (io test) — PASS.

- [ ] **Step 6: Commit**

```bash
git add src/types/index.ts src/lib/config.ts src/lib/repositories/io.ts
git commit -m "feat: types present2 + ScorePair + config scoreLabels"
```

---

### Task 2: fees.ts — countSessions1/2 + monthlyFee dùng fee2 (TDD nghiêm)

**Files:** MODIFY `src/lib/fees.ts`, Test `src/lib/fees.test.ts`

**Interfaces:**
- Produces:
  - `countSessions(studentId, attendance, year, month): number` — TỔNG (present + present2)
  - `countSessions1(studentId, attendance, year, month): number` — chỉ present
  - `countSessions2(studentId, attendance, year, month): number` — chỉ present2
  - `monthlyFee` — per_session = countSessions1×fee + countSessions2×feeForSession2
  - `revenueForDay` — cộng present2 hôm nay × feeForSession2

- [ ] **Step 1: Viết failing test (thêm vào fees.test.ts)**

```ts
describe('buổi 2 (present2) + fee2', () => {
  const s = { id: 'x', fullName: 'X', className: 'L', feeMode: 'per_session' as const, fee: 100000, fee2: 150000, startDate: '2026-07-01', sortOrder: 1 }
  const sNoFee2 = { ...s, id: 'y', fee2: 0 }
  const att = [
    { studentId: 'x', date: '2026-07-02', status: 'present' as const },
    { studentId: 'x', date: '2026-07-04', status: 'present2' as const },   // buổi 2
    { studentId: 'y', date: '2026-07-02', status: 'present' as const },
    { studentId: 'y', date: '2026-07-04', status: 'present2' as const },   // buổi 2, fee2=0
  ]

  it('countSessions = tổng (present + present2)', () => {
    expect(countSessions('x', att, 2026, 7)).toBe(2)
  })
  it('countSessions1 chỉ present, countSessions2 chỉ present2', () => {
    expect(countSessions1('x', att, 2026, 7)).toBe(1)
    expect(countSessions2('x', att, 2026, 7)).toBe(1)
  })
  it('monthlyFee = buổi1×fee + buổi2×fee2 (khi fee2>0)', () => {
    expect(monthlyFee(s, att, 2026, 7)).toBe(100000 + 150000)   // 1×100k + 1×150k
  })
  it('monthlyFee dùng fee cho buổi 2 khi fee2=0 (tránh mất tiền)', () => {
    expect(monthlyFee(sNoFee2, att, 2026, 7)).toBe(100000 + 100000)   // buổi2 dùng fee=100k
  })
})
```

- [ ] **Step 2: Chạy test — FAIL**

```bash
npm test -- src/lib/fees.test.ts
```
Kỳ vọng: FAIL (countSessions1/2 chưa có; countSessions vẫn chỉ present; monthlyFee chưa dùng fee2).

- [ ] **Step 3: Sửa `src/lib/fees.ts`**

```ts
export function countSessions(
  studentId: string, attendance: AttendanceRecord[], year: number, month: number,
): number {
  return attendance.filter(
    (a) => a.studentId === studentId && a.status !== 'absent' && isInMonth(a.date, year, month),
  ).length
}

export function countSessions1(
  studentId: string, attendance: AttendanceRecord[], year: number, month: number,
): number {
  return attendance.filter(
    (a) => a.studentId === studentId && a.status === 'present' && isInMonth(a.date, year, month),
  ).length
}

export function countSessions2(
  studentId: string, attendance: AttendanceRecord[], year: number, month: number,
): number {
  return attendance.filter(
    (a) => a.studentId === studentId && a.status === 'present2' && isInMonth(a.date, year, month),
  ).length
}

function feeForSession2(student: Student): number {
  return student.fee2 && student.fee2 > 0 ? student.fee2 : student.fee
}

export function monthlyFee(
  student: Student, attendance: AttendanceRecord[], year: number, month: number,
): number {
  if (student.feeMode === 'fixed_monthly') return student.fee
  return (
    countSessions1(student.id, attendance, year, month) * student.fee +
    countSessions2(student.id, attendance, year, month) * feeForSession2(student)
  )
}
```
Sửa `revenueForDay` (cộng buổi 2):
```ts
export function revenueForDay(
  students: Student[], attendance: AttendanceRecord[], dateISO: string,
): number {
  return students.reduce((sum, s) => {
    if (s.feeMode !== 'per_session') return sum
    const rec = attendance.find((a) => a.studentId === s.id && a.date === dateISO)
    if (rec?.status === 'present') return sum + s.fee
    if (rec?.status === 'present2') return sum + feeForSession2(s)
    return sum
  }, 0)
}
```
(`classSessionsInMonth` GIỮ NGUYÊN — đã đếm mọi record theo ngày distinct.)

- [ ] **Step 4: Chạy test — PASS**

```bash
npm test -- src/lib/fees.test.ts
```
Kỳ vọng: PASS. `npm test` toàn suite PASS (test cũ: dữ liệu chỉ present → countSessions1 = số present, countSessions2 = 0 → monthlyFee = số present × fee = như cũ; countSessions cũ đếm present, giờ đếm !==absent = vẫn = số present vì không có present2 trong data cũ).

- [ ] **Step 5: Commit**

```bash
git add src/lib/fees.ts src/lib/fees.test.ts
git commit -m "feat: buổi 2 — countSessions1/2 + monthlyFee dùng fee2 (TDD, giữ test cũ)"
```

---

### Task 3: Store scores (setScore/getScore)

**Files:** MODIFY `src/store/useAppStore.ts`, Test `src/store/useAppStore.test.ts`

**Interfaces:**
- Consumes: `commentKey`, `ScorePair` (@/types).
- Produces: state `scores: Record<string, ScorePair>`, `setScore(studentId,year,month,s1,s2): void`, `getScore(studentId,year,month): ScorePair` (default {s1:null,s2:null}); partialize thêm scores.

- [ ] **Step 1: Viết failing test (thêm vào store test)**

```ts
describe('scores', () => {
  beforeEach(() => useAppStore.setState({ scores: {} }))
  it('setScore rồi getScore trả đúng theo tháng', () => {
    useAppStore.getState().setScore('s1', 2026, 7, 8.5, 9)
    expect(useAppStore.getState().getScore('s1', 2026, 7)).toEqual({ s1: 8.5, s2: 9 })
  })
  it('getScore mặc định {s1:null,s2:null}', () => {
    expect(useAppStore.getState().getScore('s1', 2026, 9)).toEqual({ s1: null, s2: null })
  })
  it('cho phép điểm null (chưa nhập)', () => {
    useAppStore.getState().setScore('s1', 2026, 7, null, 7)
    expect(useAppStore.getState().getScore('s1', 2026, 7)).toEqual({ s1: null, s2: 7 })
  })
})
```

- [ ] **Step 2: Chạy test — FAIL**

```bash
npm test -- src/store/useAppStore.test.ts
```
Kỳ vọng: FAIL.

- [ ] **Step 3: Sửa `src/store/useAppStore.ts`**

Thêm `ScorePair` vào import types. Trong AppState:
```ts
  scores: Record<string, ScorePair>
  setScore: (studentId: string, year: number, month: number, s1: number | null, s2: number | null) => void
  getScore: (studentId: string, year: number, month: number) => ScorePair
```
Trong initializer (cạnh extraFees/payments):
```ts
      scores: {},
      setScore: (studentId, year, month, s1, s2) =>
        set((st) => ({ scores: { ...st.scores, [commentKey(studentId, year, month)]: { s1, s2 } } })),
      getScore: (studentId, year, month) =>
        get().scores[commentKey(studentId, year, month)] ?? { s1: null, s2: null },
```
Sửa `partialize` thêm `scores`:
```ts
      partialize: (s) => ({ students: s.students, attendance: s.attendance, comments: s.comments, receiptTheme: s.receiptTheme, extraFees: s.extraFees, payments: s.payments, scores: s.scores }),
```

- [ ] **Step 4: Chạy test — PASS**

```bash
npm test -- src/store/useAppStore.test.ts
```
Kỳ vọng: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/store/useAppStore.ts src/store/useAppStore.test.ts
git commit -m "feat: store điểm số (scores) + setScore/getScore (persist, +test)"
```

---

### Task 4: Điểm danh 3 nút (Có / Có B2 / Vắng)

**Files:** MODIFY `src/components/attendance/AttendanceBoard.tsx`, `messages/vi.json`

**Interfaces:**
- Consumes: `useAppStore` (setAttendance — đã hỗ trợ status bất kỳ qua upsert).
- Produces: mỗi HS 3 nút trạng thái.

- [ ] **Step 1: Thêm key i18n**

`messages/vi.json` namespace `attendance`, thêm: `"present2": "Có B2"`.

- [ ] **Step 2: Sửa `AttendanceBoard.tsx`**

Trong danh sách HS, `statusOf(id)` giữ nguyên (trả status hiện tại). Thay 2 nút bằng 3 nút:
```tsx
<Button size="sm" variant={st === 'present' ? 'default' : 'outline'}
  onClick={() => { setAttendance(s.id, date, 'present'); toast.success(t('saved')) }}>
  {t('present')}
</Button>
<Button size="sm" variant={st === 'present2' ? 'secondary' : 'outline'}
  onClick={() => { setAttendance(s.id, date, 'present2'); toast.success(t('saved')) }}>
  {t('present2')}
</Button>
<Button size="sm" variant={st === 'absent' ? 'destructive' : 'outline'}
  onClick={() => { setAttendance(s.id, date, 'absent'); toast.success(t('saved')) }}>
  {t('absent')}
</Button>
```
(Nếu shadcn base-nova Button không có variant 'secondary', dùng className tùy chỉnh cho nút Có B2 — VD `className={st==='present2' ? 'bg-amber-500 text-white' : ''}` với variant outline. Kiểm `src/components/ui/button.tsx`.)

- [ ] **Step 3: Xác minh build + smoke**

```bash
npm run build && npm test
```
Kỳ vọng: PASS. Smoke: điểm danh 1 HS "Có B2" → cột BUỔI Dashboard +1, học phí tính theo fee2.

- [ ] **Step 4: Commit**

```bash
git add src/components/attendance/AttendanceBoard.tsx messages/vi.json
git commit -m "feat: điểm danh 3 trạng thái — Có / Có B2 (buổi 2) / Vắng"
```

---

### Task 5: ReceiptCard — badge buổi 2 màu khác + 2 dòng điểm; ReceiptDialog — nhập điểm

**Files:** MODIFY `src/components/receipt/ReceiptCard.tsx`, `src/components/receipt/ReceiptDialog.tsx`, `messages/vi.json`

**Interfaces:**
- Consumes: `useAppStore` (getScore), `CONFIG.scoreLabels`, `countSessions1/2` (fees), `ScorePair`.
- Produces: phiếu hiện buổi 2 màu khác + điểm; dialog nhập điểm.

- [ ] **Step 1: Thêm key i18n**

`messages/vi.json` namespace `receipt`, thêm: `"scores": "Điểm", "saveScore": "Lưu điểm", "session2Note": "buổi 2"`.

- [ ] **Step 2: Sửa `ReceiptCard.tsx`**

Thêm import `CONFIG` (đã có), `getScore` từ store; import `ScorePair` type nếu cần; nhận thêm prop `score?: ScorePair` (fallback store).
- Ngày đi học: phân biệt buổi 2. Đổi map dates — hiện tại dùng attendance filter present. Đổi lấy record có status !== absent, và badge màu theo status:
```tsx
const dayRecords = attendance
  .filter((a) => a.studentId === student.id && a.status !== 'absent' && isInMonth(a.date, year, month))
  .sort((a, b) => a.date.localeCompare(b.date))
// render:
{dayRecords.map((r) => (
  <span key={r.date} className={`rounded px-2 py-0.5 text-xs ${r.status === 'present2' ? 'bg-amber-200 text-amber-800' : th.badgeBg}`}>
    {formatDdMm(r.date)}{r.status === 'present2' ? ' (B2)' : ''}
  </span>
))}
```
(Bỏ biến `dates` cũ; `sessions` vẫn = countSessions tổng.)
- Điểm: sau khối nhận xét, nếu score có giá trị:
```tsx
const sc = score ?? getScore(student.id, year, month)
{(sc.s1 != null || sc.s2 != null) && (
  <div className="mt-2 flex justify-center gap-4 text-xs">
    {sc.s1 != null && <span>{CONFIG.scoreLabels[0]}: <b>{sc.s1}</b></span>}
    {sc.s2 != null && <span>{CONFIG.scoreLabels[1]}: <b>{sc.s2}</b></span>}
  </div>
)}
```

- [ ] **Step 3: Sửa `ReceiptDialog.tsx`**

`useAppStore()` thêm `setScore, getScore`. State: `const [s1, setS1] = useState<number|null>(null)`, `const [s2, setS2] = useState<number|null>(null)`.
Trong `syncMonth`: nạp điểm: `const sc = getScore(studentId, y, m); setS1(sc.s1); setS2(sc.s2)`.
Handler:
```ts
function saveScore() {
  setScore(studentId, year, month, s1, s2)
  toast.success(t('saveScore'))
}
```
Truyền `score={{ s1, s2 }}` cho ReceiptCard (live preview).
Thêm UI (cạnh phụ phí): 2 input số + nút lưu điểm:
```tsx
<div className="flex flex-wrap gap-2">
  <input type="number" step="0.1" min={0} max={10} className="w-28 rounded-md border p-2 text-sm"
    placeholder={CONFIG.scoreLabels[0]} value={s1 ?? ''} onChange={(e) => setS1(e.target.value === '' ? null : Number(e.target.value))} />
  <input type="number" step="0.1" min={0} max={10} className="w-28 rounded-md border p-2 text-sm"
    placeholder={CONFIG.scoreLabels[1]} value={s2 ?? ''} onChange={(e) => setS2(e.target.value === '' ? null : Number(e.target.value))} />
  <Button variant="outline" onClick={saveScore}>💾 {t('saveScore')}</Button>
</div>
```
Import `CONFIG` từ `@/lib/config`.

- [ ] **Step 4: Xác minh build + smoke (mở PNG)**

```bash
npm run build && npm test
```
Kỳ vọng: PASS, tsc + lint sạch. Smoke (Chrome MCP): điểm danh 1 buổi 2 (HS có fee2) → phiếu hiện ngày đó màu amber + "(B2)" + tổng tính fee2 + số buổi +1; nhập 2 điểm → hiện trên phiếu (label từ config); tải PNG → MỞ ảnh kiểm buổi 2 màu khác + điểm hiện đúng.

- [ ] **Step 5: Commit**

```bash
git add src/components/receipt/ReceiptCard.tsx src/components/receipt/ReceiptDialog.tsx messages/vi.json
git commit -m "feat: phiếu — ngày buổi 2 màu khác + 2 cột điểm; dialog nhập điểm"
```

---

## Self-Review

**1. Spec coverage:**
- present2 status + đếm tổng + countSessions1/2 → Task 1 (types) + Task 2 (fees) ✅
- monthlyFee buổi 2 theo fee2, fee2=0→fee → Task 2 ✅
- Giữ 59 test cũ (present2=0 → như cũ) → Task 2 ✅
- ScorePair store + scoreLabels config → Task 1 (config) + Task 3 (store) ✅
- Điểm danh 3 nút → Task 4 ✅
- Phiếu buổi 2 màu khác + số buổi tổng + 2 dòng điểm → Task 5 ✅
- Dialog nhập điểm → Task 5 ✅
- io.ts Zod schema chấp nhận present2 → Task 1 Step 5 ✅
- revenueForDay buổi 2 → Task 2 ✅

**2. Placeholder scan:** không TODO/TBD; mọi step code thật. ✅

**3. Type consistency:** `status 'present2'` Task 1 → dùng Task 2/4/5. `ScorePair` Task 1 → dùng Task 3/5. `countSessions1/2`/`feeForSession2` Task 2 → dùng Task 5 (ReceiptCard số buổi). `scores`/`setScore`/`getScore` Task 3 → dùng Task 5. `CONFIG.scoreLabels` Task 1 → dùng Task 5. ✅

**Rủi ro:** (a) đổi countSessions (present→!==absent) — với dữ liệu cũ (không có present2) kết quả không đổi; test cũ xanh. (b) io.ts Zod enum phải thêm present2 nếu không Import JSON có buổi 2 sẽ lỗi — Task 1 Step 5. (c) ReceiptCard đổi `dates`→`dayRecords` — phải chắc `sessions` vẫn = countSessions tổng (đã đúng). (d) Button variant 'secondary' có thể không có ở base-nova → dùng className tùy chỉnh (Task 4 Step 2 note).
