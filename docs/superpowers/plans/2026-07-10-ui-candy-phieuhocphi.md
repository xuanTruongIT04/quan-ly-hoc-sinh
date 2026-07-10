# Đại tu UI kẹo ngọt (bám phieuhocphi) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Chuyển toàn bộ UI 3 màn (Dashboard, Học sinh, Điểm danh) + dialog phiếu sang phong cách "kẹo ngọt" giống phieuhocphi, KHÔNG đụng logic/chức năng.

**Architecture:** 3 lớp áp — (1) đổi design tokens trong `globals.css` (màu/radius/nền/chữ nâu), (2) nhúng font Comfortaa+Nunito qua `next/font/google` trong `layout.tsx`, (3) thêm class tiện ích `.candy-*` trong `@layer components` để markup gọn. Sau đó áp lần lượt vào từng màn theo 4 lát. Thuần trình bày — không đổi types/store/fees/stats/repositories.

**Tech Stack:** Next.js 16 App Router + React 19 + TS, Tailwind v4 (oklch), shadcn/base-ui, next-intl, next/font/google.

## Global Constraints

- **KHÔNG phá logic/test** — 71 test giữ xanh; KHÔNG đổi `src/types/`, `src/store/`, `src/lib/fees.ts`, `src/lib/stats.ts`, `src/lib/repositories/`.
- **KHÔNG đổi `src/components/receipt/ReceiptCard.tsx`** (phiếu xuất PNG) — tránh vỡ html2canvas-pro với oklch.
- **base-ui gotchas:** Dialog dùng prop `render` (KHÔNG `asChild`); Select `onValueChange` trả `string|null` → null-guard `(v) => v && setX(v)`; Button điều hướng dùng `buttonVariants()` trên `<Link>` (KHÔNG `render`).
- **html2canvas-pro** (KHÔNG html2canvas 1.4.1).
- Học phí VND (KHÔNG chia 100). Route/file/identifier tiếng Anh; UI tiếng Việt.
- Design tokens đo thật: font Comfortaa+Nunito · nền `#fff8fa` · chữ nâu `#4e342e` · magenta `#c2185b` · hồng `#f06292` · hồng nhạt `#fce4ec` · pill `50px` · card `28px`.
- Gradient thẻ: students `#fde0ec→#fbc4dc` · year `#f06292→#c2185b` · month `#ce93d8→#ab47bc` · today `#b3c7f7→#7e9df0`.
- Mỗi task: verify Chrome (console SẠCH + khớp mockup) → `npm test` (71 pass) → `npx tsc --noEmit` + `npm run lint` sạch → commit. Commit `Co-Authored-By: Claude Opus 4.8`.
- **Đây là UI work — KHÔNG viết unit test cho màu/gradient.** "Test" ở đây = smoke test qua Chrome DevTools MCP + giữ 71 test cũ xanh. Verify bằng screenshot thật, không chỉ đọc code.

**Mockup tham chiếu đã duyệt:** `scratchpad/mockup-dashboard.html` (mở bằng Chrome để so khi làm Dashboard).

---

## Task 1: Nền tảng — design tokens + font

**Files:**
- Modify: `src/app/globals.css` (biến `:root` dòng 51-84; thêm `@layer components` cuối file)
- Modify: `src/app/layout.tsx:10-18,34-37` (đổi font import + className html)

**Interfaces:**
- Produces: biến CSS `--font-heading`/`--font-sans` map sang Comfortaa/Nunito; class `.candy-card`, `.candy-btn`, `.candy-btn-outline`, `.candy-input`, `.candy-pill`, `.stat-card`, `.stat-students`, `.stat-year`, `.stat-month`, `.stat-today`, `.candy-table` dùng được ở mọi component sau.

- [ ] **Step 1: Đổi font trong `layout.tsx`**

Thay khối import font (dòng 2, 10-18):

```tsx
import { Comfortaa, Nunito } from "next/font/google";

const comfortaa = Comfortaa({
  variable: "--font-comfortaa",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "600", "700", "800", "900"],
});
```

