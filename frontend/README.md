# FactureChain Frontend (MVP)

React + TypeScript + Tailwind UI connected to the Express backend.

## Quick start

```bash
cd frontend
npm install
npm run dev
```

## Environment variables

Create `frontend/.env` if you want to change the API base:

```
VITE_API_URL=http://localhost:4000
```

## Connected features

- Auth flow (register/login) with JWT storage in `localStorage`.
- Dashboard fetches invoices from the API.
- New invoice form creates/updates drafts and can trigger certification.
- Invoice detail loads and can trigger certification.
- Verification page calls `/api/verify/:hash` and `/api/verify/upload`.
- PDF Studio: drag blocks on a page-like canvas, toggle grid/snap, export a PDF (client-side).
- Proof badge: deterministic glyph generated from the document hash.
- Trust timeline: visual path from draft to certification and verifications.
- Verification receipt: downloadable PDF proof after a successful check (includes QR).

## Frontend architecture

- `src/api/client.ts`: fetch wrapper with base URL + JSON/FormData support.
- `src/api/types.ts`: shared API response types.
- `src/context/AuthContext.tsx`: login/register/logout + token storage.
- `src/context/I18nContext.tsx`: FR/EN toggle.
- `src/components/PdfStudio.tsx`: drag-and-drop PDF layout and export.
- `src/components/ProofGlyph.tsx`: proof badge renderer.
- `src/components/TrustTimeline.tsx`: timeline component for invoice status.
- `src/components/VerificationReceiptButton.tsx`: client-side receipt export.
- `src/pages/*`: UI pages wired to backend endpoints.

## Notes

- Demo credentials are documented in `backend/README.md`.
- Invoice issuer fields are UI-only in this MVP; backend uses the authenticated user as issuer.
- PDF exports are generated in the browser and are not persisted to the backend.
