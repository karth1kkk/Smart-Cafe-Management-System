<?php

$vercelPatterns = filter_var(env('CORS_ALLOW_VERCEL_PATTERNS', true), FILTER_VALIDATE_BOOLEAN)
    ? ['#^https://[a-zA-Z0-9\-.]+\.vercel\.app$#']
    : [];

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie', 'broadcasting/auth'],
    'allowed_methods' => ['*'],
    'allowed_origins' => array_filter(array_map('trim', explode(',', env('CORS_ALLOWED_ORIGINS', 'http://localhost:5173')))),
    'allowed_origins_patterns' => array_values(array_filter(array_merge(
        $vercelPatterns,
        array_filter(array_map('trim', explode("\n", (string) env('CORS_ALLOWED_ORIGINS_PATTERNS', '')))),
    ))),
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];
