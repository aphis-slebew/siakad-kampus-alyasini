import { Form, Head } from '@inertiajs/react';
import { 
    AlertCircle, 
    KeyRound, 
    Lock, 
    LogIn, 
    Mail, 
    ShieldAlert, 
    Sparkles,
    Shield,
    Users,
    GraduationCap,
    Building2,
    CreditCard,
    Award,
    ClipboardCheck,
    Briefcase,
    UserPlus,
    Trophy
} from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

const devRoles = [
    {
        name: 'Superadmin',
        desc: 'Hak Akses Penuh Sistem',
        email: 'admin@alyasini.ac.id',
        href: '/dev-auth/superadmin',
        icon: Shield,
        color: 'bg-purple-50/90 hover:bg-purple-100 border-purple-200/80 text-purple-950',
        iconColor: 'text-purple-600',
    },
    {
        name: 'BAA (Akademik)',
        desc: 'Kelas, Jadwal & Kurikulum',
        email: 'akademik@alyasini.ac.id',
        href: '/dev-auth/akademik',
        icon: Building2,
        color: 'bg-blue-50/90 hover:bg-blue-100 border-blue-200/80 text-blue-950',
        iconColor: 'text-blue-600',
    },
    {
        name: 'Dosen Pengajar',
        desc: 'Presensi, Nilai & Perwalian',
        email: 'dosen@alyasini.ac.id',
        href: '/dev-auth/dosen',
        icon: GraduationCap,
        color: 'bg-emerald-50/90 hover:bg-emerald-100 border-emerald-200/80 text-emerald-950',
        iconColor: 'text-emerald-600',
    },
    {
        name: 'Kaprodi (KPS)',
        desc: 'Pimpinan Program Studi',
        email: 'kaprodi@alyasini.ac.id',
        href: '/dev-auth/kaprodi',
        icon: Award,
        color: 'bg-violet-50/90 hover:bg-violet-100 border-violet-200/80 text-violet-950',
        iconColor: 'text-violet-600',
    },
    {
        name: 'Mahasiswa',
        desc: 'KRS, KHS & Tagihan UKT',
        email: 'mahasiswa@alyasini.ac.id',
        href: '/dev-auth/mahasiswa',
        icon: Users,
        color: 'bg-teal-50/90 hover:bg-teal-100 border-teal-200/80 text-teal-950',
        iconColor: 'text-teal-600',
    },
    {
        name: 'Calon Mahasiswa',
        desc: 'Pendaftaran & Berkas PMB',
        email: 'calon@alyasini.ac.id',
        href: '/dev-auth/calon',
        icon: UserPlus,
        color: 'bg-rose-50/90 hover:bg-rose-100 border-rose-200/80 text-rose-950',
        iconColor: 'text-rose-600',
    },
    {
        name: 'Staf Keuangan',
        desc: 'Kelompok UKT & Kasir Tagihan',
        email: 'keuangan@alyasini.ac.id',
        href: '/dev-auth/keuangan',
        icon: CreditCard,
        color: 'bg-amber-50/90 hover:bg-amber-100 border-amber-200/80 text-amber-950',
        iconColor: 'text-amber-600',
    },
    {
        name: 'Panitia PMB',
        desc: 'Verifikasi & Jadwal Seleksi',
        email: 'pmb@alyasini.ac.id',
        href: '/dev-auth/pmb',
        icon: ClipboardCheck,
        color: 'bg-indigo-50/90 hover:bg-indigo-100 border-indigo-200/80 text-indigo-950',
        iconColor: 'text-indigo-600',
    },
    {
        name: 'Kepegawaian (SDM)',
        desc: 'Data Dosen & Pegawai',
        email: 'kepegawaian@alyasini.ac.id',
        href: '/dev-auth/kepegawaian',
        icon: Briefcase,
        color: 'bg-slate-100/90 hover:bg-slate-200 border-slate-300/80 text-slate-950',
        iconColor: 'text-slate-700',
    },
    {
        name: 'Kemahasiswaan',
        desc: 'Aktivitas, Beasiswa & Prestasi',
        email: 'kemahasiswaan@alyasini.ac.id',
        href: '/dev-auth/kemahasiswaan',
        icon: Trophy,
        color: 'bg-orange-50/90 hover:bg-orange-100 border-orange-200/80 text-orange-950',
        iconColor: 'text-orange-600',
    },
];

type Props = {
    status?: string;
    canResetPassword: boolean;
};

