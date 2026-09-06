# UI/UX Comprehensive Audit Report — SIAKAD Al-Yasini
**Version:** 1.0  
**Auditor:** Senior UI/UX Engineer & Frontend Design System Specialist  
**Target Codebase:** React 19, TypeScript, Inertia.js, Tailwind CSS v4, Radix UI  
**Scope:** 70 Halaman & Shared Component Library (`resources/js/`)

---

## 1. Executive Summary

Berdasarkan audit menyeluruh terhadap 70 file halaman dan komponen di direktori `resources/js/`, sistem SIAKAD Al-Yasini telah memiliki fondasi arsitektur frontend yang baik (berbasis React 19, Inertia.js, dan Tailwind CSS v4). Namun, terdapat **inkonsistensi visual dan pola UX yang signifikan antar-modul**. Hal ini terjadi karena modul-modul dibangun secara terpisah tanpa satu rujukan komponen kanonikal (*Single Source of Truth*), sehingga menghasilkan pengalaman pengguna yang terfragmentasi.

### Ringkasan Temuan Kunci:
1. **5 Pola Header Halaman yang Berbeda:** Judul halaman memiliki variasi ukuran font dari `text-xl` hingga `text-3xl`, dengan variasi font weight (`font-semibold` vs `font-bold`), serta variasi ada/tidaknya icon box dekoratif dan garis pembatas bawah (`border-b`).
2. **Duplikasi Komponen Empty State:** Komponen kanonikal `EmptyState` (`@/components/empty-state.tsx`) sudah ada, tetapi **hanya digunakan di 7 dari 70 halaman** (10%). 63 halaman lainnya mengulang kode HTML mentah `div className="p-12 text-center"`.
3. **Inkonsistensi Komponen Status Badge:** Komponen `Badge` dari Radix UI (`@/components/ui/badge.tsx`) hanya memiliki varian primitif (`default`, `secondary`, `destructive`, `outline`), sehingga hampir setiap modul membuat badge statusnya sendiri secara ad-hoc dengan warna dan ukuran teks yang berbeda-beda (`text-[10px]` vs `text-[11px]` vs `text-xs`, UPPERCASE vs Sentence Case).
4. **Variasi Wadah Kontainer Halaman (*Page Container*):** Sebagian halaman menggunakan batas lebar `max-w-7xl mx-auto` dengan padding responsif `p-4 sm:p-6 lg:p-8`, sedangkan sebagian lainnya menggunakan `p-4 sm:p-6` tanpa batas lebar, menyebabkan tabel data meregang tak terbatas pada monitor resolusi tinggi (>1440px/ultrawide).
5. **Divergensi Elemen Form & Filter:** Ditemukan penggunaan elemen HTML mentah `<select>` berdampingan dengan komponen Radix `<Select>`, serta variasi tab filter antara pill button kustom dengan Radix Tabs.
6. **Campuran Token Warna Tailwind:** Terdapat percampuran antara token semantik (`text-text-primary`, `bg-surface-card`, `text-text-secondary`), token Radix/Shadcn (`text-foreground`, `bg-card`, `text-muted-foreground`), dan warna hardcoded Tailwind standar (`text-slate-900`, `text-slate-500`, `border-slate-200`, `bg-emerald-600`).

---

## 2. Rincian Inconsistency per Dimensi

### Dimensi 1: Page Structure & Layout

