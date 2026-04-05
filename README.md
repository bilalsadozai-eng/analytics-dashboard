# 📊 AnalytiQ — Real-Time Collaborative Analytics Dashboard

> Full-stack React + TypeScript + Socket.io dashboard with live collaboration, drag-and-drop, and RBAC.

## ✨ Features
- 🔴 Real-time multi-user collaboration (live cursors, instant sync)
- 🎭 Role-Based Access Control (Admin / Editor / Viewer)
- 🖱️ Drag & Drop widgets from sidebar to canvas
- 📊 6 widget types: Line, Bar, Pie charts, KPI cards, Activity table, Notes
- 📡 Charts auto-update every 5 seconds
- 🌙 Dark / Light mode
- 📤 Export PDF & JSON, Import JSON layout

## 🚀 Quick Start

### Install & Run
```bash
npm run install:all   # Install all dependencies
npm run dev           # Start frontend (port 5173) + backend (port 3001)
```

Open http://localhost:5173

## 👤 Demo Accounts
| Email | Role |
|-------|------|
| admin@dashboard.com | Admin (full access) |
| editor@dashboard.com | Editor |
| viewer@dashboard.com | Viewer (read-only) |

> Open 2 tabs simultaneously to see real-time collaboration!

## 🌐 Free Deployment

### Frontend → Vercel
```bash
cd client && npm run build
npx vercel --prod
```

### Backend → Railway.app
1. railway.app → New Project → Deploy from GitHub → select `server/` folder
2. Add env: `JWT_SECRET=your_secret`
3. Copy Railway URL → set in Vercel env as `VITE_SERVER_URL`

## 🏗️ Architecture
```
analytics-dashboard/
├── client/          # React 18 + TypeScript + Vite
│   └── src/
│       ├── components/   # UI, Widgets, Layout, Collaboration
│       ├── hooks/        # useSocket, useAuth
│       ├── store/        # Zustand stores
│       ├── types/        # TypeScript interfaces
│       └── pages/        # Login, Dashboard
└── server/          # Node.js + Express + Socket.io
    └── src/index.ts
```

## Tech Stack
React 18 · TypeScript · Vite · Tailwind CSS · Socket.io · Zustand · Recharts · @dnd-kit · Express · JWT
