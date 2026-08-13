<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\Fakultas;
use App\Models\ProgramStudi;
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
            ->withCount('konsentrasis')
            ->orderBy('kode')
            ->get();

        $fakultas = Fakultas::orderBy('kode')->get(['id', 'kode', 'nama']);

        return Inertia::render('master/program-studi/index', [
            'programStudis' => $programStudis,
            'fakultas' => $fakultas,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'fakultas_id' => ['required', 'exists:fakultas,id'],
            'kode' => ['required', 'string', 'max:20', 'unique:program_studis,kode'],
            'nama' => ['required', 'string', 'max:255'],
            'jenjang' => ['required', 'string', 'max:20'],
        ], [
            'fakultas_id.required' => 'Fakultas wajib dipilih.',
            'kode.required' => 'Kode program studi wajib diisi.',
            'kode.unique' => 'Kode program studi sudah digunakan.',
            'nama.required' => 'Nama program studi wajib diisi.',
            'jenjang.required' => 'Jenjang wajib diisi.',
        ]);

        ProgramStudi::create($validated);

        return back()->with('success', 'Program studi berhasil ditambahkan.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, ProgramStudi $programStudi): RedirectResponse
    {
        $validated = $request->validate([
            'fakultas_id' => ['required', 'exists:fakultas,id'],
            'kode' => ['required', 'string', 'max:20', 'unique:program_studis,kode,'.$programStudi->id],
            'nama' => ['required', 'string', 'max:255'],
            'jenjang' => ['required', 'string', 'max:20'],
        ], [
            'fakultas_id.required' => 'Fakultas wajib dipilih.',
            'kode.required' => 'Kode program studi wajib diisi.',
            'kode.unique' => 'Kode program studi sudah digunakan.',
            'nama.required' => 'Nama program studi wajib diisi.',
            'jenjang.required' => 'Jenjang wajib diisi.',
        ]);

        $programStudi->update($validated);

        return back()->with('success', 'Program studi berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ProgramStudi $programStudi): RedirectResponse
    {
        $programStudi->delete();

        return back()->with('success', 'Program studi berhasil dihapus.');
    }
}
