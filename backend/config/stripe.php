<?php

return [

    'secret' => env('STRIPE_SECRET'),

    'currency' => env('STRIPE_CURRENCY', 'usd'),

    /*
    |--------------------------------------------------------------------------
    | Redirect URLs after Stripe Checkout
    |--------------------------------------------------------------------------
    |
    | Must include the literal {CHECKOUT_SESSION_ID} in success_url (Stripe replaces it).
    | Defaults assume the Vite dev server; override in .env for production.
    |
    */

    'success_url' => env(
        'STRIPE_SUCCESS_URL',
        rtrim(env('FRONTEND_URL', 'http://localhost:5173'), '/').'/checkout/success?session_id={CHECKOUT_SESSION_ID}'
    ),

    'cancel_url' => env(
        'STRIPE_CANCEL_URL',
        rtrim(env('FRONTEND_URL', 'http://localhost:5173'), '/').'/checkout/cancel'
    ),

];
