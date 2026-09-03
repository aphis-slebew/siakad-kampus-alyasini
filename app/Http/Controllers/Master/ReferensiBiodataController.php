<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\Mahasiswa;
use App\Models\ReferensiBiodata;
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

        ReferensiBiodata::create($validated);

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

        $referensiBiodatum->update($validated);

        return back()->with('success', 'Referensi biodata berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ReferensiBiodata $referensiBiodatum): RedirectResponse
    {
        // Safety check if referenced in mahasiswa agama
        if (Mahasiswa::where('agama_referensi_biodata_id', $referensiBiodatum->id)->exists()) {
            return back()->withErrors(['error' => 'Referensi "'.$referensiBiodatum->nama.'" tidak dapat dihapus karena sedang digunakan dalam data profil mahasiswa.']);
        }

        $referensiBiodatum->delete();

        return back()->with('success', 'Referensi biodata berhasil dihapus.');
    }
}
