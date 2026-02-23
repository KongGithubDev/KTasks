# Render.com Environment Variables Setup

To deploy KTasks correctly on Render, go to your Web Service dashboard, click **Environment**, and add the following variables:

| Key | Value | Notes |
|---|---|---|
| `MONGODB_URI` | `mongodb+srv://...` | **Mandatory** Your Atlas Connection String |
| `GOOGLE_CLIENT_ID` | `YOUR_GOOGLE_CLIENT_ID` | Get this from Google Cloud Console |
| `VITE_GOOGLE_CLIENT_ID` | `YOUR_GOOGLE_CLIENT_ID` | Same as above |
| `JWT_SECRET` | `YOUR_RANDOM_SECRET_STRING` | A long, secure random string |
| `VITE_API_URL` | `/api` | **Crucial** for unified routing |
| `NODE_VERSION` | `20` | Recommendation for stability |

## Deployment Commands recap:
- **Build Command**: `npm install && npm run build && cd server && npm install`
- **Start Command**: `npm start`

> [!TIP]
> Since we've migrated to **MongoDB Atlas**, your data is now safe and persistent across deployment cycles on Render. No additional "Persistent Disk" is required!
