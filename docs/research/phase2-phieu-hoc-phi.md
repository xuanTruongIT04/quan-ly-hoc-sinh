# Research Phase 2: Phiếu học phí + VietQR + Nhận xét (phieuhocphi.com)

Nghiên cứu 2026-07-01/02 qua Chrome, account trial "XUÂN TRƯỜNG" (đã có sẵn 2 HS thử: Nhung 1, Nhung 2 — lớp 10A2). Bổ sung cho `phieuhocphi-analysis.md`, tập trung các luồng Phase 2.

## Đường vào phiếu học phí

Từ Dashboard → nút **"Nhận Xét"** (KHÔNG phải một trang riêng) mở **dialog "PHIẾU HỌC PHÍ"**. Dialog này vừa để nhập nhận xét, vừa xem trước phiếu, vừa xuất ảnh. (Đặt tên nút "Nhận Xét" hơi lệch — thực chất là "phiếu + nhận xét".)

## Cấu trúc dialog PHIẾU HỌC PHÍ (đã thấy tận mắt)

Header: `LỚP HỌC XUÂN TRƯỜNG` · `PHIẾU HỌC PHÍ` · `Tháng 7`
- 👨‍🎓 **Học sinh**: <tên>
- 💎 **Học phí / buổi**: 200.000 đ
- 📝 **Số buổi học**: 1 buổi
- **TỔNG HỌC PHÍ**: 200.000 đ
- **NGÀY ĐI HỌC**: 01/07 (liệt kê các ngày present trong tháng)
- Textbox **"Viết lời nhắn học tập..."** (multiline) = **nhận xét** tháng, editable
- **"📝 Thêm ghi chú:"** + textbox phụ (ghi chú thêm)
- Hàng nút tùy chỉnh: **🎨 Giao diện phiếu** (đổi theme) · **📅 Tháng** · **🔢 Buổi** · **💰 Phụ phí**
- **✨ XÁC NHẬN NHẬN XÉT** (lưu nhận xét)
- Checkbox: **Tải Phiếu Đơn** / **Tải Phiếu Lớp** (xuất ảnh — html2canvas)
- **ĐÓNG**

**Lưu ý:** trong dialog KHÔNG hiển thị VietQR trực tiếp. QR chỉ render lên **ảnh tải về** (và cần cấu hình ngân hàng trước — account thử chưa cấu hình nên chưa thấy QR).

### 5 theme phiếu (nút 🎨 Giao diện phiếu)
Mặc định · Dâu Tây · Oải Hương · Đại Dương · Sang Trọng. (Phase 3.)

## VietQR — cách bản gốc sinh QR

- Module `vietqr-local-*.js` (28KB) = **thư viện QR generator thuần JS** (bản build minified của `qrcode`: Reed-Solomon EC, version tables). → phieuhocphi **tự sinh QR ở client** theo chuẩn **EMVCo/VietQR (NAPAS)**, KHÔNG gọi service ảnh.
- Nhưng ở nghiên cứu ban đầu (trang login) thấy QR mẫu dùng URL **`img.vietqr.io/image/<BANK>-<ACCOUNT>-compact.png?amount=<VND>&addInfo=<nội dung>`** (ví dụ `BIDV-31410001234567-compact.png?amount=1200000&addInfo=Hoc%20phi`).
- **→ Cho bản của Trang Nhung: dùng `img.vietqr.io` (deep-link ảnh) là đủ và đơn giản nhất** (đúng như CLAUDE.md ghi). Không cần tự encode EMV. Chỉ cần: bank code (VD BIDV/VCB/MB/TCB/VPB), số TK, tên chủ TK, amount = tổng học phí, addInfo = "Hoc phi <tên HS> <tháng>".

## Cấu hình liên quan (⚙️ Thiết lập trung tâm — qua ⚡ Quick Menu)

Dialog "THIẾT LẬP TRUNG TÂM" có 3 tab:
1. **📝 Nhận Xét** — tùy chỉnh **nhãn 2 cột điểm** theo loại hình trung tâm (Tiếng Anh/Toán/Năng khiếu/Tiểu học/Lập trình/Tùy chỉnh). VD Tiếng Anh: cột 1 = "ĐIỂM NÓI", cột 2 = "ĐIỂM VIẾT". → gợi ý: nhận xét có thể kèm 2 cột điểm. (Phase 3, hoặc tối giản ở P2.)
2. **🧾 Phiếu Học Phí** — tên hiển thị trên phiếu (mặc định = tên trường), chọn giao diện (5 theme), bật "⚠️ Nhắc nợ học phí", "🎨 Màu nền ngày đi học" (phân biệt buổi 1/buổi 2).
3. **🌐 Mẫu Web** — theme trang web public của trung tâm (Hoa Anh Đào/Đại Dương/Cluvix Spa/Hoàng Hôn/Giấy Ngà). (Ngoài phạm vi bản của mình.)

**Cấu hình NGÂN HÀNG cho VietQR KHÔNG nằm ở 3 tab này** — có thể ở "🛡️ Quản trị tài khoản" (chưa mở). Với bản của mình: bank config để trong `src/lib/config.ts` (như CLAUDE.md đã ghi sẵn chỗ này).

## Bản đồ tính năng đầy đủ (⚡ Quick Menu)

- 📊 Bảng & thống kê: Xem điểm danh tháng · **Quản lý Thu nợ** 💳 · Bảng phụ phí · Xuất Excel
- 🔧 Quản lý: Quản lý học sinh · Điểm danh hàng loạt · **Chấm công GV** ☑️ · ⚙️ Thiết lập trung tâm · 🛡️ Quản trị tài khoản
- 🎨 Cấu hình giao diện: Giao diện phiếu (5 theme)
- 📖 Hướng dẫn & hỗ trợ

## Kết luận cho thiết kế Phase 2 (bản của mình)

Phiếu học phí per-student per-month gồm: tên trường/GV · tên HS · học phí/buổi · số buổi (present) · TỔNG · danh sách NGÀY ĐI HỌC · NHẬN XÉT (editable, lưu theo HS+tháng) · lời chào · **VietQR** (img.vietqr.io: bank+STK+tên chủ, amount=tổng, addInfo="Hoc phi"). Xuất ảnh bằng **html2canvas** (nút Tải Phiếu Đơn). "Phụ phí" và "nhắc nợ" là mở rộng — cân nhắc tối giản ở P2, để P3.
