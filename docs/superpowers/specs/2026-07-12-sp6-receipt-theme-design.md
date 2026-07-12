---
title: SP-6 — Giao diện phiếu (chọn theme mặc định)
status: Đã lập kế hoạch
created_date: 2026-07-12
completed_date:
owner: Claude (Opus 4.8) + Trang Nhung
---

# SP-6 — Giao diện phiếu

## Mục tiêu

Trang `/receipt-theme`: chọn **theme mặc định cho phiếu học phí** (5 theme) + xem preview trực tiếp,
thay vì phải mở dialog phiếu để đổi. Milestone SP-6/6 (cuối). Tái dùng `ThemePicker` + `ReceiptCard`
+ `setReceiptTheme` (đã có, đã persist trong store).

## Quyết định thiết kế (chốt)

- Trang hiện: tiêu đề + `<ThemePicker />` (5 nút theme sẵn có) + **preview 1 `ReceiptCard`** cập nhật
  realtime theo theme đang chọn.
- **Preview dùng HS đầu tiên** (theo sortOrder) nếu có; nếu KHÔNG có HS nào → hiện thông báo
  "Thêm học sinh để xem trước phiếu" (ReceiptCard cần student thật).
- Chọn theme → `ThemePicker` gọi `setReceiptTheme` (persist localStorage) → mọi phiếu mới mặc định
  theme đó. (Hành vi này đã có sẵn — trang chỉ là chỗ chọn tập trung + preview.)
- KHÔNG cần nút "Lưu" (ThemePicker lưu ngay khi bấm).

## Kiến trúc

- `src/app/receipt-theme/page.tsx` (server) + `src/components/receipt-theme/ThemeChooser.tsx` (client).
- `ThemeChooser`: đọc `useAppStore` (students, receiptTheme), `getTheme(receiptTheme)`. Render
  `<ThemePicker />` + nếu có HS: `<ReceiptCard studentId={firstStudent.id} year month comment=''
  theme={getTheme(receiptTheme)} />` (dùng period hiện tại cho year/month). Preview reactive vì
  `receiptTheme` từ store.
- Preview KHÔNG cần ref (không xuất PNG ở đây) — chỉ hiển thị.
- Tông kẹo ngọt: tiêu đề Comfortaa, ThemePicker sẵn có, preview trong khung nhẹ.

## Gắn QUICK MENU

Đổi "Giao diện phiếu" (nhóm 🎨) từ `{type:'toast'}` → `{type:'nav', href:'/receipt-theme'}`.

## Ràng buộc

- Tái dùng ThemePicker/ReceiptCard/setReceiptTheme — KHÔNG đổi chúng, KHÔNG đổi store.
- ReceiptCard cần student → guard khi rỗng. Client qua StoreHydration. Giữ 79 test. Verify Chrome.
- Route/file EN, UI VI.

## Success criteria

- `/receipt-theme`: 5 nút theme + preview phiếu đổi realtime khi chọn theme; chọn xong phiếu mới dùng theme đó.
- "Giao diện phiếu" QUICK MENU → /receipt-theme. Console sạch; 79 test; build sạch.
