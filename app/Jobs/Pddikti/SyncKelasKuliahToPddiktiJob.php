<?php

namespace App\Jobs\Pddikti;

use App\Models\KelasKuliah;
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

class SyncKelasKuliahToPddiktiJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public int $backoff = 300;

    public function __construct(public int $kelasKuliahId) {}

    public function handle(NeoFeederClient $client): void
    {
        $kelas = KelasKuliah::with([
            'kurikulumMatakuliah.matakuliah',
            'kurikulumMatakuliah.kurikulumProdi.programStudi',
            'tahunAjaran',
            'dosenPengajars.dosen',
        ])->find($this->kelasKuliahId);

        if (! $kelas) {
            Log::warning("SyncKelasKuliahToPddiktiJob: KelasKuliah ID {$this->kelasKuliahId} not found.");

            return;
        }

        $log = PddiktiSyncLog::create([
            'table_name' => 'kelas_kuliahs',
            'record_id' => $kelas->id,
            'action' => 'push',
            'status' => 'pending',
        ]);

        try {
            $mapping = PddiktiMapping::where('local_table', 'kelas_kuliahs')
                ->where('local_id', $kelas->id)
                ->first();

            $mkMapping = PddiktiMapping::where('local_table', 'matakuliahs')
                ->where('local_id', $kelas->kurikulumMatakuliah?->matakuliah_id)
                ->first();

            $prodiId = $kelas->kurikulumMatakuliah?->kurikulumProdi?->program_studi_id;
            $prodiMapping = PddiktiMapping::where('local_table', 'program_studis')
                ->where('local_id', $prodiId)
                ->first();

            $recordData = [
                'id_prodi' => $prodiMapping?->pddikti_id ?? 'mock-prodi-pai',
                'id_semester' => '20261',
                'id_matkul' => $mkMapping?->pddikti_id ?? ('mock-mk-'.($kelas->kurikulumMatakuliah?->matakuliah_id ?? 1)),
                'nama_kelas_kuliah' => $kelas->nama_kelas,
                'bahasan' => $kelas->kurikulumMatakuliah?->matakuliah?->nama,
                'tanggal_mulai_efektif' => now()->startOfYear()->format('Y-m-d'),
                'tanggal_akhir_efektif' => now()->endOfYear()->format('Y-m-d'),
                'kapasitas' => $kelas->kuota,
            ];

            if ($mapping && $mapping->pddikti_id) {
                $client->updateRecord('UpdateKelasKuliah', ['id_kelas_kuliah' => $mapping->pddikti_id], $recordData);
                $pddiktiId = $mapping->pddikti_id;
            } else {
                $insertResult = $client->insertRecord('InsertKelasKuliah', $recordData);
                $pddiktiId = $insertResult['data']['id_kelas_kuliah']
                    ?? $insertResult['data']['id_pddikti']
                    ?? ('feeder-kls-'.$kelas->id);

                PddiktiMapping::updateOrCreate(
                    ['local_table' => 'kelas_kuliahs', 'local_id' => $kelas->id],
                    ['pddikti_table' => 'kelas_kuliah', 'pddikti_id' => (string) $pddiktiId]
                );
            }

            // Sync Dosen Pengajar if available
            foreach ($kelas->dosenPengajars as $dosenPengajar) {
                $dosenMapping = PddiktiMapping::where('local_table', 'dosens')
                    ->where('local_id', $dosenPengajar->dosen_id)
                    ->first();

                if ($dosenMapping && $dosenMapping->pddikti_id) {
                    $client->insertRecord('InsertDosenPengajarKelasKuliah', [
                        'id_aktivitas_mengajar' => 'feeder-act-'.$dosenPengajar->id,
                        'id_registrasi_dosen' => $dosenMapping->pddikti_id,
                        'id_kelas_kuliah' => (string) $pddiktiId,
                        'sks_substansi_total' => $dosenPengajar->sks_beban ?? $kelas->kurikulumMatakuliah?->matakuliah?->sks_total ?? 2,
                        'rencana_minggu_pertemuan' => 16,
                        'realisasi_minggu_pertemuan' => 16,
                    ]);
                }
            }

            $log->update([
                'status' => 'success',
                'pddikti_id' => (string) $pddiktiId,
                'error_message' => null,
                'synced_at' => now(),
            ]);
        } catch (Exception $e) {
            $log->update([
                'status' => 'failed',
                'error_message' => $e->getMessage(),
                'synced_at' => now(),
            ]);

            Log::error("SyncKelasKuliahToPddiktiJob Error for Kelas ID {$this->kelasKuliahId}: ".$e->getMessage());
            throw $e;
        }
    }
}
