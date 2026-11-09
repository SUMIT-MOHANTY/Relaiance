/**
 * InitiativeDetailPage.tsx - Detailed view of a single initiative
 * 
 * Features:
 * - Tabbed interface: Overview, Milestones, Risks, Decisions, Benefits, Adoption
 * - Dependency graph visualization
 * - Next actions panel
 * - Edit capabilities for each section
 */

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Breadcrumbs,
  Link,
  Chip,
  Button,
  Grid,
  Card,
  CardContent,
  Divider,
  Skeleton,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';

import { AppLayout } from '../components/layout/AppLayout';
import { MilestoneTab } from '../components/initiatives/MilestoneTab';
import { RiskTab } from '../components/initiatives/RiskTab';
import { DecisionTab } from '../components/initiatives/DecisionTab';
import { BenefitTab } from '../components/initiatives/BenefitTab';
import { AdoptionSignalTab } from '../components/initiatives/AdoptionSignalTab';
import { DependencyGraph } from '../components/initiatives/DependencyGraph';
import { getInitiativeById } from '../services/initiative.api';
import { getNextActions } from '../services/reporting.api';
import { InitiativeStatus, InitiativePriority } from '../types/api.types';

// ============================================================================
// TAB PANEL COMPONENT
// ============================================================================

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div role="tabpanel" hidden={value !== index} id={`tabpanel-${index}`}>
    {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
  </div>
);

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

  return (
    <Chip
      label={status.replace('_', ' ')}
      color={getColor() as 'success' | 'warning' | 'error' | 'default'}
      size="small"
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
    />
  );
};

// ============================================================================
// OVERVIEW TAB CONTENT
// ============================================================================

const OverviewTab: React.FC<{ initiativeId: string }> = ({ initiativeId }) => {
  const { data: initiative, isLoading } = useQuery({
    queryKey: ['initiative', initiativeId],
    queryFn: () => getInitiativeById(initiativeId),
  });

  const { data: nextActions } = useQuery({
    queryKey: ['next-actions', initiativeId],
    queryFn: () => getNextActions(5),
  });

  if (isLoading) {
    return (
      <Box>
        <Skeleton variant="rectangular" height={200} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={150} />
      </Box>
    );
  }

  if (!initiative) {
    return (
      <Typography color="error">Failed to load initiative details</Typography>
    );
  }

  return (
    <Grid container spacing={3}>
      {/* Left Column - Details */}
      <Grid item xs={12} md={8}>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Description
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {initiative.description}
            </Typography>

            <Divider sx={{ my: 3 }} />

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">
                  Owner
                </Typography>
                <Typography variant="body1">
                  {initiative.owner
                    ? `${initiative.owner.firstName} ${initiative.owner.lastName}`
                    : 'Unassigned'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">
                  Department
                </Typography>
                <Typography variant="body1">{initiative.department}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">
                  Start Date
                </Typography>
                <Typography variant="body1">
                  {initiative.startDate
                    ? new Date(initiative.startDate).toLocaleDateString()
                    : 'Not set'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">
                  Target End Date
                </Typography>
                <Typography variant="body1">
                  {initiative.targetDate
                    ? new Date(initiative.targetDate).toLocaleDateString()
                    : 'Not set'}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Dependency Graph */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Dependency Graph
            </Typography>
            <DependencyGraph initiativeId={initiativeId} />
          </CardContent>
        </Card>
      </Grid>

      {/* Right Column - Budget & Actions */}
      <Grid item xs={12} md={4}>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Budget
            </Typography>
            <Box mb={2}>
              <Typography variant="caption" color="text.secondary">
                Total Budget
              </Typography>
              <Typography variant="h5">
                €{((initiative.budget ?? 0) / 1000000).toFixed(2)}M
              </Typography>
            </Box>
            <Box mb={2}>
              <Typography variant="caption" color="text.secondary">
                Actual Spend
              </Typography>
              <Typography variant="h5" color="primary.main">
                €{((initiative.actualSpend ?? 0) / 1000000).toFixed(2)}M
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Remaining
              </Typography>
              <Typography
                variant="h5"
                color={
                  (initiative.budget ?? 0) - (initiative.actualSpend ?? 0) > 0
                    ? 'success.main'
                    : 'error.main'
                }
              >
                €{(((initiative.budget ?? 0) - (initiative.actualSpend ?? 0)) / 1000000).toFixed(2)}M
              </Typography>
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Next Actions
            </Typography>
            {nextActions && nextActions.length > 0 ? (
              nextActions.map((action) => (
                <Box key={action.id} sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <Typography variant="subtitle2" fontWeight={600}>
                    {action.actionType.replace('_', ' ')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {action.description}
                  </Typography>
                  {action.dueDate && (
                    <Typography variant="caption" color="error">
                      Due: {new Date(action.dueDate).toLocaleDateString()}
                    </Typography>
                  )}
                </Box>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">
                No pending actions
              </Typography>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const InitiativeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);

  const { data: initiative, isLoading } = useQuery({
    queryKey: ['initiative', id],
    queryFn: () => getInitiativeById(id!),
    enabled: !!id,
  });

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  if (isLoading) {
    return (
      <AppLayout>
        <Box sx={{ p: 3 }}>
          <Skeleton variant="text" width="50%" height={40} />
          <Skeleton variant="rectangular" height={400} sx={{ mt: 3 }} />
        </Box>
      </AppLayout>
    );
  }

  if (!initiative) {
    return (
      <AppLayout>
        <Box sx={{ p: 3 }}>
          <Typography color="error">Initiative not found</Typography>
        </Box>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Box sx={{ p: 3 }}>
        {/* Breadcrumb */}
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link
            component="button"
            variant="body2"
            onClick={() => navigate('/portfolio')}
            sx={{ textDecoration: 'none', color: 'primary.main' }}
          >
            Portfolio
          </Link>
          <Typography color="text.primary">{initiative.title}</Typography>
        </Breadcrumbs>

        {/* Header */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="flex-start"
          mb={3}
        >
          <Box>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/portfolio')}
              sx={{ mb: 1, pl: 0 }}
            >
              Back to Portfolio
            </Button>
            <Box display="flex" alignItems="center" gap={2}>
              <Typography variant="h4" fontWeight={600}>
                {initiative.title}
              </Typography>
              <StatusChip status={initiative.status} />
              <PriorityChip priority={initiative.priority} />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {initiative.code}
            </Typography>
          </Box>
          <Button variant="outlined" startIcon={<EditIcon />}>
            Edit
          </Button>
        </Box>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="Overview" />
            <Tab label="Milestones" />
            <Tab label="Risks" />
            <Tab label="Decisions" />
            <Tab label="Benefits" />
            <Tab label="Adoption" />
          </Tabs>
        </Box>

        {/* Tab Panels */}
        <TabPanel value={activeTab} index={0}>
          <OverviewTab initiativeId={id!} />
        </TabPanel>
        <TabPanel value={activeTab} index={1}>
          <MilestoneTab initiativeId={id!} />
        </TabPanel>
        <TabPanel value={activeTab} index={2}>
          <RiskTab initiativeId={id!} />
        </TabPanel>
        <TabPanel value={activeTab} index={3}>
          <DecisionTab initiativeId={id!} />
        </TabPanel>
        <TabPanel value={activeTab} index={4}>
          <BenefitTab initiativeId={id!} />
        </TabPanel>
        <TabPanel value={activeTab} index={5}>
          <AdoptionSignalTab initiativeId={id!} />
        </TabPanel>
      </Box>
    </AppLayout>
  );
};

export default InitiativeDetailPage;
