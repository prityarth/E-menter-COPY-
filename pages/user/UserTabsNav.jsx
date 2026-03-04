import React from "react";

export default function UserTabsNav({
  activeTab,
  setActiveTab,
  filterMentor,
  setFilterMentor,
}) {
  const tabs = [
    { id: "register", label: "Register", icon: "📝" },
    { id: "live", label: "Live", icon: "🔴" },
    { id: "routine", label: "Schedule", icon: "🗓" },
  ];

  return (
    <>
      {/* Search */}
      {activeTab === "register" && (
        <div style={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search mentor name..."
            value={filterMentor}
            onChange={(e) => setFilterMentor(e.target.value)}
            style={styles.searchInput}
          />
        </div>
      )}

      {/* Bottom Navigation */}
      <nav style={styles.bottomNav}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                ...styles.navItem,
                ...(isActive ? styles.activeItem : {}),
              }}
            >
              <span style={styles.icon}>{tab.icon}</span>
              <span style={styles.label}>{tab.label}</span>

              {isActive && <div style={styles.activeIndicator}></div>}
            </button>
          );
        })}
      </nav>
    </>
  );
}

/* ========================= */
/* ========= STYLES ======== */
/* ========================= */

const styles = {
  /* Search */
 searchContainer: {
  width: "100%",
  padding: "28px 0 10px 0",
  display: "flex",
  justifyContent: "center",
},

searchInput: {
  width: "100%",
  maxWidth: "600px",
  padding: "16px 22px",
  fontSize: "1rem",
  borderRadius: "16px",
  border: "1px solid rgba(0,0,0,0.08)",
  outline: "none",
  background: "rgba(255,255,255,0.75)",
  backdropFilter: "blur(12px)",
  boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
  transition: "all 0.2s ease",
},
  /* Bottom Nav */
bottomNav: {
  position: "fixed",
  bottom: 0,
  left: 0,
  width: "100%",
  backdropFilter: "blur(20px)",
  background: "linear-gradient(90deg,#0f172a,#1e293b)",
  borderTop: "1px solid rgba(34,197,94,0.25)",
  boxShadow: "0 -12px 40px rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "space-around",
  alignItems: "center",
  padding: "16px 0",
  zIndex: 1000,
},

navItem: {
  flex: 1,
  background: "transparent",
  border: "none",
  cursor: "pointer",
  padding: "10px 0",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "6px",
  fontSize: "0.9rem",
  fontWeight: 500,
  color: "#cbd5e1",
  transition: "all 0.25s ease",
  position: "relative",
},

  activeItem: {
    color: "#22c55e",
    fontWeight: 600,
  },

  icon: {
    fontSize: "1.5rem",
  },

  label: {
    fontSize: "0.85rem",
  },

  activeIndicator: {
    position: "absolute",
    bottom: "-6px",
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "#22c55e",
    boxShadow: "0 0 10px #22c55e",
  },
};