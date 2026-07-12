---
title: SP-3 — Bảng tổng hợp (HS × 12 tháng)
status: Đã lập kế hoạch
created_date: 2026-07-12
completed_date:
owner: Claude (Opus 4.8) + Trang Nhung
---

# SP-3 — Bảng tổng hợp

## Mục tiêu

Trang `/summary`: bảng lớn **học sinh × 12 tháng** của năm đang chọn, mỗi ô = học phí tháng đó,
cột Tổng năm, hàng Tổng lớp theo tháng. Cho Trang Nhung thấy toàn cảnh cả năm 1 màn.
Milestone SP-3/6. Tái dùng `receiptTotal` + `getExtraFee` + `usePeriodStore` (year).

## Quyết định nghiệp vụ (chốt)

- **Năm**: theo `usePeriodStore.year` (có picker năm trên trang; tháng không dùng ở đây).
- **Hàng**: mỗi HS (tất cả, sort sortOrder). **Cột**: STT? không — HỌC SINH | T1..T12 | TỔNG NĂM.
- **Ô**: `receiptTotal(s, attendance, getExtraFee(s.id, year, m), year, m)` cho m=1..12. Bằng 0 → "—".
- **Cột TỔNG NĂM** mỗi HS = Σ 12 ô.
- **Hàng cuối "TỔNG LỚP"**: Σ tất cả HS theo từng tháng + tổng năm toàn bộ.
- Số tiền rút gọn: dùng `formatPrice` (đã có "đ"). Bảng **cuộn ngang** (13-14 cột) — `overflow-x-auto`.

## Kiến trúc

- `src/app/summary/page.tsx` (server) + `src/components/summary/SummaryTable.tsx` (client).
- `SummaryTable`: đọc `useAppStore` (students, attendance, getExtraFee) + `usePeriodStore` (year).
  Tính ma trận `rows[hs][month]` bằng `receiptTotal`. Memo hóa không bắt buộc (data nhỏ).
- Chỉ picker **năm** (tự làm select năm gọn, hoặc tái dùng MonthYearPicker nhưng tháng vô hại) →
  đơn giản: dùng `MonthYearPicker` (year là cái đang cần; tháng còn đó không sao) để nhất quán.
- Tông kẹo ngọt: `candy-table` (cuộn ngang bọc `overflow-x-auto`), tiêu đề Comfortaa, tháng chọn
  highlight nhẹ (cột tháng = usePeriodStore.month → nền hồng nhạt) cho dễ định vị.

## Gắn QUICK MENU

Đổi "Bảng tổng hợp" (nhóm 📊) từ `{type:'toast'}` → `{type:'nav', href:'/summary'}`.

## Ràng buộc

- KHÔNG thêm logic tính (dùng receiptTotal). KHÔNG đổi store. VND. Route/file EN, UI VI.
- Bảng rộng phải cuộn ngang trong container riêng (body trang KHÔNG cuộn ngang).
- Client qua StoreHydration. Giữ 75 test (thuần hiển thị, không bắt buộc test mới). Verify Chrome.

## Success criteria

- `/summary`: bảng HS × T1..T12 + Tổng năm + hàng Tổng lớp, số đúng, cuộn ngang mượt.
- "Bảng tổng hợp" QUICK MENU → /summary. Console sạch; 75 test; build sạch; tông kẹo ngọt.
