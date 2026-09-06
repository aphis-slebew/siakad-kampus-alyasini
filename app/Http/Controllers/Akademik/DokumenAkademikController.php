<?php

namespace App\Http\Controllers\Akademik;

use App\Http\Controllers\Controller;
use App\Models\Dosen;
use App\Models\KelasKuliah;
use App\Models\Krs;
use App\Models\Mahasiswa;
use App\Models\Nilai;
use App\Models\Presensi;
use App\Models\Tagihan;
use App\Models\TahunAjaran;
use App\Services\KhsService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DokumenAkademikController extends Controller
{
    /**
     * Resolves the target Mahasiswa based on auth user and permissions (Anti-IDOR).
     */
    protected function resolveMahasiswa(?Mahasiswa $mahasiswa = null): Mahasiswa
    {
        $user = auth()->user();

        if ($user->hasRole('mahasiswa') || $user->user_type === 'mahasiswa') {
            $currentMahasiswa = Mahasiswa::where('user_id', $user->id)->firstOrFail();

            if ($mahasiswa && $mahasiswa->id !== $currentMahasiswa->id) {
                abort(403, 'Anda tidak berhak mengakses dokumen mahasiswa lain.');
            }

            return $currentMahasiswa;
        }

        // Academic and staff roles allowed to access student documents
        if ($user->hasAnyRole(['superadmin', 'admin_akademik', 'dosen', 'kaprodi', 'staf_kepegawaian', 'operator_kemahasiswaan', 'staf_keuangan'])
            || in_array($user->user_type, ['superadmin', 'admin_akademik', 'dosen', 'kaprodi', 'pegawai'])) {
            if ($mahasiswa) {
                return $mahasiswa;
            }

            abort(404, 'Mahasiswa tidak ditentukan.');
        }

        abort(403, 'Akses Ditolak: Anda tidak memiliki wewenang untuk mengakses dokumen akademik mahasiswa.');
    }

    /**
     * Cetak Kartu Rencana Studi (KRS) Resmi.
     */
    public function cetakKrs(Request $request, ?Mahasiswa $mahasiswa = null): Response
    {
        $target = $this->resolveMahasiswa($mahasiswa);
        $target->load(['programStudi.fakultas', 'dosenWalis.dosen']);

        $tahunAjaranId = $request->input('tahun_ajaran_id');
        $tahunAjaran = is_numeric($tahunAjaranId)
            ? TahunAjaran::findOrFail((int) $tahunAjaranId)
            : (TahunAjaran::where('is_active', true)->first() ?? TahunAjaran::latest()->firstOrFail());

        $krs = Krs::with([
            'krsDetails.kelasKuliah.kurikulumMatakuliah.matakuliah',
            'krsDetails.kelasKuliah.jadwalPerkuliahans.ruangKuliah',
            'krsDetails.kelasKuliah.dosenPengajars.dosen',
        ])
            ->where('mahasiswa_id', $target->id)
            ->where('tahun_ajaran_id', $tahunAjaran->id)
            ->first();

        $dosenWali = $target->dosenWalis
            ->where('tahun_ajaran_id', $tahunAjaran->id)
            ->first()?->dosen
            ?? $target->dosenWalis->first()?->dosen;

        return Inertia::render('dokumen/cetak-krs', [
            'mahasiswa' => $target,
            'tahunAjaran' => $tahunAjaran,
            'krs' => $krs,
            'dosenWali' => $dosenWali,
            'nomorDokumen' => 'KRS/'.($tahunAjaran->id ?? '2026').'/'.$target->nim,
        ]);
    }

    /**
     * Cetak Kartu Hasil Studi (KHS) Resmi.
     */
    public function cetakKhs(Request $request, KhsService $khsService, ?Mahasiswa $mahasiswa = null): Response
    {
        $target = $this->resolveMahasiswa($mahasiswa);
        $target->load(['programStudi.fakultas', 'dosenWalis.dosen']);

        $tahunAjaranId = $request->input('tahun_ajaran_id');
        $tahunAjaran = is_numeric($tahunAjaranId)
            ? TahunAjaran::findOrFail((int) $tahunAjaranId)
            : (TahunAjaran::where('is_active', true)->first() ?? TahunAjaran::latest()->firstOrFail());

        $khsData = $khsService->generateKhs($target, $tahunAjaran->id, auth()->id() ? (int) auth()->id() : null);

        $dosenWali = $target->dosenWalis
            ->where('tahun_ajaran_id', $tahunAjaran->id)
            ->first()?->dosen
            ?? $target->dosenWalis->first()?->dosen;

        return Inertia::render('dokumen/cetak-khs', [
            'mahasiswa' => $target,
            'tahunAjaran' => $tahunAjaran,
            'khsData' => $khsData,
            'dosenWali' => $dosenWali,
            'nomorDokumen' => 'KHS/'.($tahunAjaran->id ?? '2026').'/'.$target->nim,
        ]);
    }

    /**
     * Cetak Transkrip Nilai Akademik Sementara / Lengkap.
     */
    public function cetakTranskrip(Request $request, ?Mahasiswa $mahasiswa = null): Response
    {
        $target = $this->resolveMahasiswa($mahasiswa);
        $target->load(['programStudi.fakultas', 'dosenWalis.dosen']);

        $nilais = Nilai::with([
            'krsDetail.kelasKuliah.kurikulumMatakuliah.matakuliah',
            'krsDetail.kelasKuliah.tahunAjaran',
        ])
            ->whereHas('krsDetail.krs', function ($q) use ($target) {
                $q->where('mahasiswa_id', $target->id);
            })
            ->where('is_final', true)
            ->get();

        $totalSks = 0;
        $totalBobot = 0;
        $items = [];

        $gradeMap = [
            'A' => 4.0,
            'B+' => 3.5,
            'B' => 3.0,
            'C+' => 2.5,
            'C' => 2.0,
            'D' => 1.0,
            'E' => 0.0,
        ];

        foreach ($nilais as $n) {
            $mk = $n->krsDetail?->kelasKuliah?->kurikulumMatakuliah?->matakuliah;
            $sks = $mk?->sks ?? 0;
            $huruf = strtoupper($n->nilai_huruf ?? 'E');
            $indeks = $gradeMap[$huruf] ?? 0.0;
            $bobot = $sks * $indeks;

            $totalSks += $sks;
            $totalBobot += $bobot;

            $items[] = [
                'id' => $n->id,
                'kode_mk' => $mk?->kode ?? '-',
                'nama_mk' => $mk?->nama ?? '-',
                'sks' => $sks,
                'nilai_huruf' => $huruf,
                'nilai_indeks' => $indeks,
                'bobot' => round($bobot, 2),
                'semester' => $n->krsDetail?->kelasKuliah?->tahunAjaran?->nama ?? '-',
            ];
        }

        $ipk = $totalSks > 0 ? round($totalBobot / $totalSks, 2) : 0.00;

        $predikat = 'Memuaskan';
        if ($ipk >= 3.51) {
            $predikat = 'Dengan Pujian (Cum Laude)';
        } elseif ($ipk >= 3.00) {
            $predikat = 'Sangat Memuaskan';
        }

        return Inertia::render('dokumen/cetak-transkrip', [
            'mahasiswa' => $target,
            'items' => $items,
            'totalSks' => $totalSks,
            'ipk' => $ipk,
            'predikat' => $predikat,
            'nomorDokumen' => 'TRA/'.date('Y').'/'.$target->nim,
        ]);
    }

    /**
     * Cetak Kartu Ujian Mahasiswa (UTS / UAS).
     */
    public function cetakKartuUjian(Request $request, ?Mahasiswa $mahasiswa = null): Response
    {
        $target = $this->resolveMahasiswa($mahasiswa);
        $target->load(['programStudi.fakultas']);

        $jenisUjian = $request->input('jenis', 'UAS'); // UTS | UAS
        $tahunAjaranId = $request->input('tahun_ajaran_id');
        $tahunAjaran = is_numeric($tahunAjaranId)
            ? TahunAjaran::findOrFail((int) $tahunAjaranId)
            : (TahunAjaran::where('is_active', true)->first() ?? TahunAjaran::latest()->firstOrFail());

        // Status Kelunasan Keuangan
        $tagihanPending = Tagihan::where('mahasiswa_id', $target->id)
            ->where('tahun_ajaran_id', $tahunAjaran->id)
            ->where('status', '!=', 'lunas')
            ->exists();

        $krs = Krs::with([
            'krsDetails.kelasKuliah.kurikulumMatakuliah.matakuliah',
            'krsDetails.kelasKuliah.jadwalPerkuliahans.ruangKuliah',
            'krsDetails.kelasKuliah.dosenPengajars.dosen',
        ])
            ->where('mahasiswa_id', $target->id)
            ->where('tahun_ajaran_id', $tahunAjaran->id)
            ->first();

        return Inertia::render('dokumen/cetak-kartu-ujian', [
            'mahasiswa' => $target,
            'tahunAjaran' => $tahunAjaran,
            'jenisUjian' => strtoupper($jenisUjian),
            'statusLunas' => ! $tagihanPending,
            'krs' => $krs,
            'nomorDokumen' => 'KARTU-'.strtoupper($jenisUjian).'/'.($tahunAjaran->id ?? '2026').'/'.$target->nim,
        ]);
    }

    /**
     * Cetak Berita Acara Perkuliahan & Rekap Presensi Kelas.
     */
    public function cetakBeritaAcaraKelas(Request $request, KelasKuliah $kelas): Response
    {
        $user = auth()->user();

        // Only superadmin, admin_akademik, kaprodi, and assigned lecturers can access Berita Acara
        if (! $user->hasAnyRole(['superadmin', 'admin_akademik', 'kaprodi', 'dosen'])
            && ! in_array($user->user_type, ['superadmin', 'admin_akademik', 'kaprodi', 'dosen', 'pegawai'])) {
            abort(403, 'Akses Ditolak: Hanya dosen pengajar atau administrator akademik yang berhak mencetak berita acara perkuliahan.');
        }

        // Check if user is dosen pengajar of this class or admin
        if ($user->hasRole('dosen') || $user->user_type === 'dosen') {
            $dosen = Dosen::where('user_id', $user->id)->first();
            $isPengajar = $kelas->dosenPengajars()->where('dosen_id', $dosen?->id)->exists();

            if (! $isPengajar && ! $user->hasAnyRole(['superadmin', 'admin_akademik', 'kaprodi'])) {
                abort(403, 'Anda bukan dosen pengajar kelas ini.');
            }
        }

        $kelas->load([
            'kurikulumMatakuliah.matakuliah',
            'kurikulumMatakuliah.kurikulumProdi.programStudi.fakultas',
            'tahunAjaran',
            'dosenPengajars.dosen',
            'krsDetails.krs.mahasiswa',
        ]);

        $presensis = Presensi::where('kelas_kuliah_id', $kelas->id)
            ->orderBy('pertemuan_ke')
            ->get();

        $mahasiswas = $kelas->krsDetails
            ->map(fn ($kd) => $kd->krs?->mahasiswa)
            ->filter()
            ->unique('id')
            ->sortBy('nama_lengkap')
            ->values();

        return Inertia::render('dokumen/cetak-berita-acara', [
            'kelas' => $kelas,
            'presensis' => $presensis,
            'mahasiswas' => $mahasiswas,
            'nomorDokumen' => 'BAP/'.$kelas->id.'/'.date('Y'),
        ]);
    }
}
