import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { supabase } from "./supabaseClient";
import { BotsProvider } from "./context/BotsContext";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Markets from "./pages/Markets";
import Spot from "./pages/Spot";
import Bots from "./pages/Bots";
import Deposit from "./pages/Deposit";
import Withdraw from "./pages/Withdraw";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import Verify from "./pages/Verify";
import Settings from "./pages/Settings";
import Admin from "./pages/Admin";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import Sidebar from "./components/Sidebar";
import ChatWidget from "./components/ChatWidget";

function AppLayout({ children }) {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-content">{children}</div>
      <ChatWidget />
    </div>
  );
}

// Wraps a page in the auth guard + app shell
function Protected({ session, children }) {
  return (
    <ProtectedRoute session={session}>
      <AppLayout>{children}</AppLayout>
    </ProtectedRoute>
  );
}

export default function App() {
  const [session, setSession] = useState(undefined);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      },
    );
    return () => listener.subscription.unsubscribe();
  }, []);

  return (
    <BotsProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Protected session={session}><Dashboard /></Protected>} />
        <Route path="/markets" element={<Protected session={session}><Markets /></Protected>} />
        <Route path="/spot" element={<Protected session={session}><Spot /></Protected>} />
        <Route path="/bots" element={<Protected session={session}><Bots /></Protected>} />
        <Route path="/deposit" element={<Protected session={session}><Deposit /></Protected>} />
        <Route path="/withdraw" element={<Protected session={session}><Withdraw /></Protected>} />
        <Route path="/notifications" element={<Protected session={session}><Notifications /></Protected>} />
        <Route path="/profile" element={<Protected session={session}><Profile /></Protected>} />
        <Route path="/verify" element={<Protected session={session}><Verify /></Protected>} />
        <Route path="/settings" element={<Protected session={session}><Settings /></Protected>} />
        <Route
          path="/admin"
          element={
            <AdminRoute session={session}>
              <Admin />
            </AdminRoute>
          }
        />
      </Routes>
    </BotsProvider>
  );
}
