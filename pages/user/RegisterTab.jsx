import React from "react";

export default function RegisterTab({
  sessions = [],
  currentUser,
  openRequestPopup,
  darkMode,
}) {
  const getUserStatus = (participants = []) => {
    if (!currentUser) return null;
    const me = participants.find((p) => p.uid === currentUser.uid);
    return me ? me.status : null;
  };

  const isSessionFull = (session) =>
    (session.participants?.length || 0) >= (session.maxParticipants || 999);

  if (!sessions.length) {
    return (
      <div style={styles.emptyWrapper(darkMode)}>
        <h3 style={styles.emptyTitle(darkMode)}>
          No mentorship slots available yet
        </h3>
        <p style={styles.emptyText(darkMode)}>
          New sessions will appear here once mentors publish them.
        </p>
      </div>
    );
  }

  return (
    <div style={styles.grid}>
      {sessions.map((session) => {
        const myStatus = getUserStatus(session.participants);
        const isFull = isSessionFull(session);
        const isPending = myStatus === "pending";
        const isApproved = myStatus === "approved";
        const isRejected = myStatus === "rejected";

        const isCheckedIn =
          isApproved &&
          session.participants?.find((p) => p.uid === currentUser?.uid)
            ?.checkedIn;

        return (
          <div key={session.id} style={styles.card(darkMode)}>
            {/* Social Icons */}
            <div style={styles.socialIcons}>
              {session.linkedinUrl && (
                <a
                  href={session.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={styles.iconLink(darkMode)}
                >
                  <i className="fab fa-linkedin-in"></i>
                </a>
              )}
              {session.websiteUrl && (
                <a
                  href={session.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={styles.iconLink(darkMode)}
                >
                  <i className="fas fa-globe"></i>
                </a>
              )}
            </div>

            {/* Top Section */}
            <div style={styles.topSection}>
              <img
                src={
                  session.photoUrl ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    session.mentorName || "Mentor"
                  )}&background=4f46e5&color=fff&size=256`
                }
                alt={session.mentorName}
                style={styles.image(darkMode)}
              />

              <div style={styles.contentBox(darkMode)}>
                <h3 style={styles.name(darkMode)}>
                  {session.mentorName || "Mentor"}
                </h3>

                {session.companyName && (
                  <div style={styles.company(darkMode)}>
                    {session.companyName}
                  </div>
                )}

                {session.focus && (
                  <p style={styles.bio(darkMode)}>
                    {session.focus.length > 140
                      ? session.focus.substring(0, 140) + "..."
                      : session.focus}
                  </p>
                )}
              </div>
            </div>

            {/* Action Area */}
            <div style={styles.actionArea}>
              {!myStatus ? (
                isFull ? (
                  <div style={styles.fullBadge}>Fully Booked</div>
                ) : (
                  <button
                    style={styles.primaryButton(darkMode)}
                    onClick={() => openRequestPopup(session.id)}
                  >
                    Request Slot
                  </button>
                )
              ) : isRejected ? (
                <>
                  <div style={styles.rejectedBadge}>Request Rejected</div>
                  <button
                    style={styles.primaryButton(darkMode)}
                    onClick={() => openRequestPopup(session.id)}
                  >
                    Request Again
                  </button>
                </>
              ) : (
                <div
                  style={isPending ? styles.pendingBadge : styles.approvedBadge}
                >
                  {isPending ? "⏳ Pending Approval" : "✅ Approved"}
                  {isCheckedIn && (
                    <span style={styles.checkIn}>✓ Checked In</span>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ============================= */
/* ========= STYLES ============ */
/* ============================= */

const styles = {
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "32px",
    width: "100%",
  },

  card: (darkMode) => ({
    background: darkMode
      ? "rgba(15,23,42,0.65)"
      : "rgba(255,255,255,0.85)",
    backdropFilter: "blur(18px)",
    borderRadius: "20px",
    padding: "28px",
    border: darkMode
      ? "1px solid rgba(34,197,94,0.25)"
      : "1px solid rgba(0,0,0,0.08)",
    boxShadow: darkMode
      ? "0 12px 40px rgba(0,0,0,0.4)"
      : "0 12px 40px rgba(0,0,0,0.08)",
    position: "relative",
    transition: "all 0.3s ease",
  }),

  socialIcons: {
    position: "absolute",
    top: "18px",
    right: "20px",
    display: "flex",
    gap: "14px",
    fontSize: "1.1rem",
  },

  iconLink: (darkMode) => ({
    color: darkMode ? "#22c55e" : "#16a34a",
    opacity: 0.85,
  }),

  topSection: {
    display: "flex",
    gap: "20px",
    alignItems: "flex-start",
    flexWrap: "wrap",
  },

  image: (darkMode) => ({
    width: "120px",
    height: "120px",
    borderRadius: "16px",
    objectFit: "cover",
    border: `4px solid ${darkMode ? "#22c55e" : "#16a34a"}`,
    boxShadow: darkMode
      ? "0 10px 25px rgba(34,197,94,0.3)"
      : "0 10px 25px rgba(0,0,0,0.1)",
    flexShrink: 0,
  }),

  contentBox: (darkMode) => ({
    flex: 1,
    padding: "18px",
    borderRadius: "16px",
    background: darkMode
      ? "rgba(255,255,255,0.05)"
      : "rgba(0,0,0,0.03)",
    border: darkMode
      ? "1px solid rgba(34,197,94,0.15)"
      : "1px solid rgba(0,0,0,0.05)",
  }),

  name: (darkMode) => ({
    fontSize: "1.3rem",
    fontWeight: 700,
    marginBottom: "6px",
    color: darkMode ? "#f8fafc" : "#111827",
  }),

  company: (darkMode) => ({
    fontSize: "0.95rem",
    fontWeight: 600,
    color: darkMode ? "#22c55e" : "#16a34a",
    marginBottom: "10px",
  }),

  bio: (darkMode) => ({
    fontSize: "0.9rem",
    lineHeight: "1.6",
    color: darkMode ? "#cbd5e1" : "#475569",
  }),

  actionArea: {
    marginTop: "24px",
  },

  primaryButton: (darkMode) => ({
    width: "100%",
    padding: "14px",
    borderRadius: "14px",
    border: "none",
    background: "linear-gradient(135deg, #22c55e, #16a34a)",
    color: darkMode ? "#0f172a" : "#ffffff",
    fontWeight: 700,
    fontSize: "1rem",
    cursor: "pointer",
    boxShadow: "0 10px 25px rgba(34,197,94,0.35)",
  }),

  fullBadge: {
    padding: "14px",
    borderRadius: "14px",
    background: "rgba(239,68,68,0.15)",
    color: "#dc2626",
    textAlign: "center",
    fontWeight: 600,
    border: "1px solid rgba(239,68,68,0.4)",
  },

  rejectedBadge: {
    padding: "14px",
    borderRadius: "14px",
    background: "rgba(239,68,68,0.15)",
    color: "#dc2626",
    textAlign: "center",
    fontWeight: 600,
    marginBottom: "12px",
    border: "1px solid rgba(239,68,68,0.4)",
  },

  pendingBadge: {
    padding: "14px",
    borderRadius: "14px",
    background: "rgba(234,179,8,0.15)",
    color: "#d97706",
    textAlign: "center",
    fontWeight: 600,
    border: "1px solid rgba(234,179,8,0.4)",
  },

  approvedBadge: {
    padding: "14px",
    borderRadius: "14px",
    background: "rgba(34,197,94,0.15)",
    color: "#16a34a",
    textAlign: "center",
    fontWeight: 600,
    border: "1px solid rgba(34,197,94,0.4)",
  },

  checkIn: {
    marginLeft: "8px",
    fontWeight: 700,
  },

  emptyWrapper: (darkMode) => ({
    textAlign: "center",
    padding: "80px 20px",
    background: darkMode
      ? "rgba(15,23,42,0.65)"
      : "rgba(255,255,255,0.85)",
    backdropFilter: "blur(18px)",
    borderRadius: "20px",
    border: darkMode
      ? "1px solid rgba(34,197,94,0.25)"
      : "1px solid rgba(0,0,0,0.08)",
    boxShadow: darkMode
      ? "0 12px 40px rgba(0,0,0,0.4)"
      : "0 12px 40px rgba(0,0,0,0.08)",
  }),

  emptyTitle: (darkMode) => ({
    fontSize: "1.4rem",
    marginBottom: "10px",
    color: darkMode ? "#f8fafc" : "#1e293b",
  }),

  emptyText: (darkMode) => ({
    fontSize: "1rem",
    color: darkMode ? "#94a3b8" : "#64748b",
  }),
};