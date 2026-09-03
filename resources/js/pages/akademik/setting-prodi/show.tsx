import { Head, Link, useForm, router } from '@inertiajs/react';
import { 
    Calendar, 
    Check, 
    X, 
    Edit3, 
    ArrowLeft, 
    CheckCircle2, 
    XCircle, 
    BookOpen, 
    GraduationCap, 
    FileText, 
    Settings, 
    Info, 
    Save, 
    Clock 
} from 'lucide-react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface SettingProdiData {
    id: number;
    tahun_ajaran_id: number;
    program_studi_id: number | null;
    kurikulum_id: number | null;
    
    // Tab 1: KRS
    buka_krs: boolean;
    tgl_awal_krs: string | null;
    tgl_akhir_krs: string | null;
    tgl_cetak_krs: string | null;
    buka_validasi_krs: boolean;
    tgl_awal_validasi_krs: string | null;
    tgl_akhir_validasi_krs: string | null;
    dosen_tampil_di_krs: boolean;
    buka_cetak_krs: boolean;

    // Tab 2: KHS & Nilai
    buka_khs: boolean;
    tgl_awal_khs: string | null;
    tgl_akhir_khs: string | null;
    tgl_cetak_khs: string | null;
    buka_pengisian_nilai: boolean;
    dosen_isi_persentase_komponen: boolean;
    tgl_awal_pengisian_nilai: string | null;
    tgl_akhir_pengisian_nilai: string | null;

    // Tab 3: Ujian
    buka_cetak_uts: boolean;
    tgl_awal_cetak_uts: string | null;
    tgl_akhir_cetak_uts: string | null;
    tgl_cetak_uts: string | null;
    min_presensi_uts: number;
    min_presensi_uas: number;
    buka_cetak_uas: boolean;
    tgl_awal_cetak_uas: string | null;
    tgl_akhir_cetak_uas: string | null;
    tgl_cetak_uas: string | null;

    // Tab 4: Lain-lain
    buka_ubah_biodata: boolean;
    buka_kuesioner: boolean;
    tgl_awal_kuesioner: string | null;
    tgl_akhir_kuesioner: string | null;
    dosen_generate_tatap_muka: boolean;
    jumlah_pertemuan_kuliah: number;
    batas_waktu_perubahan_presensi_hari: number;
    buka_setting_ketua_kelas: boolean;

    tahun_ajaran?: { id: number; nama: string };
    program_studi?: { id: number; kode: string; nama: string; jenjang: string };
    kurikulum_prodi?: { id: number; nama: string; tahun_mulai: number };
}

interface Props {
    setting: SettingProdiData;
    perguruanTinggi?: { nama_unit: string };
    kurikulums?: Array<{ id: number; nama: string; tahun_mulai: number }>;
}

function StatusCheck({ active }: { active: boolean }) {
    return active ? (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-medium text-sm border border-emerald-200">
            <Check className="w-4 h-4 text-emerald-600 stroke-[3]" /> Aktif / Ya
        </span>
    ) : (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 font-medium text-sm border border-rose-200">
            <X className="w-4 h-4 text-rose-600 stroke-[3]" /> Tidak Aktif
        </span>
    );
}

