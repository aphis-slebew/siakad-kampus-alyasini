import { Head, useForm } from '@inertiajs/react';
import { Edit, Settings, ShieldAlert } from 'lucide-react';
import { useState } from 'react';
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
import { ResponsiveTable, TableHeader, TableBody, TableRow, TableHead, TableCell, StackedCell } from '@/components/ui/table';

type SystemConfigItem = {
    id: number;
    key: string;
    value: string;
    description: string;
    type: 'number' | 'decimal' | 'date' | 'text';
    updated_at: string | null;
};

export default function SystemConfigsIndex({
    configs = [],
}: {
    configs?: SystemConfigItem[];
}) {
    const safeConfigs = Array.isArray(configs) ? configs : [];
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

    const getTypeBadgeClass = (type: string) => {
        switch (type) {
            case 'number':
                return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'decimal':
                return 'bg-amber-50 text-amber-700 border-amber-200';
            case 'date':
                return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            default:
                return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    return (
        <>
            <Head title="Manajemen Konfigurasi Sistem" />

            <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-sans">
                {/* Page Title */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 shrink-0">
                            <Settings className="size-6 sm:size-7" />
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                                Manajemen Konfigurasi Sistem
                            </h1>
                            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                                Kelola parameter konfigurasi global sistem SIAKAD Al-Yasini (Khusus Akses Superadmin).
                            </p>
                        </div>
                    </div>
                </div>

                {/* Audit Security Notice Banner */}
                <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 flex items-start gap-3 shadow-xs">
                    <ShieldAlert className="size-5 shrink-0 mt-0.5 text-amber-600" />
                    <div className="leading-relaxed">
                        <span className="font-bold">PERHATIAN OTORISASI & AUDIT:</span> Perubahan parameter sistem berdampak langsung terhadap aturan perkuliahan, batas SKS, denda UKT, dan kelulusan yudisium. Seluruh aktivitas perubahan nilai dicatat dalam <span className="font-semibold underline">Activity Log</span>.
                    </div>
                </div>

                {/* Data Table */}
                <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden border-t-2 border-t-emerald-600">
                    {safeConfigs.length === 0 ? (
                        <EmptyState
                            icon={Settings}
                            title="Belum Ada Konfigurasi Sistem"
                            description="Data konfigurasi sistem belum tersedia dalam database."
                        />
                    ) : (
                        <ResponsiveTable>
                            <TableHeader>
                                <TableRow className="bg-slate-50 border-b border-slate-200">
                                    <TableHead className="font-bold text-slate-700">Nama Konfigurasi / Key</TableHead>
                                    <TableHead className="font-bold text-slate-700">Nilai Parameter (Value)</TableHead>
                                    <TableHead className="font-bold text-slate-700">Tipe Data</TableHead>
                                    <TableHead className="font-bold text-slate-700">Terakhir Diperbarui</TableHead>
                                    <TableHead align="right" className="font-bold text-slate-700">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {safeConfigs.map((item, index) => (
                                    <TableRow key={item.id} className="hover:bg-slate-50/80 transition-colors">
                                        <TableCell className="text-slate-500 font-medium">{index + 1}</TableCell>
                                        <TableCell>
                                            <StackedCell
                                                primary={item.key}
                                                secondary={item.description}
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono border ${getTypeBadgeClass(item.type)}`}>
                                                {item.type}
                                            </span>
                                        </TableCell>
                                        <TableCell align="center" className="font-mono font-bold text-slate-900">
                                            {item.type === 'decimal' && item.key.includes('DENDA')
                                                ? `Rp ${Number(item.value).toLocaleString('id-ID')}`
                                                : item.value}
                                        </TableCell>
                                        <TableCell align="right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => openEditModal(item)}
                                                className="h-8 px-2.5 text-xs flex items-center gap-1 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50"
                                                title="Edit Nilai Parameter"
                                            >
                                                <Edit className="size-3.5 text-emerald-600" />
                                                <span>Edit</span>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </ResponsiveTable>
                    )}
                </div>
            </div>

            {/* Edit Modal */}
            <Dialog open={!!editingConfig} onOpenChange={(open) => !open && closeModal()}>
                <DialogContent className="sm:max-w-md bg-white border-slate-200">
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold text-slate-900">
                            Edit Parameter: <span className="font-mono text-emerald-700">{editingConfig?.key}</span>
                        </DialogTitle>
                        <DialogDescription className="text-xs text-slate-500">
                            {editingConfig?.description}
                        </DialogDescription>
                    </DialogHeader>

                    {editingConfig && (
                        <form onSubmit={handleSubmit} className="space-y-4 py-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="value" className="text-xs font-semibold">
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
                                        placeholder="Masukkan desimal..."
                                    />
                                )}

                                {editingConfig.type === 'date' && (
                                    <Input
                                        id="value"
                                        type="date"
                                        value={data.value}
                                        onChange={(e) => setData('value', e.target.value)}
                                        className="font-mono text-xs"
                                    />
                                )}

                                {editingConfig.type === 'text' && (
                                    <Input
                                        id="value"
                                        type="text"
                                        value={data.value}
                                        onChange={(e) => setData('value', e.target.value)}
                                        className="text-xs"
                                        placeholder="Masukkan teks nilai..."
                                    />
                                )}

                                {errors.value && (
                                    <p className="text-xs font-medium text-destructive mt-1">{errors.value}</p>
                                )}
                            </div>

                            <DialogFooter className="gap-2 sm:gap-0 pt-2">
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
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                                >
                                    Simpan Perubahan
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
