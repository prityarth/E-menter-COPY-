import React, { useState, useEffect, useMemo } from "react";
import { auth, db } from "../../firebase/firebaseConfig";
import { subscribeToSessions, requestSession } from "../../firebase/db";
import { doc, getDoc } from "firebase/firestore";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";

import UserTabsNav from "./UserTabsNav";
import RegisterTab from "./RegisterTab";
import LiveTab from "./LiveTab";
import ScheduleTab from "./ScheduleTab";

import WelcomePopup from "./components/WelcomePopup";
import RequestPopup from "./components/RequestPopup";
import SuccessPopup from "./components/SuccessPopup";

const UserPageMain = () => {
  const navigate = useNavigate();

  // ───────── AUTH STATE ─────────
  const [authInitialized, setAuthInitialized] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // ───────── APP STATE ─────────
  const [activeTab, setActiveTab] = useState("register");
  const [sessions, setSessions] = useState([]);
  const [filterMentor, setFilterMentor] = useState("");
  const [teamName, setTeamName] = useState("User");

  const [showWelcome, setShowWelcome] = useState(false);
  const [showRequestPopup, setShowRequestPopup] = useState(false);
  const [pendingSessionId, setPendingSessionId] = useState(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const [loadingSessions, setLoadingSessions] = useState(true);
  const [error, setError] = useState(null);

  const [darkMode, setDarkMode] = useState(false);

  // ───────── AUTH LISTENER ─────────
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthInitialized(true);
    });
    return () => unsubscribe();
  }, []);

  // ───────── FETCH USER ─────────
  useEffect(() => {
    if (!authInitialized || !currentUser) return;

    const fetchUserData = async () => {
      try {
        const snap = await getDoc(doc(db, "users", currentUser.uid));
        if (snap.exists()) {
          const data = snap.data();
          setTeamName(
            data.teamName ||
              data.name ||
              currentUser.displayName ||
              "User"
          );
        }
      } catch {
        setError("Failed to load your profile");
      }
    };

    fetchUserData();

    if (!localStorage.getItem("hasSeenWelcome")) {
      setShowWelcome(true);
      localStorage.setItem("hasSeenWelcome", "true");
    }
  }, [authInitialized, currentUser]);

  // ───────── SESSIONS ─────────
  useEffect(() => {
    if (!authInitialized) return;

    const unsubscribe = subscribeToSessions(
      (data) => {
        setSessions(data || []);
        setLoadingSessions(false);
      },
      () => {
        setError("Failed to load mentorship sessions");
        setLoadingSessions(false);
      }
    );

    return () => unsubscribe();
  }, [authInitialized]);

  // ───────── ACTIONS ─────────
  const openRequestPopup = (id) => {
    if (!currentUser) return;
    setPendingSessionId(id);
    setShowRequestPopup(true);
  };

  const handleConfirmRequest = async () => {
    if (!pendingSessionId) return;
    setShowRequestPopup(false);

    try {
      const res = await requestSession(pendingSessionId, currentUser);
      if (res.success) setShowSuccessPopup(true);
    } catch (err) {
      alert(err.message);
    }

    setPendingSessionId(null);
  };

  const filteredSessions = useMemo(() => {
    if (!filterMentor.trim()) return sessions;
    return sessions.filter((s) =>
      s.mentorName?.toLowerCase().includes(filterMentor.toLowerCase())
    );
  }, [sessions, filterMentor]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  // ───────── LOADING ─────────
  if (!authInitialized || loadingSessions) {
    return (
      <div style={styles.centerScreen}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div style={styles.centerScreen}>
        <p>Please login to continue</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.centerScreen}>
        <p>{error}</p>
      </div>
    );
  }

  // ───────── MAIN LAYOUT ─────────
  return (
    <div
      style={{
        ...styles.pageWrapper,
       color: darkMode ? "#f8fafc" : "#1e293b",
background: darkMode
  ? styles.pageWrapper.background
  : "#f8fafc",
      }}
    >
      {showWelcome && (
        <WelcomePopup teamName={teamName} onClose={() => setShowWelcome(false)} />
      )}
      {showRequestPopup && (
        <RequestPopup
          onCancel={() => setShowRequestPopup(false)}
          onConfirm={handleConfirmRequest}
        />
      )}
      {showSuccessPopup && (
        <SuccessPopup onClose={() => setShowSuccessPopup(false)} />
      )}

      {/* ───────── TOP NAV ───────── */}
      <div
        style={{
          ...styles.topNav,
          background: darkMode ? "#1e293b" : "#ffffff",
          borderBottom: darkMode
            ? "1px solid #334155"
            : "1px solid #e5e7eb",
        }}
      >
        <div style={styles.navContent}>
          <div style={{ fontWeight: 700 }}>
            Welcome, {teamName}
          </div>

          <div style={styles.navActions}>
            <button
              onClick={() => setDarkMode(!darkMode)}
              style={styles.toggleBtn}
            >
              {darkMode ? "Light Mode" : "Dark Mode"}
            </button>

            <button onClick={handleLogout} style={styles.logoutBtn}>
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* ───────── CONTENT ───────── */}
      <div style={styles.contentWrapper}>
        <UserTabsNav
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          filterMentor={filterMentor}
          setFilterMentor={setFilterMentor}
        />

        <div style={{ marginTop: "40px" }}>
          {activeTab === "register" && (
         <RegisterTab
            sessions={filteredSessions}
            currentUser={currentUser}
             openRequestPopup={openRequestPopup}
             darkMode={darkMode}
        />  
          )}

          {activeTab === "live" && (
            <LiveTab sessions={sessions} currentUser={currentUser} />
          )}

          {activeTab === "routine" && (
            <ScheduleTab sessions={sessions} />
          )}
        </div>
      </div>
    </div>
  );
};

export default UserPageMain;

/* ───────── STYLES ───────── */

const styles = {
  pageWrapper: {
    width: "100%",
    minHeight: "100vh",
    transition: "all 0.3s ease",
    background: `
      radial-gradient(circle at 15% 20%, rgba(34,197,94,0.25), transparent 40%),
      radial-gradient(circle at 85% 80%, rgba(16,185,129,0.2), transparent 40%),
      #020617
    `,
    fontFamily: "'Inter', sans-serif",
  },

  topNav: {
    position: "sticky",
    top: 0,
    width: "100%",
    zIndex: 100,
    backdropFilter: "blur(18px)",
    background: "rgba(15,23,42,0.65)",
    borderBottom: "1px solid rgba(34,197,94,0.2)",
    boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
  },

  navContent: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "18px 28px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  navActions: {
    display: "flex",
    gap: "14px",
  },

  toggleBtn: {
    padding: "8px 16px",
    borderRadius: "12px",
    border: "1px solid rgba(34,197,94,0.4)",
    background: "rgba(34,197,94,0.08)",
    color: "#22c55e",
    cursor: "pointer",
    fontWeight: 600,
    transition: "all 0.25s ease",
  },

  logoutBtn: {
    padding: "8px 18px",
    borderRadius: "12px",
    border: "none",
    background: "linear-gradient(135deg, #22c55e, #16a34a)",
    color: "#0f172a",
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.25s ease",
    boxShadow: "0 8px 20px rgba(34,197,94,0.4)",
  },

  contentWrapper: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "60px 28px",
    paddingBottom: "140px",
  },

  centerScreen: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#22c55e",
    fontSize: "1.2rem",
  },
};