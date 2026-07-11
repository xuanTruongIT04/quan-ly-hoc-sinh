---
title: QUICK MENU nổi (floating quick-nav) bám phieuhocphi
status: Đã lập kế hoạch
created_date: 2026-07-11
completed_date:
owner: Claude (Opus 4.8) + Trang Nhung
---

# QUICK MENU nổi — bám phieuhocphi

## Bối cảnh & mục tiêu

Bản gốc phieuhocphi có **nút ⚡ nổi** (kéo được, bấm mở) → **panel tím accordion** 4 nhóm, mỗi
nhóm có badge số submenu, tổng ~14 mục con. Đã khảo sát cấu trúc thật qua Chrome (đăng nhập demo).
Thêm tính năng này vào app "Quản lý học sinh" để **giống bản gốc 100%** về giao diện.

**Mục tiêu:** QUICK MENU giao diện y hệt gốc (nút ⚡ nổi kéo được + panel accordion tím + 14 mục).
Mục app đã có → điều hướng/hành động thật; mục chưa có → toast "Đang phát triển" (Sonner).
KHÔNG có nhãn phân biệt "→/sắp có" (giống gốc). Thuần thêm UI mới, không đụng logic/data hiện có.

## Cấu trúc menu (đo thật từ bản gốc) + ánh xạ hành động

Nút nổi ⚡ (kéo di chuyển được, lưu vị trí localStorage, bấm mở/đóng panel). Panel gồm 4 nhóm:

**📊 BẢNG & THỐNG KÊ** (badge 5)
| Mục | Icon | Hành động |
|-----|------|-----------|
| Xem Điểm Danh Tháng | 📋 | điều hướng `/attendance` |
| Quản lý Thu nợ | 💳 | toast "Đang phát triển" |
| Bảng phụ phí | 💰 | toast "Đang phát triển" |
| Xuất Excel | 📊 | toast "Đang phát triển" |
| Bảng tổng hợp | 📋 | điều hướng `/` (Dashboard) |

**🔧 QUẢN LÝ** (badge 5)
| Mục | Icon | Hành động |
|-----|------|-----------|
| Quản lý học sinh | 👶 | điều hướng `/students` |
| Điểm danh hàng loạt | 📋 | điều hướng `/attendance` |
| Chấm công GV | ☑️ | toast "Đang phát triển" |
| Thiết lập trung tâm | ⚙️ | toast "Đang phát triển" |
| Quản trị tài khoản | 🛡️ | toast "Đang phát triển" |

**🎨 CẤU HÌNH GIAO DIỆN** (badge 1)
| Mục | Icon | Hành động |
|-----|------|-----------|
| Giao diện phiếu | 🎨 | toast "Mở phiếu bất kỳ để đổi giao diện" |

**📖 HƯỚNG DẪN & HỖ TRỢ** (badge 3)
| Mục | Icon | Hành động |
|-----|------|-----------|
| Tính năng hệ thống | 🚀 | toast "Đang phát triển" |
| Xem hướng dẫn | 🎬 | toast "Đang phát triển" |
| Zalo hỗ trợ | 💬 | toast "Đang phát triển" |

Cuối panel: **👁️ Ẩn menu nổi** → ẩn cả nút ⚡ (reload trang hiện lại; KHÔNG lưu localStorage).

## Kiến trúc kỹ thuật

**Một client component mới**, đặt trong layout để hiện ở mọi trang.

- **File:** `src/components/layout/QuickMenu.tsx` — `'use client'`. Toàn bộ state cục bộ (React
  useState): `open` (panel mở/đóng), `openGroups` (nhóm nào đang bung — cho phép nhiều nhóm mở),
  `hidden` (đã ẩn menu), `pos` (vị trí nút {x,y}).
- **Data menu:** hằng số `MENU_GROUPS` ngay trong file (mảng 4 nhóm, mỗi nhóm `{icon, label, items[]}`;
  mỗi item `{icon, label, action}` với `action` là `{type:'nav', href}` hoặc `{type:'toast', message}`).
- **Điều hướng:** dùng `useRouter` từ `next/navigation` → `router.push(href)`; đóng panel sau khi nhảy.
- **Toast:** `import { toast } from 'sonner'` → `toast.info(message)`.
- **Kéo (drag):** pointer events trên nút ⚡ — `onPointerDown` bắt đầu, `onPointerMove` cập nhật `pos`,
  `onPointerUp` kết thúc; lưu `pos` vào localStorage key `qlhs_quickmenu_pos`. Phân biệt "kéo" vs
  "bấm": nếu di chuyển < 5px giữa down→up thì coi là click (mở panel), ngược lại là kéo.
