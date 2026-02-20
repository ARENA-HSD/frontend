/**
 * HSD Arena - Main Entry Point
 * 
 * Application entry point that renders the root component
 * and imports global styles.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
