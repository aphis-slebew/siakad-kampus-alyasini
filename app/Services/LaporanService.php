<?php

namespace App\Services;

use App\Models\Dosen;
use App\Models\Krs;
use App\Models\ProgramStudi;
use App\Models\Tagihan;
use App\Models\User;
use DomainException;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class LaporanService
{
    /**
     * Get aggregate KRS report per Program Studi + optional student drill-down list.
     *
     * @return array{summary: Collection, drilldown: Collection|null, scopedProdiId: int|null}
     */
    public function getLaporanKrs(int $tahunAjaranId, ?int $prodiId = null, ?string $statusDrilldown = null, ?User $user = null): array
    {
        $scopedProdiId = $prodiId;
        $isSuperAdmin = $user && ($user->hasRole('superadmin') || $user->user_type === 'superadmin' || $user->hasRole('admin_akademik'));

        // RBAC Silent Auto-Scoping for Kaprodi
        if ($user && $user->hasRole('kaprodi') && ! $isSuperAdmin) {
            $dosen = Dosen::where('user_id', $user->id)->first();
            $homebaseProdiId = $dosen?->program_studi_id;

            // Perilaku Silent Scope: Jika kaprodi mencoba filter prodi lain via URL, otomatis dinetralkan ke prodi sendiri
            $scopedProdiId = $homebaseProdiId;
        }

        // Summary Aggregate Query via Database SQL with soft-delete checks
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
            ->leftJoin('mahasiswas', function ($join) {
                $join->on('mahasiswas.program_studi_id', '=', 'program_studis.id')
                    ->whereNull('mahasiswas.deleted_at');
            })
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
                ->join('mahasiswas', function ($join) {
                    $join->on('mahasiswas.id', '=', 'krs.mahasiswa_id')
                        ->whereNull('mahasiswas.deleted_at');
                })
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
     * @return array{rekap: Collection, scopedDosenId: int|null}
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

        // Subquery for student-level final grades (1 row per enrolled student)
        $studentScores = DB::table('krs_details')
            ->leftJoin('nilais', 'nilais.krs_detail_id', '=', 'krs_details.id')
            ->selectRaw("
                krs_details.id as krs_detail_id,
                krs_details.kelas_kuliah_id,
                COALESCE(AVG(nilais.nilai_angka), 0) as score,
                COALESCE(MAX(CASE WHEN nilais.is_final = true THEN 1 ELSE 0 END), 0) as is_final,
                COUNT(nilais.id) as total_components,
                CASE
                    WHEN COALESCE(AVG(nilais.nilai_angka), 0) >= 85 THEN 'A'
                    WHEN COALESCE(AVG(nilais.nilai_angka), 0) >= 75 THEN 'B'
                    WHEN COALESCE(AVG(nilais.nilai_angka), 0) >= 60 THEN 'C'
                    WHEN COALESCE(AVG(nilais.nilai_angka), 0) >= 50 THEN 'D'
                    ELSE 'E'
                END as grade_letter
            ")
            ->groupBy('krs_details.id', 'krs_details.kelas_kuliah_id');

        // Aggregate Grade Query at Class level (Zero Cartesian Duplication)
        $rekap = DB::table('kelas_kuliahs')
            ->join('kurikulum_matakuliahs', 'kurikulum_matakuliahs.id', '=', 'kelas_kuliahs.kurikulum_matakuliah_id')
            ->join('kurikulum_prodis', 'kurikulum_prodis.id', '=', 'kurikulum_matakuliahs.kurikulum_prodi_id')
            ->join('program_studis', 'program_studis.id', '=', 'kurikulum_prodis.program_studi_id')
            ->join('matakuliahs', 'matakuliahs.id', '=', 'kurikulum_matakuliahs.matakuliah_id')
            ->leftJoinSub($studentScores, 'st_scores', function ($join) {
                $join->on('st_scores.kelas_kuliah_id', '=', 'kelas_kuliahs.id');
            })
            ->where('kelas_kuliahs.tahun_ajaran_id', $tahunAjaranId)
            ->when($scopedDosenId, function ($q) use ($scopedDosenId) {
                $q->whereExists(function ($sub) use ($scopedDosenId) {
                    $sub->select(DB::raw(1))
                        ->from('dosen_pengajars')
                        ->whereColumn('dosen_pengajars.kelas_kuliah_id', 'kelas_kuliahs.id')
                        ->where('dosen_pengajars.dosen_id', $scopedDosenId);
                });
            })
            ->when($activeKelasKuliahId, fn ($q) => $q->where('kelas_kuliahs.id', $activeKelasKuliahId))
            ->when($prodiId, fn ($q) => $q->where('kurikulum_prodis.program_studi_id', $prodiId))
            ->selectRaw("
                kelas_kuliahs.id as kelas_kuliah_id,
                kelas_kuliahs.nama_kelas,
                matakuliahs.kode as kode_mk,
                matakuliahs.nama as nama_mk,
                matakuliahs.sks as total_sks,
                program_studis.nama as nama_prodi,
                (
                    SELECT dosens.nama_lengkap
                    FROM dosen_pengajars
                    JOIN dosens ON dosens.id = dosen_pengajars.dosen_id
                    WHERE dosen_pengajars.kelas_kuliah_id = kelas_kuliahs.id
                    LIMIT 1
                ) as nama_dosen,
                COALESCE(ROUND(AVG(CASE WHEN st_scores.total_components > 0 THEN st_scores.score END), 2), 0) as rata_rata,
                COALESCE(SUM(CASE WHEN st_scores.grade_letter = 'A' AND st_scores.total_components > 0 THEN 1 ELSE 0 END), 0) as count_a,
                COALESCE(SUM(CASE WHEN st_scores.grade_letter = 'B' AND st_scores.total_components > 0 THEN 1 ELSE 0 END), 0) as count_b,
                COALESCE(SUM(CASE WHEN st_scores.grade_letter = 'C' AND st_scores.total_components > 0 THEN 1 ELSE 0 END), 0) as count_c,
                COALESCE(SUM(CASE WHEN st_scores.grade_letter = 'D' AND st_scores.total_components > 0 THEN 1 ELSE 0 END), 0) as count_d,
                COALESCE(SUM(CASE WHEN st_scores.grade_letter = 'E' AND st_scores.total_components > 0 THEN 1 ELSE 0 END), 0) as count_e,
                COALESCE(SUM(CASE WHEN st_scores.krs_detail_id IS NOT NULL AND (st_scores.is_final = 0 OR st_scores.total_components = 0) THEN 1 ELSE 0 END), 0) as count_belum_final,
                COUNT(st_scores.krs_detail_id) as total_mahasiswa
            ")
            ->groupBy(
                'kelas_kuliahs.id',
                'kelas_kuliahs.nama_kelas',
                'matakuliahs.kode',
                'matakuliahs.nama',
                'matakuliahs.sks',
                'program_studis.nama'
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
     * @return array{summaryPerProdi: Collection, totalPiutangKeseluruhan: float, totalMahasiswaMenunggak: int, tagihans: Collection}
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
            ->leftJoin('mahasiswas', function ($join) {
                $join->on('mahasiswas.program_studi_id', '=', 'program_studis.id')
                    ->whereNull('mahasiswas.deleted_at');
            })
            ->leftJoin('tagihans', function ($join) use ($tahunAjaranId) {
                $join->on('tagihans.mahasiswa_id', '=', 'mahasiswas.id')
                    ->where('tagihans.tahun_ajaran_id', '=', $tahunAjaranId)
                    ->whereNull('tagihans.deleted_at')
                    ->where(function ($q) {
                        $q->whereIn('tagihans.status', ['belum_bayar', 'terlambat', 'dicicil', 'menunggu_pembayaran', 'parsial'])
                            ->orWhere('tagihans.status', '!=', 'lunas');
                    });
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
        $tagihans = Tagihan::with([
            'mahasiswa.programStudi',
            'pembayarans' => fn ($q) => $q->where('status_verifikasi', 'diverifikasi'),
        ])
            ->join('mahasiswas', function ($join) {
                $join->on('mahasiswas.id', '=', 'tagihans.mahasiswa_id')
                    ->whereNull('mahasiswas.deleted_at');
            })
            ->where('tagihans.tahun_ajaran_id', $tahunAjaranId)
            ->whereNull('tagihans.deleted_at')
            ->where(function ($q) {
                $q->whereIn('tagihans.status', ['belum_bayar', 'terlambat', 'dicicil', 'menunggu_pembayaran', 'parsial'])
                    ->orWhere('tagihans.status', '!=', 'lunas');
            })
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
