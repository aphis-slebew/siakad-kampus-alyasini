# Dokumentasi Swimlane Flowchart (Diagram Alur Lintas Fungsi)
## Sistem Informasi Akademik (SIAKAD) STAI Al-Yasini Pasuruan

Dokumen ini memetakan seluruh prosedur operasional dan alur kerja lintas fungsi (*Cross-Functional / Swimlane Workflow*) pada aplikasi **SIAKAD STAI Al-Yasini**. Setiap diagram memisahkan tanggung jawab antara aktor/peran pengguna (**Role/User**) dengan pemrosesan otomatis di sisi sistem (**Sistem SIAKAD**).

---

## Daftar Role yang Terlibat dalam Sistem

Sistem mengimplementasikan 10 peran pengguna resmi sesuai dengan otorisasi berbasis Spatie Permission & Fortify:
1. **Superadmin**: Tim IT pengelola infrastruktur, audit log, monitoring sistem, dan manajemen user/impersonasi.
2. **Admin Akademik (BAA)**: Staf Biro Administrasi Akademik pengelola master data, kurikulum, plotting kelas, konversi mahasiswa, dan cetak dokumen resmi.
3. **Kaprodi**: Ketua Program Studi penanggung jawab kurikulum prodi, persetujuan proposal skripsi, dan konfigurasi setting prodi.
4. **Dosen**: Dosen pengajar, dosen pembimbing akademik (DPA/Wali), dan dosen pembimbing skripsi.
5. **Mahasiswa**: Peserta didik aktif pengontrak KRS, pemantau perkuliahan, pembayar UKT, dan pendaftar tugas akhir.
6. **Calon Mahasiswa**: Akun pendaftar jalur PMB sebelum resmi berstatus mahasiswa aktif.
7. **Panitia PMB**: Staf verifikator berkas pendaftaran, pengatur jadwal tes, dan input hasil seleksi penerimaan.
8. **Staf Keuangan (BAU)**: Pengelola tarif komponen biaya, verifikator transfer bank, dan operator kasir loket TU.
9. **Operator Kemahasiswaan**: Pengelola catatan beasiswa mahasiswa, aktivitas/prestasi, dan pelanggaran disiplin.
10. **Staf Kepegawaian**: Pengelola data dosen (NIDN, riwayat jabatan fungsional, pendidikan) dan pegawai staf kampus.

---

## 1. Alur Autentikasi, Login, & Impersonasi Sesi

### Nama Proses
Alur Autentikasi Pengguna, Proteksi Fortify, dan Impersonasi Superadmin

* **Tujuan:** Memvalidasi kredensial pengguna, mengarahkan dashboard sesuai hak akses (*role-based redirection*), dan memfasilitasi audit/bantuan teknis melalui sesi impersonasi aman.
* **Role terlibat:** `Pengguna (Semua Role)`, `Superadmin`, `Sistem SIAKAD`.
* **Trigger:** Pengguna membuka halaman login (`/login`) atau Superadmin mengakses menu manajemen pengguna.
* **Output:** Sesi autentikasi terverifikasi, token sesi aktif, atau pemulihan sesi asli Superadmin.

```mermaid
flowchart TD
    subgraph Pengguna ["Lane: Pengguna (Semua Role)"]
        P1["Akses Halaman Login (/login)"] --> P2["Input Email/Username & Password"]
        P2 --> P3["Klik Tombol Masuk"]
        P4["Menerima Dashboard Sesuai Role"]
        P5["Akses Menu / Fitur Sistem"]
    end

    subgraph SuperadminLane ["Lane: Superadmin (Khusus IT)"]
        SA1["Akses Daftar User (/users)"] --> SA2["Pilih Akun User Tertentu"]
        SA2 --> SA3["Klik Tombol: Impersonate User"]
        SA4["Menguji Kendala User secara Langsung"] --> SA5["Klik Banner: Leave Impersonation"]
    end

    subgraph Sistem ["Lane: Sistem SIAKAD (Backend & Fortify)"]
        S1{"Cek Throttling & Rate Limiting"}
        S2{"Validasi Kredensial & Password Hash"}
        S3["Catat Percobaan Gagal & Kirim Pesan Error"]
        S4["Inisialisasi Sesi Login & Muat Spatie Permissions"]
        S5{"Evaluasi Role / User Type"}
        S6["Redirect: Dashboard Mahasiswa"]
        S7["Redirect: Dashboard Dosen"]
        S8["Redirect: Dashboard Staff/Admin"]
        
        SIMP1["Simpan 'impersonator_id' ke Session"]
        SIMP2["Login-kan Auth Sesi sebagai Target User"]
        SIMP3["Pulihkan Sesi Auth Superadmin Asli"]
        SIMP4["Hapus 'impersonator_id' dari Session"]
    end

    P3 --> S1
    S1 -- "Limit Terlampaui" --> S3 --> P1
    S1 -- "Aman" --> S2
    S2 -- "Kredensial Salah" --> S3
    S2 -- "Kredensial Valid" --> S4
    S4 --> S5
    S5 -- "Mahasiswa" --> S6 --> P4
    S5 -- "Dosen" --> S7 --> P4
    S5 -- "Admin / Staff" --> S8 --> P4
    P4 --> P5

    SA3 --> SIMP1 --> SIMP2 --> SA4
    SA5 --> SIMP3 --> SIMP4 --> SA1
```