Đổi `<html className=...>` (dòng 34-37) từ `${geistSans.variable} ${geistMono.variable}` sang:

```tsx
<html
  lang={locale}
  className={`${comfortaa.variable} ${nunito.variable} h-full antialiased`}
>
```

- [ ] **Step 2: Đổi design tokens + nền + chữ nâu trong `globals.css`**

Trong `@theme inline` (khoảng dòng 10-12), đổi 3 dòng font:

```css
  --font-sans: var(--font-nunito);
  --font-mono: var(--font-nunito);
  --font-heading: var(--font-comfortaa);
```

Trong `:root` (dòng 51-84), đổi các biến sau sang tông kẹo ngọt (oklch tương đương hex đo thật). Thay đúng các dòng này, giữ nguyên các dòng còn lại:

```css
  --background: oklch(0.985 0.008 350);      /* #fff8fa nền hồng trắng */
  --foreground: oklch(0.34 0.03 40);         /* #4e342e nâu ấm */
  --primary: oklch(0.52 0.20 358);           /* #c2185b magenta */
  --primary-foreground: oklch(0.99 0.01 350);
  --secondary: oklch(0.95 0.03 350);         /* hồng nhạt */
  --secondary-foreground: oklch(0.52 0.20 358);
  --muted: oklch(0.96 0.015 350);
  --muted-foreground: oklch(0.55 0.04 30);
  --accent: oklch(0.93 0.05 350);
  --accent-foreground: oklch(0.52 0.20 358);
  --border: oklch(0.90 0.03 350);            /* viền hồng nhạt */
  --input: oklch(0.90 0.03 350);
  --ring: oklch(0.70 0.15 350);              /* focus ring hồng */
  --radius: 0.9rem;                          /* bo mềm hơn */
  --sidebar: oklch(0.975 0.012 350);         /* hồng nhạt hơn nền chút */
  --sidebar-foreground: oklch(0.34 0.03 40);
  --sidebar-primary: oklch(0.52 0.20 358);
  --sidebar-accent: oklch(0.93 0.05 350);
  --sidebar-accent-foreground: oklch(0.52 0.20 358);
  --sidebar-border: oklch(0.90 0.03 350);
```

- [ ] **Step 3: Thêm class tiện ích vào cuối `globals.css`**

Thêm khối này SAU khối `@layer base` (cuối file):

```css
@layer components {
  .candy-card {
    @apply rounded-[28px] border border-[#fbdce7] bg-white p-5;
    box-shadow: 0 8px 22px rgba(216, 27, 96, 0.12);
  }
  .candy-btn {
    @apply inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 font-[family-name:var(--font-comfortaa)] text-sm font-bold text-white;
    background: linear-gradient(135deg, #e91e63, #c2185b);
    box-shadow: 0 5px 15px rgba(216, 27, 96, 0.28);
  }
  .candy-btn-outline {
    @apply inline-flex items-center gap-1.5 rounded-full border-[1.5px] border-[#f7a8c4] bg-white px-4 py-2 text-sm font-bold text-[#c2185b];
    box-shadow: 0 3px 10px rgba(216, 27, 96, 0.08);
  }
  .candy-input {
    @apply rounded-full border-[1.5px] border-[#f06292] bg-white px-5 py-2.5 font-bold text-[#4e342e] outline-none;
  }
  .candy-input:focus {
    box-shadow: 0 0 0 4px rgba(216, 27, 96, 0.2);
  }
  .candy-pill {
    @apply inline-flex items-center rounded-full bg-[#fce4ec] px-3 py-1 text-xs font-bold text-[#c2185b];
  }
  .stat-card {
    @apply flex items-center gap-4 rounded-[32px] px-7 py-6 text-white;
    box-shadow: 0 10px 26px rgba(216, 27, 96, 0.15);
  }
  .stat-students { background: linear-gradient(135deg, #fde0ec, #fbc4dc); color: #c2185b; }
  .stat-year { background: linear-gradient(135deg, #f06292, #c2185b); }
  .stat-month { background: linear-gradient(135deg, #ce93d8, #ab47bc); }
  .stat-today { background: linear-gradient(135deg, #b3c7f7, #7e9df0); }
  .stat-circle {
    @apply grid h-16 w-16 flex-none place-items-center rounded-full text-2xl font-bold;
    background: rgba(255, 255, 255, 0.9);
    color: #c2185b;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }
  .candy-table {
    @apply overflow-hidden rounded-[28px] border border-[#fbdce7] bg-white;
    box-shadow: 0 8px 22px rgba(216, 27, 96, 0.12);
  }
  .candy-table thead th {
    @apply px-4 py-4 text-left text-xs font-extrabold uppercase tracking-wide text-[#c2185b];
    background: linear-gradient(135deg, #fce4ec, #f8bbd0);
  }
  .candy-table tbody td { @apply border-t border-[#fbe4ee] px-4 py-4 text-sm font-bold; }
  .candy-table tbody tr:nth-child(even) { @apply bg-[#fff9fb]; }
}
```

