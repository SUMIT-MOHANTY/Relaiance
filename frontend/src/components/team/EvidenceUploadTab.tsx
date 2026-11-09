/**
 * EvidenceUploadTab.tsx - Evidence & Uploads Tab Component
 * 
 * Displays list of uploaded artifacts with simulated file upload dialog.
 * Stores filename as string field (no binary upload for MVP).
 */

import React, { useState } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Paper,
} from '@mui/material';
import {
  Description,
  PictureAsPdf,
  Image,
  InsertDriveFile,
  Delete,
  CloudUpload,
} from '@mui/icons-material';
import { useNotification } from '../../store/notificationStore';

interface EvidenceItem {
  id: string;
  filename: string;
  uploadedAt: string;
  uploadedBy: string;
  fileType: string;
}

interface EvidenceUploadTabProps {
  initiativeId: string;
}

// Mock evidence data
const mockEvidence: EvidenceItem[] = [
  {
    id: 'EV-001',
    filename: 'Digital_Finance_Requirements_v2.pdf',
    uploadedAt: '2024-01-10T14:30:00Z',
    uploadedBy: 'Sarah Chen',
    fileType: 'pdf',
  },
  {
    id: 'EV-002',
    filename: 'Budget_Analysis_Q1.xlsx',
    uploadedAt: '2024-01-08T09:15:00Z',
    uploadedBy: 'Mike Johnson',
    fileType: 'excel',
  },
  {
    id: 'EV-003',
    filename: 'Process_Flow_Diagram.png',
    uploadedAt: '2024-01-05T16:45:00Z',
    uploadedBy: 'Sarah Chen',
    fileType: 'image',
  },
];

const getFileIcon = (fileType: string) => {
  switch (fileType.toLowerCase()) {
    case 'pdf':
      return <PictureAsPdf sx={{ color: '#D32F2F' }} />;
    case 'image':
    case 'png':
    case 'jpg':
    case 'jpeg':
      return <Image sx={{ color: '#0288D1' }} />;
    case 'excel':
    case 'xlsx':
    case 'xls':
      return <Description sx={{ color: '#388E3C' }} />;
    default:
      return <InsertDriveFile sx={{ color: '#757575' }} />;
  }
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const EvidenceUploadTab: React.FC<EvidenceUploadTabProps> = ({ initiativeId }) => {
  const { showSuccess, showError } = useNotification();
  const [evidence, setEvidence] = useState<EvidenceItem[]>(mockEvidence);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [filename, setFilename] = useState('');
  const [description, setDescription] = useState('');

  const handleOpenUpload = () => {
    setUploadDialogOpen(true);
    setFilename('');
    setDescription('');
  };

  const handleCloseUpload = () => {
    setUploadDialogOpen(false);
  };

  const handleUpload = () => {
    if (!filename.trim()) {
      showError('Please enter a filename');
      return;
    }

    // Simulate file upload - store filename only
    const fileExtension = filename.split('.').pop()?.toLowerCase() || 'unknown';
    const newEvidence: EvidenceItem = {
      id: `EV-${String(evidence.length + 1).padStart(3, '0')}`,
      filename: filename.trim(),
      uploadedAt: new Date().toISOString(),
      uploadedBy: 'Current User', // Would come from auth context
      fileType: fileExtension,
    };

    setEvidence([newEvidence, ...evidence]);
    showSuccess(`Evidence "${filename}" uploaded successfully`);
    handleCloseUpload();
  };

  const handleDelete = (item: EvidenceItem) => {
    setEvidence(evidence.filter((e) => e.id !== item.id));
    showSuccess(`Evidence "${item.filename}" deleted`);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Evidence & Uploads
        </Typography>
        <Button
          variant="contained"
          startIcon={<CloudUpload />}
          onClick={handleOpenUpload}
          sx={{
            textTransform: 'none',
            backgroundColor: '#00A8A8',
            '&:hover': { backgroundColor: '#007676' },
          }}
        >
          Upload Evidence
        </Button>
      </Box>

      <Paper variant="outlined" sx={{ borderRadius: 2 }}>
        <List>
          {evidence.map((item, index) => (
            <ListItem
              key={item.id}
              divider={index < evidence.length - 1}
              sx={{
                '&:hover': { backgroundColor: '#F5F5F5' },
              }}
            >
              <ListItemIcon>{getFileIcon(item.fileType)}</ListItemIcon>
              <ListItemText
                primary={
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {item.filename}
                  </Typography>
                }
                secondary={
                  <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                    <Chip
                      label={item.fileType.toUpperCase()}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: '0.7rem',
                        backgroundColor: '#E0E0E0',
                      }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      Uploaded by {item.uploadedBy} on {formatDate(item.uploadedAt)}
                    </Typography>
                  </Box>
                }
              />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  onClick={() => handleDelete(item)}
                  sx={{ color: '#757575', '&:hover': { color: '#D32F2F' } }}
                >
                  <Delete />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>

        {evidence.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary">No evidence uploaded yet.</Typography>
          </Box>
        )}
      </Paper>

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onClose={handleCloseUpload} maxWidth="sm" fullWidth>
        <DialogTitle>Upload Evidence</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Enter the filename of the evidence document. For MVP, file upload is simulated.
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Filename"
            fullWidth
            variant="outlined"
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            placeholder="e.g., document.pdf, analysis.xlsx"
            helperText="Include file extension"
          />
          <TextField
            margin="dense"
            label="Description (optional)"
            fullWidth
            variant="outlined"
            multiline
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseUpload} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            variant="contained"
            sx={{
              textTransform: 'none',
              backgroundColor: '#00A8A8',
              '&:hover': { backgroundColor: '#007676' },
            }}
          >
            Upload
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EvidenceUploadTab;
