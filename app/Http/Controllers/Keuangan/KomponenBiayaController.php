<?php

namespace App\Http\Controllers\Keuangan;

use App\Http\Controllers\Controller;
use App\Models\KomponenBiaya;
use App\Models\ProgramStudi;
use App\Services\ActivityLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class KomponenBiayaController extends Controller
{
    /**
     * Display a listing of flexible fee components.
     */
    public function index(Request $request): Response
    {
        $kategori = $request->input('kategori');
        $prodiId = $request->input('program_studi_id');

        $query = KomponenBiaya::with('programStudi')->latest('id');

        if ($kategori && $kategori !== 'all') {
            $query->where('kategori', $kategori);
        }

        if ($prodiId && $prodiId !== 'all') {
            $query->where('program_studi_id', $prodiId);
        }

        $komponens = $query->get();
        $programStudis = ProgramStudi::orderBy('nama')->get(['id', 'kode', 'nama']);

        return Inertia::render('keuangan/komponen-biaya/index', [
            'komponens' => $komponens,
            'programStudis' => $programStudis,
            'filters' => [
                'kategori' => $kategori ?? 'all',
                'program_studi_id' => $prodiId ?? 'all',
            ],
        ]);
    }

    /**
     * Store a newly created fee component.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'kode' => ['required', 'string', 'max:50', 'unique:komponen_biayas,kode'],
            'nama' => ['required', 'string', 'max:255'],
            'kategori' => ['required', 'in:akademik,kegiatan,pendaftaran,kelulusan'],
            'program_studi_id' => ['nullable', 'exists:program_studis,id'],
            'angkatan' => ['nullable', 'integer', 'min:2000', 'max:'.((int) date('Y') + 1)],
            'nominal' => ['required', 'numeric', 'min:0'],
            'is_active' => ['boolean'],
            'keterangan' => ['nullable', 'string'],
        ], [
            'kode.required' => 'Kode komponen biaya wajib diisi.',
            'kode.unique' => 'Kode komponen biaya sudah ada.',
            'nama.required' => 'Nama komponen biaya wajib diisi.',
            'nominal.required' => 'Nominal biaya wajib diisi.',
        ]);

        $komponen = KomponenBiaya::create($validated);

        ActivityLogger::log('keuangan.komponen_biaya.create', 'KomponenBiaya', $komponen->id, null, $validated);

        return back()->with('success', 'Komponen tarif biaya berhasil ditambahkan.');
    }

    /**
     * Update the specified fee component.
     */
    public function update(Request $request, KomponenBiaya $komponenBiaya): RedirectResponse
    {
        $validated = $request->validate([
            'kode' => ['required', 'string', 'max:50', 'unique:komponen_biayas,kode,'.$komponenBiaya->id],
            'nama' => ['required', 'string', 'max:255'],
            'kategori' => ['required', 'in:akademik,kegiatan,pendaftaran,kelulusan'],
            'program_studi_id' => ['nullable', 'exists:program_studis,id'],
            'angkatan' => ['nullable', 'integer', 'min:2000', 'max:'.((int) date('Y') + 1)],
            'nominal' => ['required', 'numeric', 'min:0'],
            'is_active' => ['boolean'],
            'keterangan' => ['nullable', 'string'],
        ]);

        $oldValues = $komponenBiaya->toArray();
        $komponenBiaya->update($validated);

        ActivityLogger::log('keuangan.komponen_biaya.update', 'KomponenBiaya', $komponenBiaya->id, $oldValues, $validated);

        return back()->with('success', 'Komponen tarif biaya berhasil diperbarui.');
    }

    /**
     * Remove the specified fee component.
     */
    public function destroy(KomponenBiaya $komponenBiaya): RedirectResponse
    {
        $oldValues = $komponenBiaya->toArray();
        $id = $komponenBiaya->id;
        $komponenBiaya->delete();

        ActivityLogger::log('keuangan.komponen_biaya.delete', 'KomponenBiaya', $id, $oldValues, null);

        return back()->with('success', 'Komponen tarif biaya berhasil dihapus.');
    }
}
