<?php

namespace App\Http\Controllers\Pmb;

use App\Http\Controllers\Controller;
use App\Models\BerkasPendaftaran;
use App\Models\CalonMahasiswa;
use App\Models\GelombangPendaftaran;
use App\Models\JalurPendaftaran;
use App\Models\Mahasiswa;
use App\Models\ProgramStudi;
use App\Models\User;
use App\Services\ActivityLogger;
use App\Services\PmbStateService;
use App\Services\SecureFileUploadService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class PmbPublicController extends Controller
{
    /**
     * Show public registration form for new prospective students.
     */
    public function index(): Response
    {
        $gelombangs = GelombangPendaftaran::where('is_active', true)->get();
        $jalurs = JalurPendaftaran::all();
        $programStudis = ProgramStudi::orderBy('nama')->get(['id', 'kode', 'nama', 'jenjang']);

        return Inertia::render('pmb/public/register', [
            'gelombangs' => $gelombangs,
            'jalurs' => $jalurs,
            'programStudis' => $programStudis,
        ]);
    }

    /**
     * Handle new prospective student registration & secure berkas uploads.
     */
    public function store(Request $request, PmbStateService $pmbStateService): RedirectResponse
    {
        $validated = $request->validate([
            'gelombang_pendaftaran_id' => ['required', 'exists:gelombang_pendaftarans,id'],
            'jalur_pendaftaran_id' => ['required', 'exists:jalur_pendaftarans,id'],
            'program_studi_pilihan_1_id' => ['required', 'exists:program_studis,id'],
            'program_studi_pilihan_2_id' => ['nullable', 'exists:program_studis,id', 'different:program_studi_pilihan_1_id'],
            'nama_lengkap' => ['required', 'string', 'max:255'],
            'nik' => ['required', 'string', 'max:16'],
            'tempat_lahir' => ['required', 'string', 'max:100'],
            'tanggal_lahir' => ['required', 'date'],
            'jenis_kelamin' => ['required', 'in:L,P'],
            'alamat' => ['required', 'string'],
            'no_hp' => ['required', 'string', 'max:20'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'asal_sekolah' => ['required', 'string', 'max:255'],
            'tahun_lulus_sekolah' => ['required', 'integer', 'min:2000', 'max:'.((int) date('Y'))],
            'password' => ['nullable', 'string', 'min:6', 'confirmed'],

            // Security Whitelist & MIME Validation (04-Security.md §3)
            'berkas_ijazah' => ['nullable', 'file', 'mimetypes:application/pdf,image/jpeg,image/png', 'max:2048'],
            'berkas_kk' => ['nullable', 'file', 'mimetypes:application/pdf,image/jpeg,image/png', 'max:2048'],
            'berkas_ktp' => ['nullable', 'file', 'mimetypes:application/pdf,image/jpeg,image/png', 'max:2048'],
            'berkas_foto' => ['nullable', 'file', 'mimetypes:image/jpeg,image/png', 'max:1024'],
        ], [
            'nama_lengkap.required' => 'Nama lengkap wajib diisi.',
            'nik.required' => 'NIK wajib diisi.',
            'email.unique' => 'Email sudah terdaftar.',
            'password.confirmed' => 'Konfirmasi kata sandi tidak cocok.',
            'berkas_ijazah.mimetypes' => 'Berkas ijazah harus berformat PDF, JPG, atau PNG.',
            'berkas_ijazah.max' => 'Ukuran file berkas ijazah maksimal 2MB.',
            'berkas_foto.mimetypes' => 'Foto harus berformat JPG atau PNG.',
            'berkas_foto.max' => 'Ukuran pasfoto maksimal 1MB.',
        ]);

        // Auto-generate password from tanggal lahir if blank (format: ddmmyyyy)
        $rawPassword = ! empty($validated['password'])
            ? $validated['password']
            : date('dmY', strtotime($validated['tanggal_lahir']));

        // Point 2: Blind Index NIK Duplication Check (Indexed DB Query)
        $nikHash = CalonMahasiswa::generateBlindIndex($validated['nik']);

        $existsInCalon = CalonMahasiswa::where('nik_hash', $nikHash)->exists();
        $existsInMahasiswa = Mahasiswa::where('nik_hash', $nikHash)->exists();

        if ($existsInCalon || $existsInMahasiswa) {
            return back()->withErrors(['nik' => 'NIK ini telah terdaftar dalam sistem (sebagai calon mahasiswa atau mahasiswa aktif). Satu NIK hanya boleh mendaftar 1 kali.'])->withInput();
        }

        $calon = DB::transaction(function () use ($request, $validated, $rawPassword, $pmbStateService) {
            // 1. Buat User baru dengan role calon_mahasiswa
            $user = User::create([
                'name' => $validated['nama_lengkap'],
                'email' => $validated['email'],
                'password' => Hash::make($rawPassword),
                'user_type' => 'calon_mahasiswa',
                'status' => 'aktif',
            ]);
            $user->assignRole('calon_mahasiswa');

            // 2. Buat data CalonMahasiswa awal (status: draft)
            $calon = CalonMahasiswa::create([
                'user_id' => $user->id,
                'gelombang_pendaftaran_id' => $validated['gelombang_pendaftaran_id'],
                'jalur_pendaftaran_id' => $validated['jalur_pendaftaran_id'],
                'program_studi_pilihan_1_id' => $validated['program_studi_pilihan_1_id'],
                'program_studi_pilihan_2_id' => $validated['program_studi_pilihan_2_id'] ?? null,
                'nama_lengkap' => $validated['nama_lengkap'],
                'nik' => $validated['nik'],
                'tempat_lahir' => $validated['tempat_lahir'],
                'tanggal_lahir' => $validated['tanggal_lahir'],
                'jenis_kelamin' => $validated['jenis_kelamin'],
                'alamat' => $validated['alamat'],
                'no_hp' => $validated['no_hp'],
                'email' => $validated['email'],
                'asal_sekolah' => $validated['asal_sekolah'],
                'tahun_lulus_sekolah' => $validated['tahun_lulus_sekolah'],
                'status_pendaftaran' => 'draft',
            ]);

            // 3. Simpan Upload Berkas secara Aman (04-Security.md §3)
            // Disimpan di folder terpisah non-publik (private/berkas_pmb) dengan nama acak hashName()
            $fileFields = [
                'berkas_ijazah' => 'ijazah_skl',
                'berkas_kk' => 'kk',
                'berkas_ktp' => 'ktp_akta',
                'berkas_foto' => 'foto',
            ];

            foreach ($fileFields as $field => $jenisBerkas) {
                if ($request->hasFile($field) && $request->file($field)->isValid()) {
                    $file = $request->file($field);
                    $isFoto = ($field === 'berkas_foto');
                    $maxKb = $isFoto ? 1024 : 2048;

                    try {
                        $path = SecureFileUploadService::uploadPrivate(
                            $file,
                            'private/berkas_pmb',
                            $maxKb,
                            $isFoto
                        );
                    } catch (\InvalidArgumentException $e) {
                        throw ValidationException::withMessages([
                            $field => [$e->getMessage()],
                        ]);
                    }

                    BerkasPendaftaran::create([
                        'calon_mahasiswa_id' => $calon->id,
                        'jenis_berkas' => $jenisBerkas,
                        'file_path' => $path,
                        'status_verifikasi' => 'diajukan',
                    ]);
                }
            }

            // 4. Transisi resmi status pendaftaran dari draft -> diajukan
            $pmbStateService->transition($calon, 'diajukan');

            ActivityLogger::log('pmb.register_public', 'CalonMahasiswa', $calon->id, null, [
                'nama_lengkap' => $calon->nama_lengkap,
                'email' => $calon->email,
            ]);

            Auth::login($user);

            return $calon;
        });

        return redirect()->route('dashboard')->with('success', 'Pendaftaran PMB & upload berkas berhasil diajukan.');
    }
}
