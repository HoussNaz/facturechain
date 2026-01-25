# FactureChain MVP

Blockchain invoice verification system with a modern React UI and a TypeScript Express API backed by PostgreSQL. Create invoices, generate a PDF preview, anchor hashes (mocked in MVP), and verify publicly by hash or PDF upload.

## Repository layout

- `frontend/` React 18 + TypeScript + Tailwind UI
- `backend/` Express API in TypeScript (Postgres)

## Key features

### Authentication & User Management
- User auth (register/login) with JWT
- User profile management (view/edit profile)
- Password change functionality
- Password reset flow (forgot password)
- Account deletion with cascading data removal

### Invoice Management
- Invoice creation with line items and VAT totals
- Invoice editing (for non-certified invoices)
- Invoice duplication (clone existing invoices)
- Invoice deletion
- Paginated invoice list with search and filtering
- Export invoices to CSV

### PDF & Certification
- PDF Studio: drag-and-drop invoice layout and export to PDF
- Certification flow (hash + mocked blockchain anchor)
- Public verification by hash or PDF upload
- Proof badge, trust timeline, and downloadable verification receipt (with QR)
- Copy verification URL for sharing

### UI/UX
- Bilingual support (French/English)
- 404 Not Found page
- Responsive design

## API Endpoints

### Authentication (`/api/auth`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Create new account |
| POST | `/login` | Login with credentials |
| POST | `/forgot-password` | Request password reset |
| POST | `/reset-password` | Complete password reset |

### Users (`/api/users`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/me` | Get current user profile |
| PUT | `/me` | Update user profile |
| POST | `/me/password` | Change password |
| DELETE | `/me` | Delete account |

### Invoices (`/api/invoices`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List invoices (paginated, searchable) |
| POST | `/` | Create new invoice |
| GET | `/:id` | Get single invoice |
| PUT | `/:id` | Update invoice |
| DELETE | `/:id` | Delete invoice |
| POST | `/:id/certify` | Certify invoice on blockchain |
| POST | `/:id/duplicate` | Clone invoice |
| GET | `/:id/download` | Download PDF (not implemented) |

#### Query Parameters for GET `/api/invoices`
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)
- `search` - Search by invoice number or client name
- `status` - Filter by status (`draft` or `certified`)

### Verification (`/api/verify`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/:hash` | Verify by hash |
| POST | `/upload` | Verify by PDF upload |

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
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
SEED_DEMO=true
```

## Frontend Routes

| Route | Page | Description |
|-------|------|-------------|
| `/` | Landing | Home page with features |
| `/login` | Login | User authentication |
| `/register` | Register | Create account |
| `/forgot-password` | Forgot Password | Request password reset |
| `/profile` | Profile | User settings |
| `/dashboard` | Dashboard | Invoice list with actions |
| `/invoices/new` | New Invoice | Create invoice |
| `/invoices/:id` | Invoice Detail | View invoice & certification |
| `/invoices/:id/edit` | Edit Invoice | Modify invoice |
| `/verify` | Verify | Public verification page |
| `/verify/:hash` | Verify Result | Verification result |
| `*` | 404 | Not found page |

## Notes

- PDF exports and verification receipts are generated client-side.
- Blockchain certification is mocked (ready to replace with Polygon + ethers.js).
- Password reset emails are not actually sent (mock implementation).

## Next steps

- [ ] Add database migrations (Prisma/Knex/Flyway)
- [ ] Add real PDF generation with S3 storage
- [ ] Add Polygon smart contract interactions with ethers.js
- [ ] Add issuer registry and revocation
- [ ] Add email service (SendGrid/Mailgun) for password reset
- [ ] Add two-factor authentication (2FA)
- [ ] Add refresh token mechanism
- [ ] Add audit logging

## Tech Stack

**Frontend:**
- React 18
- TypeScript
- Tailwind CSS
- React Router
- jsPDF (client-side PDF)
- QRCode

**Backend:**
- Node.js + Express
- TypeScript
- PostgreSQL
- JWT (jsonwebtoken)
- bcryptjs
- Zod (validation)
- multer (file uploads)

## License

MIT
