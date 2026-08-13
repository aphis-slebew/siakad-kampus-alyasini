<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class SkripsiNotification extends Notification
{
    use Queueable;

    public function __construct(
        public string $event,
        public ?string $tanggal = null,
        public ?string $catatan = null
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return match ($this->event) {
            'bimbingan_validated' => [
                'title' => 'Log Bimbingan Divalidasi',
                'message' => 'Log konsultasi bimbingan Anda'.($this->tanggal ? " tanggal {$this->tanggal}" : '').' telah DIVALIDASI Dosen Pembimbing.',
                'url' => '/skripsi/bimbingan',
                'category' => 'skripsi',
            ],
            'ujian_scheduled' => [
                'title' => 'Jadwal Ujian Ditetapkan',
                'message' => 'Ujian proposal/skripsi Anda telah dijadwalkan pada tanggal '.($this->tanggal ?? 'ditentukan').'.',
                'url' => '/skripsi/proposal',
                'category' => 'skripsi',
            ],
            'ujian_passed' => [
                'title' => 'Selamat! Lulus Ujian',
                'message' => 'Selamat! Anda telah dinyatakan LULUS ujian proposal/skripsi.',
                'url' => '/skripsi/bimbingan',
                'category' => 'skripsi',
            ],
            default => [
                'title' => 'Pemberitahuan Skripsi',
                'message' => 'Terdapat pembaruan pada proses proposal/skripsi Anda.',
                'url' => '/skripsi/proposal',
                'category' => 'skripsi',
            ],
        };
    }
}
