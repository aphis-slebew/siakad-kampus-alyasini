<?php

namespace App\Jobs\Pddikti;

use App\Models\KelasKuliah;
use App\Models\KrsDetail;
use App\Models\PddiktiMapping;
use App\Models\PddiktiSyncLog;
use App\Services\Pddikti\NeoFeederClient;
use Exception;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SyncKrsDanNilaiToPddiktiJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public int $backoff = 300;

    public function __construct(public int $kelasKuliahId) {}

    public function handle(NeoFeederClient $client): void
    {
        $kelas = KelasKuliah::find($this->kelasKuliahId);

        if (! $kelas) {
            Log::warning("SyncKrsDanNilaiToPddiktiJob: KelasKuliah ID {$this->kelasKuliahId} not found.");

            return;
        }

        $kelasMapping = PddiktiMapping::where('local_table', 'kelas_kuliahs')
            ->where('local_id', $kelas->id)
            ->first();

        $idKelasPddikti = $kelasMapping?->pddikti_id ?? ('mock-kls-'.$kelas->id);

        $krsDetails = KrsDetail::with(['krs.mahasiswa', 'nilais'])
            ->where('kelas_kuliah_id', $kelas->id)
            ->get();

        $log = PddiktiSyncLog::create([
            'table_name' => 'nilais',
            'record_id' => $kelas->id,
            'action' => 'push',
            'status' => 'pending',
        ]);

        try {
            $syncedCount = 0;

            foreach ($krsDetails as $detail) {
                $mahasiswa = $detail->krs?->mahasiswa;
                if (! $mahasiswa) {
                    continue;
                }

                $mhsMapping = PddiktiMapping::where('local_table', 'mahasiswas')
                    ->where('local_id', $mahasiswa->id)
                    ->first();

                $idRegMhs = $mhsMapping?->pddikti_id ?? ('mock-reg-'.$mahasiswa->id);

                // 1. Insert Peserta Kelas Kuliah
                $client->call('InsertPesertaKelasKuliah', record: [
                    'id_kelas_kuliah' => $idKelasPddikti,
                    'id_registrasi_mahasiswa' => $idRegMhs,
                ]);

                // 2. Update Nilai Perkuliahan jika ada nilai final
                $nilaiFinal = $detail->nilais->where('is_final', true)->first()
                    ?? $detail->nilais->first();

                if ($nilaiFinal) {
                    $nilaiAngka = (float) $nilaiFinal->nilai_angka;
                    $nilaiIndeks = match (true) {
                        $nilaiAngka >= 85 => 4.00,
                        $nilaiAngka >= 75 => 3.00,
                        $nilaiAngka >= 60 => 2.00,
                        $nilaiAngka >= 50 => 1.00,
                        default => 0.00,
                    };

                    $client->call('UpdateNilaiPerkuliahanKelas', key: [
                        'id_kelas_kuliah' => $idKelasPddikti,
                        'id_registrasi_mahasiswa' => $idRegMhs,
                    ], record: [
                        'nilai_angka' => $nilaiAngka,
                        'nilai_huruf' => $nilaiFinal->nilai_huruf ?? 'A',
                        'nilai_indeks' => $nilaiIndeks,
                    ]);
                }

                $syncedCount++;
            }

            $log->update([
                'status' => 'success',
                'pddikti_id' => $idKelasPddikti,
                'error_message' => null,
                'synced_at' => now(),
            ]);
        } catch (Exception $e) {
            $log->update([
                'status' => 'failed',
                'error_message' => $e->getMessage(),
                'synced_at' => now(),
            ]);

            Log::error("SyncKrsDanNilaiToPddiktiJob Error for Kelas ID {$this->kelasKuliahId}: ".$e->getMessage());
            throw $e;
        }
    }
}
