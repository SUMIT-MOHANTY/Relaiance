/**
 * BlockedWork.tsx - Wave 1 Stub
 * 
 * Placeholder component for the Blocked Work reporting screen.
 * Full implementation coming in Wave 2.
 */

import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { Block as BlockIcon } from '@mui/icons-material';

import AppLayout from '../layout/AppLayout';
import { DERTOUR_COLORS } from '../../config/theme';

const BlockedWork: React.FC = () => {
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
            backgroundColor: 'rgba(211, 47, 47, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 3,
          }}
        >
          <BlockIcon
            sx={{
              fontSize: 40,
              color: DERTOUR_COLORS.error,
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
          Blocked Work
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
          Identify and track blocked initiatives, milestones, and deliverables across the portfolio.
          This report will highlight blockers, their impact, and resolution status for executive visibility.
        </Typography>
      </Box>
    </AppLayout>
  );
};

export default BlockedWork;
