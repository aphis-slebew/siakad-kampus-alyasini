import { Head } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, Printer, QrCode } from 'lucide-react';
import { KopSuratResmi } from '@/components/kop-surat-resmi';
import { Button } from '@/components/ui/button';

type MahasiswaData = {
    id: number;
    nim: string;
    nama_lengkap: string;
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
        dosen_pengajars?: Array<{
            dosen?: {
                nama_lengkap: string;
                gelar_depan?: string;
                gelar_belakang?: string;
            };
        }>;
    };
};

type KrsData = {
    id: number;
    status: string;
    approved_by_wali: boolean;
    approved_at: string | null;
    krs_details?: KrsDetailItem[];
};

export default function CetakKrs({
    mahasiswa,
    tahunAjaran,
    krs,
    dosenWali,
    nomorDokumen,
}: {
    mahasiswa: MahasiswaData;
    tahunAjaran: { id: number; nama: string };
    krs?: KrsData | null;
    dosenWali?: { nama_lengkap: string; gelar_depan?: string; gelar_belakang?: string; nidn?: string } | null;
    nomorDokumen: string;
}) {
    const handlePrint = () => {
        window.print();
    };

    const details = krs?.krs_details || [];
    const totalSks = details.reduce((acc, curr) => acc + (curr.kelas_kuliah?.kurikulum_matakuliah?.matakuliah?.sks || 0), 0);

    const formatDosenName = (d?: { nama_lengkap: string; gelar_depan?: string; gelar_belakang?: string } | null) => {
        if (!d) {
return '-';
}

        const depan = d.gelar_depan ? `${d.gelar_depan} ` : '';
        const belakang = d.gelar_belakang ? `, ${d.gelar_belakang}` : '';

        return `${depan}${d.nama_lengkap}${belakang}`;
    };

    return (
        <>
            <Head title={`KRS - ${mahasiswa.nim} - ${mahasiswa.nama_lengkap}`} />

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
                        <span>Cetak Dokumen (PDF / Printer)</span>
                    </Button>
                </div>

                {/* Printable Document A4 Container */}
                <div className="max-w-4xl mx-auto bg-white p-4 sm:p-8 md:p-12 shadow-sm rounded-lg border border-border-default print:shadow-none print:border-none print:p-4 print:max-w-none">
                    <KopSuratResmi
                        title="Kartu Rencana Studi (KRS)"
                        subtitle={`Tahun Akademik: ${tahunAjaran?.nama || '2026/2027 Ganjil'}`}
                        nomorDokumen={nomorDokumen}
                    />

                    {/* Student Metadata Table */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs my-4 pb-2 border-b border-border-default">
                        <div className="space-y-1">
                            <div className="flex">
                                <span className="w-32 text-text-secondary">NIM</span>
                                <span className="font-mono font-semibold text-text-primary">: {mahasiswa.nim}</span>
                            </div>
                            <div className="flex">
                                <span className="w-32 text-text-secondary">Nama Mahasiswa</span>
                                <span className="font-semibold text-text-primary">: {mahasiswa.nama_lengkap}</span>
                            </div>
                            <div className="flex">
                                <span className="w-32 text-text-secondary">Fakultas</span>
                                <span>: {mahasiswa.program_studi?.fakultas?.nama || 'Tarbiyah'}</span>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <div className="flex">
                                <span className="w-36 text-text-secondary">Program Studi</span>
                                <span>: {mahasiswa.program_studi?.jenjang} {mahasiswa.program_studi?.nama}</span>
                            </div>
                            <div className="flex">
                                <span className="w-36 text-text-secondary">Dosen Wali (PA)</span>
                                <span>: {formatDosenName(dosenWali)}</span>
                            </div>
                            <div className="flex">
                                <span className="w-36 text-text-secondary">Status KRS</span>
                                <span className="font-semibold text-emerald-700 flex items-center gap-1">
                                    : {krs?.status === 'draft'
                                        ? 'Draft'
                                        : <><CheckCircle2 className="size-3" /> Disetujui Dosen Wali</>
                                    }
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Course Table */}
                    <div className="overflow-x-auto my-4">
                        <table className="w-full text-xs border-collapse border border-slate-900 min-w-[600px] sm:min-w-0">
                            <thead>
                                <tr className="bg-slate-100 text-slate-900 font-semibold border-b border-slate-900 text-center">
                                    <th className="border border-slate-900 p-2 w-8">No</th>
                                    <th className="border border-slate-900 p-2 w-20">Kode MK</th>
                                    <th className="border border-slate-900 p-2 text-left">Mata Kuliah</th>
                                    <th className="border border-slate-900 p-2 w-12">SKS</th>
                                    <th className="border border-slate-900 p-2 w-16">Kelas</th>
                                    <th className="border border-slate-900 p-2 text-left">Jadwal & Ruang</th>
                                    <th className="border border-slate-900 p-2 text-left">Dosen Pengajar</th>
                                </tr>
                            </thead>
                            <tbody>
                                {details.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="border border-slate-900 p-4 text-center text-text-secondary italic">
                                            Tidak ada matakuliah yang terdaftar pada KRS semester ini.
                                        </td>
                                    </tr>
                                ) : (
                                    details.map((item, idx) => {
                                        const mk = item.kelas_kuliah?.kurikulum_matakuliah?.matakuliah;
                                        const jdw = item.kelas_kuliah?.jadwal_perkuliahans?.[0];
                                        const dsn = item.kelas_kuliah?.dosen_pengajars?.[0]?.dosen;

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
                                                    {jdw ? `${jdw.hari}, ${jdw.jam_mulai.substring(0, 5)}-${jdw.jam_selesai.substring(0, 5)} (${jdw.ruang_kuliah?.nama || 'R. Kelas'})` : '-'}
                                                </td>
                                                <td className="border border-slate-900 p-2">
                                                    {formatDosenName(dsn)}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                            <tfoot>
                                <tr className="bg-slate-100 font-bold border-t border-slate-900">
                                    <td colSpan={3} className="border border-slate-900 p-2 text-right uppercase">
                                        Total SKS Terprogram :
                                    </td>
                                    <td className="border border-slate-900 p-2 text-center">
                                        {totalSks}
                                    </td>
                                    <td colSpan={3} className="border border-slate-900 p-2 text-text-secondary text-[11px]">
                                        (Beban SKS telah diverifikasi sesuai batas IPK)
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    {/* Signatures */}
                    <div className="mt-8 grid grid-cols-3 gap-4 text-xs text-center">
                        <div className="space-y-16">
                            <div>
                                <p className="text-text-secondary">Mahasiswa Bersangkutan,</p>
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
                                <p className="text-text-secondary">Dosen Pembimbing Akademik,</p>
                            </div>
                            <div>
                                <p className="font-semibold underline uppercase text-text-primary">
                                    {formatDosenName(dosenWali)}
                                </p>
                                <p className="font-mono text-[11px] text-text-secondary">NIDN: {dosenWali?.nidn || '-'}</p>
                            </div>
                        </div>

                        <div className="space-y-16">
                            <div>
                                <p className="text-text-secondary">Pasuruan, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                <p className="text-text-secondary">Ketua Program Studi,</p>
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
                            <span>Dokumen ini diterbitkan secara sah oleh SIAKAD STAI Al-Yasini Pasuruan dan tidak memerlukan cap basah manual.</span>
                        </div>
                        <span className="font-mono">Verifikasi: {nomorDokumen}</span>
                    </div>
                </div>
            </div>
        </>
    );
}
