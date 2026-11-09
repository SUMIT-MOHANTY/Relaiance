/**
 * AddConfigDrawer.tsx
 * 
 * Right-side drawer for adding new configuration entries.
 * Includes form validation for key, value, description, and category.
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
  Chip,
} from '@mui/material';
import {
  Close as CloseIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { DERTOUR_COLORS } from '../../config/theme';

interface AddConfigDrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { key: string; value: string; description: string; category: string }) => void;
}

interface FormData {
  key: string;
  value: string;
  description: string;
  category: string;
}

interface FormErrors {
  key?: string;
  value?: string;
  description?: string;
  category?: string;
}

const CATEGORY_OPTIONS = [
  { value: 'SYSTEM', label: 'System', description: 'Core system settings' },
  { value: 'RISK', label: 'Risk', description: 'Risk management thresholds' },
  { value: 'HEALTH', label: 'Health', description: 'Health score configuration' },
  { value: 'WORKFLOW', label: 'Workflow', description: 'Workflow and process settings' },
  { value: 'BRANDING', label: 'Branding', description: 'UI and branding settings' },
];

export const AddConfigDrawer: React.FC<AddConfigDrawerProps> = ({
  open,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<FormData>({
    key: '',
    value: '',
    description: '',
    category: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setFormData({
      key: '',
      value: '',
      description: '',
      category: '',
    });
    setErrors({});
    setIsSubmitting(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.key.trim()) {
      newErrors.key = 'Configuration key is required';
    } else if (!/^[A-Z][A-Z_0-9]*$/.test(formData.key)) {
      newErrors.key = 'Key must be uppercase with underscores (e.g., MY_CONFIG_KEY)';
    }
    
    if (!formData.value.trim()) {
      newErrors.value = 'Value is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitting(true);
      onSubmit({
        key: formData.key.trim(),
        value: formData.value.trim(),
        description: formData.description.trim(),
        category: formData.category,
      });
      handleClose();
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

  const handleCategoryChange = (e: React.ChangeEvent<{ value: unknown }>) => {
    setFormData((prev) => ({ ...prev, category: e.target.value as string }));
    if (errors.category) {
      setErrors((prev) => ({ ...prev, category: undefined }));
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      SYSTEM: DERTOUR_COLORS.primary,
      RISK: DERTOUR_COLORS.error,
      HEALTH: DERTOUR_COLORS.success,
      WORKFLOW: DERTOUR_COLORS.secondary,
      BRANDING: '#9C27B0',
    };
    return colors[category] || DERTOUR_COLORS.grey500;
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
            <AddIcon sx={{ color: DERTOUR_COLORS.primary }} />
            <Typography variant="h6" sx={{ fontWeight: 600, color: DERTOUR_COLORS.primary }}>
              Add Configuration
            </Typography>
          </Box>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
          <form onSubmit={handleSubmit}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Add a new configuration setting to the system. Configuration keys should follow the UPPER_SNAKE_CASE convention.
            </Typography>

            {/* Configuration Key */}
            <TextField
              label="Configuration Key"
              value={formData.key}
              onChange={handleInputChange('key')}
              error={!!errors.key}
              helperText={errors.key || 'Example: MY_CONFIG_KEY'}
              fullWidth
              required
              autoFocus
              placeholder="ENTER_KEY_NAME"
              sx={{
                mb: 2,
                '& .MuiInputBase-input': {
                  fontFamily: 'monospace',
                  textTransform: 'uppercase',
                },
              }}
            />

            {/* Value */}
            <TextField
              label="Value"
              value={formData.value}
              onChange={handleInputChange('value')}
              error={!!errors.value}
              helperText={errors.value}
              fullWidth
              required
              multiline
              rows={3}
              sx={{ mb: 2 }}
            />

            {/* Description */}
            <TextField
              label="Description"
              value={formData.description}
              onChange={handleInputChange('description')}
              error={!!errors.description}
              helperText={errors.description}
              fullWidth
              required
              multiline
              rows={2}
              sx={{ mb: 2 }}
            />

            {/* Category */}
            <FormControl fullWidth required error={!!errors.category} sx={{ mb: 3 }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={formData.category}
                onChange={handleCategoryChange}
                label="Category"
                renderValue={(value) => {
                  const category = CATEGORY_OPTIONS.find((c) => c.value === value);
                  return category ? (
                    <Chip
                      label={category.label}
                      size="small"
                      sx={{
                        backgroundColor: `${getCategoryColor(category.value)}20`,
                        color: getCategoryColor(category.value),
                        border: `1px solid ${getCategoryColor(category.value)}`,
                        fontWeight: 500,
                      }}
                    />
                  ) : null;
                }}
              >
                {CATEGORY_OPTIONS.map((category) => (
                  <MenuItem key={category.value} value={category.value}>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            backgroundColor: getCategoryColor(category.value),
                          }}
                        />
                        <Typography fontWeight={500}>{category.label}</Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 2.5 }}>
                        {category.description}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
              {errors.category && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                  {errors.category}
                </Typography>
              )}
            </FormControl>

            <Divider sx={{ my: 3 }} />

            {/* Preview */}
            {formData.key && (
              <Box sx={{ mb: 3, p: 2, bgcolor: DERTOUR_COLORS.grey100, borderRadius: 1 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>
                  Preview
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 0.5 }}>
                  {formData.key || 'KEY_NAME'}={formData.value || 'value'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formData.description || 'Configuration description'}
                </Typography>
              </Box>
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
          <Button variant="outlined" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={isSubmitting}
            startIcon={isSubmitting ? undefined : <AddIcon />}
          >
            {isSubmitting ? 'Adding...' : 'Add Configuration'}
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
};

export default AddConfigDrawer;
