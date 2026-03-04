import React from 'react';

export default function RequestPopup({ onCancel, onConfirm }) {
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
      onClick={onCancel}
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
        <h2 style={{ color: '#1e293b', marginBottom: '16px', fontSize: '1.8rem' }}>
          Confirm Request
        </h2>
        <p style={{ color: '#64748b', marginBottom: '24px', fontSize: '1.1rem' }}>
          Send request to Admin for mentorship?
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '12px 32px',
              background: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '1.05rem',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: '12px 32px',
              background: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '1.05rem',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Yes, Send
          </button>
        </div>
      </div>
    </div>
  );
}