<?php

namespace App\Http\Controllers\Laporan;

use App\Http\Controllers\Controller;
use App\Models\KelasKuliah;
use App\Models\ProgramStudi;
use App\Models\TahunAjaran;
use App\Services\LaporanService;
use Exception;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class LaporanController extends Controller
{
    /**
     * Display Laporan KRS per Prodi page.
     */
    public function krs(Request $request, LaporanService $service): Response
    {
        $tahunAjaranId = (int) ($request->input('tahun_ajaran_id') ?: (TahunAjaran::where('is_active', true)->first()?->id ?: TahunAjaran::latest()->first()?->id));
        $prodiId = $request->input('program_studi_id') ? (int) $request->input('program_studi_id') : null;
        $statusDrilldown = $request->input('status') ? (string) $request->input('status') : null;

        try {
            $reportData = $service->getLaporanKrs($tahunAjaranId, $prodiId, $statusDrilldown, $request->user());
        } catch (\DomainException $e) {
            abort(403, $e->getMessage());
        }


        $tahunAjarans = TahunAjaran::latest()->get(['id', 'nama', 'is_active']);
        $programStudis = ProgramStudi::all(['id', 'kode', 'nama']);

        return Inertia::render('laporan/krs', [
            'summary' => $reportData['summary'],
            'drilldown' => $reportData['drilldown'],
            'scopedProdiId' => $reportData['scopedProdiId'],
            'tahunAjarans' => $tahunAjarans,
            'programStudis' => $programStudis,
            'filters' => [
                'tahun_ajaran_id' => $tahunAjaranId,
                'program_studi_id' => $prodiId,
                'status' => $statusDrilldown,
            ],
        ]);
    }

    /**
     * Export Laporan KRS per Prodi to Streamed CSV.
     */
    public function exportKrs(Request $request, LaporanService $service): StreamedResponse
    {
        $tahunAjaranId = (int) ($request->input('tahun_ajaran_id') ?: (TahunAjaran::where('is_active', true)->first()?->id ?: TahunAjaran::latest()->first()?->id));
        $prodiId = $request->input('program_studi_id') ? (int) $request->input('program_studi_id') : null;
        $statusDrilldown = $request->input('status') ? (string) $request->input('status') : null;

        try {
            $reportData = $service->getLaporanKrs($tahunAjaranId, $prodiId, $statusDrilldown, $request->user());
        } catch (\DomainException $e) {
            abort(403, $e->getMessage());
        }

        $filename = 'Laporan_KRS_Per_Prodi_'.date('Y-m-d').'.csv';
        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $callback = function () use ($reportData) {
            $file = fopen('php://output', 'w');
            // Write UTF-8 BOM header for Excel compatibility
            fprintf($file, chr(0xEF).chr(0xBB).chr(0xBF));

            fputcsv($file, ['No', 'Kode Prodi', 'Program Studi', 'Draft', 'Diajukan', 'Disetujui Wali', 'Ditolak', 'Total KRS']);

            foreach ($reportData['summary'] as $index => $row) {
                fputcsv($file, [
                    $index + 1,
                    $row->program_studi_kode,
                    $row->program_studi_nama,
                    $row->draft_count,
                    $row->diajukan_count,
                    $row->disetujui_wali_count,
                    $row->ditolak_count,
                    $row->total_krs,
                ]);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Display Rekap Nilai page.
     */
    public function rekapNilai(Request $request, LaporanService $service): Response
    {
        $tahunAjaranId = (int) ($request->input('tahun_ajaran_id') ?: (TahunAjaran::where('is_active', true)->first()?->id ?: TahunAjaran::latest()->first()?->id));
        $kelasKuliahId = $request->input('kelas_kuliah_id') ? (int) $request->input('kelas_kuliah_id') : null;
        $prodiId = $request->input('program_studi_id') ? (int) $request->input('program_studi_id') : null;

        try {
            $reportData = $service->getRekapNilai($tahunAjaranId, $kelasKuliahId, $prodiId, $request->user());
        } catch (\DomainException $e) {
            abort(403, $e->getMessage());
        }

        $tahunAjarans = TahunAjaran::latest()->get(['id', 'nama', 'is_active']);
        $programStudis = ProgramStudi::all(['id', 'kode', 'nama']);
        $kelases = KelasKuliah::with(['kurikulumMatakuliah.matakuliah'])
            ->where('tahun_ajaran_id', $tahunAjaranId)
            ->get();

        return Inertia::render('laporan/rekap-nilai', [
            'rekap' => $reportData['rekap'],
            'scopedDosenId' => $reportData['scopedDosenId'],
            'tahunAjarans' => $tahunAjarans,
            'programStudis' => $programStudis,
            'kelases' => $kelases,
            'filters' => [
                'tahun_ajaran_id' => $tahunAjaranId,
                'kelas_kuliah_id' => $kelasKuliahId,
                'program_studi_id' => $prodiId,
            ],
        ]);
    }

    /**
     * Export Rekap Nilai to Streamed CSV.
     */
    public function exportRekapNilai(Request $request, LaporanService $service): StreamedResponse
    {
        $tahunAjaranId = (int) ($request->input('tahun_ajaran_id') ?: (TahunAjaran::where('is_active', true)->first()?->id ?: TahunAjaran::latest()->first()?->id));
        $kelasKuliahId = $request->input('kelas_kuliah_id') ? (int) $request->input('kelas_kuliah_id') : null;
        $prodiId = $request->input('program_studi_id') ? (int) $request->input('program_studi_id') : null;

        try {
            $reportData = $service->getRekapNilai($tahunAjaranId, $kelasKuliahId, $prodiId, $request->user());
        } catch (\DomainException $e) {
            abort(403, $e->getMessage());
        }

        $filename = 'Rekap_Nilai_Kelas_'.date('Y-m-d').'.csv';
        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $callback = function () use ($reportData) {
            $file = fopen('php://output', 'w');
            fprintf($file, chr(0xEF).chr(0xBB).chr(0xBF));

            fputcsv($file, ['No', 'Kode MK', 'Mata Kuliah', 'Kelas', 'Prodi', 'Dosen Pengajar', 'Peserta', 'A', 'B', 'C', 'D', 'E', 'Belum Final', 'Rata-Rata Nilai']);

            foreach ($reportData['rekap'] as $index => $row) {
                fputcsv($file, [
                    $index + 1,
                    $row->kode_mk,
                    $row->nama_mk,
                    $row->nama_kelas,
                    $row->nama_prodi,
                    $row->nama_dosen ?? '-',
                    $row->total_mahasiswa,
                    $row->count_a,
                    $row->count_b,
                    $row->count_c,
                    $row->count_d,
                    $row->count_e,
                    $row->count_belum_final,
                    number_format((float) $row->rata_rata, 2),
                ]);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Display Laporan Piutang UKT page.
     */
    public function piutangUkt(Request $request, LaporanService $service): Response
    {
        $tahunAjaranId = (int) ($request->input('tahun_ajaran_id') ?: (TahunAjaran::where('is_active', true)->first()?->id ?: TahunAjaran::latest()->first()?->id));
        $prodiId = $request->input('program_studi_id') ? (int) $request->input('program_studi_id') : null;

        try {
            $reportData = $service->getLaporanPiutangUkt($tahunAjaranId, $prodiId, $request->user());
        } catch (\DomainException $e) {
            abort(403, $e->getMessage());
        }

        $tahunAjarans = TahunAjaran::latest()->get(['id', 'nama', 'is_active']);
        $programStudis = ProgramStudi::all(['id', 'kode', 'nama']);

        return Inertia::render('laporan/piutang-ukt', [
            'summaryPerProdi' => $reportData['summaryPerProdi'],
            'totalPiutangKeseluruhan' => $reportData['totalPiutangKeseluruhan'],
            'totalMahasiswaMenunggak' => $reportData['totalMahasiswaMenunggak'],
            'tagihans' => $reportData['tagihans'],
            'tahunAjarans' => $tahunAjarans,
            'programStudis' => $programStudis,
            'filters' => [
                'tahun_ajaran_id' => $tahunAjaranId,
                'program_studi_id' => $prodiId,
            ],
        ]);
    }

    /**
     * Export Laporan Piutang UKT to Streamed CSV.
     */
    public function exportPiutangUkt(Request $request, LaporanService $service): StreamedResponse
    {
        $tahunAjaranId = (int) ($request->input('tahun_ajaran_id') ?: (TahunAjaran::where('is_active', true)->first()?->id ?: TahunAjaran::latest()->first()?->id));
        $prodiId = $request->input('program_studi_id') ? (int) $request->input('program_studi_id') : null;

        try {
            $reportData = $service->getLaporanPiutangUkt($tahunAjaranId, $prodiId, $request->user());
        } catch (\DomainException $e) {
            abort(403, $e->getMessage());
        }


        $filename = 'Laporan_Piutang_UKT_'.date('Y-m-d').'.csv';
        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $callback = function () use ($reportData) {
            $file = fopen('php://output', 'w');
            fprintf($file, chr(0xEF).chr(0xBB).chr(0xBF));

            fputcsv($file, ['No', 'NIM', 'Nama Mahasiswa', 'Program Studi', 'Status Tagihan', 'Nominal Tagihan', 'Sisa Piutang', 'Jatuh Tempo']);

            foreach ($reportData['tagihans'] as $index => $t) {
                fputcsv($file, [
                    $index + 1,
                    $t->mahasiswa->nim ?? '-',
                    $t->mahasiswa->nama_lengkap ?? '-',
                    $t->mahasiswa->programStudi->nama ?? '-',
                    strtoupper($t->status),
                    number_format((float) $t->nominal, 0, ',', '.'),
                    number_format((float) $t->sisa_piutang, 0, ',', '.'),
                    $t->jatuh_tempo ? date('d/m/Y', strtotime($t->jatuh_tempo)) : '-',
                ]);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
