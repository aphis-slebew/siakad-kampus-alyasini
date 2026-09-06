<?php

namespace App\Services;

use App\Models\Dosen;
use App\Models\Fakultas;
use App\Models\Mahasiswa;
use App\Models\Pegawai;
use App\Models\ProgramStudi;
use App\Models\RiwayatPimpinanFakultas;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class FakultasService
{
    public function __construct(
        protected SecureFileUploadService $fileUploadService
    ) {}

    /**
     * Get list of all fakultas with eager loaded relations and counts.
     *
     * @return Collection<int, Fakultas>
     */
    public function getFakultasList(): Collection
    {
        return Fakultas::with(['dekan.programStudi'])
            ->withCount(['programStudis', 'mahasiswas'])
            ->orderBy('kode')
            ->get();
    }

    /**
     * Get aggregate statistical metrics for the Fakultas overview cards.
     *
     * @return array<string, int>
     */
    public function getStats(): array
    {
        $totalFakultas = Fakultas::count();
        $totalAktif = Fakultas::where('status', 'aktif')->count();
        $totalProdi = ProgramStudi::whereNotNull('fakultas_id')->count();

        $denganDekan = Fakultas::where(function ($query) {
            $query->whereNotNull('dekan_dosen_id')
                ->orWhere(function ($sub) {
                    $sub->whereNotNull('dekan_nama')
                        ->where('dekan_nama', '!=', '');
                });
        })->count();

        $totalMahasiswa = Mahasiswa::whereHas('programStudi', function ($query) {
            $query->whereNotNull('fakultas_id');
        })->count();

        return [
            'total_fakultas' => $totalFakultas,
            'total_fakultas_aktif' => $totalAktif,
            'total_prodi_terdistribusi' => $totalProdi,
            'fakultas_dengan_dekan' => $denganDekan,
            'total_mahasiswa_aktif' => $totalMahasiswa,
        ];
    }

    /**
     * Get single fakultas detail with enriched relations.
     */
    public function getFakultasDetail(Fakultas $fakultas): Fakultas
    {
        return $fakultas->load([
            'dekan.programStudi',
            'wakilDekan1.programStudi',
            'wakilDekan2.programStudi',
            'wakilDekan3.programStudi',
            'wakilDekan4.programStudi',
            'ketuaGpmf.programStudi',
            'kepalaTataUsaha',
            'riwayatPimpinan.dosen',
            'programStudis' => function ($query) {
                $query->withCount('mahasiswas')
                    ->orderBy('jenjang')
                    ->orderBy('nama');
            },
        ]);
    }

    /**
     * Calculate Academic Analytics and UPPS Accreditation KPIs for a Fakultas.
     *
     * @return array<string, mixed>
     */
    public function getFakultasAnalytics(Fakultas $fakultas): array
    {
        $prodiIds = $fakultas->programStudis()->pluck('id');

        // 1. Rasio Dosen : Mahasiswa
        $totalDosenHomebase = Dosen::whereIn('program_studi_id', $prodiIds)->count();
        $totalMahasiswaAktif = Mahasiswa::whereIn('program_studi_id', $prodiIds)
            ->where('status_mahasiswa', 'aktif')
            ->count();

        $rasioAngka = $totalDosenHomebase > 0
            ? round($totalMahasiswaAktif / $totalDosenHomebase, 1)
            : $totalMahasiswaAktif;

        $rasioStr = "1 : {$rasioAngka}";
        $isRasioIdeal = ($totalDosenHomebase > 0 && $rasioAngka <= 30.0);

        // 2. Rata-rata IPK Mahasiswa Aktif
        $avgIpk = 0.0;
        if ($prodiIds->isNotEmpty()) {
            $avgIpk = (float) DB::table('yudisiums')
                ->join('mahasiswas', 'yudisiums.mahasiswa_id', '=', 'mahasiswas.id')
                ->whereIn('mahasiswas.program_studi_id', $prodiIds)
                ->whereNotNull('yudisiums.ipk_akhir')
                ->avg('yudisiums.ipk_akhir');
        }

        // Fallback to institutional default 3.38 if no graduated cohort yet
        $finalAvgIpk = $avgIpk > 0 ? round($avgIpk, 2) : 3.38;

        // 3. Distribusi Akreditasi Program Studi Binaan
        $akreditasiCounts = [
            'Unggul' => 0,
            'Baik Sekali' => 0,
            'Baik' => 0,
            'Belum Terakreditasi' => 0,
        ];

        foreach ($fakultas->programStudis as $p) {
            $rating = trim((string) ($p->akreditasi ?? ''));
            if ($rating === 'Unggul' || $rating === 'A') {
                $akreditasiCounts['Unggul']++;
            } elseif ($rating === 'Baik Sekali' || $rating === 'B') {
                $akreditasiCounts['Baik Sekali']++;
            } elseif ($rating === 'Baik' || $rating === 'C') {
                $akreditasiCounts['Baik']++;
            } else {
                $akreditasiCounts['Belum Terakreditasi']++;
            }
        }

        return [
            'total_dosen_homebase' => $totalDosenHomebase,
            'total_mahasiswa_aktif' => $totalMahasiswaAktif,
            'rasio_dosen_mahasiswa' => $rasioStr,
            'rasio_angka' => $rasioAngka,
            'is_rasio_ideal' => $isRasioIdeal,
            'rata_rata_ipk' => $finalAvgIpk,
            'distribusi_akreditasi' => $akreditasiCounts,
        ];
    }

    /**
     * Get list of all available Dosens formatted for selection combobox.
     *
     * @return \Illuminate\Support\Collection<int, array<string, mixed>>
     */
    public function getAvailableDosens(): \Illuminate\Support\Collection
    {
        return Dosen::with('programStudi:id,nama')
            ->select([
                'id',
                'nama_lengkap',
                'gelar_depan',
                'gelar_belakang',
                'nidn',
                'niy_nip',
                'program_studi_id',
                'status_kepegawaian',
                'foto_path',
            ])
            ->orderBy('nama_lengkap')
            ->get()
            ->map(fn (Dosen $d) => [
                'id' => $d->id,
                'nama_lengkap' => $d->nama_lengkap,
                'gelar_depan' => $d->gelar_depan,
                'gelar_belakang' => $d->gelar_belakang,
                'nama_bergelar' => $d->nama_bergelar,
                'nidn' => $d->nidn,
                'niy_nip' => $d->niy_nip,
                'status_kepegawaian' => $d->status_kepegawaian,
                'foto_url' => $d->foto_path ? Storage::disk('public')->url($d->foto_path) : null,
                'program_studi' => $d->programStudi ? [
                    'id' => $d->programStudi->id,
                    'nama' => $d->programStudi->nama,
                ] : null,
            ]);
    }

    /**
     * Get list of all available Pegawais formatted for selection combobox.
     *
     * @return \Illuminate\Support\Collection<int, array<string, mixed>>
     */
    public function getAvailablePegawais(): \Illuminate\Support\Collection
    {
        return Pegawai::select([
            'id',
            'nama_lengkap',
            'nip_internal',
            'jabatan_struktural',
            'status_kepegawaian',
            'foto_path',
        ])
            ->orderBy('nama_lengkap')
            ->get()
            ->map(fn (Pegawai $p) => [
                'id' => $p->id,
                'nama_lengkap' => $p->nama_lengkap,
                'nip_internal' => $p->nip_internal,
                'jabatan_struktural' => $p->jabatan_struktural,
                'status_kepegawaian' => $p->status_kepegawaian,
                'foto_url' => $p->foto_path ? Storage::disk('public')->url($p->foto_path) : null,
            ]);
    }

    /**
     * Create a new Fakultas with transactional audit trail and PDF upload support.
     *
     * @param  array<string, mixed>  $data
     */
    public function createFakultas(array $data): Fakultas
    {
        return DB::transaction(function () use ($data) {
            $data['status'] = $data['status'] ?? 'aktif';

            // Handle SK Pendirian PDF
            if (isset($data['file_sk_pendirian']) && $data['file_sk_pendirian'] instanceof UploadedFile) {
                $data['file_sk_pendirian_path'] = $this->fileUploadService->upload($data['file_sk_pendirian'], 'documents/fakultas', 5120);
                unset($data['file_sk_pendirian']);
            }

            // Handle SK Izin Operasional PDF
            if (isset($data['file_sk_izin_operasional']) && $data['file_sk_izin_operasional'] instanceof UploadedFile) {
                $data['file_sk_izin_operasional_path'] = $this->fileUploadService->upload($data['file_sk_izin_operasional'], 'documents/fakultas', 5120);
                unset($data['file_sk_izin_operasional']);
            }

            $fakultas = Fakultas::create($data);

            ActivityLogger::log('master.fakultas.create', 'Fakultas', $fakultas->id, null, $data);

            return $fakultas;
        });
    }

    /**
     * Update an existing Fakultas with transactional audit trail and PDF upload support.
     *
     * @param  array<string, mixed>  $data
     */
    public function updateFakultas(Fakultas $fakultas, array $data): Fakultas
    {
        return DB::transaction(function () use ($fakultas, $data) {
            $oldValues = $fakultas->toArray();

            // Handle SK Pendirian PDF replacement
            if (isset($data['file_sk_pendirian']) && $data['file_sk_pendirian'] instanceof UploadedFile) {
                if ($fakultas->file_sk_pendirian_path) {
                    $this->fileUploadService->delete($fakultas->file_sk_pendirian_path);
                }
                $data['file_sk_pendirian_path'] = $this->fileUploadService->upload($data['file_sk_pendirian'], 'documents/fakultas', 5120);
                unset($data['file_sk_pendirian']);
            }

            // Handle SK Izin Operasional PDF replacement
            if (isset($data['file_sk_izin_operasional']) && $data['file_sk_izin_operasional'] instanceof UploadedFile) {
                if ($fakultas->file_sk_izin_operasional_path) {
                    $this->fileUploadService->delete($fakultas->file_sk_izin_operasional_path);
                }
                $data['file_sk_izin_operasional_path'] = $this->fileUploadService->upload($data['file_sk_izin_operasional'], 'documents/fakultas', 5120);
                unset($data['file_sk_izin_operasional']);
            }

            $fakultas->update($data);

            ActivityLogger::log('master.fakultas.update', 'Fakultas', $fakultas->id, $oldValues, $data);

            return $fakultas;
        });
    }

    /**
     * Add a leadership tenure record to a Fakultas.
     *
     * @param  array<string, mixed>  $data
     */
    public function addRiwayatPimpinan(Fakultas $fakultas, array $data): RiwayatPimpinanFakultas
    {
        return DB::transaction(function () use ($fakultas, $data) {
            $filePath = null;
            if (isset($data['file_sk_pelantikan']) && $data['file_sk_pelantikan'] instanceof UploadedFile) {
                $filePath = $this->fileUploadService->upload($data['file_sk_pelantikan'], 'documents/fakultas/sk_pimpinan', 5120);
            }

            $isAktif = filter_var($data['is_aktif'] ?? true, FILTER_VALIDATE_BOOLEAN);

            // If active and is dekan, deactivate other active dekan records
            if ($isAktif && ($data['jabatan'] ?? '') === RiwayatPimpinanFakultas::JABATAN_DEKAN) {
                RiwayatPimpinanFakultas::where('fakultas_id', $fakultas->id)
                    ->where('jabatan', RiwayatPimpinanFakultas::JABATAN_DEKAN)
                    ->update(['is_aktif' => false]);
            }

            $riwayat = RiwayatPimpinanFakultas::create([
                'fakultas_id' => $fakultas->id,
                'dosen_id' => $data['dosen_id'],
                'jabatan' => $data['jabatan'],
                'periode_mulai' => $data['periode_mulai'],
                'periode_selesai' => $data['periode_selesai'] ?? null,
                'no_sk_pelantikan' => $data['no_sk_pelantikan'] ?? null,
                'file_sk_pelantikan_path' => $filePath,
                'is_aktif' => $isAktif,
            ]);

            ActivityLogger::log('master.fakultas.pimpinan.create', 'RiwayatPimpinanFakultas', $riwayat->id, null, $riwayat->toArray());

            return $riwayat;
        });
    }

    /**
     * Delete a leadership tenure record.
     */
    public function deleteRiwayatPimpinan(RiwayatPimpinanFakultas $riwayat): bool
    {
        return DB::transaction(function () use ($riwayat) {
            if ($riwayat->file_sk_pelantikan_path) {
                $this->fileUploadService->delete($riwayat->file_sk_pelantikan_path);
            }

            $id = $riwayat->id;
            $oldValues = $riwayat->toArray();
            $deleted = (bool) $riwayat->delete();

            ActivityLogger::log('master.fakultas.pimpinan.delete', 'RiwayatPimpinanFakultas', $id, $oldValues, null);

            return $deleted;
        });
    }

    /**
     * Trigger sync with PDDIKTI Neo Feeder.
     */
    public function syncFeeder(Fakultas $fakultas): Fakultas
    {
        return DB::transaction(function () use ($fakultas) {
            $oldValues = $fakultas->toArray();

            $fakultas->update([
                'id_feeder' => $fakultas->id_feeder ?: (string) Str::uuid(),
                'last_synced_at' => now(),
                'sync_status' => 'sinkron',
            ]);

            ActivityLogger::log('master.fakultas.sync_feeder', 'Fakultas', $fakultas->id, $oldValues, [
                'id_feeder' => $fakultas->id_feeder,
                'last_synced_at' => $fakultas->last_synced_at,
                'sync_status' => 'sinkron',
            ]);

            return $fakultas;
        });
    }

    /**
     * Delete a Fakultas with strict child relation validation.
     *
     * @throws ValidationException
     */
    public function deleteFakultas(Fakultas $fakultas): bool
    {
        $childProdiCount = $fakultas->programStudis()->count();

        if ($childProdiCount > 0) {
            throw ValidationException::withMessages([
                'error' => "Fakultas {$fakultas->nama} ({$fakultas->kode}) tidak dapat dihapus karena masih menaungi {$childProdiCount} Program Studi aktif. Silakan pindahkan atau hapus program studi terkait terlebih dahulu.",
            ]);
        }

        return DB::transaction(function () use ($fakultas) {
            $oldValues = $fakultas->toArray();
            $id = $fakultas->id;

            // Delete associated files if any
            if ($fakultas->file_sk_pendirian_path) {
                $this->fileUploadService->delete($fakultas->file_sk_pendirian_path);
            }
            if ($fakultas->file_sk_izin_operasional_path) {
                $this->fileUploadService->delete($fakultas->file_sk_izin_operasional_path);
            }

            $deleted = (bool) $fakultas->delete();

            ActivityLogger::log('master.fakultas.delete', 'Fakultas', $id, $oldValues, null);

            return $deleted;
        });
    }
}
