<?php

namespace App\Jobs;

use App\Models\MahasiswaUkt;
use App\Models\PeriodeRegistrasi;
use App\Models\Tagihan;
use App\Services\ActivityLogger;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\DB;

class GenerateUktTagihanJob implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public int $periodeRegistrasiId
    ) {}

    /**
     * Execute the job with strict idempotency.
     * IDEMPOTENSI (Edge Case Finansial #1):
     * Jika job ini dijalankan ulang (retry/duplicate execution), job TIDAK AKAN membuat
     * tagihan dobel untuk mahasiswa + tahun ajaran + jenis = 'ukt' yang sama.
     */
    public function handle(): void
    {
        $periode = PeriodeRegistrasi::with('tahunAjaran')->findOrFail($this->periodeRegistrasiId);
        $tahunAjaranId = $periode->tahun_ajaran_id;

        // Fetch active Mahasiswa UKT assignments for this academic year
        $mahasiswaUkts = MahasiswaUkt::with('kelompokUkt')
            ->where('tahun_ajaran_id', $tahunAjaranId)
            ->where('status', 'aktif')
            ->get();

        $generatedCount = 0;

        DB::transaction(function () use ($mahasiswaUkts, $tahunAjaranId, $periode, &$generatedCount) {
            foreach ($mahasiswaUkts as $mhsUkt) {
                // Idempotent firstOrCreate query
                $tagihan = Tagihan::firstOrCreate(
                    [
                        'mahasiswa_id' => $mhsUkt->mahasiswa_id,
                        'tahun_ajaran_id' => $tahunAjaranId,
                        'jenis' => 'ukt',
                    ],
                    [
                        'nominal' => $mhsUkt->kelompokUkt->nominal_per_semester,
                        'jatuh_tempo' => $periode->selesai,
                        'status' => 'belum_bayar',
                    ]
                );

                if ($tagihan->wasRecentlyCreated) {
                    $generatedCount++;
                }
            }

            if ($generatedCount > 0) {
                ActivityLogger::log('keuangan.generate_ukt_batch', 'PeriodeRegistrasi', $periode->id, null, [
                    'tahun_ajaran_id' => $tahunAjaranId,
                    'total_tagihan_dibuat' => $generatedCount,
                ]);
            }
        });
    }
}
