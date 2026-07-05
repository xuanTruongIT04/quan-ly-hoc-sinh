# Thiết kế: Phase 2b-1 — 5 theme phiếu + Phiếu lớp (xuất hàng loạt)

- **Ngày:** 2026-07-05
- **Chủ dự án / người dùng:** Trang Nhung
- **Sản phẩm tham chiếu:** [phieuhocphi.com](https://phieuhocphi.com) — xem [research](../../research/phase2-phieu-hoc-phi.md)
- **Phase:** 2b-1 (lát đầu của P2b mở rộng). Tiền đề: P2a đã xong (phiếu học phí + VietQR + nhận xét, html2canvas-pro).

## 1. Mục tiêu

Thêm **5 theme giao diện phiếu** (chọn trong dialog, đổi tức thì, nhớ mặc định) và **xuất phiếu cả lớp**
(mỗi HS 1 file PNG). Không đụng mô hình dữ liệu Phase 1 — chỉ mở rộng UI phiếu. Bám phieuhocphi.

**P2b-1 làm:** 5 theme phiếu · phiếu lớp (nhiều PNG). **KHÔNG làm (P2b-2/3):** phụ phí, nhắc nợ, 2 cột điểm, màu buổi 1/2.

## 2. Quyết định đã chốt

- **Chọn theme trong dialog phiếu** (hàng nút "🎨 Giao diện phiếu", đổi tức thì + xem trước ngay). Lựa chọn lưu localStorage làm mặc định lần sau.
- **5 theme:** Mặc Định 🌿 (xanh lá) · Đại Dương 🌊 (xanh dương) · Oải Hương 🌸 (tím lavender) · Dâu Tây 🍭 (hồng — hiện tại) · Sang Trọng ✨ (vàng/đen sang trọng).
- **Phiếu lớp = nhiều file PNG** (mỗi HS 1 ảnh, tải lần lượt). Không dùng zip.
- **Nút "Tải phiếu lớp" ở CẢ Dashboard và trong dialog phiếu.**
- Route/file/id English; chữ hiển thị tiếng Việt. Màu theme phải html2canvas-pro-safe (đã dùng html2canvas-pro → oklch OK).

## 3. Kiến trúc (mở rộng UI phiếu P2a, không đụng data model)

```
src/
├─ lib/
│  └─ receipt-themes.ts          # NEW: ThemeId, ReceiptTheme, RECEIPT_THEMES (5)
├─ store/
│  └─ useAppStore.ts             # + receiptTheme: ThemeId (persist), setReceiptTheme
├─ components/receipt/
│  ├─ ReceiptCard.tsx            # MODIFY: nhận prop theme, dùng class theo theme
│  ├─ ReceiptDialog.tsx          # MODIFY: hàng nút chọn theme + nút "Tải phiếu lớp"
│  ├─ ThemePicker.tsx            # NEW: 5 nút chọn theme (dùng trong dialog)
│  └─ BatchReceiptExport.tsx     # NEW: logic render off-screen + tải nhiều PNG cho 1 lớp
├─ components/dashboard/StudentTable.tsx   # MODIFY: nút "Tải phiếu lớp" (theo lớp đang lọc + tháng)
└─ messages/vi.json              # + key theme/batch
```

## 4. Mô hình dữ liệu

```ts
// receipt-themes.ts
type ThemeId = 'default' | 'ocean' | 'lavender' | 'strawberry' | 'luxury'
interface ReceiptTheme {
  id: ThemeId
  name: string          // "Mặc Định", "Đại Dương", ...
  emoji: string         // 🌿 🌊 🌸 🍭 ✨
  cardBg: string        // class nền card, VD 'bg-gradient-to-b from-pink-50 to-purple-50'
  accentText: string    // class chữ nhấn, VD 'text-pink-600'
  subText: string       // class chữ phụ tiêu đề trường
  badgeBg: string       // class nền badge ngày đi học, VD 'bg-purple-100'
  totalBg: string       // class nền khối TỔNG, VD 'bg-white/70'
  border: string        // class viền phân cách, VD 'border-pink-200'
}
RECEIPT_THEMES: ReceiptTheme[]   // đúng 5 phần tử theo thứ tự trên
getTheme(id: ThemeId): ReceiptTheme   // fallback 'default' nếu không tìm thấy

// store
receiptTheme: ThemeId               // mặc định 'strawberry' (giữ giống hiện tại)
setReceiptTheme(id: ThemeId): void  // persist (thêm vào partialize)
```

Mỗi theme = một bộ class Tailwind (đều là màu palette v4 = oklch → html2canvas-pro chụp được).

## 5. Luồng & màn hình (bám phieuhocphi)

### ThemePicker (trong ReceiptDialog)
Hàng 5 nút nhỏ (emoji + tên theme). Bấm → `setReceiptTheme(id)` → ReceiptCard đổi màu tức thì (xem trước ngay).
Theme đang chọn có viền nổi bật. Lựa chọn persist → lần mở dialog sau dùng lại theme đó.

### ReceiptCard (theme-aware)
Nhận prop `theme: ReceiptTheme`. Thay các class hard-code (from-pink-50, text-pink-600, bg-purple-100, bg-white/70,
border-pink-200) bằng class từ `theme`. Bố cục/emoji trường giữ nguyên. Ảnh QR + text bank giữ nguyên.

### Phiếu lớp (BatchReceiptExport)
- Nút "📥 Tải phiếu lớp" ở **Dashboard** (dùng lớp đang lọc + tháng/năm đang chọn; nếu lọc "Tất cả lớp" → xuất mọi HS)
  và trong **ReceiptDialog** (dùng lớp của HS đang mở + tháng đang chọn trong dialog).
- Logic: với mỗi HS trong tập, render `ReceiptCard` vào 1 **container ẩn off-screen** (position absolute, left -9999px),
  `await html2canvas-pro` → tải PNG, `await` một khoảng nhỏ (~300ms) giữa các file để trình duyệt không chặn multi-download,
  rồi sang HS kế. Dùng theme hiện tại. Toast tiến độ ("Đã tải n/tổng").
- **Cách render off-screen (kỹ thuật):** `BatchReceiptExport` giữ 1 `<div>` ẩn (ref) + state `currentStudentId`.
  Lặp qua danh sách bằng vòng async: set `currentStudentId` → chờ React commit (dùng `flushSync` hoặc `requestAnimationFrame`)
  → `html2canvas-pro(hiddenRef.current)` → tải → tiếp. Container ẩn render `<ReceiptCard studentId={currentStudentId} ... theme />`.
  Chỉ 1 card ẩn tại một thời điểm (tuần tự), không cần createRoot/portal.
- Bọc try/catch: 1 HS lỗi → toast cảnh báo, tiếp tục HS còn lại (không dừng cả lô).

## 6. Test & xử lý lỗi

- **Test `receipt-themes.ts`:** `getTheme` trả đúng theme cho mỗi id + fallback 'default' cho id lạ; đúng 5 theme; mỗi theme có đủ field class.
- **Test store:** `setReceiptTheme` đổi + persist (thêm vào partialize).
- **ReceiptCard theme-aware:** verify build + smoke (đổi 5 theme thấy màu đổi trên preview + trên PNG tải về).
- **Phiếu lớp:** smoke — lớp 2 HS → tải đúng 2 PNG hợp lệ (mở kiểm); lớp rỗng → toast báo "không có học sinh"; 1 HS lỗi → lô vẫn tiếp.
- Màu theme html2canvas-pro-safe (đã verify html2canvas-pro chụp oklch ở P2a).

## 7. Ngoài phạm vi P2b-1

Phụ phí + nhắc nợ (P2b-2); 2 cột điểm + màu buổi 1/2 (P2b-3). Theme cho trang web public (ngoài phạm vi bản của mình).
