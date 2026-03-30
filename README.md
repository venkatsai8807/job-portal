# ⚡ JobPortal — MERN Stack Job Portal

A full-stack Job Portal application built with **MongoDB, Express.js, React (Vite), and Node.js**.

---

## 🏗️ Project Structure

```
P1/
├── backend/        # Node.js + Express backend (port 5000)
└── frontend/       # React + Vite frontend (port 3000)
```

---

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) v18+ and npm
- [MongoDB](https://www.mongodb.com/try/download/community) (local) **or** a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster

---

### 1️⃣ Backend Setup

```bash
cd backend
npm install
```

Edit `backend/.env` if needed (default uses local MongoDB):
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/jobportal
JWT_SECRET=supersecretjwtkey2024jobportal
```

Start the backend:
```bash
npm run dev      # with nodemon (auto-restart)
# or
npm start        # production
```

The API will be available at `http://localhost:5000`.

---

### 2️⃣ Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The app will open at `http://localhost:3000`.

> The Vite dev server automatically proxies `/api/*` requests to `http://localhost:5000` — no CORS issues!

---

## 🔑 API Endpoints

### Auth
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/api/auth/register` | Public | Register (seeker / recruiter) |
| POST | `/api/auth/login` | Public | Login, returns JWT |
| GET | `/api/auth/me` | Private | Get current user |

### Jobs
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/api/jobs` | Public | List all jobs (supports `?search=` `?location=`) |
| GET | `/api/jobs/:id` | Public | Job detail |
| GET | `/api/jobs/my` | Recruiter | My posted jobs |
| POST | `/api/jobs` | Recruiter | Create job |
| PUT | `/api/jobs/:id` | Recruiter | Update own job |
| DELETE | `/api/jobs/:id` | Recruiter | Delete own job |

### Applications
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/api/applications/:jobId` | Seeker | Apply to job |
| GET | `/api/applications/my` | Seeker | My applications |
| GET | `/api/applications/job/:jobId` | Recruiter | Job applicants |
| PUT | `/api/applications/:id/status` | Recruiter | Update status |

---

## 🧩 Features by Role

### 🔍 Job Seeker
- Register / Login
- Browse & search jobs
- Apply with optional cover letter
- Track application status (applied / shortlisted / rejected)
- Dashboard with stats and recent job listings

### 💼 Recruiter
- Register / Login
- Post, edit, and delete job listings
- View all applicants per job
- Update applicant status (shortlist / reject)
- Dashboard with job and applicant stats

---

## 🛡️ Security
- Passwords hashed with **bcryptjs** (12 salt rounds)
- **JWT** tokens (7 day expiry)
- Role-based access control on all protected routes
- Duplicate application prevention (compound index)
- Input validation with **express-validator**

---

## 🎨 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, React Router 6 |
| State | React Context API |
| HTTP | Axios with JWT interceptor |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |
| Validation | express-validator |
| Notifications | react-hot-toast |
