# Thiết kế: Phase 2a — Phiếu học phí + VietQR + Nhận xét

- **Ngày:** 2026-07-04
- **Chủ dự án / người dùng:** Trang Nhung (một giáo viên gia sư — dùng cá nhân)
- **Sản phẩm tham chiếu:** [phieuhocphi.com](https://phieuhocphi.com) — xem [research](../../research/phase2-phieu-hoc-phi.md)
- **Phase:** 2a (lõi). Tiền đề: Phase 1 MVP đã xong (dashboard, students, attendance, fee logic).

## 1. Mục tiêu

Cho phép Trang Nhung xuất **phiếu học phí tháng** cho từng học sinh (kèm ngày đi học, nhận xét, VietQR)
để gửi phụ huynh. Bám giao diện/luồng phieuhocphi tối đa.

**P2a làm:** phiếu học phí (dialog, chọn tháng, xuất ảnh) · VietQR (sinh local + fallback) · nhận xét 1/HS/tháng.
**P2a KHÔNG làm (để P2b):** phụ phí, nhắc nợ, phiếu lớp (batch), 5 theme phiếu, 2 cột điểm, màu buổi 1/2.

## 2. Quyết định đã chốt

- **Bank config trong `src/lib/config.ts`** (cố định — Trang Nhung có 1 tài khoản). Giá trị khởi tạo:
  `bankCode: ''`, `accountNumber: ''`, `accountName: 'NGUYEN TRANG NHUNG'` (Trang Nhung tự điền bank + STK sau).
- **VietQR sinh LOCAL** bằng thư viện `qrcode` (vẽ) + hàm tự viết `buildVietQrPayload` (chuỗi EMVCo/NAPAS). Không phụ thuộc img.vietqr.io / internet.
- **Nhận xét = 1 / HS / tháng**, lưu store persist localStorage, key `${studentId}:${year}-${month}`.
- **Phiếu = dialog** mở từ nút "Phiếu" ở **cả Dashboard và Students**; dialog **có ô chọn tháng** (mặc định = tháng đang xem ở Dashboard, hoặc tháng hiện tại ở Students).
- **UI bám phieuhocphi** (bố cục/màu/emoji giống — không pixel-perfect vì Tailwind vs Bootstrap).
- Học phí VND trực tiếp (không chia 100). Route/file/identifier English; chữ hiển thị tiếng Việt (messages/vi.json).

## 3. Kiến trúc (cộng thêm vào Phase 1, không sửa kiến trúc)

Store & repositories Phase 1 giữ nguyên; chỉ **thêm** field nhận xét + action. Logic fee tái dùng nguyên.

```
src/
├─ lib/
│  ├─ config.ts                  # + bank {bankCode,accountNumber,accountName}, schoolName, receiptGreeting
│  ├─ napas-banks.ts             # NEW: map bankCode → {bin, name} (BIDV/VCB/MB/TCB/VPB/ACB/...)
│  └─ vietqr.ts                  # NEW: buildVietQrPayload() — EMVCo/NAPAS + CRC16 (thuần, TEST kỹ)
├─ store/
│  └─ useAppStore.ts             # + comments: Record<string,string>; setComment/getComment; persist
├─ types/index.ts                # + BankConfig; + commentKey(studentId,year,month)
├─ components/receipt/
│  ├─ ReceiptDialog.tsx          # NEW: dialog — chọn tháng + xem trước + sửa nhận xét + Tải ảnh
│  ├─ ReceiptCard.tsx            # NEW: phần được html2canvas chụp — layout phiếu "kẹo ngọt"
│  └─ VietQrCode.tsx             # NEW: <canvas> vẽ QR (qrcode) hoặc fallback nếu chưa cấu hình bank
├─ components/dashboard/StudentTable.tsx   # + nút "Phiếu" mỗi dòng
├─ components/students/StudentList.tsx     # + nút "Phiếu" mỗi dòng
└─ messages/vi.json              # + namespace receipt
```

**Dependencies mới:** `qrcode` (+ `@types/qrcode`), `html2canvas`.

## 4. Mô hình dữ liệu

```ts
// config.ts
interface BankConfig { bankCode: string; accountNumber: string; accountName: string }
CONFIG += { schoolName: string, bank: BankConfig, receiptGreeting: string }

// store — nhận xét
comments: Record<string, string>   // key = `${studentId}:${year}-${month}`  (VD "s1:2026-07")
setComment(studentId: string, year: number, month: number, text: string): void
getComment(studentId: string, year: number, month: number): string   // '' nếu chưa có
// persist: thêm 'comments' vào partialize
```

### VietQR (`vietqr.ts`) — hàm thuần

```ts
buildVietQrPayload(args: { bin: string; accountNumber: string; amount?: number; addInfo?: string }): string
// Trả chuỗi EMVCo (QR chuyển khoản NAPAS):
//  - Payload Format Indicator (00) = "01"
//  - Point of Initiation (01) = "12" (dynamic, có amount) hoặc "11" (static)
//  - Merchant Account Info (38): GUID (00)="A000000727" + Beneficiary(01): Acquirer(00)=bin, ConsumerID(01)=accountNumber + Service(02)="QRIBFTTA"
//  - Currency (53) = "704" (VND); Amount (54) nếu có; Country (58)="VN"
//  - Additional Data (62): Purpose(08)=addInfo (nếu có)
//  - CRC (63) = CRC16-CCITT (poly 0x1021, init 0xFFFF) của toàn chuỗi + "6304"
// napas-banks.ts: BIDV bin '970418', VCB '970436', MB '970422', TCB '970407', VPB '970432', ACB '970416', ...
```

`VietQrCode.tsx`: nếu `bankCode` hoặc `accountNumber` rỗng → render fallback (thông báo "⚙️ Chưa cấu hình
tài khoản ngân hàng trong src/lib/config.ts"), KHÔNG vẽ QR. Ngược lại: `buildVietQrPayload` → `qrcode` vẽ `<canvas>`.

**Lưu ý:** `accountName` ("NGUYEN TRANG NHUNG") KHÔNG nằm trong QR payload (payload VietQR chỉ cần bin +
accountNumber + amount + addInfo). `accountName` chỉ hiển thị dạng text dưới QR để phụ huynh đối chiếu.

## 5. Phiếu học phí & luồng (bám phieuhocphi)

### Nút "Phiếu"
Mỗi dòng HS ở **Dashboard (StudentTable)** và **Students (StudentList)** có nút "Phiếu" → mở `ReceiptDialog(studentId)`.

### ReceiptDialog
- **Ô chọn tháng/năm** (mặc định: tháng đang xem ở Dashboard / tháng hiện tại ở Students).
- Render `ReceiptCard` (xem trước) + textbox **nhận xét** (editable, lưu store theo studentId+tháng).
- Nút: **Lưu nhận xét** · **📥 Tải phiếu** (html2canvas chụp ReceiptCard → PNG) · **Đóng**.

### ReceiptCard (phần được chụp thành ảnh — UI giống bản gốc)
- Header: `CONFIG.schoolName` · "PHIẾU HỌC PHÍ" · "Tháng N"
- 👨‍🎓 Học sinh · 💎 Học phí / buổi · 📝 Số buổi học (present) · **TỔNG HỌC PHÍ** (monthlyFee)
- **NGÀY ĐI HỌC:** liệt kê ngày present trong tháng (dd/mm)
- **— NHẬN XÉT —:** nội dung nhận xét + `CONFIG.receiptGreeting`
- **VietQR:** `<VietQrCode>` + dòng "Bank · STK · TÊN CHỦ TK" (hoặc fallback)
- Style "kẹo ngọt" hồng/tím bo tròn, emoji — giống phiếu bản gốc.

Dữ liệu (số buổi, danh sách ngày present, tổng) lấy từ `fees.ts` Phase 1 (`countSessions`, `monthlyFee`) +
`attendance` lọc present theo tháng. Không tính lại.

## 6. Test & xử lý lỗi

- **TDD nghiêm `vietqr.ts`:** `buildVietQrPayload` — cấu trúc TLV đúng, độ dài field đúng, CRC16 đúng
  (đối chiếu payload chuẩn đã biết). `napas-banks.ts`: BIN đúng cho bank chính.
- **Store nhận xét:** setComment/getComment đúng key studentId+tháng; persist; đổi tháng → nhận xét khác.
- **VietQR fallback:** bank/STK rỗng → thông báo cấu hình, không render QR lỗi.
- **html2canvas:** chụp đúng ReceiptCard; QR là `<canvas>` (không phải img external) → không CORS-taint khi chụp.
- **Phiếu tháng rỗng:** HS chưa điểm danh tháng đó → phiếu hiện 0 buổi, 0đ, không có ngày — không lỗi.

## 7. Ngoài phạm vi P2a (để P2b)

Phụ phí, nhắc nợ (thanh toán), phiếu lớp (batch export), 5 theme phiếu, 2 cột điểm trong nhận xét,
màu nền buổi 1/buổi 2. Các mục đụng mô hình dữ liệu Phase 1 (thanh toán, điểm, loại buổi) gom vào P2b.
