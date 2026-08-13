<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\Fakultas;
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

        return Inertia::render('master/fakultas/index', [
            'fakultas' => $fakultas,
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
        ], [
            'kode.required' => 'Kode fakultas wajib diisi.',
            'kode.unique' => 'Kode fakultas sudah digunakan.',
            'nama.required' => 'Nama fakultas wajib diisi.',
        ]);

        Fakultas::create($validated);

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
        ], [
            'kode.required' => 'Kode fakultas wajib diisi.',
            'kode.unique' => 'Kode fakultas sudah digunakan.',
            'nama.required' => 'Nama fakultas wajib diisi.',
        ]);

        $fakulta->update($validated);

        return back()->with('success', 'Fakultas berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Fakultas $fakulta): RedirectResponse
    {
        $fakulta->delete();

        return back()->with('success', 'Fakultas berhasil dihapus.');
    }
}
