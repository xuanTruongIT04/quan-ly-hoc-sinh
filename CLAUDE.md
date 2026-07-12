# Project: "Quản lý học sinh của Trang Nhung"

A **student-management app for a Vietnamese tutoring teacher (Trang Nhung)** to manage her
students, take attendance each session, auto-compute monthly tuition, and generate a shareable
**tuition slip ("phiếu học phí")** with an embedded **VietQR** code that parents scan to pay.
Owner/user: **Trang Nhung** (single-teacher personal use — not a multi-tenant SaaS).

Reference product this app is modeled on: **phieuhocphi.com** — see the reverse-engineering
write-up in [docs/research/phieuhocphi-analysis.md](docs/research/phieuhocphi-analysis.md).

Core loop: thêm học sinh → điểm danh mỗi buổi → hệ thống đếm số buổi × học phí → xuất
phiếu học phí tháng cho từng học sinh (kèm ngày đi học, nhận xét, VietQR) → gửi cho phụ huynh.

## 3-phase roadmap

> 🎯 **Đích cuối = FULL, toàn bộ chức năng như phieuhocphi.com** (vẫn 1 người dùng, dữ liệu localStorage).

| Phase | Goal | Status |
|-------|------|--------|
| **1 — MVP** | Dashboard + thống kê · quản lý học sinh (CRUD, nhập hàng loạt) · điểm danh (có hàng loạt) · tính học phí | ✅ Hoàn thành |
| **2a — Phiếu học phí** | Xuất **phiếu học phí** (html2canvas-pro → ảnh) + **VietQR** (sinh local, EMVCo) + **nhận xét** tháng | ✅ Hoàn thành |
| **2b-1 — Theme/phiếu lớp** | 5 theme phiếu (Mặc Định/Đại Dương/Oải Hương/Dâu Tây/Sang Trọng) + xuất phiếu cả lớp | ✅ Hoàn thành |
| **2b-2 — Phụ phí/nợ** | Phụ phí (số + ghi chú) + nhắc nợ (đã trả/chưa) · doanh thu gồm phụ phí | ✅ Hoàn thành |
| **2b-3 — Điểm/buổi 2** | 2 cột điểm (nhãn config) + buổi 2 (present2, tính fee2) | ✅ Hoàn thành |
| **3-1 — Biểu đồ** | Thống kê/biểu đồ doanh thu (Chart.js) 12 tháng/ngày + thẻ + tỉ lệ trả-nợ trên Dashboard | ✅ Hoàn thành |
| **3-2 — Lịch dạy/chấm công GV** | Lịch dạy + điểm danh giáo viên | ❌ Hủy (2026-07-09) — Trang Nhung không cần; nhu cầu thật = "1 bảng, 1 tháng → ra tiền" đã đáp ứng đủ |
| **UI — Kẹo ngọt** | Đại tu thị giác bám phieuhocphi (font Comfortaa, tokens hồng/magenta, class `.candy-*`, thẻ gradient) | ✅ Hoàn thành (2026-07-10) |
| **QUICK MENU + tính năng** | Menu nổi ⚡ (kéo được, accordion) + 6 tính năng: Thiết lập trung tâm (`/settings`, VietQR sửa trong app), Thu nợ (`/debts`), Bảng tổng hợp (`/summary`), Bảng phụ phí (`/extra-fees`), Xuất Excel (SheetJS), Giao diện phiếu (`/receipt-theme`) | ✅ Hoàn thành (2026-07-12) |

> ✅ Roadmap gốc + UI + menu-tính-năng đã hoàn tất. Việc còn lại: bàn giao/deploy Vercel.

> ⚠️ **Data stays in files.** Đây là bản cá nhân cho Trang Nhung dùng, KHÔNG nối DB/API thật.
> Dữ liệu quản lý bằng file (`.ts`/JSON) qua lớp `repositories/` — kể cả về sau vẫn giữ file,
> không thay bằng backend thật. `repositories/` chỉ là ranh giới gọn gàng, không phải để swap DB.

## Language (MUST FOLLOW)

- Respond to the user in **Vietnamese** for all explanations, summaries, questions, and chat.
- Code, identifiers, file paths, commands, commit messages, technical keywords: keep in English/code.
- Comments in code: keep the file's existing comment language style; don't translate existing comments.
- Error text quoted from logs/tools: keep the original, then explain in Vietnamese.
- UI content is **Vietnamese-first** (đối tượng dùng là giáo viên, không rành kỹ thuật).

## Behavior rules (MUST FOLLOW)

1. **Clarify before coding** — do NOT write code when a requirement is unclear, has multiple
   interpretations, or scope isn't confirmed yet. → ASK the user first.
