<?php

namespace Database\Seeders;

use App\Models\KalenderAkademik;
use App\Models\Konsentrasi;
use App\Models\ProgramStudi;
use App\Models\TahunAjaran;
use Illuminate\Database\Seeder;

class KalenderAkademikSeeder extends Seeder
{
    /**
     * Seed academic milestones and konsentrasi prodi.
     */
    public function run(): void
    {
        $activeTa = TahunAjaran::where('is_active', true)->first() ?? TahunAjaran::latest()->first();

        if ($activeTa) {
            $year = substr($activeTa->nama, 0, 4);

            $agendas = [
                [
                    'tahun_ajaran_id' => $activeTa->id,
                    'kegiatan' => 'Pembayaran Biaya Kuliah & UKT Mahasiswa',
                    'tipe_kegiatan' => KalenderAkademik::TIPE_PEMBAYARAN_UKT,
                    'mulai' => "{$year}-08-01",
                    'selesai' => "{$year}-09-15",
                    'deskripsi' => 'Periode pelunasan atau pengajuan skema cicilan UKT mahasiswa aktif sebelum pengisian KRS.',
                    'is_published' => true,
                ],
                [
                    'tahun_ajaran_id' => $activeTa->id,
                    'kegiatan' => 'Her-Registrasi / Registrasi Ulang Semester',
                    'tipe_kegiatan' => KalenderAkademik::TIPE_REGISTRASI_ULANG,
                    'mulai' => "{$year}-08-05",
                    'selesai' => "{$year}-09-15",
                    'deskripsi' => 'Registrasi ulang administratif bagi mahasiswa aktif dan permohonan cuti akademik.',
                    'is_published' => true,
                ],
                [
                    'tahun_ajaran_id' => $activeTa->id,
                    'kegiatan' => 'Pengisian & Perubahan Kartu Rencana Studi (KRS)',
                    'tipe_kegiatan' => KalenderAkademik::TIPE_KRS,
                    'mulai' => "{$year}-08-15",
                    'selesai' => "{$year}-09-20",
                    'deskripsi' => 'Pengontrakan matakuliah dan jadwal kelas perkuliahan melalui portal mahasiswa.',
                    'is_published' => true,
                ],
                [
                    'tahun_ajaran_id' => $activeTa->id,
                    'kegiatan' => 'Persetujuan & Perwalian KRS oleh Dosen Wali',
                    'tipe_kegiatan' => KalenderAkademik::TIPE_PERWALIAN_KRS,
                    'mulai' => "{$year}-08-15",
                    'selesai' => "{$year}-09-25",
                    'deskripsi' => 'Konsultasi rencana studi dan persetujuan pengajuan KRS oleh dosen pembimbing akademik.',
                    'is_published' => true,
                ],
                [
                    'tahun_ajaran_id' => $activeTa->id,
                    'kegiatan' => 'Perkuliahan Efektif Semester',
                    'tipe_kegiatan' => KalenderAkademik::TIPE_PERKULIAHAN,
                    'mulai' => "{$year}-09-22",
                    'selesai' => "{$year}-12-30",
                    'deskripsi' => 'Masa perkuliahan tatap muka dan daring (16 pertemuan termasuk UTS dan UAS).',
                    'is_published' => true,
                ],
                [
                    'tahun_ajaran_id' => $activeTa->id,
                    'kegiatan' => 'Ujian Tengah Semester (UTS)',
                    'tipe_kegiatan' => KalenderAkademik::TIPE_UTS,
                    'mulai' => "{$year}-11-03",
                    'selesai' => "{$year}-11-14",
                    'deskripsi' => 'Evaluasi pembelajaran tengah semester.',
                    'is_published' => true,
                ],
                [
                    'tahun_ajaran_id' => $activeTa->id,
                    'kegiatan' => 'Ujian Akhir Semester (UAS)',
                    'tipe_kegiatan' => KalenderAkademik::TIPE_UAS,
                    'mulai' => "{$year}-12-22",
                    'selesai' => "{$year}-12-31",
                    'deskripsi' => 'Evaluasi pembelajaran akhir semester.',
                    'is_published' => true,
                ],
                [
                    'tahun_ajaran_id' => $activeTa->id,
                    'kegiatan' => 'Penginputan & Finalisasi Nilai oleh Dosen',
                    'tipe_kegiatan' => KalenderAkademik::TIPE_INPUT_NILAI,
                    'mulai' => "{$year}-09-01",
                    'selesai' => ($year + 1).'-01-15',
                    'deskripsi' => 'Batas akhir dosen pengajar mengunggah nilai perkuliahan mahasiswa ke sistem.',
                    'is_published' => true,
                ],
                [
                    'tahun_ajaran_id' => $activeTa->id,
                    'kegiatan' => 'Pendaftaran & Pelaksanaan Yudisium',
                    'tipe_kegiatan' => KalenderAkademik::TIPE_YUDISIUM,
                    'mulai' => ($year + 1).'-01-10',
                    'selesai' => ($year + 1).'-01-25',
                    'deskripsi' => 'Penetapan kelulusan mahasiswa tingkat akhir dan penerbitan SK Yudisium.',
                    'is_published' => true,
                ],
            ];

            foreach ($agendas as $agenda) {
                KalenderAkademik::firstOrCreate(
                    [
                        'tahun_ajaran_id' => $agenda['tahun_ajaran_id'],
                        'tipe_kegiatan' => $agenda['tipe_kegiatan'],
                    ],
                    $agenda
                );
            }
        }

        // Seed default konsentrasi for Program Studi
        $pai = ProgramStudi::where('kode', 'PAI')->first();
        if ($pai) {
            Konsentrasi::firstOrCreate([
                'program_studi_id' => $pai->id,
                'nama' => 'Pendidikan Agama Islam Transformatif',
            ]);
            Konsentrasi::firstOrCreate([
                'program_studi_id' => $pai->id,
                'nama' => 'Manajemen Pendidikan Islam',
            ]);
        }

        $pba = ProgramStudi::where('kode', 'PBA')->first();
        if ($pba) {
            Konsentrasi::firstOrCreate([
                'program_studi_id' => $pba->id,
                'nama' => 'Pendidikan Bahasa Arab Terapan',
            ]);
        }

        $pgmi = ProgramStudi::where('kode', 'PGMI')->first();
        if ($pgmi) {
            Konsentrasi::firstOrCreate([
                'program_studi_id' => $pgmi->id,
                'nama' => 'Pembelajaran Tematik Terpadu MI/SD',
            ]);
        }
    }
}
