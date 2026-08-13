<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    /**
     * Display full notifications list page.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        $notifications = $user->notifications()->latest()->get()->map(function ($n) {
            return [
                'id' => $n->id,
                'title' => $n->data['title'] ?? 'Notifikasi',
                'message' => $n->data['message'] ?? '',
                'url' => $n->data['url'] ?? '#',
                'category' => $n->data['category'] ?? 'system',
                'read_at' => $n->read_at ? $n->read_at->toISOString() : null,
                'created_at_human' => \Carbon\Carbon::parse($n->created_at)->locale('id')->diffForHumans(),
            ];
        });

        return Inertia::render('notifications/index', [
            'notifications' => $notifications,
            'unreadCount' => $user->unreadNotifications()->count(),
        ]);
    }

    /**
     * Mark a specific notification as read with strict IDOR verification and redirect to target URL.
     */
    public function markAsRead(Request $request, string $id): RedirectResponse
    {
        $user = $request->user();

        // IDOR Check: Ensure notification exists specifically in this user's notifications
        $notification = $user->notifications()->where('id', $id)->first();

        if (! $notification) {
            abort(403, 'AKSES DITOLAK: Anda tidak memiliki akses ke notifikasi pengguna lain.');
        }

        if (! $notification->read_at) {
            $notification->markAsRead();
        }

        $targetUrl = $notification->data['url'] ?? '/dashboard';

        return redirect($targetUrl);
    }

    /**
     * Mark all unread notifications as read.
     */
    public function markAllAsRead(Request $request): RedirectResponse
    {
        $request->user()->unreadNotifications->markAsRead();

        return back()->with('success', 'Semua notifikasi telah ditandai sebagai terbaca.');
    }
}