export default function SettingProdiShow({ setting, perguruanTinggi, kurikulums = [] }: Props) {
    const [activeTab, setActiveTab] = useState<'krs' | 'khs' | 'ujian' | 'lainnya'>('krs');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Beranda', href: '/dashboard' },
        { title: 'Setting', href: '/akademik/setting-prodi' },
        { title: 'Setting Prodi', href: '/akademik/setting-prodi' },
        { title: 'Detail Setting', href: `/akademik/setting-prodi/${setting.id}` },
    ];

    const form = useForm({
        kurikulum_id: setting.kurikulum_id || '',
        buka_krs: setting.buka_krs ?? true,
        tgl_awal_krs: setting.tgl_awal_krs || '',
        tgl_akhir_krs: setting.tgl_akhir_krs || '',
        tgl_cetak_krs: setting.tgl_cetak_krs || '',
        buka_validasi_krs: setting.buka_validasi_krs ?? true,
        tgl_awal_validasi_krs: setting.tgl_awal_validasi_krs || '',
        tgl_akhir_validasi_krs: setting.tgl_akhir_validasi_krs || '',
        dosen_tampil_di_krs: setting.dosen_tampil_di_krs ?? true,
        buka_cetak_krs: setting.buka_cetak_krs ?? true,

        buka_khs: setting.buka_khs ?? true,
        tgl_awal_khs: setting.tgl_awal_khs || '',
        tgl_akhir_khs: setting.tgl_akhir_khs || '',
        tgl_cetak_khs: setting.tgl_cetak_khs || '',
        buka_pengisian_nilai: setting.buka_pengisian_nilai ?? true,
        dosen_isi_persentase_komponen: setting.dosen_isi_persentase_komponen ?? true,
        tgl_awal_pengisian_nilai: setting.tgl_awal_pengisian_nilai || '',
        tgl_akhir_pengisian_nilai: setting.tgl_akhir_pengisian_nilai || '',

        buka_cetak_uts: setting.buka_cetak_uts ?? true,
        tgl_awal_cetak_uts: setting.tgl_awal_cetak_uts || '',
        tgl_akhir_cetak_uts: setting.tgl_akhir_cetak_uts || '',
        tgl_cetak_uts: setting.tgl_cetak_uts || '',
        min_presensi_uts: setting.min_presensi_uts ?? 50,
        min_presensi_uas: setting.min_presensi_uas ?? 75,
        buka_cetak_uas: setting.buka_cetak_uas ?? false,
        tgl_awal_cetak_uas: setting.tgl_awal_cetak_uas || '',
        tgl_akhir_cetak_uas: setting.tgl_akhir_cetak_uas || '',
        tgl_cetak_uas: setting.tgl_cetak_uas || '',

        buka_ubah_biodata: setting.buka_ubah_biodata ?? false,
        buka_kuesioner: setting.buka_kuesioner ?? true,
        tgl_awal_kuesioner: setting.tgl_awal_kuesioner || '',
        tgl_akhir_kuesioner: setting.tgl_akhir_kuesioner || '',
        dosen_generate_tatap_muka: setting.dosen_generate_tatap_muka ?? false,
        jumlah_pertemuan_kuliah: setting.jumlah_pertemuan_kuliah ?? 16,
        batas_waktu_perubahan_presensi_hari: setting.batas_waktu_perubahan_presensi_hari ?? 3,
        buka_setting_ketua_kelas: setting.buka_setting_ketua_kelas ?? false,
    });

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        form.put(`/akademik/setting-prodi/${setting.id}`, {
            onSuccess: () => setIsEditModalOpen(false),
        });
    };

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) {
return '-';
}

        try {
            const d = new Date(dateStr);

            return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
        } catch {
            return dateStr;
        }
    };

    return (
        <>
            <Head title="Setting Program Studi & Perkuliahan" />

            <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
                {/* Header Title & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                            <Settings className="w-6 h-6 text-emerald-600" />
                            Setting
                            <span className="text-base font-normal text-slate-500">Detail Setting Program Studi</span>
                        </h1>
                        <p className="text-sm text-slate-600 mt-1">
                            Pengaturan jadwal KRS, KHS, Ujian UTS/UAS, dan hak akses akademik per program studi.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            href="/akademik/setting-prodi"
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-medium text-sm shadow-sm transition"
                        >
                            <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar
                        </Link>
                        <button
                            type="button"
                            onClick={() => setIsEditModalOpen(true)}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm shadow-sm transition"
                        >
                            <Edit3 className="w-4 h-4" /> Edit Pengaturan
                        </button>
                    </div>
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden border-t-4 border-t-emerald-600">
                    {/* Top Meta Info (Periode, Prodi, Kurikulum) */}
                    <div className="p-6 bg-slate-50/70 border-b border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                        <div className="space-y-3">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                                <span className="w-40 font-semibold text-slate-700">Periode Akademik:</span>
                                <span className="font-bold text-slate-900 text-base bg-emerald-100/80 text-emerald-900 px-3 py-1 rounded-md border border-emerald-300">
                                    {setting.tahun_ajaran?.nama || '2025/2026 Genap'}
                                </span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                                <span className="w-40 font-semibold text-slate-700">Kurikulum Mahasiswa Baru:</span>
                                <span className="text-slate-800 font-medium">
                                    {setting.kurikulum_prodi ? `${setting.kurikulum_prodi.nama} (${setting.kurikulum_prodi.tahun_mulai})` : 'Mengikuti Kurikulum Default Prodi'}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                                <span className="w-40 font-semibold text-slate-700">Program Studi:</span>
                                <span className="font-bold text-slate-900 text-base">
                                    {setting.program_studi ? `${setting.program_studi.jenjang} - ${setting.program_studi.nama}` : (perguruanTinggi?.nama_unit || 'Semua Program Studi (Setting Global Kampus)')}
                                </span>
                            </div>
                            {setting.program_studi?.kode && (
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                                    <span className="w-40 font-semibold text-slate-700">Kode Prodi:</span>
                                    <span className="text-slate-600 font-mono font-medium">{setting.program_studi.kode}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Navigation Tabs (Senior-friendly, large buttons) */}
                    <div className="border-b border-slate-200 bg-white px-6 pt-4 flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={() => setActiveTab('krs')}
                            className={`px-5 py-3 rounded-t-lg font-semibold text-sm transition-all flex items-center gap-2 border-b-2 ${
                                activeTab === 'krs'
                                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 border-transparent'
                            }`}
                        >
                            <BookOpen className="w-4 h-4" /> KRS & Validasi
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('khs')}
                            className={`px-5 py-3 rounded-t-lg font-semibold text-sm transition-all flex items-center gap-2 border-b-2 ${
                                activeTab === 'khs'
                                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 border-transparent'
                            }`}
                        >
                            <GraduationCap className="w-4 h-4" /> KHS & Nilai
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('ujian')}
                            className={`px-5 py-3 rounded-t-lg font-semibold text-sm transition-all flex items-center gap-2 border-b-2 ${
                                activeTab === 'ujian'
                                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 border-transparent'
                            }`}
                        >
                            <FileText className="w-4 h-4" /> Ujian
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('lainnya')}
                            className={`px-5 py-3 rounded-t-lg font-semibold text-sm transition-all flex items-center gap-2 border-b-2 ${
                                activeTab === 'lainnya'
                                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 border-transparent'
                            }`}
                        >
                            <Settings className="w-4 h-4" /> Lain-lain
                        </button>
                    </div>

                    {/* Tab 1: KRS & Validasi Content */}
                    {activeTab === 'krs' && (
                        <div className="p-6 sm:p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 text-sm">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between py-2.5 border-b border-slate-100">
                                        <span className="font-semibold text-slate-700">Buka KRS?</span>
                                        <StatusCheck active={setting.buka_krs} />
                                    </div>
                                    <div className="flex items-center justify-between py-2.5 border-b border-slate-100">
                                        <span className="font-semibold text-slate-700">Tanggal Awal KRS</span>
                                        <span className="font-medium text-slate-900">{formatDate(setting.tgl_awal_krs)}</span>
                                    </div>
                                    <div className="flex items-center justify-between py-2.5 border-b border-slate-100">
                                        <span className="font-semibold text-slate-700">Tanggal Akhir KRS</span>
                                        <span className="font-medium text-slate-900">{formatDate(setting.tgl_akhir_krs)}</span>
                                    </div>
                                    <div className="flex items-center justify-between py-2.5 border-b border-slate-100">
                                        <span className="font-semibold text-slate-700">Tanggal Cetak KRS</span>
                                        <span className="font-medium text-slate-900">{formatDate(setting.tgl_cetak_krs)}</span>
                                    </div>
                                    <div className="flex items-center justify-between py-2.5 border-b border-slate-100">
                                        <span className="font-semibold text-slate-700">Buka Validasi KRS?</span>
                                        <StatusCheck active={setting.buka_validasi_krs} />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between py-2.5 border-b border-slate-100">
                                        <span className="font-semibold text-slate-700">Tanggal Awal Validasi KRS</span>
                                        <span className="font-medium text-slate-900">{formatDate(setting.tgl_awal_validasi_krs)}</span>
                                    </div>
                                    <div className="flex items-center justify-between py-2.5 border-b border-slate-100">
                                        <span className="font-semibold text-slate-700">Tanggal Akhir Validasi KRS</span>
                                        <span className="font-medium text-slate-900">{formatDate(setting.tgl_akhir_validasi_krs)}</span>
                                    </div>
                                    <div className="flex items-center justify-between py-2.5 border-b border-slate-100">
                                        <span className="font-semibold text-slate-700">Dosen Tampil Di KRS</span>
                                        <StatusCheck active={setting.dosen_tampil_di_krs} />
                                    </div>
                                    <div className="flex items-center justify-between py-2.5 border-b border-slate-100">
                                        <span className="font-semibold text-slate-700">Buka Cetak KRS?</span>
                                        <StatusCheck active={setting.buka_cetak_krs} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tab 2: KHS & Nilai Content */}
                    {activeTab === 'khs' && (
                        <div className="p-6 sm:p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 text-sm">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between py-2.5 border-b border-slate-100">
                                        <span className="font-semibold text-slate-700">Buka KHS?</span>
                                        <StatusCheck active={setting.buka_khs} />
                                    </div>
                                    <div className="flex items-center justify-between py-2.5 border-b border-slate-100">
                                        <span className="font-semibold text-slate-700">Tanggal Awal KHS</span>
                                        <span className="font-medium text-slate-900">{formatDate(setting.tgl_awal_khs)}</span>
                                    </div>
                                    <div className="flex items-center justify-between py-2.5 border-b border-slate-100">
                                        <span className="font-semibold text-slate-700">Tanggal Akhir KHS</span>
                                        <span className="font-medium text-slate-900">{formatDate(setting.tgl_akhir_khs)}</span>
                                    </div>
                                    <div className="flex items-center justify-between py-2.5 border-b border-slate-100">
                                        <span className="font-semibold text-slate-700">Tanggal Cetak KHS</span>
                                        <span className="font-medium text-slate-900">{formatDate(setting.tgl_cetak_khs)}</span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between py-2.5 border-b border-slate-100">
                                        <span className="font-semibold text-slate-700">Buka Pengisian Nilai?</span>
                                        <StatusCheck active={setting.buka_pengisian_nilai} />
                                    </div>
                                    <div className="flex items-center justify-between py-2.5 border-b border-slate-100">
                                        <span className="font-semibold text-slate-700">Dosen Bisa Isi Persentase Komponen?</span>
                                        <StatusCheck active={setting.dosen_isi_persentase_komponen} />
                                    </div>
                                    <div className="flex items-center justify-between py-2.5 border-b border-slate-100">
                                        <span className="font-semibold text-slate-700">Tanggal Awal Pengisian Nilai</span>
                                        <span className="font-medium text-slate-900">{formatDate(setting.tgl_awal_pengisian_nilai)}</span>
                                    </div>
                                    <div className="flex items-center justify-between py-2.5 border-b border-slate-100">
                                        <span className="font-semibold text-slate-700">Tanggal Akhir Pengisian Nilai</span>
                                        <span className="font-medium text-slate-900">{formatDate(setting.tgl_akhir_pengisian_nilai)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tab 3: Ujian Content */}
                    {activeTab === 'ujian' && (
                        <div className="p-6 sm:p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 text-sm">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between py-2.5 border-b border-slate-100">
                                        <span className="font-semibold text-slate-700">Buka Cetak Kartu UTS?</span>
                                        <StatusCheck active={setting.buka_cetak_uts} />
                                    </div>
                                    <div className="flex items-center justify-between py-2.5 border-b border-slate-100">
                                        <span className="font-semibold text-slate-700">Tanggal Awal Cetak UTS</span>
                                        <span className="font-medium text-slate-900">{formatDate(setting.tgl_awal_cetak_uts)}</span>
                                    </div>
                                    <div className="flex items-center justify-between py-2.5 border-b border-slate-100">
                                        <span className="font-semibold text-slate-700">Tanggal Akhir Cetak UTS</span>
                                        <span className="font-medium text-slate-900">{formatDate(setting.tgl_akhir_cetak_uts)}</span>
                                    </div>
                                    <div className="flex items-center justify-between py-2.5 border-b border-slate-100">
                                        <span className="font-semibold text-slate-700">Tanggal Cetak UTS</span>
                                        <span className="font-medium text-slate-900">{formatDate(setting.tgl_cetak_uts)}</span>
                                    </div>
                                    <div className="flex items-center justify-between py-2.5 border-b border-slate-100">
                                        <span className="font-semibold text-slate-700">Minimal Presensi UTS (Persentase)</span>
                                        <span className="font-bold text-slate-900 text-base bg-slate-100 px-3 py-1 rounded">{setting.min_presensi_uts}%</span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between py-2.5 border-b border-slate-100">
                                        <span className="font-semibold text-slate-700">Minimal Presensi UAS (Persentase)</span>
                                        <span className="font-bold text-slate-900 text-base bg-slate-100 px-3 py-1 rounded">{setting.min_presensi_uas}%</span>
                                    </div>
                                    <div className="flex items-center justify-between py-2.5 border-b border-slate-100">
                                        <span className="font-semibold text-slate-700">Buka Cetak Kartu UAS?</span>
                                        <StatusCheck active={setting.buka_cetak_uas} />
                                    </div>
                                    <div className="flex items-center justify-between py-2.5 border-b border-slate-100">
                                        <span className="font-semibold text-slate-700">Tanggal Awal Cetak UAS</span>
                                        <span className="font-medium text-slate-900">{formatDate(setting.tgl_awal_cetak_uas)}</span>
                                    </div>
                                    <div className="flex items-center justify-between py-2.5 border-b border-slate-100">
                                        <span className="font-semibold text-slate-700">Tanggal Akhir Cetak UAS</span>
                                        <span className="font-medium text-slate-900">{formatDate(setting.tgl_akhir_cetak_uas)}</span>
                                    </div>
                                    <div className="flex items-center justify-between py-2.5 border-b border-slate-100">
                                        <span className="font-semibold text-slate-700">Tanggal Cetak UAS</span>
                                        <span className="font-medium text-slate-900">{formatDate(setting.tgl_cetak_uas)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tab 4: Lain-lain Content */}
                    {activeTab === 'lainnya' && (
                        <div className="p-6 sm:p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 text-sm">
                                <div className="space-y-4">
                                    <div className="py-2.5 border-b border-slate-100">
                                        <div className="flex items-center justify-between">
                                            <span className="font-semibold text-slate-700">Buka Pengubahan Biodata?</span>
                                            <StatusCheck active={setting.buka_ubah_biodata} />
                                        </div>
                                        <p className="text-xs text-slate-500 mt-2 flex items-start gap-1.5 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                                            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                            <span>Jika diaktifkan, mahasiswa dapat mengubah biodata pribadinya sendiri (NIK, Paspor, Jenis Kelamin, Tempat Lahir, Tanggal Lahir, Nama Lengkap Keluarga).</span>
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-between py-2.5 border-b border-slate-100">
                                        <span className="font-semibold text-slate-700">Buka Kuesioner (EDOM)?</span>
                                        <StatusCheck active={setting.buka_kuesioner} />
                                    </div>
                                    <div className="flex items-center justify-between py-2.5 border-b border-slate-100">
                                        <span className="font-semibold text-slate-700">Tanggal Awal Kuesioner</span>
                                        <span className="font-medium text-slate-900">{formatDate(setting.tgl_awal_kuesioner)}</span>
                                    </div>
                                    <div className="flex items-center justify-between py-2.5 border-b border-slate-100">
                                        <span className="font-semibold text-slate-700">Tanggal Akhir Kuesioner</span>
                                        <span className="font-medium text-slate-900">{formatDate(setting.tgl_akhir_kuesioner)}</span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between py-2.5 border-b border-slate-100">
                                        <span className="font-semibold text-slate-700">Dosen Bisa Generate Tatap Muka?</span>
                                        <StatusCheck active={setting.dosen_generate_tatap_muka} />
                                    </div>
                                    <div className="flex items-center justify-between py-2.5 border-b border-slate-100">
                                        <span className="font-semibold text-slate-700">Jumlah Pertemuan Kuliah</span>
                                        <span className="font-bold text-slate-900 text-base bg-slate-100 px-3 py-1 rounded">{setting.jumlah_pertemuan_kuliah} Pertemuan</span>
                                    </div>
                                    <div className="flex items-center justify-between py-2.5 border-b border-slate-100">
                                        <span className="font-semibold text-slate-700">Batas Waktu Perubahan Status Kuliah & Presensi oleh Dosen</span>
                                        <span className="font-bold text-slate-900 text-base bg-slate-100 px-3 py-1 rounded">{setting.batas_waktu_perubahan_presensi_hari} Hari</span>
                                    </div>
                                    <div className="flex items-center justify-between py-2.5 border-b border-slate-100">
                                        <span className="font-semibold text-slate-700">Buka Setting Ketua Kelas?</span>
                                        <StatusCheck active={setting.buka_setting_ketua_kelas} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Modal with Tabbed Form Controls (Senior-friendly) */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
                        <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    <Edit3 className="w-5 h-5 text-amber-400" /> Edit Pengaturan Program Studi
                                </h3>
                                <p className="text-xs text-slate-300 mt-1">
                                    {setting.program_studi ? `${setting.program_studi.jenjang} - ${setting.program_studi.nama}` : 'Setting Global Kampus'} • {setting.tahun_ajaran?.nama}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsEditModalOpen(false)}
                                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-8">
                            {/* Section 1: KRS & Validasi */}
                            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
                                <h4 className="font-bold text-slate-900 text-base flex items-center gap-2 border-b border-slate-200 pb-2">
                                    <BookOpen className="w-5 h-5 text-sky-600" /> 1. Pengaturan KRS & Validasi Dosen Wali
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                    <label className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={form.data.buka_krs}
                                            onChange={e => form.setData('buka_krs', e.target.checked)}
                                            className="w-5 h-5 text-emerald-600 rounded border-slate-300"
                                        />
                                        <span className="text-sm font-semibold text-slate-800">Buka KRS Mahasiswa</span>
                                    </label>
                                    <label className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={form.data.buka_validasi_krs}
                                            onChange={e => form.setData('buka_validasi_krs', e.target.checked)}
                                            className="w-5 h-5 text-emerald-600 rounded border-slate-300"
                                        />
                                        <span className="text-sm font-semibold text-slate-800">Buka Validasi KRS</span>
                                    </label>
                                    <label className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={form.data.dosen_tampil_di_krs}
                                            onChange={e => form.setData('dosen_tampil_di_krs', e.target.checked)}
                                            className="w-5 h-5 text-emerald-600 rounded border-slate-300"
                                        />
                                        <span className="text-sm font-semibold text-slate-800">Dosen Tampil Di KRS</span>
                                    </label>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Awal KRS</label>
                                        <input
                                            type="date"
                                            value={form.data.tgl_awal_krs}
                                            onChange={e => form.setData('tgl_awal_krs', e.target.value)}
                                            className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Akhir KRS</label>
                                        <input
                                            type="date"
                                            value={form.data.tgl_akhir_krs}
                                            onChange={e => form.setData('tgl_akhir_krs', e.target.value)}
                                            className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Cetak KRS</label>
                                        <input
                                            type="date"
                                            value={form.data.tgl_cetak_krs}
                                            onChange={e => form.setData('tgl_cetak_krs', e.target.value)}
                                            className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: KHS & Nilai */}
                            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
                                <h4 className="font-bold text-slate-900 text-base flex items-center gap-2 border-b border-slate-200 pb-2">
                                    <GraduationCap className="w-5 h-5 text-emerald-600" /> 2. Pengaturan KHS & Input Nilai Dosen
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                    <label className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={form.data.buka_khs}
                                            onChange={e => form.setData('buka_khs', e.target.checked)}
                                            className="w-5 h-5 text-emerald-600 rounded border-slate-300"
                                        />
                                        <span className="text-sm font-semibold text-slate-800">Buka KHS Mahasiswa</span>
                                    </label>
                                    <label className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={form.data.buka_pengisian_nilai}
                                            onChange={e => form.setData('buka_pengisian_nilai', e.target.checked)}
                                            className="w-5 h-5 text-emerald-600 rounded border-slate-300"
                                        />
                                        <span className="text-sm font-semibold text-slate-800">Buka Pengisian Nilai</span>
                                    </label>
                                    <label className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={form.data.dosen_isi_persentase_komponen}
                                            onChange={e => form.setData('dosen_isi_persentase_komponen', e.target.checked)}
                                            className="w-5 h-5 text-emerald-600 rounded border-slate-300"
                                        />
                                        <span className="text-sm font-semibold text-slate-800">Dosen Ubah Komponen Nilai</span>
                                    </label>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Cetak KHS</label>
                                        <input
                                            type="date"
                                            value={form.data.tgl_cetak_khs}
                                            onChange={e => form.setData('tgl_cetak_khs', e.target.value)}
                                            className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">Awal Pengisian Nilai</label>
                                        <input
                                            type="date"
                                            value={form.data.tgl_awal_pengisian_nilai}
                                            onChange={e => form.setData('tgl_awal_pengisian_nilai', e.target.value)}
                                            className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">Akhir Pengisian Nilai</label>
                                        <input
                                            type="date"
                                            value={form.data.tgl_akhir_pengisian_nilai}
                                            onChange={e => form.setData('tgl_akhir_pengisian_nilai', e.target.value)}
                                            className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section 3: Ujian */}
                            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
                                <h4 className="font-bold text-slate-900 text-base flex items-center gap-2 border-b border-slate-200 pb-2">
                                    <FileText className="w-5 h-5 text-purple-600" /> 3. Pengaturan Kartu Ujian (UTS & UAS)
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <label className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={form.data.buka_cetak_uts}
                                            onChange={e => form.setData('buka_cetak_uts', e.target.checked)}
                                            className="w-5 h-5 text-emerald-600 rounded border-slate-300"
                                        />
                                        <span className="text-sm font-semibold text-slate-800">Buka Cetak Kartu UTS</span>
                                    </label>
                                    <label className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={form.data.buka_cetak_uas}
                                            onChange={e => form.setData('buka_cetak_uas', e.target.checked)}
                                            className="w-5 h-5 text-emerald-600 rounded border-slate-300"
                                        />
                                        <span className="text-sm font-semibold text-slate-800">Buka Cetak Kartu UAS</span>
                                    </label>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">Syarat Minimal Presensi UTS (%)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={form.data.min_presensi_uts}
                                            onChange={e => form.setData('min_presensi_uts', Number(e.target.value))}
                                            className="w-full px-3 py-2 border rounded-lg text-sm bg-white font-bold text-slate-800"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">Syarat Minimal Presensi UAS (%)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={form.data.min_presensi_uas}
                                            onChange={e => form.setData('min_presensi_uas', Number(e.target.value))}
                                            className="w-full px-3 py-2 border rounded-lg text-sm bg-white font-bold text-slate-800"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section 4: Lain-lain */}
                            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
                                <h4 className="font-bold text-slate-900 text-base flex items-center gap-2 border-b border-slate-200 pb-2">
                                    <Settings className="w-5 h-5 text-slate-700" /> 4. Pengaturan Lain-lain (Biodata, Presensi & Pertemuan)
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <label className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={form.data.buka_ubah_biodata}
                                            onChange={e => form.setData('buka_ubah_biodata', e.target.checked)}
                                            className="w-5 h-5 text-emerald-600 rounded border-slate-300"
                                        />
                                        <div>
                                            <span className="text-sm font-semibold text-slate-800 block">Buka Pengubahan Biodata</span>
                                            <span className="text-xs text-slate-500">Mahasiswa dapat edit profil mandiri</span>
                                        </div>
                                    </label>
                                    <label className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={form.data.dosen_generate_tatap_muka}
                                            onChange={e => form.setData('dosen_generate_tatap_muka', e.target.checked)}
                                            className="w-5 h-5 text-emerald-600 rounded border-slate-300"
                                        />
                                        <div>
                                            <span className="text-sm font-semibold text-slate-800 block">Dosen Generate Tatap Muka</span>
                                            <span className="text-xs text-slate-500">Izin dosen membuat jadwal sesi mandiri</span>
                                        </div>
                                    </label>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">Standar Jumlah Pertemuan Kuliah</label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="32"
                                            value={form.data.jumlah_pertemuan_kuliah}
                                            onChange={e => form.setData('jumlah_pertemuan_kuliah', Number(e.target.value))}
                                            className="w-full px-3 py-2 border rounded-lg text-sm bg-white font-bold text-slate-800"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">Batas Waktu Edit Presensi (Hari)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="30"
                                            value={form.data.batas_waktu_perubahan_presensi_hari}
                                            onChange={e => form.setData('batas_waktu_perubahan_presensi_hari', Number(e.target.value))}
                                            className="w-full px-3 py-2 border rounded-lg text-sm bg-white font-bold text-slate-800"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Modal Action Buttons */}
                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                                <button
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium text-sm transition"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={form.processing}
                                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md transition disabled:opacity-50"
                                >
                                    <Save className="w-4 h-4" /> Simpan Pengaturan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

SettingProdiShow.layout = {
    breadcrumbs: [
        { title: 'Beranda', href: '/dashboard' },
        { title: 'Akademik Kampus', href: '/akademik/setting-prodi' },
        { title: 'Setting Prodi', href: '/akademik/setting-prodi' },
        { title: 'Detail Setting', href: '/akademik/setting-prodi' },
    ],
};

