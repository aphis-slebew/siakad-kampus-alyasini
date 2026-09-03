# PRD — SIAKAD STAI Al-Yasini

Versi: 2.0 (menambahkan modul PMB, Registrasi Ulang, Keuangan/UKT, dan detail
data mahasiswa/dosen/staf)
Status: Draft untuk review internal tim (2 developer + pihak kampus)
Terakhir diperbarui: 28 Juli 2026

---

## 1. Latar belakang & tujuan

STAI Al-Yasini saat ini menggunakan SIAKAD dari provider pihak ketiga dengan biaya
langganan yang dinilai terlalu mahal. Kampus ingin mengelola sistem akademik sendiri
(self-hosted), dikembangkan dan dirawat oleh tim IT internal.

**Referensi fitur**: dokumen ini merujuk pada struktur modul SIM Akademik SEVIMA
(role Administrator) sebagai baseline kelengkapan fitur.

**Cakupan sistem (end-to-end)**: dokumen v2 ini memperjelas bahwa sistem
mencakup **seluruh siklus mahasiswa**, bukan hanya modul akademik murni:

```
PMB (calon mahasiswa) → Kelulusan seleksi → Registrasi ulang & pembayaran UKT
  → Aktif sebagai mahasiswa → KRS → Perkuliahan (presensi, nilai) → tiap semester
  → Registrasi ulang lagi → ... → Skripsi → Yudisium → Wisuda
```

**Prinsip pengembangan** (tidak berubah dari v1):
- Fitur harus menyamai kelengkapan SEVIMA — requirement dari kampus.
- Boleh disederhanakan (bukan dihilangkan), dicatat di §4 Feature Parity Matrix.
- UI dibuat versi sendiri, tidak meniru SEVIMA (lihat `03-UI-Theme.md`).
- Integrasi PD-DIKTI (Neo Feeder) didokumentasikan terpisah.

## 2. Tujuan produk

- Mengganti sistem SIAKAD berbayar dengan sistem internal yang setara secara fungsi,
  **termasuk alur pendaftaran mahasiswa baru dan pembayaran**, bukan hanya modul
  akademik pasca-mahasiswa-aktif.
- Menurunkan biaya operasional kampus.
- Memberi kampus kendali penuh atas data akademik dan keuangan mahasiswa.
- Menjaga standar keamanan data pribadi & finansial (lihat `04-Security.md`).

## 3. Peran pengguna (roles) — diperbarui

| Role | Deskripsi | Akses utama |
|---|---|---|
| Superadmin | Tim IT internal | Semua modul + user management + setting sistem |
| Admin Akademik (BAA) | Staf tata usaha/akademik | Master data, kelas, KRS, nilai, skripsi, yudisium, wisuda |
| Panitia PMB | Staf penerimaan mahasiswa baru | Kelola gelombang, jalur, verifikasi berkas pendaftar, jadwal seleksi, input hasil seleksi, pengumuman |
| Staf Keuangan (BAU) | Staf bagian keuangan/BAU | Kelompok UKT, tagihan, verifikasi pembayaran, laporan piutang |
| Kaprodi | Ketua program studi | Approval prodi-level: kurikulum, dosen wali, validasi bimbingan |
| Dosen | Pengajar / dosen wali / pembimbing | Presensi, input nilai, approval KRS (jika wali), bimbingan skripsi |
| Staf Kepegawaian | Staf HRD/kepegawaian kampus | Data dosen & pegawai, jabatan, unit kerja |
| Mahasiswa | Peserta didik (setelah aktif) | KRS, KHS, jadwal, presensi diri, progres skripsi, SKPI, tagihan & riwayat pembayaran pribadi |
| Calon Mahasiswa | Pendaftar PMB (belum jadi mahasiswa) | Login terbatas: isi biodata pendaftaran, upload berkas, lihat status seleksi |
| Operator Kemahasiswaan | Staf bagian kemahasiswaan | Aktivitas, pelanggaran, beasiswa |

