# Phase 3-1 — Thống kê / Biểu đồ doanh thu — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Thêm 4 biểu đồ thống kê doanh thu (Chart.js) trên Dashboard: doanh thu 12 tháng, doanh thu theo ngày, thẻ tổng quan, tỉ lệ đã trả/nợ.

**Architecture:** Không đụng data model — đọc students/attendance/extraFees/payments sẵn có, tính thống kê trong `lib/stats.ts` (thuần, TDD) tái dùng fees.ts. Chart.js (`chart.js` + `react-chartjs-2`) render client-side; đã có StoreHydration bọc app nên an toàn SSR.

**Tech Stack:** Next.js 16 + React 19 + TS · Zustand · Vitest · chart.js + react-chartjs-2 (mới).

## Global Constraints

- KHÔNG đụng data model. Chỉ thêm lib/stats.ts + chart components + sửa app/page.tsx + messages.
- 4 biểu đồ: doanh thu 12 tháng (cột, năm đang chọn) · doanh thu theo ngày (tháng đang chọn) · thẻ tổng quan · tròn đã trả/nợ.
- Month/year-scoped: đọc year/month từ usePeriodStore. Tiền VND format bằng `formatPrice`. Học phí VND (no /100).
- Đặt biểu đồ trên Dashboard (dưới bảng HS), KHÔNG thêm route/nav.
- Chart component 'use client'. Route/file/id English; chữ tiếng Việt (messages/vi.json). No `any`, no eslint-disable.
- Git: branch `feat/phase3-1-stats` từ main. Commit thường xuyên. KHÔNG push nếu chưa yêu cầu. Mỗi task build+test+tsc+lint sạch.

## File Structure

| File | Trách nhiệm |
|------|-------------|
| `src/lib/stats.ts` | NEW — revenueByMonth/ByDay, paidVsUnpaid, statsSummary (thuần) |
| `src/lib/chart-setup.ts` | NEW — register Chart.js components |
| `src/components/dashboard/charts/DashboardCharts.tsx` | NEW — gộp 4, lưới, client |
| `src/components/dashboard/charts/RevenueMonthChart.tsx` | NEW — Bar 12 tháng |
| `src/components/dashboard/charts/RevenueDayChart.tsx` | NEW — Bar theo ngày |
| `src/components/dashboard/charts/PaidPieChart.tsx` | NEW — Doughnut |
| `src/components/dashboard/charts/StatsSummaryCards.tsx` | NEW — thẻ số liệu |
| `src/app/page.tsx` | MODIFY — thêm DashboardCharts |
| `messages/vi.json` | MODIFY — nhãn biểu đồ |

**TDD:** nghiêm cho `lib/stats.ts` (logic số liệu). Chart components verify bằng build + smoke.

---

### Task 1: Branch + deps + stats.ts (TDD)

**Files:** MODIFY `package.json`; Create `src/lib/stats.ts`, `src/lib/stats.test.ts`

**Interfaces:**
- Consumes: `revenueForMonth/revenueForYear/revenueForDay/countSessions/receiptTotal` (fees.ts), `commentKey` (@/types).
- Produces:
  - `revenueByMonth(students, attendance, year, extraFees?): number[]` (length 12)
  - `revenueByDayInMonth(students, attendance, year, month, extraFees?): { day: number; amount: number }[]`
  - `paidVsUnpaid(students, attendance, extraFees, payments, year, month): { paid: number; unpaid: number }`
  - `statsSummary(students, attendance, extraFees, year, month): { yearTotal: number; monthAvg: number; totalSessions: number; studentCount: number }`

- [ ] **Step 1: Branch + cài deps**

```bash
cd /Users/toney/projects/quan-ly-hoc-sinh
git checkout main && git checkout -b feat/phase3-1-stats
npm install chart.js react-chartjs-2
```

- [ ] **Step 2: Viết failing test `src/lib/stats.test.ts`**

