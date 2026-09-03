<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class KrsNotification extends Notification
{
    use Queueable;

    public function __construct(
        public string $event,
        public string $mahasiswaNama,
        public ?string $catatan = null
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return match ($this->event) {
            'submitted' => [
                'title' => 'Pengajuan KRS Baru',
                'message' => "Mahasiswa bimbingan Anda ({$this->mahasiswaNama}) telah mengajukan KRS untuk disetujui.",
                'url' => '/perwalian/krs',
                'category' => 'krs',
            ],
            'approved' => [
                'title' => 'KRS Disetujui Dosen Wali',
                'message' => 'Selamat! Rencana Studi (KRS) Anda telah DISETUJUI oleh Dosen Wali.',
                'url' => '/krs/saya',
                'category' => 'krs',
            ],
            'rejected' => [
                'title' => 'KRS Ditolak Dosen Wali',
                'message' => 'Pengajuan KRS Anda DITOLAK oleh Dosen Wali.'.($this->catatan ? " Catatan: {$this->catatan}" : ''),
                'url' => '/krs/saya',
                'category' => 'krs',
            ],
            default => [
                'title' => 'Pemberitahuan KRS',
                'message' => "Status KRS mahasiswa {$this->mahasiswaNama} diperbarui.",
                'url' => '/krs/saya',
                'category' => 'krs',
            ],
        };
    }
}
