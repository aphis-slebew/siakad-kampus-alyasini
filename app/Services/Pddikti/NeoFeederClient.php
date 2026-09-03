<?php

namespace App\Services\Pddikti;

use Exception;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class NeoFeederClient
{
    protected string $url;

    protected string $username;

    protected string $password;

    protected int $timeout;

    protected int $tokenTtl;

    protected bool $sandboxMode;

    public function __construct()
    {
        $this->url = (string) config('pddikti.feeder_url', 'http://localhost:3003/ws/live2.php');
        $this->username = (string) config('pddikti.username', '');
        $this->password = (string) config('pddikti.password', '');
        $this->timeout = (int) config('pddikti.timeout', 30);
        $this->tokenTtl = (int) config('pddikti.token_ttl', 43200);
        $this->sandboxMode = (bool) config('pddikti.sandbox_mode', false);
    }

    /**
     * Dapatkan token otentikasi dari Neo Feeder Web Service.
     */
    public function getToken(bool $forceRefresh = false): string
    {
        $cacheKey = 'pddikti_feeder_token_'.md5($this->url.$this->username);

        if (! $forceRefresh && Cache::has($cacheKey)) {
            $cachedToken = Cache::get($cacheKey);
            if (! empty($cachedToken)) {
                return (string) $cachedToken;
            }
        }

        if ($this->sandboxMode) {
            $mockToken = 'sandbox-token-'.bin2hex(random_bytes(16));
            Cache::put($cacheKey, $mockToken, $this->tokenTtl);

            return $mockToken;
        }

        try {
            $response = Http::timeout($this->timeout)->post($this->url, [
                'act' => 'GetToken',
                'username' => $this->username,
                'password' => $this->password,
            ]);

            if (! $response->successful()) {
                throw new Exception("HTTP error ({$response->status()}): {$response->body()}");
            }

            $result = $response->json();

            if (! is_array($result) || ! isset($result['error_code']) || (int) $result['error_code'] !== 0) {
                $errorDesc = $result['error_desc'] ?? 'Gagal mendapatkan token autentikasi Neo Feeder.';
                throw new Exception("Neo Feeder Auth Error: {$errorDesc}");
            }

            $token = $result['data']['token'] ?? null;
            if (empty($token)) {
                throw new Exception('Token tidak ditemukan pada respons Neo Feeder.');
            }

            Cache::put($cacheKey, (string) $token, $this->tokenTtl);

            return (string) $token;
        } catch (Exception $e) {
            Log::error('NeoFeederClient GetToken failed: '.$e->getMessage());
            throw $e;
        }
    }

    /**
     * Panggil fungsi RPC pada Neo Feeder Web Service.
     */
    public function call(
        string $act,
        array $record = [],
        ?string $filter = null,
        ?string $order = null,
        int $limit = 0,
        int $offset = 0,
        array $key = []
    ): array {
        if ($this->sandboxMode) {
            return $this->handleSandboxCall($act, $record, $filter, $order, $limit, $offset, $key);
        }

        $token = $this->getToken();

        $payload = [
            'act' => $act,
            'token' => $token,
        ];

        if (! empty($record)) {
            $payload['record'] = $record;
        }

        if (! empty($key)) {
            $payload['key'] = $key;
        }

        if ($filter !== null && $filter !== '') {
            $payload['filter'] = $filter;
        }

        if ($order !== null && $order !== '') {
            $payload['order'] = $order;
        }

        if ($limit > 0) {
            $payload['limit'] = $limit;
            $payload['offset'] = $offset;
        }

        try {
            $response = Http::withToken($token)
                ->timeout($this->timeout)
                ->post($this->url, $payload);

            if (! $response->successful()) {
                throw new Exception("HTTP error ({$response->status()}): {$response->body()}");
            }

            $result = $response->json();

            // Tangani jika token kadaluarsa di tengah sesi (error_code 100 atau pesan token expired)
            if (
                is_array($result) &&
                isset($result['error_code']) &&
                in_array((int) $result['error_code'], [100, 106], true)
            ) {
                $token = $this->getToken(true);
                $payload['token'] = $token;

                $retryResponse = Http::withToken($token)
                    ->timeout($this->timeout)
                    ->post($this->url, $payload);

                $result = $retryResponse->json();
            }

            if (! is_array($result)) {
                throw new Exception('Respons Neo Feeder tidak berformat JSON valid.');
            }

            return $result;
        } catch (Exception $e) {
            Log::error("NeoFeederClient Call [{$act}] failed: ".$e->getMessage());
            throw $e;
        }
    }

    /**
     * Uji koneksi dan status profil PT di Neo Feeder.
     */
    public function testConnection(): array
    {
        try {
            $token = $this->getToken();
            $profil = $this->call('GetProfilPT');

            return [
                'status' => 'connected',
                'url' => $this->url,
                'token' => substr($token, 0, 8).'...',
                'profil' => $profil['data'] ?? [],
                'message' => 'Berhasil terhubung ke Neo Feeder Web Service.',
            ];
        } catch (Exception $e) {
            return [
                'status' => 'error',
                'url' => $this->url,
                'message' => 'Gagal terhubung ke Neo Feeder: '.$e->getMessage(),
            ];
        }
    }

    /**
     * Helper untuk insert data record.
     */
    public function insertRecord(string $act, array $record): array
    {
        return $this->call($act, record: $record);
    }

    /**
     * Helper untuk update data record dengan key identifikasi.
     */
    public function updateRecord(string $act, array $key, array $record): array
    {
        return $this->call($act, record: $record, key: $key);
    }

    /**
     * Helper untuk delete data record dengan key identifikasi.
     */
    public function deleteRecord(string $act, array $key): array
    {
        return $this->call($act, key: $key);
    }

    /**
     * Helper untuk mengambil data kamus referensi (GetAgama, GetWilayah, dll).
     */
    public function getDictionary(string $act, ?string $filter = null): array
    {
        $response = $this->call($act, filter: $filter);

        return $response['data'] ?? [];
    }

    /**
     * Respons tiruan (mock) saat berada di mode Sandbox/Testing.
     */
    protected function handleSandboxCall(
        string $act,
        array $record,
        ?string $filter,
        ?string $order,
        int $limit,
        int $offset,
        array $key
    ): array {
        if (str_starts_with($act, 'Insert')) {
            $mockId = 'feeder-sandbox-uuid-'.bin2hex(random_bytes(8));

            return [
                'error_code' => 0,
                'error_desc' => '',
                'data' => array_merge($record, ['id_pddikti' => $mockId, 'id_registrasi_mahasiswa' => $mockId]),
            ];
        }

        if (str_starts_with($act, 'Update') || str_starts_with($act, 'Delete')) {
            return [
                'error_code' => 0,
                'error_desc' => '',
                'data' => array_merge($key, $record),
            ];
        }

        if ($act === 'GetProfilPT') {
            return [
                'error_code' => 0,
                'error_desc' => '',
                'data' => [
                    'kode_perguruan_tinggi' => '213035',
                    'nama_perguruan_tinggi' => 'STAI Al-Yasini Pasuruan',
                    'status' => 'A',
                ],
            ];
        }

        if ($act === 'GetListMahasiswa') {
            return [
                'error_code' => 0,
                'error_desc' => '',
                'data' => [
                    [
                        'id_mahasiswa' => 'mock-mhs-1',
                        'id_registrasi_mahasiswa' => 'mock-reg-1',
                        'nim' => '2026010001',
                        'nama_mahasiswa' => 'Ahmad Fauzi',
                        'nama_program_studi' => 'Pendidikan Agama Islam',
                    ],
                ],
            ];
        }

        if ($act === 'GetListDosen') {
            return [
                'error_code' => 0,
                'error_desc' => '',
                'data' => [
                    [
                        'id_dosen' => 'mock-dsn-1',
                        'nidn' => '2101018501',
                        'nama_dosen' => 'Dr. H. M. Sholihin, M.Pd.I',
                        'nama_program_studi' => 'Pendidikan Agama Islam',
                    ],
                ],
            ];
        }

        return [
            'error_code' => 0,
            'error_desc' => '',
            'data' => [],
        ];
    }
}