```ts
import { describe, it, expect } from 'vitest'
import { revenueByMonth, revenueByDayInMonth, paidVsUnpaid, statsSummary } from './stats'
import type { Student, AttendanceRecord, ExtraFee } from '@/types'

const s: Student = { id: 'p', fullName: 'P', className: 'L', feeMode: 'per_session', fee: 100000, startDate: '2026-07-01', sortOrder: 1 }
const att: AttendanceRecord[] = [
  { studentId: 'p', date: '2026-07-02', status: 'present' },
  { studentId: 'p', date: '2026-07-04', status: 'present' },
  { studentId: 'p', date: '2026-08-01', status: 'present' },
]
const extraFees: Record<string, ExtraFee> = { 'p:2026-07': { amount: 50000, note: '' } }

describe('revenueByMonth', () => {
  it('trả mảng 12 phần tử, doanh thu đúng theo tháng (cộng phụ phí)', () => {
    const arr = revenueByMonth([s], att, 2026, extraFees)
    expect(arr).toHaveLength(12)
    expect(arr[6]).toBe(200000 + 50000)   // tháng 7 (index 6): 2 buổi×100k + 50k phụ phí
    expect(arr[7]).toBe(100000)            // tháng 8: 1 buổi
    expect(arr[0]).toBe(0)                 // tháng 1: 0
  })
})

describe('revenueByDayInMonth', () => {
  it('số phần tử = số ngày trong tháng; amount đúng ngày có present', () => {
    const days = revenueByDayInMonth([s], att, 2026, 7, extraFees)
    expect(days).toHaveLength(31)   // tháng 7 có 31 ngày
    expect(days.find((d) => d.day === 2)?.amount).toBe(100000)   // 02/07 có present
    expect(days.find((d) => d.day === 3)?.amount).toBe(0)        // 03/07 không
  })
})

describe('paidVsUnpaid', () => {
  it('chỉ đếm HS có phải thu > 0; đã trả/nợ đúng', () => {
    const payments = { 'p:2026-07': true }
    const r = paidVsUnpaid([s], att, extraFees, payments, 2026, 7)
    expect(r).toEqual({ paid: 1, unpaid: 0 })
  })
  it('HS phải thu = 0 không được đếm', () => {
    const r = paidVsUnpaid([s], att, {}, {}, 2026, 9)   // tháng 9 không buổi → total 0
    expect(r).toEqual({ paid: 0, unpaid: 0 })
  })
})

describe('statsSummary', () => {
  it('yearTotal/monthAvg/totalSessions/studentCount', () => {
    const sum = statsSummary([s], att, extraFees, 2026, 7)
    expect(sum.studentCount).toBe(1)
    expect(sum.totalSessions).toBe(2)                   // tháng 7 có 2 buổi
    expect(sum.yearTotal).toBe(200000 + 50000 + 100000) // T7(250k)+T8(100k)
    expect(sum.monthAvg).toBe(Math.round((200000 + 50000 + 100000) / 12))
  })
})
```

- [ ] **Step 3: Chạy test — FAIL**

```bash
npm test -- src/lib/stats.test.ts
```
Kỳ vọng: FAIL (module chưa có).

- [ ] **Step 4: Viết `src/lib/stats.ts`**

```ts
import type { Student, AttendanceRecord, ExtraFee } from '@/types'
import { commentKey } from '@/types'
import { revenueForMonth, revenueForYear, revenueForDay, countSessions, receiptTotal } from './fees'

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}

export function revenueByMonth(
  students: Student[], attendance: AttendanceRecord[], year: number,
  extraFees: Record<string, ExtraFee> = {},
): number[] {
  const arr: number[] = []
  for (let m = 1; m <= 12; m++) arr.push(revenueForMonth(students, attendance, year, m, extraFees))
  return arr
}

export function revenueByDayInMonth(
  students: Student[], attendance: AttendanceRecord[], year: number, month: number,
  _extraFees: Record<string, ExtraFee> = {},
): { day: number; amount: number }[] {
  const n = daysInMonth(year, month)
  const out: { day: number; amount: number }[] = []
  for (let d = 1; d <= n; d++) {
    const iso = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    out.push({ day: d, amount: revenueForDay(students, attendance, iso) })
  }
  return out
}

export function paidVsUnpaid(
  students: Student[], attendance: AttendanceRecord[],
  extraFees: Record<string, ExtraFee>, payments: Record<string, boolean>,
  year: number, month: number,
): { paid: number; unpaid: number } {
  let paid = 0
  let unpaid = 0
  for (const s of students) {
    const ef = extraFees[commentKey(s.id, year, month)] ?? { amount: 0, note: '' }
    const total = receiptTotal(s, attendance, ef, year, month)
    if (total <= 0) continue
    if (payments[commentKey(s.id, year, month)]) paid++
    else unpaid++
  }
  return { paid, unpaid }
}

export function statsSummary(
  students: Student[], attendance: AttendanceRecord[],
  extraFees: Record<string, ExtraFee>, year: number, month: number,
): { yearTotal: number; monthAvg: number; totalSessions: number; studentCount: number } {
  const yearTotal = revenueForYear(students, attendance, year, extraFees)
  const totalSessions = students.reduce((sum, s) => sum + countSessions(s.id, attendance, year, month), 0)
  return {
    yearTotal,
    monthAvg: Math.round(yearTotal / 12),
    totalSessions,
    studentCount: students.length,
  }
}
```
Lưu ý: `revenueByDayInMonth` dùng `revenueForDay` (chỉ per_session present/present2 theo ngày) — phụ phí không theo ngày nên tham số `_extraFees` không dùng (giữ để chữ ký nhất quán với các hàm khác; đặt tên `_` để eslint không cảnh báo unused).

