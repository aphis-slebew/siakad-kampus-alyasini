# SIAKAD STAI Al-Yasini — Indeks Dokumentasi Project

Dokumen ini adalah **titik masuk**. Baca berurutan sesuai nomor sebelum menulis
kode apa pun. Kalau kamu adalah AI coding agent (Antigravity) yang baru
pertama kali membuka project ini: baca **semua** file di bawah secara utuh
sebelum membuat migration, controller, atau komponen React apa pun. Jangan
menebak struktur data atau alur bisnis — semua sudah didefinisikan di sini.

## Ringkasan proyek

SIAKAD (Sistem Informasi Akademik) untuk STAI Al-Yasini, Pasuruan — menggantikan
sistem SIAKAD berbayar dari vendor pihak ketiga dengan sistem internal yang
dikelola sendiri oleh tim IT kampus (2 developer). Kelengkapan fitur mengacu
pada SIM Akademik SEVIMA (baseline yang selama ini dipakai kampus), dengan
beberapa penyederhanaan yang sudah didokumentasikan secara eksplisit dan
disetujui — bukan pengurangan diam-diam.

**Stack final**: Laravel 12 + Inertia.js + React + PostgreSQL + Redis + Docker
Compose (untuk PostgreSQL & Redis; aplikasi Laravel sendiri jalan native saat
development, dan lewat container `app`/`nginx`/`queue`/`scheduler` saat deploy
ke VPS produksi).

## Urutan baca dokumen

| # | File | Isi | Kapan dipakai |
|---|---|---|---|
| 1 | `01-PRD.md` | Requirement produk lengkap: peran pengguna, feature parity matrix (fitur mana yang full sama SEVIMA vs disederhanakan beserta alasannya), alur bisnis end-to-end (PMB → registrasi ulang → KRS → nilai → skripsi → yudisium), fase pengerjaan, pembagian kerja 2 developer | Dibaca **pertama**, sebelum menyentuh kode apa pun. Ini sumber kebenaran soal "apa yang harus dibangun" |
| 2 | `02-Database-Schema.md` | Skema database lengkap — ERD per domain modul (auth, kepegawaian, dosen, mahasiswa, PMB, registrasi ulang, keuangan/UKT, kurikulum, kelas, KRS, nilai, skripsi, yudisium, kemahasiswaan, audit, PD-DIKTI), konvensi penamaan, checklist semua tabel | Dibaca sebelum membuat migration APA PUN. Kalau kamu (Antigravity) perlu tabel yang tidak ada di sini, **tanyakan ke developer dulu**, jangan membuat tabel baru sendiri |
| 3 | `03-UI-Theme.md` | Design system: palet warna, tipografi, komponen, prinsip desain (sengaja beda dari SEVIMA maupun pola "AI-generic") | Dibaca sebelum membuat komponen React/halaman apa pun |
| 4 | `04-Security.md` | Checklist keamanan wajib — termasuk §7 khusus aturan untuk AI-assisted coding (hal yang harus dicek manual sebelum merge kode hasil AI agent) | Dibaca sebelum coding, **dan** dijadikan checklist review sebelum tiap PR di-merge |
| 5 | `05-Installation-Guide.md` | Langkah instalasi awal project (scaffolding Laravel, Docker Compose untuk Postgres/Redis, environment) | Sudah dieksekusi — dipakai ulang kalau ada developer/mesin baru yang perlu setup dari nol |
| 6 | `06-Neo-Feeder-Integration.md` | Integrasi PD-DIKTI lewat Neo Feeder Web Service — arsitektur, keamanan jaringan, strategi sinkronisasi per kategori data, dashboard monitoring & rekonsiliasi | Dibaca saat mulai mengerjakan modul integrasi PD-DIKTI (fase belakangan, bukan MVP awal) |
| 7 | `07-Panduan-Operasional-dan-Pembaruan.md` | Panduan operasional harian, changelog pembaruan fitur (PD-DIKTI, Cetak Dokumen, UI Upgrade), kredensial dev-auth, serta fitur Impersonation Superadmin | Dibaca untuk referensi operasional, login cepat pengujian, dan panduan akses universal Superadmin |

