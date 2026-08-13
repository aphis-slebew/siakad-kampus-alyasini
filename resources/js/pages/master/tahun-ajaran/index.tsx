import { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { Calendar, CheckCircle2, Edit, Plus, Trash2, XCircle } from 'lucide-react';
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
    mulai: string;
    selesai: string;
    is_active: boolean;
};

export default function TahunAjaranIndex({ tahunAjarans = [] }: { tahunAjarans: TahunAjaran[] }) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingTahun, setEditingTahun] = useState<TahunAjaran | null>(null);

    const createForm = useForm({
        nama: '',
        mulai: '',
        selesai: '',
        is_active: false,
    });

    const editForm = useForm({
        nama: '',
        mulai: '',
        selesai: '',
        is_active: false,
    });

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/master/tahun-ajaran', {
            onSuccess: () => {
                setIsCreateOpen(false);
                createForm.reset();
            },
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingTahun) return;

        editForm.put(`/master/tahun-ajaran/${editingTahun.id}`, {
            onSuccess: () => {
                setEditingTahun(null);
                editForm.reset();
            },
        });
    };

    const handleDelete = (item: TahunAjaran) => {
        if (confirm(`Apakah Anda yakin ingin menghapus tahun ajaran ${item.nama}?`)) {
            router.delete(`/master/tahun-ajaran/${item.id}`);
        }
    };

    const openEditModal = (item: TahunAjaran) => {
        setEditingTahun(item);
        editForm.setData({
            nama: item.nama,
            mulai: item.mulai,
            selesai: item.selesai,
            is_active: item.is_active,
        });
    };

    return (
        <>
            <Head title="Kelola Tahun Ajaran" />

            <div className="p-6 space-y-6">
                {/* Header Title */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-semibold text-text-primary">Tahun Ajaran</h1>
                        <p className="text-xs text-text-secondary mt-0.5">
                            Kelola periode akademik dan penanda tahun ajaran aktif di STAI Al-Yasini.
                        </p>
                    </div>

                    <Button
                        onClick={() => setIsCreateOpen(true)}
                        className="bg-brand-primary text-white hover:bg-brand-primary-dark text-xs font-semibold px-4 py-2 rounded-md flex items-center gap-1.5 self-start sm:self-auto"
                    >
                        <Plus className="size-4" />
                        Tambah Tahun Ajaran
                    </Button>
                </div>

                {/* Data Table */}
                <div className="rounded-lg border border-border-default bg-surface-card shadow-xs overflow-hidden">
                    {tahunAjarans.length === 0 ? (
                        <div className="p-12 text-center">
                            <Calendar className="mx-auto size-10 text-text-secondary/50 mb-3" />
                            <h3 className="text-sm font-semibold text-text-primary">Belum ada data tahun ajaran</h3>
                            <p className="text-xs text-text-secondary mt-1 mb-4">
                                Silakan tambahkan data tahun ajaran baru.
                            </p>
                            <Button
                                onClick={() => setIsCreateOpen(true)}
                                className="bg-brand-primary text-white hover:bg-brand-primary-dark text-xs font-semibold px-4 py-2 rounded-md inline-flex items-center gap-1.5"
                            >
                                <Plus className="size-4" />
                                Tambah Tahun Ajaran
                            </Button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="sticky top-0 bg-surface-base border-b border-border-default text-text-secondary font-semibold uppercase tracking-wider">
                                    <tr>
                                        <th className="py-3 px-4 w-12">No</th>
                                        <th className="py-3 px-4">Nama Tahun Ajaran</th>
                                        <th className="py-3 px-4 w-32">Tanggal Mulai</th>
                                        <th className="py-3 px-4 w-32">Tanggal Selesai</th>
                                        <th className="py-3 px-4 text-center w-32">Status Active</th>
                                        <th className="py-3 px-4 text-right w-28">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-default text-text-primary">
                                    {tahunAjarans.map((item, index) => (
                                        <tr key={item.id} className="even:bg-surface-base/50 hover:bg-surface-base transition-colors duration-150">
                                            <td className="py-3 px-4 text-text-secondary">{index + 1}</td>
                                            <td className="py-3 px-4 font-semibold">{item.nama}</td>
                                            <td className="py-3 px-4 font-medium">{formatDateIndonesian(item.mulai)}</td>
                                            <td className="py-3 px-4 font-medium">{formatDateIndonesian(item.selesai)}</td>

                                            <td className="py-3 px-4 text-center">
                                                {item.is_active ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-status-success/10 text-status-success border border-status-success/20">
                                                        <CheckCircle2 className="size-3" />
                                                        Aktif
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-surface-base text-text-secondary border border-border-default">
                                                        <XCircle className="size-3" />
                                                        Non-Aktif
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => openEditModal(item)}
                                                        className="p-1.5 rounded-md text-text-secondary hover:text-brand-primary hover:bg-surface-base transition-colors duration-150"
                                                        title="Edit Tahun Ajaran"
                                                    >
                                                        <Edit className="size-3.5" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(item)}
                                                        className="p-1.5 rounded-md text-text-secondary hover:text-status-danger hover:bg-surface-base transition-colors duration-150"
                                                        title="Hapus Tahun Ajaran"
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

            {/* Modal Tambah Tahun Ajaran */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="sm:max-w-md bg-surface-card border-border-default">
                    <DialogHeader>
                        <DialogTitle className="text-base font-semibold text-text-primary">Tambah Tahun Ajaran Baru</DialogTitle>
                        <DialogDescription className="text-xs text-text-secondary">
                            Isi tanggal periode akademik tahun ajaran.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleCreateSubmit} className="space-y-4 py-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="nama" className="text-xs font-semibold text-text-primary">
                                Nama Tahun Ajaran <span className="text-status-danger">*</span>
                            </Label>
                            <Input
                                id="nama"
                                placeholder="Misal: 2026/2027 Ganjil"
                                value={createForm.data.nama}
                                onChange={(e) => createForm.setData('nama', e.target.value)}
                                className="text-xs border-border-default focus-visible:ring-brand-primary"
                            />
                            {createForm.errors.nama && (
                                <p className="text-[11px] text-status-danger">{createForm.errors.nama}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label htmlFor="mulai" className="text-xs font-semibold text-text-primary">
                                    Tanggal Mulai <span className="text-status-danger">*</span>
                                </Label>
                                <Input
                                    id="mulai"
                                    type="date"
                                    value={createForm.data.mulai}
                                    onChange={(e) => createForm.setData('mulai', e.target.value)}
                                    className="text-xs border-border-default focus-visible:ring-brand-primary"
                                />
                                {createForm.errors.mulai && (
                                    <p className="text-[11px] text-status-danger">{createForm.errors.mulai}</p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="selesai" className="text-xs font-semibold text-text-primary">
                                    Tanggal Selesai <span className="text-status-danger">*</span>
                                </Label>
                                <Input
                                    id="selesai"
                                    type="date"
                                    value={createForm.data.selesai}
                                    onChange={(e) => createForm.setData('selesai', e.target.value)}
                                    className="text-xs border-border-default focus-visible:ring-brand-primary"
                                />
                                {createForm.errors.selesai && (
                                    <p className="text-[11px] text-status-danger">{createForm.errors.selesai}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                            <input
                                type="checkbox"
                                id="is_active"
                                checked={createForm.data.is_active}
                                onChange={(e) => createForm.setData('is_active', e.target.checked)}
                                className="rounded border-border-default text-brand-primary focus:ring-brand-primary"
                            />
                            <Label htmlFor="is_active" className="text-xs font-semibold text-text-primary cursor-pointer">
                                Set sebagai Tahun Ajaran Aktif
                            </Label>
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
                                {createForm.processing ? 'Menyimpan...' : 'Simpan Tahun Ajaran'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal Edit Tahun Ajaran */}
            <Dialog open={!!editingTahun} onOpenChange={(open) => !open && setEditingTahun(null)}>
                <DialogContent className="sm:max-w-md bg-surface-card border-border-default">
                    <DialogHeader>
                        <DialogTitle className="text-base font-semibold text-text-primary">Edit Tahun Ajaran</DialogTitle>
                        <DialogDescription className="text-xs text-text-secondary">
                            Perbarui informasi tahun ajaran.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleEditSubmit} className="space-y-4 py-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="edit_nama" className="text-xs font-semibold text-text-primary">
                                Nama Tahun Ajaran <span className="text-status-danger">*</span>
                            </Label>
                            <Input
                                id="edit_nama"
                                value={editForm.data.nama}
                                onChange={(e) => editForm.setData('nama', e.target.value)}
                                className="text-xs border-border-default focus-visible:ring-brand-primary"
                            />
                            {editForm.errors.nama && (
                                <p className="text-[11px] text-status-danger">{editForm.errors.nama}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label htmlFor="edit_mulai" className="text-xs font-semibold text-text-primary">
                                    Tanggal Mulai <span className="text-status-danger">*</span>
                                </Label>
                                <Input
                                    id="edit_mulai"
                                    type="date"
                                    value={editForm.data.mulai}
                                    onChange={(e) => editForm.setData('mulai', e.target.value)}
                                    className="text-xs border-border-default focus-visible:ring-brand-primary"
                                />
                                {editForm.errors.mulai && (
                                    <p className="text-[11px] text-status-danger">{editForm.errors.mulai}</p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="edit_selesai" className="text-xs font-semibold text-text-primary">
                                    Tanggal Selesai <span className="text-status-danger">*</span>
                                </Label>
                                <Input
                                    id="edit_selesai"
                                    type="date"
                                    value={editForm.data.selesai}
                                    onChange={(e) => editForm.setData('selesai', e.target.value)}
                                    className="text-xs border-border-default focus-visible:ring-brand-primary"
                                />
                                {editForm.errors.selesai && (
                                    <p className="text-[11px] text-status-danger">{editForm.errors.selesai}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                            <input
                                type="checkbox"
                                id="edit_is_active"
                                checked={editForm.data.is_active}
                                onChange={(e) => editForm.setData('is_active', e.target.checked)}
                                className="rounded border-border-default text-brand-primary focus:ring-brand-primary"
                            />
                            <Label htmlFor="edit_is_active" className="text-xs font-semibold text-text-primary cursor-pointer">
                                Set sebagai Tahun Ajaran Aktif
                            </Label>
                        </div>

                        <DialogFooter className="pt-2 gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setEditingTahun(null)}
                                className="border-border-default text-text-primary text-xs"
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={editForm.processing}
                                className="bg-brand-primary text-white hover:bg-brand-primary-dark text-xs font-semibold"
                            >
                                {editForm.processing ? 'Menyimpan...' : 'Perbarui Tahun Ajaran'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

TahunAjaranIndex.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Master Data',
            href: '#',
        },
        {
            title: 'Tahun Ajaran',
            href: '/master/tahun-ajaran',
        },
    ],
};