- [ ] **Step 4: Verify build + font tải + console sạch**

Run: `npm run dev` (nếu chưa chạy) rồi qua Chrome DevTools MCP:
- `navigate_page` → `http://localhost:3000`
- `evaluate_script`: `await document.fonts.load("700 22px Comfortaa"); await document.fonts.ready; return document.fonts.check("700 22px Comfortaa")` → Expected: `true`
- `take_screenshot` → nền phải hồng nhạt `#fff8fa`, chữ nâu, không trắng trơn
- `list_console_messages` → Expected: KHÔNG có error/warning mới

Run: `npx tsc --noEmit` → Expected: no errors
Run: `npm run lint` → Expected: clean
Run: `npm test` → Expected: 71 pass

- [ ] **Step 5: Sidebar kẹo ngọt** trong `src/components/layout/AppSidebar.tsx`

Thay toàn bộ return (dòng 12-30):

```tsx
  return (
    <aside className="w-56 shrink-0 border-r border-[#fbdce7] bg-[var(--sidebar)] p-4">
      <div className="mb-6 inline-flex items-center gap-2 rounded-full border-4 border-white/90 px-5 py-3"
        style={{ background: 'linear-gradient(135deg,#f8bbd0,#e1bee7)', boxShadow: '0 8px 22px rgba(216,27,96,0.12)' }}>
        <span className="text-xl">🍭</span>
        <span className="font-[family-name:var(--font-comfortaa)] text-base font-bold tracking-wide text-white">{CONFIG.teacherName}</span>
      </div>
      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'rounded-full px-4 py-2.5 text-sm font-bold transition-colors hover:bg-[#fce4ec]',
              pathname === item.href ? 'bg-[#f8bbd0] text-[#c2185b]' : 'text-[#8d6e63]',
            )}
          >
            {item.icon} {t(item.labelKey)}
          </Link>
        ))}
      </nav>
    </aside>
  )
```

- [ ] **Step 6: Verify sidebar + commit**

Chrome: `take_screenshot` — logo pill gradient hồng→tím chữ trắng; item active nền hồng đậm chữ magenta. `list_console_messages` sạch.

