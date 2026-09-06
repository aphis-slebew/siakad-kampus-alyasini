import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    BookOpen,
    Building2,
    Check,
    Copy,
    ExternalLink,
    Eye,
    EyeOff,
    GraduationCap,
    KeyRound,
    Lock,
    LogIn,
    MoreVertical,
    Pencil,
    Plus,
    Search,
    Shield,
    ShieldAlert,
    Sparkles,
    Trash2,
    UserCheck,
    UserPlus,
    Users,
} from 'lucide-react';
import { useState } from 'react';
import { useConfirmDialog } from '@/components/confirm-dialog';
import { EmptyState } from '@/components/empty-state';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Pagination } from '@/components/ui/pagination';
import { ResponsiveTable, TableHeader, TableBody, TableRow, TableHead, TableCell, StackedCell } from '@/components/ui/table';

type UserItem = {
    id: number;
    name: string;
    email: string;
    user_type: string;
    status: string;
    roles: string[];
    identifier: string;
    prodi_or_unit: string;
    created_at: string;
    entity_link?: string | null;
};

type PaginationProps = {
    data: UserItem[];
    current_page: number;
    last_page: number;
    total: number;
    from?: number | null;
    to?: number | null;
    prev_page_url: string | null;
    next_page_url: string | null;
    links?: Array<{ url: string | null; label: string; active: boolean }>;
};

