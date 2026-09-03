import { Head, Link, router, useForm } from '@inertiajs/react';
import { Calendar, CheckCircle2, Edit, Plus, Trash2, XCircle, Search, Clock, ShieldAlert } from 'lucide-react';
import { useState } from 'react';
import { useConfirmDialog } from '@/components/confirm-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
    krs_mulai?: string | null;
    krs_selesai?: string | null;
    krs_batal_tambah_mulai?: string | null;
    krs_batal_tambah_selesai?: string | null;
    penilaian_mulai?: string | null;
    penilaian_selesai?: string | null;
    pembayaran_mulai?: string | null;
    pembayaran_selesai?: string | null;
    uts_mulai?: string | null;
    uts_selesai?: string | null;
    uas_mulai?: string | null;
    uas_selesai?: string | null;
};

interface Props {
    tahunAjarans: TahunAjaran[];
    filters?: {
        search?: string;
        status?: string;
    };
}

export default function TahunAjaranIndex({ tahunAjarans = [], filters = { search: '', status: 'all' } }: Props) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingTahun, setEditingTahun] = useState<TahunAjaran | null>(null);
    const [searchQuery, setSearchQuery] = useState(filters.search || '');

    const form = useForm({
        nama: '',
        mulai: '',
        selesai: '',
        is_active: false,
        krs_mulai: '',
        krs_selesai: '',
        krs_batal_tambah_mulai: '',
        krs_batal_tambah_selesai: '',
        penilaian_mulai: '',
        penilaian_selesai: '',
        pembayaran_mulai: '',
        pembayaran_selesai: '',
        uts_mulai: '',
        uts_selesai: '',
        uas_mulai: '',
        uas_selesai: '',
    });

    const openCreateModal = () => {
        form.reset();
        setEditingTahun(null);
        setIsCreateOpen(true);
    };

    const openEditModal = (item: TahunAjaran) => {
        setEditingTahun(item);
        form.setData({
            nama: item.nama,
            mulai: item.mulai,
            selesai: item.selesai,
            is_active: item.is_active,
            krs_mulai: item.krs_mulai || '',
            krs_selesai: item.krs_selesai || '',
            krs_batal_tambah_mulai: item.krs_batal_tambah_mulai || '',
            krs_batal_tambah_selesai: item.krs_batal_tambah_selesai || '',
            penilaian_mulai: item.penilaian_mulai || '',
            penilaian_selesai: item.penilaian_selesai || '',
            pembayaran_mulai: item.pembayaran_mulai || '',
            pembayaran_selesai: item.pembayaran_selesai || '',
            uts_mulai: item.uts_mulai || '',
            uts_selesai: item.uts_selesai || '',
            uas_mulai: item.uas_mulai || '',
            uas_selesai: item.uas_selesai || '',
        });
        setIsCreateOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingTahun) {
            form.put(`/master/tahun-ajaran/${editingTahun.id}`, {
                onSuccess: () => {
                    setIsCreateOpen(false);
                    setEditingTahun(null);
                },
            });
        } else {
            form.post('/master/tahun-ajaran', {
                onSuccess: () => {
                    setIsCreateOpen(false);
                    form.reset();
                },
            });
        }
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/master/tahun-ajaran', {
            search: searchQuery,
            status: filters.status,
        }, { preserveState: true });
    };

    const { confirm, confirmDialog } = useConfirmDialog();

    const handleDelete = (item: TahunAjaran) => {
        confirm({
            title: 'Hapus Tahun Ajaran',
            description: `Apakah Anda yakin ingin menghapus tahun ajaran "${item.nama}"? Pastikan tidak ada kurikulum aktif, KRS, atau kelas kuliah yang terkait dengan tahun ajaran ini.`,
            variant: 'destructive',
            confirmText: 'Ya, Hapus',
            onConfirm: () => {
                router.delete(`/master/tahun-ajaran/${item.id}`);
            },
        });
    };

    return (
        <>
            {confirmDialog}
            <Head title="Kelola Tahun Ajaran & Periode Akademik" />

            <div className="p-4 sm:p-6 lg:p-8 space-y-6 font-sans max-w-7xl mx-auto">
                {/* Header Title */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 shrink-0">
                            <Calendar className="size-6 sm:size-7" />
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                                Tahun Ajaran & Periode Akademik
                            </h1>
                            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                                Kelola jadwal semester global, jendela waktu pembukaan KRS Online, masa input nilai dosen, dan periode pembayaran.
                            </p>
                        </div>
                    </div>

                    <Button
                        onClick={openCreateModal}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-xs transition self-start sm:self-auto"
                    >
                        <Plus className="size-4" />
                        <span>Tambah Tahun Ajaran</span>
                    </Button>
                </div>

                {/* Sub-nav Tabs */}
                <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto whitespace-nowrap text-xs font-medium">
                    <Link
                        href="/master/perguruan-tinggi"
                        className="px-3.5 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                    >
                        Perguruan Tinggi
                    </Link>
                    <Link
                        href="/master/fakultas"
                        className="px-3.5 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                    >
                        Fakultas
                    </Link>
                    <Link
                        href="/master/program-studi"
                        className="px-3.5 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                    >
                        Program Studi
                    </Link>
                    <Link
                        href="/master/tahun-ajaran"
                        className="px-3.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200 shadow-2xs"
                    >
                        Tahun Ajaran & Periode
                    </Link>
                    <Link
                        href="/master/ruang-kuliah"
                        className="px-3.5 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                    >
                        Ruang Kuliah
                    </Link>
                </div>

                {/* Search & Filter Toolbar */}
                <Card className="border border-slate-200 rounded-xl shadow-xs bg-white">
                    <CardContent className="p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 flex-1 max-w-md">
                            <div className="relative flex-1">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
                                <Input
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Cari tahun ajaran (e.g. 2026/2027 Ganjil)..."
                                    className="pl-8 text-xs h-8 bg-slate-50 border-slate-200"
                                />
                            </div>
                            <Button type="submit" size="sm" variant="outline" className="h-8 text-xs border-slate-200">
                                Cari
                            </Button>
                        </form>

                        <div className="flex items-center gap-1.5 self-start sm:self-auto">
                            {['all', 'active', 'inactive'].map((st) => (
                                <Link
                                    key={st}
                                    href={`/master/tahun-ajaran?status=${st}&search=${searchQuery}`}
                                    className={`px-3 py-1 rounded-md text-xs capitalize ${
                                        (filters.status || 'all') === st
                                            ? 'bg-emerald-600 text-white font-medium shadow-2xs'
                                            : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                                    }`}
                                >
                                    {st === 'all' ? 'Semua Status' : st === 'active' ? 'Aktif' : 'Nonaktif'}
                                </Link>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Table Container */}
                <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs border-t-2 border-t-emerald-600">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider">
                                    <th className="p-3">Nama Tahun Ajaran</th>
                                    <th className="p-3">Durasi Semester</th>
                                    <th className="p-3">Jendela KRS Online</th>
                                    <th className="p-3">Masa Input Nilai Dosen</th>
                                    <th className="p-3">Masa Pembayaran/Her-Reg</th>
                                    <th className="p-3 text-center w-24">Status</th>
                                    <th className="p-3 text-center w-24">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-default">
                                {tahunAjarans.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="p-8 text-center text-text-secondary italic">
                                            Belum ada data tahun ajaran yang sesuai dengan pencarian.
                                        </td>
                                    </tr>
                                ) : (
                                    tahunAjarans.map((item) => (
                                        <tr key={item.id} className="hover:bg-surface-hover transition-colors">
                                            <td className="p-3 font-semibold text-text-primary">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="size-4 text-brand-primary shrink-0" />
                                                    <span>{item.nama}</span>
                                                </div>
                                            </td>
                                            <td className="p-3 text-text-secondary">
                                                {formatDateIndonesian(item.mulai)} &ndash; {formatDateIndonesian(item.selesai)}
                                            </td>
                                            <td className="p-3">
                                                {item.krs_mulai && item.krs_selesai ? (
                                                    <span className="text-text-primary font-medium block">
                                                        {new Date(item.krs_mulai).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} &ndash; {new Date(item.krs_selesai).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </span>
                                                ) : (
                                                    <span className="text-text-secondary italic text-[11px]">Belum diatur</span>
                                                )}
                                            </td>
                                            <td className="p-3">
                                                {item.penilaian_mulai && item.penilaian_selesai ? (
                                                    <span className="text-text-primary font-medium block">
                                                        {new Date(item.penilaian_mulai).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} &ndash; {new Date(item.penilaian_selesai).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </span>
                                                ) : (
                                                    <span className="text-text-secondary italic text-[11px]">Belum diatur</span>
                                                )}
                                            </td>
                                            <td className="p-3">
                                                {item.pembayaran_mulai && item.pembayaran_selesai ? (
                                                    <span className="text-text-primary font-medium block">
                                                        {new Date(item.pembayaran_mulai).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} &ndash; {new Date(item.pembayaran_selesai).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </span>
                                                ) : (
                                                    <span className="text-text-secondary italic text-[11px]">Belum diatur</span>
                                                )}
                                            </td>
                                            <td className="p-3 text-center">
                                                {item.is_active ? (
                                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                                        Aktif
                                                    </span>
                                                ) : (
                                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
                                                        Nonaktif
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-3 text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <Button
                                                        onClick={() => openEditModal(item)}
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-7 w-7 p-0 text-text-secondary hover:text-brand-primary"
                                                    >
                                                        <Edit className="size-3.5" />
                                                    </Button>
                                                    <Button
                                                        onClick={() => handleDelete(item)}
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-7 w-7 p-0 text-text-secondary hover:text-red-600"
                                                    >
                                                        <Trash2 className="size-3.5" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Create/Edit Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingTahun ? 'Edit Tahun Ajaran & Periode' : 'Tambah Tahun Ajaran Baru'}</DialogTitle>
                        <DialogDescription>
                            Atur nama semester, durasi kalender, dan rentang tanggal buka-tutup KRS serta pengisian nilai.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                        <div className="space-y-1">
                            <Label className="text-xs">Nama Semester / Tahun Ajaran</Label>
                            <Input
                                value={form.data.nama}
                                onChange={(e) => form.setData('nama', e.target.value)}
                                placeholder="e.g. 2026/2027 Ganjil"
                                className="h-8 text-xs"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label className="text-xs">Tanggal Mulai Semester</Label>
                                <Input
                                    type="date"
                                    value={form.data.mulai}
                                    onChange={(e) => form.setData('mulai', e.target.value)}
                                    className="h-8 text-xs"
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">Tanggal Selesai Semester</Label>
                                <Input
                                    type="date"
                                    value={form.data.selesai}
                                    onChange={(e) => form.setData('selesai', e.target.value)}
                                    className="h-8 text-xs"
                                    required
                                />
                            </div>
                        </div>

                        {/* Academic Windows */}
                        <div className="pt-2 border-t border-border-default">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-primary mb-3">
                                Jendela Waktu Aktivitas Akademik Global
                            </h4>

                            <div className="space-y-3">
                                <div>
                                    <Label className="text-xs font-medium text-text-primary block mb-1">
                                        1. Masa Pembukaan KRS Online Mahasiswa:
                                    </Label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <Input
                                            type="date"
                                            value={form.data.krs_mulai}
                                            onChange={(e) => form.setData('krs_mulai', e.target.value)}
                                            className="h-8 text-xs"
                                        />
                                        <Input
                                            type="date"
                                            value={form.data.krs_selesai}
                                            onChange={(e) => form.setData('krs_selesai', e.target.value)}
                                            className="h-8 text-xs"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label className="text-xs font-medium text-text-primary block mb-1">
                                        2. Masa Input / Unggah Nilai Dosen:
                                    </Label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <Input
                                            type="date"
                                            value={form.data.penilaian_mulai}
                                            onChange={(e) => form.setData('penilaian_mulai', e.target.value)}
                                            className="h-8 text-xs"
                                        />
                                        <Input
                                            type="date"
                                            value={form.data.penilaian_selesai}
                                            onChange={(e) => form.setData('penilaian_selesai', e.target.value)}
                                            className="h-8 text-xs"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label className="text-xs font-medium text-text-primary block mb-1">
                                        3. Masa Pembayaran SPP / Her-Registrasi:
                                    </Label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <Input
                                            type="date"
                                            value={form.data.pembayaran_mulai}
                                            onChange={(e) => form.setData('pembayaran_mulai', e.target.value)}
                                            className="h-8 text-xs"
                                        />
                                        <Input
                                            type="date"
                                            value={form.data.pembayaran_selesai}
                                            onChange={(e) => form.setData('pembayaran_selesai', e.target.value)}
                                            className="h-8 text-xs"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2 border-t border-border-default">
                            <input
                                type="checkbox"
                                id="is_active_check"
                                checked={form.data.is_active}
                                onChange={(e) => form.setData('is_active', e.target.checked)}
                                className="rounded text-brand-primary focus:ring-brand-primary"
                            />
                            <Label htmlFor="is_active_check" className="text-xs cursor-pointer font-medium">
                                Jadikan tahun ajaran ini sebagai semester aktif utama
                            </Label>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" size="sm" onClick={() => setIsCreateOpen(false)}>
                                Batal
                            </Button>
                            <Button type="submit" size="sm" disabled={form.processing} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
                                {form.processing ? 'Menyimpan...' : 'Simpan Pengaturan'}
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
        { title: 'Beranda', href: '/dashboard' },
        { title: 'Data Pelengkap', href: '/master/tahun-ajaran' },
        { title: 'Tahun Ajaran & Periode', href: '/master/tahun-ajaran' },
    ],
};

