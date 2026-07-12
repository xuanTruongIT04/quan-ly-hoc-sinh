---
title: SP-4 — Bảng phụ phí
status: Đã lập kế hoạch
created_date: 2026-07-12
completed_date:
owner: Claude (Opus 4.8) + Trang Nhung
---

# SP-4 — Bảng phụ phí

## Mục tiêu

Trang `/extra-fees`: sửa **phụ phí từng HS theo tháng** (số tiền + ghi chú) ở một chỗ, thay vì
phải mở dialog phiếu từng HS. Milestone SP-4/6. Tái dùng `getExtraFee/setExtraFee` + `usePeriodStore`.

## Quyết định nghiệp vụ (chốt)

- **Kỳ**: tháng/năm đang chọn (`usePeriodStore`, có `MonthYearPicker`).
- **Bảng**: mỗi HS (tất cả, sort sortOrder). Cột: HỌC SINH | LỚP | PHỤ PHÍ (input number) | GHI CHÚ (input text) | nút Lưu.
- **Sửa tại chỗ**: mỗi dòng có state cục bộ khởi tạo từ `getExtraFee`; nút "Lưu" → `setExtraFee(id, y, m, amount, note)` (clamp amount ≥ 0, NaN→0). Toast xác nhận.
- **Tổng phụ phí lớp** (1 thẻ trên đầu): Σ amount tất cả HS trong kỳ.
- Không cần nút "Lưu tất cả" (mỗi dòng lưu riêng — đơn giản, rõ ràng).

## Kiến trúc

- `src/app/extra-fees/page.tsx` (server) + `src/components/extra-fees/ExtraFeesTable.tsx` (client).
- `ExtraFeesTable`: đọc `useAppStore` (students, getExtraFee, setExtraFee, extraFees để tính tổng
  reactive) + `usePeriodStore`. Mỗi dòng là component con `ExtraFeeRow` giữ state input riêng, key
  theo `studentId + year + month` để reset khi đổi kỳ. Tổng đọc từ store (reactive sau khi lưu).
- Tông kẹo ngọt: thẻ tổng `candy-card`, bảng `candy-table`, input `candy-input`, nút `candy-btn`.

## Gắn QUICK MENU

Đổi "Bảng phụ phí" (nhóm 📊) từ `{type:'toast'}` → `{type:'nav', href:'/extra-fees'}`.

## Ràng buộc

- Dùng `setExtraFee` sẵn có (đã có clamp trong đường ghi? — clamp lại ở form cho chắc). KHÔNG đổi store.
- VND. Route/file EN, UI VI. Client qua StoreHydration. Giữ 75 test. Verify Chrome (sửa → lưu → reload giữ).

## Success criteria

- `/extra-fees`: sửa phụ phí + ghi chú từng HS, lưu, reload giữ. Thẻ tổng đúng. Đổi kỳ → input reset đúng kỳ.
- "Bảng phụ phí" QUICK MENU → /extra-fees. Console sạch; 75 test; build sạch; tông kẹo ngọt.
