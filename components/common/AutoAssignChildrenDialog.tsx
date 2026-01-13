'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Stepper,
  Step,
  StepLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Alert,
  CircularProgress,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
  Divider,
  Checkbox,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  ExpandMore,
  CheckCircle,
  Warning,
  Info,
  FamilyRestroom,
  People,
  LocationOn,
  Diversity3,
  Group,
  Male,
  Female,
  Assignment,
  Timeline,
  Person,
  Boy,
  Girl,
  Check,
  Close,
  Visibility,
  Edit,
  Delete,
  Add,
  Remove,
  ArrowBack,
  ArrowForward,
  Download,
  Print
} from '@mui/icons-material';
import { useTheme } from '@/lib/theme-context';
import api from '@/app/utils/api';
import { motion } from 'framer-motion';

interface AutoAssignChildrenDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface Family {
  _id: string;
  title: string;
  batch: string;
  allowOtherBatches: boolean;
  grandParents: Array<{
    families: Array<{
      father: { student: any };
      mother: { student: any };
      children: any[];
    }>;
  }>;
}

interface Assignment {
  familyId: string;
  familyTitle: string;
  gpIndex: number;
  familyIndex: number;
  studentId: string;
  student: any;
  relationship: 'son' | 'daughter';
  birthOrder: number;
  addressMatch?: string;
  diversityScore?: number;
}

interface Statistics {
  totalAssigned: number;
  totalFamiliesAffected: number;
  uniqueStudentsAssigned: number;
  genderDistribution: {
    sons: number;
    daughters: number;
    balance: number;
  };
  addressMatchQuality?: number;
  qualityLevel?: string;
  averageDiversityScore?: number;
  diversityLevel?: string;
}

