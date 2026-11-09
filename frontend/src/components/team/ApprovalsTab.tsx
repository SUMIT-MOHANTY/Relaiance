/**
 * ApprovalsTab.tsx - Agent Actions Approvals Tab Component
 * 
 * Lists PENDING AgentActions with plan preview, confidence score badge,
 * and 'Submit for Approval' button.
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  LinearProgress,
  Divider,
  CircularProgress,
} from '@mui/material';
import { Send, CheckCircle } from '@mui/icons-material';
import { AgentAction, AgentActionStatus } from '../../types/api.types';
import { agentActionApi } from '../../services/agent.api';
import { useNotification } from '../../store/notificationStore';

interface ApprovalsTabProps {
  initiativeId: string;
}

export const ApprovalsTab: React.FC<ApprovalsTabProps> = ({ initiativeId }) => {
  const { showSuccess, showError } = useNotification();
  const [actions, setActions] = useState<AgentAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadActions();
  }, [initiativeId]);

  const loadActions = async () => {
    try {
      setLoading(true);
      const response = await agentActionApi.getAgentActions({
        initiativeId,
      });
      if (response.success && response.data) {
        // Filter to show all non-executed actions (PENDING, APPROVED, REJECTED)
        setActions(response.data.filter(a => a.status !== AgentActionStatus.EXECUTED));
      }
    } catch (err) {
      showError('Failed to load agent actions');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitForApproval = async (action: AgentAction) => {
    setSubmitting((prev) => new Set(prev).add(action.id));

    try {
      const response = await agentActionApi.submitForApproval(action.id);
      if (response.success) {
        showSuccess('Action submitted for approval and Executive notified');
        // Update local state
        setActions((prev) =>
          prev.map((a) =>
            a.id === action.id ? { ...a, status: AgentActionStatus.PENDING } : a
          )
        );
      } else {
        showError(response.message || 'Failed to submit action');
      }
    } catch (err) {
      showError('An error occurred while submitting action');
    } finally {
      setSubmitting((prev) => {
        const updated = new Set(prev);
        updated.delete(action.id);
        return updated;
      });
    }
  };

  const getConfidenceColor = (score: number): string => {
    if (score >= 0.8) return '#388E3C';
    if (score >= 0.6) return '#F57C00';
    return '#D32F2F';
  };

  const getStatusChip = (status: AgentActionStatus) => {
    const config = {
      [AgentActionStatus.PENDING]: { color: '#F57C00', bg: '#FFF3E0', label: 'Pending Review' },
      [AgentActionStatus.APPROVED]: { color: '#388E3C', bg: '#E8F5E9', label: 'Approved' },
      [AgentActionStatus.REJECTED]: { color: '#D32F2F', bg: '#FFEBEE', label: 'Rejected' },
      [AgentActionStatus.EXECUTED]: { color: '#0288D1', bg: '#E3F2FD', label: 'Executed' },
    };
    const style = config[status];
    return (
      <Chip
        label={style.label}
        size="small"
        sx={{
          backgroundColor: style.bg,
          color: style.color,
          fontWeight: 500,
          border: `1px solid ${style.color}`,
        }}
      />
    );
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  const pendingActions = actions.filter((a) => a.status === AgentActionStatus.PENDING);
  const otherActions = actions.filter((a) => a.status !== AgentActionStatus.PENDING);

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Agent Actions for Approval
      </Typography>

      {/* Pending Actions Section */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ mb: 1, color: '#616161' }}>
          Pending Submission ({pendingActions.length})
        </Typography>
        {pendingActions.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
            No pending actions to submit.
          </Typography>
        ) : (
          pendingActions.map((action) => (
            <Card key={action.id} variant="outlined" sx={{ mb: 2, borderRadius: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {action.actionType.replace('_', ' ')}
                  </Typography>
                  {getStatusChip(action.status)}
                </Box>

                <Typography variant="body2" sx={{ mb: 2 }}>
                  {action.description}
                </Typography>

                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">
                      Confidence Score
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                      {Math.round(action.confidenceScore * 100)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={action.confidenceScore * 100}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: '#E0E0E0',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: getConfidenceColor(action.confidenceScore),
                        borderRadius: 3,
                      },
                    }}
                  />
                </Box>

                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                  Created: {formatDate(action.createdAt)}
                </Typography>

                <Button
                  variant="contained"
                  size="small"
                  startIcon={submitting.has(action.id) ? <CircularProgress size={16} /> : <Send />}
                  disabled={submitting.has(action.id)}
                  onClick={() => handleSubmitForApproval(action)}
                  sx={{
                    textTransform: 'none',
                    backgroundColor: '#00A8A8',
                    '&:hover': { backgroundColor: '#007676' },
                  }}
                >
                  Submit for Approval
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </Box>

      {/* Other Actions Section */}
      {otherActions.length > 0 && (
        <>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle2" sx={{ mb: 1, color: '#616161' }}>
            Submitted Actions ({otherActions.length})
          </Typography>
          {otherActions.map((action) => (
            <Card key={action.id} variant="outlined" sx={{ mb: 2, borderRadius: 2, opacity: 0.8 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {action.actionType.replace('_', ' ')}
                  </Typography>
                  {getStatusChip(action.status)}
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {action.description.substring(0, 100)}...
                </Typography>
              </CardContent>
            </Card>
          ))}
        </>
      )}
    </Box>
  );
};

export default ApprovalsTab;
