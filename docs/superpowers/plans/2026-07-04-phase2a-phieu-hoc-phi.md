# Phase 2a — Phiếu học phí + VietQR + Nhận xét — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cho Trang Nhung xuất phiếu học phí tháng (ngày đi học + nhận xét + VietQR) cho từng học sinh, mở bằng dialog từ Dashboard/Students, tải ảnh bằng html2canvas.

**Architecture:** Cộng thêm vào Phase 1 (không sửa kiến trúc). VietQR sinh local: hàm thuần `buildVietQrPayload` (EMVCo/NAPAS + CRC16, TDD nghiêm) + thư viện `qrcode` vẽ canvas. Nhận xét thêm vào store Zustand hiện có (persist). Phiếu = ReceiptDialog → ReceiptCard (html2canvas target) + VietQrCode. Fee/số buổi/ngày present tái dùng `lib/fees.ts` Phase 1.

**Tech Stack:** Next.js 16 + React 19 + TS · Tailwind v4 + shadcn/ui (base-nova/@base-ui) · Zustand persist · Vitest · `qrcode` · `html2canvas`.

## Global Constraints

- Bank config trong `src/lib/config.ts`: `bankCode: ''`, `accountNumber: ''`, `accountName: 'NGUYEN TRANG NHUNG'`, `schoolName`, `receiptGreeting`. Trang Nhung tự điền bank + STK sau.
- **VietQR sinh LOCAL** (không dùng img.vietqr.io). `qrcode` vẽ `<canvas>`. `accountName` KHÔNG vào payload — chỉ hiển thị text dưới QR.
- Nhận xét = 1/HS/tháng, key `${studentId}:${year}-${month}`, persist localStorage (thêm 'comments' vào partialize).
- Phiếu = dialog mở từ nút "Phiếu" ở **cả** Dashboard (StudentTable) và Students (StudentList); dialog có ô chọn tháng/năm.
- Học phí VND trực tiếp (KHÔNG chia 100). Route/file/identifier English; chữ hiển thị tiếng Việt (messages/vi.json namespace `receipt`).
- shadcn base-nova: Dialog dùng `render` prop (không `asChild`); Select `onValueChange` null-guard `(v)=>v&&setX(v)`. Xem `src/components/ui/dialog.tsx`, `select.tsx`.
- KHÔNG dùng `any`, KHÔNG `eslint-disable`. Mỗi task: build PASS + test PASS + tsc + lint sạch trước khi commit.
- Git: tạo branch `feat/phase2a-receipt` từ main trước khi code. Commit thường xuyên. KHÔNG push nếu user chưa yêu cầu.
- Ngoài phạm vi (để P2b): phụ phí, nhắc nợ, phiếu lớp, 5 theme, 2 cột điểm, màu buổi 1/2.

## File Structure

| File | Trách nhiệm |
|------|-------------|
| `src/lib/napas-banks.ts` | NEW — map bankCode → {bin, name}; helper `getBank(code)` |
| `src/lib/vietqr.ts` | NEW — `crc16Ccitt`, `buildVietQrPayload` (EMVCo) |
| `src/lib/config.ts` | MODIFY — thêm bank/schoolName/receiptGreeting |
| `src/types/index.ts` | MODIFY — `BankConfig`, `commentKey()` |
| `src/store/useAppStore.ts` | MODIFY — `comments`, `setComment`, `getComment`, partialize |
| `src/components/receipt/VietQrCode.tsx` | NEW — canvas QR hoặc fallback |
| `src/components/receipt/ReceiptCard.tsx` | NEW — layout phiếu (html2canvas target) |
| `src/components/receipt/ReceiptDialog.tsx` | NEW — dialog: chọn tháng + nhận xét + tải ảnh |
| `src/components/dashboard/StudentTable.tsx` | MODIFY — nút "Phiếu" |
| `src/components/students/StudentList.tsx` | MODIFY — nút "Phiếu" |
| `messages/vi.json` | MODIFY — namespace `receipt` |

**Ghi chú TDD:** TDD nghiêm cho `vietqr.ts` + `napas-banks.ts` + store `comments` (logic, dễ sai). UI (VietQrCode/ReceiptCard/ReceiptDialog + nút) verify bằng `npm run build` + smoke test Chrome, không unit-test từng component.

---

### Task 1: Branch + cài deps (qrcode, html2canvas)

**Files:** MODIFY `package.json`

**Interfaces:**
- Consumes: (không có)
- Produces: `qrcode` + `html2canvas` cài xong; branch `feat/phase2a-receipt`.