| Isu / Temuan | Halaman Terdampak | Severity | Dampak UX / Visual |
| :--- | :--- | :--- | :--- |
| **Lebar Kontainer Tidak Seragam**<br>Halaman Master, Mahasiswa, dan Monitoring membatasi lebar pada `max-w-7xl mx-auto`, sementara modul Akademik (Matakuliah, Kurikulum), Keuangan, PMB, dan KHS membiarkan kontainer *full-width* (`p-4 sm:p-6 space-y-6`). | • `akademik/matakuliah/index.tsx`<br>• `akademik/kurikulum/index.tsx`<br>• `keuangan/pembayaran/index.tsx`<br>• `pmb/calon-mahasiswa/index.tsx`<br>• `krs/student.tsx`<br>• `khs/student.tsx` | **High** | Pada monitor desktop lebar / ultrawide, tombol aksi tabel berada di ujung kanan layar (terpisah jauh dari label baris di ujung kiri), menyebabkan *eye fatigue* dan kesalahan klik. |
| **5 Pola Page Header yang Berbeda**<br>1. *Icon-Box Header with Border*: Ada kotak ikon emerald + border-b (`master/fakultas`, `superadmin/monitoring`).<br>2. *Plain Flex Header*: Teks biasa tanpa ikon/border (`akademik/matakuliah`, `keuangan/pembayaran`).<br>3. *Inline Icon Header*: Ikon ditaruh di dalam tag `<h1>` (`laporan/krs`).<br>4. *Large Display Header*: `text-2xl sm:text-3xl font-bold` (`mahasiswa/index`).<br>5. *Settings Heading*: Memakai komponen `<Heading>` (`settings/*`). | Hampir seluruh modul (70 halaman) | **High** | Pengguna merasa berpindah ke aplikasi yang berbeda saat berpindah dari modul Master Data ke modul Akademik atau Laporan. |
| **Posisi & Style Action Button Header**<br>Sebagian tombol aksi utama menggunakan ukuran `size="sm"`, sebagian `text-xs px-4 py-2`, sebagian `px-4 py-2.5 rounded-lg shadow-xs`. Posisi pada layar kecil ada yang memakai `self-start`, ada yang `w-full`. | • `akademik/matakuliah/index.tsx`<br>• `master/fakultas/index.tsx`<br>• `keuangan/pembayaran/index.tsx` | **Medium** | Tombol aksi primer (CTA) tidak konsisten dalam hierarki visual dan ukuran sentuh (*touch target*). |

---

### Dimensi 2: Tipografi & Hierarki Teks

| Elemen | Pola Saat Ini yang Berbeda | Standar Rekomendasi | Severity |
| :--- | :--- | :--- | :--- |
| **Page Title** | • `text-xl font-semibold text-text-primary`<br>• `text-xl sm:text-2xl font-bold text-slate-900`<br>• `text-2xl sm:text-3xl font-bold text-text-primary`<br>• `text-2xl font-bold tracking-tight text-foreground` | `text-xl sm:text-2xl font-bold tracking-tight text-text-primary` | **High** |
| **Page Description** | • `text-xs text-text-secondary mt-0.5`<br>• `text-xs sm:text-sm text-slate-500 mt-0.5`<br>• `text-sm text-muted-foreground`<br>• `text-xs sm:text-sm text-text-secondary` | `text-xs sm:text-sm text-text-secondary mt-1 leading-relaxed` | **Medium** |
| **Section / Card Title** | • `text-sm font-semibold text-text-primary`<br>• `text-base font-semibold`<br>• `leading-none font-semibold` (CardTitle)<br>• `text-sm font-semibold tracking-tight` | `text-base font-semibold text-text-primary` | **Medium** |
| **Label Form** | • `text-xs font-semibold text-text-primary`<br>• `text-sm font-medium text-foreground`<br>• `text-xs font-medium` | `text-xs font-semibold text-text-primary` | **Low** |
| **Table Head** | • `text-xs font-semibold uppercase text-muted-foreground tracking-wider`<br>• `text-slate-700 font-bold uppercase tracking-wider`<br>• `text-text-secondary font-semibold uppercase tracking-wider` | `text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-text-secondary` | **Medium** |
| **Case (Huruf Besar/Kecil)** | Sebagian status dan badge memakai `UPPERCASE` (`DISETUJUI WALI`), sebagian `Sentence case` (`Disetujui`), sebagian `lowercase` (`wajib`). | Wajib **Sentence case** untuk UI umum, dan **Mono Uppercase** khusus kode identitas (NIM, Kode MK). | **High** |

