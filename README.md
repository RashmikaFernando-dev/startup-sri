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
| Frontend | Next.js 14, TypeScript, Material UI, Redux Toolkit |
| Backend | Node.js, Express.js, MongoDB, Mongoose |
| Auth | JWT, bcrypt, role-based access control |
| Payments | PayHere (sandbox), Stripe-compatible flow |
| Notifications | SendGrid email service |
| File Storage | Multer (local), Cloudinary (KYC documents) |

---

## Key Features

- JWT authentication with role-based access control (Entrepreneur / Investor / Admin)
- Multi-step KYC identity verification with admin approval workflow
- Project submission with multi-step form and document upload
- Hybrid funding support — microloan (with repayment schedule) and equity investment
- Rule-based credit scoring for each project visible to investors
- Entrepreneur repayment tracking — view instalments and mark as paid
- Investor portfolio dashboard with investment and repayment overview
- Entrepreneur analytics dashboard with funding progress and stats
- Admin management console — users, projects, KYC review, transaction log
- Project comments and discussion for investors
- Local file storage for business plan and proposal documents
- Payment gateway integration (PayHere sandbox)
- Automated email notifications for key events

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

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend API: [http://localhost:5000](http://localhost:5000)

### Environment Variables

Create a `.env` file in the project root with the following:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
SENDGRID_API_KEY=your_sendgrid_key
PAYHERE_MERCHANT_ID=your_payhere_id
PAYHERE_SECRET=your_payhere_secret
```

---

## User Roles

| Role | Access |
|---|---|
| **Entrepreneur** | Submit projects, manage listings, view repayment schedule |
| **Investor** | Browse projects, fund startups, view portfolio |
| **Admin** | Manage users, review KYC, approve projects, view transactions |

---

## Database Collections

| Collection | Description |
|---|---|
| `users` | All registered users with roles |
| `kyc_verifications` | KYC document records per entrepreneur |
| `projects` | Startup project listings |
| `investments` | Investment records with repayment schedules |

---

## Admin Console

```
URL:      http://localhost:3000/admin/login
Email:    admin@startupsri.lk
Password: Admin@1234
```

---

## Test Payment Card (PayHere Sandbox)

```
Card Number:  4916 2175 0161 1292
CVV:          123
Expiry:       12/26
Name:         Test User
```

---

## Project Structure

```
startup_sri/
├── frontend/          # Next.js app (pages, components, redux)
│   └── src/
│       ├── pages/     # Route pages (user/, admin/, auth/)
│       ├── components/# Reusable UI components
│       └── redux/     # State management slices
├── backend/           # Express REST API
│   └── src/
│       ├── controllers/
│       ├── models/    # Mongoose schemas
│       ├── routes/    # API route handlers
│       └── utils/     # emailService, creditScore
└── .env               # Environment variables
```
