import React from 'react';

export default function ParticipantItem({
  p,
  sessionId,
  handleStatusChange,
  handleCheckInToggle,
  removeParticipantFromSession, // ← new prop for permanent delete
  showMentorName = false,
  // NEW: reorder props
  showReorderButtons = false,
  handleMove,
  index = 0,
  totalParticipants = 1,
}) {
  // Guard: missing or invalid participant data
  if (!p || !(p.uid || p.id)) {
    console.warn('ParticipantItem: Invalid/missing participant data', p);
    return (
      <div
        style={{
          padding: '12px 16px',
          background: '#fee2e2',
          borderRadius: '8px',
          border: '1px solid #ef4444',
          marginBottom: '12px',
          color: '#991b1b',
          fontSize: '0.9rem',
        }}
      >
        <strong>Invalid participant data</strong> (missing uid/id)
      </div>
    );
  }

  // Safe access with fallbacks
  const userId = p.uid || p.id;
  const statusRaw = p.status || 'pending';
  const status = (typeof statusRaw === 'string' ? statusRaw : 'pending').toLowerCase().trim();

  const isCheckedIn = !!p.checkedIn;
  const participantName =
    p.name ||
    p.displayName ||
    (p.email ? p.email.split('@')[0] : 'Unknown Participant');
  const participantEmail = p.email || `ID: ${userId.slice(0, 12)}` || '—';

  // Status styling
  const statusStyles = {
    pending:   { bg: '#fffbeb', text: '#d97706', label: 'PENDING' },
    approved:  { bg: '#ecfdf5', text: '#10b981', label: 'APPROVED' },
    rejected:  { bg: '#fee2e2', text: '#ef4444', label: 'REJECTED' },
    completed: { bg: '#f3f4f6', text: '#6b7280', label: 'COMPLETED' },
  };

  const currentStyle = statusStyles[status] || statusStyles.pending;

  // Reusable button style
  const getButtonStyle = (baseColor, isDisabled = false) => ({
    padding: '8px 16px',
    fontSize: '0.9rem',
    fontWeight: 600,
    color: 'white',
    background: isDisabled ? '#d1d5db' : baseColor,
    border: 'none',
    borderRadius: '6px',
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    opacity: isDisabled ? 0.65 : 1,
    transition: 'all 0.15s ease',
  });

  // Only show Delete Completely button for pending or approved
  const canDelete = status === 'pending' || status === 'approved';

  // NEW: Reorder button style
  const reorderButtonStyle = (isDisabled = false) => ({
    padding: '4px 10px',
    fontSize: '0.85rem',
    fontWeight: 600,
    color: isDisabled ? '#d1d5db' : '#4b5563',
    background: 'transparent',
    border: `1px solid ${isDisabled ? '#d1d5db' : '#d1d5db'}`,
    borderRadius: '6px',
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    marginLeft: '8px',
    transition: 'all 0.15s ease',
  });

  return (
    <div
      style={{
        padding: '14px 16px',
        background: currentStyle.bg,
        borderRadius: '10px',
        border: `1px solid ${currentStyle.text}40`,
        marginBottom: '12px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <strong style={{ fontSize: '1.05rem', color: '#1e293b' }}>
            {participantName}
          </strong>
          <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '2px' }}>
            {participantEmail}
            {showMentorName && p.mentorName && (
              <span style={{ marginLeft: '12px', color: '#3b82f6' }}>
                → {p.mentorName}
              </span>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span
            style={{
              padding: '6px 14px',
              borderRadius: '999px',
              fontSize: '0.82rem',
              fontWeight: 700,
              background: currentStyle.text,
              color: 'white',
              letterSpacing: '0.4px',
            }}
          >
            {currentStyle.label}
            {isCheckedIn && status === 'approved' && ' ✓ Checked In'}
          </span>
          {/* NEW: Reorder buttons (up/down) */}
          {showReorderButtons && (
            <>
              <button
                onClick={() => handleMove(sessionId, userId, 'up')}
                disabled={index === 0}
                aria-label={`Move ${participantName} up`}
                style={reorderButtonStyle(index === 0)}
              >
                ↑
              </button>
              <button
                onClick={() => handleMove(sessionId, userId, 'down')}
                disabled={index === totalParticipants - 1}
                aria-label={`Move ${participantName} down`}
                style={reorderButtonStyle(index === totalParticipants - 1)}
              >
                ↓
              </button>
            </>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
        {/* Approve */}
        <button
          onClick={() => handleStatusChange(sessionId, userId, 'approved')}
          disabled={status === 'approved' || status === 'completed'}
          aria-label={`Approve ${participantName}`}
          style={getButtonStyle('#10b981', status === 'approved' || status === 'completed')}
        >
          Approve
        </button>

        {/* Reject */}
        <button
          onClick={() => handleStatusChange(sessionId, userId, 'rejected')}
          disabled={status === 'rejected' || status === 'completed'}
          aria-label={`Reject ${participantName}`}
          style={getButtonStyle('#ef4444', status === 'rejected' || status === 'completed')}
        >
          Reject
        </button>

        {/* Check-in toggle (only when approved) */}
        {status === 'approved' && (
          <button
            onClick={() => handleCheckInToggle(sessionId, userId, isCheckedIn)}
            aria-label={isCheckedIn ? `Undo check-in for ${participantName}` : `Check in ${participantName}`}
            style={getButtonStyle(isCheckedIn ? '#3b82f6' : '#6b7280')}
          >
            {isCheckedIn ? 'Undo Check-in' : 'Check In'}
          </button>
        )}

        {/* Mark Done / Undo Done */}
        <button
          onClick={() =>
            handleStatusChange(
              sessionId,
              userId,
              status === 'completed' ? 'approved' : 'completed'
            )
          }
          disabled={status === 'pending' || status === 'rejected'}
          aria-label={
            status === 'completed'
              ? `Reopen ${participantName}`
              : `Mark ${participantName} as completed`
          }
          style={getButtonStyle(
            status === 'completed' ? '#3b82f6' : '#6b7280',
            status === 'pending' || status === 'rejected'
          )}
        >
          {status === 'completed' ? 'Undo Done' : 'Mark Done'}
        </button>
      </div>

      {/* Only permanent delete button – for pending/approved */}
      {canDelete && removeParticipantFromSession && (
        <div style={{ marginTop: '16px', textAlign: 'right' }}>
          <button
            onClick={() => {
              if (window.confirm("Are you sure you want to **permanently delete** this request?\nThis will remove it completely from the session.")) {
                removeParticipantFromSession(sessionId, userId);
              }
            }}
            style={{
              padding: '8px 18px',
              background: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.9rem',
            }}
          >
            Delete Request Completely
          </button>
        </div>
      )}
    </div>
  );
}