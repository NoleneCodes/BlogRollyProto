import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ErrorContextType {
  showError: (message: string) => void;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export const useError = () => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
};

export const ErrorProvider = ({ children }: { children: ReactNode }) => {
  const [error, setError] = useState<string | null>(null);

  const showError = (message: string) => {
    setError(message);
    setTimeout(() => setError(null), 5000); // Auto-hide after 5s
  };

  return (
    <ErrorContext.Provider value={{ showError }}>
      {children}
      {error && <ErrorModal message={error} onClose={() => setError(null)} />}
    </ErrorContext.Provider>
  );
};

interface ErrorModalProps {
  message: string;
  onClose: () => void;
}

const ErrorModal = ({ message, onClose }: ErrorModalProps) => (
  <div style={{
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    background: 'rgba(0,0,0,0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999
  }}>
    <div style={{
      background: '#fff',
      padding: '2rem',
      borderRadius: '8px',
      boxShadow: '0 2px 16px rgba(0,0,0,0.2)',
      minWidth: '300px',
      maxWidth: '90vw',
      textAlign: 'center',
      position: 'relative'
    }}>
      <h2 style={{ color: '#d32f2f', marginBottom: '1rem' }}>Error</h2>
      <div style={{ marginBottom: '1.5rem' }}>{message}</div>
      <button onClick={onClose} style={{
        background: '#d32f2f',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        padding: '0.5rem 1.5rem',
        cursor: 'pointer',
        fontWeight: 600
      }}>Close</button>
    </div>
  </div>
);
