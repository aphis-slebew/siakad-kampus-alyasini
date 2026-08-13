<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class KeuanganPembayaranNotification extends Notification
{
    use Queueable;

    public function __construct(
        public string $statusVerifikasi,
        public float $nominal,
        public ?string $catatan = null
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        $isVerified = $this->statusVerifikasi === 'diverifikasi';
        $formattedNominal = 'Rp '.number_format($this->nominal, 0, ',', '.');

        return [
            'title' => $isVerified ? 'Pembayaran Diverifikasi' : 'Pembayaran Ditolak',
            'message' => $isVerified
                ? "Pembayaran UKT Anda sebesar {$formattedNominal} telah berhasil DIVERIFIKASI oleh Staf Keuangan."
                : "Pembayaran UKT sebesar {$formattedNominal} DITOLAK Staf Keuangan.".($this->catatan ? " Alasan: {$this->catatan}" : ''),
            'url' => '/keuangan/pembayaran',
            'category' => 'keuangan',
        ];
    }
}
