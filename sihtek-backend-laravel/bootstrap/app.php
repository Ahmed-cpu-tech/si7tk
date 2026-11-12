<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
        apiPrefix: 'api',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // API-only backend: there is no server-side login page, so guests must
        // NOT be redirected to route('login') (Laravel's default) — the SPA
        // handles login and receives a JSON 401 instead.
        $middleware->redirectGuestsTo(fn () => null);

        // Serve user-facing strings (validation, custom messages) in the
        // language requested by the React SPA (Accept-Language: ar | fr | en).
        $middleware->api(prepend: [
            \App\Http\Middleware\SetLocale::class,
        ]);

        $middleware->alias([
            'role' => \App\Http\Middleware\EnsureUserHasRole::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // The API always answers JSON (SPA consumer), even without Accept header.
        $exceptions->shouldRenderJsonWhen(
            fn ($request, $e) => $request->is('api/*') || $request->expectsJson()
        );

        // Unauthenticated API calls: JSON 401 (never a login redirect — there is no
        // server-side login page, the React SPA handles authentication).
        $exceptions->render(function (Illuminate\Http\Request $request, Illuminate\Auth\AuthenticationException $e) {
            if ($request->is('api/*') || $request->expectsJson()) {
                return response()->json(['message' => $e->getMessage()], 401);
            }
        });
    })->create();
