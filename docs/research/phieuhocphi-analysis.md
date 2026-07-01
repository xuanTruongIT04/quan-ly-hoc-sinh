# Research: phieuhocphi.com ("Phiếu Học Phí" / "Điểm Danh")

Reverse-engineered 2026-07-01 via Chrome DevTools, logged in as trial account (school "XUÂN TRƯỜNG", 0 students). This documents the reference product our student-management app is modeled on.

## What the product is

A **PWA for tutoring centers / individual tutors in Vietnam** to manage students, take attendance, auto-compute monthly tuition, and generate a beautiful shareable **tuition slip ("phiếu học phí")** with an embedded VietQR payment code that parents scan to pay.

Core loop: add students → mark attendance each session → system counts sessions × fee → generate per-student monthly tuition slip (with attendance dates, teacher's comment, and VietQR) → share to parent.

## Tech stack (observed)

- **Frontend:** Vanilla JS, bundled with **Vite** (ES module chunks). NO React/Vue. Uses **Bootstrap 5.3**, **Chart.js 4.4** (stats), **html2canvas 1.4** (export slip as image).
- **Backend:** **Supabase** (Postgres + PostgREST auto-API + Supabase Auth). Project ref `shngtvurlpsvidmjuhnz`. All data reads are direct PostgREST calls from the browser with the anon key + user JWT (so **Row Level Security** is doing the auth heavy-lifting).
- **Auth:** custom `/api/login` + `/api/login-challenge` endpoints wrapping Supabase auth, gated by **Cloudflare Turnstile**. Session (JWT) cached in localStorage (`phieuhocphi_sb_auth`, `_sb_refresh_backup`).
- **Offline-first PWA:** Service Worker + IndexedDB + localStorage cache. Custom sync layer (`sync.js`, `push-batcher.js`, `cache.js`) with staggered/throttled background sync (`fhp_last_sync`, `_sync_interval_cache`). Config/feature-flags pulled from a `system_settings` table.
- **Payments:** VietQR (`img.vietqr.io` + a local generator `vietqr-local.js`). No payment processor — QR is just a bank-transfer deep link; payment confirmation is manual.
- **Multi-tenant:** every row scoped by `school_id` (one account = one "school"/center).

## Data model (tables observed via PostgREST calls)

- **`students`** — columns seen in query: `school_id`, `class_name`, `full_name`, `sort_order`. Plus (from Add-Student form): fee mode (per-session vs fixed-monthly), fee amount, "HP Buổi 2" (a second/alternate per-session rate), start date (`Ngày Bắt Đầu Học`).
- **`class_daily_logs`** — attendance / session records per class per day (the raw material for counting buổi = sessions).
- **`schedules`** — teaching schedule, ordered by `schedule_date desc` ("Lịch Dạy").
- **`teacher_attendance`** — teacher's own attendance/check-in.
- **`system_settings`** — global config/feature flags (sync intervals, maintenance flags).
- (Implied) a **schools/settings** entity holding: school display name, theme, bank account (bank code + account number + account holder) for the VietQR.

## Key screens & workflows

### Dashboard (`/dashboard`)
- Top bar: school name + logo, "Dùng Thử" (upgrade to Ultra) button, **Month selector** (Tháng 1–12) + **Year selector** (2026–2028), online indicator.
- 4 stat cards: **HỌC SINH** (student count), **TỔNG NĂM** (total revenue this year), **THÁNG N** (this month's revenue), **HÔM NAY** (today's revenue).
- Search box + class filter ("Tất cả lớp").
- Action buttons: **Xem Điểm Danh Hôm Nay** (view today's attendance), **Điểm Danh** (take attendance), **Nhận Xét** (comments), **Lịch Dạy** (teaching schedule).
- Student table: HỌC SINH | LỚP | ĐIỂM DANH (n/total days) | BUỔI (session count) | HỌC PHÍ THÁNG N.
- Floating "⚡ Quick Menu" (draggable) + Zalo chat widget.

### Add / Manage Students modal ("🎓 QUẢN LÝ DANH SÁCH HỌC SINH")
Two tabs: **📋 Danh Sách** (list + add form) and **📊 Chi Tiết** (per-class detail/stats).
Add form fields: STT (order) · Họ và Tên · **Lớp** (autocomplete, reuses existing class names) · fee mode toggle [**Tính Học Phí Theo Từng Buổi** = per session | **Tính Học Phí Cố Định** = fixed/month] · **Học Phí** (amount, default 100,000đ) · **HP Buổi 2** (alternate rate for a 2nd session type) · **Ngày Bắt Đầu Học**.
Also: **📤 Nhập HS hàng loạt** (bulk import), multi-delete, per-class filter, name search.

### Attendance mode ("Điểm Danh")
- Select class → pick date (default today) → mark each student present/absent.
- **📋 HÀNG LOẠT** = bulk attendance across many days at once.
- Toggle between a grid view and a "sổ xuống" (dropdown) view.

### Comments ("Nhận Xét")
Per-student monthly comment (the "— NHẬN XÉT —" line on each tuition slip). Each slip also has a closing greeting message.

### Teaching schedule ("Lịch Dạy")
Calendar of teaching days (`schedules` table), plus teacher self check-in (`teacher_attendance`).

### Tuition slip ("Phiếu Học Phí") — the namesake artifact
Shown as 5 themed samples on the login page. Each slip contains:
- Class name, **Month**, **Theme name** (see themes below)
- 🧑 Học sinh (student name)
- 💰 Học phí / buổi (fee per session)
- 🗓 Số buổi học (session count)
- **TỔNG HỌC PHÍ** (total = fee × sessions)
- **NGÀY ĐI HỌC** (list of attended dates, e.g. 03/02, 05/02, …)
- **— NHẬN XÉT —** (teacher's comment) + a closing greeting emoji-line
- **VietQR** image (bank · account number · ACCOUNT HOLDER NAME), amount pre-filled to total, memo "Hoc phi"
Rendered to image via html2canvas for sharing (Zalo/Messenger/print).

### Themes (from `theme-registry.js` + login samples)
Named skins, each with its own palette + emoji set:
- **Mặc Định 🌿** (default green)
- **Đại Dương 🌊** (ocean blue)
- **Oải Hương 🌸** (lavender)
- **Dâu Tây 🍭** (strawberry pink — appears to be the app's primary brand skin: candy/lollipop 🍭)
- **Sang Trọng ✨** (luxury / elegant)

## Notable product details
- **Trial vs Ultra** tiers (freemium).
- Fee model supports both **per-session** and **fixed-monthly**, plus a **secondary session rate** ("HP Buổi 2") — real tutoring centers charge different rates for different session types.
- Revenue rolls up by day / month / year on the dashboard.
- Everything is **month-scoped**: you pick a month+year and the whole dashboard reflects that period.
- Vietnamese-first UI, playful/cute aesthetic (candy theme, emojis everywhere), aimed at non-technical tutors (often young female teachers).

## Security note
The browser holds the Supabase anon key + a user JWT (normal for Supabase apps; RLS enforces tenancy). I did **not** persist any tokens/keys from this account — only the schema/feature knowledge above.
