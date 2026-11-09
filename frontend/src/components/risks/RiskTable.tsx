/**
 * RiskTable.tsx - Risk Table Component
 * 
 * Displays a filterable table of risks with:
 * - Color-coded severity chips
 * - Status chips
 * - Impact score badges
 * - Action buttons for submitting decisions and viewing initiatives
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Button,
  Box,
  Typography,
  Tooltip,
  LinearProgress,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Gavel as DecisionIcon,
} from '@mui/icons-material';
import { Risk, RiskSeverity, RiskStatus } from '../../types/api.types';
import { formatDate } from '../../utils/formatters';

// Severity color mapping
const SEVERITY_COLORS: Record<RiskSeverity, { bg: string; color: string; border: string }> = {
  [RiskSeverity.CRITICAL]: { bg: '#FFEBEE', color: '#C62828', border: '#E4002B' },
  [RiskSeverity.HIGH]: { bg: '#FFF3E0', color: '#E65100', border: '#FF8200' },
  [RiskSeverity.MEDIUM]: { bg: '#FFF8E1', color: '#F57F17', border: '#FFC107' },
  [RiskSeverity.LOW]: { bg: '#E8F5E9', color: '#2E7D32', border: '#28A745' },
};

// Status color mapping
const STATUS_COLORS: Record<RiskStatus, { bg: string; color: string }> = {
  [RiskStatus.IDENTIFIED]: { bg: '#E3F2FD', color: '#1565C0' },
  [RiskStatus.ASSESSING]: { bg: '#FFF3E0', color: '#E65100' },
  [RiskStatus.MITIGATING]: { bg: '#E8F5E9', color: '#2E7D32' },
  [RiskStatus.MONITORING]: { bg: '#E0F7FA', color: '#00838F' },
  [RiskStatus.CLOSED]: { bg: '#F5F5F5', color: '#616161' },
  [RiskStatus.ESCALATED]: { bg: '#FFEBEE', color: '#C62828' },
};

interface RiskTableProps {
  risks: Risk[];
  onSubmitDecision: (risk: Risk) => void;
  isLoading?: boolean;
}

const RiskTable: React.FC<RiskTableProps> = ({ risks, onSubmitDecision, isLoading = false }) => {
  const navigate = useNavigate();

  const handleViewInitiative = (initiativeId: string) => {
    navigate(`/initiatives/${initiativeId}`);
  };

  const getSeverityColor = (severity: RiskSeverity) => SEVERITY_COLORS[severity];
  const getStatusColor = (status: RiskStatus) => STATUS_COLORS[status];

  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress sx={{ mb: 2 }} />
        <Typography variant="body2" color="text.secondary" align="center">
          Loading risks...
        </Typography>
      </Box>
    );
  }

  if (risks.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No risks found
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Try adjusting your filters to see more results
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer component={Paper} sx={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <Table size="small">
        <TableHead>
          <TableRow sx={{ backgroundColor: '#F5F5F5' }}>
            <TableCell sx={{ fontWeight: 600, color: '#003087' }}>Risk Title</TableCell>
            <TableCell sx={{ fontWeight: 600, color: '#003087' }}>Initiative</TableCell>
            <TableCell sx={{ fontWeight: 600, color: '#003087' }}>Category</TableCell>
            <TableCell sx={{ fontWeight: 600, color: '#003087' }}>Severity</TableCell>
            <TableCell sx={{ fontWeight: 600, color: '#003087' }}>Status</TableCell>
            <TableCell sx={{ fontWeight: 600, color: '#003087' }} align="center">Impact Score</TableCell>
            <TableCell sx={{ fontWeight: 600, color: '#003087' }}>Mitigation Target</TableCell>
            <TableCell sx={{ fontWeight: 600, color: '#003087' }} align="center">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {risks.map((risk) => {
            const severityStyle = getSeverityColor(risk.severity);
            const statusStyle = getStatusColor(risk.status);

            return (
              <TableRow
                key={risk.id}
                hover
                sx={{
                  '&:last-child td, &:last-child th': { border: 0 },
                  backgroundColor: risk.status === RiskStatus.ESCALATED ? 'rgba(228, 0, 43, 0.05)' : 'inherit',
                }}
              >
                <TableCell>
                  <Typography variant="body2" fontWeight={500}>
                    {risk.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', maxWidth: 200 }} noWrap>
                    {risk.description}
                  </Typography>
                </TableCell>
                <TableCell>
                  {risk.initiative ? (
                    <Chip
                      label={risk.initiative.code}
                      size="small"
                      onClick={() => handleViewInitiative(risk.initiativeId)}
                      sx={{
                        backgroundColor: '#E3F2FD',
                        color: '#1565C0',
                        cursor: 'pointer',
                        '&:hover': { backgroundColor: '#BBDEFB' },
                      }}
                    />
                  ) : (
                    <Typography variant="caption" color="text.secondary">
                      Unknown
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                    {risk.category.toLowerCase().replace('_', ' ')}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={risk.severity}
                    size="small"
                    sx={{
                      backgroundColor: severityStyle.bg,
                      color: severityStyle.color,
                      border: `1px solid ${severityStyle.border}`,
                      fontWeight: 500,
                      textTransform: 'capitalize',
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={risk.status.replace('_', ' ')}
                    size="small"
                    sx={{
                      backgroundColor: statusStyle.bg,
                      color: statusStyle.color,
                      fontWeight: 500,
                      textTransform: 'capitalize',
                    }}
                  />
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={risk.score.toFixed(2)}
                    size="small"
                    sx={{
                      backgroundColor: risk.score >= 0.6 ? '#FFEBEE' : risk.score >= 0.3 ? '#FFF3E0' : '#E8F5E9',
                      color: risk.score >= 0.6 ? '#C62828' : risk.score >= 0.3 ? '#E65100' : '#2E7D32',
                      fontWeight: 600,
                      minWidth: 50,
                    }}
                  />
                </TableCell>
                <TableCell>
                  {risk.mitigationTargetDate ? (
                    <Typography variant="body2">
                      {formatDate(risk.mitigationTargetDate)}
                    </Typography>
                  ) : (
                    <Typography variant="caption" color="text.secondary">
                      Not set
                    </Typography>
                  )}
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                    <Tooltip title="Submit Decision">
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<DecisionIcon />}
                        onClick={() => onSubmitDecision(risk)}
                        sx={{
                          minWidth: 'auto',
                          px: 1.5,
                          py: 0.5,
                          fontSize: '0.75rem',
                          borderColor: '#003087',
                          color: '#003087',
                          '&:hover': {
                            backgroundColor: 'rgba(0, 48, 135, 0.05)',
                            borderColor: '#003087',
                          },
                        }}
                      >
                        Submit Decision
                      </Button>
                    </Tooltip>
                    <Tooltip title="View Initiative">
                      <IconButton
                        size="small"
                        onClick={() => handleViewInitiative(risk.initiativeId)}
                        sx={{ color: '#00A3E0' }}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default RiskTable;
