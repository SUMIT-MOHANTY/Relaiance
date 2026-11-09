/**
 * AppLayout.tsx - Main Application Layout Shell
 * 
 * Provides the persistent shell structure for authenticated users:
 * - Left sidebar (240px) with role-aware navigation
 * - Top app bar with breadcrumbs, notifications, and user menu
 * - Main content area with proper padding and background
 */

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Badge,
  Menu,
  MenuItem,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip,
  Tooltip,
  Collapse,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  AccountCircle,
  Logout,
  Dashboard,
  Assessment,
  Warning,
  SmartToy,
  History,
  Assignment,
  Flag,
  Gavel,
  Upload,
  Block,
  BarChart,
  People,
  Storage,
  Settings,
  ChevronLeft,
  ExpandLess,
  ExpandMore,
  AdminPanelSettings,
} from '@mui/icons-material';

import { useAuth, useCurrentUser, useUserRole } from '../../store/authStore';
import { DERTOUR_COLORS } from '../../config/theme';
import { UserRole } from '../../types/api.types';

const DRAWER_WIDTH = 240;

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  roles: UserRole[];
}

interface AdminSubItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

const navigationItems: NavItem[] = [
  // Finance User routes
  { label: 'Portfolio Overview', path: '/portfolio', icon: <Assessment />, roles: ['FINANCE_USER'] },
  { label: 'Risk & Blockers', path: '/risks', icon: <Warning />, roles: ['FINANCE_USER'] },
  { label: 'Agent Actions', path: '/agent-actions', icon: <SmartToy />, roles: ['FINANCE_USER'] },
  { label: 'Audit Log', path: '/audit-log', icon: <History />, roles: ['FINANCE_USER'] },
  
  // Team Member routes
  { label: 'My Initiatives', path: '/my-initiatives', icon: <Assignment />, roles: ['TEAM_MEMBER'] },
  { label: 'Milestones', path: '/milestones', icon: <Flag />, roles: ['TEAM_MEMBER'] },
  { label: 'Risks & Decisions', path: '/risks-decisions', icon: <Gavel />, roles: ['TEAM_MEMBER'] },
  { label: 'Evidence Upload', path: '/evidence', icon: <Upload />, roles: ['TEAM_MEMBER'] },
  
  // Executive routes
  { label: 'Executive Summary', path: '/dashboard/executive', icon: <Dashboard />, roles: ['EXECUTIVE'] },
  { label: 'Portfolio Overview', path: '/portfolio', icon: <Assessment />, roles: ['EXECUTIVE'] },
  { label: 'Blocked Work', path: '/blocked-work', icon: <Block />, roles: ['EXECUTIVE'] },
  { label: 'Reports', path: '/reports', icon: <BarChart />, roles: ['EXECUTIVE'] },
];