- [ ] **Step 1: Tạo branch**

```bash
cd /Users/toney/projects/quan-ly-hoc-sinh
git checkout main && git checkout -b feat/phase2a-receipt
```

- [ ] **Step 2: Cài deps**

```bash
npm install qrcode html2canvas
npm install -D @types/qrcode
```

- [ ] **Step 3: Xác minh build + test không phá**

```bash
npm run build && npm test
```
Kỳ vọng: build PASS, 25/25 test PASS.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: cài qrcode + html2canvas cho Phase 2a"
```

---

### Task 2: napas-banks.ts (bảng mã ngân hàng)

**Files:** Create `src/lib/napas-banks.ts`, Test `src/lib/napas-banks.test.ts`

**Interfaces:**
- Consumes: (không có)
- Produces:
  - `interface NapasBank { code: string; bin: string; name: string }`
  - `NAPAS_BANKS: NapasBank[]`
  - `getBank(code: string): NapasBank | undefined`

- [ ] **Step 1: Viết failing test**

`src/lib/napas-banks.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { getBank, NAPAS_BANKS } from './napas-banks'

describe('napas-banks', () => {
  it('tra đúng BIN cho ngân hàng phổ biến', () => {
    expect(getBank('BIDV')?.bin).toBe('970418')
    expect(getBank('VCB')?.bin).toBe('970436')
    expect(getBank('MB')?.bin).toBe('970422')
    expect(getBank('TCB')?.bin).toBe('970407')
    expect(getBank('VPB')?.bin).toBe('970432')
    expect(getBank('ACB')?.bin).toBe('970416')
  })
  it('trả undefined cho mã không tồn tại', () => {
    expect(getBank('XXX')).toBeUndefined()
    expect(getBank('')).toBeUndefined()
  })
  it('mọi BIN là 6 chữ số', () => {
    for (const b of NAPAS_BANKS) expect(b.bin).toMatch(/^\d{6}$/)
  })
})
```

- [ ] **Step 2: Chạy test — FAIL**

```bash
npm test -- src/lib/napas-banks.test.ts
```
Kỳ vọng: FAIL (module chưa có).

- [ ] **Step 3: Viết `src/lib/napas-banks.ts`**

```ts
export interface NapasBank { code: string; bin: string; name: string }

// BIN NAPAS (6 số) cho các ngân hàng phổ biến VN. Nguồn: chuẩn NAPAS VietQR.
export const NAPAS_BANKS: NapasBank[] = [
  { code: 'VCB', bin: '970436', name: 'Vietcombank' },
  { code: 'BIDV', bin: '970418', name: 'BIDV' },
  { code: 'VTB', bin: '970415', name: 'VietinBank' },
  { code: 'AGRIBANK', bin: '970405', name: 'Agribank' },
  { code: 'MB', bin: '970422', name: 'MB Bank' },
  { code: 'TCB', bin: '970407', name: 'Techcombank' },
  { code: 'ACB', bin: '970416', name: 'ACB' },
  { code: 'VPB', bin: '970432', name: 'VPBank' },
  { code: 'TPB', bin: '970423', name: 'TPBank' },
  { code: 'SACOMBANK', bin: '970403', name: 'Sacombank' },
  { code: 'HDBANK', bin: '970437', name: 'HDBank' },
  { code: 'VIB', bin: '970441', name: 'VIB' },
  { code: 'SHB', bin: '970443', name: 'SHB' },
  { code: 'MSB', bin: '970426', name: 'MSB' },
  { code: 'OCB', bin: '970448', name: 'OCB' },
]

export function getBank(code: string): NapasBank | undefined {
  return NAPAS_BANKS.find((b) => b.code === code)
}
```

- [ ] **Step 4: Chạy test — PASS**

```bash
npm test -- src/lib/napas-banks.test.ts
```
Kỳ vọng: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/napas-banks.ts src/lib/napas-banks.test.ts
git commit -m "feat: napas-banks — bảng mã BIN ngân hàng VN (+test)"
```

---

### Task 3: vietqr.ts (payload EMVCo + CRC16) — TDD nghiêm

**Files:** Create `src/lib/vietqr.ts`, Test `src/lib/vietqr.test.ts`

**Interfaces:**
- Consumes: (không có)
- Produces:
  - `crc16Ccitt(input: string): string` — 4 hex ký tự HOA (CRC16-CCITT-FALSE, poly 0x1021, init 0xFFFF)
  - `buildVietQrPayload(args: { bin: string; accountNumber: string; amount?: number; addInfo?: string }): string`

