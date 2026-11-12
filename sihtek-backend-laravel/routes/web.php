<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web routes — Sihtek is a decoupled app:
|   - sihtek-backend   : Laravel API (this project)
|   - sihtek-frontend  : React SPA (separate folder)
|--------------------------------------------------------------------------
*/

Route::get('/', function () {
    return response()->json([
        'app' => config('app.name'),
        'status' => 'ok',
        'message' => 'Sihtek API is running. The React frontend lives in sihtek-frontend/ (npm run dev).',
        'api' => url('/api'),
    ]);
});
