# Database Dictionary (Kamus Data Lengkap)
## Sistem Informasi Akademik (SIAKAD) STAI Al-Yasini

Kamus data ini mendokumentasikan secara rinci seluruh **78 tabel** fisik dan **seluruh kolom** atributnya yang aktif di database `siakad_db`.

---

### 1. TABEL: `activity_logs`

**Purpose / Fungsi:**  
Pencatatan jejak audit (audit trail) aktivitas CRUD pengguna demi keamanan dan akuntabilitas data.

**Struktur Kolom:**

| Kolom | Tipe Data | Key | Nullable | Default | Deskripsi |
|---|---|---|---|---|---|
| `id` | `bigint unsigned` | PK | NO | NULL | Primary identifier unik record (auto-incrementing bigint). |
| `user_id` | `bigint unsigned` | FK | YES | NULL | Foreign key merujuk ke tabel users.id pengelola atau pemilik akun. |
| `action` | `varchar(255)` | - | NO | NULL | Menyimpan data action pada tabel activity_logs. |
| `entity_type` | `varchar(255)` | - | YES | NULL | Menyimpan data entity type pada tabel activity_logs. |
| `entity_id` | `bigint unsigned` | - | YES | NULL | Foreign key identifier relasi ke tabel entitys. |
| `old_values` | `json` | - | YES | NULL | Menyimpan data old values pada tabel activity_logs. |
| `new_values` | `json` | - | YES | NULL | Menyimpan data new values pada tabel activity_logs. |
| `ip_address` | `varchar(255)` | - | YES | NULL | Menyimpan data ip address pada tabel activity_logs. |
| `user_agent` | `text` | - | YES | NULL | Menyimpan data user agent pada tabel activity_logs. |
| `created_at` | `timestamp` | - | YES | NULL | Waktu pertama kali record dibuat di sistem. |
| `updated_at` | `timestamp` | - | YES | NULL | Waktu terakhir record diperbarui di sistem. |

**Foreign Key Constraints:**

| Constraint Name | Kolom Sumber | Referensi Tabel | Referensi Kolom | On Delete | On Update |
|---|---|---|---|---|---|
| `activity_logs_user_id_foreign` | `user_id` | `users` | `id` | `SET NULL` | `NO ACTION` |

**Daftar Index:**

| Nama Index | Tipe Index | Kolom Terlibat |
|---|---|---|
| `activity_logs_user_id_foreign` | INDEX | `user_id` |
| `PRIMARY` | PRIMARY KEY | `id` |

---

### 2. TABEL: `aktivitas_mahasiswas`

**Purpose / Fungsi:**  
Catatan kegiatan non-akademik, organisasi, prestasi lomba, dan seminar mahasiswa (SKPI).

**Struktur Kolom:**

| Kolom | Tipe Data | Key | Nullable | Default | Deskripsi |
|---|---|---|---|---|---|
| `id` | `bigint unsigned` | PK | NO | NULL | Primary identifier unik record (auto-incrementing bigint). |
| `mahasiswa_id` | `bigint unsigned` | FK | NO | NULL | Foreign key merujuk ke tabel mahasiswas.id terkait. |
| `jenis_aktivitas_id` | `bigint unsigned` | FK | YES | NULL | Foreign key identifier relasi ke tabel jenis_aktivitass. |
| `nama_kegiatan` | `varchar(255)` | - | NO | NULL | Menyimpan data nama kegiatan pada tabel aktivitas_mahasiswas. |
| `divalidasi` | `tinyint(1)` | - | NO | `0` | Menyimpan data divalidasi pada tabel aktivitas_mahasiswas. |
| `created_at` | `timestamp` | - | YES | NULL | Waktu pertama kali record dibuat di sistem. |
| `updated_at` | `timestamp` | - | YES | NULL | Waktu terakhir record diperbarui di sistem. |

**Foreign Key Constraints:**

| Constraint Name | Kolom Sumber | Referensi Tabel | Referensi Kolom | On Delete | On Update |
|---|---|---|---|---|---|
| `aktivitas_mahasiswas_jenis_aktivitas_id_foreign` | `jenis_aktivitas_id` | `referensi_biodatas` | `id` | `SET NULL` | `NO ACTION` |
| `aktivitas_mahasiswas_mahasiswa_id_foreign` | `mahasiswa_id` | `mahasiswas` | `id` | `CASCADE` | `NO ACTION` |

**Daftar Index:**

| Nama Index | Tipe Index | Kolom Terlibat |
|---|---|---|
| `aktivitas_mahasiswas_jenis_aktivitas_id_foreign` | INDEX | `jenis_aktivitas_id` |
| `aktivitas_mahasiswas_mahasiswa_id_foreign` | INDEX | `mahasiswa_id` |
| `PRIMARY` | PRIMARY KEY | `id` |

---

### 3. TABEL: `beasiswa_mahasiswas`

**Purpose / Fungsi:**  
Pemberian subsidi beasiswa (KIP-Kuliah, Yayasan, Tahfidz) yang membebaskan/mereduksi tagihan UKT.

**Struktur Kolom:**

| Kolom | Tipe Data | Key | Nullable | Default | Deskripsi |
|---|---|---|---|---|---|
| `id` | `bigint unsigned` | PK | NO | NULL | Primary identifier unik record (auto-incrementing bigint). |
| `mahasiswa_id` | `bigint unsigned` | FK | NO | NULL | Foreign key merujuk ke tabel mahasiswas.id terkait. |
| `jenis_beasiswa_id` | `bigint unsigned` | FK | YES | NULL | Foreign key identifier relasi ke tabel jenis_beasiswas. |
| `status` | `varchar(255)` | - | NO | `diajukan` | Status operasional entitas (aktif/nonaktif/draft/selesai). |
| `created_at` | `timestamp` | - | YES | NULL | Waktu pertama kali record dibuat di sistem. |
| `updated_at` | `timestamp` | - | YES | NULL | Waktu terakhir record diperbarui di sistem. |

**Foreign Key Constraints:**

| Constraint Name | Kolom Sumber | Referensi Tabel | Referensi Kolom | On Delete | On Update |
|---|---|---|---|---|---|
| `beasiswa_mahasiswas_jenis_beasiswa_id_foreign` | `jenis_beasiswa_id` | `referensi_biodatas` | `id` | `SET NULL` | `NO ACTION` |
| `beasiswa_mahasiswas_mahasiswa_id_foreign` | `mahasiswa_id` | `mahasiswas` | `id` | `CASCADE` | `NO ACTION` |

**Daftar Index:**

| Nama Index | Tipe Index | Kolom Terlibat |
|---|---|---|
| `beasiswa_mahasiswas_jenis_beasiswa_id_foreign` | INDEX | `jenis_beasiswa_id` |
| `beasiswa_mahasiswas_mahasiswa_id_foreign` | INDEX | `mahasiswa_id` |
| `PRIMARY` | PRIMARY KEY | `id` |

---

### 4. TABEL: `berkas_pendaftarans`

**Purpose / Fungsi:**  
File digital unggahan berkas persyaratan PMB (ijazah, KK, KTP, transkrip, sertifikat).

**Struktur Kolom:**

| Kolom | Tipe Data | Key | Nullable | Default | Deskripsi |
|---|---|---|---|---|---|
| `id` | `bigint unsigned` | PK | NO | NULL | Primary identifier unik record (auto-incrementing bigint). |
| `calon_mahasiswa_id` | `bigint unsigned` | FK | NO | NULL | Foreign key identifier relasi ke tabel calon_mahasiswas. |
| `jenis_berkas` | `varchar(255)` | - | NO | NULL | Menyimpan data jenis berkas pada tabel berkas_pendaftarans. |
| `file_path` | `varchar(255)` | - | NO | NULL | Menyimpan data file path pada tabel berkas_pendaftarans. |
| `status_verifikasi` | `varchar(255)` | - | NO | `diajukan` | Menyimpan data status verifikasi pada tabel berkas_pendaftarans. |
| `catatan_verifikasi` | `text` | - | YES | NULL | Menyimpan data catatan verifikasi pada tabel berkas_pendaftarans. |
| `diverifikasi_oleh_user_id` | `bigint unsigned` | FK | YES | NULL | Foreign key identifier relasi ke tabel diverifikasi_oleh_users. |
| `created_at` | `timestamp` | - | YES | NULL | Waktu pertama kali record dibuat di sistem. |
| `updated_at` | `timestamp` | - | YES | NULL | Waktu terakhir record diperbarui di sistem. |

**Foreign Key Constraints:**

| Constraint Name | Kolom Sumber | Referensi Tabel | Referensi Kolom | On Delete | On Update |
|---|---|---|---|---|---|
| `berkas_pendaftarans_calon_mahasiswa_id_foreign` | `calon_mahasiswa_id` | `calon_mahasiswas` | `id` | `CASCADE` | `NO ACTION` |
| `berkas_pendaftarans_diverifikasi_oleh_user_id_foreign` | `diverifikasi_oleh_user_id` | `users` | `id` | `SET NULL` | `NO ACTION` |

**Daftar Index:**

| Nama Index | Tipe Index | Kolom Terlibat |
|---|---|---|
| `berkas_pendaftarans_calon_mahasiswa_id_foreign` | INDEX | `calon_mahasiswa_id` |
| `berkas_pendaftarans_diverifikasi_oleh_user_id_foreign` | INDEX | `diverifikasi_oleh_user_id` |
| `PRIMARY` | PRIMARY KEY | `id` |

---

### 5. TABEL: `bimbingan_proposals`

**Purpose / Fungsi:**  
Log asistensi bimbingan rancangan proposal skripsi bersama dosen pembimbing proposal.

**Struktur Kolom:**

| Kolom | Tipe Data | Key | Nullable | Default | Deskripsi |
|---|---|---|---|---|---|
| `id` | `bigint unsigned` | PK | NO | NULL | Primary identifier unik record (auto-incrementing bigint). |
| `proposal_skripsi_id` | `bigint unsigned` | FK | NO | NULL | Foreign key merujuk ke tabel proposal_skripsis.id. |
| `tanggal` | `date` | - | NO | NULL | Tanggal kalender pelaksanaan kegiatan. |
| `catatan` | `text` | - | NO | NULL | Keterangan tambahan atau catatan penolakan/revisi. |
| `divalidasi` | `tinyint(1)` | - | NO | `0` | Menyimpan data divalidasi pada tabel bimbingan_proposals. |
| `created_at` | `timestamp` | - | YES | NULL | Waktu pertama kali record dibuat di sistem. |
| `updated_at` | `timestamp` | - | YES | NULL | Waktu terakhir record diperbarui di sistem. |

**Foreign Key Constraints:**

| Constraint Name | Kolom Sumber | Referensi Tabel | Referensi Kolom | On Delete | On Update |
|---|---|---|---|---|---|
| `bimbingan_proposals_proposal_skripsi_id_foreign` | `proposal_skripsi_id` | `proposal_skripsis` | `id` | `CASCADE` | `NO ACTION` |

**Daftar Index:**

| Nama Index | Tipe Index | Kolom Terlibat |
|---|---|---|
| `bimbingan_proposals_proposal_skripsi_id_foreign` | INDEX | `proposal_skripsi_id` |
| `PRIMARY` | PRIMARY KEY | `id` |

---

### 6. TABEL: `bimbingan_skripsis`

**Purpose / Fungsi:**  
Log asistensi rutin bimbingan skripsi Bab 1-5 (wajib minimal 8 kali catatan bimbingan).

**Struktur Kolom:**

| Kolom | Tipe Data | Key | Nullable | Default | Deskripsi |
|---|---|---|---|---|---|
| `id` | `bigint unsigned` | PK | NO | NULL | Primary identifier unik record (auto-incrementing bigint). |
| `skripsi_id` | `bigint unsigned` | FK | NO | NULL | Foreign key merujuk ke tabel skripsis.id. |
| `tanggal` | `date` | - | NO | NULL | Tanggal kalender pelaksanaan kegiatan. |
| `catatan` | `text` | - | NO | NULL | Keterangan tambahan atau catatan penolakan/revisi. |
| `divalidasi` | `tinyint(1)` | - | NO | `0` | Menyimpan data divalidasi pada tabel bimbingan_skripsis. |
| `created_at` | `timestamp` | - | YES | NULL | Waktu pertama kali record dibuat di sistem. |
| `updated_at` | `timestamp` | - | YES | NULL | Waktu terakhir record diperbarui di sistem. |

**Foreign Key Constraints:**

| Constraint Name | Kolom Sumber | Referensi Tabel | Referensi Kolom | On Delete | On Update |
|---|---|---|---|---|---|
| `bimbingan_skripsis_skripsi_id_foreign` | `skripsi_id` | `skripsis` | `id` | `CASCADE` | `NO ACTION` |

**Daftar Index:**

| Nama Index | Tipe Index | Kolom Terlibat |
|---|---|---|
| `bimbingan_skripsis_skripsi_id_foreign` | INDEX | `skripsi_id` |
| `PRIMARY` | PRIMARY KEY | `id` |

---

### 7. TABEL: `cache`

**Purpose / Fungsi:**  
Penyimpanan data cache performa aplikasi oleh framework Laravel.

**Struktur Kolom:**

| Kolom | Tipe Data | Key | Nullable | Default | Deskripsi |
|---|---|---|---|---|---|
| `key` | `varchar(255)` | PK | NO | NULL | Menyimpan data key pada tabel cache. |
| `value` | `mediumtext` | - | NO | NULL | Menyimpan data value pada tabel cache. |
| `expiration` | `bigint` | - | NO | NULL | Menyimpan data expiration pada tabel cache. |

**Daftar Index:**

| Nama Index | Tipe Index | Kolom Terlibat |
|---|---|---|
| `cache_expiration_index` | INDEX | `expiration` |
| `PRIMARY` | PRIMARY KEY | `key` |

---

### 8. TABEL: `cache_locks`

**Purpose / Fungsi:**  
Penyimpanan status atomik kunci konkurensi (cache atomic locks) sistem.

**Struktur Kolom:**

| Kolom | Tipe Data | Key | Nullable | Default | Deskripsi |
|---|---|---|---|---|---|
| `key` | `varchar(255)` | PK | NO | NULL | Menyimpan data key pada tabel cache_locks. |
| `owner` | `varchar(255)` | - | NO | NULL | Menyimpan data owner pada tabel cache_locks. |
| `expiration` | `bigint` | - | NO | NULL | Menyimpan data expiration pada tabel cache_locks. |

**Daftar Index:**

| Nama Index | Tipe Index | Kolom Terlibat |
|---|---|---|
| `cache_locks_expiration_index` | INDEX | `expiration` |
| `PRIMARY` | PRIMARY KEY | `key` |

---

### 9. TABEL: `calon_mahasiswas`

**Purpose / Fungsi:**  
Data pendaftaran calon mahasiswa baru peserta PMB (biodata, NIK, pilihan prodi, asal sekolah).

**Struktur Kolom:**

| Kolom | Tipe Data | Key | Nullable | Default | Deskripsi |
|---|---|---|---|---|---|
| `id` | `bigint unsigned` | PK | NO | NULL | Primary identifier unik record (auto-incrementing bigint). |
| `user_id` | `bigint unsigned` | FK | YES | NULL | Foreign key merujuk ke tabel users.id pengelola atau pemilik akun. |
| `gelombang_pendaftaran_id` | `bigint unsigned` | FK | NO | NULL | Foreign key identifier relasi ke tabel gelombang_pendaftarans. |
| `jalur_pendaftaran_id` | `bigint unsigned` | FK | NO | NULL | Foreign key identifier relasi ke tabel jalur_pendaftarans. |
| `program_studi_pilihan_1_id` | `bigint unsigned` | FK | NO | NULL | Foreign key identifier relasi ke tabel program_studi_pilihan_1s. |
| `program_studi_pilihan_2_id` | `bigint unsigned` | FK | YES | NULL | Foreign key identifier relasi ke tabel program_studi_pilihan_2s. |
| `nama_lengkap` | `varchar(255)` | - | NO | NULL | Nama lengkap sesuai dokumen kependudukan resmi. |
| `nik` | `varchar(255)` | UNIQUE | YES | NULL | Nomor Induk Kependudukan (KTP) 16 digit. |
| `nik_hash` | `varchar(64)` | UNIQUE | YES | NULL | Blind index hash HMAC-SHA256 untuk pencarian cepat data terenkripsi. |
| `tempat_lahir` | `varchar(255)` | - | YES | NULL | Menyimpan data tempat lahir pada tabel calon_mahasiswas. |
| `tanggal_lahir` | `date` | - | YES | NULL | Tanggal pencatatan lahir. |
| `jenis_kelamin` | `varchar(255)` | - | YES | NULL | Menyimpan data jenis kelamin pada tabel calon_mahasiswas. |
| `alamat` | `text` | - | YES | NULL | Menyimpan data alamat pada tabel calon_mahasiswas. |
| `no_hp` | `varchar(255)` | - | YES | NULL | Menyimpan data no hp pada tabel calon_mahasiswas. |
| `email` | `varchar(255)` | - | YES | NULL | Alamat surel resmi untuk komunikasi dan login. |
| `asal_sekolah` | `varchar(255)` | - | YES | NULL | Menyimpan data asal sekolah pada tabel calon_mahasiswas. |
| `tahun_lulus_sekolah` | `int` | - | YES | NULL | Menyimpan data tahun lulus sekolah pada tabel calon_mahasiswas. |
| `status_pendaftaran` | `varchar(255)` | - | NO | `draft` | Menyimpan data status pendaftaran pada tabel calon_mahasiswas. |
| `created_at` | `timestamp` | - | YES | NULL | Waktu pertama kali record dibuat di sistem. |
| `updated_at` | `timestamp` | - | YES | NULL | Waktu terakhir record diperbarui di sistem. |
| `deleted_at` | `timestamp` | - | YES | NULL | Timestamp soft delete untuk pengarsipan data tanpa menghapus fisik record. |

**Foreign Key Constraints:**

| Constraint Name | Kolom Sumber | Referensi Tabel | Referensi Kolom | On Delete | On Update |
|---|---|---|---|---|---|
| `calon_mahasiswas_gelombang_pendaftaran_id_foreign` | `gelombang_pendaftaran_id` | `gelombang_pendaftarans` | `id` | `NO ACTION` | `NO ACTION` |
| `calon_mahasiswas_jalur_pendaftaran_id_foreign` | `jalur_pendaftaran_id` | `jalur_pendaftarans` | `id` | `NO ACTION` | `NO ACTION` |
| `calon_mahasiswas_program_studi_pilihan_1_id_foreign` | `program_studi_pilihan_1_id` | `program_studis` | `id` | `NO ACTION` | `NO ACTION` |
| `calon_mahasiswas_program_studi_pilihan_2_id_foreign` | `program_studi_pilihan_2_id` | `program_studis` | `id` | `NO ACTION` | `NO ACTION` |
| `calon_mahasiswas_user_id_foreign` | `user_id` | `users` | `id` | `SET NULL` | `NO ACTION` |

**Daftar Index:**

| Nama Index | Tipe Index | Kolom Terlibat |
|---|---|---|
| `calon_mahasiswas_gelombang_pendaftaran_id_foreign` | INDEX | `gelombang_pendaftaran_id` |
| `calon_mahasiswas_jalur_pendaftaran_id_foreign` | INDEX | `jalur_pendaftaran_id` |
| `calon_mahasiswas_nik_hash_unique` | UNIQUE INDEX | `nik_hash` |
| `calon_mahasiswas_nik_unique` | UNIQUE INDEX | `nik` |
| `calon_mahasiswas_program_studi_pilihan_1_id_foreign` | INDEX | `program_studi_pilihan_1_id` |
| `calon_mahasiswas_program_studi_pilihan_2_id_foreign` | INDEX | `program_studi_pilihan_2_id` |
| `calon_mahasiswas_user_id_foreign` | INDEX | `user_id` |
| `PRIMARY` | PRIMARY KEY | `id` |

---

### 10. TABEL: `cekals`

**Purpose / Fungsi:**  
Pencatatan sanksi cekal akademik, keuangan, atau perpustakaan yang memblokir akses KRS/kartu ujian.

**Struktur Kolom:**

| Kolom | Tipe Data | Key | Nullable | Default | Deskripsi |
|---|---|---|---|---|---|
| `id` | `bigint unsigned` | PK | NO | NULL | Primary identifier unik record (auto-incrementing bigint). |
| `mahasiswa_id` | `bigint unsigned` | FK | NO | NULL | Foreign key merujuk ke tabel mahasiswas.id terkait. |
| `alasan` | `text` | - | NO | NULL | Menyimpan data alasan pada tabel cekals. |
| `is_active` | `tinyint(1)` | - | NO | `1` | Flag penanda apakah record sedang aktif digunakan (1 = Aktif, 0 = Nonaktif). |
| `created_at` | `timestamp` | - | YES | NULL | Waktu pertama kali record dibuat di sistem. |
| `updated_at` | `timestamp` | - | YES | NULL | Waktu terakhir record diperbarui di sistem. |

**Foreign Key Constraints:**

