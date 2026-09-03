import { Head, router } from '@inertiajs/react';
import { Award, Bell, BookOpen, CheckCheck, CreditCard, GraduationCap, Shield, UserCheck } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ResponsiveTable, TableHeader, TableBody, TableRow, TableHead, TableCell, StackedCell } from '@/components/ui/table';
import type { NotificationItem } from '@/types';

export default function NotificationsIndex({
    notifications = [],
    unreadCount = 0,
}: {
    notifications: NotificationItem[];
    unreadCount: number;
}) {
    const [filter, setFilter] = useState<'all' | 'unread'>('all');

    const filteredNotifications = filter === 'unread'
        ? notifications.filter((n) => !n.read_at)
        : notifications;

    const handleNotificationClick = (item: NotificationItem) => {
        router.post(`/notifications/${item.id}/read`);
    };

    const handleMarkAllRead = () => {
        router.post('/notifications/read-all');
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'krs':
                return <BookOpen className="size-4 text-blue-500" />;
            case 'keuangan':
                return <CreditCard className="size-4 text-purple-500" />;
            case 'skripsi':
                return <GraduationCap className="size-4 text-emerald-500" />;
            case 'yudisium':
                return <Award className="size-4 text-amber-500" />;
            case 'pmb':
                return <UserCheck className="size-4 text-indigo-500" />;
            default:
                return <Shield className="size-4 text-gray-500" />;
        }
    };

    return (
        <>
            <Head title="Semua Notifikasi" />

            <div className="p-4 sm:p-6 space-y-6 font-sans">
                {/* Page Title & Filter Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-semibold text-foreground flex items-center gap-2">
                            <Bell className="size-5 text-emerald-600" />
                            Semua Notifikasi Sistem
                        </h1>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Daftar riwayat pemberitahuan aktivitas akademik, keuangan, dan status berkas Anda.
                        </p>
                    </div>

                    {unreadCount > 0 && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleMarkAllRead}
                            className="text-xs flex items-center gap-1.5"
                        >
                            <CheckCheck className="size-4 text-emerald-600" />
                            <span>Tandai Semua Terbaca</span>
                        </Button>
                    )}
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-2 border-b border-border pb-2">
                    <button
                        type="button"
                        onClick={() => setFilter('all')}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                            filter === 'all'
                                ? 'bg-emerald-600 text-white'
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                        }`}
                    >
                        Semua ({notifications.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setFilter('unread')}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                            filter === 'unread'
                                ? 'bg-emerald-600 text-white'
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                        }`}
                    >
                        Belum Dibaca ({unreadCount})
                    </button>
                </div>

                {/* Notifications Table */}
                <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
                    {filteredNotifications.length === 0 ? (
                        <div className="p-12 text-center text-muted-foreground text-xs">
                            {filter === 'unread' ? 'Tidak ada notifikasi belum dibaca.' : 'Belum ada riwayat notifikasi.'}
                        </div>
                    ) : (
                        <ResponsiveTable>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-12">No</TableHead>
                                    <TableHead>Pemberitahuan & Pesan</TableHead>
                                    <TableHead className="w-36">Waktu</TableHead>
                                    <TableHead align="center" className="w-28">Status</TableHead>
                                    <TableHead align="right" className="w-24">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredNotifications.map((item, index) => (
                                    <TableRow
                                        key={item.id}
                                        className={!item.read_at ? 'bg-emerald-50/30 dark:bg-emerald-950/10' : ''}
                                    >
                                        <TableCell className="text-muted-foreground font-medium">{index + 1}</TableCell>
                                        <TableCell>
                                            <div className="flex items-start gap-3">
                                                <div className="mt-1 p-2 rounded-lg bg-muted shrink-0">
                                                    {getCategoryIcon(item.category)}
                                                </div>
                                                <StackedCell
                                                    primary={item.title}
                                                    secondary={item.message}
                                                />
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                                            {item.created_at_human}
                                        </TableCell>
                                        <TableCell align="center">
                                            {!item.read_at ? (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                                                    BARU
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                                                    TERBACA
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell align="right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleNotificationClick(item)}
                                                className="h-8 px-2 text-xs text-emerald-600 hover:text-emerald-700 font-semibold"
                                            >
                                                Buka &rarr;
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </ResponsiveTable>
                    )}
                </div>
            </div>
        </>
    );
}

NotificationsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Notifikasi', href: '/notifications' },
    ],
};
