/**
 * AgentActions.tsx - Wave 1 Stub
 * 
 * Placeholder component for the Agent Actions review screen.
 * Full implementation coming in Wave 2.
 */

import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { SmartToy as SmartToyIcon } from '@mui/icons-material';

import AppLayout from '../layout/AppLayout';
import { DERTOUR_COLORS } from '../../config/theme';

const AgentActions: React.FC = () => {
  return (
    <AppLayout>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          textAlign: 'center',
        }}
      >
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            backgroundColor: 'rgba(0, 168, 168, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 3,
          }}
        >
          <SmartToyIcon
            sx={{
              fontSize: 40,
              color: DERTOUR_COLORS.primary,
            }}
          />
        </Box>

        <Typography
          variant="h4"
          sx={{
            fontWeight: 600,
            color: DERTOUR_COLORS.text.primary,
            mb: 2,
          }}
        >
          Agent Actions
        </Typography>

        <Chip
          label="Coming in Wave 2"
          sx={{
            backgroundColor: 'rgba(0, 168, 168, 0.1)',
            color: DERTOUR_COLORS.primary,
            fontWeight: 500,
            fontSize: '0.875rem',
            py: 0.5,
            px: 1,
          }}
        />

        <Typography
          variant="body1"
          sx={{
            color: DERTOUR_COLORS.text.secondary,
            mt: 3,
            maxWidth: 400,
          }}
        >
          Review and approve AI-recommended actions for portfolio initiatives.
          This feature will include action inbox, confidence scoring, and execution history.
        </Typography>
      </Box>
    </AppLayout>
  );
};

export default AgentActions;