- [ ] **Step 5: Chạy test — PASS**

```bash
npm test -- src/lib/stats.test.ts
```
Kỳ vọng: PASS. `npm test` toàn suite PASS (66 cũ không phá). `npm run build` PASS.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json src/lib/stats.ts src/lib/stats.test.ts
git commit -m "feat: stats.ts — thống kê doanh thu (byMonth/byDay/paidVsUnpaid/summary) + Chart.js deps (+test)"
```

---

### Task 2: chart-setup + StatsSummaryCards + 3 chart components

**Files:** Create `src/lib/chart-setup.ts`, `src/components/dashboard/charts/StatsSummaryCards.tsx`, `RevenueMonthChart.tsx`, `RevenueDayChart.tsx`, `PaidPieChart.tsx`; MODIFY `messages/vi.json`

**Interfaces:**
- Consumes: stats.ts (Task 1), `usePeriodStore`, `useAppStore`, `formatPrice`, react-chartjs-2.
- Produces: 4 component nhận data qua props (hoặc tự đọc store).

- [ ] **Step 1: Thêm key i18n**

`messages/vi.json` thêm namespace `stats`:
```json
"stats": {
  "revenueByMonth": "Doanh thu 12 tháng", "revenueByDay": "Doanh thu theo ngày",
  "paidRatio": "Tỉ lệ thanh toán", "paid": "Đã trả", "unpaid": "Còn nợ",
  "yearTotal": "Tổng năm", "monthAvg": "TB / tháng", "totalSessions": "Tổng buổi (tháng)", "students": "Học sinh",
  "noData": "Chưa có dữ liệu"
}
```

- [ ] **Step 2: Viết `src/lib/chart-setup.ts`**

```ts
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend)
```

- [ ] **Step 3: Viết `StatsSummaryCards.tsx`**

```tsx
'use client'
import { useTranslations } from 'next-intl'
import { useAppStore } from '@/store/useAppStore'
import { usePeriodStore } from '@/store/usePeriodStore'
import { statsSummary } from '@/lib/stats'
import { formatPrice } from '@/lib/utils'
import { Card } from '@/components/ui/card'

export function StatsSummaryCards() {
  const t = useTranslations('stats')
  const { students, attendance, extraFees } = useAppStore()
  const { year, month } = usePeriodStore()
  const s = statsSummary(students, attendance, extraFees, year, month)
  const items = [
    { label: t('yearTotal'), value: formatPrice(s.yearTotal) },
    { label: t('monthAvg'), value: formatPrice(s.monthAvg) },
    { label: t('totalSessions'), value: String(s.totalSessions) },
    { label: t('students'), value: String(s.studentCount) },
  ]
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {items.map((i) => (
        <Card key={i.label} className="p-3">
          <div className="text-xs text-gray-500">{i.label}</div>
          <div className="mt-1 text-lg font-bold text-pink-600">{i.value}</div>
        </Card>
      ))}
    </div>
  )
}
```

- [ ] **Step 4: Viết `RevenueMonthChart.tsx`**

```tsx
'use client'
import '@/lib/chart-setup'
import { Bar } from 'react-chartjs-2'
import { useTranslations } from 'next-intl'
import { useAppStore } from '@/store/useAppStore'
import { usePeriodStore } from '@/store/usePeriodStore'
import { revenueByMonth } from '@/lib/stats'
import { formatPrice } from '@/lib/utils'

