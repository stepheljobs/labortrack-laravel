# Construction Site Attendance Backend (Laravel 12)

Backend for a construction attendance mobile app with photo verification, geolocation, project-based messaging, and admin views.

## Tech Stack
- Laravel 12, PHP 8.2+
- MySQL/PostgreSQL/SQLite (dev uses SQLite by default)
- Laravel Sanctum for API tokens
- Storage: public disk (symlinked), S3-ready

## Setup
1. Install dependencies:
   - composer install
   - npm install
2. Copy env and generate key:
   - cp .env.example .env
   - php artisan key:generate
3. Configure DB in `.env` (SQLite default works). For MySQL/PostgreSQL, set `DB_*` creds.
4. Install Sanctum and publish assets:
   - composer require laravel/sanctum
   - php artisan vendor:publish --provider="Laravel\\Sanctum\\SanctumServiceProvider"
   - php artisan migrate
5. Create storage symlink for photos:
   - php artisan storage:link
6. Seed sample data:
   - php artisan db:seed

Login (admin): admin@example.com / password

## Disks & Photos
- Attendance photos: `storage/app/public/attendance-photos/`
- Message photos: `storage/app/public/message-photos/`
- Public URLs via `/storage/...` after `storage:link`.

## Geocoding
- Reverse geocoding by OpenStreetMap Nominatim.
- Configurable via code; results cached for 7 days.

## API Auth
- Sanctum token-based. Use `Authorization: Bearer <token>` header.

## API Endpoints
- POST `/api/register` — Register supervisor; returns token
- POST `/api/login` — Login; returns token
- POST `/api/logout` — Revoke current token (auth required)

Projects
- GET `/api/projects` — List projects for supervisor
- GET `/api/projects/{id}` — Project details
- GET `/api/projects/{id}/labors` — List labors
- POST `/api/projects/{id}/labors` — Create labor
- DELETE `/api/labors/{id}` — Delete labor

Attendance
- POST `/api/attendance/log` — multipart/form-data
  - labor_id, project_id, photo (file), latitude, longitude, timestamp
- GET `/api/projects/{id}/attendance` — Project logs (date filter via `?date=YYYY-MM-DD`)
- GET `/api/attendance/today` — Today’s logs across assigned projects

Messages
- GET `/api/projects/{id}/messages`
- POST `/api/projects/{id}/messages` — message, optional photo

### JSON Response Format
```
{ "success": true|false, "data": <mixed>, "message": "" }
```
Validation failures return:
```
{ "success": false, "errors": {field:[..]}, "message": "Validation failed" }
```

## Admin Views (Blade)
- `/admin/dashboard` — Overview (projects count, today attendance, recent messages)
- `/admin/projects` — Index + create
- `/admin/projects/{id}` — Detail with labors and messages
- `/admin/reports` — Filter by project and date range; Export CSV

Require authenticated admin (`users.role = 'admin'`).

## Testing
- Run: `php artisan test`
- Feature tests include basic auth and projects listing.

## Notes
- Make sure to run `php artisan storage:link` to expose uploaded photos.
- For production, configure S3 disk and update the upload calls to use that disk.
