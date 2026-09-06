<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Http\Requests\FakultasRequest;
use App\Models\Fakultas;
use App\Models\RiwayatPimpinanFakultas;
use App\Services\FakultasService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class FakultasController extends Controller
{
    public function __construct(
        protected FakultasService $fakultasService
    ) {}

    /**
     * Display a listing of the resource with metrics.
     */
    public function index(): Response
    {
        $fakultas = $this->fakultasService->getFakultasList();
        $stats = $this->fakultasService->getStats();
        $dosens = $this->fakultasService->getAvailableDosens();
        $pegawais = $this->fakultasService->getAvailablePegawais();

        return Inertia::render('master/fakultas/index', [
            'fakultas' => $fakultas,
            'stats' => $stats,
            'dosens' => $dosens,
            'pegawais' => $pegawais,
        ]);
    }

    /**
     * Display the specified fakultas detail page.
     */
    public function show(Fakultas $fakulta): Response
    {
        $detail = $this->fakultasService->getFakultasDetail($fakulta);
        $analytics = $this->fakultasService->getFakultasAnalytics($detail);
        $allFakultas = Fakultas::orderBy('nama')->get(['id', 'kode', 'nama']);
        $dosens = $this->fakultasService->getAvailableDosens();
        $pegawais = $this->fakultasService->getAvailablePegawais();

        return Inertia::render('master/fakultas/show', [
            'fakultas' => $detail,
            'analytics' => $analytics,
            'allFakultas' => $allFakultas,
            'dosens' => $dosens,
            'pegawais' => $pegawais,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(FakultasRequest $request): RedirectResponse
    {
        $data = $request->validated();

        if ($request->hasFile('file_sk_pendirian')) {
            $data['file_sk_pendirian'] = $request->file('file_sk_pendirian');
        }
        if ($request->hasFile('file_sk_izin_operasional')) {
            $data['file_sk_izin_operasional'] = $request->file('file_sk_izin_operasional');
        }

        $this->fakultasService->createFakultas($data);

        return back()->with('success', 'Fakultas berhasil ditambahkan.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(FakultasRequest $request, Fakultas $fakulta): RedirectResponse
    {
        $data = $request->validated();

        if ($request->hasFile('file_sk_pendirian')) {
            $data['file_sk_pendirian'] = $request->file('file_sk_pendirian');
        }
        if ($request->hasFile('file_sk_izin_operasional')) {
            $data['file_sk_izin_operasional'] = $request->file('file_sk_izin_operasional');
        }

        $this->fakultasService->updateFakultas($fakulta, $data);

        return back()->with('success', 'Fakultas berhasil diperbarui.');
    }

    /**
     * Store a new leadership tenure record (Riwayat Pimpinan Dekanat).
     */
    public function storePimpinan(Request $request, Fakultas $fakulta): RedirectResponse
    {
        $validated = $request->validate([
            'dosen_id' => ['required', 'integer', 'exists:dosens,id'],
            'jabatan' => ['required', 'in:dekan,wakil_dekan_1,wakil_dekan_2,wakil_dekan_3,wakil_dekan_4,ketua_gpmf'],
            'periode_mulai' => ['required', 'date'],
            'periode_selesai' => ['nullable', 'date', 'after_or_equal:periode_mulai'],
            'no_sk_pelantikan' => ['nullable', 'string', 'max:100'],
            'file_sk_pelantikan' => ['nullable', 'file', 'mimes:pdf', 'max:5120'],
            'is_aktif' => ['nullable'],
        ], [
            'dosen_id.required' => 'Dosen pimpinan wajib dipilih.',
            'dosen_id.exists' => 'Data dosen tidak valid.',
            'jabatan.required' => 'Jabatan struktural dekanat wajib dipilih.',
            'periode_mulai.required' => 'Tanggal periode mulai wajib diisi.',
            'periode_selesai.after_or_equal' => 'Tanggal periode selesai harus setelah atau sama dengan tanggal mulai.',
            'file_sk_pelantikan.mimes' => 'Berkas SK Pelantikan harus berupa dokumen PDF.',
            'file_sk_pelantikan.max' => 'Ukuran berkas SK Pelantikan maksimal 5MB.',
        ]);

        if ($request->hasFile('file_sk_pelantikan')) {
            $validated['file_sk_pelantikan'] = $request->file('file_sk_pelantikan');
        }

        $this->fakultasService->addRiwayatPimpinan($fakulta, $validated);

        return back()->with('success', 'Riwayat masa jabatan pimpinan fakultas berhasil ditambahkan.');
    }

    /**
     * Delete a leadership tenure record.
     */
    public function destroyPimpinan(Fakultas $fakulta, RiwayatPimpinanFakultas $pimpinan): RedirectResponse
    {
        $this->fakultasService->deleteRiwayatPimpinan($pimpinan);

        return back()->with('success', 'Riwayat masa jabatan pimpinan fakultas berhasil dihapus.');
    }

    /**
     * Trigger sync status with PDDIKTI Neo Feeder.
     */
    public function syncFeeder(Fakultas $fakulta): RedirectResponse
    {
        $this->fakultasService->syncFeeder($fakulta);

        return back()->with('success', 'Data fakultas berhasil disinkronkan dengan PDDIKTI Feeder.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Fakultas $fakulta): RedirectResponse
    {
        try {
            $this->fakultasService->deleteFakultas($fakulta);

            return back()->with('success', 'Fakultas berhasil dihapus.');
        } catch (ValidationException $e) {
            $message = $e->validator->errors()->first('error')
                ?: 'Fakultas tidak dapat dihapus karena masih memiliki Program Studi aktif.';

            return back()->with('error', $message);
        }
    }
}