```bash
git add src/app/globals.css src/app/layout.tsx src/components/layout/AppSidebar.tsx
git commit -m "feat(ui): nền tảng kẹo ngọt — tokens hồng/magenta + font Comfortaa/Nunito + class candy-* + sidebar

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 2: Dashboard — thẻ thống kê + toolbar + bảng

**Files:**
- Modify: `src/app/page.tsx` (h1 + layout)
- Modify: `src/components/dashboard/StatCards.tsx`
- Modify: `src/components/dashboard/StudentTable.tsx`

**Interfaces:**
- Consumes: class `.stat-card/.stat-*/.stat-circle`, `.candy-input`, `.candy-btn`, `.candy-btn-outline`, `.candy-pill`, `.candy-table` (Task 1).
- Produces: dashboard khớp mockup đã duyệt.

- [ ] **Step 1: `StatCards.tsx` → 4 thẻ gradient đặc**

Thay return (dòng 21-30). Thẻ "Học sinh" đặc biệt (số trong vòng tròn), 3 thẻ còn lại icon+label+value:

```tsx
  const iconFor: Record<number, string> = { 1: '💰', 2: '📅', 3: '🔥' }
  const variant = ['stat-students', 'stat-year', 'stat-month', 'stat-today']
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((c, i) => (
        <div key={c.label} className={`stat-card ${variant[i]}`}>
          {i === 0 ? (
            <>
              <span className="font-[family-name:var(--font-comfortaa)] text-sm font-bold uppercase tracking-wide">{c.label}</span>
              <div className="stat-circle">{c.value}</div>
            </>
          ) : (
            <>
              <div className="stat-circle">{iconFor[i]}</div>
              <div>
                <div className="font-[family-name:var(--font-comfortaa)] text-sm font-bold uppercase tracking-wide opacity-95">{c.label}</div>
                <div className="font-[family-name:var(--font-comfortaa)] text-2xl font-bold leading-tight">{c.value}</div>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  )
```

- [ ] **Step 2: `page.tsx` → tiêu đề Comfortaa + toolbar hành động**

Thay return (dòng 8-21):

```tsx
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-[family-name:var(--font-comfortaa)] text-2xl font-bold text-[#c2185b]">Tổng quan</h1>
        <div className="flex items-center gap-2">
          <ViewTodayAttendanceButton />
          <MonthYearPicker />
        </div>
      </div>
      <StatCards />
      <StudentTable />
      <DashboardCharts />
    </div>
  )
```

- [ ] **Step 3: `ViewTodayAttendanceButton.tsx` → candy-btn-outline**

Thay `className={buttonVariants({ variant: 'outline' })}` bằng `className="candy-btn-outline"`. Giữ nguyên `<Link href="/attendance">` và `{t('viewTodayAttendance')}` (KHÔNG dùng `render`, theo base-ui gotcha).

- [ ] **Step 4: `StudentTable.tsx` → search/select/bảng kẹo ngọt**

Thay:
- Dòng 34 `<Input ... className="max-w-xs" />` → thêm class `candy-input` giữ `max-w-xs`: `className="candy-input max-w-xs"`.
- Bảng (dòng 46-92): bọc `<Table>` trong `<div className="candy-table"><Table>...</Table></div>`. Đổi cột học phí (dòng 78) thêm class magenta: `<TableCell className="text-right font-extrabold text-[#c2185b]">{formatPrice(total)}</TableCell>`. Đổi badge lớp (dòng 73): `<TableCell><span className="candy-pill">{s.className}</span></TableCell>`. Nút Phiếu (dòng 84): `trigger={<button className="candy-btn-outline text-xs">🧾 Phiếu</button>}`.
- Empty state (dòng 28): `className="candy-card p-8 text-center text-[#8d6e63]"`.

Lưu ý badge Nợ (dòng 70) giữ nguyên logic, chỉ đổi class sang `candy-pill` biến thể đỏ: `className="ml-2 inline-flex items-center rounded-full bg-[#fff3cd] px-2 py-0.5 text-xs font-bold text-[#b8860b]"`.

- [ ] **Step 5: Verify Dashboard khớp mockup**

Chrome:
- `navigate_page` → `http://localhost:3000`
- `take_screenshot fullPage:true` — so với `scratchpad/mockup-dashboard.html`: 4 thẻ gradient (hồng/magenta/tím/lam), số "5" trong vòng tròn, search pill, nút Phiếu pill, bảng bo tròn header gradient.
- `list_console_messages` → sạch
- `resize_page` 390px → thẻ xuống 1 cột, không tràn ngang

Run: `npx tsc --noEmit` + `npm run lint` + `npm test` → sạch + 71 pass.

- [ ] **Step 6: Commit**

```bash
git add src/app/page.tsx src/components/dashboard/StatCards.tsx src/components/dashboard/StudentTable.tsx src/components/dashboard/ViewTodayAttendanceButton.tsx
git commit -m "feat(ui): Dashboard kẹo ngọt — 4 thẻ gradient + toolbar pill + bảng bo tròn

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 3: Dashboard — biểu đồ tông kẹo

**Files:**
- Modify: `src/components/dashboard/charts/DashboardCharts.tsx`
- Modify: `src/components/dashboard/charts/StatsSummaryCards.tsx`
- Modify: `src/components/dashboard/charts/RevenueMonthChart.tsx`
- Modify: `src/components/dashboard/charts/RevenueDayChart.tsx`
- Modify: `src/components/dashboard/charts/PaidPieChart.tsx`

**Interfaces:**
- Consumes: `.candy-card` (Task 1).
- Produces: 4 biểu đồ trong candy-card, màu dataset pastel. **KHÔNG đổi logic Chart.js** — chỉ đổi `backgroundColor`/`borderColor` và class wrapper.

- [ ] **Step 1: `DashboardCharts.tsx` → bọc candy-card**

Thay 3 `<Card className="p-4">` bằng `<div className="candy-card">`. Bỏ import `Card` nếu không còn dùng (tránh lint unused).

- [ ] **Step 2: `StatsSummaryCards.tsx` → thẻ nhỏ tông hồng**

Dòng 23: `<Card key={i.label} className="p-3">` → `<div key={i.label} className="candy-card p-4">`. Bỏ import Card nếu thừa. Giữ số magenta (dòng 25 đã `text-pink-600` → đổi `text-[#c2185b]`).

- [ ] **Step 3: Màu biểu đồ pastel**

- `RevenueMonthChart.tsx`: `backgroundColor: '#f9a8d4'`, tháng đang chọn `'#c2185b'` (giữ logic chọn màu, chỉ đổi giá trị nếu khác).
- `RevenueDayChart.tsx` (dòng 18): `backgroundColor: '#ce93d8'` (tím pastel).
- `PaidPieChart.tsx`: đã trả `#22c55e`/`#ef4444` — giữ (semantic xanh/đỏ hợp lý cho đã trả/nợ).

- [ ] **Step 4: Verify biểu đồ**

Chrome: `navigate_page` reload, `take_screenshot` — 4 biểu đồ trong candy-card, màu hồng/tím pastel, vẫn render (StoreHydration OK). `list_console_messages` sạch (không lỗi Chart.js).

Run: `npx tsc --noEmit` + `npm run lint` + `npm test` → sạch + 71 pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/dashboard/charts/
git commit -m "feat(ui): biểu đồ Dashboard tông kẹo — candy-card + màu pastel

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 4: Trang Học sinh

**Files:**
- Modify: `src/app/students/page.tsx` + component con của trang (đọc để xác định: nút Thêm/Nhập/Xuất, search, select lọc, bảng, nút Sửa/Xóa)

**Interfaces:**
- Consumes: `.candy-btn`, `.candy-btn-outline`, `.candy-input`, `.candy-pill`, `.candy-table`.
- Produces: trang HS nhất quán theme.

- [ ] **Step 1: Đọc file thật**

Run: đọc `src/app/students/page.tsx` và mọi component nó render (form thêm/sửa, bảng). Xác định chính xác nút "Thêm học sinh" (đang variant default = đen), "Nhập hàng loạt/Xuất JSON/Nhập JSON", ô search, select lọc lớp, bảng, nút Sửa/Xóa.

- [ ] **Step 2: Áp class kẹo ngọt**

- Nút chính "Thêm học sinh" → `className="candy-btn"` (bỏ variant default đen).
- Nút phụ (Nhập hàng loạt / Xuất JSON / Nhập JSON) → `className="candy-btn-outline"`.
- Ô search → `candy-input`; select lọc lớp → giữ shadcn Select (đã tự đổi tông nhờ tokens), sửa hiển thị `__all__` → `t('allClasses')` nếu còn lộ key thô.
- Bảng → bọc `<div className="candy-table">`, badge lớp `candy-pill`, học phí `text-[#c2185b] font-extrabold`.
- Nút Sửa → `candy-btn-outline`; Xóa → giữ `variant="destructive"` (semantic đỏ) nhưng bo pill: thêm `className="rounded-full"`.
- Tiêu đề trang → `font-[family-name:var(--font-comfortaa)] text-2xl font-bold text-[#c2185b]`.

- [ ] **Step 3: Verify + test + commit**

Chrome: `navigate_page` → `/students`, `take_screenshot` — nút Thêm gradient magenta (không còn đen), select hiện "Tất cả lớp", bảng bo tròn. Thử thêm 1 HS test (fill_form + click) → vẫn lưu được (logic nguyên). `list_console_messages` sạch.

Run: `npx tsc --noEmit` + `npm run lint` + `npm test` → sạch + 71 pass.

```bash
git add src/app/students/
git commit -m "feat(ui): trang Học sinh kẹo ngọt — nút pill + bảng bo tròn + fix nhãn lọc lớp

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 5: Trang Điểm danh

**Files:**
- Modify: `src/app/attendance/page.tsx` + `src/components/attendance/AttendanceBoard.tsx`

**Interfaces:**
- Consumes: `.candy-*`.
- Produces: màn điểm danh nhất quán; 3 nút trạng thái GIỮ logic màu (mặc định/amber/đỏ).

- [ ] **Step 1: Đọc file thật**

Run: đọc `src/app/attendance/page.tsx` + `AttendanceBoard.tsx`. Xác định: chọn lớp, chọn ngày, 3 nút Có/Có B2/Vắng, khung bảng học sinh.

- [ ] **Step 2: Áp class**

- Chọn lớp/ngày → `candy-input` / shadcn Select (tự đổi tông).
- Khung bảng điểm danh → `candy-card` hoặc `candy-table`.
- 3 nút trạng thái: GIỮ nguyên logic active + màu (Có=default, Có B2=amber `bg-amber-500 text-white`, Vắng=destructive đỏ) — chỉ bo pill (`rounded-full`) cho khớp theme. KHÔNG đổi hành vi setAttendance.
- Tiêu đề trang → Comfortaa magenta như các trang khác.

- [ ] **Step 3: Verify + test + commit**

Chrome: `navigate_page` → `/attendance`, chọn lớp, `take_screenshot` — 3 nút bo pill đúng màu, khung kẹo ngọt. Click "Có"/"Có B2"/"Vắng" 1 HS → trạng thái đổi đúng (logic nguyên). `list_console_messages` sạch.

Run: `npx tsc --noEmit` + `npm run lint` + `npm test` → sạch + 71 pass.

```bash
git add src/app/attendance/ src/components/attendance/
git commit -m "feat(ui): trang Điểm danh kẹo ngọt — nút trạng thái bo pill + khung candy

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 6: Dialog phiếu học phí + form HS

**Files:**
- Modify: `src/components/receipt/ReceiptDialog.tsx`
- Modify: `src/components/receipt/ThemePicker.tsx`
- Modify: form dialog thêm/sửa HS (từ Task 4, nếu là dialog riêng)
- **KHÔNG đổi** `src/components/receipt/ReceiptCard.tsx`

**Interfaces:**
- Consumes: `.candy-*`.
- Produces: dialog nhất quán theme; header gradient.

- [ ] **Step 1: Đọc `ReceiptDialog.tsx` + `ThemePicker.tsx`**

Run: đọc để xác định header dialog, các input (phụ phí/ghi chú/điểm/nhận xét), nút (Lưu/Tải phiếu/Tải phiếu lớp/đã-chưa trả).

- [ ] **Step 2: Áp class**

- Header dialog → dải gradient hồng→magenta chữ trắng: `style={{ background: 'linear-gradient(135deg,#e91e63,#c2185b)' }}` + chữ trắng Comfortaa (mô phỏng modal "QUẢN LÝ DANH SÁCH" bản gốc).
- Input phụ phí/ghi chú/điểm/nhận xét → `candy-input` (điểm number giữ min/max/clamp).
- Nút chính (Tải phiếu / Lưu) → `candy-btn`; nút phụ → `candy-btn-outline`.
- ThemePicker: giữ nguyên 5 nút theme (đã đẹp), chỉ bo `rounded-full` nếu chưa.
- Giữ prop `render` cho Dialog (base-ui gotcha) — KHÔNG đổi thành asChild.

- [ ] **Step 3: Verify — MỞ ẢNH PNG THẬT**

Chrome: `navigate_page` → `/`, mở ReceiptDialog (click nút 🧾 Phiếu). `take_screenshot` — header gradient, input pill. Click "Tải phiếu" → tải PNG. **MỞ file PNG thật** (Read tool trên file tải về hoặc screenshot) kiểm không vỡ (bài học oklch — nếu vỡ sẽ trắng/lỗi). `list_console_messages` sạch (không lỗi html2canvas).

Run: `npx tsc --noEmit` + `npm run lint` + `npm test` → sạch + 71 pass.

- [ ] **Step 4: Commit**

```bash
git add src/components/receipt/ReceiptDialog.tsx src/components/receipt/ThemePicker.tsx
git commit -m "feat(ui): dialog phiếu kẹo ngọt — header gradient + input pill (không đụng ReceiptCard PNG)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 7: Final review toàn nhánh + dọn dẹp

**Files:** toàn bộ diff nhánh.

- [ ] **Step 1: Rà tổng thể qua Chrome**

Mở lần lượt `/`, `/students`, `/attendance` + dialog phiếu. `take_screenshot` mỗi màn, `list_console_messages` mỗi màn → tất cả SẠCH. Kiểm nhất quán: font Comfortaa, nền hồng, nút pill, không sót nút đen/card vuông.

- [ ] **Step 2: Full check**

Run: `npm test` → 71 pass. `npx tsc --noEmit` → clean. `npm run lint` → clean. `npm run build` → PASS (3 route static).

- [ ] **Step 3: Final review độc lập (OPUS)**

Dispatch 1 review agent (opus) đọc toàn bộ diff nhánh so với spec: bắt (a) chỗ nào còn lộ tông cũ (xám/đen/card vuông), (b) có lỡ đụng logic/store/fees không, (c) ReceiptCard có bị đổi nhầm không, (d) responsive/console. Sửa mọi phát hiện.

- [ ] **Step 4: Verify artifact PNG lần cuối + dọn scratchpad**

Xuất 1 phiếu PNG, MỞ ảnh thật xác nhận không vỡ. Xóa mockup scratchpad nếu không cần.

---

## Self-Review (đã chạy)

**1. Spec coverage:** tokens (T1) · font (T1) · sidebar (T1) · Dashboard thẻ+toolbar+bảng (T2) · biểu đồ (T3) · Học sinh (T4) · Điểm danh (T5) · dialog (T6) · không đụng ReceiptCard (T6 ghi rõ) · final review (T7). Mọi mục spec có task. ✅

**2. Placeholder scan:** T4/T5/T6 có bước "đọc file thật trước" thay vì chép code file lớn chưa đọc — đây là chỉ dẫn hành động cụ thể, không phải placeholder (các file đó chưa đọc trong session viết plan; ép chép code phỏng đoán sẽ sai hơn). Các giá trị màu/gradient/class đều cụ thể. ✅

**3. Type consistency:** class `.candy-*`/`.stat-*` định nghĩa ở T1, dùng nhất quán tên ở T2-T6. Font var `--font-comfortaa`/`--font-nunito` nhất quán. ✅
