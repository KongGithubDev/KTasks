# KTasks

A clean, high-performance task manager with a focus on aesthetics and smooth interactions. built using React (Vite) and SQLite.

## How it works

KTasks uses a glassmorphism design language. I've focused on making the UI feel responsive and "alive" with micro-animations. It supports Google OAuth for authentication and stores everything in a local SQLite database on the backend.

### Key Features
* **Modern UI**: Full glassmorphism design with dark mode support.
* **Auth**: Secure login via Google.
* **Organization**: Custom lists, task prioritization, and subtasks.
* **Speed**: Built for performance with Vite and a lightweight SQLite backend.
* **Deployed**: Production-ready setup for Render.com.

## Tech Stack
* **Frontend**: React 18, Vite, Framer Motion, Lucide
* **Backend**: Node.js, Express 5
* **Database**: SQLite3

## Setup & Installation

I recommend using Node 20+.

1. **Install dependencies**
   ```bash
   npm install
   cd server && npm install
   ```

2. **Environment Variables**
   Set up your `.env` in both the root and `server/` folders. You'll need:
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
