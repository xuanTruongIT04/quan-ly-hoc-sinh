---
title: Milestone — Làm thật toàn bộ tính năng QUICK MENU
status: Đã lập kế hoạch
created_date: 2026-07-12
completed_date:
owner: Claude (Opus 4.8) + Trang Nhung
---

# Milestone — Tính năng thật cho QUICK MENU

## Bối cảnh

QUICK MENU (đã merge) có 14 mục nhưng phần lớn toast "Đang phát triển". Trang Nhung yêu cầu
**làm thật** các tính năng. Sau brainstorm phân rã + chốt phạm vi: **gỡ nhóm không hợp app cá nhân**
(Chấm công GV — P3-2 đã hủy; Quản trị tài khoản; nhóm Hướng dẫn & Hỗ trợ), **làm 6 tính năng mới**.

Ràng buộc xuyên suốt: 1 người dùng, localStorage, KHÔNG DB thật. Tái dùng logic sẵn có tối đa
(`payments/isPaid/setPaid`, `extraFees/getExtraFee`, `scores`, `stats.ts`, `fees.ts`, `exportJson`).

## Menu cuối cùng (sau khi gỡ mục chết)

- **📊 BẢNG & THỐNG KÊ**: Xem Điểm Danh Tháng ✅(có) · Quản lý Thu nợ 🆕 · Bảng phụ phí 🆕 · Xuất Excel 🆕 · Bảng tổng hợp 🆕
- **🔧 QUẢN LÝ**: Quản lý học sinh ✅ · Điểm danh hàng loạt ✅ · Thiết lập trung tâm 🆕
- **🎨 CẤU HÌNH GIAO DIỆN**: Giao diện phiếu 🆕
- ~~📖 HƯỚNG DẪN & HỖ TRỢ~~ (gỡ) · ~~Chấm công GV~~ (gỡ) · ~~Quản trị tài khoản~~ (gỡ)

## Roadmap 6 sub-project (làm tuần tự, mỗi cái spec→plan→code→gắn menu riêng)

| # | Sub-project | Route | Tái dùng | Ghi chú |
|---|-------------|-------|----------|---------|
| **SP-1** | 🏦 Thiết lập trung tâm | `/settings` | CONFIG → store | Làm trước: mở khóa VietQR (điền số TK trong app), các trang sau đọc settings |
| **SP-2** | 💳 Quản lý Thu nợ | `/debts` | `isPaid/setPaid`, `receiptTotal` | Giá trị cao nhất cho Trang Nhung |
| **SP-3** | 📋 Bảng tổng hợp | `/summary` | `revenueForMonth/Year`, `statsSummary` | HS × 12 tháng |
| **SP-4** | 💰 Bảng phụ phí | `/extra-fees` | `getExtraFee/setExtraFee` | Trang riêng phụ phí |
| **SP-5** | 📊 Xuất Excel | (nút trong các trang) | SheetJS + SP-2/3/4 | Xuất .xlsx |
| **SP-6** | 🎨 Giao diện phiếu | `/receipt-theme` | `setReceiptTheme` | Chọn theme mặc định |

## Nguyên tắc chung mọi sub-project

- Mỗi SP: brainstorm (nếu cần) → spec riêng `docs/superpowers/specs/` → plan → code inline → verify Chrome → commit → **gắn vào QUICK MENU** (đổi mục từ `{type:'toast'}` sang `{type:'nav', href}`).
- Route/file tiếng Anh, UI tiếng Việt. Học phí VND. Tông kẹo ngọt (class `.candy-*`, font Comfortaa).
- KHÔNG phá 71 test; thêm logic mới thì THÊM test (fees/stats-style). UI verify Chrome.
- Trang mới thêm vào `NAV_ITEMS`? → KHÔNG tự động; QUICK MENU là đường vào chính. Sidebar giữ 3 mục gốc
  (tránh phình sidebar) — trừ khi 1 SP thấy cần thì hỏi user.
- Chỉ commit/push khi user yêu cầu.

## Gỡ mục chết khỏi QUICK MENU (làm ở SP-1, tiện thể)

Trong `QuickMenu.tsx`: xóa nhóm "HƯỚNG DẪN & HỖ TRỢ", xóa item "Chấm công GV" + "Quản trị tài khoản".
Badge số nhóm tự cập nhật (dùng `items.length`). Menu còn 3 nhóm.

## Success criteria (toàn milestone)

- 6 tính năng chạy thật, mỗi mục menu điều hướng tới trang/hành động thật (không còn toast "Đang phát triển"
  cho các mục đã chốt làm).
- VietQR chạy được sau khi điền số TK qua trang Thiết lập (không cần sửa code).
- Mọi trang tông kẹo ngọt nhất quán; console sạch; 71 test cũ + test mới đều pass; build sạch.
