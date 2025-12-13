// src/App.js
import React, { useState, useEffect } from 'react';
import TallerDashboard from './components/TallerDashboard';
import PasswordModal from './components/PasswordModal';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem('authenticated') === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  if (!isAuthenticated) {
    return <PasswordModal onSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a' }}>
      <TallerDashboard />
    </div>
  );
}