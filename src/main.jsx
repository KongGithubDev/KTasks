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
        primary: { main: '#6366f1', light: '#818cf8', dark: '#4f46e5' },
        secondary: { main: '#ec4899' },
        background: { default: '#f8fafc', paper: 'rgba(255,255,255,0.7)' },
        text: { primary: '#1e293b', secondary: '#64748b' },
    },
    shape: { borderRadius: 16 },
    components: {
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    backdropFilter: 'blur(12px)',
                    backgroundColor: 'rgba(255,255,255,0.7)',
                    border: '1px solid rgba(255,255,255,0.5)',
                    boxShadow: '0 8px 32px rgba(31,38,135,0.1)',
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: { textTransform: 'none', borderRadius: 12, fontWeight: 600 },
            },
        },
        MuiIconButton: {
            styleOverrides: {
                root: { borderRadius: 12 },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 12,
                        backgroundColor: 'rgba(255,255,255,0.5)',
                    },
                },
            },
        },
        MuiDialog: {
            styleOverrides: {
                paper: {
                    borderRadius: 24,
                    backdropFilter: 'blur(20px)',
                    backgroundColor: 'rgba(255,255,255,0.85)',
                    border: '1px solid rgba(255,255,255,0.6)',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
                },
            },
        },
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