| Constraint Name | Kolom Sumber | Referensi Tabel | Referensi Kolom | On Delete | On Update |
|---|---|---|---|---|---|
| `cekals_mahasiswa_id_foreign` | `mahasiswa_id` | `mahasiswas` | `id` | `CASCADE` | `NO ACTION` |

**Daftar Index:**

| Nama Index | Tipe Index | Kolom Terlibat |
|---|---|---|
| `cekals_mahasiswa_id_foreign` | INDEX | `mahasiswa_id` |
| `PRIMARY` | PRIMARY KEY | `id` |

---

### 11. TABEL: `cicilan_tagihans`

**Purpose / Fungsi:**  
Skema pemecahan pembayaran tagihan menjadi beberapa termin cicilan berkala.

**Struktur Kolom:**

| Kolom | Tipe Data | Key | Nullable | Default | Deskripsi |
|---|---|---|---|---|---|
| `id` | `bigint unsigned` | PK | NO | NULL | Primary identifier unik record (auto-incrementing bigint). |
| `tagihan_id` | `bigint unsigned` | FK | NO | NULL | Foreign key merujuk ke tabel tagihans.id invoice keuangan. |
| `cicilan_ke` | `int` | - | NO | NULL | Menyimpan data cicilan ke pada tabel cicilan_tagihans. |
| `nominal` | `decimal(12,2)` | - | NO | NULL | Besaran nilai mata uang rupiah (IDR). |
| `jatuh_tempo` | `date` | - | NO | NULL | Menyimpan data jatuh tempo pada tabel cicilan_tagihans. |
| `status` | `varchar(255)` | - | NO | `belum_bayar` | Status operasional entitas (aktif/nonaktif/draft/selesai). |
| `created_at` | `timestamp` | - | YES | NULL | Waktu pertama kali record dibuat di sistem. |
| `updated_at` | `timestamp` | - | YES | NULL | Waktu terakhir record diperbarui di sistem. |

**Foreign Key Constraints:**

| Constraint Name | Kolom Sumber | Referensi Tabel | Referensi Kolom | On Delete | On Update |
|---|---|---|---|---|---|
| `cicilan_tagihans_tagihan_id_foreign` | `tagihan_id` | `tagihans` | `id` | `CASCADE` | `NO ACTION` |

**Daftar Index:**

| Nama Index | Tipe Index | Kolom Terlibat |
|---|---|---|
| `cicilan_tagihans_tagihan_id_foreign` | INDEX | `tagihan_id` |
| `PRIMARY` | PRIMARY KEY | `id` |

---

### 12. TABEL: `data_orang_tuas`

**Purpose / Fungsi:**  
Informasi biodata orang tua atau wali mahasiswa (nama ayah/ibu, NIK, pekerjaan, penghasilan).

**Struktur Kolom:**

| Kolom | Tipe Data | Key | Nullable | Default | Deskripsi |
|---|---|---|---|---|---|
| `id` | `bigint unsigned` | PK | NO | NULL | Primary identifier unik record (auto-incrementing bigint). |
| `mahasiswa_id` | `bigint unsigned` | FK | NO | NULL | Foreign key merujuk ke tabel mahasiswas.id terkait. |
| `nama_ayah` | `varchar(255)` | - | YES | NULL | Menyimpan data nama ayah pada tabel data_orang_tuas. |
| `nama_ibu` | `varchar(255)` | - | YES | NULL | Menyimpan data nama ibu pada tabel data_orang_tuas. |
| `pekerjaan_ayah_referensi_id` | `bigint unsigned` | FK | YES | NULL | Foreign key identifier relasi ke tabel pekerjaan_ayah_referensis. |
| `pekerjaan_ibu_referensi_id` | `bigint unsigned` | FK | YES | NULL | Foreign key identifier relasi ke tabel pekerjaan_ibu_referensis. |
| `penghasilan_ortu_referensi_id` | `bigint unsigned` | FK | YES | NULL | Foreign key identifier relasi ke tabel penghasilan_ortu_referensis. |
| `no_hp_kontak_darurat` | `varchar(255)` | - | YES | NULL | Menyimpan data no hp kontak darurat pada tabel data_orang_tuas. |
| `created_at` | `timestamp` | - | YES | NULL | Waktu pertama kali record dibuat di sistem. |
| `updated_at` | `timestamp` | - | YES | NULL | Waktu terakhir record diperbarui di sistem. |

**Foreign Key Constraints:**

| Constraint Name | Kolom Sumber | Referensi Tabel | Referensi Kolom | On Delete | On Update |
|---|---|---|---|---|---|
| `data_orang_tuas_mahasiswa_id_foreign` | `mahasiswa_id` | `mahasiswas` | `id` | `CASCADE` | `NO ACTION` |
| `data_orang_tuas_pekerjaan_ayah_referensi_id_foreign` | `pekerjaan_ayah_referensi_id` | `referensi_biodatas` | `id` | `SET NULL` | `NO ACTION` |
| `data_orang_tuas_pekerjaan_ibu_referensi_id_foreign` | `pekerjaan_ibu_referensi_id` | `referensi_biodatas` | `id` | `SET NULL` | `NO ACTION` |
| `data_orang_tuas_penghasilan_ortu_referensi_id_foreign` | `penghasilan_ortu_referensi_id` | `referensi_biodatas` | `id` | `SET NULL` | `NO ACTION` |

**Daftar Index:**

| Nama Index | Tipe Index | Kolom Terlibat |
|---|---|---|
| `data_orang_tuas_mahasiswa_id_foreign` | INDEX | `mahasiswa_id` |
| `data_orang_tuas_pekerjaan_ayah_referensi_id_foreign` | INDEX | `pekerjaan_ayah_referensi_id` |
| `data_orang_tuas_pekerjaan_ibu_referensi_id_foreign` | INDEX | `pekerjaan_ibu_referensi_id` |
| `data_orang_tuas_penghasilan_ortu_referensi_id_foreign` | INDEX | `penghasilan_ortu_referensi_id` |
| `PRIMARY` | PRIMARY KEY | `id` |

---

### 13. TABEL: `dokumen_registrasis`

**Purpose / Fungsi:**  
Verifikasi fisik dokumen dan surat pernyataan keabsahan berkas saat her-registrasi.

**Struktur Kolom:**

| Kolom | Tipe Data | Key | Nullable | Default | Deskripsi |
|---|---|---|---|---|---|
| `id` | `bigint unsigned` | PK | NO | NULL | Primary identifier unik record (auto-incrementing bigint). |
| `registrasi_ulang_id` | `bigint unsigned` | FK | NO | NULL | Foreign key identifier relasi ke tabel registrasi_ulangs. |
| `jenis_dokumen` | `varchar(255)` | - | NO | NULL | Menyimpan data jenis dokumen pada tabel dokumen_registrasis. |
| `file_path` | `varchar(255)` | - | NO | NULL | Menyimpan data file path pada tabel dokumen_registrasis. |
| `status_verifikasi` | `varchar(255)` | - | NO | `diajukan` | Menyimpan data status verifikasi pada tabel dokumen_registrasis. |
| `created_at` | `timestamp` | - | YES | NULL | Waktu pertama kali record dibuat di sistem. |
| `updated_at` | `timestamp` | - | YES | NULL | Waktu terakhir record diperbarui di sistem. |

**Foreign Key Constraints:**

| Constraint Name | Kolom Sumber | Referensi Tabel | Referensi Kolom | On Delete | On Update |
|---|---|---|---|---|---|
| `dokumen_registrasis_registrasi_ulang_id_foreign` | `registrasi_ulang_id` | `registrasi_ulangs` | `id` | `CASCADE` | `NO ACTION` |

**Daftar Index:**

| Nama Index | Tipe Index | Kolom Terlibat |
|---|---|---|
| `dokumen_registrasis_registrasi_ulang_id_foreign` | INDEX | `registrasi_ulang_id` |
| `PRIMARY` | PRIMARY KEY | `id` |

---

### 14. TABEL: `dosen_pengajars`

**Purpose / Fungsi:**  
Penugasan dosen pengampu (team teaching atau mandiri) pada kelas perkuliahan beserta sks ajar.

**Struktur Kolom:**

| Kolom | Tipe Data | Key | Nullable | Default | Deskripsi |
|---|---|---|---|---|---|
| `id` | `bigint unsigned` | PK | NO | NULL | Primary identifier unik record (auto-incrementing bigint). |
| `kelas_kuliah_id` | `bigint unsigned` | FK | NO | NULL | Foreign key merujuk ke tabel kelas_kuliahs.id rombel perkuliahan. |
| `dosen_id` | `bigint unsigned` | FK | NO | NULL | Foreign key merujuk ke tabel dosens.id terkait. |
| `peran` | `varchar(255)` | - | NO | `utama` | Menyimpan data peran pada tabel dosen_pengajars. |
| `created_at` | `timestamp` | - | YES | NULL | Waktu pertama kali record dibuat di sistem. |
| `updated_at` | `timestamp` | - | YES | NULL | Waktu terakhir record diperbarui di sistem. |

**Foreign Key Constraints:**

| Constraint Name | Kolom Sumber | Referensi Tabel | Referensi Kolom | On Delete | On Update |
|---|---|---|---|---|---|
| `dosen_pengajars_dosen_id_foreign` | `dosen_id` | `dosens` | `id` | `CASCADE` | `NO ACTION` |
| `dosen_pengajars_kelas_kuliah_id_foreign` | `kelas_kuliah_id` | `kelas_kuliahs` | `id` | `CASCADE` | `NO ACTION` |

**Daftar Index:**

| Nama Index | Tipe Index | Kolom Terlibat |
|---|---|---|
| `dosen_pengajars_dosen_id_foreign` | INDEX | `dosen_id` |
| `dosen_pengajars_kelas_kuliah_id_foreign` | INDEX | `kelas_kuliah_id` |
| `PRIMARY` | PRIMARY KEY | `id` |

---

### 15. TABEL: `dosen_walis`

**Purpose / Fungsi:**  
Penugasan Dosen Pembimbing Akademik (DPA) untuk membimbing rombongan mahasiswa per angkatan.

**Struktur Kolom:**

| Kolom | Tipe Data | Key | Nullable | Default | Deskripsi |
|---|---|---|---|---|---|
| `id` | `bigint unsigned` | PK | NO | NULL | Primary identifier unik record (auto-incrementing bigint). |
| `mahasiswa_id` | `bigint unsigned` | FK | NO | NULL | Foreign key merujuk ke tabel mahasiswas.id terkait. |
| `dosen_id` | `bigint unsigned` | FK | NO | NULL | Foreign key merujuk ke tabel dosens.id terkait. |
| `tahun_ajaran_id` | `bigint unsigned` | FK | NO | NULL | Foreign key merujuk ke tabel tahun_ajarans.id periode akademik aktif. |
| `created_at` | `timestamp` | - | YES | NULL | Waktu pertama kali record dibuat di sistem. |
| `updated_at` | `timestamp` | - | YES | NULL | Waktu terakhir record diperbarui di sistem. |

**Foreign Key Constraints:**

| Constraint Name | Kolom Sumber | Referensi Tabel | Referensi Kolom | On Delete | On Update |
|---|---|---|---|---|---|
| `dosen_walis_dosen_id_foreign` | `dosen_id` | `dosens` | `id` | `CASCADE` | `NO ACTION` |
| `dosen_walis_mahasiswa_id_foreign` | `mahasiswa_id` | `mahasiswas` | `id` | `CASCADE` | `NO ACTION` |
| `dosen_walis_tahun_ajaran_id_foreign` | `tahun_ajaran_id` | `tahun_ajarans` | `id` | `CASCADE` | `NO ACTION` |

**Daftar Index:**

| Nama Index | Tipe Index | Kolom Terlibat |
|---|---|---|
| `dosen_walis_dosen_id_foreign` | INDEX | `dosen_id` |
| `dosen_walis_mahasiswa_id_foreign` | INDEX | `mahasiswa_id` |
| `dosen_walis_tahun_ajaran_id_foreign` | INDEX | `tahun_ajaran_id` |
| `PRIMARY` | PRIMARY KEY | `id` |

---

### 16. TABEL: `dosens`

**Purpose / Fungsi:**  
Data induk dosen pengajar dan dosen pembimbing akademik (NIDN, nama, gelar, homebase prodi).

**Struktur Kolom:**

| Kolom | Tipe Data | Key | Nullable | Default | Deskripsi |
|---|---|---|---|---|---|
| `id` | `bigint unsigned` | PK | NO | NULL | Primary identifier unik record (auto-incrementing bigint). |
| `user_id` | `bigint unsigned` | FK | YES | NULL | Foreign key merujuk ke tabel users.id pengelola atau pemilik akun. |
| `program_studi_id` | `bigint unsigned` | FK | YES | NULL | Foreign key merujuk ke tabel program_studis.id terkait. |
| `nidn` | `varchar(255)` | UNIQUE | YES | NULL | Nomor Induk Dosen Nasional (NIDN) terdaftar di PD-DIKTI. |
| `nidn_hash` | `varchar(64)` | UNIQUE | YES | NULL | Blind index hash HMAC-SHA256 untuk pencarian cepat data terenkripsi. |
| `nuptk` | `varchar(255)` | - | YES | NULL | Menyimpan data nuptk pada tabel dosens. |
| `niy_nip` | `varchar(255)` | - | YES | NULL | Menyimpan data niy nip pada tabel dosens. |
| `gelar_depan` | `varchar(255)` | - | YES | NULL | Menyimpan data gelar depan pada tabel dosens. |
| `nama_lengkap` | `varchar(255)` | - | NO | NULL | Nama lengkap sesuai dokumen kependudukan resmi. |
| `gelar_belakang` | `varchar(255)` | - | YES | NULL | Menyimpan data gelar belakang pada tabel dosens. |
| `nik` | `varchar(255)` | - | YES | NULL | Nomor Induk Kependudukan (KTP) 16 digit. |
| `nik_hash` | `varchar(64)` | UNIQUE | YES | NULL | Blind index hash HMAC-SHA256 untuk pencarian cepat data terenkripsi. |
| `tempat_lahir` | `varchar(255)` | - | YES | NULL | Menyimpan data tempat lahir pada tabel dosens. |
| `tanggal_lahir` | `date` | - | YES | NULL | Tanggal pencatatan lahir. |
| `jenis_kelamin` | `varchar(255)` | - | YES | NULL | Menyimpan data jenis kelamin pada tabel dosens. |
| `alamat` | `text` | - | YES | NULL | Menyimpan data alamat pada tabel dosens. |
| `no_hp` | `varchar(255)` | - | YES | NULL | Menyimpan data no hp pada tabel dosens. |
| `email_pribadi` | `varchar(255)` | - | YES | NULL | Menyimpan data email pribadi pada tabel dosens. |
| `jabatan_fungsional_saat_ini` | `varchar(255)` | - | YES | NULL | Menyimpan data jabatan fungsional saat ini pada tabel dosens. |
| `pangkat_golongan` | `varchar(255)` | - | YES | NULL | Menyimpan data pangkat golongan pada tabel dosens. |
| `sk_kepangkatan_path` | `varchar(255)` | - | YES | NULL | Menyimpan data sk kepangkatan path pada tabel dosens. |
| `status_kepegawaian` | `varchar(255)` | - | NO | `tetap` | Menyimpan data status kepegawaian pada tabel dosens. |
| `sertifikasi_pendidik` | `tinyint(1)` | - | NO | `0` | Menyimpan data sertifikasi pendidik pada tabel dosens. |
| `foto_path` | `varchar(255)` | - | YES | NULL | Menyimpan data foto path pada tabel dosens. |
| `created_at` | `timestamp` | - | YES | NULL | Waktu pertama kali record dibuat di sistem. |
| `updated_at` | `timestamp` | - | YES | NULL | Waktu terakhir record diperbarui di sistem. |
| `deleted_at` | `timestamp` | - | YES | NULL | Timestamp soft delete untuk pengarsipan data tanpa menghapus fisik record. |

**Foreign Key Constraints:**

| Constraint Name | Kolom Sumber | Referensi Tabel | Referensi Kolom | On Delete | On Update |
|---|---|---|---|---|---|
| `dosens_program_studi_id_foreign` | `program_studi_id` | `program_studis` | `id` | `SET NULL` | `NO ACTION` |
| `dosens_user_id_foreign` | `user_id` | `users` | `id` | `SET NULL` | `NO ACTION` |

**Daftar Index:**

| Nama Index | Tipe Index | Kolom Terlibat |
|---|---|---|
| `dosens_nidn_hash_unique` | UNIQUE INDEX | `nidn_hash` |
| `dosens_nidn_unique` | UNIQUE INDEX | `nidn` |
| `dosens_nik_hash_unique` | UNIQUE INDEX | `nik_hash` |
| `dosens_program_studi_id_foreign` | INDEX | `program_studi_id` |
| `dosens_user_id_foreign` | INDEX | `user_id` |
| `PRIMARY` | PRIMARY KEY | `id` |

---

### 17. TABEL: `ekivalensi_matakuliahs`

**Purpose / Fungsi:**  
Tabel penyetaraan matakuliah antara kurikulum lama dengan kurikulum baru saat transisi.

**Struktur Kolom:**

| Kolom | Tipe Data | Key | Nullable | Default | Deskripsi |
|---|---|---|---|---|---|
| `id` | `bigint unsigned` | PK | NO | NULL | Primary identifier unik record (auto-incrementing bigint). |
| `matakuliah_lama_id` | `bigint unsigned` | FK | NO | NULL | Foreign key identifier relasi ke tabel matakuliah_lamas. |
| `matakuliah_baru_id` | `bigint unsigned` | FK | NO | NULL | Foreign key identifier relasi ke tabel matakuliah_barus. |
| `created_at` | `timestamp` | - | YES | NULL | Waktu pertama kali record dibuat di sistem. |
| `updated_at` | `timestamp` | - | YES | NULL | Waktu terakhir record diperbarui di sistem. |

**Foreign Key Constraints:**

| Constraint Name | Kolom Sumber | Referensi Tabel | Referensi Kolom | On Delete | On Update |
|---|---|---|---|---|---|
| `ekivalensi_matakuliahs_matakuliah_baru_id_foreign` | `matakuliah_baru_id` | `matakuliahs` | `id` | `CASCADE` | `NO ACTION` |
| `ekivalensi_matakuliahs_matakuliah_lama_id_foreign` | `matakuliah_lama_id` | `matakuliahs` | `id` | `CASCADE` | `NO ACTION` |

**Daftar Index:**

| Nama Index | Tipe Index | Kolom Terlibat |
|---|---|---|
| `ekivalensi_matakuliahs_matakuliah_baru_id_foreign` | INDEX | `matakuliah_baru_id` |
| `ekivalensi_matakuliahs_matakuliah_lama_id_foreign` | INDEX | `matakuliah_lama_id` |
| `PRIMARY` | PRIMARY KEY | `id` |

---

### 18. TABEL: `failed_jobs`

**Purpose / Fungsi:**  
Pencatatan kegagalan pemrosesan antrean tugas latar belakang beserta jejak error stack trace.

**Struktur Kolom:**

| Kolom | Tipe Data | Key | Nullable | Default | Deskripsi |
|---|---|---|---|---|---|
| `id` | `bigint unsigned` | PK | NO | NULL | Primary identifier unik record (auto-incrementing bigint). |
| `uuid` | `varchar(255)` | UNIQUE | NO | NULL | Menyimpan data uuid pada tabel failed_jobs. |
| `connection` | `varchar(255)` | - | NO | NULL | Menyimpan data connection pada tabel failed_jobs. |
| `queue` | `varchar(255)` | - | NO | NULL | Menyimpan data queue pada tabel failed_jobs. |
| `payload` | `longtext` | - | NO | NULL | Menyimpan data payload pada tabel failed_jobs. |
| `exception` | `longtext` | - | NO | NULL | Menyimpan data exception pada tabel failed_jobs. |
| `failed_at` | `timestamp` | - | NO | `CURRENT_TIMESTAMP` | Menyimpan data failed at pada tabel failed_jobs. |

**Daftar Index:**

| Nama Index | Tipe Index | Kolom Terlibat |
|---|---|---|
| `failed_jobs_connection_queue_failed_at_index` | INDEX | `connection`, `queue`, `failed_at` |
| `failed_jobs_uuid_unique` | UNIQUE INDEX | `uuid` |
| `PRIMARY` | PRIMARY KEY | `id` |

---

### 19. TABEL: `fakultas`

**Purpose / Fungsi:**  
Data master fakultas di lingkungan kampus (kode fakultas, nama fakultas, dekan).

**Struktur Kolom:**

