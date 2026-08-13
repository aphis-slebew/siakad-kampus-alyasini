import { Head, useForm } from '@inertiajs/react';
import { Building2, Calendar, FileText, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type ProgramStudi = {
    id: number;
    kode: string;
    nama: string;
    jenjang: string;
};

type Gelombang = {
    id: number;
    nama: string;
};

type Jalur = {
    id: number;
    nama: string;
};

export default function PmbPublicRegister({
    gelombangs = [],
    jalurs = [],
    programStudis = [],
}: {
    gelombangs: Gelombang[];
    jalurs: Jalur[];
    programStudis: ProgramStudi[];
}) {
    const form = useForm({
        gelombang_pendaftaran_id: gelombangs[0]?.id || '',
        jalur_pendaftaran_id: jalurs[0]?.id || '',
        program_studi_pilihan_1_id: '',
        program_studi_pilihan_2_id: '',
        nama_lengkap: '',
        nik: '',
        tempat_lahir: '',
        tanggal_lahir: '',
        jenis_kelamin: 'L',
        alamat: '',
        no_hp: '',
        email: '',
        asal_sekolah: '',
        tahun_lulus_sekolah: new Date().getFullYear(),
        password: '',
        password_confirmation: '',
        berkas_ijazah: null as File | null,
        berkas_kk: null as File | null,
        berkas_ktp: null as File | null,
        berkas_foto: null as File | null,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/pmb/daftar');
    };

    return (
        <div className="min-h-screen bg-surface-base flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <Head title="Pendaftaran Calon Mahasiswa Baru - STAI Al-Yasini" />

            <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
                <div className="flex justify-center mb-2">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-brand-primary text-white font-bold text-sm">
                        SY
                    </div>
                </div>
                <h2 className="text-center text-2xl font-bold text-text-primary">
                    Pendaftaran Mahasiswa Baru
                </h2>
                <p className="mt-1 text-center text-xs text-text-secondary">
                    STAI Al-Yasini Pasuruan — Tahun Ajaran 2026/2027
                </p>
            </div>

            <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-2xl">
                <div className="bg-surface-card py-8 px-6 shadow-xs border border-border-default rounded-lg sm:px-10">
                    <form onSubmit={handleSubmit} className="space-y-6" encType="multipart/form-data">
                        {/* Section 1: Pilihan Gelombang & Jalur */}
                        <div className="border-b border-border-default pb-4 space-y-4">
                            <h3 className="text-sm font-semibold text-brand-primary flex items-center gap-2">
                                <Calendar className="size-4" />
                                1. Pilihan Gelombang & Jalur Pendaftaran
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-text-primary">
                                        Gelombang Pendaftaran <span className="text-status-danger">*</span>
                                    </Label>
                                    <select
                                        value={form.data.gelombang_pendaftaran_id}
                                        onChange={(e) => form.setData('gelombang_pendaftaran_id', e.target.value)}
                                        className="w-full text-xs rounded-md border border-border-default bg-surface-card p-2 text-text-primary focus:ring-2 focus:ring-brand-primary"
                                    >
                                        <option value="">Pilih Gelombang</option>
                                        {gelombangs.map((g) => (
                                            <option key={g.id} value={g.id}>
                                                {g.nama}
                                            </option>
                                        ))}
                                    </select>
                                    {form.errors.gelombang_pendaftaran_id && (
                                        <p className="text-[11px] text-status-danger">{form.errors.gelombang_pendaftaran_id}</p>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-text-primary">
                                        Jalur Pendaftaran <span className="text-status-danger">*</span>
                                    </Label>
                                    <select
                                        value={form.data.jalur_pendaftaran_id}
                                        onChange={(e) => form.setData('jalur_pendaftaran_id', e.target.value)}
                                        className="w-full text-xs rounded-md border border-border-default bg-surface-card p-2 text-text-primary focus:ring-2 focus:ring-brand-primary"
                                    >
                                        <option value="">Pilih Jalur</option>
                                        {jalurs.map((j) => (
                                            <option key={j.id} value={j.id}>
                                                {j.nama}
                                            </option>
                                        ))}
                                    </select>
                                    {form.errors.jalur_pendaftaran_id && (
                                        <p className="text-[11px] text-status-danger">{form.errors.jalur_pendaftaran_id}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Pilihan Program Studi */}
                        <div className="border-b border-border-default pb-4 space-y-4">
                            <h3 className="text-sm font-semibold text-brand-primary flex items-center gap-2">
                                <Building2 className="size-4" />
                                2. Pilihan Program Studi
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-text-primary">
                                        Pilihan Program Studi 1 <span className="text-status-danger">*</span>
                                    </Label>
                                    <select
                                        value={form.data.program_studi_pilihan_1_id}
                                        onChange={(e) => form.setData('program_studi_pilihan_1_id', e.target.value)}
                                        className="w-full text-xs rounded-md border border-border-default bg-surface-card p-2 text-text-primary focus:ring-2 focus:ring-brand-primary"
                                    >
                                        <option value="">Pilih Program Studi Utama</option>
                                        {programStudis.map((p) => (
                                            <option key={p.id} value={p.id}>
                                                {p.jenjang} - {p.nama} ({p.kode})
                                            </option>
                                        ))}
                                    </select>
                                    {form.errors.program_studi_pilihan_1_id && (
                                        <p className="text-[11px] text-status-danger">{form.errors.program_studi_pilihan_1_id}</p>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-text-primary">
                                        Pilihan Program Studi 2 (Opsional)
                                    </Label>
                                    <select
                                        value={form.data.program_studi_pilihan_2_id}
                                        onChange={(e) => form.setData('program_studi_pilihan_2_id', e.target.value)}
                                        className="w-full text-xs rounded-md border border-border-default bg-surface-card p-2 text-text-primary focus:ring-2 focus:ring-brand-primary"
                                    >
                                        <option value="">Pilih Program Studi Alternatif</option>
                                        {programStudis.map((p) => (
                                            <option key={p.id} value={p.id}>
                                                {p.jenjang} - {p.nama} ({p.kode})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Biodata Calon Mahasiswa */}
                        <div className="border-b border-border-default pb-4 space-y-4">
                            <h3 className="text-sm font-semibold text-brand-primary flex items-center gap-2">
                                <UserCheck className="size-4" />
                                3. Biodata Calon Mahasiswa
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5 sm:col-span-2">
                                    <Label className="text-xs font-semibold text-text-primary">
                                        Nama Lengkap <span className="text-status-danger">*</span>
                                    </Label>
                                    <Input
                                        placeholder="Sesuai Ijazah / KTP"
                                        value={form.data.nama_lengkap}
                                        onChange={(e) => form.setData('nama_lengkap', e.target.value)}
                                        className="text-xs border-border-default focus-visible:ring-brand-primary"
                                    />
                                    {form.errors.nama_lengkap && (
                                        <p className="text-[11px] text-status-danger">{form.errors.nama_lengkap}</p>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-text-primary">
                                        NIK (Nomor Induk Kependudukan) <span className="text-status-danger">*</span>
                                    </Label>
                                    <Input
                                        placeholder="16 digit NIK"
                                        maxLength={16}
                                        value={form.data.nik}
                                        onChange={(e) => form.setData('nik', e.target.value)}
                                        className="text-xs border-border-default focus-visible:ring-brand-primary font-mono"
                                    />
                                    {form.errors.nik && (
                                        <p className="text-[11px] text-status-danger">{form.errors.nik}</p>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-text-primary">
                                        Jenis Kelamin <span className="text-status-danger">*</span>
                                    </Label>
                                    <select
                                        value={form.data.jenis_kelamin}
                                        onChange={(e) => form.setData('jenis_kelamin', e.target.value)}
                                        className="w-full text-xs rounded-md border border-border-default bg-surface-card p-2 text-text-primary focus:ring-2 focus:ring-brand-primary"
                                    >
                                        <option value="L">Laki-laki</option>
                                        <option value="P">Perempuan</option>
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-text-primary">
                                        Tempat Lahir <span className="text-status-danger">*</span>
                                    </Label>
                                    <Input
                                        placeholder="Kota lahir"
                                        value={form.data.tempat_lahir}
                                        onChange={(e) => form.setData('tempat_lahir', e.target.value)}
                                        className="text-xs border-border-default focus-visible:ring-brand-primary"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-text-primary">
                                        Tanggal Lahir <span className="text-status-danger">*</span>
                                    </Label>
                                    <Input
                                        type="date"
                                        value={form.data.tanggal_lahir}
                                        onChange={(e) => form.setData('tanggal_lahir', e.target.value)}
                                        className="text-xs border-border-default focus-visible:ring-brand-primary"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-text-primary">
                                        No. Handphone / WhatsApp <span className="text-status-danger">*</span>
                                    </Label>
                                    <Input
                                        placeholder="08123456789"
                                        value={form.data.no_hp}
                                        onChange={(e) => form.setData('no_hp', e.target.value)}
                                        className="text-xs border-border-default focus-visible:ring-brand-primary font-mono"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-text-primary">
                                        Email Aktif <span className="text-status-danger">*</span>
                                    </Label>
                                    <Input
                                        type="email"
                                        placeholder="email@domain.com"
                                        value={form.data.email}
                                        onChange={(e) => form.setData('email', e.target.value)}
                                        className="text-xs border-border-default focus-visible:ring-brand-primary"
                                    />
                                    {form.errors.email && (
                                        <p className="text-[11px] text-status-danger">{form.errors.email}</p>
                                    )}
                                </div>

                                <div className="space-y-1.5 sm:col-span-2">
                                    <Label className="text-xs font-semibold text-text-primary">
                                        Alamat Lengkap <span className="text-status-danger">*</span>
                                    </Label>
                                    <Input
                                        placeholder="Dusun, Desa, Kecamatan, Kabupaten"
                                        value={form.data.alamat}
                                        onChange={(e) => form.setData('alamat', e.target.value)}
                                        className="text-xs border-border-default focus-visible:ring-brand-primary"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-text-primary">
                                        Asal Sekolah / Madrasah <span className="text-status-danger">*</span>
                                    </Label>
                                    <Input
                                        placeholder="SMA / MA / SMK"
                                        value={form.data.asal_sekolah}
                                        onChange={(e) => form.setData('asal_sekolah', e.target.value)}
                                        className="text-xs border-border-default focus-visible:ring-brand-primary"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-text-primary">
                                        Tahun Lulus <span className="text-status-danger">*</span>
                                    </Label>
                                    <Input
                                        type="number"
                                        value={form.data.tahun_lulus_sekolah}
                                        onChange={(e) => form.setData('tahun_lulus_sekolah', Number(e.target.value))}
                                        className="text-xs border-border-default focus-visible:ring-brand-primary font-mono"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 4: Upload Berkas Pendaftaran */}
                        <div className="border-b border-border-default pb-4 space-y-4">
                            <h3 className="text-sm font-semibold text-brand-primary flex items-center gap-2">
                                <FileText className="size-4" />
                                4. Upload Berkas Persyaratan (PDF / JPG / PNG, Max 2MB)
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-text-primary">
                                        Ijazah / SKL (PDF / Image, Max 2MB)
                                    </Label>
                                    <Input
                                        type="file"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        onChange={(e) => form.setData('berkas_ijazah', e.target.files?.[0] || null)}
                                        className="text-xs border-border-default"
                                    />
                                    {form.errors.berkas_ijazah && (
                                        <p className="text-[11px] text-status-danger">{form.errors.berkas_ijazah}</p>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-text-primary">
                                        Kartu Keluarga / KK (PDF / Image, Max 2MB)
                                    </Label>
                                    <Input
                                        type="file"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        onChange={(e) => form.setData('berkas_kk', e.target.files?.[0] || null)}
                                        className="text-xs border-border-default"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-text-primary">
                                        KTP / Akta Kelahiran (PDF / Image, Max 2MB)
                                    </Label>
                                    <Input
                                        type="file"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        onChange={(e) => form.setData('berkas_ktp', e.target.files?.[0] || null)}
                                        className="text-xs border-border-default"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-text-primary">
                                        Pasfoto Berwarna (JPG / PNG, Max 1MB)
                                    </Label>
                                    <Input
                                        type="file"
                                        accept=".jpg,.jpeg,.png"
                                        onChange={(e) => form.setData('berkas_foto', e.target.files?.[0] || null)}
                                        className="text-xs border-border-default"
                                    />
                                    {form.errors.berkas_foto && (
                                        <p className="text-[11px] text-status-danger">{form.errors.berkas_foto}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Section 5: Kata Sandi Akun PMB */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-brand-primary flex items-center gap-2">
                                <UserCheck className="size-4" />
                                5. Kata Sandi Akun PMB
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-text-primary">
                                        Kata Sandi <span className="text-status-danger">*</span>
                                    </Label>
                                    <Input
                                        type="password"
                                        placeholder="Minimal 8 karakter"
                                        value={form.data.password}
                                        onChange={(e) => form.setData('password', e.target.value)}
                                        className="text-xs border-border-default focus-visible:ring-brand-primary"
                                    />
                                    {form.errors.password && (
                                        <p className="text-[11px] text-status-danger">{form.errors.password}</p>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-text-primary">
                                        Konfirmasi Kata Sandi <span className="text-status-danger">*</span>
                                    </Label>
                                    <Input
                                        type="password"
                                        placeholder="Ulangi kata sandi"
                                        value={form.data.password_confirmation}
                                        onChange={(e) => form.setData('password_confirmation', e.target.value)}
                                        className="text-xs border-border-default focus-visible:ring-brand-primary"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-4">
                            <Button
                                type="submit"
                                disabled={form.processing}
                                className="w-full bg-brand-primary text-white hover:bg-brand-primary-dark font-semibold py-2.5 rounded-md text-xs shadow-xs"
                            >
                                {form.processing ? 'Mengirim Pendaftaran & Upload Berkas...' : 'Kirim Pendaftaran PMB'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
