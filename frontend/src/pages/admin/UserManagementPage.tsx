/**
 * UserManagementPage.tsx - User Management Sub-Panel
 * 
 * Displays a MUI DataGrid with user data including:
 * - Full Name, Email, Role (editable inline), Department
 * - Is Active toggle, Last Login, Actions (Edit, Deactivate)
 * - Invite User button opening CreateUserDrawer
 */

import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Switch,
  IconButton,
  Chip,
  Tooltip,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { User, UserRole } from '../../types/api.types';
import {
  getUsers,
  updateUser,
  updateUserRole,
  deactivateUser,
  ListUsersFilters,
} from '../../services/admin.api';
import { useNotification } from '../../store/notificationStore';
import { CreateUserDrawer } from '../../components/admin/CreateUserDrawer';
import { EditUserDrawer } from '../../components/admin/EditUserDrawer';
import { ConfirmDeactivateDialog } from '../../components/admin/ConfirmDeactivateDialog';
import { DERTOUR_COLORS } from '../../config/theme';

// Role chip color mapping
const ROLE_COLORS: Record<UserRole, { bg: string; color: string; border: string }> = {
  [UserRole.FINANCE_USER]: {
    bg: '#E3F2FD',
    color: '#1565C0',
    border: '#1976D2',
  },
  [UserRole.TEAM_MEMBER]: {
    bg: '#E0F2F1',
    color: '#00695C',
    border: '#00897B',
  },
  [UserRole.EXECUTIVE]: {
    bg: '#F3E5F5',
    color: '#7B1FA2',
    border: '#8E24AA',
  },
  [UserRole.SYSTEM_ADMIN]: {
    bg: '#FFEBEE',
    color: '#C62828',
    border: '#E53935',
  },
};

const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.FINANCE_USER]: 'Finance User',
  [UserRole.TEAM_MEMBER]: 'Team Member',
  [UserRole.EXECUTIVE]: 'Executive',
  [UserRole.SYSTEM_ADMIN]: 'System Admin',
};

