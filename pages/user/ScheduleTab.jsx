import React from "react";

export default function ScheduleTab({ sessions = [] }) {
  const getVisibleParticipants = (participants = []) =>
    participants.filter(
      (p) => p.status === "approved" || p.status === "completed"
    );

  if (!sessions.length) {
    return (
      <div style={styles.emptyWrapper}>
        <h2>No Active Sessions</h2>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <h2 style={styles.pageTitle}>Session Control Board</h2>

      <div style={styles.cardGrid}>
        {sessions.map((session) => {
          const participants = getVisibleParticipants(session.participants);
          const current = participants.find(
            (p) => p.checkedIn && p.status !== "completed"
          );

          const isBusy = !!current;

          return (
            <div key={session.id} style={styles.card}>
              {/* Mentor Header */}
              <div style={styles.header}>
                <div style={styles.profile}>
                  <img
                    src={
                      session.photoUrl ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        session.mentorName
                      )}&background=16a34a&color=fff`
                    }
                    alt={session.mentorName}
                    style={styles.avatar}
                  />

                  <div>
                    <div style={styles.mentorName}>
                      {session.mentorName}
                    </div>
                    <div style={styles.domain}>
                      Room {session.room || "—"}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    ...styles.statusBadge,
                    background: isBusy
                      ? "rgba(239,68,68,0.2)"
                      : "rgba(34,197,94,0.2)",
                    color: isBusy ? "#ef4444" : "#22c55e",
                  }}
                >
                  {isBusy ? "BUSY" : "IDLE"}
                </div>
              </div>

              {/* Current Team */}
              <div style={styles.currentBox}>
                {current ? (
                  <>
                    <div style={styles.currentLabel}>CURRENT TEAM</div>
                    <div style={styles.currentTeam}>
                      {current.name ||
                        current.email?.split("@")[0] ||
                        "Team"}
                    </div>
                  </>
                ) : (
                  <div style={styles.noTeam}>
                    No Active Team
                  </div>
                )}
              </div>

              {/* Queue Info */}
              <div style={styles.queueSection}>
  <div style={styles.queueTitle}>
    Queue ({participants.length})
  </div>

  {participants.length > 0 && (
    <div style={styles.queueList}>
      {participants
        .filter((p) => !p.checkedIn || p.status === "completed")
        .map((p, index) => (
          <div key={index} style={styles.queueItem}>
            {p.name || p.email?.split("@")[0] || "Team"}
          </div>
        ))}
    </div>
  )}
</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ================== */
/* ===== STYLES ===== */
/* ================== */

const styles = {
  page: {
    width: "100%",
    paddingBottom: "80px",
  },

  pageTitle: {
    fontSize: "2rem",
    fontWeight: 700,
    marginBottom: "32px",
    background: "linear-gradient(90deg,#22c55e,#16a34a)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },

  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill,minmax(380px,1fr))",
    gap: "32px",
  },

 card: {
  background: "linear-gradient(145deg, #0f172a, #1e293b)",
  borderRadius: "24px",
  padding: "28px",
  border: "1px solid rgba(34,197,94,0.25)",
  boxShadow: "0 25px 60px rgba(0,0,0,0.5)",
  transition: "all 0.3s ease",
},

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
  },

  profile: {
    display: "flex",
    gap: "14px",
    alignItems: "center",
  },

  avatar: {
    width: "54px",
    height: "54px",
    borderRadius: "50%",
    border: "3px solid #22c55e",
  },

  mentorName: {
    fontSize: "1.1rem",
    fontWeight: 600,
    color: "#f8fafc",
  },

  domain: {
    fontSize: "0.85rem",
    color: "#94a3b8",
  },

  statusBadge: {
    padding: "6px 14px",
    borderRadius: "999px",
    fontWeight: 600,
    fontSize: "0.85rem",
  },

 currentBox: {
  background: "rgba(255,255,255,0.05)",
  padding: "24px",
  borderRadius: "16px",
  marginBottom: "20px",
  border: "1px solid rgba(255,255,255,0.05)",
},

  currentLabel: {
    fontSize: "0.8rem",
    color: "#94a3b8",
    marginBottom: "8px",
  },

  currentTeam: {
    fontSize: "1.4rem",
    fontWeight: 700,
    color: "#22c55e",
  },

  noTeam: {
    textAlign: "center",
    color: "#64748b",
    fontSize: "1rem",
  },

  queueSection: {
    fontSize: "0.9rem",
    color: "#94a3b8",
  },

  emptyWrapper: {
    padding: "120px 20px",
    textAlign: "center",
    color: "#94a3b8",
  },

  queueTitle: {
  fontSize: "0.85rem",
  color: "#94a3b8",
  marginBottom: "10px",
},

queueList: {
  display: "flex",
  flexDirection: "column",
  gap: "8px",
},

queueItem: {
  padding: "10px 14px",
  borderRadius: "10px",
  background: "rgba(34,197,94,0.12)",
  color: "#22c55e",
  fontWeight: 600,
},
};