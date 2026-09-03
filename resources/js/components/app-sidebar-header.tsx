import { Link, router, usePage } from '@inertiajs/react';
import {
    Award,
    Bell,
    BookOpen,
    CheckCheck,
    CreditCard,
    GraduationCap,
    Shield,
    UserCheck,
    User as UserIcon,
} from 'lucide-react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarTrigger } from '@/components/ui/sidebar';
import type { BreadcrumbItem as BreadcrumbItemType, NotificationItem, SharedData } from '@/types';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    const { auth, notifications = [], unread_notification_count = 0 } = usePage<SharedData>().props;
    const user = auth?.user;

    const handleNotificationClick = (item: NotificationItem) => {
        router.post(`/notifications/${item.id}/read`);
    };

    const handleMarkAllRead = (e: React.MouseEvent) => {
        e.stopPropagation();
        router.post('/notifications/read-all');
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'krs':
                return <BookOpen className="size-3.5 text-blue-500" />;
            case 'keuangan':
                return <CreditCard className="size-3.5 text-purple-500" />;
            case 'skripsi':
                return <GraduationCap className="size-3.5 text-emerald-500" />;
            case 'yudisium':
                return <Award className="size-3.5 text-amber-500" />;
            case 'pmb':
                return <UserCheck className="size-3.5 text-indigo-500" />;
            default:
                return <Shield className="size-3.5 text-gray-500" />;
        }
    };

    return (
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-border-default bg-surface-card px-4 md:px-6 transition-[width,height] duration-200 ease-in-out">
            <div className="flex items-center gap-3">
                <SidebarTrigger className="-ml-1 text-text-secondary hover:text-text-primary focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>

            <div className="flex items-center gap-3">
                {/* Active Notification Dropdown Menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>


                        <button
                            type="button"
                            className="relative rounded-md p-1.5 text-text-secondary hover:bg-surface-base hover:text-text-primary focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 transition-colors duration-200"
                            title="Notifikasi"
                        >
                            <Bell className="size-4" />
                            {unread_notification_count > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 flex items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white leading-none">
                                    {unread_notification_count > 99 ? '99+' : unread_notification_count}
                                </span>
                            )}
                        </button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end" className="w-80 sm:w-96 p-0 bg-card border-border shadow-lg font-sans">
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-foreground">Notifikasi</span>
                                {unread_notification_count > 0 && (
                                    <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                                        {unread_notification_count} Baru
                                    </span>
                                )}
                            </div>
                            {unread_notification_count > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleMarkAllRead}
                                    className="h-7 text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 px-2"
                                >
                                    <CheckCheck className="size-3.5" />
                                    <span>Tandai Semua Terbaca</span>
                                </Button>
                            )}
                        </div>

                        {/* Notifications List */}
                        <div className="max-h-80 overflow-y-auto divide-y divide-border">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center text-xs text-muted-foreground">
                                    Belum ada notifikasi.
                                </div>
                            ) : (
                                notifications.map((item) => (
                                    <DropdownMenuItem
                                        key={item.id}
                                        onClick={() => handleNotificationClick(item)}
                                        className={`p-3 cursor-pointer transition-colors ${
                                            !item.read_at ? 'bg-emerald-50/50 dark:bg-emerald-950/20 font-medium' : 'bg-transparent'
                                        }`}
                                    >
                                        <div className="flex items-start gap-3 w-full">
                                            <div className="mt-0.5 p-1.5 rounded-md bg-muted shrink-0">
                                                {getCategoryIcon(item.category)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2">
                                                    <p className="text-xs font-semibold text-foreground truncate">
                                                        {item.title}
                                                    </p>
                                                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                                        {item.created_at_human}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-snug">
                                                    {item.message}
                                                </p>
                                            </div>
                                        </div>
                                    </DropdownMenuItem>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-2 border-t border-border text-center bg-muted/30">
                            <Link
                                href="/notifications"
                                className="text-xs font-medium text-emerald-600 hover:text-emerald-700 hover:underline block py-1"
                            >
                                Lihat Semua Notifikasi &rarr;
                            </Link>
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>

                <div className="h-5 w-px bg-border-default mx-1" />

                <div className="flex items-center gap-2.5 bg-slate-50 hover:bg-slate-100/80 transition-colors py-1 px-2.5 rounded-full border border-border-default">
                    <div className="flex size-7 items-center justify-center rounded-full bg-gradient-to-br from-brand-primary to-brand-primary-dark text-white font-bold text-xs shadow-xs">
                        {user?.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="size-3.5" />}
                    </div>
                    <div className="hidden sm:block leading-tight text-left pr-1">
                        <p className="font-semibold text-xs text-text-primary truncate max-w-[130px]">
                            {user?.name || 'Pengguna'}
                        </p>
                        <p className="text-[10px] font-medium text-brand-primary capitalize">
                            {user?.roles?.[0]?.replace('_', ' ') || user?.user_type || 'Civitas'}
                        </p>
                    </div>
                </div>
            </div>
        </header>
    );
}


