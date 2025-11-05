import React from 'react';
import AdBlockerNotice from './components/AdBlockerNotice.jsx';
import CookiesConsentConfig from './components/CookiesConsentConfig.jsx';
import NewsletterConfirm from './pages/NewsletterConfirm.jsx';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth.jsx';
import Menu from './components/Menu.jsx';
import Footer from './components/Footer.jsx';
import Home from './components/Home.jsx';
import Profile from './pages/profile/Profile.jsx';
import AdminPanel from './components/AdminPanel.jsx';
import AdminRoute from './components/AdminRoute.jsx';
import AccountSettings from './pages/AccountSettings.jsx';
import EditProfile from './pages/EditProfile.jsx';
import PrivacyCookies from './pages/PrivacyCookies.jsx';
import TermsDisclaimer from './pages/TermsDisclaimer.jsx';
import Disclaimer from './pages/Disclaimer.jsx';
import Methodology from './pages/Methodology.jsx';
import './styles/global.css';
import AdminRegister from './pages/AdminRegister.jsx';
import DreamInterpretation from './pages/DreamInterpretation.jsx';
import TarotReading from './pages/TarotReading.jsx';
import RunesReading from './pages/RunesReading.jsx';
import HoroscopeDaily from './pages/HoroscopeDaily.jsx';
import Tutoriales from './components/Tutoriales.jsx';
import TutorialDetail from './components/TutorialDetail.jsx';
import Planes from './components/Planes.jsx';
import WeeklyBonus from './components/WeeklyBonus.jsx';
import WhatsAppFloatingButton from './components/WhatsAppFloatingButton.jsx';
import ForgotPassword from './components/ForgotPassword.jsx';
import ResetPassword from './components/ResetPassword.jsx';

// Componente para rutas protegidas
function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '400px',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid #333',
          borderTop: '3px solid #d4af37',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ color: '#adb5bd' }}>Verificando acceso...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (adminOnly && user.role !== 'ADMIN' && user.email !== 'hola@nebulosamagica.com') {
    return <Navigate to="/profile" replace />;
  }

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AdBlockerNotice />
        <Menu />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/newsletter/confirmar" element={<NewsletterConfirm />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/tarot" element={<ProtectedRoute><TarotReading /></ProtectedRoute>} />
          <Route path="/runes" element={<ProtectedRoute><RunesReading /></ProtectedRoute>} />
          <Route path="/readings/history" element={<ProtectedRoute><Profile view="history" /></ProtectedRoute>} />
          <Route path="/dream-interpretation" element={<ProtectedRoute><DreamInterpretation /></ProtectedRoute>} />
          <Route path="/horoscope-daily" element={<ProtectedRoute><HoroscopeDaily /></ProtectedRoute>} />
          <Route path="/tutoriales" element={<Tutoriales />} />
          <Route path="/tutoriales/:slug" element={<TutorialDetail />} />
          <Route path="/planes" element={<Planes />} />
          <Route path="/bonos" element={<ProtectedRoute><WeeklyBonus /></ProtectedRoute>} />
          <Route path="/account" element={<ProtectedRoute><AccountSettings /></ProtectedRoute>} />
          <Route path="/edit-profile" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
          <Route path="/privacy" element={<PrivacyCookies />} />
          <Route path="/terms" element={<TermsDisclaimer />} />
          <Route path="/disclaimer" element={<Disclaimer />} />
          <Route path="/methodology" element={<Methodology />} />
          <Route path="/admin" element={
            <ProtectedRoute adminOnly>
              <AdminPanel />
            </ProtectedRoute>
          } />
          {/* Ruta temporal para crear admin */}
          <Route path="/admin-register" element={<AdminRegister />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
  <CookiesConsentConfig />
        <Footer />
        <WhatsAppFloatingButton />
      </Router>
    </AuthProvider>
  );
}