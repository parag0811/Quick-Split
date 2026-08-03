<div align="center">

# 💸 Quick Split

**A full-stack group expense manager that splits bills fairly, settles debts smartly, and flags weird spending before it becomes a fight.**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-5-000000?logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-realtime-010101?logo=socket.io&logoColor=white)](https://socket.io/)
[![License](https://img.shields.io/badge/license-unspecified-lightgrey)]()

[Live Demo](https://quick-split-gamma.vercel.app) · [Report Bug](https://github.com/parag0811/Quick-Split/issues) · [Request Feature](https://github.com/parag0811/Quick-Split/issues)

</div>

---

## About

Quick Split is a group expense-splitting app in the spirit of Splitwise — create a group, add expenses, split them equally, manually, or by percentage, and let the app work out who owes whom. On top of the basics, it plugs in a couple of AI/ML services to do things a plain splitter doesn't: suggest a fair split using an LLM, summarize group fairness in plain English, flag suspiciously large or oddly-timed expenses, and estimate the odds that a settlement will be paid late.

The project is split into three repositories that work together:

| Repository | Role |
|---|---|
| **[Quick-Split](https://github.com/parag0811/Quick-Split)** (this repo) | Next.js frontend + Express/MongoDB backend — the core application |
| [expense-anomaly-ml-service](https://github.com/parag0811/expense-anomaly-ml-service) | FastAPI microservice that scores an expense as anomalous based on the user's spending history |
| [Settlement-risk-predictor](https://github.com/parag0811/Settlement-risk-predictor) | FastAPI microservice (logistic regression) that predicts the probability a settlement will be delayed |

The Quick Split backend calls both microservices over plain HTTP `POST /predict` requests and gracefully falls back to safe defaults if either service is unreachable or unconfigured.

---

## Features

**Groups**
- Create groups with a name and description
- Invite people via a shareable link with a token that expires after 24 hours
- Group creator can regenerate the invite link once the previous one expires
- Remove members, delete groups
- Real-time updates across all members via Socket.io (e.g. someone joins, an expense is added, a settlement is recorded)

**Expenses**
- Add, edit, and soft-delete expenses
- Three split types: **equal**, **manual**, and **percentage**
- Categorize expenses (food, travel, rent, shopping, other)
- Every new/edited expense is scored by the **anomaly-detection microservice**; expenses that look unusually large, unusually small, or suspiciously close together in time get flagged with a human-readable reason (e.g. *"This amount is 6.2x higher than your average spend of ₹450 — unusually large."*)

**AI-assisted splitting**
- `POST /suggest-split` sends the amount, participants, and optional context to **Groq's Llama 3.3 70B** model and gets back a suggested percentage split with a short justification
- Falls back to an equal split automatically if the AI call fails or returns something unparseable

**Balances & Settlements**
- Automatic balance calculation per group (who owes whom, netted across expenses and settlements)
- Record settlements with a method (cash, UPI, bank, other)
- Suggested settlements are scored by the **settlement-risk microservice**, which returns a delay probability and risk level (Low/Medium/High) based on a user's settlement history
- Real-time broadcast when a settlement is recorded

**AI insights**
- Group analytics page generates a short natural-language summary (via Groq) covering who's overpaying, who's underpaying, and how fair the group currently is

**Accounts**
- Google Sign-In (NextAuth on the frontend), exchanged for the app's own JWT on the backend
- Profile photo upload/replace, stored in AWS S3 and served via signed URLs
- Dashboard summary: total spent, amount owed, amount you're owed, recent settlements, latest groups

---

## Tech Stack

**Frontend** — `frontend/`
- [Next.js 16](https://nextjs.org/) (App Router) + React 19
- Redux Toolkit for client state (auth, groups)
- Tailwind CSS v4
- NextAuth.js (Google OAuth provider)
- Socket.io client for real-time group events
- Recharts for analytics charts
- Framer Motion, React Hot Toast, Lucide icons

**Backend** — `backend/`
- Node.js + Express 5 (ESM)
- MongoDB + Mongoose
- JWT authentication (`jsonwebtoken`) + `express-validator` for request validation
- Socket.io server for real-time events, authenticated per-socket via JWT
- AWS S3 (`@aws-sdk/client-s3`) for profile image storage, `multer` for uploads
- Groq SDK (`llama-3.3-70b-versatile`) for AI split suggestions and group insights

**ML microservices** (separate repos, called over HTTP)
- FastAPI + scikit-learn, deployed independently

---

## Architecture

```
┌──────────────────┐        ┌───────────────────────┐
│   Next.js App     │◄──────►│   Express API Server   │
│   (frontend/)     │  REST  │   (backend/)            │
│   + NextAuth       │  +WS   │   + Socket.io server    │
└──────────────────┘        └──────────┬───────────────┘
                                        │
                    ┌───────────────────┼────────────────────┐
                    ▼                   ▼                    ▼
             ┌─────────────┐   ┌──────────────────┐  ┌──────────────────┐
             │  MongoDB     │   │ Groq LLM API      │  │ AWS S3            │
             │  (Mongoose)  │   │ (split + insights)│  │ (profile images)  │
             └─────────────┘   └──────────────────┘  └──────────────────┘
                                        │
                    ┌───────────────────┴────────────────────┐
                    ▼                                          ▼
         ┌──────────────────────────┐          ┌────────────────────────────┐
         │ expense-anomaly-ml-service│          │ Settlement-risk-predictor  │
         │ FastAPI · POST /predict    │          │ FastAPI · POST /predict     │
         └──────────────────────────┘          └────────────────────────────┘
```

---

## API Reference

Base routes are mounted without a version prefix on the Express app (except the AI routes, mounted under `/ai`).

### Auth
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/google` | Exchange Google OAuth profile for a Quick Split JWT |
| `GET` | `/auth/user/profile` | Get the logged-in user's profile + lifetime stats |
| `PUT` | `/auth/user/update-profile` | Update name / upload a new profile image |
| `GET` | `/dashboard/user/summary` | Dashboard summary: balances, groups, recent settlements |

### Groups
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/create-group` | Create a group |
| `POST` | `/groups/join-group` | Join a group via invite token |
| `GET` | `/groups/my-groups` | List the caller's groups |
| `GET` | `/groups/:groupId/summary` | Group summary |
| `POST` | `/groups/:groupId/regenerate-invite` | Regenerate an expired invite link (creator only) |
| `DELETE` | `/groups/:groupId/delete` | Delete a group |
| `POST` | `/groups/:groupId/members/:memberId` | Remove a member |
| `GET` | `/groups/:groupId/analytics` | Group analytics + AI-generated fairness insight |

### Expenses
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/group/:groupId/expense` | List expenses in a group |
| `POST` | `/group/:groupId/expense/add` | Add an expense (runs anomaly detection) |
| `PUT` | `/group/:groupId/expense/:expenseId/edit` | Edit an expense (re-runs anomaly detection) |
| `DELETE` | `/group/:groupId/expenses/:expenseId/deleteExpense` | Soft-delete an expense |

### Balances & Settlements
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/group/:groupId/balances` | Net balances + suggested settlements with risk scores |
| `POST` | `/group/:groupId/settlements` | Record a settlement |
| `GET` | `/group/:groupId/settlements` | List settlements in a group |

### AI
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/ai/suggest-split` | Get an LLM-suggested percentage split for an expense |

All routes except `/auth/google` require a `Bearer` JWT; group-scoped routes additionally check group membership.

---

## Getting Started

### Prerequisites
- Node.js
- A MongoDB connection (local or Atlas)
- A Google OAuth Client ID/Secret ([Google Cloud Console](https://console.cloud.google.com/))
- A [Groq API key](https://console.groq.com/) for AI split suggestions and insights
- An AWS S3 bucket for profile image uploads
- (Optional but recommended) the two ML microservices running/deployed — [expense-anomaly-ml-service](https://github.com/parag0811/expense-anomaly-ml-service) and [Settlement-risk-predictor](https://github.com/parag0811/Settlement-risk-predictor). Without them, anomaly detection and settlement risk simply return safe defaults.

### 1. Clone the repo
```bash
git clone https://github.com/parag0811/Quick-Split.git
cd Quick-Split
```

### 2. Backend setup
```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d

CLIENT_URL=http://localhost:3000

GROQ_API_KEY=your_groq_api_key

AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=your_aws_region
AWS_BUCKET_NAME=your_s3_bucket_name

ANOMALY_ML_SERVICE_URL=http://localhost:8000
SETTLEMENT_RISK_ML_SERVICE_URL=http://localhost:8001
```

Run it:
```bash
npm run dev     # nodemon, with hot reload
# or
npm start
```

### 3. Frontend setup
```bash
cd ../frontend
npm install
```

Create a `.env.local` file in `frontend/`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000

GOOGLE_ID=your_google_oauth_client_id
GOOGLE_SECRET=your_google_oauth_client_secret

NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
```

Run it:
```bash
npm run dev
```

Visit **http://localhost:3000**.

### 4. (Optional) ML microservices
Clone and run [expense-anomaly-ml-service](https://github.com/parag0811/expense-anomaly-ml-service) and [Settlement-risk-predictor](https://github.com/parag0811/Settlement-risk-predictor) locally (both are FastAPI apps exposing a `POST /predict` endpoint), then point `ANOMALY_ML_SERVICE_URL` and `SETTLEMENT_RISK_ML_SERVICE_URL` at them. See each repo for its own setup instructions.

---

## Project Structure

```
Quick-Split/
├── backend/
│   └── src/
│       ├── config/          # S3 client config
│       ├── controllers/     # auth, group, expense, settlement, balance
│       ├── features/ai/     # Groq-powered split suggestions & insights
│       ├── middleware/      # auth, group-membership, validation, multer
│       ├── models/          # User, Group, Expense, Settlement (Mongoose)
│       ├── routes/          # Express routers
│       ├── services/ml/     # HTTP clients for the two ML microservices
│       └── index.js         # Express + Socket.io server entry point
└── frontend/
    └── src/
        ├── app/              # Next.js App Router pages (dashboard, groups, etc.)
        ├── components/       # Layout, landing page, socket listener
        ├── lib/              # API client, socket client, toast helper
        ├── middleware.js     # Route protection for /dashboard
        └── store/            # Redux Toolkit slices (auth, groups)
```

---

## Live Demo

The frontend is deployed at **[quick-split-gamma.vercel.app](https://quick-split-gamma.vercel.app)**.

---

## Related Projects

- 🔎 [expense-anomaly-ml-service](https://github.com/parag0811/expense-anomaly-ml-service) — FastAPI microservice that detects anomalous expenses
- ⚠️ [Settlement-risk-predictor](https://github.com/parag0811/Settlement-risk-predictor) — FastAPI microservice that predicts settlement delay risk
