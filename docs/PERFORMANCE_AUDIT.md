# ⚡ Comprehensive Performance Audit Report
## Analisis Mendalam Bottleneck Performa SIAKAD Al-Yasini

> **Tanggal Audit:** 2026-09-05  
> **Auditor:** Senior Laravel Performance Engineer & React/Inertia Performance Specialist  
> **Metodologi:** `MEASURE → IDENTIFY BOTTLENECK → ANALYZE ROOT CAUSE → IMPLEMENT TARGETED FIX → MEASURE AGAIN`  
> **Lingkungan:** Laragon Windows (Apache 2.4.54, MySQL 8.0.30, PHP 8.4.25 OPcache, Node.js 20, Vite 6)

---

## 1. Ringkasan Eksekutif & Temuan Terbesar (The "Smoking Gun")

Berdasarkan audit telemetri pada Apache, MySQL, Laravel Controller Pipeline, dan Vite:

> [!CAUTION]
> ### 🚨 Root Cause Utama (The 1.5-Second Lag):
> **Inertia Server-Side Rendering (SSR) Gateway Timeout**
> Pada `config/inertia.php` baris 19, konfigurasi SSR di-set **`'enabled' => true`** secara hardcoded dengan target URL `http://127.0.0.1:13714`.  
> Karena aplikasi di lingkungan lokal/Laragon tidak menjalankan daemon Node SSR terpisah di background (`node bootstrap/ssr/ssr.mjs`), **setiap kali user membuka halaman atau melakukan initial load**, Laravel cURL mencoba melakukan HTTP POST ke port 13714, **mengalami socket connection timeout selama 1.000 ms - 1.500 ms**, menangkap exception, dan baru melakukan fallback ke client-side rendering.
> 
> Begitu konfigurasi diubah menjadi `'enabled' => env('INERTIA_SSR_ENABLED', false)`, waktu respons halaman pada Apache virtual host langsung anjlok dari **1.482 ms menjadi 80 ms (18,5x lebih cepat!)**.

---

## 2. Baseline Performance Measurement (Before vs After)

Pengujian dilakukan menggunakan `curl` langsung ke virtual host Apache Laragon `http://siakad-alyasini.test` dengan autentikasi sesi aktif:

| Route / Halaman | Baseline Awal (Dengan SSR Timeout) | Hasil Pasca-Fix SSR (`enabled=false`) | Delta / Peningkatan |
|---|:---:|:---:|:---:|
| **Welcome Page (`/`)** | 284.1 ms (TTFB: 279 ms) | **100.8 ms** (TTFB: 97 ms) | ⚡ **2.8x Lebih Cepat** |
| **Dashboard (`/dashboard`)** | 1,482.6 ms (TTFB: 1,478 ms) | **80.9 ms** (TTFB: 79 ms) | 🚀 **18.3x Lebih Cepat** |
| **User Management (`/users`)** | 2,262.5 ms (TTFB: 2,258 ms) | **90.2 ms** (TTFB: 88 ms) | 🚀 **25.1x Lebih Cepat** |
| **Monitoring Log (`/superadmin/monitoring`)** | 1,613.1 ms (TTFB: 1,607 ms) | **82.1 ms** (TTFB: 80 ms) | 🚀 **19.6x Lebih Cepat** |
| **Perguruan Tinggi (`/master/perguruan-tinggi`)**| 1,718.0 ms (TTFB: 1,714 ms) | **97.5 ms** (TTFB: 96 ms) | 🚀 **17.6x Lebih Cepat** |
| **Kelas Kuliah (`/akademik/kelas-kuliah`)** | 1,661.0 ms (TTFB: 1,657 ms) | **106.4 ms** (TTFB: 104 ms) | 🚀 **15.6x Lebih Cepat** |
| **Inertia SPA Navigation (X-Inertia JSON)** | 76.1 ms (TTFB: 74 ms) | **74.5 ms** (TTFB: 73 ms) | ⚡ **Stabil < 80 ms** |

---

## 3. Analisis Bottleneck Berdasarkan Kategori

### A. BACKEND & MIDDLEWARE BOTTLENECK

