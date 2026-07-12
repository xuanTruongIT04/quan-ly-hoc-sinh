---
title: SP-2 — Quản lý Thu nợ
status: Đã lập kế hoạch
created_date: 2026-07-12
completed_date:
owner: Claude (Opus 4.8) + Trang Nhung
---

# SP-2 — Quản lý Thu nợ

## Mục tiêu

Trang `/debts` cho Trang Nhung xem **ai còn nợ học phí tháng nào**, đánh dấu đã/chưa trả nhanh,
thấy tổng đã thu / còn nợ. Milestone `2026-07-12-menu-features-milestone.md` (SP-2/6).
Tái dùng 100% logic sẵn có (`isPaid/setPaid`, `receiptTotal`, `usePeriodStore`) — KHÔNG thêm logic tính.

## Quyết định nghiệp vụ (chốt)

- **Kỳ**: theo tháng/năm đang chọn (dùng `usePeriodStore` như Dashboard) — có `MonthYearPicker` trên trang.
- **Danh sách**: mọi HS có `receiptTotal > 0` trong kỳ (HS học phí 0 / chưa đi buổi nào → bỏ, không có gì để thu).
- **Cột**: HỌC SINH | LỚP | HỌC PHÍ THÁNG | TRẠNG THÁI (badge Đã trả xanh / Còn nợ đỏ) | nút toggle.
- **Toggle**: 1 nút "Đã trả ✓" / "Chưa trả" mỗi dòng → gọi `setPaid`. Đổi ngay (reactive).
- **Tổng (3 thẻ)**: Đã thu (Σ receiptTotal HS đã trả) · Còn nợ (Σ HS chưa trả) · Tỉ lệ trả (số HS đã trả / tổng HS có phí).
- **Lọc nhanh**: nút chuyển "Tất cả / Chỉ còn nợ / Chỉ đã trả" (mặc định Tất cả).

## Kiến trúc

- File: `src/app/debts/page.tsx` (server) + `src/components/debts/DebtsBoard.tsx` (client).
- `DebtsBoard`: `'use client'`. Đọc `useAppStore` (students, attendance, isPaid, setPaid, getExtraFee),
  `usePeriodStore` (year, month). Tính mỗi HS: `total = receiptTotal(s, attendance, getExtraFee(s.id,y,m), y, m)`,
  `paid = isPaid(s.id, y, m)`. Lọc `total > 0`. Sort theo sortOrder.
- Thẻ tổng: reduce trên danh sách đã lọc.
- Filter state cục bộ `useState<'all'|'unpaid'|'paid'>('all')`.
- Tông kẹo ngọt: `MonthYearPicker` (tái dùng component có sẵn), thẻ tổng dùng `.candy-card`, bảng
  `.candy-table`, badge `.candy-pill`/đỏ, nút toggle `.candy-btn`/`.candy-btn-outline`, tiêu đề Comfortaa.

## Gắn QUICK MENU

Đổi item "Quản lý Thu nợ" (nhóm 📊 BẢNG & THỐNG KÊ) từ `{type:'toast'}` → `{type:'nav', href:'/debts'}`.

## Ràng buộc

- KHÔNG thêm logic tính (dùng `receiptTotal` sẵn có). KHÔNG đổi store (chỉ đọc + `setPaid` đã có).
- VND. Route/file tiếng Anh, UI tiếng Việt. Tông kẹo ngọt. Client đọc store qua StoreHydration.
- KHÔNG bắt buộc test mới (thuần hiển thị + dùng logic đã test); giữ 75 test. Verify Chrome.
- KHÔNG thêm /debts vào sidebar (vào qua QUICK MENU).

## Success criteria

- `/debts`: danh sách HS có phí trong kỳ, badge trạng thái, toggle đã/chưa trả hoạt động (reactive).
- 3 thẻ tổng (đã thu/còn nợ/tỉ lệ) đúng số. Lọc Tất cả/Còn nợ/Đã trả chạy.
- "Quản lý Thu nợ" trong QUICK MENU điều hướng `/debts`.
- Console sạch; 75 test pass; build sạch; tông kẹo ngọt nhất quán.
