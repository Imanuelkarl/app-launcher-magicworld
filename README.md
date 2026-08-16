# MagicWorld App Launcher

A MERN application hub for publishing and managing company applications.

## Quick start

1. Create `server/.env` from `server/.env.example` and provide a MongoDB connection string.
2. Run `npm install` in the root, then `npm run install:all`.
3. Run `npm run dev`.
4. Open `http://localhost:5173`. The admin view is available at `/manage`.

The API is served at `http://localhost:5000/api` and seed apps are added automatically when the database is empty.

## Secure team access

Set a strong `JWT_SECRET` (32+ random characters) in `server/.env` before starting the API. On the first run, use **Create the first admin** at `/manage` with the configured `BOOTSTRAP_ADMIN_EMAIL`. After that, bootstrap is permanently disabled.

Roles are enforced by the API:

- **Admin**: invite and manage users at `/team`, publish/edit/delete every app.
- **Editor**: publish apps and edit only applications they uploaded.
- **Viewer**: read-only access.

Admins generate expiring, one-time invitation links at `/team`; recipients activate their account at `/accept-invite`.
