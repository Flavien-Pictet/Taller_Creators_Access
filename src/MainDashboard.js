import React, { useState, useEffect } from 'react';
import App from './App';
import AdmittedDashboard from './AdmittedDashboard';

const PasswordModal = ({ onSuccess }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (password === 'taller2025') {
      sessionStorage.setItem('authenticated', 'true');
      onSuccess();
    } else {
      setError('Invalid password');
      setPassword('');
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.9)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
    }}>
      <div style={{
        background: '#1e293b',
        padding: '40px',
        borderRadius: '16px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
        border: '1px solid #334155',
        maxWidth: '400px',
        width: '90%',
      }}>
        <h2 style={{
          color: '#f1f5f9',
          fontSize: '24px',
          fontWeight: '600',
          marginBottom: '10px',
          textAlign: 'center',
        }}>
          🔒 Access Protected
        </h2>
        <p style={{
          color: '#94a3b8',
          fontSize: '14px',
          marginBottom: '30px',
          textAlign: 'center',
        }}>
          Enter password to access the dashboard
        </p>
        <div>
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError('');
            }}
            onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="Enter password"
            autoFocus
            style={{
              width: '100%',
              padding: '12px 16px',
              border: error ? '2px solid #f87171' : '1px solid #475569',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none',
              background: '#0f172a',
              color: '#f1f5f9',
              marginBottom: '10px',
              boxSizing: 'border-box',
            }}
          />
          {error && (
            <p style={{
              color: '#f87171',
              fontSize: '13px',
              marginBottom: '15px',
              textAlign: 'center',
            }}>
              {error}
            </p>
          )}
          <button
            onClick={handleSubmit}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              color: 'white',
              border: 'none',
              padding: '12px 20px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Unlock Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default function MainDashboard() {
  const [isAuth, setIsAuth] = useState(false);
  const [dashboard, setDashboard] = useState('taller');

  useEffect(() => {
    if (sessionStorage.getItem('authenticated') === 'true') {
      setIsAuth(true);
    }
  }, []);

  if (!isAuth) {
    return <PasswordModal onSuccess={() => setIsAuth(true)} />;
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      padding: '20px', 
      background: '#0f172a',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          * {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          }
        `}
      </style>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{
          background: '#1e293b',
          padding: '12px 20px',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
          border: '1px solid #334155',
          marginBottom: '20px',
          display: 'flex',
          gap: '12px',
        }}>
          <button
            onClick={() => setDashboard('taller')}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              background: dashboard === 'taller' 
                ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' 
                : '#334155',
              color: 'white',
              transition: 'all 0.2s',
            }}
          >
            📏 Taller Dashboard
          </button>
          <button
            onClick={() => setDashboard('admitted')}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              background: dashboard === 'admitted' 
                ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' 
                : '#334155',
              color: 'white',
              transition: 'all 0.2s',
            }}
          >
            🎓 Admitted Dashboard
          </button>
        </div>
        
        {dashboard === 'taller' ? <App /> : <AdmittedDashboard />}
      </div>
    </div>
  );
}