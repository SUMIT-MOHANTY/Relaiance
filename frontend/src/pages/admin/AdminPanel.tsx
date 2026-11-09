import React, { useState } from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Divider,
  Paper,
} from '@mui/material';
import {
  People as PeopleIcon,
  Storage as StorageIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../store/authStore';
import { UserRole } from '../../types/api.types';

// Sub-panel components (will be created in subsequent tasks)
const UserManagement: React.FC = () => (
  <Box sx={{ p: 3 }}>
    <Typography variant="h4" gutterBottom>User Management</Typography>
    <Typography color="text.secondary">User management interface will be implemented here.</Typography>
  </Box>
);

const DataManagement: React.FC = () => (
  <Box sx={{ p: 3 }}>
    <Typography variant="h4" gutterBottom>Data Management</Typography>
    <Typography color="text.secondary">Data management interface will be implemented here.</Typography>
  </Box>
);

const AuditLog: React.FC = () => (
  <Box sx={{ p: 3 }}>
    <Typography variant="h4" gutterBottom>Audit Log</Typography>
    <Typography color="text.secondary">Audit log viewer will be implemented here.</Typography>
  </Box>
);

const Configuration: React.FC = () => (
  <Box sx={{ p: 3 }}>
    <Typography variant="h4" gutterBottom>Configuration</Typography>
    <Typography color="text.secondary">Configuration editor will be implemented here.</Typography>
  </Box>
);

interface AdminNavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

const adminNavItems: AdminNavItem[] = [
  { path: '/admin/users', label: 'Users', icon: <PeopleIcon /> },
  { path: '/admin/data', label: 'Data Management', icon: <StorageIcon /> },
  { path: '/admin/audit', label: 'Audit Log', icon: <AssessmentIcon /> },
  { path: '/admin/configuration', label: 'Configuration', icon: <SettingsIcon /> },
];

const drawerWidth = 260;

export const AdminPanel: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, hasRole } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Redirect non-admin users
  React.useEffect(() => {
    if (!hasRole([UserRole.SYSTEM_ADMIN])) {
      navigate('/dashboard', { replace: true });
    }
  }, [hasRole, navigate]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavClick = (path: string) => {
    navigate(path);
    setMobileOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;

  const drawer = (
    <Box>
      <Toolbar>
        <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 600 }}>
          Admin Panel
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {adminNavItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              selected={isActive(item.path)}
              onClick={() => handleNavClick(item.path)}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: 'primary.main',
                  color: 'primary.contrastText',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'primary.contrastText',
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: isActive(item.path) ? 'inherit' : 'text.secondary',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  // Don't render if not admin
  if (!hasRole([UserRole.SYSTEM_ADMIN])) {
    return null;
  }

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            position: 'relative',
            height: '100%',
          },
        }}
        open
      >
        {drawer}
      </Drawer>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: 'background.default',
          p: 0,
          overflow: 'auto',
          width: { md: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Paper elevation={0} sx={{ minHeight: '100%', borderRadius: 0 }}>
          <Routes>
            <Route path="/users" element={<UserManagement />} />
            <Route path="/data" element={<DataManagement />} />
            <Route path="/audit" element={<AuditLog />} />
            <Route path="/configuration" element={<Configuration />} />
            <Route path="/" element={<UserManagement />} />
          </Routes>
        </Paper>
      </Box>
    </Box>
  );
};

export default AdminPanel;
