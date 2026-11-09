/**
 * CreateUserDrawer.tsx
 * 
 * Right-side drawer for inviting new users to the system.
 * Includes form validation, role selection, and temporary password generation display.
 */

import React, { useState } from 'react';
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
  Alert,
  Chip,
  Tooltip,
  InputAdornment,
} from '@mui/material';
import {
  Close as CloseIcon,
  PersonAdd as PersonAddIcon,
  ContentCopy as ContentCopyIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNotification } from '../../store/notificationStore';
import { inviteUser } from '../../services/admin.api';
import { UserRole } from '../../types/api.types';
import { DERTOUR_COLORS } from '../../config/theme';

interface CreateUserDrawerProps {
  open: boolean;
  onClose: () => void;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  department: string;
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

export const CreateUserDrawer: React.FC<CreateUserDrawerProps> = ({
  open,
  onClose,
}) => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotification();
  
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    role: 'TEAM_MEMBER',
    department: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      role: 'TEAM_MEMBER',
      department: '',
    });
    setErrors({});
    setGeneratedPassword(null);
    setShowPassword(false);
    setCopied(false);
  };

  const handleClose = () => {
    resetForm();
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

  const createUserMutation = useMutation({
    mutationFn: inviteUser,
    onSuccess: (data) => {
      showSuccess('User invited successfully');
      setGeneratedPassword(data.tempPassword || 'TempPass123!');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: Error) => {
      showError(error.message || 'Failed to invite user');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      createUserMutation.mutate({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        role: formData.role,
        department: formData.department,
      });
    }
  };

  const handleCopyPassword = () => {
    if (generatedPassword) {
      navigator.clipboard.writeText(generatedPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleInputChange = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleRoleChange = (e: React.ChangeEvent<{ value: unknown }>) => {
    setFormData((prev) => ({ ...prev, role: e.target.value as UserRole }));
    if (errors.role) {
      setErrors((prev) => ({ ...prev, role: undefined }));
    }
  };

  const handleDepartmentChange = (e: React.ChangeEvent<{ value: unknown }>) => {
    setFormData((prev) => ({ ...prev, department: e.target.value as string }));
    if (errors.department) {
      setErrors((prev) => ({ ...prev, department: undefined }));
    }
  };

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
            <PersonAddIcon sx={{ color: DERTOUR_COLORS.primary }} />
            <Typography variant="h6" sx={{ fontWeight: 600, color: DERTOUR_COLORS.primary }}>
              Invite User
            </Typography>
          </Box>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
          {generatedPassword ? (
            // Success State - Show generated password
            <Box>
              <Alert severity="success" sx={{ mb: 3 }}>
                User created successfully! Please share the temporary password with the user.
              </Alert>
              
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 500 }}>
                Temporary Password
              </Typography>
              
              <Box
                sx={{
                  p: 2,
                  bgcolor: DERTOUR_COLORS.grey100,
                  borderRadius: 1,
                  border: `1px solid ${DERTOUR_COLORS.grey300}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                <TextField
                  fullWidth
                  value={generatedPassword}
                  type={showPassword ? 'text' : 'password'}
                  InputProps={{
                    readOnly: true,
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          size="small"
                        >
                          {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiInputBase-input': {
                      fontFamily: 'monospace',
                      fontSize: '1rem',
                    },
                  }}
                />
                <Tooltip title={copied ? 'Copied!' : 'Copy to clipboard'}>
                  <IconButton
                    onClick={handleCopyPassword}
                    color={copied ? 'success' : 'primary'}
                    sx={{
                      bgcolor: copied ? 'success.light' : 'primary.light',
                      '&:hover': {
                        bgcolor: copied ? 'success.main' : 'primary.main',
                      },
                    }}
                  >
                    <ContentCopyIcon />
                  </IconButton>
                </Tooltip>
              </Box>

              <Typography variant="caption" sx={{ mt: 2, display: 'block', color: 'text.secondary' }}>
                The user will be prompted to change this password on first login.
              </Typography>

              <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={resetForm}
                  sx={{ flex: 1 }}
                >
                  Invite Another User
                </Button>
                <Button
                  variant="contained"
                  onClick={handleClose}
                  sx={{ flex: 1 }}
                >
                  Done
                </Button>
              </Box>
            </Box>
          ) : (
            // Form State
            <form onSubmit={handleSubmit}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Fill in the details below to invite a new user to the DERTOUR Portfolio Control Tower.
              </Typography>

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
                  autoFocus
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

              <Divider sx={{ my: 3 }} />

              {/* Role Info */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>
                  Role Permissions Preview
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formData.role === 'SYSTEM_ADMIN' &&
                    'Full system access including user management, configuration, and audit logs.'}
                  {formData.role === 'EXECUTIVE' &&
                    'View executive dashboards, reports, and escalated risks. Cannot modify data.'}
                  {formData.role === 'FINANCE_USER' &&
                    'Manage portfolio initiatives, track budgets, and review agent actions.'}
                  {formData.role === 'TEAM_MEMBER' &&
                    'Update initiative progress, upload evidence, and manage assigned work.'}
                </Typography>
              </Box>
            </form>
          )}
        </Box>

        {/* Footer Actions */}
        {!generatedPassword && (
          <Box
            sx={{
              p: 3,
              borderTop: `1px solid ${DERTOUR_COLORS.grey300}`,
              display: 'flex',
              gap: 2,
              justifyContent: 'flex-end',
            }}
          >
            <Button variant="outlined" onClick={handleClose} disabled={createUserMutation.isPending}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={createUserMutation.isPending}
              startIcon={createUserMutation.isPending ? undefined : <PersonAddIcon />}
            >
              {createUserMutation.isPending ? 'Creating...' : 'Invite User'}
            </Button>
          </Box>
        )}
      </Box>
    </Drawer>
  );
};

export default CreateUserDrawer;
