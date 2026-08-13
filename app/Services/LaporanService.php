<?php

namespace App\Services;

use App\Models\Dosen;
use App\Models\Krs;
use App\Models\ProgramStudi;
use App\Models\Tagihan;
use App\Models\User;
use DomainException;
use Illuminate\Support\Facades\DB;

class LaporanService
{
    /**
     * Get aggregate KRS report per Program Studi + optional student drill-down list.
     *
     * @return array{summary: \Illuminate\Support\Collection, drilldown: \Illuminate\Support\Collection|null, scopedProdiId: int|null}
     */
    public function getLaporanKrs(int $tahunAjaranId, ?int $prodiId = null, ?string $statusDrilldown = null, ?User $user = null): array
    {
        $scopedProdiId = $prodiId;
        $isSuperAdmin = $user && ($user->hasRole('superadmin') || $user->user_type === 'superadmin' || $user->hasRole('admin_akademik'));

        // RBAC Silent Auto-Scoping for Kaprodi
        if ($user && $user->hasRole('kaprodi') && ! $isSuperAdmin) {
            // ASUMSI: kaprodi diasumsikan sama dengan homebase prodi dosen (dosens.program_studi_id). Sistem BELUM punya tabel eksplisit 'kaprodi memimpin prodi X' — kalau di masa depan 1 dosen bisa jadi kaprodi prodi yang BUKAN homebase-nya, perlu tabel relasi terpisah.
            $dosen = Dosen::where('user_id', $user->id)->first();
            $homebaseProdiId = $dosen?->program_studi_id;

            // Perilaku Silent Scope: Jika kaprodi mencoba filter prodi lain via URL, otomatis dinetralkan ke prodi sendiri
            $scopedProdiId = $homebaseProdiId;
        }

        // Summary Aggregate Query via Database SQL (No in-memory processing)
        $summary = ProgramStudi::select(
            'program_studis.id as program_studi_id',
            'program_studis.nama as program_studi_nama',
            'program_studis.kode as program_studi_kode',
            DB::raw("COALESCE(SUM(CASE WHEN krs.status = 'draft' THEN 1 ELSE 0 END), 0) as draft_count"),
            DB::raw("COALESCE(SUM(CASE WHEN krs.status = 'diajukan' THEN 1 ELSE 0 END), 0) as diajukan_count"),
            DB::raw("COALESCE(SUM(CASE WHEN krs.status = 'disetujui_wali' THEN 1 ELSE 0 END), 0) as disetujui_wali_count"),
            DB::raw("COALESCE(SUM(CASE WHEN krs.status = 'ditolak' THEN 1 ELSE 0 END), 0) as ditolak_count"),
            DB::raw('COUNT(krs.id) as total_krs')
        )
            ->leftJoin('mahasiswas', 'mahasiswas.program_studi_id', '=', 'program_studis.id')
            ->leftJoin('krs', function ($join) use ($tahunAjaranId) {
                $join->on('krs.mahasiswa_id', '=', 'mahasiswas.id')
                    ->where('krs.tahun_ajaran_id', '=', $tahunAjaranId);
            })
            ->when($scopedProdiId, fn ($q) => $q->where('program_studis.id', $scopedProdiId))
            ->groupBy('program_studis.id', 'program_studis.nama', 'program_studis.kode')
            ->get();

        // Optional Drill-Down Data Query
        $drilldown = null;
        if ($scopedProdiId || $statusDrilldown) {
            $drilldown = Krs::with(['mahasiswa.programStudi'])
                ->join('mahasiswas', 'mahasiswas.id', '=', 'krs.mahasiswa_id')
                ->where('krs.tahun_ajaran_id', $tahunAjaranId)
                ->when($scopedProdiId, fn ($q) => $q->where('mahasiswas.program_studi_id', $scopedProdiId))
                ->when($statusDrilldown, fn ($q) => $q->where('krs.status', $statusDrilldown))
                ->select('krs.*')
                ->latest('krs.updated_at')
                ->get();
        }

        return [
            'summary' => $summary,
            'drilldown' => $drilldown,
            'scopedProdiId' => $scopedProdiId,
        ];
    }

