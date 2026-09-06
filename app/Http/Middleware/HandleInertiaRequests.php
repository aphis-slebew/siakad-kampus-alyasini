<?php

namespace App\Http\Middleware;

use App\Models\PerguruanTinggi;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'perguruanTinggi' => fn () => Cache::remember('global_perguruan_tinggi', 86400, fn () => PerguruanTinggi::first()),
            'auth' => [
                'user' => $request->user() ? [
                    'id' => $request->user()->id,
                    'name' => $request->user()->name,
                    'email' => $request->user()->email,
                    'user_type' => $request->user()->user_type,
                    'roles' => $request->user()->getRoleNames(),
                    'permissions' => $request->user()->getAllPermissions()->pluck('name'),
                ] : null,
            ],

            'impersonation' => [
                'is_impersonating' => $request->session()->has('impersonator_id'),
                'impersonator_name' => $request->session()->get('impersonator_name'),
            ],

            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',

            'notifications' => fn () => $request->user() ? $request->user()->notifications()->take(5)->get()->map(function ($n) {
                return [
                    'id' => $n->id,
                    'title' => $n->data['title'] ?? 'Notifikasi',
                    'message' => $n->data['message'] ?? '',
                    'url' => $n->data['url'] ?? '#',
                    'category' => $n->data['category'] ?? 'system',
                    'read_at' => $n->read_at ? $n->read_at->toISOString() : null,
                    'created_at_human' => Carbon::parse($n->created_at)->locale('id')->diffForHumans(),
                ];
            })->values()->toArray() : [],

            'unread_notification_count' => fn () => $request->user() ? $request->user()->unreadNotifications()->count() : 0,

            'flash' => [
                'warning' => fn () => $request->session()->get('warning'),
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'status' => fn () => $request->session()->get('status'),
            ],
        ];
    }
}
