/**
 * TypedConfirmationDialog.tsx
 * 
 * A confirmation dialog that requires the user to type a specific confirmation string
 * before the confirm button is enabled. Used for destructive actions like data reset.
 */

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Alert,
  LinearProgress,
} from '@mui/material';
import {
  Warning as WarningIcon,
} from '@mui/icons-material';
import { DERTOUR_COLORS } from '../../config/theme';

interface TypedConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmationText: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  severity?: 'warning' | 'error' | 'info';
  isLoading?: boolean;
}

export const TypedConfirmationDialog: React.FC<TypedConfirmationDialogProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmationText,
  confirmButtonText = 'Confirm',
  cancelButtonText = 'Cancel',
  severity = 'warning',
  isLoading = false,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isConfirmed, setIsConfirmed] = useState(false);

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setInputValue('');
      setIsConfirmed(false);
    }
  }, [open]);

  // Check if input matches confirmation text
  useEffect(() => {
    setIsConfirmed(inputValue.trim() === confirmationText);
  }, [inputValue, confirmationText]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleConfirm = () => {
    if (isConfirmed && !isLoading) {
      onConfirm();
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  const getAlertColor = () => {
    switch (severity) {
      case 'error':
        return 'error';
      case 'info':
        return 'info';
      case 'warning':
      default:
        return 'warning';
    }
  };

  const getButtonColor = () => {
    switch (severity) {
      case 'error':
        return 'error';
      case 'info':
        return 'primary';
      case 'warning':
      default:
        return 'warning';
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      {isLoading && <LinearProgress />}
      
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <WarningIcon sx={{ color: severity === 'error' ? DERTOUR_COLORS.error : DERTOUR_COLORS.warning }} />
          <Typography variant="h6" component="span" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Alert severity={getAlertColor()} sx={{ mb: 3 }}>
          {description}
        </Alert>
        
        <DialogContentText sx={{ mb: 2, color: 'text.primary' }}>
          To confirm, please type{' '}
          <Typography
            component="span"
            sx={{
              fontWeight: 700,
              fontFamily: 'monospace',
              bgcolor: DERTOUR_COLORS.grey100,
              px: 1,
              py: 0.5,
              borderRadius: 1,
              border: `1px solid ${DERTOUR_COLORS.grey300}`,
            }}
          >
            {confirmationText}
          </Typography>{' '}
          below:
        </DialogContentText>
        
        <TextField
          fullWidth
          value={inputValue}
          onChange={handleInputChange}
          placeholder={`Type "${confirmationText}" to confirm`}
          disabled={isLoading}
          autoFocus
          error={inputValue.length > 0 && !isConfirmed}
          helperText={
            inputValue.length > 0 && !isConfirmed
              ? `Text does not match. Please type "${confirmationText}" exactly.`
              : ''
          }
          sx={{
            '& .MuiInputBase-input': {
              fontFamily: 'monospace',
              fontSize: '1.1rem',
              letterSpacing: '0.05em',
            },
          }}
        />
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button
          onClick={handleClose}
          variant="outlined"
          disabled={isLoading}
        >
          {cancelButtonText}
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color={getButtonColor()}
          disabled={!isConfirmed || isLoading}
        >
          {isLoading ? 'Processing...' : confirmButtonText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TypedConfirmationDialog;
