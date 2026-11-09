/**
 * ForbiddenPage.tsx - 403 Access Denied Page
 * 
 * Displayed when a user attempts to access a route they don't have permission for.
 * Provides a clear message and a button to return to their appropriate dashboard.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
} from '@mui/material';
import {
  Block as BlockIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';

import { DERTOUR_COLORS } from '../../config/theme';
import { useUserRole } from '../../store/authStore';

const ForbiddenPage: React.FC = () => {
  const navigate = useNavigate();
  const userRole = useUserRole();

  const handleReturnToDashboard = () => {
    // Redirect to role-appropriate dashboard
    switch (userRole) {
      case 'FINANCE_USER':
        navigate('/dashboard/finance');
        break;
      case 'TEAM_MEMBER':
        navigate('/dashboard/team');
        break;
      case 'EXECUTIVE':
        navigate('/dashboard/executive');
        break;
      case 'SYSTEM_ADMIN':
        navigate('/admin');
        break;
      default:
        navigate('/login');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper
        elevation={2}
        sx={{
          p: 4,
          textAlign: 'center',
          borderRadius: 3,
        }}
      >
        {/* Icon */}
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            backgroundColor: 'rgba(211, 47, 47, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
          }}
        >
          <BlockIcon
            sx={{
              fontSize: 40,
              color: DERTOUR_COLORS.error,
            }}
          />
        </Box>

        {/* Error Code */}
        <Typography
          variant="h1"
          sx={{
            fontSize: '4rem',
            fontWeight: 700,
            color: DERTOUR_COLORS.error,
            mb: 1,
          }}
        >
          403
        </Typography>

        {/* Title */}
        <Typography
          variant="h4"
          sx={{
            fontWeight: 600,
            color: DERTOUR_COLORS.text.primary,
            mb: 2,
          }}
        >
          Access Denied
        </Typography>

        {/* Description */}
        <Typography
          variant="body1"
          sx={{
            color: DERTOUR_COLORS.text.secondary,
            mb: 4,
            maxWidth: 400,
            margin: '0 auto 32px',
          }}
        >
          You don't have permission to access this page. 
          If you believe this is an error, please contact your system administrator.
        </Typography>

        {/* Return Button */}
        <Button
          variant="contained"
          size="large"
          startIcon={<ArrowBackIcon />}
          onClick={handleReturnToDashboard}
          sx={{
            backgroundColor: DERTOUR_COLORS.primary,
            borderRadius: 2,
            px: 4,
            py: 1.5,
            textTransform: 'none',
            fontWeight: 500,
            '&:hover': {
              backgroundColor: '#008888',
            },
          }}
        >
          Return to Dashboard
        </Button>
      </Paper>
    </Container>
  );
};

export default ForbiddenPage;
