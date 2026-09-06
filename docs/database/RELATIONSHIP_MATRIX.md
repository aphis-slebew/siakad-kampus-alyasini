# Relationship Matrix (Matriks Relasi Database)
## Sistem Informasi Akademik (SIAKAD) STAI Al-Yasini

Matriks ini mendokumentasikan seluruh hubungan relasional antar-tabel pada database `siakad_db`, baik berupa foreign key constraints fisik maupun relasi logis Eloquent Models.

---

## 1. Matriks Relasi Fisik Database (Foreign Keys)

Daftar 95 foreign key constraints fisik aktif yang menjamin integritas referensial data:

| No | Source Table (Child) | Foreign Key Column | Target Table (Parent) | Cardinality | Delete Rule | Model Eloquent | Method BelongsTo |
|---|---|---|---|---|---|---|---|
| 1 | `activity_logs` | `user_id` | `users` | 1:N | `SET NULL` | `ActivityLog` | `user()` |
| 2 | `aktivitas_mahasiswas` | `jenis_aktivitas_id` | `referensi_biodatas` | 1:N | `SET NULL` | `AktivitasMahasiswa` | `jenisAktivitas()` |
| 3 | `aktivitas_mahasiswas` | `mahasiswa_id` | `mahasiswas` | 1:N | `CASCADE` | `AktivitasMahasiswa` | `mahasiswa()` |
| 4 | `beasiswa_mahasiswas` | `jenis_beasiswa_id` | `referensi_biodatas` | 1:N | `SET NULL` | `BeasiswaMahasiswa` | `jenisBeasiswa()` |
| 5 | `beasiswa_mahasiswas` | `mahasiswa_id` | `mahasiswas` | 1:N | `CASCADE` | `BeasiswaMahasiswa` | `mahasiswa()` |
| 6 | `berkas_pendaftarans` | `calon_mahasiswa_id` | `calon_mahasiswas` | 1:N | `CASCADE` | `BerkasPendaftaran` | `calonMahasiswa()` |
| 7 | `berkas_pendaftarans` | `diverifikasi_oleh_user_id` | `users` | 1:N | `SET NULL` | `BerkasPendaftaran` | `diverifikasiOleh()` |
| 8 | `bimbingan_proposals` | `proposal_skripsi_id` | `proposal_skripsis` | 1:N | `CASCADE` | `BimbinganProposal` | `proposalSkripsi()` |
| 9 | `bimbingan_skripsis` | `skripsi_id` | `skripsis` | 1:N | `CASCADE` | `BimbinganSkripsi` | `skripsi()` |
| 10 | `calon_mahasiswas` | `gelombang_pendaftaran_id` | `gelombang_pendaftarans` | 1:N | `NO ACTION` | `CalonMahasiswa` | `gelombangPendaftaran()` |
| 11 | `calon_mahasiswas` | `jalur_pendaftaran_id` | `jalur_pendaftarans` | 1:N | `NO ACTION` | `CalonMahasiswa` | `jalurPendaftaran()` |
| 12 | `calon_mahasiswas` | `program_studi_pilihan_1_id` | `program_studis` | 1:N | `NO ACTION` | `CalonMahasiswa` | `prodiPilihan1()` |
| 13 | `calon_mahasiswas` | `program_studi_pilihan_2_id` | `program_studis` | 1:N | `NO ACTION` | `CalonMahasiswa` | `prodiPilihan2()` |
| 14 | `calon_mahasiswas` | `user_id` | `users` | 1:N | `SET NULL` | `CalonMahasiswa` | `user()` |
| 15 | `cekals` | `mahasiswa_id` | `mahasiswas` | 1:N | `CASCADE` | `Cekal` | `mahasiswa()` |
| 16 | `cicilan_tagihans` | `tagihan_id` | `tagihans` | 1:N | `CASCADE` | `CicilanTagihan` | `tagihan()` |
| 17 | `data_orang_tuas` | `mahasiswa_id` | `mahasiswas` | 1:N | `CASCADE` | `DataOrangTua` | `mahasiswa()` |
| 18 | `data_orang_tuas` | `pekerjaan_ayah_referensi_id` | `referensi_biodatas` | 1:N | `SET NULL` | `DataOrangTua` | `pekerjaanAyah()` |
| 19 | `data_orang_tuas` | `pekerjaan_ibu_referensi_id` | `referensi_biodatas` | 1:N | `SET NULL` | `DataOrangTua` | `pekerjaanIbu()` |
| 20 | `data_orang_tuas` | `penghasilan_ortu_referensi_id` | `referensi_biodatas` | 1:N | `SET NULL` | `DataOrangTua` | `penghasilanOrtu()` |
| 21 | `dokumen_registrasis` | `registrasi_ulang_id` | `registrasi_ulangs` | 1:N | `CASCADE` | `DokumenRegistrasi` | `registrasiUlang()` |
| 22 | `dosen_pengajars` | `dosen_id` | `dosens` | 1:N | `CASCADE` | `DosenPengajar` | `dosen()` |
| 23 | `dosen_pengajars` | `kelas_kuliah_id` | `kelas_kuliahs` | 1:N | `CASCADE` | `DosenPengajar` | `kelasKuliah()` |
| 24 | `dosen_walis` | `dosen_id` | `dosens` | 1:N | `CASCADE` | `DosenWali` | `dosen()` |
| 25 | `dosen_walis` | `mahasiswa_id` | `mahasiswas` | 1:N | `CASCADE` | `DosenWali` | `mahasiswa()` |
| 26 | `dosen_walis` | `tahun_ajaran_id` | `tahun_ajarans` | 1:N | `CASCADE` | `DosenWali` | `tahunAjaran()` |
| 27 | `dosens` | `program_studi_id` | `program_studis` | 1:N | `SET NULL` | `Dosen` | `programStudi()` |
| 28 | `dosens` | `user_id` | `users` | 1:N | `SET NULL` | `Dosen` | `user()` |
| 29 | `ekivalensi_matakuliahs` | `matakuliah_baru_id` | `matakuliahs` | 1:N | `CASCADE` | `EkivalensiMatakuliah` | `matakuliahBaru()` |
| 30 | `ekivalensi_matakuliahs` | `matakuliah_lama_id` | `matakuliahs` | 1:N | `CASCADE` | `EkivalensiMatakuliah` | `matakuliahLama()` |
| 31 | `hasil_seleksis` | `calon_mahasiswa_id` | `calon_mahasiswas` | 1:N | `CASCADE` | `HasilSeleksi` | `calonMahasiswa()` |
| 32 | `jadwal_perkuliahans` | `kelas_kuliah_id` | `kelas_kuliahs` | 1:N | `CASCADE` | `JadwalPerkuliahan` | `kelasKuliah()` |
| 33 | `jadwal_perkuliahans` | `ruang_kuliah_id` | `ruang_kuliahs` | 1:N | `CASCADE` | `JadwalPerkuliahan` | `ruangKuliah()` |
| 34 | `jadwal_seleksis` | `calon_mahasiswa_id` | `calon_mahasiswas` | 1:N | `CASCADE` | `JadwalSeleksi` | `calonMahasiswa()` |
| 35 | `jurnal_perkuliahans` | `dosen_pengajar_id` | `dosen_pengajars` | 1:N | `CASCADE` | `JurnalPerkuliahan` | `dosenPengajar()` |
| 36 | `jurnal_perkuliahans` | `kelas_kuliah_id` | `kelas_kuliahs` | 1:N | `CASCADE` | `JurnalPerkuliahan` | `kelasKuliah()` |
| 37 | `kalender_akademiks` | `tahun_ajaran_id` | `tahun_ajarans` | 1:N | `CASCADE` | `KalenderAkademik` | `tahunAjaran()` |
| 38 | `kelas_kuliahs` | `kurikulum_matakuliah_id` | `kurikulum_matakuliahs` | 1:N | `CASCADE` | `KelasKuliah` | `kurikulumMatakuliah()` |
| 39 | `kelas_kuliahs` | `tahun_ajaran_id` | `tahun_ajarans` | 1:N | `CASCADE` | `KelasKuliah` | `tahunAjaran()` |
| 40 | `kelompok_ukts` | `program_studi_id` | `program_studis` | 1:N | `CASCADE` | `KelompokUkt` | `programStudi()` |
| 41 | `komponen_biayas` | `program_studi_id` | `program_studis` | 1:N | `SET NULL` | `KomponenBiaya` | `programStudi()` |
| 42 | `komposisi_nilais` | `kelas_kuliah_id` | `kelas_kuliahs` | 1:N | `CASCADE` | `KomposisiNilai` | `kelasKuliah()` |
| 43 | `konsentrasis` | `program_studi_id` | `program_studis` | 1:N | `CASCADE` | `Konsentrasi` | `programStudi()` |
| 44 | `krs` | `mahasiswa_id` | `mahasiswas` | 1:N | `CASCADE` | `Krs` | `mahasiswa()` |
| 45 | `krs` | `tahun_ajaran_id` | `tahun_ajarans` | 1:N | `CASCADE` | `Krs` | `tahunAjaran()` |
| 46 | `krs_details` | `kelas_kuliah_id` | `kelas_kuliahs` | 1:N | `CASCADE` | `KrsDetail` | `kelasKuliah()` |
| 47 | `krs_details` | `krs_id` | `krs` | 1:N | `CASCADE` | `KrsDetail` | `krs()` |
| 48 | `kurikulum_matakuliahs` | `kurikulum_prodi_id` | `kurikulum_prodis` | 1:N | `CASCADE` | `KurikulumMatakuliah` | `kurikulumProdi()` |
| 49 | `kurikulum_matakuliahs` | `matakuliah_id` | `matakuliahs` | 1:N | `CASCADE` | `KurikulumMatakuliah` | `matakuliah()` |
| 50 | `kurikulum_prodis` | `program_studi_id` | `program_studis` | 1:N | `CASCADE` | `KurikulumProdi` | `programStudi()` |
| 51 | `mahasiswa_ukts` | `kelompok_ukt_id` | `kelompok_ukts` | 1:N | `CASCADE` | `MahasiswaUkt` | `kelompokUkt()` |
| 52 | `mahasiswa_ukts` | `mahasiswa_id` | `mahasiswas` | 1:N | `CASCADE` | `MahasiswaUkt` | `mahasiswa()` |
| 53 | `mahasiswa_ukts` | `tahun_ajaran_id` | `tahun_ajarans` | 1:N | `CASCADE` | `MahasiswaUkt` | `tahunAjaran()` |
| 54 | `mahasiswas` | `agama_referensi_biodata_id` | `referensi_biodatas` | 1:N | `SET NULL` | `Mahasiswa` | `agama()` |
| 55 | `mahasiswas` | `calon_mahasiswa_id` | `calon_mahasiswas` | 1:N | `SET NULL` | `Mahasiswa` | - |
| 56 | `mahasiswas` | `program_studi_id` | `program_studis` | 1:N | `NO ACTION` | `Mahasiswa` | `programStudi()` |
| 57 | `mahasiswas` | `user_id` | `users` | 1:N | `SET NULL` | `Mahasiswa` | `user()` |
| 58 | `matakuliahs` | `bidang_ilmu_id` | `referensi_biodatas` | 1:N | `SET NULL` | `Matakuliah` | `bidangIlmu()` |
| 59 | `model_has_permissions` | `permission_id` | `permissions` | 1:1 | `CASCADE` | - | - |
| 60 | `model_has_roles` | `role_id` | `roles` | 1:1 | `CASCADE` | - | - |
| 61 | `nilais` | `krs_detail_id` | `krs_details` | 1:N | `CASCADE` | `Nilai` | `krsDetail()` |
| 62 | `pegawais` | `unit_kerja_id` | `unit_kerjas` | 1:N | `SET NULL` | `Pegawai` | `unitKerja()` |
| 63 | `pegawais` | `user_id` | `users` | 1:N | `SET NULL` | `Pegawai` | `user()` |
| 64 | `pelanggaran_mahasiswas` | `jenis_pelanggaran_id` | `referensi_biodatas` | 1:N | `SET NULL` | `PelanggaranMahasiswa` | `jenisPelanggaran()` |
| 65 | `pelanggaran_mahasiswas` | `mahasiswa_id` | `mahasiswas` | 1:N | `CASCADE` | `PelanggaranMahasiswa` | `mahasiswa()` |
| 66 | `pelanggaran_mahasiswas` | `sanksi_id` | `referensi_biodatas` | 1:N | `SET NULL` | `PelanggaranMahasiswa` | `sanksi()` |
| 67 | `pembayarans` | `diverifikasi_oleh_user_id` | `users` | 1:N | `SET NULL` | `Pembayaran` | `diverifikasiOleh()` |
| 68 | `pembayarans` | `tagihan_id` | `tagihans` | 1:N | `CASCADE` | `Pembayaran` | `tagihan()` |
| 69 | `periode_registrasis` | `tahun_ajaran_id` | `tahun_ajarans` | 1:N | `CASCADE` | `PeriodeRegistrasi` | `tahunAjaran()` |
| 70 | `prasyarat_matakuliahs` | `matakuliah_id` | `matakuliahs` | 1:N | `CASCADE` | `PrasyaratMatakuliah` | `matakuliah()` |
| 71 | `prasyarat_matakuliahs` | `matakuliah_prasyarat_id` | `matakuliahs` | 1:N | `CASCADE` | `PrasyaratMatakuliah` | `matakuliahPrasyarat()` |
| 72 | `presensis` | `jurnal_perkuliahan_id` | `jurnal_perkuliahans` | 1:N | `CASCADE` | `Presensi` | `jurnalPerkuliahan()` |
| 73 | `presensis` | `mahasiswa_id` | `mahasiswas` | 1:N | `CASCADE` | `Presensi` | `mahasiswa()` |
| 74 | `program_studis` | `fakultas_id` | `fakultas` | 1:N | `CASCADE` | `ProgramStudi` | `fakultas()` |
| 75 | `proposal_skripsis` | `dosen_pembimbing_id` | `dosens` | 1:N | `SET NULL` | `ProposalSkripsi` | `dosenPembimbing()` |
| 76 | `proposal_skripsis` | `mahasiswa_id` | `mahasiswas` | 1:N | `CASCADE` | `ProposalSkripsi` | `mahasiswa()` |
| 77 | `registrasi_ulangs` | `calon_mahasiswa_id` | `calon_mahasiswas` | 1:N | `SET NULL` | `RegistrasiUlang` | `calonMahasiswa()` |
| 78 | `registrasi_ulangs` | `mahasiswa_id` | `mahasiswas` | 1:N | `SET NULL` | `RegistrasiUlang` | `mahasiswa()` |
| 79 | `registrasi_ulangs` | `periode_registrasi_id` | `periode_registrasis` | 1:N | `CASCADE` | `RegistrasiUlang` | `periodeRegistrasi()` |
| 80 | `riwayat_jabatan_fungsionals` | `dosen_id` | `dosens` | 1:N | `CASCADE` | `RiwayatJabatanFungsional` | `dosen()` |
| 81 | `riwayat_pendidikan_dosens` | `dosen_id` | `dosens` | 1:N | `CASCADE` | `RiwayatPendidikanDosen` | `dosen()` |
| 82 | `role_has_permissions` | `permission_id` | `permissions` | 1:1 | `CASCADE` | - | - |
| 83 | `role_has_permissions` | `role_id` | `roles` | 1:1 | `CASCADE` | - | - |
| 84 | `setting_prodis` | `kurikulum_id` | `kurikulum_prodis` | 1:N | `SET NULL` | `SettingProdi` | `kurikulumProdi()` |
| 85 | `setting_prodis` | `program_studi_id` | `program_studis` | 1:N | `CASCADE` | `SettingProdi` | `programStudi()` |
| 86 | `setting_prodis` | `tahun_ajaran_id` | `tahun_ajarans` | 1:N | `CASCADE` | `SettingProdi` | `tahunAjaran()` |
| 87 | `skripsis` | `dosen_pembimbing_id` | `dosens` | 1:N | `SET NULL` | `Skripsi` | `dosenPembimbing()` |
| 88 | `skripsis` | `mahasiswa_id` | `mahasiswas` | 1:N | `CASCADE` | `Skripsi` | `mahasiswa()` |
| 89 | `status_akademik_historis` | `mahasiswa_id` | `mahasiswas` | 1:N | `CASCADE` | `StatusAkademikHistoris` | `mahasiswa()` |
| 90 | `status_akademik_historis` | `tahun_ajaran_id` | `tahun_ajarans` | 1:N | `CASCADE` | `StatusAkademikHistoris` | `tahunAjaran()` |
| 91 | `tagihans` | `mahasiswa_id` | `mahasiswas` | 1:N | `CASCADE` | `Tagihan` | `mahasiswa()` |
| 92 | `tagihans` | `tahun_ajaran_id` | `tahun_ajarans` | 1:N | `CASCADE` | `Tagihan` | `tahunAjaran()` |
| 93 | `wilayahs` | `parent_id` | `wilayahs` | 1:N | `SET NULL` | `Wilayah` | `parent()` |
| 94 | `yudisiums` | `mahasiswa_id` | `mahasiswas` | 1:N | `CASCADE` | `Yudisium` | `mahasiswa()` |
| 95 | `yudisiums` | `periode_wisuda_id` | `periode_wisudas` | 1:N | `SET NULL` | `Yudisium` | `periodeWisuda()` |

