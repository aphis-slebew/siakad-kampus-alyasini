<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Http\Requests\PerguruanTinggiRequest;
use App\Models\Dosen;
use App\Models\PerguruanTinggi;
use App\Services\PerguruanTinggiService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class PerguruanTinggiController extends Controller
{
    public function __construct(
        protected PerguruanTinggiService $ptService
    ) {}

    /**
     * Display the institution profile, accreditation details, and branding.
     */
    public function index(): Response
    {
        $pt = $this->ptService->getInstitution();

        $dosens = Dosen::with('programStudi:id,nama')
            ->orderBy('nama_lengkap')
            ->get(['id', 'program_studi_id', 'nama_lengkap', 'nidn', 'gelar_depan', 'gelar_belakang', 'niy_nip', 'status_kepegawaian', 'foto_path'])
            ->map(fn (Dosen $d) => [
                'id' => $d->id,
                'nama_lengkap' => $d->nama_lengkap,
                'gelar_depan' => $d->gelar_depan,
                'gelar_belakang' => $d->gelar_belakang,
                'nama_bergelar' => $d->nama_bergelar,
                'nidn' => $d->nidn,
                'niy_nip' => $d->niy_nip,
                'status_kepegawaian' => $d->status_kepegawaian,
                'foto_url' => $d->foto_path ? Storage::disk('public')->url($d->foto_path) : null,
                'program_studi' => $d->programStudi ? [
                    'id' => $d->programStudi->id,
                    'nama' => $d->programStudi->nama,
                ] : null,
            ]);

        return Inertia::render('master/perguruan-tinggi/index', [
            'perguruanTinggi' => $pt,
            'dosens' => $dosens,
            'jenisPtOptions' => PerguruanTinggi::JENIS_PT,
            'statusMilikOptions' => PerguruanTinggi::STATUS_MILIK,
            'lembagaOptions' => PerguruanTinggi::LEMBAGA_AKREDITASI,
            'peringkatOptions' => PerguruanTinggi::PERINGKAT_AKREDITASI,
        ]);
    }

    /**
     * Update the institution profile, officials, accreditation, branding assets, and coordinates.
     */
    public function update(PerguruanTinggiRequest $request): RedirectResponse
    {
        $this->ptService->update($request->validated());

        return back()->with('success', 'Data Perguruan Tinggi & Branding berhasil diperbarui.');
    }
}
