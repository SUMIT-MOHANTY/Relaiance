import { createTheme, ThemeOptions } from '@mui/material/styles';

// DERTOUR Design System Colors
export const DERTOUR_COLORS = {
  // Primary - DERTOUR Teal
  primary: {
    main: '#00A8A8',
    light: '#33BABA',
    dark: '#007676',
    contrastText: '#FFFFFF',
  },
  // Secondary - Accent Orange
  secondary: {
    main: '#FF6B35',
    light: '#FF8966',
    dark: '#CC562A',
    contrastText: '#FFFFFF',
  },
  // Navy - Sidebar/Nav Dark Surface
  navy: {
    main: '#0D1B2A',
    light: '#1B2E45',
    dark: '#080F18',
    contrastText: '#FFFFFF',
  },
  // Background Colors
  background: {
    default: '#F5F7FA',
    paper: '#FFFFFF',
    dark: '#0D1B2A',
  },
  // Semantic Colors
  error: {
    main: '#D32F2F',
    light: '#EF5350',
    dark: '#C62828',
    contrastText: '#FFFFFF',
  },
  warning: {
    main: '#F57C00',
    light: '#FFB74D',
    dark: '#E65100',
    contrastText: '#FFFFFF',
  },
  success: {
    main: '#388E3C',
    light: '#66BB6A',
    dark: '#2E7D32',
    contrastText: '#FFFFFF',
  },
  info: {
    main: '#0288D1',
    light: '#4FC3F7',
    dark: '#01579B',
    contrastText: '#FFFFFF',
  },
  // Grey Scale
  grey: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
  // Text Colors
  text: {
    primary: '#212121',
    secondary: '#616161',
    disabled: '#9E9E9E',
    hint: '#BDBDBD',
  },
} as const;

// Status Badge Color Mapping
export const STATUS_COLORS: Record<string, string> = {
  // Initiative Status
  ACTIVE: DERTOUR_COLORS.success.main,
  COMPLETED: DERTOUR_COLORS.success.main,
  APPROVED: DERTOUR_COLORS.success.main,
  ON_HOLD: DERTOUR_COLORS.warning.main,
  PENDING: DERTOUR_COLORS.warning.main,
  DEFERRED: DERTOUR_COLORS.warning.main,
  CANCELLED: DERTOUR_COLORS.error.main,
  REJECTED: DERTOUR_COLORS.error.main,
  BLOCKED: DERTOUR_COLORS.error.main,
  DRAFT: DERTOUR_COLORS.grey[500],
  NOT_STARTED: DERTOUR_COLORS.grey[500],
  // Risk Severity
  HIGH: DERTOUR_COLORS.error.main,
  MEDIUM: DERTOUR_COLORS.warning.main,
  LOW: DERTOUR_COLORS.success.main,
  CRITICAL: DERTOUR_COLORS.error.dark,
};

// Typography Scale
export const DERTOUR_TYPOGRAPHY = {
  fontFamily: '"Inter", "Segoe UI", "Helvetica Neue", Arial, sans-serif',
  h1: {
    fontSize: '28px',
    fontWeight: 700,
    lineHeight: 1.2,
    letterSpacing: '-0.02em',
  },
  h2: {
    fontSize: '22px',
    fontWeight: 600,
    lineHeight: 1.3,
    letterSpacing: '-0.01em',
  },
  h3: {
    fontSize: '18px',
    fontWeight: 600,
    lineHeight: 1.4,
    letterSpacing: '0',
  },
  h4: {
    fontSize: '16px',
    fontWeight: 600,
    lineHeight: 1.4,
    letterSpacing: '0',
  },
  h5: {
    fontSize: '14px',
    fontWeight: 600,
    lineHeight: 1.5,
    letterSpacing: '0',
  },
  h6: {
    fontSize: '13px',
    fontWeight: 600,
    lineHeight: 1.5,
    letterSpacing: '0.01em',
  },
  body1: {
    fontSize: '14px',
    fontWeight: 400,
    lineHeight: 1.5,
    letterSpacing: '0',
  },
  body2: {
    fontSize: '13px',
    fontWeight: 400,
    lineHeight: 1.5,
    letterSpacing: '0',
  },
  subtitle1: {
    fontSize: '14px',
    fontWeight: 500,
    lineHeight: 1.5,
    letterSpacing: '0',
  },
  subtitle2: {
    fontSize: '13px',
    fontWeight: 500,
    lineHeight: 1.5,
    letterSpacing: '0.01em',
  },
  button: {
    fontSize: '14px',
    fontWeight: 500,
    lineHeight: 1.75,
    letterSpacing: '0.02em',
    textTransform: 'none' as const,
  },
  caption: {
    fontSize: '12px',
    fontWeight: 400,
    lineHeight: 1.5,
    letterSpacing: '0.02em',
  },
  overline: {
    fontSize: '11px',
    fontWeight: 500,
    lineHeight: 1.5,
    letterSpacing: '0.08em',
    textTransform: 'uppercase' as const,
  },
};