- **Gắn vào layout:** thêm `<QuickMenu />` trong `layout.tsx` (trong `StoreHydration`, sau `<Toaster>`
  hoặc cạnh nó) — client-only, không ảnh hưởng SSR. StoreHydration đã gate localStorage nên đọc `pos`
  an toàn (đọc trong useEffect sau mount, tránh hydration mismatch).

**Styling:** dùng tông kẹo ngọt sẵn có + class inline Tailwind. Panel gradient tím
(`from-purple-600 to-fuchsia-600` header), nhóm nền tím nhạt, submenu trắng hover hồng. Nút ⚡
gradient tím→magenta tròn, shadow tím. KHÔNG cần thêm class `.candy-*` mới (menu tông tím riêng,
khác bảng/thẻ) — nhưng dùng font Comfortaa cho tiêu đề nhóm/header cho nhất quán.

**Nguyên tắc surgical:** KHÔNG đổi types/store/fees/stats/repositories/các trang hiện có. Chỉ THÊM
1 file component + 1 dòng trong layout.tsx. Không đụng sidebar (QUICK MENU bổ sung, không thay nav).

## Hành vi chi tiết

- Panel mặc định **đóng**; chỉ hiện nút ⚡. Bấm ⚡ → mở panel (hiện cạnh nút). Bấm ⚡ lần nữa hoặc
  click ra ngoài panel → đóng.
- Trong panel: bấm 1 nhóm → bung/thu submenu của nhóm đó (accordion, nhiều nhóm mở đồng thời được —
  giống gốc). Mũi tên ▸ xoay 90° khi mở.
- Bấm submenu: nav → chuyển trang + đóng panel; toast → hiện toast, panel vẫn mở.
- Bấm "Ẩn menu nổi" → `hidden=true` (ẩn cả nút + panel). Reload trang → hiện lại (state reset).
- Kéo nút ⚡ → di chuyển, thả ở đâu nằm đó; vị trí lưu localStorage, mở app sau vẫn ở chỗ cũ.
- Vị trí mặc định nút: góc phải-dưới (bottom-right), tránh đè nút "Xem điểm danh" và footer.

## Ràng buộc (Global Constraints)

- KHÔNG đổi logic/data — chỉ THÊM UI. KHÔNG đụng types/store/fees/stats/repositories/trang hiện có.
- KHÔNG phá 71 test (thêm component không ảnh hưởng test hiện có; không bắt buộc test mới cho UI).
- Route/file/identifier tiếng Anh; UI tiếng Việt. Toast tiếng Việt.
- Client component (`'use client'`); đọc localStorage trong useEffect (sau mount) tránh hydration mismatch.
- Chỉ commit/push khi user yêu cầu; commit `Co-Authored-By: Claude Opus 4.8`.
- Verify Chrome: mở panel, bung nhóm, bấm mục nav (chuyển trang) + mục toast (hiện toast), kéo nút,
  ẩn menu; console SẠCH; responsive không tràn.

## Không làm (YAGNI)

- KHÔNG làm các trang/tính năng mà submenu "sắp có" trỏ tới (Xuất Excel, Chấm công GV, Thiết lập
  trung tâm, Quản trị tài khoản...) — chỉ toast. Đó là việc riêng, ngoài phạm vi.
- KHÔNG lưu trạng thái ẩn/panel-open vào localStorage (chỉ lưu vị trí nút).
- KHÔNG thêm nhãn "→/sắp có" trên item (giống gốc 100%).
- KHÔNG đổi sidebar/nav hiện có.

## Success criteria

- Nút ⚡ nổi hiện mọi trang, kéo được, bấm mở panel accordion tím 4 nhóm + 14 mục giống gốc.
- 4 mục điều hướng thật (Xem điểm danh tháng, Bảng tổng hợp, Quản lý học sinh, Điểm danh hàng loạt);
  10 mục còn lại toast "Đang phát triển"; "Giao diện phiếu" toast hướng dẫn.
- "Ẩn menu nổi" ẩn được, reload hiện lại. Vị trí nút lưu qua reload.
- Console sạch; 71 test cũ vẫn pass; build/lint/tsc sạch.
