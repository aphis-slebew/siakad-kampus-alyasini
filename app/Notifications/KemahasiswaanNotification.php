<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class KemahasiswaanNotification extends Notification
{
    use Queueable;

    public function __construct(
        public string $type,
        public string $namaItem,
        public string $status,
        public ?string $catatan = null
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        $isBeasiswa = $this->type === 'beasiswa';
        $isApproved = in_array($this->status, ['disetujui', 'diterima', 'divalidasi'], true);

        $targetUrl = $isBeasiswa ? '/kemahasiswaan/beasiswa' : '/kemahasiswaan/aktivitas';
        $itemLabel = $isBeasiswa ? 'Pengajuan Beasiswa' : 'Aktivitas Mahasiswa';

        return [
            'title' => "Status {$itemLabel}",
            'message' => $isApproved
                ? "{$itemLabel} '{$this->namaItem}' Anda telah DISETUJI/DITERIMA."
                : "{$itemLabel} '{$this->namaItem}' Anda DITOLAK.".($this->catatan ? " Catatan: {$this->catatan}" : ''),
            'url' => $targetUrl,
            'category' => 'kemahasiswaan',
        ];
    }
}
