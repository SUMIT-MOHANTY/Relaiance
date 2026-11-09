/**
 * AgentActionsPage.tsx - Agent Actions Review UI
 * 
 * Card-based layout with three accordion sections:
 * - Pending Review (expanded by default)
 * - Approved
 * - Rejected
 * 
 * Features filter bar and create agent action drawer
 */

import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Badge,
  Chip,
  Grid,
  Paper,
  TextField,
  MenuItem,
  Slider,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Add as AddIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';

import { AppLayout } from '../components/layout/AppLayout';
import { AgentActionCard } from '../components/agent/AgentActionCard';
import { CreateAgentActionDrawer } from '../components/agent/CreateAgentActionDrawer';
import { useCurrentUser, useUserRole } from '../store/authStore';
import { agentActionApi } from '../services/agent.api';
import { AgentAction, AgentActionStatus, UserRole } from '../types/api.types';

// Mock data for agent actions
const MOCK_AGENT_ACTIONS: AgentAction[] = [
  {
    id: 'aa-001',
    initiativeId: 'INI-001',
    initiativeName: 'Digital Finance Transformation',
    actionType: 'RISK_MITIGATION',
    plan: 'Implement automated risk monitoring dashboard to track budget variance in real-time. Set up alerts for 10% threshold breaches and escalate to Finance Lead within 24 hours.',
    evidence: 'Historical data shows 73% of budget overruns were detected late. Early warning system could reduce variance by 40%.',
    confidenceScore: 0.87,
    status: 'PENDING',
    createdByName: 'AI Assistant',
    createdAt: '2024-02-15T10:30:00Z',
  },
  {
    id: 'aa-002',
    initiativeId: 'INI-003',
    initiativeName: 'Group ERP Rollout',
    actionType: 'MILESTONE_ACCELERATION',
    plan: 'Parallel track vendor negotiations with legal review to compress timeline by 2 weeks. Assign dedicated procurement liaison to unblock contract approvals.',
    evidence: 'Similar ERP projects show 15-day average savings with parallel processing. Vendor has confirmed availability for expedited review.',
    confidenceScore: 0.72,
    status: 'PENDING',
    createdByName: 'AI Assistant',
    createdAt: '2024-02-14T14:20:00Z',
  },
  {
    id: 'aa-003',
    initiativeId: 'INI-007',
    initiativeName: 'Customer Portal Enhancement',
    actionType: 'BUDGET_REALLOCATION',
    plan: 'Reallocate 15% of testing budget to development to address critical UX feedback. Move non-critical features to Phase 2 to maintain delivery date.',
    evidence: 'User testing revealed 68% of beta users found navigation confusing. Development team estimates 2-week fix with additional resources.',
    confidenceScore: 0.91,
    status: 'PENDING',
    createdByName: 'AI Assistant',
    createdAt: '2024-02-13T09:15:00Z',
  },
  {
    id: 'aa-004',
    initiativeId: 'INI-001',
    initiativeName: 'Digital Finance Transformation',
    actionType: 'STAKEHOLDER_ESCALATION',
    plan: 'Escalate resource conflict to Department Head for resolution. Schedule alignment meeting with IT and Finance leads within 48 hours.',
    evidence: 'Resource allocation conflict blocking 3 critical milestones. Previous attempts at resolution unsuccessful after 2 weeks.',
    confidenceScore: 0.65,
    status: 'PENDING',
    createdByName: 'AI Assistant',
    createdAt: '2024-02-12T16:45:00Z',
  },
  {
    id: 'aa-005',
    initiativeId: 'INI-003',
    initiativeName: 'Group ERP Rollout',
    actionType: 'RISK_MITIGATION',
    plan: 'Conduct third-party security audit before go-live. Engage external consultant to review access controls and data migration procedures.',
    evidence: 'Compliance requirements mandate security review. Historical ERP projects show 23% have post-launch security issues.',
    confidenceScore: 0.94,
    status: 'PENDING',
    createdByName: 'AI Assistant',
    createdAt: '2024-02-11T11:00:00Z',
  },
  {
    id: 'aa-006',
    initiativeId: 'INI-007',
    initiativeName: 'Customer Portal Enhancement',
    actionType: 'MILESTONE_ACCELERATION',
    plan: 'Deploy feature flags to enable gradual rollout. Start with 10% of users and monitor error rates before full deployment.',
    evidence: 'Feature flag approach reduced rollback incidents by 60% in previous releases. Infrastructure already supports gradual rollout.',
    confidenceScore: 0.89,
    status: 'APPROVED',
    createdByName: 'AI Assistant',
    createdAt: '2024-02-10T13:30:00Z',
    approvedAt: '2024-02-11T09:00:00Z',
    approvedByName: 'Sarah Executive',
  },
  {
    id: 'aa-007',
    initiativeId: 'INI-001',
    initiativeName: 'Digital Finance Transformation',
    actionType: 'BUDGET_REALLOCATION',
    plan: 'Increase training budget by 25% to ensure user adoption. Schedule mandatory training sessions 2 weeks before go-live.',
    evidence: 'Adoption metrics show strong correlation between training hours and user satisfaction. Current budget insufficient for required coverage.',
    confidenceScore: 0.78,
    status: 'APPROVED',
    createdByName: 'AI Assistant',
    createdAt: '2024-02-09T10:00:00Z',
    approvedAt: '2024-02-10T14:00:00Z',
    approvedByName: 'Sarah Executive',
  },
  {
    id: 'aa-008',
    initiativeId: 'INI-003',
    initiativeName: 'Group ERP Rollout',
    actionType: 'STAKEHOLDER_ESCALATION',
    plan: 'Delay go-live by 4 weeks to address integration issues with legacy systems. Notify all stakeholders of revised timeline.',
    evidence: 'Integration testing revealed 12 critical defects. Attempting go-live on schedule would risk 40% of core functionality.',
    confidenceScore: 0.52,
    status: 'REJECTED',
    createdByName: 'AI Assistant',
    createdAt: '2024-02-08T15:00:00Z',
    rejectedAt: '2024-02-09T11:00:00Z',
    rejectedByName: 'Sarah Executive',
    rejectionReason: 'Delay not acceptable for Q2 reporting. Find alternative solutions to address integration issues without timeline impact.',
  },
];