---

## 2. Alur Dashboard & Notifikasi Terpadu

### Nama Proses
Alur Agregasi Dashboard Metrik dan Manajemen Notifikasi Pengguna

* **Tujuan:** Menyajikan ringkasan metrik akademik real-time sesuai spesialisasi peran dan mengelola umpan notifikasi sistem (*read/mark all read*).
* **Role terlibat:** `Mahasiswa / Dosen / Staf`, `Sistem SIAKAD`.
* **Trigger:** Pengguna berhasil login dan diarahkan ke rute `/dashboard` atau membuka panel lonceng `/notifications`.
* **Output:** Tampilan ringkasan metrik profil (SKS, IPK, jadwal, tagihan, bimbingan) dan pembaharuan status baca notifikasi.

```mermaid
flowchart TD
    subgraph UserLane ["Lane: Pengguna (Mahasiswa / Dosen / Staf)"]
        U1["Akses Rute /dashboard"]
        U2["Melihat Kartu Ringkasan Metrik"]
        U3["Klik Ikon Lonceng Notifikasi"]
        U4["Pilih Notifikasi Spesifik / Tandai Semua Dibaca"]
    end

    subgraph SistemLane ["Lane: Sistem SIAKAD (DashboardController & NotificationController)"]
        D1{"Deteksi Hak Akses Role"}
        D2["Query Metrik Mahasiswa:\n- IPK & SKS Tempuh\n- Status Tagihan UKT\n- Jadwal Kuliah Hari Ini"]
        D3["Query Metrik Dosen:\n- Jumlah Jadwal Mengajar\n- Antrean Validasi KRS\n- Log Bimbingan Skripsi"]
        D4["Query Metrik BAA & Keuangan:\n- Total Mahasiswa Aktif\n- Total Pendaftar PMB\n- Rekapitulasi Piutang UKT"]
        D5["Render View Dashboard Inertia React"]
        
        N1["Query Notifikasi Aktif Belum Dibaca (unreadNotifications)"]
        N2["Tampilkan Popover & Daftar Notifikasi"]
        N3["Eksekusi: markAsRead() / markAllAsRead()"]
        N4["Update Timestamp read_at pada Basis Data"]
    end

    U1 --> D1
    D1 -- "Mahasiswa" --> D2 --> D5 --> U2
    D1 -- "Dosen" --> D3 --> D5 --> U2
    D1 -- "BAA / BAU" --> D4 --> D5 --> U2

    U3 --> N1 --> N2 --> U4
    U4 --> N3 --> N4
```

---

## 3. Alur Manajemen Pengguna, Hak Akses, & Audit Monitoring

### Nama Proses
Alur Pengelolaan Akun Pengguna, Penetapan Role Spatie, Reset Sandi, dan Pemantauan Audit Sistem

* **Tujuan:** Memberikan wewenang penuh kepada Superadmin untuk mengelola identitas pengguna, mereset kata sandi, dan memonitor aktivitas audit trail sistem.
* **Role terlibat:** `Superadmin`, `Pengguna Terkait`, `Sistem SIAKAD`.
* **Trigger:** Penambahan staf baru, mutasi jabatan, kendala lupa sandi, atau audit berkala sistem IT.
* **Output:** Akun pengguna terdaftar/terperbarui, hash password baru, dan pencatatan riwayat di `activity_logs`.

```mermaid
flowchart TD
    subgraph SuperadminLane ["Lane: Superadmin"]
        SA1["Buka Menu Pengguna: /users"]
        SA2["Pilih Tindakan:\nTambah User / Edit Role / Reset Password"]
        SA3["Kirim Form Input Data Pengguna"]
        SA4["Akses Menu Monitoring: /superadmin/monitoring"]
        SA5["Audit Log Mutasi & Kesehatan Sistem"]
    end

    subgraph UserLane ["Lane: Pengguna Terkait"]
        U1["Menerima Kredensial Baru / Sandi Hasil Reset"]
        U2["Login Menggunakan Kata Sandi Sementara"]
        U3["Melakukan Perubahan Kata Sandi Mandiri"]
    end

    subgraph SistemLane ["Lane: Sistem SIAKAD (UserManagementController & ActivityLog)"]
        S1{"Validasi Format Input & Keunikan Email"}
        S2["Tampilkan Pesan Validasi Gagal"]
        S3["Simpan Data ke Tabel users"]
        S4["Sinkronisasi Role Spatie (syncRoles)"]
        S5["Enkripsi Password dengan Bcrypt Hash"]
        S6["Catat Mutasi Akun ke Tabel activity_logs"]
        S7["Eksekusi Monitoring Status Antrean Job & Database"]
    end

    SA1 --> SA2 --> SA3 --> S1
    S1 -- "Duplikasi Email / Format Salah" --> S2 --> SA3
    S1 -- "Valid" --> S3 --> S4 --> S5 --> S6
    S5 --> U1 --> U2 --> U3
    SA4 --> S7 --> SA5
```