---

## 2. Matriks Entitas Asosiatif (Pivot Tables / Many-to-Many)

Sistem tidak pernah mengizinkan hubungan Many-to-Many secara langsung tanpa associative entity fisik. Berikut adalah daftar tabel perantara (pivot) yang memediasi relasi M:N:

| Entity A | Pivot Table (Associative Entity) | Entity B | Foreign Key A | Foreign Key B | Tujuan Bisnis Relasi |
|---|---|---|---|---|---|
| `roles` | `model_has_roles` | `users` | `role_id` | `model_id` (polymorphic) | Otorisasi peran multi-role ke pengguna pengguna sistem. |
| `permissions` | `model_has_permissions` | `users` | `permission_id` | `model_id` (polymorphic) | Pemberian izin granular khusus ke pengguna tertentu. |
| `roles` | `role_has_permissions` | `permissions` | `role_id` | `permission_id` | Bundling hak akses/izin ke dalam kelompok peran. |
| `kurikulum_prodis` | `kurikulum_matakuliahs` | `matakuliahs` | `kurikulum_prodi_id` | `matakuliah_id` | Penyusunan paket matakuliah per kurikulum angkatan. |
| `kelas_kuliahs` | `dosen_pengajars` | `dosens` | `kelas_kuliah_id` | `dosen_id` | Penugasan dosen pengampu mata kuliah (termasuk team teaching). |
| `krs` (Mahasiswa) | `krs_details` | `kelas_kuliahs` | `krs_id` | `kelas_kuliah_id` | Kontrak pengambilan rombel matakuliah oleh mahasiswa. |
| `matakuliahs` (Induk) | `prasyarat_matakuliahs` | `matakuliahs` (Syarat) | `matakuliah_id` | `prasyarat_id` | Relasi rekursif pemenuhan prasyarat kelulusan matakuliah. |
| `matakuliahs` (Lama) | `ekivalensi_matakuliahs` | `matakuliahs` (Baru) | `matakuliah_lama_id` | `matakuliah_baru_id` | Penyetaraan nilai pada masa transisi perubahan kurikulum. |

---

## 3. Relasi Khusus (Polymorphic & HasManyThrough)

| Model Asal | Jenis Relasi | Model Target | Kolom Penghubung / Tabel Perantara | Keterangan Fungsional |
|---|---|---|---|---|
| `User` | `MorphToMany` | `Role` | `model_has_roles` (`model_type`, `model_id`) | Multi-role otorisasi Spatie RBAC. |
| `User` | `MorphToMany` | `Permission` | `model_has_permissions` (`model_type`, `model_id`) | Direct permission Spatie RBAC. |
| `User` | `MorphMany` | `DatabaseNotification` | `notifications` (`notifiable_type`, `notifiable_id`) | Notifikasi in-app untuk dosen/mahasiswa/staf. |
| `ActivityLog` | Manual Polymorphic | Any Model | `activity_logs` (`entity_type`, `entity_id`) | Jejak audit CRUD tabel sistem. |
| `KelasKuliah` | `HasManyThrough` | `Presensi` | Via `JurnalPerkuliahan` (`kelas_kuliah_id` -> `jurnal_perkuliahan_id`) | Rekapitulasi seluruh presensi dalam satu rombel kelas. |

---
*Dokumentasi disusun oleh Senior Database Architect SIAKAD STAI Al-Yasini.*
