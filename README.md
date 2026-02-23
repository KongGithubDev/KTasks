# KTasks

A clean, high-performance task manager with a focus on aesthetics and smooth interactions. built using React (Vite) and MongoDB Atlas.

## How it works

KTasks uses a glassmorphism design language. I've focused on making the UI feel responsive and "alive" with micro-animations. It supports Google OAuth for authentication and stores everything in a MongoDB Atlas database for reliable data persistence.

### Key Features
* **Modern UI**: Full glassmorphism design with dark mode support.
* **Auth**: Secure login via Google.
* **Organization**: Custom lists, task prioritization, and subtasks.
* **Database**: Persistent storage using MongoDB Atlas (no data loss on redeploy).
* **Speed**: Built for performance with Vite and a fast Node.js backend.
* **Deployed**: Production-ready setup for Render.com.

## Tech Stack
* **Frontend**: React 18, Vite, Framer Motion, Lucide
* **Backend**: Node.js, Express 5
* **Database**: MongoDB Atlas (Mongoose)

## Setup & Installation

I recommend using Node 20+.

1. **Install dependencies**
   ```bash
   npm install
   cd server && npm install
   ```

2. **Environment Variables**
   Set up your `.env` in both the root and `server/` folders. You'll need:
   - `MONGODB_URI` (Your Atlas connection string)
   - `GOOGLE_CLIENT_ID`
   - `JWT_SECRET`
   - `VITE_GOOGLE_CLIENT_ID`
   - `VITE_API_URL` (usually `/api` for dev/prod)

3. **Development**
   Run the frontend:
   ```bash
   npm run dev
   ```
   Run the backend:
   ```bash
   cd server && node index.js
   ```

## Production
To build for production:
```bash
npm run build
npm start
```

## Credits
Project by **Watcharapong Namsaeng**.
