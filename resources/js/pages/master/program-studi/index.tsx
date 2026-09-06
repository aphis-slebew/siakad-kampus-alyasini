import { Head, Link, router, useForm } from '@inertiajs/react';
import { Plus, Trash2, Eye, Award, GraduationCap, UserCheck, Layers } from 'lucide-react';
import { useState } from 'react';
import { useConfirmDialog } from '@/components/confirm-dialog';
import { MasterDataNav } from '@/components/master-data-nav';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

type DosenOption = {
    id: number;
    nama_lengkap: string;
    nidn: string | null;
    gelar_depan?: string | null;
    gelar_belakang?: string | null;
    niy_nip?: string | null;
    nama_bergelar?: string;
};

export default function ProgramStudiIndex({
    programStudis = [],
    fakultas = [],
    dosens = [],
}: {
    programStudis: ProgramStudi[];
    fakultas: Fakultas[];
    dosens?: DosenOption[];
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
                {/* Clean Dropdown Breadcrumb Nav */}
                <MasterDataNav currentHref="/master/program-studi" />

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
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-xs transition self-start sm:self-auto cursor-pointer"
                    >
                        <Plus className="size-4" />
                        <span>Tambah Program Studi</span>
                    </Button>
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
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    {item.nama_singkat && (
                                                        <span className="text-[11px] text-text-secondary">
                                                            {item.nama_singkat}
                                                        </span>
                                                    )}
                                                    {Boolean(item.konsentrasis_count && item.konsentrasis_count > 0) && (
                                                        <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 text-[10px] font-semibold border border-emerald-200">
                                                            <Layers className="size-2.5" />
                                                            <span>{item.konsentrasis_count} Konsentrasi</span>
                                                        </span>
                                                    )}
                                                </div>
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

                        {/* Dosen Picker for Kaprodi */}
                        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700/60 space-y-2">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                                    <UserCheck className="size-3.5 text-emerald-600" />
                                    <span>Pilih Ketua Program Studi (Kaprodi) dari Data Dosen</span>
                                </Label>
                                <span className="text-[10px] uppercase tracking-wider font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Snapshot Reference</span>
                            </div>
                            <Select
                                onValueChange={(val) => {
                                    const selected = dosens.find((d) => String(d.id) === val);

                                    if (selected) {
                                        createForm.setData((prev) => ({
                                            ...prev,
                                            ketua_prodi_nama: selected.nama_bergelar || selected.nama_lengkap,
                                            ketua_prodi_nidn: selected.nidn || selected.niy_nip || '',
                                        }));
                                    }
                                }}
                            >
                                <SelectTrigger className="h-8 text-xs bg-white dark:bg-slate-900">
                                    <SelectValue placeholder="-- Pilih Dosen untuk Kaprodi --" />
                                </SelectTrigger>
                                <SelectContent>
                                    {dosens.map((d) => (
                                        <SelectItem key={d.id} value={String(d.id)} className="text-xs">
                                            <span className="font-mono text-muted-foreground mr-1.5">[{d.nidn || d.niy_nip || 'Tanpa NIDN'}]</span>
                                            <span className="font-medium">{d.nama_bergelar || d.nama_lengkap}</span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-[11px] text-muted-foreground">
                                Memilih dosen akan otomatis mengisi kolom Nama Bergelar dan NIDN Kaprodi di bawah.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label className="text-xs">Ketua Program Studi (Nama & Gelar)</Label>
                                <Input
                                    value={createForm.data.ketua_prodi_nama}
                                    onChange={(e) => createForm.setData('ketua_prodi_nama', e.target.value)}
                                    placeholder="e.g. Dr. H. Ja'far, M.Pd.I"
                                    className="h-8 text-xs"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">NIDN Ketua Prodi</Label>
                                <Input
                                    value={createForm.data.ketua_prodi_nidn}
                                    onChange={(e) => createForm.setData('ketua_prodi_nidn', e.target.value)}
                                    placeholder="e.g. 2108098201"
                                    className="h-8 text-xs font-mono"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                    <Label className="text-xs">Sekretaris Program Studi (Sekprodi)</Label>
                                    <Select
                                        onValueChange={(val) => {
                                            const selected = dosens.find((d) => String(d.id) === val);

                                            if (selected) {
                                                const name = selected.nama_bergelar || selected.nama_lengkap;
                                                createForm.setData('sekretaris_prodi_nama', name);
                                            }
                                        }}
                                    >
                                        <SelectTrigger className="h-6 text-[11px] px-2 py-0 border-dashed text-emerald-700 bg-emerald-50/50 hover:bg-emerald-100/50 border-emerald-300 w-auto gap-1">
                                            <span className="text-[11px]">Pilih Dosen</span>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {dosens.map((d) => (
                                                <SelectItem key={d.id} value={String(d.id)} className="text-xs">
                                                    <span className="font-mono text-muted-foreground mr-1.5">[{d.nidn || d.niy_nip || '-'}]</span>
                                                    <span>{d.nama_bergelar || d.nama_lengkap}</span>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Input
                                    value={createForm.data.sekretaris_prodi_nama}
                                    onChange={(e) => createForm.setData('sekretaris_prodi_nama', e.target.value)}
                                    placeholder="e.g. Nur Kholis, M.Pd"
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

