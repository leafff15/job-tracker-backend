# Job Tracker Backend

A REST API for managing job applications, built with **Express**, **Prisma**, and **PostgreSQL** using a scalable **Controller → Service → Repository** architecture.

## Architecture

```
Client → Route → Controller → Service → Repository → Prisma → PostgreSQL
```

- **Routes** (`src/routes`) map HTTP verbs/paths to controller methods.
- **Controllers** (`src/controllers`) handle HTTP concerns only — parsing requests, calling the service, shaping responses, and centralized error handling.
- **Services** (`src/services`) hold business logic and input validation.
- **Repositories** (`src/repositories`) are the only layer that talks to Prisma.
- **`app.ts`** configures Express and mounts routes; **`server.ts`** owns process concerns (env, port binding, startup, graceful shutdown).

## Tech Stack

- Node.js + TypeScript (ESM, `nodenext` module resolution)
- Express 5
- Prisma 7 (`@prisma/client`, `@prisma/adapter-pg`)
- PostgreSQL
- tsx (dev runtime / watch mode)

## Prerequisites

- Node.js 20+
- A running PostgreSQL instance

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment variables**

   Create a `.env` file in the project root:
   ```env
   DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE_NAME"
   PORT=3000
   ```
   `PORT` is optional and defaults to `3000` if omitted.

3. **Run database migrations**
   ```bash
   npx prisma migrate dev
   ```

4. **Seed reference data** (default work setups + default statuses for existing users)
   ```bash
   npx tsx prisma/seed.ts
   ```

5. **Start the server**
   ```bash
   npm run dev
   ```
   The API will be available at `http://localhost:3000`.

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Runs the server with `tsx watch` for hot reload during development |
| `npm run build` | Compiles TypeScript to JavaScript |
| `npm start` | Runs the compiled server (`node dist/server.js`) — requires `npm run build` first |

### Error responses

| Status | Meaning |
|---|---|
| `400` | Validation error (missing/invalid field, unknown field, invalid ID) or a related record is invalid/already exists |
| `404` | Job application (or referenced record) not found |
| `500` | Unexpected server error |

## Data Model

- **user** - account owning job applications and statuses
- **status** - user-defined application statuses (e.g. Applied, Interviewing, Offer, Rejected)
- **work_setup** - shared list of work arrangements (On-site, Hybrid, Remote)
- **job_application** - the core entity, linked to a user, a status, and a work setup

See `prisma/schema.prisma` for the full schema and relations.

## Testing

Endpoints were tested manually with Postman (see `.postman/` / `postman/` for workspace config). No automated test suite is currently included.

## Notes

- `cors` is listed as a dependency but is not yet wired into `app.ts`. Add `app.use(cors())` in `app.ts` if the API needs to be called from a browser on a different origin.
