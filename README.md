# MagicWorld App Launcher

A MERN application hub for publishing and managing company applications.

## Quick start

1. Create `server/.env` from `server/.env.example` and provide a MongoDB connection string.
2. Run `npm install` in the root, then `npm run install:all`.
3. Run `npm run dev`.
4. Open `http://localhost:5173`. The admin view is available at `/manage`.

The API is served at `http://localhost:5000/api` and seed apps are added automatically when the database is empty.

## Secure team access

Set a strong `JWT_SECRET` (32+ random characters) in `server/.env` before starting the API. Administrator accounts are provisioned only through the startup environment configuration or an existing administrator's invitation—there is no public bootstrap endpoint.

Alternatively, set `DEFAULT_ADMIN_EMAIL`, `DEFAULT_ADMIN_PASSWORD` (12+ characters), and optionally `DEFAULT_ADMIN_NAME`. The server will create that admin at startup only if the email does not exist, and never overwrites an existing password.

Roles are enforced by the API:

- **Admin**: invite and manage users at `/team`, publish/edit/delete every app.
- **Editor**: publish apps and edit only applications they uploaded.
- **Viewer**: read-only access.

Admins generate expiring, one-time invitation links at `/team`; recipients activate their account at `/accept-invite`.