---

## 4. Alur Penerimaan Mahasiswa Baru (PMB) & Konversi Mahasiswa

### Nama Proses
Alur Pendaftaran PMB Online, Verifikasi Berkas, Seleksi Masuk, hingga Layanan Konversi Otomatis

* **Tujuan:** Menangani pendaftaran calon mahasiswa secara mandiri, proses seleksi oleh panitia, verifikasi administrasi registrasi ulang, dan otomatisasi konversi menjadi mahasiswa resmi.
* **Role terlibat:** `Calon Mahasiswa`, `Panitia PMB`, `Admin Akademik (BAA)`, `Sistem SIAKAD`.
* **Trigger:** Calon mahasiswa mengakses formulir pendaftaran publik `/pmb/daftar`.
* **Output:** Berkas terverifikasi, kartu ujian seleksi, nilai hasil seleksi, penerbitan NIM resmi, akun login mahasiswa aktif, dan pemindahan status ke tabel `mahasiswas`.

```mermaid
flowchart TD
    subgraph CalonMhs ["Lane: Calon Mahasiswa"]
        CM1["Akses Portal PMB: /pmb/daftar"] --> CM2["Isi Biodata, NIK, Asal Sekolah & 2 Prodi"]
        CM2 --> CM3["Submit & Terima Akun role:calon_mahasiswa"]
        CM3 --> CM4["Unggah Berkas: Ijazah, KTP, KK, & Pasfoto"]
        CM5["Perbaiki & Unggah Ulang Berkas"]
        CM6["Melihat Pengumuman Kelulusan"]
        CM7["Unggah Dokumen Registrasi Fisik / Asli"]
    end

    subgraph PanitiaPMB ["Lane: Panitia PMB"]
        P1["Buka Antrean Berkas: /pmb/calon-mahasiswa"]
        P2{"Pemeriksaan Keabsahan Berkas"}
        P3["Tolak Berkas + Berikan Catatan Perbaikan"]
        P4["Verifikasi Setujui Berkas"]
        P5["Atur Jadwal & Ruang Tes Seleksi Masuk"]
        P6["Input Nilai Ujian & Putusan: Lulus / Tidak"]
    end

    subgraph AdminBAA ["Lane: Admin Akademik (BAA)"]
        B1["Validasi Dokumen Fisik Her-Registrasi"]
        B2{"Kelengkapan Dokumen & UKT Awal?"}
        B3["Klik Tombol: Konversi Mahasiswa"]
    end

    subgraph Sistem ["Lane: Sistem SIAKAD (PmbController & CalonMahasiswaController)"]
        S1["Cek Keunikan NIK & Generate Akun Calon Mhs"]
        S2["Simpan Berkas ke Storage & Update Status Berkas"]
        S3["Kirim Notifikasi Status Berkas ke Calon Mhs"]
        S4["Simpan Jadwal Ujian Seleksi"]
        S5["Terbitkan Status Pengumuman Hasil Seleksi"]
        
        SK1["Generate NIM Resmi Berdasarkan Format Prodi & Angkatan"]
        SK2["Insert Record Baru ke Tabel mahasiswas"]
        SK3["Insert Record User Baru (role: mahasiswa)"]
        SK4["Tautkan calon_mahasiswa_id & Nonaktifkan Akun PMB"]
    end

    CM1 --> CM2 --> CM3 --> S1 --> CM4 --> S2 --> P1
    P1 --> P2
    P2 -- "Tidak Sah / Kurang" --> P3 --> S3 --> CM5 --> S2
    P2 -- "Sah & Lengkap" --> P4 --> P5 --> S4
    P5 --> P6 --> S5 --> CM6
    CM6 -- "Lulus Seleksi" --> CM7 --> B1 --> B2
    B2 -- "Belum Lengkap" --> CM7
    B2 -- "Lengkap & Valid" --> B3 --> SK1 --> SK2 --> SK3 --> SK4
```

---

## 5. Alur Keuangan: UKT, Beasiswa, & Kasir POS Loket TU

### Nama Proses
Alur Penetapan Tagihan Semesteran, Otomatisasi Subsidi Beasiswa, Pembayaran Loket Kasir POS, dan Verifikasi Transfer Online

* **Tujuan:** Mengelola penagihan biaya pendidikan mahasiswa, memfasilitasi dua kanal pembayaran (langsung di loket TU vs transfer bank/cicilan mandiri), serta membuka kunci registrasi akademik (bebas cekal).
* **Role terlibat:** `Mahasiswa`, `Staf Keuangan (BAU) / Kasir`, `Sistem SIAKAD`.
* **Trigger:** Pergantian semester akademik atau mahasiswa datang melakukan transaksi di loket TU.
* **Output:** Tagihan berstatus Lunas, kuitansi resmi loket, pembebasan cekal keuangan, dan pembukaan akses pengisian KRS.