| Kolom | Tipe Data | Key | Nullable | Default | Deskripsi |
|---|---|---|---|---|---|
| `id` | `bigint unsigned` | PK | NO | NULL | Primary identifier unik record (auto-incrementing bigint). |
| `kode` | `varchar(255)` | UNIQUE | NO | NULL | Menyimpan data kode pada tabel fakultas. |
| `nama` | `varchar(255)` | - | NO | NULL | Nama lengkap entitas terkait. |
| `nama_en` | `varchar(255)` | - | YES | NULL | Menyimpan data nama en pada tabel fakultas. |
| `nama_singkat` | `varchar(255)` | - | YES | NULL | Menyimpan data nama singkat pada tabel fakultas. |
| `alamat` | `varchar(255)` | - | YES | NULL | Menyimpan data alamat pada tabel fakultas. |
| `telepon` | `varchar(255)` | - | YES | NULL | Menyimpan data telepon pada tabel fakultas. |
| `tahun_berdiri` | `int` | - | YES | NULL | Menyimpan data tahun berdiri pada tabel fakultas. |
| `periode_berdiri` | `varchar(255)` | - | YES | NULL | Menyimpan data periode berdiri pada tabel fakultas. |
| `status` | `varchar(255)` | - | NO | `aktif` | Status operasional entitas (aktif/nonaktif/draft/selesai). |
| `luas_m2` | `varchar(255)` | - | YES | NULL | Menyimpan data luas m2 pada tabel fakultas. |
| `dekan_nama` | `varchar(255)` | - | YES | NULL | Menyimpan data dekan nama pada tabel fakultas. |
| `dekan_nidn` | `varchar(255)` | - | YES | NULL | Menyimpan data dekan nidn pada tabel fakultas. |
| `wakil_dekan_1` | `varchar(255)` | - | YES | NULL | Menyimpan data wakil dekan 1 pada tabel fakultas. |
| `wakil_dekan_2` | `varchar(255)` | - | YES | NULL | Menyimpan data wakil dekan 2 pada tabel fakultas. |
| `wakil_dekan_3` | `varchar(255)` | - | YES | NULL | Menyimpan data wakil dekan 3 pada tabel fakultas. |
| `wakil_dekan_4` | `varchar(255)` | - | YES | NULL | Menyimpan data wakil dekan 4 pada tabel fakultas. |
| `visi` | `text` | - | YES | NULL | Menyimpan data visi pada tabel fakultas. |
| `misi` | `text` | - | YES | NULL | Menyimpan data misi pada tabel fakultas. |
| `created_at` | `timestamp` | - | YES | NULL | Waktu pertama kali record dibuat di sistem. |
| `updated_at` | `timestamp` | - | YES | NULL | Waktu terakhir record diperbarui di sistem. |
| `deleted_at` | `timestamp` | - | YES | NULL | Timestamp soft delete untuk pengarsipan data tanpa menghapus fisik record. |

**Daftar Index:**

| Nama Index | Tipe Index | Kolom Terlibat |
|---|---|---|
| `fakultas_kode_unique` | UNIQUE INDEX | `kode` |
| `PRIMARY` | PRIMARY KEY | `id` |

---

### 20. TABEL: `gelombang_pendaftarans`

**Purpose / Fungsi:**  
Periode pembukaan pendaftaran PMB (Gelombang 1, 2, 3) beserta rentang tanggal aktif.

**Struktur Kolom:**

| Kolom | Tipe Data | Key | Nullable | Default | Deskripsi |
|---|---|---|---|---|---|
| `id` | `bigint unsigned` | PK | NO | NULL | Primary identifier unik record (auto-incrementing bigint). |
| `nama` | `varchar(255)` | - | NO | NULL | Nama lengkap entitas terkait. |
| `mulai_pendaftaran` | `date` | - | NO | NULL | Menyimpan data mulai pendaftaran pada tabel gelombang_pendaftarans. |
| `selesai_pendaftaran` | `date` | - | NO | NULL | Menyimpan data selesai pendaftaran pada tabel gelombang_pendaftarans. |
| `kuota` | `int` | - | NO | NULL | Menyimpan data kuota pada tabel gelombang_pendaftarans. |
| `is_active` | `tinyint(1)` | - | NO | `1` | Flag penanda apakah record sedang aktif digunakan (1 = Aktif, 0 = Nonaktif). |
| `created_at` | `timestamp` | - | YES | NULL | Waktu pertama kali record dibuat di sistem. |
| `updated_at` | `timestamp` | - | YES | NULL | Waktu terakhir record diperbarui di sistem. |

**Daftar Index:**

| Nama Index | Tipe Index | Kolom Terlibat |
|---|---|---|
| `PRIMARY` | PRIMARY KEY | `id` |

---

### 21. TABEL: `hasil_seleksis`

**Purpose / Fungsi:**  
Hasil evaluasi tes masuk PMB (nilai tes, rekomendasi panitia, status LULUS/TIDAK LULUS).

**Struktur Kolom:**

| Kolom | Tipe Data | Key | Nullable | Default | Deskripsi |
|---|---|---|---|---|---|
| `id` | `bigint unsigned` | PK | NO | NULL | Primary identifier unik record (auto-incrementing bigint). |
| `calon_mahasiswa_id` | `bigint unsigned` | FK | NO | NULL | Foreign key identifier relasi ke tabel calon_mahasiswas. |
| `nilai_tes` | `decimal(5,2)` | - | YES | NULL | Menyimpan data nilai tes pada tabel hasil_seleksis. |
| `status` | `varchar(255)` | - | NO | NULL | Status operasional entitas (aktif/nonaktif/draft/selesai). |
| `catatan` | `text` | - | YES | NULL | Keterangan tambahan atau catatan penolakan/revisi. |
| `created_at` | `timestamp` | - | YES | NULL | Waktu pertama kali record dibuat di sistem. |
| `updated_at` | `timestamp` | - | YES | NULL | Waktu terakhir record diperbarui di sistem. |

**Foreign Key Constraints:**

| Constraint Name | Kolom Sumber | Referensi Tabel | Referensi Kolom | On Delete | On Update |
|---|---|---|---|---|---|
| `hasil_seleksis_calon_mahasiswa_id_foreign` | `calon_mahasiswa_id` | `calon_mahasiswas` | `id` | `CASCADE` | `NO ACTION` |

**Daftar Index:**

| Nama Index | Tipe Index | Kolom Terlibat |
|---|---|---|
| `hasil_seleksis_calon_mahasiswa_id_foreign` | INDEX | `calon_mahasiswa_id` |
| `PRIMARY` | PRIMARY KEY | `id` |

---

### 22. TABEL: `jadwal_perkuliahans`

**Purpose / Fungsi:**  
Jadwal tatap muka mingguan kelas kuliah (hari, jam mulai, jam selesai, dan ruang perkuliahan).

**Struktur Kolom:**

| Kolom | Tipe Data | Key | Nullable | Default | Deskripsi |
|---|---|---|---|---|---|
| `id` | `bigint unsigned` | PK | NO | NULL | Primary identifier unik record (auto-incrementing bigint). |
| `kelas_kuliah_id` | `bigint unsigned` | FK | NO | NULL | Foreign key merujuk ke tabel kelas_kuliahs.id rombel perkuliahan. |
| `ruang_kuliah_id` | `bigint unsigned` | FK | NO | NULL | Foreign key identifier relasi ke tabel ruang_kuliahs. |
| `hari` | `varchar(255)` | - | NO | NULL | Menyimpan data hari pada tabel jadwal_perkuliahans. |
| `jam_mulai` | `time` | - | NO | NULL | Waktu jam dimulainya sesi perkuliahan. |
| `jam_selesai` | `time` | - | NO | NULL | Waktu jam berakhirnya sesi perkuliahan. |
| `created_at` | `timestamp` | - | YES | NULL | Waktu pertama kali record dibuat di sistem. |
| `updated_at` | `timestamp` | - | YES | NULL | Waktu terakhir record diperbarui di sistem. |

**Foreign Key Constraints:**

| Constraint Name | Kolom Sumber | Referensi Tabel | Referensi Kolom | On Delete | On Update |
|---|---|---|---|---|---|
| `jadwal_perkuliahans_kelas_kuliah_id_foreign` | `kelas_kuliah_id` | `kelas_kuliahs` | `id` | `CASCADE` | `NO ACTION` |
| `jadwal_perkuliahans_ruang_kuliah_id_foreign` | `ruang_kuliah_id` | `ruang_kuliahs` | `id` | `CASCADE` | `NO ACTION` |

**Daftar Index:**

| Nama Index | Tipe Index | Kolom Terlibat |
|---|---|---|
| `jadwal_perkuliahans_kelas_kuliah_id_foreign` | INDEX | `kelas_kuliah_id` |
| `jadwal_perkuliahans_ruang_kuliah_id_foreign` | INDEX | `ruang_kuliah_id` |
| `PRIMARY` | PRIMARY KEY | `id` |

---

### 23. TABEL: `jadwal_seleksis`

**Purpose / Fungsi:**  
Penjadwalan ujian tes masuk PMB (waktu, lokasi/ruang, materi tes seleksi).

**Struktur Kolom:**

| Kolom | Tipe Data | Key | Nullable | Default | Deskripsi |
|---|---|---|---|---|---|
| `id` | `bigint unsigned` | PK | NO | NULL | Primary identifier unik record (auto-incrementing bigint). |
| `calon_mahasiswa_id` | `bigint unsigned` | FK | NO | NULL | Foreign key identifier relasi ke tabel calon_mahasiswas. |
| `jenis_tes` | `varchar(255)` | - | NO | NULL | Menyimpan data jenis tes pada tabel jadwal_seleksis. |
| `tanggal` | `date` | - | NO | NULL | Tanggal kalender pelaksanaan kegiatan. |
| `lokasi_atau_link` | `varchar(255)` | - | YES | NULL | Menyimpan data lokasi atau link pada tabel jadwal_seleksis. |
| `created_at` | `timestamp` | - | YES | NULL | Waktu pertama kali record dibuat di sistem. |
| `updated_at` | `timestamp` | - | YES | NULL | Waktu terakhir record diperbarui di sistem. |

**Foreign Key Constraints:**

| Constraint Name | Kolom Sumber | Referensi Tabel | Referensi Kolom | On Delete | On Update |
|---|---|---|---|---|---|
| `jadwal_seleksis_calon_mahasiswa_id_foreign` | `calon_mahasiswa_id` | `calon_mahasiswas` | `id` | `CASCADE` | `NO ACTION` |

**Daftar Index:**

| Nama Index | Tipe Index | Kolom Terlibat |
|---|---|---|
| `jadwal_seleksis_calon_mahasiswa_id_foreign` | INDEX | `calon_mahasiswa_id` |
| `PRIMARY` | PRIMARY KEY | `id` |

---

### 24. TABEL: `jalur_pendaftarans`

**Purpose / Fungsi:**  
Jalur penerimaan PMB (Reguler, Prestasi, Beasiswa Tahfidz, Transfer/Pindahan).

**Struktur Kolom:**

| Kolom | Tipe Data | Key | Nullable | Default | Deskripsi |
|---|---|---|---|---|---|
| `id` | `bigint unsigned` | PK | NO | NULL | Primary identifier unik record (auto-incrementing bigint). |
| `nama` | `varchar(255)` | - | NO | NULL | Nama lengkap entitas terkait. |
| `biaya_pendaftaran` | `decimal(12,2)` | - | NO | `0.00` | Menyimpan data biaya pendaftaran pada tabel jalur_pendaftarans. |
| `created_at` | `timestamp` | - | YES | NULL | Waktu pertama kali record dibuat di sistem. |
| `updated_at` | `timestamp` | - | YES | NULL | Waktu terakhir record diperbarui di sistem. |

**Daftar Index:**

| Nama Index | Tipe Index | Kolom Terlibat |
|---|---|---|
| `PRIMARY` | PRIMARY KEY | `id` |

---

### 25. TABEL: `job_batches`

**Purpose / Fungsi:**  
Penyimpanan status eksekusi kumpulan tugas antrean batch (Laravel batching queue).

**Struktur Kolom:**

| Kolom | Tipe Data | Key | Nullable | Default | Deskripsi |
|---|---|---|---|---|---|
| `id` | `varchar(255)` | PK | NO | NULL | Primary identifier unik record (auto-incrementing bigint). |
| `name` | `varchar(255)` | - | NO | NULL | Menyimpan data name pada tabel job_batches. |
| `total_jobs` | `int` | - | NO | NULL | Menyimpan data total jobs pada tabel job_batches. |
| `pending_jobs` | `int` | - | NO | NULL | Menyimpan data pending jobs pada tabel job_batches. |
| `failed_jobs` | `int` | - | NO | NULL | Menyimpan data failed jobs pada tabel job_batches. |
| `failed_job_ids` | `longtext` | - | NO | NULL | Menyimpan data failed job ids pada tabel job_batches. |
| `options` | `mediumtext` | - | YES | NULL | Menyimpan data options pada tabel job_batches. |
| `cancelled_at` | `int` | - | YES | NULL | Menyimpan data cancelled at pada tabel job_batches. |
| `created_at` | `int` | - | NO | NULL | Waktu pertama kali record dibuat di sistem. |
| `finished_at` | `int` | - | YES | NULL | Menyimpan data finished at pada tabel job_batches. |

**Daftar Index:**

| Nama Index | Tipe Index | Kolom Terlibat |
|---|---|---|
| `PRIMARY` | PRIMARY KEY | `id` |

---

### 26. TABEL: `jobs`

**Purpose / Fungsi:**  
Antrean tugas pemrosesan latar belakang (Laravel Queue worker) seperti generate tagihan massal.

**Struktur Kolom:**

| Kolom | Tipe Data | Key | Nullable | Default | Deskripsi |
|---|---|---|---|---|---|
| `id` | `bigint unsigned` | PK | NO | NULL | Primary identifier unik record (auto-incrementing bigint). |
| `queue` | `varchar(255)` | - | NO | NULL | Menyimpan data queue pada tabel jobs. |
| `payload` | `longtext` | - | NO | NULL | Menyimpan data payload pada tabel jobs. |
| `attempts` | `smallint unsigned` | - | NO | NULL | Menyimpan data attempts pada tabel jobs. |
| `reserved_at` | `int unsigned` | - | YES | NULL | Menyimpan data reserved at pada tabel jobs. |
| `available_at` | `int unsigned` | - | NO | NULL | Menyimpan data available at pada tabel jobs. |
| `created_at` | `int unsigned` | - | NO | NULL | Waktu pertama kali record dibuat di sistem. |

**Daftar Index:**

| Nama Index | Tipe Index | Kolom Terlibat |
|---|---|---|
| `jobs_queue_index` | INDEX | `queue` |
| `PRIMARY` | PRIMARY KEY | `id` |

---

### 27. TABEL: `jurnal_perkuliahans`

**Purpose / Fungsi:**  
Pencatatan berita acara dan jurnal pelaksanaan 16 pertemuan kuliah oleh dosen.

**Struktur Kolom:**

| Kolom | Tipe Data | Key | Nullable | Default | Deskripsi |
|---|---|---|---|---|---|
| `id` | `bigint unsigned` | PK | NO | NULL | Primary identifier unik record (auto-incrementing bigint). |
| `kelas_kuliah_id` | `bigint unsigned` | FK | NO | NULL | Foreign key merujuk ke tabel kelas_kuliahs.id rombel perkuliahan. |
| `tanggal` | `date` | - | NO | NULL | Tanggal kalender pelaksanaan kegiatan. |
| `materi` | `text` | - | NO | NULL | Menyimpan data materi pada tabel jurnal_perkuliahans. |
| `dosen_pengajar_id` | `bigint unsigned` | FK | NO | NULL | Foreign key identifier relasi ke tabel dosen_pengajars. |
| `created_at` | `timestamp` | - | YES | NULL | Waktu pertama kali record dibuat di sistem. |
| `updated_at` | `timestamp` | - | YES | NULL | Waktu terakhir record diperbarui di sistem. |

**Foreign Key Constraints:**

| Constraint Name | Kolom Sumber | Referensi Tabel | Referensi Kolom | On Delete | On Update |
|---|---|---|---|---|---|
| `jurnal_perkuliahans_dosen_pengajar_id_foreign` | `dosen_pengajar_id` | `dosen_pengajars` | `id` | `CASCADE` | `NO ACTION` |
| `jurnal_perkuliahans_kelas_kuliah_id_foreign` | `kelas_kuliah_id` | `kelas_kuliahs` | `id` | `CASCADE` | `NO ACTION` |

**Daftar Index:**

| Nama Index | Tipe Index | Kolom Terlibat |
|---|---|---|
| `jurnal_perkuliahans_dosen_pengajar_id_foreign` | INDEX | `dosen_pengajar_id` |
| `jurnal_perkuliahans_kelas_kuliah_id_foreign` | INDEX | `kelas_kuliah_id` |
| `PRIMARY` | PRIMARY KEY | `id` |

---

### 28. TABEL: `kalender_akademiks`

**Purpose / Fungsi:**  
Jadwal agenda kegiatan akademik tahunan (masa KRS, perkuliahan, UTS, UAS, wisuda).

**Struktur Kolom:**

| Kolom | Tipe Data | Key | Nullable | Default | Deskripsi |
|---|---|---|---|---|---|
| `id` | `bigint unsigned` | PK | NO | NULL | Primary identifier unik record (auto-incrementing bigint). |
| `tahun_ajaran_id` | `bigint unsigned` | FK | NO | NULL | Foreign key merujuk ke tabel tahun_ajarans.id periode akademik aktif. |
| `kegiatan` | `varchar(255)` | - | NO | NULL | Menyimpan data kegiatan pada tabel kalender_akademiks. |
| `mulai` | `date` | - | NO | NULL | Menyimpan data mulai pada tabel kalender_akademiks. |
| `selesai` | `date` | - | NO | NULL | Menyimpan data selesai pada tabel kalender_akademiks. |
| `created_at` | `timestamp` | - | YES | NULL | Waktu pertama kali record dibuat di sistem. |
| `updated_at` | `timestamp` | - | YES | NULL | Waktu terakhir record diperbarui di sistem. |

**Foreign Key Constraints:**

| Constraint Name | Kolom Sumber | Referensi Tabel | Referensi Kolom | On Delete | On Update |
|---|---|---|---|---|---|
| `kalender_akademiks_tahun_ajaran_id_foreign` | `tahun_ajaran_id` | `tahun_ajarans` | `id` | `CASCADE` | `NO ACTION` |

**Daftar Index:**

| Nama Index | Tipe Index | Kolom Terlibat |
|---|---|---|
| `kalender_akademiks_tahun_ajaran_id_foreign` | INDEX | `tahun_ajaran_id` |
| `PRIMARY` | PRIMARY KEY | `id` |

---

### 29. TABEL: `kelas_kuliahs`

**Purpose / Fungsi:**  
Pembukaan rombongan belajar kelas perkuliahan untuk suatu matakuliah pada semester aktif.

**Struktur Kolom:**

| Kolom | Tipe Data | Key | Nullable | Default | Deskripsi |
|---|---|---|---|---|---|
| `id` | `bigint unsigned` | PK | NO | NULL | Primary identifier unik record (auto-incrementing bigint). |
| `kurikulum_matakuliah_id` | `bigint unsigned` | FK | NO | NULL | Foreign key identifier relasi ke tabel kurikulum_matakuliahs. |
| `tahun_ajaran_id` | `bigint unsigned` | FK | NO | NULL | Foreign key merujuk ke tabel tahun_ajarans.id periode akademik aktif. |
| `nama_kelas` | `varchar(255)` | - | NO | NULL | Menyimpan data nama kelas pada tabel kelas_kuliahs. |
| `kuota` | `int` | - | NO | NULL | Menyimpan data kuota pada tabel kelas_kuliahs. |
| `sistem_kuliah` | `varchar(255)` | - | NO | `reguler` | Menyimpan data sistem kuliah pada tabel kelas_kuliahs. |
| `created_at` | `timestamp` | - | YES | NULL | Waktu pertama kali record dibuat di sistem. |
| `updated_at` | `timestamp` | - | YES | NULL | Waktu terakhir record diperbarui di sistem. |

**Foreign Key Constraints:**

| Constraint Name | Kolom Sumber | Referensi Tabel | Referensi Kolom | On Delete | On Update |
|---|---|---|---|---|---|
| `kelas_kuliahs_kurikulum_matakuliah_id_foreign` | `kurikulum_matakuliah_id` | `kurikulum_matakuliahs` | `id` | `CASCADE` | `NO ACTION` |
| `kelas_kuliahs_tahun_ajaran_id_foreign` | `tahun_ajaran_id` | `tahun_ajarans` | `id` | `CASCADE` | `NO ACTION` |

**Daftar Index:**

| Nama Index | Tipe Index | Kolom Terlibat |
|---|---|---|
| `kelas_kuliahs_kurikulum_matakuliah_id_foreign` | INDEX | `kurikulum_matakuliah_id` |
| `kelas_kuliahs_tahun_ajaran_id_foreign` | INDEX | `tahun_ajaran_id` |
| `PRIMARY` | PRIMARY KEY | `id` |

---

### 30. TABEL: `kelompok_ukts`

**Purpose / Fungsi:**  
Pengelompokan besaran nominal UKT (Kategori 1, 2, 3, Reguler, Khusus) per program studi.

**Struktur Kolom:**