**Bối cảnh EMVCo (quan trọng — chuẩn VietQR NAPAS):** payload là chuỗi các trường `TLV` (Tag 2 số + Length 2 số + Value). Trường 38 (Merchant Account Info) lồng các sub-TLV: `00`=GUID `A000000727`, `01`=Beneficiary Org gồm `00`=Acquirer(bin) + `01`=Consumer(accountNumber), `02`=Service Code `QRIBFTTA`. Cuối chuỗi: `53`=`704`(VND), `54`=amount (nếu có), `58`=`VN`, `62`=Additional Data (`08`=addInfo, nếu có), rồi `6304`+CRC16.

- [ ] **Step 1: Viết failing test (CRC + cấu trúc)**

`src/lib/vietqr.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { crc16Ccitt, buildVietQrPayload } from './vietqr'

describe('crc16Ccitt', () => {
  it('tính đúng CRC16-CCITT-FALSE (giá trị đối chiếu đã biết)', () => {
    // "123456789" → 0x29B1 theo CRC-16/CCITT-FALSE
    expect(crc16Ccitt('123456789')).toBe('29B1')
  })
  it('trả 4 hex ký tự HOA', () => {
    expect(crc16Ccitt('ABC')).toMatch(/^[0-9A-F]{4}$/)
  })
})

describe('buildVietQrPayload', () => {
  const payload = buildVietQrPayload({ bin: '970418', accountNumber: '31410001234567', amount: 200000, addInfo: 'Hoc phi' })

  it('bắt đầu bằng Payload Format Indicator 000201 và POI 010212 (dynamic có amount)', () => {
    expect(payload.startsWith('000201010212')).toBe(true)
  })
  it('chứa GUID NAPAS và service QRIBFTTA và bin/account trong field 38', () => {
    expect(payload).toContain('A000000727')
    expect(payload).toContain('QRIBFTTA')
    expect(payload).toContain('970418')
    expect(payload).toContain('31410001234567')
  })
  it('chứa currency 5303704, amount 54..200000, country 5802VN', () => {
    expect(payload).toContain('5303704')
    expect(payload).toContain('54' + '06' + '200000') // len 06 cho "200000"
    expect(payload).toContain('5802VN')
  })
  it('kết thúc bằng 6304 + CRC hợp lệ (CRC của toàn chuỗi tới hết "6304")', () => {
    const withoutCrc = payload.slice(0, -4)
    expect(withoutCrc.endsWith('6304')).toBe(true)
    expect(payload.slice(-4)).toBe(crc16Ccitt(withoutCrc))
  })
  it('static (không amount): POI = 010211, không có field 54', () => {
    const p = buildVietQrPayload({ bin: '970418', accountNumber: '123', amount: undefined })
    expect(p.startsWith('000201010211')).toBe(true)
    expect(p).not.toContain('5406')
  })
})
```

- [ ] **Step 2: Chạy test — FAIL**

```bash
npm test -- src/lib/vietqr.test.ts
```
Kỳ vọng: FAIL (module chưa có).

- [ ] **Step 3: Viết `src/lib/vietqr.ts`**

```ts
// Xây payload QR chuyển khoản theo chuẩn EMVCo / VietQR (NAPAS).

function tlv(tag: string, value: string): string {
  const len = String(value.length).padStart(2, '0')
  return `${tag}${len}${value}`
}

// CRC-16/CCITT-FALSE: poly 0x1021, init 0xFFFF, no reflect, xorout 0x0000.
export function crc16Ccitt(input: string): string {
  let crc = 0xffff
  for (let i = 0; i < input.length; i++) {
    crc ^= input.charCodeAt(i) << 8
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1
      crc &= 0xffff
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0')
}

export function buildVietQrPayload(args: {
  bin: string
  accountNumber: string
  amount?: number
  addInfo?: string
}): string {
  const { bin, accountNumber, amount, addInfo } = args

  // Field 38 — Merchant Account Information (lồng)
  const beneficiary = tlv('00', bin) + tlv('01', accountNumber)
  const merchantAccount =
    tlv('00', 'A000000727') + tlv('01', beneficiary) + tlv('02', 'QRIBFTTA')

  let payload =
    tlv('00', '01') + // Payload Format Indicator
    tlv('01', amount != null ? '12' : '11') + // POI: 12 dynamic, 11 static
    tlv('38', merchantAccount) +
    tlv('53', '704') // currency VND

  if (amount != null) payload += tlv('54', String(Math.round(amount)))
  payload += tlv('58', 'VN') // country

  if (addInfo) payload += tlv('62', tlv('08', addInfo)) // Additional Data → Purpose

  payload += '6304' // CRC tag + length
  payload += crc16Ccitt(payload)
  return payload
}
```

