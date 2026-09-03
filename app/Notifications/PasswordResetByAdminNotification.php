<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class PasswordResetByAdminNotification extends Notification
{
    use Queueable;

    public function __construct(
        public string $resetByName
    ) {}

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, string>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Password Akun Diperbarui',
            'message' => "Password akun Anda telah di-reset oleh Administrator ({$this->resetByName}). Silakan login menggunakan password baru Anda.",
            'url' => '/settings/security',
            'category' => 'security',
        ];
    }
}
