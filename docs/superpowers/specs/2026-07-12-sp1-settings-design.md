---
title: SP-1 — Thiết lập trung tâm (settings sửa trong app)
status: Đã lập kế hoạch
created_date: 2026-07-12
completed_date:
owner: Claude (Opus 4.8) + Trang Nhung
---

# SP-1 — Thiết lập trung tâm

## Mục tiêu

Trang `/settings` cho Trang Nhung **tự sửa cấu hình trong app** (không cần sửa `config.ts`).
Quan trọng nhất: điền **số tài khoản + mã ngân hàng + tên chủ TK** → **VietQR chạy được** ngay.
Thuộc milestone `2026-07-12-menu-features-milestone.md` (SP-1/6).

## Field cho sửa (đã chốt — không thêm bớt)

1. Tên giáo viên (`teacherName`)
2. Tên trường/lớp hiển thị trên phiếu (`schoolName`)
3. Mã ngân hàng (`bank.bankCode` — key tra `napas-banks.ts`, VD 'BIDV')
4. Số tài khoản (`bank.accountNumber`)
5. Tên chủ tài khoản (`bank.accountName`)
6. Học phí mặc định (`defaultFee` — VND)
7. Lời chào phiếu (`receiptGreeting`)

KHÔNG cho sửa `scoreLabels` ở SP-1 (không nằm trong danh sách chốt; giữ trong config.ts).

## Kiến trúc

**Store mới `useSettingsStore` (Zustand persist), fallback về `config.ts`:**

- File: `src/store/useSettingsStore.ts`. State = 7 field trên. Giá trị khởi tạo = đọc từ
  `CONFIG` trong `config.ts` (config.ts thành "giá trị mặc định gốc").
- Persist localStorage key `qlhs_settings_v1`. `partialize` toàn bộ 7 field.
- Actions: `setSettings(patch: Partial<Settings>)` (merge), `resetSettings()` (về CONFIG gốc).
- Type `Settings` trong `src/types/index.ts`: `{ teacherName, schoolName, defaultFee, receiptGreeting, bank: BankConfig }` (tái dùng `BankConfig` sẵn có).

**Hook đọc:** component client đọc settings qua `useSettingsStore()` thay cho `import { CONFIG }`.
Vì đọc localStorage (client), phải qua `StoreHydration` (đã bọc app) — an toàn.

**Đổi các nơi dùng CONFIG (7 file) sang store** — CHỈ các field settings, giữ `scoreLabels` từ CONFIG:
- `ReceiptCard.tsx` — schoolName, receiptGreeting (giữ scoreLabels từ CONFIG)
- `VietQrCode.tsx` — bank.{bankCode, accountNumber, accountName}
- `ReceiptDialog.tsx` — scoreLabels (giữ CONFIG, không đổi)
- `AppSidebar.tsx` — teacherName
- `StudentForm.tsx` — defaultFee
- `BulkImportDialog.tsx` — defaultFee (kiểm khi code)
- `config.ts` — GIỮ (là default source)

Các component này đều render client → dùng hook OK. Nếu file nào là server component thuần
(không `'use client'`) thì giữ CONFIG tĩnh cho file đó (kiểm khi code; hầu hết đã client).

**Trang `/settings`:** `src/app/settings/page.tsx` + form. Form đọc store, cho sửa 7 field,
nút "Lưu" → `setSettings`, nút "Khôi phục mặc định" → `resetSettings`. Tông kẹo ngọt (candy-input,
candy-btn, tiêu đề Comfortaa). Mã ngân hàng: `<select>` từ `napas-banks.ts` (danh sách bank) cho
dễ chọn, thay vì gõ tay. Toast xác nhận khi lưu.

**Gắn QUICK MENU:** đổi item "Thiết lập trung tâm" từ `{type:'toast'}` → `{type:'nav', href:'/settings'}`.
**Tiện thể gỡ mục chết** (theo milestone): xóa nhóm "HƯỚNG DẪN & HỖ TRỢ", xóa "Chấm công GV" +
"Quản trị tài khoản" khỏi `MENU_GROUPS`. Menu còn 3 nhóm.

## Data flow VietQR (điểm mấu chốt)

Hiện `VietQrCode.tsx` đọc `CONFIG.bank` → nếu rỗng hiện fallback "Chưa cấu hình". Sau SP-1:
đọc `useSettingsStore().bank` → khi Trang Nhung điền số TK ở `/settings` → VietQR sinh mã thật ngay
(reactive, không cần reload/sửa code). Đây là giá trị lớn nhất của SP-1.

## Ràng buộc

- KHÔNG đổi logic tính học phí/điểm danh. Chỉ đổi NGUỒN đọc config (hằng số → store).
- `defaultFee` dùng khi thêm HS mới — đổi sang store, không phá form.
- Export/Import JSON (io.ts) KHÔNG đụng settings (settings ở store riêng, key riêng) — dữ liệu HS
  và cấu hình tách bạch.
- VND (không chia 100). Route/file tiếng Anh, UI tiếng Việt. Tông kẹo ngọt.
- THÊM test cho store (khởi tạo từ CONFIG, setSettings merge, reset). Giữ 71 test cũ.
- Verify Chrome: sửa số TK ở /settings → mở phiếu → VietQR hiện mã (mở ảnh/ kiểm img src có amount).

## Không làm (YAGNI)

- KHÔNG cho sửa scoreLabels (ngoài danh sách chốt).
- KHÔNG thêm settings vào Export/Import JSON.
- KHÔNG validate quá mức số TK (chỉ trim; bank rỗng → VietQR fallback như cũ).
- KHÔNG thêm /settings vào sidebar (vào qua QUICK MENU).

## Success criteria

- `/settings` sửa được 7 field, lưu localStorage, reload giữ nguyên.
- Điền bank → VietQR trên phiếu sinh mã thật (không còn "Chưa cấu hình").
- Tên GV ở sidebar, schoolName/greeting trên phiếu đổi theo settings.
- "Thiết lập trung tâm" trong QUICK MENU điều hướng `/settings`; menu đã gỡ mục chết (3 nhóm).
- Console sạch; test mới + 71 cũ pass; build sạch.