Catatan penting: **Calon Mahasiswa** adalah entitas dan akun yang **terpisah**
dari **Mahasiswa** aktif — lihat penjelasan di §5.1 dan skema database §5.
Seseorang tidak otomatis "menjadi" baris yang sama; ada proses konversi eksplisit
saat dinyatakan lulus seleksi dan menyelesaikan registrasi ulang.

## 4. Feature Parity Matrix

Status: `Full` = sama persis alurnya dengan SEVIMA · `Disederhanakan` = alur dipangkas
tapi hasil akhir tetap sama · `Fase 2` = tidak masuk MVP.

### 4.0 Penerimaan Mahasiswa Baru (PMB) — modul baru di v2
| Fitur | Status | Catatan |
|---|---|---|
| Gelombang & jalur pendaftaran (reguler, prestasi, beasiswa) | Full | Tiap gelombang punya periode, kuota, dan biaya pendaftaran sendiri |
| Formulir biodata calon mahasiswa + pilihan prodi 1 & 2 | Full | |
| Upload berkas (ijazah/SKL, KK, KTP/akta, foto, dokumen prestasi) | Full | Validasi format & ukuran wajib (lihat `04-Security.md §3`) |
| Verifikasi berkas oleh Panitia PMB | Full | Status per berkas: diajukan/diverifikasi/ditolak dengan alasan |
| Jadwal seleksi (tes tulis/wawancara), lokasi/link online | Full | |
| Input hasil seleksi & penentuan kelulusan | Full | |
| Pengumuman kelulusan (mandiri, per calon mahasiswa login) | Full | |
| Pembayaran biaya pendaftaran | Disederhanakan | Pakai skema transfer manual + upload bukti + verifikasi staf di MVP, bukan payment gateway otomatis (lihat §4.2 keuangan untuk alasan yang sama) |

### 4.1 Registrasi Ulang (Her-registrasi) — modul baru di v2
| Fitur | Status | Catatan |
|---|---|---|
| Periode registrasi ulang per tahun ajaran/gelombang | Full | |
| Verifikasi kelengkapan dokumen asli (ijazah asli, dst) | Full | |
| Syarat lunas pembayaran UKT sebelum status aktif | Full | Terhubung ke modul keuangan §4.2 |
| Generate NIM & aktivasi akun mahasiswa (konversi dari calon mahasiswa) | Full | Proses ini men-generate baris `mahasiswas` + `users` baru, lihat §5 skema DB |
| Registrasi ulang semester berjalan (bukan mahasiswa baru) | Full | Status aktif/cuti/nonaktif per semester, prasyarat untuk bisa mengisi KRS |

### 4.2 Keuangan & Pembayaran UKT — modul baru di v2
| Fitur | Status | Catatan |
|---|---|---|
| Kelompok/golongan UKT per prodi | Full | |
| Penetapan kelompok UKT per mahasiswa (termasuk pengajuan keringanan) | Full | |
| Generate tagihan UKT per semester otomatis | Full | Dijalankan sebagai queue job di awal periode registrasi ulang |
| Pembayaran & verifikasi bukti transfer | Disederhanakan | MVP: transfer manual ke rekening kampus + upload bukti + verifikasi staf keuangan. **Bukan** payment gateway/VA otomatis di fase awal — mengurangi kompleksitas & biaya integrasi bank, staf keuangan tetap bisa verifikasi manual seperti kebiasaan sekarang |
| Cicilan pembayaran | Full | Karena ini kebutuhan riil banyak mahasiswa, tidak disederhanakan |
| Riwayat tagihan & pembayaran per mahasiswa | Full | Mahasiswa bisa lihat sendiri di portal |
| Laporan piutang/tunggakan per prodi/angkatan | Full | Untuk staf keuangan & pimpinan |
| Integrasi payment gateway/Virtual Account otomatis | Fase 2 | Ditambahkan setelah MVP terbukti stabil, kalau kampus mau upgrade dari transfer manual |

