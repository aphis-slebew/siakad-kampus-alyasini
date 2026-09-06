# Laporan Visual QA & Design Validation: 5 Halaman Pilot SIAKAD Al-Yasini

> **Status Evaluasi**: `APPROVED FOR ROLLOUT` (Setelah Iterasi Komponen Fondasi)  
> **Tanggal Evaluasi**: 5 September 2026  
> **Target Pengguna**: Civitas Akademika STAI Al-Yasini (Mahasiswa, Dosen, Tenaga Kependidikan, Administrator)  
> **Prinsip Utama**: *"Consistent System ≠ Identical Pages"* (Sistem Selaras, Bukan Cetakan Kaku).

---

## 1. Executive Summary

Tahap Pilot Implementation telah menyelesaikan standardisasi pada 5 arketipe halaman representatif:
1. **Pilot 1 (Dashboard & High-Density Workspace)**: `resources/js/pages/dashboard.tsx`
2. **Pilot 2 (Complex Data Table & Filters)**: `resources/js/pages/akademik/matakuliah/index.tsx`
3. **Pilot 3 (CRUD Master Data & Modal Dialog)**: `resources/js/pages/master/fakultas/index.tsx`
4. **Pilot 4 (Detail Page & Verification)**: `resources/js/pages/pmb/calon-mahasiswa/show.tsx`
5. **Pilot 5 (Student Portal & Interactive Workflow)**: `resources/js/pages/krs/student.tsx`

Review ini berfokus pada **Visual QA & User Experience**, bukan sekadar lolos build atau linter. Ditemukan beberapa kelemahan visual awal pada iterasi pertama, yang **telah langsung diperbaiki pada komponen fondasi** (`PageContainer`, `PageHeader`, `StatusBadge`, dan `MasterDataNav`) sebelum melangkah ke rollout massal Batch 1.

---

## 2. Evaluasi 8 Dimensi Visual QA

### Dimensi 1: Visual Hierarchy
* **Proporsionalitas Judul**:
  * *Temuan Awal*: Pada `PageHeader`, judul halaman berukuran `text-xl sm:text-2xl font-bold` dengan kelas CSS `truncate`. Pada layar mobile atau saat judul berupa nama panjang calon mahasiswa (misal: *"Muhammad Nurul Huda Al-Mansyuri"*) atau mata kuliah panjang (*"Metodologi Penelitian Pendidikan Agama Islam"*), pemotongan agresif menggunakan `truncate` menghilangkan informasi penting.
  * *Tindakan Iterasi*: Mengganti `truncate` menjadi `break-words` yang memungkinkan pembungkusan teks alami pada mobile tanpa merusak tata letak. Menambahkan opsi `size?: 'default' | 'sm'` agar halaman data tabel dapat memilih hierarki judul yang lebih kompak (`text-lg sm:text-xl font-bold`).
* **Hierarki Informasi**:
  * Pengguna dapat langsung menangkap fokus halaman dalam 3 detik pertama:
    * **Dashboard**: Sambutan & status server $\rightarrow$ Menu Aksi Cepat $\rightarrow$ Metrik Utama.
    * **Mata Kuliah**: Identitas tabel $\rightarrow$ Aksi Tambah Matakuliah $\rightarrow$ Data tabular.
    * **Fakultas**: Identitas unit pengelola $\rightarrow$ Dropdown alih master data & tambah fakultas $\rightarrow$ Tabel pejabat dekanat.
    * **Detail Calon Mahasiswa**: Nama calon & status seleksi $\rightarrow$ Kolom kiri (biodata & berkas) $\rightarrow$ Kolom kanan (status pendaftaran & hasil ujian).
    * **Portal KRS Mahasiswa**: Semester aktif & total SKS dipilih $\rightarrow$ Banner kelayakan (eligibility) $\rightarrow$ Kartu status persetujuan KRS $\rightarrow$ Pilihan kelas siap ambil.

