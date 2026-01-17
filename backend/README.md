# FactureChain Backend (MVP)

Lightweight Express API (TypeScript) with in-memory storage covering auth, invoices, certification, and verification flows. Ready to swap the store for PostgreSQL later.

## Quick start

```bash
cd backend
npm install
npm run dev
```

Build + run (production-style):

```bash
npm run build
npm start
```

Default port: `4000` (env `PORT`). Seed user: `demo@facturechain.com` / `password123`.

## Environment variables

- `PORT` (default `4000`)
- `JWT_SECRET` (default `dev-secret-change-me`)
- `JWT_EXPIRES_IN` (default `24h`)
- `APP_URL` (default `https://facturechain.com`)

## API surface

- `POST /api/auth/register` - create account
- `POST /api/auth/login` - login, returns JWT + user
- `POST /api/auth/forgot-password` - request reset (no email, just acknowledged)
- `POST /api/auth/reset-password` - set new password
- `GET /api/invoices` - list user invoices (requires bearer token)
- `POST /api/invoices` - create draft invoice (requires bearer token)
- `GET /api/invoices/:id` - invoice detail + certification (requires bearer token)
- `PUT /api/invoices/:id` - update draft (requires bearer token)
- `DELETE /api/invoices/:id` - delete invoice (requires bearer token)
- `POST /api/invoices/:id/certify` - hash + mock certify on Polygon (requires bearer token)
- `GET /api/invoices/:id/download` - not implemented placeholder
- `GET /api/verify/:hash` - public hash verification (`0x` optional)
- `POST /api/verify/upload` - public PDF upload verification (form-data `file`, max 5 MB)

## Architecture notes

- `src/models/store.ts`: in-memory store + demo seed data. Swap with a real DB later.
- `src/services/*`: business logic (auth, invoices, certification, verification).
- `src/middleware/*`: auth guard (JWT), rate limits, error handler.
- `src/routes/*`: HTTP layer with Zod validation and multer for PDF uploads.
- `src/utils/crypto.ts`: SHA-256 hashing for invoice objects or uploaded binaries.
- `src/types/*`: shared TypeScript model definitions.

## Next steps for production

- Replace in-memory store with PostgreSQL models (users, invoices, certifications, verification_logs).
- Wire real PDF generation and S3 storage; stream files from `/api/invoices/:id/download`.
- Call Polygon via `ethers.js` with the provided smart contract, persisting tx hash/block.
- Add email delivery for password reset flow.
