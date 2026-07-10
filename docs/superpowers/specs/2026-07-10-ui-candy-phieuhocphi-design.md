---
title: Đại tu UI "kẹo ngọt" — bám phieuhocphi
status: Đã lập kế hoạch
created_date: 2026-07-10
completed_date:
owner: Claude (Opus 4.8) + Trang Nhung
---

# Đại tu UI "kẹo ngọt" — bám y hệt phieuhocphi

## Bối cảnh & mục tiêu

Toàn bộ chức năng app "Quản lý học sinh của Trang Nhung" đã hoàn thành (P1→P3-1, 71 test
pass). Vấn đề còn lại: **thị giác đang trung tính/"văn phòng"** — nền trắng, card vuông
phẳng, nút shadcn đen mặc định, chữ đen/xám. Bản tham chiếu phieuhocphi.com có phong cách
**"kẹo ngọt"**: nền hồng pastel, thẻ gradient đặc bo cực tròn, nút pill gradient magenta,
font tròn (Comfortaa), chữ nâu ấm.

**Mục tiêu:** làm UI **giống phieuhocphi nhất có thể** mà **KHÔNG đụng logic/chức năng** —
71 test cũ phải giữ nguyên xanh. Đây là thay đổi thuần trình bày (CSS/class/markup nhẹ),
không đổi data flow, không đổi store, không đổi tính toán học phí.

## Design tokens — ĐO TRỰC TIẾP từ phieuhocphi.com (không phỏng đoán)

Trích bằng `getComputedStyle` trên CSS thật của bản gốc (màn login) + phân tích dashboard thật:

| Token | Giá trị | Nguồn |
|-------|---------|-------|
| Font tiêu đề/nút/nhãn | **Comfortaa** (weight 600–700) | `font-family` bản gốc |
| Font số liệu/nội dung | **Nunito** (weight 700–800) | fallback stack bản gốc |
| Nền trang | `#fff8fa` (rgb 255,248,250) | `body` bản gốc |
| Chữ thường | `#4e342e` (nâu ấm, KHÔNG đen) | `body color` bản gốc |
| Magenta (nút/tiêu đề/số nhấn) | `#c2185b` (rgb 194,24,91) | nút "ĐĂNG NHẬP" + heading |
| Hồng (viền/nhấn phụ) | `#f06292` (rgb 240,98,146) | viền input bản gốc |
| Hồng nhạt (nền badge/pastel) | `#fce4ec` | phân tích |
| Shadow nút | `rgba(216,27,96,.28) 0 5px 15px` | `box-shadow` nút bản gốc |
| Shadow card | `rgba(216,27,96,.12–.15) 0 8-10px 22-26px` | phân tích |
| Bo góc card | `28–32px` | phân tích dashboard |
| Bo góc pill (nút/badge/input) | `50px` (viên thuốc) | `border-radius` nút bản gốc |
| Viền input focus | ring `rgba(216,27,96,.25) 0 0 0 4px` | `box-shadow` input bản gốc |

**Palette gradient thẻ thống kê (đo từ dashboard thật):**
- Học sinh: `linear-gradient(135deg,#fde0ec,#fbc4dc)` — hồng nhạt, chữ magenta, số trong vòng tròn trắng
- Tổng năm: `linear-gradient(135deg,#f06292,#c2185b)` — hồng→magenta, chữ trắng
- Tháng này: `linear-gradient(135deg,#ce93d8,#ab47bc)` — tím, chữ trắng
- Hôm nay: `linear-gradient(135deg,#b3c7f7,#7e9df0)` — lam nhạt, chữ trắng

## Kiến trúc kỹ thuật (cách áp — sạch, 1 nguồn sự thật)

Ba lớp, theo thứ tự ưu tiên khi áp class:

1. **Design tokens trong `globals.css`** — đổi biến gốc `--primary/--background/--sidebar/
   --chart-*/--radius` sang tông kẹo ngọt (oklch tương đương các hex trên). Đây là gốc:
   sửa 1 chỗ → nút shadcn, focus ring, Card mặc định tự đổi tông hồng. KÈM đổi nền `body`
   sang `#fff8fa` và chữ mặc định sang nâu ấm.

