import React from "react";

export default function LiveTab({ sessions }) {
  const getVisibleParticipants = (participants = []) =>
    (participants || []).filter(
      (p) => p.status === "approved" || p.status === "completed"
    );

  return (
    <div style={styles.wrapper}>
      <div style={styles.headerRow}>
        <div>
          <h1 style={styles.title}>MENTORSHIP LIVE QUEUE</h1>
          <div style={styles.subtitle}>Active Sessions</div>
        </div>

        <div style={styles.liveBadge}>
          ● LIVE
        </div>
      </div>

      {sessions.length === 0 ? (
        <div style={styles.emptyCard}>
          No active sessions right now
        </div>
      ) : (
        <div style={styles.grid}>
          {sessions.map((session) => {
            const visibleParticipants = getVisibleParticipants(
              session.participants
            );

            const currentMentee = visibleParticipants.find(
              (p) => p.checkedIn && p.status !== "completed"
            );

            const isBusy = !!currentMentee;

            return (
              <div
                key={session.id}
                style={{
                  ...styles.card,
                  border: isBusy
                    ? "1px solid rgba(239,68,68,0.6)"
                    : "1px solid rgba(16,185,129,0.6)",
                }}
              >
                {/* TOP ROW */}
                <div style={styles.cardHeader}>
                  <div style={styles.mentorInfo}>
                    <img
                      src={
                        session.photoUrl ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          session.mentorName
                        )}&background=065f46&color=fff`
                      }
                      alt={session.mentorName}
                      style={styles.avatar}
                    />

                    <div>
                      <div style={styles.mentorName}>
                        {session.mentorName}
                      </div>
                      <div style={styles.room}>
                        Room {session.room}
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      ...styles.statusBadge,
                      background: isBusy
                        ? "rgba(239,68,68,0.15)"
                        : "rgba(16,185,129,0.15)",
                      color: isBusy ? "#ef4444" : "#10b981",
                    }}
                  >
                    {isBusy ? "IN SESSION" : "AVAILABLE"}
                  </div>
                </div>

                {/* PARTICIPANTS */}
                <div style={styles.participantBox}>
                  {visibleParticipants.length === 0 ? (
                    <div style={styles.noParticipants}>
                      No approved participants yet
                    </div>
                  ) : (
                    visibleParticipants.map((p, idx) => {
                      const isCurrent =
                        p.checkedIn && p.status !== "completed";
                      const isDone = p.status === "completed";

                      const displayName =
                        p.name ||
                        p.displayName ||
                        (p.email ? p.email.split("@")[0] : null) ||
                        "Participant";

                      return (
                        <div
                          key={idx}
                          style={{
                            ...styles.participantRow,
                            background: isCurrent
                              ? "rgba(16,185,129,0.1)"
                              : "transparent",
                            opacity: isDone ? 0.5 : 1,
                          }}
                        >
                          <div>
                            <span style={styles.index}>
                              #{idx + 1}
                            </span>{" "}
                            {displayName}
                          </div>

                          {isCurrent && (
                            <span style={styles.currentTag}>
                              Current
                            </span>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ───────── STYLES ───────── */

const styles = {
  wrapper: {
    paddingTop: "10px",
  },

  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "40px",
  },

  title: {
    fontSize: "2rem",
    fontWeight: 800,
    letterSpacing: "2px",
    color: "#10b981",
  },

  subtitle: {
    color: "#94a3b8",
    marginTop: "6px",
    fontSize: "0.95rem",
    letterSpacing: "1px",
  },

  liveBadge: {
    background: "#16a34a",
    padding: "10px 22px",
    borderRadius: "999px",
    fontWeight: 700,
    color: "white",
    boxShadow: "0 0 20px rgba(22,163,74,0.6)",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))",
    gap: "30px",
  },

  card: {
    padding: "28px",
    borderRadius: "22px",
    backdropFilter: "blur(18px)",
    background: "rgba(255,255,255,0.06)",
    boxShadow: "0 10px 40px rgba(0,0,0,0.4)",
    transition: "all 0.3s ease",
  },

  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
  },

  mentorInfo: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },

  avatar: {
    width: "70px",
    height: "70px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "3px solid #10b981",
  },

  mentorName: {
    fontSize: "1.4rem",
    fontWeight: 700,
    color: "white",
  },

  room: {
    fontSize: "0.9rem",
    color: "#94a3b8",
  },

  statusBadge: {
    padding: "8px 18px",
    borderRadius: "999px",
    fontWeight: 700,
    fontSize: "0.85rem",
  },

  participantBox: {
    borderTop: "1px solid rgba(255,255,255,0.08)",
    paddingTop: "16px",
  },

  participantRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "10px 0",
    borderRadius: "10px",
    transition: "all 0.2s ease",
  },

  index: {
    color: "#10b981",
    fontWeight: 700,
    marginRight: "8px",
  },

  currentTag: {
    background: "#10b981",
    padding: "4px 12px",
    borderRadius: "999px",
    fontSize: "0.75rem",
    fontWeight: 700,
    color: "white",
  },

  noParticipants: {
    color: "#64748b",
    padding: "10px 0",
  },

  emptyCard: {
    padding: "80px",
    borderRadius: "22px",
    backdropFilter: "blur(18px)",
    background: "rgba(255,255,255,0.06)",
    textAlign: "center",
    color: "#94a3b8",
  },
};