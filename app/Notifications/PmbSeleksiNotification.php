<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class PmbSeleksiNotification extends Notification
{
    use Queueable;

    public function __construct(
        public string $status,
        public string $catatan = ''
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        $isLulus = $this->status === 'lulus';

        return [
            'title' => $isLulus ? 'Hasil Seleksi PMB: Diterima' : 'Hasil Seleksi PMB: Belum Diterima',
            'message' => $isLulus
                ? 'Selamat! Anda dinyatakan LULUS seleksi Penerimaan Mahasiswa Baru STAI Al-Yasini. Silakan selesaikan Registrasi Ulang.'
                : 'Mohon maaf, Anda belum dinyatakan lulus seleksi PMB.'.($this->catatan ? " Catatan: {$this->catatan}" : ''),
            'url' => '/pmb/calon-mahasiswa',
            'category' => 'pmb',
        ];
    }
}
