# Thiết kế: Phase 3-1 — Thống kê / Biểu đồ doanh thu (Dashboard)

- **Ngày:** 2026-07-09
- **Chủ dự án / người dùng:** Trang Nhung
- **Sản phẩm tham chiếu:** [phieuhocphi.com](https://phieuhocphi.com) (dùng Chart.js)
- **Phase:** 3-1 (lát đầu của Phase 3). Tiền đề: toàn bộ P1 + P2 xong.

## 1. Mục tiêu

Cho Trang Nhung xem **doanh thu trực quan** bằng biểu đồ (Chart.js) ngay trên Dashboard. KHÔNG đụng mô hình dữ liệu —
chỉ đọc dữ liệu sẵn có (students/attendance/extraFees/payments) và tính thống kê.

**P3-1 làm:** biểu đồ doanh thu 12 tháng (cột) · doanh thu theo ngày trong tháng · thẻ tổng quan số liệu · tỉ lệ đã trả/nợ (tròn).
**P3-1 KHÔNG làm (để P3-2):** lịch dạy, điểm danh giáo viên.

## 2. Quyết định đã chốt

- **Đặt biểu đồ NGAY trên Dashboard** (dưới bảng học sinh), KHÔNG thêm route/nav riêng.
- **Đủ 4 loại:** doanh thu 12 tháng (cột, năm đang chọn) · doanh thu theo ngày (tháng đang chọn) · thẻ tổng quan · tròn đã trả/nợ.
- Biểu đồ 12 tháng = **năm đang chọn** (không so sánh nhiều năm).
- **Month/year-scoped:** đổi tháng/năm ở picker → biểu đồ ngày + tròn + thẻ cập nhật; đổi năm → biểu đồ 12 tháng cập nhật.
- Dùng **Chart.js** (`chart.js` + `react-chartjs-2`). Tiền VND format bằng `formatPrice` trên trục/tooltip.

## 3. Kiến trúc (đọc data sẵn có, không đụng model)

```
src/
├─ lib/stats.ts                  # NEW — revenueByMonth/ByDay, paidVsUnpaid, statsSummary (thuần, test)
├─ lib/chart-setup.ts            # NEW — register Chart.js components (1 lần)
├─ components/dashboard/charts/
│  ├─ DashboardCharts.tsx        # NEW — gộp 4, lưới 2 cột, 'use client', đọc period + store
│  ├─ RevenueMonthChart.tsx      # NEW — Bar 12 tháng
│  ├─ RevenueDayChart.tsx        # NEW — Bar theo ngày
│  ├─ PaidPieChart.tsx           # NEW — Doughnut đã trả/nợ
│  └─ StatsSummaryCards.tsx      # NEW — thẻ số liệu tổng quan
├─ app/page.tsx                  # MODIFY — thêm <DashboardCharts/> dưới bảng
└─ messages/vi.json              # MODIFY — nhãn biểu đồ
```

**Dependency mới:** `chart.js` + `react-chartjs-2`.

## 4. Logic thống kê (`lib/stats.ts` — thuần, TDD)

```ts
import type { Student, AttendanceRecord, ExtraFee } from '@/types'

// Doanh thu từng tháng T1..T12 của năm (mảng 12 phần tử, index 0 = tháng 1)
revenueByMonth(students, attendance, year, extraFees): number[]   // length 12
// = [revenueForMonth(..., 1, extraFees), ..., revenueForMonth(..., 12, extraFees)]

// Doanh thu theo ngày trong tháng: mảng {day, amount} cho các ngày 1..số-ngày-trong-tháng
revenueByDayInMonth(students, attendance, year, month, extraFees): { day: number; amount: number }[]
// amount ngày d = revenueForDay(students, attendance, `${year}-${MM}-${DD}`)  (chỉ per_session present/present2)

// Đếm HS đã trả / còn nợ tháng (chỉ tính HS có phải thu > 0)
paidVsUnpaid(students, attendance, extraFees, payments, year, month): { paid: number; unpaid: number }
// với mỗi HS: total = receiptTotal(...); nếu total > 0 → payments[commentKey] ? paid++ : unpaid++

// Thẻ tổng quan
statsSummary(students, attendance, extraFees, year, month): {
  yearTotal: number       // revenueForYear(..., extraFees)
  monthAvg: number        // yearTotal / 12
  totalSessions: number   // Σ countSessions mọi HS tháng đang chọn
  studentCount: number    // students.length
}
```
Tái dùng `revenueForMonth/revenueForYear/revenueForDay/countSessions/receiptTotal` từ `fees.ts`, `commentKey` từ types.

## 5. Components & luồng

### chart-setup.ts
Register 1 lần: `ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend, ...)`. Import ở các chart component.

### DashboardCharts.tsx ('use client')
Đọc `year, month` từ `usePeriodStore`; `students, attendance, extraFees, payments` từ `useAppStore`. Lưới 2 cột (responsive 1 cột mobile):
- Hàng 1: StatsSummaryCards (số liệu) full-width
- Hàng 2: RevenueMonthChart | PaidPieChart
- Hàng 3: RevenueDayChart full-width
Mỗi chart nhận data đã tính từ stats.ts.

### Các chart
- **RevenueMonthChart** (Bar): trục X = T1..T12, Y = doanh thu (formatPrice tooltip), highlight tháng đang chọn.
- **RevenueDayChart** (Bar): trục X = ngày 1..n, Y = doanh thu ngày.
- **PaidPieChart** (Doughnut): 2 lát Đã trả / Còn nợ (màu xanh/đỏ), tâm hiện tổng.
- **StatsSummaryCards**: 4 ô số (tổng năm, TB/tháng, tổng buổi tháng, số HS) — formatPrice cho tiền.

### app/page.tsx
Thêm `<DashboardCharts />` dưới `<StudentTable />`. Bám period đang chọn.

## 6. Test & xử lý lỗi

- **TDD `lib/stats.ts`:** revenueByMonth (mảng 12 đúng, cộng phụ phí); revenueByDayInMonth (số phần tử = số ngày trong tháng, amount đúng); paidVsUnpaid (chỉ đếm HS total>0; đã trả/nợ đúng); statsSummary (yearTotal/monthAvg/totalSessions/studentCount).
- **Chart components:** verify build + smoke (biểu đồ render, đổi tháng/năm → cập nhật, không lỗi console). Không unit-test canvas.
- **Rỗng:** không HS / doanh thu 0 → biểu đồ hiện trục trống, không crash; pie 0/0 → hiện "chưa có dữ liệu".
- **SSR:** chart component 'use client' + đã có StoreHydration bọc app → không lỗi hydration/canvas trên server.

## 7. Ngoài phạm vi P3-1 (để P3-2)

Lịch dạy, điểm danh giáo viên (chấm công GV). Deploy Vercel + bàn giao cuối Phase 3.