---

### Dimensi 2: Spacing & Vertical Rhythm
* **Jarak Antar Section**:
  * *Temuan Awal*: `PageContainer` menggunakan `lg:p-8 space-y-6`. Pada monitor desktop standar (1366×768 dan 1080p), padding `32px` di setiap sisi menghabiskan `64px` ruang vertikal dan `64px` horizontal. Dipadukan dengan sidebar (256px) dan header shell, area kerja tabel menjadi terlalu sempit dan memaksa pengguna melakukan vertical scrolling berlebihan.
  * *Tindakan Iterasi*: Menstandarkan padding `PageContainer` menjadi `p-4 sm:p-6 space-y-5` di seluruh varian. Menghapus padding `lg:p-8` yang berlebihan, sehingga ruang kerja bertambah ~32px lebih luas dan padat informasi (*enterprise-ready*).
* **Ketinggian PageHeader**:
  * `PageHeader` dipadatkan dengan jarak antar elemen `gap-3.5` (sebelumnya `gap-4`).
  * Wadah icon disempurnakan dari `size-10 sm:size-11 rounded-xl` menjadi `size-9 sm:size-10 rounded-lg`. Hasilnya terlihat proporsional, modern, dan tidak menyerupai "kotak besar kaku".

---

### Dimensi 3: PageContainer Variants
Pola penggunaan varian terbukti tepat dan tidak memaksakan satu ukuran untuk semua konteks:
* **`wide` (`max-w-[1536px]` / `2xl`)**:
  * Diterapkan pada: **Dashboard Utama** (`dashboard.tsx`).
  * *Hasil*: Memanfaatkan bentang horizontal monitor layar lebar secara optimal untuk grid 4-kolom kartu aksi dan metrik tanpa menyisakan ruang kosong yang canggung di tepi layar.
* **`default` (`max-w-7xl` / `1280px`)**:
  * Diterapkan pada: **Master Fakultas**, **Detail Calon Mahasiswa**, **Portal KRS**, dan **Mata Kuliah**.
  * *Hasil*: Untuk formulir, halaman detail split 2:1, dan tabel dengan 4–7 kolom, pembatasan ke `max-w-7xl` memberikan jarak baca (*line length*) yang nyaman bagi mata pengguna (*ergonomic scanning*).
* **`full` (`w-full`)**:
  * Disiapkan untuk: **Batch 2 & 3** pada halaman data-dense horizontal ekstrem (Jadwal Matriks Perkuliahan, Rekap Presensi 16 Sesi, Transkrip Akademik Kumulatif, dan Audit Log Sistem).

---

### Dimensi 4: Component Naturalness (Bebas dari Kesan "Template Kaku")
* **StatusBadge**:
  * *Temuan Kritis*: Awalnya `StatusBadge` memiliki kelas CSS `capitalize` bawaan pada label teksnya. Hal ini merusak akronim akademik dan sistem SIAKAD:
    * `"KRS"` terformat paksa menjadi `"Krs"`
    * `"SKS"` menjadi `"Sks"`
    * `"UKT"` menjadi `"Ukt"`
    * `"UTS/UAS"` menjadi `"Uts/uas"`
  * *Tindakan Iterasi*: Menghilangkan pemaksaan `capitalize` dari `StatusBadge`. Label sekarang mempertahankan format asli dari pemanggil, menjamin akronim akademik tetap akurat dan profesional.
  * *Aksesibilitas*: Tetap mempertahankan icon semantik pendamping (`CheckCircle2`, `Clock`, `XCircle`, dsb.) sehingga status terbaca jelas bagi pengguna dengan defisiensi persepsi warna (buta warna parsial).
* **StatCard**:
  * Dipertahankan sebagai komponen modular terstandar untuk ringkasan metrik halaman data (akan digunakan luas pada Batch 1: Statistik Mahasiswa Aktif, Status Dosen, dsb.).
  * Dashboard tetap mempertahankan kartu analitik kontekstual bawaannya untuk menjaga karakter visual dashboard yang kaya dan ramah visual.