### 4.3 Data Dosen (detail) — diperluas dari v1
| Fitur | Status | Catatan |
|---|---|---|
| Biodata lengkap dosen (NIDN, gelar, TTL, kontak, alamat) | Full | |
| Riwayat pendidikan (S1/S2/S3, institusi, tahun lulus) | Full | |
| Jabatan fungsional akademik (Asisten Ahli → Guru Besar) & riwayat kenaikan jabatan | Full | Dibutuhkan untuk pelaporan & syarat pembimbing skripsi (jenjang jabatan tertentu) |
| Status kepegawaian (tetap/tidak tetap/DPK) & homebase prodi | Full | |
| Sertifikasi pendidik (Serdos) | Full | |
| Riwayat penugasan mengajar per semester | Full | Terhubung ke `dosen_pengajars` (modul kelas kuliah) |

### 4.4 Data Mahasiswa (detail) — diperluas dari v1
| Fitur | Status | Catatan |
|---|---|---|
| Biodata lengkap (NIK, TTL, alamat KTP & domisili, kontak, foto) | Full | |
| Data orang tua/wali (nama, pekerjaan, penghasilan, kontak darurat) | Full | |
| Status akademik per semester (aktif/cuti/nonaktif/lulus/DO) | Full | Riwayat status disimpan, bukan hanya status terakhir |
| Riwayat asal sekolah & jalur masuk | Full | Terhubung ke data PMB (`calon_mahasiswa_id`) |

### 4.5 Staf Non-Dosen / Kepegawaian Umum — modul baru di v2
| Fitur | Status | Catatan |
|---|---|---|
| Data unit kerja/bagian kampus (BAA, BAU, Kemahasiswaan, Perpustakaan, dst) | Full | |
| Biodata pegawai (NIP/NIK internal, nama, kontak, alamat) | Full | |
| Jabatan struktural & unit kerja penempatan | Full | |
| Status kepegawaian | Full | |

### 4.6 Master Data & Referensi Akademik
| Fitur SEVIMA | Status | Catatan |
|---|---|---|
| Data referensi perguruan tinggi, fakultas, jurusan, prodi, konsentrasi | Full | |
| Tingkat pendidikan, sistem kuliah, ruang kuliah | Full | |
| Kalender akademik, kegiatan akademik | Full | |
| Data referensi biodata (agama, pekerjaan, suku, penghasilan) | Disederhanakan | Digabung jadi satu master dengan kolom `tipe` |
| Data referensi wilayah | Disederhanakan | Pakai dataset wilayah Indonesia publik + override manual |
| Universitas luar, perusahaan, contact person | Fase 2 | |

### 4.7 Kurikulum & Kelas Kuliah — sama seperti v1
Lihat detail di skema database §9. Tidak ada perubahan status dari v1.

### 4.8 Perwalian & KRS — sama seperti v1
Tambahan v2: KRS mensyaratkan status registrasi ulang semester tersebut = selesai
DAN tagihan UKT semester tersebut = lunas/cicilan disetujui (lihat §5 skema DB).

### 4.9 Realisasi Perkuliahan & Penilaian — sama seperti v1

### 4.10 Skripsi, Yudisium & Wisuda — sama seperti v1

### 4.11 Kemahasiswaan — sama seperti v1

### 4.12 Integrasi PD-DIKTI
Terpisah — dokumen `05-Neo-Feeder-Integration.md` menyusul.

## 5. Alur konversi Calon Mahasiswa → Mahasiswa Aktif (penting untuk developer)

Ini bagian yang paling sering jadi sumber bug kalau tidak jelas — dijabarkan
eksplisit supaya AI coding agent maupun developer tidak salah asumsi:

1. Pendaftar mengisi form PMB → tersimpan di `calon_mahasiswas` (BUKAN
   `mahasiswas`). Punya akun login sendiri (role `calon_mahasiswa`) yang
   **tidak sama** dengan akun mahasiswa nantinya.
