// src/components/PasswordModal.js
import React, { useState } from 'react';

export default function PasswordModal({ onSuccess }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (password === 'taller2025') {
      setIsValidating(true);
      // Animation de succès
      setTimeout(() => {
        setIsSuccess(true);
        // Attendre que l'animation se termine avant de rediriger
        setTimeout(() => {
          sessionStorage.setItem('authenticated', 'true');
          onSuccess();
        }, 800);
      }, 300);
    } else {
      setError('Invalid password');
      setPassword('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div style={{ minHeight: '100vh', padding: '0', margin: '0', background: '#0f172a', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <style>{`
        body { margin: 0 !important; } 
        input::placeholder { color: #64748b; }
        @keyframes spin {
          0% { transform: translateY(-50%) rotate(0deg); }
          100% { transform: translateY(-50%) rotate(360deg); }
        }
        @keyframes successPulse {
          0% { transform: scale(1); border-color: #334155; }
          50% { transform: scale(1.02); border-color: #10b981; box-shadow: 0 0 20px rgba(16, 185, 129, 0.5); }
          100% { transform: scale(1); border-color: #10b981; }
        }
        @keyframes fadeOut {
          0% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-20px); }
        }
        @keyframes fadeIn {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .success-animation {
          animation: successPulse 0.6s ease-in-out;
        }
        .fade-out {
          animation: fadeOut 0.5s ease-in-out forwards;
        }
        .fade-in {
          animation: fadeIn 0.5s ease-in-out forwards;
        }
      `}</style>
      <div style={{ textAlign: 'center', width: '100%', maxWidth: '600px', padding: '20px' }}>
        <h1 className={isSuccess ? 'fade-out' : ''} style={{ fontSize: '48px', fontWeight: '600', color: '#f1f5f9', marginBottom: '40px', marginTop: 0, transition: 'opacity 0.3s ease' }}>Taller Analytics</h1>
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <input
              type={isSuccess ? 'text' : 'password'}
              placeholder={isSuccess ? 'Enter your tiktok username' : 'Enter password'}
              value={isSuccess ? '' : password}
              onChange={(e) => {
                if (!isSuccess) {
                  setPassword(e.target.value);
                  setError('');
                }
              }}
              onKeyPress={handleKeyPress}
              autoFocus
              disabled={isValidating || isSuccess}
              className={isSuccess ? 'success-animation fade-in' : isValidating ? 'success-animation' : ''}
              style={{
                width: '100%',
                padding: '16px 24px',
                border: error ? '2px solid #ef4444' : isSuccess ? '2px solid #10b981' : '2px solid #334155',
                borderRadius: '24px',
                fontSize: '16px',
                outline: 'none',
                background: isSuccess ? '#1e293b' : '#1e293b',
                color: '#f1f5f9',
                boxShadow: isSuccess ? '0 0 20px rgba(16, 185, 129, 0.3)' : '0 4px 6px rgba(0,0,0,0.3)',
                transition: 'all 0.3s ease',
                boxSizing: 'border-box',
                opacity: isValidating ? 0.7 : 1
              }}
              onFocus={(e) => {
                if (!error && !isSuccess) e.target.style.borderColor = '#3b82f6';
              }}
              onBlur={(e) => {
                if (!error && !isSuccess) e.target.style.borderColor = '#334155';
              }}
            />
            {isValidating && !isSuccess && (
              <div style={{
                position: 'absolute',
                right: '20px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '20px',
                height: '20px',
                border: '2px solid #334155',
                borderTopColor: '#3b82f6',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite'
              }} />
            )}
            {isSuccess && (
              <div style={{
                position: 'absolute',
                right: '20px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '24px',
                color: '#10b981',
                fontWeight: 'bold',
                animation: 'fadeIn 0.3s ease-in-out'
              }}>
                ✓
              </div>
            )}
          </div>
          {error && !isSuccess && (
            <p style={{ color: '#ef4444', fontSize: '14px', marginTop: '12px', marginBottom: 0 }}>
              {error}
            </p>
          )}
          {isSuccess && (
            <p style={{ color: '#10b981', fontSize: '14px', marginTop: '12px', marginBottom: 0, animation: 'fadeIn 0.5s ease-in-out' }}>
              ✓ Access granted! Redirecting...
            </p>
          )}
        </form>
      </div>
    </div>
  );
}