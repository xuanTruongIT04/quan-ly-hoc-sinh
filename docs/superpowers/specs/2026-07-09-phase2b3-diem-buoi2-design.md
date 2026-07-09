# Thiết kế: Phase 2b-3 — 2 cột điểm + Buổi 2

- **Ngày:** 2026-07-09
- **Chủ dự án / người dùng:** Trang Nhung
- **Sản phẩm tham chiếu:** [phieuhocphi.com](https://phieuhocphi.com)
- **Phase:** 2b-3 (lát CUỐI của P2b). Tiền đề: P2a + P2b-1 + P2b-2 xong. Sau lát này = xong toàn bộ P2b.

## 1. Mục tiêu

Thêm **2 cột điểm** (số/HS/tháng, nhãn cấu hình) và **buổi 2** (trạng thái điểm danh mới, màu riêng trên phiếu,
tính theo fee2). Lát đụng mô hình dữ liệu Phase 1 NHIỀU NHẤT (đổi `AttendanceRecord.status`, đổi đếm buổi + tính tiền).

**P2b-3 làm:** 2 cột điểm · buổi 2 (điểm danh 3 trạng thái + màu phiếu + tính fee2).
**P2b-3 KHÔNG làm:** (P2b xong sau lát này; còn Phase 3 = lịch dạy/điểm danh GV/biểu đồ).

## 2. Quyết định đã chốt

- **Buổi 2 = trạng thái điểm danh mới** `'present2'`: điểm danh có 3 trạng thái Có (buổi 1, `present`) / Có B2 (`present2`) / Vắng (`absent`).
- **Số buổi = present + present2** (đếm chung tổng). Cột BUỔI, "số buổi học", classSessionsInMonth đếm cả hai.
- **Học phí buổi 2 tính theo fee2**: `monthlyFee (per_session) = (buổi1 × fee) + (buổi2 × feeForSession2)`, với
  `feeForSession2 = student.fee2 && student.fee2 > 0 ? student.fee2 : student.fee` (fee2=0/undefined → dùng fee, tránh mất tiền).
- **Buổi 2 khác MÀU trên phiếu** (badge ngày buổi 2 dùng màu khác badge buổi 1).
- **2 cột điểm = 2 số/HS/tháng** (thang 0-10 thập phân, cho phép để trống = null). Nhãn 2 cột trong `config.ts` (`scoreLabels`).
- Nhập điểm trong ReceiptDialog. Học phí VND (không chia 100). Key dữ liệu dùng `commentKey`.

## 3. Kiến trúc (đụng data model — GIỮ 59 test cũ)

```
src/
├─ types/index.ts                # + status 'present2'; + ScorePair interface
├─ lib/config.ts                 # + scoreLabels: [string, string]
├─ lib/fees.ts                   # countSessions đếm present+present2; countSessions1/2; monthlyFee dùng fee2; revenueForDay buổi 2
├─ store/useAppStore.ts          # + scores + setScore/getScore + partialize; markClassPresent giữ 'present'
├─ components/attendance/AttendanceBoard.tsx  # 3 nút Có/Có B2/Vắng
├─ components/receipt/ReceiptCard.tsx  # badge ngày buổi 2 màu khác + 2 dòng điểm
├─ components/receipt/ReceiptDialog.tsx # 2 ô nhập điểm + nút lưu
├─ components/receipt/BatchReceiptExport.tsx # (ReceiptCard tự đọc score/attendance từ store — có thể không đổi)
└─ messages/vi.json              # + key score/buổi 2
```

## 4. Mô hình dữ liệu

```ts
// types — status thêm 'present2'
AttendanceRecord.status: 'present' | 'present2' | 'absent'

export interface ScorePair { s1: number | null; s2: number | null }   // điểm 0-10, null = chưa nhập

// store (persist — thêm scores vào partialize)
scores: Record<string, ScorePair>   // key = commentKey(studentId,year,month)
setScore(studentId, year, month, s1: number|null, s2: number|null): void
getScore(studentId, year, month): ScorePair   // {s1:null,s2:null} nếu chưa có
// điểm danh buổi 2: thêm action setAttendance đã hỗ trợ status bất kỳ (present2) — kiểm và mở rộng nếu cần

// config.ts
scoreLabels: ['Điểm miệng', 'Điểm viết']   // 2 nhãn cột (Trang Nhung sửa file)
```

### fees.ts (đổi — TDD nghiêm, backward-compat)

```ts
// Đếm buổi: TỔNG = present + present2
countSessions(studentId, attendance, year, month): number   // đếm status !== 'absent' (present + present2) trong tháng
countSessions1(studentId, attendance, year, month): number  // chỉ 'present'
countSessions2(studentId, attendance, year, month): number  // chỉ 'present2'

// monthlyFee per_session = buổi1×fee + buổi2×feeForSession2
function feeForSession2(student): number { return student.fee2 && student.fee2 > 0 ? student.fee2 : student.fee }
monthlyFee(per_session) = countSessions1(...) * student.fee + countSessions2(...) * feeForSession2(student)
// fixed_monthly giữ nguyên = student.fee

// revenueForDay: present hôm nay × fee + present2 hôm nay × feeForSession2 (per_session)
// classSessionsInMonth: đếm ngày distinct có bất kỳ record (present/present2/absent) — GIỮ NGUYÊN (đã đếm mọi record)
```

**Backward-compat (giữ 59 test cũ xanh):** dữ liệu cũ chỉ có 'present'/'absent' → countSessions2 = 0 → monthlyFee =
`countSessions1 × fee + 0` = `(số present) × fee` = **y hệt công thức cũ**. countSessions (tổng) với dữ liệu cũ =
số present = như cũ. Test cũ (không có present2) cho giá trị KHÔNG đổi.

## 5. Luồng & màn hình

### Điểm danh (AttendanceBoard)
Mỗi HS 3 nút: **Có** (`present`, xanh) · **Có B2** (`present2`, tím/khác màu) · **Vắng** (`absent`, đỏ). Highlight theo trạng thái.
"Cả lớp Có" + điểm danh hàng loạt giữ `present` (buổi 1). setAttendance nhận status bất kỳ (đã upsert theo studentId+date).

### ReceiptDialog
Thêm **2 ô nhập điểm** (label từ `CONFIG.scoreLabels`, input number 0-10, để trống = null) + nút **"💾 Lưu điểm"** → `setScore`.
syncMonth nạp thêm điểm khi mở/đổi tháng.

### ReceiptCard
- Ngày đi học: ngày `present2` dùng **badge màu khác** (VD amber) để phân biệt buổi 2. Có chú thích nhỏ nếu có buổi 2.
- "Số buổi học" = tổng (present + present2). Nếu có buổi 2, hiện phụ "(X buổi 1 + Y buổi 2)".
- Nếu có điểm (s1/s2 != null): thêm khối **2 dòng điểm** (`scoreLabels[0]: s1`, `scoreLabels[1]: s2`) cạnh/ trên nhận xét.
- TỔNG dùng `receiptTotal` (đã gồm monthlyFee mới có buổi 2 + phụ phí).

### Dashboard
Cột BUỔI + ĐIỂM DANH n/tổng tự đúng vì countSessions đã đổi (đếm tổng). Doanh thu tự đúng (monthlyFee đổi). Không cần sửa UI Dashboard.

## 6. Test & xử lý lỗi

- **TDD `fees.ts`:** countSessions (present+present2), countSessions1/2 tách đúng; monthlyFee với buổi 2 (fee2>0 → dùng fee2; fee2=0 → dùng fee); revenueForDay present2; **ca không có present2 = như cũ (59 test cũ xanh)**.
- **TDD store:** setScore/getScore (s1/s2, null default); persist scores. setAttendance('present2') upsert đúng.
- **ReceiptCard:** buổi 2 badge màu khác; điểm hiện khi có; số buổi = tổng.
- **Điểm danh:** 3 nút toggle đúng trạng thái; buổi 2 → cột BUỔI Dashboard +1, học phí tính theo fee2.
- **Smoke:** đánh 1 buổi 2 (HS có fee2) → phiếu hiện ngày buổi 2 màu khác + tổng tính fee2 + số buổi +1; nhập 2 điểm → hiện trên phiếu; tải PNG kiểm (mở ảnh).

## 7. Sau P2b-3

Xong toàn bộ P2b. Còn Phase 3: lịch dạy + điểm danh giáo viên + thống kê/biểu đồ doanh thu (Chart.js).
