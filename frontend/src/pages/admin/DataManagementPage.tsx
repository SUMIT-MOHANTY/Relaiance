/**
 * DataManagementPage.tsx - Data Management Sub-Panel
 * 
 * Provides two MUI Cards:
 * - Reset All Data: Red-bordered card with typed confirmation dialog
 * - Import Seed Data: Green-bordered card with progress indicator
 */

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Alert,
  CircularProgress,
  LinearProgress,
} from '@mui/material';
import {
  Warning as WarningIcon,
  CloudUpload as CloudUploadIcon,
  DeleteForever as DeleteForeverIcon,
} from '@mui/icons-material';

import { resetAllData, importSeedData } from '../../services/admin.api';
import { useNotification } from '../../store/notificationStore';
import { TypedConfirmationDialog } from '../../components/admin/TypedConfirmationDialog';
import { DERTOUR_COLORS } from '../../config/theme';

export const DataManagementPage: React.FC = () => {
  const { showNotification } = useNotification();
  
  // Dialog states
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  
  // Loading states
  const [isResetting, setIsResetting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);

  // Handle data reset
  const handleResetData = async () => {
    setIsResetting(true);
    try {
      const result = await resetAllData();
      showNotification(result.message || 'Data reset successfully', 'success');
      setResetDialogOpen(false);
    } catch (error) {
      showNotification(
        `Failed to reset data: ${(error as Error).message}`,
        'error'
      );
    } finally {
      setIsResetting(false);
    }
  };

  // Handle seed data import
  const handleImportSeedData = async () => {
    setIsImporting(true);
    setImportProgress(0);
    
    // Simulate progress
    const progressInterval = setInterval(() => {
      setImportProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      const result = await importSeedData();
      clearInterval(progressInterval);
      setImportProgress(100);
      showNotification(
        `${result.message || 'Seed data imported successfully'} (${result.recordsImported} records)`,
        'success'
      );
    } catch (error) {
      clearInterval(progressInterval);
      showNotification(
        `Failed to import seed data: ${(error as Error).message}`,
        'error'
      );
    } finally {
      setTimeout(() => {
        setIsImporting(false);
        setImportProgress(0);
      }, 500);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Typography variant="h4" sx={{ fontWeight: 600, color: DERTOUR_COLORS.primary, mb: 3 }}>
        Data Management
      </Typography>

      {/* Cards Container */}
      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        {/* Reset All Data Card */}
        <Card
          sx={{
            flex: 1,
            minWidth: 350,
            maxWidth: 500,
            border: `2px solid ${DERTOUR_COLORS.error}`,
            borderRadius: 2,
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <WarningIcon sx={{ color: DERTOUR_COLORS.error, fontSize: 40 }} />
              <Typography variant="h5" sx={{ fontWeight: 600, color: DERTOUR_COLORS.error }}>
                Reset All Data
              </Typography>
            </Box>
            
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              This will truncate all entity data including initiatives, milestones,
              risks, decisions, and benefits. <strong>User accounts will be preserved.</strong>
            </Typography>

            <Alert severity="warning" sx={{ mb: 3 }}>
              This action cannot be undone. All portfolio data will be permanently deleted.
            </Alert>

            <Button
              variant="contained"
              color="error"
              startIcon={<DeleteForeverIcon />}
              onClick={() => setResetDialogOpen(true)}
              disabled={isResetting}
              fullWidth
              sx={{ py: 1.5 }}
            >
              {isResetting ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1, color: 'inherit' }} />
                  Resetting...
                </>
              ) : (
                'Reset Data'
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Import Seed Data Card */}
        <Card
          sx={{
            flex: 1,
            minWidth: 350,
            maxWidth: 500,
            border: `2px solid ${DERTOUR_COLORS.success}`,
            borderRadius: 2,
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <CloudUploadIcon sx={{ color: DERTOUR_COLORS.success, fontSize: 40 }} />
              <Typography variant="h5" sx={{ fontWeight: 600, color: DERTOUR_COLORS.success }}>
                Import Seed Data
              </Typography>
            </Box>
            
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Load the standard synthetic dataset for demonstration purposes.
              This includes sample initiatives, milestones, risks, and decisions.
            </Typography>

            <Alert severity="info" sx={{ mb: 3 }}>
              Existing data will not be deleted. New seed records will be added.
            </Alert>

            {isImporting && (
              <Box sx={{ mb: 3 }}>
                <LinearProgress
                  variant="determinate"
                  value={importProgress}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: DERTOUR_COLORS.grey[300],
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: DERTOUR_COLORS.success,
                    },
                  }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Importing... {importProgress}%
                </Typography>
              </Box>
            )}

            <Button
              variant="contained"
              sx={{
                backgroundColor: DERTOUR_COLORS.success,
                '&:hover': { backgroundColor: '#1B5E20' },
              }}
              startIcon={<CloudUploadIcon />}
              onClick={handleImportSeedData}
              disabled={isImporting}
              fullWidth
              disableElevation
            >
              {isImporting ? 'Importing...' : 'Import Seed Data'}
            </Button>
          </CardContent>
        </Card>
      </Box>

      {/* Typed Confirmation Dialog for Reset */}
      <TypedConfirmationDialog
        open={resetDialogOpen}
        onClose={() => setResetDialogOpen(false)}
        onConfirm={handleResetData}
        title="Confirm Data Reset"
        description="This will permanently delete all portfolio data. User accounts will be preserved."
        confirmationText="RESET"
        confirmButtonText="Reset All Data"
        isLoading={isResetting}
      />
    </Box>
  );
};

export default DataManagementPage;
