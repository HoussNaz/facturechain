# FactureChain MVP

Blockchain invoice verification system with a modern React UI and a TypeScript Express API backed by PostgreSQL. Create invoices, generate a PDF preview, anchor hashes (mocked in MVP), and verify publicly by hash or PDF upload.

## Repository layout

- `frontend/` React 18 + TypeScript + Tailwind UI
- `backend/` Express API in TypeScript (Postgres)

## Key features

- User auth (register/login) with JWT
- Invoice creation with line items and VAT totals
- PDF Studio: drag-and-drop invoice layout and export to PDF
- Certification flow (hash + mocked blockchain anchor)
- Public verification by hash or PDF upload
- Proof badge, trust timeline, and downloadable verification receipt (with QR)

## Quick start

### Backend

```bash
cd backend
npm install
psql $DATABASE_URL -f sql/schema.sql
npm run dev
```

Optional seed data:

```
SEED_DEMO=true npm run dev
```

Seed user: `demo@facturechain.com` / `password123`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

By default, the frontend expects the API on `http://localhost:4000`.

## Environment variables

Frontend (`frontend/.env`):

```
VITE_API_URL=http://localhost:4000
```

Backend (`backend/.env`):

```
DATABASE_URL=postgres://user:pass@localhost:5432/facturechain
DATABASE_SSL=false
PORT=4000
JWT_SECRET=dev-secret-change-me
JWT_EXPIRES_IN=24h
APP_URL=https://facturechain.com
SEED_DEMO=true
```

## Notes

- PDF exports and verification receipts are generated client-side.
- Blockchain certification is mocked (ready to replace with Polygon + ethers.js).

## Next steps

- Add migrations (Prisma/Knex/Flyway)
- Add real PDF generation and S3 storage
- Add Polygon contract interactions
- Add issuer registry and revocation