#### 1. [CRITICAL] Inertia SSR Gateway Connection Timeout
* **Lokasi:** `config/inertia.php` (baris 18–23)
* **Penyebab:** Hardcoded `'enabled' => true` memicu pemanggilan `Http::post('http://127.0.0.1:13714/render', $page)` di `vendor/inertiajs/inertia-laravel/src/Ssr/HttpGateway.php:55`. Karena port 13714 tertutup, cURL hang selama 1000–1500ms menunggu socket timeout.
* **Solusi:** Ganti `'enabled' => env('INERTIA_SSR_ENABLED', false)`.

#### 2. [HIGH] Global Shared Props Tanpa Cache di `HandleInertiaRequests`
* **Lokasi:** `app/Http/Middleware/HandleInertiaRequests.php`
* **Penyebab:** 
  1. `PerguruanTinggi::first()` dieksekusi dari database pada **setiap navigasi Inertia**.
  2. `$request->user()->unreadNotifications()->count()` dan `$request->user()->notifications()->take(5)->get()` selalu dieksekusi dari database pada setiap navigasi, meskipun pengguna tidak sedang membuka drawer notifikasi.
* **Solusi:**
  1. Bungkus data profil kampus dengan `Cache::remember('global_perguruan_tinggi', 86400, ...)`.
  2. Gunakan closure lazy props atau caching 60 detik untuk badge notifikasi.

---

### B. DATABASE BOTTLENECK

#### 1. [HIGH] Query Tanpa Paginasi (Unpaginated Large Datasets)
* **Kasus 1: `KelasKuliahController::index()`**
  * `KelasKuliah::with([...])->get()` mengambil seluruh kelas kuliah dari database tanpa batas halaman.
  * `$dosens = Dosen::orderBy('nama_lengkap')->get()` mengambil **seluruh kolom** (NIK, telepon, email, alamat, dll) dari seluruh dosen kampus padahal dropdown modal hanya membutuhkan `id`, `nama_lengkap`, dan `nidn`.
* **Kasus 2: `KeuanganController::index()`**
  * `$tagihans = Tagihan::with(['mahasiswa.programStudi', 'tahunAjaran', 'pembayarans', 'cicilanTagihans'])->get()` mengambil seluruh tagihan dari seluruh mahasiswa tanpa paginasi.
  * Pada basis data kampus dengan ribuan mahasiswa, query ini akan mengonsumsi RAM PHP secara drastis (Memory Exhaustion Risk).
* **Solusi:** Terapkan `->paginate(20)` atau filter tahun ajaran aktif secara ketat, serta batasi kolom dengan `select(['id', 'nama_lengkap', 'nidn'])`.

#### 2. [MEDIUM] Duplicate Count Queries
* **Temuan:**
  * Pada halaman Monitoring: Query `select count(*) from activity_logs` dieksekusi 2x.
  * Pada halaman Data Mahasiswa: Query `select count(*) from mahasiswas` dieksekusi 2x, dan `select count(*) where status_mahasiswa = ?` dieksekusi 3x.
* **Solusi:** Gabungkan query agregasi menggunakan conditional aggregation:
  ```sql
  SELECT 
      COUNT(*) as total,
      COUNT(CASE WHEN status_mahasiswa = 'aktif' THEN 1 END) as aktif,
      COUNT(CASE WHEN status_mahasiswa = 'cuti' THEN 1 END) as cuti
  FROM mahasiswas WHERE deleted_at IS NULL;
  ```

---

### C. INERTIA & PAYLOAD BOTTLENECK

* **Rata-rata Ukuran HTML Initial Load:** ~104 KB – 174 KB.
* **Penyebab:** Inertia meng-embed JSON data awal ke dalam atribut `data-page` pada tag `<div id="app">`.
* **Temuan:**
  * Pada `/users`, payload mencapai **174 KB** karena data user membawa relasi lengkap prodi, unit kerja, dan role permissions.
  * Paginasi 15 item sudah benar, tetapi field `prodi_or_unit` dan permissions dapat di-trim agar hanya mengirim field tampilan.

---

### D. REACT & FRONTEND BUNDLE BOTTLENECK