interface Filters {
  status: AgentActionStatus | 'ALL';
  initiativeId: string;
  minConfidence: number;
  maxConfidence: number;
  dateFrom: string;
  dateTo: string;
}

export const AgentActionsPage: React.FC = () => {
  const currentUser = useCurrentUser();
  const userRole = useUserRole();
  const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    status: 'ALL',
    initiativeId: '',
    minConfidence: 0,
    maxConfidence: 100,
    dateFrom: '',
    dateTo: '',
  });

  // Fetch agent actions
  const { data: agentActions, isLoading, error, refetch } = useQuery({
    queryKey: ['agent-actions', filters],
    queryFn: async () => {
      try {
        const response = await agentActionApi.listAgentActions({
          status: filters.status === 'ALL' ? undefined : filters.status,
          initiativeId: filters.initiativeId || undefined,
        });
        return response.data || MOCK_AGENT_ACTIONS;
      } catch {
        return MOCK_AGENT_ACTIONS;
      }
    },
    initialData: MOCK_AGENT_ACTIONS,
  });

  // Filter actions based on confidence score and date
  const filteredActions = useMemo(() => {
    return (agentActions || []).filter((action) => {
      const confidencePercent = action.confidenceScore * 100;
      if (confidencePercent < filters.minConfidence || confidencePercent > filters.maxConfidence) {
        return false;
      }
      if (filters.dateFrom && new Date(action.createdAt) < new Date(filters.dateFrom)) {
        return false;
      }
      if (filters.dateTo && new Date(action.createdAt) > new Date(filters.dateTo)) {
        return false;
      }
      return true;
    });
  }, [agentActions, filters]);

  // Group actions by status
  const pendingActions = filteredActions.filter((a) => a.status === 'PENDING');
  const approvedActions = filteredActions.filter((a) => a.status === 'APPROVED');
  const rejectedActions = filteredActions.filter((a) => a.status === 'REJECTED');

  // Check if user can create actions
  const canCreateAction = userRole === 'FINANCE_USER' || userRole === 'TEAM_MEMBER' || userRole === 'SYSTEM_ADMIN';

  const handleActionStatusChange = () => {
    refetch();
  };

  const handleCreateSuccess = () => {
    setCreateDrawerOpen(false);
    refetch();
  };

  if (isLoading) {
    return (
      <AppLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <Alert severity="error" sx={{ m: 3 }}>
          Failed to load agent actions. Please try again.
        </Alert>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 600, color: '#003087', mb: 0.5 }}>
              Agent Actions — Pending Review
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Review and approve AI-generated action recommendations
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Badge badgeContent={pendingActions.length} color="error" sx={{ mr: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Pending
              </Typography>
            </Badge>
            {canCreateAction && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setCreateDrawerOpen(true)}
                sx={{
                  bgcolor: '#00A8A8',
                  '&:hover': { bgcolor: '#007676' },
                  textTransform: 'none',
                }}
              >
                Create Agent Action
              </Button>
            )}
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Filter Bar */}
        <Paper elevation={0} sx={{ p: 2, mb: 3, border: '1px solid #E0E0E0', borderRadius: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <FilterIcon fontSize="small" />
            <Typography variant="subtitle2" fontWeight={600}>
              Filters
            </Typography>
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                fullWidth
                size="small"
                label="Status"
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value as AgentActionStatus | 'ALL' })}
              >
                <MenuItem value="ALL">All Statuses</MenuItem>
                <MenuItem value="PENDING">Pending</MenuItem>
                <MenuItem value="APPROVED">Approved</MenuItem>
                <MenuItem value="REJECTED">Rejected</MenuItem>
                <MenuItem value="EXECUTED">Executed</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                fullWidth
                size="small"
                label="Initiative"
                value={filters.initiativeId}
                onChange={(e) => setFilters({ ...filters, initiativeId: e.target.value })}
              >
                <MenuItem value="">All Initiatives</MenuItem>
                <MenuItem value="INI-001">Digital Finance Transformation</MenuItem>
                <MenuItem value="INI-003">Group ERP Rollout</MenuItem>
                <MenuItem value="INI-007">Customer Portal Enhancement</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="caption" color="text.secondary">
                Confidence Score: {filters.minConfidence}% - {filters.maxConfidence}%
              </Typography>
              <Slider
                value={[filters.minConfidence, filters.maxConfidence]}
                onChange={(_, value) => {
                  const [min, max] = value as number[];
                  setFilters({ ...filters, minConfidence: min, maxConfidence: max });
                }}
                valueLabelDisplay="auto"
                min={0}
                max={100}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                size="small"
                label="Date From"
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Accordion Sections */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Pending Review Section */}
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="h6" fontWeight={600}>
                  Pending Review
                </Typography>
                <Chip
                  label={pendingActions.length}
                  color="warning"
                  size="small"
                  sx={{ fontWeight: 600 }}
                />
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              {pendingActions.length > 0 ? (
                <Grid container spacing={2}>
                  {pendingActions.map((action) => (
                    <Grid item xs={12} md={6} key={action.id}>
                      <AgentActionCard
                        action={action}
                        onStatusChange={handleActionStatusChange}
                      />
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Alert severity="info">No pending actions to review</Alert>
              )}
            </AccordionDetails>
          </Accordion>

          {/* Approved Section */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="h6" fontWeight={600}>
                  Approved
                </Typography>
                <Chip
                  label={approvedActions.length}
                  color="success"
                  size="small"
                  sx={{ fontWeight: 600 }}
                />
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              {approvedActions.length > 0 ? (
                <Grid container spacing={2}>
                  {approvedActions.map((action) => (
                    <Grid item xs={12} md={6} key={action.id}>
                      <AgentActionCard
                        action={action}
                        onStatusChange={handleActionStatusChange}
                      />
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Alert severity="info">No approved actions</Alert>
              )}
            </AccordionDetails>
          </Accordion>

          {/* Rejected Section */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="h6" fontWeight={600}>
                  Rejected
                </Typography>
                <Chip
                  label={rejectedActions.length}
                  color="error"
                  size="small"
                  sx={{ fontWeight: 600 }}
                />
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              {rejectedActions.length > 0 ? (
                <Grid container spacing={2}>
                  {rejectedActions.map((action) => (
                    <Grid item xs={12} md={6} key={action.id}>
                      <AgentActionCard
                        action={action}
                        onStatusChange={handleActionStatusChange}
                      />
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Alert severity="info">No rejected actions</Alert>
              )}
            </AccordionDetails>
          </Accordion>
        </Box>
      </Box>

      {/* Create Agent Action Drawer */}
      <CreateAgentActionDrawer
        open={createDrawerOpen}
        onClose={() => setCreateDrawerOpen(false)}
        onSuccess={handleCreateSuccess}
      />
    </AppLayout>
  );
};

export default AgentActionsPage;