| Kolom | Tipe Data | Key | Nullable | Default | Deskripsi |
|---|---|---|---|---|---|
| `id` | `bigint unsigned` | PK | NO | NULL | Primary identifier unik record (auto-incrementing bigint). |
| `program_studi_id` | `bigint unsigned` | FK | NO | NULL | Foreign key merujuk ke tabel program_studis.id terkait. |
| `nama` | `varchar(255)` | - | NO | NULL | Nama lengkap entitas terkait. |
| `nominal_per_semester` | `decimal(12,2)` | - | NO | NULL | Menyimpan data nominal per semester pada tabel kelompok_ukts. |
| `created_at` | `timestamp` | - | YES | NULL | Waktu pertama kali record dibuat di sistem. |
| `updated_at` | `timestamp` | - | YES | NULL | Waktu terakhir record diperbarui di sistem. |

**Foreign Key Constraints:**

| Constraint Name | Kolom Sumber | Referensi Tabel | Referensi Kolom | On Delete | On Update |
|---|---|---|---|---|---|
| `kelompok_ukts_program_studi_id_foreign` | `program_studi_id` | `program_studis` | `id` | `CASCADE` | `NO ACTION` |

**Daftar Index:**

| Nama Index | Tipe Index | Kolom Terlibat |
|---|---|---|
| `kelompok_ukts_program_studi_id_foreign` | INDEX | `program_studi_id` |
| `PRIMARY` | PRIMARY KEY | `id` |

---

### 31. TABEL: `komponen_biayas`

**Purpose / Fungsi:**  
Daftar tarif dan item komponen pembiayaan kampus (SPP/UKT, DPP, praktikum, wisuda, skripsi).

**Struktur Kolom:**

| Kolom | Tipe Data | Key | Nullable | Default | Deskripsi |
|---|---|---|---|---|---|
| `id` | `bigint unsigned` | PK | NO | NULL | Primary identifier unik record (auto-incrementing bigint). |
| `kode` | `varchar(255)` | UNIQUE | NO | NULL | Menyimpan data kode pada tabel komponen_biayas. |
| `nama` | `varchar(255)` | - | NO | NULL | Nama lengkap entitas terkait. |
| `kategori` | `varchar(255)` | - | NO | `akademik` | Menyimpan data kategori pada tabel komponen_biayas. |
| `program_studi_id` | `bigint unsigned` | FK | YES | NULL | Foreign key merujuk ke tabel program_studis.id terkait. |
| `angkatan` | `int` | - | YES | NULL | Menyimpan data angkatan pada tabel komponen_biayas. |
| `nominal` | `decimal(15,2)` | - | NO | NULL | Besaran nilai mata uang rupiah (IDR). |
| `is_active` | `tinyint(1)` | - | NO | `1` | Flag penanda apakah record sedang aktif digunakan (1 = Aktif, 0 = Nonaktif). |
| `keterangan` | `text` | - | YES | NULL | Deskripsi penjelasan atau informasi pendukung record. |
| `created_at` | `timestamp` | - | YES | NULL | Waktu pertama kali record dibuat di sistem. |
| `updated_at` | `timestamp` | - | YES | NULL | Waktu terakhir record diperbarui di sistem. |

**Foreign Key Constraints:**

| Constraint Name | Kolom Sumber | Referensi Tabel | Referensi Kolom | On Delete | On Update |
|---|---|---|---|---|---|
| `komponen_biayas_program_studi_id_foreign` | `program_studi_id` | `program_studis` | `id` | `SET NULL` | `NO ACTION` |

**Daftar Index:**

| Nama Index | Tipe Index | Kolom Terlibat |
|---|---|---|
| `komponen_biayas_kode_unique` | UNIQUE INDEX | `kode` |
| `komponen_biayas_program_studi_id_foreign` | INDEX | `program_studi_id` |
| `PRIMARY` | PRIMARY KEY | `id` |

---

### 32. TABEL: `komposisi_nilais`

**Purpose / Fungsi:**  
Bobot persentase penilaian dosen per kelas kuliah (tugas, kuis, kehadiran, UTS, UAS = 100%).

**Struktur Kolom:**

| Kolom | Tipe Data | Key | Nullable | Default | Deskripsi |
|---|---|---|---|---|---|
| `id` | `bigint unsigned` | PK | NO | NULL | Primary identifier unik record (auto-incrementing bigint). |
| `kelas_kuliah_id` | `bigint unsigned` | FK | NO | NULL | Foreign key merujuk ke tabel kelas_kuliahs.id rombel perkuliahan. |
| `komponen` | `varchar(255)` | - | NO | NULL | Menyimpan data komponen pada tabel komposisi_nilais. |
| `bobot_persen` | `int` | - | NO | NULL | Menyimpan data bobot persen pada tabel komposisi_nilais. |
| `created_at` | `timestamp` | - | YES | NULL | Waktu pertama kali record dibuat di sistem. |
| `updated_at` | `timestamp` | - | YES | NULL | Waktu terakhir record diperbarui di sistem. |

**Foreign Key Constraints:**

| Constraint Name | Kolom Sumber | Referensi Tabel | Referensi Kolom | On Delete | On Update |
|---|---|---|---|---|---|
| `komposisi_nilais_kelas_kuliah_id_foreign` | `kelas_kuliah_id` | `kelas_kuliahs` | `id` | `CASCADE` | `NO ACTION` |

**Daftar Index:**

| Nama Index | Tipe Index | Kolom Terlibat |
|---|---|---|
| `komposisi_nilais_kelas_kuliah_id_foreign` | INDEX | `kelas_kuliah_id` |
| `PRIMARY` | PRIMARY KEY | `id` |

---

### 33. TABEL: `konsentrasis`

**Purpose / Fungsi:**  
Peminatan atau konsentrasi keilmuan khusus pada program studi.

**Struktur Kolom:**

| Kolom | Tipe Data | Key | Nullable | Default | Deskripsi |
|---|---|---|---|---|---|
| `id` | `bigint unsigned` | PK | NO | NULL | Primary identifier unik record (auto-incrementing bigint). |
| `program_studi_id` | `bigint unsigned` | FK | NO | NULL | Foreign key merujuk ke tabel program_studis.id terkait. |
| `nama` | `varchar(255)` | - | NO | NULL | Nama lengkap entitas terkait. |
| `created_at` | `timestamp` | - | YES | NULL | Waktu pertama kali record dibuat di sistem. |
| `updated_at` | `timestamp` | - | YES | NULL | Waktu terakhir record diperbarui di sistem. |
| `deleted_at` | `timestamp` | - | YES | NULL | Timestamp soft delete untuk pengarsipan data tanpa menghapus fisik record. |

**Foreign Key Constraints:**

| Constraint Name | Kolom Sumber | Referensi Tabel | Referensi Kolom | On Delete | On Update |
|---|---|---|---|---|---|
| `konsentrasis_program_studi_id_foreign` | `program_studi_id` | `program_studis` | `id` | `CASCADE` | `NO ACTION` |

**Daftar Index:**

| Nama Index | Tipe Index | Kolom Terlibat |
|---|---|---|
| `konsentrasis_program_studi_id_foreign` | INDEX | `program_studi_id` |
| `PRIMARY` | PRIMARY KEY | `id` |

---

### 34. TABEL: `krs`

**Purpose / Fungsi:**  
Header lembar Kartu Rencana Studi (KRS) mahasiswa per semester beserta status approval DPA.

**Struktur Kolom:**

| Kolom | Tipe Data | Key | Nullable | Default | Deskripsi |
|---|---|---|---|---|---|
| `id` | `bigint unsigned` | PK | NO | NULL | Primary identifier unik record (auto-incrementing bigint). |
| `mahasiswa_id` | `bigint unsigned` | FK | NO | NULL | Foreign key merujuk ke tabel mahasiswas.id terkait. |
| `tahun_ajaran_id` | `bigint unsigned` | FK | NO | NULL | Foreign key merujuk ke tabel tahun_ajarans.id periode akademik aktif. |
| `status` | `varchar(255)` | - | NO | `draft` | Status operasional entitas (aktif/nonaktif/draft/selesai). |
| `diajukan_at` | `timestamp` | - | YES | NULL | Menyimpan data diajukan at pada tabel krs. |
| `disetujui_at` | `timestamp` | - | YES | NULL | Menyimpan data disetujui at pada tabel krs. |
| `catatan_penolakan` | `text` | - | YES | NULL | Menyimpan data catatan penolakan pada tabel krs. |
| `created_at` | `timestamp` | - | YES | NULL | Waktu pertama kali record dibuat di sistem. |
| `updated_at` | `timestamp` | - | YES | NULL | Waktu terakhir record diperbarui di sistem. |

**Foreign Key Constraints:**

| Constraint Name | Kolom Sumber | Referensi Tabel | Referensi Kolom | On Delete | On Update |
|---|---|---|---|---|---|
| `krs_mahasiswa_id_foreign` | `mahasiswa_id` | `mahasiswas` | `id` | `CASCADE` | `NO ACTION` |
| `krs_tahun_ajaran_id_foreign` | `tahun_ajaran_id` | `tahun_ajarans` | `id` | `CASCADE` | `NO ACTION` |

**Daftar Index:**

| Nama Index | Tipe Index | Kolom Terlibat |
|---|---|---|
| `krs_mahasiswa_id_foreign` | INDEX | `mahasiswa_id` |
| `krs_tahun_ajaran_id_foreign` | INDEX | `tahun_ajaran_id` |
| `PRIMARY` | PRIMARY KEY | `id` |

---

### 35. TABEL: `krs_details`

**Purpose / Fungsi:**  
Item matakuliah dan kelas perkuliahan yang dikontrak mahasiswa di dalam lembar KRS.

**Struktur Kolom:**

| Kolom | Tipe Data | Key | Nullable | Default | Deskripsi |
|---|---|---|---|---|---|
| `id` | `bigint unsigned` | PK | NO | NULL | Primary identifier unik record (auto-incrementing bigint). |
| `krs_id` | `bigint unsigned` | FK | NO | NULL | Foreign key merujuk ke tabel krs.id lembar rencana studi. |
| `kelas_kuliah_id` | `bigint unsigned` | FK | NO | NULL | Foreign key merujuk ke tabel kelas_kuliahs.id rombel perkuliahan. |
| `created_at` | `timestamp` | - | YES | NULL | Waktu pertama kali record dibuat di sistem. |
| `updated_at` | `timestamp` | - | YES | NULL | Waktu terakhir record diperbarui di sistem. |

**Foreign Key Constraints:**

| Constraint Name | Kolom Sumber | Referensi Tabel | Referensi Kolom | On Delete | On Update |
|---|---|---|---|---|---|
| `krs_details_kelas_kuliah_id_foreign` | `kelas_kuliah_id` | `kelas_kuliahs` | `id` | `CASCADE` | `NO ACTION` |
| `krs_details_krs_id_foreign` | `krs_id` | `krs` | `id` | `CASCADE` | `NO ACTION` |

**Daftar Index:**

| Nama Index | Tipe Index | Kolom Terlibat |
|---|---|---|
| `krs_details_kelas_kuliah_id_foreign` | INDEX | `kelas_kuliah_id` |
| `krs_details_krs_id_foreign` | INDEX | `krs_id` |
| `PRIMARY` | PRIMARY KEY | `id` |

---

### 36. TABEL: `kurikulum_matakuliahs`

**Purpose / Fungsi:**  
Tabel pivot pemetaan matakuliah yang masuk dalam struktur kurikulum prodi beserta rekomendasi semester.

**Struktur Kolom:**

| Kolom | Tipe Data | Key | Nullable | Default | Deskripsi |
|---|---|---|---|---|---|
| `id` | `bigint unsigned` | PK | NO | NULL | Primary identifier unik record (auto-incrementing bigint). |
| `kurikulum_prodi_id` | `bigint unsigned` | FK | NO | NULL | Foreign key identifier relasi ke tabel kurikulum_prodis. |
| `matakuliah_id` | `bigint unsigned` | FK | NO | NULL | Foreign key merujuk ke tabel matakuliahs.id katalog matakuliah. |
| `semester` | `int` | - | NO | NULL | Tingkat semester pelaksanaan perkuliahan (semester 1 s.d. 8). |
| `created_at` | `timestamp` | - | YES | NULL | Waktu pertama kali record dibuat di sistem. |
| `updated_at` | `timestamp` | - | YES | NULL | Waktu terakhir record diperbarui di sistem. |

**Foreign Key Constraints:**

| Constraint Name | Kolom Sumber | Referensi Tabel | Referensi Kolom | On Delete | On Update |
|---|---|---|---|---|---|
| `kurikulum_matakuliahs_kurikulum_prodi_id_foreign` | `kurikulum_prodi_id` | `kurikulum_prodis` | `id` | `CASCADE` | `NO ACTION` |
| `kurikulum_matakuliahs_matakuliah_id_foreign` | `matakuliah_id` | `matakuliahs` | `id` | `CASCADE` | `NO ACTION` |

**Daftar Index:**

| Nama Index | Tipe Index | Kolom Terlibat |
|---|---|---|
| `kurikulum_matakuliahs_kurikulum_prodi_id_foreign` | INDEX | `kurikulum_prodi_id` |
| `kurikulum_matakuliahs_matakuliah_id_foreign` | INDEX | `matakuliah_id` |
| `PRIMARY` | PRIMARY KEY | `id` |

---

### 37. TABEL: `kurikulum_prodis`

**Purpose / Fungsi:**  
Struktur paket kurikulum yang berlaku pada program studi untuk angkatan tertentu.

**Struktur Kolom:**

| Kolom | Tipe Data | Key | Nullable | Default | Deskripsi |
|---|---|---|---|---|---|
| `id` | `bigint unsigned` | PK | NO | NULL | Primary identifier unik record (auto-incrementing bigint). |
| `program_studi_id` | `bigint unsigned` | FK | NO | NULL | Foreign key merujuk ke tabel program_studis.id terkait. |
| `tahun_kurikulum` | `varchar(255)` | - | NO | NULL | Menyimpan data tahun kurikulum pada tabel kurikulum_prodis. |
| `is_active` | `tinyint(1)` | - | NO | `1` | Flag penanda apakah record sedang aktif digunakan (1 = Aktif, 0 = Nonaktif). |
| `created_at` | `timestamp` | - | YES | NULL | Waktu pertama kali record dibuat di sistem. |
| `updated_at` | `timestamp` | - | YES | NULL | Waktu terakhir record diperbarui di sistem. |

**Foreign Key Constraints:**

| Constraint Name | Kolom Sumber | Referensi Tabel | Referensi Kolom | On Delete | On Update |
|---|---|---|---|---|---|
| `kurikulum_prodis_program_studi_id_foreign` | `program_studi_id` | `program_studis` | `id` | `CASCADE` | `NO ACTION` |

**Daftar Index:**

| Nama Index | Tipe Index | Kolom Terlibat |
|---|---|---|
| `kurikulum_prodis_program_studi_id_foreign` | INDEX | `program_studi_id` |
| `PRIMARY` | PRIMARY KEY | `id` |

---

### 38. TABEL: `mahasiswa_ukts`

**Purpose / Fungsi:**  
Penetapan kategori kelompok UKT individual untuk masing-masing mahasiswa selama masa studi.

**Struktur Kolom:**

| Kolom | Tipe Data | Key | Nullable | Default | Deskripsi |
|---|---|---|---|---|---|
| `id` | `bigint unsigned` | PK | NO | NULL | Primary identifier unik record (auto-incrementing bigint). |
| `mahasiswa_id` | `bigint unsigned` | FK | NO | NULL | Foreign key merujuk ke tabel mahasiswas.id terkait. |
| `kelompok_ukt_id` | `bigint unsigned` | FK | NO | NULL | Foreign key identifier relasi ke tabel kelompok_ukts. |
| `tahun_ajaran_id` | `bigint unsigned` | FK | NO | NULL | Foreign key merujuk ke tabel tahun_ajarans.id periode akademik aktif. |
| `status` | `varchar(255)` | - | NO | `aktif` | Status operasional entitas (aktif/nonaktif/draft/selesai). |
| `created_at` | `timestamp` | - | YES | NULL | Waktu pertama kali record dibuat di sistem. |
| `updated_at` | `timestamp` | - | YES | NULL | Waktu terakhir record diperbarui di sistem. |

**Foreign Key Constraints:**

| Constraint Name | Kolom Sumber | Referensi Tabel | Referensi Kolom | On Delete | On Update |
|---|---|---|---|---|---|
| `mahasiswa_ukts_kelompok_ukt_id_foreign` | `kelompok_ukt_id` | `kelompok_ukts` | `id` | `CASCADE` | `NO ACTION` |
| `mahasiswa_ukts_mahasiswa_id_foreign` | `mahasiswa_id` | `mahasiswas` | `id` | `CASCADE` | `NO ACTION` |
| `mahasiswa_ukts_tahun_ajaran_id_foreign` | `tahun_ajaran_id` | `tahun_ajarans` | `id` | `CASCADE` | `NO ACTION` |

**Daftar Index:**

| Nama Index | Tipe Index | Kolom Terlibat |
|---|---|---|
| `mahasiswa_ukts_kelompok_ukt_id_foreign` | INDEX | `kelompok_ukt_id` |
| `mahasiswa_ukts_mahasiswa_id_foreign` | INDEX | `mahasiswa_id` |
| `mahasiswa_ukts_tahun_ajaran_id_foreign` | INDEX | `tahun_ajaran_id` |
| `PRIMARY` | PRIMARY KEY | `id` |

---

### 39. TABEL: `mahasiswas`

**Purpose / Fungsi:**  
Data induk mahasiswa aktif, cuti, atau alumni (NIM, NIK, nama lengkap, prodi, angkatan, status).

**Struktur Kolom:**

| Kolom | Tipe Data | Key | Nullable | Default | Deskripsi |
|---|---|---|---|---|---|
| `id` | `bigint unsigned` | PK | NO | NULL | Primary identifier unik record (auto-incrementing bigint). |
| `user_id` | `bigint unsigned` | FK | YES | NULL | Foreign key merujuk ke tabel users.id pengelola atau pemilik akun. |
| `calon_mahasiswa_id` | `bigint unsigned` | FK | YES | NULL | Foreign key identifier relasi ke tabel calon_mahasiswas. |
| `program_studi_id` | `bigint unsigned` | FK | NO | NULL | Foreign key merujuk ke tabel program_studis.id terkait. |
| `nim` | `varchar(255)` | UNIQUE | NO | NULL | Nomor Induk Mahasiswa (NIM) resmi terdaftar. |
| `nama_lengkap` | `varchar(255)` | - | NO | NULL | Nama lengkap sesuai dokumen kependudukan resmi. |
| `nik` | `varchar(255)` | - | YES | NULL | Nomor Induk Kependudukan (KTP) 16 digit. |
| `nik_hash` | `varchar(64)` | UNIQUE | YES | NULL | Blind index hash HMAC-SHA256 untuk pencarian cepat data terenkripsi. |
| `tempat_lahir` | `varchar(255)` | - | YES | NULL | Menyimpan data tempat lahir pada tabel mahasiswas. |
| `tanggal_lahir` | `date` | - | YES | NULL | Tanggal pencatatan lahir. |
| `jenis_kelamin` | `varchar(255)` | - | YES | NULL | Menyimpan data jenis kelamin pada tabel mahasiswas. |
| `agama_referensi_biodata_id` | `bigint unsigned` | FK | YES | NULL | Foreign key identifier relasi ke tabel agama_referensi_biodatas. |
| `alamat_ktp` | `text` | - | YES | NULL | Menyimpan data alamat ktp pada tabel mahasiswas. |
| `alamat_domisili` | `text` | - | YES | NULL | Menyimpan data alamat domisili pada tabel mahasiswas. |
| `no_hp` | `varchar(255)` | - | YES | NULL | Menyimpan data no hp pada tabel mahasiswas. |
| `email_pribadi` | `varchar(255)` | - | YES | NULL | Menyimpan data email pribadi pada tabel mahasiswas. |
| `foto_path` | `varchar(255)` | - | YES | NULL | Menyimpan data foto path pada tabel mahasiswas. |
| `tahun_masuk` | `int` | - | NO | NULL | Menyimpan data tahun masuk pada tabel mahasiswas. |
| `status_mahasiswa` | `varchar(255)` | - | NO | `aktif` | Menyimpan data status mahasiswa pada tabel mahasiswas. |
| `created_at` | `timestamp` | - | YES | NULL | Waktu pertama kali record dibuat di sistem. |
| `updated_at` | `timestamp` | - | YES | NULL | Waktu terakhir record diperbarui di sistem. |
| `deleted_at` | `timestamp` | - | YES | NULL | Timestamp soft delete untuk pengarsipan data tanpa menghapus fisik record. |

**Foreign Key Constraints:**

| Constraint Name | Kolom Sumber | Referensi Tabel | Referensi Kolom | On Delete | On Update |
|---|---|---|---|---|---|
| `mahasiswas_agama_referensi_biodata_id_foreign` | `agama_referensi_biodata_id` | `referensi_biodatas` | `id` | `SET NULL` | `NO ACTION` |
| `mahasiswas_calon_mahasiswa_id_foreign` | `calon_mahasiswa_id` | `calon_mahasiswas` | `id` | `SET NULL` | `NO ACTION` |
| `mahasiswas_program_studi_id_foreign` | `program_studi_id` | `program_studis` | `id` | `NO ACTION` | `NO ACTION` |
| `mahasiswas_user_id_foreign` | `user_id` | `users` | `id` | `SET NULL` | `NO ACTION` |

