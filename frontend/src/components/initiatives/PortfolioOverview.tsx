/**
 * PortfolioOverview.tsx - Wave 1 Stub
 * 
 * Placeholder component for the Portfolio Overview screen.
 * Full implementation coming in Wave 2.
 */

import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { Assessment as AssessmentIcon } from '@mui/icons-material';

import AppLayout from '../layout/AppLayout';
import { DERTOUR_COLORS } from '../../config/theme';

const PortfolioOverview: React.FC = () => {
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
          <AssessmentIcon
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
          Portfolio Overview
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
          Comprehensive view of all portfolio initiatives with filtering, sorting, and drill-down capabilities.
          This screen will include initiative cards, status tracking, and financial summaries.
        </Typography>
      </Box>
    </AppLayout>
  );
};

export default PortfolioOverview;
