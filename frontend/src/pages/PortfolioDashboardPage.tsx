/**
 * PortfolioDashboardPage.tsx - Main portfolio dashboard for Finance users
 * 
 * Features:
 * - KPI strip with executive metrics
 * - Filterable, sortable, searchable initiative table
 * - New Initiative drawer
 * - Navigation to initiative detail
 */

import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  LinearProgress,
  IconButton,
  Tooltip,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  InputAdornment,
  Skeleton,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  Block as BlockIcon,
  Speed as SpeedIcon,
  AccountBalance as AccountBalanceIcon,
} from '@mui/icons-material';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { DataGrid, GridColDef, GridRenderCellParams, GridPaginationModel, GridSortModel } from '@mui/x-data-grid';

import AppLayout from '../components/layout/AppLayout';
import { useToast } from '../components/common/ToastProvider';
import { NewInitiativeDrawer } from '../components/initiatives/NewInitiativeDrawer';
import { getInitiatives } from '../services/initiative.api';
import { getExecutiveDashboard } from '../services/reporting.api';
import {
  Initiative,
  InitiativeStatus,
  InitiativePriority,
  ExecutiveDashboardKPIs,
} from '../types/api.types';
import { STATUS_COLORS } from '../config/theme';

// ============================================================================
// KPI CARD COMPONENT
// ============================================================================

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color: 'primary' | 'success' | 'warning' | 'error' | 'info';
  loading?: boolean;
}

const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  subtitle,
  icon,
  color,
  loading = false,
}) => {
  const colorMap = {
    primary: '#00A8A8',
    success: '#388E3C',
    warning: '#F57C00',
    error: '#D32F2F',
    info: '#0288D1',
  };

  if (loading) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" width="40%" height={40} />
          <Skeleton variant="text" width="80%" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ height: '100%', borderLeft: `4px solid ${colorMap[color]}` }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box flex={1}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight="600" color={colorMap[color]}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              p: 1,
              borderRadius: 2,
              bgcolor: `${colorMap[color]}15`,
              color: colorMap[color],
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

// ============================================================================
// STATUS CHIP COMPONENT
// ============================================================================

const StatusChip: React.FC<{ status: InitiativeStatus }> = ({ status }) => {
  const getColor = () => {
    switch (status) {
      case InitiativeStatus.ACTIVE:
        return 'success';
      case InitiativeStatus.COMPLETED:
        return 'success';
      case InitiativeStatus.ON_HOLD:
        return 'warning';
      case InitiativeStatus.CANCELLED:
        return 'error';
      case InitiativeStatus.DRAFT:
        return 'default';
      default:
        return 'default';
    }
  };

  const getLabel = () => {
    return status.replace('_', ' ');
  };

  return (
    <Chip
      label={getLabel()}
      color={getColor() as 'success' | 'warning' | 'error' | 'default'}
      size="small"
      sx={{
        fontWeight: 500,
        textTransform: 'capitalize',
      }}
    />
  );
};

// ============================================================================
// PRIORITY CHIP COMPONENT
// ============================================================================

