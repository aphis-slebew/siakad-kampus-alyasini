<?php

use App\Jobs\Pddikti\PullReferensiPddiktiJob;
use App\Services\Pddikti\NeoFeederClient;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Scheduled background maintenance jobs
Schedule::command('queue:prune-batches')->daily();
Schedule::command('queue:prune-failed --hours=72')->daily();

Artisan::command('pddikti:ping', function (NeoFeederClient $client) {
    $this->info('Menguji koneksi ke Neo Feeder Web Service...');
    $result = $client->testConnection();

    $this->table(
        ['Parameter', 'Nilai'],
        [
            ['Endpoint URL', $result['url'] ?? config('pddikti.feeder_url')],
            ['Username Operator', config('pddikti.username')],
            ['Sandbox Mode', config('pddikti.sandbox_mode') ? 'Ya (Simulasi/Mock)' : 'Tidak (Live Feeder)'],
            ['Status Koneksi', ($result['status'] ?? '') === 'connected' ? '<info>TERHUBUNG (CONNECTED)</info>' : '<error>GAGAL (ERROR)</error>'],
            ['Pesan', $result['message'] ?? '-'],
        ]
    );

    if (($result['status'] ?? '') === 'connected' && ! empty($result['profil'])) {
        $this->newLine();
        $this->info('=== Profil Perguruan Tinggi Terdaftar ===');
        $profil = $result['profil'];
        $this->table(
            ['Atribut', 'Data'],
            [
                ['Kode PT', $profil['kode_perguruan_tinggi'] ?? '-'],
                ['Nama PT', $profil['nama_perguruan_tinggi'] ?? '-'],
                ['Status', $profil['status'] ?? '-'],
            ]
        );
    }
})->purpose('Uji konektivitas dan otentikasi ke Neo Feeder PD-DIKTI Web Service');

Artisan::command('pddikti:sync-referensi {--sync : Jalankan secara sinkron langsung}', function () {
    $this->info('Memulai sinkronisasi kamus referensi (Agama, Pekerjaan, Penghasilan) dari PD-DIKTI...');

    if ($this->option('sync')) {
        app(PullReferensiPddiktiJob::class)->handle(app(NeoFeederClient::class));
        $this->info('Sinkronisasi referensi berhasil dijalankan secara langsung.');
    } else {
        PullReferensiPddiktiJob::dispatch();
        $this->info('Tugas sinkronisasi referensi telah dikirim ke background queue.');
    }
})->purpose('Tarik dan perbarui data referensi biodata dari Neo Feeder');