**Daftar Index:**

| Nama Index | Tipe Index | Kolom Terlibat |
|---|---|---|
| `mahasiswas_agama_referensi_biodata_id_foreign` | INDEX | `agama_referensi_biodata_id` |
| `mahasiswas_calon_mahasiswa_id_foreign` | INDEX | `calon_mahasiswa_id` |
| `mahasiswas_nik_hash_unique` | UNIQUE INDEX | `nik_hash` |
| `mahasiswas_nim_unique` | UNIQUE INDEX | `nim` |
| `mahasiswas_program_studi_id_foreign` | INDEX | `program_studi_id` |
| `mahasiswas_user_id_foreign` | INDEX | `user_id` |
| `PRIMARY` | PRIMARY KEY | `id` |

---

### 40. TABEL: `matakuliahs`

**Purpose / Fungsi:**  
Katalog matakuliah institusi (kode MK, nama MK, SKS teori/praktek, jenis wajib/pilihan).

**Struktur Kolom:**

| Kolom | Tipe Data | Key | Nullable | Default | Deskripsi |
|---|---|---|---|---|---|
| `id` | `bigint unsigned` | PK | NO | NULL | Primary identifier unik record (auto-incrementing bigint). |
| `kode` | `varchar(255)` | UNIQUE | NO | NULL | Menyimpan data kode pada tabel matakuliahs. |
| `nama` | `varchar(255)` | - | NO | NULL | Nama lengkap entitas terkait. |
| `sks` | `int` | - | NO | NULL | Bobot Satuan Kredit Semester (SKS). |
| `jenis` | `varchar(255)` | - | NO | `wajib` | Menyimpan data jenis pada tabel matakuliahs. |
| `bidang_ilmu_id` | `bigint unsigned` | FK | YES | NULL | Foreign key identifier relasi ke tabel bidang_ilmus. |
| `created_at` | `timestamp` | - | YES | NULL | Waktu pertama kali record dibuat di sistem. |
| `updated_at` | `timestamp` | - | YES | NULL | Waktu terakhir record diperbarui di sistem. |
| `deleted_at` | `timestamp` | - | YES | NULL | Timestamp soft delete untuk pengarsipan data tanpa menghapus fisik record. |

**Foreign Key Constraints:**

| Constraint Name | Kolom Sumber | Referensi Tabel | Referensi Kolom | On Delete | On Update |
|---|---|---|---|---|---|
| `matakuliahs_bidang_ilmu_id_foreign` | `bidang_ilmu_id` | `referensi_biodatas` | `id` | `SET NULL` | `NO ACTION` |

**Daftar Index:**

| Nama Index | Tipe Index | Kolom Terlibat |
|---|---|---|
| `matakuliahs_bidang_ilmu_id_foreign` | INDEX | `bidang_ilmu_id` |
| `matakuliahs_kode_unique` | UNIQUE INDEX | `kode` |
| `PRIMARY` | PRIMARY KEY | `id` |

---

### 41. TABEL: `migrations`

**Purpose / Fungsi:**  
Pencatatan riwayat berkas migrasi database yang telah dieksekusi oleh Laravel Artisan.

**Struktur Kolom:**

| Kolom | Tipe Data | Key | Nullable | Default | Deskripsi |
|---|---|---|---|---|---|
| `id` | `int unsigned` | PK | NO | NULL | Primary identifier unik record (auto-incrementing bigint). |
| `migration` | `varchar(255)` | - | NO | NULL | Menyimpan data migration pada tabel migrations. |
| `batch` | `int` | - | NO | NULL | Menyimpan data batch pada tabel migrations. |

**Daftar Index:**

| Nama Index | Tipe Index | Kolom Terlibat |
|---|---|---|
| `PRIMARY` | PRIMARY KEY | `id` |

---

### 42. TABEL: `model_has_permissions`

**Purpose / Fungsi:**  
Tabel pivot penghubung polymorphic antara user/model dengan hak akses khusus (permissions).

**Struktur Kolom:**

| Kolom | Tipe Data | Key | Nullable | Default | Deskripsi |
|---|---|---|---|---|---|
| `permission_id` | `bigint unsigned` | PK, FK | NO | NULL | Foreign key identifier relasi ke tabel permissions. |
| `model_type` | `varchar(255)` | PK | NO | NULL | Menyimpan data model type pada tabel model_has_permissions. |
| `model_id` | `bigint unsigned` | PK | NO | NULL | Foreign key identifier relasi ke tabel models. |

**Foreign Key Constraints:**

| Constraint Name | Kolom Sumber | Referensi Tabel | Referensi Kolom | On Delete | On Update |
|---|---|---|---|---|---|
| `model_has_permissions_permission_id_foreign` | `permission_id` | `permissions` | `id` | `CASCADE` | `NO ACTION` |

**Daftar Index:**

| Nama Index | Tipe Index | Kolom Terlibat |
|---|---|---|
| `model_has_permissions_model_id_model_type_index` | INDEX | `model_id`, `model_type` |
| `PRIMARY` | PRIMARY KEY | `permission_id`, `model_id`, `model_type` |

---

### 43. TABEL: `model_has_roles`

**Purpose / Fungsi:**  
Tabel pivot penghubung polymorphic antara user/model dengan peran (roles) yang diemban.

**Struktur Kolom:**

| Kolom | Tipe Data | Key | Nullable | Default | Deskripsi |
|---|---|---|---|---|---|
| `role_id` | `bigint unsigned` | PK, FK | NO | NULL | Foreign key identifier relasi ke tabel roles. |
| `model_type` | `varchar(255)` | PK | NO | NULL | Menyimpan data model type pada tabel model_has_roles. |
| `model_id` | `bigint unsigned` | PK | NO | NULL | Foreign key identifier relasi ke tabel models. |

**Foreign Key Constraints:**

| Constraint Name | Kolom Sumber | Referensi Tabel | Referensi Kolom | On Delete | On Update |
|---|---|---|---|---|---|
| `model_has_roles_role_id_foreign` | `role_id` | `roles` | `id` | `CASCADE` | `NO ACTION` |

**Daftar Index:**

| Nama Index | Tipe Index | Kolom Terlibat |
|---|---|---|
| `model_has_roles_model_id_model_type_index` | INDEX | `model_id`, `model_type` |
| `PRIMARY` | PRIMARY KEY | `role_id`, `model_id`, `model_type` |

---

### 44. TABEL: `nilais`

**Purpose / Fungsi:**  
Nilai akhir matakuliah mahasiswa per item KRS (angka mutu, huruf mutu, nilai indeks, status kelulusan).

**Struktur Kolom:**

| Kolom | Tipe Data | Key | Nullable | Default | Deskripsi |
|---|---|---|---|---|---|
| `id` | `bigint unsigned` | PK | NO | NULL | Primary identifier unik record (auto-incrementing bigint). |
| `krs_detail_id` | `bigint unsigned` | FK | NO | NULL | Foreign key merujuk ke tabel krs_details.id kontrak matakuliah. |
| `komponen` | `varchar(255)` | - | NO | NULL | Menyimpan data komponen pada tabel nilais. |
| `nilai_angka` | `decimal(5,2)` | - | NO | NULL | Menyimpan data nilai angka pada tabel nilais. |
| `nilai_huruf` | `varchar(255)` | - | YES | NULL | Huruf mutu hasil evaluasi akademik (A, B+, B, C+, C, D, E). |
| `is_final` | `tinyint(1)` | - | NO | `0` | Flag boolean kondisi (1 = True / Ya, 0 = False / Tidak). |
| `created_at` | `timestamp` | - | YES | NULL | Waktu pertama kali record dibuat di sistem. |
| `updated_at` | `timestamp` | - | YES | NULL | Waktu terakhir record diperbarui di sistem. |

**Foreign Key Constraints:**

| Constraint Name | Kolom Sumber | Referensi Tabel | Referensi Kolom | On Delete | On Update |
|---|---|---|---|---|---|
| `nilais_krs_detail_id_foreign` | `krs_detail_id` | `krs_details` | `id` | `CASCADE` | `NO ACTION` |

**Daftar Index:**

| Nama Index | Tipe Index | Kolom Terlibat |
|---|---|---|
| `nilais_krs_detail_id_foreign` | INDEX | `krs_detail_id` |
| `PRIMARY` | PRIMARY KEY | `id` |

---

### 45. TABEL: `notifications`

**Purpose / Fungsi:**  
Penyimpanan notifikasi sistem in-app untuk pengguna (pengumuman, status KRS, tagihan).

**Struktur Kolom:**

| Kolom | Tipe Data | Key | Nullable | Default | Deskripsi |
|---|---|---|---|---|---|
| `id` | `char(36)` | PK | NO | NULL | Primary identifier unik record (auto-incrementing bigint). |
| `type` | `varchar(255)` | - | NO | NULL | Menyimpan data type pada tabel notifications. |
| `notifiable_type` | `varchar(255)` | - | NO | NULL | Menyimpan data notifiable type pada tabel notifications. |
| `notifiable_id` | `bigint unsigned` | - | NO | NULL | Foreign key identifier relasi ke tabel notifiables. |
| `data` | `text` | - | NO | NULL | Menyimpan data data pada tabel notifications. |
| `read_at` | `timestamp` | - | YES | NULL | Menyimpan data read at pada tabel notifications. |
| `created_at` | `timestamp` | - | YES | NULL | Waktu pertama kali record dibuat di sistem. |
| `updated_at` | `timestamp` | - | YES | NULL | Waktu terakhir record diperbarui di sistem. |

**Daftar Index:**

| Nama Index | Tipe Index | Kolom Terlibat |
|---|---|---|
| `notifications_notifiable_type_notifiable_id_index` | INDEX | `notifiable_type`, `notifiable_id` |
| `PRIMARY` | PRIMARY KEY | `id` |

---

### 46. TABEL: `password_reset_tokens`

**Purpose / Fungsi:**  
Penyimpanan token sementara untuk proses pemulihan atau reset kata sandi pengguna.

**Struktur Kolom:**

| Kolom | Tipe Data | Key | Nullable | Default | Deskripsi |
|---|---|---|---|---|---|
| `email` | `varchar(255)` | PK | NO | NULL | Alamat surel resmi untuk komunikasi dan login. |
| `token` | `varchar(255)` | - | NO | NULL | Menyimpan data token pada tabel password_reset_tokens. |
| `created_at` | `timestamp` | - | YES | NULL | Waktu pertama kali record dibuat di sistem. |

**Daftar Index:**

| Nama Index | Tipe Index | Kolom Terlibat |
|---|---|---|
| `PRIMARY` | PRIMARY KEY | `email` |

---

### 47. TABEL: `pddikti_mappings`

**Purpose / Fungsi:**  
Tabel pemetaan ID lokal database SIAKAD dengan UUID entitas server Neo Feeder PD-DIKTI.

**Struktur Kolom:**

| Kolom | Tipe Data | Key | Nullable | Default | Deskripsi |
|---|---|---|---|---|---|
| `id` | `bigint unsigned` | PK | NO | NULL | Primary identifier unik record (auto-incrementing bigint). |
| `local_table` | `varchar(255)` | - | NO | NULL | Menyimpan data local table pada tabel pddikti_mappings. |
| `local_id` | `bigint unsigned` | - | NO | NULL | Foreign key identifier relasi ke tabel locals. |
| `pddikti_table` | `varchar(255)` | - | NO | NULL | Menyimpan data pddikti table pada tabel pddikti_mappings. |
| `pddikti_id` | `varchar(255)` | - | NO | NULL | Foreign key identifier relasi ke tabel pddiktis. |
| `created_at` | `timestamp` | - | YES | NULL | Waktu pertama kali record dibuat di sistem. |
| `updated_at` | `timestamp` | - | YES | NULL | Waktu terakhir record diperbarui di sistem. |

**Daftar Index:**

| Nama Index | Tipe Index | Kolom Terlibat |
|---|---|---|
| `PRIMARY` | PRIMARY KEY | `id` |

---

### 48. TABEL: `pddikti_sync_logs`

**Purpose / Fungsi:**  
Catatan log riwayat sinkronisasi data batch ke server Neo Feeder PD-DIKTI kementerian.

**Struktur Kolom:**

| Kolom | Tipe Data | Key | Nullable | Default | Deskripsi |
|---|---|---|---|---|---|
| `id` | `bigint unsigned` | PK | NO | NULL | Primary identifier unik record (auto-incrementing bigint). |
| `table_name` | `varchar(255)` | - | NO | NULL | Menyimpan data table name pada tabel pddikti_sync_logs. |
| `record_id` | `bigint unsigned` | - | NO | NULL | Foreign key identifier relasi ke tabel records. |
| `action` | `varchar(255)` | - | NO | NULL | Menyimpan data action pada tabel pddikti_sync_logs. |
| `status` | `varchar(255)` | - | NO | NULL | Status operasional entitas (aktif/nonaktif/draft/selesai). |
| `pddikti_id` | `varchar(255)` | - | YES | NULL | Foreign key identifier relasi ke tabel pddiktis. |
| `error_message` | `text` | - | YES | NULL | Menyimpan data error message pada tabel pddikti_sync_logs. |
| `synced_at` | `timestamp` | - | YES | NULL | Menyimpan data synced at pada tabel pddikti_sync_logs. |
| `created_at` | `timestamp` | - | YES | NULL | Waktu pertama kali record dibuat di sistem. |
| `updated_at` | `timestamp` | - | YES | NULL | Waktu terakhir record diperbarui di sistem. |

**Daftar Index:**

| Nama Index | Tipe Index | Kolom Terlibat |
|---|---|---|
| `PRIMARY` | PRIMARY KEY | `id` |

---

### 49. TABEL: `pegawais`

**Purpose / Fungsi:**  
Data induk staf kependidikan dan pegawai administratif kampus.

**Struktur Kolom:**

| Kolom | Tipe Data | Key | Nullable | Default | Deskripsi |
|---|---|---|---|---|---|
| `id` | `bigint unsigned` | PK | NO | NULL | Primary identifier unik record (auto-incrementing bigint). |
| `user_id` | `bigint unsigned` | FK | YES | NULL | Foreign key merujuk ke tabel users.id pengelola atau pemilik akun. |
| `unit_kerja_id` | `bigint unsigned` | FK | YES | NULL | Foreign key identifier relasi ke tabel unit_kerjas. |
| `nip_internal` | `varchar(255)` | - | YES | NULL | Menyimpan data nip internal pada tabel pegawais. |
| `nip_hash` | `varchar(64)` | UNIQUE | YES | NULL | Blind index hash HMAC-SHA256 untuk pencarian cepat data terenkripsi. |
| `nama_lengkap` | `varchar(255)` | - | NO | NULL | Nama lengkap sesuai dokumen kependudukan resmi. |
| `nik` | `varchar(255)` | - | YES | NULL | Nomor Induk Kependudukan (KTP) 16 digit. |
| `nik_hash` | `varchar(64)` | UNIQUE | YES | NULL | Blind index hash HMAC-SHA256 untuk pencarian cepat data terenkripsi. |
| `tanggal_lahir` | `date` | - | YES | NULL | Tanggal pencatatan lahir. |
| `jenis_kelamin` | `varchar(255)` | - | YES | NULL | Menyimpan data jenis kelamin pada tabel pegawais. |
| `alamat` | `text` | - | YES | NULL | Menyimpan data alamat pada tabel pegawais. |
| `no_hp` | `varchar(255)` | - | YES | NULL | Menyimpan data no hp pada tabel pegawais. |
| `jabatan_struktural` | `varchar(255)` | - | YES | NULL | Menyimpan data jabatan struktural pada tabel pegawais. |
| `status_kepegawaian` | `varchar(255)` | - | NO | `tetap` | Menyimpan data status kepegawaian pada tabel pegawais. |
| `foto_path` | `varchar(255)` | - | YES | NULL | Menyimpan data foto path pada tabel pegawais. |
| `created_at` | `timestamp` | - | YES | NULL | Waktu pertama kali record dibuat di sistem. |
| `updated_at` | `timestamp` | - | YES | NULL | Waktu terakhir record diperbarui di sistem. |
| `deleted_at` | `timestamp` | - | YES | NULL | Timestamp soft delete untuk pengarsipan data tanpa menghapus fisik record. |

**Foreign Key Constraints:**

| Constraint Name | Kolom Sumber | Referensi Tabel | Referensi Kolom | On Delete | On Update |
|---|---|---|---|---|---|
| `pegawais_unit_kerja_id_foreign` | `unit_kerja_id` | `unit_kerjas` | `id` | `SET NULL` | `NO ACTION` |
| `pegawais_user_id_foreign` | `user_id` | `users` | `id` | `SET NULL` | `NO ACTION` |

**Daftar Index:**

| Nama Index | Tipe Index | Kolom Terlibat |
|---|---|---|
| `pegawais_nik_hash_unique` | UNIQUE INDEX | `nik_hash` |
| `pegawais_nip_hash_unique` | UNIQUE INDEX | `nip_hash` |
| `pegawais_unit_kerja_id_foreign` | INDEX | `unit_kerja_id` |
| `pegawais_user_id_foreign` | INDEX | `user_id` |
| `PRIMARY` | PRIMARY KEY | `id` |

---

### 50. TABEL: `pelanggaran_mahasiswas`

**Purpose / Fungsi:**  
Pencatatan pelanggaran tata tertib kampus, poin sanksi, dan tindakan disiplin kemahasiswaan.

**Struktur Kolom:**

| Kolom | Tipe Data | Key | Nullable | Default | Deskripsi |
|---|---|---|---|---|---|
| `id` | `bigint unsigned` | PK | NO | NULL | Primary identifier unik record (auto-incrementing bigint). |
| `mahasiswa_id` | `bigint unsigned` | FK | NO | NULL | Foreign key merujuk ke tabel mahasiswas.id terkait. |
| `jenis_pelanggaran_id` | `bigint unsigned` | FK | YES | NULL | Foreign key identifier relasi ke tabel jenis_pelanggarans. |
| `sanksi_id` | `bigint unsigned` | FK | YES | NULL | Foreign key identifier relasi ke tabel sanksis. |
| `tanggal` | `date` | - | NO | NULL | Tanggal kalender pelaksanaan kegiatan. |
| `created_at` | `timestamp` | - | YES | NULL | Waktu pertama kali record dibuat di sistem. |
| `updated_at` | `timestamp` | - | YES | NULL | Waktu terakhir record diperbarui di sistem. |

**Foreign Key Constraints:**

| Constraint Name | Kolom Sumber | Referensi Tabel | Referensi Kolom | On Delete | On Update |
|---|---|---|---|---|---|
| `pelanggaran_mahasiswas_jenis_pelanggaran_id_foreign` | `jenis_pelanggaran_id` | `referensi_biodatas` | `id` | `SET NULL` | `NO ACTION` |
| `pelanggaran_mahasiswas_mahasiswa_id_foreign` | `mahasiswa_id` | `mahasiswas` | `id` | `CASCADE` | `NO ACTION` |
| `pelanggaran_mahasiswas_sanksi_id_foreign` | `sanksi_id` | `referensi_biodatas` | `id` | `SET NULL` | `NO ACTION` |

**Daftar Index:**

| Nama Index | Tipe Index | Kolom Terlibat |
|---|---|---|
| `pelanggaran_mahasiswas_jenis_pelanggaran_id_foreign` | INDEX | `jenis_pelanggaran_id` |
| `pelanggaran_mahasiswas_mahasiswa_id_foreign` | INDEX | `mahasiswa_id` |
| `pelanggaran_mahasiswas_sanksi_id_foreign` | INDEX | `sanksi_id` |
| `PRIMARY` | PRIMARY KEY | `id` |

---

### 51. TABEL: `pembayarans`

**Purpose / Fungsi:**  
Transaksi riil pembayaran yang masuk via Kasir POS Loket TU atau verifikasi mutasi transfer bank.

**Struktur Kolom:**

| Kolom | Tipe Data | Key | Nullable | Default | Deskripsi |
|---|---|---|---|---|---|
| `id` | `bigint unsigned` | PK | NO | NULL | Primary identifier unik record (auto-incrementing bigint). |
| `tagihan_id` | `bigint unsigned` | FK | NO | NULL | Foreign key merujuk ke tabel tagihans.id invoice keuangan. |
| `tanggal_bayar` | `date` | - | NO | NULL | Tanggal pencatatan bayar. |
| `nominal_dibayar` | `decimal(12,2)` | - | NO | NULL | Menyimpan data nominal dibayar pada tabel pembayarans. |
| `metode` | `varchar(255)` | - | NO | `transfer_manual` | Menyimpan data metode pada tabel pembayarans. |
| `bukti_file_path` | `varchar(255)` | - | YES | NULL | Menyimpan data bukti file path pada tabel pembayarans. |
| `status_verifikasi` | `varchar(255)` | - | NO | `menunggu` | Menyimpan data status verifikasi pada tabel pembayarans. |
| `diverifikasi_oleh_user_id` | `bigint unsigned` | FK | YES | NULL | Foreign key identifier relasi ke tabel diverifikasi_oleh_users. |
| `diverifikasi_at` | `timestamp` | - | YES | NULL | Menyimpan data diverifikasi at pada tabel pembayarans. |
| `created_at` | `timestamp` | - | YES | NULL | Waktu pertama kali record dibuat di sistem. |
| `updated_at` | `timestamp` | - | YES | NULL | Waktu terakhir record diperbarui di sistem. |
| `deleted_at` | `timestamp` | - | YES | NULL | Timestamp soft delete untuk pengarsipan data tanpa menghapus fisik record. |