// Spacing Tokens
export const DERTOUR_SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Border Radius Tokens
export const DERTOUR_BORDER_RADIUS = {
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  pill: 50,
};

// Shadow Tokens
export const DERTOUR_SHADOWS = {
  none: 'none',
  xs: '0 1px 2px rgba(0, 0, 0, 0.05)',
  sm: '0 1px 3px rgba(0, 0, 0, 0.1)',
  md: '0 4px 6px rgba(0, 0, 0, 0.07)',
  lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px rgba(0, 0, 0, 0.1)',
  card: '0 2px 8px rgba(0, 0, 0, 0.08)',
  drawer: '0 0 20px rgba(0, 0, 0, 0.15)',
};

// Create the DERTOUR Theme
export const dertourTheme = createTheme({
  palette: {
    primary: DERTOUR_COLORS.primary,
    secondary: DERTOUR_COLORS.secondary,
    error: DERTOUR_COLORS.error,
    warning: DERTOUR_COLORS.warning,
    success: DERTOUR_COLORS.success,
    info: DERTOUR_COLORS.info,
    grey: DERTOUR_COLORS.grey,
    background: DERTOUR_COLORS.background,
    text: DERTOUR_COLORS.text,
    mode: 'light',
  },
  typography: DERTOUR_TYPOGRAPHY,
  spacing: 4,
  shape: {
    borderRadius: DERTOUR_BORDER_RADIUS.md,
  },
  shadows: [
    'none',
    DERTOUR_SHADOWS.xs,
    DERTOUR_SHADOWS.sm,
    DERTOUR_SHADOWS.md,
    DERTOUR_SHADOWS.lg,
    DERTOUR_SHADOWS.xl,
    '0 3px 5px rgba(0,0,0,0.1)',
    '0 4px 6px rgba(0,0,0,0.1)',
    '0 5px 8px rgba(0,0,0,0.1)',
    '0 6px 10px rgba(0,0,0,0.1)',
    '0 7px 12px rgba(0,0,0,0.1)',
    '0 8px 14px rgba(0,0,0,0.1)',
    '0 9px 16px rgba(0,0,0,0.1)',
    '0 10px 18px rgba(0,0,0,0.1)',
    '0 11px 20px rgba(0,0,0,0.1)',
    '0 12px 22px rgba(0,0,0,0.1)',
    '0 13px 24px rgba(0,0,0,0.1)',
    '0 14px 26px rgba(0,0,0,0.1)',
    '0 15px 28px rgba(0,0,0,0.1)',
    '0 16px 30px rgba(0,0,0,0.1)',
    '0 17px 32px rgba(0,0,0,0.1)',
    '0 18px 34px rgba(0,0,0,0.1)',
    '0 19px 36px rgba(0,0,0,0.1)',
    '0 20px 38px rgba(0,0,0,0.1)',
    '0 21px 40px rgba(0,0,0,0.1)',
  ],
  components: {
    // Button Overrides
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: DERTOUR_BORDER_RADIUS.md,
          padding: '8px 24px',
          fontWeight: 500,
          textTransform: 'none',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: DERTOUR_SHADOWS.sm,
          },
        },
        containedPrimary: {
          backgroundColor: DERTOUR_COLORS.primary.main,
          '&:hover': {
            backgroundColor: DERTOUR_COLORS.primary.dark,
            boxShadow: '0 2px 8px rgba(0, 168, 168, 0.3)',
          },
        },
        containedSecondary: {
          backgroundColor: DERTOUR_COLORS.secondary.main,
          '&:hover': {
            backgroundColor: DERTOUR_COLORS.secondary.dark,
            boxShadow: '0 2px 8px rgba(255, 107, 53, 0.3)',
          },
        },
        outlined: {
          borderWidth: 1.5,
          '&:hover': {
            borderWidth: 1.5,
          },
        },
        sizeSmall: {
          padding: '4px 16px',
          fontSize: '13px',
        },
        sizeLarge: {
          padding: '12px 32px',
          fontSize: '15px',
        },
      },
    },
    // Card Overrides
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: DERTOUR_BORDER_RADIUS.lg,
          boxShadow: DERTOUR_SHADOWS.card,
          border: '1px solid rgba(0, 0, 0, 0.05)',
        },
      },
    },
    // Chip Overrides
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: DERTOUR_BORDER_RADIUS.pill,
          fontWeight: 500,
          fontSize: '12px',
          height: 28,
        },
        colorSuccess: {
          backgroundColor: 'rgba(56, 142, 60, 0.12)',
          color: DERTOUR_COLORS.success.dark,
          border: `1px solid ${DERTOUR_COLORS.success.main}`,
        },
        colorWarning: {
          backgroundColor: 'rgba(245, 124, 0, 0.12)',
          color: DERTOUR_COLORS.warning.dark,
          border: `1px solid ${DERTOUR_COLORS.warning.main}`,
        },
        colorError: {
          backgroundColor: 'rgba(211, 47, 47, 0.12)',
          color: DERTOUR_COLORS.error.dark,
          border: `1px solid ${DERTOUR_COLORS.error.main}`,
        },
        colorInfo: {
          backgroundColor: 'rgba(2, 136, 209, 0.12)',
          color: DERTOUR_COLORS.info.dark,
          border: `1px solid ${DERTOUR_COLORS.info.main}`,
        },
      },
    },
    // TextField Overrides
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: DERTOUR_BORDER_RADIUS.md,
            backgroundColor: DERTOUR_COLORS.background.paper,
            '& fieldset': {
              borderColor: DERTOUR_COLORS.grey[300],
            },
            '&:hover fieldset': {
              borderColor: DERTOUR_COLORS.grey[400],
            },
            '&.Mui-focused fieldset': {
              borderColor: DERTOUR_COLORS.primary.main,
              borderWidth: 2,
            },
            '&.Mui-error fieldset': {
              borderColor: DERTOUR_COLORS.error.main,
            },
          },
        },
      },
    },
    // Input Overrides
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: DERTOUR_BORDER_RADIUS.md,
        },
      },
    },
    // DataGrid Overrides
    MuiDataGrid: {
      styleOverrides: {
        root: {
          border: 'none',
          '& .MuiDataGrid-row:nth-of-type(even)': {
            backgroundColor: DERTOUR_COLORS.grey[50],
          },
          '& .MuiDataGrid-row:hover': {
            backgroundColor: 'rgba(0, 168, 168, 0.04)',
          },
          '& .MuiDataGrid-cell:focus': {
            outline: 'none',
          },
          '& .MuiDataGrid-columnHeader:focus': {
            outline: 'none',
          },
        },
        columnHeader: {
          fontWeight: 600,
          fontSize: '13px',
          color: DERTOUR_COLORS.text.secondary,
          backgroundColor: DERTOUR_COLORS.background.paper,
        },
        cell: {
          fontSize: '13px',
          borderBottom: `1px solid ${DERTOUR_COLORS.grey[200]}`,
        },
      },
    },
    // AppBar Overrides
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: DERTOUR_COLORS.background.paper,
          color: DERTOUR_COLORS.text.primary,
          boxShadow: DERTOUR_SHADOWS.sm,
        },
      },
    },
    // Drawer Overrides
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: DERTOUR_COLORS.navy.main,
          color: DERTOUR_COLORS.navy.contrastText,
          borderRight: 'none',
        },
      },
    },
    // ListItem Overrides (for sidebar navigation)
    MuiListItem: {
      styleOverrides: {
        root: {
          borderRadius: DERTOUR_BORDER_RADIUS.sm,
          marginBottom: 4,
          '&.Mui-selected': {
            backgroundColor: DERTOUR_COLORS.navy.light,
            borderLeft: `3px solid ${DERTOUR_COLORS.primary.main}`,
          },
          '&.Mui-selected:hover': {
            backgroundColor: DERTOUR_COLORS.navy.light,
          },
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
          },
        },
      },
    },
    // ListItemButton Overrides
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: DERTOUR_BORDER_RADIUS.sm,
          paddingLeft: 16,
          paddingRight: 16,
          '&.Mui-selected': {
            backgroundColor: DERTOUR_COLORS.navy.light,
            borderLeft: `3px solid ${DERTOUR_COLORS.primary.main}`,
          },
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
          },
        },
      },
    },
    // ListItemIcon Overrides
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          color: 'inherit',
          minWidth: 40,
        },
      },
    },
    // ListItemText Overrides
    MuiListItemText: {
      styleOverrides: {
        primary: {
          fontSize: '14px',
          fontWeight: 500,
        },
      },
    },
    // Paper Overrides
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    // Alert Overrides
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: DERTOUR_BORDER_RADIUS.md,
        },
        standardError: {
          backgroundColor: 'rgba(211, 47, 47, 0.08)',
          color: DERTOUR_COLORS.error.dark,
        },
        standardWarning: {
          backgroundColor: 'rgba(245, 124, 0, 0.08)',
          color: DERTOUR_COLORS.warning.dark,
        },
        standardSuccess: {
          backgroundColor: 'rgba(56, 142, 60, 0.08)',
          color: DERTOUR_COLORS.success.dark,
        },
        standardInfo: {
          backgroundColor: 'rgba(2, 136, 209, 0.08)',
          color: DERTOUR_COLORS.info.dark,
        },
      },
    },
    // Snackbar Overrides
    MuiSnackbar: {
      styleOverrides: {
        root: {
          '& .MuiSnackbarContent-root': {
            borderRadius: DERTOUR_BORDER_RADIUS.md,
          },
        },
      },
    },
    // Tooltip Overrides
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: DERTOUR_COLORS.grey[800],
          borderRadius: DERTOUR_BORDER_RADIUS.sm,
          fontSize: '12px',
          padding: '8px 12px',
        },
      },
    },
    // Avatar Overrides
    MuiAvatar: {
      styleOverrides: {
        root: {
          fontWeight: 500,
        },
      },
    },
    // Badge Overrides
    MuiBadge: {
      styleOverrides: {
        badge: {
          fontSize: '10px',
          fontWeight: 600,
        },
      },
    },
    // Divider Overrides
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: DERTOUR_COLORS.grey[200],
        },
      },
    },
    // Table Overrides
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 600,
          color: DERTOUR_COLORS.text.secondary,
          backgroundColor: DERTOUR_COLORS.grey[50],
        },
        root: {
          borderBottom: `1px solid ${DERTOUR_COLORS.grey[200]}`,
        },
      },
    },
    // Tab Overrides
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          fontSize: '14px',
          minHeight: 48,
        },
      },
    },
    // Dialog Overrides
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: DERTOUR_BORDER_RADIUS.lg,
          boxShadow: DERTOUR_SHADOWS.xl,
        },
      },
    },
    // Menu Overrides
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: DERTOUR_BORDER_RADIUS.md,
          boxShadow: DERTOUR_SHADOWS.lg,
        },
      },
    },
    // Skeleton Overrides
    MuiSkeleton: {
      styleOverrides: {
        root: {
          borderRadius: DERTOUR_BORDER_RADIUS.sm,
          backgroundColor: DERTOUR_COLORS.grey[200],
        },
      },
    },
  },
} as ThemeOptions);

// Dark theme variant (for future use)
export const dertourDarkTheme = createTheme({
  ...dertourTheme,
  palette: {
    ...dertourTheme.palette,
    mode: 'dark',
    background: {
      default: '#0D1B2A',
      paper: '#1B2E45',
    },
    text: {
      primary: '#FFFFFF',
      secondary: 'rgba(255, 255, 255, 0.7)',
      disabled: 'rgba(255, 255, 255, 0.5)',
    },
  },
});

export default dertourTheme;
