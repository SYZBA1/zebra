# Zebra Business Path 🦓

An AI-powered business planning platform built for Ethiopian entrepreneurs. Zebra helps users create feasibility studies, business plans, company profiles and more — guided by a 6-pillar framework, fully bilingual (English & Amharic), and connected to a knowledge base of Ethiopian market data.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui |
| Backend | Node.js + Express + TypeScript |
| Database | PostgreSQL, accessed by the Node.js API using `pg` |
| Auth | Supabase Auth (JWT), verified by the Node.js API |
| AI | Google Gemini 2.5 Flash (direct API) |
| Embeddings / RAG | VoyageAI voyage-3 (1024-dim vectors) |
| Email | Resend (direct API) |
| Exports | jsPDF + docx |

---

## Project Structure

```
zebra-bp/
├── frontend/                  React + Vite frontend application
│   ├── src/
│   │   ├── components/        Reusable UI components
│   │   ├── pages/             Page components (one per route)
│   │   ├── hooks/             Custom React hooks
│   │   ├── lib/               Business logic and API clients
│   │   │   └── projects-api.ts Authenticated Node API client for project data
│   │   └── integrations/      Supabase Auth client
│   ├── public/                Static assets
│   ├── .env.example           Frontend environment template
│   └── package.json
│
├── backend/                   Node.js + Express API server
│   ├── src/
│   │   ├── routes/            API route handlers
│   │   │   ├── chat.ts        POST /api/chat
│   │   │   ├── draft.ts       POST /api/draft
│   │   │   ├── health.ts      POST /api/health-diagnose
│   │   │   ├── feedback.ts    POST /api/feedback
│   │   │   ├── knowledge.ts   POST /api/knowledge/ingest
│   │   │   └── projects.ts    Authenticated PostgreSQL project CRUD / restore
│   │   ├── middleware/        Auth and admin guards
│   │   │   ├── authMiddleware.ts
│   │   │   └── adminMiddleware.ts
│   │   ├── lib/               Shared helpers
│   │   │   ├── ai.ts          Google Gemini API wrapper
│   │   │   ├── db.ts          PostgreSQL connection pool
│   │   │   ├── embeddings.ts  VoyageAI wrapper
│   │   │   └── email.ts       Resend email wrapper
│   │   └── index.ts           Express app entry point
│   ├── scripts/
│   │   └── create-admin.ts    Local CLI to create admin users
│   ├── archive/               Retired Supabase edge functions (reference only)
│   ├── .env.example           Backend environment template
│   └── package.json
│
├── supabase/
│   └── migrations/            Database schema history (21 migration files)
│
└── README.md
```

---

## Getting Started

### Prerequisites
- Node.js 18+ (download from nodejs.org)
- A Supabase project (supabase.com)
- A Google Gemini API key (aistudio.google.com)

---

### Step 1 — Clone and install

```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

---

### Step 2 — Set up environment variables

**Frontend:**
```bash
cd frontend
copy .env.example .env
```

Edit `frontend/.env`:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
VITE_API_URL=http://localhost:3001
```

**Backend:**
```bash
cd backend
copy .env.example .env
```

Edit `backend/.env`:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_publishable_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_secret_key
DATABASE_URL=postgresql://postgres.xxx:PASSWORD@aws-0-xxx.pooler.supabase.com:6543/postgres
GEMINI_API_KEY=your_gemini_api_key
VOYAGE_API_KEY=your_voyage_key
RESEND_API_KEY=your_resend_key
FEEDBACK_RECIPIENT_EMAIL=admin@example.com
FRONTEND_URL=http://localhost:8080
PORT=3001
```

---

### Step 3 — Set up PostgreSQL

Set `DATABASE_URL` in the backend environment and run `backend/migrations/001_projects.sql` once. Supabase handles login; project data goes through the Node.js API to PostgreSQL. Keep the database URL secret, and migrate existing project data before switching the live app.

### Step 4 — Start the servers

Open **two terminals**:

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
```
✅ You should see: `Zebra BP backend running on http://localhost:3001`

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```
✅ You should see: `Local: http://localhost:8080`

Then open your browser at **http://localhost:8080**

---

### Step 5 — Create the first admin user

Run this locally only — it is never exposed as an HTTP endpoint:

```bash
cd backend
npx tsx scripts/create-admin.ts admin@example.com yourSecurePassword123
```

Then log in at `/admin/login`.

---

## API Routes

| Method | Route | Auth Required | Description |
|---|---|---|---|
| GET | `/api/health` | None | Server health check |
| POST | `/api/chat` | User login | AI chat assistant (bilingual) |
| POST | `/api/draft` | User login | AI document section writer |
| POST | `/api/health-diagnose` | User login | Business health diagnostic |
| POST | `/api/feedback` | None | Submit visitor feedback |
| POST | `/api/knowledge/ingest` | Admin only | Ingest knowledge base documents |

---

## Environment Variables Reference

### Frontend (`frontend/.env`)

| Variable | Where to get it |
|---|---|
| `VITE_SUPABASE_URL` | Supabase → Settings → API → Project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase → Settings → API → Publishable key |
| `VITE_API_URL` | Your backend URL (default: `http://localhost:3001`) |

### Backend (`backend/.env`)

| Variable | Where to get it |
|---|---|
| `SUPABASE_URL` | Supabase → Settings → API → Project URL |
| `SUPABASE_ANON_KEY` | Supabase → Settings → API → Publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → Secret key |
| `DATABASE_URL` | PostgreSQL provider → connection URI (backend only) |
| `GEMINI_API_KEY` | [aistudio.google.com](https://aistudio.google.com) → Get API key |
| `VOYAGE_API_KEY` | [voyageai.com](https://voyageai.com) → Dashboard → API Keys |
| `RESEND_API_KEY` | [resend.com](https://resend.com) → API Keys |
| `FEEDBACK_RECIPIENT_EMAIL` | Email address to receive feedback notifications |
| `FRONTEND_URL` | Frontend origin for CORS (default: `http://localhost:8080`) |
| `PORT` | Backend server port (default: `3001`) |

---

## Document Types Supported

| Document | Description |
|---|---|
| Feasibility Study | Market viability, financial projections, risk analysis |
| Business Plan | Company strategy, financial plan, growth roadmap |
| Business Proposal | Opportunity framing, scope, expected value |
| Company Profile | Organization overview, mission, core services |
| Strategic Business Development | Growth engine, B2B partnerships, market entry |
| Organizational Structure | Hierarchy, reporting lines, key roles |
| Performance Tracking | KPIs, delivery timelines, client retention |
| Business Health Analysis | Cash flow, profit margins, risk matrix |

---

## Security Notes

- All user data is isolated via Supabase Row Level Security (RLS)
- The `/api/knowledge/ingest` endpoint requires admin role
- The `backend/scripts/create-admin.ts` script runs locally only — never exposed via HTTP
- Service role key is only used server-side, never in the frontend
- JWT tokens are verified on every protected API request

---

## Weekly Development Plan

This project follows a 12-week improvement roadmap:

| Week | Focus |
|---|---|
| 1 | Technical audit and schedule |
| 2 | Core workflow stability |
| 3 | AI generation reliability |
| 4 | UX and bilingual fixes |
| 5 | Security and data access |
| 6 | Monitoring and analytics |
| 7 | Performance and storage |
| 8 | Commercial readiness |
| 9 | Regression and scale testing |
| 10 | Release candidate |
| 11 | Feedback release |
| 12 | Production readiness |

---

Built by the Zebra Business Path team.
