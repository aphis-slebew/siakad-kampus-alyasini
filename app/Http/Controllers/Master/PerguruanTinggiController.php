<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\Dosen;
use App\Models\PerguruanTinggi;
use App\Services\ActivityLogger;
use App\Services\SecureFileUploadService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PerguruanTinggiController extends Controller
{
    /**
     * Display the institution profile and accreditation details.
     */
    public function index(): Response
    {
        $pt = PerguruanTinggi::first();

        if (! $pt) {
            $pt = PerguruanTinggi::create([
                'kode_unit' => '213048',
                'nama_unit' => 'STAI Al-Yasini Pasuruan',
                'nama_unit_en' => 'STAI Al-Yasini Pasuruan',
                'nama_singkat' => 'STAI Al-Yasini',
                'jenis_perguruan_tinggi' => 'Sekolah Tinggi',
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

        $dosens = Dosen::orderBy('nama_lengkap')->get(['id', 'nama_lengkap', 'nidn', 'gelar_depan', 'gelar_belakang']);

        return Inertia::render('master/perguruan-tinggi/index', [
            'perguruanTinggi' => $pt,
            'dosens' => $dosens,
        ]);
    }

    /**
     * Update the institution profile, officials, accreditation, and contacts.
     */
    public function update(Request $request, SecureFileUploadService $fileService): RedirectResponse
    {
        $pt = PerguruanTinggi::firstOrCreate([], [
            'kode_unit' => '213048',
            'nama_unit' => 'STAI Al-Yasini Pasuruan',
            'nama_singkat' => 'STAI Al-Yasini',
            'jenis_perguruan_tinggi' => 'Sekolah Tinggi',
            'lembaga_naungan' => 'PTA Islam Swasta',
            'alamat' => 'Jl. Pesantren Terpadu Al-Yasini Kec. Wonorejo Kab. Pasuruan 67173',
            'email' => 'info@stai-alyasini.ac.id',
            'website' => 'https://www.stai-alyasini.ac.id',
        ]);

        $validated = $request->validate([
            'kode_unit' => ['nullable', 'string', 'max:50'],
            'nama_unit' => ['required', 'string', 'max:255'],
            'nama_unit_en' => ['nullable', 'string', 'max:255'],
            'nama_singkat' => ['nullable', 'string', 'max:100'],
            'jenis_perguruan_tinggi' => ['nullable', 'string', 'max:100'],
            'lembaga_naungan' => ['nullable', 'string', 'max:150'],
            'periode_berdiri' => ['nullable', 'string', 'max:100'],
            'no_sk_pendirian' => ['nullable', 'string', 'max:150'],
            'tanggal_sk_pendirian' => ['nullable', 'date'],

            'ketua_nama' => ['nullable', 'string', 'max:255'],
            'ketua_nidn' => ['nullable', 'string', 'max:50'],
            'wakil_ketua_1' => ['nullable', 'string', 'max:255'],
            'wakil_ketua_2' => ['nullable', 'string', 'max:255'],
            'wakil_ketua_3' => ['nullable', 'string', 'max:255'],
            'wakil_ketua_4' => ['nullable', 'string', 'max:255'],

            'lembaga_akreditasi' => ['nullable', 'string', 'max:100'],
            'peringkat_akreditasi' => ['nullable', 'string', 'max:100'],
            'nilai_akreditasi' => ['nullable', 'string', 'max:50'],
            'no_sk_akreditasi' => ['nullable', 'string', 'max:150'],
            'tanggal_sk_akreditasi' => ['nullable', 'date'],
            'tanggal_berlaku_akreditasi' => ['nullable', 'date'],
            'tanggal_berakhir_akreditasi' => ['nullable', 'date'],
            'file_sertifikat_akreditasi' => ['nullable', 'file', 'mimetypes:application/pdf,image/jpeg,image/png', 'max:5120'],

            'visi' => ['nullable', 'string'],
            'misi' => ['nullable', 'string'],
            'alamat' => ['nullable', 'string', 'max:500'],
            'telepon' => ['nullable', 'string', 'max:50'],
            'email' => ['nullable', 'email', 'max:100'],
            'website' => ['nullable', 'string', 'max:255'],
            'fax' => ['nullable', 'string', 'max:50'],
        ]);

        if ($request->hasFile('file_sertifikat_akreditasi')) {
            $path = $fileService->upload($request->file('file_sertifikat_akreditasi'), 'akreditasi_institusi');
            $validated['file_sertifikat_akreditasi'] = $path;
        }

        $oldData = $pt->toArray();
        $pt->update($validated);

        ActivityLogger::log('master.perguruan_tinggi.update', 'PerguruanTinggi', $pt->id, $oldData, $validated);

        return back()->with('success', 'Data Perguruan Tinggi berhasil diperbarui.');
    }
}
