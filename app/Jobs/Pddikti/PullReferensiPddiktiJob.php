<?php

namespace App\Jobs\Pddikti;

use App\Models\PddiktiSyncLog;
use App\Models\ReferensiBiodata;
use App\Services\Pddikti\NeoFeederClient;
use Exception;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class PullReferensiPddiktiJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 2;

    public function handle(NeoFeederClient $client): void
    {
        $log = PddiktiSyncLog::create([
            'table_name' => 'referensi_biodatas',
            'record_id' => 0,
            'action' => 'pull',
            'status' => 'pending',
        ]);

        try {
            // 1. Sinkronisasi Data Agama
            $agamaList = $client->getDictionary('GetAgama');
            foreach ($agamaList as $item) {
                if (isset($item['nama_agama'], $item['id_agama'])) {
                    $namaAgama = strtolower(trim((string) $item['nama_agama']));
                    ReferensiBiodata::where('tipe', 'agama')
                        ->whereRaw('LOWER(nama) = ?', [$namaAgama])
                        ->update(['pddikti_ref_id' => (string) $item['id_agama']]);
                }
            }

            // 2. Sinkronisasi Data Pekerjaan
            $pekerjaanList = $client->getDictionary('GetPekerjaan');
            foreach ($pekerjaanList as $item) {
                if (isset($item['nama_pekerjaan'], $item['id_pekerjaan'])) {
                    $namaPekerjaan = strtolower(trim((string) $item['nama_pekerjaan']));
                    ReferensiBiodata::where('tipe', 'pekerjaan')
                        ->whereRaw('LOWER(nama) = ?', [$namaPekerjaan])
                        ->update(['pddikti_ref_id' => (string) $item['id_pekerjaan']]);
                }
            }

            // 3. Sinkronisasi Data Penghasilan
            $penghasilanList = $client->getDictionary('GetPenghasilan');
            foreach ($penghasilanList as $item) {
                if (isset($item['nama_penghasilan'], $item['id_penghasilan'])) {
                    $namaPenghasilan = strtolower(trim((string) $item['nama_penghasilan']));
                    ReferensiBiodata::where('tipe', 'penghasilan')
                        ->whereRaw('LOWER(nama) = ?', [$namaPenghasilan])
                        ->update(['pddikti_ref_id' => (string) $item['id_penghasilan']]);
                }
            }

            $log->update([
                'status' => 'success',
                'error_message' => null,
                'synced_at' => now(),
            ]);
        } catch (Exception $e) {
            $log->update([
                'status' => 'failed',
                'error_message' => $e->getMessage(),
                'synced_at' => now(),
            ]);

            Log::error('PullReferensiPddiktiJob Error: '.$e->getMessage());
            throw $e;
        }
    }
}
