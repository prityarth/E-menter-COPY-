import React, { useMemo } from 'react';
import ParticipantItem from './ParticipantItem';
export default function RequestsAndApprovals({
  sessions = [],
  requestsView = 'mentors',
  setRequestsView,
  getStudentRequests = [],
  handleStatusChange,
  handleCheckInToggle,
  removeParticipantFromSession,
  handleMoveParticipant, // ← NEW: prop for reordering
}) {
  const hasSessions = Array.isArray(sessions) && sessions.length > 0;
  if (!hasSessions) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '100px 24px',
        color: '#64748b',
        fontSize: '1.2rem',
        background: '#f8fafc',
        borderRadius: '16px',
        margin: '32px 0',
        border: '1px dashed #cbd5e1',
      }}>
        <h3 style={{ margin: '0 0 16px', color: '#475569' }}>
          No mentorship slots yet
        </h3>
        <p style={{ margin: '0 0 12px' }}>
          Create some sessions in the <strong>Manage Schedule</strong> tab first.
        </p>
        <small style={{ color: '#94a3b8' }}>
          Team requests and check-ins will appear here automatically.
        </small>
      </div>
    );
  }
  // Mentor stats (unchanged)
  const mentorStats = sessions.map(session => {
    const participants = Array.isArray(session.participants) ? session.participants : [];
    return {
      id: session.id,
      mentorName: session.mentorName || 'Unnamed Mentor',
      room: session.room || '—',
      total: participants.length,
      pending: participants.filter(p => (p?.status || '').toLowerCase() === 'pending').length,
      approved: participants.filter(p => (p?.status || '').toLowerCase() === 'approved').length,
      max: session.maxParticipants ?? 10,
    };
  }).filter(stat => stat.total > 0);
  const totalRequests = mentorStats.reduce((sum, m) => sum + m.total, 0);
  // ── Editable requests grouped by TEAM ──────────────────────────
  const editableRequestsByTeam = useMemo(() => {
    const teamMap = new Map();
    sessions.forEach(session => {
      const participants = Array.isArray(session.participants) ? session.participants : [];
      participants.forEach(p => {
        const statusLower = (p?.status || '').toLowerCase().trim();
        if (p?.uid && (statusLower === 'pending' || statusLower === 'approved')) {
          // Determine team name
          let teamName = p.teamName ||
                        (p.name ? p.name.split(' ')[0] : '') ||
                        (p.email ? p.email.split('@')[0] : 'Unknown Team');
          if (!teamName || teamName.trim() === '') {
            teamName = 'Unknown Team';
          }
          if (!teamMap.has(teamName)) {
            teamMap.set(teamName, []);
          }
          teamMap.get(teamName).push({
            sessionId: session.id,
            mentorName: session.mentorName || 'Unnamed',
            room: session.room || '—',
            participant: p,
          });
        }
      });
    });
    // Convert Map to sorted array (by team name)
    return Array.from(teamMap.entries())
      .map(([teamName, requests]) => ({ teamName, requests }))
      .sort((a, b) => a.teamName.localeCompare(b.teamName));
  }, [sessions]);
  // Delete handler
  const handleDeleteRequest = (sessionId, userId) => {
    if (!removeParticipantFromSession) {
      alert("Delete function not available.");
      return;
    }
    if (window.confirm("Are you sure you want to **permanently delete** this request?\nIt will be removed completely as if it never existed.")) {
      removeParticipantFromSession(sessionId, userId)
        .then(res => {
          if (res.success) {
            alert("Request deleted successfully.");
          } else {
            alert("Failed to delete: " + (res.error || "Unknown error"));
          }
        })
        .catch(err => {
          alert("Delete failed: " + err.message);
        });
    }
  };
  return (
    <div style={{ padding: '0 12px' }}>
      <h2 style={{
        margin: '0 0 28px',
        fontSize: '1.9rem',
        fontWeight: 700,
        color: '#1e293b',
      }}>
        Requests & Approvals
      </h2>
      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '16px',
        marginBottom: '36px',
        flexWrap: 'wrap',
      }}>
        <button
          onClick={() => setRequestsView('mentors')}
          aria-pressed={requestsView === 'mentors'}
          style={{
            padding: '12px 28px',
            fontSize: '1.05rem',
            fontWeight: 600,
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            background: requestsView === 'mentors' ? '#6366f1' : '#f3f4f6',
            color: requestsView === 'mentors' ? 'white' : '#4b5563',
            boxShadow: requestsView === 'mentors' ? '0 4px 14px rgba(99,102,241,0.3)' : 'none',
            transition: 'all 0.18s ease',
          }}
        >
          By Mentor {totalRequests > 0 && <span>({totalRequests})</span>}
        </button>
        <button
          onClick={() => setRequestsView('teams')}
          aria-pressed={requestsView === 'teams'}
          style={{
            padding: '12px 28px',
            fontSize: '1.05rem',
            fontWeight: 600,
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            background: requestsView === 'teams' ? '#6366f1' : '#f3f4f6',
            color: requestsView === 'teams' ? 'white' : '#4b5563',
            boxShadow: requestsView === 'teams' ? '0 4px 14px rgba(99,102,241,0.3)' : 'none',
            transition: 'all 0.18s ease',
          }}
        >
          By Team {getStudentRequests.length > 0 && <span>({getStudentRequests.length})</span>}
        </button>
        <button
          onClick={() => setRequestsView('edit')}
          aria-pressed={requestsView === 'edit'}
          style={{
            padding: '12px 28px',
            fontSize: '1.05rem',
            fontWeight: 600,
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            background: requestsView === 'edit' ? '#6366f1' : '#f3f4f6',
            color: requestsView === 'edit' ? 'white' : '#4b5563',
            boxShadow: requestsView === 'edit' ? '0 4px 14px rgba(99,102,241,0.3)' : 'none',
            transition: 'all 0.18s ease',
          }}
        >
          Edit Requests {editableRequestsByTeam.reduce((sum, t) => sum + t.requests.length, 0) > 0 && (
            <span>({editableRequestsByTeam.reduce((sum, t) => sum + t.requests.length, 0)})</span>
          )}
        </button>
      </div>
      {/* MENTOR VIEW */}
      {requestsView === 'mentors' && (
        <div style={{ display: 'grid', gap: '28px' }}>
          {mentorStats.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '80px 32px',
              background: 'white',
              borderRadius: '16px',
              border: '1px solid #e5e7eb',
              color: '#64748b',
            }}>
              <p>No pending or approved requests yet.</p>
              <small>Check back after teams start applying.</small>
            </div>
          ) : (
            mentorStats.map(stat => {
              const session = sessions.find(s => s.id === stat.id);
              const participants = Array.isArray(session?.participants) ? session.participants : [];
              return (
                <div
                  key={stat.id}
                  style={{
                    background: 'white',
                    borderRadius: '16px',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.05)',
                    border: '1px solid #e5e7eb',
                    overflow: 'hidden',
                  }}
                >
                  <div style={{
                    padding: '16px 24px',
                    background: '#f9fafb',
                    borderBottom: '1px solid #e5e7eb',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '16px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
                      <strong style={{ fontSize: '1.3rem' }}>{stat.mentorName}</strong>
                      <span style={{ color: '#6b7280', fontSize: '1rem' }}>
                        Room {stat.room}
                      </span>
                    </div>
                    <div style={{
                      display: 'flex',
                      gap: '20px',
                      fontSize: '0.95rem',
                      fontWeight: 600,
                    }}>
                      <span style={{ color: '#16a34a' }}>{stat.approved} approved</span>
                      <span style={{ color: stat.pending > 0 ? '#d97706' : '#6b7280' }}>
                        {stat.pending} pending
                      </span>
                      <span style={{ color: '#6b7280' }}>/ {stat.max} max</span>
                    </div>
                  </div>
                  <div style={{ padding: '12px 24px 20px' }}>
                    {participants.length === 0 ? (
                      <p style={{ textAlign: 'center', color: '#9ca3af', padding: '40px 0', fontStyle: 'italic' }}>
                        No participants yet
                      </p>
                    ) : (
                      participants.map((p, idx) => (
                        <ParticipantItem
                          key={`${stat.id}-${p.uid || p.id || idx}`}
                          p={p}
                          sessionId={stat.id}
                          handleStatusChange={handleStatusChange}
                          handleCheckInToggle={handleCheckInToggle}
                          // NEW: reorder props (only in mentors view)
                          showReorderButtons={true}
                          handleMove={handleMoveParticipant}
                          index={idx}
                          totalParticipants={participants.length}
                        />
                      ))
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
      {/* TEAM VIEW */}
      {requestsView === 'teams' && (
        <div style={{ display: 'grid', gap: '28px' }}>
          {(!Array.isArray(getStudentRequests) || getStudentRequests.length === 0) ? (
            <div style={{
              textAlign: 'center',
              padding: '80px 32px',
              background: 'white',
              borderRadius: '16px',
              border: '1px solid #e5e7eb',
              color: '#64748b',
            }}>
              <h3 style={{ margin: '0 0 16px', color: '#1e293b', fontSize: '1.4rem' }}>
                No team requests found
              </h3>
              <p>
                {sessions.some(s => (s.participants || []).length > 0)
                  ? "Participants exist, but team grouping is empty."
                  : "No requests or approvals have been recorded yet."}
              </p>
            </div>
          ) : (
            getStudentRequests.map((team) => {
              const teamName = team.name ||
                              team.displayName ||
                              (team.email ? team.email.split('@')[0] : 'Team') ||
                              team.uid?.slice(0, 10) ||
                              'Unnamed Team';
              const requests = Array.isArray(team.requests) ? team.requests : [];
              return (
                <div
                  key={team.uid}
                  style={{
                    background: 'white',
                    borderRadius: '16px',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.05)',
                    border: '1px solid #e5e7eb',
                    overflow: 'hidden',
                  }}
                >
                  <div style={{
                    padding: '16px 24px',
                    background: '#eff6ff',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '16px',
                  }}>
                    <div>
                      <strong style={{ fontSize: '1.3rem' }}>{teamName}</strong>
                      <span style={{
                        marginLeft: '16px',
                        color: '#2563eb',
                        fontSize: '0.95rem',
                      }}>
                        {team.email || team.uid?.slice(0, 12) || '—'}
                      </span>
                    </div>
                    <span style={{
                      background: '#dbeafe',
                      color: '#1d4ed8',
                      padding: '6px 16px',
                      borderRadius: '999px',
                      fontSize: '0.95rem',
                      fontWeight: 600,
                    }}>
                      {requests.length} request{requests.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div style={{ padding: '12px 24px 20px' }}>
                    {requests.length === 0 ? (
                      <p style={{ textAlign: 'center', color: '#9ca3af', padding: '32px 0' }}>
                        No requests recorded for this team
                      </p>
                    ) : (
                      requests.map((req, idx) => (
                        <ParticipantItem
                          key={`${team.uid}-${req.sessionId || idx}`}
                          p={req.participantData}
                          sessionId={req.sessionId}
                          handleStatusChange={handleStatusChange}
                          handleCheckInToggle={handleCheckInToggle}
                          showMentorName={true}
                        />
                      ))
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
      {/* ── EDIT REQUESTS TAB – Grouped by Team ─────────────────────── */}
      {requestsView === 'edit' && (
        <div style={{ display: 'grid', gap: '32px' }}>
          {editableRequestsByTeam.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '80px 32px',
              background: 'white',
              borderRadius: '16px',
              border: '1px solid #e5e7eb',
              color: '#64748b',
            }}>
              <h3 style={{ margin: '0 0 16px', color: '#1e293b' }}>
                No editable requests found
              </h3>
              <p>Only pending and approved requests are shown here, grouped by team.</p>
              <small style={{ marginTop: '12px', display: 'block' }}>
                Debug: {sessions.length} sessions • {editableRequestsByTeam.length} teams with requests
              </small>
            </div>
          ) : (
            editableRequestsByTeam.map(({ teamName, requests }) => (
              <div
                key={teamName}
                style={{
                  background: 'white',
                  borderRadius: '16px',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.05)',
                  overflow: 'hidden',
                }}
              >
                {/* Team Header */}
                <div style={{
                  padding: '16px 24px',
                  background: '#eff6ff',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: '1px solid #bfdbfe',
                }}>
                  <strong style={{ fontSize: '1.4rem', color: '#1d4ed8' }}>
                    {teamName}
                  </strong>
                  <span style={{
                    background: '#dbeafe',
                    color: '#1d4ed8',
                    padding: '6px 16px',
                    borderRadius: '999px',
                    fontSize: '0.95rem',
                    fontWeight: 600,
                  }}>
                    {requests.length} request{requests.length !== 1 ? 's' : ''}
                  </span>
                </div>
                {/* Requests list */}
                <div style={{ padding: '16px 24px' }}>
                  {requests.map((req, idx) => (
                    <div
                      key={`${req.sessionId}-${req.participant.uid || idx}`}
                      style={{
                        marginBottom: '20px',
                        padding: '16px',
                        background: '#f9fafb',
                        borderRadius: '12px',
                        border: '1px solid #e5e7eb',
                      }}
                    >
                      <div style={{ marginBottom: '12px' }}>
                        <strong style={{ fontSize: '1.15rem' }}>
                          {req.participant.name || req.participant.email?.split('@')[0] || 'Team Member'}
                        </strong>
                        <div style={{ color: '#64748b', marginTop: '4px' }}>
                          → {req.mentorName} (Room {req.room})
                        </div>
                        <div style={{ color: '#6b7280', fontSize: '0.9rem', marginTop: '6px' }}>
                          Status: <strong>{req.participant.status || 'unknown'}</strong>
                        </div>
                      </div>
                      <ParticipantItem
                        p={req.participant}
                        sessionId={req.sessionId}
                        handleStatusChange={handleStatusChange}
                        handleCheckInToggle={handleCheckInToggle}
                      />
                      <div style={{ marginTop: '16px', textAlign: 'right' }}>
                        <button
                          onClick={() => handleDeleteRequest(req.sessionId, req.participant.uid)}
                          style={{
                            padding: '10px 20px',
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: 600,
                            fontSize: '0.95rem',
                          }}
                        >
                          Delete Request Completely
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}