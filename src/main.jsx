import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { TaskProvider } from './context/TaskContext'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'

// Load Client ID from environment variables
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const theme = createTheme({
    palette: {
        mode: 'light',
        primary: { main: '#6366f1' },
        secondary: { main: '#ec4899' },
    },
});

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
                <TaskProvider>
                    <App />
                </TaskProvider>
            </GoogleOAuthProvider>
        </ThemeProvider>
    </React.StrictMode>,
)
