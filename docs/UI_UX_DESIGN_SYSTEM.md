# Canonical UI/UX Design System Specification — SIAKAD Al-Yasini
**Version:** 1.1 (Canonical & Flexible)  
**Status:** Approved Standard  
**Maintainer:** Senior UI/UX Engineer & Frontend Design System Specialist  
**Design Philosophy:** Clean, Professional, Academic Enterprise, Modern Islamic Institutional Identity  
**Primary Color Philosophy:** Deep Emerald (`#0D7C66` / `--brand-primary`), Manuscript Gold Accent (`#D97706` / `--brand-accent`), Surface Neutral (`#F8FAFC` / `--surface-base`)  
**Core Motto:** *Consistent System ≠ Identical Pages*

---

## 1. Prinsip Desain Pokok (*Visual Principles*)

1. **Consistent System ≠ Identical Pages:**  
   Standardisasi bukan berarti memaksakan satu layout kaku ke seluruh 70 halaman. Halaman Dashboard, Tabel Data Padat, Formulir CRUD, Detail View, dan Portal Mahasiswa memiliki kebutuhan visual yang berbeda. Keseragaman yang dijaga adalah **Design Language**: tipografi, skala spacing, status badge, empty state, dan feedback interaktif.
2. **Academic Enterprise, Bukan Marketing Landing Page:**  
   SIAKAD adalah aplikasi operasional harian bagi dosen, mahasiswa, dan staf akademik. Keterbacaan data padat (*dense readability*), kemudahan entri keyboard, dan kejelasan status harus selalu diutamakan di atas dekorasi atau animasi hiasan.
3. **Hierarki Informasi yang Jelas (*Clear Visual Hierarchy*):**  
   Setiap halaman harus memiliki satu identitas utama yang tegas: judul halaman yang seragam, deskripsi fungsional, dan satu atau dua tombol aksi primer di sudut kanan atas.
4. **Aksesibilitas & Anti-Ambivalensi Status (*Color-Blind Friendly*):**  
   Warna status (sukses, peringatan, bahaya, info) **tidak boleh berdiri sendiri**. Status selalu didampingi oleh ikon dan label teks yang eksplisit (contoh: teks "Disetujui" + ikon centang).
5. **Sentence Case & Bahasa Indonesia Formal Baku:**  
   Semua tombol, judul, label form, dan pesan feedback menggunakan Bahasa Indonesia yang lazim di lingkungan perguruan tinggi (KRS, KHS, SKS, Dosen Wali, Her-Registrasi, Transkrip) dengan format *Sentence case* (bukan *Title Case* atau *ALL-CAPS*).

---

## 2. Sistem Tipografi Kanonikal (*Typography System*)

Font utama antarmuka adalah **Inter** (`font-sans`), dengan angka monospaced **JetBrains Mono** (`font-mono`) untuk kode, NIM, SKS, dan nilai numerik.

| Peran Tipografi | Ukuran & Weight | Kelas Tailwind Standar | Kapan Digunakan |
| :--- | :--- | :--- | :--- |
| **Page Title** | 20px / 24px (Bold) | `text-xl sm:text-2xl font-bold tracking-tight text-text-primary` | Judul utama paling atas setiap halaman |
| **Page Description** | 12px / 14px (Regular) | `text-xs sm:text-sm text-text-secondary mt-0.5 leading-relaxed` | Penjelasan fungsi halaman di bawah judul utama |
| **Section Title** | 16px / 18px (SemiBold) | `text-base sm:text-lg font-semibold text-text-primary tracking-tight` | Pemisah seksi konten dalam halaman |
| **Card Title** | 14px / 16px (SemiBold) | `text-sm sm:text-base font-semibold text-text-primary` | Judul kartu atau panel |
| **Body Regular** | 13px / 14px (Regular) | `text-xs sm:text-sm text-text-primary leading-normal` | Teks isi umum, paragraf keterangan |
| **Small / Label** | 12px (SemiBold) | `text-xs font-semibold text-text-primary` | Label input form, header kolom kecil |
| **Muted / Hint Text** | 11px / 12px (Regular) | `text-[11px] sm:text-xs text-text-secondary` | Helper text pada input, subteks informasi |
| **Table Head Text** | 11px (SemiBold Upper) | `text-[11px] font-semibold uppercase tracking-wider text-text-secondary` | Judul kolom pada header tabel data |
| **Code / Identity Mono** | 12px / 13px (Mono SemiBold)| `font-mono text-xs font-semibold text-text-primary` | NIM, NIDN, Kode Matakuliah, SKS, Nominal Uang |

---

## 3. Sistem Spacing & Layout Kanonikal (*Flexible Layout System*)

