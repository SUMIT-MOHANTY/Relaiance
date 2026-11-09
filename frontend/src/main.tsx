/**
 * main.tsx - React 18 Application Entry Point
 * 
 * Initializes the React application with:
 * - ThemeProvider for DERTOUR design system
 * - AuthProvider for authentication state
 * - ToastProvider for notifications
 * - StrictMode for development checks
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import App from './App';
import { dertourTheme } from './config/theme';
import { AuthProvider } from './store/authStore';
import { ToastProvider } from './components/common/ToastProvider';

// Import Inter font from Google Fonts
const link = document.createElement('link');
link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap';
link.rel = 'stylesheet';
document.head.appendChild(link);

// Mount React application
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found. Ensure index.html contains a div with id="root"');
}

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider theme={dertourTheme}>
        <CssBaseline />
        <ToastProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