const AutoAssignChildrenDialog: React.FC<AutoAssignChildrenDialogProps> = ({
  open,
  onClose,
  onSuccess
}) => {
  const { theme } = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Configuration state
  const [mode, setMode] = useState<'homogeneous' | 'heterogeneous'>('homogeneous');
  const [targetBatch, setTargetBatch] = useState('');
  const [maxChildrenPerFamily, setMaxChildrenPerFamily] = useState(10);
  const [considerGenderBalance, setConsiderGenderBalance] = useState(true);
  const [considerAge, setConsiderAge] = useState(true);
  const [addressLevel, setAddressLevel] = useState<'kebele' | 'wereda' | 'zone' | 'region'>('kebele');
  
  // Data state
  const [batches, setBatches] = useState<string[]>([]);
  const [eligibleFamilies, setEligibleFamilies] = useState<Family[]>([]);
  const [availableStudents, setAvailableStudents] = useState(0);
  const [previewData, setPreviewData] = useState<any>(null);
  const [previewResult, setPreviewResult] = useState<{
    preview: boolean;
    assignments?: Assignment[];
    statistics?: Statistics;
    configuration?: any;
    failedAssignments?: Array<{ familyId: string; familyTitle: string; reason: string }>;
  } | null>(null);

  const themeStyles = {
    background: theme === 'dark' ? '#0f172a' : '#ffffff',
    textColor: theme === 'dark' ? '#ccd6f6' : '#333333',
    primaryColor: theme === 'dark' ? '#00ffff' : '#007bff',
    secondaryColor: theme === 'dark' ? '#00ff00' : '#28a745',
    warningColor: theme === 'dark' ? '#ff9900' : '#ff9900',
    errorColor: theme === 'dark' ? '#ff0000' : '#dc3545',
  };

  const steps = ['Configuration', 'Preview', 'Review & Confirm', 'Results'];

  // Fetch initial data
  useEffect(() => {
    if (open) {
      fetchInitialData();
    } else {
      // Reset state when dialog closes
      setActiveStep(0);
      setError('');
      setSuccess('');
      setPreviewData(null);
      setPreviewResult(null);
    }
  }, [open]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      
      // Fetch batches
      const batchesResponse = await api.get('/families/batches');
      setBatches(batchesResponse.data.data.batches || []);
      
      // Fetch eligible families count
      const familiesResponse = await api.get('/families?limit=10&status=current');
      const families = familiesResponse.data.data.families || [];
      
      // Filter families that have both parents
      const eligible = families.filter((family: Family) => 
        family.grandParents?.some(gp => 
          gp.families?.some(f => f.father?.student && f.mother?.student)
        )
      );
      
      setEligibleFamilies(eligible);
      
      if (eligible.length > 0 && batches.length > 0) {
        setTargetBatch(batches[0]);
      }
      
    } catch (error: any) {
      console.error('Failed to fetch initial data:', error);
      setError('Failed to load initial data');
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async () => {
    if (!targetBatch) {
      setError('Please select a target batch');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setPreviewResult(null);
      
      // Get preview (without saving)
      const response = await api.post('/families/auto-assign-children', {
        mode,
        targetBatch,
        maxChildrenPerFamily,
        considerGenderBalance,
        considerAge,
        addressLevel
      });

      setPreviewResult(response.data.data);
      setActiveStep(1);
      
    } catch (error: any) {
      console.error('Failed to generate preview:', error);
      setError(error.response?.data?.message || 'Failed to generate preview');
    } finally {
      setLoading(false);
    }
  };

  const handleExecute = async () => {
    if (!previewResult?.assignments) {
      setError('No assignments to execute');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await api.post('/families/execute-auto-assign', {
        assignments: previewResult.assignments
      });

      setSuccess(response.data.message);
      setActiveStep(3);
      
      if (onSuccess) {
        onSuccess();
      }
      
    } catch (error: any) {
      console.error('Failed to execute assignments:', error);
      setError(error.response?.data?.message || 'Failed to execute assignments');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setActiveStep(0);
    setPreviewResult(null);
    setPreviewData(null);
    setError('');
    setSuccess('');
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0: // Configuration
        return renderConfigurationStep();
      case 1: // Preview
        return renderPreviewStep();
      case 2: // Review & Confirm
        return renderReviewStep();
      case 3: // Results
        return renderResultsStep();
      default:
        return null;
    }
  };

  const renderConfigurationStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Mode Selection */}
        <Box>
          <Typography variant="subtitle1" sx={{ 
            mb: 2, 
            color: themeStyles.textColor,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <Assignment /> Assignment Mode
          </Typography>
          <RadioGroup
            value={mode}
            onChange={(e) => setMode(e.target.value as 'homogeneous' | 'heterogeneous')}
          >
            <FormControlLabel
              value="homogeneous"
              control={<Radio />}
              label={
                <Box sx={{ display: 'flex', flexDirection: 'column', ml: 1 }}>
                  <Typography variant="body1" sx={{ color: themeStyles.textColor }}>
                    Homogeneous Assignment
                  </Typography>
                  <Typography variant="caption" color={theme === 'dark' ? '#94a3b8' : '#999999'}>
                    Keep local communities together by matching addresses
                  </Typography>
                </Box>
              }
            />
            <FormControlLabel
              value="heterogeneous"
              control={<Radio />}
              label={
                <Box sx={{ display: 'flex', flexDirection: 'column', ml: 1 }}>
                  <Typography variant="body1" sx={{ color: themeStyles.textColor }}>
                    Heterogeneous Assignment
                  </Typography>
                  <Typography variant="caption" color={theme === 'dark' ? '#94a3b8' : '#999999'}>
                    Promote geographic diversity by mixing addresses
                  </Typography>
                </Box>
              }
            />
          </RadioGroup>
        </Box>

        {/* Target Batch */}
        <Box>
          <Typography variant="subtitle1" sx={{ 
            mb: 2, 
            color: themeStyles.textColor,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <Group /> Target Batch
          </Typography>
          <FormControl fullWidth size="small">
            <InputLabel>Select Batch</InputLabel>
            <Select
              value={targetBatch}
              onChange={(e) => setTargetBatch(e.target.value)}
              label="Select Batch"
              sx={{
                backgroundColor: theme === 'dark' ? '#1e293b' : 'white',
                color: themeStyles.textColor,
              }}
            >
              {batches.map((batch) => (
                <MenuItem key={batch} value={batch}>
                  {batch}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Advanced Configuration */}
        <Accordion 
          defaultExpanded
          sx={{ 
            backgroundColor: theme === 'dark' ? '#1e293b' : '#f8f9fa',
            border: theme === 'dark' ? '1px solid #334155' : '1px solid #e5e7eb',
          }}
        >
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="subtitle1" sx={{ color: themeStyles.textColor }}>
              Advanced Configuration
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={3}>
              {/* Maximum Children */}
              <Box>
                <Typography variant="body2" sx={{ mb: 1, color: themeStyles.textColor }}>
                  Maximum Children per Family: {maxChildrenPerFamily}
                </Typography>
                <Slider
                  value={maxChildrenPerFamily}
                  onChange={(_, value) => setMaxChildrenPerFamily(value as number)}
                  min={1}
                  max={30}
                  step={1}
                  marks={[
                    { value: 1, label: '1' },
                    { value: 10, label: '10' },
                    { value: 20, label: '20' },
                    { value: 30, label: '30' }
                  ]}
                  valueLabelDisplay="auto"
                  sx={{
                    color: themeStyles.primaryColor,
                    '& .MuiSlider-markLabel': {
                      color: theme === 'dark' ? '#94a3b8' : '#999999',
                    }
                  }}
                />
              </Box>

              {/* Homogeneous Options */}
              {mode === 'homogeneous' && (
                <Box>
                  <Typography variant="body2" sx={{ mb: 1, color: themeStyles.textColor }}>
                    Address Matching Level
                  </Typography>
                  <RadioGroup
                    value={addressLevel}
                    onChange={(e) => setAddressLevel(e.target.value as any)}
                    row
                  >
                    <FormControlLabel 
                      value="kebele" 
                      control={<Radio size="small" />} 
                      label="Kebele" 
                    />
                    <FormControlLabel 
                      value="wereda" 
                      control={<Radio size="small" />} 
                      label="Wereda" 
                    />
                    <FormControlLabel 
                      value="zone" 
                      control={<Radio size="small" />} 
                      label="Zone" 
                    />
                    <FormControlLabel 
                      value="region" 
                      control={<Radio size="small" />} 
                      label="Region" 
                    />
                  </RadioGroup>
                </Box>
              )}

              {/* Checkboxes */}
              <Box>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={considerGenderBalance}
                      onChange={(e) => setConsiderGenderBalance(e.target.checked)}
                      sx={{ color: themeStyles.primaryColor }}
                    />
                  }
                  label={
                    <Typography variant="body2" sx={{ color: themeStyles.textColor }}>
                      Balance gender in families (prefer equal sons/daughters)
                    </Typography>
                  }
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={considerAge}
                      onChange={(e) => setConsiderAge(e.target.checked)}
                      sx={{ color: themeStyles.primaryColor }}
                    />
                  }
                  label={
                    <Typography variant="body2" sx={{ color: themeStyles.textColor }}>
                      Consider age (prefer children younger than parents)
                    </Typography>
                  }
                />
              </Box>
            </Stack>
          </AccordionDetails>
        </Accordion>

        {/* Summary Stats */}
        <Paper sx={{ 
          p: 2, 
          backgroundColor: theme === 'dark' ? '#1e293b' : '#f8f9fa',
          border: theme === 'dark' ? '1px solid #334155' : '1px solid #e5e7eb',
        }}>
          <Typography variant="subtitle2" sx={{ mb: 2, color: themeStyles.textColor }}>
            Current Status
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            <Box sx={{ textAlign: 'center', minWidth: 120, flex: 1 }}>
              <Chip 
                label={eligibleFamilies.length}
                color="primary"
                sx={{ mb: 1 }}
              />
              <Typography variant="caption" color={theme === 'dark' ? '#94a3b8' : '#999999'}>
                Eligible Families
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center', minWidth: 120, flex: 1 }}>
              <Chip 
                label={batches.length}
                color="secondary"
                sx={{ mb: 1 }}
              />
              <Typography variant="caption" color={theme === 'dark' ? '#94a3b8' : '#999999'}>
                Available Batches
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center', minWidth: 120, flex: 1 }}>
              <Chip 
                label={maxChildrenPerFamily}
                color="warning"
                sx={{ mb: 1 }}
              />
              <Typography variant="caption" color={theme === 'dark' ? '#94a3b8' : '#999999'}>
                Max per Family
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </motion.div>
  );

  const renderPreviewStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {previewResult ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Success Message */}
          <Alert 
            severity="info"
            icon={<Info />}
            sx={{ mb: 2 }}
          >
            Preview generated successfully. Review the assignments below before executing.
          </Alert>

          {/* Statistics */}
          {previewResult.statistics && (
            <Paper sx={{ 
              p: 3, 
              backgroundColor: theme === 'dark' ? '#1e293b' : '#f8f9fa',
            }}>
              <Typography variant="h6" sx={{ mb: 3, color: themeStyles.textColor }}>
                Assignment Preview
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                {/* Total to Assign */}
                <Card sx={{ 
                  flex: 1,
                  minWidth: 150,
                  textAlign: 'center',
                  backgroundColor: theme === 'dark' ? '#334155' : '#ffffff',
                }}>
                  <CardContent>
                    <Typography variant="h3" sx={{ 
                      color: themeStyles.primaryColor,
                      fontWeight: 'bold'
                    }}>
                      {previewResult.statistics.totalAssigned}
                    </Typography>
                    <Typography variant="body2" color={theme === 'dark' ? '#94a3b8' : '#999999'}>
                      Children to Assign
                    </Typography>
                  </CardContent>
                </Card>

                {/* Families Affected */}
                <Card sx={{ 
                  flex: 1,
                  minWidth: 150,
                  textAlign: 'center',
                  backgroundColor: theme === 'dark' ? '#334155' : '#ffffff',
                }}>
                  <CardContent>
                    <Typography variant="h3" sx={{ 
                      color: themeStyles.secondaryColor,
                      fontWeight: 'bold'
                    }}>
                      {previewResult.statistics.totalFamiliesAffected}
                    </Typography>
                    <Typography variant="body2" color={theme === 'dark' ? '#94a3b8' : '#999999'}>
                      Families Affected
                    </Typography>
                  </CardContent>
                </Card>

                {/* Unique Students */}
                <Card sx={{ 
                  flex: 1,
                  minWidth: 150,
                  textAlign: 'center',
                  backgroundColor: theme === 'dark' ? '#334155' : '#ffffff',
                }}>
                  <CardContent>
                    <Typography variant="h3" sx={{ 
                      color: themeStyles.warningColor,
                      fontWeight: 'bold'
                    }}>
                      {previewResult.statistics.uniqueStudentsAssigned}
                    </Typography>
                    <Typography variant="body2" color={theme === 'dark' ? '#94a3b8' : '#999999'}>
                      Unique Students
                    </Typography>
                  </CardContent>
                </Card>

                {/* Gender Distribution */}
                <Card sx={{ 
                  flex: 1,
                  minWidth: 150,
                  textAlign: 'center',
                  backgroundColor: theme === 'dark' ? '#334155' : '#ffffff',
                }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Boy sx={{ color: themeStyles.primaryColor }} />
                        <Typography variant="h5" sx={{ color: themeStyles.textColor }}>
                          {previewResult.statistics.genderDistribution.sons}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Girl sx={{ color: '#ff00ff' }} />
                        <Typography variant="h5" sx={{ color: themeStyles.textColor }}>
                          {previewResult.statistics.genderDistribution.daughters}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="body2" color={theme === 'dark' ? '#94a3b8' : '#999999'}>
                      Sons vs Daughters
                    </Typography>
                  </CardContent>
                </Card>
              </Box>

              {/* Quality Metrics */}
              <Divider sx={{ my: 3 }} />
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 3, alignItems: 'center' }}>
                <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ 
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: mode === 'homogeneous' 
                      ? (previewResult.statistics.addressMatchQuality! >= 0.8 
                        ? '#00ff0020' 
                        : previewResult.statistics.addressMatchQuality! >= 0.5 
                          ? '#ff990020' 
                          : '#ff000020')
                      : (previewResult.statistics.averageDiversityScore! >= 3 
                        ? '#00ff0020' 
                        : previewResult.statistics.averageDiversityScore! >= 2 
                          ? '#ff990020' 
                          : '#ff000020')
                  }}>
                    <Typography variant="h5" sx={{ 
                      color: mode === 'homogeneous' 
                        ? (previewResult.statistics.addressMatchQuality! >= 0.8 
                          ? '#00ff00' 
                          : previewResult.statistics.addressMatchQuality! >= 0.5 
                            ? '#ff9900' 
                            : '#ff0000')
                        : (previewResult.statistics.averageDiversityScore! >= 3 
                          ? '#00ff00' 
                          : previewResult.statistics.averageDiversityScore! >= 2 
                            ? '#ff9900' 
                            : '#ff0000')
                    }}>
                      {mode === 'homogeneous' 
                        ? `${Math.round(previewResult.statistics.addressMatchQuality! * 100)}%`
                        : previewResult.statistics.averageDiversityScore?.toFixed(1)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body1" sx={{ color: themeStyles.textColor }}>
                      {mode === 'homogeneous' ? 'Address Match Quality' : 'Diversity Score'}
                    </Typography>
                    <Typography variant="caption" color={theme === 'dark' ? '#94a3b8' : '#999999'}>
                      {mode === 'homogeneous' 
                        ? previewResult.statistics.qualityLevel
                        : previewResult.statistics.diversityLevel}
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ mb: 1, color: themeStyles.textColor }}>
                    Configuration Summary
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    <Chip label={`Mode: ${mode}`} size="small" />
                    <Chip label={`Batch: ${targetBatch}`} size="small" />
                    <Chip label={`Max per family: ${maxChildrenPerFamily}`} size="small" />
                    {considerGenderBalance && <Chip label="Gender balance" size="small" />}
                    {considerAge && <Chip label="Age consideration" size="small" />}
                  </Box>
                </Box>
              </Box>
            </Paper>
          )}

          {/* Assignments Preview */}
          {previewResult.assignments && previewResult.assignments.length > 0 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" sx={{ 
                  color: themeStyles.textColor,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <FamilyRestroom /> Assignments Preview ({previewResult.assignments.length} total)
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title="Print Preview">
                    <IconButton size="small">
                      <Print fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Export to CSV">
                    <IconButton size="small">
                      <Download fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
              
              <TableContainer 
                component={Paper} 
                sx={{ 
                  maxHeight: 400,
                  backgroundColor: theme === 'dark' ? '#1e293b' : 'white',
                }}
              >
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Family</TableCell>
                      <TableCell>Student Name</TableCell>
                      <TableCell>Student ID</TableCell>
                      <TableCell>Gender</TableCell>
                      <TableCell>Birth Order</TableCell>
                      {mode === 'homogeneous' && <TableCell>Address Match</TableCell>}
                      {mode === 'heterogeneous' && <TableCell>Diversity Score</TableCell>}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {previewResult.assignments.slice(0, 20).map((assignment, index) => (
                      <TableRow key={index} hover sx={{ '&:hover': { backgroundColor: theme === 'dark' ? '#334155' : '#f5f5f5' } }}>
                        <TableCell>
                          <Typography variant="body2" sx={{ color: themeStyles.textColor, fontWeight: 'medium' }}>
                            {assignment.familyTitle}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Person fontSize="small" sx={{ color: theme === 'dark' ? '#94a3b8' : '#666' }} />
                            <Typography variant="body2" sx={{ color: themeStyles.textColor }}>
                              {assignment.student.firstName} {assignment.student.lastName}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={assignment.student.gibyGubayeId || 'N/A'}
                            size="small"
                            variant="outlined"
                            sx={{
                              fontFamily: 'monospace',
                              fontSize: '0.75rem',
                              backgroundColor: theme === 'dark' ? '#334155' : '#f0f0f0'
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={assignment.relationship}
                            size="small"
                            icon={assignment.relationship === 'son' ? <Boy fontSize="small" /> : <Girl fontSize="small" />}
                            sx={{
                              backgroundColor: assignment.relationship === 'son' 
                                ? (theme === 'dark' ? '#00ffff20' : '#007bff20')
                                : (theme === 'dark' ? '#ff00ff20' : '#9c27b020'),
                              color: assignment.relationship === 'son' 
                                ? (theme === 'dark' ? '#00ffff' : '#007bff')
                                : (theme === 'dark' ? '#ff00ff' : '#9c27b0')
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ 
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 28,
                            height: 28,
                            borderRadius: '50%',
                            backgroundColor: theme === 'dark' ? '#334155' : '#f0f0f0',
                            fontWeight: 'bold',
                            color: themeStyles.textColor
                          }}>
                            {assignment.birthOrder}
                          </Box>
                        </TableCell>
                        {mode === 'homogeneous' && (
                          <TableCell>
                            <Typography variant="caption" color={theme === 'dark' ? '#94a3b8' : '#666'}>
                              {assignment.addressMatch || 'No match'}
                            </Typography>
                          </TableCell>
                        )}
                        {mode === 'heterogeneous' && (
                          <TableCell>
                            <Box sx={{ 
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: 32,
                              height: 32,
                              borderRadius: '50%',
                              backgroundColor: (assignment.diversityScore || 0) >= 3 
                                ? (theme === 'dark' ? '#00ff0020' : '#28a74520')
                                : (assignment.diversityScore || 0) >= 2 
                                  ? (theme === 'dark' ? '#ff990020' : '#ff990020')
                                  : (theme === 'dark' ? '#ff000020' : '#dc354520'),
                              fontWeight: 'bold',
                              color: (assignment.diversityScore || 0) >= 3 
                                ? themeStyles.secondaryColor 
                                : (assignment.diversityScore || 0) >= 2 
                                  ? themeStyles.warningColor 
                                  : themeStyles.errorColor
                            }}>
                              {assignment.diversityScore?.toFixed(1)}
                            </Box>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              
              {previewResult.assignments.length > 20 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                  <Typography variant="caption" color={theme === 'dark' ? '#94a3b8' : '#999'}>
                    Showing first 20 of {previewResult.assignments.length} assignments
                  </Typography>
                  <Button size="small" endIcon={<ArrowForward />}>
                    Show More
                  </Button>
                </Box>
              )}
            </Box>
          )}

          {/* Failed Assignments */}
          {previewResult.failedAssignments && previewResult.failedAssignments.length > 0 && (
            <Accordion sx={{ backgroundColor: theme === 'dark' ? '#1e293b' : '#fff3cd', borderColor: themeStyles.warningColor }}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Warning sx={{ color: themeStyles.warningColor }} />
                  <Typography variant="subtitle2" sx={{ color: theme === 'dark' ? '#ff9900' : '#856404' }}>
                    {previewResult.failedAssignments.length} assignments could not be made
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <List dense>
                  {previewResult.failedAssignments.slice(0, 5).map((failed, index) => (
                    <ListItem key={index} sx={{ py: 0.5 }}>
                      <ListItemIcon>
                        <Close fontSize="small" sx={{ color: themeStyles.errorColor }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary={
                          <Typography variant="body2" sx={{ color: themeStyles.textColor }}>
                            {failed.familyTitle}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="caption" color={theme === 'dark' ? '#94a3b8' : '#666'}>
                            {failed.reason}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))}
                  {previewResult.failedAssignments.length > 5 && (
                    <Typography variant="caption" color={theme === 'dark' ? '#94a3b8' : '#666'} sx={{ mt: 1, display: 'block' }}>
                      ... and {previewResult.failedAssignments.length - 5} more
                    </Typography>
                  )}
                </List>
              </AccordionDetails>
            </Accordion>
          )}
        </Box>
      ) : (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      )}
    </motion.div>
  );

  const renderReviewStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {previewResult ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Alert 
            severity="warning"
            icon={<Warning />}
            sx={{ mb: 2 }}
          >
            <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 0.5 }}>
              Final Review Required
            </Typography>
            Please review all assignments below. Once executed, these assignments will be permanently saved to the database.
          </Alert>

          {/* Configuration Review Card */}
          <Card sx={{ 
            backgroundColor: theme === 'dark' ? '#1e293b' : '#f8f9fa',
            border: theme === 'dark' ? '1px solid #334155' : '1px solid #dee2e6',
          }}>
            <CardContent>
              <Typography variant="subtitle1" sx={{ mb: 2, color: themeStyles.textColor, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Assignment /> Configuration Summary
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                <Box sx={{ minWidth: 150 }}>
                  <Typography variant="body2" color={theme === 'dark' ? '#94a3b8' : '#666'}>
                    Assignment Mode
                  </Typography>
                  <Typography variant="body1" sx={{ color: themeStyles.textColor, fontWeight: 'medium' }}>
                    {mode === 'homogeneous' ? 'Homogeneous' : 'Heterogeneous'}
                  </Typography>
                </Box>
                
                <Box sx={{ minWidth: 150 }}>
                  <Typography variant="body2" color={theme === 'dark' ? '#94a3b8' : '#666'}>
                    Target Batch
                  </Typography>
                  <Typography variant="body1" sx={{ color: themeStyles.textColor, fontWeight: 'medium' }}>
                    {targetBatch}
                  </Typography>
                </Box>
                
                <Box sx={{ minWidth: 150 }}>
                  <Typography variant="body2" color={theme === 'dark' ? '#94a3b8' : '#666'}>
                    Max per Family
                  </Typography>
                  <Typography variant="body1" sx={{ color: themeStyles.textColor, fontWeight: 'medium' }}>
                    {maxChildrenPerFamily}
                  </Typography>
                </Box>
                
                <Box sx={{ minWidth: 150 }}>
                  <Typography variant="body2" color={theme === 'dark' ? '#94a3b8' : '#666'}>
                    Total Assignments
                  </Typography>
                  <Typography variant="body1" sx={{ color: themeStyles.textColor, fontWeight: 'medium' }}>
                    {previewResult.statistics?.totalAssigned || 0}
                  </Typography>
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Chip 
                  icon={considerGenderBalance ? <Check /> : <Close />}
                  label={`Gender Balance: ${considerGenderBalance ? 'Enabled' : 'Disabled'}`}
                  size="small"
                  color={considerGenderBalance ? "success" : "default"}
                />
                <Chip 
                  icon={considerAge ? <Check /> : <Close />}
                  label={`Age Consideration: ${considerAge ? 'Enabled' : 'Disabled'}`}
                  size="small"
                  color={considerAge ? "success" : "default"}
                />
                {mode === 'homogeneous' && (
                  <Chip 
                    label={`Address Level: ${addressLevel}`}
                    size="small"
                    color="primary"
                  />
                )}
              </Box>
            </CardContent>
          </Card>

          {/* Family-wise Assignment Review */}
          <Card sx={{ 
            backgroundColor: theme === 'dark' ? '#1e293b' : '#f8f9fa',
            border: theme === 'dark' ? '1px solid #334155' : '1px solid #dee2e6',
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" sx={{ 
                  color: themeStyles.textColor,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <FamilyRestroom /> Assignments by Family ({previewResult.assignments?.length || 0} total)
                </Typography>
                <Typography variant="body2" color={theme === 'dark' ? '#94a3b8' : '#666'}>
                  {previewResult.statistics?.totalFamiliesAffected || 0} families affected
                </Typography>
              </Box>
              
              {previewResult.assignments && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {(() => {
                    const familyMap = new Map();
                    previewResult.assignments.forEach(assignment => {
                      if (!familyMap.has(assignment.familyId)) {
                        familyMap.set(assignment.familyId, {
                          title: assignment.familyTitle,
                          assignments: []
                        });
                      }
                      familyMap.get(assignment.familyId).assignments.push(assignment);
                    });
                    
                    return Array.from(familyMap.entries()).map(([familyId, familyData]: [string, any]) => (
                      <Accordion key={familyId} sx={{ 
                        backgroundColor: theme === 'dark' ? '#334155' : '#ffffff',
                      }}>
                        <AccordionSummary expandIcon={<ExpandMore />}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Box sx={{ 
                                width: 32,
                                height: 32,
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: themeStyles.primaryColor,
                                color: 'white',
                                fontWeight: 'bold'
                              }}>
                                {familyData.assignments.length}
                              </Box>
                              <Typography variant="body1" sx={{ color: themeStyles.textColor, fontWeight: 'medium' }}>
                                {familyData.title}
                              </Typography>
                            </Box>
                            <Chip 
                              label={`${familyData.assignments.length} children`} 
                              size="small" 
                              color="primary"
                              variant="outlined"
                            />
                          </Box>
                        </AccordionSummary>
                        <AccordionDetails>
                          <TableContainer>
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell>Student</TableCell>
                                  <TableCell>ID</TableCell>
                                  <TableCell>Gender</TableCell>
                                  <TableCell>Birth Order</TableCell>
                                  <TableCell>Details</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {familyData.assignments.map((assignment: Assignment, index: number) => (
                                  <TableRow key={index} hover>
                                    <TableCell>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        {assignment.relationship === 'son' ? 
                                          <Boy fontSize="small" sx={{ color: themeStyles.primaryColor }} /> : 
                                          <Girl fontSize="small" sx={{ color: '#ff00ff' }} />
                                        }
                                        <Typography variant="body2" sx={{ color: themeStyles.textColor }}>
                                          {assignment.student.firstName} {assignment.student.lastName}
                                        </Typography>
                                      </Box>
                                    </TableCell>
                                    <TableCell>
                                      <Typography variant="caption" sx={{ 
                                        color: theme === 'dark' ? '#94a3b8' : '#666',
                                        fontFamily: 'monospace'
                                      }}>
                                        {assignment.student.gibyGubayeId || 'N/A'}
                                      </Typography>
                                    </TableCell>
                                    <TableCell>
                                      <Chip
                                        label={assignment.relationship}
                                        size="small"
                                        sx={{
                                          backgroundColor: assignment.relationship === 'son' 
                                            ? (theme === 'dark' ? '#00ffff20' : '#007bff20')
                                            : (theme === 'dark' ? '#ff00ff20' : '#9c27b020'),
                                          color: assignment.relationship === 'son' 
                                            ? (theme === 'dark' ? '#00ffff' : '#007bff')
                                            : (theme === 'dark' ? '#ff00ff' : '#9c27b0')
                                        }}
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <Box sx={{ 
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: 24,
                                        height: 24,
                                        borderRadius: '50%',
                                        backgroundColor: theme === 'dark' ? '#475569' : '#e9ecef',
                                        fontWeight: 'bold',
                                        color: themeStyles.textColor
                                      }}>
                                        {assignment.birthOrder}
                                      </Box>
                                    </TableCell>
                                    <TableCell>
                                      <Typography variant="caption" color={theme === 'dark' ? '#94a3b8' : '#666'}>
                                        {mode === 'homogeneous' 
                                          ? assignment.addressMatch || 'No address match'
                                          : `Diversity: ${assignment.diversityScore?.toFixed(1)}`}
                                      </Typography>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </AccordionDetails>
                      </Accordion>
                    ));
                  })()}
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Validation Summary */}
          <Card sx={{ 
            backgroundColor: theme === 'dark' ? '#1e293b30' : '#f8f9fa',
            border: theme === 'dark' ? '1px solid #00ffff30' : '1px solid #007bff30',
          }}>
            <CardContent>
              <Typography variant="subtitle1" sx={{ mb: 2, color: themeStyles.textColor, display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircle /> Validation Summary
              </Typography>
              <List dense>
                <ListItem sx={{ py: 1 }}>
                  <ListItemIcon>
                    <Check sx={{ color: themeStyles.secondaryColor }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="No duplicate students within families"
                    secondary="Each student appears only once per family document"
                    primaryTypographyProps={{ color: themeStyles.textColor }}
                    secondaryTypographyProps={{ color: theme === 'dark' ? '#94a3b8' : '#666' }}
                  />
                </ListItem>
                <ListItem sx={{ py: 1 }}>
                  <ListItemIcon>
                    <Check sx={{ color: themeStyles.secondaryColor }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Batch compliance verified"
                    secondary={`All assigned students are from batch: ${targetBatch}`}
                    primaryTypographyProps={{ color: themeStyles.textColor }}
                    secondaryTypographyProps={{ color: theme === 'dark' ? '#94a3b8' : '#666' }}
                  />
                </ListItem>
                <ListItem sx={{ py: 1 }}>
                  <ListItemIcon>
                    <Check sx={{ color: themeStyles.secondaryColor }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Gender distribution optimized"
                    secondary={`Sons: ${previewResult.statistics?.genderDistribution.sons}, Daughters: ${previewResult.statistics?.genderDistribution.daughters}`}
                    primaryTypographyProps={{ color: themeStyles.textColor }}
                    secondaryTypographyProps={{ color: theme === 'dark' ? '#94a3b8' : '#666' }}
                  />
                </ListItem>
                <ListItem sx={{ py: 1 }}>
                  <ListItemIcon>
                    <Check sx={{ color: themeStyles.secondaryColor }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Assignment quality validated"
                    secondary={mode === 'homogeneous' 
                      ? `Address match quality: ${Math.round(previewResult.statistics?.addressMatchQuality! * 100)}%`
                      : `Average diversity score: ${previewResult.statistics?.averageDiversityScore?.toFixed(1)}`}
                    primaryTypographyProps={{ color: themeStyles.textColor }}
                    secondaryTypographyProps={{ color: theme === 'dark' ? '#94a3b8' : '#666' }}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>

          {/* Warning Box */}
          <Alert 
            severity="error"
            icon={<Warning />}
            sx={{ 
              backgroundColor: theme === 'dark' ? '#ff000010' : '#f8d7da',
              borderColor: themeStyles.errorColor
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
              Important Notice
            </Typography>
            This action cannot be undone. Once executed, all assignments will be permanently saved to the database.
            Please review carefully before proceeding.
          </Alert>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      )}
    </motion.div>
  );

  const renderResultsStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        p: 4,
        textAlign: 'center'
      }}>
        {success ? (
          <>
            <CheckCircle sx={{ fontSize: 80, color: themeStyles.secondaryColor, mb: 3 }} />
            <Typography variant="h4" sx={{ mb: 2, color: themeStyles.textColor, fontWeight: 'bold' }}>
              Assignment Successful!
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, color: themeStyles.textColor, maxWidth: 500 }}>
              {success}
            </Typography>
            
            {previewResult?.statistics && (
              <Card sx={{ 
                p: 3, 
                width: '100%',
                maxWidth: 600,
                backgroundColor: theme === 'dark' ? '#1e293b' : '#f8f9fa',
                border: theme === 'dark' ? '1px solid #334155' : '1px solid #dee2e6',
              }}>
                <Typography variant="h6" sx={{ mb: 3, color: themeStyles.textColor, textAlign: 'center' }}>
                  Assignment Summary
                </Typography>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, justifyContent: 'center', mb: 3 }}>
                  <Box sx={{ textAlign: 'center', minWidth: 120 }}>
                    <Box sx={{ 
                      width: 70,
                      height: 70,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: themeStyles.primaryColor,
                      color: 'white',
                      margin: '0 auto 8px',
                      fontWeight: 'bold',
                      fontSize: '1.5rem'
                    }}>
                      {previewResult.statistics.totalAssigned}
                    </Box>
                    <Typography variant="body2" color={theme === 'dark' ? '#94a3b8' : '#666'}>
                      Children Assigned
                    </Typography>
                  </Box>
                  
                  <Box sx={{ textAlign: 'center', minWidth: 120 }}>
                    <Box sx={{ 
                      width: 70,
                      height: 70,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: themeStyles.secondaryColor,
                      color: 'white',
                      margin: '0 auto 8px',
                      fontWeight: 'bold',
                      fontSize: '1.5rem'
                    }}>
                      {previewResult.statistics.totalFamiliesAffected}
                    </Box>
                    <Typography variant="body2" color={theme === 'dark' ? '#94a3b8' : '#666'}>
                      Families Updated
                    </Typography>
                  </Box>
                  
                  <Box sx={{ textAlign: 'center', minWidth: 120 }}>
                    <Box sx={{ 
                      width: 70,
                      height: 70,
                      borderRadius: '50%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: theme === 'dark' ? '#334155' : '#e9ecef',
                      margin: '0 auto 8px',
                    }}>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Boy sx={{ color: themeStyles.primaryColor, fontSize: '1.2rem' }} />
                        <Typography variant="body1" sx={{ fontWeight: 'bold', color: themeStyles.textColor }}>
                          {previewResult.statistics.genderDistribution.sons}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Girl sx={{ color: '#ff00ff', fontSize: '1.2rem' }} />
                        <Typography variant="body1" sx={{ fontWeight: 'bold', color: themeStyles.textColor }}>
                          {previewResult.statistics.genderDistribution.daughters}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="body2" color={theme === 'dark' ? '#94a3b8' : '#666'}>
                      Gender Distribution
                    </Typography>
                  </Box>
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                  <Button
                    startIcon={<Print />}
                    variant="outlined"
                    size="small"
                    sx={{ 
                      color: themeStyles.primaryColor,
                      borderColor: themeStyles.primaryColor
                    }}
                  >
                    Print Report
                  </Button>
                  <Button
                    startIcon={<Download />}
                    variant="outlined"
                    size="small"
                    sx={{ 
                      color: themeStyles.secondaryColor,
                      borderColor: themeStyles.secondaryColor
                    }}
                  >
                    Export Data
                  </Button>
                </Box>
              </Card>
            )}
            
            <Typography variant="body2" color={theme === 'dark' ? '#94a3b8' : '#666'} sx={{ mt: 3, maxWidth: 500 }}>
              The assignments have been successfully saved to the database. 
              You can now view the updated families in the family management section.
            </Typography>
          </>
        ) : error ? (
          <>
            <Warning sx={{ fontSize: 80, color: themeStyles.warningColor, mb: 3 }} />
            <Typography variant="h4" sx={{ mb: 2, color: themeStyles.textColor, fontWeight: 'bold' }}>
              Execution Failed
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, color: themeStyles.errorColor, maxWidth: 500 }}>
              {error}
            </Typography>
            <Button
              variant="contained"
              startIcon={<ArrowBack />}
              onClick={() => setActiveStep(2)}
              sx={{
                backgroundColor: themeStyles.primaryColor,
                '&:hover': {
                  backgroundColor: theme === 'dark' ? '#00b3b3' : '#0056b3'
                }
              }}
            >
              Return to Review
            </Button>
          </>
        ) : (
          <CircularProgress size={80} sx={{ color: themeStyles.primaryColor }} />
        )}
      </Box>
    </motion.div>
  );

  const handleNext = () => {
    if (activeStep === 0) {
      handlePreview();
    } else if (activeStep === 1) {
      setActiveStep(2); // Go to review step
    } else if (activeStep === 2) {
      setActiveStep(3);
      // Execute after a short delay
      setTimeout(handleExecute, 100);
    } else {
      onClose();
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  const isNextDisabled = () => {
    if (activeStep === 0) {
      return !targetBatch || eligibleFamilies.length === 0;
    }
    if (activeStep === 1) {
      return !previewResult || (previewResult.statistics?.totalAssigned || 0) === 0;
    }
    return false;
  };

  const getNextButtonText = () => {
    switch (activeStep) {
      case 0: return 'Generate Preview';
      case 1: return 'Review & Confirm';
      case 2: return 'Execute Assignments';
      case 3: return 'Finish';
      default: return 'Next';
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { 
          borderRadius: 2,
          backgroundColor: themeStyles.background,
          color: themeStyles.textColor,
          minHeight: '70vh',
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle sx={{ 
        borderBottom: theme === 'dark' ? '1px solid #334155' : '1px solid #e5e7eb',
        py: 3,
        position: 'sticky',
        top: 0,
        backgroundColor: themeStyles.background,
        zIndex: 1
      }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: themeStyles.textColor }}>
          Auto-Assign Children to Families
        </Typography>
        <Typography variant="body2" color={theme === 'dark' ? '#94a3b8' : '#999999'}>
          Automatically assign available students as children to existing families
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ p: 3, overflow: 'auto' }}>
        {/* Stepper */}
        <Stepper 
          activeStep={activeStep} 
          sx={{ mb: 4 }}
          alternativeLabel
        >
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel
                sx={{
                  '& .MuiStepLabel-label': {
                    color: theme === 'dark' ? '#a8b2d1' : '#666666',
                    '&.Mui-completed': {
                      color: themeStyles.secondaryColor,
                    },
                    '&.Mui-active': {
                      color: themeStyles.primaryColor,
                      fontWeight: 'bold',
                    },
                  },
                }}
              >
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Error Display */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 3 }}
            onClose={() => setError('')}
          >
            {error}
          </Alert>
        )}

        {/* Success Display */}
        {success && activeStep !== 3 && (
          <Alert 
            severity="success" 
            sx={{ mb: 3 }}
          >
            {success}
          </Alert>
        )}

        {/* Main Content */}
        {renderStepContent()}

        {/* Loading Overlay */}
        {loading && (
          <Box sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: theme === 'dark' ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}>
            <CircularProgress />
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ 
        p: 3,
        borderTop: theme === 'dark' ? '1px solid #334155' : '1px solid #e5e7eb',
        position: 'sticky',
        bottom: 0,
        backgroundColor: themeStyles.background,
        zIndex: 1
      }}>
        {activeStep === 3 ? (
          <>
            <Button
              onClick={handleReset}
              sx={{
                color: themeStyles.primaryColor,
                '&:hover': {
                  backgroundColor: theme === 'dark' ? '#00ffff10' : '#007bff10'
                }
              }}
            >
              Start Over
            </Button>
            <Button
              onClick={onClose}
              variant="contained"
              sx={{
                background: themeStyles.primaryColor,
                color: 'white',
                '&:hover': {
                  backgroundColor: theme === 'dark' ? '#00b3b3' : '#0056b3'
                }
              }}
            >
              Close & View Families
            </Button>
          </>
        ) : (
          <>
            <Button
              onClick={activeStep === 0 ? onClose : handleBack}
              disabled={activeStep === 2 || loading}
              sx={{
                color: themeStyles.primaryColor,
                '&:hover': {
                  backgroundColor: theme === 'dark' ? '#00ffff10' : '#007bff10'
                },
                '&.Mui-disabled': {
                  color: theme === 'dark' ? '#334155' : '#cbd5e1'
                }
              }}
            >
              {activeStep === 0 ? 'Cancel' : 'Back'}
            </Button>
            <Button
              onClick={handleNext}
              disabled={isNextDisabled() || loading}
              variant="contained"
              sx={{
                background: themeStyles.primaryColor,
                color: 'white',
                '&:hover': {
                  backgroundColor: theme === 'dark' ? '#00b3b3' : '#0056b3'
                },
                '&.Mui-disabled': {
                  background: theme === 'dark' ? '#334155' : '#e5e7eb',
                  color: theme === 'dark' ? '#94a3b8' : '#94a3b8'
                }
              }}
            >
              {getNextButtonText()}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default AutoAssignChildrenDialog;