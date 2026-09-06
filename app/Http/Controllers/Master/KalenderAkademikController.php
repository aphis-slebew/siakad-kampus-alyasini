<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\KalenderAkademik;
use App\Models\TahunAjaran;
use App\Services\ActivityLogger;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class KalenderAkademikController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $tahunAjaranId = $request->input('tahun_ajaran_id');
        $activeTahunAjaran = TahunAjaran::where('is_active', true)->first() ?? TahunAjaran::latest()->first();
        $selectedTahunAjaranId = $tahunAjaranId ? (int) $tahunAjaranId : ($activeTahunAjaran?->id ?? 0);

        $query = KalenderAkademik::with('tahunAjaran');

        if ($selectedTahunAjaranId > 0) {
            $query->where('tahun_ajaran_id', $selectedTahunAjaranId);
        }

        $kalenderAkademiks = $query->orderBy('mulai')->get();
        $tahunAjarans = TahunAjaran::orderByDesc('id')->get(['id', 'nama', 'is_active', 'mulai', 'selesai']);

        $availableTypes = [
            ['key' => KalenderAkademik::TIPE_PEMBAYARAN_UKT, 'label' => 'Pembayaran Biaya Kuliah & UKT', 'color' => 'amber'],
            ['key' => KalenderAkademik::TIPE_REGISTRASI_ULANG, 'label' => 'Her-Registrasi / Registrasi Ulang', 'color' => 'blue'],
            ['key' => KalenderAkademik::TIPE_KRS, 'label' => 'Pengisian & Perubahan KRS', 'color' => 'emerald'],
            ['key' => KalenderAkademik::TIPE_PERWALIAN_KRS, 'label' => 'Persetujuan KRS Dosen Wali', 'color' => 'indigo'],
            ['key' => KalenderAkademik::TIPE_PERKULIAHAN, 'label' => 'Masa Perkuliahan Efektif', 'color' => 'teal'],
            ['key' => KalenderAkademik::TIPE_UTS, 'label' => 'Ujian Tengah Semester (UTS)', 'color' => 'purple'],
            ['key' => KalenderAkademik::TIPE_UAS, 'label' => 'Ujian Akhir Semester (UAS)', 'color' => 'rose'],
            ['key' => KalenderAkademik::TIPE_INPUT_NILAI, 'label' => 'Penginputan Nilai oleh Dosen', 'color' => 'cyan'],
            ['key' => KalenderAkademik::TIPE_YUDISIUM, 'label' => 'Pendaftaran & Sidang Yudisium', 'color' => 'violet'],
            ['key' => KalenderAkademik::TIPE_KKN_PKL, 'label' => 'Pelaksanaan KKN / PKL Magang', 'color' => 'sky'],
            ['key' => KalenderAkademik::TIPE_LIBUR_SEMESTER, 'label' => 'Libur Semester / Masa Tenang', 'color' => 'slate'],
            ['key' => KalenderAkademik::TIPE_LAINNYA, 'label' => 'Agenda Lainnya / Umum', 'color' => 'slate'],
        ];

        $today = Carbon::today()->toDateString();
        $activeAgendasNow = $kalenderAkademiks->filter(function ($item) use ($today) {
            return $item->is_published && $item->mulai && $item->selesai && $today >= $item->mulai->toDateString() && $today <= $item->selesai->toDateString();
        })->values();

        return Inertia::render('master/kalender-akademik/index', [
            'kalenderAkademiks' => $kalenderAkademiks,
            'tahunAjarans' => $tahunAjarans,
            'selectedTahunAjaranId' => $selectedTahunAjaranId,
            'activeTahunAjaran' => $activeTahunAjaran,
            'availableTypes' => $availableTypes,
            'activeAgendasNow' => $activeAgendasNow,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'tahun_ajaran_id' => ['required', 'exists:tahun_ajarans,id'],
            'kegiatan' => ['required', 'string', 'max:255'],
            'tipe_kegiatan' => ['required', 'string', 'max:50'],
            'mulai' => ['required', 'date'],
            'selesai' => ['required', 'date', 'after_or_equal:mulai'],
            'deskripsi' => ['nullable', 'string', 'max:1000'],
            'is_published' => ['nullable', 'boolean'],
        ], [
            'tahun_ajaran_id.required' => 'Tahun ajaran wajib dipilih.',
            'tahun_ajaran_id.exists' => 'Tahun ajaran yang dipilih tidak valid.',
            'kegiatan.required' => 'Nama kegiatan kalender akademik wajib diisi.',
            'tipe_kegiatan.required' => 'Kategori kegiatan wajib dipilih.',
            'mulai.required' => 'Tanggal mulai wajib diisi.',
            'selesai.required' => 'Tanggal selesai wajib diisi.',
            'selesai.after_or_equal' => 'Tanggal selesai harus setelah atau sama dengan tanggal mulai.',
        ]);

        $validated['is_published'] = $request->boolean('is_published', true);

        $kalender = KalenderAkademik::create($validated);

        ActivityLogger::log('master.kalender_akademik.create', 'KalenderAkademik', $kalender->id, null, $validated);

        return back()->with('success', 'Agenda kalender akademik berhasil ditambahkan.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, KalenderAkademik $kalenderAkademik): RedirectResponse
    {
        $validated = $request->validate([
            'tahun_ajaran_id' => ['required', 'exists:tahun_ajarans,id'],
            'kegiatan' => ['required', 'string', 'max:255'],
            'tipe_kegiatan' => ['required', 'string', 'max:50'],
            'mulai' => ['required', 'date'],
            'selesai' => ['required', 'date', 'after_or_equal:mulai'],
            'deskripsi' => ['nullable', 'string', 'max:1000'],
            'is_published' => ['nullable', 'boolean'],
        ], [
            'tahun_ajaran_id.required' => 'Tahun ajaran wajib dipilih.',
            'tahun_ajaran_id.exists' => 'Tahun ajaran yang dipilih tidak valid.',
            'kegiatan.required' => 'Nama kegiatan kalender akademik wajib diisi.',
            'tipe_kegiatan.required' => 'Kategori kegiatan wajib dipilih.',
            'mulai.required' => 'Tanggal mulai wajib diisi.',
            'selesai.required' => 'Tanggal selesai wajib diisi.',
            'selesai.after_or_equal' => 'Tanggal selesai harus setelah atau sama dengan tanggal mulai.',
        ]);

        $validated['is_published'] = $request->boolean('is_published', true);

        $oldValues = $kalenderAkademik->only(['tahun_ajaran_id', 'kegiatan', 'tipe_kegiatan', 'mulai', 'selesai', 'deskripsi', 'is_published']);
        $kalenderAkademik->update($validated);

        ActivityLogger::log('master.kalender_akademik.update', 'KalenderAkademik', $kalenderAkademik->id, $oldValues, $validated);

        return back()->with('success', 'Agenda kalender akademik berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(KalenderAkademik $kalenderAkademik): RedirectResponse
    {
        $oldValues = $kalenderAkademik->only(['tahun_ajaran_id', 'kegiatan', 'tipe_kegiatan', 'mulai', 'selesai']);
        $id = $kalenderAkademik->id;

        $kalenderAkademik->delete();

        ActivityLogger::log('master.kalender_akademik.delete', 'KalenderAkademik', $id, $oldValues, null);

        return back()->with('success', 'Agenda kalender akademik berhasil dihapus.');
    }
}