```mermaid
flowchart TD
    subgraph MhsLane ["Lane: Mahasiswa"]
        M1["Akses Portal Keuangan: /keuangan/bayar"]
        M2{"Pilih Skema Bayar"}
        M3["Ajukan Permohonan Cicilan Biaya"]
        M4["Transfer Bank Sesuai Nominal Tagihan"]
        M5["Unggah Foto Bukti Transfer Bank"]
        M6["Datang Langsung ke Loket TU Kampus"]
        M7["Menerima Kuitansi Resmi Pembayaran"]
    end

    subgraph KeuanganLane ["Lane: Staf Keuangan (BAU) / Kasir Loket"]
        K1["Jalankan Generator Tagihan Massal Semesteran"]
        K2{"Verifikasi Pengajuan Cicilan Mahasiswa"}
        K3["Setujui Skema Termin Cicilan"]
        K4["Periksa Rekening Koran / Bukti Transfer"]
        K5{"Apakah Dana Valid Masuk?"}
        K6["Tolak Pembayaran + Beri Alasan"]
        K7["Verifikasi Pembayaran: Status LUNAS"]
        
        POS1["Buka Menu Kasir POS: /keuangan/kasir"]
        POS2["Pindai Barcode / Ketik NIM Mahasiswa"]
        POS3["Pilih Metode: Tunai, QRIS, Debit, atau EDC"]
        POS4["Klik Simpan Pembayaran Loket"]
        POS5["Cetak Kuitansi Resmi Pembayaran POS"]
    end

    subgraph SistemLane ["Lane: Sistem SIAKAD (KeuanganController & KasirController)"]
        S1["Cek Tabel beasiswa_mahasiswas"]
        S2{"Mahasiswa Terdaftar Penerima Beasiswa?"}
        S3["Generate Tagihan Rp 0 (Diskon 100% / Status Lunas)"]
        S4["Generate Tagihan Nominal Penuh per Kelompok UKT"]
        S5["Pecah Record Tagihan Menjadi Multi-Termin Cicilan"]
        S6["Simpan Bukti Pembayaran ke Storage"]
        S7["Update Status Pembayaran & Catat ke Audit Log"]
        S8["Buka Akses Registrasi Ulang & Hapus Status Cekal"]
    end

    K1 --> S1 --> S2
    S2 -- "Ya (Beasiswa)" --> S3 --> S8
    S2 -- "Tidak" --> S4 --> M1

    M1 --> M2
    M2 -- "Jalur Cicilan" --> M3 --> K2
    K2 -- "Disetujui" --> K3 --> S5 --> M4
    M2 -- "Bayar Penuh Transfer" --> M4 --> M5 --> S6 --> K4 --> K5
    K5 -- "Tidak Valid" --> K6 --> M5
    K5 -- "Valid" --> K7 --> S7 --> S8

    M2 -- "Jalur Loket TU" --> M6 --> POS1 --> POS2 --> POS3 --> POS4
    POS4 --> S7 --> POS5 --> M7
```

---

## 6. Alur Master Data Akademik, Kurikulum, & Setting Periode Prodi

### Nama Proses
Alur Penyusunan Kurikulum, Penjadwalan Kelas Kuliah, Proteksi Bentrok, dan Konfigurasi Setting Prodi 4-Tab

* **Tujuan:** Menjamin kesiapan data kurikulum, jadwal dosen, kapasitas ruangan, dan penetapan kebijakan operasional (KRS, KHS, ambang batas ujian) sebelum semester perkuliahan dibuka.
* **Role terlibat:** `Kaprodi`, `Admin Akademik (BAA)`, `Sistem SIAKAD`.
* **Trigger:** Rapat persiapan semester baru oleh pimpinan program studi dan BAA.
* **Output:** Master kurikulum terstruktur, jadwal kelas bebas bentrok, penugasan DPA (dosen wali), dan status operasional layanan terbuka.

