// app/approve-program/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Card, CardContent,
  TextField, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow,
  Chip, Alert, Snackbar, CircularProgress,
  useMediaQuery, Pagination,
  MenuItem, Select, FormControl, InputLabel,
  IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, Button, RadioGroup, Radio,
  Autocomplete, Stack, Tooltip,
  Accordion, AccordionSummary, AccordionDetails,
  Paper, Collapse, Divider, FormControlLabel,
  TextareaAutosize
} from '@mui/material';
import { motion } from 'framer-motion';
import { useTheme } from '@/lib/theme-context';
import {
  Event, Edit, Delete, Visibility,
  CalendarToday, Person, LocationOn,
  ExpandMore, Add, CheckCircle, Cancel,
  Search, Refresh, HourglassEmpty, AssignmentTurnedIn,
  Save, Close, ArrowForward,
  Check, Clear, KeyboardArrowDown,
  KeyboardArrowUp, PersonOutline,
  AccessTime, Description, Schedule,
  PublishedWithChanges, DoneAll,
  Timer, ThumbUp, ThumbDown
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import api from '@/app/utils/api';
import { format, parseISO, startOfDay, endOfDay, differenceInMinutes, isBefore, isAfter } from 'date-fns';
import { useAuth } from '@/lib/auth';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface ProgramItem {
  _id: string;
  title: string;
  description: string;
  author: User;
  meetingClass: string;
  estimatedDuration: number;
  status: 'pending' | 'approved' | 'rejected' | 'selected';
  rejectionReason?: string;
  approvedBy?: User;
  approvedAt?: string;
  selectedOrder?: number;
  createdAt: string;
  updatedAt: string;
}

interface Program {
  _id: string;
  title: string;
  location: string;
  description: string;
  contributors: User[];
  publishedDate: string;
  dueDate: string;
  startTime: string;
  endTime: string;
  duration: number;
  programItems: ProgramItem[];
  selectedItems: string[];
  status: 'draft' | 'published' | 'finalized';
  createdBy: User;
  totalSelectedDuration: number;
  createdAt: string;
  updatedAt: string;
}

interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalPrograms: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface FilterOptions {
  meetingClasses: string[];
  locations: string[];
  creators: User[];
}

const ApproveProgramPage = () => {
  const { theme } = useTheme();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { user } = useAuth();
  
  const [programs, setPrograms] = useState<Program[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    meetingClasses: [],
    locations: [],
    creators: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [pagination, setPagination] = useState<PaginationData>({
    currentPage: 1,
    totalPages: 1,
    totalPrograms: 0,
    hasNext: false,
    hasPrev: false
  });

  const [filters, setFilters] = useState({
    search: '',
    meetingClass: '',
    location: '',
    createdBy: '',
    fromDate: null as Date | null,
    toDate: null as Date | null,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    page: 1,
    limit: 10
  });

  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openApproveDialog, setOpenApproveDialog] = useState(false);
  const [openPublishDialog, setOpenPublishDialog] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  
  const [approvalData, setApprovalData] = useState<{
    [key: string]: {
      status: 'approved' | 'rejected';
      rejectionReason?: string;
    }
  }>({});

  const [expandedRows, setExpandedRows] = useState<{ [key: string]: boolean }>({});

  const themeStyles = {
    background: theme === 'dark' 
      ? 'linear-gradient(135deg, #0a192f, #112240)' 
      : 'linear-gradient(135deg, #f0f0f0, #ffffff)',
    textColor: theme === 'dark' ? '#ccd6f6' : '#333333',
    primaryColor: theme === 'dark' ? '#00ffff' : '#007bff',
    cardBg: theme === 'dark' ? '#0f172a80' : '#ffffff',
    cardBorder: theme === 'dark' ? '#334155' : '#e5e7eb',
  };

  const textFieldStyle = {
    '& .MuiOutlinedInput-root': {
      backgroundColor: theme === 'dark' ? '#1e293b' : 'white',
      color: theme === 'dark' ? '#ccd6f6' : '#333333',
      '& fieldset': {
        borderColor: theme === 'dark' ? '#334155' : '#e5e7eb',
      },
      '&:hover fieldset': {
        borderColor: theme === 'dark' ? '#00ffff' : '#007bff',
      },
      '&.Mui-focused fieldset': {
        borderColor: theme === 'dark' ? '#00ffff' : '#007bff',
      },
    },
    '& .MuiInputLabel-root': {
      color: theme === 'dark' ? '#a8b2d1' : '#666666',
    },
    '& .MuiInputLabel-root.Mui-focused': {
      color: theme === 'dark' ? '#00ffff' : '#007bff',
    }
  };

  const selectStyle = {
    borderRadius: 1,
    backgroundColor: theme === 'dark' ? '#1e293b' : 'white',
    color: theme === 'dark' ? '#ccd6f6' : '#333333',
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: theme === 'dark' ? '#334155' : '#e5e7eb',
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: theme === 'dark' ? '#00ffff' : '#007bff',
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: theme === 'dark' ? '#00ffff' : '#007bff',
    }
  };

  // Fetch programs with pending items
  const fetchPrograms = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== '' && value !== null) {
          if (key === 'fromDate' || key === 'toDate') {
            if (value instanceof Date) {
              if (key === 'fromDate') {
                params.append('fromDate', startOfDay(value).toISOString());
              } else {
                params.append('toDate', endOfDay(value).toISOString());
              }
            }
          } else {
            params.append(key, value.toString());
          }
        }
      });

      const response = await api.get(`/programs/approval-queue?${params}`);
      setPrograms(response.data.data.programs || []);
      setPagination(response.data.data.pagination || {
        currentPage: 1,
        totalPages: 1,
        totalPrograms: 0,
        hasNext: false,
        hasPrev: false
      });
      setError('');
    } catch (error: any) {
      console.error('Error fetching programs:', error);
      setError(error.response?.data?.message || 'Failed to fetch programs');
      setPrograms([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchFilterOptions = useCallback(async () => {
    try {
      const response = await api.get('/programs/filter-options');
      setFilterOptions(response.data.data);
    } catch (error: any) {
      console.error('Failed to fetch filter options:', error);
    }
  }, []);

  const toggleRowExpansion = (programId: string, type: 'items' | 'details') => {
    const key = `${programId}-${type}`;
    setExpandedRows(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const getUserName = (user: User | undefined) => {
    if (!user) return 'N/A';
    return user.name || 'N/A';
  };

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy');
    } catch {
      return 'Invalid date';
    }
  };

  const formatTime = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'HH:mm');
    } catch {
      return 'Invalid time';
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy HH:mm');
    } catch {
      return 'Invalid date';
    }
  };

  const getStatusColor = (status: string): 'success' | 'warning' | 'error' | 'info' | 'default' => {
    switch (status) {
      case 'finalized': return 'success';
      case 'published': return 'info';
      case 'draft': return 'warning';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'finalized': return <DoneAll fontSize="small" />;
      case 'published': return <PublishedWithChanges fontSize="small" />;
      case 'draft': return <Edit fontSize="small" />;
      default: return <Event fontSize="small" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'finalized': return 'Finalized';
      case 'published': return 'Published';
      case 'draft': return 'Draft';
      default: return status;
    }
  };

  const getItemStatusColor = (status: string): 'success' | 'warning' | 'error' | 'info' => {
    switch (status) {
      case 'selected': return 'success';
      case 'approved': return 'info';
      case 'pending': return 'warning';
      case 'rejected': return 'error';
      default: return 'info';
    }
  };

  const getPendingItemsCount = (program: Program) => {
    return program.programItems.filter(item => item.status === 'pending').length;
  };

  const getApprovedItemsCount = (program: Program) => {
    return program.programItems.filter(item => item.status === 'approved').length;
  };

  const canPublishProgram = (program: Program) => {
    return program.status === 'draft' && getApprovedItemsCount(program) > 0;
  };

  useEffect(() => {
    if (user) {
      fetchPrograms();
      fetchFilterOptions();
    }
  }, [fetchPrograms, fetchFilterOptions, user]);

  // Dialog handlers
  const handleOpenViewDialog = (program: Program) => {
    setSelectedProgram(program);
    // Reset approval data
    const newApprovalData: typeof approvalData = {};
    program.programItems.forEach(item => {
      if (item.status === 'pending') {
        newApprovalData[item._id] = {
          status: 'approved',
          rejectionReason: ''
        };
      }
    });
    setApprovalData(newApprovalData);
    setOpenViewDialog(true);
  };

  const handleOpenApproveDialog = (program: Program) => {
    if (getPendingItemsCount(program) === 0) {
      setError('No pending items to approve');
      return;
    }
    
    setSelectedProgram(program);
    // Initialize approval data
    const newApprovalData: typeof approvalData = {};
    program.programItems.forEach(item => {
      if (item.status === 'pending') {
        newApprovalData[item._id] = {
          status: 'approved',
          rejectionReason: ''
        };
      }
    });
    setApprovalData(newApprovalData);
    setOpenApproveDialog(true);
  };

  const handleOpenPublishDialog = (program: Program) => {
    if (!canPublishProgram(program)) {
      setError('Program cannot be published yet');
      return;
    }
    
    setSelectedProgram(program);
    setOpenPublishDialog(true);
  };

  // Action handlers
  const handleApproveItems = async () => {
    if (!selectedProgram) return;

    try {
      // Process each pending item
      const pendingItems = selectedProgram.programItems.filter(item => item.status === 'pending');
      
      for (const item of pendingItems) {
        const approval = approvalData[item._id];
        if (approval) {
          await api.patch(`/programs/${selectedProgram._id}/items/${item._id}/status`, {
            status: approval.status,
            rejectionReason: approval.status === 'rejected' ? approval.rejectionReason : undefined
          });
        }
      }
      
      setSuccess('Program items approved/rejected successfully');
      setOpenApproveDialog(false);
      fetchPrograms();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to approve items');
    }
  };

  const handlePublishProgram = async () => {
    if (!selectedProgram) return;

    try {
      await api.patch(`/programs/${selectedProgram._id}/publish`);
      
      setSuccess('Program published successfully');
      setOpenPublishDialog(false);
      fetchPrograms();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to publish program');
    }
  };

  // Form handlers
  const handleFilterChange = (field: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
      ...(field !== 'page' && { page: 1 })
    }));
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    handleFilterChange('page', value);
  };

  const handleApprovalChange = (itemId: string, field: string, value: any) => {
    setApprovalData(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [field]: value
      }
    }));
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      meetingClass: '',
      location: '',
      createdBy: '',
      fromDate: null,
      toDate: null,
      sortBy: 'createdAt',
      sortOrder: 'desc',
      page: 1,
      limit: 10
    });
  };

  if (!user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <div className={`min-h-screen transition-colors duration-300 ${
        theme === 'dark' 
          ? 'bg-gradient-to-br from-[#0a192f] to-[#112240] text-white' 
          : 'bg-gradient-to-br from-[#f0f0f0] to-[#ffffff] text-[#333333]'
      }`}>
        <Box sx={{ 
          py: 3,
          px: { xs: 2, sm: 3, md: 4 }
        }}>
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Box sx={{ mb: 4 }}>
              <Typography variant={isMobile ? "h5" : "h4"} sx={{ 
                fontWeight: 'bold', 
                color: theme === 'dark' ? '#ccd6f6' : '#333333',
                mb: 1 
              }}>
                Program Approval Dashboard
              </Typography>
              <Typography variant={isMobile ? "body2" : "body1"} color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                Review and approve program items, publish programs
              </Typography>
            </Box>
          </motion.div>

          {/* Filter Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card sx={{ 
              mb: 4, 
              borderRadius: 2, 
              boxShadow: theme === 'dark' 
                ? '0 4px 12px rgba(0,0,0,0.3)' 
                : '0 4px 12px rgba(0,0,0,0.08)',
              backgroundColor: theme === 'dark' ? '#0f172a80' : 'white',
              backdropFilter: theme === 'dark' ? 'blur(10px)' : 'none'
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: { xs: 'column', md: 'row' },
                  justifyContent: 'space-between',
                  alignItems: { xs: 'stretch', md: 'center' },
                  gap: 3,
                  mb: 3
                }}>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 'bold',
                    color: theme === 'dark' ? '#ccd6f6' : '#333333',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    <CheckCircle /> Programs Pending Approval
                  </Typography>
                  
                  <Box sx={{ 
                    display: 'flex', 
                    gap: 2,
                    flexDirection: { xs: 'column', sm: 'row' }
                  }}>
                    <Button
                      variant="outlined"
                      startIcon={<Refresh />}
                      onClick={resetFilters}
                      sx={{ 
                        borderRadius: 1,
                        borderColor: theme === 'dark' ? '#00ffff' : '#007bff',
                        color: theme === 'dark' ? '#00ffff' : '#007bff',
                        '&:hover': {
                          borderColor: theme === 'dark' ? '#00b3b3' : '#0056b3',
                          backgroundColor: theme === 'dark' ? '#00ffff20' : '#007bff10'
                        }
                      }}
                    >
                      Reset Filters
                    </Button>
                  </Box>
                </Box>
                
                {/* Filter Controls */}
                <Box sx={{ 
                  display: 'flex',
                  flexDirection: { xs: 'column', md: 'row' },
                  flexWrap: 'wrap',
                  gap: 2
                }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Search Programs"
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    placeholder="Title, location, or description..."
                    InputProps={{
                      startAdornment: (
                        <Search sx={{ 
                          color: theme === 'dark' ? '#a8b2d1' : '#666666',
                          mr: 1 
                        }} />
                      ),
                    }}
                    sx={{
                      flex: { xs: '1 1 100%', md: '1 1 300px' },
                      ...textFieldStyle
                    }}
                  />
                  
                  <FormControl size="small" sx={{ flex: { xs: '1 1 100%', md: '1 1 200px' } }}>
                    <InputLabel sx={{ color: theme === 'dark' ? '#a8b2d1' : '#666666' }}>Meeting Class</InputLabel>
                    <Select
                      value={filters.meetingClass}
                      label="Meeting Class"
                      onChange={(e) => handleFilterChange('meetingClass', e.target.value)}
                      sx={selectStyle}
                    >
                      <MenuItem value="">
                        <Typography variant="body2" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                          All Classes
                        </Typography>
                      </MenuItem>
                      {filterOptions.meetingClasses.map((meetingClass) => (
                        <MenuItem key={meetingClass} value={meetingClass}>
                          <Typography variant="body2" color={theme === 'dark' ? '#ccd6f6' : '#333333'}>
                            {meetingClass}
                          </Typography>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  
                  <FormControl size="small" sx={{ flex: { xs: '1 1 100%', md: '1 1 200px' } }}>
                    <InputLabel sx={{ color: theme === 'dark' ? '#a8b2d1' : '#666666' }}>Creator</InputLabel>
                    <Select
                      value={filters.createdBy}
                      label="Creator"
                      onChange={(e) => handleFilterChange('createdBy', e.target.value)}
                      sx={selectStyle}
                    >
                      <MenuItem value="">All Creators</MenuItem>
                      {filterOptions.creators.map((creator) => (
                        <MenuItem key={creator._id} value={creator._id}>
                          <Typography variant="body2" color={theme === 'dark' ? '#ccd6f6' : '#333333'}>
                            {creator.name}
                          </Typography>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                {/* Date Range Filters */}
                <Box sx={{ 
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: 2,
                  mt: 2
                }}>
                  <DatePicker
                    label="From Date"
                    value={filters.fromDate}
                    onChange={(newValue) => handleFilterChange('fromDate', newValue)}
                    slotProps={{
                      textField: {
                        size: 'small',
                        fullWidth: true,
                        sx: textFieldStyle
                      }
                    }}
                  />
                  
                  <DatePicker
                    label="To Date"
                    value={filters.toDate}
                    onChange={(newValue) => handleFilterChange('toDate', newValue)}
                    slotProps={{
                      textField: {
                        size: 'small',
                        fullWidth: true,
                        sx: textFieldStyle
                      }
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </motion.div>

          {/* Programs List */}
          {loading ? (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              minHeight: '400px' 
            }}>
              <CircularProgress size={60} sx={{ color: theme === 'dark' ? '#00ffff' : '#007bff' }} />
            </Box>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              {programs.length === 0 ? (
                <Card sx={{ 
                  borderRadius: 2,
                  boxShadow: theme === 'dark' 
                    ? '0 4px 12px rgba(0,0,0,0.3)' 
                    : '0 4px 12px rgba(0,0,0,0.08)',
                  border: theme === 'dark' 
                    ? '1px solid #334155' 
                    : '1px solid #e5e7eb',
                  backgroundColor: theme === 'dark' ? '#0f172a80' : 'white',
                  backdropFilter: theme === 'dark' ? 'blur(10px)' : 'none',
                  textAlign: 'center',
                  py: 8
                }}>
                  <CheckCircle sx={{ 
                    fontSize: 64, 
                    color: theme === 'dark' ? '#334155' : '#cbd5e1',
                    mb: 2
                  }} />
                  <Typography variant="h6" color={theme === 'dark' ? '#a8b2d1' : '#666666'} sx={{ mb: 1 }}>
                    No programs pending approval
                  </Typography>
                  <Typography variant="body2" color={theme === 'dark' ? '#94a3b8' : '#999999'}>
                    All programs have been reviewed or there are no pending items
                  </Typography>
                </Card>
              ) : (
                <Stack spacing={3}>
                  {programs.map((program) => {
                    const pendingCount = getPendingItemsCount(program);
                    const approvedCount = getApprovedItemsCount(program);
                    
                    return (
                      <Card 
                        key={program._id}
                        sx={{ 
                          borderRadius: 2,
                          boxShadow: theme === 'dark' 
                            ? '0 4px 12px rgba(0,0,0,0.3)' 
                            : '0 4px 12px rgba(0,0,0,0.08)',
                          border: theme === 'dark' 
                            ? '1px solid #334155' 
                            : '1px solid #e5e7eb',
                          backgroundColor: theme === 'dark' ? '#0f172a80' : 'white',
                          backdropFilter: theme === 'dark' ? 'blur(10px)' : 'none'
                        }}
                      >
                        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                          {/* Program Header */}
                          <Box sx={{ 
                            display: 'flex', 
                            flexDirection: { xs: 'column', sm: 'row' },
                            justifyContent: 'space-between',
                            alignItems: { xs: 'flex-start', sm: 'center' },
                            gap: 2,
                            mb: 3
                          }}>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="h6" sx={{ 
                                fontWeight: 'bold',
                                color: theme === 'dark' ? '#ccd6f6' : '#333333',
                                mb: 0.5
                              }}>
                                {program.title}
                              </Typography>
                              
                              <Box sx={{ 
                                display: 'flex', 
                                flexDirection: { xs: 'column', sm: 'row' },
                                alignItems: { xs: 'flex-start', sm: 'center' },
                                gap: { xs: 1, sm: 3 }
                              }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <LocationOn fontSize="small" sx={{ color: theme === 'dark' ? '#a8b2d1' : '#666666' }} />
                                  <Typography variant="body2" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                                    {program.location}
                                  </Typography>
                                </Box>
                                
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <Person fontSize="small" sx={{ color: theme === 'dark' ? '#a8b2d1' : '#666666' }} />
                                  <Typography variant="body2" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                                    By: {getUserName(program.createdBy)}
                                  </Typography>
                                </Box>
                                
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                  <Chip
                                    label={`${pendingCount} pending`}
                                    size="small"
                                    color="warning"
                                    sx={{ height: 24, fontSize: '0.7rem' }}
                                  />
                                  <Chip
                                    label={`${approvedCount} approved`}
                                    size="small"
                                    color="success"
                                    sx={{ height: 24, fontSize: '0.7rem' }}
                                  />
                                </Box>
                              </Box>
                            </Box>
                            
                            <Box sx={{ 
                              display: 'flex', 
                              gap: 1,
                              flexDirection: { xs: 'row', sm: 'row' }
                            }}>
                              <Tooltip title="View Program Details">
                                <Button
                                  size="small"
                                  variant="outlined"
                                  startIcon={<Visibility />}
                                  onClick={() => handleOpenViewDialog(program)}
                                  sx={{ 
                                    borderRadius: 1,
                                    borderColor: theme === 'dark' ? '#00ffff' : '#007bff',
                                    color: theme === 'dark' ? '#00ffff' : '#007bff',
                                    '&:hover': {
                                      borderColor: theme === 'dark' ? '#00b3b3' : '#0056b3',
                                      backgroundColor: theme === 'dark' ? '#00ffff20' : '#007bff10'
                                    }
                                  }}
                                >
                                  View
                                </Button>
                              </Tooltip>
                              
                              {pendingCount > 0 && (
                                <Tooltip title="Approve/Reject Items">
                                  <Button
                                    size="small"
                                    variant="contained"
                                    startIcon={<CheckCircle />}
                                    onClick={() => handleOpenApproveDialog(program)}
                                    sx={{
                                      background: theme === 'dark'
                                        ? 'linear-gradient(135deg, #ff9900, #cc6600)'
                                        : 'linear-gradient(135deg, #ff9900, #cc6600)',
                                      borderRadius: 1,
                                      '&:hover': {
                                        background: theme === 'dark'
                                          ? 'linear-gradient(135deg, #cc6600, #993300)'
                                          : 'linear-gradient(135deg, #cc6600, #993300)'
                                      }
                                    }}
                                  >
                                    Review Items
                                  </Button>
                                </Tooltip>
                              )}
                              
                              {canPublishProgram(program) && (
                                <Tooltip title="Publish Program">
                                  <Button
                                    size="small"
                                    variant="contained"
                                    startIcon={<PublishedWithChanges />}
                                    onClick={() => handleOpenPublishDialog(program)}
                                    sx={{
                                      background: theme === 'dark'
                                        ? 'linear-gradient(135deg, #00ff00, #00b300)'
                                        : 'linear-gradient(135deg, #28a745, #218838)',
                                      borderRadius: 1,
                                      '&:hover': {
                                        background: theme === 'dark'
                                          ? 'linear-gradient(135deg, #00b300, #008000)'
                                          : 'linear-gradient(135deg, #218838, #1e7e34)'
                                      }
                                    }}
                                  >
                                    Publish
                                  </Button>
                                </Tooltip>
                              )}
                            </Box>
                          </Box>

                          {/* Program Details */}
                          <Box sx={{ 
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                            gap: 2,
                            mb: 3
                          }}>
                            <Box sx={{ 
                              p: 2, 
                              borderRadius: 1,
                              backgroundColor: theme === 'dark' ? '#1e293b' : '#f8f9fa',
                              border: theme === 'dark' ? '1px solid #334155' : '1px solid #e5e7eb'
                            }}>
                              <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                                Schedule
                              </Typography>
                              <Stack spacing={0.5} sx={{ mt: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <CalendarToday fontSize="small" sx={{ color: theme === 'dark' ? '#94a3b8' : '#999999' }} />
                                  <Typography variant="body2" sx={{ color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                                    Published: {formatDate(program.publishedDate)}
                                  </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <Schedule fontSize="small" sx={{ color: theme === 'dark' ? '#94a3b8' : '#999999' }} />
                                  <Typography variant="body2" sx={{ color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                                    Due: {formatDate(program.dueDate)}
                                  </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <AccessTime fontSize="small" sx={{ color: theme === 'dark' ? '#94a3b8' : '#999999' }} />
                                  <Typography variant="body2" sx={{ color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                                    Time: {formatTime(program.startTime)} - {formatTime(program.endTime)}
                                  </Typography>
                                </Box>
                              </Stack>
                            </Box>
                            
                            <Box sx={{ 
                              p: 2, 
                              borderRadius: 1,
                              backgroundColor: theme === 'dark' ? '#1e293b' : '#f8f9fa',
                              border: theme === 'dark' ? '1px solid #334155' : '1px solid #e5e7eb'
                            }}>
                              <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                                Program Summary
                              </Typography>
                              <Stack spacing={0.5} sx={{ mt: 1 }}>
                                <Typography variant="body2" sx={{ color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                                  Duration: {program.duration} minutes
                                </Typography>
                                <Typography variant="body2" sx={{ color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                                  Total Items: {program.programItems.length}
                                </Typography>
                                <Typography variant="body2" sx={{ color: theme === 'dark' ? '#00ffff' : '#007bff' }}>
                                  Pending Review: {pendingCount} items
                                </Typography>
                              </Stack>
                            </Box>
                          </Box>

                          {/* Pending Items Preview */}
                          {pendingCount > 0 && (
                            <Box sx={{ 
                              p: 2, 
                              borderRadius: 1,
                              backgroundColor: theme === 'dark' ? '#1e293b' : '#f8f9fa',
                              border: theme === 'dark' ? '2px solid #ff9900' : '2px solid #ff9900',
                              mb: 2
                            }}>
                              <Typography variant="subtitle2" sx={{ 
                                color: theme === 'dark' ? '#ff9900' : '#ff9900',
                                mb: 1,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1
                              }}>
                                <HourglassEmpty /> Items Pending Approval ({pendingCount})
                              </Typography>
                              
                              <Stack spacing={1}>
                                {program.programItems
                                  .filter(item => item.status === 'pending')
                                  .slice(0, 2)
                                  .map((item) => (
                                    <Box 
                                      key={item._id}
                                      sx={{ 
                                        p: 1.5,
                                        borderRadius: 1,
                                        backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff',
                                        border: theme === 'dark' ? '1px solid #334155' : '1px solid #e5e7eb'
                                      }}
                                    >
                                      <Typography variant="body2" sx={{ 
                                        color: theme === 'dark' ? '#ccd6f6' : '#333333',
                                        fontWeight: 'medium'
                                      }}>
                                        {item.title}
                                      </Typography>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5 }}>
                                        <Typography variant="caption" color={theme === 'dark' ? '#94a3b8' : '#999999'}>
                                          Author: {item.author?.name || 'N/A'}
                                        </Typography>
                                        <Typography variant="caption" color={theme === 'dark' ? '#94a3b8' : '#999999'}>
                                          Duration: {item.estimatedDuration} min
                                        </Typography>
                                      </Box>
                                    </Box>
                                  ))}
                                
                                {pendingCount > 2 && (
                                  <Typography variant="caption" sx={{ 
                                    color: theme === 'dark' ? '#a8b2d1' : '#666666',
                                    fontStyle: 'italic'
                                  }}>
                                    ...and {pendingCount - 2} more items pending review
                                  </Typography>
                                )}
                              </Stack>
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </Stack>
              )}

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  mt: 4,
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: 2
                }}>
                  <Pagination
                    count={pagination.totalPages}
                    page={filters.page}
                    onChange={handlePageChange}
                    color="primary"
                    size={isMobile ? "small" : "medium"}
                    showFirstButton
                    showLastButton
                    sx={{
                      '& .MuiPaginationItem-root': {
                        borderRadius: 1,
                        color: theme === 'dark' ? '#ccd6f6' : '#333333',
                        '&.Mui-selected': {
                          backgroundColor: theme === 'dark' ? '#00ffff' : '#007bff',
                          color: theme === 'dark' ? '#0a192f' : 'white',
                        },
                        '&:hover': {
                          backgroundColor: theme === 'dark' ? '#00ffff20' : '#007bff10'
                        }
                      }
                    }}
                  />
                  
                  <Typography variant="body2" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                    Showing {((filters.page - 1) * filters.limit) + 1} to {Math.min(filters.page * filters.limit, pagination.totalPrograms)} of {pagination.totalPrograms} programs
                  </Typography>
                </Box>
              )}
            </motion.div>
          )}

          {/* View Program Dialog */}
          <Dialog 
            open={openViewDialog} 
            onClose={() => setOpenViewDialog(false)} 
            maxWidth="lg" 
            fullWidth
            fullScreen={isMobile}
            PaperProps={{
              sx: { 
                borderRadius: 2,
                backgroundColor: theme === 'dark' ? '#0f172a' : 'white',
                color: theme === 'dark' ? '#ccd6f6' : '#333333'
              }
            }}
          >
            {selectedProgram && (
              <>
                <DialogTitle sx={{ 
                  backgroundColor: theme === 'dark' ? '#0f172a' : 'white',
                  borderBottom: theme === 'dark' ? '1px solid #334155' : '1px solid #e5e7eb',
                  py: 3
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                        {selectedProgram.title}
                      </Typography>
                      <Typography variant="body2" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                        {selectedProgram.location}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Chip
                        label={`${getPendingItemsCount(selectedProgram)} pending`}
                        color="warning"
                      />
                      <Chip
                        label={getStatusText(selectedProgram.status)}
                        color={getStatusColor(selectedProgram.status)}
                        icon={getStatusIcon(selectedProgram.status)}
                      />
                    </Box>
                  </Box>
                </DialogTitle>
                <DialogContent sx={{ p: 3, overflowY: 'auto' }}>
                  {/* Same view as in main page but read-only */}
                  <Card sx={{ 
                    mb: 3,
                    backgroundColor: theme === 'dark' ? '#1e293b' : '#f8f9fa',
                    border: theme === 'dark' ? '1px solid #334155' : '1px solid #e5e7eb'
                  }}>
                    <CardContent>
                      <Typography variant="subtitle1" sx={{ 
                        mb: 2,
                        color: theme === 'dark' ? '#ccd6f6' : '#333333'
                      }}>
                        📋 Program Details
                      </Typography>
                      
                      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3, mb: 2 }}>
                        <Box>
                          <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                            Title
                          </Typography>
                          <Typography variant="body2" sx={{ color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                            {selectedProgram.title}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                            Location
                          </Typography>
                          <Typography variant="body2" sx={{ color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                            {selectedProgram.location}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                            Published Date
                          </Typography>
                          <Typography variant="body2" sx={{ color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                            {formatDateTime(selectedProgram.publishedDate)}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                            Due Date
                          </Typography>
                          <Typography variant="body2" sx={{ color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                            {formatDateTime(selectedProgram.dueDate)}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                            Start Time
                          </Typography>
                          <Typography variant="body2" sx={{ color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                            {formatDateTime(selectedProgram.startTime)}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                            End Time
                          </Typography>
                          <Typography variant="body2" sx={{ color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                            {formatDateTime(selectedProgram.endTime)}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                            Duration
                          </Typography>
                          <Typography variant="body2" sx={{ color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                            {selectedProgram.duration} minutes
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                            Created By
                          </Typography>
                          <Typography variant="body2" sx={{ color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                            {getUserName(selectedProgram.createdBy)}
                          </Typography>
                        </Box>
                      </Box>
                      
                      {/* Description */}
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                          Description
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          color: theme === 'dark' ? '#ccd6f6' : '#333333',
                          whiteSpace: 'pre-wrap',
                          mt: 1
                        }}>
                          {selectedProgram.description}
                        </Typography>
                      </Box>
                      
                      {/* Contributors */}
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" sx={{ 
                          color: theme === 'dark' ? '#ccd6f6' : '#333333', 
                          mb: 1,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1
                        }}>
                          <PersonOutline /> Contributors ({selectedProgram.contributors.length})
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {selectedProgram.contributors.map((contributor) => (
                            <Chip
                              key={contributor._id}
                              label={contributor.name || contributor.email}
                              size="small"
                              sx={{
                                backgroundColor: theme === 'dark' ? '#00ffff20' : '#007bff20',
                                color: theme === 'dark' ? '#00ffff' : '#007bff'
                              }}
                            />
                          ))}
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>

                  {/* Program Items */}
                  <Typography variant="h6" sx={{ 
                    mb: 2,
                    color: theme === 'dark' ? '#ccd6f6' : '#333333'
                  }}>
                    Program Items ({selectedProgram.programItems.length})
                  </Typography>
                  
                  {selectedProgram.programItems.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Description sx={{ 
                        fontSize: 48, 
                        color: theme === 'dark' ? '#334155' : '#cbd5e1',
                        mb: 2
                      }} />
                      <Typography variant="body2" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                        No program items added yet
                      </Typography>
                    </Box>
                  ) : (
                    <Stack spacing={2}>
                      {selectedProgram.programItems.map((item, index) => (
                        <Paper 
                          key={item._id}
                          sx={{ 
                            p: 2, 
                            backgroundColor: theme === 'dark' ? '#1e293b' : 'white',
                            border: theme === 'dark' ? '1px solid #334155' : '1px solid #e5e7eb',
                            borderLeft: `4px solid ${
                              theme === 'dark' 
                                ? item.status === 'selected' ? '#00ff00' :
                                  item.status === 'approved' ? '#00ffff' :
                                  item.status === 'pending' ? '#ff9900' : '#ff0000'
                                : item.status === 'selected' ? '#28a745' :
                                  item.status === 'approved' ? '#007bff' :
                                  item.status === 'pending' ? '#ff9900' : '#dc3545'
                            }`
                          }}
                        >
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                            <Typography variant="subtitle2" sx={{ 
                              color: theme === 'dark' ? '#ccd6f6' : '#333333',
                              fontWeight: 'bold'
                            }}>
                              {index + 1}. {item.title}
                            </Typography>
                            <Chip
                              label={item.status}
                              size="small"
                              color={getItemStatusColor(item.status)}
                              sx={{ height: 20, fontSize: '0.6rem' }}
                            />
                          </Box>
                          
                          <Typography variant="body2" color={theme === 'dark' ? '#a8b2d1' : '#666666'} sx={{ mb: 1 }}>
                            {item.description}
                          </Typography>
                          
                          <Box sx={{ 
                            display: 'flex', 
                            flexDirection: { xs: 'column', sm: 'row' },
                            justifyContent: 'space-between',
                            alignItems: { xs: 'flex-start', sm: 'center' },
                            gap: 1,
                            mt: 2
                          }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Typography variant="caption" color={theme === 'dark' ? '#94a3b8' : '#999999'}>
                                Author: {item.author?.name || 'N/A'}
                              </Typography>
                              <Typography variant="caption" color={theme === 'dark' ? '#94a3b8' : '#999999'}>
                                Class: {item.meetingClass}
                              </Typography>
                              <Typography variant="caption" color={theme === 'dark' ? '#94a3b8' : '#999999'}>
                                Duration: {item.estimatedDuration} min
                              </Typography>
                            </Box>
                            
                            {item.status === 'selected' && item.selectedOrder && (
                              <Chip
                                label={`Order: ${item.selectedOrder}`}
                                size="small"
                                sx={{
                                  backgroundColor: theme === 'dark' ? '#00ff0020' : '#28a74520',
                                  color: theme === 'dark' ? '#00ff00' : '#28a745'
                                }}
                              />
                            )}
                          </Box>
                          
                          {item.rejectionReason && (
                            <Box sx={{ 
                              mt: 2, 
                              p: 1.5,
                              borderRadius: 1,
                              backgroundColor: theme === 'dark' ? '#ff000020' : '#dc354520',
                              border: theme === 'dark' ? '1px solid #ff0000' : '1px solid #dc3545'
                            }}>
                              <Typography variant="caption" sx={{ 
                                color: theme === 'dark' ? '#ff0000' : '#dc3545',
                                fontWeight: 'bold'
                              }}>
                                Rejection Reason:
                              </Typography>
                              <Typography variant="caption" sx={{ 
                                color: theme === 'dark' ? '#ff6666' : '#dc3545',
                                display: 'block',
                                mt: 0.5
                              }}>
                                {item.rejectionReason}
                              </Typography>
                            </Box>
                          )}
                        </Paper>
                      ))}
                    </Stack>
                  )}
                </DialogContent>
                <DialogActions sx={{ 
                  p: 3,
                  borderTop: theme === 'dark' ? '1px solid #334155' : '1px solid #e5e7eb',
                  backgroundColor: theme === 'dark' ? '#0f172a' : 'white'
                }}>
                  <Button 
                    onClick={() => setOpenViewDialog(false)}
                    sx={{
                      color: theme === 'dark' ? '#00ffff' : '#007bff',
                      '&:hover': {
                        backgroundColor: theme === 'dark' ? '#00ffff20' : '#007bff10'
                      }
                    }}
                  >
                    Close
                  </Button>
                  {getPendingItemsCount(selectedProgram) > 0 && (
                    <Button 
                      onClick={() => {
                        setOpenViewDialog(false);
                        handleOpenApproveDialog(selectedProgram);
                      }}
                      variant="contained"
                      sx={{
                        background: theme === 'dark'
                          ? 'linear-gradient(135deg, #ff9900, #cc6600)'
                          : 'linear-gradient(135deg, #ff9900, #cc6600)',
                        borderRadius: 1,
                        '&:hover': {
                          background: theme === 'dark'
                            ? 'linear-gradient(135deg, #cc6600, #993300)'
                            : 'linear-gradient(135deg, #cc6600, #993300)'
                        }
                      }}
                    >
                      Review Items ({getPendingItemsCount(selectedProgram)})
                    </Button>
                  )}
                  {canPublishProgram(selectedProgram) && (
                    <Button 
                      onClick={() => {
                        setOpenViewDialog(false);
                        handleOpenPublishDialog(selectedProgram);
                      }}
                      variant="contained"
                      sx={{
                        background: theme === 'dark'
                          ? 'linear-gradient(135deg, #00ff00, #00b300)'
                          : 'linear-gradient(135deg, #28a745, #218838)',
                        borderRadius: 1,
                        '&:hover': {
                          background: theme === 'dark'
                            ? 'linear-gradient(135deg, #00b300, #008000)'
                            : 'linear-gradient(135deg, #218838, #1e7e34)'
                        }
                      }}
                    >
                      Publish Program
                    </Button>
                  )}
                </DialogActions>
              </>
            )}
          </Dialog>

          {/* Approve Items Dialog */}
          <Dialog 
            open={openApproveDialog} 
            onClose={() => setOpenApproveDialog(false)} 
            maxWidth="lg" 
            fullWidth
            fullScreen={isMobile}
            PaperProps={{
              sx: { 
                borderRadius: 2,
                backgroundColor: theme === 'dark' ? '#0f172a' : 'white',
                color: theme === 'dark' ? '#ccd6f6' : '#333333'
              }
            }}
          >
            {selectedProgram && (
              <>
                <DialogTitle sx={{ 
                  backgroundColor: theme === 'dark' ? '#0f172a' : 'white',
                  borderBottom: theme === 'dark' ? '1px solid #334155' : '1px solid #e5e7eb',
                  py: 3
                }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                    Review Program Items
                  </Typography>
                  <Typography variant="body2" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                    {selectedProgram.title} - {selectedProgram.location}
                  </Typography>
                </DialogTitle>
                <DialogContent sx={{ p: 3, overflowY: 'auto' }}>
                  <Typography variant="body1" color={theme === 'dark' ? '#ccd6f6' : '#333333'} sx={{ mb: 3 }}>
                    Review and approve/reject pending program items. Rejected items require a reason.
                  </Typography>
                  
                  <Stack spacing={3}>
                    {selectedProgram.programItems
                      .filter(item => item.status === 'pending')
                      .map((item, index) => (
                        <Paper 
                          key={item._id}
                          sx={{ 
                            p: 3, 
                            backgroundColor: theme === 'dark' ? '#1e293b' : 'white',
                            border: theme === 'dark' ? '1px solid #334155' : '1px solid #e5e7eb'
                          }}
                        >
                          <Typography variant="subtitle1" sx={{ 
                            color: theme === 'dark' ? '#ccd6f6' : '#333333',
                            fontWeight: 'bold',
                            mb: 1
                          }}>
                            Item {index + 1}: {item.title}
                          </Typography>
                          
                          <Typography variant="body2" color={theme === 'dark' ? '#a8b2d1' : '#666666'} sx={{ mb: 2 }}>
                            {item.description}
                          </Typography>
                          
                          <Box sx={{ 
                            display: 'flex', 
                            flexDirection: { xs: 'column', sm: 'row' },
                            justifyContent: 'space-between',
                            alignItems: { xs: 'flex-start', sm: 'center' },
                            gap: 2,
                            mb: 2
                          }}>
                            <Box>
                              <Typography variant="caption" color={theme === 'dark' ? '#94a3b8' : '#999999'}>
                                Author: {item.author?.name || 'N/A'}
                              </Typography>
                              <Typography variant="caption" color={theme === 'dark' ? '#94a3b8' : '#999999'} sx={{ display: 'block' }}>
                                Class: {item.meetingClass}
                              </Typography>
                            </Box>
                            
                            <Chip
                              label={`Duration: ${item.estimatedDuration} minutes`}
                              size="small"
                              sx={{
                                backgroundColor: theme === 'dark' ? '#00ffff20' : '#007bff20',
                                color: theme === 'dark' ? '#00ffff' : '#007bff'
                              }}
                            />
                          </Box>
                          
                          <Divider sx={{ my: 2 }} />
                          
                          {/* Approval Controls */}
                          <Box>
                            <Typography variant="subtitle2" sx={{ 
                              color: theme === 'dark' ? '#ccd6f6' : '#333333',
                              mb: 2
                            }}>
                              Review Decision
                            </Typography>
                            
                            <RadioGroup
                              value={approvalData[item._id]?.status || 'approved'}
                              onChange={(e) => handleApprovalChange(item._id, 'status', e.target.value)}
                              sx={{ mb: 2 }}
                            >
                              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                <FormControlLabel
                                  value="approved"
                                  control={<Radio sx={{ 
                                    color: theme === 'dark' ? '#00ffff' : '#007bff',
                                    '&.Mui-checked': { color: theme === 'dark' ? '#00ffff' : '#007bff' }
                                  }} />}
                                  label={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <ThumbUp fontSize="small" sx={{ color: theme === 'dark' ? '#00ff00' : '#28a745' }} />
                                      <Typography variant="body2" sx={{ color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                                        Approve
                                      </Typography>
                                    </Box>
                                  }
                                />
                                <FormControlLabel
                                  value="rejected"
                                  control={<Radio sx={{ 
                                    color: theme === 'dark' ? '#ff0000' : '#dc3545',
                                    '&.Mui-checked': { color: theme === 'dark' ? '#ff0000' : '#dc3545' }
                                  }} />}
                                  label={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <ThumbDown fontSize="small" sx={{ color: theme === 'dark' ? '#ff0000' : '#dc3545' }} />
                                      <Typography variant="body2" sx={{ color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                                        Reject
                                      </Typography>
                                    </Box>
                                  }
                                />
                              </Stack>
                            </RadioGroup>
                            
                            {/* Rejection Reason */}
                            {approvalData[item._id]?.status === 'rejected' && (
                              <Box sx={{ mt: 2 }}>
                                <Typography variant="caption" sx={{ 
                                  color: theme === 'dark' ? '#a8b2d1' : '#666666',
                                  mb: 1,
                                  display: 'block'
                                }}>
                                  Rejection Reason (Required)
                                </Typography>
                                <TextField
                                  fullWidth
                                  multiline
                                  rows={3}
                                  value={approvalData[item._id]?.rejectionReason || ''}
                                  onChange={(e) => handleApprovalChange(item._id, 'rejectionReason', e.target.value)}
                                  placeholder="Please provide a reason for rejecting this item..."
                                  sx={textFieldStyle}
                                />
                              </Box>
                            )}
                          </Box>
                        </Paper>
                      ))}
                  </Stack>
                </DialogContent>
                <DialogActions sx={{ 
                  p: 3,
                  borderTop: theme === 'dark' ? '1px solid #334155' : '1px solid #e5e7eb',
                  backgroundColor: theme === 'dark' ? '#0f172a' : 'white'
                }}>
                  <Button 
                    onClick={() => setOpenApproveDialog(false)}
                    sx={{
                      color: theme === 'dark' ? '#00ffff' : '#007bff',
                      '&:hover': {
                        backgroundColor: theme === 'dark' ? '#00ffff20' : '#007bff10'
                      }
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleApproveItems}
                    variant="contained"
                    disabled={Object.values(approvalData).some(item => 
                      item.status === 'rejected' && (!item.rejectionReason || item.rejectionReason.trim() === '')
                    )}
                    sx={{
                      background: theme === 'dark'
                        ? 'linear-gradient(135deg, #00ff00, #00b300)'
                        : 'linear-gradient(135deg, #28a745, #218838)',
                      borderRadius: 1,
                      '&:hover': {
                        background: theme === 'dark'
                          ? 'linear-gradient(135deg, #00b300, #008000)'
                          : 'linear-gradient(135deg, #218838, #1e7e34)'
                      },
                      '&.Mui-disabled': {
                        background: theme === 'dark' ? '#334155' : '#e5e7eb',
                        color: theme === 'dark' ? '#94a3b8' : '#94a3b8'
                      }
                    }}
                  >
                    Submit Reviews
                  </Button>
                </DialogActions>
              </>
            )}
          </Dialog>

          {/* Publish Program Dialog */}
          <Dialog 
            open={openPublishDialog} 
            onClose={() => setOpenPublishDialog(false)}
            PaperProps={{
              sx: { 
                borderRadius: 2,
                backgroundColor: theme === 'dark' ? '#0f172a' : 'white',
                color: theme === 'dark' ? '#ccd6f6' : '#333333'
              }
            }}
          >
            {selectedProgram && (
              <>
                <DialogTitle sx={{ 
                  backgroundColor: theme === 'dark' ? '#0f172a' : 'white',
                  borderBottom: theme === 'dark' ? '1px solid #334155' : '1px solid #e5e7eb',
                  py: 3
                }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                    Publish Program
                  </Typography>
                </DialogTitle>
                <DialogContent sx={{ p: 3 }}>
                  <Typography variant="body1" color={theme === 'dark' ? '#a8b2d1' : '#666666'} sx={{ mb: 2 }}>
                    Are you sure you want to publish the program <strong style={{color: theme === 'dark' ? '#00ff00' : '#28a745'}}>
                      "{selectedProgram?.title}"
                    </strong>?
                  </Typography>
                  
                  <Box sx={{ 
                    p: 2, 
                    borderRadius: 1,
                    backgroundColor: theme === 'dark' ? '#1e293b' : '#f8f9fa',
                    border: theme === 'dark' ? '1px solid #334155' : '1px solid #e5e7eb',
                    mb: 2
                  }}>
                    <Typography variant="body2" sx={{ color: theme === 'dark' ? '#ccd6f6' : '#333333', mb: 1 }}>
                      Publishing will:
                    </Typography>
                    <ul style={{ 
                      color: theme === 'dark' ? '#a8b2d1' : '#666666',
                      paddingLeft: '20px',
                      margin: 0
                    }}>
                      <li>Change program status from "Draft" to "Published"</li>
                      <li>Make the program available for item selection</li>
                      <li>Allow users to select approved items for the final program</li>
                      <li>Cannot be undone automatically</li>
                    </ul>
                  </Box>
                  
                  <Typography variant="body2" color={theme === 'dark' ? '#94a3b8' : '#999999'}>
                    Approved Items: {getApprovedItemsCount(selectedProgram)} | 
                    Pending Items: {getPendingItemsCount(selectedProgram)} | 
                    Total Items: {selectedProgram.programItems.length}
                  </Typography>
                </DialogContent>
                <DialogActions sx={{ 
                  p: 3,
                  borderTop: theme === 'dark' ? '1px solid #334155' : '1px solid #e5e7eb',
                  backgroundColor: theme === 'dark' ? '#0f172a' : 'white'
                }}>
                  <Button 
                    onClick={() => setOpenPublishDialog(false)}
                    sx={{
                      color: theme === 'dark' ? '#00ffff' : '#007bff',
                      '&:hover': {
                        backgroundColor: theme === 'dark' ? '#00ffff20' : '#007bff10'
                      }
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handlePublishProgram} 
                    variant="contained"
                    sx={{
                      borderRadius: 1,
                      background: theme === 'dark'
                        ? 'linear-gradient(135deg, #00ff00, #00b300)'
                        : 'linear-gradient(135deg, #28a745, #218838)',
                      '&:hover': {
                        background: theme === 'dark'
                          ? 'linear-gradient(135deg, #00b300, #008000)'
                          : 'linear-gradient(135deg, #218838, #1e7e34)'
                      }
                    }}
                  >
                    Publish Program
                  </Button>
                </DialogActions>
              </>
            )}
          </Dialog>

          {/* Notifications */}
          <Snackbar 
            open={!!error} 
            autoHideDuration={6000} 
            onClose={() => setError('')}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          >
            <Alert 
              severity="error" 
              onClose={() => setError('')}
              sx={{ 
                borderRadius: 1,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                backgroundColor: theme === 'dark' ? '#0f172a' : 'white',
                color: theme === 'dark' ? '#ff0000' : '#dc3545'
              }}
            >
              {error}
            </Alert>
          </Snackbar>
          
          <Snackbar 
            open={!!success} 
            autoHideDuration={6000} 
            onClose={() => setSuccess('')}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          >
            <Alert 
              severity="success" 
              onClose={() => setSuccess('')}
              sx={{ 
                borderRadius: 1,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                backgroundColor: theme === 'dark' ? '#0f172a' : 'white',
                color: theme === 'dark' ? '#00ff00' : '#28a745'
              }}
            >
              {success}
            </Alert>
          </Snackbar>
        </Box>
      </div>
    </LocalizationProvider>
  );
};

export default ApproveProgramPage;