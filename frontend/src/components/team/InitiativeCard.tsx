/**
 * InitiativeCard.tsx - Team Member Initiative Card Component
 * 
 * MUI Card displaying initiative name, status chip, circular progress indicator
 * for milestone completion %, and critical risks badge.
 */

import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  CircularProgress,
  Button,
  Badge,
  Tooltip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Initiative, Milestone, Risk, InitiativeStatus } from '../../types/api.types';
import { STATUS_COLORS } from '../../config/theme';

interface InitiativeCardProps {
  initiative: Initiative;
  milestones: Milestone[];
  risks: Risk[];
  isSelected?: boolean;
  onClick?: () => void;
}

export const InitiativeCard: React.FC<InitiativeCardProps> = ({
  initiative,
  milestones,
  risks,
  isSelected = false,
  onClick,
}) => {
  const navigate = useNavigate();

  // Calculate milestone completion percentage
  const completedMilestones = milestones.filter(
    (m) => m.status === 'COMPLETED'
  ).length;
  const totalMilestones = milestones.length;
  const milestoneProgress = totalMilestones > 0 
    ? Math.round((completedMilestones / totalMilestones) * 100) 
    : 0;

  // Count critical risks
  const criticalRisks = risks.filter((r) => r.severity === 'CRITICAL');
  const hasCriticalRisks = criticalRisks.length > 0;

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/initiatives/${initiative.id}`);
  };

  const handleCardClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/initiatives/${initiative.id}`);
    }
  };

  return (
    <Card
      onClick={handleCardClick}
      sx={{
        cursor: 'pointer',
        border: isSelected ? '2px solid #00A8A8' : '1px solid #E0E0E0',
        borderRadius: 2,
        boxShadow: isSelected ? '0 4px 12px rgba(0,168,168,0.2)' : '0 2px 8px rgba(0,0,0,0.08)',
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
          transform: 'translateY(-2px)',
        },
      }}
    >
      <CardContent sx={{ p: 2 }}>
        {/* Header: Title and Status */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 600,
              color: '#212121',
              flex: 1,
              mr: 1,
              lineHeight: 1.3,
            }}
          >
            {initiative.title}
          </Typography>
          <Chip
            label={initiative.status}
            size="small"
            sx={{
              backgroundColor: STATUS_COLORS[initiative.status] || '#9E9E9E',
              color: '#fff',
              fontWeight: 500,
              fontSize: '0.75rem',
            }}
          />
        </Box>

        {/* Progress Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box sx={{ position: 'relative', display: 'inline-flex', mr: 2 }}>
            <CircularProgress
              variant="determinate"
              value={milestoneProgress}
              size={56}
              thickness={4}
              sx={{
                color: milestoneProgress === 100 ? '#388E3C' : '#00A8A8',
              }}
            />
            <Box
              sx={{
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                position: 'absolute',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  color: milestoneProgress === 100 ? '#388E3C' : '#00A8A8',
                }}
              >
                {milestoneProgress}%
              </Typography>
            </Box>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Milestones
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {completedMilestones} of {totalMilestones} complete
            </Typography>
          </Box>
        </Box>

        {/* Risk Badge */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Tooltip title={hasCriticalRisks ? `${criticalRisks.length} critical risk(s) require attention` : 'No critical risks'}>
            <Badge
              badgeContent={risks.length}
              color={hasCriticalRisks ? 'error' : 'default'}
              sx={{
                '& .MuiBadge-badge': {
                  backgroundColor: hasCriticalRisks ? '#D32F2F' : '#9E9E9E',
                  color: '#fff',
                },
              }}
            >
              <Typography variant="body2" color={hasCriticalRisks ? 'error' : 'text.secondary'}>
                Open Risks
              </Typography>
            </Badge>
          </Tooltip>

          <Button
            variant="outlined"
            size="small"
            onClick={handleViewDetails}
            sx={{
              textTransform: 'none',
              borderColor: '#00A8A8',
              color: '#00A8A8',
              '&:hover': {
                backgroundColor: 'rgba(0,168,168,0.08)',
                borderColor: '#007676',
              },
            }}
          >
            View Details
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default InitiativeCard;
