<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\Dosen;
use App\Models\Fakultas;
use App\Models\PerguruanTinggi;
use App\Models\ProgramStudi;
use App\Services\ActivityLogger;
use App\Services\SecureFileUploadService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProgramStudiController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        $programStudis = ProgramStudi::with('fakultas')
            ->withCount(['konsentrasis', 'mahasiswas', 'dosens'])
            ->orderBy('kode')
            ->get();

        $fakultas = Fakultas::orderBy('kode')->get(['id', 'kode', 'nama']);
        $dosens = Dosen::orderBy('nama_lengkap')->get(['id', 'nama_lengkap', 'nidn', 'gelar_depan', 'gelar_belakang', 'niy_nip']);

        return Inertia::render('master/program-studi/index', [
            'programStudis' => $programStudis,
            'fakultas' => $fakultas,
            'dosens' => $dosens,
        ]);
    }

    /**
     * Display the specified program studi detail page (matching reference UI).
     */
    public function show(ProgramStudi $programStudi): Response
    {
        $programStudi->load(['fakultas', 'konsentrasis']);
        $pt = PerguruanTinggi::first();
        $dosens = Dosen::orderBy('nama_lengkap')->get(['id', 'nama_lengkap', 'nidn', 'gelar_depan', 'gelar_belakang', 'niy_nip']);
        $fakultas = Fakultas::orderBy('kode')->get(['id', 'kode', 'nama']);

        return Inertia::render('master/program-studi/show', [
            'programStudi' => $programStudi,
            'perguruanTinggi' => $pt,
            'dosens' => $dosens,
            'fakultas' => $fakultas,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, SecureFileUploadService $fileService): RedirectResponse
    {
        $validated = $request->validate([
            'fakultas_id' => ['required', 'exists:fakultas,id'],
            'kode' => ['required', 'string', 'max:20', 'unique:program_studis,kode'],
            'nama' => ['required', 'string', 'max:255'],
            'nama_en' => ['nullable', 'string', 'max:255'],
            'nama_singkat' => ['nullable', 'string', 'max:100'],
            'jenjang' => ['required', 'string', 'max:20'],
            'periode_berdiri' => ['nullable', 'string', 'max:100'],
            'gelar' => ['nullable', 'string', 'max:100'],
            'gelar_singkat' => ['nullable', 'string', 'max:20'],
            'gelar_en' => ['nullable', 'string', 'max:100'],
            'gelar_singkat_en' => ['nullable', 'string', 'max:20'],
            'status' => ['nullable', 'in:aktif,nonaktif'],
            'status_spmb' => ['nullable', 'in:aktif,nonaktif'],
            'terdaftar_lptk' => ['nullable', 'boolean'],

            // Pejabat
            'ketua_prodi_nama' => ['nullable', 'string', 'max:255'],
            'ketua_prodi_nidn' => ['nullable', 'string', 'max:50'],
            'sekretaris_prodi_nama' => ['nullable', 'string', 'max:255'],

            // Akademik
            'sks_lulus_min' => ['nullable', 'integer', 'min:30', 'max:200'],
            'ipk_lulus_min' => ['nullable', 'numeric', 'min:2.00', 'max:4.00'],
            'tugas_akhir_syarat' => ['nullable', 'boolean'],
            'jenis_tugas_akhir' => ['nullable', 'string', 'max:100'],
            'pengaturan_transfer_nilai' => ['nullable', 'string', 'max:100'],
            'max_dosen_pembimbing' => ['nullable', 'integer', 'min:1', 'max:5'],
            'max_dosen_penguji' => ['nullable', 'integer', 'min:1', 'max:5'],
            'periode_hitung_ips' => ['nullable', 'string', 'max:100'],

            // Akreditasi
            'lembaga_akreditasi' => ['nullable', 'string', 'max:100'],
            'akreditasi' => ['nullable', 'string', 'max:100'],
            'nilai_akreditasi' => ['nullable', 'string', 'max:50'],
            'no_sk_akreditasi' => ['nullable', 'string', 'max:150'],
            'tanggal_sk_akreditasi' => ['nullable', 'date'],
            'tanggal_berlaku_akreditasi' => ['nullable', 'date'],
            'tanggal_berakhir_akreditasi' => ['nullable', 'date'],
            'file_sertifikat_akreditasi' => ['nullable', 'file', 'mimetypes:application/pdf,image/jpeg,image/png', 'max:5120'],

            // Kontak
            'alamat' => ['nullable', 'string', 'max:500'],
            'telepon' => ['nullable', 'string', 'max:50'],
            'email' => ['nullable', 'email', 'max:100'],
            'website' => ['nullable', 'string', 'max:255'],
        ], [
            'fakultas_id.required' => 'Fakultas wajib dipilih.',
            'kode.required' => 'Kode program studi wajib diisi.',
            'kode.unique' => 'Kode program studi sudah digunakan.',
            'nama.required' => 'Nama program studi wajib diisi.',
            'jenjang.required' => 'Jenjang wajib diisi.',
        ]);

        $validated['status'] = $validated['status'] ?? 'aktif';
        $validated['status_spmb'] = $validated['status_spmb'] ?? 'aktif';
        $validated['terdaftar_lptk'] = $validated['terdaftar_lptk'] ?? false;
        $validated['sks_lulus_min'] = $validated['sks_lulus_min'] ?? 144;
        $validated['ipk_lulus_min'] = $validated['ipk_lulus_min'] ?? 2.00;
        $validated['tugas_akhir_syarat'] = $validated['tugas_akhir_syarat'] ?? true;
        $validated['jenis_tugas_akhir'] = $validated['jenis_tugas_akhir'] ?? 'Skripsi';
        $validated['pengaturan_transfer_nilai'] = $validated['pengaturan_transfer_nilai'] ?? 'Masuk Transkrip Akademik';
        $validated['max_dosen_pembimbing'] = $validated['max_dosen_pembimbing'] ?? 2;
        $validated['max_dosen_penguji'] = $validated['max_dosen_penguji'] ?? 2;
        $validated['periode_hitung_ips'] = $validated['periode_hitung_ips'] ?? 'Periode terakhir mahasiswa aktif';

        if ($request->hasFile('file_sertifikat_akreditasi')) {
            $path = $fileService->upload($request->file('file_sertifikat_akreditasi'), 'akreditasi_prodi');
            $validated['file_sertifikat_akreditasi'] = $path;
        }

        $prodi = ProgramStudi::create($validated);

        ActivityLogger::log('master.program_studi.create', 'ProgramStudi', $prodi->id, null, $validated);

        return back()->with('success', 'Program studi berhasil ditambahkan.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, ProgramStudi $programStudi, SecureFileUploadService $fileService): RedirectResponse
    {
        $validated = $request->validate([
            'fakultas_id' => ['required', 'exists:fakultas,id'],
            'kode' => ['required', 'string', 'max:20', 'unique:program_studis,kode,'.$programStudi->id],
            'nama' => ['required', 'string', 'max:255'],
            'nama_en' => ['nullable', 'string', 'max:255'],
            'nama_singkat' => ['nullable', 'string', 'max:100'],
            'jenjang' => ['required', 'string', 'max:20'],
            'periode_berdiri' => ['nullable', 'string', 'max:100'],
            'gelar' => ['nullable', 'string', 'max:100'],
            'gelar_singkat' => ['nullable', 'string', 'max:20'],
            'gelar_en' => ['nullable', 'string', 'max:100'],
            'gelar_singkat_en' => ['nullable', 'string', 'max:20'],
            'status' => ['required', 'in:aktif,nonaktif'],
            'status_spmb' => ['required', 'in:aktif,nonaktif'],
            'terdaftar_lptk' => ['required', 'boolean'],

            // Pejabat
            'ketua_prodi_nama' => ['nullable', 'string', 'max:255'],
            'ketua_prodi_nidn' => ['nullable', 'string', 'max:50'],
            'sekretaris_prodi_nama' => ['nullable', 'string', 'max:255'],

            // Akademik
            'sks_lulus_min' => ['required', 'integer', 'min:30', 'max:200'],
            'ipk_lulus_min' => ['required', 'numeric', 'min:2.00', 'max:4.00'],
            'tugas_akhir_syarat' => ['required', 'boolean'],
            'jenis_tugas_akhir' => ['required', 'string', 'max:100'],
            'pengaturan_transfer_nilai' => ['required', 'string', 'max:100'],
            'max_dosen_pembimbing' => ['required', 'integer', 'min:1', 'max:5'],
            'max_dosen_penguji' => ['required', 'integer', 'min:1', 'max:5'],
            'periode_hitung_ips' => ['required', 'string', 'max:100'],

            // Akreditasi
            'lembaga_akreditasi' => ['nullable', 'string', 'max:100'],
            'akreditasi' => ['nullable', 'string', 'max:100'],
            'nilai_akreditasi' => ['nullable', 'string', 'max:50'],
            'no_sk_akreditasi' => ['nullable', 'string', 'max:150'],
            'tanggal_sk_akreditasi' => ['nullable', 'date'],
            'tanggal_berlaku_akreditasi' => ['nullable', 'date'],
            'tanggal_berakhir_akreditasi' => ['nullable', 'date'],
            'file_sertifikat_akreditasi' => ['nullable', 'file', 'mimetypes:application/pdf,image/jpeg,image/png', 'max:5120'],

            // Kontak
            'alamat' => ['nullable', 'string', 'max:500'],
            'telepon' => ['nullable', 'string', 'max:50'],
            'email' => ['nullable', 'email', 'max:100'],
            'website' => ['nullable', 'string', 'max:255'],
        ], [
            'fakultas_id.required' => 'Fakultas wajib dipilih.',
            'kode.required' => 'Kode program studi wajib diisi.',
            'kode.unique' => 'Kode program studi sudah digunakan.',
            'nama.required' => 'Nama program studi wajib diisi.',
            'jenjang.required' => 'Jenjang wajib diisi.',
        ]);

        if ($request->hasFile('file_sertifikat_akreditasi')) {
            $path = $fileService->upload($request->file('file_sertifikat_akreditasi'), 'akreditasi_prodi');
            $validated['file_sertifikat_akreditasi'] = $path;
        } else {
            unset($validated['file_sertifikat_akreditasi']);
        }

        $oldValues = $programStudi->toArray();
        $programStudi->update($validated);

        ActivityLogger::log('master.program_studi.update', 'ProgramStudi', $programStudi->id, $oldValues, $validated);

        return back()->with('success', 'Program studi berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ProgramStudi $programStudi): RedirectResponse
    {
        if ($programStudi->mahasiswas()->exists()) {
            return back()->with('error', 'Program studi tidak dapat dihapus karena masih memiliki data mahasiswa terdaftar.');
        }

        if ($programStudi->dosens()->exists()) {
            return back()->with('error', 'Program studi tidak dapat dihapus karena masih memiliki dosen homebase.');
        }

        if ($programStudi->kurikulumProdis()->exists()) {
            return back()->with('error', 'Program studi tidak dapat dihapus karena masih memiliki kurikulum program studi.');
        }

        $oldValues = $programStudi->toArray();
        $id = $programStudi->id;
        $programStudi->delete();

        ActivityLogger::log('master.program_studi.delete', 'ProgramStudi', $id, $oldValues, null);

        return back()->with('success', 'Program studi berhasil dihapus.');
    }
}
