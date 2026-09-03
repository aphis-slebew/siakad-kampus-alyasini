<?php

namespace App\Http\Controllers\Kepegawaian;

use App\Http\Controllers\Controller;
use App\Models\UnitKerja;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UnitKerjaController extends Controller
{
    /**
     * Tampilkan daftar unit kerja kampus beserta jumlah pegawainya.
     */
    public function index(): Response
    {
        $unitKerjas = UnitKerja::withCount('pegawais')->orderBy('nama')->get();

        return Inertia::render('kepegawaian/unit-kerja/index', [
            'unitKerjas' => $unitKerjas,
        ]);
    }

    /**
     * Simpan data unit kerja baru.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'kode' => 'required|string|max:20|unique:unit_kerjas,kode',
            'nama' => 'required|string|max:150',
        ]);

        UnitKerja::create($validated);

        return back()->with('success', 'Unit kerja berhasil ditambahkan.');
    }

    /**
     * Update data unit kerja.
     */
    public function update(Request $request, UnitKerja $unitKerja): RedirectResponse
    {
        $validated = $request->validate([
            'kode' => 'required|string|max:20|unique:unit_kerjas,kode,'.$unitKerja->id,
            'nama' => 'required|string|max:150',
        ]);

        $unitKerja->update($validated);

        return back()->with('success', 'Unit kerja berhasil diperbarui.');
    }

    /**
     * Hapus data unit kerja.
     */
    public function destroy(UnitKerja $unitKerja): RedirectResponse
    {
        if ($unitKerja->pegawais()->exists()) {
            return back()->with('error', 'Unit kerja tidak dapat dihapus karena masih memiliki staf/pegawai aktif.');
        }

        $unitKerja->delete();

        return back()->with('success', 'Unit kerja berhasil dihapus.');
    }
}
