/**
 * AuditLogPage.tsx - System Audit Log Sub-Panel
 * 
 * Displays a filterable, paginated audit log with:
 * - Filter bar: Entity Type, Actor, Action, Date Range
 * - Paginated table with expandable diff view
 * - Old/New value comparison with syntax highlighting
 */

import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Collapse,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useQuery } from '@tanstack/react-query';

import { AuditLog, AuditAction, EntityType } from '../../types/api.types';
import { getAuditLogs, getUsers } from '../../services/admin.api';
import { DERTOUR_COLORS } from '../../config/theme';

// Action chip colors
const ACTION_COLORS: Record<AuditAction, { bg: string; color: string }> = {
  [AuditAction.CREATE]: { bg: '#E8F5E9', color: '#2E7D32' },
  [AuditAction.UPDATE]: { bg: '#E3F2FD', color: '#1565C0' },
  [AuditAction.DELETE]: { bg: '#FFEBEE', color: '#C62828' },
};

// Entity type chip colors
const ENTITY_COLORS: Record<string, { bg: string; color: string }> = {
  [EntityType.INITIATIVE]: { bg: '#E3F2FD', color: '#1565C0' },
  [EntityType.MILESTONE]: { bg: '#F3E5F5', color: '#7B1FA2' },
  [EntityType.RISK]: { bg: '#FFF3E0', color: '#E65100' },
  [EntityType.DECISION]: { bg: '#E0F2F1', color: '#00695C' },
  [EntityType.BENEFIT]: { bg: '#E8F5E9', color: '#2E7D32' },
  [EntityType.ADOPTION_SIGNAL]: { bg: '#E1F5FE', color: '#0277BD' },
  [EntityType.AGENT_ACTION]: { bg: '#FCE4EC', color: '#C2185B' },
  [EntityType.USER]: { bg: '#EDE7F6', color: '#512DA8' },
  [EntityType.CONFIGURATION]: { bg: '#FFF8E1', color: '#F57F17' },
};

interface AuditLogRowProps {
  log: AuditLog;
}

const AuditLogRow: React.FC<AuditLogRowProps> = ({ log }) => {
  const [open, setOpen] = useState(false);

  const formatJSON = (obj: Record<string, unknown> | undefined): string => {
    if (!obj) return '{}';
    return JSON.stringify(obj, null, 2);
  };

  const getChangedKeys = (): string[] => {
    if (!log.oldValue || !log.newValue) return [];
    const oldKeys = Object.keys(log.oldValue);
    const newKeys = Object.keys(log.newValue);
    const allKeys = new Set([...oldKeys, ...newKeys]);
    return Array.from(allKeys).filter(
      (key) => log.oldValue?.[key] !== log.newValue?.[key]
    );
  };

  const changedKeys = getChangedKeys();

  return (
    <>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
        <TableCell>{log.actorName}</TableCell>
        <TableCell>
          <Chip
            label={log.entityType}
            size="small"
            sx={{
              backgroundColor: ENTITY_COLORS[log.entityType]?.bg || DERTOUR_COLORS.grey[300],
              color: ENTITY_COLORS[log.entityType]?.color || DERTOUR_COLORS.text.primary,
              fontWeight: 500,
              fontSize: '0.75rem',
            }}
          />
        </TableCell>
        <TableCell>{log.entityId.substring(0, 8)}...</TableCell>
        <TableCell>
          <Chip
            label={log.action}
            size="small"
            sx={{
              backgroundColor: ACTION_COLORS[log.action]?.bg,
              color: ACTION_COLORS[log.action]?.color,
              fontWeight: 600,
              fontSize: '0.75rem',
            }}
          />
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 2 }}>
              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                Change Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary" gutterBottom>
                    Old Value
                  </Typography>
                  <Paper
                    sx={{
                      p: 2,
                      backgroundColor: DERTOUR_COLORS.grey[100],
                      fontFamily: 'monospace',
                      fontSize: '0.75rem',
                      overflow: 'auto',
                      maxHeight: 300,
                    }}
                  >
                    <pre style={{ margin: 0 }}>{formatJSON(log.oldValue)}</pre>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary" gutterBottom>
                    New Value
                  </Typography>
                  <Paper
                    sx={{
                      p: 2,
                      backgroundColor: '#fff',
                      fontFamily: 'monospace',
                      fontSize: '0.75rem',
                      overflow: 'auto',
                      maxHeight: 300,
                      border: `1px solid ${DERTOUR_COLORS.grey[300]}`,
                    }}
                  >
                    <pre style={{ margin: 0 }}>
                      {log.newValue ? (
                        Object.entries(log.newValue).map(([key, value]) => (
                          <div
                            key={key}
                            style={{
                              color: changedKeys.includes(key) ? DERTOUR_COLORS.error : 'inherit',
                              fontWeight: changedKeys.includes(key) ? 600 : 400,
                            }}
                          >
                            &quot;{key}&quot;: {JSON.stringify(value)}
                            {changedKeys.includes(key) && ' ← changed'}
                          </div>
                        ))
                      ) : (
                        '{}'
                      )}
                    </pre>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

