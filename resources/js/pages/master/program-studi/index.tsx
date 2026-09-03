import { Head, Link, router, useForm } from '@inertiajs/react';
import { Building2, Edit, Plus, Trash2, Eye, Award, CheckCircle, GraduationCap } from 'lucide-react';
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

type Fakultas = {
    id: number;
    kode: string;
    nama: string;
};

type ProgramStudi = {
    id: number;
    fakultas_id: number;
    kode: string;
    nama: string;
    nama_singkat?: string | null;
    jenjang: string;
    gelar_singkat?: string | null;
    status: string;
    status_spmb: string;
    akreditasi?: string | null;
    ketua_prodi_nama?: string | null;
    fakultas?: Fakultas;
    konsentrasis_count?: number;
    mahasiswas_count?: number;
};

export default function ProgramStudiIndex({
    programStudis = [],
    fakultas = [],
}: {
    programStudis: ProgramStudi[];
    fakultas: Fakultas[];
}) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const createForm = useForm({
        fakultas_id: fakultas[0]?.id || '',
        kode: '',
        nama: '',
        nama_en: '',
        nama_singkat: '',
        jenjang: 'S1',
        periode_berdiri: '',
        gelar: 'Sarjana Pendidikan',
        gelar_singkat: 'S.Pd.',
        gelar_en: 'Bachelor of Education',
        gelar_singkat_en: 'B.Ed.',
        status: 'aktif',
        status_spmb: 'aktif',
        terdaftar_lptk: false,
        ketua_prodi_nama: '',
        ketua_prodi_nidn: '',
        sekretaris_prodi_nama: '',
        sks_lulus_min: 144,
        ipk_lulus_min: 2.00,
        tugas_akhir_syarat: true,
        jenis_tugas_akhir: 'Skripsi',
        pengaturan_transfer_nilai: 'Masuk Transkrip Akademik',
        max_dosen_pembimbing: 2,
        max_dosen_penguji: 2,
        periode_hitung_ips: 'Periode terakhir mahasiswa aktif',
        lembaga_akreditasi: 'LAMDIK',
        akreditasi: 'Baik Sekali',
        nilai_akreditasi: '',
        no_sk_akreditasi: '',
        tanggal_sk_akreditasi: '',
        tanggal_berlaku_akreditasi: '',
        tanggal_berakhir_akreditasi: '',
        alamat: '',
        telepon: '',
        email: '',
        website: '',
    });

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/master/program-studi', {
            onSuccess: () => {
                setIsCreateOpen(false);
                createForm.reset();
            },
        });
    };

    const { confirm, confirmDialog } = useConfirmDialog();

    const handleDelete = (item: ProgramStudi) => {
        confirm({
            title: 'Hapus Program Studi',
            description: `Apakah Anda yakin ingin menghapus Program Studi "${item.nama}" (${item.jenjang} - ${item.kode})? Data yang terkait dengan prodi ini akan terpengaruh.`,
            variant: 'destructive',
            confirmText: 'Ya, Hapus',
            onConfirm: () => {
                router.delete(`/master/program-studi/${item.id}`);
            },
        });
    };

    return (
        <>
            {confirmDialog}
            <Head title="Kelola Program Studi" />

            <div className="p-4 sm:p-6 lg:p-8 space-y-6 font-sans max-w-7xl mx-auto">
                {/* Header Title */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 shrink-0">
                            <GraduationCap className="size-6 sm:size-7" />
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                                Program Studi
                            </h1>
                            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                                Kelola program studi, akreditasi (LAM/BAN-PT), gelar, dan informasi akademik di STAI Al-Yasini.
                            </p>
                        </div>
                    </div>

                    <Button
                        onClick={() => setIsCreateOpen(true)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-xs transition self-start sm:self-auto"
                    >
                        <Plus className="size-4" />
                        <span>Tambah Program Studi</span>
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
                        className="px-3.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200 shadow-2xs"
                    >
                        Program Studi
                    </Link>
                    <Link
                        href="/master/tahun-ajaran"
                        className="px-3.5 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
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

                {/* Table Container */}
                <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs border-t-2 border-t-emerald-600">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider">
                                    <th className="p-3 w-16 text-center">Kode</th>
                                    <th className="p-3">Program Studi</th>
                                    <th className="p-3">Fakultas</th>
                                    <th className="p-3 text-center w-24">Jenjang & Gelar</th>
                                    <th className="p-3">Akreditasi</th>
                                    <th className="p-3">Ketua Prodi</th>
                                    <th className="p-3 text-center w-20">Status</th>
                                    <th className="p-3 text-center w-24">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-default">
                                {programStudis.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="p-8 text-center text-text-secondary italic">
                                            Belum ada data program studi. Klik "Tambah Program Studi" untuk membuat data baru.
                                        </td>
                                    </tr>
                                ) : (
                                    programStudis.map((item) => (
                                        <tr key={item.id} className="hover:bg-surface-hover transition-colors">
                                            <td className="p-3 text-center font-mono font-semibold text-text-primary">
                                                {item.kode}
                                            </td>
                                            <td className="p-3">
                                                <Link
                                                    href={`/master/program-studi/${item.id}`}
                                                    className="font-semibold text-brand-primary hover:underline block"
                                                >
                                                    {item.nama}
                                                </Link>
                                                {item.nama_singkat && (
                                                    <span className="text-[11px] text-text-secondary block">
                                                        {item.nama_singkat}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-3 text-text-primary">
                                                {item.fakultas?.nama || '-'}
                                            </td>
                                            <td className="p-3 text-center font-medium text-text-primary">
                                                <span className="px-1.5 py-0.5 rounded bg-surface-base border border-border-default text-[10px] font-bold mr-1">
                                                    {item.jenjang}
                                                </span>
                                                <span className="text-text-secondary text-[11px] font-mono">
                                                    {item.gelar_singkat || '-'}
                                                </span>
                                            </td>
                                            <td className="p-3">
                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 flex items-center gap-1 w-fit">
                                                    <Award className="size-3" />
                                                    <span>{item.akreditasi || 'Baik Sekali'}</span>
                                                </span>
                                            </td>
                                            <td className="p-3 text-text-primary">
                                                {item.ketua_prodi_nama || <span className="text-text-secondary italic">-</span>}
                                            </td>
                                            <td className="p-3 text-center">
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${
                                                    item.status === 'aktif'
                                                        ? 'bg-emerald-100 text-emerald-800'
                                                        : 'bg-slate-100 text-slate-600'
                                                }`}>
                                                    {item.status || 'aktif'}
                                                </span>
                                            </td>
                                            <td className="p-3 text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <Link href={`/master/program-studi/${item.id}`}>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="h-7 w-7 p-0 text-text-secondary hover:text-brand-primary"
                                                            title="Lihat Detail Lengkap"
                                                        >
                                                            <Eye className="size-3.5" />
                                                        </Button>
                                                    </Link>
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

            {/* Create Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Tambah Program Studi Baru</DialogTitle>
                        <DialogDescription>
                            Isi informasi dasar program studi. Anda dapat melengkapi detail akreditasi dan pengaturan akademik lengkap setelah data dibuat.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleCreateSubmit} className="space-y-4 pt-2">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="space-y-1">
                                <Label className="text-xs">Fakultas</Label>
                                <select
                                    value={createForm.data.fakultas_id}
                                    onChange={(e) => createForm.setData('fakultas_id', Number(e.target.value))}
                                    className="w-full h-8 text-xs border border-border-default rounded-md px-2 bg-surface-base"
                                    required
                                >
                                    {fakultas.map((f) => (
                                        <option key={f.id} value={f.id}>{f.nama}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">Kode Prodi</Label>
                                <Input
                                    value={createForm.data.kode}
                                    onChange={(e) => createForm.setData('kode', e.target.value.toUpperCase())}
                                    placeholder="e.g. 86231"
                                    className="h-8 text-xs font-mono"
                                    required
                                />
                                {createForm.errors.kode && <p className="text-[11px] text-red-600">{createForm.errors.kode}</p>}
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">Jenjang</Label>
                                <select
                                    value={createForm.data.jenjang}
                                    onChange={(e) => createForm.setData('jenjang', e.target.value)}
                                    className="w-full h-8 text-xs border border-border-default rounded-md px-2 bg-surface-base"
                                >
                                    <option value="D3">D3 - Diploma</option>
                                    <option value="S1">S1 - Sarjana</option>
                                    <option value="S2">S2 - Magister</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label className="text-xs">Nama Program Studi (ID)</Label>
                                <Input
                                    value={createForm.data.nama}
                                    onChange={(e) => createForm.setData('nama', e.target.value)}
                                    placeholder="e.g. Manajemen Pendidikan Islam"
                                    className="h-8 text-xs"
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">Nama Singkat</Label>
                                <Input
                                    value={createForm.data.nama_singkat}
                                    onChange={(e) => createForm.setData('nama_singkat', e.target.value)}
                                    placeholder="e.g. MPI"
                                    className="h-8 text-xs"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label className="text-xs">Gelar Lengkap</Label>
                                <Input
                                    value={createForm.data.gelar}
                                    onChange={(e) => createForm.setData('gelar', e.target.value)}
                                    placeholder="e.g. Sarjana Pendidikan"
                                    className="h-8 text-xs"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">Gelar Singkat</Label>
                                <Input
                                    value={createForm.data.gelar_singkat}
                                    onChange={(e) => createForm.setData('gelar_singkat', e.target.value)}
                                    placeholder="e.g. S.Pd."
                                    className="h-8 text-xs"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label className="text-xs">Ketua Program Studi (Kaprodi)</Label>
                                <Input
                                    value={createForm.data.ketua_prodi_nama}
                                    onChange={(e) => createForm.setData('ketua_prodi_nama', e.target.value)}
                                    placeholder="e.g. Dr. H. Ja'far, M.Pd.I"
                                    className="h-8 text-xs"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">Lembaga & Peringkat Akreditasi</Label>
                                <Input
                                    value={createForm.data.akreditasi}
                                    onChange={(e) => createForm.setData('akreditasi', e.target.value)}
                                    placeholder="e.g. Baik Sekali (LAMDIK)"
                                    className="h-8 text-xs"
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" size="sm" onClick={() => setIsCreateOpen(false)}>
                                Batal
                            </Button>
                            <Button type="submit" size="sm" disabled={createForm.processing} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
                                {createForm.processing ? 'Menyimpan...' : 'Simpan & Lanjutkan'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

ProgramStudiIndex.layout = {
    breadcrumbs: [
        { title: 'Beranda', href: '/dashboard' },
        { title: 'Data Pelengkap', href: '/master/program-studi' },
        { title: 'Program Studi', href: '/master/program-studi' },
    ],
};

