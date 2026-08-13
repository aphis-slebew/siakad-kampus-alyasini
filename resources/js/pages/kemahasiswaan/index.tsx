import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Award, AlertTriangle, Gift, CheckCircle, Plus } from 'lucide-react';
import { formatDateIndonesian } from '@/lib/utils';


type Referensi = { id: number; nama: string };
type Mahasiswa = { id: number; nim: string; nama_lengkap: string; program_studi?: { nama: string } };

type Aktivitas = {
    id: number;
    nama_kegiatan: string;
    divalidasi: boolean;
    jenis_aktivitas?: Referensi;
    mahasiswa?: Mahasiswa;
};

type Pelanggaran = {
    id: number;
    tanggal: string;
    jenis_pelanggaran?: Referensi;
    sanksi?: Referensi;
    mahasiswa?: Mahasiswa;
};

type Beasiswa = {
    id: number;
    status: string;
    jenis_beasiswa?: Referensi;
    mahasiswa?: Mahasiswa;
};

export default function KemahasiswaanIndexPage({
    activeTab,
    aktivitases,
    pelanggarans,
    beasiswas,
    jenisAktivitases,
    jenisPelanggarans,
    sanksis,
    jenisBeasiswas,
    mahasiswas,
    role,
    errors,
}: {
    activeTab: 'aktivitas' | 'pelanggaran' | 'beasiswa';
    aktivitases?: Aktivitas[];
    pelanggarans?: Pelanggaran[];
    beasiswas?: Beasiswa[];
    jenisAktivitases?: Referensi[];
    jenisPelanggarans?: Referensi[];
    sanksis?: Referensi[];
    jenisBeasiswas?: Referensi[];
    mahasiswas?: Mahasiswa[];
    role: string;
    errors?: Record<string, string>;
}) {
    const aktivitasForm = useForm({
        nama_kegiatan: '',
        jenis_aktivitas_id: '',
    });

    const pelanggaranForm = useForm({
        mahasiswa_id: '',
        jenis_pelanggaran_id: '',
        sanksi_id: '',
        tanggal: new Date().toISOString().split('T')[0],
    });

    const beasiswaForm = useForm({
        jenis_beasiswa_id: '',
    });

    const handleAddAktivitas: FormEventHandler = (e) => {
        e.preventDefault();
        aktivitasForm.post('/kemahasiswaan/aktivitas', { onSuccess: () => aktivitasForm.reset() });
    };

    const handleValidateAktivitas = (id: number) => {
        useForm({}).post(`/kemahasiswaan/aktivitas/${id}/validate`);
    };

    const handleAddPelanggaran: FormEventHandler = (e) => {
        e.preventDefault();
        pelanggaranForm.post('/kemahasiswaan/pelanggaran', { onSuccess: () => pelanggaranForm.reset() });
    };

    const handleAddBeasiswa: FormEventHandler = (e) => {
        e.preventDefault();
        beasiswaForm.post('/kemahasiswaan/beasiswa', { onSuccess: () => beasiswaForm.reset() });
    };

    const handleApproveBeasiswa = (id: number, status: 'diterima' | 'ditolak') => {
        useForm({ status }).post(`/kemahasiswaan/beasiswa/${id}/approve`);
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }, { title: 'Kemahasiswaan', href: '/kemahasiswaan/aktivitas' }]}>
            <Head title="Layanan & Catatan Kemahasiswaan" />

            <div className="space-y-6 p-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground-default">Portofolio & Layanan Kemahasiswaan</h1>
                    <p className="text-sm text-foreground-muted">Pencatatan aktivitas ekstrakurikuler, beasiswa, dan catatan kedisiplinan mahasiswa.</p>
                </div>

                {/* Tab Navigation */}
                <div className="flex border-b space-x-6 text-sm font-medium">
                    <a
                        href="/kemahasiswaan/aktivitas"
                        className={`pb-3 border-b-2 flex items-center gap-2 ${activeTab === 'aktivitas' ? 'border-primary text-primary font-bold' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                    >
                        <Award className="h-4 w-4" /> Aktivitas & Prestasi
                    </a>
                    <a
                        href="/kemahasiswaan/pelanggaran"
                        className={`pb-3 border-b-2 flex items-center gap-2 ${activeTab === 'pelanggaran' ? 'border-primary text-primary font-bold' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                    >
                        <AlertTriangle className="h-4 w-4" /> Catatan Pelanggaran
                    </a>
                    <a
                        href="/kemahasiswaan/beasiswa"
                        className={`pb-3 border-b-2 flex items-center gap-2 ${activeTab === 'beasiswa' ? 'border-primary text-primary font-bold' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                    >
                        <Gift className="h-4 w-4" /> Beasiswa Mahasiswa
                    </a>
                </div>

                {/* TAB 1: AKTIVITAS */}
                {activeTab === 'aktivitas' && (
                    <div className="grid gap-6 md:grid-cols-3">
                        {role === 'mahasiswa' && (
                            <Card className="md:col-span-1">
                                <CardHeader>
                                    <CardTitle>Ajukan Aktivitas / Prestasi</CardTitle>
                                    <CardDescription>Input kegiatan Ormawa atau prestasi non-akademik.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleAddAktivitas} className="space-y-4">
                                        <div>
                                            <Label htmlFor="nama_kegiatan">Nama Kegiatan / Prestasi *</Label>
                                            <Input
                                                id="nama_kegiatan"
                                                value={aktivitasForm.data.nama_kegiatan}
                                                onChange={(e) => aktivitasForm.setData('nama_kegiatan', e.target.value)}
                                                placeholder="Contoh: Juara 1 Lomba MTQ Tingkat Provinsi"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="jenis_aktivitas_id">Jenis Aktivitas</Label>
                                            <select
                                                id="jenis_aktivitas_id"
                                                value={aktivitasForm.data.jenis_aktivitas_id}
                                                onChange={(e) => aktivitasForm.setData('jenis_aktivitas_id', e.target.value)}
                                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                            >
                                                <option value="">-- Pilih Jenis --</option>
                                                {jenisAktivitases?.map(j => <option key={j.id} value={j.id}>{j.nama}</option>)}
                                            </select>
                                        </div>
                                        <Button type="submit" disabled={aktivitasForm.processing} className="w-full">
                                            Kirim Pengajuan Aktivitas
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        )}

                        <Card className={role === 'mahasiswa' ? 'md:col-span-2' : 'md:col-span-3'}>
                            <CardHeader>
                                <CardTitle>Daftar Aktivitas Mahasiswa</CardTitle>
                                <CardDescription>Riwayat portofolio kegiatan ekstrakurikuler yang telah diajukan.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm min-w-[700px]">
                                        <thead className="border-b bg-muted/50 text-xs font-semibold uppercase text-muted-foreground">
                                            <tr>
                                                <th className="p-3">Nama Kegiatan</th>
                                                {role !== 'mahasiswa' && <th className="p-3">Mahasiswa</th>}
                                                <th className="p-3">Jenis</th>
                                                <th className="p-3 whitespace-nowrap">Status Validasi</th>
                                                {role !== 'mahasiswa' && <th className="p-3 text-right whitespace-nowrap">Aksi</th>}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {(!aktivitases || aktivitases.length === 0) ? (
                                                <tr><td colSpan={5} className="p-4 text-center text-xs text-muted-foreground">Belum ada data aktivitas.</td></tr>
                                            ) : (
                                                aktivitases.map(a => (
                                                    <tr key={a.id} className="hover:bg-muted/20">
                                                        <td className="p-3 font-medium">{a.nama_kegiatan}</td>
                                                        {role !== 'mahasiswa' && <td className="p-3">{a.mahasiswa?.nama_lengkap} ({a.mahasiswa?.nim})</td>}
                                                        <td className="p-3">{a.jenis_aktivitas?.nama || '-'}</td>
                                                        <td className="p-3 whitespace-nowrap">
                                                            {a.divalidasi ? <Badge className="bg-emerald-600 whitespace-nowrap">Tervalidasi</Badge> : <Badge variant="outline" className="whitespace-nowrap">Menunggu</Badge>}
                                                        </td>
                                                        {role !== 'mahasiswa' && (
                                                            <td className="p-3 text-right whitespace-nowrap">

                                                                {!a.divalidasi && (
                                                                    <Button size="sm" onClick={() => handleValidateAktivitas(a.id)}>Validasi</Button>
                                                                )}
                                                            </td>
                                                        )}
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* TAB 2: PELANGGARAN */}
                {activeTab === 'pelanggaran' && (
                    <div className="grid gap-6 md:grid-cols-3">
                        {role !== 'mahasiswa' && (
                            <Card className="md:col-span-1">
                                <CardHeader>
                                    <CardTitle>Catat Pelanggaran Kedisiplinan</CardTitle>
                                    <CardDescription>Pencatatan sepihak institusi untuk pelanggaran mahasiswa.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleAddPelanggaran} className="space-y-4">
                                        <div>
                                            <Label htmlFor="mahasiswa_pelanggaran">Pilih Mahasiswa *</Label>
                                            <select
                                                id="mahasiswa_pelanggaran"
                                                value={pelanggaranForm.data.mahasiswa_id}
                                                onChange={(e) => pelanggaranForm.setData('mahasiswa_id', e.target.value)}
                                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                                required
                                            >
                                                <option value="">-- Pilih Mahasiswa --</option>
                                                {mahasiswas?.map(m => <option key={m.id} value={m.id}>{m.nama_lengkap} ({m.nim})</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <Label htmlFor="jenis_pelanggaran_id">Jenis Pelanggaran</Label>
                                            <select
                                                id="jenis_pelanggaran_id"
                                                value={pelanggaranForm.data.jenis_pelanggaran_id}
                                                onChange={(e) => pelanggaranForm.setData('jenis_pelanggaran_id', e.target.value)}
                                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                            >
                                                <option value="">-- Pilih Jenis --</option>
                                                {jenisPelanggarans?.map(j => <option key={j.id} value={j.id}>{j.nama}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <Label htmlFor="sanksi_id">Sanksi</Label>
                                            <select
                                                id="sanksi_id"
                                                value={pelanggaranForm.data.sanksi_id}
                                                onChange={(e) => pelanggaranForm.setData('sanksi_id', e.target.value)}
                                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                            >
                                                <option value="">-- Pilih Sanksi --</option>
                                                {sanksis?.map(s => <option key={s.id} value={s.id}>{s.nama}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <Label htmlFor="tanggal_pelanggaran">Tanggal Pelanggaran *</Label>
                                            <Input
                                                type="date"
                                                id="tanggal_pelanggaran"
                                                value={pelanggaranForm.data.tanggal}
                                                onChange={(e) => pelanggaranForm.setData('tanggal', e.target.value)}
                                                required
                                            />
                                        </div>
                                        <Button type="submit" disabled={pelanggaranForm.processing} className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                            Simpan Catatan Pelanggaran
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        )}

                        <Card className={role !== 'mahasiswa' ? 'md:col-span-2' : 'md:col-span-3'}>
                            <CardHeader>
                                <CardTitle>Daftar Catatan Pelanggaran</CardTitle>
                                <CardDescription>Pencatatan pelanggaran dan sanksi kedisiplinan mahasiswa.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="border-b bg-muted/50 text-xs font-semibold uppercase text-muted-foreground">
                                            <tr>
                                                <th className="p-3">Tanggal</th>
                                                {role !== 'mahasiswa' && <th className="p-3">Mahasiswa</th>}
                                                <th className="p-3">Jenis Pelanggaran</th>
                                                <th className="p-3">Sanksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {(!pelanggarans || pelanggarans.length === 0) ? (
                                                <tr><td colSpan={4} className="p-4 text-center text-xs text-muted-foreground">Tidak ada catatan pelanggaran.</td></tr>
                                            ) : (
                                                pelanggarans.map(p => (
                                                    <tr key={p.id} className="hover:bg-muted/20">
                                                        <td className="p-3 font-medium">{formatDateIndonesian(p.tanggal)}</td>
                                                        {role !== 'mahasiswa' && <td className="p-3">{p.mahasiswa?.nama_lengkap} ({p.mahasiswa?.nim})</td>}

                                                        <td className="p-3">{p.jenis_pelanggaran?.nama || '-'}</td>
                                                        <td className="p-3"><Badge variant="destructive">{p.sanksi?.nama || 'Teguran'}</Badge></td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* TAB 3: BEASISWA */}
                {activeTab === 'beasiswa' && (
                    <div className="grid gap-6 md:grid-cols-3">
                        {role === 'mahasiswa' && (
                            <Card className="md:col-span-1">
                                <CardHeader>
                                    <CardTitle>Ajukan Beasiswa</CardTitle>
                                    <CardDescription>Pendaftaran program beasiswa mahasiswa.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleAddBeasiswa} className="space-y-4">
                                        <div>
                                            <Label htmlFor="jenis_beasiswa_id">Program Beasiswa *</Label>
                                            <select
                                                id="jenis_beasiswa_id"
                                                value={beasiswaForm.data.jenis_beasiswa_id}
                                                onChange={(e) => beasiswaForm.setData('jenis_beasiswa_id', e.target.value)}
                                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                                required
                                            >
                                                <option value="">-- Pilih Jenis Beasiswa --</option>
                                                {jenisBeasiswas?.map(j => <option key={j.id} value={j.id}>{j.nama}</option>)}
                                            </select>
                                        </div>
                                        <Button type="submit" disabled={beasiswaForm.processing} className="w-full">
                                            Kirim Pengajuan Beasiswa
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        )}

                        <Card className={role === 'mahasiswa' ? 'md:col-span-2' : 'md:col-span-3'}>
                            <CardHeader>
                                <CardTitle>Daftar Pengajuan Beasiswa</CardTitle>
                                <CardDescription>Status persetujuan pengajuan beasiswa mahasiswa.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="border-b bg-muted/50 text-xs font-semibold uppercase text-muted-foreground">
                                            <tr>
                                                <th className="p-3">Program Beasiswa</th>
                                                {role !== 'mahasiswa' && <th className="p-3">Mahasiswa</th>}
                                                <th className="p-3">Status</th>
                                                {role !== 'mahasiswa' && <th className="p-3 text-right">Aksi Approval</th>}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {(!beasiswas || beasiswas.length === 0) ? (
                                                <tr><td colSpan={4} className="p-4 text-center text-xs text-muted-foreground">Belum ada pengajuan beasiswa.</td></tr>
                                            ) : (
                                                beasiswas.map(b => (
                                                    <tr key={b.id} className="hover:bg-muted/20">
                                                        <td className="p-3 font-medium">{b.jenis_beasiswa?.nama || 'Beasiswa'}</td>
                                                        {role !== 'mahasiswa' && <td className="p-3">{b.mahasiswa?.nama_lengkap} ({b.mahasiswa?.nim})</td>}
                                                        <td className="p-3">
                                                            {b.status === 'diterima' && <Badge className="bg-emerald-600">Diterima</Badge>}
                                                            {b.status === 'ditolak' && <Badge variant="destructive">Ditolak</Badge>}
                                                            {b.status === 'diajukan' && <Badge variant="outline">Diajukan</Badge>}
                                                        </td>
                                                        {role !== 'mahasiswa' && (
                                                            <td className="p-3 text-right space-x-2">
                                                                {b.status === 'diajukan' && (
                                                                    <>
                                                                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => handleApproveBeasiswa(b.id, 'diterima')}>Terima</Button>
                                                                        <Button size="sm" variant="destructive" onClick={() => handleApproveBeasiswa(b.id, 'ditolak')}>Tolak</Button>
                                                                    </>
                                                                )}
                                                            </td>
                                                        )}
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