export const AuditLogPage: React.FC = () => {
  // Filter state
  const [filters, setFilters] = useState({
    entityTypes: [] as EntityType[],
    actorId: '',
    action: '' as AuditAction | '',
    fromDate: null as Date | null,
    toDate: null as Date | null,
  });
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  // Fetch users for actor dropdown
  const { data: usersData } = useQuery({
    queryKey: ['users', { limit: 100 }],
    queryFn: () => getUsers({ limit: 100 }),
  });

  // Fetch audit logs
  const { data: auditData, isLoading, error } = useQuery({
    queryKey: [
      'audit-logs',
      {
        entityTypes: filters.entityTypes.length > 0 ? filters.entityTypes : undefined,
        actorId: filters.actorId || undefined,
        action: filters.action || undefined,
        fromDate: filters.fromDate?.toISOString(),
        toDate: filters.toDate?.toISOString(),
        page: page + 1,
        limit: rowsPerPage,
      },
    ],
    queryFn: () =>
      getAuditLogs({
        entityTypes: filters.entityTypes.length > 0 ? filters.entityTypes : undefined,
        actorId: filters.actorId || undefined,
        action: (filters.action as AuditAction) || undefined,
        fromDate: filters.fromDate?.toISOString(),
        toDate: filters.toDate?.toISOString(),
        page: page + 1,
        limit: rowsPerPage,
      }),
  });

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleEntityTypeChange = (event: React.SelectChangeEvent<EntityType[]>) => {
    const value = event.target.value;
    setFilters((prev) => ({
      ...prev,
      entityTypes: typeof value === 'string' ? [value as EntityType] : value as EntityType[],
    }));
    setPage(0);
  };

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Failed to load audit logs: {(error as Error).message}
        </Alert>
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Typography variant="h4" sx={{ fontWeight: 600, color: DERTOUR_COLORS.primary, mb: 3 }}>
          System Audit Log
        </Typography>

        {/* Filter Bar */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Entity Type</InputLabel>
                <Select
                  multiple
                  value={filters.entityTypes}
                  onChange={handleEntityTypeChange}
                  label="Entity Type"
                  renderValue={(selected) => (selected as EntityType[]).join(', ')}
                >
                  {Object.values(EntityType).map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Actor</InputLabel>
                <Select
                  value={filters.actorId}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, actorId: e.target.value }))
                  }
                  label="Actor"
                >
                  <MenuItem value="">All Users</MenuItem>
                  {usersData?.data.map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.firstName} {user.lastName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Action</InputLabel>
                <Select
                  value={filters.action}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, action: e.target.value as AuditAction }))
                  }
                  label="Action"
                >
                  <MenuItem value="">All Actions</MenuItem>
                  {Object.values(AuditAction).map((action) => (
                    <MenuItem key={action} value={action}>
                      {action}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <DatePicker
                label="From Date"
                value={filters.fromDate}
                onChange={(date) =>
                  setFilters((prev) => ({ ...prev, fromDate: date }))
                }
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <DatePicker
                label="To Date"
                value={filters.toDate}
                onChange={(date) =>
                  setFilters((prev) => ({ ...prev, toDate: date }))
                }
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Audit Log Table */}
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: DERTOUR_COLORS.grey[100] }}>
                <TableCell width={50} />
                <TableCell sx={{ fontWeight: 600 }}>Timestamp</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Actor Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Entity Type</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Entity ID</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : auditData?.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      No audit logs found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                auditData?.data.map((log) => <AuditLogRow key={log.id} log={log} />)
              )}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={auditData?.total || 0}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[10, 20, 50]}
          />
        </TableContainer>
      </Box>
    </LocalizationProvider>
  );
};

export default AuditLogPage;
