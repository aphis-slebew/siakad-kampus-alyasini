# Laporan Perkembangan & Revisi Sistem SIAKAD Al-Yasini
**Tanggal**: 2 September 2026  
**Status Pengujian**: ✅ **168 Passed (671 Assertions)** — 0 Failure  
**Status Build**: ✅ **Vite Build Clean (17.89s)** — 0 Error  
**Standar Kode**: ✅ **Laravel Pint Passed (PSR-12)**  

---

## 1. Ringkasan Eksekutif

Pada hari ini telah diselesaikan seluruh rangkaian revisi, penyempurnaan, dan penambahan modul sistem informasi akademik (SIAKAD) STAI Al-Yasini berdasarkan diskusi teknis dan referensi visual yang diberikan. Seluruh antarmuka dirancang dengan pendekatan **Family & Senior-Friendly UX** (mudah dipahami, font proporsional dan jelas, kontras tinggi, tombol dengan target sentuh lapang) serta tetap konsisten menggunakan tema modern **Tailwind CSS v4 + React 19 + Inertia v3**.

---

## 2. Rincian Modul & Fitur yang Ditambahkan / Diubah

### A. Data Perguruan Tinggi & Akreditasi Institusi (Foto Rujukan 1 & 2)
- **Halaman**: `resources/js/pages/master/perguruan-tinggi/index.tsx`
- **Controller & Model**: `app/Http/Controllers/Master/PerguruanTinggiController.php`, `app/Models/PerguruanTinggi.php`
- **Migrasi Database**: `database/migrations/2026_09_02_230000_create_perguruan_tinggis_table.php`
- **Fitur Utama**:
  1. **Identitas Perguruan Tinggi**: Kode Unit (213048), Nama Unit, Nama EN, Nama Singkat, Jenis PT, Lembaga Naungan, SK Pendirian, dan Tanggal Pendirian.
  2. **Pejabat Perguruan Tinggi**: Ketua (Nama & NIDN), Wakil Ketua 1, Wakil Ketua 2, Wakil Ketua 3, dan Wakil Ketua 4.
  3. **Akreditasi Institusi BAN-PT**: Lembaga, Peringkat Akreditasi, Nilai, No SK, Tanggal SK, Masa Berlaku, dan Pengunggahan Berkas Sertifikat (PDF/Gambar).
  4. **Visi, Misi & Kontak**: Visi misi institusi, alamat kampus lengkap, telepon, email, website, dan nomor fax.

---

### B. Detail Program Studi Lengkap (Foto Rujukan 3 & 4)
- **Halaman Detail**: `resources/js/pages/master/program-studi/show.tsx`
- **Halaman Daftar**: `resources/js/pages/master/program-studi/index.tsx`
- **Controller & Model**: `app/Http/Controllers/Master/ProgramStudiController.php`, `app/Models/ProgramStudi.php`
- **Fitur Utama**:
  1. **Identitas Program Studi**: Kode, Nama ID/EN, Gelar Kelulusan Lengkap & Singkat (ID/EN), Status SPMB, dan Terdaftar pada LPTK.
  2. **Pejabat Program Studi**: Ketua Program Studi (Kaprodi + NIDN) dan Sekretaris Program Studi.
  3. **Informasi Akademik**: SKS Kelulusan Minimal (default 144 SKS), IPK Lulus Minimal, Ketentuan Tugas Akhir/Skripsi, Pengaturan Transfer Nilai, Batas Maksimal Dosen Pembimbing & Penguji, serta Periode Hitung IPS Lalu.
  4. **Akreditasi Program Studi (LAMDIK / BAN-PT)**: Lembaga, Peringkat, Nilai, No SK, Masa Berlaku, dan Berkas Sertifikat.
  5. **Kontak Program Studi**: Alamat gedung prodi, telepon, email, dan website resmi.

---

### C. Detail Fakultas Lengkap (Foto Rujukan Fakultas 1 & 2)
- **Halaman Detail**: `resources/js/pages/master/fakultas/show.tsx`
- **Halaman Daftar**: `resources/js/pages/master/fakultas/index.tsx`
- **Controller & Model**: `app/Http/Controllers/Master/FakultasController.php`, `app/Models/Fakultas.php`
- **Migrasi Database**: `database/migrations/2026_09_02_234000_add_fields_to_fakultas_table.php`
- **Fitur Utama**:
  1. **Identitas Fakultas**: Kode Fakultas, Nama Fakultas, Nama Fakultas (EN), Nama Singkat, Alamat, Telepon, Periode Berdiri, dan Status Aktif.
  2. **Pejabat Fakultas**: Dekan, Wakil Dekan 1 (Akademik), Wakil Dekan 2 (Keuangan/Umum), Wakil Dekan 3 (Kemahasiswaan), dan Wakil Dekan 4 (Kerjasama/Kelembagaan).
  3. **Informasi Fakultas**: Kolom Visi dan Misi Fakultas yang terstruktur.
  4. **Quick Switcher**: Dropdown pencarian cepat di bagian atas untuk berpindah antar fakultas seketika.

