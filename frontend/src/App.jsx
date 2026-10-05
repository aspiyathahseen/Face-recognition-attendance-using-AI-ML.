import React, { useState } from "react";
import { Link, Navigate, Route, Routes, useLocation } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import LiveAttendancePage from "./pages/LiveAttendancePage";
import AbsenceListPage from "./pages/AbsenceListPage";
import DashboardPage from "./pages/DashboardPage";

function Layout({ children, isAuthenticated, onLogout }) {
  const location = useLocation();

  if (!isAuthenticated && location.pathname !== "/login") {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-blue-600 text-white flex items-center justify-center text-lg font-bold">
              🎭
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-900">
                Face Attendance
              </div>
              <div className="text-xs text-slate-500">
                Real-time biometric attendance
              </div>
            </div>
          </div>
          {isAuthenticated && (
            <nav className="flex items-center gap-4 text-sm">
              <Link
                to="/dashboard"
                className="text-slate-700 hover:text-blue-600"
              >
                Dashboard
              </Link>
              <Link
                to="/register"
                className="text-slate-700 hover:text-blue-600"
              >
                Register Student
              </Link>
              <Link to="/live" className="text-slate-700 hover:text-blue-600">
                Live Attendance
              </Link>
              <Link
                to="/absence"
                className="text-slate-700 hover:text-blue-600"
              >
                Absence List
              </Link>
              <button
                onClick={onLogout}
                className="text-xs font-medium text-slate-500 hover:text-red-500 border border-slate-200 rounded-full px-3 py-1"
              >
                Logout
              </button>
            </nav>
          )}
        </div>
      </header>
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-6">{children}</div>
      </main>
    </div>
  );
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <Routes>
      <Route
        path="/login"
        element={
          <Layout
            isAuthenticated={isAuthenticated}
            onLogout={() => setIsAuthenticated(false)}
          >
            <LoginPage onLoginSuccess={() => setIsAuthenticated(true)} />
          </Layout>
        }
      />
      <Route
        path="/dashboard"
        element={
          <Layout
            isAuthenticated={isAuthenticated}
            onLogout={() => setIsAuthenticated(false)}
          >
            <DashboardPage />
          </Layout>
        }
      />
      <Route
        path="/register"
        element={
          <Layout
            isAuthenticated={isAuthenticated}
            onLogout={() => setIsAuthenticated(false)}
          >
            <RegisterPage />
          </Layout>
        }
      />
      <Route
        path="/live"
        element={
          <Layout
            isAuthenticated={isAuthenticated}
            onLogout={() => setIsAuthenticated(false)}
          >
            <LiveAttendancePage />
          </Layout>
        }
      />
      <Route
        path="/absence"
        element={
          <Layout
            isAuthenticated={isAuthenticated}
            onLogout={() => setIsAuthenticated(false)}
          >
            <AbsenceListPage />
          </Layout>
        }
      />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
