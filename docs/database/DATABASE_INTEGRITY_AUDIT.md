# Database Integrity Audit Report
## Sistem Informasi Akademik (SIAKAD) STAI Al-Yasini

Laporan audit ini disusun oleh Senior Database Architect dan System Analyst berdasarkan inspeksi menyeluruh terhadap 78 tabel fisik pada database aktif `siakad_db` (MySQL 8.0 InnoDB), berkas migrasi `database/migrations/`, dan 64 Eloquent Models di `app/Models/`.

> **PENTING / PERHATIAN:**  
> Laporan ini bersifat analisis dan rekomendasi teknis. Sesuai batasan tugas, **tidak ada perubahan skema database, migration, model, maupun logika bisnis yang dilakukan secara sepihak**.

---

## Ringkasan Eksekutif Hasil Temuan

| Tingkat Keparahan | Jumlah Isu | Domain Terdampak | Status Rekomendasi |
|:---|:---:|:---|:---|
| **CRITICAL** | 2 | Keuangan, Perkuliahan & KRS | Perlu mitigasi skema / validasi transaksi ketat |
| **HIGH** | 3 | Presensi, Kurikulum, PD-DIKTI | Penambahan Composite Index & Unique Constraint |
| **MEDIUM** | 4 | Kepegawaian, Audit, Konvensi Naming | Penataan indeks dan konsistensi relasi |
| **LOW** | 3 | Soft Delete, Nilai Historis, Default Value | Penyesuaian konfigurasi jangka panjang |

---

## 1. Temuan Tingkat: CRITICAL (Kritis)

### ISU 1.1: Cascade Delete pada Transaksi Keuangan (`pembayarans` -> `tagihans`)
* **Lokasi:** Tabel `pembayarans` (Constraint: `pembayarans_tagihan_id_foreign`, kolom `tagihan_id`).
* **Masalah:** Menggunakan klausa `ON DELETE CASCADE` dari tabel parent `tagihans`.
* **Bukti (information_schema):**
  ```sql
  CONSTRAINT `pembayarans_tagihan_id_foreign` FOREIGN KEY (`tagihan_id`) 
  REFERENCES `tagihans` (`id`) ON DELETE CASCADE
  ```
* **Dampak:** Apabila sebuah record tagihan terhapus secara fisik di level database, seluruh riwayat transaksi setoran uang (kuitansi, nomor referensi kasir, audit pembayaran bank) pada `pembayarans` akan ikut terhapus permanen (*loss of audit trail*). Hal ini melanggar standar akuntansi keuangan dan berisiko tinggi saat audit institusi.
* **Rekomendasi:** Ubah perilaku referensial menjadi `ON DELETE RESTRICT` (atau `NO ACTION`). Tagihan yang telah memiliki rekonsiliasi pembayaran tidak boleh dapat dihapus sebelum pembayarannya dibatalkan/direfund secara sah.
* **Apakah Aman Diperbaiki:** **Ya, Sangat Aman**. Perbaikan dilakukan dengan membuat migration baru yang menghapus foreign key lama dan membuat ulang foreign key dengan rule `RESTRICT`.

---

### ISU 1.2: Tidak Adanya Composite Unique Constraint pada Pivot Pengambilan KRS (`krs_details`)
* **Lokasi:** Tabel `krs_details` (kolom `krs_id` dan `kelas_kuliah_id`).
* **Masalah:** Tidak terdapat indeks unik gabungan `UNIQUE(krs_id, kelas_kuliah_id)` pada level database fisik.
* **Bukti (information_schema):**
  Hanya terdapat indeks biasa `krs_details_krs_id_foreign` dan `krs_details_kelas_kuliah_id_foreign`.
* **Dampak:** Integritas pencegahan matakuliah ganda hanya bergantung pada validasi aplikasi (PHP). Apabila terjadi *race condition* akibat klik ganda (*double submit*) oleh mahasiswa atau gangguan jaringan, data matakuliah yang sama dapat masuk lebih dari satu kali ke lembar KRS yang sama, memicu anomali perhitungan kuota SKS dan nilai ganda pada KHS.
* **Rekomendasi:** Tambahkan composite unique constraint pada migration mendatang:
  ```php
  $table->unique(['krs_id', 'kelas_kuliah_id'], 'krs_details_krs_kelas_unique');
  ```
* **Apakah Aman Diperbaiki:** **Perlu Pembersihan Data Terlebih Dahulu**. Pastikan tidak ada data duplikat eksisting pada `krs_details` sebelum migration penambahan unique index dijalankan.

---

## 2. Temuan Tingkat: HIGH (Tinggi)

### ISU 2.1: Ketiadaan Composite Unique pada Catatan Presensi Mahasiswa (`presensis`)
* **Lokasi:** Tabel `presensis` (kolom `jurnal_perkuliahan_id` dan `mahasiswa_id`).
* **Masalah:** Tidak ada batasan `UNIQUE` yang mengunci satu mahasiswa hanya boleh memiliki satu status kehadiran per pertemuan jurnal.
* **Bukti:** Indeks yang tersedia hanya indeks individual foreign key.
* **Dampak:** Dosen atau sistem presensi massal dapat secara tidak sengaja menginsert 2 status berbeda (misalnya tercatat `HADIR` dan `IZIN` sekaligus untuk mahasiswa yang sama pada pertemuan yang sama).
* **Rekomendasi:** Tambahkan composite unique:
  ```php
  $table->unique(['jurnal_perkuliahan_id', 'mahasiswa_id'], 'presensi_jurnal_mahasiswa_unique');
  ```