```mermaid
flowchart TD
    subgraph KaprodiLane ["Lane: Ketua Program Studi (Kaprodi)"]
        KP1["Susun Struktur Kurikulum & Mata Kuliah"]
        KP2["Tentukan Prasyarat Mata Kuliah & Ekivalensi"]
        KP3["Review & Verifikasi Jadwal Perkuliahan Prodi"]
        KP4["Buka Panel Setting Prodi (4-Tab Panel)"]
        KP5["Tentukan Batas Presensi Ujian: UTS 50%, UAS 75%"]
        KP6["Opsi: Klik 1-Klik Salin Pengaturan (Rollover)"]
    end

    subgraph AdminBAALane ["Lane: Admin Akademik (BAA)"]
        BAA1["Input Master Ruang Kuliah & Fakultas"]
        BAA2["Buka Menu Penjadwalan: /akademik/kelas-kuliah"]
        BAA3["Input: Mata Kuliah, Dosen, Hari, Jam, & Ruang"]
        BAA4["Penugasan Dosen Wali (DPA) via /dosen-wali"]
        BAA5["Gunakan Fitur Rollover Dosen Wali dari Semester Lalu"]
    end

    subgraph SistemLane ["Lane: Sistem SIAKAD (Kurikulum, KelasKuliah, SettingProdi)"]
        S1["Simpan Kurikulum, Mata Kuliah, & Aturan Prasyarat"]
        S2{"Validasi Proteksi Bentrok Otomatis"}
        S3["Error Bentrok: Dosen Mengajar di Kelas Lain pada Jam Sama"]
        S4["Error Bentrok: Ruangan Sedang Dipakai pada Jam Sama"]
        S5["Simpan Jadwal Kelas Kuliah & Plotting Kuota"]
        S6["Simpan Data Dosen Wali & Mahasiswa Bimbingan"]
        S7["Simpan Parameter Setting Prodi ke Tabel setting_prodis"]
        S8["Aktifkan Periode Akademik untuk Mahasiswa & Dosen"]
    end

    KP1 --> KP2 --> S1
    BAA1 --> BAA2 --> BAA3 --> S2
    S2 -- "Bentrok Jadwal Dosen" --> S3 --> BAA3
    S2 -- "Bentrok Ruang Kelas" --> S4 --> BAA3
    S2 -- "Jadwal Aman / Lolos Validasi" --> S5
    
    BAA4 --> BAA5 --> S6
    KP3 --> KP4 --> KP5 --> S7
    KP6 --> S7 --> S8
```

---

## 7. Alur Kontrak KRS & Approval Dosen Pembimbing Akademik (DPA)

### Nama Proses
Alur Pengisian Kartu Rencana Studi (KRS) Online, Validasi Prasyarat Otomatis, dan Evaluasi Dosen Pembimbing Akademik

* **Tujuan:** Memfasilitasi mahasiswa dalam merencanakan studi semesteran secara tertib, memvalidasi beban SKS berbasis IP sebelumnya, dan memperoleh verifikasi akademik resmi dari Dosen Wali.
* **Role terlibat:** `Mahasiswa`, `Dosen Wali (DPA)`, `Sistem SIAKAD`.
* **Trigger:** Mahasiswa telah menyelesaikan pembayaran UKT/her-registrasi dan periode pengisian KRS dibuka oleh Kaprodi.
* **Output:** Rencana studi tervalidasi, status KRS terkunci (disetujui), penerbitan cetak KRS resmi, dan nama mahasiswa terdaftar di presensi kelas dosen.

```mermaid
flowchart TD
    subgraph MhsLane ["Lane: Mahasiswa"]
        M1["Akses Portal KRS: /krs/saya"]
        M2["Memilih Paket / Kelas Mata Kuliah"]
        M3["Koreksi Beban SKS / Ganti Kelas Lain"]
        M4["Simpan Draft Rencana Studi"]
        M5["Klik Tombol: Ajukan KRS ke Dosen Wali"]
        M6["Menerima Notifikasi Catatan Penolakan DPA"]
        M7["Cetak Formulir Kartu Rencana Studi Resmi"]
    end

    subgraph DpaLane ["Lane: Dosen Wali (DPA)"]
        D1["Akses Portal Perwalian: /perwalian/krs"]
        D2["Pilih Mahasiswa Bimbingan dalam Antrean"]
        D3["Periksa Kesesuaian Mata Kuliah & Beban SKS"]
        D4{"Keputusan Review Rencana Studi"}
        D5["Klik Reject + Berikan Catatan Perbaikan"]
        D6["Klik Approve KRS Mahasiswa"]
    end

    subgraph SistemLane ["Lane: Sistem SIAKAD (KrsController & SettingProdi)"]
        S1{"Cek Status Bebas Cekal & Registrasi Ulang"}
        S2{"Cek Status Pembukaan Periode KRS (SettingProdi)"}
        S3["Tolak Akses: Lunasi UKT / Tunggu Jadwal KRS"]
        S4["Hitung Batas Maksimum SKS Berbasis IPS Semester Lalu"]
        S5{"Validasi Syarat Tambah Matakuliah"}
        S6["Error: Total SKS Melebihi Kuota Maksimum"]
        S7["Error: Prasyarat Mata Kuliah Belum Terpenuhi"]
        S8["Error: Kuota Kursi Kelas Kuliah Penuh"]
        S9["Simpan Detail KRS Mahasiswa & Status DRAFT"]
        S10["Ubah Status KRS Menjadi SUBMITTED & Notifikasi DPA"]
        S11["Ubah Status KRS Menjadi REJECTED & Kirim Catatan"]
        S12["Ubah Status KRS Menjadi APPROVED (Kunci KRS)"]
        S13["Injeksi Nama Mahasiswa ke Daftar Presensi & Nilai Kelas"]
    end

    M1 --> S1
    S1 -- "Ada Cekal / Belum Lunas" --> S3
    S1 -- "Lunas" --> S2
    S2 -- "Tutup" --> S3
    S2 -- "Buka" --> S4 --> M2

    M2 --> S5
    S5 -- "SKS Melebihi Batas" --> S6 --> M3 --> M2
    S5 -- "Prasyarat Belum Lulus" --> S7 --> M3 --> M2
    S5 -- "Kelas Penuh" --> S8 --> M3 --> M2
    S5 -- "Lolos Validasi" --> S9 --> M4 --> M5 --> S10 --> D1

    D1 --> D2 --> D3 --> D4
    D4 -- "Perlu Perbaikan" --> D5 --> S11 --> M6 --> M2
    D4 -- "Disetujui" --> D6 --> S12 --> S13 --> M7
```

