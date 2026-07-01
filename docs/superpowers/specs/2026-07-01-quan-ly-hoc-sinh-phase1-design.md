# Thiết kế: Quản lý học sinh của Trang Nhung — Phase 1 (MVP)

- **Ngày:** 2026-07-01
- **Chủ dự án / người dùng:** Trang Nhung (một giáo viên gia sư — dùng cá nhân, KHÔNG phải SaaS đa người dùng)
- **Sản phẩm tham chiếu:** [phieuhocphi.com](https://phieuhocphi.com) — xem [reverse-engineering](../../research/phieuhocphi-analysis.md)
- **Phase:** 1 / 3 (MVP). Phase 2 = phiếu học phí + VietQR + nhận xét/lịch dạy. Phase 3 = hoàn thiện + bàn giao.

## 1. Mục tiêu

App quản lý học sinh cho Trang Nhung: thêm học sinh → điểm danh mỗi buổi → tự tính học phí tháng
(`số buổi × học phí`). Bám sát giao diện/luồng của phieuhocphi.com. Deploy Vercel để demo.

**Phase 1 làm:** Dashboard + thống kê · Quản lý học sinh (CRUD) · Điểm danh.
**Phase 1 KHÔNG làm (ẩn khỏi navigation, để Phase 2):** phiếu học phí, VietQR, nhận xét, lịch dạy.

## 2. Quyết định đã chốt (ràng buộc)

- **Stack (theo CLAUDE.md):** Next.js 16 (App Router) + React 19 + TypeScript, Tailwind v4 + shadcn/ui,
  next-intl (chỉ `vi`), Zustand (persist localStorage) + Zod + Sonner. Deploy Vercel.
- **Lưu dữ liệu:** seed file `.ts` trong project → **localStorage** (Zustand persist). KHÔNG DB/API thật.
  Ghi ngược vào project = nút **Export JSON** (tải về, dán vào `src/data/`, commit thủ công) + **Import JSON**.
  Lý do: Vercel runtime read-only, không ghi file được; đây là cách duy nhất vừa giữ file trong project,
  vừa hiển thị từ storage, vừa deploy Vercel được.
- **Ngôn ngữ:** route + file + identifier = **tiếng Anh**; mọi chữ hiển thị cho người dùng = **tiếng Việt**
  (qua `messages/vi.json`).
- **Số buổi** = số bản ghi điểm danh có `status='present'` ("Có") trong tháng đã chọn. Vắng không tính tiền.
- **`className`** = chuỗi tự do, có gợi ý từ các lớp đã nhập (không quản lý entity "Lớp" riêng).
- **`fee2` ("HP Buổi 2")** = lưu trong form nhưng CHƯA dùng để tính ở Phase 1 (chưa có cơ chế phân loại buổi).
- **Học phí lưu bằng VND trực tiếp** (không chia 100). `formatPrice` không chia 100.
- **Giữ đủ tính năng như bản gốc** trong phạm vi 3 màn trên (4 thẻ thống kê, nhập hàng loạt, điểm danh hàng loạt…).

## 3. Kiến trúc

3 lớp: **UI (pages/components) → store (Zustand, nguồn sự thật + tự persist) → repositories (seed + Export/Import)**.

- Store là nguồn sự thật của dữ liệu runtime và **tự persist localStorage** (Zustand `persist`).
- `repositories/` KHÔNG làm lớp CRUD chồng lên store (tránh hai nơi lưu đá nhau). Nhiệm vụ của nó:
  (1) nạp **seed** lần đầu, (2) **Export/Import JSON**, (3) helper storage SSR-safe.
- Logic tính tiền tách riêng `lib/fees.ts` (hàm thuần, test được).

### Cấu trúc thư mục

```
src/
├─ app/
│  ├─ layout.tsx                 # root + next-intl provider + <Toaster/> (Sonner)
│  ├─ page.tsx                   # Dashboard
│  ├─ students/page.tsx          # Quản lý học sinh
│  └─ attendance/page.tsx        # Điểm danh
├─ components/
│  ├─ ui/                        # shadcn/ui (button, dialog, table, select, input, ...)
│  ├─ dashboard/                 # StatCards, StudentTable, MonthYearPicker
│  ├─ students/                  # StudentForm (Zod), StudentList, ImportExportButtons, BulkImport
│  └─ attendance/                # ClassPicker, AttendanceDatePicker, AttendanceGrid, BulkAttendance
├─ lib/
│  ├─ config.ts                  # tên GV, học phí mặc định (bank cho Phase 2)
│  ├─ navigation.ts              # 3 mục Phase 1 (ẩn phiếu học phí)
│  ├─ utils.ts                   # formatPrice (VND, không chia 100), cn()
│  ├─ fees.ts                    # đếm buổi + tính học phí tháng (thuần)
│  └─ repositories/
│     ├─ storage.ts              # get/set localStorage SSR-safe
│     ├─ students.repo.ts        # seed + export/import học sinh
│     └─ attendance.repo.ts      # seed + export/import điểm danh
├─ store/
│  ├─ useStudentStore.ts         # persist — students
│  └─ useAttendanceStore.ts      # persist — attendance
├─ data/
│  └─ students.ts                # SEED: { students, attendance } (VND) — tiếng Việt
├─ types/
│  └─ index.ts
└─ messages/
   └─ vi.json                    # toàn bộ chữ hiển thị
```

## 4. Mô hình dữ liệu

```ts
type FeeMode = 'per_session' | 'fixed_monthly'   // theo buổi | cố định theo tháng

interface Student {
  id: string
  fullName: string
  className: string          // "Lớp" — chuỗi tự do (gợi ý từ lớp đã có)
  feeMode: FeeMode
  fee: number                // VND, KHÔNG chia 100
  fee2?: number              // "HP Buổi 2" — lưu, chưa dùng tính ở Phase 1
  startDate: string          // 'yyyy-mm-dd'
  sortOrder: number          // STT
}

interface AttendanceRecord {
  studentId: string
  date: string               // 'yyyy-mm-dd'
  status: 'present' | 'absent'   // Có | Vắng
}
```

### Tính học phí (`lib/fees.ts`)

- `countSessions(studentId, year, month)` = số `AttendanceRecord` `status='present'` trong tháng đó.
- `monthlyFee(student, year, month)`:
  - `per_session` → `countSessions × student.fee`
  - `fixed_monthly` → `student.fee`
- Doanh thu tháng = Σ `monthlyFee` mọi HS. Doanh thu năm = Σ 12 tháng.
  Doanh thu hôm nay = Σ (HS per_session có điểm danh 'present' hôm nay × fee).

## 5. Màn hình & luồng (bám phieuhocphi)

### Dashboard (`/`)
- Thanh trên: tên GV + chọn **Tháng (1–12) / Năm**; mọi số liệu bám kỳ đã chọn.
- **4 thẻ:** Số học sinh · **Tổng năm** · **Tháng N** · **Hôm nay**.
- Nút **Xem điểm danh hôm nay**.
- Bảng: **HỌC SINH | LỚP | ĐIỂM DANH (n/tổng) | BUỔI | HỌC PHÍ THÁNG** + lọc lớp + tìm tên.
- Rỗng → hướng dẫn "Thêm học sinh".

### Quản lý học sinh (`/students`)
- Bảng danh sách; **Thêm** (Dialog + Zod), **Sửa**, **Xóa** (xác nhận, xóa kèm điểm danh của HS).
- Lọc lớp, tìm tên. **Nhập hàng loạt** (dán/nhập nhiều HS). **Export/Import JSON**.
- Form: STT · Họ tên · Lớp (gợi ý) · mode học phí · học phí · HP buổi 2 · ngày bắt đầu.

### Điểm danh (`/attendance`)
- Chọn **lớp** → chọn **ngày** (mặc định hôm nay) → mỗi HS một nút **Có/Vắng**, lưu ngay.
- **Cả lớp Có** (đánh nhanh). **Điểm danh hàng loạt** nhiều ngày.
- Chỉ hiện HS đã bắt đầu học (ngày ≥ `startDate`); mặc định theo tháng đang xem ở Dashboard để số liệu khớp.

### Điều hướng
3 mục: **Tổng quan · Học sinh · Điểm danh**. Ẩn phiếu học phí/VietQR/nhận xét/lịch dạy.

## 6. Test & xử lý lỗi

- **Unit test `lib/fees.ts`:** per_session/fixed_monthly; đủ/thiếu điểm danh; HS bắt đầu giữa tháng; tháng rỗng.
- **SSR-safe:** đọc localStorage sau mount (tránh hydration mismatch); Zustand persist `skipHydration` nếu cần.
- **Import JSON:** validate Zod trước khi nạp; sai → toast lỗi, giữ nguyên dữ liệu cũ.
- **Xóa HS:** xác nhận; xóa kèm bản ghi điểm danh liên quan.
- **Rỗng:** màn hướng dẫn thêm học sinh.

## 7. Ngoài phạm vi Phase 1

Phiếu học phí (html2canvas → ảnh), VietQR, nhận xét tháng, lịch dạy, thống kê nâng cao, đa người dùng,
DB/API thật, ghi file tự động.