2. **Present before coding**: (1) Restate the problem → (2) Clarifying questions → (3) Proposed
   approach (no code) → (4) Confirm scope (what will / won't change) → WAIT for user confirmation.
3. **Simplicity first** — pick the simplest working solution. Don't add abstraction
   (service/repository/interface) unless it's actually needed. Reuse existing patterns, don't invent new ones.
4. **Surgical changes** — modify only the minimum required, don't refactor unrelated code,
   preserve existing architecture unless explicitly asked otherwise.

## Tech stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript** — deployed on **Vercel**.
- **Tailwind CSS v4** + **shadcn/ui** (`src/components/ui/`).
- **next-intl** — Vietnamese only (`messages/vi.json`, default locale `vi`).
- **Zustand** (stores — persisted to localStorage), **Zod** (form validation), **Sonner** (toasts).
- **html2canvas** (xuất phiếu học phí ra ảnh), **VietQR** (`img.vietqr.io` — chỉ là deep-link
  chuyển khoản, xác nhận thanh toán thủ công) — dùng từ Phase 2.

> ⚠️ This is NOT the Next.js you know. APIs/conventions may differ from training data.
> READ the relevant guide under `node_modules/next/dist/docs/` before writing Next.js code.

## Key config files (check these first)

| To change | File |
|-----------|------|
| Tên giáo viên/website, thông tin liên hệ, tài khoản ngân hàng (cho VietQR), học phí mặc định | `src/lib/config.ts` |
| Navigation (các trang MVP) | `src/lib/navigation.ts` |
| Mock data học sinh / lớp / điểm danh / học phí (**`.ts` file**, VND) | `src/data/students.ts` |
| Translation strings (components using `useTranslations`) | `messages/vi.json` |
| VND price formatting | `src/lib/utils.ts` → `formatPrice` |
| Data access layer (đọc/ghi file, giữ nguyên qua các phase) | `src/lib/repositories/` |

## Data conventions

- **Học phí lưu trực tiếp bằng VND** (NOT cents). `formatPrice` không chia 100.
- **Fee model**: hỗ trợ cả **theo buổi** (per-session) và **cố định/tháng** (fixed-monthly),
  cộng một **mức buổi 2** ("HP Buổi 2") — trung tâm/gia sư tính giá khác nhau cho loại buổi khác nhau.
- **Month-scoped**: chọn tháng + năm → toàn bộ dashboard/học phí phản ánh kỳ đó.
- Mock data lives in a **`.ts` file** (`src/data/students.ts`), default-exporting the entities
  (ví dụ `{ students, classes, attendance }`).
- Repositories (`src/lib/repositories/`) là lớp đọc/ghi dữ liệu — **luôn dùng file**, không swap sang DB thật.

## Domain model (theo sản phẩm tham chiếu — xem docs/research)

- **Học sinh (student)** — họ tên, lớp, mode học phí (theo buổi / cố định), mức học phí, HP buổi 2,
  ngày bắt đầu học, thứ tự (STT).
- **Điểm danh (attendance)** — bản ghi có/vắng theo học sinh theo ngày; đếm ra **số buổi**.
- **Học phí tháng** — `số buổi × học phí` cho mode theo buổi, hoặc mức cố định.
- **Phiếu học phí (Phase 2)** — tên HS · học phí/buổi · số buổi · TỔNG HỌC PHÍ · NGÀY ĐI HỌC ·
  NHẬN XÉT + lời chào · **VietQR** (ngân hàng · số TK · chủ TK, số tiền = tổng, nội dung "Hoc phi").
- **Nhận xét / Lịch dạy (Phase 2+)** — nhận xét tháng cho từng HS; lịch dạy theo ngày.

## Phase 1 scope (current MVP)

- **Dashboard**: chọn tháng/năm, thẻ thống kê (số học sinh, doanh thu), bảng học sinh
  (HỌC SINH | LỚP | ĐIỂM DANH | BUỔI | HỌC PHÍ THÁNG).
- **Quản lý học sinh**: thêm/sửa/xóa học sinh, lọc theo lớp, tìm theo tên.
- **Điểm danh**: chọn lớp → chọn ngày → đánh dấu có/vắng từng học sinh.
- **Tính học phí**: tự động tính `số buổi × học phí` theo tháng đã chọn.
- Phiếu học phí / VietQR / nhận xét / lịch dạy → để **Phase 2** (có thể đã có code nhưng ẩn khỏi nav).

## Git workflow (MUST FOLLOW)

- Use `git pull` (merge strategy). FORBIDDEN: `git pull --rebase`, `git rebase` on shared branches.
- Only commit/push when the user asks. If on the default branch → create a new branch first.

## Plan convention (when writing plans)

Every plan starts with frontmatter, stored under `docs/plans/`:

```yaml
---
title: <Feature name>
status: Đã lập kế hoạch   # Đã lập kế hoạch | Đang triển khai | Đang test | Hoàn thành | Hủy
created_date: YYYY-MM-DD
completed_date:
owner: <person/ai responsible>
---
```
`Hủy` (cancelled) must include a reason. Update `status` as work progresses.