2. Setelah dinyatakan lulus seleksi (`hasil_seleksis.status = 'lulus'`) DAN
   menyelesaikan registrasi ulang (`registrasi_ulangs.status = 'selesai'`,
   termasuk lunas biaya awal), sistem menjalankan **service konversi**:
   - Generate NIM baru sesuai format kampus.
   - Buat baris baru di `mahasiswas` (data biodata disalin dari
     `calon_mahasiswas`, plus field yang hanya dimiliki mahasiswa aktif seperti
     `status_mahasiswa`, `program_studi_id` final).
   - Buat baris baru di `users` dengan role `mahasiswa` (akun baru, bukan
     mengubah akun `calon_mahasiswa` yang lama).
   - Set `mahasiswas.calon_mahasiswa_id` untuk menjaga jejak riwayat pendaftaran.
   - Akun `calon_mahasiswa` lama tetap ada (untuk histori) tapi tidak lagi
     dipakai untuk login akademik.
3. Mahasiswa baru bisa mulai proses KRS **hanya setelah** langkah 2 selesai —
   jangan izinkan KRS berdasarkan status "lulus seleksi" saja.

## 6. Fase pengerjaan (disarankan, diperbarui)

1. **Fase 1 (MVP)** — Master data, PMB dasar (gelombang, biodata, upload
   berkas, hasil seleksi), registrasi ulang & keuangan UKT dasar (transfer
   manual), kurikulum & kelas, KRS & perwalian, presensi & nilai, portal
   mahasiswa/dosen dasar.
2. **Fase 2** — Skripsi, yudisium, wisuda, kemahasiswaan, laporan lanjutan,
   cicilan pembayaran lanjutan.
3. **Fase 3** — Integrasi PD-DIKTI (Neo Feeder), payment gateway/VA otomatis,
   fitur bertanda "Fase 2" lainnya di matrix.

## 7. Non-functional requirements

Tidak berubah dari v1 — lihat `04-Security.md` untuk detail keamanan dan
`02-Database-Schema.md` untuk skema lengkap. Tambahan khusus v2: proses
pembayaran & verifikasi bukti transfer wajib tercatat di `activity_logs`
(siapa memverifikasi, kapan, nominal) karena menyangkut uang.

## 8. Asumsi & pertanyaan terbuka (diperbarui)

- Asumsi: pembayaran UKT tahap awal pakai transfer manual + verifikasi staf
  (bukan payment gateway), sesuai keputusan penyederhanaan di §4.2.
- Asumsi (Laporan): kaprodi diasumsikan sama dengan homebase prodi dosen (dosens.program_studi_id). Sistem BELUM punya tabel eksplisit 'kaprodi memimpin prodi X' — kalau di masa depan 1 dosen bisa jadi kaprodi prodi yang BUKAN homebase-nya, perlu tabel relasi terpisah.
- Terbuka: apakah kampus punya rekening bank khusus per prodi/jalur, atau satu

  rekening kampus untuk semua pembayaran?
- Terbuka: format NIM kampus (dipakai untuk generate NIM otomatis saat
  konversi calon mahasiswa → mahasiswa).
- Terbuka: kebijakan kelompok UKT — apakah ditentukan otomatis dari data
  penghasilan orang tua saat PMB, atau selalu manual oleh staf keuangan?
- Terbuka (dari v1, masih berlaku): kebijakan retensi data, pemisahan
  dosen wali vs dosen pengajar.

## 9. Pembagian kerja disarankan (2 developer) — diperbarui

| Developer | Fokus modul |
|---|---|
| Dev A | PMB, registrasi ulang, keuangan/UKT, master data & referensi, kurikulum & kelas, KRS & perwalian |
| Dev B | Data dosen/pegawai & kepegawaian, realisasi & nilai, skripsi & yudisium, kemahasiswaan, laporan |

Keduanya berbagi: auth/RBAC inti dan struktur database (dikerjakan bersama di
awal). Karena PMB → registrasi ulang → keuangan adalah satu alur berurutan,
disarankan **satu developer yang sama** memegang ketiganya (bukan dipecah ke
2 orang) supaya tidak ada miskomunikasi soal state transition di §5.
