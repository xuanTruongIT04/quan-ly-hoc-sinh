# Thiết kế: Phase 2b-2 — Phụ phí + Nhắc nợ

- **Ngày:** 2026-07-05
- **Chủ dự án / người dùng:** Trang Nhung
- **Sản phẩm tham chiếu:** [phieuhocphi.com](https://phieuhocphi.com)
- **Phase:** 2b-2 (lát 2 của P2b). Tiền đề: P2a + P2b-1 đã xong (phiếu + VietQR + nhận xét + theme + phiếu lớp).

## 1. Mục tiêu

Thêm **phụ phí** (khoản cộng ngoài học phí) và **nhắc nợ** (theo dõi đã trả/chưa trả) cho từng học sinh
theo tháng. Đây là lát ĐẦU của P2b đụng mô hình dữ liệu Phase 1 (thêm 2 loại dữ liệu tiền + đổi cách tính doanh thu).

**P2b-2 làm:** phụ phí (số + ghi chú /HS/tháng) · nhắc nợ (đã trả/chưa /HS/tháng) · doanh thu cộng phụ phí.
**P2b-2 KHÔNG làm (để P2b-3):** 2 cột điểm, màu buổi 1/2, nợ dồn tháng trước.

## 2. Quyết định đã chốt

- **Phụ phí = 1 khoản/HS/tháng**: `{ amount: number (VND), note: string }`. Cộng vào TỔNG phiếu. Nhập trong dialog phiếu.
- **Nhắc nợ = trạng thái đã trả/chưa trả /HS/tháng** (boolean). Chưa trả → badge trên phiếu + badge "⚠️ Nợ" trên Dashboard.
- **Nhập cả hai trong ReceiptDialog** (ô phụ phí + ghi chú + nút toggle "đã trả").
- **Doanh thu = học phí + phụ phí, PHẢI THU** (kể cả chưa trả). Phụ phí CÓ tính vào doanh thu; trạng thái trả KHÔNG ảnh hưởng doanh thu (chỉ để nhắc nợ).
- Key dữ liệu dùng `commentKey(studentId, year, month)` (đã có) — nhất quán với nhận xét. Học phí VND (không chia 100).

## 3. Kiến trúc (đụng data model P1 — cẩn thận với test cũ)

```
src/
├─ store/useAppStore.ts          # + extraFees, payments + actions + partialize
├─ types/index.ts                # + ExtraFee interface
├─ lib/fees.ts                   # + receiptTotal; revenueForMonth/Year/Day cộng phụ phí (đổi chữ ký — nhận extraFees)
├─ components/receipt/ReceiptCard.tsx    # + dòng phụ phí + TỔNG gồm phụ phí + badge trạng thái
├─ components/receipt/ReceiptDialog.tsx  # + ô phụ phí/ghi chú + nút đã-trả
├─ components/receipt/BatchReceiptExport.tsx  # truyền extraFee/paid cho ReceiptCard (giữ nhất quán)
├─ components/dashboard/StatCards.tsx    # revenue* nhận thêm extraFees
├─ components/dashboard/StudentTable.tsx # badge "⚠️ Nợ" + revenue nếu có
└─ messages/vi.json              # + key extraFee/payment
```

## 4. Mô hình dữ liệu

```ts
// types
export interface ExtraFee { amount: number; note: string }   // amount VND, note tùy chọn

// store (persist — thêm cả 2 vào partialize)
extraFees: Record<string, ExtraFee>   // key = commentKey(studentId,year,month)
payments: Record<string, boolean>      // key giống trên; true = đã trả
setExtraFee(studentId, year, month, amount, note): void
getExtraFee(studentId, year, month): ExtraFee        // { amount: 0, note: '' } nếu chưa có
setPaid(studentId, year, month, paid): void
isPaid(studentId, year, month): boolean              // false nếu chưa có
```

### fees.ts (đổi để cộng phụ phí — GIỮ test cũ xanh bằng tham số optional)

```ts
// Tổng phiếu 1 HS 1 tháng = học phí + phụ phí
receiptTotal(student, attendance, extraFee: ExtraFee, year, month): number
  = monthlyFee(student, attendance, year, month) + (extraFee?.amount ?? 0)

// Doanh thu cộng phụ phí. Để KHÔNG phá 25 test cũ (gọi revenueForMonth(students, attendance, y, m)),
// thêm tham số extraFees OPTIONAL ở CUỐI, mặc định {} (không phụ phí = như cũ):
revenueForMonth(students, attendance, year, month, extraFees?: Record<string,ExtraFee>): number
revenueForYear(students, attendance, year, extraFees?): number
revenueForDay(students, attendance, dateISO, extraFees?): number   // phụ phí gắn theo tháng → cộng vào ngày nào?
```

**Quyết định doanh thu-ngày:** `revenueForDay` (card "Hôm nay") vốn chỉ tính per_session present hôm nay × fee.
Phụ phí gắn theo THÁNG, không theo ngày → **KHÔNG cộng phụ phí vào doanh thu-ngày** (giữ revenueForDay như cũ,
tham số extraFees bỏ qua hoặc không thêm). Phụ phí chỉ cộng vào doanh thu THÁNG + NĂM. Ghi rõ trong test.

## 5. Luồng & màn hình

### ReceiptDialog
- Thêm ô **"Phụ phí"** (input số) + ô **"Ghi chú phụ phí"** (input text) + nút **"💾 Lưu phụ phí"** → `setExtraFee`.
- Nút toggle **thanh toán**: chưa trả → nút "✅ Đánh dấu đã trả"; đã trả → nút "⚠️ Đánh dấu chưa trả" → `setPaid`.
- Khi đổi tháng: nạp lại phụ phí + trạng thái trả của tháng đó (như nhận xét).

### ReceiptCard
- Nếu `extraFee.amount > 0`: thêm dòng **"➕ Phụ phí"** + số tiền, và nếu có note thì "(note)".
- **TỔNG HỌC PHÍ** → **TỔNG** = `receiptTotal` (học phí + phụ phí).
- Badge trạng thái ở đầu/cuối phiếu: `isPaid` → "✅ ĐÃ THANH TOÁN" (xanh); ngược lại → "⚠️ CHƯA THANH TOÁN".

### Dashboard
- **StatCards**: revenue* nhận thêm `extraFees` từ store → doanh thu Tháng/Năm gồm phụ phí (Hôm nay giữ nguyên).
- **StudentTable**: HS chưa trả tháng đang chọn → badge nhỏ **"⚠️ Nợ"** cạnh tên (chỉ hiển thị).

## 6. Test & xử lý lỗi

- **TDD `fees.ts`:** `receiptTotal` (học phí + phụ phí; phụ phí 0 → = học phí); `revenueForMonth/Year` cộng phụ phí
  (không extraFees → như cũ = 25 test cũ vẫn xanh; có extraFees → cộng đúng); `revenueForDay` KHÔNG đổi (không cộng phụ phí).
- **TDD store:** setExtraFee/getExtraFee (số + note, default {0,''}); setPaid/isPaid (default false); persist (partialize gồm cả 2).
- **ReceiptCard:** phụ phí 0 → không hiện dòng phụ phí, TỔNG = học phí; phụ phí > 0 → hiện dòng + TỔNG cộng; badge đúng theo isPaid.
- **Smoke:** nhập phụ phí 50k + note → phiếu hiện dòng + TỔNG tăng 50k + doanh thu Tháng tăng 50k; đánh dấu đã trả → badge đổi + Dashboard hết badge Nợ; tải PNG kiểm (mở ảnh).
- **KHÔNG phá test cũ:** tham số extraFees optional cuối → mọi call site cũ không đổi vẫn chạy.

## 7. Ngoài phạm vi P2b-2 (để P2b-3)

2 cột điểm nhận xét, màu nền buổi 1/buổi 2, nợ dồn (cộng nợ các tháng trước).