- [ ] **Step 4: Chạy test — PASS**

```bash
npm test -- src/lib/vietqr.test.ts
```
Kỳ vọng: PASS hết. Nếu CRC test đầu (`123456789`→`29B1`) fail, kiểm lại thuật toán (không reflect, init 0xFFFF).

- [ ] **Step 5: Commit**

```bash
git add src/lib/vietqr.ts src/lib/vietqr.test.ts
git commit -m "feat: vietqr — buildVietQrPayload EMVCo + CRC16 (TDD nghiêm)"
```

---

### Task 4: config.ts + types (bank config)

**Files:** MODIFY `src/lib/config.ts`, `src/types/index.ts`

**Interfaces:**
- Consumes: (không có)
- Produces:
  - `interface BankConfig { bankCode: string; accountNumber: string; accountName: string }`
  - `commentKey(studentId: string, year: number, month: number): string` → `"s1:2026-07"`
  - `CONFIG` thêm: `schoolName`, `bank: BankConfig`, `receiptGreeting`

- [ ] **Step 1: Thêm types vào `src/types/index.ts`**

Thêm vào cuối file:
```ts
export interface BankConfig {
  bankCode: string       // key tra napas-banks (VD 'BIDV'); '' = chưa cấu hình
  accountNumber: string  // '' = chưa cấu hình
  accountName: string
}

export function commentKey(studentId: string, year: number, month: number): string {
  return `${studentId}:${year}-${String(month).padStart(2, '0')}`
}
```

- [ ] **Step 2: Sửa `src/lib/config.ts`**

```ts
import type { BankConfig } from '@/types'

const bank: BankConfig = {
  bankCode: '',            // Trang Nhung điền: VD 'BIDV' (xem src/lib/napas-banks.ts)
  accountNumber: '',       // Trang Nhung điền số tài khoản
  accountName: 'NGUYEN TRANG NHUNG',
}

export const CONFIG = {
  teacherName: 'Trang Nhung',
  siteName: 'Quản lý học sinh',
  schoolName: 'LỚP HỌC TRANG NHUNG',   // tên hiển thị trên phiếu
  defaultFee: 100000, // VND
  bank,
  receiptGreeting: '🌸 Chúc cả nhà một ngày tuyệt vời!',
} as const
```

- [ ] **Step 3: Xác minh build + test**

```bash
npm run build && npm test
```
Kỳ vọng: build PASS (CONFIG.siteName vẫn dùng ở layout — không đổi tên cũ), test 25/25 PASS. `npx tsc --noEmit` sạch.

- [ ] **Step 4: Commit**

```bash
git add src/lib/config.ts src/types/index.ts
git commit -m "feat: config bank (VietQR) + BankConfig type + commentKey"
```

---

### Task 5: Store nhận xét (comments)

**Files:** MODIFY `src/store/useAppStore.ts`, Test `src/store/useAppStore.test.ts`

**Interfaces:**
- Consumes: `commentKey` (Task 4).
- Produces (thêm vào store):
  - state `comments: Record<string, string>`
  - `setComment(studentId: string, year: number, month: number, text: string): void`
  - `getComment(studentId: string, year: number, month: number): string`
  - partialize thêm `comments`.

- [ ] **Step 1: Viết failing test (thêm vào cuối describe hiện có)**

Thêm vào `src/store/useAppStore.test.ts`:
```ts
describe('comments', () => {
  beforeEach(() => useAppStore.setState({ comments: {} }))

  it('setComment rồi getComment trả đúng theo studentId + tháng', () => {
    useAppStore.getState().setComment('s1', 2026, 7, 'Bé tiến bộ')
    expect(useAppStore.getState().getComment('s1', 2026, 7)).toBe('Bé tiến bộ')
  })
  it('getComment trả chuỗi rỗng khi chưa có', () => {
    expect(useAppStore.getState().getComment('s1', 2026, 9)).toBe('')
  })
  it('nhận xét tách biệt theo tháng', () => {
    const st = useAppStore.getState()
    st.setComment('s1', 2026, 7, 'Tháng 7')
    st.setComment('s1', 2026, 8, 'Tháng 8')
    expect(useAppStore.getState().getComment('s1', 2026, 7)).toBe('Tháng 7')
    expect(useAppStore.getState().getComment('s1', 2026, 8)).toBe('Tháng 8')
  })
})
```