export function RevenueMonthChart() {
  const t = useTranslations('stats')
  const { students, attendance, extraFees } = useAppStore()
  const { year, month } = usePeriodStore()
  const data = revenueByMonth(students, attendance, year, extraFees)
  const chartData = {
    labels: Array.from({ length: 12 }, (_, i) => `T${i + 1}`),
    datasets: [{
      label: t('revenueByMonth'),
      data,
      backgroundColor: data.map((_, i) => (i + 1 === month ? '#db2777' : '#f9a8d4')),
    }],
  }
  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: (c: { parsed: { y: number } }) => formatPrice(c.parsed.y) } },
    },
    scales: { y: { ticks: { callback: (v: number | string) => formatPrice(Number(v)) } } },
  }
  return (
    <div>
      <div className="mb-1 text-sm font-semibold text-gray-600">{t('revenueByMonth')} — {year}</div>
      <Bar data={chartData} options={options} />
    </div>
  )
}
```

- [ ] **Step 5: Viết `RevenueDayChart.tsx`**

```tsx
'use client'
import '@/lib/chart-setup'
import { Bar } from 'react-chartjs-2'
import { useTranslations } from 'next-intl'
import { useAppStore } from '@/store/useAppStore'
import { usePeriodStore } from '@/store/usePeriodStore'
import { revenueByDayInMonth } from '@/lib/stats'
import { formatPrice } from '@/lib/utils'

export function RevenueDayChart() {
  const t = useTranslations('stats')
  const { students, attendance, extraFees } = useAppStore()
  const { year, month } = usePeriodStore()
  const days = revenueByDayInMonth(students, attendance, year, month, extraFees)
  const chartData = {
    labels: days.map((d) => String(d.day)),
    datasets: [{ label: t('revenueByDay'), data: days.map((d) => d.amount), backgroundColor: '#a78bfa' }],
  }
  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: (c: { parsed: { y: number } }) => formatPrice(c.parsed.y) } },
    },
    scales: { y: { ticks: { callback: (v: number | string) => formatPrice(Number(v)) } } },
  }
  return (
    <div>
      <div className="mb-1 text-sm font-semibold text-gray-600">{t('revenueByDay')} — {month}/{year}</div>
      <Bar data={chartData} options={options} />
    </div>
  )
}
```

- [ ] **Step 6: Viết `PaidPieChart.tsx`**

```tsx
'use client'
import '@/lib/chart-setup'
import { Doughnut } from 'react-chartjs-2'
import { useTranslations } from 'next-intl'
import { useAppStore } from '@/store/useAppStore'
import { usePeriodStore } from '@/store/usePeriodStore'
import { paidVsUnpaid } from '@/lib/stats'

