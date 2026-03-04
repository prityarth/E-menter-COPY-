import React from 'react';

export default function SuccessPopup({ onClose }) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'white',
          padding: '40px',
          borderRadius: '20px',
          maxWidth: '400px',
          textAlign: 'center',
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ color: '#065f46', marginBottom: '16px', fontSize: '1.8rem' }}>
          Request Sent!
        </h2>
        <p style={{ color: '#64748b', marginBottom: '24px', fontSize: '1.1rem' }}>
          Waiting for Admin approval.
        </p>
        <button
          onClick={onClose}
          style={{
            padding: '12px 32px',
            background: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '1.1rem',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          OK
        </button>
      </div>
    </div>
  );
}