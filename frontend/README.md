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

## Pages & Routes

| Route | Page | Description |
|-------|------|-------------|
| `/` | Landing | Home page with feature highlights |
| `/login` | Login | User authentication |
| `/register` | Register | Create new account |
| `/forgot-password` | Forgot Password | Request password reset email |
| `/profile` | Profile | User settings (edit profile, change password, delete account) |
| `/dashboard` | Dashboard | Invoice list with search, filter, pagination, and actions |
| `/invoices/new` | New Invoice | Create invoice with PDF preview |
| `/invoices/:id` | Invoice Detail | View invoice, certification status, share link |
| `/invoices/:id/edit` | Edit Invoice | Modify invoice (drafts only) |
| `/verify` | Verify | Public verification by hash or PDF upload |
| `/verify/:hash` | Verify Result | Display verification result with proof badge |
| `*` | 404 Not Found | Custom error page |

## Features

### Authentication & User Management
- Auth flow (register/login) with JWT storage in `localStorage`
- User profile management (view/edit)
- Password change functionality
- Account deletion with confirmation

### Invoice Management
- Dashboard with paginated invoice list
- Search by invoice number or client name
- Filter by status (draft/certified)
- Create, edit, duplicate, and delete invoices
- Export invoices to CSV
- Copy verification URL for sharing

### PDF & Certification
- PDF Studio: drag blocks on a page-like canvas, toggle grid/snap, export PDF (client-side)
- Certification flow triggers blockchain anchoring
- Proof badge: deterministic glyph generated from document hash
- Trust timeline: visual path from draft to certification

### Verification
- Public verification by hash or PDF upload
- Verification receipt: downloadable PDF proof with QR code

### UI/UX
- Bilingual support (French/English) with toggle
- Responsive design
- Modern glassmorphism styling

## Project Structure

```
src/
├── api/
│   ├── client.ts        # Fetch wrapper with JWT support
│   └── types.ts         # API response types
├── components/
│   ├── AppShell.tsx     # Layout with navigation
│   ├── LanguageToggle.tsx # FR/EN switcher
│   ├── Logo.tsx         # Brand logo
│   ├── PdfStudio.tsx    # Drag-and-drop PDF layout
│   ├── ProofGlyph.tsx   # Proof badge renderer
│   ├── StatusPill.tsx   # Status indicator
│   ├── TrustTimeline.tsx # Invoice status timeline
│   └── VerificationReceiptButton.tsx # Receipt download
├── context/
│   ├── AuthContext.tsx  # Auth state & methods
│   └── I18nContext.tsx  # Internationalization
├── pages/
│   ├── Dashboard.tsx    # Invoice list with actions
│   ├── EditInvoice.tsx  # Edit existing invoice
│   ├── ForgotPassword.tsx # Password reset request
│   ├── InvoiceDetail.tsx # Invoice view & certification
│   ├── Landing.tsx      # Home page
│   ├── Login.tsx        # Sign in
│   ├── NewInvoice.tsx   # Create invoice
│   ├── NotFound.tsx     # 404 page
│   ├── Profile.tsx      # User settings
│   ├── Register.tsx     # Sign up
│   ├── Verify.tsx       # Verification input
│   └── VerifyResult.tsx # Verification result
├── styles/
│   └── index.css        # Global styles
├── utils/
│   └── format.ts        # Formatting helpers
├── App.tsx              # Router setup
├── main.tsx             # Entry point
└── vite-env.d.ts        # Vite type definitions
```

## Dashboard Actions

| Action | Description |
|--------|-------------|
| View | Click invoice number to see details |
| Edit | Modify draft invoices |
| Duplicate | Clone invoice as new draft |
| Delete | Remove draft invoices |
| Export CSV | Download all invoices as spreadsheet |

## Notes

- Demo credentials: `demo@facturechain.com` / `password123` (if seeded)
- Invoice issuer fields are UI-only in MVP; backend uses authenticated user as issuer
- PDF exports are generated in the browser and not persisted to backend
- Certified invoices cannot be edited or deleted

## Tech Stack

- React 18
- TypeScript
- Tailwind CSS
- React Router v6
- jsPDF (client-side PDF generation)
- QRCode (verification QR codes)
- Vite (build tool)
