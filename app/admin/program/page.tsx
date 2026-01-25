// app/program/page.tsx
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
  DialogActions, Button, Checkbox,
  Autocomplete, Stack, Tooltip,
  Accordion, AccordionSummary, AccordionDetails,
  Paper, Collapse, FormControlLabel, Switch,
  Divider
} from '@mui/material';
import { motion } from 'framer-motion';
import { useTheme } from '@/lib/theme-context';
import {
  Event, Edit, Delete, Visibility,
  CalendarToday, Person, LocationOn,
  ExpandMore, Add, SelectAll,
  Search, Refresh, CheckCircle,
  HourglassEmpty, AssignmentTurnedIn,
  Save, Close, ArrowForward,
  Check, Clear, KeyboardArrowDown,
  KeyboardArrowUp, PersonOutline,
  AccessTime, Description, Schedule,
  PublishedWithChanges, DoneAll
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import api from '@/app/utils/api';
import { format, parseISO, startOfDay, endOfDay, differenceInMinutes, isBefore, isAfter } from 'date-fns';
import { useAuth } from '@/lib/auth';

// Define proper interfaces based on your data structure
interface Student {
  _id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  gibyGubayeId: string;
  email: string;
  phone: string;
  gender: string;
  photo?: string;
  photoData?: any;
}

interface ProgramUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  gibyGubayeId?: string;
  phone?: string;
  studentId?: Student | string; // Can be populated object or just ID string
}

interface ProgramItem {
  _id: string;
  title: string;
  description: string;
  author: ProgramUser;
  meetingClass: string;
  estimatedDuration: number;
  status: 'pending' | 'approved' | 'rejected' | 'selected';
  rejectionReason?: string;
  approvedBy?: ProgramUser;
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
  contributors: ProgramUser[];
  publishedDate: string;
  dueDate: string;
  startTime: string;
  endTime: string;
  duration: number;
  programItems: ProgramItem[];
  selectedItems: string[];
  status: 'draft' | 'published' | 'finalized';
  createdBy: ProgramUser;
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
  creators: ProgramUser[];
}

