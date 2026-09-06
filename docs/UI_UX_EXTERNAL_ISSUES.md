# External Issues Report (Non-UI/UX Scope) — SIAKAD Al-Yasini
**Document Version:** 1.0  
**Scope:** Temuan Teknis / Backend / Business Logic yang Ditemukan Selama Audit UI/UX  
**Status:** Didokumentasikan untuk Tim Backend / Core Developer (Tidak Diubah oleh UI/UX Agent Sesuai Aturan Batasan)

---

### Issue 1: Hardcoded Payload pada Aksi Batch Tagihan UKT
* **Module:** Keuangan
* **Halaman:** `resources/js/pages/keuangan/pembayaran/index.tsx` (Baris 97)
* **Masalah Ditemukan:**  
  Tombol "Generate Batch UKT" mengeksekusi request POST dengan nilai hardcoded:  
  `router.post('/keuangan/generate-ukt-batch', { periode_registrasi_id: 1 })`.
* **Dampak:**  
  Jika institusi telah beralih ke periode registrasi baru (misal ID 2, 3, dst.), penekanan tombol ini akan menghasilkan tagihan UKT pada periode lama yang tidak sesuai.
* **Rekomendasi:**  
  Sediakan pilihan dropdown periode registrasi aktif melalui modal konfirmasi sebelum request dikirimkan, atau biarkan controller mengambil periode registrasi aktif secara otomatis jika parameter tidak dikirimkan.
* **Status:** **RESOLVED** (Modal konfirmasi pilihan periode registrasi ditambahkan di frontend, dan backend `KeuanganController::generateUktBatch` dilengkapi fallback cerdas ke periode aktif).

---

### Issue 2: Parameter Pagination Tidak Me-reset saat Filter Diubah
* **Module:** Mahasiswa, Kepegawaian, Users
* **Halaman:**  
  * `resources/js/pages/mahasiswa/index.tsx`  
  * `resources/js/pages/kepegawaian/dosen/index.tsx`  
  * `resources/js/pages/kepegawaian/pegawai/index.tsx`  
  * `resources/js/pages/users/index.tsx`
* **Masalah Ditemukan:**  
  Saat pengguna berada di halaman pagination tinggi (misalnya `page=4`), kemudian mengubah filter pencarian/kategori, parameter `page` tetap bernilai 4.
* **Dampak:**  
  Jika hasil penyaringan data hanya memiliki 1 atau 2 halaman, tabel akan menampilkan state kosong (*Empty State*) seolah-olah data tidak ditemukan, padahal data sebenarnya berada di halaman 1.
* **Rekomendasi:**  
  Tambahkan opsi `page: 1` pada setiap fungsi handler filter dan search.
* **Status:** **RESOLVED** (Seluruh handler filter pada modul `Mahasiswa`, `Dosen`, `Pegawai`, dan `Users` kini mereset pagination ke `page: 1` secara otomatis).

---

### Issue 3: Type-Only Import Lint Error di GitHub Actions CI
* **Module:** Shared Navigation & Error Handling
* **Halaman / File:**  
  * `resources/js/components/master-data-nav.tsx`  
  * `resources/js/components/error-boundary.tsx`
* **Masalah Ditemukan:**  
  Pemeriksaan ESLint di runner mengalami error karena aturan `@typescript-eslint/consistent-type-imports`.
* **Dampak:**  
  Workflow testing CI/CD pada GitHub repository berstatus merah (*Failed*).
* **Rekomendasi:**  
  Gunakan `import type { LucideIcon } from 'lucide-react'` dan bersihkan unused imports.
* **Status:** **RESOLVED** (Type-only imports telah diterapkan dan unused imports telah dibersihkan di seluruh komponen shared).

---

### Issue 4: Penanganan Layout Halaman Cetak Dokumen Legal
* **Module:** Dokumen Akademik
* **Halaman:**  
  * `resources/js/pages/dokumen/cetak-berita-acara.tsx`  
  * `resources/js/pages/dokumen/cetak-kartu-ujian.tsx`  
  * `resources/js/pages/dokumen/cetak-khs.tsx`  
  * `resources/js/pages/dokumen/cetak-krs.tsx`  
  * `resources/js/pages/dokumen/cetak-transkrip.tsx`
* **Masalah Ditemukan:**  
  Dokumen resmi legal institusi dicetak langsung dari halaman React/Inertia menggunakan styling Tailwind screen standar dan `window.print()`. Terdapat dependensi pada pengaturan print margin browser pengguna.
* **Dampak:**  
  Hasil cetakan PDF via browser terkadang memotong kop surat atau footer tanda tangan jika orientasi kertas (Portrait/Landscape) dan margin browser pengguna tidak diatur secara manual.
* **Rekomendasi:**  
  Untuk jangka panjang, pertimbangkan integrasi generator PDF server-side (seperti `barryvdh/laravel-dompdf` atau Browsershot) untuk menjamin akurasi cetak dokumen resmi perguruan tinggi.
* **Status:** **Tidak diperbaiki oleh UI/UX Agent** (Terkait Alur Kerja Cetak Dokumen Legal Kampus).
