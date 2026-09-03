<?php

namespace App\Services\Pddikti;

use App\Models\Dosen;
use App\Models\Mahasiswa;
use App\Models\PddiktiMapping;
use App\Models\PddiktiSyncLog;
use Exception;
use Illuminate\Support\Facades\Log;

class PddiktiReconciliationService
{
    public function __construct(protected NeoFeederClient $client) {}

    /**
     * Jalankan audit pencocokan data Mahasiswa SIAKAD vs PD-DIKTI Neo Feeder.
     *
     * @return array{
     *     total_local: int,
     *     total_feeder: int,
     *     matched_count: int,
     *     unmatched_local: array,
     *     unmatched_feeder: array,
     *     differences: array
     * }
     */
    public function reconcileMahasiswa(?string $filter = null): array
    {
        $log = PddiktiSyncLog::create([
            'table_name' => 'mahasiswas',
            'record_id' => 0,
            'action' => 'pull',
            'status' => 'pending',
        ]);

        try {
            $localMahasiswas = Mahasiswa::with('programStudi')->get()->keyBy('nim');
            $feederResponse = $this->client->call('GetListMahasiswa', filter: $filter);
            $feederMahasiswas = collect($feederResponse['data'] ?? [])->keyBy('nim');

            $matchedCount = 0;
            $unmatchedLocal = [];
            $unmatchedFeeder = [];
            $differences = [];

            foreach ($localMahasiswas as $nim => $localMhs) {
                if ($feederMahasiswas->has($nim)) {
                    $feederMhs = $feederMahasiswas->get($nim);
                    $matchedCount++;

                    // Check for field discrepancies
                    $fieldDiffs = [];
                    if (strcasecmp(trim((string) $localMhs->nama_lengkap), trim((string) ($feederMhs['nama_mahasiswa'] ?? ''))) !== 0) {
                        $fieldDiffs[] = [
                            'field' => 'nama',
                            'local' => $localMhs->nama_lengkap,
                            'feeder' => $feederMhs['nama_mahasiswa'] ?? '',
                        ];
                    }

                    if (! empty($fieldDiffs)) {
                        $differences[] = [
                            'nim' => $nim,
                            'local_id' => $localMhs->id,
                            'pddikti_id' => $feederMhs['id_registrasi_mahasiswa'] ?? $feederMhs['id_mahasiswa'] ?? null,
                            'discrepancies' => $fieldDiffs,
                        ];
                    }
                } else {
                    $unmatchedLocal[] = [
                        'id' => $localMhs->id,
                        'nim' => $nim,
                        'nama' => $localMhs->nama_lengkap,
                        'prodi' => $localMhs->programStudi?->nama,
                        'status' => $localMhs->status_mahasiswa,
                    ];
                }
            }

            foreach ($feederMahasiswas as $nim => $feederMhs) {
                if (! $localMahasiswas->has($nim)) {
                    $unmatchedFeeder[] = [
                        'nim' => $nim,
                        'nama' => $feederMhs['nama_mahasiswa'] ?? 'Tanpa Nama',
                        'prodi' => $feederMhs['nama_program_studi'] ?? '-',
                        'pddikti_id' => $feederMhs['id_registrasi_mahasiswa'] ?? $feederMhs['id_mahasiswa'] ?? null,
                    ];
                }
            }

            $report = [
                'total_local' => $localMahasiswas->count(),
                'total_feeder' => $feederMahasiswas->count(),
                'matched_count' => $matchedCount,
                'unmatched_local' => $unmatchedLocal,
                'unmatched_feeder' => $unmatchedFeeder,
                'differences' => $differences,
            ];

            $log->update([
                'status' => 'success',
                'error_message' => null,
                'synced_at' => now(),
            ]);

            return $report;
        } catch (Exception $e) {
            $log->update([
                'status' => 'failed',
                'error_message' => $e->getMessage(),
                'synced_at' => now(),
            ]);

            Log::error('reconcileMahasiswa failed: '.$e->getMessage());
            throw $e;
        }
    }

    /**
     * Jalankan audit pencocokan data Dosen SIAKAD vs PD-DIKTI Neo Feeder.
     */
    public function reconcileDosen(): array
    {
        $log = PddiktiSyncLog::create([
            'table_name' => 'dosens',
            'record_id' => 0,
            'action' => 'pull',
            'status' => 'pending',
        ]);

        try {
            $localDosens = Dosen::with('programStudi')->whereNotNull('nidn')->get()->keyBy('nidn');
            $feederResponse = $this->client->call('GetListDosen');
            $feederDosens = collect($feederResponse['data'] ?? [])->keyBy('nidn');

            $matchedCount = 0;
            $unmatchedLocal = [];
            $unmatchedFeeder = [];
            $differences = [];

            foreach ($localDosens as $nidn => $localDsn) {
                if ($feederDosens->has($nidn)) {
                    $feederDsn = $feederDosens->get($nidn);
                    $matchedCount++;

                    // Mapping check
                    if (isset($feederDsn['id_dosen'])) {
                        PddiktiMapping::updateOrCreate(
                            ['local_table' => 'dosens', 'local_id' => $localDsn->id],
                            ['pddikti_table' => 'dosen', 'pddikti_id' => (string) $feederDsn['id_dosen']]
                        );
                    }
                } else {
                    $unmatchedLocal[] = [
                        'id' => $localDsn->id,
                        'nidn' => $nidn,
                        'nama' => $localDsn->nama_lengkap,
                        'prodi' => $localDsn->programStudi?->nama,
                    ];
                }
            }

            foreach ($feederDosens as $nidn => $feederDsn) {
                if (! $localDosens->has($nidn)) {
                    $unmatchedFeeder[] = [
                        'nidn' => $nidn,
                        'nama' => $feederDsn['nama_dosen'] ?? 'Tanpa Nama',
                        'prodi' => $feederDsn['nama_program_studi'] ?? '-',
                        'pddikti_id' => $feederDsn['id_dosen'] ?? null,
                    ];
                }
            }

            $report = [
                'total_local' => $localDosens->count(),
                'total_feeder' => $feederDosens->count(),
                'matched_count' => $matchedCount,
                'unmatched_local' => $unmatchedLocal,
                'unmatched_feeder' => $unmatchedFeeder,
                'differences' => $differences,
            ];

            $log->update([
                'status' => 'success',
                'synced_at' => now(),
            ]);

            return $report;
        } catch (Exception $e) {
            $log->update([
                'status' => 'failed',
                'error_message' => $e->getMessage(),
                'synced_at' => now(),
            ]);

            throw $e;
        }
    }
}
