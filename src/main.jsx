import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { TaskProvider } from './context/TaskContext'
import { GoogleOAuthProvider } from '@react-oauth/google'

// Load Client ID from environment variables
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <TaskProvider>
                <App />
            </TaskProvider>
        </GoogleOAuthProvider>
    </React.StrictMode>,
)