---

### D. Modul Setting Prodi & Periode Perkuliahan (Foto Rujukan 1, 2, 3, 4)
- **Halaman Detail**: `resources/js/pages/akademik/setting-prodi/show.tsx`
- **Halaman Daftar**: `resources/js/pages/akademik/setting-prodi/index.tsx`
- **Controller & Model**: `app/Http/Controllers/Akademik/SettingProdiController.php`, `app/Models/SettingProdi.php`
- **Migrasi Database**: `database/migrations/2026_09_02_233000_create_setting_prodis_table.php`
- **Fitur Utama (4 Tab Navigasi)**:
  1. **Tab KRS & Validasi**:
     - Status Buka KRS Mahasiswa, Tanggal Awal KRS, Tanggal Akhir KRS, dan Tanggal Cetak KRS.
     - Status Buka Validasi KRS Dosen Wali, Tanggal Awal/Akhir Validasi KRS.
     - Pengaturan Tampilkan Dosen di KRS dan Buka Cetak KRS.
  2. **Tab KHS & Nilai**:
     - Status Buka KHS Mahasiswa, Tanggal Cetak KHS.
     - Status Buka Pengisian Nilai Dosen, Izin Dosen Mengatur Persentase Komponen Nilai, dan Rentang Tanggal Pengisian Nilai.
  3. **Tab Ujian (UTS & UAS)**:
     - Cetak Kartu UTS & UAS beserta rentang tanggal cetak kartu.
     - Syarat batas minimal kehadiran kuliah: **50% untuk UTS** dan **75% untuk UAS**.
  4. **Tab Lain-lain**:
     - Izin mahasiswa mengubah biodata pribadi mandiri (NIK, Paspor, Tempat/Tanggal Lahir, Nama Orang Tua).
     - Kuesioner Evaluasi Dosen oleh Mahasiswa (EDOM) beserta rentang tanggalnya.
     - Izin dosen men-generate sesi tatap muka mandiri.
     - Standar jumlah pertemuan kuliah (**16 Pertemuan**).
     - Batas waktu perubahan status kuliah & presensi oleh dosen.
     - Izin pembukaan setting ketua kelas.
  5. **Fitur Rollover**: Tombol 1-klik untuk menyalin seluruh konfigurasi setting dari semester sebelumnya ke semester baru.

---

### E. Redesain Filter & Jadwal Kelas Kuliah (Foto Rujukan 5 - Family & Senior Friendly)
- **Halaman**: `resources/js/pages/akademik/kelas-kuliah/index.tsx`
- **Controller**: `app/Http/Controllers/Akademik/KelasKuliahController.php`
- **Fitur Utama**:
  1. **Filter Box 2-Kolom yang Lapang**: Pilihan *Periode Akademik*, *Prodi Pengampu*, *Kurikulum*, *Sistem Kuliah* (Reguler, Hibrida, Online), dan *Jenis Status* (Nilai Terbuka / Dikunci).
  2. **Toolbar Aksi Kontras Tinggi**: Input pencarian matakuliah/kelas, tombol `Cari`, `Refresh`, `+ Tambah`, `Hapus Terpilih`, `Aksi` (Kunci/Buka Nilai Massal), dan `Cetak` (PDF & Excel).
  3. **Tabel Data Kelas Lengkap**: Kolom Checkbox multi-select, Tahun Kurikulum (`Kur.`), Mata Kuliah (+ SKS & Badge Metode Case Method), Prodi Pengampu, Nama Kelas (`A2`, `B2`), Dosen Pengajar, Jadwal Mingguan @ Ruang, Kapasitas Kuota (`Kap.`), Peserta Terdaftar (`Pst.`), Badge Status `Nilai Dikunci`, serta tombol aksi cepat (Jurnal Presensi, Edit, Hapus).
  4. **Pencegahan Bentrok Otomatis**: Deteksi bentrok jadwal dosen pengajar maupun bentrok ruangan kuliah saat pembuatan/pengeditan kelas.

---

