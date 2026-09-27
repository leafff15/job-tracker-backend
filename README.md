# Job Tracker Backend

A REST API for managing job applications, built with Express, TypeScript, Prisma, and PostgreSQL. The API uses a controller → service → repository structure and cookie-based authentication.

## Tech stack

- Node.js 20+
- TypeScript with ESM
- Express 5
- Prisma 7
- PostgreSQL

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Configure `.env` in the project root:

   `PORT` is optional and defaults to `3000`. Use a long, random `JWT_SECRET` and keep `.env` private.

3. Apply database migrations and seed the reference work setup data:

   ```bash
   npx prisma migrate dev
   npx tsx prisma/seed.ts
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Run the server with hot reload |
| `npm run build` | Compile TypeScript into `dist/` |
| `npm start` | Run the compiled server (build first) |

## Authentication

Register or log in to receive an HTTP-only `token` cookie. Send that cookie with requests to `/api/job-applications`. The cookie is marked `Secure` when `NODE_ENV=production` and uses `SameSite=Strict`.

### `POST /api/auth/register`

Creates an account and sets the auth cookie. Passwords must be at least 8 characters. Returns `201` with the public user fields (`user_id`, `username`, and `email`).

### `POST /api/auth/login`

Sets the auth cookie and returns the public user fields. Invalid credentials return `401`.

### `POST /api/auth/logout`

Clears the auth cookie and returns `{ "message": "Logged out" }`.

## Job application endpoints

All `/api/job-applications` endpoints require the auth cookie. Each user's list and individual records are restricted to that user.

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/job-applications` | List your applications, newest first |
| `GET` | `/api/job-applications/:applicationId` | Get one of your applications |
| `POST` | `/api/job-applications` | Create an application |
| `PUT` | `/api/job-applications/:applicationId` | Update an application |
| `DELETE` | `/api/job-applications/:applicationId` | Delete an application (returns `204`) |

## Health check

`GET /health` returns `{ "status": "ok" }`.

## Errors

Errors use a JSON body such as `{ "error": "..." }`.

| Status | Meaning |
|---|---|
| `400` | Invalid request, validation error, or invalid related record |
| `401` | Missing/invalid authentication, or invalid login credentials |
| `404` | Application not found |
| `500` | Unexpected server error |

## Development notes

- There is currently no automated test suite; endpoints have been checked manually.
- CORS is installed as a dependency but is not enabled in the app. For browser clients hosted on another origin, configure CORS with an explicit allowed origin and credentials, then have the client send credentials with requests. The auth cookie's `SameSite=Strict` policy may also need to be reviewed for cross-site deployments.
- The server closes its HTTP listener on `SIGINT` and `SIGTERM`.