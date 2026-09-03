<?php

use App\Http\Controllers\Akademik\DataMahasiswaController;
use App\Http\Controllers\Akademik\DokumenAkademikController;
use App\Http\Controllers\Akademik\DosenWaliController;
use App\Http\Controllers\Akademik\KelasKuliahController;
use App\Http\Controllers\Akademik\KhsController;
use App\Http\Controllers\Akademik\KrsController;
use App\Http\Controllers\Akademik\KurikulumProdiController;
use App\Http\Controllers\Akademik\MatakuliahController;
use App\Http\Controllers\Akademik\PenilaianController;
use App\Http\Controllers\Akademik\PresensiController;
use App\Http\Controllers\Akademik\SettingProdiController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Kemahasiswaan\KemahasiswaanController;
use App\Http\Controllers\Kepegawaian\DosenManagementController;
use App\Http\Controllers\Kepegawaian\PegawaiManagementController;
use App\Http\Controllers\Kepegawaian\UnitKerjaController;
use App\Http\Controllers\Keuangan\KasirController;
use App\Http\Controllers\Keuangan\KelompokUktController;
use App\Http\Controllers\Keuangan\KeuanganController;
use App\Http\Controllers\Keuangan\KomponenBiayaController;
use App\Http\Controllers\Keuangan\PeriodeRegistrasiController;
use App\Http\Controllers\Keuangan\RegistrasiUlangController;
use App\Http\Controllers\Laporan\LaporanController;
use App\Http\Controllers\Mahasiswa\MahasiswaPortalController;
use App\Http\Controllers\Master\FakultasController;
use App\Http\Controllers\Master\PerguruanTinggiController;
use App\Http\Controllers\Master\ProgramStudiController;
use App\Http\Controllers\Master\ReferensiBiodataController;
use App\Http\Controllers\Master\RuangKuliahController;
use App\Http\Controllers\Master\TahunAjaranController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\Pddikti\PddiktiSyncController;
use App\Http\Controllers\Pmb\CalonMahasiswaController;
use App\Http\Controllers\Pmb\GelombangPendaftaranController;
use App\Http\Controllers\Pmb\JalurPendaftaranController;
use App\Http\Controllers\Pmb\PmbPublicController;
use App\Http\Controllers\Settings\SystemConfigController;
use App\Http\Controllers\Skripsi\ProposalSkripsiController;
use App\Http\Controllers\Skripsi\SkripsiController;
use App\Http\Controllers\Superadmin\MonitoringController;
use App\Http\Controllers\Superadmin\UserManagementController;
use App\Http\Controllers\Yudisium\YudisiumController;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

if (app()->environment('local', 'testing')) {
    Route::get('dev-auth/{role?}', function (string $role = 'admin') {
        $emailMap = [
            'admin' => 'admin@alyasini.ac.id',
            'superadmin' => 'admin@alyasini.ac.id',
            'akademik' => 'akademik@alyasini.ac.id',
            'baa' => 'akademik@alyasini.ac.id',
            'pmb' => 'pmb@alyasini.ac.id',
            'keuangan' => 'keuangan@alyasini.ac.id',
            'kaprodi' => 'kaprodi@alyasini.ac.id',
            'dosen' => 'dosen@alyasini.ac.id',
            'kepegawaian' => 'kepegawaian@alyasini.ac.id',
            'mahasiswa' => 'mahasiswa@alyasini.ac.id',
            'calon' => 'calon@alyasini.ac.id',
            'calon_mahasiswa' => 'calon@alyasini.ac.id',
            'kemahasiswaan' => 'kemahasiswaan@alyasini.ac.id',
        ];

        $targetEmail = $emailMap[$role] ?? null;

        $user = null;
        if ($targetEmail) {
            $user = User::where('email', $targetEmail)->first();
        }

        if (! $user) {
            $user = User::where('user_type', $role)->first()
                ?? User::whereHas('roles', fn ($q) => $q->where('name', $role))->first()
                ?? User::where('user_type', 'superadmin')->first()
                ?? User::first();
        }

        if ($user) {
            Auth::login($user);
        }

        return redirect('/dashboard');
    });
}

// Public PMB Registration