### F. Keuangan, Tarif Komponen Biaya & Kasir POS Loket TU
- **Halaman Tarif**: `resources/js/pages/keuangan/komponen-biaya/index.tsx`
- **Halaman Kasir**: `resources/js/pages/keuangan/kasir/index.tsx`
- **Controller & Model**: `app/Http/Controllers/Keuangan/KasirController.php`, `app/Http/Controllers/Keuangan/KomponenBiayaController.php`, `app/Models/KomponenBiaya.php`
- **Fitur Utama**:
  1. **Tarif Komponen Biaya Fleksibel**: Pengaturan tarif biaya SPP/UKT, UTS/UAS, KKN/PBL, Skripsi, Wisuda, dan Formulir PMB per program studi maupun seluruh kampus.
  2. **Kasir POS Loket TU**:
     - Pencarian mahasiswa instan via NIM atau Barcode scanner.
     - Tampilan profil mahasiswa dan deteksi beasiswa aktif secara otomatis.
     - Pembayaran langsung di loket (Tunai, Transfer, QRIS, EDC), verifikasi otomatis lunas, dan cetak kuitansi pembayaran.
  3. **Generator Tagihan Massal**: Generate tagihan massal per semester/prodi/angkatan dengan **pembebasan otomatis (Nominal Rp 0 / Status Lunas)** bagi mahasiswa penerima beasiswa aktif.

---

### G. Penugasan Dosen Wali (Rollover Semester)
- **Halaman**: `resources/js/pages/akademik/dosen-wali.tsx`
- **Controller**: `app/Http/Controllers/Akademik/DosenWaliController.php`
- **Fitur Utama**: Tombol & modal 1-klik untuk menyalin/menduplikasi seluruh penugasan dosen wali dari semester sebelumnya ke semester aktif.

---

### H. Pendaftaran PMB Publik
- **Halaman**: `resources/js/pages/pmb/public/register.tsx`
- **Controller**: `app/Http/Controllers/Pmb/PmbPublicController.php`
- **Fitur Utama**: Password akun calon mahasiswa bersifat opsional; jika dikosongkan, sistem otomatis membuatkan kata sandi dari tanggal lahir calon mahasiswa (`ddmmyyyy`).

---

### I. Pembaruan Navigasi Sidebar Menu
- **File**: `resources/js/components/app-sidebar.tsx`
- **Menu Baru**:
  - `Master Data` ➔ **Perguruan Tinggi**
  - `Akademik Kampus` ➔ **Setting Prodi / Periode**
  - `Keuangan & Registrasi` ➔ **Kasir Pembayaran POS**
  - `Keuangan & Registrasi` ➔ **Tarif Komponen Biaya**

---

## 3. Daftar Berkas yang Dibuat / Diperbarui