---

### Dimensi 3: Komponen Data Table & Empty State

| Isu / Temuan | Halaman Terdampak | Severity | Dampak UX / Visual |
| :--- | :--- | :--- | :--- |
| **Divergensi Implementasi Tabel Data**<br>Modul Mahasiswa, KRS, Laporan, dan Monitoring sudah menggunakan `ResponsiveTable` dari `@/components/ui/table.tsx`. Namun modul Master Data (Fakultas, Matakuliah), Keuangan, dan PMB masih menulis kode mentah `<table>` dengan `div.overflow-x-auto` mandiri. | • `akademik/matakuliah/index.tsx`<br>• `akademik/kurikulum/index.tsx`<br>• `keuangan/pembayaran/index.tsx`<br>• `pmb/calon-mahasiswa/index.tsx`<br>• `master/fakultas/index.tsx` | **High** | Border tabel, warna header `thead`, zebra-striping `even:bg-...`, dan padding sel (`p-3` vs `p-3.5` vs `p-4`) berbeda antar modul. |
| **Underutilization Komponen `EmptyState`**<br>Komponen kanonikal `EmptyState` hanya dipakai di 7 halaman. Modul Matakuliah, Pembayaran, Calon Mahasiswa, Kurikulum, dll. menulis blok HTML kustom: `<div className="p-12 text-center"><Icon ... />...</div>`. | • `akademik/matakuliah/index.tsx`<br>• `akademik/kurikulum/index.tsx`<br>• `keuangan/pembayaran/index.tsx`<br>• `pmb/calon-mahasiswa/index.tsx`<br>• `keuangan/kelompok-ukt/index.tsx`<br>• `khs/student.tsx` | **High** | Tampilan saat data kosong berbeda ukuran ikonnya (`size-10` vs `size-12`), tipografi berbeda, dan ada yang tidak menyertakan tombol aksi bantuan (*Call to Action*). |
| **Aksi Baris Tabel (*Row Action Buttons*)**<br>Sebagian halaman menggunakan tombol ikon ghost (`p-1.5 rounded-md hover:bg-surface-base`), sebagian menggunakan `Button size="sm"` penuh, sebagian menggunakan `DropdownMenu`. | Seluruh halaman tabel | **Medium** | Ketidakkonsistenan affordance interaksi; pengguna bingung apakah aksi baris langsung diklik atau harus membuka dropdown menu. |

---

### Dimensi 4: Status Badges & Pill Indicators

| Isu / Temuan | Contoh Kasus Nyata | Severity | Rekomendasi Solusi |
| :--- | :--- | :--- | :--- |
| **Tidak Adanya Komponen StatusBadge Terstandar**<br>Setiap halaman mendefinisikan objek mapping status dan class Tailwind sendiri. | • Di `pmb/calon-mahasiswa`: `STATUS_LABELS` dengan `rounded-full text-[11px] font-semibold border`.<br>• Di `laporan/krs`: `getStatusBadge` dengan `text-[10px] font-bold bg-emerald-100 text-emerald-800`.<br>• Di `skripsi`: `Badge` Radix dengan override manual `className="border-blue-500 text-blue-600"`.<br>• Di `matakuliah`: `capitalize px-2.5 py-0.5 rounded-full text-[11px] font-semibold`. | **High** | Buat komponen terstandar `<StatusBadge status="..." label="..." variant="..." icon={...} />` yang mematuhi prinsip aksesibilitas (*color-blind friendly* dengan ikon wajib). |

---

### Dimensi 5: Filter Bar, Search Input, & Stat Cards