    /**
     * Get Grade Recap (Rekap Nilai) per Kelas Kuliah with letter grade distributions & class averages.
     *
     * @return array{rekap: \Illuminate\Support\Collection, scopedDosenId: int|null}
     */
    public function getRekapNilai(int $tahunAjaranId, ?int $kelasKuliahId = null, ?int $prodiId = null, ?User $user = null): array
    {
        $scopedDosenId = null;
        $activeKelasKuliahId = $kelasKuliahId;
        $isSuperAdmin = $user && ($user->hasRole('superadmin') || $user->user_type === 'superadmin' || $user->hasRole('admin_akademik'));

        // RBAC Silent Auto-Scoping for Dosen
        if ($user && $user->hasRole('dosen') && ! $isSuperAdmin) {
            $dosen = Dosen::where('user_id', $user->id)->first();
            $scopedDosenId = $dosen?->id;

            if ($kelasKuliahId) {
                $isOwner = DB::table('dosen_pengajars')
                    ->where('kelas_kuliah_id', $kelasKuliahId)
                    ->where('dosen_id', $scopedDosenId)
                    ->exists();

                // Perilaku Silent Scope: Jika dosen memilih kelas yang tidak dia ajar, otomatis dinetralkan
                if (! $isOwner) {
                    $activeKelasKuliahId = null;
                }
            }
        }


        // Aggregate Grade Query via Database SQL (COUNT, AVG, CASE WHEN)
        $rekap = DB::table('kelas_kuliahs')
            ->join('kurikulum_matakuliahs', 'kurikulum_matakuliahs.id', '=', 'kelas_kuliahs.kurikulum_matakuliah_id')
            ->join('kurikulum_prodis', 'kurikulum_prodis.id', '=', 'kurikulum_matakuliahs.kurikulum_prodi_id')
            ->join('program_studis', 'program_studis.id', '=', 'kurikulum_prodis.program_studi_id')
            ->join('matakuliahs', 'matakuliahs.id', '=', 'kurikulum_matakuliahs.matakuliah_id')
            ->leftJoin('dosen_pengajars', 'dosen_pengajars.kelas_kuliah_id', '=', 'kelas_kuliahs.id')
            ->leftJoin('dosens', 'dosens.id', '=', 'dosen_pengajars.dosen_id')
            ->leftJoin('krs_details', 'krs_details.kelas_kuliah_id', '=', 'kelas_kuliahs.id')
            ->leftJoin('nilais', 'nilais.krs_detail_id', '=', 'krs_details.id')
            ->where('kelas_kuliahs.tahun_ajaran_id', $tahunAjaranId)
            ->when($scopedDosenId, fn ($q) => $q->where('dosen_pengajars.dosen_id', $scopedDosenId))
            ->when($activeKelasKuliahId, fn ($q) => $q->where('kelas_kuliahs.id', $activeKelasKuliahId))
            ->when($prodiId, fn ($q) => $q->where('kurikulum_prodis.program_studi_id', $prodiId))

            ->selectRaw("
                kelas_kuliahs.id as kelas_kuliah_id,
                kelas_kuliahs.nama_kelas,
                matakuliahs.kode as kode_mk,
                matakuliahs.nama as nama_mk,
                matakuliahs.sks as total_sks,
                program_studis.nama as nama_prodi,
                dosens.nama_lengkap as nama_dosen,
                COALESCE(ROUND(AVG(nilais.nilai_angka), 2), 0) as rata_rata,
                COALESCE(SUM(CASE WHEN nilais.nilai_huruf = 'A' THEN 1 ELSE 0 END), 0) as count_a,
                COALESCE(SUM(CASE WHEN nilais.nilai_huruf = 'B' THEN 1 ELSE 0 END), 0) as count_b,
                COALESCE(SUM(CASE WHEN nilais.nilai_huruf = 'C' THEN 1 ELSE 0 END), 0) as count_c,
                COALESCE(SUM(CASE WHEN nilais.nilai_huruf = 'D' THEN 1 ELSE 0 END), 0) as count_d,
                COALESCE(SUM(CASE WHEN nilais.nilai_huruf = 'E' THEN 1 ELSE 0 END), 0) as count_e,
                COALESCE(SUM(CASE WHEN (nilais.is_final = false OR nilais.is_final IS NULL) AND nilais.id IS NOT NULL THEN 1 ELSE 0 END), 0) as count_belum_final,
                COUNT(DISTINCT krs_details.id) as total_mahasiswa
            ")

            ->groupBy(
                'kelas_kuliahs.id',
                'kelas_kuliahs.nama_kelas',
                'matakuliahs.kode',
                'matakuliahs.nama',
                'matakuliahs.sks',
                'program_studis.nama',
                'dosens.nama_lengkap'
            )
            ->get();



        return [
            'rekap' => $rekap,
            'scopedDosenId' => $scopedDosenId,
        ];
    }

    /**
     * Get Outstanding UKT Delinquency Report (Laporan Piutang UKT) with prodi summaries & student details.
     *
     * @return array{summaryPerProdi: \Illuminate\Support\Collection, totalPiutangKeseluruhan: float, totalMahasiswaMenunggak: int, tagihans: \Illuminate\Support\Collection}
     */
    public function getLaporanPiutangUkt(int $tahunAjaranId, ?int $prodiId = null, ?User $user = null): array
    {
        $isSuperAdminOrFinance = $user && ($user->hasRole('superadmin') || $user->user_type === 'superadmin' || $user->hasRole('staf_keuangan'));

        // RBAC Check for Finance / Superadmin
        if (! $isSuperAdminOrFinance) {
            throw new DomainException('AKSES DITOLAK: Laporan piutang UKT hanya dapat diakses oleh Superadmin dan Staf Keuangan.');
        }


        // Summary Aggregate Query per Prodi
        $summaryPerProdi = DB::table('program_studis')
            ->leftJoin('mahasiswas', 'mahasiswas.program_studi_id', '=', 'program_studis.id')
            ->leftJoin('tagihans', function ($join) use ($tahunAjaranId) {
                $join->on('tagihans.mahasiswa_id', '=', 'mahasiswas.id')
                    ->where('tagihans.tahun_ajaran_id', '=', $tahunAjaranId)
                    ->whereIn('tagihans.status', ['menunggu_pembayaran', 'terlambat', 'parsial']);
            })
            ->when($prodiId, fn ($q) => $q->where('program_studis.id', $prodiId))
            ->selectRaw("
                program_studis.id as program_studi_id,
                program_studis.nama as nama_prodi,
                COUNT(DISTINCT CASE WHEN tagihans.id IS NOT NULL THEN tagihans.mahasiswa_id END) as jumlah_mahasiswa_menunggak,
                COALESCE(SUM(tagihans.nominal), 0) as total_nominal_tagihan,
                COALESCE(SUM((
                    SELECT COALESCE(SUM(p.nominal_dibayar), 0)
                    FROM pembayarans p
                    WHERE p.tagihan_id = tagihans.id AND p.status_verifikasi = 'diverifikasi'
                )), 0) as total_nominal_dibayar
            ")

            ->groupBy('program_studis.id', 'program_studis.nama')
            ->get()
            ->map(function ($row) {
                $row->total_piutang = max(0, (float) $row->total_nominal_tagihan - (float) $row->total_nominal_dibayar);
                return $row;
            });

        $totalPiutangKeseluruhan = $summaryPerProdi->sum('total_piutang');
        $totalMahasiswaMenunggak = $summaryPerProdi->sum('jumlah_mahasiswa_menunggak');

        // Detailed Delinquent Student List
        $tagihans = Tagihan::with(['mahasiswa.programStudi', 'pembayarans' => fn ($q) => $q->where('status_verifikasi', 'diverifikasi')])
            ->join('mahasiswas', 'mahasiswas.id', '=', 'tagihans.mahasiswa_id')
            ->where('tagihans.tahun_ajaran_id', $tahunAjaranId)
            ->whereIn('tagihans.status', ['menunggu_pembayaran', 'terlambat', 'parsial'])
            ->when($prodiId, fn ($q) => $q->where('mahasiswas.program_studi_id', $prodiId))
            ->select('tagihans.*')
            ->latest('tagihans.jatuh_tempo')
            ->get()
            ->map(function ($t) {
                $totalDibayar = $t->pembayarans->sum('nominal_dibayar');
                $t->sisa_piutang = max(0, (float) $t->nominal - (float) $totalDibayar);
                return $t;
            });

        return [
            'summaryPerProdi' => $summaryPerProdi,
            'totalPiutangKeseluruhan' => $totalPiutangKeseluruhan,
            'totalMahasiswaMenunggak' => $totalMahasiswaMenunggak,
            'tagihans' => $tagihans,
        ];
    }
}
