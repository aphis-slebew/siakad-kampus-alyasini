<?php

use App\Http\Controllers\Akademik\KelasKuliahController;
use App\Http\Controllers\Akademik\KhsController;
use App\Http\Controllers\Akademik\KrsController;
use App\Http\Controllers\Akademik\KurikulumProdiController;
use App\Http\Controllers\Akademik\MatakuliahController;
use App\Http\Controllers\Akademik\PenilaianController;
use App\Http\Controllers\Akademik\PresensiController;
use App\Http\Controllers\Kemahasiswaan\KemahasiswaanController;
use App\Http\Controllers\Laporan\LaporanController;
use App\Http\Controllers\NotificationController;


use App\Http\Controllers\Keuangan\KelompokUktController;
use App\Http\Controllers\Keuangan\KeuanganController;
use App\Http\Controllers\Keuangan\PeriodeRegistrasiController;
use App\Http\Controllers\Keuangan\RegistrasiUlangController;
use App\Http\Controllers\Master\FakultasController;
use App\Http\Controllers\Master\ProgramStudiController;
use App\Http\Controllers\Master\ReferensiBiodataController;
use App\Http\Controllers\Master\RuangKuliahController;
use App\Http\Controllers\Master\TahunAjaranController;
use App\Http\Controllers\Pmb\CalonMahasiswaController;
use App\Http\Controllers\Pmb\GelombangPendaftaranController;
use App\Http\Controllers\Pmb\JalurPendaftaranController;
use App\Http\Controllers\Pmb\PmbPublicController;
use App\Http\Controllers\Settings\SystemConfigController;
use App\Http\Controllers\Skripsi\ProposalSkripsiController;

use App\Http\Controllers\Skripsi\SkripsiController;
use App\Http\Controllers\Yudisium\YudisiumController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

if (app()->environment('local', 'testing')) {
    Route::get('dev-auth/admin', function () {
        $admin = \App\Models\User::where('user_type', 'superadmin')->first()
            ?? \App\Models\User::whereHas('roles', fn ($q) => $q->where('name', 'superadmin'))->first()
            ?? \App\Models\User::first();
        \Illuminate\Support\Facades\Auth::login($admin);
        return redirect('/dashboard');
    });
}


// Public PMB Registration
















Route::get('pmb/daftar', [PmbPublicController::class, 'index'])->name('pmb.register');
Route::post('pmb/daftar', [PmbPublicController::class, 'store'])->name('pmb.register.store');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    // Master Data & Referensi Akademik (Otorisasi: master_data.manage)
    Route::middleware(['can:master_data.manage'])->prefix('master')->name('master.')->group(function () {
        Route::resource('fakultas', FakultasController::class)->except(['create', 'edit', 'show']);
        Route::resource('program-studi', ProgramStudiController::class)->except(['create', 'edit', 'show']);
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

        Route::get('pembayaran', [KeuanganController::class, 'index'])->name('pembayaran.index');
        Route::patch('pembayaran/{pembayaran}/verify', [KeuanganController::class, 'verifyPayment'])->name('pembayaran.verify');
        Route::post('generate-ukt-batch', [KeuanganController::class, 'generateUktBatch'])->name('generate-ukt-batch');

        Route::get('registrasi-ulang', [RegistrasiUlangController::class, 'index'])->name('registrasi-ulang.index');
        Route::patch('dokumen-registrasi/{dokumen}/verify', [RegistrasiUlangController::class, 'verifyDokumen'])->name('dokumen-registrasi.verify');
    });

    // Modul Akademik: Kurikulum, Matakuliah, & Kelas Kuliah (Otorisasi: akademik.manage_kurikulum / akademik.manage_kelas / kaprodi view-only)
    Route::prefix('akademik')->name('akademik.')->group(function () {
        // Read-only routes for Admin & Kaprodi
        Route::middleware(['can:akademik.view_kurikulum'])->group(function () {
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
    });

    // Student Portal: Registrasi Ulang, Keuangan, & KRS
    Route::get('registrasi-ulang/saya', [RegistrasiUlangController::class, 'showStudentIndex'])->name('registrasi-ulang.student');
    Route::post('registrasi-ulang/saya', [RegistrasiUlangController::class, 'submitRegistration'])->name('registrasi-ulang.student.submit');

    Route::get('keuangan/bayar', [KeuanganController::class, 'showStudentPayment'])->name('keuangan.bayar');
    Route::post('keuangan/bayar', [KeuanganController::class, 'submitPayment'])->name('keuangan.bayar.submit');
    Route::post('keuangan/tagihan/{tagihan}/cicilan', [KeuanganController::class, 'requestCicilan'])->name('keuangan.cicilan.request');
    Route::get('keuangan/pembayaran/{pembayaran}/bukti', [KeuanganController::class, 'downloadBukti'])->name('keuangan.pembayaran.bukti');

    Route::get('krs/saya', [KrsController::class, 'studentIndex'])->name('krs.student');
    Route::post('krs/saya/submit', [KrsController::class, 'submitStudentKrs'])->name('krs.student.submit');

    // Dosen Wali Portal: Perwalian & Approval KRS
    Route::get('perwalian/krs', [KrsController::class, 'dosenIndex'])->name('perwalian.krs.index');
    Route::post('perwalian/krs/{krs}/approve', [KrsController::class, 'approveKrs'])->name('perwalian.krs.approve');
    Route::post('perwalian/krs/{krs}/reject', [KrsController::class, 'rejectKrs'])->name('perwalian.krs.reject');

    // Modul 7: Presensi, Penilaian Perkuliahan, & KHS
    Route::middleware(['role:superadmin|admin_akademik|dosen'])->group(function () {
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

    Route::middleware(['role:superadmin|admin_akademik|dosen'])->group(function () {
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


    // Modul 10: System Configs Management (Otorisasi: superadmin ONLY)
    Route::middleware(['role:superadmin'])->group(function () {
        Route::get('settings/system-configs', [SystemConfigController::class, 'index'])->name('settings.system-configs.index');
        Route::put('settings/system-configs/{systemConfig}', [SystemConfigController::class, 'update'])->name('settings.system-configs.update');
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

    Route::middleware(['role:superadmin|admin_akademik|dosen'])->group(function () {
        Route::get('laporan/rekap-nilai', [LaporanController::class, 'rekapNilai'])->name('laporan.rekap-nilai.index');
        Route::get('laporan/rekap-nilai/export', [LaporanController::class, 'exportRekapNilai'])->name('laporan.rekap-nilai.export');
    });

    Route::middleware(['role:superadmin|staf_keuangan'])->group(function () {
        Route::get('laporan/piutang-ukt', [LaporanController::class, 'piutangUkt'])->name('laporan.piutang-ukt.index');
        Route::get('laporan/piutang-ukt/export', [LaporanController::class, 'exportPiutangUkt'])->name('laporan.piutang-ukt.export');
    });
});

require __DIR__.'/settings.php';



