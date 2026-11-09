/**
 * LoginPage - Authentication Entry Point
 * 
 * The DERTOUR-branded login screen with centered card, email/password fields,
 * and role-based redirect on successful authentication.
 */

import React, { useState, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Alert,
  Link,
  Fade,
  CircularProgress,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Business,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/authStore';
import { DERTOUR_COLORS } from '../../config/theme';

// DERTOUR Logo Component
const DertourLogo: React.FC = () => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
    <Box
      sx={{
        width: 48,
        height: 48,
        borderRadius: '12px',
        background: `linear-gradient(135deg, ${DERTOUR_COLORS.primary} 0%, ${DERTOUR_COLORS.primaryLight} 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 12px rgba(0, 168, 168, 0.3)',
      }}
    >
      <Business sx={{ color: '#fff', fontSize: 28 }} />
    </Box>
    <Box>
      <Typography
        variant="h5"
        sx={{
          fontWeight: 700,
          color: DERTOUR_COLORS.primary,
          letterSpacing: '-0.5px',
          lineHeight: 1.2,
        }}
      >
        DERTOUR
      </Typography>
      <Typography
        variant="caption"
        sx={{
          color: DERTOUR_COLORS.textSecondary,
          fontWeight: 500,
          letterSpacing: '0.5px',
        }}
      >
        Group Functions
      </Typography>
    </Box>
  </Box>
);

// Login Form Component
const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const { login, error, clearError, isLoading, getDashboardRoute } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [forgotPasswordToast, setForgotPasswordToast] = useState(false);

  const validateForm = useCallback((): boolean => {
    let isValid = true;
    setEmailError('');
    setPasswordError('');

    if (!email.trim()) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Please enter a valid email address');
      isValid = false;
    }

    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      isValid = false;
    }

    return isValid;
  }, [email, password]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      clearError();

      if (!validateForm()) return;

      try {
        await login(email, password);
        // Navigate to role-specific dashboard
        const dashboardRoute = getDashboardRoute();
        navigate(dashboardRoute, { replace: true });
      } catch {
        // Error is handled by auth store and displayed via error state
      }
    },
    [email, password, login, clearError, validateForm, navigate, getDashboardRoute]
  );

  const handleForgotPassword = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setForgotPasswordToast(true);
      setTimeout(() => setForgotPasswordToast(false), 3000);
    },
    []
  );

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ width: '100%', maxWidth: 360 }}
    >
      {/* Error Alert */}
      <Fade in={!!error}>
        <Alert
          severity="error"
          sx={{
            mb: 2,
            borderRadius: 2,
            '& .MuiAlert-icon': { color: DERTOUR_COLORS.error },
          }}
        >
          {error || 'Invalid email or password. Please try again.'}
        </Alert>
      </Fade>

      {/* Forgot Password Toast */}
      <Fade in={forgotPasswordToast}>
        <Alert
          severity="info"
          sx={{
            mb: 2,
            borderRadius: 2,
            '& .MuiAlert-icon': { color: DERTOUR_COLORS.info },
          }}
        >
          Contact your system administrator
        </Alert>
      </Fade>

      {/* Email Field */}
      <TextField
        fullWidth
        label="Email Address"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={!!emailError}
        helperText={emailError}
        disabled={isLoading}
        sx={{
          mb: 2,
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            backgroundColor: '#fff',
            '&:hover fieldset': {
              borderColor: DERTOUR_COLORS.primary,
            },
            '&.Mui-focused fieldset': {
              borderColor: DERTOUR_COLORS.primary,
              borderWidth: 2,
            },
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: DERTOUR_COLORS.primary,
          },
        }}
      />

      {/* Password Field */}
      <TextField
        fullWidth
        label="Password"
        type={showPassword ? 'text' : 'password'}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={!!passwordError}
        helperText={passwordError}
        disabled={isLoading}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={togglePasswordVisibility}
                edge="end"
                sx={{ color: DERTOUR_COLORS.textSecondary }}
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={{
          mb: 1,
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            backgroundColor: '#fff',
            '&:hover fieldset': {
              borderColor: DERTOUR_COLORS.primary,
            },
            '&.Mui-focused fieldset': {
              borderColor: DERTOUR_COLORS.primary,
              borderWidth: 2,
            },
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: DERTOUR_COLORS.primary,
          },
        }}
      />

      {/* Forgot Password Link */}
      <Box sx={{ textAlign: 'right', mb: 3 }}>
        <Link
          component="button"
          type="button"
          onClick={handleForgotPassword}
          sx={{
            color: DERTOUR_COLORS.textSecondary,
            fontSize: '0.875rem',
            textDecoration: 'none',
            '&:hover': {
              color: DERTOUR_COLORS.primary,
              textDecoration: 'underline',
            },
          }}
        >
          Forgot password?
        </Link>
      </Box>

      {/* Sign In Button */}
      <Button
        type="submit"
        fullWidth
        variant="contained"
        disabled={isLoading}
        sx={{
          py: 1.5,
          borderRadius: 2,
          fontSize: '1rem',
          fontWeight: 600,
          textTransform: 'none',
          backgroundColor: DERTOUR_COLORS.primary,
          boxShadow: `0 4px 14px ${DERTOUR_COLORS.primary}40`,
          '&:hover': {
            backgroundColor: DERTOUR_COLORS.primaryDark,
            boxShadow: `0 6px 20px ${DERTOUR_COLORS.primary}60`,
          },
          '&:disabled': {
            backgroundColor: DERTOUR_COLORS.primaryLight,
            opacity: 0.7,
          },
        }}
      >
        {isLoading ? (
          <CircularProgress size={24} sx={{ color: '#fff' }} />
        ) : (
          'Sign In'
        )}
      </Button>
    </Box>
  );
};

// Main Login Page Component
const LoginPage: React.FC = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(145deg, ${DERTOUR_COLORS.sidebar} 0%, #1a2d4a 50%, ${DERTOUR_COLORS.sidebar} 100%)`,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '-50%',
          left: '-50%',
          width: '200%',
          height: '200%',
          background: `radial-gradient(circle at 30% 70%, ${DERTOUR_COLORS.primary}15 0%, transparent 50%),
                       radial-gradient(circle at 70% 30%, ${DERTOUR_COLORS.secondary}10 0%, transparent 40%)`,
          animation: 'pulse 15s ease-in-out infinite',
        },
        '@keyframes pulse': {
          '0%, 100%': { transform: 'scale(1)', opacity: 0.5 },
          '50%': { transform: 'scale(1.1)', opacity: 0.8 },
        },
      }}
    >
      {/* Login Card */}
      <Card
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 440,
          mx: 2,
          borderRadius: 4,
          backgroundColor: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <CardContent
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <DertourLogo />

          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: DERTOUR_COLORS.textPrimary,
              mb: 0.5,
              textAlign: 'center',
            }}
          >
            Welcome back
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: DERTOUR_COLORS.textSecondary,
              mb: 4,
              textAlign: 'center',
            }}
          >
            Sign in to access your portfolio dashboard
          </Typography>

          <LoginForm />

          {/* Demo Credentials Hint */}
          <Box
            sx={{
              mt: 4,
              pt: 3,
              borderTop: `1px solid ${DERTOUR_COLORS.border}`,
              width: '100%',
              textAlign: 'center',
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: DERTOUR_COLORS.textMuted,
                display: 'block',
                mb: 1,
              }}
            >
              Demo Credentials:
            </Typography>
            <Typography
              variant="caption"
              component="div"
              sx={{
                color: DERTOUR_COLORS.textSecondary,
                fontFamily: 'monospace',
                fontSize: '0.75rem',
              }}
            >
              finance@dertour.de / password
            </Typography>
            <Typography
              variant="caption"
              component="div"
              sx={{
                color: DERTOUR_COLORS.textSecondary,
                fontFamily: 'monospace',
                fontSize: '0.75rem',
              }}
            >
              admin@dertour.de / password
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Footer */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 24,
          left: 0,
          right: 0,
          textAlign: 'center',
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: 'rgba(255, 255, 255, 0.5)',
          }}
        >
          © 2024 DERTOUR Group Functions. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
};

export default LoginPage;
