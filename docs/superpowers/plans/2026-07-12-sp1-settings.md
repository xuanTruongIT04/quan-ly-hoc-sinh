# SP-1 Thiết lập trung tâm — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Trang `/settings` cho Trang Nhung tự sửa 7 field cấu hình (tên GV, trường, bank, học phí mặc định, lời chào) trong app; VietQR chạy được sau khi điền số TK.

**Architecture:** Store mới `useSettingsStore` (Zustand persist, fallback giá trị gốc từ `config.ts`). Component client đọc settings qua hook thay `import { CONFIG }`. Trang `/settings` + form sửa/lưu. Gắn QUICK MENU + gỡ mục chết.

**Tech Stack:** Next.js 16, React 19, TS, Zustand persist, Zod (không bắt buộc), sonner, Tailwind v4.

## Global Constraints

- KHÔNG đổi logic tính học phí/điểm danh — chỉ đổi NGUỒN đọc config (hằng số → store).
- Giữ `scoreLabels` trong `config.ts` (KHÔNG cho sửa ở SP-1). 7 field sửa được: teacherName, schoolName, bank.{bankCode, accountNumber, accountName}, defaultFee, receiptGreeting.
- Export/Import JSON KHÔNG đụng settings (store riêng key `qlhs_settings_v1`).
- VND (không chia 100). Route/file tiếng Anh, UI tiếng Việt. Tông kẹo ngọt (candy-input/candy-btn, font-heading Comfortaa).
- Client component đọc localStorage qua `StoreHydration` (đã bọc app).
- THÊM test store; giữ 71 test cũ. Mỗi task: `npm test` + `tsc` + `lint` sạch → commit. Verify Chrome. Commit `Co-Authored-By: Claude Opus 4.8`.

---

## Task 1: `useSettingsStore` + type Settings + test

**Files:**
- Modify: `src/types/index.ts` (thêm `Settings`)
- Create: `src/store/useSettingsStore.ts`
- Create: `src/store/useSettingsStore.test.ts`

**Interfaces:**
- Produces: `useSettingsStore` (Zustand) với state `Settings` + `setSettings(patch)`, `resetSettings()`; type `Settings` export từ `@/types`.

- [ ] **Step 1: Thêm type `Settings` vào `src/types/index.ts`**

Thêm cuối file (sau `ScorePair`):

```ts
export interface Settings {
  teacherName: string
  schoolName: string
  defaultFee: number       // VND
  receiptGreeting: string
  bank: BankConfig
}
```

- [ ] **Step 2: Viết test store (fail trước)**

Tạo `src/store/useSettingsStore.test.ts`:

```ts
import { describe, it, expect, beforeEach } from 'vitest'
import { useSettingsStore, DEFAULT_SETTINGS } from './useSettingsStore'

beforeEach(() => {
  useSettingsStore.setState({ ...DEFAULT_SETTINGS })
})

describe('useSettingsStore', () => {
  it('khởi tạo bằng DEFAULT_SETTINGS (từ CONFIG)', () => {
    const s = useSettingsStore.getState()
    expect(s.teacherName).toBe(DEFAULT_SETTINGS.teacherName)
    expect(s.bank.accountName).toBe(DEFAULT_SETTINGS.bank.accountName)
  })

  it('setSettings merge một phần, giữ field khác', () => {
    useSettingsStore.getState().setSettings({ teacherName: 'Cô Nhung' })
    expect(useSettingsStore.getState().teacherName).toBe('Cô Nhung')
    expect(useSettingsStore.getState().schoolName).toBe(DEFAULT_SETTINGS.schoolName)
  })

  it('setSettings merge bank lồng nhau', () => {
    useSettingsStore.getState().setSettings({ bank: { ...useSettingsStore.getState().bank, accountNumber: '123' } })
    expect(useSettingsStore.getState().bank.accountNumber).toBe('123')
  })

  it('resetSettings đưa về DEFAULT_SETTINGS', () => {
    useSettingsStore.getState().setSettings({ teacherName: 'X' })
    useSettingsStore.getState().resetSettings()
    expect(useSettingsStore.getState().teacherName).toBe(DEFAULT_SETTINGS.teacherName)
  })
})
```

