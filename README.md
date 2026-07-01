# Quản lý học sinh của Trang Nhung

App quản lý học sinh cho một giáo viên gia sư (Trang Nhung) — mô phỏng [phieuhocphi.com](https://phieuhocphi.com).

**Phase 1 — MVP (hiện tại):**
- **Tổng quan (`/`)** — chọn tháng/năm, 4 thẻ thống kê (số học sinh, tổng năm, tháng này, hôm nay), bảng học sinh (lọc lớp, tìm tên).
- **Học sinh (`/students`)** — thêm/sửa/xóa (form Zod), lọc lớp, tìm tên, nhập hàng loạt, Export/Import JSON.
- **Điểm danh (`/attendance`)** — chọn lớp → chọn ngày → đánh Có/Vắng, "Cả lớp Có", điểm danh hàng loạt nhiều ngày.
- **Học phí tháng** tự tính: `số buổi (điểm danh "Có") × học phí` (theo buổi) hoặc mức cố định.

Phase 2 (phiếu học phí + VietQR + nhận xét) và Phase 3 (lịch dạy, 5 theme, biểu đồ) — xem `docs/superpowers/specs/` và `CLAUDE.md`.

## Dữ liệu

Dữ liệu lưu ở **localStorage** của trình duyệt (seed ban đầu từ `src/data/students.ts`). KHÔNG có DB/API thật.
Để sao lưu / ghi ngược vào project: dùng nút **Xuất JSON** (tải file) rồi dán vào `src/data/`; nút **Nhập JSON** để nạp lại.

## Tech stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui · next-intl (tiếng Việt) · Zustand (persist) · Zod · Sonner · Vitest.

## Chạy local

```bash
npm install
npm run dev      # http://localhost:3000
npm test         # unit test (logic tính học phí, store, repositories, utils)
npm run build    # kiểm tra build production
npm run lint     # eslint
```

## Deploy

Push lên GitHub và import vào **Vercel** (framework tự nhận Next.js). Không cần biến môi trường.

## Tài liệu

- `docs/research/phieuhocphi-analysis.md` — nghiên cứu sản phẩm tham chiếu.
- `docs/superpowers/specs/` — thiết kế Phase 1.
- `docs/superpowers/plans/` — kế hoạch triển khai.
- `CLAUDE.md` — hướng dẫn dự án (ngôn ngữ, ràng buộc dữ liệu, roadmap).
