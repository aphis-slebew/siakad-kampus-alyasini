import { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { Calendar, Edit, Plus, Trash2 } from 'lucide-react';
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

import { formatDateIndonesian } from '@/lib/utils';

type TahunAjaran = {

    id: number;
    nama: string;
};

type Periode = {
    id: number;
    tahun_ajaran_id: number;
    jenis: string;
    mulai: string;
    selesai: string;
    tahun_ajaran?: TahunAjaran;
};

export default function PeriodeRegistrasiIndex({
    periodes = [],
    tahunAjarans = [],
}: {
    periodes: Periode[];
    tahunAjarans: TahunAjaran[];
}) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingPeriode, setEditingPeriode] = useState<Periode | null>(null);

    const createForm = useForm({
        tahun_ajaran_id: tahunAjarans[0]?.id || '',
        jenis: 'mahasiswa_baru',
        mulai: '',
        selesai: '',
    });

    const editForm = useForm({
        tahun_ajaran_id: 0,
        jenis: 'mahasiswa_baru',
        mulai: '',
        selesai: '',
    });

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/keuangan/periode-registrasi', {
            onSuccess: () => {
                setIsCreateOpen(false);
                createForm.reset();
            },
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingPeriode) return;

        editForm.put(`/keuangan/periode-registrasi/${editingPeriode.id}`, {
            onSuccess: () => {
                setEditingPeriode(null);
                editForm.reset();
            },
        });
    };

    const handleDelete = (item: Periode) => {
        if (confirm(`Apakah Anda yakin ingin menghapus periode registrasi ini?`)) {
            router.delete(`/keuangan/periode-registrasi/${item.id}`);
        }
    };

    const openEditModal = (item: Periode) => {
        setEditingPeriode(item);
        editForm.setData({
            tahun_ajaran_id: item.tahun_ajaran_id,
            jenis: item.jenis,
            mulai: item.mulai,
            selesai: item.selesai,
        });
    };

    return (
        <>
            <Head title="Kelola Periode Registrasi Ulang" />

            <div className="p-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-semibold text-text-primary">Periode Registrasi Ulang (Her-Registrasi)</h1>
                        <p className="text-xs text-text-secondary mt-0.5">
                            Atur jadwal periode registrasi ulang untuk Mahasiswa Baru (PMB) dan Mahasiswa Lama per Semester.
                        </p>
                    </div>

                    <Button
                        onClick={() => setIsCreateOpen(true)}
                        className="bg-brand-primary text-white hover:bg-brand-primary-dark text-xs font-semibold px-4 py-2 rounded-md flex items-center gap-1.5 self-start sm:self-auto"
                    >
                        <Plus className="size-4" />
                        Tambah Periode
                    </Button>
                </div>

                <div className="rounded-lg border border-border-default bg-surface-card shadow-xs overflow-hidden">
                    {periodes.length === 0 ? (
                        <div className="p-12 text-center">
                            <Calendar className="mx-auto size-10 text-text-secondary/50 mb-3" />
                            <h3 className="text-sm font-semibold text-text-primary">Belum ada periode registrasi ulang</h3>
                            <p className="text-xs text-text-secondary mt-1 mb-4">
                                Buat periode registrasi baru untuk mengizinkan mahasiswa mengajukan Her-Registrasi.
                            </p>
                            <Button
                                onClick={() => setIsCreateOpen(true)}
                                className="bg-brand-primary text-white hover:bg-brand-primary-dark text-xs font-semibold px-4 py-2 rounded-md inline-flex items-center gap-1.5"
                            >
                                <Plus className="size-4" />
                                Tambah Periode
                            </Button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="sticky top-0 bg-surface-base border-b border-border-default text-text-secondary font-semibold uppercase tracking-wider">
                                    <tr>
                                        <th className="py-3 px-4 w-12">No</th>
                                        <th className="py-3 px-4">Tahun Ajaran</th>
                                        <th className="py-3 px-4">Jenis Peruntukan</th>
                                        <th className="py-3 px-4 font-mono">Mulai</th>
                                        <th className="py-3 px-4 font-mono">Selesai</th>
                                        <th className="py-3 px-4 text-right w-28">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-default text-text-primary">
                                    {periodes.map((item, index) => (
                                        <tr key={item.id} className="even:bg-surface-base/50 hover:bg-surface-base transition-colors duration-150">
                                            <td className="py-3 px-4 text-text-secondary">{index + 1}</td>
                                            <td className="py-3 px-4 font-semibold text-brand-primary">
                                                {item.tahun_ajaran?.nama || '-'}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="capitalize px-2 py-0.5 rounded-full text-[11px] font-semibold bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
                                                    {item.jenis.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 font-medium">{formatDateIndonesian(item.mulai)}</td>
                                            <td className="py-3 px-4 font-medium">{formatDateIndonesian(item.selesai)}</td>

                                            <td className="py-3 px-4 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => openEditModal(item)}
                                                        className="p-1.5 rounded-md text-text-secondary hover:text-brand-primary hover:bg-surface-base transition-colors duration-150"
                                                        title="Edit Periode"
                                                    >
                                                        <Edit className="size-3.5" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(item)}
                                                        className="p-1.5 rounded-md text-text-secondary hover:text-status-danger hover:bg-surface-base transition-colors duration-150"
                                                        title="Hapus Periode"
                                                    >
                                                        <Trash2 className="size-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Tambah Periode */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="sm:max-w-md bg-surface-card border-border-default">
                    <DialogHeader>
                        <DialogTitle className="text-base font-semibold text-text-primary">Tambah Periode Registrasi Ulang</DialogTitle>
                        <DialogDescription className="text-xs text-text-secondary">
                            Atur jadwal gelombang Her-Registrasi.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleCreateSubmit} className="space-y-4 py-2">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-text-primary">
                                Tahun Ajaran <span className="text-status-danger">*</span>
                            </Label>
                            <select
                                value={createForm.data.tahun_ajaran_id}
                                onChange={(e) => createForm.setData('tahun_ajaran_id', Number(e.target.value))}
                                className="w-full text-xs rounded-md border border-border-default bg-surface-card p-2 text-text-primary focus:ring-2 focus:ring-brand-primary"
                            >
                                <option value="">Pilih Tahun Ajaran</option>
                                {tahunAjarans.map((t) => (
                                    <option key={t.id} value={t.id}>
                                        {t.nama}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-text-primary">
                                Jenis Peruntukan <span className="text-status-danger">*</span>
                            </Label>
                            <select
                                value={createForm.data.jenis}
                                onChange={(e) => createForm.setData('jenis', e.target.value)}
                                className="w-full text-xs rounded-md border border-border-default bg-surface-card p-2 text-text-primary focus:ring-2 focus:ring-brand-primary"
                            >
                                <option value="mahasiswa_baru">Mahasiswa Baru (PMB)</option>
                                <option value="mahasiswa_lama">Mahasiswa Lama (Semesteran)</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-text-primary">
                                    Tanggal Mulai <span className="text-status-danger">*</span>
                                </Label>
                                <Input
                                    type="date"
                                    value={createForm.data.mulai}
                                    onChange={(e) => createForm.setData('mulai', e.target.value)}
                                    className="text-xs border-border-default focus-visible:ring-brand-primary"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-text-primary">
                                    Tanggal Selesai <span className="text-status-danger">*</span>
                                </Label>
                                <Input
                                    type="date"
                                    value={createForm.data.selesai}
                                    onChange={(e) => createForm.setData('selesai', e.target.value)}
                                    className="text-xs border-border-default focus-visible:ring-brand-primary"
                                />
                            </div>
                        </div>

                        <DialogFooter className="pt-2 gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsCreateOpen(false)}
                                className="border-border-default text-text-primary text-xs"
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={createForm.processing}
                                className="bg-brand-primary text-white hover:bg-brand-primary-dark text-xs font-semibold"
                            >
                                Simpan Periode
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

PeriodeRegistrasiIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Keuangan & Registrasi', href: '#' },
        { title: 'Periode Registrasi', href: '/keuangan/periode-registrasi' },
    ],
};
