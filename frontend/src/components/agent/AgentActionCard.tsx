/**
 * AgentActionCard.tsx - Agent Action Card Component
 * 
 * MUI Card displaying plan text with Read More toggle, confidence LinearProgress,
 * initiative chip, and Approve/Reject action buttons.
 */

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  Box,
  LinearProgress,
  Link,
  Collapse,
  IconButton,
} from '@mui/material';
import { CheckCircle, Cancel, ExpandMore, ExpandLess } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { AgentAction, AgentActionStatus } from '../../types/api.types';

interface AgentActionCardProps {
  action: AgentAction;
  initiativeName?: string;
  onApprove: (action: AgentAction) => void;
  onReject: (action: AgentAction) => void;
  showActions?: boolean;
}

export const AgentActionCard: React.FC<AgentActionCardProps> = ({
  action,
  initiativeName,
  onApprove,
  onReject,
  showActions = true,
}) => {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => setExpanded(!expanded);

  const getConfidenceColor = (score: number): string => {
    if (score >= 0.8) return '#388E3C';
    if (score >= 0.6) return '#F57C00';
    return '#D32F2F';
  };

  const getConfidenceLabel = (score: number): string => {
    if (score >= 0.8) return 'High';
    if (score >= 0.6) return 'Medium';
    return 'Low';
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const truncateText = (text: string, maxLines: number = 3): string => {
    const words = text.split(' ');
    const avgWordsPerLine = 12;
    const maxWords = maxLines * avgWordsPerLine;
    
    if (words.length <= maxWords) return text;
    return words.slice(0, maxWords).join(' ') + '...';
  };

  const displayName = initiativeName || action.initiativeId;
  const needsTruncation = action.description.split(' ').length > 36;

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 2,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        transition: 'box-shadow 0.2s ease',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
        },
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        {/* Header: Initiative Chip and Action Type */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Chip
            label={displayName}
            size="small"
            component={Link}
            onClick={() => navigate(`/initiatives/${action.initiativeId}`)}
            sx={{
              backgroundColor: '#E3F2FD',
              color: '#0288D1',
              fontWeight: 500,
              cursor: 'pointer',
              textDecoration: 'none',
              '&:hover': {
                backgroundColor: '#BBDEFB',
              },
            }}
          />
          <Typography
            variant="caption"
            sx={{
              backgroundColor: '#F5F5F5',
              color: '#616161',
              px: 1,
              py: 0.5,
              borderRadius: 1,
              fontWeight: 500,
            }}
          >
            {action.actionType.replace('_', ' ')}
          </Typography>
        </Box>

        {/* Plan Text with Read More */}
        <Box sx={{ mb: 2 }}>
          <Collapse in={expanded} collapsedSize={needsTruncation ? 60 : undefined}>
            <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
              {action.description}
            </Typography>
          </Collapse>
          {needsTruncation && (
            <Button
              size="small"
              onClick={toggleExpand}
              endIcon={expanded ? <ExpandLess /> : <ExpandMore />}
              sx={{
                textTransform: 'none',
                color: '#00A8A8',
                p: 0,
                mt: 0.5,
                minWidth: 'auto',
              }}
            >
              {expanded ? 'Read Less' : 'Read More'}
            </Button>
          )}
        </Box>

        {/* Confidence Score */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
            <Typography variant="caption" color="text.secondary">
              Confidence Score
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 600,
                  color: getConfidenceColor(action.confidenceScore),
                }}
              >
                {Math.round(action.confidenceScore * 100)}%
              </Typography>
              <Chip
                label={getConfidenceLabel(action.confidenceScore)}
                size="small"
                sx={{
                  height: 18,
                  fontSize: '0.65rem',
                  backgroundColor: getConfidenceColor(action.confidenceScore) + '20',
                  color: getConfidenceColor(action.confidenceScore),
                  fontWeight: 600,
                }}
              />
            </Box>
          </Box>
          <LinearProgress
            variant="determinate"
            value={action.confidenceScore * 100}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: '#E0E0E0',
              '& .MuiLinearProgress-bar': {
                backgroundColor: getConfidenceColor(action.confidenceScore),
                borderRadius: 4,
              },
            }}
          />
        </Box>

        {/* Evidence Summary */}
        {action.rationale && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
            <strong>Evidence:</strong> {action.rationale}
          </Typography>
        )}

        {/* Footer: Created info */}
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
          Created by {action.suggestedBy === 'AI_AGENT' ? 'AI Agent' : action.suggestedBy} on {formatDate(action.createdAt)}
        </Typography>

        {/* Action Buttons */}
        {showActions && action.status === AgentActionStatus.PENDING && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              size="small"
              startIcon={<CheckCircle />}
              onClick={() => onApprove(action)}
              sx={{
                flex: 1,
                textTransform: 'none',
                backgroundColor: '#388E3C',
                '&:hover': { backgroundColor: '#2E7D32' },
              }}
            >
              Approve
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<Cancel />}
              onClick={() => onReject(action)}
              sx={{
                flex: 1,
                textTransform: 'none',
                borderColor: '#D32F2F',
                color: '#D32F2F',
                '&:hover': {
                  backgroundColor: '#FFEBEE',
                  borderColor: '#C62828',
                },
              }}
            >
              Reject
            </Button>
          </Box>
        )}

        {/* Status indicator for non-pending actions */}
        {!showActions || action.status !== AgentActionStatus.PENDING ? (
          <Box sx={{ mt: 1 }}>
            {action.status === AgentActionStatus.APPROVED && (
              <Chip
                label="Approved"
                size="small"
                sx={{
                  backgroundColor: '#E8F5E9',
                  color: '#388E3C',
                  border: '1px solid #388E3C',
                }}
              />
            )}
            {action.status === AgentActionStatus.REJECTED && (
              <Chip
                label="Rejected"
                size="small"
                sx={{
                  backgroundColor: '#FFEBEE',
                  color: '#D32F2F',
                  border: '1px solid #D32F2F',
                }}
              />
            )}
            {action.status === AgentActionStatus.EXECUTED && (
              <Chip
                label="Executed"
                size="small"
                sx={{
                  backgroundColor: '#E3F2FD',
                  color: '#0288D1',
                  border: '1px solid #0288D1',
                }}
              />
            )}
          </Box>
        ) : null}
      </CardContent>
    </Card>
  );
};

export default AgentActionCard;