2. **Font qua `next/font/google`** trong `layout.tsx` — thêm `Comfortaa` (→ `--font-heading`)
   và `Nunito` (→ `--font-sans`), y hệt cách file đang dùng `Geist`. Offline-safe, không CDN,
   không data-URI. `@theme inline` trong globals map `--font-sans`/`--font-heading` sang 2 font này.

3. **Class tiện ích dùng chung** trong `@layer components` của `globals.css` — để markup gọn,
   không lặp chuỗi Tailwind dài ở mọi file:
   - `.candy-card` — nền trắng, `rounded-[28px]`, viền hồng 1.5px, shadow hồng mềm.
   - `.candy-btn` — pill gradient magenta, chữ trắng Comfortaa 700 (nút chính).
   - `.candy-btn-outline` — pill viền hồng nền trắng, chữ magenta (nút phụ).
   - `.candy-input` — bo pill, viền hồng, focus ring hồng.
   - `.candy-pill` — badge/pill nhỏ (lớp, picker) nền hồng nhạt chữ magenta.
   - `.stat-card` + biến thể `.stat-students/.stat-year/.stat-month/.stat-today` — 4 gradient.
   - `.candy-table` — bảng bo tròn container, header gradient hồng, dòng chẵn nền hồng nhạt.

**Nguyên tắc surgical:** KHÔNG đổi `types/`, `store/`, `lib/fees.ts`, `lib/stats.ts`,
`repositories/`, `messages/vi.json` (trừ khi cần sửa chuỗi lỗi hiển thị như `__all__`).
Chỉ đụng: `globals.css`, `layout.tsx`, và các file component trình bày.

## Phạm vi theo lát (thứ tự đã chốt: nền tảng → Dashboard → HS/Điểm danh → dialog)

### Lát 1 — Nền tảng thị giác
**Files:** `src/app/globals.css`, `src/app/layout.tsx`, `src/components/layout/AppSidebar.tsx`
- Đổi design tokens (màu + radius + nền + chữ nâu) trong globals.css.
- Nhúng Comfortaa + Nunito qua next/font/google; map vào `--font-sans`/`--font-heading`.
- Thêm `@layer components` với các class `.candy-*` + `.stat-card*` + `.candy-table`.
- **Sidebar**: logo pill gradient hồng→tím chữ trắng Comfortaa (🍭 TRANG NHUNG); nav item
  active = nền hồng đậm hơn + chữ magenta, hover mềm; nền sidebar hồng nhạt hơn nền trang chút.
- **Verify:** mở cả 3 màn qua Chrome, nền hồng + font Comfortaa hiện đúng, console sạch,
  không vỡ layout, 71 test vẫn pass.

### Lát 2 — Dashboard (ĐÃ duyệt mockup)
**Files:** `src/app/page.tsx`, `src/components/dashboard/StatCards.tsx`,
`src/components/dashboard/StudentTable.tsx`,
`src/components/dashboard/charts/*` (StatsSummaryCards, DashboardCharts, 3 chart), 
`src/components/dashboard/ViewTodayAttendanceButton.tsx`
- **StatCards** → 4 thẻ gradient đặc (theo palette trên). "Học sinh" nền hồng nhạt số trong
  vòng tròn trắng, 3 thẻ còn lại gradient đậm chữ trắng; icon 💰📅🔥 trong vòng tròn trắng mờ.
- **Toolbar** (search + lọc lớp + nút hành động) → search pill viền hồng, lọc lớp = candy-pill,
  các nút Xem điểm danh/Điểm danh/Nhận xét = candy-btn-outline, "Tải phiếu lớp" = candy-btn.
  Sửa lỗi Select hiện `__all__` → "Tất cả lớp".
- **StudentTable** → candy-table: header gradient hồng, badge lớp candy-pill, cột học phí
  magenta đậm, badge "⚠️ Nợ" giữ, nút "🧾 Phiếu" = candy-btn-outline nhỏ.
