/**
 * ConfigurationPage.tsx - DERTOUR Configuration Sub-Panel
 * 
 * Displays configuration entries with:
 * - Table showing Key, Value, Description, Category, Last Updated
 * - Inline edit mode per row (Save/Cancel)
 * - Add Configuration drawer
 * - Delete with confirmation
 */

import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  IconButton,
  TextField,
  Tooltip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { Configuration } from '../../types/api.types';
import {
  getConfigurations,
  updateConfiguration,
  deleteConfiguration,
} from '../../services/admin.api';
import { useNotification } from '../../store/notificationStore';
import { AddConfigDrawer } from '../../components/admin/AddConfigDrawer';
import { DERTOUR_COLORS } from '../../config/theme';

// Category chip colors
const CATEGORY_COLORS: Record<string, { bg: string; color: string }> = {
  'Risk Management': { bg: '#FFEBEE', color: '#C62828' },
  'Health Score': { bg: '#E8F5E9', color: '#2E7D32' },
  'Workflow': { bg: '#E3F2FD', color: '#1565C0' },
  'Thresholds': { bg: '#FFF3E0', color: '#E65100' },
  'Branding': { bg: '#F3E5F5', color: '#7B1FA2' },
  'Currency': { bg: '#E0F2F1', color: '#00695C' },
};

interface EditingRow {
  id: string;
  value: string;
}

export const ConfigurationPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { showNotification } = useNotification();
  
  // State
  const [editingRow, setEditingRow] = useState<EditingRow | null>(null);
  const [addDrawerOpen, setAddDrawerOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<Configuration | null>(null);

  // Fetch configurations
  const { data: configurations, isLoading, error } = useQuery({
    queryKey: ['configurations'],
    queryFn: getConfigurations,
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, value }: { id: string; value: string }) =>
      updateConfiguration(id, { value }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['configurations'] });
      showNotification('Configuration updated successfully', 'success');
      setEditingRow(null);
    },
    onError: (error: Error) => {
      showNotification(`Failed to update configuration: ${error.message}`, 'error');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteConfiguration,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['configurations'] });
      showNotification('Configuration deleted successfully', 'success');
      setDeleteDialogOpen(false);
      setSelectedConfig(null);
    },
    onError: (error: Error) => {
      showNotification(`Failed to delete configuration: ${error.message}`, 'error');
    },
  });

  // Handle edit start
  const handleEditStart = useCallback((config: Configuration) => {
    setEditingRow({ id: config.id, value: config.value });
  }, []);

  // Handle edit cancel
  const handleEditCancel = useCallback(() => {
    setEditingRow(null);
  }, []);

  // Handle edit save
  const handleEditSave = useCallback(() => {
    if (editingRow) {
      updateMutation.mutate({ id: editingRow.id, value: editingRow.value });
    }
  }, [editingRow, updateMutation]);

  // Handle delete click
  const handleDeleteClick = useCallback((config: Configuration) => {
    setSelectedConfig(config);
    setDeleteDialogOpen(true);
  }, []);

  // Handle delete confirm
  const handleDeleteConfirm = useCallback(() => {
    if (selectedConfig) {
      deleteMutation.mutate(selectedConfig.id);
    }
  }, [selectedConfig, deleteMutation]);

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Failed to load configurations: {(error as Error).message}
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
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600, color: DERTOUR_COLORS.primary }}>
            DERTOUR Configuration
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Manage DERTOUR-specific terminology, thresholds, and business rules.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setAddDrawerOpen(true)}
          sx={{
            backgroundColor: DERTOUR_COLORS.primary,
            '&:hover': { backgroundColor: DERTOUR_COLORS.secondary },
          }}
        >
          Add Configuration
        </Button>
      </Box>

      {/* Configuration Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: DERTOUR_COLORS.grey[100] }}>
              <TableCell sx={{ fontWeight: 600 }}>Key</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Value</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Last Updated</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="right">
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : configurations?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">
                    No configurations found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              configurations?.map((config) => (
                <TableRow key={config.id}>
                  <TableCell sx={{ fontFamily: 'monospace', fontWeight: 500 }}>
                    {config.key}
                  </TableCell>
                  <TableCell>
                    {editingRow?.id === config.id ? (
                      <TextField
                        size="small"
                        value={editingRow.value}
                        onChange={(e) =>
                          setEditingRow({ ...editingRow, value: e.target.value })
                        }
                        autoFocus
                        fullWidth
                      />
                    ) : (
                      <Typography
                        sx={{
                          fontFamily: 'monospace',
                          maxWidth: 200,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {config.value}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>{config.description}</TableCell>
                  <TableCell>
                    <Chip
                      label={config.category}
                      size="small"
                      sx={{
                        backgroundColor:
                          CATEGORY_COLORS[config.category]?.bg || DERTOUR_COLORS.grey[300],
                        color:
                          CATEGORY_COLORS[config.category]?.color || DERTOUR_COLORS.text.primary,
                        fontWeight: 500,
                        fontSize: '0.75rem',
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(config.updatedAt).toLocaleString()}
                  </TableCell>
                  <TableCell align="right">
                    {editingRow?.id === config.id ? (
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Save">
                          <IconButton
                            size="small"
                            onClick={handleEditSave}
                            disabled={updateMutation.isPending}
                            sx={{ color: DERTOUR_COLORS.success }}
                          >
                            <SaveIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Cancel">
                          <IconButton
                            size="small"
                            onClick={handleEditCancel}
                            disabled={updateMutation.isPending}
                          >
                            <CancelIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    ) : (
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => handleEditStart(config)}
                            sx={{ color: DERTOUR_COLORS.primary }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteClick(config)}
                            sx={{ color: DERTOUR_COLORS.error }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add Configuration Drawer */}
      <AddConfigDrawer
        open={addDrawerOpen}
        onClose={() => setAddDrawerOpen(false)}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the configuration &quot;
            <strong>{selectedConfig?.key}</strong>&quot;?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ConfigurationPage;