export default function UserManagementPage({
    users,
    roles = [],
    filters,
    totalStats,
}: {
    users?: PaginationProps;
    roles?: string[];
    filters?: { search?: string; role?: string; status?: string };
    totalStats?: {
        total: number;
        mahasiswa: number;
        dosen: number;
        pegawai: number;
        superadmin: number;
    };
}) {
    const safeUsers = users || { data: [], current_page: 1, last_page: 1, total: 0, prev_page_url: null, next_page_url: null, links: [] };
    const safeFilters = filters || {};
    const safeStats = totalStats || { total: 0, mahasiswa: 0, dosen: 0, pegawai: 0, superadmin: 0 };

    const [search, setSearch] = useState(safeFilters.search || '');
    const [selectedRole, setSelectedRole] = useState(safeFilters.role || 'all');
    const [selectedStatus, setSelectedStatus] = useState(safeFilters.status || 'all');

    // Modals
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
    const [showResetPassword, setShowResetPassword] = useState(false);
    const [copiedWhatsApp, setCopiedWhatsApp] = useState(false);

    // Forms
    const createForm = useForm({
        name: '',
        email: '',
        password: '',
        user_type: 'pegawai',
        role: 'admin_akademik',
        status: 'aktif',
    });

    const editForm = useForm({
        name: '',
        email: '',
        user_type: '',
        role: '',
        status: 'aktif',
    });

    const resetPasswordForm = useForm({
        password: '',
        password_confirmation: '',
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/users', {
            search,
            role: selectedRole !== 'all' ? selectedRole : undefined,
            status: selectedStatus !== 'all' ? selectedStatus : undefined,
            page: 1,
        }, { preserveState: true });
    };

    const handleFilterRole = (role: string) => {
        setSelectedRole(role);
        router.get('/users', {
            search: search || undefined,
            role: role !== 'all' ? role : undefined,
            status: selectedStatus !== 'all' ? selectedStatus : undefined,
            page: 1,
        }, { preserveState: true });
    };

    const deriveUserTypeFromRole = (role: string): string => {
        switch (role) {
            case 'superadmin':
                return 'superadmin';
            case 'dosen':
                return 'dosen';
            case 'mahasiswa':
                return 'mahasiswa';
            case 'calon_mahasiswa':
                return 'calon_mahasiswa';
            default:
                return 'pegawai';
        }
    };

    const { confirm, confirmDialog } = useConfirmDialog();

    const handleImpersonate = (user: UserItem) => {
        confirm({
            title: 'Akses Akun Pengguna (Impersonate)',
            description: `Apakah Anda yakin ingin masuk dan mengakses sistem sebagai ${user.name} (${user.roles[0] || user.user_type})? Anda dapat beralih kembali ke sesi Super Admin kapan saja.`,
            variant: 'warning',
            confirmText: 'Ya, Masuk Sebagai Pengguna',
            onConfirm: () => {
                router.post(`/users/${user.id}/impersonate`);
            },
        });
    };

    const openEditModal = (user: UserItem) => {
        setSelectedUser(user);
        editForm.setData({
            name: user.name,
            email: user.email,
            user_type: user.user_type,
            role: user.roles[0] || user.user_type,
            status: user.status,
        });
        setIsEditOpen(true);
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedUser) {
return;
}

        editForm.put(`/users/${selectedUser.id}`, {
            onSuccess: () => setIsEditOpen(false),
        });
    };

    const openResetPasswordModal = (user: UserItem) => {
        setSelectedUser(user);
        resetPasswordForm.reset();
        setShowResetPassword(false);
        setCopiedWhatsApp(false);
        setIsResetPasswordOpen(true);
    };

    const handleGenerateRandomPassword = () => {
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        const autoPass = `Yasini#${randomNum}`;
        resetPasswordForm.setData({
            password: autoPass,
            password_confirmation: autoPass,
        });
        setShowResetPassword(true);
    };

    const handleCopyWhatsAppFormat = () => {
        if (!selectedUser || !resetPasswordForm.data.password) {
            return;
        }
        const text = `*AKUN SIAKAD AL-YASINI*\n\nYth. Civitas Akademika: *${selectedUser.name}*\nEmail Login: *${selectedUser.email}*\nIdentitas (NIM/NIDN/NIP): *${selectedUser.identifier || '-'}*\nPassword Baru: *${resetPasswordForm.data.password}*\n\nSilakan masuk melalui portal SIAKAD: ${window.location.origin}/login\nDemi keamanan akun, segera perbarui password ini setelah berhasil login.`;
        navigator.clipboard.writeText(text);
        setCopiedWhatsApp(true);
        setTimeout(() => setCopiedWhatsApp(false), 3000);
    };

    const handleResetPasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedUser) {
            return;
        }

        resetPasswordForm.post(`/users/${selectedUser.id}/reset-password`, {
            onSuccess: () => setIsResetPasswordOpen(false),
        });
    };

    const handleDeleteUser = (user: UserItem) => {
        confirm({
            title: 'Hapus Akun Pengguna',
            description: `Apakah Anda yakin ingin menghapus akun ${user.name} (${user.email})? Tindakan ini tidak dapat dibatalkan dan seluruh hak akses akun ini akan dihapus.`,
            variant: 'destructive',
            confirmText: 'Ya, Hapus Akun',
            onConfirm: () => {
                router.delete(`/users/${user.id}`);
            },
        });
    };

    const getRoleBadgeColor = (role: string) => {
        switch (role.toLowerCase()) {
            case 'superadmin':
                return 'bg-purple-50 text-purple-700 border-purple-200';
            case 'admin_akademik':
            case 'kaprodi':
                return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'dosen':
                return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'staf_keuangan':
                return 'bg-amber-50 text-amber-700 border-amber-200';
            case 'panitia_pmb':
                return 'bg-indigo-50 text-indigo-700 border-indigo-200';
            case 'staf_kepegawaian':
            case 'kepegawaian':
                return 'bg-violet-50 text-violet-700 border-violet-200';
            case 'mahasiswa':
                return 'bg-cyan-50 text-cyan-700 border-cyan-200';
            case 'calon_mahasiswa':
                return 'bg-sky-50 text-sky-700 border-sky-200';
            case 'operator_kemahasiswaan':
            case 'kemahasiswaan':
                return 'bg-rose-50 text-rose-700 border-rose-200';
            default:
                return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    const getStatusBadgeColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'aktif':
                return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'nonaktif':
                return 'bg-rose-50 text-rose-700 border-rose-200';
            case 'cuti':
                return 'bg-amber-50 text-amber-700 border-amber-200';
            case 'lulus':
                return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'dropout':
                return 'bg-rose-50 text-rose-700 border-rose-200';
            default:
                return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    return (
        <>
            {confirmDialog}
            <Head title="Manajemen Pengguna & Hak Akses" />

            <div className="p-4 sm:p-6 lg:p-8 space-y-6 font-sans max-w-7xl mx-auto">
                {/* Header Title */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 shrink-0">
                            <Users className="size-6 sm:size-7" />
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                                Manajemen Pengguna & Hak Akses
                            </h1>
                            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                                Kelola seluruh akun civitas akademika, atur peran & hak akses, reset password, dan akses akun (Impersonate).
                            </p>
                        </div>
                    </div>

                    <Button
                        onClick={() => setIsCreateOpen(true)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-xs transition self-start sm:self-auto"
                    >
                        <UserPlus className="size-4" />
                        <span>Tambah Pengguna Baru</span>
                    </Button>
                </div>

                {/* Metric Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                    <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Akun</span>
                            <div className="p-2 rounded-lg bg-slate-100 text-slate-600">
                                <Users className="size-4" />
                            </div>
                        </div>
                        <p className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">{safeStats.total}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Mahasiswa</span>
                            <div className="p-2 rounded-lg bg-teal-50 text-teal-600">
                                <GraduationCap className="size-4" />
                            </div>
                        </div>
                        <p className="text-2xl sm:text-3xl font-bold tracking-tight text-teal-700">{safeStats.mahasiswa}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Dosen Pengajar</span>
                            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                                <BookOpen className="size-4" />
                            </div>
                        </div>
                        <p className="text-2xl sm:text-3xl font-bold tracking-tight text-emerald-700">{safeStats.dosen}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Staf & Pegawai</span>
                            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                                <Building2 className="size-4" />
                            </div>
                        </div>
                        <p className="text-2xl sm:text-3xl font-bold tracking-tight text-amber-700">{safeStats.pegawai}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between col-span-2 sm:col-span-1">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Superadmin</span>
                            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                                <ShieldAlert className="size-4" />
                            </div>
                        </div>
                        <p className="text-2xl sm:text-3xl font-bold tracking-tight text-indigo-700">{safeStats.superadmin}</p>
                    </div>
                </div>

                {/* Filter and Search Bar */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3 shadow-xs border-t-2 border-t-emerald-600">
                    {/* Role Filter Tabs */}
                    <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-100 pb-3 text-xs">
                        {[
                            { id: 'all', label: 'Semua Pengguna' },
                            { id: 'mahasiswa', label: 'Mahasiswa' },
                            { id: 'dosen', label: 'Dosen' },
                            { id: 'admin_akademik', label: 'Admin Akademik' },
                            { id: 'staf_keuangan', label: 'Staf Keuangan' },
                            { id: 'panitia_pmb', label: 'Panitia PMB' },
                            { id: 'staf_kepegawaian', label: 'Kepegawaian' },
                            { id: 'superadmin', label: 'Superadmin' },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => handleFilterRole(tab.id)}
                                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                                    selectedRole === tab.id
                                        ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Search & Status Filter Form */}
                    <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-2.5 size-4 text-slate-400" />
                            <Input
                                type="text"
                                placeholder="Cari nama pengguna atau email..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9 text-xs h-9 bg-slate-50 border-slate-300"
                            />
                        </div>
                        <select
                            value={selectedStatus}
                            onChange={(e) => {
                                setSelectedStatus(e.target.value);
                                router.get('/users', {
                                    search: search || undefined,
                                    role: selectedRole !== 'all' ? selectedRole : undefined,
                                    status: e.target.value !== 'all' ? e.target.value : undefined,
                                }, { preserveState: true });
                            }}
                            className="text-xs h-9 px-3 rounded-lg border border-slate-300 bg-white font-medium text-slate-700"
                        >
                            <option value="all">Semua Status Akun</option>
                            <option value="aktif">Status: Aktif</option>
                            <option value="nonaktif">Status: Nonaktif</option>
                            <option value="cuti">Status: Cuti</option>
                            <option value="lulus">Status: Lulus</option>
                        </select>
                        <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-5 h-9">
                            Cari
                        </Button>
                    </form>
                </div>

                {/* User Table */}
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                    {safeUsers.data.length === 0 ? (
                        <EmptyState
                            icon={Users}
                            title="Tidak Ada Data Pengguna"
                            description="Tidak ditemukan data pengguna yang sesuai dengan filter pencarian atau parameter yang dipilih."
                        />
                    ) : (
                        <ResponsiveTable>
                            <TableHeader>
                                <TableRow className="bg-slate-50 border-b border-slate-200">
                                    <TableHead className="font-bold text-slate-700">Pengguna</TableHead>
                                    <TableHead className="font-bold text-slate-700">Identitas / No. Induk</TableHead>
                                    <TableHead className="font-bold text-slate-700">Peran (Role)</TableHead>
                                    <TableHead className="font-bold text-slate-700">Homebase / Unit</TableHead>
                                    <TableHead className="font-bold text-slate-700">Status</TableHead>
                                    <TableHead align="right" className="font-bold text-slate-700">Aksi Superadmin</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {safeUsers.data.map((u) => (
                                    <TableRow key={u.id} className="hover:bg-slate-50/80 transition-colors">
                                        <TableCell>
                                            <div className="flex items-center gap-2.5">
                                                <div className="size-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs">
                                                    {u.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="space-y-0.5 min-w-0">
                                                    <p className="font-semibold text-slate-900 text-xs sm:text-sm truncate">{u.name}</p>
                                                    <p className="text-[11px] text-slate-500 truncate">{u.email}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-xs font-mono font-medium text-slate-700 bg-slate-100 px-2 py-1 rounded">
                                                {u.identifier}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {u.roles.map((r, idx) => (
                                                    <span
                                                        key={idx}
                                                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${getRoleBadgeColor(r)}`}
                                                    >
                                                        {r}
                                                    </span>
                                                ))}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-xs text-slate-600 font-medium">
                                                {u.prodi_or_unit}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${getStatusBadgeColor(u.status)}`}>
                                                {u.status}
                                            </span>
                                        </TableCell>
                                        <TableCell align="right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                {/* Impersonate Button */}
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleImpersonate(u)}
                                                    className="h-7 px-2 text-[11px] font-medium border-emerald-300 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-400 shadow-2xs transition"
                                                    title="Masuk dan akses sistem sebagai pengguna ini"
                                                >
                                                    <LogIn className="size-3 mr-1 text-emerald-600" />
                                                    <span>Akses Akun</span>
                                                </Button>

                                                {/* More Actions Dropdown */}
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="size-7 p-0 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md"
                                                            title="Menu Tindakan Akun"
                                                        >
                                                            <MoreVertical className="size-3.5" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48 bg-white shadow-lg border border-slate-200">
                                                        {u.entity_link && (
                                                            <DropdownMenuItem asChild>
                                                                <Link
                                                                    href={u.entity_link}
                                                                    className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 font-medium py-1.5 px-2.5 hover:bg-slate-50"
                                                                >
                                                                    <ExternalLink className="size-3.5 text-slate-500" />
                                                                    <span>Buka Profil Data</span>
                                                                </Link>
                                                            </DropdownMenuItem>
                                                        )}
                                                        <DropdownMenuItem
                                                            onClick={() => openEditModal(u)}
                                                            className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 font-medium py-1.5 px-2.5 hover:bg-slate-50"
                                                        >
                                                            <Pencil className="size-3.5 text-slate-500" />
                                                            <span>Edit Akun</span>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => openResetPasswordModal(u)}
                                                            className="flex items-center gap-2 cursor-pointer text-xs text-amber-700 font-medium py-1.5 px-2.5 hover:bg-amber-50"
                                                        >
                                                            <KeyRound className="size-3.5 text-amber-600" />
                                                            <span>Setel Ulang Password</span>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator className="my-1 border-slate-100" />
                                                        <DropdownMenuItem
                                                            onClick={() => handleDeleteUser(u)}
                                                            className="flex items-center gap-2 cursor-pointer text-xs text-rose-600 font-medium py-1.5 px-2.5 hover:bg-rose-50"
                                                        >
                                                            <Trash2 className="size-3.5 text-rose-500" />
                                                            <span>Hapus Akun</span>
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </ResponsiveTable>
                    )}

                    {/* Pagination */}
                    <div className="p-3 border-t border-slate-200">
                        <Pagination
                            links={safeUsers.links}
                            from={safeUsers.from}
                            to={safeUsers.to}
                            total={safeUsers.total}
                            itemName="pengguna"
                        />
                    </div>
                </div>
            </div>

            {/* Modal Create User */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="sm:max-w-md bg-white">
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold text-text-primary">Tambah Pengguna Baru</DialogTitle>
                        <DialogDescription className="text-xs text-text-secondary">
                            Buat akun baru dan tentukan peran wewenang dalam sistem.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={(e) => {
                        e.preventDefault();
                        createForm.post('/users', {
                            onSuccess: () => {
                                setIsCreateOpen(false);
                                createForm.reset();
                            },
                        });
                    }} className="space-y-3.5 py-2 text-xs">
                        <div className="space-y-1">
                            <Label className="text-xs font-semibold">Nama Lengkap</Label>
                            <Input
                                value={createForm.data.name}
                                onChange={(e) => createForm.setData('name', e.target.value)}
                                placeholder="Contoh: Dr. H. Ahmad Zaki, M.Pd"
                                required
                            />
                            {createForm.errors.name && <p className="text-rose-600 text-[11px]">{createForm.errors.name}</p>}
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs font-semibold">Alamat Email</Label>
                            <Input
                                type="email"
                                value={createForm.data.email}
                                onChange={(e) => createForm.setData('email', e.target.value)}
                                placeholder="nama@alyasini.ac.id"
                                required
                            />
                            {createForm.errors.email && <p className="text-rose-600 text-[11px]">{createForm.errors.email}</p>}
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs font-semibold">Password Awal</Label>
                            <Input
                                type="password"
                                value={createForm.data.password}
                                onChange={(e) => createForm.setData('password', e.target.value)}
                                placeholder="Minimal 8 karakter"
                                required
                            />
                            {createForm.errors.password && <p className="text-rose-600 text-[11px]">{createForm.errors.password}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label className="text-xs font-semibold">Tipe Pengguna</Label>
                                <select
                                    value={createForm.data.user_type}
                                    onChange={(e) => {
                                        const ut = e.target.value;
                                        let defaultRole = 'admin_akademik';

                                        if (ut === 'superadmin') {
defaultRole = 'superadmin';
} else if (ut === 'dosen') {
defaultRole = 'dosen';
} else if (ut === 'mahasiswa') {
defaultRole = 'mahasiswa';
}

                                        createForm.setData({
                                            ...createForm.data,
                                            user_type: ut,
                                            role: defaultRole,
                                        });
                                    }}
                                    className="w-full border border-border-default rounded-md px-3 py-1.5 text-xs bg-white focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600"
                                >
                                    <option value="pegawai">Pegawai / Staf</option>
                                    <option value="dosen">Dosen</option>
                                    <option value="mahasiswa">Mahasiswa</option>
                                    <option value="superadmin">Superadmin</option>
                                </select>
                            </div>

                            <div className="space-y-1">
                                <Label className="text-xs font-semibold">Peran (Role Utama)</Label>
                                <select
                                    value={createForm.data.role}
                                    onChange={(e) => {
                                        const r = e.target.value;
                                        createForm.setData({
                                            ...createForm.data,
                                            role: r,
                                            user_type: deriveUserTypeFromRole(r),
                                        });
                                    }}
                                    className="w-full border border-border-default rounded-md px-3 py-1.5 text-xs bg-white focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600"
                                >
                                    {roles.map((r) => (
                                        <option key={r} value={r}>{r.replace('_', ' ')}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <DialogFooter className="pt-3">
                            <Button type="button" variant="outline" size="sm" onClick={() => setIsCreateOpen(false)}>
                                Batal
                            </Button>
                            <Button type="submit" size="sm" disabled={createForm.processing} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                {createForm.processing ? 'Menyimpan...' : 'Simpan Akun'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal Edit User */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="sm:max-w-md bg-white">
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold text-text-primary">Edit Data Pengguna</DialogTitle>
                        <DialogDescription className="text-xs text-text-secondary">
                            Perbarui informasi akun dan penugasan peran.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleEditSubmit} className="space-y-3.5 py-2 text-xs">
                        <div className="space-y-1">
                            <Label className="text-xs font-semibold">Nama Lengkap</Label>
                            <Input
                                value={editForm.data.name}
                                onChange={(e) => editForm.setData('name', e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs font-semibold">Alamat Email</Label>
                            <Input
                                type="email"
                                value={editForm.data.email}
                                onChange={(e) => editForm.setData('email', e.target.value)}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label className="text-xs font-semibold">Peran (Role)</Label>
                                <select
                                    value={editForm.data.role}
                                    onChange={(e) => {
                                        const r = e.target.value;
                                        editForm.setData({
                                            ...editForm.data,
                                            role: r,
                                            user_type: deriveUserTypeFromRole(r),
                                        });
                                    }}
                                    className="w-full border border-border-default rounded-md px-3 py-1.5 text-xs bg-white focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600"
                                >
                                    {roles.map((r) => (
                                        <option key={r} value={r}>{r.replace('_', ' ')}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1">
                                <Label className="text-xs font-semibold">Status Akun</Label>
                                <select
                                    value={editForm.data.status}
                                    onChange={(e) => editForm.setData('status', e.target.value)}
                                    className="w-full border border-border-default rounded-md px-3 py-1.5 text-xs bg-white"
                                >
                                    <option value="aktif">Aktif</option>
                                    <option value="nonaktif">Nonaktif</option>
                                    <option value="cuti">Cuti</option>
                                    <option value="lulus">Lulus</option>
                                    <option value="dropout">Dropout</option>
                                </select>
                            </div>
                        </div>

                        <DialogFooter className="pt-3">
                            <Button type="button" variant="outline" size="sm" onClick={() => setIsEditOpen(false)}>
                                Batal
                            </Button>
                            <Button type="submit" size="sm" disabled={editForm.processing} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                {editForm.processing ? 'Menyimpan...' : 'Perbarui Akun'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal Reset Password */}
            <Dialog open={isResetPasswordOpen} onOpenChange={setIsResetPasswordOpen}>
                <DialogContent className="sm:max-w-md bg-white">
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                            <KeyRound className="size-5 text-amber-600" />
                            <span>Setel Ulang Password Pengguna</span>
                        </DialogTitle>
                        <DialogDescription className="text-xs text-slate-500">
                            Atur ulang kredensial masuk untuk <strong>{selectedUser?.name}</strong> ({selectedUser?.email}).
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleResetPasswordSubmit} className="space-y-4 py-2 text-xs">
                        {/* Quick Generator Box */}
                        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
                            <div>
                                <p className="text-xs font-semibold text-slate-800">Generate Password Acak</p>
                                <p className="text-[11px] text-slate-500">Buat password acak yang aman secara instan</p>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleGenerateRandomPassword}
                                className="h-8 text-xs font-medium border-slate-300 text-slate-700 hover:bg-white flex items-center gap-1.5 shrink-0 shadow-2xs"
                            >
                                <Sparkles className="size-3.5 text-amber-500" />
                                <span>Acak Otomatis</span>
                            </Button>
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs font-semibold">Password Baru</Label>
                                <button
                                    type="button"
                                    onClick={() => setShowResetPassword(!showResetPassword)}
                                    className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1 focus:outline-none"
                                >
                                    {showResetPassword ? (
                                        <>
                                            <EyeOff className="size-3" />
                                            <span>Sembunyikan</span>
                                        </>
                                    ) : (
                                        <>
                                            <Eye className="size-3" />
                                            <span>Lihat</span>
                                        </>
                                    )}
                                </button>
                            </div>
                            <Input
                                type={showResetPassword ? 'text' : 'password'}
                                value={resetPasswordForm.data.password}
                                onChange={(e) => resetPasswordForm.setData('password', e.target.value)}
                                placeholder="Minimal 8 karakter"
                                required
                            />
                            {resetPasswordForm.errors.password && (
                                <p className="text-rose-600 text-[11px]">{resetPasswordForm.errors.password}</p>
                            )}
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs font-semibold">Konfirmasi Password Baru</Label>
                            <Input
                                type={showResetPassword ? 'text' : 'password'}
                                value={resetPasswordForm.data.password_confirmation}
                                onChange={(e) => resetPasswordForm.setData('password_confirmation', e.target.value)}
                                placeholder="Ketik ulang password baru"
                                required
                            />
                        </div>

                        {/* WhatsApp Credentials Copy Shortcut */}
                        {resetPasswordForm.data.password && (
                            <div className="pt-1">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleCopyWhatsAppFormat}
                                    className="w-full text-xs font-medium border-emerald-300 text-emerald-700 bg-emerald-50/50 hover:bg-emerald-100/60 flex items-center justify-center gap-2"
                                >
                                    {copiedWhatsApp ? (
                                        <>
                                            <Check className="size-3.5 text-emerald-600" />
                                            <span>Format Pesan Tersalin ke Clipboard!</span>
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="size-3.5 text-emerald-600" />
                                            <span>Salin Format Info WhatsApp Civitas</span>
                                        </>
                                    )}
                                </Button>
                            </div>
                        )}

                        <DialogFooter className="pt-2">
                            <Button type="button" variant="outline" size="sm" onClick={() => setIsResetPasswordOpen(false)}>
                                Batal
                            </Button>
                            <Button type="submit" size="sm" disabled={resetPasswordForm.processing} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                {resetPasswordForm.processing ? 'Menyimpan...' : 'Simpan & Perbarui Password'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

UserManagementPage.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Manajemen Pengguna',
            href: '/users',
        },
    ],
};
