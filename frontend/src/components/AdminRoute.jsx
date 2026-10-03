import { Navigate } from "react-router-dom";

// Must match the UID in Admin.jsx
const ADMIN_UID = "935b6c78-7da2-4111-bdd5-f4d4a4826699";

export default function AdminRoute({ session, children }) {
  // Still loading the session itself, so don't decide anything yet
  if (session === undefined) return null;

  // No session: send to login
  if (!session) return <Navigate to="/login" replace />;

  // Logged in but not the admin user: back to the dashboard
  if (session.user.id !== ADMIN_UID) return <Navigate to="/dashboard" replace />;

  return children;
}
