<?php

namespace App\Services;

use App\Models\Mahasiswa;
use App\Models\ProgramStudi;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class NimGeneratorService
{
    /**
     * Generate a unique NIM for a newly admitted student atomically.
     *
     * PENCEGAHAN RACE CONDITION (KASUS MAHASISWA PERTAMA & LANJUTAN):
     * 1. Mengunci baris induk ProgramStudi via lockForUpdate() di dalam transaksi DB.
     *    Karena baris ProgramStudi SELALU ada, lock ini berlaku 100% efektif meskipun
     *    belum ada mahasiswa sama sekali (0 baris mahasiswa).
     * 2. Penguncian baris Mahasiswa urutan terakhir dengan lockForUpdate().
     *
     * // TODO: konfirmasi format NIM resmi ke kampus
     * Format sementara: {tahun_masuk}{kode_prodi}{4-digit-urut} (contoh: 2026PAI0001)
     */
    public function generate(int $prodiId, ?int $tahunMasuk = null): string
    {
        $tahunMasuk = $tahunMasuk ?? (int) date('Y');

        return DB::transaction(function () use ($prodiId, $tahunMasuk) {
            // 1. Lock parent ProgramStudi row to guarantee atomic sequence generation even for the FIRST student (0 existing students)
            $prodi = ProgramStudi::where('id', $prodiId)->lockForUpdate()->firstOrFail();
            $kodeProdi = strtoupper($prodi->kode);
            $prefix = "{$tahunMasuk}{$kodeProdi}";

            // 2. Query last student with lockForUpdate()
            $lastStudent = Mahasiswa::where('program_studi_id', $prodiId)
                ->where('nim', 'like', "{$prefix}%")
                ->lockForUpdate()
                ->orderByDesc('nim')
                ->first();

            $nextSeq = $lastStudent ? ((int) substr($lastStudent->nim, -4) + 1) : 1;

            return $prefix.str_pad((string) $nextSeq, 4, '0', STR_PAD_LEFT);
        });
    }

    /**
     * Execute callback with NIM generation and automatic retry loop on unique collision.
     */
    public function generateAndExecute(int $prodiId, callable $callback, int $maxRetries = 5)
    {
        $attempts = 0;

        while ($attempts < $maxRetries) {
            $attempts++;
            try {
                return DB::transaction(function () use ($prodiId, $callback) {
                    $nim = $this->generate($prodiId);

                    return $callback($nim);
                });
            } catch (QueryException $e) {
                // Catch unique constraint violation on nim and retry
                if ($attempts >= $maxRetries || ! str_contains($e->getMessage(), 'UNIQUE constraint failed: mahasiswas.nim')) {
                    throw $e;
                }
            }
        }

        throw new RuntimeException("Gagal meng-generate NIM unik setelah {$maxRetries} kali percobaan.");
    }
}
