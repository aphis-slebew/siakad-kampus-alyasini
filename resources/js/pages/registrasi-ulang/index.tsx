import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { CheckCircle2, FileText, XCircle } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

type Dokumen = {
    id: number;
    jenis_dokumen: string;
    file_path: string;
    status_verifikasi: string;
};

type Registrasi = {
    id: number;
    status: string;
    selesai_at: string | null;
    periode_registrasi?: {
        jenis: string;
        tahun_ajaran?: { nama: string };
    };
    calon_mahasiswa?: { nama_lengkap: string; email: string };
    mahasiswa?: { nama_lengkap: string; nim: string };
    dokumen_registrasis?: Dokumen[];
};

export default function RegistrasiUlangStaffIndex({
    registrasis = [],
}: {
    registrasis: Registrasi[];
}) {
    const [selectedRegistrasi, setSelectedRegistrasi] = useState<Registrasi | null>(null);

    const handleVerifyDokumen = (dokumenId: number, status: 'diverifikasi' | 'ditolak') => {
        router.patch(`/keuangan/dokumen-registrasi/${dokumenId}/verify`, {
            status_verifikasi: status,
        }, {
            onSuccess: () => setSelectedRegistrasi(null),
        });
    };

    return (
        <>
            <Head title="Verifikasi Registrasi Ulang" />

            <div className="p-6 space-y-6 font-sans">
                <div>
                    <h1 className="text-xl font-semibold text-text-primary">Dashboard Verifikasi Registrasi Ulang</h1>
                    <p className="text-xs text-text-secondary mt-0.5">
                        Kelola dan verifikasi berkas Her-Registrasi Mahasiswa Baru dan Mahasiswa Lama.
                    </p>
                </div>

                <div className="rounded-lg border border-border-default bg-surface-card shadow-xs overflow-hidden">
                    {registrasis.length === 0 ? (
                        <div className="p-12 text-center">
                            <FileText className="mx-auto size-10 text-text-secondary/50 mb-3" />
                            <h3 className="text-sm font-semibold text-text-primary">Belum ada pengajuan registrasi ulang</h3>
                            <p className="text-xs text-text-secondary mt-1">
                                Data pengajuan Her-Registrasi mahasiswa akan tampil di sini.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="sticky top-0 bg-surface-base border-b border-border-default text-text-secondary font-semibold uppercase tracking-wider">
                                    <tr>
                                        <th className="py-3 px-4 w-12">No</th>
                                        <th className="py-3 px-4">Nama Mahasiswa / Calon</th>
                                        <th className="py-3 px-4">Peruntukan & Tahun Ajaran</th>
                                        <th className="py-3 px-4 text-center w-36">Status Registrasi</th>
                                        <th className="py-3 px-4 text-right w-32">Aksi Detail</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-default text-text-primary">
                                    {registrasis.map((item, index) => (
                                        <tr key={item.id} className="even:bg-surface-base/50 hover:bg-surface-base transition-colors duration-150">
                                            <td className="py-3 px-4 text-text-secondary">{index + 1}</td>
                                            <td className="py-3 px-4 font-semibold text-brand-primary">
                                                {item.mahasiswa?.nama_lengkap || item.calon_mahasiswa?.nama_lengkap || 'Pendaftar'}
                                                <div className="text-[11px] font-mono text-text-secondary font-normal">
                                                    {item.mahasiswa?.nim ? `NIM: ${item.mahasiswa.nim}` : 'Calon Mahasiswa Baru'}
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="capitalize font-medium">
                                                    {item.periode_registrasi?.jenis.replace('_', ' ')} — {item.periode_registrasi?.tahun_ajaran?.nama}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                {item.status === 'selesai' ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-status-success/10 text-status-success border border-status-success/20">
                                                        <CheckCircle2 className="size-3" />
                                                        Selesai
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-status-warning/10 text-status-warning border border-status-warning/20">
                                                        Proses Verifikasi
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedRegistrasi(item)}
                                                    className="px-3 py-1 bg-brand-primary/10 text-brand-primary rounded text-xs font-semibold hover:bg-brand-primary/20"
                                                >
                                                    Periksa Berkas
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Detail Berkas */}
            <Dialog open={!!selectedRegistrasi} onOpenChange={(open) => !open && setSelectedRegistrasi(null)}>
                <DialogContent className="sm:max-w-md bg-surface-card border-border-default">
                    <DialogHeader>
                        <DialogTitle className="text-base font-semibold text-text-primary">Berkas Dokumen Registrasi Ulang</DialogTitle>
                        <DialogDescription className="text-xs text-text-secondary">
                            Verifikasi berkas persyaratan per item.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedRegistrasi && (
                        <div className="space-y-3 py-2 text-xs">
                            {selectedRegistrasi.dokumen_registrasis && selectedRegistrasi.dokumen_registrasis.length > 0 ? (
                                selectedRegistrasi.dokumen_registrasis.map((doc) => (
                                    <div key={doc.id} className="flex items-center justify-between bg-surface-base p-3 rounded-md border border-border-default">
                                        <div>
                                            <span className="font-semibold capitalize text-text-primary block">{doc.jenis_dokumen.replace('_', ' ')}</span>
                                            <span className="text-[11px] text-text-secondary">Status: {doc.status_verifikasi}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            {doc.status_verifikasi !== 'diverifikasi' && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleVerifyDokumen(doc.id, 'diverifikasi')}
                                                    className="p-1 bg-status-success text-white rounded text-[11px] font-semibold"
                                                    title="Verifikasi Dokumen"
                                                >
                                                    <CheckCircle2 className="size-4" />
                                                </button>
                                            )}
                                            {doc.status_verifikasi !== 'ditolak' && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleVerifyDokumen(doc.id, 'ditolak')}
                                                    className="p-1 bg-status-danger text-white rounded text-[11px] font-semibold"
                                                    title="Tolak Dokumen"
                                                >
                                                    <XCircle className="size-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-text-secondary italic text-center py-4">Belum ada dokumen diunggah.</p>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}

RegistrasiUlangStaffIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Keuangan & Registrasi', href: '#' },
        { title: 'Registrasi Ulang', href: '/keuangan/registrasi-ulang' },
    ],
};
