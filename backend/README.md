# FactureChain Backend (MVP)

Lightweight Express API (TypeScript) backed by PostgreSQL. Covers auth, user management, invoices, certification, and verification flows.

## Quick start

```bash
cd backend
npm install
```

Create a database and apply the schema:

```bash
psql $DATABASE_URL -f sql/schema.sql
```

Run the API:

```bash
npm run dev
```

Build + run (production-style):

```bash
npm run build
npm start
```

Seed user (optional): set `SEED_DEMO=true` to auto-create `demo@facturechain.com` / `password123`.

## Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `4000` | Server port |
| `JWT_SECRET` | `dev-secret-change-me` | JWT signing secret (required in production) |
| `JWT_EXPIRES_IN` | `24h` | Token expiration |
| `APP_URL` | `https://facturechain.com` | Application URL |
| `DATABASE_URL` | - | PostgreSQL connection string (required) |
| `DATABASE_SSL` | `false` | Enable SSL for database connection |
| `CORS_ORIGINS` | `http://localhost:3000,http://localhost:5173` | Allowed CORS origins (comma-separated) |
| `SEED_DEMO` | `false` | Auto-create demo user on startup |

## API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/register` | ✗ | Create account |
| POST | `/login` | ✗ | Login, returns JWT + user |
| POST | `/forgot-password` | ✗ | Request password reset |
| POST | `/reset-password` | ✗ | Set new password |

### User Management (`/api/users`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/me` | ✓ | Get current user profile |
| PUT | `/me` | ✓ | Update user profile |
| POST | `/me/password` | ✓ | Change password |
| DELETE | `/me` | ✓ | Delete account (cascades invoices) |

### Invoices (`/api/invoices`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | ✓ | List invoices (paginated, searchable) |
| POST | `/` | ✓ | Create draft invoice |
| GET | `/:id` | ✓ | Invoice detail + certification |
| PUT | `/:id` | ✓ | Update draft |
| DELETE | `/:id` | ✓ | Delete invoice |
| POST | `/:id/certify` | ✓ | Hash + mock certify on Polygon |
| POST | `/:id/duplicate` | ✓ | Clone invoice as new draft |
| GET | `/:id/download` | ✓ | Download PDF (not implemented) |

#### Query Parameters for GET `/api/invoices`

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 20 | Items per page (max: 100) |
| `search` | string | - | Search by invoice number or client name |
| `status` | string | - | Filter by `draft` or `certified` |

### Public Verification (`/api/verify`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/:hash` | ✗ | Verify by hash (`0x` prefix optional) |
| POST | `/upload` | ✗ | Verify by PDF upload (form-data `file`, max 5 MB) |

## Project Structure

```
src/
├── config/
│   └── env.ts           # Environment configuration
├── db/
│   ├── pool.ts          # Database connection
│   ├── mapper.ts        # Row-to-model mapping
│   └── seed.ts          # Demo data seeding
├── middleware/
│   ├── auth.ts          # JWT authentication guard
│   ├── errorHandler.ts  # Global error handler
│   └── rateLimiter.ts   # Rate limiting
├── routes/
│   ├── auth.ts          # Auth endpoints
│   ├── invoices.ts      # Invoice endpoints
│   ├── users.ts         # User profile endpoints
│   └── verify.ts        # Public verification
├── services/
│   ├── authService.ts   # Auth business logic
│   ├── invoiceService.ts# Invoice CRUD + certification
│   ├── userService.ts   # User profile management
│   └── verificationService.ts # Hash verification
├── types/
│   ├── errors.ts        # Error types
│   └── models.ts        # Data models
├── utils/
│   ├── crypto.ts        # SHA-256 hashing
│   └── responses.ts     # Response helpers
└── index.ts             # App entry point
```

## Next steps for production

- [ ] Add migrations tooling (Prisma Migrate, Knex, or Flyway)
- [ ] Implement real PDF generation with S3 storage
- [ ] Integrate Polygon via `ethers.js` for blockchain certification
- [ ] Add email delivery (SendGrid/Mailgun) for password reset
- [ ] Add refresh token mechanism
- [ ] Add audit logging for sensitive operations
- [ ] Add two-factor authentication (2FA)
