/**
 * BlockedWorkPanel.tsx - Blocked Work Panel Component
 * 
 * Displays a list of blocked initiative cards showing:
 * - Initiative name and code
 * - Blocking entity type badge (MILESTONE/RISK)
 * - Days blocked (highlighted in red if >14 days)
 * - Owner avatar
 * - View Details navigation
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Avatar,
  Button,
  Grid,
  Tooltip,
  Alert,
  Skeleton,
} from '@mui/material';
import {
  Flag as MilestoneIcon,
  Warning as RiskIcon,
  Gavel as DecisionIcon,
  Visibility as ViewIcon,
  AccessTime as TimeIcon,
} from '@mui/icons-material';
import { BlockedWorkItem, RiskSeverity } from '../../types/api.types';

interface BlockedWorkPanelProps {
  blockedWork: BlockedWorkItem[];
  isLoading?: boolean;
}

const BlockedWorkPanel: React.FC<BlockedWorkPanelProps> = ({ blockedWork, isLoading = false }) => {
  const navigate = useNavigate();

  const handleViewDetails = (initiativeId: string) => {
    navigate(`/initiatives/${initiativeId}`);
  };

  const getBlockingEntityIcon = (type: string) => {
    switch (type) {
      case 'MILESTONE':
        return <MilestoneIcon fontSize="small" />;
      case 'RISK':
        return <RiskIcon fontSize="small" />;
      case 'DECISION':
        return <DecisionIcon fontSize="small" />;
      default:
        return <RiskIcon fontSize="small" />;
    }
  };

  const getBlockingEntityColor = (type: string) => {
    switch (type) {
      case 'MILESTONE':
        return { bg: '#E3F2FD', color: '#1565C0' };
      case 'RISK':
        return { bg: '#FFEBEE', color: '#C62828' };
      case 'DECISION':
        return { bg: '#FFF3E0', color: '#E65100' };
      default:
        return { bg: '#F5F5F5', color: '#616161' };
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ p: 2 }}>
        {[1, 2, 3].map((i) => (
          <Card key={i} sx={{ mb: 2 }}>
            <CardContent>
              <Skeleton variant="text" width="60%" height={24} />
              <Skeleton variant="text" width="40%" height={20} sx={{ mt: 1 }} />
              <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                <Skeleton variant="rectangular" width={80} height={24} />
                <Skeleton variant="circular" width={32} height={32} />
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
    );
  }

  if (blockedWork.length === 0) {
    return (
      <Alert severity="success" sx={{ m: 2 }}>
        No blocked work items. All initiatives are progressing smoothly!
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Grid container spacing={2}>
        {blockedWork.map((item) => {
          const entityColors = getBlockingEntityColor(item.blockingEntityType);
          const isSeverelyBlocked = item.daysBlocked > 14;

          return (
            <Grid item xs={12} md={6} lg={4} key={`${item.initiativeId}-${item.blockingEntityId}`}>
              <Card
                sx={{
                  borderRadius: 2,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  border: isSeverelyBlocked ? '1px solid #E4002B' : 'none',
                  transition: 'box-shadow 0.2s',
                  '&:hover': {
                    boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
                  },
                }}
              >
                <CardContent sx={{ p: 2 }}>
                  {/* Header: Initiative Name */}
                  <Typography
                    variant="subtitle1"
                    fontWeight={600}
                    sx={{ color: '#003087', mb: 0.5 }}
                    noWrap
                  >
                    {item.initiativeName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                    {item.initiativeCode}
                  </Typography>

                  {/* Blocking Entity Badge */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                    <Chip
                      icon={getBlockingEntityIcon(item.blockingEntityType)}
                      label={item.blockingEntityType}
                      size="small"
                      sx={{
                        backgroundColor: entityColors.bg,
                        color: entityColors.color,
                        fontWeight: 500,
                        textTransform: 'capitalize',
                      }}
                    />
                  </Box>

                  {/* Blocking Entity Title */}
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mb: 1.5,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {item.blockingEntityTitle}
                  </Typography>

                  {/* Days Blocked & Owner */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Tooltip title="Days blocked">
                      <Chip
                        icon={<TimeIcon fontSize="small" />}
                        label={`${item.daysBlocked} days`}
                        size="small"
                        sx={{
                          backgroundColor: isSeverelyBlocked ? '#FFEBEE' : '#FFF3E0',
                          color: isSeverelyBlocked ? '#C62828' : '#E65100',
                          fontWeight: isSeverelyBlocked ? 600 : 400,
                          border: isSeverelyBlocked ? '1px solid #E4002B' : 'none',
                        }}
                      />
                    </Tooltip>

                    <Tooltip title={`Owner: ${item.ownerName}`}>
                      <Avatar
                        sx={{
                          width: 28,
                          height: 28,
                          bgcolor: '#003087',
                          fontSize: '0.75rem',
                        }}
                      >
                        {item.ownerName.split(' ').map(n => n[0]).join('')}
                      </Avatar>
                    </Tooltip>
                  </Box>

                  {/* View Details Button */}
                  <Button
                    fullWidth
                    variant="outlined"
                    size="small"
                    startIcon={<ViewIcon />}
                    onClick={() => handleViewDetails(item.initiativeId)}
                    sx={{
                      borderColor: '#003087',
                      color: '#003087',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 48, 135, 0.05)',
                        borderColor: '#003087',
                      },
                    }}
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default BlockedWorkPanel;