Route::get('pmb/daftar', [PmbPublicController::class, 'index'])->name('pmb.register');
Route::post('pmb/daftar', [PmbPublicController::class, 'store'])->name('pmb.register.store');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');

    // Smart Fallbacks & Redirects for common/legacy URLs
    Route::get('akademik/krs', function () {
        $user = auth()->user();
        if ($user->hasRole('mahasiswa') || $user->user_type === 'mahasiswa') {
            return redirect()->route('krs.student');
        }
        if ($user->hasRole('dosen') || $user->user_type === 'dosen') {
            return redirect()->route('perwalian.krs.index');
        }

        return redirect()->route('laporan.krs.index');
    })->name('akademik.krs.fallback');

    Route::get('akademik/nilai', function () {
        $user = auth()->user();
        if ($user->hasRole('mahasiswa') || $user->user_type === 'mahasiswa') {
            return redirect()->route('khs.student');
        }

        return redirect()->route('akademik.penilaian.index');
    })->name('akademik.nilai.fallback');

    Route::get('skripsi', function () {
        $user = auth()->user();
        if ($user->hasRole('mahasiswa') || $user->user_type === 'mahasiswa') {
            return redirect()->route('skripsi.proposal.index');
        }

        return redirect()->route('skripsi.index');
    })->name('skripsi.fallback');

    Route::get('settings/system', function () {
        return redirect()->route('settings.system-configs.index');
    })->name('settings.system.fallback');

    Route::get('pmb/verifikasi', function () {
        return redirect()->route('pmb.calon-mahasiswa.index');
    })->name('pmb.verifikasi.fallback');

    // URL Aliases & Compatibility Endpoints (snake_case & kebab-case supported)
    Route::get('akademik/kelas_kuliah', [KelasKuliahController::class, 'index']);
    Route::get('laporan/rekap_nilai', [LaporanController::class, 'rekapNilai']);
    Route::get('laporan/piutang_ukt', [LaporanController::class, 'piutangUkt']);
    Route::get('master/program_studi', fn () => redirect()->route('master.program-studi.index'));
    Route::get('master/tahun_ajaran', fn () => redirect()->route('master.tahun-ajaran.index'));
    Route::get('master/ruang_kuliah', fn () => redirect()->route('master.ruang-kuliah.index'));
    Route::get('master/referensi_biodata', fn () => redirect()->route('master.referensi-biodata.index'));
    Route::get('keuangan/kelompok_ukt', fn () => redirect()->route('keuangan.kelompok-ukt.index'));
    Route::get('keuangan/periode_registrasi', fn () => redirect()->route('keuangan.periode-registrasi.index'));
    Route::get('keuangan/registrasi_ulang', fn () => redirect()->route('keuangan.registrasi-ulang.index'));
    Route::get('kepegawaian/unit_kerja', fn () => redirect()->route('kepegawaian.unit-kerja.index'));

    // Master Data & Referensi Akademik (Otorisasi: master_data.manage)
    Route::middleware(['can:master_data.manage'])->prefix('master')->name('master.')->group(function () {
        Route::get('perguruan-tinggi', [PerguruanTinggiController::class, 'index'])->name('perguruan-tinggi.index');
        Route::post('perguruan-tinggi', [PerguruanTinggiController::class, 'update'])->name('perguruan-tinggi.update');

        Route::resource('fakultas', FakultasController::class)->except(['create', 'edit']);
        Route::resource('program-studi', ProgramStudiController::class)->except(['create', 'edit']);
        Route::resource('tahun-ajaran', TahunAjaranController::class)->except(['create', 'edit', 'show']);
        Route::resource('ruang-kuliah', RuangKuliahController::class)->except(['create', 'edit', 'show']);
        Route::resource('referensi-biodata', ReferensiBiodataController::class)->except(['create', 'edit', 'show']);
    });

    // PMB Management (Otorisasi: pmb.manage)
    Route::middleware(['can:pmb.manage'])->prefix('pmb')->name('pmb.')->group(function () {
        Route::resource('gelombang', GelombangPendaftaranController::class)->except(['create', 'edit', 'show']);
        Route::resource('jalur', JalurPendaftaranController::class)->except(['create', 'edit', 'show']);

        Route::get('calon-mahasiswa', [CalonMahasiswaController::class, 'index'])->name('calon-mahasiswa.index');
        Route::get('calon-mahasiswa/{calonMahasiswa}', [CalonMahasiswaController::class, 'show'])->name('calon-mahasiswa.show');
        Route::patch('calon-mahasiswa/{calonMahasiswa}/status', [CalonMahasiswaController::class, 'updateStatus'])->name('calon-mahasiswa.update-status');
        Route::patch('berkas/{berkas}/verify', [CalonMahasiswaController::class, 'verifyBerkas'])->name('berkas.verify');
        Route::get('berkas/{berkas}/download', [CalonMahasiswaController::class, 'downloadBerkas'])->name('berkas.download');
        Route::post('calon-mahasiswa/{calonMahasiswa}/hasil-seleksi', [CalonMahasiswaController::class, 'inputHasilSeleksi'])->name('calon-mahasiswa.hasil-seleksi');
        Route::post('calon-mahasiswa/{calonMahasiswa}/konversi', [CalonMahasiswaController::class, 'konversi'])->name('calon-mahasiswa.konversi');
    });

    // Registrasi Ulang & Keuangan Staff Management (Otorisasi: keuangan.manage / registrasi.manage)
    Route::middleware(['can:keuangan.manage'])->prefix('keuangan')->name('keuangan.')->group(function () {
        Route::resource('periode-registrasi', PeriodeRegistrasiController::class)->except(['create', 'edit', 'show']);
        Route::resource('kelompok-ukt', KelompokUktController::class)->except(['create', 'edit', 'show']);
        Route::resource('komponen-biaya', KomponenBiayaController::class)->except(['create', 'edit', 'show']);

        // Cashier POS & Multi-fee Generator
        Route::get('kasir', [KasirController::class, 'index'])->name('kasir.index');
        Route::post('kasir/bayar', [KasirController::class, 'storePayment'])->name('kasir.bayar');
        Route::post('kasir/generate-massal', [KasirController::class, 'generateMassal'])->name('kasir.generate-massal');

        Route::get('pembayaran', [KeuanganController::class, 'index'])->name('pembayaran.index');
        Route::patch('pembayaran/{pembayaran}/verify', [KeuanganController::class, 'verifyPayment'])->name('pembayaran.verify');
        Route::post('generate-ukt-batch', [KeuanganController::class, 'generateUktBatch'])->name('generate-ukt-batch');

        Route::get('registrasi-ulang', [RegistrasiUlangController::class, 'index'])->name('registrasi-ulang.index');
        Route::patch('dokumen-registrasi/{dokumen}/verify', [RegistrasiUlangController::class, 'verifyDokumen'])->name('dokumen-registrasi.verify');
    });

    // Modul Akademik: Kurikulum, Matakuliah, & Kelas Kuliah (Otorisasi: akademik.manage_kurikulum / akademik.manage_kelas / kaprodi view-only)
    Route::prefix('akademik')->name('akademik.')->group(function () {
        // Read-only routes for Admin, Kaprodi, & Dosen
        Route::middleware(['role:superadmin|admin_akademik|kaprodi|dosen'])->group(function () {
            Route::get('matakuliah', [MatakuliahController::class, 'index'])->name('matakuliah.index');
            Route::get('kurikulum', [KurikulumProdiController::class, 'index'])->name('kurikulum.index');
            Route::get('kelas-kuliah', [KelasKuliahController::class, 'index'])->name('kelas-kuliah.index');
        });

        // Write routes restricted to admin_akademik & superadmin
        Route::middleware(['can:akademik.manage_kurikulum'])->group(function () {
            Route::post('matakuliah', [MatakuliahController::class, 'store'])->name('matakuliah.store');
            Route::put('matakuliah/{matakuliah}', [MatakuliahController::class, 'update'])->name('matakuliah.update');
            Route::delete('matakuliah/{matakuliah}', [MatakuliahController::class, 'destroy'])->name('matakuliah.destroy');

            Route::post('kurikulum', [KurikulumProdiController::class, 'store'])->name('kurikulum.store');
            Route::put('kurikulum/{kurikulum}', [KurikulumProdiController::class, 'update'])->name('kurikulum.update');
            Route::delete('kurikulum/{kurikulum}', [KurikulumProdiController::class, 'destroy'])->name('kurikulum.destroy');

            Route::post('kurikulum/{kurikulum}/matakuliah', [KurikulumProdiController::class, 'addMatakuliah'])->name('kurikulum.add-matakuliah');
            Route::delete('kurikulum-matakuliah/{kurikulumMatakuliah}', [KurikulumProdiController::class, 'removeMatakuliah'])->name('kurikulum.remove-matakuliah');

            Route::post('prasyarat', [KurikulumProdiController::class, 'addPrasyarat'])->name('prasyarat.store');
            Route::post('ekivalensi', [KurikulumProdiController::class, 'addEkivalensi'])->name('ekivalensi.store');
        });

        Route::middleware(['can:akademik.manage_kelas'])->group(function () {
            Route::post('kelas-kuliah', [KelasKuliahController::class, 'store'])->name('kelas-kuliah.store');
            Route::put('kelas-kuliah/{kela}', [KelasKuliahController::class, 'update'])->name('kelas-kuliah.update');
            Route::delete('kelas-kuliah/{kela}', [KelasKuliahController::class, 'destroy'])->name('kelas-kuliah.destroy');
        });

        // Dosen Wali Management
        Route::middleware(['role:superadmin|admin_akademik'])->prefix('dosen-wali')->name('dosen-wali.')->group(function () {
            Route::get('/', [DosenWaliController::class, 'index'])->name('index');
            Route::post('/', [DosenWaliController::class, 'store'])->name('store');
            Route::post('/rollover', [DosenWaliController::class, 'rollover'])->name('rollover');
            Route::delete('/{dosenWali}', [DosenWaliController::class, 'destroy'])->name('destroy');
        });

        // Setting Prodi & Periode Perkuliahan (Matching Reference UI)
        Route::middleware(['role:superadmin|admin_akademik'])->prefix('setting-prodi')->name('setting-prodi.')->group(function () {
            Route::get('/', [SettingProdiController::class, 'index'])->name('index');
            Route::get('/{settingProdi}', [SettingProdiController::class, 'show'])->name('show');
            Route::put('/{settingProdi}', [SettingProdiController::class, 'update'])->name('update');
            Route::post('/copy', [SettingProdiController::class, 'copyFromSemester'])->name('copy');
        });
    });

    // Student Portal: Profil, Jadwal, Presensi Diri, Registrasi Ulang, Keuangan, & KRS
    Route::get('registrasi-ulang/saya', [RegistrasiUlangController::class, 'showStudentIndex'])->name('registrasi-ulang.student');
    Route::post('registrasi-ulang/saya', [RegistrasiUlangController::class, 'submitRegistration'])->name('registrasi-ulang.student.submit');

    Route::get('keuangan/bayar', [KeuanganController::class, 'showStudentPayment'])->name('keuangan.bayar');
    Route::post('keuangan/bayar', [KeuanganController::class, 'submitPayment'])->name('keuangan.bayar.submit');
    Route::post('keuangan/tagihan/{tagihan}/cicilan', [KeuanganController::class, 'requestCicilan'])->name('keuangan.cicilan.request');
    Route::get('keuangan/pembayaran/{pembayaran}/bukti', [KeuanganController::class, 'downloadBukti'])->name('keuangan.pembayaran.bukti');

    Route::get('krs/saya', [KrsController::class, 'studentIndex'])->name('krs.student');
    Route::post('krs/saya/submit', [KrsController::class, 'submitStudentKrs'])->name('krs.student.submit');

    Route::middleware(['role:mahasiswa|superadmin|admin_akademik'])->prefix('mahasiswa')->name('mahasiswa.')->group(function () {
        Route::get('profil', [MahasiswaPortalController::class, 'profil'])->name('profil');
        Route::get('jadwal', [MahasiswaPortalController::class, 'jadwal'])->name('jadwal');
        Route::get('presensi', [MahasiswaPortalController::class, 'presensi'])->name('presensi');
        Route::get('riwayat-pembayaran', [MahasiswaPortalController::class, 'riwayatPembayaran'])->name('riwayat-pembayaran');

        Route::get('profil/saya', fn () => redirect()->route('mahasiswa.profil'));
        Route::get('jadwal/saya', fn () => redirect()->route('mahasiswa.jadwal'));
        Route::get('presensi/saya', fn () => redirect()->route('mahasiswa.presensi'));
    });

    // Data Mahasiswa (Admin / BAA View)
    Route::middleware(['role:superadmin|admin_akademik'])->prefix('mahasiswa')->name('mahasiswa.')->group(function () {
        Route::get('/', [DataMahasiswaController::class, 'index'])->name('index');
        Route::get('/{mahasiswa}', [DataMahasiswaController::class, 'show'])->whereNumber('mahasiswa')->name('show');
    });

    // Dosen Wali Portal: Perwalian & Approval KRS
    Route::get('perwalian/krs', [KrsController::class, 'dosenIndex'])->name('perwalian.krs.index');
    Route::post('perwalian/krs/{krs}/approve', [KrsController::class, 'approveKrs'])->name('perwalian.krs.approve');
    Route::post('perwalian/krs/{krs}/reject', [KrsController::class, 'rejectKrs'])->name('perwalian.krs.reject');

    // Modul 7: Presensi, Penilaian Perkuliahan, & KHS
    Route::middleware(['role:superadmin|admin_akademik|kaprodi|dosen'])->group(function () {
        Route::get('akademik/presensi', [PresensiController::class, 'index'])->name('akademik.presensi.index');
        Route::post('akademik/presensi', [PresensiController::class, 'store'])->name('akademik.presensi.store');

        Route::get('akademik/penilaian', [PenilaianController::class, 'index'])->name('akademik.penilaian.index');
        Route::post('akademik/penilaian/komposisi', [PenilaianController::class, 'saveKomposisi'])->name('akademik.penilaian.komposisi');
        Route::post('akademik/penilaian/input', [PenilaianController::class, 'inputNilai'])->name('akademik.penilaian.input');
        Route::post('akademik/penilaian/finalize', [PenilaianController::class, 'finalize'])->name('akademik.penilaian.finalize');
        Route::post('akademik/penilaian/whitewash', [PenilaianController::class, 'whitewash'])->name('akademik.penilaian.whitewash');
    });

    Route::get('khs/saya', [KhsController::class, 'studentKhs'])->name('khs.student');
    Route::get('khs/mahasiswa/{mahasiswa}', [KhsController::class, 'showMahasiswaKhs'])->name('khs.show');

    // Modul 8: Skripsi, Proposal, Yudisium, & Kemahasiswaan
    // Proposal Skripsi & Skripsi Bimbingan Portal
    Route::get('skripsi/proposal', [ProposalSkripsiController::class, 'index'])->name('skripsi.proposal.index');
    Route::post('skripsi/proposal', [ProposalSkripsiController::class, 'store'])->name('skripsi.proposal.store');
    Route::post('skripsi/proposal/{proposal}/bimbingan', [ProposalSkripsiController::class, 'storeBimbingan'])->name('skripsi.proposal.bimbingan.store');

    Route::middleware(['role:superadmin|admin_akademik|kaprodi|dosen'])->group(function () {
        Route::post('skripsi/proposal/{proposal}/approve', [ProposalSkripsiController::class, 'approve'])->name('skripsi.proposal.approve');
        Route::post('skripsi/bimbingan-proposal/{bimbingan}/validate', [ProposalSkripsiController::class, 'validateBimbingan'])->name('skripsi.proposal.bimbingan.validate');
        Route::post('skripsi/proposal/{proposal}/schedule', [ProposalSkripsiController::class, 'scheduleUjian'])->name('skripsi.proposal.schedule');
        Route::post('skripsi/proposal/{proposal}/pass', [ProposalSkripsiController::class, 'passUjian'])->name('skripsi.proposal.pass');

        Route::post('skripsi/bimbingan/{bimbingan}/validate', [SkripsiController::class, 'validateBimbingan'])->name('skripsi.bimbingan.validate');
        Route::post('skripsi/{skripsi}/schedule', [SkripsiController::class, 'scheduleUjian'])->name('skripsi.schedule');
        Route::post('skripsi/{skripsi}/pass', [SkripsiController::class, 'passUjian'])->name('skripsi.pass');
    });

    Route::get('skripsi/bimbingan', [SkripsiController::class, 'index'])->name('skripsi.index');
    Route::post('skripsi/{skripsi}/bimbingan', [SkripsiController::class, 'storeBimbingan'])->name('skripsi.bimbingan.store');

    // Yudisium Portal
    Route::get('yudisium', [YudisiumController::class, 'index'])->name('yudisium.index');
    Route::get('yudisium/sertifikat/{yudisium}', [YudisiumController::class, 'sertifikat'])->name('yudisium.sertifikat');

    Route::middleware(['role:superadmin|admin_akademik'])->group(function () {
        Route::post('yudisium', [YudisiumController::class, 'store'])->name('yudisium.store');
        Route::post('yudisium/periode-wisuda', [YudisiumController::class, 'storePeriodeWisuda'])->name('yudisium.periode.store');
    });

    // Kemahasiswaan Portal
    Route::get('kemahasiswaan/aktivitas', [KemahasiswaanController::class, 'aktivitasIndex'])->name('kemahasiswaan.aktivitas.index');
    Route::post('kemahasiswaan/aktivitas', [KemahasiswaanController::class, 'aktivitasStore'])->name('kemahasiswaan.aktivitas.store');

    Route::get('kemahasiswaan/pelanggaran', [KemahasiswaanController::class, 'pelanggaranIndex'])->name('kemahasiswaan.pelanggaran.index');

    Route::get('kemahasiswaan/beasiswa', [KemahasiswaanController::class, 'beasiswaIndex'])->name('kemahasiswaan.beasiswa.index');
    Route::post('kemahasiswaan/beasiswa', [KemahasiswaanController::class, 'beasiswaStore'])->name('kemahasiswaan.beasiswa.store');

    Route::middleware(['role:superadmin|admin_akademik'])->group(function () {
        Route::post('kemahasiswaan/aktivitas/{aktivitas}/validate', [KemahasiswaanController::class, 'aktivitasValidate'])->name('kemahasiswaan.aktivitas.validate');
        Route::post('kemahasiswaan/pelanggaran', [KemahasiswaanController::class, 'pelanggaranStore'])->name('kemahasiswaan.pelanggaran.store');
        Route::post('kemahasiswaan/beasiswa/{beasiswa}/approve', [KemahasiswaanController::class, 'beasiswaApprove'])->name('kemahasiswaan.beasiswa.approve');
    });

    // Modul 10: System Configs Management & Superadmin Monitoring
    Route::middleware(['role:superadmin'])->group(function () {
        Route::get('settings/system-configs', [SystemConfigController::class, 'index'])->name('settings.system-configs.index');
        Route::put('settings/system-configs/{systemConfig}', [SystemConfigController::class, 'update'])->name('settings.system-configs.update');
        Route::get('superadmin/monitoring', [MonitoringController::class, 'index'])->name('superadmin.monitoring.index');
    });

    // Modul 11: Active Notification System
    Route::get('notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::post('notifications/{id}/read', [NotificationController::class, 'markAsRead'])->name('notifications.read');
    Route::post('notifications/read-all', [NotificationController::class, 'markAllAsRead'])->name('notifications.read-all');

    // Modul 12: Modul Laporan Dasar
    Route::middleware(['role:superadmin|admin_akademik|kaprodi'])->group(function () {
        Route::get('laporan/krs', [LaporanController::class, 'krs'])->name('laporan.krs.index');
        Route::get('laporan/krs/export', [LaporanController::class, 'exportKrs'])->name('laporan.krs.export');
    });

    Route::middleware(['role:superadmin|admin_akademik|kaprodi|dosen'])->group(function () {
        Route::get('laporan/rekap-nilai', [LaporanController::class, 'rekapNilai'])->name('laporan.rekap-nilai.index');
        Route::get('laporan/rekap-nilai/export', [LaporanController::class, 'exportRekapNilai'])->name('laporan.rekap-nilai.export');
    });

    Route::middleware(['role:superadmin|staf_keuangan'])->group(function () {
        Route::get('laporan/piutang-ukt', [LaporanController::class, 'piutangUkt'])->name('laporan.piutang-ukt.index');
        Route::get('laporan/piutang-ukt/export', [LaporanController::class, 'exportPiutangUkt'])->name('laporan.piutang-ukt.export');
    });

    // Modul 13: Integrasi PD-DIKTI (Neo Feeder Web Service)
    Route::middleware(['role:superadmin|admin_akademik'])->prefix('pddikti')->name('pddikti.')->group(function () {
        Route::get('/', [PddiktiSyncController::class, 'index'])->name('index');
        Route::get('/test-connection', [PddiktiSyncController::class, 'testConnection'])->name('test-connection');
        Route::post('/retry/{log}', [PddiktiSyncController::class, 'retry'])->name('retry');
        Route::post('/sync-batch', [PddiktiSyncController::class, 'syncBatch'])->name('sync-batch');
        Route::post('/reconcile', [PddiktiSyncController::class, 'reconcile'])->name('reconcile');
    });

    // Modul 14: Kepegawaian & Data Dosen (Otorisasi: role:superadmin|staf_kepegawaian)
    Route::middleware(['role:superadmin|staf_kepegawaian'])->prefix('kepegawaian')->name('kepegawaian.')->group(function () {
        Route::resource('unit-kerja', UnitKerjaController::class)->except(['create', 'edit', 'show']);
        Route::resource('dosen', DosenManagementController::class)->except(['create', 'edit', 'show']);
        Route::post('dosen/{dosen}/pendidikan', [DosenManagementController::class, 'storePendidikan'])->name('dosen.pendidikan.store');
        Route::delete('dosen/{dosen}/pendidikan/{pendidikan}', [DosenManagementController::class, 'destroyPendidikan'])->name('dosen.pendidikan.destroy');
        Route::post('dosen/{dosen}/jabatan', [DosenManagementController::class, 'storeJabatan'])->name('dosen.jabatan.store');
        Route::delete('dosen/{dosen}/jabatan/{jabatan}', [DosenManagementController::class, 'destroyJabatan'])->name('dosen.jabatan.destroy');

        Route::resource('pegawai', PegawaiManagementController::class)->except(['create', 'edit', 'show']);
    });

    // Modul 15: Cetak Dokumen Resmi Akademik (KRS, KHS, Transkrip, Kartu Ujian, Berita Acara)
    Route::prefix('dokumen')->name('dokumen.')->group(function () {
        Route::get('krs/{mahasiswa?}', [DokumenAkademikController::class, 'cetakKrs'])->name('krs');
        Route::get('khs/{mahasiswa?}', [DokumenAkademikController::class, 'cetakKhs'])->name('khs');
        Route::get('transkrip/{mahasiswa?}', [DokumenAkademikController::class, 'cetakTranskrip'])->name('transkrip');
        Route::get('kartu-ujian/{mahasiswa?}', [DokumenAkademikController::class, 'cetakKartuUjian'])->name('kartu-ujian');
        Route::get('kelas/{kelas}/berita-acara', [DokumenAkademikController::class, 'cetakBeritaAcaraKelas'])->name('kelas.berita-acara');
    });

    // Modul 16: Manajemen Pengguna & Akses User (Otorisasi: role:superadmin)
    Route::middleware(['role:superadmin'])->prefix('users')->name('users.')->group(function () {
        Route::get('/', [UserManagementController::class, 'index'])->name('index');
        Route::post('/', [UserManagementController::class, 'store'])->name('store');
        Route::put('/{user}', [UserManagementController::class, 'update'])->name('update');
        Route::delete('/{user}', [UserManagementController::class, 'destroy'])->name('destroy');
        Route::post('/{user}/reset-password', [UserManagementController::class, 'resetPassword'])->name('reset-password');
        Route::post('/{user}/impersonate', [UserManagementController::class, 'impersonate'])->name('impersonate');
    });

    // Route ini sengaja tidak dibungkus role:superadmin.
    // Saat sesi impersonasi aktif, pengguna yang terautentikasi adalah target user (bukan superadmin).
    // Agar target user dapat keluar dari impersonasi dan memulihkan akun superadmin, route ini
    // dapat diakses selama memiliki sesi terautentikasi dan diproteksi via validasi session 'impersonator_id'.
    Route::post('/leave-impersonate', [UserManagementController::class, 'leaveImpersonate'])->name('users.leave-impersonate');
});

require __DIR__.'/settings.php';
