/**
 * MilestoneUpdateTab.tsx - Milestone Management Tab Component
 * 
 * Table with inline status update dropdown and Save button per row.
 * Calls PUT endpoint on save with success notification.
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
  Select,
  MenuItem,
  Button,
  Chip,
  Typography,
  Box,
  CircularProgress,
} from '@mui/material';
import { Milestone, MilestoneStatus } from '../../types/api.types';
import { STATUS_COLORS } from '../../config/theme';
import { useNotification } from '../../store/notificationStore';

interface MilestoneUpdateTabProps {
  milestones: Milestone[];
  initiativeId: string;
}

interface MilestoneUpdate {
  [milestoneId: string]: MilestoneStatus;
}

// Mock API call for updating milestone status
const updateMilestoneStatus = async (
  initiativeId: string,
  milestoneId: string,
  status: MilestoneStatus
): Promise<{ success: boolean; message: string }> => {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: 'Milestone status updated successfully',
      });
    }, 500);
  });
};

export const MilestoneUpdateTab: React.FC<MilestoneUpdateTabProps> = ({
  milestones,
  initiativeId,
}) => {
  const { showSuccess, showError } = useNotification();
  const [localUpdates, setLocalUpdates] = useState<MilestoneUpdate>({});
  const [saving, setSaving] = useState<Set<string>>(new Set());

  const handleStatusChange = (milestoneId: string, newStatus: MilestoneStatus) => {
    setLocalUpdates((prev) => ({
      ...prev,
      [milestoneId]: newStatus,
    }));
  };

  const handleSave = async (milestone: Milestone) => {
    const newStatus = localUpdates[milestone.id];
    if (!newStatus || newStatus === milestone.status) {
      return;
    }

    setSaving((prev) => new Set(prev).add(milestone.id));

    try {
      const result = await updateMilestoneStatus(initiativeId, milestone.id, newStatus);
      
      if (result.success) {
        showSuccess(`Milestone "${milestone.title}" status updated to ${newStatus}`);
        // Clear the local update for this milestone
        setLocalUpdates((prev) => {
          const updated = { ...prev };
          delete updated[milestone.id];
          return updated;
        });
      } else {
        showError(result.message || 'Failed to update milestone status');
      }
    } catch (err) {
      showError('An error occurred while updating milestone status');
    } finally {
      setSaving((prev) => {
        const updated = new Set(prev);
        updated.delete(milestone.id);
        return updated;
      });
    }
  };

  const getStatusColor = (status: MilestoneStatus): string => {
    switch (status) {
      case MilestoneStatus.COMPLETED:
        return STATUS_COLORS.COMPLETED;
      case MilestoneStatus.IN_PROGRESS:
        return STATUS_COLORS.ACTIVE;
      case MilestoneStatus.BLOCKED:
        return STATUS_COLORS.BLOCKED;
      case MilestoneStatus.OVERDUE:
        return STATUS_COLORS.CANCELLED;
      default:
        return STATUS_COLORS.NOT_STARTED;
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Milestones
      </Typography>
      
      <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: '#F5F5F5' }}>
              <TableCell sx={{ fontWeight: 600 }}>Title</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Due Date</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Current Status</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Update Status</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {milestones.map((milestone) => {
              const hasUpdate = localUpdates[milestone.id] !== undefined;
              const isSaving = saving.has(milestone.id);
              const currentStatus = localUpdates[milestone.id] || milestone.status;

              return (
                <TableRow key={milestone.id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {milestone.title}
                    </Typography>
                    {milestone.description && (
                      <Typography variant="caption" color="text.secondary">
                        {milestone.description}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>{formatDate(milestone.dueDate)}</TableCell>
                  <TableCell>
                    <Chip
                      label={milestone.status}
                      size="small"
                      sx={{
                        backgroundColor: getStatusColor(milestone.status),
                        color: '#fff',
                        fontWeight: 500,
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Select
                      value={currentStatus}
                      onChange={(e) => handleStatusChange(milestone.id, e.target.value as MilestoneStatus)}
                      size="small"
                      sx={{ minWidth: 140 }}
                      disabled={isSaving}
                    >
                      {Object.values(MilestoneStatus).map((status) => (
                        <MenuItem key={status} value={status}>
                          {status.replace('_', ' ')}
                        </MenuItem>
                      ))}
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      size="small"
                      disabled={!hasUpdate || isSaving}
                      onClick={() => handleSave(milestone)}
                      sx={{
                        textTransform: 'none',
                        backgroundColor: '#00A8A8',
                        '&:hover': { backgroundColor: '#007676' },
                        '&:disabled': { backgroundColor: '#E0E0E0' },
                      }}
                    >
                      {isSaving ? (
                        <CircularProgress size={16} sx={{ color: '#fff' }} />
                      ) : (
                        'Save'
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {milestones.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="text.secondary">No milestones found for this initiative.</Typography>
        </Box>
      )}
    </Box>
  );
};

export default MilestoneUpdateTab;
