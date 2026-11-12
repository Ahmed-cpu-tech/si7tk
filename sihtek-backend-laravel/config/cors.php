<?php

return [

    /*
    |--------------------------------------------------------------------------
    | CORS — allows the React SPA (Vite dev server / build) to call the API.
    |--------------------------------------------------------------------------
    */

    'paths' => ['api/*', 'up'],

    'allowed_methods' => ['*'],

    'allowed_origins' => ['*'],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 3600,

    'supports_credentials' => false,

];