* **EmptyState**:
  * Terbukti sangat natural pada tabel kosong Mata Kuliah dan Portal KRS saat belum ada jadwal dibuka. Memberikan panduan aksi yang jelas (*call-to-action*) alih-alih menampilkan tabel kosong tak berpenghuni.

---

### Dimensi 5: Information Density
SIAKAD adalah aplikasi enterprise perguruan tinggi dengan intensitas data tinggi. Standardisasi UI berhasil menjaga kepadatan informasi yang sehat:
1. **Tidak Ada Whitespace Terbuang**: Pengurangan padding container dari `p-8` ke `p-6` pada layar besar memaksimalkan baris data yang terlihat di layar pertama (*above the fold*).
2. **Penggunaan StackedCell**: Pada Portal KRS (`krs/student.tsx`), kolom Matakuliah menggabungkan nama, kode, bobot SKS, dan kelas menjadi tata letak bertumpuk 2 baris yang sangat padat namun mudah dibaca.
3. **Penyatuan Breadcrumb & Modul Navigasi**:
   * *Temuan Awal*: Pada halaman Fakultas (`master/fakultas/index.tsx`), terdapat baris breadcrumb `MasterDataNav` (`Dashboard / Master Data / [Fakultas v]`) yang berada tepat di bawah breadcrumb bawaan `AppSidebarHeader` (`Dashboard > Master Data > Fakultas`). Terjadi duplikasi visual breadcrumb yang memakan ruang vertikal.
   * *Tindakan Iterasi*: Menambahkan mode `compact` pada `MasterDataNav`, lalu menyematkan dropdown alih modul tersebut langsung ke dalam slot `actions` pada `PageHeader`. Hasilnya menghemat ruang vertikal ~32px dan menghilangkan redundansi visual.

---

### Dimensi 6: Cross-Page Comparison

| Arketipe Halaman | Karakter Visual | Keselarasan Design System | Tingkat Kepadatan Data |
|---|---|---|---|
| **Pilot 1: Dashboard** | Modern, welcoming, berorientasi analitik & pintasan cepat | Font Inter, warna brand hijau emerald, container konsisten | Sedang–Tinggi |
| **Pilot 2: Complex Table (Mata Kuliah)** | Rapi, tabular, fokus pada pemindaian kode & SKS | Header standar, badge jenis matakuliah, aksi baris seragam | Tinggi |
| **Pilot 3: CRUD & Modal (Fakultas)** | Terstruktur, aksi jelas, modal dialog lapang | Header standar dengan compact switcher, badge aktif | Sedang |
| **Pilot 4: Detail Page (PMB Show)** | Kartu terbagi 2:1, hierarki informasi jelas | Header dengan tombol kembali & badge pendaftaran | Tinggi (Informasi Biodata & Berkas) |
| **Pilot 5: Student Workflow (KRS)** | Interaktif, visual indikator kuota & kelayakan jelas | Header dengan total SKS dinamis, aksi cetak & ajukan | Tinggi |

**Kesimpulan Perbandingan**: Seluruh 5 halaman memiliki benang merah yang kuat (palet warna emerald, font Inter, kartu berbingkai halus `border-border-default`, badge status ber-ikon), namun masing-masing mempertahankan tata letak yang paling ergonomis untuk tugasnya tanpa kesan kloning kaku.

---

### Dimensi 7: Responsive Visual QA

#### 1. Desktop View ($\ge 1024px$)
* Layout sidebar dan workspace seimbang.
* Tidak ada horizontal scrollbar liar di level halaman.
* Aksi tombol di `PageHeader` tersusun rapi di sebelah kanan sejajar dengan judul.