---

## 8. Alur Perkuliahan, Presensi, Kartu Ujian, & Penilaian (KHS)

### Nama Proses
Alur Tatap Muka Perkuliahan 16 Pertemuan, Evaluasi Ambang Presensi Ujian (50% / 75%), dan Pembobotan Penilaian KHS

* **Tujuan:** Merekam realisasi perkuliahan mingguan, mengevaluasi hak keikutsertaan ujian secara otomatis berdasarkan kehadiran, memfasilitasi dosen menginput nilai multi-komponen, dan menerbitkan KHS.
* **Role terlibat:** `Mahasiswa`, `Dosen Pengajar`, `Sistem SIAKAD`.
* **Trigger:** Semester perkuliahan aktif berjalan hingga masa ujian dan akhir semester.
* **Output:** Rekapitulasi jurnal presensi, kartu ujian UTS/UAS terverifikasi, nilai akhir angka & huruf, serta indeks prestasi (IPS/IPK) mahasiswa.

```mermaid
flowchart TD
    subgraph DosenLane ["Lane: Dosen Pengajar"]
        D1["Masuk Kelas Perkuliahan (Pertemuan 1 - 16)"]
        D2["Input Jurnal: Materi, Tanggal, Jam Masuk & Keluar"]
        D3["Input Presensi Mahasiswa: Hadir, Izin, Sakit, Alpa"]
        D4["Akses Portal Penilaian: /akademik/penilaian"]
        D5["Atur Bobot Komposisi: Tugas, Presensi, UTS, UAS = 100%"]
        D6["Input Nilai Angka Mahasiswa (Skala 0 - 100)"]
        D7["Klik Tombol: Finalisasi & Kunci Nilai"]
    end

    subgraph MhsLane ["Lane: Mahasiswa"]
        M1["Mengikuti Perkuliahan Mingguan"]
        M2["Memantau Persentase Presensi via /mahasiswa/presensi"]
        M3["Menerima Cekal Ujian (Kehadiran Kurang)"]
        M4["Cetak Kartu Ujian UTS / UAS Resmi"]
        M5["Mengikuti Evaluasi Ujian UTS / UAS"]
        M6["Melihat KHS Semester Aktif via /khs/saya"]
        M7["Cetak Dokumen Resmi KHS & Transkrip"]
    end

    subgraph SistemLane ["Lane: Sistem SIAKAD (Presensi, Penilaian, KhsController)"]
        S1["Simpan Record Jurnal & Presensi Perkuliahan"]
        S2["Kalkulasi Otomatis Persentase Kehadiran Tiap Mahasiswa"]
        S3{"Evaluasi Ambang Kehadiran Ujian (SettingProdi)"}
        S4["UTS: Presensi < 50% / UAS: Presensi < 75% -> BLOKIR KARTU UJIAN"]
        S5["UTS >= 50% / UAS >= 75% -> AKTIFKAN IZIN CETAK KARTU UJIAN"]
        S6["Simpan Bobot Komposisi Nilai"]
        S7["Hitung Nilai Akhir Otomatis & Konversi Grade (A, B+, B, C+, C, D, E)"]
        S8["Kunci Nilai (Read-Only) & Hitung Indeks Prestasi (IPS & IPK)"]
        S9["Terbitkan KHS ke Portal Mahasiswa"]
    end

    D1 --> M1
    D1 --> D2 --> D3 --> S1 --> S2 --> M2
    S2 --> S3
    S3 -- "Kehadiran Rendah" --> S4 --> M3
    S3 -- "Kehadiran Cukup" --> S5 --> M4 --> M5

    M5 --> D4 --> D5 --> S6 --> D6 --> S7 --> D7
    D7 --> S8 --> S9 --> M6 --> M7
```

---

## 9. Alur Tugas Akhir: Proposal, Bimbingan Skripsi, & Yudisium

### Nama Proses
Alur Pengajuan Proposal, Penetapan Pembimbing, Bimbingan Berkala, Sidang Munaqasyah, Bebas Tanggungan, dan Yudisium