* **Apakah Aman Diperbaiki:** **Aman setelah verifikasi duplikasi**.

---

### ISU 2.2: Ketiadaan Indeks Lookup pada Tabel Integrasi Neo Feeder (`pddikti_mappings` & `pddikti_sync_logs`)
* **Lokasi:** Tabel `pddikti_mappings` dan `pddikti_sync_logs`.
* **Masalah:** Kolom pencarian `local_table`, `local_id`, `pddikti_table`, dan `pddikti_id` pada `pddikti_mappings` tidak memiliki indeks apapun selain `PRIMARY KEY (id)`. Hal yang sama terjadi pada `pddikti_sync_logs` (`table_name`, `record_id`, `status`).
* **Bukti (information_schema):**
  ```json
  "indexes": [
      { "INDEX_NAME": "PRIMARY", "COLUMN_NAME": "id" }
  ]
  ```
* **Dampak:** Ketika proses sinkronisasi massal ribuan data mahasiswa, KRS, dan nilai berjalan, query `WHERE local_table = ? AND local_id = ?` akan melakukan *Full Table Scan*. Hal ini mengakibatkan lonjakan beban CPU dan waktu eksekusi queue worker menjadi sangat lambat (*timeout bottleneck*).
* **Rekomendasi:** Tambahkan composite index:
  ```php
  // Pada pddikti_mappings:
  $table->index(['local_table', 'local_id'], 'pddikti_mappings_local_index');
  $table->index(['pddikti_table', 'pddikti_id'], 'pddikti_mappings_pddikti_index');
  
  // Pada pddikti_sync_logs:
  $table->index(['table_name', 'record_id'], 'pddikti_sync_logs_record_index');
  $table->index('status');
  ```
* **Apakah Aman Diperbaiki:** **Sangat Aman**. Penambahan non-unique index tidak mempengaruhi integritas data dan dapat langsung diterapkan.

---

### ISU 2.3: Ketiadaan Composite Unique pada Penetapan Dosen Pengajar (`dosen_pengajars`)
* **Lokasi:** Tabel `dosen_pengajars` (kolom `kelas_kuliah_id` dan `dosen_id`).
* **Masalah:** Seorang dosen dapat didaftarkan berkali-kali pada satu kelas yang sama.
* **Bukti:** Tidak ada unique index gabungan.
* **Dampak:** Anomali perhitungan beban SKS dosen pengajar (BKD) dan duplikasi tampilan nama dosen pengampu di jadwal kuliah.
* **Rekomendasi:** Tambahkan constraint `UNIQUE(kelas_kuliah_id, dosen_id)`.
* **Apakah Aman Diperbaiki:** **Aman**.

---

## 3. Temuan Tingkat: MEDIUM (Menengah)

### ISU 3.1: Inkonsistensi Pola Soft Delete vs Hard Cascade
* **Lokasi:** Relasi antara `mahasiswas` (menggunakan soft delete) dengan child tables: `tagihans`, `krs`, `cekals`.
* **Masalah:** Tabel `mahasiswas` memiliki kolom `deleted_at`, namun foreign key pada `krs`, `tagihans`, dan `cekals` dikonfigurasi dengan `ON DELETE CASCADE`.
* **Bukti:** Jika dihapus melalui Eloquent `$mahasiswa->delete()`, event soft delete tidak mentrigger cascade MySQL. Namun jika dieksekusi via raw query `DB::table('mahasiswas')->where(...)->delete()`, MySQL akan langsung menghapus keras (*hard delete*) seluruh KRS dan tagihan anak tanpa jejak.
* **Dampak:** Risiko perbedaan perilaku penghapusan data antara operasi via Eloquent ORM dengan operasi via Database Seeder / Raw Query.
* **Rekomendasi:** Selaraskan business logic agar entitas master akademik tidak menggunakan hard cascade jika parentnya berstatus soft delete.
* **Apakah Aman Diperbaiki:** **Aman secara konseptual**, cukup menjadi pedoman bagi developer agar selalu menggunakan Eloquent Soft Delete.

---

### ISU 3.2: Nullable Foreign Key `user_id` pada Entitas Dosen dan Mahasiswa
* **Lokasi:** Kolom `dosens.user_id` dan `mahasiswas.user_id`.
* **Masalah:** Kolom `user_id` bersifat `NULLABLE`.
* **Bukti:** Definisi skema `$table->foreignId('user_id')->nullable()->constrained()->nullOnDelete()`.
* **Dampak:** Ada kemungkinan data dosen atau mahasiswa tercipta di database tanpa memiliki akun pengguna untuk login.
* **Rasionalisasi:** Secara arsitektur, ini sengaja dirancang untuk mengakomodasi migrasi data lama atau pembuatan data mahasiswa baru sebelum akun login digenerate.
* **Rekomendasi:** Pertahankan sifat nullable, namun tambahkan health check script untuk mendeteksi profil aktif yang belum memiliki akun user.
* **Apakah Aman Diperbaiki:** **Tidak perlu diubah di skema**, cukup monitoring di layer aplikasi.