#### 2. Tablet View ($768px - 1023px$)
* Grid 4-kolom pada Dashboard dan KRS otomatis menyesuaikan menjadi 2-kolom yang proporsional.
* Kolom detail Calon Mahasiswa (2:1) tetap terbaca jelas.
* Tombol aksi di header membungkus (*wrap*) dengan anggun tanpa menabrak judul.

#### 3. Mobile View ($< 768px$)
* `PageHeader` beralih ke layout vertikal (`flex-col`), dengan tombol aksi memenuhi lebar atau tersusun rapi di baris berikutnya.
* Judul panjang membungkus ke baris kedua tanpa terpotong berkat penghapusan `truncate`.
* Tabel data (`Mata Kuliah`, `KRS`, `Fakultas`) memiliki pembungkus `overflow-x-auto` yang aman disentuh (*swipeable*). Kolom sekunder yang kurang esensial (seperti kolom Jenis pada tabel Matakuliah) disembunyikan menggunakan utilitas `hidden sm:table-cell` untuk menjaga fokus pada layar kecil.

---

## 3. Rangkuman Iterasi Komponen Fondasi yang Telah Diterapkan

Berikut adalah penyempurnaan kode yang telah selesai dieksekusi:

1. **[`PageContainer`](file:///D:/home/aphis/Project/siakad-alyasini/resources/js/components/page-container.tsx)**:
   - Padding distandarkan ke `p-4 sm:p-6 space-y-5` (menghapus `lg:p-8`).
2. **[`PageHeader`](file:///D:/home/aphis/Project/siakad-alyasini/resources/js/components/page-header.tsx)**:
   - Mengganti `truncate` menjadi `break-words` pada judul.
   - Menambahkan prop `size?: 'default' | 'sm'`.
   - Mengecilkan ukuran icon box menjadi `size-9 sm:size-10 rounded-lg`.
   - Mengoptimalkan jarak vertikal menjadi `gap-3.5`.
3. **[`StatusBadge`](file:///D:/home/aphis/Project/siakad-alyasini/resources/js/components/status-badge.tsx)**:
   - Menghapus pemaksaan CSS `capitalize` untuk melindungi akronim akademik (KRS, SKS, UKT, UTS/UAS, PD-DIKTI).
4. **[`MasterDataNav`](file:///D:/home/aphis/Project/siakad-alyasini/resources/js/components/master-data-nav.tsx)**:
   - Menambahkan mode `compact` untuk memungkinkan penyematan dropdown alih modul langsung ke dalam slot `actions` pada header.

---

## 4. Keputusan Final

```
================================================================================
                         KEPUTUSAN VISUAL QA PILOT
================================================================================
Status : APPROVED FOR ROLLOUT
Alasan :
1. Komponen fondasi telah lolos review visual dan disempurnakan untuk kebutuhan
   densitas enterprise.
2. Tidak ada pemaksaan template kaku; kelima arketipe memiliki karakter visual
   yang selaras namun adaptif.
3. Seluruh quality gate teknis (TypeScript, ESLint, Vite Build) terpenuhi 100%
   dengan nol error dan nol warning.
4. Nol perubahan pada business logic, controller, API, route, ataupun database.
================================================================================
```

---

## 5. Rencana Kerja Rollout Batch 1 (Data Master & Akademik)

Dengan status **APPROVED FOR ROLLOUT**, implementasi design system berikutnya akan dijalankan secara bertahap pada **Batch 1**:

1. **Modul Mahasiswa**: `resources/js/pages/akademik/mahasiswa/index.tsx` & `show.tsx`
2. **Modul Dosen**: `resources/js/pages/akademik/dosen/index.tsx` & `show.tsx`
3. **Modul Program Studi**: `resources/js/pages/master/program-studi/index.tsx`
4. **Modul Kurikulum**: `resources/js/pages/akademik/kurikulum/index.tsx`
5. **Modul Ruang Kuliah & Gedung**: `resources/js/pages/master/ruang-kuliah/index.tsx`
