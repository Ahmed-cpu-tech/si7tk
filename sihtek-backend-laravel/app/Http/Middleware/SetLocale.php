<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Sets the application locale from the Accept-Language header sent by the
 * React SPA (ar / fr / en). Falls back to APP_LOCALE when absent or unsupported.
 * All API user-facing strings (validation errors, notifications payloads…)
 * are then served in the requested language.
 */
class SetLocale
{
    public const SUPPORTED = ['ar', 'en', 'fr'];

    public function handle(Request $request, Closure $next): Response
    {
        $header = $request->header('Accept-Language', '');

        // Accept "ar", "en", "ar-MA", "en-US;q=0.9"…
        $lang = strtolower(trim(explode(',', $header)[0] ?? ''));
        $lang = substr($lang, 0, 2);

        if (in_array($lang, self::SUPPORTED, true)) {
            app()->setLocale($lang);
        }

        return $next($request);
    }
}
