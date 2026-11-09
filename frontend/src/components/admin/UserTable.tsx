/**
 * UserTable.tsx
 * 
 * MUI DataGrid-based table for displaying and managing users.
 * Features inline role editing, active status toggle, and action buttons.
 */

import React from 'react';
import {
  Box,
  Chip,
  IconButton,
  Switch,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNotification } from '../../store/notificationStore';
import { updateUser, updateUserRole, deactivateUser } from '../../services/admin.api';
import { User, UserRole } from '../../types/api.types';
import { DERTOUR_COLORS } from '../../config/theme';

interface UserTableProps {
  users: User[];
  loading?: boolean;
  onEdit: (user: User) => void;
  onDeactivate: (user: User) => void;
}

const ROLE_COLORS: Record<UserRole, string> = {
  FINANCE_USER: DERTOUR_COLORS.primary,
  TEAM_MEMBER: DERTOUR_COLORS.secondary,
  EXECUTIVE: '#9C27B0',
  SYSTEM_ADMIN: DERTOUR_COLORS.error,
};

const ROLE_LABELS: Record<UserRole, string> = {
  FINANCE_USER: 'Finance User',
  TEAM_MEMBER: 'Team Member',
  EXECUTIVE: 'Executive',
  SYSTEM_ADMIN: 'System Admin',
};

export const UserTable: React.FC<UserTableProps> = ({
  users,
  loading = false,
  onEdit,
  onDeactivate,
}) => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotification();

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: UserRole }) =>
      updateUserRole(id, { role }),
    onSuccess: () => {
      showSuccess('User role updated');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: Error) => {
      showError(error.message || 'Failed to update role');
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      updateUser(id, { isActive }),
    onSuccess: (_, variables) => {
      showSuccess(variables.isActive ? 'User activated' : 'User deactivated');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: Error) => {
      showError(error.message || 'Failed to update status');
    },
  });

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    updateRoleMutation.mutate({ id: userId, role: newRole });
  };

  const handleStatusToggle = (userId: string, currentStatus: boolean) => {
    updateStatusMutation.mutate({ id: userId, isActive: !currentStatus });
  };

  const columns: GridColDef[] = [
    {
      field: 'fullName',
      headerName: 'Full Name',
      flex: 1.5,
      minWidth: 180,
      renderCell: (params: GridRenderCellParams<User>) => (
        <Box>
          <Typography variant="body2" fontWeight={500}>
            {params.row.firstName} {params.row.lastName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {params.row.department}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'email',
      headerName: 'Email',
      flex: 1.5,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams<User>) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <EmailIcon fontSize="small" color="action" />
          <Typography variant="body2">{params.row.email}</Typography>
        </Box>
      ),
    },
    {
      field: 'role',
      headerName: 'Role',
      flex: 1,
      minWidth: 150,
      renderCell: (params: GridRenderCellParams<User>) => (
        <Chip
          label={ROLE_LABELS[params.row.role]}
          size="small"
          sx={{
            backgroundColor: `${ROLE_COLORS[params.row.role]}20`,
            color: ROLE_COLORS[params.row.role],
            border: `1px solid ${ROLE_COLORS[params.row.role]}`,
            fontWeight: 500,
            cursor: 'pointer',
            '&:hover': {
              opacity: 0.8,
            },
          }}
          onClick={() => {
            // Cycle through roles on click
            const roles: UserRole[] = ['FINANCE_USER', 'TEAM_MEMBER', 'EXECUTIVE', 'SYSTEM_ADMIN'];
            const currentIndex = roles.indexOf(params.row.role);
            const nextRole = roles[(currentIndex + 1) % roles.length];
            handleRoleChange(params.row.id, nextRole);
          }}
        />
      ),
    },
    {
      field: 'department',
      headerName: 'Department',
      flex: 0.8,
      minWidth: 120,
    },
    {
      field: 'isActive',
      headerName: 'Active',
      flex: 0.6,
      minWidth: 100,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams<User>) => (
        <Tooltip title={params.row.isActive ? 'Click to deactivate' : 'Click to activate'}>
          <Switch
            checked={params.row.isActive ?? true}
            onChange={() => handleStatusToggle(params.row.id, params.row.isActive ?? true)}
            color="primary"
            size="small"
          />
        </Tooltip>
      ),
    },
    {
      field: 'lastLogin',
      headerName: 'Last Login',
      flex: 1,
      minWidth: 150,
      renderCell: (params: GridRenderCellParams<User>) => (
        <Typography variant="body2" color="text.secondary">
          {params.row.lastLogin
            ? new Date(params.row.lastLogin).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })
            : 'Never'}
        </Typography>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 0.8,
      minWidth: 120,
      sortable: false,
      filterable: false,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams<User>) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="Edit User">
            <IconButton
              size="small"
              onClick={() => onEdit(params.row)}
              sx={{ color: DERTOUR_COLORS.primary }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={params.row.isActive ? 'Deactivate User' : 'Activate User'}>
            <IconButton
              size="small"
              onClick={() => onDeactivate(params.row)}
              sx={{ color: params.row.isActive ? DERTOUR_COLORS.error : DERTOUR_COLORS.success }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ height: '100%', width: '100%' }}>
      <DataGrid
        rows={users}
        columns={columns}
        loading={loading}
        getRowId={(row) => row.id}
        pagination
        pageSizeOptions={[10, 25, 50]}
        initialState={{
          pagination: {
            paginationModel: { pageSize: 10, page: 0 },
          },
        }}
        disableRowSelectionOnClick
        sx={{
          border: 'none',
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: DERTOUR_COLORS.grey100,
            borderBottom: `2px solid ${DERTOUR_COLORS.grey300}`,
          },
          '& .MuiDataGrid-columnHeaderTitle': {
            fontWeight: 600,
            color: DERTOUR_COLORS.primary,
          },
          '& .MuiDataGrid-row:hover': {
            backgroundColor: `${DERTOUR_COLORS.primary}08`,
          },
          '& .MuiDataGrid-cell': {
            borderBottom: `1px solid ${DERTOUR_COLORS.grey200}`,
          },
        }}
      />
    </Box>
  );
};

export default UserTable;
