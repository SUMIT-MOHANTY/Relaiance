/**
 * EditUserDrawer.tsx
 * 
 * Right-side drawer for editing existing user details.
 * Allows updating name, email, role, department, and active status.
 */

import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Switch,
  FormControlLabel,
  Chip,
  Alert,
} from '@mui/material';
import {
  Close as CloseIcon,
  Save as SaveIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNotification } from '../../store/notificationStore';
import { updateUser, updateUserRole } from '../../services/admin.api';
import { User, UserRole } from '../../types/api.types';
import { DERTOUR_COLORS } from '../../config/theme';

interface EditUserDrawerProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  department: string;
  isActive: boolean;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
  department?: string;
}

const ROLE_OPTIONS: { value: UserRole; label: string; color: string }[] = [
  { value: 'FINANCE_USER', label: 'Finance User', color: DERTOUR_COLORS.primary },
  { value: 'TEAM_MEMBER', label: 'Team Member', color: DERTOUR_COLORS.secondary },
  { value: 'EXECUTIVE', label: 'Executive', color: '#9C27B0' },
  { value: 'SYSTEM_ADMIN', label: 'System Admin', color: DERTOUR_COLORS.error },
];

const DEPARTMENT_OPTIONS = [
  'Finance',
  'IT',
  'Operations',
  'Marketing',
  'Sales',
  'HR',
  'Legal',
  'Strategy',
  'PMO',
];

