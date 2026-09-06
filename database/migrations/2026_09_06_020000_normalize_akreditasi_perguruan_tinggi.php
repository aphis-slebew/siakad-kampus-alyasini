<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Backup snapshot file path.
     */
    protected function getBackupPath(): string
    {
        return storage_path('app/backup_akreditasi_pre_migration.json');
    }

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (! Schema::hasTable('perguruan_tinggis')) {
            return;
        }

        $records = DB::table('perguruan_tinggis')->select('id', 'nama_unit', 'lembaga_akreditasi', 'peringkat_akreditasi')->get();

        // 1. Create a lossless JSON snapshot backup of original values
        $backupData = $records->map(fn ($item) => [
            'id' => $item->id,
            'lembaga_akreditasi' => $item->lembaga_akreditasi,
            'peringkat_akreditasi' => $item->peringkat_akreditasi,
        ])->toArray();

        $backupPath = $this->getBackupPath();
        $directory = dirname($backupPath);
        if (! File::exists($directory)) {
            File::makeDirectory($directory, 0755, true);
        }
        File::put($backupPath, json_encode($backupData, JSON_PRETTY_PRINT));

        // 2. Normalize records
        $validLembaga = ['BAN-PT', 'LAMDIK', 'LAMEMBA', 'LAM-PTKes', 'LAM INFOKOM', 'LAM SAMA', 'LAM TEKNIK', 'Lainnya'];
        $validPeringkat = ['Unggul', 'Baik Sekali', 'Baik', 'A', 'B', 'C', 'Terakreditasi Sementara', 'Tidak Terakreditasi', 'Lainnya'];

        foreach ($records as $item) {
            $currentLembaga = trim((string) $item->lembaga_akreditasi);
            $currentPeringkat = trim((string) $item->peringkat_akreditasi);

            $normalizedLembaga = $this->normalizeLembaga($currentLembaga, $validLembaga);
            $normalizedPeringkat = $this->normalizePeringkat($currentPeringkat, (string) $item->nama_unit, (int) $item->id, $validPeringkat);

            if ($normalizedLembaga !== $item->lembaga_akreditasi || $normalizedPeringkat !== $item->peringkat_akreditasi) {
                DB::table('perguruan_tinggis')
                    ->where('id', $item->id)
                    ->update([
                        'lembaga_akreditasi' => $normalizedLembaga,
                        'peringkat_akreditasi' => $normalizedPeringkat,
                        'updated_at' => now(),
                    ]);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (! Schema::hasTable('perguruan_tinggis')) {
            return;
        }

        $backupPath = $this->getBackupPath();
        if (File::exists($backupPath)) {
            $raw = File::get($backupPath);
            $backupData = json_decode($raw, true);

            if (is_array($backupData)) {
                foreach ($backupData as $row) {
                    DB::table('perguruan_tinggis')
                        ->where('id', $row['id'])
                        ->update([
                            'lembaga_akreditasi' => $row['lembaga_akreditasi'],
                            'peringkat_akreditasi' => $row['peringkat_akreditasi'],
                            'updated_at' => now(),
                        ]);
                }
            }

            File::delete($backupPath);
        }
    }

    /**
     * Normalize accreditation body to standard options.
     *
     * @param  array<string>  $validLembaga
     */
    public function normalizeLembaga(string $value, array $validLembaga): string
    {
        if (in_array($value, $validLembaga, true)) {
            return $value;
        }

        $lower = strtolower($value);
        if (str_contains($lower, 'ban-pt') || str_contains($lower, 'ban pt')) {
            return 'BAN-PT';
        }
        if (str_contains($lower, 'lamdik')) {
            return 'LAMDIK';
        }
        if (str_contains($lower, 'lamemba')) {
            return 'LAMEMBA';
        }
        if (str_contains($lower, 'ptkes') || str_contains($lower, 'kesehatan')) {
            return 'LAM-PTKes';
        }
        if (str_contains($lower, 'infokom') || str_contains($lower, 'informatika')) {
            return 'LAM INFOKOM';
        }
        if (str_contains($lower, 'sama') || str_contains($lower, 'mipa')) {
            return 'LAM SAMA';
        }
        if (str_contains($lower, 'teknik') || str_contains($lower, 'rekayasa')) {
            return 'LAM TEKNIK';
        }

        return $value === '' ? 'BAN-PT' : 'Lainnya';
    }

    /**
     * Normalize accreditation rating using case-insensitive fuzzy matching.
     *
     * @param  array<string>  $validPeringkat
     */
    public function normalizePeringkat(string $value, string $namaUnit, int $id, array $validPeringkat): string
    {
        if (in_array($value, $validPeringkat, true)) {
            return $value;
        }

        $lower = strtolower($value);

        if (str_contains($lower, 'unggul')) {
            return 'Unggul';
        }
        if (str_contains($lower, 'baik sekali') || str_contains($lower, 'baiksekali')) {
            return 'Baik Sekali';
        }
        if (str_contains($lower, 'baik')) {
            return 'Baik';
        }
        if ($lower === 'a' || preg_match('/^(terakreditasi|peringkat)?\s*a\b/i', $lower)) {
            return 'A';
        }
        if ($lower === 'b' || preg_match('/^(terakreditasi|peringkat)?\s*b\b/i', $lower)) {
            return 'B';
        }
        if ($lower === 'c' || preg_match('/^(terakreditasi|peringkat)?\s*c\b/i', $lower)) {
            return 'C';
        }
        if (str_contains($lower, 'sementara') || str_contains($lower, 'proses') || str_contains($lower, 'izin')) {
            return 'Terakreditasi Sementara';
        }
        if (str_contains($lower, 'tidak') || str_contains($lower, 'belum') || str_contains($lower, 'kadaluarsa') || str_contains($lower, 'expired')) {
            return 'Tidak Terakreditasi';
        }

        // Fallback: If institution is Al-Yasini (id 1 or name matches), legal fallback is 'Baik' (SK BAN-PT 481/SK/BAN-PT/Ak/PT/VIII/2022)
        if ($id === 1 || str_contains(strtolower($namaUnit), 'al-yasini') || str_contains(strtolower($namaUnit), 'alyasini')) {
            return 'Baik';
        }

        return 'Lainnya';
    }
};
