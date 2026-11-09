/**
 * SubmitDecisionModal.tsx - Submit Decision Modal Component
 * 
 * A MUI Dialog form for logging a Decision linked to a risk's initiative.
 * Calls POST /api/initiatives/:id/decisions on submit.
 */

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Risk, DecisionType, DecisionStatus } from '../../types/api.types';
import { createDecision } from '../../services/reporting.api';

interface SubmitDecisionModalProps {
  open: boolean;
  onClose: () => void;
  risk: Risk | null;
  onSuccess?: () => void;
}

const SubmitDecisionModal: React.FC<SubmitDecisionModalProps> = ({
  open,
  onClose,
  risk,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    decisionType: DecisionType.OTHER,
    requiredByDate: null as Date | null,
    implementationTargetDate: null as Date | null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        title: '',
        description: '',
        decisionType: DecisionType.OTHER,
        requiredByDate: null,
        implementationTargetDate: null,
      });
      setError(null);
      onClose();
    }
  };

  const handleSubmit = async () => {
    if (!risk) return;

    // Validation
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }
    if (!formData.description.trim()) {
      setError('Description is required');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await createDecision({
        initiativeId: risk.initiativeId,
        title: formData.title,
        description: formData.description,
        decisionType: formData.decisionType,
        requiredByDate: formData.requiredByDate?.toISOString(),
        implementationTargetDate: formData.implementationTargetDate?.toISOString(),
      });

      onSuccess?.();
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit decision');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!risk) return null;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" sx={{ color: '#003087', fontWeight: 600 }}>
            Submit Decision
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
            For risk: {risk.title}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
            Initiative: {risk.initiative?.code || 'Unknown'} - {risk.initiative?.title || 'Unknown'}
          </Typography>
        </DialogTitle>

        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <FormControl fullWidth required>
              <InputLabel>Decision Type</InputLabel>
              <Select
                value={formData.decisionType}
                label="Decision Type"
                onChange={(e) =>
                  setFormData({ ...formData, decisionType: e.target.value as DecisionType })
                }
                disabled={isSubmitting}
              >
                {Object.values(DecisionType).map((type) => (
                  <MenuItem key={type} value={type}>
                    {type.replace(/_/g, ' ')}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Title"
              required
              fullWidth
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter decision title"
              disabled={isSubmitting}
            />

            <TextField
              label="Description"
              required
              fullWidth
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the decision needed and its rationale"
              disabled={isSubmitting}
            />

            <DatePicker
              label="Required By Date"
              value={formData.requiredByDate}
              onChange={(date) => setFormData({ ...formData, requiredByDate: date })}
              disabled={isSubmitting}
              slotProps={{
                textField: {
                  fullWidth: true,
                  helperText: 'When does this decision need to be made?',
                },
              }}
            />

            <DatePicker
              label="Implementation Target Date"
              value={formData.implementationTargetDate}
              onChange={(date) => setFormData({ ...formData, implementationTargetDate: date })}
              disabled={isSubmitting}
              slotProps={{
                textField: {
                  fullWidth: true,
                  helperText: 'When should the decision be implemented?',
                },
              }}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={handleClose}
            disabled={isSubmitting}
            sx={{ color: '#616161' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={isSubmitting}
            sx={{
              backgroundColor: '#003087',
              '&:hover': { backgroundColor: '#001A54' },
            }}
          >
            {isSubmitting ? (
              <>
                <CircularProgress size={16} sx={{ mr: 1, color: '#fff' }} />
                Submitting...
              </>
            ) : (
              'Submit Decision'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default SubmitDecisionModal;