## Aturan tidak tertulis yang wajib diikuti Antigravity

Ini rangkuman dari poin-poin kritis yang tersebar di dokumen-dokumen di atas —
ditulis ulang di sini karena paling sering jadi sumber kesalahan kalau
terlewat:

1. **Jangan menambah kolom/tabel yang tidak ada di `02-Database-Schema.md`**
   tanpa mengonfirmasi ke developer dulu. Kalau merasa perlu, usulkan dulu,
   jangan langsung generate migration.
2. **Calon Mahasiswa dan Mahasiswa aktif adalah tabel & akun login yang
   terpisah** (lihat `01-PRD.md §5` dan `02-Database-Schema.md §4-5`). Jangan
   pernah mengasumsikan satu tabel dengan kolom status yang diubah-ubah.
3. **Semua permission dicek di backend** (Policy/Gate), bukan cuma disembunyikan
   di komponen React. Lihat `04-Security.md §2`.
4. **Jangan pernah menonaktifkan CSRF, middleware auth, atau menulis raw SQL
   query dengan input user langsung** — ini pelanggaran keamanan paling
   sering ditemukan pada kode hasil AI assistant. Lihat `04-Security.md §7`
   untuk checklist lengkap sebelum PR di-merge.
5. **Nilai final, tagihan, dan pembayaran hanya boleh diubah lewat
   service/action class tervalidasi**, tidak pernah lewat update langsung ke
   tabel. Lihat `02-Database-Schema.md §7 & §13`.
6. **KRS baru bisa diajukan kalau 3 syarat sekaligus terpenuhi**: tidak cekal,
   registrasi ulang semester berjalan selesai, dan tagihan UKT lunas/dicicil
   sesuai jadwal. Lihat `02-Database-Schema.md §11`.
7. **Semua panggilan ke Neo Feeder (PD-DIKTI) lewat queue job asinkron**,
   tidak pernah langsung di request-response HTTP pengguna. Lihat
   `06-Neo-Feeder-Integration.md §4.2`.
8. **UI tidak boleh meniru tampilan SEVIMA**, dan tidak boleh terlihat seperti
   template AI generik (krem+serif, dashboard hitam+neon, dst). Ikuti
   `03-UI-Theme.md` secara ketat.
9. Payment gateway **belum** diaktifkan di fase ini — pembayaran UKT pakai
   transfer manual + verifikasi staf (`01-PRD.md §4.2`). Jangan menambahkan
   integrasi payment gateway kecuali diminta eksplisit.

## Status saat ini

- ✅ Project Laravel 12 + Inertia + React ter-scaffold, halaman welcome sudah
  bisa dibuka.
- ✅ PostgreSQL & Redis jalan lewat Docker Compose (lokal), migration bawaan
  Laravel + `spatie/laravel-permission` sudah berjalan.
- ⏳ Migration untuk tabel-tabel modul (master data, PMB, mahasiswa, dosen,
  dst sesuai `02-Database-Schema.md`) — **belum dibuat**, ini pekerjaan
  berikutnya.
- ⏳ Seeder role & permission sesuai `01-PRD.md §3` — belum dibuat.
- ⏳ Repo git — perlu dipastikan sudah di-push ke remote sebelum kerja paralel
  2 developer dimulai.

## Rekomendasi urutan pengerjaan berikutnya (jangan lompat urutan)

1. Seeder roles & permissions (`spatie/laravel-permission`) sesuai daftar
   role di `01-PRD.md §3`.
2. Migration domain **Master Data & Referensi Akademik** (`02-Database-Schema.md §8`)
   — semua modul lain bergantung pada ini, jadi harus jadi paling dulu.
3. Migration domain **Auth, Kepegawaian, Data Dosen, Data Mahasiswa** (§1-4).
4. Baru setelah itu modul-modul lain sesuai pembagian kerja di `01-PRD.md §9`
   (Dev A: PMB → registrasi ulang → keuangan → kurikulum → KRS. Dev B: data
   dosen/pegawai → realisasi & nilai → skripsi & yudisium → kemahasiswaan).

Kalau ada keraguan di tengah jalan, cek dulu ke 6 dokumen di atas sebelum
membuat asumsi sendiri.
