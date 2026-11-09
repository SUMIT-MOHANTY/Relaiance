/**
 * App.tsx - Main Application Router
 * 
 * Configures React Router v6 with all routes:
 * - Public route: /login
 * - Protected routes with role-based access
 * - Admin panel with nested sub-routes
 */

import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress, Typography, Chip } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import { dertourTheme } from './config/theme';
import { AuthProvider } from './store/authStore';
import ProtectedRoute from './components/common/ProtectedRoute';
import RoleRoute from './components/common/RoleRoute';
import ForbiddenPage from './pages/errors/ForbiddenPage';
import LoginPage from './pages/auth/LoginPage';

// Lazy load components
const AppLayout = lazy(() => import('./components/layout/AppLayout'));

// Admin Panel Components
const AdminPanel = lazy(() => import('./pages/admin/AdminPanel'));
const UserManagementPage = lazy(() => import('./pages/admin/UserManagementPage'));
const DataManagementPage = lazy(() => import('./pages/admin/DataManagementPage'));
const AuditLogPage = lazy(() => import('./pages/admin/AuditLogPage'));
const ConfigurationPage = lazy(() => import('./pages/admin/ConfigurationPage'));

// Placeholder component for Wave 2 screens
const PlaceholderPage: React.FC<{ title: string }> = ({ title }) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      gap: 2,
    }}
  >
    <Typography variant="h4" sx={{ color: '#003087', fontWeight: 600 }}>
      {title}
    </Typography>
    <Chip
      label="Coming in Wave 2"
      color="primary"
      variant="outlined"
      sx={{ fontSize: '0.875rem', py: 0.5 }}
    />
  </Box>
);

// Loading fallback for lazy-loaded components
const PageLoader: React.FC = () => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
    }}
  >
    <CircularProgress size={48} sx={{ color: '#00A8A8' }} />
  </Box>
);

// Dashboard Components (placeholders for Wave 2)
const FinanceDashboard: React.FC = () => (
  <AppLayout>
    <PlaceholderPage title="Finance Dashboard" />
  </AppLayout>
);

const TeamDashboard: React.FC = () => (
  <AppLayout>
    <PlaceholderPage title="Team Dashboard" />
  </AppLayout>
);

const ExecutiveDashboard: React.FC = () => (
  <AppLayout>
    <PlaceholderPage title="Executive Dashboard" />
  </AppLayout>
);

// Feature Page Components (placeholders for Wave 2)
const PortfolioOverview: React.FC = () => (
  <AppLayout>
    <PlaceholderPage title="Portfolio Overview" />
  </AppLayout>
);

const RisksBlockers: React.FC = () => (
  <AppLayout>
    <PlaceholderPage title="Risks & Blockers" />
  </AppLayout>
);

const AgentActions: React.FC = () => (
  <AppLayout>
    <PlaceholderPage title="Agent Actions" />
  </AppLayout>
);

const AuditLog: React.FC = () => (
  <AppLayout>
    <PlaceholderPage title="Audit Log" />
  </AppLayout>
);

const MyInitiatives: React.FC = () => (
  <AppLayout>
    <PlaceholderPage title="My Initiatives" />
  </AppLayout>
);

const Milestones: React.FC = () => (
  <AppLayout>
    <PlaceholderPage title="Milestones" />
  </AppLayout>
);

const RisksDecisions: React.FC = () => (
  <AppLayout>
    <PlaceholderPage title="Risks & Decisions" />
  </AppLayout>
);

const EvidenceUpload: React.FC = () => (
  <AppLayout>
    <PlaceholderPage title="Evidence Upload" />
  </AppLayout>
);

const BlockedWork: React.FC = () => (
  <AppLayout>
    <PlaceholderPage title="Blocked Work" />
  </AppLayout>
);

const Reports: React.FC = () => (
  <AppLayout>
    <PlaceholderPage title="Reports" />
  </AppLayout>
);