const PriorityChip: React.FC<{ priority: InitiativePriority }> = ({ priority }) => {
  const getColor = () => {
    switch (priority) {
      case InitiativePriority.CRITICAL:
        return 'error';
      case InitiativePriority.HIGH:
        return 'warning';
      case InitiativePriority.MEDIUM:
        return 'info';
      case InitiativePriority.LOW:
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <Chip
      label={priority}
      color={getColor() as 'error' | 'warning' | 'info' | 'success' | 'default'}
      size="small"
      variant="outlined"
      sx={{
        fontWeight: 500,
        textTransform: 'capitalize',
      }}
    />
  );
};

// ============================================================================
// HEALTH SCORE COMPONENT
// ============================================================================

const HealthScoreBadge: React.FC<{ score: number }> = ({ score }) => {
  const getColor = () => {
    if (score >= 70) return '#388E3C';
    if (score >= 40) return '#F57C00';
    return '#D32F2F';
  };

  return (
    <Box display="flex" alignItems="center" gap={1}>
      <Box
        sx={{
          width: 12,
          height: 12,
          borderRadius: '50%',
          bgcolor: getColor(),
        }}
      />
      <Typography variant="body2" fontWeight={500}>
        {score}
      </Typography>
    </Box>
  );
};

// ============================================================================
// BUDGET UTILIZATION COMPONENT
// ============================================================================

const BudgetUtilization: React.FC<{ used?: number; total?: number }> = ({ used, total }) => {
  if (!used || !total) {
    return <Typography variant="body2" color="text.secondary">—</Typography>;
  }

  const percentage = Math.round((used / total) * 100);
  const getColor = () => {
    if (percentage < 70) return 'success';
    if (percentage < 90) return 'warning';
    return 'error';
  };

  return (
    <Box width="100%">
      <Box display="flex" justifyContent="space-between" mb={0.5}>
        <Typography variant="caption" color="text.secondary">
          €{(used / 1000000).toFixed(1)}M / €{(total / 1000000).toFixed(1)}M
        </Typography>
        <Typography variant="caption" fontWeight={500}>
          {percentage}%
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={Math.min(percentage, 100)}
        color={getColor() as 'success' | 'warning' | 'error'}
        sx={{ height: 6, borderRadius: 3 }}
      />
    </Box>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const PortfolioDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  // State
  const [isNewInitiativeDrawerOpen, setIsNewInitiativeDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<InitiativeStatus | ''>('');
  const [priorityFilter, setPriorityFilter] = useState<InitiativePriority | ''>('');
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [sortModel, setSortModel] = useState<GridSortModel>([]);

  // Queries
  const { data: kpis, isLoading: kpisLoading } = useQuery({
    queryKey: ['executive-dashboard'],
    queryFn: getExecutiveDashboard,
  });

  const { data: initiativesData, isLoading: initiativesLoading } = useQuery({
    queryKey: [
      'initiatives',
      paginationModel.page,
      paginationModel.pageSize,
      sortModel[0]?.field,
      sortModel[0]?.sort,
      searchQuery,
      statusFilter,
      priorityFilter,
    ],
    queryFn: () =>
      getInitiatives({
        page: paginationModel.page + 1,
        pageSize: paginationModel.pageSize,
        sortBy: sortModel[0]?.field,
        sortOrder: sortModel[0]?.sort as 'asc' | 'desc',
        search: searchQuery || undefined,
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
      }),
  });

  // Handlers
  const handleRowClick = useCallback(
    (params: { id: string }) => {
      navigate(`/initiatives/${params.id}`);
    },
    [navigate]
  );

  const handleNewInitiativeSuccess = useCallback(() => {
    setIsNewInitiativeDrawerOpen(false);
    showToast('Initiative created successfully', 'success');
    queryClient.invalidateQueries({ queryKey: ['initiatives'] });
    queryClient.invalidateQueries({ queryKey: ['executive-dashboard'] });
  }, [queryClient, showToast]);

  // Table columns
  const columns: GridColDef<Initiative>[] = useMemo(
    () => [
      {
        field: 'title',
        headerName: 'Initiative Name',
        flex: 2,
        minWidth: 200,
        renderCell: (params: GridRenderCellParams<Initiative>) => (
          <Typography
            variant="body2"
            fontWeight={500}
            sx={{
              color: 'primary.main',
              cursor: 'pointer',
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            {params.row.title}
          </Typography>
        ),
      },
      {
        field: 'department',
        headerName: 'Department',
        flex: 1,
        minWidth: 120,
      },
      {
        field: 'status',
        headerName: 'Status',
        flex: 1,
        minWidth: 120,
        renderCell: (params: GridRenderCellParams<Initiative>) => (
          <StatusChip status={params.row.status} />
        ),
      },
      {
        field: 'priority',
        headerName: 'Priority',
        flex: 1,
        minWidth: 100,
        renderCell: (params: GridRenderCellParams<Initiative>) => (
          <PriorityChip priority={params.row.priority} />
        ),
      },
      {
        field: 'owner',
        headerName: 'Owner',
        flex: 1,
        minWidth: 150,
        valueGetter: (params: { row: Initiative }) =>
          params.row.owner
            ? `${params.row.owner.firstName} ${params.row.owner.lastName}`
            : '—',
      },
      {
        field: 'targetDate',
        headerName: 'Target End Date',
        flex: 1,
        minWidth: 130,
        valueGetter: (params: { row: Initiative }) =>
          params.row.targetDate
            ? new Date(params.row.targetDate).toLocaleDateString()
            : '—',
      },
      {
        field: 'budget',
        headerName: 'Budget Utilization',
        flex: 1.5,
        minWidth: 180,
        renderCell: (params: GridRenderCellParams<Initiative>) => (
          <BudgetUtilization used={params.row.actualSpend} total={params.row.budget} />
        ),
      },
      {
        field: 'healthScore',
        headerName: 'Health',
        flex: 0.8,
        minWidth: 100,
        renderCell: (params: GridRenderCellParams<Initiative>) => (
          <HealthScoreBadge score={params.row.progressPercentage} />
        ),
      },
    ],
    []
  );

  return (
    <AppLayout>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Typography variant="h4" fontWeight={600} color="primary.main">
            Portfolio Overview
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setIsNewInitiativeDrawerOpen(true)}
          >
            New Initiative
          </Button>
        </Box>

        {/* KPI Strip */}
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} sm={6} md={3}>
            <KPICard
              title="Total Initiatives"
              value={kpis?.totalInitiatives ?? 0}
              icon={<TrendingUpIcon />}
              color="primary"
              loading={kpisLoading}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <KPICard
              title="Blocked / At Risk"
              value={(kpis?.blockedCount ?? 0) + (kpis?.atRiskCount ?? 0)}
              subtitle={`${kpis?.blockedCount ?? 0} blocked, ${kpis?.atRiskCount ?? 0} at risk`}
              icon={<WarningIcon />}
              color="warning"
              loading={kpisLoading}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <KPICard
              title="Avg Adoption Rate"
              value={`${Math.round(kpis?.averageAdoptionRate ?? 0)}%`}
              icon={<SpeedIcon />}
              color="info"
              loading={kpisLoading}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <KPICard
              title="Benefits Realized"
              value={`${Math.round(
                ((kpis?.benefitsRealized ?? 0) / (kpis?.benefitsTarget ?? 1)) * 100
              )}%`}
              subtitle={`€${((kpis?.benefitsRealized ?? 0) / 1000000).toFixed(1)}M of €${(
                (kpis?.benefitsTarget ?? 0) / 1000000
              ).toFixed(1)}M`}
              icon={<AccountBalanceIcon />}
              color="success"
              loading={kpisLoading}
            />
          </Grid>
        </Grid>

        {/* Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
              <TextField
                placeholder="Search initiatives..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{ minWidth: 250 }}
                size="small"
              />
              <FormControl sx={{ minWidth: 150 }} size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(e: SelectChangeEvent) =>
                    setStatusFilter(e.target.value as InitiativeStatus | '')
                  }
                >
                  <MenuItem value="">All</MenuItem>
                  {Object.values(InitiativeStatus).map((status) => (
                    <MenuItem key={status} value={status}>
                      {status.replace('_', ' ')}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl sx={{ minWidth: 150 }} size="small">
                <InputLabel>Priority</InputLabel>
                <Select
                  value={priorityFilter}
                  label="Priority"
                  onChange={(e: SelectChangeEvent) =>
                    setPriorityFilter(e.target.value as InitiativePriority | '')
                  }
                >
                  <MenuItem value="">All</MenuItem>
                  {Object.values(InitiativePriority).map((priority) => (
                    <MenuItem key={priority} value={priority}>
                      {priority}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Box flex={1} />
              <Tooltip title="More filters">
                <IconButton>
                  <FilterIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </CardContent>
        </Card>

        {/* Data Grid */}
        <Card>
          <DataGrid
            rows={initiativesData?.data ?? []}
            columns={columns}
            loading={initiativesLoading}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            sortModel={sortModel}
            onSortModelChange={setSortModel}
            onRowClick={handleRowClick}
            pageSizeOptions={[10, 25, 50]}
            rowCount={initiativesData?.total ?? 0}
            paginationMode="server"
            sortingMode="server"
            disableRowSelectionOnClick
            sx={{
              border: 'none',
              '& .MuiDataGrid-cell:focus': {
                outline: 'none',
              },
            }}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 10 },
              },
            }}
          />
        </Card>
      </Box>

      {/* New Initiative Drawer */}
      <NewInitiativeDrawer
        open={isNewInitiativeDrawerOpen}
        onClose={() => setIsNewInitiativeDrawerOpen(false)}
        onSuccess={handleNewInitiativeSuccess}
      />
    </AppLayout>
  );
};

export default PortfolioDashboardPage;