const ProgramManagementPage = () => {
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
    status: '',
    createdBy: '',
    fromDate: null as Date | null,
    toDate: null as Date | null,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    page: 1,
    limit: 10
  });

  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openSelectDialog, setOpenSelectDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  
  const [formData, setFormData] = useState<{
    title: string;
    location: string;
    description: string;
    contributors: string[];
    publishedDate: Date | null;
    dueDate: Date | null;
    startTime: Date | null;
    endTime: Date | null;
  }>({
    title: '',
    location: '',
    description: '',
    contributors: [],
    publishedDate: null,
    dueDate: null,
    startTime: null,
    endTime: null
  });

  const [selectionData, setSelectionData] = useState<{
    selectedItems: string[];
    availableItems: ProgramItem[];
    totalDuration: number;
  }>({
    selectedItems: [],
    availableItems: [],
    totalDuration: 0
  });

  const [expandedRows, setExpandedRows] = useState<{ [key: string]: boolean }>({});
  const [users, setUsers] = useState<ProgramUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

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

  // Helper function to get user display name
  const getUserDisplayName = (user: ProgramUser | undefined): string => {
    if (!user) return 'N/A';
    return user.name || 'N/A';
  };

  // Helper function to get user full name (for students)
  const getStudentFullName = (student: Student | undefined): string => {
    if (!student) return 'N/A';
    return `${student.firstName} ${student.middleName || ''} ${student.lastName}`.trim();
  };

  // Fetch data functions
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

      const response = await api.get(`/programs?${params}`);
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

  const fetchUsers = useCallback(async () => {
    try {
      setUsersLoading(true);
      const response = await api.get('/user');
      const usersData = response.data.data?.users || response.data.data || [];
      
      // Transform users to our ProgramUser interface
      const transformedUsers: ProgramUser[] = usersData.map((user: any) => ({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        gibyGubayeId: user.gibyGubayeId,
        phone: user.phone,
        studentId: user.studentId
      }));
      
      setUsers(transformedUsers);
    } catch (error: any) {
      console.error('Failed to fetch users:', error);
      setUsers([]);
    } finally {
      setUsersLoading(false);
    }
  }, []);

  const toggleRowExpansion = (programId: string, type: 'contributors' | 'items') => {
    const key = `${programId}-${type}`;
    setExpandedRows(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
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

  const canEditProgram = (program: Program) => {
    const now = new Date();
    const dueDate = new Date(program.dueDate);
    return program.status === 'draft' && isBefore(now, dueDate);
  };

  // In your program/page.tsx, update the canSelectItems function
const canSelectItems = (program: Program) => {
  // Simply check if program is published and has approved items
  const hasApprovedItems = program.programItems.some(item => item.status === 'approved');
  
  return program.status === 'published' && hasApprovedItems;
};

  const canDeleteProgram = (program: Program) => {
    return program.status === 'draft' && program.createdBy._id === user?._id;
  };

  useEffect(() => {
    if (user) {
      fetchPrograms();
      fetchFilterOptions();
      fetchUsers();
    }
  }, [fetchPrograms, fetchFilterOptions, fetchUsers, user]);

  // Dialog handlers
  const handleOpenCreateDialog = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    setFormData({
      title: '',
      location: '',
      description: '',
      contributors: [],
      publishedDate: tomorrow,
      dueDate: tomorrow,
      startTime: null,
      endTime: null
    });
    setOpenCreateDialog(true);
  };

  const handleOpenEditDialog = (program: Program) => {
    if (!canEditProgram(program)) {
      setError('Cannot edit this program');
      return;
    }
    
    setSelectedProgram(program);
    setFormData({
      title: program.title,
      location: program.location,
      description: program.description,
      contributors: program.contributors.map(c => c._id),
      publishedDate: new Date(program.publishedDate),
      dueDate: new Date(program.dueDate),
      startTime: new Date(program.startTime),
      endTime: new Date(program.endTime)
    });
    setOpenEditDialog(true);
  };

  const handleOpenViewDialog = (program: Program) => {
    setSelectedProgram(program);
    setOpenViewDialog(true);
  };

  const handleOpenSelectDialog = async (program: Program) => {
    if (!canSelectItems(program)) {
      setError('Cannot select items for this program');
      return;
    }
    
    setSelectedProgram(program);
    
    // Get approved items
    const approvedItems = program.programItems.filter(item => item.status === 'approved');
    
    setSelectionData({
      selectedItems: program.selectedItems || [],
      availableItems: approvedItems,
      totalDuration: program.totalSelectedDuration || 0
    });
    
    setOpenSelectDialog(true);
  };

  const handleOpenDeleteDialog = (program: Program) => {
    if (!canDeleteProgram(program)) {
      setError('Cannot delete this program');
      return;
    }
    setSelectedProgram(program);
    setOpenDeleteDialog(true);
  };

  // Action handlers
  const handleCreateProgram = async () => {
    try {
      if (!formData.title.trim() || !formData.location.trim() || !formData.description.trim()) {
        setError('Title, location, and description are required');
        return;
      }

      if (!formData.publishedDate || !formData.dueDate || !formData.startTime || !formData.endTime) {
        setError('All date and time fields are required');
        return;
      }

      const payload = {
        title: formData.title.trim(),
        location: formData.location.trim(),
        description: formData.description.trim(),
        contributors: formData.contributors,
        publishedDate: formData.publishedDate.toISOString(),
        dueDate: formData.dueDate.toISOString(),
        startTime: formData.startTime.toISOString(),
        endTime: formData.endTime.toISOString()
      };

      await api.post('/programs', payload);
      
      setSuccess('Program created successfully');
      setOpenCreateDialog(false);
      fetchPrograms();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to create program');
    }
  };

  const handleUpdateProgram = async () => {
    if (!selectedProgram) return;

    try {
      const payload = {
        title: formData.title.trim(),
        location: formData.location.trim(),
        description: formData.description.trim(),
        contributors: formData.contributors,
        publishedDate: formData.publishedDate?.toISOString(),
        dueDate: formData.dueDate?.toISOString(),
        startTime: formData.startTime?.toISOString(),
        endTime: formData.endTime?.toISOString()
      };

      await api.put(`/programs/${selectedProgram._id}`, payload);
      
      setSuccess('Program updated successfully');
      setOpenEditDialog(false);
      fetchPrograms();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to update program');
    }
  };

  const handleSelectItems = async () => {
    if (!selectedProgram) return;

    try {
      const payload = {
        selectedItems: selectionData.selectedItems
      };

      await api.post(`/programs/${selectedProgram._id}/select-items`, payload);
      
      setSuccess('Program items selected successfully');
      setOpenSelectDialog(false);
      fetchPrograms();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to select items');
    }
  };

  const handleDeleteProgram = async () => {
    if (!selectedProgram) return;

    try {
      await api.delete(`/programs/${selectedProgram._id}`);
      setSuccess('Program deleted successfully');
      setOpenDeleteDialog(false);
      setSelectedProgram(null);
      fetchPrograms();
    } catch (error: any) {
      setError('Failed to delete program');
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

  const handleFormChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSelectionChange = (itemId: string, checked: boolean) => {
    setSelectionData(prev => {
      const newSelectedItems = checked
        ? [...prev.selectedItems, itemId]
        : prev.selectedItems.filter(id => id !== itemId);
      
      // Calculate total duration
      const selectedItems = prev.availableItems.filter(item => newSelectedItems.includes(item._id));
      const totalDuration = selectedItems.reduce((sum, item) => sum + item.estimatedDuration, 0);
      
      return {
        ...prev,
        selectedItems: newSelectedItems,
        totalDuration
      };
    });
  };

  const calculateDuration = () => {
    if (formData.startTime && formData.endTime) {
      return differenceInMinutes(formData.endTime, formData.startTime);
    }
    return 0;
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      meetingClass: '',
      location: '',
      status: '',
      createdBy: '',
      fromDate: null,
      toDate: null,
      sortBy: 'createdAt',
      sortOrder: 'desc',
      page: 1,
      limit: 10
    });
  };

  // Get selected users for Autocomplete
  const getSelectedUsers = () => {
    if (!formData.contributors || !Array.isArray(formData.contributors)) {
      return [];
    }
    
    return users.filter(user => 
      formData.contributors.some((contributorId: string) => 
        contributorId === user._id
      )
    );
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
                Program Management
              </Typography>
              <Typography variant={isMobile ? "body2" : "body1"} color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                Create, edit, and manage programs and select items
              </Typography>
            </Box>
          </motion.div>

          {/* Filter and Action Section */}
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
                    <Event /> All Programs
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
                    
                    <Button
                      variant="contained"
                      startIcon={<Add />}
                      onClick={handleOpenCreateDialog}
                      sx={{
                        background: theme === 'dark'
                          ? 'linear-gradient(135deg, #00ffff, #00b3b3)'
                          : 'linear-gradient(135deg, #007bff, #0056b3)',
                        borderRadius: 1,
                        boxShadow: theme === 'dark'
                          ? '0 2px 4px rgba(0, 255, 255, 0.2)'
                          : '0 2px 4px rgba(37, 99, 235, 0.2)',
                        '&:hover': {
                          background: theme === 'dark'
                            ? 'linear-gradient(135deg, #00b3b3, #008080)'
                            : 'linear-gradient(135deg, #0056b3, #004080)',
                          boxShadow: theme === 'dark'
                            ? '0 4px 8px rgba(0, 255, 255, 0.3)'
                            : '0 4px 8px rgba(37, 99, 235, 0.3)'
                        }
                      }}
                    >
                      Create Program
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
                    <InputLabel sx={{ color: theme === 'dark' ? '#a8b2d1' : '#666666' }}>Status</InputLabel>
                    <Select
                      value={filters.status}
                      label="Status"
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                      sx={selectStyle}
                    >
                      <MenuItem value="">All Status</MenuItem>
                      <MenuItem value="draft">Draft</MenuItem>
                      <MenuItem value="published">Published</MenuItem>
                      <MenuItem value="finalized">Finalized</MenuItem>
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
              <Card sx={{ 
                borderRadius: 2,
                boxShadow: theme === 'dark' 
                  ? '0 4px 12px rgba(0,0,0,0.3)' 
                  : '0 4px 12px rgba(0,0,0,0.08)',
                border: theme === 'dark' 
                  ? '1px solid #334155' 
                  : '1px solid #e5e7eb',
                backgroundColor: theme === 'dark' ? '#0f172a80' : 'white',
                backdropFilter: theme === 'dark' ? 'blur(10px)' : 'none'
              }}>
                <TableContainer sx={{ maxWidth: '100%', overflowX: 'auto' }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ 
                        background: theme === 'dark'
                          ? 'linear-gradient(135deg, #00ffff, #00b3b3)'
                          : 'linear-gradient(135deg, #007bff, #0056b3)'
                      }}>
                        {isMobile ? (
                          <>
                            <TableCell sx={{ 
                              color: 'white', 
                              fontWeight: 'bold',
                              fontSize: '0.875rem',
                              py: 2
                            }}>
                              Program Details
                            </TableCell>
                            <TableCell sx={{ 
                              color: 'white', 
                              fontWeight: 'bold',
                              fontSize: '0.875rem',
                              py: 2
                            }}>
                              Actions
                            </TableCell>
                          </>
                        ) : (
                          <>
                            <TableCell sx={{ 
                              color: 'white', 
                              fontWeight: 'bold',
                              fontSize: '0.875rem',
                              py: 2,
                              minWidth: '200px'
                            }}>
                              Program Details
                            </TableCell>
                            <TableCell sx={{ 
                              color: 'white', 
                              fontWeight: 'bold',
                              fontSize: '0.875rem',
                              py: 2,
                              minWidth: '150px'
                            }}>
                              Schedule
                            </TableCell>
                            <TableCell sx={{ 
                              color: 'white', 
                              fontWeight: 'bold',
                              fontSize: '0.875rem',
                              py: 2,
                              minWidth: '150px'
                            }}>
                              Items & Duration
                            </TableCell>
                            <TableCell sx={{ 
                              color: 'white', 
                              fontWeight: 'bold',
                              fontSize: '0.875rem',
                              py: 2,
                              minWidth: '150px'
                            }}>
                              Status
                            </TableCell>
                            <TableCell sx={{ 
                              color: 'white', 
                              fontWeight: 'bold',
                              fontSize: '0.875rem',
                              py: 2,
                              minWidth: '120px'
                            }}>
                              Actions
                            </TableCell>
                          </>
                        )}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {programs.map((program) => (
                        <TableRow 
                          key={program._id} 
                          hover
                          sx={{ 
                            '&:hover': {
                              backgroundColor: theme === 'dark' ? '#1e293b' : '#f8fafc'
                            }
                          }}
                        >
                          {isMobile ? (
                            <>
                              <TableCell sx={{ py: 2.5 }}>
                                <Box>
                                  <Typography variant="subtitle1" sx={{ 
                                    fontWeight: 'bold',
                                    color: theme === 'dark' ? '#ccd6f6' : '#333333',
                                    mb: 0.5
                                  }}>
                                    {program.title}
                                  </Typography>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                    <LocationOn fontSize="small" sx={{ color: theme === 'dark' ? '#a8b2d1' : '#666666' }} />
                                    <Typography variant="body2" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                                      {program.location}
                                    </Typography>
                                  </Box>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                    <Person fontSize="small" sx={{ color: theme === 'dark' ? '#a8b2d1' : '#666666' }} />
                                    <Typography variant="caption" color={theme === 'dark' ? '#94a3b8' : '#999999'}>
                                      By: {getUserDisplayName(program.createdBy)}
                                    </Typography>
                                  </Box>
                                  <Box sx={{ mb: 1 }}>
                                    <Typography variant="body2" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                                      {program.programItems.length} item(s)
                                    </Typography>
                                  </Box>
                                  <Chip
                                    label={getStatusText(program.status)}
                                    size="small"
                                    icon={getStatusIcon(program.status)}
                                    color={getStatusColor(program.status)}
                                    sx={{ height: 24, fontSize: '0.7rem', mb: 1 }}
                                  />
                                  <Typography variant="caption" color={theme === 'dark' ? '#94a3b8' : '#999999'}>
                                    Published: {formatDate(program.publishedDate)}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell sx={{ py: 2.5 }}>
                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                  <Tooltip title="View">
                                    <IconButton
                                      size="small"
                                      onClick={() => handleOpenViewDialog(program)}
                                      sx={{ 
                                        color: theme === 'dark' ? '#00ffff' : '#007bff',
                                        '&:hover': {
                                          backgroundColor: theme === 'dark' ? '#00ffff20' : '#007bff10'
                                        }
                                      }}
                                    >
                                      <Visibility fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  
                                  {canEditProgram(program) && (
                                    <Tooltip title="Edit">
                                      <IconButton
                                        size="small"
                                        onClick={() => handleOpenEditDialog(program)}
                                        sx={{ 
                                          color: theme === 'dark' ? '#00ff00' : '#28a745',
                                          '&:hover': {
                                            backgroundColor: theme === 'dark' ? '#00ff0020' : '#28a74510'
                                          }
                                        }}
                                      >
                                        <Edit fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  )}
                                  
                                  {canSelectItems(program) && (
                                    <Tooltip title="Select Items">
                                      <IconButton
                                        size="small"
                                        onClick={() => handleOpenSelectDialog(program)}
                                        sx={{ 
                                          color: theme === 'dark' ? '#ff9900' : '#ff9900',
                                          '&:hover': {
                                            backgroundColor: theme === 'dark' ? '#ff990020' : '#ff990010'
                                          }
                                        }}
                                      >
                                        <SelectAll fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  )}
                                  
                                  {canDeleteProgram(program) && (
                                    <Tooltip title="Delete">
                                      <IconButton
                                        size="small"
                                        onClick={() => handleOpenDeleteDialog(program)}
                                        sx={{ 
                                          color: theme === 'dark' ? '#ff0000' : '#dc3545',
                                          '&:hover': {
                                            backgroundColor: theme === 'dark' ? '#ff000020' : '#dc354510'
                                          }
                                        }}
                                      >
                                        <Delete fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  )}
                                </Box>
                              </TableCell>
                            </>
                          ) : (
                            <>
                              <TableCell sx={{ py: 2.5 }}>
                                <Box>
                                  <Typography variant="subtitle1" sx={{ 
                                    fontWeight: 'bold',
                                    color: theme === 'dark' ? '#ccd6f6' : '#333333',
                                    mb: 0.5
                                  }}>
                                    {program.title}
                                  </Typography>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                    <LocationOn fontSize="small" sx={{ color: theme === 'dark' ? '#a8b2d1' : '#666666' }} />
                                    <Typography variant="body2" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                                      {program.location}
                                    </Typography>
                                  </Box>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Person fontSize="small" sx={{ color: theme === 'dark' ? '#a8b2d1' : '#666666' }} />
                                    <Typography variant="caption" color={theme === 'dark' ? '#94a3b8' : '#999999'}>
                                      By: {getUserDisplayName(program.createdBy)}
                                    </Typography>
                                  </Box>
                                </Box>
                              </TableCell>
                              
                              <TableCell sx={{ py: 2.5 }}>
                                <Stack spacing={0.5}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <CalendarToday fontSize="small" sx={{ color: theme === 'dark' ? '#a8b2d1' : '#666666' }} />
                                    <Typography variant="caption" color={theme === 'dark' ? '#94a3b8' : '#999999'}>
                                      Pub: {formatDate(program.publishedDate)}
                                    </Typography>
                                  </Box>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <Schedule fontSize="small" sx={{ color: theme === 'dark' ? '#a8b2d1' : '#666666' }} />
                                    <Typography variant="caption" color={theme === 'dark' ? '#94a3b8' : '#999999'}>
                                      {formatTime(program.startTime)} - {formatTime(program.endTime)}
                                    </Typography>
                                  </Box>
                                </Stack>
                              </TableCell>
                              
                              <TableCell sx={{ py: 2.5 }}>
                                <Stack spacing={0.5}>
                                  <Typography variant="body2" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                                    {program.programItems.length} item(s)
                                  </Typography>
                                  <Typography variant="caption" color={theme === 'dark' ? '#94a3b8' : '#999999'}>
                                    Duration: {program.duration} min
                                  </Typography>
                                  {program.totalSelectedDuration > 0 && (
                                    <Typography variant="caption" color={theme === 'dark' ? '#00ffff' : '#007bff'}>
                                      Selected: {program.totalSelectedDuration} min
                                    </Typography>
                                  )}
                                </Stack>
                              </TableCell>
                              
                              <TableCell sx={{ py: 2.5 }}>
                                <Stack spacing={1}>
                                  <Chip
                                    label={getStatusText(program.status)}
                                    size="small"
                                    icon={getStatusIcon(program.status)}
                                    color={getStatusColor(program.status)}
                                    sx={{ height: 24, fontSize: '0.7rem' }}
                                  />
                                  <Typography variant="caption" color={theme === 'dark' ? '#94a3b8' : '#999999'}>
                                    Due: {formatDate(program.dueDate)}
                                  </Typography>
                                </Stack>
                              </TableCell>
                              
                              <TableCell sx={{ py: 2.5 }}>
                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                  <Tooltip title="View">
                                    <IconButton
                                      size="small"
                                      onClick={() => handleOpenViewDialog(program)}
                                      sx={{ 
                                        color: theme === 'dark' ? '#00ffff' : '#007bff',
                                        '&:hover': {
                                          backgroundColor: theme === 'dark' ? '#00ffff20' : '#007bff10'
                                        }
                                      }}
                                    >
                                      <Visibility fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  
                                  {canEditProgram(program) && (
                                    <Tooltip title="Edit">
                                      <IconButton
                                        size="small"
                                        onClick={() => handleOpenEditDialog(program)}
                                        sx={{ 
                                          color: theme === 'dark' ? '#00ff00' : '#28a745',
                                          '&:hover': {
                                            backgroundColor: theme === 'dark' ? '#00ff0020' : '#28a74510'
                                          }
                                        }}
                                      >
                                        <Edit fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  )}
                                  
                                  {canSelectItems(program) && (
                                    <Tooltip title="Select Items">
                                      <IconButton
                                        size="small"
                                        onClick={() => handleOpenSelectDialog(program)}
                                        sx={{ 
                                          color: theme === 'dark' ? '#ff9900' : '#ff9900',
                                          '&:hover': {
                                            backgroundColor: theme === 'dark' ? '#ff990020' : '#ff990010'
                                          }
                                        }}
                                      >
                                        <SelectAll fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  )}
                                  
                                  {canDeleteProgram(program) && (
                                    <Tooltip title="Delete">
                                      <IconButton
                                        size="small"
                                        onClick={() => handleOpenDeleteDialog(program)}
                                        sx={{ 
                                          color: theme === 'dark' ? '#ff0000' : '#dc3545',
                                          '&:hover': {
                                            backgroundColor: theme === 'dark' ? '#ff000020' : '#dc354510'
                                          }
                                        }}
                                      >
                                        <Delete fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  )}
                                </Box>
                              </TableCell>
                            </>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                {programs.length === 0 && !loading && (
                  <Box sx={{ 
                    textAlign: 'center', 
                    py: 8,
                    px: 2
                  }}>
                    <Event sx={{ 
                      fontSize: 64, 
                      color: theme === 'dark' ? '#334155' : '#cbd5e1',
                      mb: 2
                    }} />
                    <Typography variant="h6" color={theme === 'dark' ? '#a8b2d1' : '#666666'} sx={{ mb: 1 }}>
                      No programs found
                    </Typography>
                    <Typography variant="body2" color={theme === 'dark' ? '#94a3b8' : '#999999'}>
                      Try adjusting your filters or create a new program
                    </Typography>
                  </Box>
                )}
              </Card>

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

          {/* Create/Edit Program Dialog */}
          <Dialog 
            open={openCreateDialog || openEditDialog} 
            onClose={() => {
              setOpenCreateDialog(false);
              setOpenEditDialog(false);
            }} 
            maxWidth="md" 
            fullWidth
            fullScreen={isMobile}
            PaperProps={{
              sx: { 
                borderRadius: 2,
                backgroundColor: theme === 'dark' ? '#0f172a' : 'white',
                color: theme === 'dark' ? '#ccd6f6' : '#333333',
                maxHeight: '90vh',
                overflow: 'hidden'
              }
            }}
          >
            <DialogTitle sx={{ 
              backgroundColor: theme === 'dark' ? '#0f172a' : 'white',
              borderBottom: theme === 'dark' ? '1px solid #334155' : '1px solid #e5e7eb',
              py: 3
            }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                {openEditDialog ? 'Edit Program' : 'Create New Program'}
              </Typography>
            </DialogTitle>
            <DialogContent sx={{ p: 3, overflowY: 'auto' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Title and Location */}
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Program Title *"
                    value={formData.title}
                    onChange={(e) => handleFormChange('title', e.target.value)}
                    placeholder="Enter program title..."
                    required
                    sx={textFieldStyle}
                  />
                  
                  <TextField
                    fullWidth
                    size="small"
                    label="Location *"
                    value={formData.location}
                    onChange={(e) => handleFormChange('location', e.target.value)}
                    placeholder="Enter program location..."
                    required
                    sx={textFieldStyle}
                  />
                </Box>

                {/* Description */}
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Description *"
                  value={formData.description}
                  onChange={(e) => handleFormChange('description', e.target.value)}
                  placeholder="Enter program description..."
                  required
                  sx={textFieldStyle}
                />

                {/* Contributors - FIXED AUTOSELECT */}
                <Box>
                  <Typography variant="subtitle2" sx={{ 
                    mb: 1,
                    color: theme === 'dark' ? '#ccd6f6' : '#333333'
                  }}>
                    Contributors (Select Users)
                  </Typography>
                  
                  <Autocomplete
                    multiple
                    options={users}
                    getOptionLabel={(option) => option.name || option.email}
                    value={getSelectedUsers()}
                    onChange={(event, newValue) => {
                      handleFormChange('contributors', newValue.map(user => user._id));
                    }}
                    loading={usersLoading}
                    isOptionEqualToValue={(option, value) => option._id === value._id}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        size="small"
                        placeholder="Select contributors..."
                        sx={textFieldStyle}
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {usersLoading ? <CircularProgress color="inherit" size={20} /> : null}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip
                          label={option.name || option.email}
                          size="small"
                          {...getTagProps({ index })}
                          sx={{
                            height: 24,
                            fontSize: '0.75rem',
                            backgroundColor: theme === 'dark' ? '#00ffff20' : '#007bff20',
                            color: theme === 'dark' ? '#00ffff' : '#007bff'
                          }}
                        />
                      ))
                    }
                  />
                </Box>

                {/* Dates */}
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                  <DatePicker
                    label="Published Date *"
                    value={formData.publishedDate}
                    onChange={(newValue) => handleFormChange('publishedDate', newValue)}
                    slotProps={{
                      textField: {
                        size: 'small',
                        fullWidth: true,
                        sx: textFieldStyle
                      }
                    }}
                  />
                  
                  <DatePicker
                    label="Due Date *"
                    value={formData.dueDate}
                    onChange={(newValue) => handleFormChange('dueDate', newValue)}
                    minDate={formData.publishedDate || undefined}
                    slotProps={{
                      textField: {
                        size: 'small',
                        fullWidth: true,
                        sx: textFieldStyle
                      }
                    }}
                  />
                </Box>

                {/* Times and Duration */}
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                  <TimePicker
                    label="Start Time *"
                    value={formData.startTime}
                    onChange={(newValue) => handleFormChange('startTime', newValue)}
                    slotProps={{
                      textField: {
                        size: 'small',
                        fullWidth: true,
                        sx: textFieldStyle
                      }
                    }}
                  />
                  
                  <TimePicker
                    label="End Time *"
                    value={formData.endTime}
                    onChange={(newValue) => handleFormChange('endTime', newValue)}
                    minTime={formData.startTime || undefined}
                    slotProps={{
                      textField: {
                        size: 'small',
                        fullWidth: true,
                        sx: textFieldStyle
                      }
                    }}
                  />
                </Box>

                {/* Duration Display */}
                {formData.startTime && formData.endTime && (
                  <Box sx={{ 
                    p: 2, 
                    borderRadius: 1,
                    backgroundColor: theme === 'dark' ? '#1e293b' : '#f8f9fa',
                    border: theme === 'dark' ? '1px solid #334155' : '1px solid #e5e7eb'
                  }}>
                    <Typography variant="body2" sx={{ 
                      color: theme === 'dark' ? '#00ffff' : '#007bff',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}>
                      <AccessTime /> Program Duration: {calculateDuration()} minutes
                    </Typography>
                  </Box>
                )}
              </Box>
            </DialogContent>
            <DialogActions sx={{ 
              p: 3,
              borderTop: theme === 'dark' ? '1px solid #334155' : '1px solid #e5e7eb',
              backgroundColor: theme === 'dark' ? '#0f172a' : 'white'
            }}>
              <Button 
                onClick={() => {
                  setOpenCreateDialog(false);
                  setOpenEditDialog(false);
                }}
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
                onClick={openEditDialog ? handleUpdateProgram : handleCreateProgram}
                variant="contained"
                disabled={!formData.title || !formData.location || !formData.description || 
                         !formData.publishedDate || !formData.dueDate || 
                         !formData.startTime || !formData.endTime}
                sx={{
                  background: theme === 'dark'
                    ? 'linear-gradient(135deg, #00ffff, #00b3b3)'
                    : 'linear-gradient(135deg, #007bff, #0056b3)',
                  borderRadius: 1,
                  '&:hover': {
                    background: theme === 'dark'
                      ? 'linear-gradient(135deg, #00b3b3, #008080)'
                      : 'linear-gradient(135deg, #0056b3, #004080)'
                  },
                  '&.Mui-disabled': {
                    background: theme === 'dark' ? '#334155' : '#e5e7eb',
                    color: theme === 'dark' ? '#94a3b8' : '#94a3b8'
                  }
                }}
              >
                {openEditDialog ? 'Update Program' : 'Create Program'}
              </Button>
            </DialogActions>
          </Dialog>

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
                    <Chip
                      label={getStatusText(selectedProgram.status)}
                      color={getStatusColor(selectedProgram.status)}
                      icon={getStatusIcon(selectedProgram.status)}
                    />
                  </Box>
                </DialogTitle>
                <DialogContent sx={{ p: 3, overflowY: 'auto' }}>
                  {/* Program Details */}
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
                            {getUserDisplayName(selectedProgram.createdBy)}
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
                              label={getUserDisplayName(contributor)}
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
                      {selectedProgram.programItems.map((item, index) => {
                        // Get author name - check if studentId is populated
                        let authorName = getUserDisplayName(item.author);
                        if (item.author?.studentId && typeof item.author.studentId !== 'string') {
                          // If student data is populated, use student name
                          authorName = getStudentFullName(item.author.studentId);
                        }
                        
                        return (
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
                                  Author: {authorName}
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
                        );
                      })}
                    </Stack>
                  )}

                  {/* Selected Items Summary */}
                  {selectedProgram.selectedItems.length > 0 && (
                    <Card sx={{ 
                      mt: 4,
                      backgroundColor: theme === 'dark' ? '#1e293b' : '#f8f9fa',
                      border: theme === 'dark' ? '1px solid #334155' : '1px solid #e5e7eb'
                    }}>
                      <CardContent>
                        <Typography variant="subtitle1" sx={{ 
                          mb: 2,
                          color: theme === 'dark' ? '#ccd6f6' : '#333333',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1
                        }}>
                          <DoneAll /> Selected Items Summary
                        </Typography>
                        
                        <Box sx={{ 
                          display: 'flex', 
                          flexDirection: { xs: 'column', sm: 'row' },
                          justifyContent: 'space-between',
                          alignItems: { xs: 'flex-start', sm: 'center' },
                          gap: 2
                        }}>
                          <Box>
                            <Typography variant="body2" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                              Total Selected Items: {selectedProgram.selectedItems.length}
                            </Typography>
                            <Typography variant="body2" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                              Total Duration: {selectedProgram.totalSelectedDuration} minutes
                            </Typography>
                          </Box>
                          
                          <Box>
                            <Typography variant="body2" color={theme === 'dark' ? '#00ffff' : '#007bff'}>
                              Program Duration: {selectedProgram.duration} minutes
                            </Typography>
                            <Typography variant="body2" color={theme === 'dark' ? '#00ff00' : '#28a745'}>
                              Remaining Time: {selectedProgram.duration - selectedProgram.totalSelectedDuration} minutes
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
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
                </DialogActions>
              </>
            )}
          </Dialog>

          {/* Select Items Dialog */}
          <Dialog 
            open={openSelectDialog} 
            onClose={() => setOpenSelectDialog(false)}
            maxWidth="md" 
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
                    Select Program Items
                  </Typography>
                  <Typography variant="body2" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                    {selectedProgram.title} - {selectedProgram.location}
                  </Typography>
                </DialogTitle>
                <DialogContent sx={{ p: 3 }}>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body1" color={theme === 'dark' ? '#ccd6f6' : '#333333'} sx={{ mb: 1 }}>
                      Select approved items for the final program. Total selected duration cannot exceed program duration.
                    </Typography>
                    
                    {/* Duration Summary */}
                    <Box sx={{ 
                      p: 2, 
                      borderRadius: 1,
                      backgroundColor: theme === 'dark' ? '#1e293b' : '#f8f9fa',
                      border: theme === 'dark' ? '1px solid #334155' : '1px solid #e5e7eb',
                      mb: 2
                    }}>
                      <Box sx={{ 
                        display: 'flex', 
                        flexDirection: { xs: 'column', sm: 'row' },
                        justifyContent: 'space-between',
                        alignItems: { xs: 'flex-start', sm: 'center' },
                        gap: 1
                      }}>
                        <Typography variant="body2" sx={{ 
                          color: selectionData.totalDuration > selectedProgram.duration ? 
                            (theme === 'dark' ? '#ff0000' : '#dc3545') : 
                            (theme === 'dark' ? '#00ff00' : '#28a745')
                        }}>
                          Selected Duration: {selectionData.totalDuration} minutes
                        </Typography>
                        <Typography variant="body2" sx={{ color: theme === 'dark' ? '#00ffff' : '#007bff' }}>
                          Program Duration: {selectedProgram.duration} minutes
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          color: selectionData.totalDuration > selectedProgram.duration ? 
                            (theme === 'dark' ? '#ff0000' : '#dc3545') : 
                            (theme === 'dark' ? '#00ffff' : '#007bff')
                        }}>
                          Remaining: {selectedProgram.duration - selectionData.totalDuration} minutes
                        </Typography>
                      </Box>
                      
                      {selectionData.totalDuration > selectedProgram.duration && (
                        <Typography variant="caption" sx={{ 
                          color: theme === 'dark' ? '#ff0000' : '#dc3545',
                          display: 'block',
                          mt: 1
                        }}>
                          ⚠️ Total selected duration exceeds program duration. Please remove some items.
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  {/* Available Items */}
                  {selectionData.availableItems.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Description sx={{ 
                        fontSize: 48, 
                        color: theme === 'dark' ? '#334155' : '#cbd5e1',
                        mb: 2
                      }} />
                      <Typography variant="body2" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                        No approved items available for selection
                      </Typography>
                    </Box>
                  ) : (
                    <Stack spacing={2}>
                      {selectionData.availableItems.map((item) => (
                        <Paper 
                          key={item._id}
                          sx={{ 
                            p: 2, 
                            backgroundColor: theme === 'dark' ? '#1e293b' : 'white',
                            border: theme === 'dark' ? '1px solid #334155' : '1px solid #e5e7eb',
                            borderLeft: `4px solid ${theme === 'dark' ? '#00ffff' : '#007bff'}`
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={selectionData.selectedItems.includes(item._id)}
                                  onChange={(e) => handleSelectionChange(item._id, e.target.checked)}
                                  sx={{
                                    color: theme === 'dark' ? '#00ffff' : '#007bff',
                                    '&.Mui-checked': {
                                      color: theme === 'dark' ? '#00ffff' : '#007bff',
                                    }
                                  }}
                                />
                              }
                              label=""
                              sx={{ m: 0 }}
                            />
                            
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="subtitle2" sx={{ 
                                color: theme === 'dark' ? '#ccd6f6' : '#333333',
                                fontWeight: 'bold',
                                mb: 0.5
                              }}>
                                {item.title}
                              </Typography>
                              
                              <Typography variant="body2" color={theme === 'dark' ? '#a8b2d1' : '#666666'} sx={{ mb: 1 }}>
                                {item.description}
                              </Typography>
                              
                              <Box sx={{ 
                                display: 'flex', 
                                flexDirection: { xs: 'column', sm: 'row' },
                                justifyContent: 'space-between',
                                alignItems: { xs: 'flex-start', sm: 'center' },
                                gap: 1
                              }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                  <Typography variant="caption" color={theme === 'dark' ? '#94a3b8' : '#999999'}>
                                    Author: {item.author?.name || 'N/A'}
                                  </Typography>
                                  <Typography variant="caption" color={theme === 'dark' ? '#94a3b8' : '#999999'}>
                                    Class: {item.meetingClass}
                                  </Typography>
                                </Box>
                                
                                <Chip
                                  label={`${item.estimatedDuration} minutes`}
                                  size="small"
                                  sx={{
                                    backgroundColor: theme === 'dark' ? '#00ffff20' : '#007bff20',
                                    color: theme === 'dark' ? '#00ffff' : '#007bff'
                                  }}
                                />
                              </Box>
                            </Box>
                          </Box>
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
                    onClick={() => setOpenSelectDialog(false)}
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
                    onClick={handleSelectItems}
                    variant="contained"
                    disabled={selectionData.totalDuration > selectedProgram.duration || selectionData.selectedItems.length === 0}
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
                    Finalize Selection
                  </Button>
                </DialogActions>
              </>
            )}
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <Dialog 
            open={openDeleteDialog} 
            onClose={() => setOpenDeleteDialog(false)}
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
                    Confirm Delete
                  </Typography>
                </DialogTitle>
                <DialogContent sx={{ p: 3 }}>
                  <Typography variant="body1" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                    Are you sure you want to delete the program <strong style={{color: theme === 'dark' ? '#ff0000' : '#dc3545'}}>
                      "{selectedProgram?.title}"
                    </strong>? This action cannot be undone.
                  </Typography>
                  <Typography variant="body2" color={theme === 'dark' ? '#94a3b8' : '#999999'} sx={{ mt: 1 }}>
                    This will also delete all associated program items.
                  </Typography>
                </DialogContent>
                <DialogActions sx={{ 
                  p: 3,
                  borderTop: theme === 'dark' ? '1px solid #334155' : '1px solid #e5e7eb',
                  backgroundColor: theme === 'dark' ? '#0f172a' : 'white'
                }}>
                  <Button 
                    onClick={() => setOpenDeleteDialog(false)}
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
                    onClick={handleDeleteProgram} 
                    variant="contained"
                    color="error"
                    sx={{
                      borderRadius: 1,
                      background: theme === 'dark'
                        ? 'linear-gradient(135deg, #ff0000, #cc0000)'
                        : 'linear-gradient(135deg, #dc3545, #c82333)',
                      '&:hover': {
                        background: theme === 'dark'
                          ? 'linear-gradient(135deg, #cc0000, #990000)'
                          : 'linear-gradient(135deg, #c82333, #bd2130)'
                      }
                    }}
                  >
                    Delete Program
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

export default ProgramManagementPage;