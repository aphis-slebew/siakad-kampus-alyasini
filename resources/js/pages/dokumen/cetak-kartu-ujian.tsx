import { Head } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, Printer, QrCode, User, XCircle } from 'lucide-react';
import { KopSuratResmi } from '@/components/kop-surat-resmi';
import { Button } from '@/components/ui/button';

type MahasiswaData = {
    id: number;
    nim: string;
    nama_lengkap: string;
    foto_path?: string | null;
    program_studi?: {
        id: number;
        kode: string;
        nama: string;
        jenjang: string;
        fakultas?: {
            nama: string;
        };
    };
};

type KrsDetailItem = {
    id: number;
    kelas_kuliah?: {
        id: number;
        nama_kelas: string;
        kurikulum_matakuliah?: {
            matakuliah?: {
                kode: string;
                nama: string;
                sks: number;
            };
        };
        jadwal_perkuliahans?: Array<{
            hari: string;
            jam_mulai: string;
            jam_selesai: string;
            ruang_kuliah?: {
                nama: string;
            };
        }>;
    };
};

type KrsData = {
    id: number;
    krs_details?: KrsDetailItem[];
};

export default function CetakKartuUjian({
    mahasiswa,
    tahunAjaran,
    jenisUjian = 'UAS',
    statusLunas = true,
    krs,
    nomorDokumen,
}: {
    mahasiswa: MahasiswaData;
    tahunAjaran: { id: number; nama: string };
    jenisUjian: string;
    statusLunas: boolean;
    krs?: KrsData | null;
    nomorDokumen: string;
}) {
    const handlePrint = () => {
        window.print();
    };

    const details = krs?.krs_details || [];

    return (
        <>
            <Head title={`Kartu ${jenisUjian} - ${mahasiswa.nim} - ${mahasiswa.nama_lengkap}`} />

            <div className="min-h-screen bg-surface-base py-6 font-sans text-text-primary print:bg-white print:py-0 print:m-0">
                {/* Action Bar (Hidden on Print) */}
                <div className="max-w-4xl mx-auto px-4 mb-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 print:hidden">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.history.back()}
                        className="text-xs flex items-center gap-1.5 self-start sm:self-auto"
                    >
                        <ArrowLeft className="size-3.5" />
                        <span>Kembali</span>
                    </Button>

                    <Button
                        size="sm"
                        onClick={handlePrint}
                        className="bg-brand-primary hover:bg-brand-primary-dark text-white text-xs flex items-center gap-1.5 self-start sm:self-auto"
                    >
                        <Printer className="size-3.5" />
                        <span>Cetak Kartu Ujian (PDF / Printer)</span>
                    </Button>
                </div>

                {/* Printable Document A4 Container */}
                <div className="max-w-4xl mx-auto bg-white p-4 sm:p-8 md:p-12 shadow-sm rounded-lg border border-border-default print:shadow-none print:border-none print:p-4 print:max-w-none">
                    <KopSuratResmi
                        title={`KARTU PESERTA ${jenisUjian === 'UTS' ? 'UJIAN TENGAH SEMESTER (UTS)' : 'UJIAN AKHIR SEMESTER (UAS)'}`}
                        subtitle={`Tahun Akademik: ${tahunAjaran?.nama || '2026/2027 Ganjil'}`}
                        nomorDokumen={nomorDokumen}
                    />

                    {/* Student Metadata & Photo Container */}
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start my-4 pb-4 border-b border-border-default text-xs">
                        {/* Student Photo Box */}
                        <div className="w-24 h-32 border border-slate-900 flex flex-col items-center justify-center bg-slate-100 shrink-0 text-slate-500">
                            {mahasiswa.foto_path ? (
                                <img src={mahasiswa.foto_path} alt={mahasiswa.nama_lengkap} className="w-full h-full object-cover" />
                            ) : (
                                <>
                                    <User className="size-8 text-slate-400" />
                                    <span className="text-[9px] mt-1 font-medium text-center">FOTO 3x4</span>
                                </>
                            )}
                        </div>

                        {/* Metadata Details */}
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div className="space-y-1">
                                <div className="flex">
                                    <span className="w-28 text-text-secondary">NIM</span>
                                    <span className="font-mono font-semibold text-text-primary">: {mahasiswa.nim}</span>
                                </div>
                                <div className="flex">
                                    <span className="w-28 text-text-secondary">Nama Lengkap</span>
                                    <span className="font-semibold text-text-primary">: {mahasiswa.nama_lengkap}</span>
                                </div>
                                <div className="flex">
                                    <span className="w-28 text-text-secondary">Program Studi</span>
                                    <span>: {mahasiswa.program_studi?.jenjang} {mahasiswa.program_studi?.nama}</span>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <div className="flex">
                                    <span className="w-32 text-text-secondary">Fakultas</span>
                                    <span>: {mahasiswa.program_studi?.fakultas?.nama || 'Tarbiyah'}</span>
                                </div>
                                <div className="flex">
                                    <span className="w-32 text-text-secondary">Semester</span>
                                    <span>: {tahunAjaran?.nama || 'Ganjil'}</span>
                                </div>
                                <div className="flex items-center">
                                    <span className="w-32 text-text-secondary">Syarat Keuangan</span>
                                    {statusLunas ? (
                                        <span className="inline-flex items-center gap-1 font-bold text-status-success">
                                            : <CheckCircle2 className="size-3" /> LUNAS (Memenuhi Syarat)
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 font-bold text-status-danger">
                                            : <XCircle className="size-3" /> BELUM LUNAS
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Schedule & Signature Verification Table */}
                    <div className="overflow-x-auto my-4">
                        <table className="w-full text-xs border-collapse border border-slate-900 min-w-[600px] sm:min-w-0">
                            <thead>
                                <tr className="bg-slate-100 text-slate-900 font-semibold border-b border-slate-900 text-center">
                                    <th className="border border-slate-900 p-2 w-8">No</th>
                                    <th className="border border-slate-900 p-2 w-20">Kode MK</th>
                                    <th className="border border-slate-900 p-2 text-left">Mata Kuliah Diujikan</th>
                                    <th className="border border-slate-900 p-2 w-12">SKS</th>
                                    <th className="border border-slate-900 p-2 w-16">Kelas</th>
                                    <th className="border border-slate-900 p-2 text-left">Hari / Ruang Ujian</th>
                                    <th className="border border-slate-900 p-2 w-28">Paraf Pengawas</th>
                                </tr>
                            </thead>
                            <tbody>
                                {details.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="border border-slate-900 p-4 text-center text-text-secondary italic">
                                            Tidak ada mata kuliah terdaftar untuk ujian semester ini.
                                        </td>
                                    </tr>
                                ) : (
                                    details.map((item, idx) => {
                                        const mk = item.kelas_kuliah?.kurikulum_matakuliah?.matakuliah;
                                        const jdw = item.kelas_kuliah?.jadwal_perkuliahans?.[0];

                                        return (
                                            <tr key={item.id} className="border-b border-slate-900">
                                                <td className="border border-slate-900 p-2 text-center">{idx + 1}</td>
                                                <td className="border border-slate-900 p-2 font-mono text-center font-medium">
                                                    {mk?.kode || '-'}
                                                </td>
                                                <td className="border border-slate-900 p-2 font-medium">
                                                    {mk?.nama || '-'}
                                                </td>
                                                <td className="border border-slate-900 p-2 text-center font-semibold">
                                                    {mk?.sks || 0}
                                                </td>
                                                <td className="border border-slate-900 p-2 text-center">
                                                    {item.kelas_kuliah?.nama_kelas || '-'}
                                                </td>
                                                <td className="border border-slate-900 p-2">
                                                    {jdw ? `${jdw.hari} (${jdw.ruang_kuliah?.nama || 'Ruang Ujian'})` : '-'}
                                                </td>
                                                <td className="border border-slate-900 p-2 text-center text-[10px] text-text-secondary">
                                                    <div className="h-6 flex items-center justify-center border-b border-dotted border-slate-300">
                                                        ( . . . . . . . . . . )
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Rules & Instructions */}
                    <div className="p-3 bg-slate-50 border border-slate-900 text-[11px] space-y-1 my-4">
                        <p className="font-semibold text-text-primary">Tata Tertib Peserta Ujian:</p>
                        <ol className="list-decimal list-inside space-y-0.5 text-text-secondary">
                            <li>Wajib membawa Kartu Peserta Ujian ini dan menunjukkan kepada pengawas ruang.</li>
                            <li>Hadir di ruang ujian 15 menit sebelum ujian dimulai dengan berpakaian sopan dan rapi (standar santri/akademik).</li>
                            <li>Dilarang keras menggunakan HP / alat komunikasi dan melakukan kecurangan selama ujian berlangsung.</li>
                        </ol>
                    </div>

                    {/* Signatures */}
                    <div className="mt-8 grid grid-cols-2 gap-8 text-xs text-center">
                        <div className="space-y-16">
                            <div>
                                <p className="text-text-secondary">Pemegang Kartu,</p>
                            </div>
                            <div>
                                <p className="font-semibold underline uppercase text-text-primary">
                                    {mahasiswa.nama_lengkap}
                                </p>
                                <p className="font-mono text-[11px] text-text-secondary">NIM: {mahasiswa.nim}</p>
                            </div>
                        </div>

                        <div className="space-y-16">
                            <div>
                                <p className="text-text-secondary">Pasuruan, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                <p className="text-text-secondary font-semibold">Ketua Panitia Ujian / BAA,</p>
                            </div>
                            <div>
                                <p className="font-semibold underline uppercase text-text-primary">
                                    Dr. H. Ahmad Fauzi, M.Pd.I
                                </p>
                                <p className="font-mono text-[11px] text-text-secondary">NIDN: 2108098201</p>
                            </div>
                        </div>
                    </div>

                    {/* Security Footnote */}
                    <div className="mt-8 pt-3 border-t border-border-default flex items-center justify-between text-[10px] text-text-secondary">
                        <div className="flex items-center gap-1.5">
                            <QrCode className="size-4 text-brand-primary" />
                            <span>Kartu Ujian ini sah diverifikasi oleh sistem akademik SIAKAD STAI Al-Yasini Pasuruan.</span>
                        </div>
                        <span className="font-mono">Verifikasi: {nomorDokumen}</span>
                    </div>
                </div>
            </div>
        </>
    );
}
