/**
 * RejectReasonDialog.tsx - Reject Reason Dialog Component
 * 
 * MUI Dialog with required rejection_reason textarea input.
 * Validates that reason is provided before allowing confirm.
 */

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
} from '@mui/material';
import { AgentAction } from '../../types/api.types';

interface RejectReasonDialogProps {
  open: boolean;
  action: AgentAction | null;
  onClose: () => void;
  onConfirm: (action: AgentAction, reason: string) => void;
}

export const RejectReasonDialog: React.FC<RejectReasonDialogProps> = ({
  open,
  action,
  onClose,
  onConfirm,
}) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState(false);

  const handleClose = () => {
    setReason('');
    setError(false);
    onClose();
  };

  const handleConfirm = () => {
    if (!reason.trim()) {
      setError(true);
      return;
    }
    if (action) {
      onConfirm(action, reason.trim());
      handleClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 600 }}>
        Reject Agent Action
      </DialogTitle>
      <DialogContent>
        {action && (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              You are rejecting the following action:
            </Typography>
            <Typography variant="subtitle2" sx={{ mb: 2, p: 1.5, backgroundColor: '#F5F5F5', borderRadius: 1 }}>
              {action.description}
            </Typography>
          </>
        )}
        <TextField
          autoFocus
          margin="dense"
          label="Rejection Reason *"
          fullWidth
          multiline
          rows={3}
          variant="outlined"
          value={reason}
          onChange={(e) => {
            setReason(e.target.value);
            if (e.target.value.trim()) setError(false);
          }}
          error={error}
          helperText={error ? 'Rejection reason is required' : 'Please provide a reason for rejecting this action'}
          placeholder="Enter your reason for rejection..."
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={handleClose}
          sx={{ textTransform: 'none', color: '#616161' }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color="error"
          disabled={!reason.trim()}
          sx={{
            textTransform: 'none',
            backgroundColor: '#D32F2F',
            '&:hover': { backgroundColor: '#C62828' },
          }}
        >
          Reject Action
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RejectReasonDialog;
