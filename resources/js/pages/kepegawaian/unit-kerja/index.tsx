import { Head, useForm } from '@inertiajs/react';
import { Building2, Edit, Plus, Trash2, Users } from 'lucide-react';
import { useState } from 'react';
import { useConfirmDialog } from '@/components/confirm-dialog';
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
import { ResponsiveTable, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';

type UnitKerjaItem = {
    id: number;
    kode: string;
    nama: string;
    pegawais_count: number;
    created_at: string;
};

export default function UnitKerjaIndex({
    unitKerjas = [],
}: {
    unitKerjas: UnitKerjaItem[];
}) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingUnit, setEditingUnit] = useState<UnitKerjaItem | null>(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        kode: '',
        nama: '',
    });

    const openCreateModal = () => {
        reset();
        clearErrors();
        setEditingUnit(null);
        setIsCreateModalOpen(true);
    };

    const openEditModal = (unit: UnitKerjaItem) => {
        reset();
        clearErrors();
        setEditingUnit(unit);
        setData({
            kode: unit.kode,
            nama: unit.nama,
        });
        setIsCreateModalOpen(true);
    };

    const closeModal = () => {
        setIsCreateModalOpen(false);
        setEditingUnit(null);
        reset();
        clearErrors();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingUnit) {
            put(`/kepegawaian/unit-kerja/${editingUnit.id}`, {
                onSuccess: () => closeModal(),
            });
        } else {
            post('/kepegawaian/unit-kerja', {
                onSuccess: () => closeModal(),
            });
        }
    };

    const { confirm, showAlert, confirmDialog } = useConfirmDialog();

    const handleDelete = (unit: UnitKerjaItem) => {
        if (unit.pegawais_count > 0) {
            showAlert({
                title: 'Tidak Dapat Menghapus Unit Kerja',
                description: `Unit kerja "${unit.nama}" tidak dapat dihapus karena masih menaungi ${unit.pegawais_count} pegawai/staf aktif. Pindahkan pegawai terlebih dahulu sebelum menghapus unit ini.`,
                variant: 'warning',
                confirmText: 'Mengerti',
            });

            return;
        }

        confirm({
            title: 'Hapus Unit Kerja',
            description: `Apakah Anda yakin ingin menghapus unit kerja "${unit.nama}" (${unit.kode})? Tindakan ini akan menghapus data struktur divisi ini secara permanen.`,
            variant: 'destructive',
            confirmText: 'Ya, Hapus',
            onConfirm: () => {
                destroy(`/kepegawaian/unit-kerja/${unit.id}`);
            },
        });
    };

    const totalPegawaiAll = unitKerjas.reduce((acc, curr) => acc + (curr.pegawais_count || 0), 0);

    return (
        <>
            {confirmDialog}
            <Head title="Master Unit Kerja - SIAKAD" />

            <div className="p-4 sm:p-6 space-y-6 font-sans">
                {/* Header Section */}
                <div className="rounded-lg border border-border-default bg-surface-card p-4 sm:p-6 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <span className="p-2 rounded-md bg-brand-primary/10 text-brand-primary">
                                <Building2 className="size-5" />
                            </span>
                            <div>
                                <h1 className="text-xl font-semibold text-text-primary">
                                    Unit Kerja & Divisi Kampus
                                </h1>
                                <p className="text-xs text-text-secondary mt-0.5">
                                    Kelola struktur divisi, bagian, dan unit kerja penempatan staf/pegawai kampus.
                                </p>
                            </div>
                        </div>

                        <Button
                            size="sm"
                            onClick={openCreateModal}
                            className="bg-brand-primary hover:bg-brand-primary-dark text-white text-xs h-9 flex items-center justify-center gap-1.5 self-start sm:self-auto"
                        >
                            <Plus className="size-4" />
                            <span>Tambah Unit Kerja</span>
                        </Button>
                    </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="rounded-lg border border-border-default bg-surface-card p-4 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-text-secondary">Total Unit Kerja</span>
                            <span className="p-1.5 rounded-md bg-brand-primary/10 text-brand-primary">
                                <Building2 className="size-4" />
                            </span>
                        </div>
                        <p className="mt-2 text-2xl font-semibold text-text-primary">{unitKerjas.length}</p>
                    </div>

                    <div className="rounded-lg border border-border-default bg-surface-card p-4 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-text-secondary">Total Staf Terpenuhi</span>
                            <span className="p-1.5 rounded-md bg-status-success/10 text-status-success">
                                <Users className="size-4" />
                            </span>
                        </div>
                        <p className="mt-2 text-2xl font-semibold text-text-primary">{totalPegawaiAll} Pegawai</p>
                    </div>
                </div>

                {/* Table */}
                <ResponsiveTable>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-24">Kode</TableHead>
                            <TableHead>Nama Unit Kerja</TableHead>
                            <TableHead className="w-40 text-center">Jumlah Pegawai</TableHead>
                            <TableHead align="right" className="w-28">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {unitKerjas.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-8 text-xs text-text-secondary">
                                    Belum ada data unit kerja. Klik "Tambah Unit Kerja" untuk membuat baru.
                                </TableCell>
                            </TableRow>
                        ) : (
                            unitKerjas.map((unit) => (
                                <TableRow key={unit.id}>
                                    <TableCell className="font-mono text-xs font-semibold text-text-primary">
                                        {unit.kode}
                                    </TableCell>
                                    <TableCell className="text-xs font-medium text-text-primary">
                                        {unit.nama}
                                    </TableCell>
                                    <TableCell className="text-xs text-center text-text-secondary">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-surface-base border border-border-default">
                                            {unit.pegawais_count} Staf
                                        </span>
                                    </TableCell>
                                    <TableCell align="right">
                                        <div className="flex items-center justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => openEditModal(unit)}
                                                className="h-8 w-8 p-0 text-text-secondary hover:text-brand-primary"
                                                title="Edit"
                                            >
                                                <Edit className="size-3.5" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(unit)}
                                                disabled={unit.pegawais_count > 0}
                                                className="h-8 w-8 p-0 text-text-secondary hover:text-status-danger disabled:opacity-30"
                                                title="Hapus"
                                            >
                                                <Trash2 className="size-3.5" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </ResponsiveTable>
            </div>

            {/* Modal Create / Edit */}
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-sm font-semibold flex items-center gap-2">
                            <Building2 className="size-4 text-brand-primary" />
                            {editingUnit ? 'Edit Unit Kerja' : 'Tambah Unit Kerja Baru'}
                        </DialogTitle>
                        <DialogDescription className="text-xs text-text-secondary">
                            Isi detail kode dan nama divisi/bagian kampus.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                        <div className="space-y-1">
                            <Label htmlFor="kode" className="text-xs font-medium text-text-primary">
                                Kode Unit Kerja <span className="text-status-danger">*</span>
                            </Label>
                            <Input
                                id="kode"
                                placeholder="Contoh: BAA, BAU, LPPM"
                                value={data.kode}
                                onChange={(e) => setData('kode', e.target.value.toUpperCase())}
                                className="text-xs h-9 font-mono"
                                required
                            />
                            {errors.kode && <p className="text-status-danger text-[11px] mt-0.5">{errors.kode}</p>}
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="nama" className="text-xs font-medium text-text-primary">
                                Nama Unit Kerja <span className="text-status-danger">*</span>
                            </Label>
                            <Input
                                id="nama"
                                placeholder="Contoh: Bagian Administrasi Akademik"
                                value={data.nama}
                                onChange={(e) => setData('nama', e.target.value)}
                                className="text-xs h-9"
                                required
                            />
                            {errors.nama && <p className="text-status-danger text-[11px] mt-0.5">{errors.nama}</p>}
                        </div>

                        <DialogFooter className="pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={closeModal}
                                disabled={processing}
                                className="text-xs"
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                size="sm"
                                disabled={processing}
                                className="bg-brand-primary hover:bg-brand-primary-dark text-white text-xs"
                            >
                                {processing ? 'Menyimpan...' : editingUnit ? 'Perbarui' : 'Simpan'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
