// src/pages/admin/AdminPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { auth, db } from '../../firebase/firebaseConfig';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import {
  createSession,
  subscribeToSessions,
  toggleCheckIn,
  getAllUsers,
  deleteSession,
  updateParticipantStatus,
  updateSessionData,
  removeParticipantFromSession,
  moveParticipant, // ← imported the new reorder function
} from '../../firebase/db';
import SessionManagement from './SessionManagement';
import RequestsAndApprovals from './RequestsAndApprovals';

const AdminPage = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('schedule');
  const [requestsView, setRequestsView] = useState('mentors');

  const [sessions, setSessions] = useState([]);
  const [users, setUsers] = useState([]);

  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);

  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [confirmPopup, setConfirmPopup] = useState({
    show: false,
    title: '',
    message: '',
    onConfirm: null,
  });

  // Real-time sessions subscription
  useEffect(() => {
    console.log("[AdminPage] Starting real-time sessions subscription...");

    const unsubscribe = subscribeToSessions((data) => {
      console.log("[AdminPage] Sessions received:", {
        count: data?.length ?? 0,
        sample: data?.slice(0, 2)?.map(s => s.mentorName || s.id) ?? "no data",
      });

      setSessions(data || []);
      setLoadingSessions(false);
    });

    return () => unsubscribe();
  }, []);

  // Load users once
  useEffect(() => {
    const loadUsers = async () => {
      setLoadingUsers(true);
      try {
        const userList = await getAllUsers();
        setUsers(userList || []);
      } catch (err) {
        console.error("[AdminPage] Failed to load users:", err);
        showToast("Failed to load users list", "error");
      } finally {
        setLoadingUsers(false);
      }
    };
    loadUsers();
  }, []);

  // Helpers
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3200);
  };

  const showConfirm = (title, message, onConfirm) => {
    setConfirmPopup({ show: true, title, message, onConfirm });
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
      showToast("Logged out successfully", "success");
    } catch (err) {
      showToast("Logout failed", "error");
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 500000) {
      showToast("Image too large (max 500KB)", "error");
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      setFormData((prev) => ({ ...prev, photoUrl: reader.result }));
      showToast("Image uploaded successfully", "success");
    };
  };

  // CREATE / UPDATE SESSION
  const [editMode, setEditMode] = useState(false);
  const [currentEditId, setCurrentEditId] = useState(null);
  const [formData, setFormData] = useState({
    mentorName: '',
    companyName: '',
    room: '',
    photoUrl: '',
    linkedinUrl: '',
    websiteUrl: '',
    focus: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadingSessions(true);

    const payload = { ...formData };

    try {
      if (editMode) {
        const sessionToEdit = sessions.find((s) => s.id === currentEditId);
        if (!sessionToEdit) throw new Error("Session not found");

        const finalPayload = {
          ...sessionToEdit,
          ...payload,
          participants: sessionToEdit.participants || [],
          status: sessionToEdit.status || 'FREE',
        };

        await updateSessionData(currentEditId, finalPayload);
        showToast("Mentor slot updated successfully!", "success");
        setEditMode(false);
        setCurrentEditId(null);
      } else {
        const res = await createSession(payload);
        if (res.success) {
          showToast("New mentorship slot created!", "success");
          setActiveTab('requests');
        } else {
          throw new Error(res.error || "Unknown error");
        }
      }
    } catch (err) {
      console.error("Session operation failed:", err);
      showToast("Operation failed: " + (err.message || "Unknown error"), "error");
    } finally {
      setLoadingSessions(false);
      setFormData({
        mentorName: '',
        companyName: '',
        room: '',
        photoUrl: '',
        linkedinUrl: '',
        websiteUrl: '',
        focus: '',
      });
    }
  };

  const prepareEdit = (session) => {
    setEditMode(true);
    setCurrentEditId(session.id);

    setFormData({
      mentorName: session.mentorName || '',
      companyName: session.companyName || '',
      room: session.room || '',
      photoUrl: session.photoUrl || '',
      linkedinUrl: session.linkedinUrl || '',
      websiteUrl: session.websiteUrl || '',
      focus: session.focus || '',
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast(`Editing: ${session.mentorName || 'Unnamed Mentor'}`, "info");
  };

  const handleDeleteSlot = (sessionId) => {
    showConfirm(
      "Delete Slot",
      "Are you sure you want to delete this mentorship slot? This cannot be undone.",
      async () => {
        try {
          await deleteSession(sessionId);
          showToast("Slot deleted successfully", "success");
        } catch (err) {
          showToast("Delete failed: " + err.message, "error");
        }
      }
    );
  };

  const handleStatusChange = (sessionId, userId, newStatus) => {
    const statusText = newStatus.charAt(0).toUpperCase() + newStatus.slice(1);
    showConfirm(
      `${statusText} Confirmation`,
      `Are you sure you want to change status to "${statusText}"?`,
      async () => {
        try {
          await updateParticipantStatus(sessionId, userId, newStatus);
          showToast(`Status updated to ${statusText}`, "success");
        } catch (err) {
          showToast("Status update failed", "error");
        }
      }
    );
  };

  const handleCheckInToggle = (sessionId, userId, isCheckedIn) => {
    const action = isCheckedIn ? 'Check Out' : 'Check In';
    showConfirm(
      `${action} Confirmation`,
      `Are you sure you want to ${action.toLowerCase()} this participant?`,
      async () => {
        try {
          await toggleCheckIn(sessionId, userId);
          showToast(isCheckedIn ? "Checked out" : "Checked in", "success");
        } catch (err) {
          showToast("Check-in/out failed", "error");
        }
      }
    );
  };

  // NEW: Handle participant reorder (up/down)
  const handleMoveParticipant = (sessionId, userId, direction) => {
    const dirText = direction.charAt(0).toUpperCase() + direction.slice(1);
    showConfirm(
      `Move ${dirText} Confirmation`,
      `Are you sure you want to move this participant ${direction}?`,
      async () => {
        try {
          const res = await moveParticipant(sessionId, userId, direction);
          if (res.success) {
            showToast(`Participant moved ${direction}`, "success");
          } else {
            showToast(`Move failed: ${res.error || "Unknown error"}`, "error");
          }
        } catch (err) {
          showToast("Move failed", "error");
        }
      }
    );
  };

  // Group participants by team (for requests tab)
  const getStudentRequests = useMemo(() => {
    if (!sessions?.length) return [];

    const teamMap = new Map();

    sessions.forEach((session) => {
      const mentorName = session.mentorName || 'Unknown Mentor';
      const room = session.room || '—';

      (session.participants || []).forEach((participant) => {
        const uid = participant?.uid;
        if (!uid) return;

        if (!teamMap.has(uid)) {
          teamMap.set(uid, {
            uid,
            name: participant.name || participant.displayName || '',
            email: participant.email || '',
            requests: [],
          });
        }

        const team = teamMap.get(uid);
        team.requests.push({
          sessionId: session.id,
          mentorName,
          room,
          participantData: { ...participant },
        });
      });
    });

    return Array.from(teamMap.values())
      .filter((t) => t.requests.length > 0)
      .sort((a, b) => b.requests.length - a.requests.length);
  }, [sessions]);

  // ─────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        padding: '24px',
        maxWidth: '1400px',
        margin: '0 auto',
        background: '#f8fafc',
        minHeight: '100vh',
      }}
    >
      {/* Toast */}
      {toast.show && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '16px 24px',
            background: toast.type === 'success' ? '#10b981' : '#ef4444',
            color: 'white',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 1000,
            minWidth: '280px',
          }}
        >
          {toast.message}
        </div>
      )}

      {/* Confirmation Popup */}
      {confirmPopup.show && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
          }}
        >
          <div
            style={{
              background: 'white',
              padding: '32px',
              borderRadius: '16px',
              maxWidth: '420px',
              width: '90%',
              textAlign: 'center',
              boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
            }}
          >
            <h3 style={{ margin: '0 0 16px', fontSize: '1.4rem' }}>{confirmPopup.title}</h3>
            <p style={{ margin: '0 0 24px', color: '#475569' }}>{confirmPopup.message}</p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
              <button
                onClick={() => setConfirmPopup({ show: false })}
                style={{
                  padding: '12px 28px',
                  background: '#e5e7eb',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  confirmPopup.onConfirm?.();
                  setConfirmPopup({ show: false });
                }}
                style={{
                  padding: '12px 28px',
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '32px',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <h1 style={{ margin: 0, fontSize: '2.3rem', color: '#1e293b' }}>Admin Dashboard</h1>
        <button
          onClick={handleLogout}
          style={{
            padding: '10px 28px',
            background: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '1.05rem',
          }}
        >
          Logout
        </button>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '32px',
          background: 'white',
          padding: '10px',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
          flexWrap: 'wrap',
        }}
      >
        {['schedule', 'requests', 'users'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '12px 24px',
              background: activeTab === tab ? '#6366f1' : 'transparent',
              color: activeTab === tab ? 'white' : '#475569',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '1.05rem',
              transition: 'all 0.15s',
            }}
          >
            {tab === 'schedule' ? 'Manage Schedule' :
             tab === 'requests' ? 'Requests & Approvals' :
             'Users List'}
          </button>
        ))}
      </div>

      {/* Loading or Content */}
      {(loadingSessions || loadingUsers) ? (
        <div
          style={{
            textAlign: 'center',
            padding: '120px 20px',
            color: '#64748b',
            fontSize: '1.2rem',
          }}
        >
          <p>Loading dashboard data...</p>
          <small style={{ marginTop: '12px', display: 'block' }}>
            Sessions: {loadingSessions ? 'loading' : sessions.length} | 
            Users: {loadingUsers ? 'loading' : users.length}
          </small>
        </div>
      ) : (
        <>
          {activeTab === 'schedule' && (
            <SessionManagement
              sessions={sessions}
              formData={formData}
              setFormData={setFormData}
              editMode={editMode}
              setEditMode={setEditMode}
              currentEditId={currentEditId}
              setCurrentEditId={setCurrentEditId}
              loading={loadingSessions}
              handleImageUpload={handleImageUpload}
              handleSubmit={handleSubmit}
              prepareEdit={prepareEdit}
              handleDeleteSlot={handleDeleteSlot}
              showConfirm={showConfirm}
              showToast={showToast}
            />
          )}

          {activeTab === 'requests' && (
            <RequestsAndApprovals
              sessions={sessions}
              requestsView={requestsView}
              setRequestsView={setRequestsView}
              getStudentRequests={getStudentRequests}
              handleStatusChange={handleStatusChange}
              handleCheckInToggle={handleCheckInToggle}
              removeParticipantFromSession={removeParticipantFromSession}
              handleMoveParticipant={handleMoveParticipant} // ← NEW: passed for reorder
            />
          )}

          {activeTab === 'users' && (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
              <h2>Users List Section</h2>
              <p>(Implement your users table / list here)</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminPage;