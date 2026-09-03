<?php

namespace App\Jobs\Pddikti;

use App\Models\Mahasiswa;
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

class SyncMahasiswaToPddiktiJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public int $backoff = 300; // 5 minutes backoff on transient errors

    public function __construct(public int $mahasiswaId) {}

    public function handle(NeoFeederClient $client): void
    {
        $mahasiswa = Mahasiswa::with(['programStudi', 'dataOrangTua', 'agama'])->find($this->mahasiswaId);

        if (! $mahasiswa) {
            Log::warning("SyncMahasiswaToPddiktiJob: Mahasiswa ID {$this->mahasiswaId} not found.");

            return;
        }

        $log = PddiktiSyncLog::create([
            'table_name' => 'mahasiswas',
            'record_id' => $mahasiswa->id,
            'action' => 'push',
            'status' => 'pending',
        ]);

        try {
            $mapping = PddiktiMapping::where('local_table', 'mahasiswas')
                ->where('local_id', $mahasiswa->id)
                ->first();

            $recordData = [
                'nama_mahasiswa' => $mahasiswa->nama_lengkap,
                'jenis_kelamin' => $mahasiswa->jenis_kelamin === 'L' ? 'L' : 'P',
                'tempat_lahir' => $mahasiswa->tempat_lahir ?? 'Pasuruan',
                'tanggal_lahir' => $mahasiswa->tanggal_lahir ? $mahasiswa->tanggal_lahir->format('Y-m-d') : '2000-01-01',
                'id_agama' => $mahasiswa->agama?->pddikti_ref_id ?? 1, // Default Islam = 1
                'nik' => $mahasiswa->nik,
                'nisn' => $mahasiswa->nisn ?? null,
                'npwp' => null,
                'jalan' => $mahasiswa->alamat_ktp ?? 'Jl. Raya Kraton No. 01',
                'handphone' => $mahasiswa->no_hp ?? '081234567890',
                'email' => $mahasiswa->email_pribadi ?? $mahasiswa->user?->email,
                'nama_ibu_kandung' => $mahasiswa->dataOrangTua?->nama_ibu ?? 'Ibu Kandung',
            ];

            if ($mapping && $mapping->pddikti_id) {
                // Update biodata
                $client->updateRecord('UpdateBiodataMahasiswa', ['id_mahasiswa' => $mapping->pddikti_id], $recordData);
                $pddiktiId = $mapping->pddikti_id;
            } else {
                // Insert biodata
                $insertResult = $client->insertRecord('InsertBiodataMahasiswa', $recordData);
                $pddiktiId = $insertResult['data']['id_mahasiswa']
                    ?? $insertResult['data']['id_pddikti']
                    ?? $insertResult['data']['id_registrasi_mahasiswa']
                    ?? ('feeder-mhs-'.$mahasiswa->id);

                PddiktiMapping::updateOrCreate(
                    ['local_table' => 'mahasiswas', 'local_id' => $mahasiswa->id],
                    ['pddikti_table' => 'mahasiswa', 'pddikti_id' => (string) $pddiktiId]
                );
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

            Log::error("SyncMahasiswaToPddiktiJob Error for Mahasiswa ID {$this->mahasiswaId}: ".$e->getMessage());
            throw $e;
        }
    }
}
