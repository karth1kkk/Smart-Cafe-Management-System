# Smart Cafe Management System

Production-ready Smart Cafe Management System built with:

- Laravel 11 API backend in `backend`
- React + Vite + TypeScript frontend in `frontend`
- PostgreSQL-ready backend configuration
- Sanctum SPA authentication with cookies
- Laravel Reverb realtime order updates
- Zustand state management
- Tailwind CSS UI
- Recharts analytics

## Features

- Login/logout with role-based access for `admin` and `barista`
- POS order creation with size, milk, and add-on customization
- Live orders queue with realtime status updates
- Admin-only menu management with image uploads
- Admin-only inventory dashboard with low-stock visibility
- Analytics dashboard for revenue, top sellers, and staff leaderboard
- Automatic inventory deduction based on menu recipes
- Cached menu fallback for basic offline POS resilience

## Workspace Structure

- `backend`: Laravel 11 REST API, database schema, services, broadcasting, tests
- `frontend`: Vite React SPA for Vercel

## Seeded Credentials

After seeding the backend:

- Admin: `admin@smartcafe.test` / `password`
- Barista: `barista@smartcafe.test` / `password`

## Local Backend Setup

1. Open `backend`.
2. Copy `.env.example` to `.env` if needed.
3. Update database credentials for PostgreSQL, or keep the local SQLite defaults already present in `.env`.
4. Install dependencies:

```bash
composer install
```

5. Generate app key if needed:

```bash
php artisan key:generate
```

6. Run migrations and seed demo data:

```bash
php artisan migrate:fresh --seed
```

7. Create the public storage symlink for menu images:

```bash
php artisan storage:link
```

8. Start the Laravel API:

```bash
php artisan serve
```

9. In a separate terminal, start Reverb for realtime features:

```bash
php artisan reverb:start
```

## Local Frontend Setup

1. Open `frontend`.
2. Copy `.env.example` to `.env`.
3. Point `VITE_API_URL` to your Laravel app, for example `http://localhost:8000`.
4. Make sure the Reverb settings match the backend values.
5. Install dependencies:

```bash
npm install
```

6. Start the frontend:

```bash
npm run dev
```

The Vite app runs on `http://localhost:5173` by default.

## Sanctum SPA Auth Notes

- The frontend uses cookie-based auth with `withCredentials`.
- The frontend requests `/sanctum/csrf-cookie` before logging in.
- Backend CORS and Sanctum stateful domains are configured for local `5173` development and should be updated for your deployed frontend domain.

## Important Environment Variables

### Backend

- `APP_URL`
- `DB_CONNECTION`, `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`
- `SESSION_DOMAIN`
- `SANCTUM_STATEFUL_DOMAINS`
- `CORS_ALLOWED_ORIGINS`
- `BROADCAST_CONNECTION`
- `REVERB_APP_ID`, `REVERB_APP_KEY`, `REVERB_APP_SECRET`
- `REVERB_HOST`, `REVERB_PORT`, `REVERB_SCHEME`
- `REVERB_SERVER_HOST`, `REVERB_SERVER_PORT`
- `REVERB_ALLOWED_ORIGINS`

### Frontend

- `VITE_API_URL`
- `VITE_REVERB_APP_KEY`
- `VITE_REVERB_HOST`
- `VITE_REVERB_PORT`
- `VITE_REVERB_SCHEME`

## Deployment

### Backend on Render

- Deploy the `backend` directory as the web service.
- Use PostgreSQL in Render and set the backend env vars from `.env.example`.
- Run migrations during deploy:

```bash
php artisan migrate --force
```

- Create a second service or background worker for:

```bash
php artisan reverb:start --host=0.0.0.0 --port=$PORT
```

- Ensure `APP_URL`, `SESSION_DOMAIN`, `SANCTUM_STATEFUL_DOMAINS`, `CORS_ALLOWED_ORIGINS`, and `REVERB_ALLOWED_ORIGINS` point to the final Vercel domain.

### Frontend on Vercel

- Set the project root to `frontend`.
- Add the frontend env vars from `.env.example`.
- Point `VITE_API_URL` to the deployed Laravel backend URL.
- Point the Reverb host and scheme to the deployed websocket endpoint.

## Verification

Backend verification used during implementation:

- `php artisan migrate:fresh --seed`
- `php artisan test`

Frontend verification used during implementation:

- `npm run lint`
- `npm run build`

## Notes

- Current local backend `.env` keeps SQLite available for easy local verification, while `.env.example` is PostgreSQL-oriented for production.
- If you run PHP 8.5 locally, Laravel 11 vendor config currently emits deprecation notices related to `PDO::MYSQL_ATTR_SSL_CA`; this comes from vendor code, not from the Smart Cafe application code.