export const UserManagementPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { showNotification } = useNotification();
  
  // State for drawers and dialogs
  const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // Pagination and filtering state
  const [filters, setFilters] = useState<ListUsersFilters>({
    page: 1,
    limit: 20,
  });

  // Fetch users query
  const { data: usersData, isLoading, error } = useQuery({
    queryKey: ['users', filters],
    queryFn: () => getUsers(filters),
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateUser>[1] }) =>
      updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      showNotification('User updated successfully', 'success');
    },
    onError: (error: Error) => {
      showNotification(`Failed to update user: ${error.message}`, 'error');
    },
  });

  // Update role mutation
  const updateRoleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: UserRole }) =>
      updateUserRole(id, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      showNotification('User role updated successfully', 'success');
    },
    onError: (error: Error) => {
      showNotification(`Failed to update role: ${error.message}`, 'error');
    },
  });

  // Deactivate user mutation
  const deactivateMutation = useMutation({
    mutationFn: deactivateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      showNotification('User deactivated successfully', 'success');
      setDeactivateDialogOpen(false);
      setSelectedUser(null);
    },
    onError: (error: Error) => {
      showNotification(`Failed to deactivate user: ${error.message}`, 'error');
    },
  });

  // Handle isActive toggle
  const handleIsActiveToggle = useCallback(
    (user: User) => {
      updateUserMutation.mutate({
        id: user.id,
        data: { isActive: !user.isActive },
      });
    },
    [updateUserMutation]
  );

  // Handle role change
  const handleRoleChange = useCallback(
    (user: User, newRole: UserRole) => {
      updateRoleMutation.mutate({ id: user.id, role: newRole });
    },
    [updateRoleMutation]
  );

  // Handle edit click
  const handleEditClick = useCallback((user: User) => {
    setSelectedUser(user);
    setEditDrawerOpen(true);
  }, []);

  // Handle deactivate click
  const handleDeactivateClick = useCallback((user: User) => {
    setSelectedUser(user);
    setDeactivateDialogOpen(true);
  }, []);

  // Handle deactivate confirm
  const handleDeactivateConfirm = useCallback(() => {
    if (selectedUser) {
      deactivateMutation.mutate(selectedUser.id);
    }
  }, [selectedUser, deactivateMutation]);

  // DataGrid columns
  const columns: GridColDef<User>[] = [
    {
      field: 'fullName',
      headerName: 'Full Name',
      width: 200,
      valueGetter: (params) => `${params.row.firstName} ${params.row.lastName}`,
    },
    {
      field: 'email',
      headerName: 'Email',
      width: 250,
    },
    {
      field: 'role',
      headerName: 'Role',
      width: 150,
      renderCell: (params: GridRenderCellParams<User>) => (
        <Chip
          label={ROLE_LABELS[params.value as UserRole]}
          size="small"
          sx={{
            backgroundColor: ROLE_COLORS[params.value as UserRole]?.bg,
            color: ROLE_COLORS[params.value as UserRole]?.color,
            border: `1px solid ${ROLE_COLORS[params.value as UserRole]?.border}`,
            fontWeight: 500,
            fontSize: '0.75rem',
          }}
        />
      ),
    },
    {
      field: 'department',
      headerName: 'Department',
      width: 150,
    },
    {
      field: 'isActive',
      headerName: 'Is Active',
      width: 100,
      align: 'center',
      renderCell: (params: GridRenderCellParams<User>) => (
        <Switch
          checked={params.value as boolean}
          onChange={() => handleIsActiveToggle(params.row)}
          size="small"
          disabled={updateUserMutation.isPending}
        />
      ),
    },
    {
      field: 'lastLogin',
      headerName: 'Last Login',
      width: 180,
      valueFormatter: (params) => {
        if (!params.value) return 'Never';
        return new Date(params.value as string).toLocaleString();
      },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams<User>) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Edit User">
            <IconButton
              size="small"
              onClick={() => handleEditClick(params.row)}
              sx={{ color: DERTOUR_COLORS.primary }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Deactivate User">
            <IconButton
              size="small"
              onClick={() => handleDeactivateClick(params.row)}
              sx={{ color: DERTOUR_COLORS.error }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Failed to load users: {(error as Error).message}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 600, color: DERTOUR_COLORS.primary }}>
          User Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateDrawerOpen(true)}
          sx={{
            backgroundColor: DERTOUR_COLORS.primary,
            '&:hover': { backgroundColor: DERTOUR_COLORS.secondary },
          }}
        >
          Invite User
        </Button>
      </Box>

      {/* Users Table */}
      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={usersData?.data || []}
          columns={columns}
          loading={isLoading}
          pagination
          paginationMode="server"
          rowCount={usersData?.total || 0}
          page={filters.page ? filters.page - 1 : 0}
          onPageChange={(page) => setFilters((prev) => ({ ...prev, page: page + 1 }))}
          pageSizeOptions={[10, 20, 50]}
          disableRowSelectionOnClick
          sx={{
            border: 'none',
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: DERTOUR_COLORS.grey[100],
              fontWeight: 600,
            },
          }}
          slots={{
            loadingOverlay: () => (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <CircularProgress />
              </Box>
            ),
          }}
        />
      </Paper>

      {/* Create User Drawer */}
      <CreateUserDrawer
        open={createDrawerOpen}
        onClose={() => setCreateDrawerOpen(false)}
      />

      {/* Edit User Drawer */}
      {selectedUser && (
        <EditUserDrawer
          open={editDrawerOpen}
          onClose={() => {
            setEditDrawerOpen(false);
            setSelectedUser(null);
          }}
          user={selectedUser}
        />
      )}

      {/* Deactivate Confirmation Dialog */}
      {selectedUser && (
        <ConfirmDeactivateDialog
          open={deactivateDialogOpen}
          onClose={() => {
            setDeactivateDialogOpen(false);
            setSelectedUser(null);
          }}
          onConfirm={handleDeactivateConfirm}
          userName={`${selectedUser.firstName} ${selectedUser.lastName}`}
          isLoading={deactivateMutation.isPending}
        />
      )}
    </Box>
  );
};

export default UserManagementPage;
