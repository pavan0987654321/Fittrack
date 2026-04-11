# FitTrack – Gym Management System

A full-stack gym management system built with React.js (Vite), Node.js, Express, and MongoDB.

## 📁 Project Structure

```
fittrack/
├── client/          # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   ├── context/       # Zustand stores
│   │   ├── layouts/       # DashboardLayout
│   │   ├── pages/         # All page components
│   │   └── services/      # Axios API service
│   ├── tailwind.config.js
│   └── vite.config.js
│
└── server/          # Node.js + Express backend
    ├── controllers/
    ├── middleware/
    ├── models/
    ├── routes/
    └── server.js
```

## 🚀 Quick Start

### Prerequisites
- Node.js v18+ ([nodejs.org](https://nodejs.org))
- MongoDB running locally or MongoDB Atlas URI

### 1. Install backend dependencies
```bash
cd server
npm install
```

### 2. Configure backend env
Edit `server/.env`:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/fittrack
JWT_SECRET=your_secret_key_here
```

### 3. Start backend
```bash
cd server
npm run dev
```

### 4. Install frontend dependencies
```bash
cd client
npm install
```

### 5. Start frontend
```bash
cd client
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## 🔑 Default Admin Login
Use the **"Quick Demo Login"** button on the login page, or register manually:
- Email: `admin@fittrack.com`
- Password: `admin123`

## 🛠️ Tech Stack

| Layer      | Technology                          |
|------------|--------------------------------------|
| Frontend   | React 18 + Vite                     |
| Styling    | Tailwind CSS + Framer Motion         |
| State Mgmt | Zustand (with persistence)          |
| Routing    | React Router DOM v6                 |
| Charts     | Recharts                            |
| HTTP       | Axios                               |
| Icons      | Lucide React                        |
| Backend    | Node.js + Express                   |
| Database   | MongoDB + Mongoose                  |
| Auth       | JWT + bcryptjs                      |

## 📡 API Endpoints

| Method | Endpoint             | Description          |
|--------|----------------------|----------------------|
| POST   | /api/auth/register   | Register user        |
| POST   | /api/auth/login      | Login                |
| GET    | /api/auth/me         | Get profile          |
| GET    | /api/members         | List members         |
| POST   | /api/members         | Create member        |
| GET    | /api/members/stats   | Member statistics    |
| GET    | /api/trainers        | List trainers        |
| POST   | /api/trainers        | Create trainer       |
| GET    | /api/plans           | List plans           |
| POST   | /api/plans           | Create plan          |
| GET    | /api/payments        | List payments        |
| POST   | /api/payments        | Create payment       |
| GET    | /api/payments/stats  | Revenue statistics   |
| GET    | /api/health          | Health check         |
