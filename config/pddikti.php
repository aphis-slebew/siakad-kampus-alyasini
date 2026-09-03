<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Neo Feeder Web Service URL
    |--------------------------------------------------------------------------
    |
    | URL endpoint Neo Feeder 2.0 Web Service (default live2.php).
    | Sesuai panduan keamanan, ini idealnya berada pada localhost atau jaringan privat.
    |
    */
    'feeder_url' => env('PDDIKTI_FEEDER_URL', 'http://localhost:3003/ws/live2.php'),

    /*
    |--------------------------------------------------------------------------
    | Kredensial Operator PDDIKTI Resmi
    |--------------------------------------------------------------------------
    |
    | Username dan password operator PDDIKTI resmi kampus untuk GetToken.
    |
    */
    'username' => env('PDDIKTI_FEEDER_USERNAME', 'operator_alyasini'),
    'password' => env('PDDIKTI_FEEDER_PASSWORD', 'secret_feeder'),

    /*
    |--------------------------------------------------------------------------
    | Timeout & Token TTL
    |--------------------------------------------------------------------------
    */
    'timeout' => (int) env('PDDIKTI_FEEDER_TIMEOUT', 30),
    'token_ttl' => (int) env('PDDIKTI_TOKEN_TTL', 43200), // 12 hours in seconds

    /*
    |--------------------------------------------------------------------------
    | Sandbox / Mock Mode
    |--------------------------------------------------------------------------
    |
    | Jika true atau feeder tidak dapat dijangkau di local/testing,
    | sistem dapat mengembalikan respons simulasi yang valid.
    |
    */
    'sandbox_mode' => (bool) env('PDDIKTI_SANDBOX_MODE', false),
];
