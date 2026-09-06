<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\AktivitasMahasiswa;
use App\Models\BeasiswaMahasiswa;
use App\Models\Mahasiswa;
use App\Models\Matakuliah;
use App\Models\PelanggaranMahasiswa;
use App\Models\ReferensiBiodata;
use App\Services\ActivityLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReferensiBiodataController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        $referensiBiodatas = ReferensiBiodata::orderBy('tipe')
            ->orderBy('nama')
            ->get();

        return Inertia::render('master/referensi-biodata/index', [
            'referensiBiodatas' => $referensiBiodatas,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'tipe' => ['required', 'string', 'max:50'],
            'nama' => ['required', 'string', 'max:255'],
            'pddikti_ref_id' => ['nullable', 'string', 'max:100'],
        ], [
            'tipe.required' => 'Tipe referensi wajib diisi.',
            'nama.required' => 'Nama referensi wajib diisi.',
        ]);

        $validated['tipe'] = trim(strtolower($validated['tipe']));

        $referensi = ReferensiBiodata::create($validated);

        ActivityLogger::log('master.referensi_biodata.create', 'ReferensiBiodata', $referensi->id, null, $validated);

        return back()->with('success', 'Referensi biodata berhasil ditambahkan.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, ReferensiBiodata $referensiBiodatum): RedirectResponse
    {
        $validated = $request->validate([
            'tipe' => ['required', 'string', 'max:50'],
            'nama' => ['required', 'string', 'max:255'],
            'pddikti_ref_id' => ['nullable', 'string', 'max:100'],
        ], [
            'tipe.required' => 'Tipe referensi wajib diisi.',
            'nama.required' => 'Nama referensi wajib diisi.',
        ]);

        $validated['tipe'] = trim(strtolower($validated['tipe']));

        $oldValues = $referensiBiodatum->only(['tipe', 'nama', 'pddikti_ref_id']);
        $referensiBiodatum->update($validated);

        ActivityLogger::log('master.referensi_biodata.update', 'ReferensiBiodata', $referensiBiodatum->id, $oldValues, $validated);

        return back()->with('success', 'Referensi biodata berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ReferensiBiodata $referensiBiodatum): RedirectResponse
    {
        $id = $referensiBiodatum->id;

        // Comprehensive safety check across all 9 FK columns in 5 tables
        $isUsedInMahasiswa = Mahasiswa::where('agama_referensi_biodata_id', $id)
            ->orWhere('pekerjaan_ayah_referensi_id', $id)
            ->orWhere('pekerjaan_ibu_referensi_id', $id)
            ->orWhere('penghasilan_ortu_referensi_id', $id)
            ->exists();

        $isUsedInMatakuliah = Matakuliah::where('bidang_ilmu_id', $id)->exists();
        $isUsedInAktivitas = AktivitasMahasiswa::where('jenis_aktivitas_id', $id)->exists();
        $isUsedInPelanggaran = PelanggaranMahasiswa::where('jenis_pelanggaran_id', $id)->orWhere('sanksi_id', $id)->exists();
        $isUsedInBeasiswa = BeasiswaMahasiswa::where('jenis_beasiswa_id', $id)->exists();

        if ($isUsedInMahasiswa || $isUsedInMatakuliah || $isUsedInAktivitas || $isUsedInPelanggaran || $isUsedInBeasiswa) {
            return back()->with('error', 'Referensi biodata "'.$referensiBiodatum->nama.'" tidak dapat dihapus karena sedang digunakan dalam data sistem.');
        }

        $oldValues = $referensiBiodatum->only(['tipe', 'nama', 'pddikti_ref_id']);
        $referensiBiodatum->delete();

        ActivityLogger::log('master.referensi_biodata.delete', 'ReferensiBiodata', $id, $oldValues, null);

        return back()->with('success', 'Referensi biodata berhasil dihapus.');
    }
}
