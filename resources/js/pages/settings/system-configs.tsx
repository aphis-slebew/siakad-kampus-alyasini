import { Head, useForm } from '@inertiajs/react';
import {
    BookOpen,
    Calendar,
    CheckCircle2,
    DollarSign,
    Edit,
    GraduationCap,
    Landmark,
    Layers,
    Search,
    Settings,
    ShieldAlert,
} from 'lucide-react';
import { useMemo, useState } from 'react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    ResponsiveTable,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    StackedCell,
} from '@/components/ui/table';

export type SystemConfigItem = {
    id: number;
    key: string;
    value: string;
    description: string;
    type: 'number' | 'decimal' | 'date' | 'text' | 'select';
    category?: 'akademik' | 'krs' | 'keuangan' | 'skripsi_yudisium' | 'institusi';
    options?: string[];
    updated_at: string | null;
};

const CATEGORIES = [
    { id: 'all', label: 'Semua Parameter', icon: Layers },
    { id: 'akademik', label: 'Akademik & Perkuliahan', icon: BookOpen },
    { id: 'krs', label: 'KRS & Registrasi', icon: Calendar },
    { id: 'keuangan', label: 'Keuangan & UKT', icon: DollarSign },
    { id: 'skripsi_yudisium', label: 'Skripsi & Yudisium', icon: GraduationCap },
    { id: 'institusi', label: 'Institusi & Dokumen', icon: Landmark },
] as const;

