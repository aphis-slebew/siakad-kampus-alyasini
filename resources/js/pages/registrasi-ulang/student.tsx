import { Head, useForm } from '@inertiajs/react';
import { Calendar, CheckCircle2, FileText, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatDateIndonesian } from '@/lib/utils';


type Periode = {

    id: number;
    jenis: string;
    mulai: string;
    selesai: string;
    tahun_ajaran?: { nama: string };
};

type Registrasi = {
    id: number;
    status: string;
    selesai_at: string | null;
    dokumen_registrasis?: Array<{
        id: number;
        jenis_dokumen: string;
        status_verifikasi: string;
    }>;
};

type Mahasiswa = {
    id: number;
    nama_lengkap: string;
    nim: string;
};

type Calon = {
    id: number;
    nama_lengkap: string;
};

export default function StudentRegistrasiUlangIndex({
    activePeriode,
    registrasi,
    calon,
    mahasiswa,
}: {
    activePeriode: Periode | null;
    registrasi: Registrasi | null;
    calon: Calon | null;
    mahasiswa: Mahasiswa | null;
}) {
    const form = useForm({
        periode_registrasi_id: activePeriode?.id || '',
        calon_mahasiswa_id: calon?.id || '',
        mahasiswa_id: mahasiswa?.id || '',
        dokumen_ijazah_asli: null as File | null,
        dokumen_kk: null as File | null,
        dokumen_pas_foto: null as File | null,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/registrasi-ulang/saya');
    };

    return (
        <>
            <Head title="Pengajuan Registrasi Ulang Saya" />

            <div className="p-4 sm:p-6 space-y-6 font-sans max-w-4xl mx-auto">
                <div>
                    <h1 className="text-xl font-semibold text-text-primary">Registrasi Ulang (Her-Registrasi)</h1>
                    <p className="text-xs text-text-secondary mt-0.5">
                        Ajukan berkas registrasi ulang untuk mengaktifkan status akademik semester ini.
                    </p>
                </div>

                {!activePeriode ? (
                    <div className="p-8 text-center border border-border-default rounded-lg bg-surface-card space-y-2">
                        <Calendar className="mx-auto size-10 text-text-secondary/50" />
                        <h3 className="text-sm font-semibold text-text-primary">Periode Registrasi Ulang Belum Dibuka</h3>
                        <p className="text-xs text-text-secondary">
                            Saat ini belum ada periode Her-Registrasi yang sedang berlangsung. Silakan hubungi bagian Akademik.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Periode Banner */}
                        <div className="bg-brand-primary/5 border border-brand-primary/20 rounded-lg p-4 flex justify-between items-center text-xs">
                            <div>
                                <span className="font-semibold text-brand-primary block text-sm">
                                    Periode Her-Registrasi Aktif: {activePeriode.tahun_ajaran?.nama}
                                </span>
                                <span className="text-text-secondary capitalize">
                                    Peruntukan: {activePeriode.jenis.replace('_', ' ')} (Batas: {formatDateIndonesian(activePeriode.selesai)})
                                </span>

                            </div>

                            {registrasi?.status === 'selesai' && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-status-success/10 text-status-success border border-status-success/20">
                                    <CheckCircle2 className="size-4" />
                                    Registrasi Ulang Selesai
                                </span>
                            )}
                        </div>

                        {/* Document Upload Form */}
                        <div className="bg-surface-card border border-border-default rounded-lg p-6 shadow-xs space-y-6">
                            <h2 className="text-sm font-semibold text-text-primary flex items-center gap-2 border-b border-border-default pb-3">
                                <FileText className="size-4 text-brand-primary" />
                                Upload Berkas Persyaratan Her-Registrasi (PDF / Image Max 2MB)
                            </h2>

                            <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold text-text-primary">
                                            Ijazah Asli (PDF / Image Max 2MB)
                                        </Label>
                                        <Input
                                            type="file"
                                            accept=".pdf,.jpg,.jpeg,.png"
                                            onChange={(e) => form.setData('dokumen_ijazah_asli', e.target.files?.[0] || null)}
                                            className="text-xs border-border-default"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold text-text-primary">
                                            Kartu Keluarga / KK (PDF / Image Max 2MB)
                                        </Label>
                                        <Input
                                            type="file"
                                            accept=".pdf,.jpg,.jpeg,.png"
                                            onChange={(e) => form.setData('dokumen_kk', e.target.files?.[0] || null)}
                                            className="text-xs border-border-default"
                                        />
                                    </div>

                                    <div className="space-y-1.5 sm:col-span-2">
                                        <Label className="text-xs font-semibold text-text-primary">
                                            Pasfoto Resmi Berwarna (JPG / PNG Max 1MB)
                                        </Label>
                                        <Input
                                            type="file"
                                            accept=".jpg,.jpeg,.png"
                                            onChange={(e) => form.setData('dokumen_pas_foto', e.target.files?.[0] || null)}
                                            className="text-xs border-border-default"
                                        />
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <Button
                                        type="submit"
                                        disabled={form.processing || registrasi?.status === 'selesai'}
                                        className="w-full bg-brand-primary text-white hover:bg-brand-primary-dark text-xs font-semibold py-2.5 rounded-md inline-flex items-center justify-center gap-1.5"
                                    >
                                        <Upload className="size-4" />
                                        {form.processing ? 'Mengajukan Registrasi...' : 'Kirim Berkas Her-Registrasi'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

StudentRegistrasiUlangIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Registrasi Ulang', href: '/registrasi-ulang/saya' },
    ],
};