* **Tujuan:** Menuntun mahasiswa tingkat akhir menyelesaikan seluruh persyaratan karya ilmiah, bimbingan berkala tervalidasi dosen, ujian munaqasyah, audit bebas tanggungan kelulusan, dan wisuda.
* **Role terlibat:** `Mahasiswa`, `Dosen Pembimbing`, `Kaprodi & BAA`, `Sistem SIAKAD`.
* **Trigger:** Mahasiswa menempuh semester akhir dengan total SKS prasyarat terpenuhi ($\ge$ 100 SKS).
* **Output:** Proposal disetujui, log bimbingan tervalidasi, sertifikat kelulusan sidang munaqasyah, SK Yudisium, dan ijazah sarjana.

```mermaid
flowchart TD
    subgraph MhsLane ["Lane: Mahasiswa"]
        M1["Ajukan Judul & Proposal via /skripsi/proposal"]
        M2["Melakukan Bimbingan Proposal dengan Pembimbing"]
        M3["Input Log Bimbingan Proposal di Portal"]
        M4["Ujian Seminar Proposal (Sempro)"]
        M5["Bimbingan Naskah Skripsi Bab 1 s/d Bab Akhir"]
        M6["Input Catatan Log Bimbingan Skripsi Rutin"]
        M7["Daftar Ujian Sidang Munaqasyah Skripsi"]
        M8["Pelaksanaan Sidang Skripsi & Revisi Naskah"]
        M9["Daftar Yudisium via Portal: /yudisium"]
        M10["Menerima Sertifikat Yudisium & Ikut Wisuda"]
    end

    subgraph PembimbingLane ["Lane: Dosen Pembimbing"]
        P1["Menerima Surat Tugas Pembimbing dari Kaprodi"]
        P2["Bimbingan & Review Naskah Mahasiswa"]
        P3["Validasi & Verifikasi Log Pertemuan Mahasiswa"]
        P4{"Evaluasi Kesiapan Naskah Skripsi"}
        P5["Terbitkan Persetujuan / ACC Sidang Skripsi"]
    end

    subgraph KaprodiBAALane ["Lane: Kaprodi & Admin BAA"]
        K1{"Review Kelayakan Judul & Topik Proposal"}
        K2["Tolak / Minta Revisi Judul"]
        K3["Setujui Judul & Tetapkan Dosen Pembimbing"]
        K4["Jadwalkan Seminar Proposal & Tim Penguji"]
        K5["Jadwalkan Sidang Munaqasyah Skripsi & Penguji"]
        K6{"Audit Bebas Tanggungan:\nSKS >= 144, IPK >= 2.00, Bebas SPP & Perpustakaan"}
        K7["Tolak Yudisium: Lengkapi Bebas Tanggungan"]
        K8["Rapat Pleno Yudisium: Penetapan SK Kelulusan"]
        K9["Buka Pendaftaran Periode Wisuda Resmi"]
    end

    subgraph SistemLane ["Lane: Sistem SIAKAD (Skripsi, Proposal, YudisiumController)"]
        S1["Cek Prasyarat SKS Minimum Skripsi"]
        S2["Simpan Data Pengajuan Proposal"]
        S3["Update Status Proposal & Notifikasi Dosen Pembimbing"]
        S4["Simpan Record Bimbingan & Hitung Jumlah Pertemuan"]
        S5["Terbitkan Berita Acara Ujian Proposal / Skripsi"]
        S6["Simpan Nilai Dewan Penguji & Status Kelulusan"]
        S7["Verifikasi Otomatis Status Bebas Piutang Keuangan"]
        S8["Generate SK Yudisium & Cetak Sertifikat Kelulusan"]
        S9["Pencatatan Status Mahasiswa Menjadi 'Lulus' & Terbitkan Ijazah"]
    end

    M1 --> S1 --> S2 --> K1
    K1 -- "Ditolak" --> K2 --> M1
    K1 -- "Disetujui" --> K3 --> S3 --> P1
    P1 --> M2 --> M3 --> S4 --> P3
    P3 --> K4 --> S5 --> M4 --> M5 --> M6 --> S4 --> P2 --> P4
    P4 -- "Belum Siap" --> P2
    P4 -- "Layak Sidang" --> P5 --> M7 --> K5 --> S5 --> M8 --> S6
    S6 -- "Lulus Sidang" --> M9 --> S7 --> K6
    K6 -- "Ada Tanggungan" --> K7 --> M9
    K6 -- "Bebas Tanggungan" --> K8 --> S8 --> M10 --> K9 --> S9
```

---

## 10. Alur Integrasi Neo Feeder PD-DIKTI

### Nama Proses
Alur Pengecekan Sambungan, Penyiapan Payload Batch, Pengiriman Web Service, dan Rekonsiliasi Data PD-DIKTI

