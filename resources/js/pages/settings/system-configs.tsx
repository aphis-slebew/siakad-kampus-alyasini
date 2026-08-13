import { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Edit, Settings, ShieldAlert } from 'lucide-react';
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
    configs: SystemConfigItem[];
}) {
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
        if (!editingConfig) return;

        put(`/settings/system-configs/${editingConfig.id}`, {
            onSuccess: () => closeModal(),
        });
    };

    const getTypeBadgeClass = (type: string) => {
        switch (type) {
            case 'number':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300';
            case 'decimal':
                return 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300';
            case 'date':
                return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
        }
    };

    return (
        <>
            <Head title="Manajemen System Configs" />

            <div className="p-6 space-y-6 font-sans">
                {/* Page Title */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-semibold text-foreground flex items-center gap-2">
                            <Settings className="size-5 text-emerald-600" />
                            Manajemen System Configs
                        </h1>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Kelola parameter konfigurasi global sistem SIAKAD Al-Yasini (Khusus Akses Superadmin).
                        </p>
                    </div>
                </div>

                {/* Audit Security Notice Banner */}
                <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-lg p-3.5 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
                    <ShieldAlert className="size-4 shrink-0 mt-0.5 text-amber-600" />
                    <div>
                        <span className="font-bold">PERHATIAN OTORISASI & AUDIT:</span> Perubahan parameter sistem berdampak langsung terhadap aturan perkuliahan, batas SKS, denda UKT, dan kelulusan yudisium. Seluruh aktivitas perubahan nilai dicatat dalam <span className="font-semibold underline">Activity Log</span>.
                    </div>
                </div>

                {/* Data Table */}
                <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
                    {configs.length === 0 ? (
                        <div className="p-12 text-center text-muted-foreground text-xs">
                            Belum ada parameter konfigurasi terdaftar.
                        </div>
                    ) : (
                        <ResponsiveTable>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-12">No</TableHead>
                                    <TableHead>Parameter & Deskripsi Key</TableHead>
                                    <TableHead align="center" className="w-28">Tipe Data</TableHead>
                                    <TableHead align="center" className="w-44">Value Saat Ini</TableHead>
                                    <TableHead align="right" className="w-24">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {configs.map((item, index) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="text-muted-foreground font-medium">{index + 1}</TableCell>
                                        <TableCell>
                                            <StackedCell
                                                primary={item.key}
                                                secondary={item.description}
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium uppercase font-mono ${getTypeBadgeClass(item.type)}`}>
                                                {item.type}
                                            </span>
                                        </TableCell>
                                        <TableCell align="center" className="font-mono font-bold text-foreground">
                                            {item.type === 'decimal' && item.key.includes('DENDA')
                                                ? `Rp ${Number(item.value).toLocaleString('id-ID')}`
                                                : item.value}
                                        </TableCell>
                                        <TableCell align="right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => openEditModal(item)}
                                                className="h-8 px-2.5 text-xs flex items-center gap-1"
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
                <DialogContent className="sm:max-w-md bg-card border-border">
                    <DialogHeader>
                        <DialogTitle className="text-base font-semibold text-foreground">
                            Edit Parameter: <span className="font-mono text-emerald-600">{editingConfig?.key}</span>
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground">
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