- [ ] **Step 2: Chạy test — FAIL**

```bash
npm test -- src/store/useAppStore.test.ts
```
Kỳ vọng: FAIL (comments/setComment/getComment chưa có).

- [ ] **Step 3: Sửa `src/store/useAppStore.ts`**

Thêm import: `import { commentKey } from '@/types'` (hoặc để cùng file types đã export).
Trong interface `AppState` thêm:
```ts
  comments: Record<string, string>
  setComment: (studentId: string, year: number, month: number, text: string) => void
  getComment: (studentId: string, year: number, month: number) => string
```
Trong initializer (cạnh students/attendance), thêm state + actions:
```ts
      comments: {},

      setComment: (studentId, year, month, text) =>
        set((st) => ({ comments: { ...st.comments, [commentKey(studentId, year, month)]: text } })),

      getComment: (studentId, year, month) => get().comments[commentKey(studentId, year, month)] ?? '',
```
Sửa `partialize`:
```ts
      partialize: (s) => ({ students: s.students, attendance: s.attendance, comments: s.comments }),
```
Lưu ý: nếu SEED_DATA chưa có `comments`, khởi tạo state `comments: {}` (không lấy từ SEED). Đảm bảo `commentKey` import từ `@/types`.

- [ ] **Step 4: Chạy test — PASS**

```bash
npm test -- src/store/useAppStore.test.ts
```
Kỳ vọng: PASS (cả test cũ + mới).

- [ ] **Step 5: Commit**

```bash
git add src/store/useAppStore.ts src/store/useAppStore.test.ts
git commit -m "feat: store nhận xét — comments/setComment/getComment (persist, +test)"
```

---

### Task 6: VietQrCode.tsx (canvas QR + fallback)

**Files:** Create `src/components/receipt/VietQrCode.tsx`

**Interfaces:**
- Consumes: `buildVietQrPayload` (Task 3), `getBank` (Task 2), `CONFIG.bank` (Task 4), `qrcode`.
- Produces: `<VietQrCode amount={number} addInfo={string} />` — vẽ canvas QR, hoặc fallback nếu bank chưa cấu hình.

- [ ] **Step 1: Viết `src/components/receipt/VietQrCode.tsx`**

```tsx
'use client'
import { useEffect, useRef } from 'react'
import QRCode from 'qrcode'
import { CONFIG } from '@/lib/config'
import { getBank } from '@/lib/napas-banks'
import { buildVietQrPayload } from '@/lib/vietqr'

export function VietQrCode({ amount, addInfo }: { amount: number; addInfo: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const bank = getBank(CONFIG.bank.bankCode)
  const configured = !!bank && !!CONFIG.bank.accountNumber

  useEffect(() => {
    if (!configured || !bank || !canvasRef.current) return
    const payload = buildVietQrPayload({
      bin: bank.bin,
      accountNumber: CONFIG.bank.accountNumber,
      amount,
      addInfo,
    })
    QRCode.toCanvas(canvasRef.current, payload, { width: 180, margin: 1 }).catch(() => {})
  }, [configured, bank, amount, addInfo])

  if (!configured) {
    return (
      <div className="flex h-[180px] w-[180px] items-center justify-center rounded-lg border border-dashed border-pink-300 bg-pink-50 p-3 text-center text-xs text-pink-500">
        ⚙️ Chưa cấu hình tài khoản ngân hàng trong src/lib/config.ts
      </div>
    )
  }
  return <canvas ref={canvasRef} className="rounded-lg" />
}
```

- [ ] **Step 2: Xác minh build**

```bash
npm run build
```
Kỳ vọng: PASS. `npx tsc --noEmit` sạch. `npx eslint src/components/receipt` sạch.

- [ ] **Step 3: Commit**

```bash
git add src/components/receipt/VietQrCode.tsx
git commit -m "feat: VietQrCode — canvas QR local (fallback khi chưa cấu hình bank)"
```

---

### Task 7: ReceiptCard.tsx (layout phiếu — html2canvas target)

**Files:** Create `src/components/receipt/ReceiptCard.tsx`, MODIFY `messages/vi.json`

**Interfaces:**
- Consumes: `useAppStore` (students, attendance), `countSessions`/`monthlyFee` (fees), `formatPrice` (utils), `CONFIG`, `getBank`, `VietQrCode` (Task 6).
- Produces: `<ReceiptCard studentId year month comment />` (forwardRef tới div gốc để html2canvas chụp).

- [ ] **Step 1: Thêm namespace `receipt` vào `messages/vi.json`**