| Isu / Temuan | Detail Masalah | Severity |
| :--- | :--- | :--- |
| **Inkonsistensi Elemen Dropdown Filter** | Di `mahasiswa/index.tsx`, filter menggunakan tag HTML bawaan `<select className="h-9 px-3 rounded-md border...">`, sedangkan di `laporan/krs.tsx` menggunakan komponen Radix UI `<Select><SelectTrigger>...</Select>`. Pada browser mobile, tampilan `<select>` native terlihat sangat kontras dan kaku dibanding Radix UI. | **High** |
| **Tab Filter vs Tab Navigasi** | Modul Pembayaran dan PMB menggunakan tombol `<button className="px-3 py-1.5 text-xs font-semibold rounded-md...">` yang dibungkus `div.flex.border-b`. Styling dan padding-nya berbeda dari `Tabs` Radix resmi. | **Medium** |
| **Stat Cards / Metric Cards** | Terdapat 4 variasi kartu statistik ringkasan: (1) Dashboard Hero & Cards dengan gradien dan ikon besar, (2) Mahasiswa Index dengan `Card p-4` tanpa ikon, (3) Superadmin Monitoring dengan icon box slate/emerald, (4) Laporan KRS dengan box bergaris tipis. Tidak ada komponen reusable `<StatCard>`. | **High** |

---

### Dimensi 6: Responsive & Mobile UX

| Area | Masalah yang Ditemukan | Severity | Rekomendasi |
| :--- | :--- | :--- | :--- |
| **Tabel Data di Layar Mobile (<640px)** | Beberapa tabel lebar di modul Master dan Keuangan memiliki hingga 7–8 kolom. Meskipun terdapat pembungkus horizontal scroll, teks dan tombol aksi di kanan menjadi sangat padat dan terpotong. Kolom sekunder tidak disembunyikan secara elegan di layar kecil. | **High** | Terapkan pola `StackedCell` untuk menggabungkan kolom identitas primer & sekunder, dan sembunyikan kolom non-esensial dengan `hidden sm:table-cell` atau `hidden md:table-cell`. |
| **Modal / Dialog pada Layar HP** | Dialog tambah/edit data (misal di Matakuliah dan Fakultas) menggunakan `sm:max-w-md` atau `sm:max-w-lg`. Di layar mobile sempit, padding dalam dialog (`p-6`) menyisakan ruang isi form yang terlalu sempit. | **Medium** | Terapkan `max-h-[90vh] overflow-y-auto` dan padding `p-4 sm:p-6` kanonikal pada `DialogContent`. |
| **Filter Bar Wrapping** | Pada layar tablet dan mobile, baris filter sering kali tertekuk (*wrap*) secara tidak beraturan dengan tinggi yang tidak sejajar antara input search dan dropdown. | **Medium** | Standardisasi `<FilterBar>` dengan grid responsif `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3`. |

---

## 3. Matriks Prioritas Perbaikan

| Prioritas | Komponen / Area | Alasan & Dampak |
| :--- | :--- | :--- |
| **P0 (Kritis / Fondasi)** | 1. `PageContainer`<br>2. `PageHeader`<br>3. `StatusBadge` | Memperbaiki 70% inkonsistensi visual seluruh sistem secara instan. Menjamin hierarki judul, breadcrumb, tombol aksi, dan status badge seragam di seluruh halaman. |
| **P1 (Tinggi)** | 4. `ResponsiveTable` & `DataTableWrapper`<br>5. `StatCard`<br>6. Konsolidasi `EmptyState` | Menyeragamkan seluruh tabel data operasional kampus, kartu ringkasan metrik, dan tampilan state kosong. |
| **P2 (Sedang)** | 7. `FilterBar` & Search Input Standard<br>8. Penyelarasan Modal & Form Spacing | Menghilangkan percampuran antara HTML native `<select>` dan Radix `<Select>`, merapikan responsive layout form. |
| **P3 (Penyempurnaan)** | 9. Penyeragaman Dialog Konfirmasi & Toast feedback<br>10. Audit dark-mode & print stylesheets | Memastikan transisi antar aksi menghasilkan feedback sonner yang konsisten dalam Bahasa Indonesia baku. |
