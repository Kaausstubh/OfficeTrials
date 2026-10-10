import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MainLayout } from './components/layout/MainLayout';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { CasesPage } from './pages/CasesPage';
import { CaseDetailPage } from './pages/CaseDetailPage';
import { CalendarPage } from './pages/CalendarPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { EFilingPage } from './pages/EFilingPage';
import { EvidencePage } from './pages/EvidencePage';
import { TasksPage } from './pages/TasksPage';
import { ClientPortalPage } from './pages/ClientPortalPage';
import { MessagesPage } from './pages/MessagesPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-900 text-amber-400 font-serif text-lg">
        Advocate Case Desk...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const RoleRootRedirect: React.FC = () => {
  const { user } = useAuth();
  if (user?.role === 'CLIENT') {
    return <Navigate to="/client-portal" replace />;
  }
  return <Navigate to="/dashboard" replace />;
};

export const App: React.FC = () => {
  return (
    <ErrorBoundary fallbackTitle="Advocate Practice Desk System">
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<RoleRootRedirect />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="cases" element={<CasesPage />} />
              <Route path="cases/:caseId" element={<CaseDetailPage />} />
              <Route path="calendar" element={<CalendarPage />} />
              <Route path="documents" element={<DocumentsPage />} />
              <Route path="efiling" element={<EFilingPage />} />
              <Route path="evidence" element={<EvidencePage />} />
              <Route path="tasks" element={<TasksPage />} />
              <Route path="clients" element={<ReportsPage />} />
              <Route path="client-portal" element={<ClientPortalPage />} />
              <Route path="messages" element={<MessagesPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