| Berkas | Jenis Tindakan | Deskripsi |
|---|---|---|
| `database/migrations/2026_09_02_230000_create_perguruan_tinggis_table.php` | BARU | Tabel profil perguruan tinggi, SK, pimpinan, akreditasi |
| `database/migrations/2026_09_02_230100_expand_fakultas_and_program_studis_table.php` | BARU | Kolom dekanat fakultas & detail kelulusan/akreditasi prodi |
| `database/migrations/2026_09_02_230200_expand_academic_and_finance_tables.php` | BARU | Kolom jadwal akademik, tarif biaya, sistem kuliah |
| `database/migrations/2026_09_02_233000_create_setting_prodis_table.php` | BARU | Tabel setting prodi 4 tab (KRS, KHS, Ujian, Lain-lain) |
| `database/migrations/2026_09_02_234000_add_fields_to_fakultas_table.php` | BARU | Kolom nama_en, telepon, periode_berdiri, visi, misi fakultas |
| `app/Models/PerguruanTinggi.php` | BARU | Model Eloquent profil institusi perguruan tinggi |
| `app/Models/KomponenBiaya.php` | BARU | Model Eloquent tarif komponen biaya fleksibel |
| `app/Models/SettingProdi.php` | BARU | Model Eloquent pengaturan akademik & perkuliahan prodi |
| `app/Models/Fakultas.php` | DIPERBARUI | Fillable nama_en, telepon, periode_berdiri, visi, misi |
| `app/Models/ProgramStudi.php` | DIPERBARUI | Fillable gelar, status_spmb, akreditasi, info akademik |
| `app/Models/Mahasiswa.php` | DIPERBARUI | Relasi beasiswaMahasiswas |
| `app/Models/KelasKuliah.php` | DIPERBARUI | Relasi krsDetails & hitung peserta terdaftar |
| `app/Http/Controllers/Master/PerguruanTinggiController.php` | BARU | Controller profil institusi perguruan tinggi & akreditasi |
| `app/Http/Controllers/Master/ProgramStudiController.php` | DIPERBARUI | Show endpoint detail prodi lengkap sesuai foto rujukan |
| `app/Http/Controllers/Master/FakultasController.php` | DIPERBARUI | Show endpoint & update detail fakultas lengkap |
| `app/Http/Controllers/Master/TahunAjaranController.php` | DIPERBARUI | Search, filter status, dan form rentang tanggal akademik |
| `app/Http/Controllers/Akademik/SettingProdiController.php` | BARU | Controller setting prodi 4 tab & rollover semester |
| `app/Http/Controllers/Akademik/KelasKuliahController.php` | DIPERBARUI | Filter kurikulum, prodi, sistem kuliah, & krs count |
| `app/Http/Controllers/Akademik/DosenWaliController.php` | DIPERBARUI | Endpoint rollover penugasan dosen wali |
| `app/Http/Controllers/Keuangan/KasirController.php` | BARU | Controller kasir POS loket & generator tagihan massal |
| `app/Http/Controllers/Keuangan/KomponenBiayaController.php` | BARU | Controller tarif komponen biaya |
| `app/Http/Controllers/Pmb/PmbPublicController.php` | DIPERBARUI | Password otomatis tanggal lahir ddmmyyyy |
| `resources/js/pages/master/perguruan-tinggi/index.tsx` | BARU | Halaman profil PT sesuai Foto Rujukan 1 & 2 |
| `resources/js/pages/master/program-studi/show.tsx` | BARU | Halaman detail prodi lengkap sesuai Foto Rujukan 3 & 4 |
| `resources/js/pages/master/program-studi/index.tsx` | DIPERBARUI | Tabel prodi dengan link detail & akreditasi |
| `resources/js/pages/master/fakultas/show.tsx` | BARU | Halaman detail fakultas lengkap sesuai Foto Rujukan |
| `resources/js/pages/master/fakultas/index.tsx` | DIPERBARUI | Tabel fakultas dengan link detail & dekanat lengkap |
| `resources/js/pages/master/tahun-ajaran/index.tsx` | DIPERBARUI | Search, filter status, form tanggal operasional |
| `resources/js/pages/akademik/setting-prodi/show.tsx` | BARU | Detail setting prodi 4 tab sesuai Foto Rujukan 1-4 |
| `resources/js/pages/akademik/setting-prodi/index.tsx` | BARU | Daftar setting prodi per semester & modal salin |
| `resources/js/pages/akademik/kelas-kuliah/index.tsx` | DIPERBARUI | Redesain jadwal kelas senior-friendly sesuai Foto 5 |
| `resources/js/pages/akademik/dosen-wali.tsx` | DIPERBARUI | Tombol & modal salin penugasan semester lalu |
| `resources/js/pages/keuangan/kasir/index.tsx` | BARU | Antarmuka kasir POS loket TU & tagihan massal |
| `resources/js/pages/keuangan/komponen-biaya/index.tsx` | BARU | Halaman kelola tarif komponen biaya |
| `resources/js/pages/pmb/public/register.tsx` | DIPERBARUI | Helper text password tanggal lahir ddmmyyyy |
| `resources/js/components/app-sidebar.tsx` | DIPERBARUI | Penambahan menu navigasi baru |
| `routes/web.php` | DIPERBARUI | Pendaftaran seluruh rute baru |
| `tests/Feature/MasterPerguruanTinggiTest.php` | BARU | Test suite profil PT, prodi detail, & fakultas detail |
| `tests/Feature/KeuanganKasirTest.php` | BARU | Test suite tarif biaya, kasir POS, & tagihan massal |
| `tests/Feature/SettingProdiTest.php` | BARU | Test suite setting prodi 4 tab & rollover |

---

## 4. Hasil Verifikasi & Audit Sistem

1. **Frontend Compilation (Vite + React 19 + TypeScript)**:
   ```bash
   npm run build
   # Output: built in 17.89s (Seluruh bundle TSX/React 19 terkompilasi bersih tanpa error)
   ```

2. **Code Styling (Laravel Pint)**:
   ```bash
   ./vendor/bin/pint --format agent
   # Output: {"tool":"pint","result":"passed"}
   ```

3. **Backend Test Suite (Pest PHP)**:
   ```bash
   php artisan test --compact
   # Output: Tests: 168 passed (671 assertions), Duration: 41.85s (100% Lolos)
   ```

---
*Laporan ini dibuat secara otomatis sebagai dokumentasi resmi pembaruan sistem SIAKAD Al-Yasini.*