**Foreign Key Constraints:**

| Constraint Name | Kolom Sumber | Referensi Tabel | Referensi Kolom | On Delete | On Update |
|---|---|---|---|---|---|
| `pembayarans_diverifikasi_oleh_user_id_foreign` | `diverifikasi_oleh_user_id` | `users` | `id` | `SET NULL` | `NO ACTION` |
| `pembayarans_tagihan_id_foreign` | `tagihan_id` | `tagihans` | `id` | `CASCADE` | `NO ACTION` |

**Daftar Index:**

| Nama Index | Tipe Index | Kolom Terlibat |
|---|---|---|
| `pembayarans_diverifikasi_oleh_user_id_foreign` | INDEX | `diverifikasi_oleh_user_id` |
| `pembayarans_tagihan_id_foreign` | INDEX | `tagihan_id` |
| `PRIMARY` | PRIMARY KEY | `id` |

---

### 52. TABEL: `perguruan_tinggis`

**Purpose / Fungsi:**  
Profil institusi induk kampus STAI Al-Yasini (identitas, SK pendirian, kontak, akreditasi).

**Struktur Kolom:**

| Kolom | Tipe Data | Key | Nullable | Default | Deskripsi |
|---|---|---|---|---|---|
| `id` | `bigint unsigned` | PK | NO | NULL | Primary identifier unik record (auto-incrementing bigint). |
| `kode_unit` | `varchar(255)` | - | NO | `213048` | Kode alfanumerik standar unit. |
| `nama_unit` | `varchar(255)` | - | NO | `STAI Al-Yasini Pasuruan` | Menyimpan data nama unit pada tabel perguruan_tinggis. |
| `nama_unit_en` | `varchar(255)` | - | YES | `STAI Al-Yasini Pasuruan` | Menyimpan data nama unit en pada tabel perguruan_tinggis. |
| `nama_singkat` | `varchar(255)` | - | YES | `STAI Al-Yasini` | Menyimpan data nama singkat pada tabel perguruan_tinggis. |
| `jenis_perguruan_tinggi` | `varchar(255)` | - | NO | `Sekolah Tinggi` | Menyimpan data jenis perguruan tinggi pada tabel perguruan_tinggis. |
| `lembaga_naungan` | `varchar(255)` | - | NO | `PTA Islam Swasta` | Menyimpan data lembaga naungan pada tabel perguruan_tinggis. |
| `periode_berdiri` | `varchar(255)` | - | YES | NULL | Menyimpan data periode berdiri pada tabel perguruan_tinggis. |
| `no_sk_pendirian` | `varchar(255)` | - | YES | `Dj.I/149/2012` | Menyimpan data no sk pendirian pada tabel perguruan_tinggis. |
| `tanggal_sk_pendirian` | `date` | - | YES | `2012-01-27` | Tanggal pencatatan sk pendirian. |
| `ketua_nama` | `varchar(255)` | - | YES | `Dr. Akh. Syamsul Muniri, M.S.I` | Menyimpan data ketua nama pada tabel perguruan_tinggis. |
| `ketua_nidn` | `varchar(255)` | - | YES | `2113058301` | Menyimpan data ketua nidn pada tabel perguruan_tinggis. |
| `wakil_ketua_1` | `varchar(255)` | - | YES | `2104118501 - Dr. Mohamad Mishbahuddin, M.Pd.I` | Menyimpan data wakil ketua 1 pada tabel perguruan_tinggis. |
| `wakil_ketua_2` | `varchar(255)` | - | YES | `LB002 - Muhammad Sholeh, M.Pd` | Menyimpan data wakil ketua 2 pada tabel perguruan_tinggis. |
| `wakil_ketua_3` | `varchar(255)` | - | YES | NULL | Menyimpan data wakil ketua 3 pada tabel perguruan_tinggis. |
| `wakil_ketua_4` | `varchar(255)` | - | YES | NULL | Menyimpan data wakil ketua 4 pada tabel perguruan_tinggis. |
| `lembaga_akreditasi` | `varchar(255)` | - | NO | `BAN-PT` | Menyimpan data lembaga akreditasi pada tabel perguruan_tinggis. |
| `peringkat_akreditasi` | `varchar(255)` | - | NO | `Baik` | Menyimpan data peringkat akreditasi pada tabel perguruan_tinggis. |
| `nilai_akreditasi` | `varchar(255)` | - | YES | NULL | Menyimpan data nilai akreditasi pada tabel perguruan_tinggis. |
| `no_sk_akreditasi` | `varchar(255)` | - | YES | `481/SK/BAN-PT/Ak/PT/VIII/2022` | Menyimpan data no sk akreditasi pada tabel perguruan_tinggis. |
| `tanggal_sk_akreditasi` | `date` | - | YES | `2022-08-30` | Tanggal pencatatan sk akreditasi. |
| `tanggal_berlaku_akreditasi` | `date` | - | YES | `2022-08-30` | Tanggal pencatatan berlaku akreditasi. |
| `tanggal_berakhir_akreditasi` | `date` | - | YES | `2027-08-30` | Tanggal pencatatan berakhir akreditasi. |
| `file_sertifikat_akreditasi` | `varchar(255)` | - | YES | NULL | Menyimpan data file sertifikat akreditasi pada tabel perguruan_tinggis. |
| `visi` | `text` | - | YES | NULL | Menyimpan data visi pada tabel perguruan_tinggis. |
| `misi` | `text` | - | YES | NULL | Menyimpan data misi pada tabel perguruan_tinggis. |
| `alamat` | `varchar(255)` | - | NO | `Jl. Pesantren Terpadu Al-Yasini Kec. Wonorejo Kab. Pasuruan 67173` | Menyimpan data alamat pada tabel perguruan_tinggis. |
| `telepon` | `varchar(255)` | - | YES | `081333220202` | Menyimpan data telepon pada tabel perguruan_tinggis. |
| `email` | `varchar(255)` | - | YES | `info@stai-alyasini.ac.id` | Alamat surel resmi untuk komunikasi dan login. |
| `website` | `varchar(255)` | - | YES | `https://www.stai-alyasini.ac.id` | Menyimpan data website pada tabel perguruan_tinggis. |
| `fax` | `varchar(255)` | - | YES | NULL | Menyimpan data fax pada tabel perguruan_tinggis. |
| `created_at` | `timestamp` | - | YES | NULL | Waktu pertama kali record dibuat di sistem. |
| `updated_at` | `timestamp` | - | YES | NULL | Waktu terakhir record diperbarui di sistem. |

**Daftar Index:**

| Nama Index | Tipe Index | Kolom Terlibat |
|---|---|---|
| `PRIMARY` | PRIMARY KEY | `id` |

---

### 53. TABEL: `periode_registrasis`

**Purpose / Fungsi:**  
Periode her-registrasi atau daftar ulang calon mahasiswa yang dinyatakan lulus seleksi PMB.

**Struktur Kolom:**

| Kolom | Tipe Data | Key | Nullable | Default | Deskripsi |
|---|---|---|---|---|---|
| `id` | `bigint unsigned` | PK | NO | NULL | Primary identifier unik record (auto-incrementing bigint). |
| `tahun_ajaran_id` | `bigint unsigned` | FK | NO | NULL | Foreign key merujuk ke tabel tahun_ajarans.id periode akademik aktif. |
| `jenis` | `varchar(255)` | - | NO | NULL | Menyimpan data jenis pada tabel periode_registrasis. |
| `mulai` | `date` | - | NO | NULL | Menyimpan data mulai pada tabel periode_registrasis. |
| `selesai` | `date` | - | NO | NULL | Menyimpan data selesai pada tabel periode_registrasis. |
| `created_at` | `timestamp` | - | YES | NULL | Waktu pertama kali record dibuat di sistem. |
| `updated_at` | `timestamp` | - | YES | NULL | Waktu terakhir record diperbarui di sistem. |

**Foreign Key Constraints:**

| Constraint Name | Kolom Sumber | Referensi Tabel | Referensi Kolom | On Delete | On Update |
|---|---|---|---|---|---|
| `periode_registrasis_tahun_ajaran_id_foreign` | `tahun_ajaran_id` | `tahun_ajarans` | `id` | `CASCADE` | `NO ACTION` |

**Daftar Index:**

| Nama Index | Tipe Index | Kolom Terlibat |
|---|---|---|
| `periode_registrasis_tahun_ajaran_id_foreign` | INDEX | `tahun_ajaran_id` |
| `PRIMARY` | PRIMARY KEY | `id` |

---

### 54. TABEL: `periode_wisudas`

**Purpose / Fungsi:**  
Jadwal upacara wisuda sarjana kampus, batas pendaftaran, dan kuota wisudawan.

**Struktur Kolom:**

| Kolom | Tipe Data | Key | Nullable | Default | Deskripsi |
|---|---|---|---|---|---|
| `id` | `bigint unsigned` | PK | NO | NULL | Primary identifier unik record (auto-incrementing bigint). |
| `nama` | `varchar(255)` | - | NO | NULL | Nama lengkap entitas terkait. |
| `tanggal_wisuda` | `date` | - | NO | NULL | Tanggal pencatatan wisuda. |
| `created_at` | `timestamp` | - | YES | NULL | Waktu pertama kali record dibuat di sistem. |
| `updated_at` | `timestamp` | - | YES | NULL | Waktu terakhir record diperbarui di sistem. |

**Daftar Index:**

| Nama Index | Tipe Index | Kolom Terlibat |
|---|---|---|
| `PRIMARY` | PRIMARY KEY | `id` |

---

### 55. TABEL: `permissions`

**Purpose / Fungsi:**  
Daftar hak akses granular (Spatie RBAC) yang dapat diberikan ke role atau pengguna langsung.

**Struktur Kolom:**

| Kolom | Tipe Data | Key | Nullable | Default | Deskripsi |
|---|---|---|---|---|---|
| `id` | `bigint unsigned` | PK | NO | NULL | Primary identifier unik record (auto-incrementing bigint). |
| `name` | `varchar(255)` | - | NO | NULL | Menyimpan data name pada tabel permissions. |
| `guard_name` | `varchar(255)` | - | NO | NULL | Menyimpan data guard name pada tabel permissions. |
| `created_at` | `timestamp` | - | YES | NULL | Waktu pertama kali record dibuat di sistem. |
| `updated_at` | `timestamp` | - | YES | NULL | Waktu terakhir record diperbarui di sistem. |

**Daftar Index:**

| Nama Index | Tipe Index | Kolom Terlibat |
|---|---|---|
| `permissions_name_guard_name_unique` | UNIQUE INDEX | `name`, `guard_name` |
| `PRIMARY` | PRIMARY KEY | `id` |

---

### 56. TABEL: `prasyarat_matakuliahs`

**Purpose / Fungsi:**  
Daftar syarat kelulusan/pengambilan matakuliah prasyarat sebelum mengambil matakuliah tertentu.

**Struktur Kolom:**

| Kolom | Tipe Data | Key | Nullable | Default | Deskripsi |
|---|---|---|---|---|---|
| `id` | `bigint unsigned` | PK | NO | NULL | Primary identifier unik record (auto-incrementing bigint). |
| `matakuliah_id` | `bigint unsigned` | FK | NO | NULL | Foreign key merujuk ke tabel matakuliahs.id katalog matakuliah. |
| `matakuliah_prasyarat_id` | `bigint unsigned` | FK | NO | NULL | Foreign key identifier relasi ke tabel matakuliah_prasyarats. |
| `minimal_nilai` | `varchar(255)` | - | NO | `D` | Menyimpan data minimal nilai pada tabel prasyarat_matakuliahs. |
| `created_at` | `timestamp` | - | YES | NULL | Waktu pertama kali record dibuat di sistem. |
| `updated_at` | `timestamp` | - | YES | NULL | Waktu terakhir record diperbarui di sistem. |

**Foreign Key Constraints:**

| Constraint Name | Kolom Sumber | Referensi Tabel | Referensi Kolom | On Delete | On Update |
|---|---|---|---|---|---|
| `prasyarat_matakuliahs_matakuliah_id_foreign` | `matakuliah_id` | `matakuliahs` | `id` | `CASCADE` | `NO ACTION` |
| `prasyarat_matakuliahs_matakuliah_prasyarat_id_foreign` | `matakuliah_prasyarat_id` | `matakuliahs` | `id` | `CASCADE` | `NO ACTION` |

**Daftar Index:**

| Nama Index | Tipe Index | Kolom Terlibat |
|---|---|---|
| `prasyarat_matakuliahs_matakuliah_id_foreign` | INDEX | `matakuliah_id` |
| `prasyarat_matakuliahs_matakuliah_prasyarat_id_foreign` | INDEX | `matakuliah_prasyarat_id` |
| `PRIMARY` | PRIMARY KEY | `id` |

---

### 57. TABEL: `presensis`

**Purpose / Fungsi:**  
Catatan kehadiran presensi mahasiswa (Hadir, Izin, Sakit, Alpa) pada tiap pertemuan perkuliahan.

**Struktur Kolom:**

| Kolom | Tipe Data | Key | Nullable | Default | Deskripsi |
|---|---|---|---|---|---|
| `id` | `bigint unsigned` | PK | NO | NULL | Primary identifier unik record (auto-incrementing bigint). |
| `jurnal_perkuliahan_id` | `bigint unsigned` | FK | NO | NULL | Foreign key identifier relasi ke tabel jurnal_perkuliahans. |
| `mahasiswa_id` | `bigint unsigned` | FK | NO | NULL | Foreign key merujuk ke tabel mahasiswas.id terkait. |
| `status` | `varchar(255)` | - | NO | NULL | Status operasional entitas (aktif/nonaktif/draft/selesai). |
| `created_at` | `timestamp` | - | YES | NULL | Waktu pertama kali record dibuat di sistem. |
| `updated_at` | `timestamp` | - | YES | NULL | Waktu terakhir record diperbarui di sistem. |

**Foreign Key Constraints:**

| Constraint Name | Kolom Sumber | Referensi Tabel | Referensi Kolom | On Delete | On Update |
|---|---|---|---|---|---|
| `presensis_jurnal_perkuliahan_id_foreign` | `jurnal_perkuliahan_id` | `jurnal_perkuliahans` | `id` | `CASCADE` | `NO ACTION` |
| `presensis_mahasiswa_id_foreign` | `mahasiswa_id` | `mahasiswas` | `id` | `CASCADE` | `NO ACTION` |

**Daftar Index:**

| Nama Index | Tipe Index | Kolom Terlibat |
|---|---|---|
| `presensis_jurnal_perkuliahan_id_foreign` | INDEX | `jurnal_perkuliahan_id` |
| `presensis_mahasiswa_id_foreign` | INDEX | `mahasiswa_id` |
| `PRIMARY` | PRIMARY KEY | `id` |

---

### 58. TABEL: `program_studis`

**Purpose / Fungsi:**  
Data master program studi (kode prodi, nama, jenjang S1, kaprodi, akreditasi BAN-PT/LAMEMBA).

**Struktur Kolom:**

| Kolom | Tipe Data | Key | Nullable | Default | Deskripsi |
|---|---|---|---|---|---|
| `id` | `bigint unsigned` | PK | NO | NULL | Primary identifier unik record (auto-incrementing bigint). |
| `fakultas_id` | `bigint unsigned` | FK | NO | NULL | Foreign key merujuk ke tabel fakultas.id terkait. |
| `kode` | `varchar(255)` | UNIQUE | NO | NULL | Menyimpan data kode pada tabel program_studis. |
| `nama` | `varchar(255)` | - | NO | NULL | Nama lengkap entitas terkait. |
| `nama_en` | `varchar(255)` | - | YES | NULL | Menyimpan data nama en pada tabel program_studis. |
| `nama_singkat` | `varchar(255)` | - | YES | NULL | Menyimpan data nama singkat pada tabel program_studis. |
| `periode_berdiri` | `varchar(255)` | - | YES | NULL | Menyimpan data periode berdiri pada tabel program_studis. |
| `jenjang` | `varchar(255)` | - | NO | NULL | Menyimpan data jenjang pada tabel program_studis. |
| `gelar` | `varchar(255)` | - | YES | NULL | Menyimpan data gelar pada tabel program_studis. |
| `gelar_singkat` | `varchar(255)` | - | YES | NULL | Menyimpan data gelar singkat pada tabel program_studis. |
| `gelar_en` | `varchar(255)` | - | YES | NULL | Menyimpan data gelar en pada tabel program_studis. |
| `gelar_singkat_en` | `varchar(255)` | - | YES | NULL | Menyimpan data gelar singkat en pada tabel program_studis. |
| `status` | `varchar(255)` | - | NO | `aktif` | Status operasional entitas (aktif/nonaktif/draft/selesai). |
| `status_spmb` | `varchar(255)` | - | NO | `aktif` | Menyimpan data status spmb pada tabel program_studis. |
| `terdaftar_lptk` | `tinyint(1)` | - | NO | `0` | Menyimpan data terdaftar lptk pada tabel program_studis. |
| `ketua_prodi_nama` | `varchar(255)` | - | YES | NULL | Menyimpan data ketua prodi nama pada tabel program_studis. |
| `ketua_prodi_nidn` | `varchar(255)` | - | YES | NULL | Menyimpan data ketua prodi nidn pada tabel program_studis. |
| `sekretaris_prodi_nama` | `varchar(255)` | - | YES | NULL | Menyimpan data sekretaris prodi nama pada tabel program_studis. |
| `sks_lulus_min` | `int` | - | NO | `144` | Menyimpan data sks lulus min pada tabel program_studis. |
| `ipk_lulus_min` | `decimal(3,2)` | - | NO | `2.00` | Menyimpan data ipk lulus min pada tabel program_studis. |
| `tugas_akhir_syarat` | `tinyint(1)` | - | NO | `1` | Menyimpan data tugas akhir syarat pada tabel program_studis. |
| `jenis_tugas_akhir` | `varchar(255)` | - | NO | `Skripsi` | Menyimpan data jenis tugas akhir pada tabel program_studis. |
| `pengaturan_transfer_nilai` | `varchar(255)` | - | NO | `Masuk Transkrip Akademik` | Menyimpan data pengaturan transfer nilai pada tabel program_studis. |
| `max_dosen_pembimbing` | `int` | - | NO | `2` | Menyimpan data max dosen pembimbing pada tabel program_studis. |
| `max_dosen_penguji` | `int` | - | NO | `2` | Menyimpan data max dosen penguji pada tabel program_studis. |
| `periode_hitung_ips` | `varchar(255)` | - | NO | `Periode terakhir mahasiswa aktif` | Menyimpan data periode hitung ips pada tabel program_studis. |
| `lembaga_akreditasi` | `varchar(255)` | - | YES | `LAMDIK` | Menyimpan data lembaga akreditasi pada tabel program_studis. |
| `akreditasi` | `varchar(255)` | - | YES | `Baik Sekali` | Menyimpan data akreditasi pada tabel program_studis. |
| `nilai_akreditasi` | `varchar(255)` | - | YES | NULL | Menyimpan data nilai akreditasi pada tabel program_studis. |
| `no_sk_akreditasi` | `varchar(255)` | - | YES | NULL | Menyimpan data no sk akreditasi pada tabel program_studis. |
| `tanggal_sk_akreditasi` | `date` | - | YES | NULL | Tanggal pencatatan sk akreditasi. |
| `tanggal_berlaku_akreditasi` | `date` | - | YES | NULL | Tanggal pencatatan berlaku akreditasi. |
| `tanggal_berakhir_akreditasi` | `date` | - | YES | NULL | Tanggal pencatatan berakhir akreditasi. |
| `file_sertifikat_akreditasi` | `varchar(255)` | - | YES | NULL | Menyimpan data file sertifikat akreditasi pada tabel program_studis. |
| `alamat` | `varchar(255)` | - | YES | NULL | Menyimpan data alamat pada tabel program_studis. |
| `telepon` | `varchar(255)` | - | YES | NULL | Menyimpan data telepon pada tabel program_studis. |
| `email` | `varchar(255)` | - | YES | NULL | Alamat surel resmi untuk komunikasi dan login. |
| `website` | `varchar(255)` | - | YES | NULL | Menyimpan data website pada tabel program_studis. |
| `created_at` | `timestamp` | - | YES | NULL | Waktu pertama kali record dibuat di sistem. |
| `updated_at` | `timestamp` | - | YES | NULL | Waktu terakhir record diperbarui di sistem. |
| `deleted_at` | `timestamp` | - | YES | NULL | Timestamp soft delete untuk pengarsipan data tanpa menghapus fisik record. |

**Foreign Key Constraints:**

| Constraint Name | Kolom Sumber | Referensi Tabel | Referensi Kolom | On Delete | On Update |
|---|---|---|---|---|---|
| `program_studis_fakultas_id_foreign` | `fakultas_id` | `fakultas` | `id` | `CASCADE` | `NO ACTION` |

