/**
 * TeamDashboardPage.tsx - Team Member Dashboard
 * 
 * Split-panel layout with:
 * - Left: My Initiatives list with cards showing milestone progress and risk badges
 * - Right: Tabbed detail view with Milestones, Risks, Evidence, and Approvals tabs
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Tabs,
  Tab,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';

import { AppLayout } from '../components/layout/AppLayout';
import { InitiativeCard } from '../components/team/InitiativeCard';
import { MilestoneUpdateTab } from '../components/team/MilestoneUpdateTab';
import { EvidenceUploadTab } from '../components/team/EvidenceUploadTab';
import { ApprovalsTab } from '../components/team/ApprovalsTab';
import { useCurrentUser } from '../store/authStore';
import { initiativeApi } from '../services/initiative.api';
import { Initiative, Milestone, Risk } from '../types/api.types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`team-tabpanel-${index}`}
    aria-labelledby={`team-tab-${index}`}
  >
    {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
  </div>
);

// Mock data for team member initiatives
const MOCK_INITIATIVES: Initiative[] = [
  {
    id: 'INI-001',
    code: 'INI-001',
    title: 'Digital Finance Transformation',
    description: 'Modernizing finance operations through digital tools',
    status: 'ACTIVE',
    priority: 'HIGH',
    department: 'Finance',
    owner: { id: '1', firstName: 'John', lastName: 'Doe', email: 'john@dertour.com', role: 'TEAM_MEMBER' },
    milestones: [
      { id: 'm1', title: 'Phase 1: Assessment', status: 'COMPLETED', dueDate: '2024-01-15', completedDate: '2024-01-14' },
      { id: 'm2', title: 'Phase 2: Implementation', status: 'IN_PROGRESS', dueDate: '2024-03-15' },
      { id: 'm3', title: 'Phase 3: Rollout', status: 'NOT_STARTED', dueDate: '2024-06-01' },
    ] as Milestone[],
    risks: [
      { id: 'r1', title: 'Resource availability', severity: 'MEDIUM', status: 'OPEN' },
    ] as Risk[],
    budget: { planned: 500000, actual: 320000 },
    progress: 45,
    startDate: '2024-01-01',
    targetDate: '2024-06-30',
  },
  {
    id: 'INI-003',
    code: 'INI-003',
    title: 'Group ERP Rollout',
    description: 'Enterprise resource planning system deployment',
    status: 'AT_RISK',
    priority: 'CRITICAL',
    department: 'IT',
    owner: { id: '1', firstName: 'John', lastName: 'Doe', email: 'john@dertour.com', role: 'TEAM_MEMBER' },
    milestones: [
      { id: 'm4', title: 'Requirements Gathering', status: 'COMPLETED', dueDate: '2024-01-30', completedDate: '2024-01-28' },
      { id: 'm5', title: 'System Configuration', status: 'IN_PROGRESS', dueDate: '2024-02-28' },
      { id: 'm6', title: 'User Training', status: 'NOT_STARTED', dueDate: '2024-04-15' },
      { id: 'm7', title: 'Go-Live', status: 'NOT_STARTED', dueDate: '2024-05-01' },
    ] as Milestone[],
    risks: [
      { id: 'r2', title: 'Vendor delay risk', severity: 'CRITICAL', status: 'OPEN' },
      { id: 'r3', title: 'Integration complexity', severity: 'HIGH', status: 'OPEN' },
    ] as Risk[],
    budget: { planned: 1200000, actual: 850000 },
    progress: 35,
    startDate: '2024-01-01',
    targetDate: '2024-05-31',
  },
  {
    id: 'INI-007',
    code: 'INI-007',
    title: 'Customer Portal Enhancement',
    description: 'Improving customer self-service capabilities',
    status: 'ACTIVE',
    priority: 'MEDIUM',
    department: 'Digital',
    owner: { id: '1', firstName: 'John', lastName: 'Doe', email: 'john@dertour.com', role: 'TEAM_MEMBER' },
    milestones: [
      { id: 'm8', title: 'UX Research', status: 'COMPLETED', dueDate: '2024-02-01', completedDate: '2024-01-30' },
      { id: 'm9', title: 'Design Phase', status: 'COMPLETED', dueDate: '2024-02-28', completedDate: '2024-02-25' },
      { id: 'm10', title: 'Development', status: 'IN_PROGRESS', dueDate: '2024-04-30' },
      { id: 'm11', title: 'Testing', status: 'NOT_STARTED', dueDate: '2024-05-15' },
    ] as Milestone[],
    risks: [
      { id: 'r4', title: 'Third-party API changes', severity: 'LOW', status: 'OPEN' },
    ] as Risk[],
    budget: { planned: 300000, actual: 180000 },
    progress: 60,
    startDate: '2024-01-15',
    targetDate: '2024-06-15',
  },
];

export const TeamDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = useCurrentUser();
  const [selectedInitiative, setSelectedInitiative] = useState<Initiative | null>(MOCK_INITIATIVES[0]);
  const [activeTab, setActiveTab] = useState(0);

  // Fetch initiatives assigned to current user
  const { data: initiatives, isLoading, error } = useQuery({
    queryKey: ['my-initiatives', currentUser?.id],
    queryFn: async () => {
      try {
        const response = await initiativeApi.getMyInitiatives();
        return response.data || MOCK_INITIATIVES;
      } catch {
        return MOCK_INITIATIVES;
      }
    },
    initialData: MOCK_INITIATIVES,
  });

  const handleInitiativeSelect = (initiative: Initiative) => {
    setSelectedInitiative(initiative);
    setActiveTab(0);
  };

  const handleViewDetails = (initiativeId: string) => {
    navigate(`/initiatives/${initiativeId}`);
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
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
          Failed to load initiatives. Please try again.
        </Alert>
      </AppLayout>
    );
  }

  const userFirstName = currentUser?.firstName || 'Team Member';
  const initiativeCount = initiatives?.length || 0;

  return (
    <AppLayout>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 600, color: '#003087', mb: 0.5 }}>
            My Initiatives — {userFirstName}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            You have {initiativeCount} assigned {initiativeCount === 1 ? 'initiative' : 'initiatives'}
          </Typography>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Split Panel Layout */}
        <Grid container spacing={3}>
          {/* Left Panel - Initiative List */}
          <Grid item xs={12} md={4}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                height: 'calc(100vh - 220px)',
                overflow: 'auto',
                border: '1px solid #E0E0E0',
                borderRadius: 2,
              }}
            >
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                My Initiatives
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {initiatives?.map((initiative) => (
                  <InitiativeCard
                    key={initiative.id}
                    initiative={initiative}
                    isSelected={selectedInitiative?.id === initiative.id}
                    onSelect={() => handleInitiativeSelect(initiative)}
                    onViewDetails={() => handleViewDetails(initiative.id)}
                  />
                ))}
              </Box>
            </Paper>
          </Grid>

          {/* Right Panel - Detail View */}
          <Grid item xs={12} md={8}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                height: 'calc(100vh - 220px)',
                overflow: 'auto',
                border: '1px solid #E0E0E0',
                borderRadius: 2,
              }}
            >
              {selectedInitiative ? (
                <>
                  {/* Initiative Header */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h5" sx={{ fontWeight: 600, color: '#003087', mb: 1 }}>
                      {selectedInitiative.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedInitiative.code} • {selectedInitiative.department}
                    </Typography>
                  </Box>

                  <Divider sx={{ mb: 2 }} />

                  {/* Tabs */}
                  <Tabs
                    value={activeTab}
                    onChange={handleTabChange}
                    aria-label="Initiative detail tabs"
                    sx={{
                      '& .MuiTabs-indicator': { backgroundColor: '#00A8A8' },
                      '& .MuiTab-root': { textTransform: 'none', fontWeight: 500 },
                    }}
                  >
                    <Tab label="Milestones" id="team-tab-0" />
                    <Tab label="Risks" id="team-tab-1" />
                    <Tab label="Evidence & Uploads" id="team-tab-2" />
                    <Tab label="Approvals" id="team-tab-3" />
                  </Tabs>

                  {/* Tab Panels */}
                  <TabPanel value={activeTab} index={0}>
                    <MilestoneUpdateTab
                      initiativeId={selectedInitiative.id}
                      milestones={selectedInitiative.milestones || []}
                    />
                  </TabPanel>

                  <TabPanel value={activeTab} index={1}>
                    <Typography variant="body1" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                      Risks tab content - Use the Risks & Blockers page for full risk management
                    </Typography>
                  </TabPanel>

                  <TabPanel value={activeTab} index={2}>
                    <EvidenceUploadTab initiativeId={selectedInitiative.id} />
                  </TabPanel>

                  <TabPanel value={activeTab} index={3}>
                    <ApprovalsTab initiativeId={selectedInitiative.id} />
                  </TabPanel>
                </>
              ) : (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    color: 'text.secondary',
                  }}
                >
                  <Typography variant="h6">Select an initiative to view details</Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </AppLayout>
  );
};

export default TeamDashboardPage;
