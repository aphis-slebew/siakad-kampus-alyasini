# Security Requirements — SIAKAD STAI Al-Yasini

Versi: 1.0
Wajib dibaca oleh kedua developer sebelum mulai coding — termasuk saat
menggunakan Antigravity/AI coding assistant. Dokumen ini adalah checklist yang
harus dicek ulang tiap kali ada fitur baru yang menyentuh data pribadi atau
proses akademik penting (nilai, KRS, kelulusan).

Sistem ini menyimpan data pribadi ±1000 mahasiswa dan dosen (NIM, NIK, nilai,
riwayat akademik) — ini bukan lagi proyek kompetisi/thesis, jadi standar
keamanannya harus setara sistem produksi institusi.

---

## 1. Autentikasi

- [ ] Password di-hash dengan Argon2id (`Hash::make()` Laravel, set driver
      `argon2id` di `config/hashing.php`).
- [ ] Rate limiting login: maksimal 5 percobaan gagal per 15 menit per akun +
      per IP (Laravel `RateLimiter`).
- [ ] 2FA **wajib** untuk role Superadmin dan Admin Akademik. Opsional (tapi
      direkomendasikan) untuk Dosen.
- [ ] Session timeout otomatis (misal 2 jam idle) — konfigurasi
      `SESSION_LIFETIME`.
- [ ] Password reset lewat email terverifikasi, token expired dalam 60 menit,
      one-time use.
- [ ] CSRF protection Laravel **tidak boleh dinonaktifkan** di route manapun,
      termasuk saat "sekadar coba fitur cepat" via AI coding assistant.

## 2. Otorisasi (RBAC)

- [ ] Semua permission dicek di **backend** (Policy/Gate), bukan hanya
      disembunyikan di frontend React. UI yang menyembunyikan tombol bukan
      kontrol keamanan.
- [ ] Setiap endpoint API/controller wajib punya middleware/policy check
      eksplisit — tidak ada endpoint "telanjang" yang hanya dilindungi oleh
      auth login tanpa cek role/permission.
- [ ] Mahasiswa hanya bisa mengakses data miliknya sendiri (cek `mahasiswa_id`
      terhadap user login di setiap query — rawan **IDOR** kalau lupa, contoh:
      mahasiswa A bisa lihat KHS mahasiswa B lewat ubah ID di URL).
- [ ] Dosen hanya bisa mengakses kelas yang diajarnya / mahasiswa bimbingannya
      — sama, wajib dicek di query, bukan asumsi dari session role saja.

## 3. Perlindungan data

- [ ] Semua koneksi wajib HTTPS (redirect paksa HTTP → HTTPS di Nginx).
- [ ] Kolom NIK dan data finansial (jika ada) di-enkripsi memakai encrypted
      cast Laravel (`'nik' => 'encrypted'` di model).
- [ ] Upload file (skripsi, berkas beasiswa, foto profil):
  - Validasi ekstensi & MIME type whitelist (bukan hanya cek ekstensi nama
    file).
  - Batasi ukuran file.
  - Simpan di storage terpisah (MinIO/S3), **bukan** folder publik
    `public/uploads` yang bisa diakses langsung tanpa cek permission.
  - Generate nama file acak (bukan nama asli) untuk mencegah path traversal.
- [ ] Backup database harian otomatis, terenkripsi, disimpan di lokasi
      terpisah dari server produksi (bukan cuma snapshot lokal).
- [ ] `.env` **tidak pernah** di-commit ke git. Cek `.gitignore` sejak commit
      pertama proyek.

## 4. Integritas data akademik

- [ ] Perubahan nilai final, approval KRS, dan approval kelulusan **hanya**
      lewat service/action class yang tervalidasi — tidak ada mass-update
      langsung ke tabel `nilais`/`krs` dari query ad-hoc/tinker di production.
- [ ] Nilai yang sudah `is_final = true` tidak bisa diedit langsung — perlu
      alur "pemutihan nilai" yang tercatat di activity log (sesuai fitur
      SEVIMA yang direplikasi).