* **Tujuan:** Menjaga kepatuhan pelaporan data akademik kampus ke pangkalan data kementerian (PD-DIKTI) melalui Web Service Neo Feeder secara otomatis dan termonitor.
* **Role terlibat:** `Admin Akademik (BAA) / Superadmin`, `Sistem SIAKAD (Job Queue & Logger)`, `Server Neo Feeder PD-DIKTI`.
* **Trigger:** Tombol uji koneksi, jadwal pelaporan berkala semesteran, atau retry antrean gagal sinkronisasi.
* **Output:** Data mahasiswa, kurikulum, kelas, KRS, nilai, dan AKM tersinkronisasi, pencatatan ID Feeder lokal, dan rekap log status di `pddikti_sync_logs`.

```mermaid
flowchart TD
    subgraph AdminLane ["Lane: Admin Akademik (BAA) / Superadmin"]
        A1["Buka Menu PD-DIKTI: /pddikti"]
        A2["Klik Tombol: Test Connection"]
        A3["Pilih Entitas Sinkronisasi:\nMahasiswa, Kurikulum, Kelas, Nilai, atau AKM"]
        A4["Klik Tombol: Sync Batch / Rekonsiliasi"]
        A5["Periksa Log Error & Klik: Retry Log Tertentu"]
    end

    subgraph SistemLane ["Lane: Sistem SIAKAD (PddiktiSyncController & Worker)"]
        S1["Kirim Request Ping ke Endpoint Neo Feeder"]
        S2{"Hasil Sambungan Web Service"}
        S3["Tampilkan Pesan Gagal: Token / URL Salah"]
        S4["Tampilkan Status Hijau: Koneksi Terhubung"]
        S5["Ambil Kumpulan Data Lokal yang Belum Tersinkron"]
        S6{"Validasi Kelengkapan Field Wajib PD-DIKTI"}
        S7["Tandai SKIPPED + Catat Kolom yang Kurang ke Log"]
        S8["Serialize Data Menjadi Format JSON Payload Feeder"]
        S9["Dispatch Background Queue Job: Kirim Data"]
        S10{"Evaluasi Respon JSON Neo Feeder"}
        S11["Simpan Pesan Error ke Tabel pddikti_sync_logs"]
        S12["Simpan id_feeder ke Record Lokal & Set Status SYNCED"]
    end

    subgraph ServerFeeder ["Lane: Server PD-DIKTI (Neo Feeder Web Service)"]
        F1["Menerima Ping Autentikasi Token"]
        F2["Menerima Payload Batch Data Akademik"]
        F3{"Validasi Bisnis Data PD-DIKTI"}
        F4["Kirim Respon Error Validasi / Duplikasi Data"]
        F5["Simpan ke Basis Data PD-DIKTI & Return GUID Feeder"]
    end

    A1 --> A2 --> S1 --> F1
    F1 --> S2
    S2 -- "Koneksi Putus" --> S3 --> A2
    S2 -- "Koneksi Sukses" --> S4 --> A3 --> A4 --> S5 --> S6
    S6 -- "Data Tidak Lengkap" --> S7 --> A5
    S6 -- "Data Lengkap" --> S8 --> S9 --> F2
    F2 --> F3
    F3 -- "Aturan Feeder Gagal" --> F4 --> S10 --> S11 --> A5 --> S9
    F3 -- "Sukses" --> F5 --> S10 --> S12
```

---

## 11. Matriks Rangkuman Lintas Fungsi (Cross-Functional Matrix)

| Modul / Proses Bisnis | Calon Mhs | Mahasiswa | Dosen / DPA | Kaprodi | Panitia PMB | Staf BAU (Keuangan) | Admin BAA | Superadmin | Sistem SIAKAD |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **1. Autentikasi & Sesi** | Login | Login | Login | Login | Login | Login | Login | Full / Impersonate | Validasi & Throttle |
| **2. Dashboard & Notif** | - | Metrik | Metrik | Metrik | Metrik | Metrik | Metrik | Metrik Server | Agregasi Data |
| **3. Manajemen User** | - | - | - | - | - | - | - | Full Control | Enkripsi & Audit Log |
| **4. PMB & Konversi** | Daftar & Berkas | - | - | - | Verifikasi | Validasi Bayar | Konversi NIM | Override | Generate Akun & NIM |
| **5. Keuangan & Kasir** | - | Bayar/Cicil | - | - | - | Kasir POS/Verif | - | Override | Auto-Beasiswa & Cekal |
| **6. Kurikulum & Setting**| - | - | Lihat | Kelola | - | - | Kelola/Plotting | Full | Cek Bentrok Jadwal |
| **7. Kontrak KRS** | - | Input SKS | Validasi/ACC | Monitoring | - | - | Monitoring | Override | Validasi Prasyarat |
| **8. Kuliah & Nilai** | - | Presensi/KHS | Jurnal/Nilai | Monitoring | - | - | Monitoring | Override | Filter Ujian 50/75% |
| **9. Tugas Akhir & Yudisium** | - | Skripsi | Pembimbing | ACC/Sidang | - | Cek Lunas | Berkas/SK | Override | Syarat Kelulusan |
| **10. Integrasi PD-DIKTI** | - | - | - | - | - | - | Sync Batch | Monitor & Retry | Web Service Sync |
