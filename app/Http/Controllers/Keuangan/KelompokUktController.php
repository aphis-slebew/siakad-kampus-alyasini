<?php

namespace App\Http\Controllers\Keuangan;

use App\Http\Controllers\Controller;
use App\Models\KelompokUkt;
use App\Models\ProgramStudi;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class KelompokUktController extends Controller
{
    public function index(): Response
    {
        $kelompoks = KelompokUkt::with('programStudi')
            ->orderBy('program_studi_id')
            ->orderBy('id')
            ->get();

        $programStudis = ProgramStudi::orderBy('nama')->get();

        return Inertia::render('keuangan/kelompok-ukt/index', [
            'kelompoks' => $kelompoks,
            'programStudis' => $programStudis,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'program_studi_id' => ['required', 'exists:program_studis,id'],
            'nama' => ['required', 'string', 'max:255'],
            'nominal_per_semester' => ['required', 'numeric', 'min:0'],
        ], [
            'program_studi_id.required' => 'Program studi wajib dipilih.',
            'nama.required' => 'Nama kelompok UKT wajib diisi.',
            'nominal_per_semester.required' => 'Nominal UKT per semester wajib diisi.',
        ]);

        KelompokUkt::create($validated);

        return back()->with('success', 'Kelompok UKT berhasil ditambahkan.');
    }

    public function update(Request $request, KelompokUkt $kelompokUkt): RedirectResponse
    {
        $validated = $request->validate([
            'program_studi_id' => ['required', 'exists:program_studis,id'],
            'nama' => ['required', 'string', 'max:255'],
            'nominal_per_semester' => ['required', 'numeric', 'min:0'],
        ]);

        $kelompokUkt->update($validated);

        return back()->with('success', 'Kelompok UKT berhasil diperbarui.');
    }

    public function destroy(KelompokUkt $kelompokUkt): RedirectResponse
    {
        if ($kelompokUkt->mahasiswaUkts()->exists()) {
            return back()->with('error', 'Kelompok UKT tidak dapat dihapus karena sudah ditetapkan pada data mahasiswa.');
        }

        $kelompokUkt->delete();

        return back()->with('success', 'Kelompok UKT berhasil dihapus.');
    }
}