---

### ISU 3.3: Inkonsistensi Penamaan Jamak Tabel (Singular vs Plural)
* **Lokasi:** Tabel `krs`.
* **Masalah:** Hampir seluruh tabel di database menggunakan konvensi jamak bahasa Inggris / Indonesia berakhiran 's' (`mahasiswas`, `dosens`, `tagihans`, `kelas_kuliahs`), namun tabel lembar studi dinamai `krs` (bukan `krs_headers` atau `kartu_rencana_studis`).
* **Bukti:** Nama tabel adalah `krs` sedangkan detailnya adalah `krs_details`.
* **Dampak:** Tidak ada dampak performa maupun integritas data. Hanya sedikit deviasi dari konvensi default Laravel. Model `App\Models\Krs` telah mendefinisikan `protected $table = 'krs';` secara eksplisit sehingga query berjalan normal.
* **Rekomendasi:** Pertahankan nama tabel `krs` demi menjaga kompatibilitas dengan codebase yang sudah berjalan.
* **Apakah Aman Diperbaiki:** **Jangan diubah** (akan memicu breaking changes masif pada kode controller dan query).

---

### ISU 3.4: Ketiadaan Composite Unique pada Matakuliah Kurikulum (`kurikulum_matakuliahs`)
* **Lokasi:** Tabel `kurikulum_matakuliahs` (kolom `kurikulum_prodi_id` dan `matakuliah_id`).
* **Masalah:** Suatu matakuliah dapat di-assign lebih dari satu kali ke dalam kurikulum prodi yang sama.
* **Rekomendasi:** Tambahkan `UNIQUE(kurikulum_prodi_id, matakuliah_id)`.
* **Apakah Aman Diperbaiki:** **Aman**.

---

## 4. Temuan Tingkat: LOW (Rendah)

### ISU 4.1: Penggunaan Tipe Data JSON untuk Logging Aktivitas (`activity_logs`)
* **Lokasi:** Tabel `activity_logs` (kolom `old_values` dan `new_values` bertipe `JSON`).
* **Keterangan:** Tipe data JSON sangat fleksibel untuk menampung perbedaan atribut model, namun di MySQL 8 ukuran tabel log dapat membengkak dengan cepat jika tidak ada mekanisme pengarsipan berkala (*data pruning/archiving*).
* **Rekomendasi:** Buat scheduled task bulanan: `php artisan model:prune` untuk memangkas log yang lebih tua dari 180 hari.

### ISU 4.2: Redundansi Kolom SKS pada Kelas Kuliah
* **Lokasi:** `kelas_kuliahs.sks` vs `matakuliahs.sks_total`.
* **Keterangan:** Kolom `sks` pada `kelas_kuliahs` bersifat denormalisasi. Hal ini umum dilakukan pada SIAKAD perguruan tinggi untuk mengunci bobot SKS kelas saat semester berlangsung meskipun katalog matakuliah induk mengalami revisi.
* **Rekomendasi:** Tetap pertahankan, dokumentasikan sebagai denormalisasi yang disengaja (*intentional denormalization*).

### ISU 4.3: Blind Index Hashes pada Kolom Terenkripsi
* **Lokasi:** `calon_mahasiswas.nik_hash` dan `calon_mahasiswas.nomor_telepon_hash`.
* **Keterangan:** Kolom hash blind index (HMAC-SHA256) telah diimplementasikan dengan sangat baik untuk mendukung pencarian cepat (*exact match*) terhadap data sensitif NIK dan telepon yang dienkripsi secara simetris di database.
* **Rekomendasi:** Pertahankan, arsitektur ini sudah memenuhi standar kepatuhan privasi data (UU PDP).

---

## Kesimpulan & Panduan Tindakan

Secara keseluruhan, arsitektur database **SIAKAD STAI Al-Yasini** telah dirancang dengan struktur relasional yang sangat solid, mengimplementasikan 95 foreign key constraints fisik, serta memisahkan domain secara modular dan bersih.

Prioritas tindakan yang disarankan bagi tim pengembang:
1. **Fase 1 (Segera):** Tambahkan indeks performa pada tabel integrasi Neo Feeder (`pddikti_mappings` & `pddikti_sync_logs`).
2. **Fase 2 (Sebelum Go-Live):** Ubah klausa `CASCADE DELETE` pada `pembayarans` menjadi `RESTRICT` untuk proteksi transaksi keuangan.
3. **Fase 3 (Pemeliharaan):** Tambahkan composite unique constraints pada pivot tables (`krs_details`, `presensis`, `dosen_pengajars`, `kurikulum_matakuliahs`).

---
*Laporan disusun oleh Senior Database Architect SIAKAD STAI Al-Yasini.*