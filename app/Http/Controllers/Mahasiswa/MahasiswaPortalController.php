<?php

namespace App\Http\Controllers\Mahasiswa;

use App\Http\Controllers\Controller;
use App\Models\Krs;
use App\Models\Mahasiswa;
use App\Models\Tagihan;
use App\Models\TahunAjaran;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MahasiswaPortalController extends Controller
{
    /**
     * Get authenticated student or preview for admin.
     */
    protected function getStudent(): ?Mahasiswa
    {
        $user = auth()->user();
        if (! $user) {
            return null;
        }

        $mahasiswa = Mahasiswa::where('user_id', $user->id)->first();

        // If admin/superadmin is viewing the student portal, provide the first student for preview
        if (! $mahasiswa && ($user->hasRole('superadmin') || $user->hasRole('admin_akademik') || $user->user_type === 'superadmin' || $user->user_type === 'admin_akademik')) {
            $mahasiswa = Mahasiswa::first();
        }

        return $mahasiswa;
    }

    /**
     * Display student's comprehensive academic profile.
     */
    public function profil(Request $request): Response
    {
        $mahasiswa = $this->getStudent();
        if ($mahasiswa) {
            $mahasiswa->load([
                'programStudi.fakultas',
                'agama',
                'dataOrangTua',
                'statusAkademikHistoris.tahunAjaran',
                'dosenWalis' => function ($q) {
                    $q->with('dosen')->latest('id');
                },
            ]);
        }

        return Inertia::render('mahasiswa/profil', [
            'mahasiswa' => $mahasiswa,
        ]);
    }

    /**
     * Display student's weekly course schedule based on approved/submitted KRS.
     */
    public function jadwal(Request $request): Response
    {
        $mahasiswa = $this->getStudent();
        $tahunAjaran = TahunAjaran::where('is_active', true)->first() ?? TahunAjaran::latest()->first();

        $krs = null;
        if ($mahasiswa && $tahunAjaran) {
            $krs = Krs::with([
                'krsDetails.kelasKuliah.kurikulumMatakuliah.matakuliah',
                'krsDetails.kelasKuliah.jadwalPerkuliahans.ruangKuliah',
                'krsDetails.kelasKuliah.dosenPengajars.dosen',
            ])
                ->where('mahasiswa_id', $mahasiswa->id)
                ->where('tahun_ajaran_id', $tahunAjaran->id)
                ->whereIn('status', ['diajukan', 'disetujui_wali'])
                ->first();
        }

        $jadwalList = [];
        if ($krs) {
            foreach ($krs->krsDetails as $detail) {
                $kelas = $detail->kelasKuliah;
                if (! $kelas) {
                    continue;
                }

                $matakuliah = $kelas->kurikulumMatakuliah?->matakuliah;
                $dosenList = $kelas->dosenPengajars->map(fn ($dp) => $dp->dosen?->nama_lengkap)->filter()->join(', ');

                foreach ($kelas->jadwalPerkuliahans as $jadwal) {
                    $jadwalList[] = [
                        'kelas_id' => $kelas->id,
                        'kelas_nama' => $kelas->nama_kelas,
                        'matakuliah_kode' => $matakuliah?->kode ?? '-',
                        'matakuliah_nama' => $matakuliah?->nama ?? '-',
                        'sks' => $matakuliah?->sks ?? 0,
                        'dosen' => $dosenList ?: '-',
                        'hari' => $jadwal->hari,
                        'jam_mulai' => substr((string) $jadwal->jam_mulai, 0, 5),
                        'jam_selesai' => substr((string) $jadwal->jam_selesai, 0, 5),
                        'ruang' => $jadwal->ruangKuliah ? "{$jadwal->ruangKuliah->kode} ({$jadwal->ruangKuliah->nama})" : '-',
                    ];
                }
            }
        }

        // Sort by hari (Senin - Sabtu) and jam
        $hariOrder = ['Senin' => 1, 'Selasa' => 2, 'Rabu' => 3, 'Kamis' => 4, 'Jumat' => 5, 'Sabtu' => 6, 'Minggu' => 7];
        usort($jadwalList, function ($a, $b) use ($hariOrder) {
            $orderA = $hariOrder[$a['hari']] ?? 99;
            $orderB = $hariOrder[$b['hari']] ?? 99;
            if ($orderA === $orderB) {
                return strcmp($a['jam_mulai'], $b['jam_mulai']);
            }

            return $orderA <=> $orderB;
        });

        return Inertia::render('mahasiswa/jadwal', [
            'mahasiswa' => $mahasiswa,
            'tahunAjaran' => $tahunAjaran,
            'krsStatus' => $krs?->status ?? 'belum_krs',
            'jadwalList' => $jadwalList,
        ]);
    }

    /**
     * Display student's attendance recap per enrolled subject in active semester.
     */
    public function presensi(Request $request): Response
    {
        $mahasiswa = $this->getStudent();
        $tahunAjaran = TahunAjaran::where('is_active', true)->first() ?? TahunAjaran::latest()->first();

        $presensiSummary = [];
        if ($mahasiswa && $tahunAjaran) {
            $krs = Krs::with([
                'krsDetails.kelasKuliah.kurikulumMatakuliah.matakuliah',
                'krsDetails.kelasKuliah.dosenPengajars.dosen',
                'krsDetails.kelasKuliah.jurnalPerkuliahans.presensis' => function ($q) use ($mahasiswa) {
                    $q->where('mahasiswa_id', $mahasiswa->id);
                },
            ])
                ->where('mahasiswa_id', $mahasiswa->id)
                ->where('tahun_ajaran_id', $tahunAjaran->id)
                ->whereIn('status', ['diajukan', 'disetujui_wali'])
                ->first();

            if ($krs) {
                foreach ($krs->krsDetails as $detail) {
                    $kelas = $detail->kelasKuliah;
                    if (! $kelas) {
                        continue;
                    }

                    $matakuliah = $kelas->kurikulumMatakuliah?->matakuliah;
                    $dosenList = $kelas->dosenPengajars->map(fn ($dp) => $dp->dosen?->nama_lengkap)->filter()->join(', ');
                    $totalSesi = $kelas->jurnalPerkuliahans->count();

                    $hadir = 0;
                    $izin = 0;
                    $sakit = 0;
                    $alpa = 0;

                    foreach ($kelas->jurnalPerkuliahans as $jurnal) {
                        $presensi = $jurnal->presensis->first();
                        if ($presensi) {
                            match ($presensi->status) {
                                'hadir' => $hadir++,
                                'izin' => $izin++,
                                'sakit' => $sakit++,
                                'alpa' => $alpa++,
                                default => null,
                            };
                        } else {
                            $alpa++;
                        }
                    }

                    $persentase = $totalSesi > 0 ? round(($hadir / $totalSesi) * 100, 1) : 100.0;
                    $isEligibleUas = $persentase >= 75.0;

                    $presensiSummary[] = [
                        'kelas_id' => $kelas->id,
                        'kelas_nama' => $kelas->nama_kelas,
                        'matakuliah_kode' => $matakuliah?->kode ?? '-',
                        'matakuliah_nama' => $matakuliah?->nama ?? '-',
                        'sks' => $matakuliah?->sks ?? 0,
                        'dosen' => $dosenList ?: '-',
                        'total_sesi' => $totalSesi,
                        'hadir' => $hadir,
                        'izin' => $izin,
                        'sakit' => $sakit,
                        'alpa' => $alpa,
                        'persentase' => $persentase,
                        'is_eligible_uas' => $isEligibleUas,
                    ];
                }
            }
        }

        return Inertia::render('mahasiswa/presensi', [
            'mahasiswa' => $mahasiswa,
            'tahunAjaran' => $tahunAjaran,
            'presensiSummary' => $presensiSummary,
        ]);
    }

    /**
     * Display student's complete billing and payment history across all semesters.
     */
    public function riwayatPembayaran(Request $request): Response
    {
        $mahasiswa = $this->getStudent();
        $tagihans = $mahasiswa ? Tagihan::with(['tahunAjaran', 'pembayarans', 'cicilanTagihans'])
            ->where('mahasiswa_id', $mahasiswa->id)
            ->latest('id')
            ->get() : collect([]);

        $totalTagihan = $tagihans->sum('nominal');
        $totalTerbayar = $tagihans->sum(function ($t) {
            return $t->pembayarans->where('status_verifikasi', 'diterima')->sum('nominal_dibayar');
        });
        $totalSisaPiutang = max(0, $totalTagihan - $totalTerbayar);

        return Inertia::render('mahasiswa/riwayat-pembayaran', [
            'mahasiswa' => $mahasiswa,
            'tagihans' => $tagihans,
            'ringkasan' => [
                'total_tagihan' => $totalTagihan,
                'total_terbayar' => $totalTerbayar,
                'total_sisa_piutang' => $totalSisaPiutang,
            ],
        ]);
    }
}
