# StartupSri

> A web-based microloan and equity crowdfunding platform connecting verified tech entrepreneurs with investors in Sri Lanka.

**Module**: PUSL3190 Computing Project — University of Plymouth  
**Student**: Payagalage Shwetha Rashmika Fernando (Index: 10952721)  
**Supervisor**: Ms. Hirushi Dilpriya  
**Degree**: BSc (Hons) Software Engineering

---

## Overview

StartupSri bridges the funding gap for early-stage tech entrepreneurs in Sri Lanka by providing a structured, transparent, and verified digital platform. Entrepreneurs can submit projects for funding, investors can browse and fund verified startups, and administrators oversee the entire process through a dedicated management console.

The platform supports two funding models:
- **Microloan** — entrepreneur borrows and repays in monthly instalments with interest
- **Equity** — investor receives a percentage stake in the startup

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, React 18, TypeScript, Material UI v5, Redux Toolkit |
| Backend | Node.js, Express.js, Mongoose ODM |
| Database | MongoDB Atlas |
| Auth | JWT (jsonwebtoken), bcrypt, role-based access control |
| Payments | PayHere (sandbox) |
| Email | SendGrid transactional email API |
| File Storage | Multer (local disk — `backend/uploads/`) |
| Security | Helmet, express-mongo-sanitize, express-rate-limit, CORS |
| Testing | Jest, Supertest, mongodb-memory-server |

---

## Key Features

- JWT authentication with role-based access control (Entrepreneur / Investor / Admin)
- Multi-step KYC identity verification with admin approval and rejection workflow
- Password reset via tokenised email link (15-minute expiry)
- Project submission with multi-step form and document upload (Multer)
- Hybrid funding — microloan (with auto-generated repayment schedule) and equity investment
- Rule-based credit scoring (5 criteria, 0–100 scale) displayed to investors with breakdown
- Entrepreneur repayment tracking — view instalments, mark as paid, investor confirms receipt
- Investor portfolio dashboard with investment and repayment overview
- Role-specific analytics dashboards with charts (Chart.js) for all three roles
- Admin management console — dashboard, projects, users, KYC review, transactions, feedback, notifications
- Admin user account suspension and reactivation
- Audit logging for all sensitive admin actions (KYC decisions, project changes, user management)
- In-app notification system with unread badge for all three roles
- User feedback submission and admin moderation
- Project comments and discussion for investors
- Automated email notifications for registration, KYC, project approval, investments, repayments, and password reset
- Rate limiting on auth endpoints (15 req/15 min) and general API (500 req/15 min)
- Automated test suite: 28 tests covering unit, integration, and security scenarios

---

## Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- `.env` file configured (see below)

### Installation

```bash
# Install all dependencies (root + frontend + backend)
npm run install:all

# Start both frontend and backend in development mode
npm run dev
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

---

## Environment Variables

Create a `.env` file inside the `backend/` directory:

```env
# Database
MONGODB_URI=your_mongodb_connection_string

# Auth
JWT_SECRET=your_jwt_secret_min_32_chars
JWT_EXPIRE=7d

# SendGrid
SENDGRID_API_KEY=your_sendgrid_api_key
FROM_EMAIL=noreply@startupsri.lk
FROM_NAME=StartupSri Platform

# PayHere
PAYHERE_MERCHANT_ID=your_payhere_merchant_id
PAYHERE_MERCHANT_SECRET=your_payhere_merchant_secret

# URLs
FRONTEND_URL=http://localhost:3000
ALLOWED_ORIGINS=http://localhost:3000
```

Create a `.env.local` file inside the `frontend/` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_PAYHERE_MERCHANT_ID=your_payhere_merchant_id
NEXT_PUBLIC_PAYHERE_SANDBOX=true
```

> **Note:** `NEXT_PUBLIC_PAYHERE_SANDBOX=false` enables live PayHere payments. Keep it `true` for development.

---

## User Roles

| Role | Access |
|---|---|
| **Entrepreneur** | Submit projects, manage listings, track funding, manage repayments, notifications, feedback, profile |
| **Investor** | Browse projects, view credit scores, fund startups, manage portfolio, confirm repayments, notifications, feedback, profile |
| **Admin** | Dashboard analytics, approve/reject KYC, approve/reject projects, manage users (suspend/reactivate), transactions log, feedback moderation, notifications, audit log |

---

## Database Collections

| Collection | Description |
|---|---|
| `users` | All registered users with roles, KYC status, and password reset tokens |
| `kycverifications` | KYC document records and admin review outcomes |
| `projects` | Startup project listings with embedded investors array and milestones |
| `investments` | Investment records with embedded repayment schedules (microloan) |
| `comments` | Project comments by authenticated users |
| `notifications` | In-app notifications per user |
| `feedbacks` | User-submitted platform feedback |
| `auditlogs` | Admin action audit trail with timestamps and IP addresses |

---

## Running Tests

```bash
cd backend
npm test
```

Runs 28 automated tests using Jest + Supertest against an in-memory MongoDB instance:
- `tests/unit/creditScore.test.js` — 8 unit tests (credit score algorithm)
- `tests/integration/auth.test.js` — 8 integration tests (registration, login, JWT)
- `tests/integration/project.test.js` — 5 integration tests (KYC, project approval)
- `tests/security/security.test.js` — 7 security tests (JWT, RBAC, NoSQL injection)

---

## Creating the Admin Account

```bash
cd backend
node src/scripts/createAdmin.js
```

Or use the default admin credentials:

```
URL:      http://localhost:3000/admin/login
Email:    admin@startupsri.lk
Password: Admin@1234
```

---

## Test Payment Card (PayHere Sandbox)

```
Card Number:  4916 2175 0161 1292
Expiry:       12/26
CVV:          100
Name:         Test User
```

---

## Project Structure

```
startup_sri/
├── frontend/                  # Next.js application
│   └── src/
│       ├── pages/             # Route pages (user/, admin/, auth/)
│       ├── components/        # Reusable UI components (admin/, user/, ui/)
│       ├── redux/             # Auth, project, investment slices + store
│       ├── styles/            # MUI theme configuration
│       └── utils/             # Axios API client (api.ts)
├── backend/
│   └── src/
│       ├── app.js             # Express app (middleware + routes)
│       ├── server.js          # DB connection + server startup
│       ├── controllers/       # Route handler logic
│       ├── models/            # Mongoose schemas (8 models)
│       ├── routes/            # API route definitions
│       ├── middleware/        # auth.js (protect + authorize)
│       ├── utils/             # emailService.js, creditScore.js, auditLog.js
│       ├── scripts/           # createAdmin.js seed script
│       └── uploads/           # Local file storage (Multer)
│   ├── tests/
│   │   ├── setup.js           # In-memory MongoDB test setup
│   │   ├── unit/              # Unit tests
│   │   ├── integration/       # Integration tests
│   │   └── security/          # Security tests
│   └── logs/                  # email.log (SendGrid audit trail)
└── package.json               # Root workspace config
```