- **Biểu đồ**: đổi màu dataset sang palette kẹo (hồng/tím/lam pastel + xanh mint/đỏ cho pie),
  bọc trong candy-card. Giữ nguyên logic Chart.js, chỉ đổi `backgroundColor`/`borderColor`.
  StatsSummaryCards → dùng thẻ nhỏ tông hồng nhất quán.
- **Verify:** Chrome — dashboard khớp mockup đã duyệt; console sạch; biểu đồ vẫn render
  (StoreHydration gate OK); responsive 2 cột → 1 cột ở mobile; 71 test pass.

### Lát 3 — Trang Học sinh + Điểm danh
**Files:** `src/app/students/page.tsx` + components trang HS (form/bảng),
`src/app/attendance/page.tsx` + `src/components/attendance/AttendanceBoard.tsx`
- **Học sinh**: nút "Thêm học sinh" (đang đen shadcn) → candy-btn; Nhập hàng loạt/Xuất/Nhập
  JSON → candy-btn-outline; search + select lọc lớp kẹo; bảng → candy-table; nút Sửa/Xóa
  bo pill tông hồng/đỏ nhẹ. Sửa Select hiện `__all__` → "Tất cả lớp".
- **Điểm danh**: 3 nút trạng thái Có/Có B2/Vắng giữ logic màu (mặc định/amber/đỏ) nhưng bo
  pill + tông mềm khớp theme; chọn lớp/ngày = candy-pill/candy-input; khung bảng candy-card.
- **Verify:** Chrome cả 2 màn; thêm/sửa/xóa vẫn chạy; điểm danh 3 trạng thái vẫn đúng; console
  sạch; 71 test pass.

### Lát 4 — Dialog phiếu học phí + form thêm/sửa HS
**Files:** `src/components/receipt/ReceiptDialog.tsx`, `ThemePicker.tsx`, form dialog HS
- **Header dialog** → gradient hồng→magenta chữ trắng (như modal bản gốc "QUẢN LÝ DANH SÁCH").
- Các input/select/nút trong dialog → candy-input/candy-pill/candy-btn cho nhất quán.
- **KHÔNG đổi `ReceiptCard.tsx`** (phiếu xuất PNG) — đã có 5 theme kẹo ngọt riêng, là chuẩn
  màu; đụng vào rủi ro vỡ html2canvas-pro (oklch). Chỉ làm đẹp phần dialog bao quanh.
- **Verify:** Chrome — mở dialog, đủ input; **xuất phiếu PNG thật và MỞ ảnh** kiểm không vỡ
  (bài học oklch); console sạch; 71 test pass.

## Ràng buộc (Global Constraints)
- **KHÔNG phá logic/test** — 71 test giữ xanh; không đổi types/store/fees/stats/repositories.
- **base-ui gotchas:** Dialog dùng prop `render` (KHÔNG `asChild`); Select onValueChange trả
  `string|null` → null-guard; Button điều hướng dùng `buttonVariants()` trên `<Link>`.
- **html2canvas-pro** (KHÔNG html2canvas 1.4.1) — không đụng ReceiptCard.
- Học phí VND (KHÔNG chia 100). Route/file/identifier tiếng Anh; UI tiếng Việt.
- Mỗi lát: `npm test` + `tsc` + `lint` + `build` sạch trước commit; verify Chrome console sạch.
- Chỉ commit/push khi user yêu cầu; commit `Co-Authored-By: Claude Opus 4.8`.

## Không làm (YAGNI)
- Không thêm dark mode mới (giữ block `.dark` sẵn, không đầu tư).
- Không đổi cấu trúc dữ liệu/màn hình/luồng.
- Không đổi ReceiptCard PNG.
- Không thêm thư viện UI mới (giữ shadcn/base-ui + Tailwind hiện có).

## Success criteria
- 3 màn + dialog mang phong cách kẹo ngọt khớp mockup đã duyệt & bản gốc phieuhocphi.
- Font Comfortaa/Nunito hiển thị đúng, nền hồng, thẻ gradient, nút pill.
- Console sạch mọi màn; xuất phiếu PNG không vỡ; responsive OK.
- 71 test cũ pass; lint/build sạch; không đổi logic.