// Admin sub-navigation items
const adminSubItems: AdminSubItem[] = [
  { label: 'Users', path: '/admin/users', icon: <People /> },
  { label: 'Data Management', path: '/admin/data', icon: <Storage /> },
  { label: 'Audit Log', path: '/admin/audit', icon: <History /> },
  { label: 'Configuration', path: '/admin/config', icon: <Settings /> },
];

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const currentUser = useCurrentUser();
  const userRole = useUserRole();
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const [notificationAnchor, setNotificationAnchor] = useState<null | HTMLElement>(null);
  const [adminExpanded, setAdminExpanded] = useState(true);

  // Check if user is System Admin
  const isSystemAdmin = userRole === 'SYSTEM_ADMIN';

  // Check if current path is under admin section
  const isAdminPath = location.pathname.startsWith('/admin');

  // Filter navigation items based on user role
  const filteredNavItems = navigationItems.filter(
    item => item.roles.includes(userRole as UserRole) || isSystemAdmin
  );

  // Get page title from current path
  const getPageTitle = () => {
    const currentItem = navigationItems.find(item => item.path === location.pathname);
    if (currentItem) return currentItem.label;
    
    // Check admin sub-items
    const adminItem = adminSubItems.find(item => item.path === location.pathname);
    if (adminItem) return `Admin: ${adminItem.label}`;
    
    // Handle dashboard routes
    if (location.pathname === '/dashboard/finance') return 'Finance Dashboard';
    if (location.pathname === '/dashboard/team') return 'Team Dashboard';
    if (location.pathname === '/admin') return 'Admin Panel';
    
    return 'DERTOUR Portfolio Control Tower';
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNavClick = (path: string) => {
    navigate(path);
    setMobileOpen(false);
  };

  const handleAdminToggle = () => {
    setAdminExpanded(!adminExpanded);
  };

  // Sidebar content
  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Logo / Wordmark */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: `1px solid rgba(255,255,255,0.1)`,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            color: '#fff',
            fontWeight: 600,
            letterSpacing: '0.5px',
          }}
        >
          DERTOUR
        </Typography>
        <IconButton
          onClick={handleDrawerToggle}
          sx={{ color: '#fff', display: { sm: 'none' } }}
        >
          <ChevronLeft />
        </IconButton>
      </Box>

      {/* Navigation */}
      <List sx={{ flexGrow: 1, py: 1 }}>
        {filteredNavItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                onClick={() => handleNavClick(item.path)}
                sx={{
                  mx: 1,
                  borderRadius: 1,
                  borderLeft: isActive ? `3px solid ${DERTOUR_COLORS.primary}` : '3px solid transparent',
                  backgroundColor: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.08)',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive ? DERTOUR_COLORS.primary : 'rgba(255,255,255,0.7)',
                    minWidth: 40,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  sx={{
                    '& .MuiListItemText-primary': {
                      color: isActive ? '#fff' : 'rgba(255,255,255,0.85)',
                      fontSize: '0.875rem',
                      fontWeight: isActive ? 500 : 400,
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}

        {/* Admin Expandable Section - Only visible to System Admin */}
        {isSystemAdmin && (
          <>
            <ListItem disablePadding>
              <ListItemButton
                onClick={handleAdminToggle}
                sx={{
                  mx: 1,
                  borderRadius: 1,
                  borderLeft: isAdminPath ? `3px solid ${DERTOUR_COLORS.primary}` : '3px solid transparent',
                  backgroundColor: isAdminPath ? 'rgba(255,255,255,0.1)' : 'transparent',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.08)',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isAdminPath ? DERTOUR_COLORS.primary : 'rgba(255,255,255,0.7)',
                    minWidth: 40,
                  }}
                >
                  <AdminPanelSettings />
                </ListItemIcon>
                <ListItemText
                  primary="Admin"
                  sx={{
                    '& .MuiListItemText-primary': {
                      color: isAdminPath ? '#fff' : 'rgba(255,255,255,0.85)',
                      fontSize: '0.875rem',
                      fontWeight: isAdminPath ? 500 : 400,
                    },
                  }}
                />
                {adminExpanded ? (
                  <ExpandLess sx={{ color: 'rgba(255,255,255,0.7)', fontSize: 20 }} />
                ) : (
                  <ExpandMore sx={{ color: 'rgba(255,255,255,0.7)', fontSize: 20 }} />
                )}
              </ListItemButton>
            </ListItem>
            
            {/* Admin Sub-items */}
            <Collapse in={adminExpanded} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {adminSubItems.map((subItem) => {
                  const isSubActive = location.pathname === subItem.path;
                  return (
                    <ListItem key={subItem.path} disablePadding>
                      <ListItemButton
                        onClick={() => handleNavClick(subItem.path)}
                        sx={{
                          pl: 6,
                          mx: 1,
                          borderRadius: 1,
                          borderLeft: isSubActive ? `3px solid ${DERTOUR_COLORS.secondary}` : '3px solid transparent',
                          backgroundColor: isSubActive ? 'rgba(255,255,255,0.08)' : 'transparent',
                          '&:hover': {
                            backgroundColor: 'rgba(255,255,255,0.05)',
                          },
                        }}
                      >
                        <ListItemIcon
                          sx={{
                            color: isSubActive ? DERTOUR_COLORS.secondary : 'rgba(255,255,255,0.5)',
                            minWidth: 32,
                          }}
                        >
                          {subItem.icon}
                        </ListItemIcon>
                        <ListItemText
                          primary={subItem.label}
                          sx={{
                            '& .MuiListItemText-primary': {
                              color: isSubActive ? '#fff' : 'rgba(255,255,255,0.7)',
                              fontSize: '0.8rem',
                              fontWeight: isSubActive ? 500 : 400,
                            },
                          }}
                        />
                      </ListItemButton>
                    </ListItem>
                  );
                })}
              </List>
            </Collapse>
          </>
        )}
      </List>

      {/* User Section */}
      <Box
        sx={{
          p: 2,
          borderTop: `1px solid rgba(255,255,255,0.1)`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <Avatar
            sx={{
              width: 40,
              height: 40,
              bgcolor: DERTOUR_COLORS.primary,
              fontSize: '1rem',
              fontWeight: 500,
            }}
          >
            {currentUser?.firstName?.[0]}{currentUser?.lastName?.[0]}
          </Avatar>
          <Box sx={{ overflow: 'hidden' }}>
            <Typography
              variant="body2"
              sx={{
                color: '#fff',
                fontWeight: 500,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {currentUser?.firstName} {currentUser?.lastName}
            </Typography>
            <Chip
              label={userRole?.replace('_', ' ')}
              size="small"
              sx={{
                height: 20,
                fontSize: '0.65rem',
                backgroundColor: 'rgba(0,168,168,0.2)',
                color: DERTOUR_COLORS.primary,
                border: `1px solid ${DERTOUR_COLORS.primary}`,
                '& .MuiChip-label': { px: 1 },
              }}
            />
          </Box>
        </Box>

        <ListItemButton
          onClick={handleLogout}
          sx={{
            borderRadius: 1,
            color: 'rgba(255,255,255,0.7)',
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.08)',
              color: '#fff',
            },
          }}
        >
          <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
            <Logout fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary="Sign Out"
            primaryTypographyProps={{ fontSize: '0.875rem' }}
          />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            backgroundColor: DERTOUR_COLORS.sidebar,
            borderRight: 'none',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            backgroundColor: DERTOUR_COLORS.sidebar,
            borderRight: 'none',
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>

      {/* Main content area */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Top App Bar */}
        <AppBar
          position="static"
          elevation={1}
          sx={{
            backgroundColor: '#fff',
            color: DERTOUR_COLORS.text.primary,
            height: 64,
          }}
        >
          <Toolbar sx={{ height: 64, px: { xs: 2, sm: 3 } }}>
            {/* Mobile menu button */}
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: 'none' } }}
            >
              <MenuIcon />
            </IconButton>

            {/* Page Title / Breadcrumb */}
            <Typography
              variant="h6"
              sx={{
                flexGrow: 1,
                color: DERTOUR_COLORS.text.primary,
                fontWeight: 600,
                fontSize: { xs: '1rem', sm: '1.25rem' },
              }}
            >
              {getPageTitle()}
            </Typography>

            {/* Notification Bell */}
            <Tooltip title="Notifications">
              <IconButton
                color="inherit"
                onClick={(e) => setNotificationAnchor(e.currentTarget)}
                sx={{ mr: 1 }}
              >
                <Badge badgeContent={3} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>

            {/* User Avatar Chip */}
            <Chip
              avatar={
                <Avatar sx={{ bgcolor: DERTOUR_COLORS.primary }}>
                  {currentUser?.firstName?.[0]}
                </Avatar>
              }
              label={`${currentUser?.firstName || 'User'}`}
              onClick={(e) => setUserMenuAnchor(e.currentTarget)}
              sx={{
                display: { xs: 'none', sm: 'flex' },
                cursor: 'pointer',
                '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' },
              }}
            />

            {/* Mobile user menu button */}
            <IconButton
              color="inherit"
              onClick={(e) => setUserMenuAnchor(e.currentTarget)}
              sx={{ display: { sm: 'none' } }}
            >
              <AccountCircle />
            </IconButton>
          </Toolbar>
        </AppBar>

        {/* Notification Menu */}
        <Menu
          anchorEl={notificationAnchor}
          open={Boolean(notificationAnchor)}
          onClose={() => setNotificationAnchor(null)}
          PaperProps={{
            sx: { width: 360, maxHeight: 400 },
          }}
        >
          <Box sx={{ p: 2, borderBottom: `1px solid ${DERTOUR_COLORS.grey[300]}` }}>
            <Typography variant="subtitle2" fontWeight={600}>
              Notifications
            </Typography>
          </Box>
          <MenuItem onClick={() => setNotificationAnchor(null)}>
            <Box sx={{ py: 1 }}>
              <Typography variant="body2" fontWeight={500}>
                Risk threshold exceeded
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Initiative "ERP Migration" risk score is now HIGH
              </Typography>
            </Box>
          </MenuItem>
          <MenuItem onClick={() => setNotificationAnchor(null)}>
            <Box sx={{ py: 1 }}>
              <Typography variant="body2" fontWeight={500}>
                Milestone overdue
              </Typography>
              <Typography variant="caption" color="text.secondary">
                "Data Migration Phase 1" is 3 days overdue
              </Typography>
            </Box>
          </MenuItem>
          <MenuItem onClick={() => setNotificationAnchor(null)}>
            <Box sx={{ py: 1 }}>
              <Typography variant="body2" fontWeight={500}>
                Agent action pending
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Review recommended action for "Cloud Migration"
              </Typography>
            </Box>
          </MenuItem>
          <Divider />
          <MenuItem
            onClick={() => setNotificationAnchor(null)}
            sx={{ justifyContent: 'center', color: DERTOUR_COLORS.primary }}
          >
            <Typography variant="body2">View all notifications</Typography>
          </MenuItem>
        </Menu>

        {/* User Menu */}
        <Menu
          anchorEl={userMenuAnchor}
          open={Boolean(userMenuAnchor)}
          onClose={() => setUserMenuAnchor(null)}
        >
          {isSystemAdmin && (
            <MenuItem onClick={() => { setUserMenuAnchor(null); navigate('/admin/config'); }}>
              <ListItemIcon>
                <Settings fontSize="small" />
              </ListItemIcon>
              Settings
            </MenuItem>
          )}
          {isSystemAdmin && <Divider />}
          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <Logout fontSize="small" />
            </ListItemIcon>
            Sign Out
          </MenuItem>
        </Menu>

        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: 2, sm: 3 },
            backgroundColor: DERTOUR_COLORS.background,
            minHeight: 'calc(100vh - 64px)',
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default AppLayout;
