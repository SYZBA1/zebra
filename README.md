# Zebra Business Path

Zebra helps Ethiopian entrepreneurs create business plans, feasibility studies, and related business documents. The frontend is React and Vite; the API is Node.js and Express.

## Database setup

The app currently uses **both a standalone PostgreSQL database and Supabase**:

- The standalone PostgreSQL database stores project records through the Node API.
- Supabase is still used for sign-in and other existing features, including chat, knowledge, and feedback data.

The migrations in `supabase/migrations/` belong to the Supabase database. They are not a replacement for the standalone PostgreSQL schema and should not be run against your local `zebra_bp` database. The standalone PostgreSQL schema is `backend/migrations/001_projects.sql`.

### Local PostgreSQL in Ubuntu / WSL

Run these commands from Ubuntu/WSL. If PostgreSQL is not installed, install and start it:

```bash
sudo apt update
sudo apt install -y postgresql postgresql-contrib
sudo service postgresql start
```

Create a local database user and database (choose and remember the password when prompted):

```bash
sudo -u postgres createuser --pwprompt zebra_app
sudo -u postgres createdb -O zebra_app zebra_bp
```

Apply the project schema from the repository root:

```bash
psql -h 127.0.0.1 -U zebra_app -d zebra_bp -W \
  -f backend/migrations/001_projects.sql
```

## Configure environment files

Copy the example files if they do not already exist:

```bash
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
```

Edit them with a text editor, for example `nano frontend/.env` and `nano backend/.env`.

In `frontend/.env`, set the Supabase project URL and publishable key. Keep the API URL as:

```env
VITE_API_URL=http://localhost:3001
```

In `backend/.env`, set the PostgreSQL connection and local development options:

```env
DATABASE_URL=postgresql://zebra_app:YOUR_URL_ENCODED_PASSWORD@127.0.0.1:5432/zebra_bp
DATABASE_SSL=false
FRONTEND_URL=http://localhost:8080
PORT=3001
```

Replace the placeholder password with the `zebra_app` password. URL-encode special characters in the password. Also fill in the Supabase and AI/email keys required by the backend features you use. Never commit or share either `.env` file.

## Install and run

Use Ubuntu/WSL for both dependency installation and development. Do not share `node_modules` between Windows and WSL.

Install dependencies from the repository root:

```bash
cd backend && npm ci
cd ../frontend && npm ci
```

From the repository root, start the backend in one terminal:

```bash
cd backend
npm run dev
```

In a second terminal, from the repository root, start the frontend:

```bash
cd frontend
npm run dev -- --host 0.0.0.0
```

Open [http://localhost:8080](http://localhost:8080). The backend health endpoint is [http://localhost:3001/api/health](http://localhost:3001/api/health).
