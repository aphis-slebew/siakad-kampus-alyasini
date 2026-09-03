<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class YudisiumNotification extends Notification
{
    use Queueable;

    public function __construct(
        public int $yudisiumId,
        public string $nomorDokumen
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Penetapan Yudisium Terbit',
            'message' => "Selamat! Penetapan Yudisium Anda telah terbit dengan No Dokumen: {$this->nomorDokumen}.",
            'url' => "/yudisium/sertifikat/{$this->yudisiumId}",
            'category' => 'yudisium',
        ];
    }
}
