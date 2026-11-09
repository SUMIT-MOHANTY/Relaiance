/**
 * CreateAgentActionDrawer.tsx
 * 
 * Right-side drawer form for creating new agent actions.
 * Fields: Initiative (select), Action Type, Plan (textarea), Evidence (textarea), Confidence Score (0-100)
 */

import React, { useState } from 'react';
import {
  Drawer,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Divider,
  MenuItem,
  Slider,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

import { useNotificationStore } from '../../store/notificationStore';
import { agentActionApi } from '../../services/agent.api';
import { AgentActionType } from '../../types/api.types';

interface CreateAgentActionDrawerProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ACTION_TYPES: { value: AgentActionType; label: string }[] = [
  { value: 'RISK_MITIGATION', label: 'Risk Mitigation' },
  { value: 'MILESTONE_ACCELERATION', label: 'Milestone Acceleration' },
  { value: 'BUDGET_REALLOCATION', label: 'Budget Reallocation' },
  { value: 'STAKEHOLDER_ESCALATION', label: 'Stakeholder Escalation' },
];

const INITIATIVES = [
  { id: 'INI-001', name: 'Digital Finance Transformation' },
  { id: 'INI-003', name: 'Group ERP Rollout' },
  { id: 'INI-007', name: 'Customer Portal Enhancement' },
];

export const CreateAgentActionDrawer: React.FC<CreateAgentActionDrawerProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const { addNotification } = useNotificationStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    initiativeId: '',
    actionType: '' as AgentActionType | '',
    plan: '',
    evidence: '',
    confidenceScore: 75,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const initiative = INITIATIVES.find((i) => i.id === formData.initiativeId);
      
      await agentActionApi.createAgentAction({
        initiativeId: formData.initiativeId,
        initiativeName: initiative?.name || '',
        actionType: formData.actionType as AgentActionType,
        plan: formData.plan,
        evidence: formData.evidence,
        confidenceScore: formData.confidenceScore / 100,
      });

      addNotification({
        type: 'success',
        message: 'Agent action created successfully',
      });

      // Reset form
      setFormData({
        initiativeId: '',
        actionType: '',
        plan: '',
        evidence: '',
        confidenceScore: 75,
      });

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create agent action');
      addNotification({
        type: 'error',
        message: 'Failed to create agent action',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValid =
    formData.initiativeId &&
    formData.actionType &&
    formData.plan.trim().length > 0 &&
    formData.evidence.trim().length > 0;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: { xs: '100%', sm: 500 } },
      }}
    >
      <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" fontWeight={600}>
            Create Agent Action
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Form */}
        <Box component="form" onSubmit={handleSubmit} sx={{ flex: 1, overflow: 'auto' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Initiative Select */}
            <TextField
              select
              required
              fullWidth
              label="Initiative"
              value={formData.initiativeId}
              onChange={(e) => setFormData({ ...formData, initiativeId: e.target.value })}
              disabled={isSubmitting}
            >
              {INITIATIVES.map((initiative) => (
                <MenuItem key={initiative.id} value={initiative.id}>
                  {initiative.name}
                </MenuItem>
              ))}
            </TextField>

            {/* Action Type Select */}
            <TextField
              select
              required
              fullWidth
              label="Action Type"
              value={formData.actionType}
              onChange={(e) => setFormData({ ...formData, actionType: e.target.value as AgentActionType })}
              disabled={isSubmitting}
            >
              {ACTION_TYPES.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </TextField>

            {/* Plan Textarea */}
            <TextField
              required
              fullWidth
              multiline
              rows={4}
              label="Plan"
              placeholder="Describe the recommended action plan..."
              value={formData.plan}
              onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
              disabled={isSubmitting}
              helperText={`${formData.plan.length} characters`}
            />

            {/* Evidence Textarea */}
            <TextField
              required
              fullWidth
              multiline
              rows={3}
              label="Evidence"
              placeholder="Provide supporting evidence for this recommendation..."
              value={formData.evidence}
              onChange={(e) => setFormData({ ...formData, evidence: e.target.value })}
              disabled={isSubmitting}
              helperText={`${formData.evidence.length} characters`}
            />

            {/* Confidence Score Slider */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Confidence Score: {formData.confidenceScore}%
              </Typography>
              <Slider
                value={formData.confidenceScore}
                onChange={(_, value) => setFormData({ ...formData, confidenceScore: value as number })}
                min={0}
                max={100}
                marks={[
                  { value: 0, label: '0%' },
                  { value: 50, label: '50%' },
                  { value: 100, label: '100%' },
                ]}
                valueLabelDisplay="auto"
                disabled={isSubmitting}
                sx={{
                  '& .MuiSlider-track': {
                    background: `linear-gradient(to right, 
                      ${formData.confidenceScore < 60 ? '#D32F2F' : formData.confidenceScore < 80 ? '#F57C00' : '#388E3C'} 
                      ${formData.confidenceScore}%, 
                      #E0E0E0 ${formData.confidenceScore}%)`,
                  },
                }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Typography variant="caption" color="error">
                  &lt;60% Low
                </Typography>
                <Typography variant="caption" color="warning.main">
                  60-79% Medium
                </Typography>
                <Typography variant="caption" color="success.main">
                  ≥80% High
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Footer Actions */}
        <Box sx={{ pt: 3, display: 'flex', gap: 2 }}>
          <Button
            fullWidth
            variant="outlined"
            onClick={onClose}
            disabled={isSubmitting}
            sx={{ textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button
            fullWidth
            variant="contained"
            type="submit"
            disabled={!isValid || isSubmitting}
            onClick={handleSubmit}
            sx={{
              bgcolor: '#00A8A8',
              '&:hover': { bgcolor: '#007676' },
              textTransform: 'none',
            }}
          >
            {isSubmitting ? <CircularProgress size={24} /> : 'Create Action'}
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
};

export default CreateAgentActionDrawer;