const App: React.FC = () => {
  return (
    <ThemeProvider theme={dertourTheme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<LoginPage />} />

              {/* Protected Routes - Finance User */}
              <Route
                path="/dashboard/finance"
                element={
                  <ProtectedRoute>
                    <RoleRoute allowedRoles={['FINANCE_USER', 'SYSTEM_ADMIN']}>
                      <FinanceDashboard />
                    </RoleRoute>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/portfolio"
                element={
                  <ProtectedRoute>
                    <RoleRoute allowedRoles={['FINANCE_USER', 'EXECUTIVE', 'SYSTEM_ADMIN']}>
                      <PortfolioOverview />
                    </RoleRoute>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/risks"
                element={
                  <ProtectedRoute>
                    <RoleRoute allowedRoles={['FINANCE_USER', 'EXECUTIVE', 'SYSTEM_ADMIN']}>
                      <RisksBlockers />
                    </RoleRoute>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/agent-actions"
                element={
                  <ProtectedRoute>
                    <RoleRoute allowedRoles={['FINANCE_USER', 'SYSTEM_ADMIN']}>
                      <AgentActions />
                    </RoleRoute>
                  </ProtectedRoute>
                }
              />

              {/* Protected Routes - Team Member */}
              <Route
                path="/dashboard/team"
                element={
                  <ProtectedRoute>
                    <RoleRoute allowedRoles={['TEAM_MEMBER', 'SYSTEM_ADMIN']}>
                      <TeamDashboard />
                    </RoleRoute>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-initiatives"
                element={
                  <ProtectedRoute>
                    <RoleRoute allowedRoles={['TEAM_MEMBER', 'SYSTEM_ADMIN']}>
                      <MyInitiatives />
                    </RoleRoute>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/milestones"
                element={
                  <ProtectedRoute>
                    <RoleRoute allowedRoles={['TEAM_MEMBER', 'SYSTEM_ADMIN']}>
                      <Milestones />
                    </RoleRoute>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/risks-decisions"
                element={
                  <ProtectedRoute>
                    <RoleRoute allowedRoles={['TEAM_MEMBER', 'SYSTEM_ADMIN']}>
                      <RisksDecisions />
                    </RoleRoute>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/evidence"
                element={
                  <ProtectedRoute>
                    <RoleRoute allowedRoles={['TEAM_MEMBER', 'SYSTEM_ADMIN']}>
                      <EvidenceUpload />
                    </RoleRoute>
                  </ProtectedRoute>
                }
              />

              {/* Protected Routes - Executive */}
              <Route
                path="/dashboard/executive"
                element={
                  <ProtectedRoute>
                    <RoleRoute allowedRoles={['EXECUTIVE', 'SYSTEM_ADMIN']}>
                      <ExecutiveDashboard />
                    </RoleRoute>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/blocked-work"
                element={
                  <ProtectedRoute>
                    <RoleRoute allowedRoles={['EXECUTIVE', 'SYSTEM_ADMIN']}>
                      <BlockedWork />
                    </RoleRoute>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reports"
                element={
                  <ProtectedRoute>
                    <RoleRoute allowedRoles={['EXECUTIVE', 'SYSTEM_ADMIN']}>
                      <Reports />
                    </RoleRoute>
                  </ProtectedRoute>
                }
              />

              {/* Protected Routes - Admin Panel (SYSTEM_ADMIN only) */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <RoleRoute allowedRoles={['SYSTEM_ADMIN']}>
                      <AdminPanel />
                    </RoleRoute>
                  </ProtectedRoute>
                }
              >
                {/* Default redirect to users */}
                <Route index element={<Navigate to="/admin/users" replace />} />
                <Route path="users" element={<UserManagementPage />} />
                <Route path="data" element={<DataManagementPage />} />
                <Route path="audit" element={<AuditLogPage />} />
                <Route path="config" element={<ConfigurationPage />} />
              </Route>

              {/* Shared Audit Log Route */}
              <Route
                path="/audit-log"
                element={
                  <ProtectedRoute>
                    <RoleRoute allowedRoles={['FINANCE_USER', 'SYSTEM_ADMIN']}>
                      <AuditLog />
                    </RoleRoute>
                  </ProtectedRoute>
                }
              />

              {/* Default redirect */}
              <Route path="/" element={<Navigate to="/login" replace />} />

              {/* 404 / Forbidden */}
              <Route path="/forbidden" element={<ForbiddenPage />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
