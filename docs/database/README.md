# Dokumentasi Database & Entity Relationship Diagram (ERD)
## Sistem Informasi Akademik (SIAKAD) STAI Al-Yasini

Selamat datang di repositori dokumentasi resmi arsitektur database **SIAKAD STAI Al-Yasini**. Dokumen ini disusun oleh **Senior Database Architect & System Analyst** untuk menyediakan satu sumber kebenaran (*Single Source of Truth*) teknis mengenai skema fisik relasional database, relasi antar-entitas, kamus data, dan audit integritas.

---

## 1. Profil & Metrik Arsitektur Database

* **RDBMS Engine:** MySQL 8.0.30 (Storage Engine: InnoDB, Charset: `utf8mb4_unicode_ci`)
* **Framework:** Laravel 13 (PHP 8.4/8.5)
* **Total Tabel Fisik:** **78 Tabel**
* **Total Foreign Key Constraints:** **95 Constraints Fisik Aktif**
* **Total Eloquent Domain Models:** **64 Models** (`app/Models`)
* **Tabel Otorisasi RBAC:** **5 Tabel** (Spatie Laravel Permission)
* **Tabel Infrastruktur Framework:** **9 Tabel** (Queue, Cache, Sessions, Migrations, Notifications)
* **Tabel dengan Soft Deletes:** **10 Tabel** (`calon_mahasiswas`, `dosens`, `fakultas`, `konsentrasis`, `mahasiswas`, `matakuliahs`, `pegawais`, `pembayarans`, `program_studis`, `tagihans`)

---

## 2. Peta Dokumen & Navigasi

Dokumentasi ini disusun secara bertingkat (*multi-level documentation*) agar mudah dipahami, mulai dari gambaran konseptual arsitektural hingga kamus data kolom paling detail:

### 📑 Dokumen Tingkat Sistem (System-Level Documents)
1. **[HIGH_LEVEL_ERD.md](HIGH_LEVEL_ERD.md)**  
   *Diagram ERD konseptual tingkat tinggi yang memetakan keterhubungan antar-domain utama (Auth, Master Data, PMB, Akademik, Keuangan, Presensi, Skripsi) secara ringkas dan mudah dipahami.*
2. **[COMPLETE_ERD.md](COMPLETE_ERD.md)**  
   *Diagram ERD teknis lengkap yang memuat seluruh 78 entitas tabel dan 95 garis relasi fisik database menggunakan notasi Crow's Foot.*
3. **[DATABASE_DICTIONARY.md](DATABASE_DICTIONARY.md)**  
   *Kamus data komprehensif untuk seluruh 78 tabel, mencakup tujuan tabel, nama kolom, tipe data SQL, key (PK/FK/UK), nullability, default value, dan deskripsi kontekstual setiap atribut.*
4. **[RELATIONSHIP_MATRIX.md](RELATIONSHIP_MATRIX.md)**  
   *Matriks referensi cepat pengembang yang memetakan relasi fisik foreign key, kardinalitas (1:1, 1:N), aturan penghapusan (CASCADE/SET NULL/RESTRICT), tabel asosiatif (M:N), dan method relasi Eloquent.*
5. **[DATABASE_INTEGRITY_AUDIT.md](DATABASE_INTEGRITY_AUDIT.md)**  
   *Laporan audit teknis integritas database yang mengidentifikasi celah cascade delete, missing composite index pada tabel pivot, indeks performa Neo Feeder, dan rekomendasi perbaikan berbasis tingkat keparahan (CRITICAL, HIGH, MEDIUM, LOW).*

---

### 🗂️ Dokumen Domain ERD Spesifik (`domains/`)
Untuk kemudahan penelaahan per modul bisnis tanpa harus membaca diagram raksasa:

| Dokumen Domain | Lingkup Modul & Entitas Utama | Tabel Terkait |
|---|---|---|
| **[AUTH_RBAC_ERD.md](domains/AUTH_RBAC_ERD.md)** | Autentikasi Pengguna & Otorisasi Hak Akses (Fortify + Spatie) | `users`, `roles`, `permissions`, `model_has_roles`, `model_has_permissions`, `role_has_permissions` |
| **[MASTER_DATA_ERD.md](domains/MASTER_DATA_ERD.md)** | Data Master Kelembagaan & Aturan Akademik Kampus | `perguruan_tinggis`, `fakultas`, `program_studis`, `setting_prodis`, `konsentrasis`, `tahun_ajarans`, `ruang_kuliahs`, `skala_nilais`, `kalender_akademiks`, `wilayahs`, `referensi_biodatas` |
| **[AKADEMIK_ERD.md](domains/AKADEMIK_ERD.md)** | Kurikulum, Matakuliah, Kelas Kuliah, Penugasan Dosen & Kontrak KRS | `kurikulum_prodis`, `matakuliahs`, `kurikulum_matakuliahs`, `prasyarat_matakuliahs`, `ekivalensi_matakuliahs`, `kelas_kuliahs`, `dosen_pengajars`, `jadwal_perkuliahans`, `krs`, `krs_details` |
| **[KEUANGAN_ERD.md](domains/KEUANGAN_ERD.md)** | Komponen Tarif, Kelompok UKT, Beasiswa, Tagihan, Cicilan & Kasir POS | `komponen_biayas`, `kelompok_ukts`, `mahasiswa_ukts`, `beasiswa_mahasiswas`, `tagihans`, `cicilan_tagihans`, `pembayarans` |
| **[PRESENSI_ERD.md](domains/PRESENSI_ERD.md)** | Jurnal 16 Tatap Muka Perkuliahan, Presensi Kehadiran, Bobot & KHS | `jurnal_perkuliahans`, `presensis`, `komposisi_nilais`, `nilais` |
| **[PMB_ERD.md](domains/PMB_ERD.md)** | Siklus PMB: Jalur, Gelombang, Camaba, Berkas, Seleksi & Her-Registrasi | `jalur_pendaftarans`, `gelombang_pendaftarans`, `calon_mahasiswas`, `berkas_pendaftarans`, `jadwal_seleksis`, `hasil_seleksis`, `periode_registrasis`, `registrasi_ulangs`, `dokumen_registrasis` |
| **[SKRIPSI_ERD.md](domains/SKRIPSI_ERD.md)** | Tugas Akhir: Proposal, Bimbingan Rutin, Skripsi, Munaqasyah & Yudisium | `proposal_skripsis`, `bimbingan_proposals`, `skripsis`, `bimbingan_skripsis`, `yudisiums`, `periode_wisudas` |
| **[OTHER_ERD.md](domains/OTHER_ERD.md)** | Kepegawaian, Kemahasiswaan, Audit Log, Neo Feeder PD-DIKTI & Sistem | `unit_kerjas`, `pegawais`, `dosens`, `mahasiswas`, `activity_logs`, `pddikti_mappings`, `pddikti_sync_logs`, `notifications`, `sessions`, dll. |

---

## 3. Standar & Notasi ERD yang Digunakan

Seluruh diagram ERD dalam repositori ini menggunakan **Crow's Foot Notation** berstandar industri dengan sintaks **Mermaid** yang kompatibel langsung dengan GitHub Markdown renderer:

```
Simbol Notasi Crow's Foot:
||--||   : Tepat Satu (One and only one - Mandatory)
||--o|   : Nol atau Satu (Zero or one - Optional)
||--o{   : Nol atau Banyak (Zero or more - Optional Many)
||--|{   : Satu atau Banyak (One or more - Mandatory Many)
```

### Format Entitas:
```
┌───────────────────────────────────────┐
│ NAMA_TABEL                            │
├───────────────────────────────────────┤
│ bigint id PK "Primary Key Unik"       │
│ bigint parent_id FK "Relasi Foreign"  │
│ varchar kode UK "Unique Constraint"   │
│ varchar nama "Kolom Atribut Biasa"    │
└───────────────────────────────────────┘
```

---

## 4. Prinsip Arsitektur Database

1. **Single Source of Truth:** Struktur database fisik yang didefinisikan pada migration merupakan fondasi mutlak sistem.
2. **Integritas Relasional Murni:** Tidak ada relasi Many-to-Many virtual tanpa adanya associative table (tabel pivot) fisik di database.
3. **Data Immutability & Soft Deletes:** Entitas master dan keuangan yang bernilai tinggi (`mahasiswas`, `dosens`, `tagihans`, `pembayarans`) dilindungi oleh Soft Deletes (`deleted_at`) untuk mencegah kehilangan data akibat ketidaksengajaan.
4. **Keamanan & Kepatuhan Privasi (UU PDP):** Field sensitif seperti NIK dan nomor kontak dilindungi enkripsi dengan kolom pendamping *Blind Index Hash* (HMAC-SHA256) untuk mendukung pencarian cepat tanpa mendekripsi seluruh database.

---
*Dokumentasi resmi ini dikelola oleh Tim Database Architect SIAKAD STAI Al-Yasini.*