**Daftar Index:**

| Nama Index | Tipe Index | Kolom Terlibat |
|---|---|---|
| `PRIMARY` | PRIMARY KEY | `id` |
| `program_studis_fakultas_id_foreign` | INDEX | `fakultas_id` |
| `program_studis_kode_unique` | UNIQUE INDEX | `kode` |

---

### 59. TABEL: `proposal_skripsis`

**Purpose / Fungsi:**  
Pengajuan judul dan rancangan proposal tugas akhir / skripsi mahasiswa.

**Struktur Kolom:**

| Kolom | Tipe Data | Key | Nullable | Default | Deskripsi |
|---|---|---|---|---|---|
| `id` | `bigint unsigned` | PK | NO | NULL | Primary identifier unik record (auto-incrementing bigint). |
| `mahasiswa_id` | `bigint unsigned` | FK | NO | NULL | Foreign key merujuk ke tabel mahasiswas.id terkait. |
| `dosen_pembimbing_id` | `bigint unsigned` | FK | YES | NULL | Foreign key identifier relasi ke tabel dosen_pembimbings. |
| `judul` | `text` | - | YES | NULL | Menyimpan data judul pada tabel proposal_skripsis. |
| `status` | `varchar(255)` | - | NO | `diajukan` | Status operasional entitas (aktif/nonaktif/draft/selesai). |
| `tanggal_ujian` | `date` | - | YES | NULL | Tanggal pencatatan ujian. |
| `created_at` | `timestamp` | - | YES | NULL | Waktu pertama kali record dibuat di sistem. |
| `updated_at` | `timestamp` | - | YES | NULL | Waktu terakhir record diperbarui di sistem. |

**Foreign Key Constraints:**

| Constraint Name | Kolom Sumber | Referensi Tabel | Referensi Kolom | On Delete | On Update |
|---|---|---|---|---|---|
| `proposal_skripsis_dosen_pembimbing_id_foreign` | `dosen_pembimbing_id` | `dosens` | `id` | `SET NULL` | `NO ACTION` |
| `proposal_skripsis_mahasiswa_id_foreign` | `mahasiswa_id` | `mahasiswas` | `id` | `CASCADE` | `NO ACTION` |

**Daftar Index:**

| Nama Index | Tipe Index | Kolom Terlibat |
|---|---|---|
| `PRIMARY` | PRIMARY KEY | `id` |
| `proposal_skripsis_dosen_pembimbing_id_foreign` | INDEX | `dosen_pembimbing_id` |
| `proposal_skripsis_mahasiswa_id_foreign` | INDEX | `mahasiswa_id` |

---

### 60. TABEL: `referensi_biodatas`

**Purpose / Fungsi:**  
Master data referensi opsi dropdown (agama, jenis kelamin, status nikah, pekerjaan).

**Struktur Kolom:**

| Kolom | Tipe Data | Key | Nullable | Default | Deskripsi |
|---|---|---|---|---|---|
| `id` | `bigint unsigned` | PK | NO | NULL | Primary identifier unik record (auto-incrementing bigint). |
| `tipe` | `varchar(255)` | - | NO | NULL | Menyimpan data tipe pada tabel referensi_biodatas. |
| `nama` | `varchar(255)` | - | NO | NULL | Nama lengkap entitas terkait. |
| `pddikti_ref_id` | `varchar(255)` | - | YES | NULL | Foreign key identifier relasi ke tabel pddikti_refs. |
| `created_at` | `timestamp` | - | YES | NULL | Waktu pertama kali record dibuat di sistem. |
| `updated_at` | `timestamp` | - | YES | NULL | Waktu terakhir record diperbarui di sistem. |

**Daftar Index:**

| Nama Index | Tipe Index | Kolom Terlibat |
|---|---|---|
| `PRIMARY` | PRIMARY KEY | `id` |

---

### 61. TABEL: `registrasi_ulangs`

**Purpose / Fungsi:**  
Pencatatan konfirmasi daftar ulang dan status kelengkapan calon mahasiswa menjadi mahasiswa baru.

**Struktur Kolom:**

| Kolom | Tipe Data | Key | Nullable | Default | Deskripsi |
|---|---|---|---|---|---|
| `id` | `bigint unsigned` | PK | NO | NULL | Primary identifier unik record (auto-incrementing bigint). |
| `periode_registrasi_id` | `bigint unsigned` | FK | NO | NULL | Foreign key identifier relasi ke tabel periode_registrasis. |
| `calon_mahasiswa_id` | `bigint unsigned` | FK | YES | NULL | Foreign key identifier relasi ke tabel calon_mahasiswas. |
| `mahasiswa_id` | `bigint unsigned` | FK | YES | NULL | Foreign key merujuk ke tabel mahasiswas.id terkait. |
| `status` | `varchar(255)` | - | NO | `belum` | Status operasional entitas (aktif/nonaktif/draft/selesai). |
| `selesai_at` | `timestamp` | - | YES | NULL | Menyimpan data selesai at pada tabel registrasi_ulangs. |
| `created_at` | `timestamp` | - | YES | NULL | Waktu pertama kali record dibuat di sistem. |
| `updated_at` | `timestamp` | - | YES | NULL | Waktu terakhir record diperbarui di sistem. |

**Foreign Key Constraints:**

| Constraint Name | Kolom Sumber | Referensi Tabel | Referensi Kolom | On Delete | On Update |
|---|---|---|---|---|---|
| `registrasi_ulangs_calon_mahasiswa_id_foreign` | `calon_mahasiswa_id` | `calon_mahasiswas` | `id` | `SET NULL` | `NO ACTION` |
| `registrasi_ulangs_mahasiswa_id_foreign` | `mahasiswa_id` | `mahasiswas` | `id` | `SET NULL` | `NO ACTION` |
| `registrasi_ulangs_periode_registrasi_id_foreign` | `periode_registrasi_id` | `periode_registrasis` | `id` | `CASCADE` | `NO ACTION` |

**Daftar Index:**

| Nama Index | Tipe Index | Kolom Terlibat |
|---|---|---|
| `PRIMARY` | PRIMARY KEY | `id` |
| `registrasi_ulangs_calon_mahasiswa_id_foreign` | INDEX | `calon_mahasiswa_id` |
| `registrasi_ulangs_mahasiswa_id_foreign` | INDEX | `mahasiswa_id` |
| `registrasi_ulangs_periode_registrasi_id_foreign` | INDEX | `periode_registrasi_id` |

---

### 62. TABEL: `riwayat_jabatan_fungsionals`

**Purpose / Fungsi:**  
Catatan riwayat jabatan akademik fungsional dosen (Asisten Ahli, Lektor, Lektor Kepala, Guru Besar).

**Struktur Kolom:**

| Kolom | Tipe Data | Key | Nullable | Default | Deskripsi |
|---|---|---|---|---|---|
| `id` | `bigint unsigned` | PK | NO | NULL | Primary identifier unik record (auto-incrementing bigint). |
| `dosen_id` | `bigint unsigned` | FK | NO | NULL | Foreign key merujuk ke tabel dosens.id terkait. |
| `jabatan` | `varchar(255)` | - | NO | NULL | Menyimpan data jabatan pada tabel riwayat_jabatan_fungsionals. |
| `tmt` | `date` | - | NO | NULL | Menyimpan data tmt pada tabel riwayat_jabatan_fungsionals. |
| `nomor_sk` | `varchar(255)` | - | YES | NULL | Nomor identifikasi unik dokumen sk. |
| `created_at` | `timestamp` | - | YES | NULL | Waktu pertama kali record dibuat di sistem. |
| `updated_at` | `timestamp` | - | YES | NULL | Waktu terakhir record diperbarui di sistem. |

**Foreign Key Constraints:**

| Constraint Name | Kolom Sumber | Referensi Tabel | Referensi Kolom | On Delete | On Update |
|---|---|---|---|---|---|
| `riwayat_jabatan_fungsionals_dosen_id_foreign` | `dosen_id` | `dosens` | `id` | `CASCADE` | `NO ACTION` |

**Daftar Index:**

| Nama Index | Tipe Index | Kolom Terlibat |
|---|---|---|
| `PRIMARY` | PRIMARY KEY | `id` |
| `riwayat_jabatan_fungsionals_dosen_id_foreign` | INDEX | `dosen_id` |

---

### 63. TABEL: `riwayat_pendidikan_dosens`

**Purpose / Fungsi:**  
Catatan riwayat jenjang pendidikan formal dosen (S1, S2, S3, asal kampus, tahun lulus).

**Struktur Kolom:**

| Kolom | Tipe Data | Key | Nullable | Default | Deskripsi |
|---|---|---|---|---|---|
| `id` | `bigint unsigned` | PK | NO | NULL | Primary identifier unik record (auto-incrementing bigint). |
| `dosen_id` | `bigint unsigned` | FK | NO | NULL | Foreign key merujuk ke tabel dosens.id terkait. |
| `jenjang` | `varchar(255)` | - | NO | NULL | Menyimpan data jenjang pada tabel riwayat_pendidikan_dosens. |
| `institusi` | `varchar(255)` | - | NO | NULL | Menyimpan data institusi pada tabel riwayat_pendidikan_dosens. |
| `program_studi` | `varchar(255)` | - | NO | NULL | Menyimpan data program studi pada tabel riwayat_pendidikan_dosens. |
| `tahun_lulus` | `int` | - | NO | NULL | Menyimpan data tahun lulus pada tabel riwayat_pendidikan_dosens. |
| `created_at` | `timestamp` | - | YES | NULL | Waktu pertama kali record dibuat di sistem. |
| `updated_at` | `timestamp` | - | YES | NULL | Waktu terakhir record diperbarui di sistem. |

**Foreign Key Constraints:**

| Constraint Name | Kolom Sumber | Referensi Tabel | Referensi Kolom | On Delete | On Update |
|---|---|---|---|---|---|
| `riwayat_pendidikan_dosens_dosen_id_foreign` | `dosen_id` | `dosens` | `id` | `CASCADE` | `NO ACTION` |

**Daftar Index:**

| Nama Index | Tipe Index | Kolom Terlibat |
|---|---|---|
| `PRIMARY` | PRIMARY KEY | `id` |
| `riwayat_pendidikan_dosens_dosen_id_foreign` | INDEX | `dosen_id` |

---

### 64. TABEL: `role_has_permissions`

**Purpose / Fungsi:**  
Tabel pivot penugasan hak akses (permissions) ke dalam suatu peran (role).

**Struktur Kolom:**

| Kolom | Tipe Data | Key | Nullable | Default | Deskripsi |
|---|---|---|---|---|---|
| `permission_id` | `bigint unsigned` | PK, FK | NO | NULL | Foreign key identifier relasi ke tabel permissions. |
| `role_id` | `bigint unsigned` | PK, FK | NO | NULL | Foreign key identifier relasi ke tabel roles. |

**Foreign Key Constraints:**

| Constraint Name | Kolom Sumber | Referensi Tabel | Referensi Kolom | On Delete | On Update |
|---|---|---|---|---|---|
| `role_has_permissions_permission_id_foreign` | `permission_id` | `permissions` | `id` | `CASCADE` | `NO ACTION` |
| `role_has_permissions_role_id_foreign` | `role_id` | `roles` | `id` | `CASCADE` | `NO ACTION` |

**Daftar Index:**

| Nama Index | Tipe Index | Kolom Terlibat |
|---|---|---|
| `PRIMARY` | PRIMARY KEY | `permission_id`, `role_id` |
| `role_has_permissions_role_id_foreign` | INDEX | `role_id` |

---

### 65. TABEL: `roles`

**Purpose / Fungsi:**  
Daftar peran/otorisasi pengguna (Spatie RBAC) seperti superadmin, dosen, mahasiswa, kasir, dll.

**Struktur Kolom:**

| Kolom | Tipe Data | Key | Nullable | Default | Deskripsi |
|---|---|---|---|---|---|
| `id` | `bigint unsigned` | PK | NO | NULL | Primary identifier unik record (auto-incrementing bigint). |
| `name` | `varchar(255)` | - | NO | NULL | Menyimpan data name pada tabel roles. |
| `guard_name` | `varchar(255)` | - | NO | NULL | Menyimpan data guard name pada tabel roles. |
| `created_at` | `timestamp` | - | YES | NULL | Waktu pertama kali record dibuat di sistem. |
| `updated_at` | `timestamp` | - | YES | NULL | Waktu terakhir record diperbarui di sistem. |

**Daftar Index:**

| Nama Index | Tipe Index | Kolom Terlibat |
|---|---|---|
| `PRIMARY` | PRIMARY KEY | `id` |
| `roles_name_guard_name_unique` | UNIQUE INDEX | `name`, `guard_name` |

---

### 66. TABEL: `ruang_kuliahs`

**Purpose / Fungsi:**  
Data master ruang perkuliahan fisik dan laboratorium beserta daya tampung kelas.

**Struktur Kolom:**

| Kolom | Tipe Data | Key | Nullable | Default | Deskripsi |
|---|---|---|---|---|---|
| `id` | `bigint unsigned` | PK | NO | NULL | Primary identifier unik record (auto-incrementing bigint). |
| `kode` | `varchar(255)` | UNIQUE | NO | NULL | Menyimpan data kode pada tabel ruang_kuliahs. |
| `nama` | `varchar(255)` | - | NO | NULL | Nama lengkap entitas terkait. |
| `kapasitas` | `int` | - | NO | `0` | Menyimpan data kapasitas pada tabel ruang_kuliahs. |
| `created_at` | `timestamp` | - | YES | NULL | Waktu pertama kali record dibuat di sistem. |
| `updated_at` | `timestamp` | - | YES | NULL | Waktu terakhir record diperbarui di sistem. |

**Daftar Index:**

| Nama Index | Tipe Index | Kolom Terlibat |
|---|---|---|
| `PRIMARY` | PRIMARY KEY | `id` |
| `ruang_kuliahs_kode_unique` | UNIQUE INDEX | `kode` |

---

### 67. TABEL: `sessions`

**Purpose / Fungsi:**  
Penyimpanan sesi login aktif pengguna pada database (Laravel HTTP session handler).

**Struktur Kolom:**

| Kolom | Tipe Data | Key | Nullable | Default | Deskripsi |
|---|---|---|---|---|---|
| `id` | `varchar(255)` | PK | NO | NULL | Primary identifier unik record (auto-incrementing bigint). |
| `user_id` | `bigint unsigned` | - | YES | NULL | Foreign key merujuk ke tabel users.id pengelola atau pemilik akun. |
| `ip_address` | `varchar(45)` | - | YES | NULL | Menyimpan data ip address pada tabel sessions. |
| `user_agent` | `text` | - | YES | NULL | Menyimpan data user agent pada tabel sessions. |
| `payload` | `longtext` | - | NO | NULL | Menyimpan data payload pada tabel sessions. |
| `last_activity` | `int` | - | NO | NULL | Menyimpan data last activity pada tabel sessions. |

**Daftar Index:**

| Nama Index | Tipe Index | Kolom Terlibat |
|---|---|---|
| `PRIMARY` | PRIMARY KEY | `id` |
| `sessions_last_activity_index` | INDEX | `last_activity` |
| `sessions_user_id_index` | INDEX | `user_id` |

---

### 68. TABEL: `setting_prodis`

**Purpose / Fungsi:**  
Konfigurasi teknis operasional per program studi (kode feeder, kuota, aturan KRS).

**Struktur Kolom:**

| Kolom | Tipe Data | Key | Nullable | Default | Deskripsi |
|---|---|---|---|---|---|
| `id` | `bigint unsigned` | PK | NO | NULL | Primary identifier unik record (auto-incrementing bigint). |
| `tahun_ajaran_id` | `bigint unsigned` | FK | NO | NULL | Foreign key merujuk ke tabel tahun_ajarans.id periode akademik aktif. |
| `program_studi_id` | `bigint unsigned` | FK | YES | NULL | Foreign key merujuk ke tabel program_studis.id terkait. |
| `kurikulum_id` | `bigint unsigned` | FK | YES | NULL | Foreign key identifier relasi ke tabel kurikulums. |
| `buka_krs` | `tinyint(1)` | - | NO | `1` | Menyimpan data buka krs pada tabel setting_prodis. |
| `tgl_awal_krs` | `date` | - | YES | NULL | Menyimpan data tgl awal krs pada tabel setting_prodis. |
| `tgl_akhir_krs` | `date` | - | YES | NULL | Menyimpan data tgl akhir krs pada tabel setting_prodis. |
| `tgl_cetak_krs` | `date` | - | YES | NULL | Menyimpan data tgl cetak krs pada tabel setting_prodis. |
| `buka_validasi_krs` | `tinyint(1)` | - | NO | `1` | Menyimpan data buka validasi krs pada tabel setting_prodis. |
| `tgl_awal_validasi_krs` | `date` | - | YES | NULL | Menyimpan data tgl awal validasi krs pada tabel setting_prodis. |
| `tgl_akhir_validasi_krs` | `date` | - | YES | NULL | Menyimpan data tgl akhir validasi krs pada tabel setting_prodis. |
| `dosen_tampil_di_krs` | `tinyint(1)` | - | NO | `1` | Menyimpan data dosen tampil di krs pada tabel setting_prodis. |
| `buka_cetak_krs` | `tinyint(1)` | - | NO | `1` | Menyimpan data buka cetak krs pada tabel setting_prodis. |
| `buka_khs` | `tinyint(1)` | - | NO | `1` | Menyimpan data buka khs pada tabel setting_prodis. |
| `tgl_awal_khs` | `date` | - | YES | NULL | Menyimpan data tgl awal khs pada tabel setting_prodis. |
| `tgl_akhir_khs` | `date` | - | YES | NULL | Menyimpan data tgl akhir khs pada tabel setting_prodis. |
| `tgl_cetak_khs` | `date` | - | YES | NULL | Menyimpan data tgl cetak khs pada tabel setting_prodis. |
| `buka_pengisian_nilai` | `tinyint(1)` | - | NO | `1` | Menyimpan data buka pengisian nilai pada tabel setting_prodis. |
| `dosen_isi_persentase_komponen` | `tinyint(1)` | - | NO | `1` | Menyimpan data dosen isi persentase komponen pada tabel setting_prodis. |
| `tgl_awal_pengisian_nilai` | `date` | - | YES | NULL | Menyimpan data tgl awal pengisian nilai pada tabel setting_prodis. |
| `tgl_akhir_pengisian_nilai` | `date` | - | YES | NULL | Menyimpan data tgl akhir pengisian nilai pada tabel setting_prodis. |
| `buka_cetak_uts` | `tinyint(1)` | - | NO | `1` | Menyimpan data buka cetak uts pada tabel setting_prodis. |
| `tgl_awal_cetak_uts` | `date` | - | YES | NULL | Menyimpan data tgl awal cetak uts pada tabel setting_prodis. |
| `tgl_akhir_cetak_uts` | `date` | - | YES | NULL | Menyimpan data tgl akhir cetak uts pada tabel setting_prodis. |
| `tgl_cetak_uts` | `date` | - | YES | NULL | Menyimpan data tgl cetak uts pada tabel setting_prodis. |
| `min_presensi_uts` | `int` | - | NO | `50` | Menyimpan data min presensi uts pada tabel setting_prodis. |
| `min_presensi_uas` | `int` | - | NO | `75` | Menyimpan data min presensi uas pada tabel setting_prodis. |
| `buka_cetak_uas` | `tinyint(1)` | - | NO | `0` | Menyimpan data buka cetak uas pada tabel setting_prodis. |
| `tgl_awal_cetak_uas` | `date` | - | YES | NULL | Menyimpan data tgl awal cetak uas pada tabel setting_prodis. |
| `tgl_akhir_cetak_uas` | `date` | - | YES | NULL | Menyimpan data tgl akhir cetak uas pada tabel setting_prodis. |
| `tgl_cetak_uas` | `date` | - | YES | NULL | Menyimpan data tgl cetak uas pada tabel setting_prodis. |
| `buka_ubah_biodata` | `tinyint(1)` | - | NO | `0` | Menyimpan data buka ubah biodata pada tabel setting_prodis. |
| `buka_kuesioner` | `tinyint(1)` | - | NO | `1` | Menyimpan data buka kuesioner pada tabel setting_prodis. |
| `tgl_awal_kuesioner` | `date` | - | YES | NULL | Menyimpan data tgl awal kuesioner pada tabel setting_prodis. |
| `tgl_akhir_kuesioner` | `date` | - | YES | NULL | Menyimpan data tgl akhir kuesioner pada tabel setting_prodis. |
| `dosen_generate_tatap_muka` | `tinyint(1)` | - | NO | `0` | Menyimpan data dosen generate tatap muka pada tabel setting_prodis. |
| `jumlah_pertemuan_kuliah` | `int` | - | NO | `16` | Menyimpan data jumlah pertemuan kuliah pada tabel setting_prodis. |
| `batas_waktu_perubahan_presensi_hari` | `int` | - | NO | `3` | Menyimpan data batas waktu perubahan presensi hari pada tabel setting_prodis. |
| `buka_setting_ketua_kelas` | `tinyint(1)` | - | NO | `0` | Menyimpan data buka setting ketua kelas pada tabel setting_prodis. |
| `created_at` | `timestamp` | - | YES | NULL | Waktu pertama kali record dibuat di sistem. |
| `updated_at` | `timestamp` | - | YES | NULL | Waktu terakhir record diperbarui di sistem. |

