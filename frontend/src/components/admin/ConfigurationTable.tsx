/**
 * ConfigurationTable.tsx
 * 
 * Table component for managing system configuration settings.
 * Supports inline editing with save/cancel buttons per row.
 */

import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  TextField,
  Button,
  Box,
  Typography,
  Tooltip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { Configuration } from '../../types/api.types';
import { DERTOUR_COLORS } from '../../config/theme';

interface ConfigurationTableProps {
  configurations: Configuration[];
  loading?: boolean;
  onEdit: (config: Configuration, newValue: string) => void;
  onDelete: (config: Configuration) => void;
}

interface EditingState {
  id: string;
  value: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  SYSTEM: DERTOUR_COLORS.primary,
  RISK: DERTOUR_COLORS.error,
  HEALTH: DERTOUR_COLORS.success,
  WORKFLOW: DERTOUR_COLORS.secondary,
  BRANDING: '#9C27B0',
  DEFAULT: DERTOUR_COLORS.grey500,
};

export const ConfigurationTable: React.FC<ConfigurationTableProps> = ({
  configurations,
  loading = false,
  onEdit,
  onDelete,
}) => {
  const [editing, setEditing] = useState<EditingState | null>(null);

  const handleStartEdit = (config: Configuration) => {
    setEditing({ id: config.id, value: config.value });
  };

  const handleCancelEdit = () => {
    setEditing(null);
  };

  const handleSaveEdit = (config: Configuration) => {
    if (editing && editing.value !== config.value) {
      onEdit(config, editing.value);
    }
    setEditing(null);
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editing) {
      setEditing({ ...editing, value: e.target.value });
    }
  };

  const formatDate = (dateString: string | Date | undefined) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getCategoryColor = (category: string) => {
    return CATEGORY_COLORS[category.toUpperCase()] || CATEGORY_COLORS.DEFAULT;
  };

  if (loading) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">Loading configurations...</Typography>
      </Box>
    );
  }

  if (configurations.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">No configurations found</Typography>
      </Box>
    );
  }

  return (
    <TableContainer component={Paper} sx={{ boxShadow: 'none', border: `1px solid ${DERTOUR_COLORS.grey300}` }}>
      <Table size="medium">
        <TableHead>
          <TableRow sx={{ backgroundColor: DERTOUR_COLORS.grey100 }}>
            <TableCell sx={{ fontWeight: 600, color: DERTOUR_COLORS.primary }}>Key</TableCell>
            <TableCell sx={{ fontWeight: 600, color: DERTOUR_COLORS.primary }}>Value</TableCell>
            <TableCell sx={{ fontWeight: 600, color: DERTOUR_COLORS.primary }}>Description</TableCell>
            <TableCell sx={{ fontWeight: 600, color: DERTOUR_COLORS.primary }}>Category</TableCell>
            <TableCell sx={{ fontWeight: 600, color: DERTOUR_COLORS.primary }}>Last Updated</TableCell>
            <TableCell sx={{ fontWeight: 600, color: DERTOUR_COLORS.primary, width: 120 }} align="center">
              Actions
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {configurations.map((config) => {
            const isEditing = editing?.id === config.id;
            
            return (
              <TableRow
                key={config.id}
                sx={{
                  '&:hover': { backgroundColor: `${DERTOUR_COLORS.primary}04` },
                  backgroundColor: isEditing ? `${DERTOUR_COLORS.primary}08` : 'inherit',
                }}
              >
                <TableCell>
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: 'monospace',
                      fontWeight: 500,
                      color: DERTOUR_COLORS.primary,
                    }}
                  >
                    {config.key}
                  </Typography>
                </TableCell>
                <TableCell>
                  {isEditing ? (
                    <TextField
                      size="small"
                      value={editing.value}
                      onChange={handleValueChange}
                      autoFocus
                      fullWidth
                      sx={{ minWidth: 200 }}
                    />
                  ) : (
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: 'monospace',
                        bgcolor: DERTOUR_COLORS.grey100,
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        display: 'inline-block',
                        maxWidth: 300,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                      title={config.value}
                    >
                      {config.value}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {config.description}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={config.category}
                    size="small"
                    sx={{
                      backgroundColor: `${getCategoryColor(config.category)}15`,
                      color: getCategoryColor(config.category),
                      border: `1px solid ${getCategoryColor(config.category)}40`,
                      fontWeight: 500,
                      fontSize: '0.75rem',
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(config.updatedAt)}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  {isEditing ? (
                    <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                      <Tooltip title="Save">
                        <IconButton
                          size="small"
                          onClick={() => handleSaveEdit(config)}
                          sx={{ color: DERTOUR_COLORS.success }}
                        >
                          <SaveIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Cancel">
                        <IconButton
                          size="small"
                          onClick={handleCancelEdit}
                          sx={{ color: DERTOUR_COLORS.grey500 }}
                        >
                          <CancelIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => handleStartEdit(config)}
                          sx={{ color: DERTOUR_COLORS.primary }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={() => onDelete(config)}
                          sx={{ color: DERTOUR_COLORS.error }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ConfigurationTable;