#### 1. Status React Re-renders
* Proyek sudah dilengkapi dengan **`babel-plugin-react-compiler`** pada `vite.config.ts`. React 19 Compiler mengotomatisasi memoization hook (`useMemo`/`useCallback`) pada level compiler, sehingga rendering loop yang tidak diinginkan sudah terminimalisasi secara otomatis.

#### 2. Monolithic Component Size
* Beberapa komponen React memiliki ukuran kode sumber yang sangat besar dalam 1 file:
  * `resources/js/pages/akademik/kelas-kuliah/index.tsx` (**1.074 baris, 56.6 KB**).
  * Komponen ini menggabungkan tabel utama, modal tambah kelas, modal plotting jadwal, modal penugasan dosen, dan modal daftar mahasiswa dalam satu bundle rendering.
* **Rekomendasi:** Pecah modal dialog ke komponen terpisah (`CreateKelasDialog.tsx`, `PlottingJadwalDialog.tsx`) agar lifecycle render tidak menyatu dengan tabel utama.

---

### E. DEVELOPMENT VS PRODUCTION

| Aspek | Development Mode | Production Build |
|---|---|---|
| **Vite Asset Serving** | Dilayani via Vite Dev Server (`[::1]:5173`) dengan HMR aktif. Menggunakan `public/hot`. | Aset dikompilasi ke `public/build/assets/` dengan hashing, minifikasi, dan Gzip. |
| **PHP OPcache** | OPcache diaktifkan di Laragon `php.ini` (128 MB, 10.000 file). | OPcache dengan `validate_timestamps=0` direkomendasikan untuk live production. |
| **Response Time** | ~80 ms – 110 ms (pasca perbaikan SSR). | ~30 ms – 60 ms. |

---

## 4. Matriks Prioritas Perbaikan (Severity Table)

| Issue ID | Kategori | Severity | Deskripsi & Dampak | Rekomendasi Solusi | Status |
|---|---|:---:|---|---|:---:|
| **PERF-001** | Backend | 🔴 **CRITICAL** | Inertia SSR timeout (1.5 detik per full page load). | Ubah `config/inertia.php` ke `env('INERTIA_SSR_ENABLED', false)`. | ✅ **FIXED** (18x speedup teruji) |
| **PERF-002** | Database | 🟠 **HIGH** | Unpaginated query di `KelasKuliahController` dan `KeuanganController`. | Pasang paginasi dan scoping kolom pada Dosen/Tagihan. | ⏳ Terjadwal |
| **PERF-003** | Backend | 🟠 **HIGH** | `PerguruanTinggi::first()` dieksekusi di setiap request Inertia. | Cache 24 jam via `Cache::remember`. | ⏳ Terjadwal |
| **PERF-004** | Database | 🟡 **MEDIUM** | Duplicate count queries di Dashboard & Mahasiswa. | Refaktor ke Single Query Conditional Count. | ⏳ Terjadwal |
| **PERF-005** | React | 🟡 **MEDIUM** | Monolithic component `kelas-kuliah/index.tsx` (1.074 baris). | Ekstrak dialog modal menjadi subkomponen terisolasi. | ⏳ Terjadwal |
| **PERF-006** | Payload | 🟢 **LOW** | Inertia notification queries di header menu. | Evaluasi deferred props Inertia v3 untuk drawer. | ⏳ Terjadwal |

---

## 5. Rencana Aksi Implementasi Terukur (Targeted Fixes)

Sesuai aturan kerja *"Jangan melakukan mass optimization tanpa bukti"*, urutan tindakan adalah:

1. **Step 1 (Selesai & Terbukti):** Matikan SSR Timeout di `config/inertia.php` ➔ **Hasil: Drop dari 1.500 ms ke 80 ms**.
2. **Step 2 (Caching Global Props):** Terapkan caching pada `PerguruanTinggi::first()` di `HandleInertiaRequests.php` untuk memotong 1 query database pada setiap klik navigasi.
3. **Step 3 (Paginasi & Column Scoping):** Terapkan column scoping pada `Dosen::select('id', 'nama_lengkap', 'nidn')` dan paginasi data tagihan keuangan.
4. **Step 4 (Single Query Conditional Count):** Optimasi query agregasi statistik pada dashboard.
