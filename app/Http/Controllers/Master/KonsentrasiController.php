<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\Konsentrasi;
use App\Services\ActivityLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class KonsentrasiController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Konsentrasi::with('programStudi');

        if ($request->filled('program_studi_id')) {
            $query->where('program_studi_id', $request->input('program_studi_id'));
        }

        $konsentrasis = $query->orderBy('nama')->get();

        return response()->json([
            'status' => 'success',
            'data' => $konsentrasis,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'program_studi_id' => ['required', 'exists:program_studis,id'],
            'nama' => ['required', 'string', 'max:255'],
        ], [
            'program_studi_id.required' => 'Program studi wajib dipilih.',
            'program_studi_id.exists' => 'Program studi yang dipilih tidak valid.',
            'nama.required' => 'Nama konsentrasi wajib diisi.',
            'nama.max' => 'Nama konsentrasi maksimal 255 karakter.',
        ]);

        $konsentrasi = Konsentrasi::create($validated);

        ActivityLogger::log('master.konsentrasi.create', 'Konsentrasi', $konsentrasi->id, null, $validated);

        return back()->with('success', 'Konsentrasi program studi berhasil ditambahkan.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Konsentrasi $konsentrasi): RedirectResponse
    {
        $validated = $request->validate([
            'nama' => ['required', 'string', 'max:255'],
        ], [
            'nama.required' => 'Nama konsentrasi wajib diisi.',
            'nama.max' => 'Nama konsentrasi maksimal 255 karakter.',
        ]);

        $oldValues = $konsentrasi->only(['nama', 'program_studi_id']);
        $konsentrasi->update($validated);

        ActivityLogger::log('master.konsentrasi.update', 'Konsentrasi', $konsentrasi->id, $oldValues, $validated);

        return back()->with('success', 'Konsentrasi program studi berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Konsentrasi $konsentrasi): RedirectResponse
    {
        $oldValues = $konsentrasi->only(['nama', 'program_studi_id']);
        $id = $konsentrasi->id;

        $konsentrasi->delete();

        ActivityLogger::log('master.konsentrasi.delete', 'Konsentrasi', $id, $oldValues, null);

        return back()->with('success', 'Konsentrasi program studi berhasil dihapus.');
    }
}