- [ ] **Step 3: Run test → FAIL**

Run: `npx vitest run src/store/useSettingsStore.test.ts`
Expected: FAIL "Cannot find module './useSettingsStore'"

- [ ] **Step 4: Viết `src/store/useSettingsStore.ts`**

```ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Settings } from '@/types'
import { CONFIG } from '@/lib/config'

export const DEFAULT_SETTINGS: Settings = {
  teacherName: CONFIG.teacherName,
  schoolName: CONFIG.schoolName,
  defaultFee: CONFIG.defaultFee,
  receiptGreeting: CONFIG.receiptGreeting,
  bank: { ...CONFIG.bank },
}

interface SettingsState extends Settings {
  setSettings: (patch: Partial<Settings>) => void
  resetSettings: () => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,
      setSettings: (patch) => set((s) => ({ ...s, ...patch })),
      resetSettings: () => set({ ...DEFAULT_SETTINGS }),
    }),
    {
      name: 'qlhs_settings_v1',
      partialize: (s) => ({
        teacherName: s.teacherName,
        schoolName: s.schoolName,
        defaultFee: s.defaultFee,
        receiptGreeting: s.receiptGreeting,
        bank: s.bank,
      }),
    },
  ),
)
```

- [ ] **Step 5: Run test → PASS**

Run: `npx vitest run src/store/useSettingsStore.test.ts`
Expected: PASS (4 tests)

- [ ] **Step 6: Full check + commit**

Run: `npm test` (75 pass = 71+4), `npx tsc --noEmit`, `npm run lint` → sạch.

```bash
git add src/types/index.ts src/store/useSettingsStore.ts src/store/useSettingsStore.test.ts
git commit -m "feat(settings): useSettingsStore fallback config.ts + type Settings (+test)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 2: Trang `/settings` + form

**Files:**
- Create: `src/app/settings/page.tsx`
- Create: `src/components/settings/SettingsForm.tsx`

**Interfaces:**
- Consumes: `useSettingsStore` (Task 1), `NAPAS_BANKS` từ `@/lib/napas-banks`.
- Produces: trang sửa 7 field.

- [ ] **Step 1: `page.tsx`**

```tsx
import { SettingsForm } from '@/components/settings/SettingsForm'

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold text-[#c2185b]">🏦 Thiết lập trung tâm</h1>
      <SettingsForm />
    </div>
  )
}
```

- [ ] **Step 2: `SettingsForm.tsx`**

```tsx
'use client'
import { useState } from 'react'
import { toast } from 'sonner'
import { useSettingsStore } from '@/store/useSettingsStore'
import { NAPAS_BANKS } from '@/lib/napas-banks'

