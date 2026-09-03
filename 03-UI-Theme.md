# UI Design System — SIAKAD STAI Al-Yasini

Versi: 1.0

## 1. Prinsip desain

Dua hal yang harus dihindari:
1. **Terlihat seperti SEVIMA** — dashboard biru korporat generik dengan sidebar
   standar dan ikon flat-UI umum.
2. **Terlihat "dibuat AI" secara generik** — pola yang sering muncul: background
   krem hangat + serif besar + aksen terracotta, atau dashboard hitam pekat +
   aksen neon tunggal, atau layout koran hairline serba tajam.

Identitas visual sistem ini diambil dari karakter STAI Al-Yasini sendiri (institut
Islam) — bukan sekadar "dashboard admin generik", tapi tetap mengutamakan
keterbacaan karena ini sistem data-heavy (tabel nilai, jadwal, KRS) yang dipakai
setiap hari oleh staf, dosen, dan mahasiswa.

## 2. Palet warna

| Token | Hex | Fungsi |
|---|---|---|
| `--brand-primary` | `#146356` | Warna utama — deep emerald, dipakai di header, tombol primer, elemen navigasi aktif |
| `--brand-primary-dark` | `#0B3D35` | Hover/active state tombol primer, teks di atas fill terang |
| `--brand-accent` | `#B9862E` | Aksen emas manuskrip — dipakai **terbatas**: badge status penting, elemen highlight, sertifikat/dokumen resmi. Jangan dipakai untuk tombol besar |
| `--surface-base` | `#F6F7F5` | Background halaman — netral terang, sedikit dingin (bukan krem hangat) |
| `--surface-card` | `#FFFFFF` | Background card/panel |
| `--text-primary` | `#1B1F1D` | Teks utama |
| `--text-secondary` | `#5B625E` | Teks sekunder/label |
| `--border-default` | `#DCE0DD` | Border hairline default |
| `--status-success` | `#2F8F5B` | Status disetujui/lulus/hadir |
| `--status-warning` | `#C08A1E` | Status pending/menunggu approval |
| `--status-danger` | `#B4342E` | Status ditolak/alpa/cekal |

Aturan: warna status **selalu** dipasangkan dengan teks/ikon, tidak hanya warna
(untuk aksesibilitas — kolorblind-safe), contoh badge "Disetujui" pakai warna
hijau **dan** ikon centang, bukan cuma pill hijau polos.

## 3. Tipografi

| Peran | Font | Kapan dipakai |
|---|---|---|
| Display (terbatas) | **Fraunces** (serif, weight 400/600) | Hanya di halaman login, halaman publik, dan kop dokumen resmi (transkrip, SK, sertifikat). **Tidak dipakai di dalam dashboard/tabel** |
| UI & data | **Inter** | Semua teks dashboard: navigasi, tabel, form, tombol. Dipilih karena keterbacaan tinggi di ukuran kecil (tabel nilai, jadwal padat) |
| Mono (opsional) | **JetBrains Mono** | NIM, kode matakuliah, nomor dokumen — angka/kode butuh alignment presisi |

Skala tipe: 12 / 14 / 16 / 20 / 24 / 32px. Weight hanya 400 (regular) dan 600
(semibold) — jangan pakai bold 700 di UI dashboard, terlalu berat untuk layar
padat data.

## 4. Signature element

**Motif garis geometris tipis** terinspirasi pola arsitektur Islam (garis
bersudut, bukan lengkung dekoratif berlebihan) dipakai **hanya** di:
- Header halaman login/publik (elemen dekoratif kecil di sudut)
- Kop transkrip/sertifikat resmi (watermark tipis, tidak mengganggu keterbacaan)

Jangan dipakai di dalam dashboard internal (sidebar, tabel, form) — di sana
desain harus benar-benar bersih dan fungsional, karena dipakai berjam-jam setiap
hari oleh staf.

## 5. Layout

- Sidebar kiri tetap (fixed), collapsible di mobile — bukan sidebar yang bisa
  di-drag/reorder (tidak perlu, menambah kompleksitas tanpa manfaat nyata).
- Header atas: breadcrumb + nama pengguna + notifikasi. Tidak perlu search bar
  global di MVP kecuali data mahasiswa/dosen sudah > 500 baris per halaman.
  hal.
- Tabel data (nilai, KRS, presensi): baris zebra tipis (`--surface-base` selang-
  seling), header sticky saat scroll, kolom aksi selalu di kanan.
- Form: label di atas input (bukan di samping) — lebih mudah dibaca di mobile
  dan konsisten dengan cara dosen/mahasiswa mengisi form panjang (KRS, biodata).
- Radius: `8px` untuk card, `6px` untuk tombol/input. Tidak ada radius besar
  (pill) kecuali badge status.

## 6. Komponen kunci

- **Tombol primer**: `--brand-primary` fill, teks putih, radius 6px.
- **Tombol sekunder**: outline `--border-default`, teks `--text-primary`.
- **Badge status**: fill 10% opacity dari warna status + border + ikon (lihat
  §2).
- **Empty state**: selalu berupa ajakan aksi, bukan hanya "Data tidak
  ditemukan" — contoh: "Belum ada KRS diajukan semester ini — [Ajukan KRS]".
- **Pesan error**: jelas, tidak menyalahkan pengguna, dalam bahasa aplikasi.
  Contoh: "SKS yang diambil (26) melebihi batas maksimal (24). Kurangi
  matakuliah sebelum mengajukan KRS." — bukan "Error: validation failed".

## 7. Aksesibilitas & responsif (wajib, bukan opsional)

- Kontras teks minimal WCAG AA.
- Semua elemen interaktif punya visible focus state (keyboard navigation wajib
  berfungsi — banyak staf akademik memakai keyboard-only saat input nilai
  massal).
- Dashboard harus tetap terpakai di layar tablet (banyak dosen mengisi presensi
  dari tablet/HP saat di kelas).
- Hormati `prefers-reduced-motion` — animasi transisi minimal saja
  (200-250ms ease), tidak ada animasi hias.

## 8. Voice & tone

- Bahasa Indonesia formal tapi tidak kaku, sentence case (bukan Title Case di
  tombol/label).
- Nama aksi konsisten dari tombol → toast konfirmasi. Contoh: tombol "Ajukan
  KRS" → toast "KRS berhasil diajukan" (bukan "Submitted successfully").
- Istilah mengikuti istilah akademik yang sudah familiar staf kampus (KRS, KHS,
  SKS, wali, bimbingan) — jangan diterjemahkan/diubah jadi istilah teknis baru.
