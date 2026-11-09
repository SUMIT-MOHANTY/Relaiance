/**
 * RisksBlockersPage.tsx - Risks & Blockers Page
 * 
 * Main page for viewing and managing risks across the portfolio.
 * Features:
 * - Filter bar with severity multi-select, status filter, initiative dropdown, and search
 * - Risk table with color-coded severity/status chips
 * - Submit Decision modal for logging decisions
 * - Blocked Work panel showing blocked initiatives
 * - Export functionality
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Chip,
  OutlinedInput,
  Alert,
  Snackbar,
  CircularProgress,
} from '@mui/material';
import {
  FilterList as FilterIcon,
  Download as DownloadIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import AppLayout from '../components/layout/AppLayout';
import RiskTable from '../components/risks/RiskTable';
import SubmitDecisionModal from '../components/risks/SubmitDecisionModal';
import BlockedWorkPanel from '../components/risks/BlockedWorkPanel';
import { Risk, RiskSeverity, RiskStatus, BlockedWorkItem } from '../types/api.types';
import { getRisks, getBlockedWork, exportBlockedWork, downloadCsv } from '../services/reporting.api';
import { useInitiatives } from '../hooks/useInitiatives';

// Mock data for development
const MOCK_RISKS: Risk[] = [
  {
    id: 'risk-001',
    initiativeId: 'ini-001',
    initiative: { id: 'ini-001', code: 'INI-001', title: 'Digital Transformation', description: '', status: 'ACTIVE' as any, priority: 'HIGH' as any, department: 'IT', ownerId: 'user-1', progressPercentage: 45, health: 'YELLOW', createdAt: '', updatedAt: '' },
    title: 'Vendor delivery delay on critical component',
    description: 'Primary vendor has indicated potential 3-week delay on core platform delivery',
    category: 'EXTERNAL' as any,
    severity: RiskSeverity.CRITICAL,
    probability: 0.8,
    impact: 0.9,
    status: RiskStatus.ESCALATED,
    mitigationPlan: 'Engage backup vendor, expedite internal development',
    mitigationTargetDate: '2024-02-15',
    ownerId: 'user-1',
    owner: { id: 'user-1', email: 'john@dertour.com', firstName: 'John', lastName: 'Smith', role: 'FINANCE_USER' as any, isActive: true, createdAt: '', updatedAt: '' },
    escalatedTo: 'cto@dertour.com',
    escalatedAt: '2024-01-10T10:00:00Z',
    score: 0.72,
    createdAt: '2024-01-05T08:00:00Z',
    updatedAt: '2024-01-10T10:00:00Z',
  },
  {
    id: 'risk-002',
    initiativeId: 'ini-002',
    initiative: { id: 'ini-002', code: 'INI-002', title: 'CRM Modernization', description: '', status: 'ACTIVE' as any, priority: 'MEDIUM' as any, department: 'Sales', ownerId: 'user-2', progressPercentage: 60, health: 'GREEN', createdAt: '', updatedAt: '' },
    title: 'Data migration complexity higher than estimated',
    description: 'Legacy CRM data structure requires more transformation effort',
    category: 'TECHNICAL' as any,
    severity: RiskSeverity.HIGH,
    probability: 0.7,
    impact: 0.6,
    status: RiskStatus.MITIGATING,
    mitigationPlan: 'Allocate additional data engineering resources',
    mitigationTargetDate: '2024-02-28',
    score: 0.42,
    createdAt: '2024-01-08T09:00:00Z',
    updatedAt: '2024-01-12T14:00:00Z',
  },
  {
    id: 'risk-003',
    initiativeId: 'ini-003',
    initiative: { id: 'ini-003', code: 'INI-003', title: 'Compliance Framework', description: '', status: 'ACTIVE' as any, priority: 'CRITICAL' as any, department: 'Legal', ownerId: 'user-3', progressPercentage: 30, health: 'RED', createdAt: '', updatedAt: '' },
    title: 'Regulatory requirements changed mid-project',
    description: 'New GDPR amendments require additional compliance features',
    category: 'COMPLIANCE' as any,
    severity: RiskSeverity.HIGH,
    probability: 1.0,
    impact: 0.8,
    status: RiskStatus.ASSESSING,
    score: 0.80,
    createdAt: '2024-01-10T11:00:00Z',
    updatedAt: '2024-01-10T11:00:00Z',
  },
  {
    id: 'risk-004',
    initiativeId: 'ini-001',
    initiative: { id: 'ini-001', code: 'INI-001', title: 'Digital Transformation', description: '', status: 'ACTIVE' as any, priority: 'HIGH' as any, department: 'IT', ownerId: 'user-1', progressPercentage: 45, health: 'YELLOW', createdAt: '', updatedAt: '' },
    title: 'Key stakeholder availability constraints',
    description: 'Business SME availability limited due to concurrent projects',
    category: 'OPERATIONAL' as any,
    severity: RiskSeverity.MEDIUM,
    probability: 0.6,
    impact: 0.5,
    status: RiskStatus.MONITORING,
    score: 0.30,
    createdAt: '2024-01-12T13:00:00Z',
    updatedAt: '2024-01-12T13:00:00Z',
  },
  {
    id: 'risk-005',
    initiativeId: 'ini-004',
    initiative: { id: 'ini-004', code: 'INI-004', title: 'Cost Optimization', description: '', status: 'ACTIVE' as any, priority: 'LOW' as any, department: 'Finance', ownerId: 'user-4', progressPercentage: 75, health: 'GREEN', createdAt: '', updatedAt: '' },
    title: 'Budget variance in Q1 forecast',
    description: 'Savings realization slower than projected',
    category: 'FINANCIAL' as any,
    severity: RiskSeverity.LOW,
    probability: 0.4,
    impact: 0.3,
    status: RiskStatus.IDENTIFIED,
    score: 0.12,
    createdAt: '2024-01-15T09:00:00Z',
    updatedAt: '2024-01-15T09:00:00Z',
  },
];

const MOCK_BLOCKED_WORK: BlockedWorkItem[] = [
  {
    initiativeId: 'ini-001',
    initiativeName: 'Digital Transformation',
    initiativeCode: 'INI-001',
    blockingEntityType: 'RISK',
    blockingEntityTitle: 'Vendor delivery delay on critical component',
    blockingEntityId: 'risk-001',
    daysBlocked: 18,
    ownerId: 'user-1',
    ownerName: 'John Smith',
  },
  {
    initiativeId: 'ini-005',
    initiativeName: 'Cloud Migration',
    initiativeCode: 'INI-005',
    blockingEntityType: 'MILESTONE',
    blockingEntityTitle: 'Security audit approval pending',
    blockingEntityId: 'mile-001',
    daysBlocked: 7,
    ownerId: 'user-5',
    ownerName: 'Sarah Johnson',
  },
  {
    initiativeId: 'ini-003',
    initiativeName: 'Compliance Framework',
    initiativeCode: 'INI-003',
    blockingEntityType: 'DECISION',
    blockingEntityTitle: 'Legal team approval on data retention policy',
    blockingEntityId: 'dec-001',
    daysBlocked: 12,
    ownerId: 'user-3',
    ownerName: 'Michael Brown',
  },
  {
    initiativeId: 'ini-006',
    initiativeName: 'AI Analytics Platform',
    initiativeCode: 'INI-006',
    blockingEntityType: 'RISK',
    blockingEntityTitle: 'Data privacy concerns from compliance review',
    blockingEntityId: 'risk-006',
    daysBlocked: 45,
    ownerId: 'user-6',
    ownerName: 'Emily Davis',
  },
  {
    initiativeId: 'ini-007',
    initiativeName: 'Mobile App Redesign',
    initiativeCode: 'INI-007',
    blockingEntityType: 'MILESTONE',
    blockingEntityTitle: 'UX research completion',
    blockingEntityId: 'mile-002',
    daysBlocked: 3,
    ownerId: 'user-7',
    ownerName: 'David Wilson',
  },
];

const RisksBlockersPage: React.FC = () => {
  // Filter states
  const [selectedSeverities, setSelectedSeverities] = useState<RiskSeverity[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<RiskStatus[]>([]);
  const [selectedInitiative, setSelectedInitiative] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal state
  const [selectedRisk, setSelectedRisk] = useState<Risk | null>(null);
  const [isDecisionModalOpen, setIsDecisionModalOpen] = useState(false);

  // Notification state
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Fetch data
  const { data: initiatives = [] } = useInitiatives();
  
  const { data: risks = MOCK_RISKS, isLoading: isLoadingRisks } = useQuery({
    queryKey: ['risks', selectedSeverities, selectedStatuses, selectedInitiative, searchQuery],
    queryFn: () => getRisks({
      severities: selectedSeverities.length > 0 ? selectedSeverities : undefined,
      statuses: selectedStatuses.length > 0 ? selectedStatuses : undefined,
      initiativeId: selectedInitiative || undefined,
      search: searchQuery || undefined,
    }),
    placeholderData: MOCK_RISKS,
  });

  const { data: blockedWork = MOCK_BLOCKED_WORK, isLoading: isLoadingBlockedWork } = useQuery({
    queryKey: ['blockedWork'],
    queryFn: getBlockedWork,
    placeholderData: MOCK_BLOCKED_WORK,
  });

  // Filter risks locally for demo
  const filteredRisks = risks.filter(risk => {
    if (selectedSeverities.length > 0 && !selectedSeverities.includes(risk.severity)) return false;
    if (selectedStatuses.length > 0 && !selectedStatuses.includes(risk.status)) return false;
    if (selectedInitiative && risk.initiativeId !== selectedInitiative) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        risk.title.toLowerCase().includes(query) ||
        risk.description.toLowerCase().includes(query) ||
        risk.initiative?.title.toLowerCase().includes(query) ||
        risk.initiative?.code.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const handleSubmitDecision = (risk: Risk) => {
    setSelectedRisk(risk);
    setIsDecisionModalOpen(true);
  };

  const handleDecisionSuccess = () => {
    setSnackbar({
      open: true,
      message: 'Decision submitted successfully',
      severity: 'success',
    });
  };

  const handleExportBlockedWork = async () => {
    try {
      const blob = await exportBlockedWork();
      downloadCsv(blob, `blocked-work-${new Date().toISOString().split('T')[0]}.csv`);
      setSnackbar({
        open: true,
        message: 'Blocked work exported successfully',
        severity: 'success',
      });
    } catch (error) {
      // Fallback: export mock data as JSON
      const csvContent = convertToCSV(blockedWork);
      const blob = new Blob([csvContent], { type: 'text/csv' });
      downloadCsv(blob, `blocked-work-${new Date().toISOString().split('T')[0]}.csv`);
      setSnackbar({
        open: true,
        message: 'Blocked work exported (demo data)',
        severity: 'success',
      });
    }
  };

  const convertToCSV = (data: BlockedWorkItem[]): string => {
    const headers = ['Initiative Code', 'Initiative Name', 'Blocking Type', 'Blocking Entity', 'Days Blocked', 'Owner'];
    const rows = data.map(item => [
      item.initiativeCode,
      item.initiativeName,
      item.blockingEntityType,
      item.blockingEntityTitle,
      item.daysBlocked.toString(),
      item.ownerName,
    ]);
    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  };

  return (
    <AppLayout>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" sx={{ color: '#003087', fontWeight: 600, mb: 0.5 }}>
            Risks & Blockers
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Flagged items requiring attention across the portfolio
          </Typography>
        </Box>

        {/* Filter Bar */}
        <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <FilterIcon sx={{ color: '#003087' }} />
            
            {/* Severity Multi-Select */}
            <FormControl sx={{ minWidth: 150 }} size="small">
              <InputLabel>Severity</InputLabel>
              <Select
                multiple
                value={selectedSeverities}
                onChange={(e) => setSelectedSeverities(e.target.value as RiskSeverity[])}
                input={<OutlinedInput label="Severity" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} size="small" />
                    ))}
                  </Box>
                )}
              >
                {Object.values(RiskSeverity).map((severity) => (
                  <MenuItem key={severity} value={severity}>
                    {severity}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Status Filter */}
            <FormControl sx={{ minWidth: 150 }} size="small">
              <InputLabel>Status</InputLabel>
              <Select
                multiple
                value={selectedStatuses}
                onChange={(e) => setSelectedStatuses(e.target.value as RiskStatus[])}
                input={<OutlinedInput label="Status" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value.replace('_', ' ')} size="small" />
                    ))}
                  </Box>
                )}
              >
                {Object.values(RiskStatus).map((status) => (
                  <MenuItem key={status} value={status}>
                    {status.replace('_', ' ')}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Initiative Dropdown */}
            <FormControl sx={{ minWidth: 200 }} size="small">
              <InputLabel>Initiative</InputLabel>
              <Select
                value={selectedInitiative}
                onChange={(e) => setSelectedInitiative(e.target.value)}
                label="Initiative"
              >
                <MenuItem value="">All Initiatives</MenuItem>
                {initiatives.map((initiative) => (
                  <MenuItem key={initiative.id} value={initiative.id}>
                    {initiative.code} - {initiative.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Search */}
            <TextField
              size="small"
              placeholder="Search risks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ minWidth: 200, flex: 1 }}
            />

            {/* Export Button */}
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleExportBlockedWork}
              sx={{
                borderColor: '#003087',
                color: '#003087',
                '&:hover': { backgroundColor: 'rgba(0, 48, 135, 0.05)' },
              }}
            >
              Export Blocked Work
            </Button>
          </Box>
        </Paper>

        {/* Risk Table */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ color: '#003087', fontWeight: 600, mb: 2 }}>
            <WarningIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Risk Register
          </Typography>
          <RiskTable
            risks={filteredRisks}
            onSubmitDecision={handleSubmitDecision}
            isLoading={isLoadingRisks}
          />
        </Box>

        {/* Blocked Work Panel */}
        <Box>
          <Typography variant="h6" sx={{ color: '#003087', fontWeight: 600, mb: 2 }}>
            Blocked Work
          </Typography>
          <BlockedWorkPanel blockedWork={blockedWork} isLoading={isLoadingBlockedWork} />
        </Box>
      </Box>

      {/* Submit Decision Modal */}
      <SubmitDecisionModal
        open={isDecisionModalOpen}
        onClose={() => setIsDecisionModalOpen(false)}
        risk={selectedRisk}
        onSuccess={handleDecisionSuccess}
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </AppLayout>
  );
};

export default RisksBlockersPage;
