<?php

namespace App\Services;

use App\Models\PerguruanTinggi;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Cache;

class PerguruanTinggiService
{
    public function __construct(
        protected SecureFileUploadService $fileService
    ) {}

    /**
     * Get or initialize the primary Perguruan Tinggi singleton record.
     */
    public function getInstitution(): PerguruanTinggi
    {
        $pt = PerguruanTinggi::first();

        if (! $pt) {
            $pt = PerguruanTinggi::create([
                'kode_unit' => '213048',
                'nama_unit' => 'STAI Al-Yasini Pasuruan',
                'nama_unit_en' => 'STAI Al-Yasini Pasuruan',
                'nama_singkat' => 'STAI Al-Yasini',
                'jenis_perguruan_tinggi' => 'Sekolah Tinggi',
                'status_milik' => 'Swasta',
                'lembaga_naungan' => 'PTA Islam Swasta',
                'no_sk_pendirian' => 'Dj.I/149/2012',
                'tanggal_sk_pendirian' => '2012-01-27',
                'ketua_nama' => 'Dr. Akh. Syamsul Muniri, M.S.I',
                'ketua_nidn' => '2113058301',
                'wakil_ketua_1' => '2104118501 - Dr. Mohamad Mishbahuddin, M.Pd.I',
                'wakil_ketua_2' => 'LB002 - Muhammad Sholeh, M.Pd',
                'lembaga_akreditasi' => 'BAN-PT',
                'peringkat_akreditasi' => 'Baik',
                'no_sk_akreditasi' => '481/SK/BAN-PT/Ak/PT/VIII/2022',
                'tanggal_sk_akreditasi' => '2022-08-30',
                'tanggal_berlaku_akreditasi' => '2022-08-30',
                'tanggal_berakhir_akreditasi' => '2027-08-30',
                'alamat' => 'Jl. Pesantren Terpadu Al-Yasini Kec. Wonorejo Kab. Pasuruan 67173',
                'telepon' => '081333220202',
                'email' => 'info@stai-alyasini.ac.id',
                'website' => 'https://www.stai-alyasini.ac.id',
            ]);
        }

        return $pt->loadMissing(['ketuaDosen.programStudi', 'wakilKetua1Dosen.programStudi']);
    }

    /**
     * Update institution profile, legalities, officials, branding assets, and coordinates.
     *
     * @param  array<string, mixed>  $data
     */
    public function update(array $data): PerguruanTinggi
    {
        $pt = $this->getInstitution();
        $oldData = $pt->toArray();

        // 1. Handle File Sertifikat Akreditasi
        if (! empty($data['hapus_file_sertifikat'])) {
            if ($pt->file_sertifikat_akreditasi) {
                $this->fileService->delete($pt->file_sertifikat_akreditasi);
            }
            $data['file_sertifikat_akreditasi'] = null;
        } elseif (isset($data['file_sertifikat_akreditasi']) && $data['file_sertifikat_akreditasi'] instanceof UploadedFile) {
            if ($pt->file_sertifikat_akreditasi) {
                $this->fileService->delete($pt->file_sertifikat_akreditasi);
            }
            $path = $this->fileService->upload($data['file_sertifikat_akreditasi'], 'akreditasi_institusi');
            $data['file_sertifikat_akreditasi'] = $path;
        } else {
            unset($data['file_sertifikat_akreditasi']);
        }
        unset($data['hapus_file_sertifikat']);

        // 2. Handle Logo Utama
        if (! empty($data['hapus_logo'])) {
            if ($pt->logo_path) {
                $this->fileService->delete($pt->logo_path);
            }
            $data['logo_path'] = null;
        } elseif (isset($data['logo']) && $data['logo'] instanceof UploadedFile) {
            if ($pt->logo_path) {
                $this->fileService->delete($pt->logo_path);
            }
            $path = $this->fileService->upload($data['logo'], 'branding', 2048, true);
            $data['logo_path'] = $path;
        }
        unset($data['logo'], $data['hapus_logo']);

        // 3. Handle Logo Kop Surat
        if (! empty($data['hapus_logo_kop'])) {
            if ($pt->logo_kop_path) {
                $this->fileService->delete($pt->logo_kop_path);
            }
            $data['logo_kop_path'] = null;
        } elseif (isset($data['logo_kop']) && $data['logo_kop'] instanceof UploadedFile) {
            if ($pt->logo_kop_path) {
                $this->fileService->delete($pt->logo_kop_path);
            }
            $path = $this->fileService->upload($data['logo_kop'], 'branding', 2048, true);
            $data['logo_kop_path'] = $path;
        }
        unset($data['logo_kop'], $data['hapus_logo_kop']);

        // 4. Handle Stempel Resmi
        if (! empty($data['hapus_stempel'])) {
            if ($pt->stempel_path) {
                $this->fileService->delete($pt->stempel_path);
            }
            $data['stempel_path'] = null;
        } elseif (isset($data['stempel']) && $data['stempel'] instanceof UploadedFile) {
            if ($pt->stempel_path) {
                $this->fileService->delete($pt->stempel_path);
            }
            $path = $this->fileService->upload($data['stempel'], 'branding', 2048, true);
            $data['stempel_path'] = $path;
        }
        unset($data['stempel'], $data['hapus_stempel']);

        // 5. Handle Tanda Tangan Digital Rektor / Ketua
        if (! empty($data['hapus_ttd_ketua'])) {
            if ($pt->ttd_ketua_path) {
                $this->fileService->delete($pt->ttd_ketua_path);
            }
            $data['ttd_ketua_path'] = null;
        } elseif (isset($data['ttd_ketua']) && $data['ttd_ketua'] instanceof UploadedFile) {
            if ($pt->ttd_ketua_path) {
                $this->fileService->delete($pt->ttd_ketua_path);
            }
            $path = $this->fileService->upload($data['ttd_ketua'], 'branding', 2048, true);
            $data['ttd_ketua_path'] = $path;
        }
        unset($data['ttd_ketua'], $data['hapus_ttd_ketua']);

        // 6. Update database record
        $pt->update($data);

        // 7. Flush shared cache
        Cache::forget('global_perguruan_tinggi');

        // 8. Log audit trail
        ActivityLogger::log('master.perguruan_tinggi.update', 'PerguruanTinggi', $pt->id, $oldData, $data);

        return $pt->fresh(['ketuaDosen.programStudi', 'wakilKetua1Dosen.programStudi']);
    }
}