export const EditUserDrawer: React.FC<EditUserDrawerProps> = ({
  open,
  onClose,
  user,
}) => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotification();
  
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    role: 'TEAM_MEMBER',
    department: '',
    isActive: true,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize form when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        role: user.role,
        department: user.department || '',
        isActive: user.isActive ?? true,
      });
      setHasChanges(false);
      setErrors({});
    }
  }, [user]);

  const handleClose = () => {
    onClose();
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.role) {
      newErrors.role = 'Role is required';
    }
    
    if (!formData.department) {
      newErrors.department = 'Department is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateUser>[1] }) =>
      updateUser(id, data),
    onSuccess: () => {
      showSuccess('User updated successfully');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      handleClose();
    },
    onError: (error: Error) => {
      showError(error.message || 'Failed to update user');
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: UserRole }) =>
      updateUserRole(id, { role }),
    onSuccess: () => {
      showSuccess('User role updated successfully');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: Error) => {
      showError(error.message || 'Failed to update user role');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !validateForm()) return;

    // Check if role changed
    if (formData.role !== user.role) {
      updateRoleMutation.mutate({ id: user.id, role: formData.role });
    }

    // Update other fields
    updateUserMutation.mutate({
      id: user.id,
      data: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        department: formData.department,
        isActive: formData.isActive,
      },
    });
  };

  const handleInputChange = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleRoleChange = (e: React.ChangeEvent<{ value: unknown }>) => {
    setFormData((prev) => ({ ...prev, role: e.target.value as UserRole }));
    setHasChanges(true);
    if (errors.role) {
      setErrors((prev) => ({ ...prev, role: undefined }));
    }
  };

  const handleDepartmentChange = (e: React.ChangeEvent<{ value: unknown }>) => {
    setFormData((prev) => ({ ...prev, department: e.target.value as string }));
    setHasChanges(true);
    if (errors.department) {
      setErrors((prev) => ({ ...prev, department: undefined }));
    }
  };

  if (!user) return null;

  const isPending = updateUserMutation.isPending || updateRoleMutation.isPending;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={handleClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 480 },
          p: 0,
        },
      }}
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box
          sx={{
            p: 3,
            borderBottom: `1px solid ${DERTOUR_COLORS.grey300}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <PersonIcon sx={{ color: DERTOUR_COLORS.primary }} />
            <Typography variant="h6" sx={{ fontWeight: 600, color: DERTOUR_COLORS.primary }}>
              Edit User
            </Typography>
          </Box>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
          {/* User Info Header */}
          <Box sx={{ mb: 3, p: 2, bgcolor: DERTOUR_COLORS.grey100, borderRadius: 1 }}>
            <Typography variant="subtitle2" sx={{ mb: 0.5, color: 'text.secondary' }}>
              User ID
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
              {user.id}
            </Typography>
            {user.lastLogin && (
              <>
                <Typography variant="subtitle2" sx={{ mt: 1.5, mb: 0.5, color: 'text.secondary' }}>
                  Last Login
                </Typography>
                <Typography variant="body2">
                  {new Date(user.lastLogin).toLocaleString()}
                </Typography>
              </>
            )}
          </Box>

          <form onSubmit={handleSubmit}>
            {/* Active Status Toggle */}
            <Box sx={{ mb: 3 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={handleInputChange('isActive')}
                    color="primary"
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography>Active Account</Typography>
                    <Chip
                      label={formData.isActive ? 'Active' : 'Inactive'}
                      size="small"
                      color={formData.isActive ? 'success' : 'default'}
                      sx={{ ml: 1 }}
                    />
                  </Box>
                }
              />
              {!formData.isActive && (
                <Alert severity="warning" sx={{ mt: 1 }}>
                  Inactive users cannot log in or access the system.
                </Alert>
              )}
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* Name Fields */}
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField
                label="First Name"
                value={formData.firstName}
                onChange={handleInputChange('firstName')}
                error={!!errors.firstName}
                helperText={errors.firstName}
                fullWidth
                required
              />
              <TextField
                label="Last Name"
                value={formData.lastName}
                onChange={handleInputChange('lastName')}
                error={!!errors.lastName}
                helperText={errors.lastName}
                fullWidth
                required
              />
            </Box>

            {/* Email */}
            <TextField
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={handleInputChange('email')}
              error={!!errors.email}
              helperText={errors.email}
              fullWidth
              required
              sx={{ mb: 2 }}
            />

            {/* Role Selection */}
            <FormControl fullWidth required error={!!errors.role} sx={{ mb: 2 }}>
              <InputLabel>Role</InputLabel>
              <Select
                value={formData.role}
                onChange={handleRoleChange}
                label="Role"
                renderValue={(value) => {
                  const role = ROLE_OPTIONS.find((r) => r.value === value);
                  return role ? (
                    <Chip
                      label={role.label}
                      size="small"
                      sx={{
                        backgroundColor: `${role.color}20`,
                        color: role.color,
                        border: `1px solid ${role.color}`,
                        fontWeight: 500,
                      }}
                    />
                  ) : null;
                }}
              >
                {ROLE_OPTIONS.map((role) => (
                  <MenuItem key={role.value} value={role.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          backgroundColor: role.color,
                        }}
                      />
                      {role.label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Department */}
            <FormControl fullWidth required error={!!errors.department} sx={{ mb: 3 }}>
              <InputLabel>Department</InputLabel>
              <Select
                value={formData.department}
                onChange={handleDepartmentChange}
                label="Department"
              >
                {DEPARTMENT_OPTIONS.map((dept) => (
                  <MenuItem key={dept} value={dept}>
                    {dept}
                  </MenuItem>
                ))}
              </Select>
              {errors.department && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                  {errors.department}
                </Typography>
              )}
            </FormControl>

            {/* Role Change Warning */}
            {formData.role !== user.role && (
              <Alert severity="info" sx={{ mb: 2 }}>
                Role change will take effect immediately. The user may need to log out and back in to see all permission changes.
              </Alert>
            )}
          </form>
        </Box>

        {/* Footer Actions */}
        <Box
          sx={{
            p: 3,
            borderTop: `1px solid ${DERTOUR_COLORS.grey300}`,
            display: 'flex',
            gap: 2,
            justifyContent: 'flex-end',
          }}
        >
          <Button variant="outlined" onClick={handleClose} disabled={isPending}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={isPending || !hasChanges}
            startIcon={isPending ? undefined : <SaveIcon />}
          >
            {isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
};

export default EditUserDrawer;