export default function SystemConfigsIndex({
    configs = [],
}: {
    configs?: SystemConfigItem[];
}) {
    const safeConfigs = Array.isArray(configs) ? configs : [];
    const [activeCategory, setActiveCategory] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [editingConfig, setEditingConfig] = useState<SystemConfigItem | null>(null);

    const { data, setData, put, processing, errors, reset } = useForm({
        value: '',
    });

    const openEditModal = (config: SystemConfigItem) => {
        setEditingConfig(config);
        setData('value', config.value);
    };

    const closeModal = () => {
        setEditingConfig(null);
        reset();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!editingConfig) {
return;
}

        put(`/settings/system-configs/${editingConfig.id}`, {
            onSuccess: () => closeModal(),
        });
    };

    // Filter configs based on active category & search query
    const filteredConfigs = useMemo(() => {
        return safeConfigs.filter((item) => {
            const matchesCategory =
                activeCategory === 'all' || item.category === activeCategory;
            const matchesSearch =
                searchQuery.trim() === '' ||
                item.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.value.toLowerCase().includes(searchQuery.toLowerCase());

            return matchesCategory && matchesSearch;
        });
    }, [safeConfigs, activeCategory, searchQuery]);

    // Statistics breakdown
    const stats = useMemo(() => {
        return {
            total: safeConfigs.length,
            akademik: safeConfigs.filter((c) => c.category === 'akademik' || c.category === 'krs').length,
            keuangan: safeConfigs.filter((c) => c.category === 'keuangan').length,
            kelulusan: safeConfigs.filter((c) => c.category === 'skripsi_yudisium' || c.category === 'institusi').length,
        };
    }, [safeConfigs]);

    const getTypeBadgeClass = (type: string) => {
        switch (type) {
            case 'number':
                return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'decimal':
                return 'bg-amber-50 text-amber-700 border-amber-200';
            case 'date':
                return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'select':
                return 'bg-purple-50 text-purple-700 border-purple-200';
            default:
                return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    const getCategoryBadge = (category?: string) => {
        switch (category) {
            case 'akademik':
                return { label: 'Akademik', class: 'bg-teal-50 text-teal-700 border-teal-200' };
            case 'krs':
                return { label: 'KRS', class: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
            case 'keuangan':
                return { label: 'Keuangan', class: 'bg-amber-50 text-amber-700 border-amber-200' };
            case 'skripsi_yudisium':
                return { label: 'Tugas Akhir', class: 'bg-sky-50 text-sky-700 border-sky-200' };
            case 'institusi':
                return { label: 'Institusi', class: 'bg-rose-50 text-rose-700 border-rose-200' };
            default:
                return { label: 'Umum', class: 'bg-slate-50 text-slate-700 border-slate-200' };
        }
    };

    return (
        <>
            <Head title="Pengaturan Sistem Global — Superadmin" />

            <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-sans">
                {/* Header Title */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 shrink-0">
                            <Settings className="size-6 sm:size-7" />
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                                Pengaturan Sistem Global (System Config)
                            </h1>
                            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                                Pusat konfigurasi parameter operasional akademik, batas SKS, denda UKT, dan format resmi kampus.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Audit Safeguard Banner */}
                <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 flex items-start gap-3 shadow-xs">
                    <ShieldAlert className="size-5 shrink-0 mt-0.5 text-amber-600" />
                    <div className="leading-relaxed">
                        <span className="font-bold">AUDIT SAFEGUARD AKTIF:</span> Seluruh perubahan parameter sistem langsung memengaruhi validasi KRS, perhitungan denda, dan syarat kelulusan yudisium. Setiap perubahan dicatat secara otomatis ke dalam <span className="font-semibold underline">Activity Log</span>.
                    </div>
                </div>

                {/* Summary Metrics */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <div className="p-3.5 sm:p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
                        <div className="text-xs font-semibold text-slate-500">Total Parameter</div>
                        <div className="text-2xl font-extrabold text-slate-900 mt-1">{stats.total}</div>
                        <div className="text-[11px] text-emerald-600 mt-0.5 flex items-center gap-1 font-medium">
                            <CheckCircle2 className="size-3" /> Siap Digunakan
                        </div>
                    </div>
                    <div className="p-3.5 sm:p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
                        <div className="text-xs font-semibold text-slate-500">Akademik & KRS</div>
                        <div className="text-2xl font-extrabold text-slate-900 mt-1">{stats.akademik}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">Batas SKS & Jadwal</div>
                    </div>
                    <div className="p-3.5 sm:p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
                        <div className="text-xs font-semibold text-slate-500">Keuangan & UKT</div>
                        <div className="text-2xl font-extrabold text-slate-900 mt-1">{stats.keuangan}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">Denda & Cekal KRS</div>
                    </div>
                    <div className="p-3.5 sm:p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
                        <div className="text-xs font-semibold text-slate-500">Kelulusan & Institusi</div>
                        <div className="text-2xl font-extrabold text-slate-900 mt-1">{stats.kelulusan}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">Yudisium & Kop Dokumen</div>
                    </div>
                </div>

                {/* Filter Tabs & Search Bar */}
                <div className="space-y-3">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        {/* Categories Tab Pill */}
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 md:pb-0 scrollbar-none">
                            {CATEGORIES.map((cat) => {
                                const Icon = cat.icon;
                                const isActive = activeCategory === cat.id;

                                return (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        onClick={() => setActiveCategory(cat.id)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer border ${
                                            isActive
                                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
                                        }`}
                                    >
                                        <Icon className="size-3.5" />
                                        <span>{cat.label}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Search Input */}
                        <div className="relative w-full md:w-72 shrink-0">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                            <Input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Cari nama parameter atau fungsi..."
                                className="pl-8 text-xs bg-white border-slate-200"
                            />
                        </div>
                    </div>
                </div>

                {/* Data Table */}
                <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden border-t-2 border-t-emerald-600">
                    {filteredConfigs.length === 0 ? (
                        <EmptyState
                            icon={Settings}
                            title="Konfigurasi Tidak Ditemukan"
                            description={
                                searchQuery
                                    ? `Tidak ditemukan parameter yang cocok dengan kata kunci "${searchQuery}".`
                                    : 'Belum ada parameter dalam kategori yang dipilih.'
                            }
                        />
                    ) : (
                        <ResponsiveTable>
                            <TableHeader>
                                <TableRow className="bg-slate-50 border-b border-slate-200">
                                    <TableHead className="font-bold text-slate-700 w-12 text-center">#</TableHead>
                                    <TableHead className="font-bold text-slate-700">Nama Konfigurasi / Key</TableHead>
                                    <TableHead className="font-bold text-slate-700">Kategori</TableHead>
                                    <TableHead className="font-bold text-slate-700">Tipe</TableHead>
                                    <TableHead className="font-bold text-slate-700">Nilai Parameter (Value)</TableHead>
                                    <TableHead align="right" className="font-bold text-slate-700">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredConfigs.map((item, index) => {
                                    const catBadge = getCategoryBadge(item.category);

                                    return (
                                        <TableRow key={item.id} className="hover:bg-slate-50/80 transition-colors">
                                            <TableCell align="center" className="text-slate-500 font-medium text-xs">
                                                {index + 1}
                                            </TableCell>
                                            <TableCell>
                                                <StackedCell
                                                    primary={item.key}
                                                    secondary={item.description}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border ${catBadge.class}`}>
                                                    {catBadge.label}
                                                </span>
                                            </TableCell>
                                            <TableCell align="center">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono border ${getTypeBadgeClass(item.type)}`}>
                                                    {item.type}
                                                </span>
                                            </TableCell>
                                            <TableCell className="font-mono font-bold text-slate-900 text-xs">
                                                {item.type === 'decimal' && item.key.includes('DENDA')
                                                    ? `Rp ${Number(item.value).toLocaleString('id-ID')}`
                                                    : item.type === 'select'
                                                    ? (
                                                        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${item.value === 'buka' || item.value === 'ya' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                                                            {item.value.toUpperCase()}
                                                        </span>
                                                    )
                                                    : item.value}
                                            </TableCell>
                                            <TableCell align="right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => openEditModal(item)}
                                                    className="h-8 px-2.5 text-xs flex items-center gap-1 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 cursor-pointer"
                                                    title="Ubah Nilai Parameter"
                                                >
                                                    <Edit className="size-3.5 text-emerald-600" />
                                                    <span>Ubah</span>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </ResponsiveTable>
                    )}
                </div>
            </div>

            {/* Edit Modal Dialog */}
            <Dialog open={!!editingConfig} onOpenChange={(open) => !open && closeModal()}>
                <DialogContent className="sm:max-w-md bg-white border-slate-200">
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold text-slate-900">
                            Ubah Parameter: <span className="font-mono text-emerald-700">{editingConfig?.key}</span>
                        </DialogTitle>
                        <DialogDescription className="text-xs text-slate-500">
                            {editingConfig?.description}
                        </DialogDescription>
                    </DialogHeader>

                    {editingConfig && (
                        <form onSubmit={handleSubmit} className="space-y-4 py-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="value" className="text-xs font-semibold text-slate-700">
                                    Nilai Parameter Baru ({editingConfig.type.toUpperCase()})
                                </Label>

                                {editingConfig.type === 'number' && (
                                    <Input
                                        id="value"
                                        type="number"
                                        min="0"
                                        step="1"
                                        value={data.value}
                                        onChange={(e) => setData('value', e.target.value)}
                                        className="font-mono text-xs"
                                        placeholder="Masukkan angka bulat..."
                                        required
                                    />
                                )}

                                {editingConfig.type === 'decimal' && (
                                    <Input
                                        id="value"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={data.value}
                                        onChange={(e) => setData('value', e.target.value)}
                                        className="font-mono text-xs"
                                        placeholder="Masukkan nilai desimal..."
                                        required
                                    />
                                )}

                                {editingConfig.type === 'date' && (
                                    <Input
                                        id="value"
                                        type="date"
                                        value={data.value}
                                        onChange={(e) => setData('value', e.target.value)}
                                        className="font-mono text-xs"
                                        required
                                    />
                                )}

                                {editingConfig.type === 'select' && (
                                    <select
                                        id="value"
                                        value={data.value}
                                        onChange={(e) => setData('value', e.target.value)}
                                        className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                                        required
                                    >
                                        {(editingConfig.options || ['buka', 'tutup']).map((opt) => (
                                            <option key={opt} value={opt}>
                                                {opt.toUpperCase()}
                                            </option>
                                        ))}
                                    </select>
                                )}

                                {editingConfig.type === 'text' && (
                                    <Input
                                        id="value"
                                        type="text"
                                        value={data.value}
                                        onChange={(e) => setData('value', e.target.value)}
                                        className="text-xs"
                                        placeholder="Masukkan teks konfigurasi..."
                                        required
                                    />
                                )}

                                {errors.value && (
                                    <p className="text-xs font-medium text-destructive mt-1">{errors.value}</p>
                                )}
                            </div>

                            <DialogFooter className="gap-2 sm:gap-0 pt-3 border-t border-slate-100">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={closeModal}
                                    className="text-xs"
                                >
                                    Batal
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs cursor-pointer"
                                >
                                    {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                                </Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}

SystemConfigsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Konfigurasi Sistem', href: '/settings/system-configs' },
    ],
};