export default function Login({ status, canResetPassword }: Props) {
    const [emailValue, setEmailValue] = useState('');
    const [symbolWarning, setSymbolWarning] = useState<string | null>(null);

    // Strict email security validator: No symbols before or after @
    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setEmailValue(val);

        // Check for forbidden symbols anywhere in the input
        // Allowed characters: letters (a-z, A-Z), numbers (0-9), dots (.), hyphens (-), underscores (_), and single (@)
        const forbiddenSymbolRegex = /[^a-zA-Z0-9._@-]/;

        if (forbiddenSymbolRegex.test(val)) {
            setSymbolWarning('Simbol khusus tidak diizinkan. Demi keamanan, email hanya boleh berisi huruf, angka, titik (.), dan strip (-).');
        } else {
            // Check before and after @ specifically
            const parts = val.split('@');

            if (parts.length > 2) {
                setSymbolWarning('Alamat email hanya boleh memiliki satu karakter @.');
            } else if (parts.length === 2) {
                const [local, domain] = parts;

                if (local.length > 0 && !/^[a-zA-Z0-9._-]+$/.test(local)) {
                    setSymbolWarning('Bagian sebelum @ hanya boleh berisi huruf, angka, titik, atau strip.');
                } else if (domain.length > 0 && !/^[a-zA-Z0-9.-]*$/.test(domain)) {
                    setSymbolWarning('Bagian domain setelah @ hanya boleh berisi huruf, angka, titik, atau strip.');
                } else {
                    setSymbolWarning(null);
                }
            } else {
                setSymbolWarning(null);
            }
        }
    };

    return (
        <>
            <Head title="Masuk Akun - SIAKAD STAI Al-Yasini" />

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="space-y-4"
            >
                {({ processing, errors }) => (
                    <>
                        {/* Email Input with Strict Security */}
                        <div className="space-y-1.5">
                            <Label htmlFor="email" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                <Mail className="size-3.5 text-emerald-600" />
                                <span>Alamat Email Institusi</span>
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                name="email"
                                value={emailValue}
                                onChange={handleEmailChange}
                                required
                                autoFocus
                                tabIndex={1}
                                autoComplete="email"
                                placeholder="nama@alyasini.ac.id"
                                pattern="^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
                                title="Masukkan email yang valid tanpa simbol khusus sebelum atau sesudah @"
                                className={`h-10 text-xs sm:text-sm bg-slate-50/70 border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-lg ${
                                    symbolWarning ? 'border-amber-400 ring-2 ring-amber-300/40 bg-amber-50/30' : ''
                                }`}
                            />
                            {symbolWarning && (
                                <div className="flex items-center gap-1.5 text-amber-700 text-[11px] font-semibold bg-amber-50 p-2 rounded-md border border-amber-200">
                                    <ShieldAlert className="size-3.5 text-amber-600 shrink-0" />
                                    <span>{symbolWarning}</span>
                                </div>
                            )}
                            <InputError message={errors.email} />
                        </div>

                        {/* Password Input */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                    <Lock className="size-3.5 text-emerald-600" />
                                    <span>Kata Sandi (Password)</span>
                                </Label>
                                {canResetPassword && (
                                    <TextLink
                                        href={request()}
                                        className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                                        tabIndex={5}
                                    >
                                        Lupa kata sandi?
                                    </TextLink>
                                )}
                            </div>
                            <PasswordInput
                                id="password"
                                name="password"
                                required
                                tabIndex={2}
                                autoComplete="current-password"
                                placeholder="Masukkan kata sandi akun"
                                className="h-10 text-xs sm:text-sm bg-slate-50/70 border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-lg"
                            />
                            <InputError message={errors.password} />
                        </div>

                        {/* Remember Me */}
                        <div className="flex items-center space-x-2 pt-1">
                            <Checkbox
                                id="remember"
                                name="remember"
                                tabIndex={3}
                                className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                            />
                            <Label htmlFor="remember" className="text-xs font-medium text-slate-600 cursor-pointer">
                                Ingat sesi login di perangkat ini
                            </Label>
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            disabled={processing || !!symbolWarning}
                            className="w-full h-11 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-emerald-800/20 flex items-center justify-center gap-2 transition-all mt-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            tabIndex={4}
                            data-test="login-button"
                        >
                            {processing ? (
                                <>
                                    <Spinner className="size-4 text-white" />
                                    <span>Memverifikasi Akun...</span>
                                </>
                            ) : (
                                <>
                                    <LogIn className="size-4" />
                                    <span>Masuk ke Sistem</span>
                                </>
                            )}
                        </Button>

                        {/* Quick Role Access Shortcuts for Dev/Testing */}
                        <div className="mt-6 pt-4 border-t border-slate-100 space-y-2.5">
                            <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold">
                                <span className="flex items-center gap-1.5">
                                    <Sparkles className="size-3 text-amber-500" />
                                    <span>Pintasan Login Cepat (10 Role Pengujian):</span>
                                </span>
                                <span className="text-[10px] text-slate-400 font-normal">Klik untuk login instan</span>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                {devRoles.map((item) => {
                                    const IconComponent = item.icon;

                                    return (
                                        <a
                                            key={item.href}
                                            href={item.href}
                                            className={`p-2 rounded-lg border text-left transition-all duration-150 flex items-center justify-between gap-2 shadow-2xs hover:shadow-xs hover:scale-[1.01] active:scale-[0.99] group ${item.color}`}
                                            title={`Login instan sebagai ${item.name} (${item.email})`}
                                        >
                                            <div className="flex items-center gap-2 min-w-0">
                                                <div className="p-1.5 rounded-md bg-white/80 shadow-2xs shrink-0">
                                                    <IconComponent className={`size-3.5 ${item.iconColor}`} />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-[11px] font-bold leading-tight truncate">{item.name}</p>
                                                    <p className="text-[9.5px] opacity-75 font-medium leading-tight truncate">{item.desc}</p>
                                                </div>
                                            </div>
                                            <span className="text-[10px] opacity-40 group-hover:opacity-80 transition-opacity shrink-0 font-mono">↵</span>
                                        </a>
                                    );
                                })}
                            </div>
                        </div>
                    </>
                )}
            </Form>

            {status && (
                <div className="mt-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-center text-xs font-semibold text-emerald-800">
                    {status}
                </div>
            )}
        </>
    );
}

Login.layout = {
    title: 'Masuk ke Portal SIAKAD',
    description: 'Gunakan akun resmi STAI Al-Yasini untuk mengakses layanan perkuliahan dan administrasi akademik.',
};