- [ ] Validasi batas SKS, prasyarat matakuliah, dan cekal dicek di backend saat
      submit KRS — jangan percaya data yang dikirim dari frontend.

## 5. Audit & logging

- [ ] Semua aksi berikut wajib tercatat di `activity_logs` (siapa, kapan, data
      lama → data baru):
  - Perubahan nilai
  - Approval/penolakan KRS
  - Perubahan data referensi (fakultas, prodi, kurikulum)
  - Login admin & percobaan login gagal berulang
  - Perubahan role/permission user
- [ ] Log tidak boleh berisi password/token mentah.
- [ ] Retensi log minimal 1 tahun akademik.

## 6. Hardening infrastruktur (VPS)

- [ ] Firewall (ufw) — hanya buka port 80, 443, dan SSH (port non-default,
      key-based auth, root login dimatikan).
- [ ] Fail2ban aktif untuk SSH dan endpoint login aplikasi.
- [ ] Cloudflare (atau WAF sejenis) di depan aplikasi — proteksi DDoS dasar +
      cache aset statis.
- [ ] Update patch OS & dependency (composer/npm) rutin — jadwalkan cek
      bulanan, jangan biarkan `composer audit` menumpuk warning.
- [ ] Environment variable produksi (`APP_DEBUG=false`, `APP_ENV=production`)
      — pastikan tidak ada stack trace error yang bocor ke user.

## 7. Aturan khusus untuk AI-assisted coding (Antigravity / vibe coding)

Karena mayoritas development akan dibantu AI coding agent, risiko terbesar
adalah agent "menyelesaikan masalah dengan cara paling gampang" tanpa sadar itu
melemahkan keamanan. Sebelum merge/accept perubahan dari AI agent, developer
**wajib** cek manual:

- [ ] Apakah agent menonaktifkan middleware/validasi apa pun untuk "membuat
      fitur cepat jalan"? (Contoh tanda bahaya: `// TODO: re-enable auth`,
      middleware di-comment, `$fillable = ['*']`.)
- [ ] Apakah agent menulis raw SQL query yang menggabungkan input user langsung
      ke string (rawan SQL injection)? Harus selalu pakai Eloquent/query
      builder dengan parameter binding.
- [ ] Apakah agent hardcode credential/API key langsung di kode (bukan di
      `.env`)? Cek setiap file yang di-generate sebelum commit.
- [ ] Apakah validasi input memakai Form Request Laravel (bukan validasi
      manual yang gampang ke-skip)?
- [ ] Apakah agent menambahkan dependency/package baru yang tidak dicek dulu
      reputasinya (jumlah download, terakhir update, isu keamanan)?
- [ ] Setiap PR dari hasil AI coding **wajib** direview oleh developer lain
      (bukan yang generate prompt) sebelum merge ke `main`/`develop` —
      terutama untuk kode yang menyentuh auth, RBAC, atau data nilai.

## 8. Kepatuhan data pribadi

- [ ] Ikuti prinsip minimal data (jangan simpan data pribadi yang tidak
      benar-benar dibutuhkan fitur).
- [ ] Siapkan kebijakan retensi data (berapa lama data mahasiswa lulus/DO
      disimpan) — perlu konfirmasi kampus, dicatat sebagai open question di
      PRD §7.
- [ ] Batasi akses data berdasarkan kebutuhan kerja (least privilege) — staf
      kemahasiswaan tidak perlu akses ke nilai, misalnya.

## 9. Checklist sebelum go-live

- [ ] Penetration testing dasar (minimal: coba akses endpoint tanpa auth, coba
      IDOR ganti ID di URL, coba upload file berbahaya).
- [ ] Cek semua endpoint publik tidak membocorkan data (contoh: halaman error
      500 tidak menampilkan stack trace).
- [ ] Backup & restore sudah pernah dites (bukan cuma "seharusnya jalan").
- [ ] Semua akun default/testing dihapus dari database produksi.