### A. Skala Spacing Baku:
* **Page Padding:** `p-4 sm:p-6 lg:p-8` (responsif dari ponsel hingga desktop).
* **Section Gap:** `space-y-6` (jarak vertikal antar blok utama halaman).
* **Card Internal Padding:** `p-5 sm:p-6` (standar), `p-4` (kartu metrik/ringkas).
* **Form Field Gap:** `space-y-4` (jarak antar form field), `space-y-1.5` (jarak label ke input).
* **Grid Card Gap:** `gap-4 sm:gap-6`.

### B. Varian `PageContainer` Kontekstual:
Jangan memaksakan satu ukuran global ke seluruh halaman. Gunakan varian yang sesuai:
* **`default` (`max-w-7xl mx-auto`):** Untuk halaman umum, master data, form CRUD, detail mahasiswa.
* **`wide` (`max-w-[1536px] mx-auto`):** Untuk dashboard analitik, grid multi-kolom, monitoring server.
* **`full` (`w-full`):** Untuk tabel data padat (*dense spreadsheet-like*) yang membutuhkan ruang horizontal penuh (misal: rekap nilai banyak matakuliah/KHS, jadwal kelas bentrok).

---

## 4. Standar Komponen Kanonikal (*Component Standards*)

### 1. `PageContainer`
```tsx
<PageContainer variant="default" | "wide" | "full" className="...">
    {children}
</PageContainer>
```

### 2. `PageHeader` (Fleksibel)
Header kanonikal yang menyatukan hierarki judul dan aksi, tanpa mewajibkan dekorasi yang tidak perlu:
* **`title`:** String (wajib)
* **`description`:** String (opsional)
* **`icon`:** LucideIcon (opsional, gunakan hanya bila memberi konteks visual nyata seperti modul Master Data)
* **`actions`:** Slot tombol aksi (opsional, tersusun rapi dan otomatis full-width di mobile)
* **`bordered`:** Boolean (default: `true`, garis tipis pembatas bawah)

### 3. `StatusBadge` (Color-Blind Accessible)
Standar warna dan ikon status terpusat dengan format *Sentence case*:
* **`success`:** Emerald (`bg-emerald-50 text-emerald-700 border-emerald-200`) + Ikon `CheckCircle2`
* **`warning`:** Amber (`bg-amber-50 text-amber-700 border-amber-200`) + Ikon `Clock`
* **`danger`:** Crimson (`bg-rose-50 text-rose-700 border-rose-200`) + Ikon `XCircle` / `ShieldAlert`
* **`info`:** Safir (`bg-blue-50 text-blue-700 border-blue-200`) + Ikon `Info`
* **`neutral`:** Slate (`bg-slate-50 text-slate-700 border-slate-200`) + Ikon `MinusCircle`

### 4. `StatCard`
Kartu metrik terpadu untuk metrik ringkasan (angka besar monospaced, label ringkas, subteks, dan ikon tematik opsional).

### 5. `DataTable` & `ResponsiveTable`
* Pertahankan struktur tabel existing jika sudah stabil dan tidak memiliki masalah UX.
* Prioritaskan: table wrapper yang konsisten (`border rounded-xl bg-surface-card`), horizontal overflow mobile yang aman, padding sel yang nyaman (`p-3` sampai `p-4`), dan pemanfaatan `StackedCell` pada kolom identitas (Nama + NIM/Kode).

### 6. `EmptyState`
Gunakan `@/components/empty-state.tsx` secara konsisten pada semua kondisi saat data tabel atau list kosong, lengkap dengan tombol bantuan/tambah data bila relevan.

### 7. Form & Select Component Rule
* Gunakan komponen existing jika sudah konsisten dan accessible.
* Jangan memaksakan penggantian native `<select>` jika tidak menimbulkan UX/visual issue.
* Standardisasi hanya jika terjadi masalah kontras atau tampilan patah di mobile.

---

## 5. Alur Kerja Pilot-First & Checklist Batch

Sebelum melanjutkan ke batch berikutnya, setiap batch wajib lulus checklist:
- [ ] **Visual Comparison:** Tampilan konsisten dengan bahasa desain dan tidak kehilangan karakter modul.
- [ ] **Responsive Check:** Tampilan mobile (<640px), tablet (768px), dan desktop normal (>1280px).
- [ ] **Overflow Check:** Tidak ada elemen yang memotong layar atau menyebabkan horizontal scrollbar yang tidak diinginkan pada viewport.
- [ ] **Functional Regression Check:** Seluruh interaksi (Submit Form, Modal, Confirm Dialog, Filter, Pagination) berfungsi 100% normal.
- [ ] **Backend Integrity:** Tidak ada perubahan pada backend, route, model, atau controller.
