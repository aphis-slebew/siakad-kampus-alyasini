import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { BookOpen, CheckCircle, Clock, Calendar, UserCheck } from 'lucide-react';
import { formatDateIndonesian } from '@/lib/utils';
import type { SharedData } from '@/types';


type Dosen = { id: number; nama_lengkap: string };
type BimbinganProposal = { id: number; tanggal: string; catatan: string; divalidasi: boolean };
type ProposalSkripsi = {
    id: number;
    judul: string;
    status: string;
    tanggal_ujian?: string;
    dosen_pembimbing?: Dosen;
    mahasiswa?: { nama_lengkap: string; nim: string };
    bimbingan_proposals?: BimbinganProposal[];
};

export default function ProposalSkripsiPage({
    proposal,
    proposals,
    dosens,
    role,
    errors,
}: {
    proposal?: ProposalSkripsi;
    proposals?: ProposalSkripsi[];
    dosens?: Dosen[];
    role: string;
    errors?: Record<string, string>;
}) {
    const submitForm = useForm({
        judul: proposal?.judul || '',
        dosen_pembimbing_id: proposal?.dosen_pembimbing?.id || '',
    });

    const bimbinganForm = useForm({
        tanggal: new Date().toISOString().split('T')[0],
        catatan: '',
    });

    const approveForm = useForm({
        dosen_pembimbing_id: '',
    });

    const scheduleForm = useForm({
        tanggal_ujian: '',
    });

    const handleSubmitProposal: FormEventHandler = (e) => {
        e.preventDefault();
        submitForm.post('/skripsi/proposal');
    };

    const handleAddBimbingan: FormEventHandler = (e) => {
        e.preventDefault();
        if (proposal) {
            bimbinganForm.post(`/skripsi/proposal/${proposal.id}/bimbingan`, {
                onSuccess: () => bimbinganForm.reset('catatan'),
            });
        }
    };

    const handleValidateBimbingan = (id: number) => {
        useForm({}).post(`/skripsi/bimbingan-proposal/${id}/validate`);
    };

    const handleApprove = (proposalId: number) => {
        approveForm.post(`/skripsi/proposal/${proposalId}/approve`);
    };

    const handleSchedule = (proposalId: number) => {
        scheduleForm.post(`/skripsi/proposal/${proposalId}/schedule`);
    };

    const handlePass = (proposalId: number) => {
        useForm({}).post(`/skripsi/proposal/${proposalId}/pass`);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'diajukan': return <Badge variant="secondary"><Clock className="mr-1 h-3 w-3" /> Diajukan</Badge>;
            case 'bimbingan': return <Badge variant="outline" className="border-blue-500 text-blue-600"><BookOpen className="mr-1 h-3 w-3" /> Dalam Bimbingan</Badge>;
            case 'siap_ujian': return <Badge variant="outline" className="border-amber-500 text-amber-600"><Calendar className="mr-1 h-3 w-3" /> Siap Ujian</Badge>;
            case 'lulus_ujian': return <Badge className="bg-emerald-600"><CheckCircle className="mr-1 h-3 w-3" /> Lulus Ujian</Badge>;
            default: return <Badge variant="secondary">{status}</Badge>;
        }
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }, { title: 'Proposal Skripsi', href: '/skripsi/proposal' }]}>
            <Head title="Pengajuan & Bimbingan Proposal Skripsi" />

            <div className="space-y-6 p-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground-default">Proposal Skripsi & Bimbingan</h1>
                    <p className="text-sm text-foreground-muted">Kelola pengajuan judul proposal, log bimbingan berkala, dan verifikasi kelayakan ujian.</p>
                </div>

                {(errors?.proposal || errors?.bimbingan || errors?.ujian) && (
                    <div className="rounded-md bg-destructive/15 p-4 text-sm text-destructive border border-destructive/20">
                        {errors.proposal || errors.bimbingan || errors.ujian}
                    </div>
                )}

                {role === 'mahasiswa' && (
                    <div className="grid gap-6 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span>Form Pengajuan Judul Proposal</span>
                                    {proposal && getStatusBadge(proposal.status)}
                                </CardTitle>
                                <CardDescription>Ajukan judul proposal skripsi Anda dan pilih opsi dosen pembimbing.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmitProposal} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="judul">Judul Proposal Skripsi *</Label>
                                        <Textarea
                                            id="judul"
                                            value={submitForm.data.judul}
                                            onChange={(e) => submitForm.setData('judul', e.target.value)}
                                            placeholder="Masukkan judul proposal skripsi lengkap..."
                                            rows={4}
                                            className="disabled:text-foreground disabled:opacity-100 disabled:bg-muted/30 font-medium text-foreground"
                                            disabled={proposal && proposal.status !== 'diajukan'}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="dosen">Dosen Pembimbing (Opsional/Usulan)</Label>
                                        <select
                                            id="dosen"
                                            value={submitForm.data.dosen_pembimbing_id}
                                            onChange={(e) => submitForm.setData('dosen_pembimbing_id', e.target.value)}
                                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:text-foreground disabled:opacity-100 disabled:bg-muted/30 font-medium"
                                            disabled={proposal && proposal.status !== 'diajukan'}
                                        >
                                            <option value="">-- Pilih Dosen Pembimbing --</option>
                                            {dosens?.map((d) => (
                                                <option key={d.id} value={d.id}>{d.nama_lengkap}</option>
                                            ))}
                                        </select>
                                    </div>
                                    {(!proposal || proposal.status === 'diajukan') && (
                                        <Button type="submit" disabled={submitForm.processing} className="w-full">
                                            {proposal ? 'Perbarui Pengajuan Proposal' : 'Ajukan Proposal Skripsi'}
                                        </Button>
                                    )}
                                </form>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Log Bimbingan Proposal</CardTitle>
                                <CardDescription>Catat konsultasi berkas proposal dengan Dosen Pembimbing.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {proposal && proposal.status === 'bimbingan' && (
                                    <form onSubmit={handleAddBimbingan} className="space-y-3 rounded-lg border p-4 bg-muted/30">
                                        <h4 className="text-sm font-semibold">Tambah Log Konsultasi Baru</h4>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <Label htmlFor="tanggal">Tanggal Konsultasi *</Label>
                                                <Input
                                                    type="date"
                                                    id="tanggal"
                                                    value={bimbinganForm.data.tanggal}
                                                    onChange={(e) => bimbinganForm.setData('tanggal', e.target.value)}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <Label htmlFor="catatan">Catatan / Progress Bimbingan *</Label>
                                            <Textarea
                                                id="catatan"
                                                value={bimbinganForm.data.catatan}
                                                onChange={(e) => bimbinganForm.setData('catatan', e.target.value)}
                                                placeholder="Contoh: Perbaikan BAB II Tinjauan Pustaka disetujui..."
                                                rows={2}
                                                required
                                            />
                                        </div>
                                        <Button type="submit" size="sm" disabled={bimbinganForm.processing}>
                                            Simpan Log Bimbingan
                                        </Button>
                                    </form>
                                )}

                                <div className="space-y-3">
                                    <h4 className="text-sm font-semibold">Riwayat Log Konsultasi ({proposal?.bimbingan_proposals?.length || 0}x)</h4>
                                    {(!proposal?.bimbingan_proposals || proposal.bimbingan_proposals.length === 0) ? (
                                        <p className="text-xs text-muted-foreground italic">Belum ada catatan log bimbingan.</p>
                                    ) : (
                                        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                                            {proposal.bimbingan_proposals.map((b) => (
                                                <div key={b.id} className="flex items-start justify-between rounded-md border p-3 text-xs">
                                                    <div>
                                                        <span className="font-semibold text-foreground">{formatDateIndonesian(b.tanggal)}</span>
                                                        <p className="text-muted-foreground mt-1">{b.catatan}</p>
                                                    </div>

                                                    {b.divalidasi ? (
                                                        <Badge className="bg-emerald-600 whitespace-nowrap">Tervalidasi</Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="whitespace-nowrap">Menunggu</Badge>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {(role === 'dosen' || role === 'admin') && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Daftar Bimbingan Proposal Skripsi</CardTitle>
                            <CardDescription>Kelola verifikasi log bimbingan dan penetapan jadwal ujian proposal.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="w-full">
                                <table className="w-full text-left text-sm">
                                    <thead className="border-b bg-muted/50 text-xs font-semibold uppercase text-muted-foreground">
                                        <tr>
                                            <th className="p-3">Mahasiswa & Judul Proposal</th>
                                            {role === 'admin' && <th className="p-3">Dosen Pembimbing</th>}
                                            <th className="p-3 text-center">Log Bimbingan</th>
                                            <th className="p-3">Status</th>
                                            <th className="p-3 text-right">Aksi & Transisi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {(!proposals || proposals.length === 0) ? (
                                            <tr>
                                                <td colSpan={role === 'admin' ? 5 : 4} className="p-4 text-center text-xs text-muted-foreground">Belum ada data pengajuan proposal skripsi.</td>
                                            </tr>
                                        ) : (
                                            proposals.map((p) => (
                                                <tr key={p.id} className="hover:bg-muted/20">
                                                    <td className="p-3 py-4">
                                                        <div className="font-semibold text-foreground">{p.mahasiswa?.nama_lengkap}</div>
                                                        <div className="text-xs text-muted-foreground font-mono">{p.mahasiswa?.nim}</div>
                                                        <div className="text-xs text-muted-foreground mt-1 max-w-lg font-normal italic" title={p.judul}>
                                                            "{p.judul}"
                                                        </div>
                                                    </td>
                                                    {role === 'admin' && (
                                                        <td className="p-3">{p.dosen_pembimbing?.nama_lengkap || '-'}</td>
                                                    )}
                                                    <td className="p-3 text-center">
                                                        <span className="font-bold text-foreground">{p.bimbingan_proposals?.filter(b => b.divalidasi).length || 0}</span> / {p.bimbingan_proposals?.length || 0}
                                                        <div className="text-[11px] text-muted-foreground">Tervalidasi</div>
                                                    </td>
                                                    <td className="p-3">{getStatusBadge(p.status)}</td>
                                                    <td className="p-3 text-right">


                                                        {role === 'admin' && p.status === 'diajukan' && (
                                                            <div className="flex items-center justify-end gap-2">
                                                                <select
                                                                    onChange={(e) => approveForm.setData('dosen_pembimbing_id', e.target.value)}
                                                                    className="rounded border px-2 py-1 text-xs"
                                                                >
                                                                    <option value="">Pilih Dosen</option>
                                                                    {dosens?.map(d => <option key={d.id} value={d.id}>{d.nama_lengkap}</option>)}
                                                                </select>
                                                                <Button size="sm" onClick={() => handleApprove(p.id)} disabled={!approveForm.data.dosen_pembimbing_id}>
                                                                    Setujui
                                                                </Button>
                                                            </div>
                                                        )}

                                                        {p.status === 'bimbingan' && (
                                                            <div className="flex items-center justify-end gap-2">
                                                                <Input
                                                                    type="date"
                                                                    className="h-8 w-36 text-xs"
                                                                    onChange={(e) => scheduleForm.setData('tanggal_ujian', e.target.value)}
                                                                />
                                                                <Button size="sm" variant="outline" onClick={() => handleSchedule(p.id)} disabled={!scheduleForm.data.tanggal_ujian}>
                                                                    Jadwalkan Ujian
                                                                </Button>
                                                            </div>
                                                        )}

                                                        {p.status === 'siap_ujian' && (
                                                            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => handlePass(p.id)}>
                                                                Luluskan Ujian
                                                            </Button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