**Foreign Key Constraints:**

| Constraint Name | Kolom Sumber | Referensi Tabel | Referensi Kolom | On Delete | On Update |
|---|---|---|---|---|---|
| `setting_prodis_kurikulum_id_foreign` | `kurikulum_id` | `kurikulum_prodis` | `id` | `SET NULL` | `NO ACTION` |
| `setting_prodis_program_studi_id_foreign` | `program_studi_id` | `program_studis` | `id` | `CASCADE` | `NO ACTION` |
| `setting_prodis_tahun_ajaran_id_foreign` | `tahun_ajaran_id` | `tahun_ajarans` | `id` | `CASCADE` | `NO ACTION` |

**Daftar Index:**

| Nama Index | Tipe Index | Kolom Terlibat |
|---|---|---|
| `PRIMARY` | PRIMARY KEY | `id` |
| `setting_prodis_kurikulum_id_foreign` | INDEX | `kurikulum_id` |
| `setting_prodis_program_studi_id_foreign` | INDEX | `program_studi_id` |
| `setting_prodis_tahun_ajaran_id_foreign` | INDEX | `tahun_ajaran_id` |

---

### 69. TABEL: `skala_nilais`

**Purpose / Fungsi:**  
Tabel konversi rentang nilai angka ke huruf mutu (A, B+, B, dst) dan bobot indeks prestasi.

**Struktur Kolom:**

| Kolom | Tipe Data | Key | Nullable | Default | Deskripsi |
|---|---|---|---|---|---|
| `id` | `bigint unsigned` | PK | NO | NULL | Primary identifier unik record (auto-incrementing bigint). |
| `min_angka` | `decimal(5,2)` | - | NO | NULL | Menyimpan data min angka pada tabel skala_nilais. |
| `max_angka` | `decimal(5,2)` | - | NO | NULL | Menyimpan data max angka pada tabel skala_nilais. |
| `huruf` | `varchar(255)` | - | NO | NULL | Menyimpan data huruf pada tabel skala_nilais. |
| `bobot` | `decimal(3,2)` | - | NO | NULL | Menyimpan data bobot pada tabel skala_nilais. |
| `created_at` | `timestamp` | - | YES | NULL | Waktu pertama kali record dibuat di sistem. |
| `updated_at` | `timestamp` | - | YES | NULL | Waktu terakhir record diperbarui di sistem. |

**Daftar Index:**

| Nama Index | Tipe Index | Kolom Terlibat |
|---|---|---|
| `PRIMARY` | PRIMARY KEY | `id` |

---

### 70. TABEL: `skripsis`

**Purpose / Fungsi:**  
Data naskah skripsi mahasiswa, penetapan dosen pembimbing utama/pendamping, dan status kelayakan.

**Struktur Kolom:**

| Kolom | Tipe Data | Key | Nullable | Default | Deskripsi |
|---|---|---|---|---|---|
| `id` | `bigint unsigned` | PK | NO | NULL | Primary identifier unik record (auto-incrementing bigint). |
| `mahasiswa_id` | `bigint unsigned` | FK | NO | NULL | Foreign key merujuk ke tabel mahasiswas.id terkait. |
| `dosen_pembimbing_id` | `bigint unsigned` | FK | YES | NULL | Foreign key identifier relasi ke tabel dosen_pembimbings. |
| `judul` | `text` | - | NO | NULL | Menyimpan data judul pada tabel skripsis. |
| `status` | `varchar(255)` | - | NO | `bimbingan` | Status operasional entitas (aktif/nonaktif/draft/selesai). |
| `tanggal_ujian` | `date` | - | YES | NULL | Tanggal pencatatan ujian. |
| `created_at` | `timestamp` | - | YES | NULL | Waktu pertama kali record dibuat di sistem. |
| `updated_at` | `timestamp` | - | YES | NULL | Waktu terakhir record diperbarui di sistem. |

**Foreign Key Constraints:**

| Constraint Name | Kolom Sumber | Referensi Tabel | Referensi Kolom | On Delete | On Update |
|---|---|---|---|---|---|
| `skripsis_dosen_pembimbing_id_foreign` | `dosen_pembimbing_id` | `dosens` | `id` | `SET NULL` | `NO ACTION` |
| `skripsis_mahasiswa_id_foreign` | `mahasiswa_id` | `mahasiswas` | `id` | `CASCADE` | `NO ACTION` |

**Daftar Index:**

| Nama Index | Tipe Index | Kolom Terlibat |
|---|---|---|
| `PRIMARY` | PRIMARY KEY | `id` |
| `skripsis_dosen_pembimbing_id_foreign` | INDEX | `dosen_pembimbing_id` |
| `skripsis_mahasiswa_id_foreign` | INDEX | `mahasiswa_id` |

---

### 71. TABEL: `status_akademik_historis`

**Purpose / Fungsi:**  
Rekam jejak historis status keaktifan mahasiswa per semester (Aktif, Cuti, Non-Aktif, DO, Lulus).

**Struktur Kolom:**

| Kolom | Tipe Data | Key | Nullable | Default | Deskripsi |
|---|---|---|---|---|---|
| `id` | `bigint unsigned` | PK | NO | NULL | Primary identifier unik record (auto-incrementing bigint). |
| `mahasiswa_id` | `bigint unsigned` | FK | NO | NULL | Foreign key merujuk ke tabel mahasiswas.id terkait. |
| `tahun_ajaran_id` | `bigint unsigned` | FK | NO | NULL | Foreign key merujuk ke tabel tahun_ajarans.id periode akademik aktif. |
| `status` | `varchar(255)` | - | NO | NULL | Status operasional entitas (aktif/nonaktif/draft/selesai). |
| `keterangan` | `text` | - | YES | NULL | Deskripsi penjelasan atau informasi pendukung record. |
| `created_at` | `timestamp` | - | YES | NULL | Waktu pertama kali record dibuat di sistem. |
| `updated_at` | `timestamp` | - | YES | NULL | Waktu terakhir record diperbarui di sistem. |

**Foreign Key Constraints:**

| Constraint Name | Kolom Sumber | Referensi Tabel | Referensi Kolom | On Delete | On Update |
|---|---|---|---|---|---|
| `status_akademik_historis_mahasiswa_id_foreign` | `mahasiswa_id` | `mahasiswas` | `id` | `CASCADE` | `NO ACTION` |
| `status_akademik_historis_tahun_ajaran_id_foreign` | `tahun_ajaran_id` | `tahun_ajarans` | `id` | `CASCADE` | `NO ACTION` |

**Daftar Index:**

| Nama Index | Tipe Index | Kolom Terlibat |
|---|---|---|
| `PRIMARY` | PRIMARY KEY | `id` |
| `status_akademik_historis_mahasiswa_id_foreign` | INDEX | `mahasiswa_id` |
| `status_akademik_historis_tahun_ajaran_id_foreign` | INDEX | `tahun_ajaran_id` |

---

### 72. TABEL: `system_configs`

**Purpose / Fungsi:**  
Penyimpanan variabel konfigurasi global sistem (nama kampus, semester aktif, gateway, token).

**Struktur Kolom:**

| Kolom | Tipe Data | Key | Nullable | Default | Deskripsi |
|---|---|---|---|---|---|
| `id` | `bigint unsigned` | PK | NO | NULL | Primary identifier unik record (auto-incrementing bigint). |
| `key` | `varchar(255)` | UNIQUE | NO | NULL | Menyimpan data key pada tabel system_configs. |
| `value` | `text` | - | YES | NULL | Menyimpan data value pada tabel system_configs. |
| `description` | `varchar(255)` | - | YES | NULL | Menyimpan data description pada tabel system_configs. |
| `created_at` | `timestamp` | - | YES | NULL | Waktu pertama kali record dibuat di sistem. |
| `updated_at` | `timestamp` | - | YES | NULL | Waktu terakhir record diperbarui di sistem. |

**Daftar Index:**

| Nama Index | Tipe Index | Kolom Terlibat |
|---|---|---|
| `PRIMARY` | PRIMARY KEY | `id` |
| `system_configs_key_unique` | UNIQUE INDEX | `key` |

---

### 73. TABEL: `tagihans`

**Purpose / Fungsi:**  
Invoice tagihan pembayaran mahasiswa per semester atau per keperluan khusus.

**Struktur Kolom:**

| Kolom | Tipe Data | Key | Nullable | Default | Deskripsi |
|---|---|---|---|---|---|
| `id` | `bigint unsigned` | PK | NO | NULL | Primary identifier unik record (auto-incrementing bigint). |
| `mahasiswa_id` | `bigint unsigned` | FK | NO | NULL | Foreign key merujuk ke tabel mahasiswas.id terkait. |
| `tahun_ajaran_id` | `bigint unsigned` | FK | NO | NULL | Foreign key merujuk ke tabel tahun_ajarans.id periode akademik aktif. |
| `jenis` | `varchar(255)` | - | NO | NULL | Menyimpan data jenis pada tabel tagihans. |
| `nominal` | `decimal(12,2)` | - | NO | NULL | Besaran nilai mata uang rupiah (IDR). |
| `jatuh_tempo` | `date` | - | NO | NULL | Menyimpan data jatuh tempo pada tabel tagihans. |
| `status` | `varchar(255)` | - | NO | `belum_bayar` | Status operasional entitas (aktif/nonaktif/draft/selesai). |
| `created_at` | `timestamp` | - | YES | NULL | Waktu pertama kali record dibuat di sistem. |
| `updated_at` | `timestamp` | - | YES | NULL | Waktu terakhir record diperbarui di sistem. |
| `deleted_at` | `timestamp` | - | YES | NULL | Timestamp soft delete untuk pengarsipan data tanpa menghapus fisik record. |

**Foreign Key Constraints:**

| Constraint Name | Kolom Sumber | Referensi Tabel | Referensi Kolom | On Delete | On Update |
|---|---|---|---|---|---|
| `tagihans_mahasiswa_id_foreign` | `mahasiswa_id` | `mahasiswas` | `id` | `CASCADE` | `NO ACTION` |
| `tagihans_tahun_ajaran_id_foreign` | `tahun_ajaran_id` | `tahun_ajarans` | `id` | `CASCADE` | `NO ACTION` |

**Daftar Index:**

| Nama Index | Tipe Index | Kolom Terlibat |
|---|---|---|
| `PRIMARY` | PRIMARY KEY | `id` |
| `tagihans_mahasiswa_id_foreign` | INDEX | `mahasiswa_id` |
| `tagihans_tahun_ajaran_id_foreign` | INDEX | `tahun_ajaran_id` |

---

### 74. TABEL: `tahun_ajarans`

**Purpose / Fungsi:**  
Data periode tahun akademik (misal 2026/2027 Ganjil/Genap) beserta status aktif.

**Struktur Kolom:**

| Kolom | Tipe Data | Key | Nullable | Default | Deskripsi |
|---|---|---|---|---|---|
| `id` | `bigint unsigned` | PK | NO | NULL | Primary identifier unik record (auto-incrementing bigint). |
| `nama` | `varchar(255)` | - | NO | NULL | Nama lengkap entitas terkait. |
| `mulai` | `date` | - | NO | NULL | Menyimpan data mulai pada tabel tahun_ajarans. |
| `selesai` | `date` | - | NO | NULL | Menyimpan data selesai pada tabel tahun_ajarans. |
| `is_active` | `tinyint(1)` | - | NO | `0` | Flag penanda apakah record sedang aktif digunakan (1 = Aktif, 0 = Nonaktif). |
| `krs_mulai` | `date` | - | YES | NULL | Menyimpan data krs mulai pada tabel tahun_ajarans. |
| `krs_selesai` | `date` | - | YES | NULL | Menyimpan data krs selesai pada tabel tahun_ajarans. |
| `krs_batal_tambah_mulai` | `date` | - | YES | NULL | Menyimpan data krs batal tambah mulai pada tabel tahun_ajarans. |
| `krs_batal_tambah_selesai` | `date` | - | YES | NULL | Menyimpan data krs batal tambah selesai pada tabel tahun_ajarans. |
| `penilaian_mulai` | `date` | - | YES | NULL | Menyimpan data penilaian mulai pada tabel tahun_ajarans. |
| `penilaian_selesai` | `date` | - | YES | NULL | Menyimpan data penilaian selesai pada tabel tahun_ajarans. |
| `pembayaran_mulai` | `date` | - | YES | NULL | Menyimpan data pembayaran mulai pada tabel tahun_ajarans. |
| `pembayaran_selesai` | `date` | - | YES | NULL | Menyimpan data pembayaran selesai pada tabel tahun_ajarans. |
| `uts_mulai` | `date` | - | YES | NULL | Menyimpan data uts mulai pada tabel tahun_ajarans. |
| `uts_selesai` | `date` | - | YES | NULL | Menyimpan data uts selesai pada tabel tahun_ajarans. |
| `uas_mulai` | `date` | - | YES | NULL | Menyimpan data uas mulai pada tabel tahun_ajarans. |
| `uas_selesai` | `date` | - | YES | NULL | Menyimpan data uas selesai pada tabel tahun_ajarans. |
| `created_at` | `timestamp` | - | YES | NULL | Waktu pertama kali record dibuat di sistem. |
| `updated_at` | `timestamp` | - | YES | NULL | Waktu terakhir record diperbarui di sistem. |

**Daftar Index:**

| Nama Index | Tipe Index | Kolom Terlibat |
|---|---|---|
| `PRIMARY` | PRIMARY KEY | `id` |

---

### 75. TABEL: `unit_kerjas`

**Purpose / Fungsi:**  
Struktur unit kerja birokrasi, fakultas, lembaga, dan bagian administrasi kampus.

**Struktur Kolom:**

| Kolom | Tipe Data | Key | Nullable | Default | Deskripsi |
|---|---|---|---|---|---|
| `id` | `bigint unsigned` | PK | NO | NULL | Primary identifier unik record (auto-incrementing bigint). |
| `kode` | `varchar(255)` | UNIQUE | NO | NULL | Menyimpan data kode pada tabel unit_kerjas. |
| `nama` | `varchar(255)` | - | NO | NULL | Nama lengkap entitas terkait. |
| `created_at` | `timestamp` | - | YES | NULL | Waktu pertama kali record dibuat di sistem. |
| `updated_at` | `timestamp` | - | YES | NULL | Waktu terakhir record diperbarui di sistem. |

**Daftar Index:**

| Nama Index | Tipe Index | Kolom Terlibat |
|---|---|---|
| `PRIMARY` | PRIMARY KEY | `id` |
| `unit_kerjas_kode_unique` | UNIQUE INDEX | `kode` |

---

### 76. TABEL: `users`

**Purpose / Fungsi:**  
Menyimpan kredensial autentikasi pengguna, hash password, status akun, dan profil dasar multi-role.

**Struktur Kolom:**

| Kolom | Tipe Data | Key | Nullable | Default | Deskripsi |
|---|---|---|---|---|---|
| `id` | `bigint unsigned` | PK | NO | NULL | Primary identifier unik record (auto-incrementing bigint). |
| `name` | `varchar(255)` | - | NO | NULL | Menyimpan data name pada tabel users. |
| `email` | `varchar(255)` | UNIQUE | NO | NULL | Alamat surel resmi untuk komunikasi dan login. |
| `user_type` | `varchar(255)` | - | YES | NULL | Menyimpan data user type pada tabel users. |
| `status` | `varchar(255)` | - | NO | `active` | Status operasional entitas (aktif/nonaktif/draft/selesai). |
| `last_login_at` | `timestamp` | - | YES | NULL | Menyimpan data last login at pada tabel users. |
| `email_verified_at` | `timestamp` | - | YES | NULL | Menyimpan data email verified at pada tabel users. |
| `password` | `varchar(255)` | - | NO | NULL | Hash sandi akun pengguna (Bcrypt/Argon2id). |
| `two_factor_secret` | `text` | - | YES | NULL | Menyimpan data two factor secret pada tabel users. |
| `two_factor_recovery_codes` | `text` | - | YES | NULL | Menyimpan data two factor recovery codes pada tabel users. |
| `two_factor_confirmed_at` | `timestamp` | - | YES | NULL | Menyimpan data two factor confirmed at pada tabel users. |
| `remember_token` | `varchar(100)` | - | YES | NULL | Menyimpan data remember token pada tabel users. |
| `created_at` | `timestamp` | - | YES | NULL | Waktu pertama kali record dibuat di sistem. |
| `updated_at` | `timestamp` | - | YES | NULL | Waktu terakhir record diperbarui di sistem. |

**Daftar Index:**

| Nama Index | Tipe Index | Kolom Terlibat |
|---|---|---|
| `PRIMARY` | PRIMARY KEY | `id` |
| `users_email_unique` | UNIQUE INDEX | `email` |

---

### 77. TABEL: `wilayahs`

**Purpose / Fungsi:**  
Master referensi data wilayah administratif (provinsi, kabupaten/kota, kecamatan, kelurahan).

**Struktur Kolom:**

| Kolom | Tipe Data | Key | Nullable | Default | Deskripsi |
|---|---|---|---|---|---|
| `id` | `bigint unsigned` | PK | NO | NULL | Primary identifier unik record (auto-incrementing bigint). |
| `kode` | `varchar(255)` | UNIQUE | NO | NULL | Menyimpan data kode pada tabel wilayahs. |
| `nama` | `varchar(255)` | - | NO | NULL | Nama lengkap entitas terkait. |
| `level` | `int` | - | YES | NULL | Menyimpan data level pada tabel wilayahs. |
| `parent_id` | `bigint unsigned` | FK | YES | NULL | Foreign key identifier relasi ke tabel parents. |
| `pddikti_ref_id` | `varchar(255)` | - | YES | NULL | Foreign key identifier relasi ke tabel pddikti_refs. |
| `created_at` | `timestamp` | - | YES | NULL | Waktu pertama kali record dibuat di sistem. |
| `updated_at` | `timestamp` | - | YES | NULL | Waktu terakhir record diperbarui di sistem. |

**Foreign Key Constraints:**

| Constraint Name | Kolom Sumber | Referensi Tabel | Referensi Kolom | On Delete | On Update |
|---|---|---|---|---|---|
| `wilayahs_parent_id_foreign` | `parent_id` | `wilayahs` | `id` | `SET NULL` | `NO ACTION` |

**Daftar Index:**

| Nama Index | Tipe Index | Kolom Terlibat |
|---|---|---|
| `PRIMARY` | PRIMARY KEY | `id` |
| `wilayahs_kode_unique` | UNIQUE INDEX | `kode` |
| `wilayahs_parent_id_foreign` | INDEX | `parent_id` |

---

### 78. TABEL: `yudisiums`

**Purpose / Fungsi:**  
Pencatatan kelulusan yudisium sarjana setelah bebas tanggungan akademik, keuangan, dan perpustakaan.

**Struktur Kolom:**

| Kolom | Tipe Data | Key | Nullable | Default | Deskripsi |
|---|---|---|---|---|---|
| `id` | `bigint unsigned` | PK | NO | NULL | Primary identifier unik record (auto-incrementing bigint). |
| `mahasiswa_id` | `bigint unsigned` | FK | NO | NULL | Foreign key merujuk ke tabel mahasiswas.id terkait. |
| `periode_wisuda_id` | `bigint unsigned` | FK | YES | NULL | Foreign key identifier relasi ke tabel periode_wisudas. |
| `ipk_akhir` | `decimal(3,2)` | - | NO | NULL | Menyimpan data ipk akhir pada tabel yudisiums. |
| `nomor_dokumen` | `varchar(255)` | - | YES | NULL | Nomor identifikasi unik dokumen dokumen. |
| `created_at` | `timestamp` | - | YES | NULL | Waktu pertama kali record dibuat di sistem. |
| `updated_at` | `timestamp` | - | YES | NULL | Waktu terakhir record diperbarui di sistem. |

**Foreign Key Constraints:**

| Constraint Name | Kolom Sumber | Referensi Tabel | Referensi Kolom | On Delete | On Update |
|---|---|---|---|---|---|
| `yudisiums_mahasiswa_id_foreign` | `mahasiswa_id` | `mahasiswas` | `id` | `CASCADE` | `NO ACTION` |
| `yudisiums_periode_wisuda_id_foreign` | `periode_wisuda_id` | `periode_wisudas` | `id` | `SET NULL` | `NO ACTION` |

**Daftar Index:**

| Nama Index | Tipe Index | Kolom Terlibat |
|---|---|---|
| `PRIMARY` | PRIMARY KEY | `id` |
| `yudisiums_mahasiswa_id_foreign` | INDEX | `mahasiswa_id` |
| `yudisiums_periode_wisuda_id_foreign` | INDEX | `periode_wisuda_id` |

---

*Dokumentasi Database Dictionary disusun secara otomatis berdasarkan inspeksi skema `information_schema` MySQL 8.0.*