export function PaidPieChart() {
  const t = useTranslations('stats')
  const { students, attendance, extraFees, payments } = useAppStore()
  const { year, month } = usePeriodStore()
  const { paid, unpaid } = paidVsUnpaid(students, attendance, extraFees, payments, year, month)
  if (paid + unpaid === 0) {
    return (
      <div>
        <div className="mb-1 text-sm font-semibold text-gray-600">{t('paidRatio')}</div>
        <div className="flex h-40 items-center justify-center text-sm text-gray-400">{t('noData')}</div>
      </div>
    )
  }
  const chartData = {
    labels: [t('paid'), t('unpaid')],
    datasets: [{ data: [paid, unpaid], backgroundColor: ['#22c55e', '#ef4444'] }],
  }
  return (
    <div>
      <div className="mb-1 text-sm font-semibold text-gray-600">{t('paidRatio')} — {month}/{year}</div>
      <Doughnut data={chartData} options={{ responsive: true }} />
    </div>
  )
}
```

- [ ] **Step 7: Xác minh build**

```bash
npm run build && npm test
```
Kỳ vọng: build PASS, test PASS. tsc + eslint (`src/lib/chart-setup.ts`, `src/components/dashboard/charts`, `messages`) sạch. Nếu Chart.js type callback phàn nàn, dùng type inline như trên (không `any`).

- [ ] **Step 8: Commit**

```bash
git add src/lib/chart-setup.ts src/components/dashboard/charts messages/vi.json
git commit -m "feat: chart components — summary + revenue tháng/ngày + tỉ lệ trả/nợ (Chart.js)"
```

---

### Task 3: DashboardCharts + gắn vào Dashboard

**Files:** Create `src/components/dashboard/charts/DashboardCharts.tsx`; MODIFY `src/app/page.tsx`

**Interfaces:**
- Consumes: 4 component (Task 2).
- Produces: khu biểu đồ trên Dashboard.

- [ ] **Step 1: Viết `DashboardCharts.tsx`**

```tsx
'use client'
import { StatsSummaryCards } from './StatsSummaryCards'
import { RevenueMonthChart } from './RevenueMonthChart'
import { RevenueDayChart } from './RevenueDayChart'
import { PaidPieChart } from './PaidPieChart'
import { Card } from '@/components/ui/card'

export function DashboardCharts() {
  return (
    <div className="space-y-4">
      <StatsSummaryCards />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-4"><RevenueMonthChart /></Card>
        <Card className="p-4"><PaidPieChart /></Card>
      </div>
      <Card className="p-4"><RevenueDayChart /></Card>
    </div>
  )
}
```

- [ ] **Step 2: Sửa `src/app/page.tsx`**

Thêm import `DashboardCharts` và render dưới `<StudentTable />`:
```tsx
import { DashboardCharts } from '@/components/dashboard/charts/DashboardCharts'
// trong JSX, sau <StudentTable />:
<DashboardCharts />
```

- [ ] **Step 3: Xác minh build + smoke**

```bash
npm run build && npm test
```
Kỳ vọng: PASS. Smoke (Chrome MCP): Dashboard cuộn xuống → thấy 4 thẻ số liệu + biểu đồ cột 12 tháng (tháng đang chọn màu đậm) + doughnut trả/nợ + biểu đồ ngày; đổi tháng → biểu đồ ngày + doughnut cập nhật; đổi năm → cột 12 tháng cập nhật; không lỗi console.

- [ ] **Step 4: Commit**

```bash
git add src/components/dashboard/charts/DashboardCharts.tsx src/app/page.tsx
git commit -m "feat: DashboardCharts — khu biểu đồ thống kê trên Dashboard"
```

---

## Self-Review

**1. Spec coverage:**
- revenueByMonth/ByDay/paidVsUnpaid/statsSummary → Task 1 (TDD) ✅
- Chart.js deps + register → Task 1 (deps) + Task 2 (chart-setup) ✅
- 4 biểu đồ (cột 12 tháng, ngày, thẻ, tròn trả/nợ) → Task 2 ✅
- Đặt trên Dashboard dưới bảng → Task 3 ✅
- Month/year-scoped (đọc usePeriodStore) → Task 2/3 (mọi chart đọc period) ✅
- formatPrice trên trục/tooltip → Task 2 ✅
- Rỗng: pie 0/0 → noData → Task 2 (PaidPieChart) ✅
- 'use client' + StoreHydration an toàn SSR → mọi chart 'use client' ✅

**2. Placeholder scan:** không TODO/TBD; mọi step code thật. ✅

**3. Type consistency:** `revenueByMonth/ByDay/paidVsUnpaid/statsSummary` chữ ký Task 1 → gọi đúng Task 2. `usePeriodStore` {year,month} + `useAppStore` {students,attendance,extraFees,payments} dùng nhất quán. ✅

**Rủi ro:** (a) Chart.js SSR — mọi chart 'use client' + app đã bọc StoreHydration (render sau mount) → không lỗi canvas trên server. (b) react-chartjs-2 v5 hợp React 19 (kiểm khi cài; nếu peer-dep cảnh báo, vẫn chạy). (c) Type callback tooltip/ticks — dùng type inline (không any). (d) Dashboard dài hơn — chấp nhận (đúng yêu cầu 1b).
