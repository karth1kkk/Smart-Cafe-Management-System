<?php

namespace App\Http\Middleware;

use Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful as SanctumMiddleware;

/**
 * Sanctum's default middleware forces session.same_site=lax, which breaks cookie auth
 * when the SPA and API are on different sites (e.g. Vercel → Heroku). Respect
 * config/session.php so SESSION_SAME_SITE=none + SESSION_SECURE_COOKIE=true work.
 */
class EnsureFrontendRequestsAreStateful extends SanctumMiddleware
{
    protected function configureSecureCookieSessions(): void
    {
        config([
            'session.http_only' => true,
            'session.same_site' => config('session.same_site'),
            'session.secure' => config('session.secure'),
        ]);
    }
}