Thêm key mới (không sửa key cũ):
```json
"receipt": {
  "title": "PHIẾU HỌC PHÍ", "month": "Tháng", "student": "Học sinh",
  "feePerSession": "Học phí / buổi", "sessions": "Số buổi học", "total": "TỔNG HỌC PHÍ",
  "attendedDates": "NGÀY ĐI HỌC", "comment": "NHẬN XÉT", "sessionUnit": "buổi",
  "open": "Phiếu", "saveComment": "Lưu nhận xét", "download": "📥 Tải phiếu",
  "commentPlaceholder": "Viết lời nhắn học tập...", "notConfigured": "Chưa cấu hình tài khoản ngân hàng"
}
```

- [ ] **Step 2: Viết `src/components/receipt/ReceiptCard.tsx`**

```tsx
'use client'
import { forwardRef } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { countSessions, monthlyFee } from '@/lib/fees'
import { formatPrice, isInMonth } from '@/lib/utils'
import { CONFIG } from '@/lib/config'
import { getBank } from '@/lib/napas-banks'
import { VietQrCode } from './VietQrCode'

function formatDdMm(iso: string): string {
  const [, m, d] = iso.split('-')
  return `${d}/${m}`
}

export const ReceiptCard = forwardRef<HTMLDivElement, { studentId: string; year: number; month: number; comment: string }>(
  function ReceiptCard({ studentId, year, month, comment }, ref) {
    const { students, attendance } = useAppStore()
    const student = students.find((s) => s.id === studentId)
    if (!student) return null

    const sessions = countSessions(student.id, attendance, year, month)
    const total = monthlyFee(student, attendance, year, month)
    const dates = attendance
      .filter((a) => a.studentId === student.id && a.status === 'present' && isInMonth(a.date, year, month))
      .map((a) => a.date)
      .sort()
    const bank = getBank(CONFIG.bank.bankCode)

    return (
      <div ref={ref} className="mx-auto w-[360px] rounded-2xl bg-gradient-to-b from-pink-50 to-purple-50 p-5 text-sm text-gray-700">
        <div className="text-center">
          <div className="text-xs font-semibold text-purple-500">{CONFIG.schoolName}</div>
          <h2 className="text-lg font-extrabold text-pink-600">🧾 PHIẾU HỌC PHÍ</h2>
          <div className="text-xs text-gray-500">Tháng {month}/{year}</div>
        </div>
        <div className="mt-3 space-y-1">
          <div className="flex justify-between"><span>👨‍🎓 Học sinh</span><span className="font-semibold">{student.fullName}</span></div>
          <div className="flex justify-between"><span>💎 Học phí / buổi</span><span>{formatPrice(student.fee)}</span></div>
          <div className="flex justify-between"><span>📝 Số buổi học</span><span>{sessions} buổi</span></div>
        </div>
        <div className="mt-3 rounded-xl bg-white/70 p-3 text-center">
          <div className="text-xs text-gray-500">TỔNG HỌC PHÍ</div>
          <div className="text-2xl font-extrabold text-pink-600">{formatPrice(total)}</div>
        </div>
        {dates.length > 0 && (
          <div className="mt-3">
            <div className="text-xs font-semibold text-gray-500">NGÀY ĐI HỌC</div>
            <div className="mt-1 flex flex-wrap gap-1">
              {dates.map((d) => <span key={d} className="rounded bg-purple-100 px-2 py-0.5 text-xs">{formatDdMm(d)}</span>)}
            </div>
          </div>
        )}
        <div className="mt-3 border-t border-dashed border-pink-200 pt-2 text-center">
          <div className="text-xs font-semibold text-gray-500">— NHẬN XÉT —</div>
          {comment && <div className="mt-1 italic">{comment}</div>}
          <div className="mt-1 text-xs text-pink-500">{CONFIG.receiptGreeting}</div>
        </div>
        <div className="mt-3 flex flex-col items-center gap-1">
          <VietQrCode amount={total} addInfo={`Hoc phi ${student.fullName}`} />
          {bank && CONFIG.bank.accountNumber && (
            <div className="text-center text-xs">
              <div>{bank.name} · {CONFIG.bank.accountNumber}</div>
              <div className="font-semibold">{CONFIG.bank.accountName}</div>
            </div>
          )}
        </div>
      </div>
    )
  },
)
```

- [ ] **Step 3: Xác minh build**

```bash
npm run build && npm test
```
Kỳ vọng: build PASS, 25/25 (+3 comment) test PASS. tsc + eslint (`src/components/receipt`, `messages`) sạch.

