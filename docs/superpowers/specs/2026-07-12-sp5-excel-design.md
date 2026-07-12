---
title: SP-5 — Xuất Excel
status: Đã lập kế hoạch
created_date: 2026-07-12
completed_date:
owner: Claude (Opus 4.8) + Trang Nhung
---

# SP-5 — Xuất Excel

## Mục tiêu

Xuất **Bảng tổng hợp** (HS × 12 tháng + tổng) ra file `.xlsx` để Trang Nhung lưu/gửi. Milestone SP-5/6.
Thêm thư viện `xlsx` (SheetJS, đã cài `^0.18.5`).

## Quyết định thiết kế (chốt)

- **Xuất cái gì**: bảng tổng hợp năm đang chọn — dữ liệu giá trị nhất, tái dùng logic SP-3 (`receiptTotal`).
- **Nút**: "📊 Xuất Excel" đặt NGAY trên trang `/summary` (xuất đúng bảng đang xem). Mục menu
  "Xuất Excel" (nhóm 📊) → điều hướng `/summary` (nơi có nút xuất).
- **File**: `bang-tong-hop-<year>.xlsx`, 1 sheet "Tổng hợp <year>". Hàng đầu = tiêu đề
  (Học sinh, Lớp, T1..T12, Tổng năm), các hàng HS, hàng cuối TỔNG LỚP. Số = number thật (Excel
  tự format), KHÔNG dùng formatPrice (để Excel tính/sum được).

## Kiến trúc

- Hàm thuần `src/lib/export-excel.ts`: `exportSummaryXlsx(students, attendance, getExtraFee, year)`
  → build mảng 2D (AOA) → `XLSX.utils.aoa_to_sheet` → `XLSX.utils.book_new` + `book_append_sheet`
  → `XLSX.writeFile(wb, filename)`. Nhận `getExtraFee` như tham số (không import store — hàm thuần, test được).
  Trả về tên file (để test/verify). **Tách logic build AOA** thành `buildSummaryAoa(...)` (thuần, TEST được)
  và phần `XLSX.writeFile` (side-effect, không test).
- `SummaryTable.tsx`: thêm nút "📊 Xuất Excel" cạnh MonthYearPicker → gọi `exportSummaryXlsx(...)`.
- Menu: "Xuất Excel" → nav `/summary`.

## Test (có logic → THÊM test)

`src/lib/export-excel.test.ts`: test `buildSummaryAoa` — đúng số hàng (HS + header + tổng),
đúng giá trị ô (dùng student fixed_monthly để total tiên đoán được), hàng tổng đúng.

## Ràng buộc

- Dùng `receiptTotal` sẵn có cho từng ô (nhất quán SP-3). VND number thật trong Excel.
- `XLSX.writeFile` chỉ chạy client (nút onClick) — hàm build AOA thuần chạy được ở test (Node).
- Route/file EN, UI VI. Giữ 75 test + thêm test mới. Verify Chrome (bấm xuất → file tải).

## Success criteria

- Trang /summary có nút "Xuất Excel" → tải `bang-tong-hop-2026.xlsx` mở được, số đúng.
- Menu "Xuất Excel" → /summary. Test buildSummaryAoa pass. Console sạch; build sạch; tông kẹo ngọt.