export function SettingsForm() {
  const { teacherName, schoolName, defaultFee, receiptGreeting, bank, setSettings, resetSettings } = useSettingsStore()
  const [form, setForm] = useState({ teacherName, schoolName, defaultFee, receiptGreeting, bank })

  function save() {
    setSettings({
      teacherName: form.teacherName.trim(),
      schoolName: form.schoolName.trim(),
      defaultFee: Number.isFinite(form.defaultFee) && form.defaultFee >= 0 ? form.defaultFee : 0,
      receiptGreeting: form.receiptGreeting,
      bank: {
        bankCode: form.bank.bankCode.trim(),
        accountNumber: form.bank.accountNumber.trim(),
        accountName: form.bank.accountName.trim(),
      },
    })
    toast.success('Đã lưu thiết lập ✅')
  }
  function reset() {
    resetSettings()
    const s = useSettingsStore.getState()
    setForm({ teacherName: s.teacherName, schoolName: s.schoolName, defaultFee: s.defaultFee, receiptGreeting: s.receiptGreeting, bank: s.bank })
    toast.info('Đã khôi phục mặc định')
  }

  const Label = ({ children }: { children: React.ReactNode }) => (
    <div className="mb-1 text-xs font-semibold text-[#8d6e63]">{children}</div>
  )

  return (
    <div className="candy-card max-w-lg space-y-4">
      <div>
        <Label>Tên giáo viên</Label>
        <input className="candy-input w-full" value={form.teacherName} onChange={(e) => setForm({ ...form, teacherName: e.target.value })} />
      </div>
      <div>
        <Label>Tên trường / lớp (hiện trên phiếu)</Label>
        <input className="candy-input w-full" value={form.schoolName} onChange={(e) => setForm({ ...form, schoolName: e.target.value })} />
      </div>
      <div>
        <Label>Ngân hàng</Label>
        <select
          className="candy-input w-full"
          value={form.bank.bankCode}
          onChange={(e) => setForm({ ...form, bank: { ...form.bank, bankCode: e.target.value } })}
        >
          <option value="">— Chọn ngân hàng —</option>
          {NAPAS_BANKS.map((b) => <option key={b.code} value={b.code}>{b.name}</option>)}
        </select>
      </div>
      <div>
        <Label>Số tài khoản</Label>
        <input className="candy-input w-full" value={form.bank.accountNumber} onChange={(e) => setForm({ ...form, bank: { ...form.bank, accountNumber: e.target.value } })} />
      </div>
      <div>
        <Label>Tên chủ tài khoản</Label>
        <input className="candy-input w-full" value={form.bank.accountName} onChange={(e) => setForm({ ...form, bank: { ...form.bank, accountName: e.target.value } })} />
      </div>
      <div>
        <Label>Học phí mặc định (VND)</Label>
        <input type="number" min={0} className="candy-input w-full" value={form.defaultFee} onChange={(e) => setForm({ ...form, defaultFee: Number(e.target.value) })} />
      </div>
      <div>
        <Label>Lời chào trên phiếu</Label>
        <input className="candy-input w-full" value={form.receiptGreeting} onChange={(e) => setForm({ ...form, receiptGreeting: e.target.value })} />
      </div>
      <div className="flex gap-2 pt-2">
        <button type="button" className="candy-btn" onClick={save}>💾 Lưu thiết lập</button>
        <button type="button" className="candy-btn-outline" onClick={reset}>↺ Khôi phục mặc định</button>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Verify trang qua Chrome**

Run: `npm run dev` → Chrome:
- `navigate_page` → `http://localhost:3000/settings`
- `take_screenshot` → form 7 field tông kẹo ngọt, select ngân hàng có danh sách
- Sửa "Số tài khoản" = 123456, chọn ngân hàng BIDV, click "Lưu thiết lập" → toast "Đã lưu"
- `evaluate_script`: `JSON.parse(localStorage.getItem('qlhs_settings_v1')).state.bank.accountNumber` → `"123456"`
- `list_console_messages` → sạch

Run: `npx tsc --noEmit` + `npm run lint` + `npm test` (75 pass) → sạch.

- [ ] **Step 4: Commit**

```bash
git add src/app/settings/ src/components/settings/
git commit -m "feat(settings): trang /settings + form sửa 7 field (candy-ngọt)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 3: Đổi các nơi dùng CONFIG → useSettingsStore + verify VietQR

**Files:**
- Modify: `src/components/receipt/VietQrCode.tsx`
- Modify: `src/components/receipt/ReceiptCard.tsx` (schoolName, receiptGreeting)
- Modify: `src/components/layout/AppSidebar.tsx` (teacherName)
- Modify: `src/components/students/StudentForm.tsx` (defaultFee)
- Modify: `src/components/students/BulkImportDialog.tsx` (defaultFee — nếu dùng)

**Interfaces:**
- Consumes: `useSettingsStore` (Task 1).
- Produces: các component đọc settings reactive; VietQR sinh mã khi có bank.

- [ ] **Step 1: Đọc từng file xác định dòng dùng CONFIG**

Run: đọc 5 file trên. Xác định chính xác field CONFIG mỗi file dùng. LƯU Ý: chỉ đổi field settings (teacherName/schoolName/defaultFee/receiptGreeting/bank.*). GIỮ `CONFIG.scoreLabels` (ReceiptCard/ReceiptDialog) nguyên — KHÔNG đổi. Nếu file KHÔNG có `'use client'` (server component) → không dùng được hook; kiểm và giữ CONFIG cho file đó (báo lại). Tất cả 5 file này render client (đã có 'use client' hoặc là con của client).

- [ ] **Step 2: `VietQrCode.tsx` → dùng store**

Thay `import { CONFIG }` bằng `import { useSettingsStore } from '@/store/useSettingsStore'`. Trong component, thay 3 chỗ đọc bank:

```tsx
  const bankCfg = useSettingsStore((s) => s.bank)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const bank = getBank(bankCfg.bankCode)
  const configured = !!bank && !!bankCfg.accountNumber
```

Trong `buildVietQrPayload`: `accountNumber: bankCfg.accountNumber`. Đổi text fallback (dòng 42) bỏ nhắc "src/lib/config.ts" → "⚙️ Chưa cấu hình tài khoản — vào Thiết lập trung tâm để điền". Deps effect: đổi `CONFIG.bank.accountNumber` → `bankCfg.accountNumber` (thêm `bankCfg` vào dep nếu cần).

- [ ] **Step 3: `AppSidebar.tsx` → teacherName từ store**

Thay `import { CONFIG }` → `import { useSettingsStore }`. Trong component: `const teacherName = useSettingsStore((s) => s.teacherName)`. Đổi `{CONFIG.teacherName}` → `{teacherName}`. (AppSidebar đã `'use client'`.)

- [ ] **Step 4: `ReceiptCard.tsx` → schoolName + receiptGreeting từ store, GIỮ scoreLabels**

Thêm `import { useSettingsStore }`. Trong component: `const { schoolName, receiptGreeting } = useSettingsStore()`. Đổi `CONFIG.schoolName` → `schoolName`, `CONFIG.receiptGreeting` → `receiptGreeting`. GIỮ `CONFIG.scoreLabels` (vẫn import CONFIG cho cái này). Xác nhận ReceiptCard là client (nó dùng ref cho html2canvas → client).

- [ ] **Step 5: `StudentForm.tsx` + `BulkImportDialog.tsx` → defaultFee từ store**

`StudentForm.tsx`: thêm `import { useSettingsStore }`; trong `StudentFormFields` thêm `const defaultFee = useSettingsStore((s) => s.defaultFee)`; đổi `CONFIG.defaultFee` → `defaultFee`. Tương tự `BulkImportDialog.tsx` nếu nó dùng `CONFIG.defaultFee` (đọc Step 1 xác nhận; nếu không dùng thì bỏ qua file này).

- [ ] **Step 6: Verify VietQR chạy thật qua Chrome (điểm mấu chốt)**

Chrome:
- Đảm bảo đã lưu bank ở /settings (Task 2: BIDV + 123456). Nếu chưa, vào `/settings` lưu.
- `navigate_page` → `http://localhost:3000/students` → mở 1 ReceiptDialog (nút 🧾 Phiếu)
- `take_screenshot` → khối VietQR giờ hiện **canvas QR thật** (không còn "Chưa cấu hình")
- `evaluate_script`: kiểm có `<canvas>` trong phiếu: `!!document.querySelector('[data-slot=dialog-content] canvas')` → true
- Đổi tên GV ở /settings → về sidebar kiểm tên đổi
- `list_console_messages` → sạch

Run: `npx tsc --noEmit` + `npm run lint` + `npm test` (75 pass) → sạch.

- [ ] **Step 7: Commit**

```bash
git add src/components/receipt/VietQrCode.tsx src/components/receipt/ReceiptCard.tsx src/components/layout/AppSidebar.tsx src/components/students/StudentForm.tsx src/components/students/BulkImportDialog.tsx
git commit -m "feat(settings): đọc config từ useSettingsStore (VietQR/sidebar/phiếu/defaultFee) — VietQR chạy khi điền bank

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 4: Gắn QUICK MENU + gỡ mục chết + final

**Files:**
- Modify: `src/components/layout/QuickMenu.tsx`

- [ ] **Step 1: Đổi "Thiết lập trung tâm" → nav + gỡ mục chết**

Trong `MENU_GROUPS`:
- Nhóm 🔧 QUẢN LÝ: đổi item "Thiết lập trung tâm" action `{ type: 'toast', message: SOON }` → `{ type: 'nav', href: '/settings' }`.
- Xóa item "Chấm công GV" và "Quản trị tài khoản" khỏi nhóm 🔧 QUẢN LÝ (còn 3 item: Quản lý học sinh, Điểm danh hàng loạt, Thiết lập trung tâm).
- Xóa nguyên nhóm "📖 HƯỚNG DẪN & HỖ TRỢ" (cả object) khỏi `MENU_GROUPS`.

Kết quả `MENU_GROUPS` còn 3 nhóm: BẢNG & THỐNG KÊ (5), QUẢN LÝ (3), CẤU HÌNH GIAO DIỆN (1).

- [ ] **Step 2: Verify menu qua Chrome**

Chrome:
- `navigate_page` → `http://localhost:3000`, click nút ⚡ mở panel
- `take_screenshot` → panel còn 3 nhóm; nhóm QUẢN LÝ badge "3"; không còn "Chấm công GV"/"Quản trị tài khoản"/nhóm Hướng dẫn
- Click "Thiết lập trung tâm" → chuyển `/settings` + panel đóng (kiểm URL)
- `list_console_messages` → sạch

- [ ] **Step 3: Full check + commit**

Run: `npm test` (75 pass), `npx tsc --noEmit`, `npm run lint`, `npm run build` (PASS, thêm route /settings).

```bash
git add src/components/layout/QuickMenu.tsx
git commit -m "feat(settings): QUICK MENU — Thiết lập trung tâm điều hướng /settings + gỡ mục chết (3 nhóm)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

- [ ] **Step 4: Final review độc lập (opus)** — dispatch review agent đọc diff SP-1 (store + trang + 5 file đổi CONFIG + menu): bắt (a) file server-component nào lỡ dùng hook gây lỗi, (b) hydration (đọc store ngoài mount), (c) sót CONFIG.scoreLabels bị đổi nhầm, (d) VietQR deps effect, (e) đụng logic ngoài phạm vi. Sửa mọi phát hiện.

---

## Self-Review (đã chạy)

**1. Spec coverage:** store fallback config (T1) · 7 field (T1,T2) · trang /settings (T2) · select bank napas (T2) · đổi 7 nơi CONFIG giữ scoreLabels (T3) · VietQR reactive (T3) · gắn menu + gỡ mục chết (T4) · test store (T1) · Export/Import không đụng settings (store key riêng — T1). Mọi mục spec có task. ✅

**2. Placeholder scan:** T3 Step 1/5 "đọc file xác định" là chỉ dẫn hành động (các file client lớn chưa đọc trong session plan; ép chép sai hơn) — có ghi rõ field cần đổi + điều kiện server/client. Không TBD. ✅

**3. Type consistency:** `Settings`, `DEFAULT_SETTINGS`, `useSettingsStore`, `setSettings`, `resetSettings`, key `qlhs_settings_v1`, `bank.{bankCode,accountNumber,accountName}` — nhất quán T1→T4. Số test 75 = 71+4 nhất quán. ✅
