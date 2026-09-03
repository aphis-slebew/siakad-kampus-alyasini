<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\Dosen;
use App\Models\Fakultas;
use App\Services\ActivityLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FakultasController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        $fakultas = Fakultas::withCount('programStudis')
            ->orderBy('kode')
            ->get();

        $dosens = Dosen::orderBy('nama_lengkap')->get(['id', 'nama_lengkap', 'nidn', 'gelar_depan', 'gelar_belakang']);

        return Inertia::render('master/fakultas/index', [
            'fakultas' => $fakultas,
            'dosens' => $dosens,
        ]);
    }

    /**
     * Display the specified fakultas detail page (matching reference UI Photo 1 & 2).
     */
    public function show(Fakultas $fakulta): Response
    {
        $fakulta->load(['programStudis']);
        $allFakultas = Fakultas::orderBy('nama')->get(['id', 'kode', 'nama']);
        $dosens = Dosen::orderBy('nama_lengkap')->get(['id', 'nama_lengkap', 'nidn', 'gelar_depan', 'gelar_belakang']);

        return Inertia::render('master/fakultas/show', [
            'fakultas' => $fakulta,
            'allFakultas' => $allFakultas,
            'dosens' => $dosens,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'kode' => ['required', 'string', 'max:20', 'unique:fakultas,kode'],
            'nama' => ['required', 'string', 'max:255'],
            'nama_en' => ['nullable', 'string', 'max:255'],
            'nama_singkat' => ['nullable', 'string', 'max:100'],
            'alamat' => ['nullable', 'string', 'max:500'],
            'telepon' => ['nullable', 'string', 'max:50'],
            'tahun_berdiri' => ['nullable', 'integer', 'min:1900', 'max:'.((int) date('Y'))],
            'periode_berdiri' => ['nullable', 'string', 'max:100'],
            'status' => ['nullable', 'in:aktif,nonaktif'],
            'luas_m2' => ['nullable', 'string', 'max:50'],
            'dekan_nama' => ['nullable', 'string', 'max:255'],
            'dekan_nidn' => ['nullable', 'string', 'max:50'],
            'wakil_dekan_1' => ['nullable', 'string', 'max:255'],
            'wakil_dekan_2' => ['nullable', 'string', 'max:255'],
            'wakil_dekan_3' => ['nullable', 'string', 'max:255'],
            'wakil_dekan_4' => ['nullable', 'string', 'max:255'],
            'visi' => ['nullable', 'string'],
            'misi' => ['nullable', 'string'],
        ], [
            'kode.required' => 'Kode fakultas wajib diisi.',
            'kode.unique' => 'Kode fakultas sudah digunakan.',
            'nama.required' => 'Nama fakultas wajib diisi.',
        ]);

        $validated['status'] = $validated['status'] ?? 'aktif';

        $fakultas = Fakultas::create($validated);

        ActivityLogger::log('master.fakultas.create', 'Fakultas', $fakultas->id, null, $validated);

        return back()->with('success', 'Fakultas berhasil ditambahkan.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Fakultas $fakulta): RedirectResponse
    {
        $validated = $request->validate([
            'kode' => ['required', 'string', 'max:20', 'unique:fakultas,kode,'.$fakulta->id],
            'nama' => ['required', 'string', 'max:255'],
            'nama_en' => ['nullable', 'string', 'max:255'],
            'nama_singkat' => ['nullable', 'string', 'max:100'],
            'alamat' => ['nullable', 'string', 'max:500'],
            'telepon' => ['nullable', 'string', 'max:50'],
            'tahun_berdiri' => ['nullable', 'integer', 'min:1900', 'max:'.((int) date('Y'))],
            'periode_berdiri' => ['nullable', 'string', 'max:100'],
            'status' => ['required', 'in:aktif,nonaktif'],
            'luas_m2' => ['nullable', 'string', 'max:50'],
            'dekan_nama' => ['nullable', 'string', 'max:255'],
            'dekan_nidn' => ['nullable', 'string', 'max:50'],
            'wakil_dekan_1' => ['nullable', 'string', 'max:255'],
            'wakil_dekan_2' => ['nullable', 'string', 'max:255'],
            'wakil_dekan_3' => ['nullable', 'string', 'max:255'],
            'wakil_dekan_4' => ['nullable', 'string', 'max:255'],
            'visi' => ['nullable', 'string'],
            'misi' => ['nullable', 'string'],
        ], [
            'kode.required' => 'Kode fakultas wajib diisi.',
            'kode.unique' => 'Kode fakultas sudah digunakan.',
            'nama.required' => 'Nama fakultas wajib diisi.',
        ]);

        $oldValues = $fakulta->toArray();
        $fakulta->update($validated);

        ActivityLogger::log('master.fakultas.update', 'Fakultas', $fakulta->id, $oldValues, $validated);

        return back()->with('success', 'Fakultas berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Fakultas $fakulta): RedirectResponse
    {
        if ($fakulta->programStudis()->exists()) {
            return back()->with('error', 'Fakultas tidak dapat dihapus karena masih memiliki Program Studi aktif.');
        }

        $oldValues = $fakulta->toArray();
        $id = $fakulta->id;
        $fakulta->delete();

        ActivityLogger::log('master.fakultas.delete', 'Fakultas', $id, $oldValues, null);

        return back()->with('success', 'Fakultas berhasil dihapus.');
    }
}
