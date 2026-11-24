// Simple, dependency-free build & run helpers for environments without Maven.
// Usage:  ./backend/mvnw clean package   (delegates to mvn if installed, else uses ./backend/mvnw wrapper)
// Requires: Java 17+ on PATH and either `mvn` on PATH or the wrapper jar in .mvn/wrapper/.


## Admin panel API

The admin panel lives in the Next.js app at **`/admin`** (visiting it without a session redirects to
`/admin/login`). Its data API is served by this backend under `/api/admin/**`; Next.js proxies
`/admin-api/*` to it (see `rewrites()` in `next.config.ts`), so set `BACKEND_URL` in `.env.local` if
the backend is not on `http://localhost:8080`.

- **Login**: email + password are checked against Supabase Auth, and the account must have
  `profiles.role = 'admin'`. Tokens are stored in HttpOnly, SameSite=Strict cookies
  (`ezkey_admin_at` / `ezkey_admin_rt`, 8h). Google/Discord-only accounts cannot log in here; the
  admin account needs a password.
- **Protection**: every `/api/admin/**` route (except login/refresh/logout) re-verifies the token and
  the admin role (30s cache), state-changing calls need the `X-Requested-With: ezkey-admin` header,
  and login is locked for 15 minutes after 5 failed attempts per email + IP.
- **Needs** `SUPABASE_SERVICE_ROLE_KEY` (same variable the Next.js app already uses) and migration
  `supabase/migrations/006_admin_audit_log.sql`.
- **Create the first admin** (Supabase SQL editor, after signing up normally):

  ```sql
  UPDATE public.profiles SET role = 'admin'
  WHERE id = (SELECT id FROM auth.users WHERE email = 'you@example.com');
  ```

| Endpoint | Purpose |
|---|---|
| `POST /api/admin/auth/login`, `/refresh`, `/logout`, `GET /me` | Session |
| `GET /api/admin/stats` | Dashboard numbers |
| `GET/PATCH /api/admin/users[/{id}]` | List, change role, toggle verified |
| `GET /api/admin/verifications`, `POST /{id}/decision` | Approve / reject seller KYC |
| `GET/PATCH /api/admin/listings[/{id}]` | Moderate status, feature |
| `GET /api/admin/orders` | Read-only order list |
| `GET/PATCH /api/admin/disputes[/{id}]` | Review and record dispute decisions (does not move escrow funds) |
| `GET /api/admin/audit-log` | Every admin login and change |