- [ ] **Step 4: Commit**

```bash
git add src/components/receipt/ReceiptCard.tsx messages/vi.json
git commit -m "feat: ReceiptCard — layout phiếu học phí (html2canvas target)"
```

---

### Task 8: ReceiptDialog.tsx (chọn tháng + nhận xét + tải ảnh)

**Files:** Create `src/components/receipt/ReceiptDialog.tsx`

**Interfaces:**
- Consumes: `useAppStore` (setComment/getComment), `ReceiptCard` (Task 7), shadcn Dialog/Button/Select/Input, `html2canvas`, `toast`, `useTranslations('receipt')`.
- Produces: `<ReceiptDialog studentId defaultYear defaultMonth trigger />` — dialog phiếu.

- [ ] **Step 1: Viết `src/components/receipt/ReceiptDialog.tsx`**

```tsx
'use client'
import { useRef, useState } from 'react'
import html2canvas from 'html2canvas'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import { useAppStore } from '@/store/useAppStore'
import { ReceiptCard } from './ReceiptCard'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1)
const YEARS = [2026, 2027, 2028]

export function ReceiptDialog({
  studentId, defaultYear, defaultMonth, trigger,
}: { studentId: string; defaultYear: number; defaultMonth: number; trigger: React.ReactElement }) {
  const t = useTranslations('receipt')
  const { students, setComment, getComment } = useAppStore()
  const [open, setOpen] = useState(false)
  const [year, setYear] = useState(defaultYear)
  const [month, setMonth] = useState(defaultMonth)
  const [comment, setLocalComment] = useState('')
  const cardRef = useRef<HTMLDivElement>(null)
  const student = students.find((s) => s.id === studentId)

  // Khi mở dialog hoặc đổi tháng: nạp nhận xét đã lưu.
  function syncComment(y: number, m: number) {
    setLocalComment(getComment(studentId, y, m))
  }

  function onOpenChange(o: boolean) {
    setOpen(o)
    if (o) syncComment(year, month)
  }

  function save() {
    setComment(studentId, year, month, comment)
    toast.success(t('saveComment'))
  }

  async function download() {
    if (!cardRef.current) return
    const canvas = await html2canvas(cardRef.current, { backgroundColor: null, scale: 2 })
    const link = document.createElement('a')
    link.download = `phieu-hoc-phi-${student?.fullName ?? 'hs'}-${year}-${String(month).padStart(2, '0')}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger render={trigger} />
      <DialogContent>
        <DialogHeader><DialogTitle>{t('title')} — {student?.fullName}</DialogTitle></DialogHeader>
        <div className="flex gap-2">
          <Select value={String(month)} onValueChange={(v) => { if (v) { setMonth(Number(v)); syncComment(year, Number(v)) } }}>
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent>{MONTHS.map((m) => <SelectItem key={m} value={String(m)}>Tháng {m}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={String(year)} onValueChange={(v) => { if (v) { setYear(Number(v)); syncComment(Number(v), month) } }}>
            <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
            <SelectContent>{YEARS.map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="max-h-[60vh] overflow-auto py-2">
          <ReceiptCard ref={cardRef} studentId={studentId} year={year} month={month} comment={comment} />
        </div>
        <textarea
          className="min-h-16 w-full rounded-md border p-2 text-sm"
          placeholder={t('commentPlaceholder')}
          value={comment}
          onChange={(e) => setLocalComment(e.target.value)}
        />
        <DialogFooter>
          <Button variant="outline" onClick={save}>✨ {t('saveComment')}</Button>
          <Button onClick={download}>{t('download')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 2: Xác minh build**

```bash
npm run build && npm test
```
Kỳ vọng: build PASS, test PASS. tsc + eslint sạch.

- [ ] **Step 3: Commit**

```bash
git add src/components/receipt/ReceiptDialog.tsx
git commit -m "feat: ReceiptDialog — chọn tháng + sửa nhận xét + tải ảnh (html2canvas)"
```

---

### Task 9: Nút "Phiếu" ở Dashboard + Students

**Files:** MODIFY `src/components/dashboard/StudentTable.tsx`, `src/components/students/StudentList.tsx`

**Interfaces:**
- Consumes: `ReceiptDialog` (Task 8), `usePeriodStore` (Dashboard — year/month), `localTodayISO` (Students — tháng hiện tại).
- Produces: mỗi dòng HS có nút "Phiếu" → mở ReceiptDialog.

- [ ] **Step 1: Thêm nút vào `StudentTable.tsx` (Dashboard)**

Thêm import: `import { ReceiptDialog } from '@/components/receipt/ReceiptDialog'` và `import { Button } from '@/components/ui/button'`.
Thêm 1 cột "" ở header (hoặc dùng cột HỌC PHÍ) và trong mỗi row, thêm cell:
```tsx
<TableCell className="text-right">
  <ReceiptDialog
    studentId={s.id}
    defaultYear={year}
    defaultMonth={month}
    trigger={<Button size="sm" variant="outline">{t('receiptBtn')}</Button>}
  />
</TableCell>
```
Cập nhật `colSpan` của dòng noResults (đang 5 → 6 nếu thêm cột). Thêm header cột: `<TableHead></TableHead>`. Thêm key i18n `dashboard.receiptBtn = "Phiếu"` vào messages/vi.json (hoặc dùng `useTranslations('receipt')('open')`).

- [ ] **Step 2: Thêm nút vào `StudentList.tsx` (Students)**

Thêm import ReceiptDialog. Trong cột "Thao tác", thêm nút Phiếu (tháng hiện tại từ `localTodayISO()`):
```tsx
// đầu component:
const now = localTodayISO().split('-') // ['2026','07','04']
const curYear = Number(now[0]); const curMonth = Number(now[1])
// trong cell Thao tác, cạnh Sửa/Xóa:
<ReceiptDialog studentId={s.id} defaultYear={curYear} defaultMonth={curMonth}
  trigger={<Button variant="outline" size="sm">Phiếu</Button>} />
```
Import `localTodayISO` từ `@/lib/utils`.

- [ ] **Step 3: Xác minh build + smoke test**

```bash
npm run build && npm test
```
Kỳ vọng: build PASS, test PASS, tsc + lint sạch. Smoke (Chrome DevTools MCP): `npm run dev` → Dashboard, bấm "Phiếu" 1 HS → dialog hiện phiếu (tổng/ngày/nhận xét), đổi tháng → dữ liệu đổi, QR hiện fallback (chưa cấu hình bank), gõ nhận xét → Lưu → mở lại thấy còn; bấm Tải phiếu → PNG tải về. Kiểm cả màn Students.

- [ ] **Step 4: Commit**

```bash
git add src/components/dashboard/StudentTable.tsx src/components/students/StudentList.tsx messages/vi.json
git commit -m "feat: nút Phiếu ở Dashboard + Students → mở ReceiptDialog"
```

---

## Self-Review

**1. Spec coverage:**
- VietQR sinh local + CRC16 → Task 3 (TDD) ✅; bảng BIN → Task 2 ✅
- Bank config trong config.ts (rỗng, tên NGUYEN TRANG NHUNG) → Task 4 ✅
- Nhận xét 1/HS/tháng persist → Task 5 (TDD) ✅
- VietQR fallback khi chưa cấu hình → Task 6 ✅
- Phiếu layout (tổng/ngày present/nhận xét/QR/lời chào) bám bản gốc → Task 7 ✅
- Dialog chọn tháng + sửa nhận xét + tải ảnh html2canvas → Task 8 ✅
- Nút Phiếu ở CẢ Dashboard + Students → Task 9 ✅
- accountName không vào payload, chỉ text → Task 3 (payload không dùng accountName) + Task 7 (hiển thị text) ✅
- Phiếu tháng rỗng (0 buổi) → Task 7 (dates.length===0 ẩn khối ngày; tổng 0đ) ✅

**2. Placeholder scan:** không có TODO/TBD; mọi step code có nội dung thật. ✅

**3. Type consistency:** `buildVietQrPayload({bin,accountNumber,amount?,addInfo?})` nhất quán Task 3→6. `getBank(code)` Task 2→6/7. `commentKey`/`setComment`/`getComment` Task 4→5→8. `BankConfig`/`CONFIG.bank` Task 4→6/7. `ReceiptCard` forwardRef nhận `{studentId,year,month,comment}` Task 7→8. `ReceiptDialog` props `{studentId,defaultYear,defaultMonth,trigger}` Task 8→9. ✅

**Rủi ro ghi chú:** (a) CRC16 test đối chiếu `123456789→29B1` là chuẩn CRC-16/CCITT-FALSE — nếu sai, thuật toán lệch. (b) html2canvas + canvas QR: QR vẽ bằng `qrcode` lên canvas trong DOM → html2canvas chụp được (không CORS-taint vì không phải img external). (c) base-nova Dialog `render` prop + Select null-guard đã lường trong Global Constraints.
