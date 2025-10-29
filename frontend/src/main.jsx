import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { AuthProvider } from './hooks/useAuth.jsx';
import './styles/global.css';

const container = document.getElementById('root');
createRoot(container).render(
  <AuthProvider>
    <App />
  </AuthProvider>
);