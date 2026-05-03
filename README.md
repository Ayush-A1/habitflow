# HabitFlow 🔥

> A full-stack habit tracking web app — React TS + Express + MongoDB

---

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React 18 + TypeScript + Vite        |
| Styling    | Tailwind CSS                        |
| State      | Zustand + React Query               |
| Backend    | Node.js + Express + TypeScript      |
| Database   | MongoDB + Mongoose                  |
| Auth       | JWT (Access + Refresh tokens)       |
| Charts     | Recharts                            |
| Forms      | React Hook Form + Zod               |

---

## Project Structure

```
habitflow/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Business logic
│   │   ├── middleware/      # Auth, error handling
│   │   ├── models/          # Mongoose schemas
│   │   ├── routes/          # Express routes
│   │   ├── utils/           # DB connection etc.
│   │   └── index.ts         # Entry point
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── api/             # Axios service functions
│   │   ├── components/      # Reusable UI + layout
│   │   ├── lib/             # Axios client, utils
│   │   ├── pages/           # Page components
│   │   ├── store/           # Zustand stores
│   │   ├── types/           # TypeScript types
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
│
└── package.json             # Root scripts
```

---

## ⚡ Quick Start (VS Code)

### Prerequisites
- Node.js 18+
- MongoDB (local) OR MongoDB Atlas free tier
- VS Code with these extensions: ESLint, Prettier, Tailwind IntelliSense, TypeScript

### 1. Clone & Install

```bash
git clone <your-repo>
cd habitflow

# Install everything in one command
npm run install:all
```

### 2. Configure Backend

```bash
cd backend
cp .env.example .env
```

Edit `.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/habitflow
# OR use Atlas:
# MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/habitflow

JWT_SECRET=pick_a_long_random_string_32chars
JWT_REFRESH_SECRET=another_long_random_string_32chars
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### 3. Run in Development

```bash
# From root — runs both backend + frontend
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api
- Health check: http://localhost:5000/api/health

---

## API Reference

### Auth
| Method | Endpoint              | Description        |
|--------|-----------------------|--------------------|
| POST   | /api/auth/register    | Register user      |
| POST   | /api/auth/login       | Login              |
| POST   | /api/auth/refresh     | Refresh token      |
| POST   | /api/auth/logout      | Logout             |
| GET    | /api/auth/me          | Get current user   |

### Habits
| Method | Endpoint              | Description        |
|--------|-----------------------|--------------------|
| GET    | /api/habits           | Get all habits     |
| POST   | /api/habits           | Create habit       |
| PUT    | /api/habits/:id       | Update habit       |
| DELETE | /api/habits/:id       | Soft delete        |

### Habit Logs
| Method | Endpoint                        | Description              |
|--------|---------------------------------|--------------------------|
| POST   | /api/habit-logs                 | Log a habit              |
| GET    | /api/habit-logs/date/:date      | Logs for a date          |
| GET    | /api/habit-logs/habit/:habitId  | Logs for a habit         |

### Analytics
| Method | Endpoint                    | Description         |
|--------|-----------------------------|---------------------|
| GET    | /api/analytics/overview     | Stats overview      |
| GET    | /api/analytics/trends?days= | Daily trend data    |
| GET    | /api/analytics/weekly       | This week's data    |
| GET    | /api/analytics/heatmap?days=| Heatmap grid data   |

### Goals
| Method | Endpoint              | Description        |
|--------|-----------------------|--------------------|
| GET    | /api/goals            | Get all goals      |
| POST   | /api/goals            | Create goal        |
| PUT    | /api/goals/:id        | Update goal        |
| DELETE | /api/goals/:id        | Delete goal        |
| GET    | /api/goals/:id/progress | Get progress      |

---

## 🚀 Deployment

### Option A: Railway (Recommended — free tier)

**Backend:**
1. Push code to GitHub
2. Go to railway.app → New Project → Deploy from GitHub
3. Select `backend` folder
4. Add environment variables (same as .env)
5. Railway auto-detects Node.js and builds

**Frontend:**
1. Go to Vercel → New Project → Import GitHub repo
2. Set root directory to `frontend`
3. Build command: `npm run build`
4. Output dir: `dist`
5. Add env variable: `VITE_API_URL=https://your-railway-backend.railway.app/api`

Then update `frontend/src/lib/api.ts` baseURL to use `import.meta.env.VITE_API_URL`.

### Option B: Render (Free)

Same as Railway — deploy backend as a Web Service, frontend on Vercel or Render static site.

### MongoDB Atlas (Free cloud DB)

1. Go to mongodb.com/atlas → Create free cluster
2. Get connection string → paste into MONGODB_URI in env

---

## VS Code Recommended Extensions

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "mongodb.mongodb-vscode",
    "humao.rest-client"
  ]
}
```

---

## Future Features (from your PRD)

- [ ] Browser push notifications (Web Push API)
- [ ] Email reminders (Nodemailer / Resend)
- [ ] AI habit suggestions (OpenAI API)
- [ ] Data export (CSV download)
- [ ] Gamification (badges, streaks rewards)
- [ ] Google OAuth (NextAuth or Passport.js)
- [ ] React Native mobile app

---

## Common Issues

**MongoDB connection fails:** Make sure MongoDB is running locally (`mongod`) or your Atlas IP whitelist includes your IP.

**CORS errors:** Check `FRONTEND_URL` in backend .env matches your frontend URL exactly.

**TypeScript errors:** Run `npm run build` in both folders to catch type issues before deploying.
