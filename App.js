import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// ── Pages ────────────────────────────────────────────────
import Login from './pages/Login';
import Register from './pages/Register';

// Admin (assuming you have or will have admin subfolder)
import AdminDashboard from './pages/admin/AdminPage'; // or AdminDashboard, etc.

// User – now imported from the subfolder
import UserDashboard from './pages/user';           // ← using index.jsx barrel file

// ── Protected Route Component ────────────────────────────
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  // ── TODO: Replace with your real authentication logic ──
  // Examples:
  //   • Firebase:   const { currentUser, isAdmin } = useAuth();
  //   • Context:    const { user, isAuthenticated, isAdmin } = useAuthContext();
  //   • Zustand/Jotai/Redux: selectors

  const isAuthenticated = true;     // ← placeholder – replace!
  const isAdmin = true;             // ← placeholder – replace!

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin) {
    // You can also redirect to a "not authorized" page instead
    return <Navigate to="/user" replace />;
  }

  return children;
};

// ── Optional: Simple Layout wrapper (if you want nav/header later) ──
const AppLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* You can add <Navbar />, <Sidebar />, Toaster, etc. here later */}
      {children}
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppLayout>
        <Routes>

          {/* ── Public routes ── */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Root → redirect depending on auth state (common pattern) */}
          <Route
            path="/"
            element={
              // You can make this smarter later (check auth → /user or /admin)
              <Navigate to="/login" replace />
            }
          />

          {/* ── Protected user routes ── */}
          <Route
            path="/user"
            element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            }
          />

          {/* Optional: alias /user-page → /user (cleaner URL) */}
          <Route
            path="/user-page"
            element={<Navigate to="/user" replace />}
          />

          {/* ── Protected admin routes ── */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Optional: alias old /admin-page → /admin */}
          <Route
            path="/admin-page"
            element={<Navigate to="/admin" replace />}
          />

          {/* ── 404 – Not Found ── */}
          <Route
            path="*"
            element={
              <div
                style={{
                  height: '100vh',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  background: 'linear-gradient(to bottom, #f8fafc, #e2e8f0)',
                  color: '#1e293b',
                  textAlign: 'center',
                  padding: '2rem',
                }}
              >
                <h1 style={{ fontSize: '6rem', fontWeight: 'bold', margin: 0 }}>404</h1>
                <h2 style={{ fontSize: '1.8rem', margin: '1rem 0 1.5rem' }}>
                  Page Not Found
                </h2>
                <p style={{ fontSize: '1.1rem', color: '#64748b', maxWidth: '420px', marginBottom: '2rem' }}>
                  The page you are looking for might have been removed, had its name changed,
                  or is temporarily unavailable.
                </p>
                <a
                  href="/login"
                  style={{
                    padding: '12px 32px',
                    background: '#6366f1',
                    color: 'white',
                    borderRadius: '12px',
                    textDecoration: 'none',
                    fontWeight: 600,
                    fontSize: '1.05rem',
                    transition: 'background 0.2s',
                  }}
                  onMouseOver={e => e.currentTarget.style.background = '#4f46e5'}
                  onMouseOut={e => e.currentTarget.style.background = '#6366f1'}
                >
                  Back to Login
                </a>
              </div>
            }
          />

        </Routes>
      </AppLayout>
    </Router>
  );
}

export default App;