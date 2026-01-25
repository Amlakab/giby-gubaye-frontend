// app/add-program/page.tsx
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
  DialogActions, Button,
  Autocomplete, Stack, Tooltip,
  Accordion, AccordionSummary, AccordionDetails,
  Paper, Collapse, Divider
} from '@mui/material';
import { motion } from 'framer-motion';
import { useTheme } from '@/lib/theme-context';
import {
  Event, Edit, Delete, Visibility,
  CalendarToday, Person, LocationOn,
  ExpandMore, Add, AddCircle,
  Search, Refresh, CheckCircle,
  HourglassEmpty, AssignmentTurnedIn,
  Save, Close, ArrowForward,
  Check, Clear, KeyboardArrowDown,
  KeyboardArrowUp, PersonOutline,
  AccessTime, Description, Schedule,
  PublishedWithChanges, DoneAll,
  Timer
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

interface UserItem {
  _id: string;
  name: string;
  email: string;
  role: string;
}

const AddProgramItemsPage = () => {
  const { theme } = useTheme();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { user } = useAuth();
  
  const [programs, setPrograms] = useState<Program[]>([]);
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
    sortBy: 'dueDate',
    sortOrder: 'asc',
    page: 1,
    limit: 10
  });

  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openAddItemDialog, setOpenAddItemDialog] = useState(false);
  const [openEditItemDialog, setOpenEditItemDialog] = useState(false);
  const [openDeleteItemDialog, setOpenDeleteItemDialog] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [selectedItem, setSelectedItem] = useState<ProgramItem | null>(null);
  
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    estimatedDuration: string;
    author: string;
    meetingClass: string;
  }>({
    title: '',
    description: '',
    estimatedDuration: '',
    author: '',
    meetingClass: ''
  });

  const [users, setUsers] = useState<UserItem[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
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

  // Fetch programs for item addition (before due date)
  const fetchPrograms = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== '' && value !== null) {
          params.append(key, value.toString());
        }
      });

      const response = await api.get(`/programs/for-item-addition?${params}`);
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

  // Fetch users for author selection
  const fetchUsers = useCallback(async () => {
    try {
      setUsersLoading(true);
      const response = await api.get('/users');
      setUsers(response.data.data || []);
    } catch (error: any) {
      console.error('Failed to fetch users:', error);
      setUsers([]);
    } finally {
      setUsersLoading(false);
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

  const canAddItems = (program: Program) => {
    const now = new Date();
    const dueDate = new Date(program.dueDate);
    return isBefore(now, dueDate);
  };

  const canEditItem = (item: ProgramItem) => {
    return item.status === 'pending' && item.author._id === user?._id;
  };

  const canDeleteItem = (item: ProgramItem) => {
    const userRole = user?.role;
    return item.status === 'pending' && 
           (item.author._id === user?._id || userRole === 'admin' );
  };

  // Filter program items by class - show only items matching user's class
  const filterItemsByClass = (items: ProgramItem[], userClass: string) => {
    return items.filter(item => item.meetingClass === userClass);
  };

  useEffect(() => {
    if (user) {
      fetchPrograms();
      fetchUsers();
    }
  }, [fetchPrograms, fetchUsers, user]);

  // Dialog handlers
  const handleOpenViewDialog = (program: Program) => {
    setSelectedProgram(program);
    setOpenViewDialog(true);
  };

  const handleOpenAddItemDialog = (program: Program) => {
    if (!canAddItems(program)) {
      setError('Cannot add items after due date');
      return;
    }
    
    setSelectedProgram(program);
    setFormData({
      title: '',
      description: '',
      estimatedDuration: '',
      author: user?._id || '',
      meetingClass: user?.role || ''
    });
    setOpenAddItemDialog(true);
  };

  const handleOpenEditItemDialog = (program: Program, item: ProgramItem) => {
    if (!canEditItem(item)) {
      setError('Cannot edit this item');
      return;
    }
    
    setSelectedProgram(program);
    setSelectedItem(item);
    setFormData({
      title: item.title,
      description: item.description,
      estimatedDuration: item.estimatedDuration.toString(),
      author: item.author._id,
      meetingClass: item.meetingClass
    });
    setOpenEditItemDialog(true);
  };

  const handleOpenDeleteItemDialog = (program: Program, item: ProgramItem) => {
    if (!canDeleteItem(item)) {
      setError('Cannot delete this item');
      return;
    }
    
    setSelectedProgram(program);
    setSelectedItem(item);
    setOpenDeleteItemDialog(true);
  };

  // Action handlers
  const handleAddProgramItem = async () => {
    if (!selectedProgram) return;

    try {
      if (!formData.title.trim() || !formData.description.trim() || !formData.estimatedDuration.trim()) {
        setError('All fields are required');
        return;
      }

      const estimatedDuration = parseInt(formData.estimatedDuration);
      if (isNaN(estimatedDuration) || estimatedDuration < 1 || estimatedDuration > 480) {
        setError('Estimated duration must be between 1 and 480 minutes');
        return;
      }

      if (!formData.author) {
        setError('Author is required');
        return;
      }

      if (!formData.meetingClass.trim()) {
        setError('Class is required');
        return;
      }

      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        estimatedDuration: estimatedDuration,
        author: formData.author,
        meetingClass: formData.meetingClass.trim()
      };

      await api.post(`/programs/${selectedProgram._id}/items`, payload);
      
      setSuccess('Program item added successfully');
      setOpenAddItemDialog(false);
      fetchPrograms();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to add program item');
    }
  };

  const handleEditProgramItem = async () => {
    if (!selectedProgram || !selectedItem) return;

    try {
      if (!formData.title.trim() || !formData.description.trim() || !formData.estimatedDuration.trim()) {
        setError('All fields are required');
        return;
      }

      const estimatedDuration = parseInt(formData.estimatedDuration);
      if (isNaN(estimatedDuration) || estimatedDuration < 1 || estimatedDuration > 480) {
        setError('Estimated duration must be between 1 and 480 minutes');
        return;
      }

      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        estimatedDuration: estimatedDuration
      };

      await api.put(`/programs/${selectedProgram._id}/items/${selectedItem._id}`, payload);
      
      setSuccess('Program item updated successfully');
      setOpenEditItemDialog(false);
      fetchPrograms();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to update program item');
    }
  };

  const handleDeleteProgramItem = async () => {
    if (!selectedProgram || !selectedItem) return;

    try {
      await api.delete(`/programs/${selectedProgram._id}/items/${selectedItem._id}`);
      
      setSuccess('Program item deleted successfully');
      setOpenDeleteItemDialog(false);
      fetchPrograms();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to delete program item');
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

  const resetFilters = () => {
    setFilters({
      search: '',
      sortBy: 'dueDate',
      sortOrder: 'asc',
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
                Add Program Items
              </Typography>
              <Typography variant={isMobile ? "body2" : "body1"} color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                Browse programs and add items before the due date
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                <Chip 
                  label={`Class: ${user?.role || 'N/A'}`} 
                  sx={{ 
                    backgroundColor: theme === 'dark' ? '#00ffff20' : '#007bff20',
                    color: theme === 'dark' ? '#00ffff' : '#007bff',
                    fontWeight: 'medium',
                    fontSize: '0.75rem'
                  }}
                  icon={<Event sx={{ fontSize: 16 }} />}
                />
                <Chip 
                  label="Viewing only your class items" 
                  sx={{ 
                    backgroundColor: theme === 'dark' ? '#ff990020' : '#ff990020',
                    color: theme === 'dark' ? '#ff9900' : '#ff9900',
                    fontWeight: 'medium',
                    fontSize: '0.75rem'
                  }}
                  icon={<Visibility sx={{ fontSize: 16 }} />}
                />
              </Box>
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
                    <AddCircle /> Programs Open for Item Addition
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
                
                {/* Filter Controls - Only Search */}
                <TextField
                  fullWidth
                  size="small"
                  label="Search Programs"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="Search by program title, location, or description..."
                  InputProps={{
                    startAdornment: (
                      <Search sx={{ 
                        color: theme === 'dark' ? '#a8b2d1' : '#666666',
                        mr: 1 
                      }} />
                    ),
                  }}
                  sx={textFieldStyle}
                />
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
                  <AddCircle sx={{ 
                    fontSize: 64, 
                    color: theme === 'dark' ? '#334155' : '#cbd5e1',
                    mb: 2
                  }} />
                  <Typography variant="h6" color={theme === 'dark' ? '#a8b2d1' : '#666666'} sx={{ mb: 1 }}>
                    No programs available for item addition
                  </Typography>
                  <Typography variant="body2" color={theme === 'dark' ? '#94a3b8' : '#999999'}>
                    All programs have passed their due dates or there are no programs yet
                  </Typography>
                </Card>
              ) : (
                <Stack spacing={3}>
                  {programs.map((program) => {
                    // Filter items to show only those from user's class
                    const classItems = filterItemsByClass(program.programItems, user.role);
                    const hasClassItems = classItems.length > 0;
                    
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
                                
                                <Chip
                                  label={getStatusText(program.status)}
                                  size="small"
                                  icon={getStatusIcon(program.status)}
                                  color={getStatusColor(program.status)}
                                  sx={{ height: 24, fontSize: '0.7rem' }}
                                />
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
                              
                              {canAddItems(program) && (
                                <Tooltip title="Add Program Item">
                                  <Button
                                    size="small"
                                    variant="contained"
                                    startIcon={<Add />}
                                    onClick={() => handleOpenAddItemDialog(program)}
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
                                    Add Item
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
                                  Your Class Items: {classItems.length}
                                </Typography>
                              </Stack>
                            </Box>
                          </Box>

                          {/* Program Description */}
                          <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle2" sx={{ 
                              color: theme === 'dark' ? '#a8b2d1' : '#666666',
                              mb: 1
                            }}>
                              Description
                            </Typography>
                            <Typography variant="body2" sx={{ 
                              color: theme === 'dark' ? '#ccd6f6' : '#333333',
                              whiteSpace: 'pre-wrap'
                            }}>
                              {program.description}
                            </Typography>
                          </Box>

                          {/* Program Items for User's Class */}
                          <Accordion 
                            expanded={expandedRows[`${program._id}-items`]}
                            onChange={() => toggleRowExpansion(program._id, 'items')}
                            sx={{
                              backgroundColor: theme === 'dark' ? '#1e293b' : 'white',
                              border: theme === 'dark' ? '1px solid #334155' : '1px solid #e5e7eb',
                              '&:before': { display: 'none' }
                            }}
                          >
                            <AccordionSummary expandIcon={<ExpandMore />}>
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                <Typography sx={{ fontWeight: 'medium', color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                                  Items for Your Class ({user.role})
                                </Typography>
                                <Chip
                                  label={`${classItems.length} items`}
                                  size="small"
                                  sx={{
                                    backgroundColor: theme === 'dark' ? '#00ffff20' : '#007bff20',
                                    color: theme === 'dark' ? '#00ffff' : '#007bff',
                                    fontSize: '0.7rem'
                                  }}
                                />
                              </Box>
                            </AccordionSummary>
                            <AccordionDetails>
                              {!hasClassItems ? (
                                <Typography variant="body2" color={theme === 'dark' ? '#a8b2d1' : '#666666'} sx={{ textAlign: 'center', py: 3 }}>
                                  No items from your class ({user.role}) yet.
                                </Typography>
                              ) : (
                                <Stack spacing={2}>
                                  {classItems.map((item) => (
                                    <Paper 
                                      key={item._id}
                                      sx={{ 
                                        p: 2, 
                                        backgroundColor: theme === 'dark' ? '#0f172a' : '#f8f9fa',
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
                                        <Box>
                                          <Typography variant="subtitle2" sx={{ 
                                            color: theme === 'dark' ? '#ccd6f6' : '#333333',
                                            fontWeight: 'bold'
                                          }}>
                                            {item.title}
                                          </Typography>
                                          <Chip
                                            label={item.status}
                                            size="small"
                                            color={getItemStatusColor(item.status)}
                                            sx={{ height: 20, fontSize: '0.6rem', mt: 0.5 }}
                                          />
                                        </Box>
                                        
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                          {canEditItem(item) && (
                                            <Tooltip title="Edit Item">
                                              <IconButton
                                                size="small"
                                                onClick={() => handleOpenEditItemDialog(program, item)}
                                                sx={{ 
                                                  color: theme === 'dark' ? '#00ffff' : '#007bff',
                                                  '&:hover': {
                                                    backgroundColor: theme === 'dark' ? '#00ffff20' : '#007bff10'
                                                  }
                                                }}
                                              >
                                                <Edit fontSize="small" />
                                              </IconButton>
                                            </Tooltip>
                                          )}
                                          
                                          {canDeleteItem(item) && (
                                            <Tooltip title="Delete Item">
                                              <IconButton
                                                size="small"
                                                onClick={() => handleOpenDeleteItemDialog(program, item)}
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
                                      </Box>
                                      
                                      <Typography variant="body2" color={theme === 'dark' ? '#a8b2d1' : '#666666'} sx={{ mb: 2 }}>
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
                                        
                                        <Typography variant="caption" color={theme === 'dark' ? '#94a3b8' : '#999999'}>
                                          Added: {formatDate(item.createdAt)}
                                        </Typography>
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
                            </AccordionDetails>
                          </Accordion>
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

          {/* Add Item Dialog */}
          <Dialog 
            open={openAddItemDialog} 
            onClose={() => setOpenAddItemDialog(false)} 
            maxWidth="sm" 
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
                    Add Program Item
                  </Typography>
                  <Typography variant="body2" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                    {selectedProgram.title} - {selectedProgram.location}
                  </Typography>
                </DialogTitle>
                <DialogContent sx={{ p: 3 }}>
                  <Stack spacing={3}>
                    {/* Program Info */}
                    <Box sx={{ 
                      p: 2, 
                      borderRadius: 1,
                      backgroundColor: theme === 'dark' ? '#1e293b' : '#f8f9fa',
                      border: theme === 'dark' ? '1px solid #334155' : '1px solid #e5e7eb'
                    }}>
                      <Typography variant="body2" sx={{ color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                        Adding item to: <strong>{selectedProgram.title}</strong>
                      </Typography>
                      <Typography variant="caption" sx={{ color: theme === 'dark' ? '#a8b2d1' : '#666666', display: 'block', mt: 0.5 }}>
                        Due Date: {formatDate(selectedProgram.dueDate)} • Duration: {selectedProgram.duration} minutes
                      </Typography>
                      <Typography variant="caption" sx={{ color: theme === 'dark' ? '#a8b2d1' : '#666666', display: 'block' }}>
                        Status will be set to: <strong>Pending</strong> (awaiting approval)
                      </Typography>
                    </Box>

                    {/* Title */}
                    <TextField
                      fullWidth
                      size="small"
                      label="Item Title *"
                      value={formData.title}
                      onChange={(e) => handleFormChange('title', e.target.value)}
                      placeholder="Enter item title..."
                      required
                      sx={textFieldStyle}
                    />

                    {/* Description */}
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      label="Description *"
                      value={formData.description}
                      onChange={(e) => handleFormChange('description', e.target.value)}
                      placeholder="Enter item description..."
                      required
                      sx={textFieldStyle}
                    />

                    {/* Author Selection */}
                    <Box>
                      <Typography variant="subtitle2" sx={{ 
                        mb: 1,
                        color: theme === 'dark' ? '#ccd6f6' : '#333333'
                      }}>
                        Author *
                      </Typography>
                      <Autocomplete
                        options={users}
                        getOptionLabel={(option) => option.name ? `${option.name} (${option.email})` : option.email}
                        value={users.find(u => u._id === formData.author) || null}
                        onChange={(event, newValue) => {
                          handleFormChange('author', newValue?._id || '');
                        }}
                        loading={usersLoading}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            size="small"
                            placeholder="Select author..."
                            sx={textFieldStyle}
                          />
                        )}
                      />
                    </Box>

                    {/* Class Selection */}
                    <TextField
                      fullWidth
                      size="small"
                      label="Class *"
                      value={formData.meetingClass}
                      onChange={(e) => handleFormChange('meetingClass', e.target.value)}
                      placeholder="Enter class name..."
                      required
                      sx={textFieldStyle}
                    />

                    {/* Estimated Duration */}
                    <TextField
                      fullWidth
                      size="small"
                      label="Estimated Duration (minutes) *"
                      value={formData.estimatedDuration}
                      onChange={(e) => handleFormChange('estimatedDuration', e.target.value)}
                      placeholder="Enter duration in minutes (1-480)"
                      type="number"
                      inputProps={{ min: 1, max: 480 }}
                      required
                      sx={textFieldStyle}
                      InputProps={{
                        endAdornment: (
                          <Typography variant="caption" sx={{ color: theme === 'dark' ? '#a8b2d1' : '#666666' }}>
                            minutes
                          </Typography>
                        ),
                      }}
                    />

                    {/* Program Duration Reminder */}
                    <Box sx={{ 
                      p: 2, 
                      borderRadius: 1,
                      backgroundColor: theme === 'dark' ? '#1e293b' : '#f8f9fa',
                      border: theme === 'dark' ? '1px solid #334155' : '1px solid #e5e7eb'
                    }}>
                      <Typography variant="caption" sx={{ color: theme === 'dark' ? '#a8b2d1' : '#666666', display: 'block' }}>
                        <strong>Note:</strong> Total selected items duration cannot exceed program duration of {selectedProgram.duration} minutes.
                      </Typography>
                      <Typography variant="caption" sx={{ color: theme === 'dark' ? '#94a3b8' : '#999999', display: 'block', mt: 0.5 }}>
                        Current total selected duration: {selectedProgram.totalSelectedDuration} minutes
                      </Typography>
                    </Box>
                  </Stack>
                </DialogContent>
                <DialogActions sx={{ 
                  p: 3,
                  borderTop: theme === 'dark' ? '1px solid #334155' : '1px solid #e5e7eb',
                  backgroundColor: theme === 'dark' ? '#0f172a' : 'white'
                }}>
                  <Button 
                    onClick={() => setOpenAddItemDialog(false)}
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
                    onClick={handleAddProgramItem}
                    variant="contained"
                    disabled={!formData.title || !formData.description || !formData.estimatedDuration || !formData.author || !formData.meetingClass}
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
                    Add Item
                  </Button>
                </DialogActions>
              </>
            )}
          </Dialog>

          {/* Edit Item Dialog */}
          <Dialog 
            open={openEditItemDialog} 
            onClose={() => setOpenEditItemDialog(false)} 
            maxWidth="sm" 
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
            {selectedProgram && selectedItem && (
              <>
                <DialogTitle sx={{ 
                  backgroundColor: theme === 'dark' ? '#0f172a' : 'white',
                  borderBottom: theme === 'dark' ? '1px solid #334155' : '1px solid #e5e7eb',
                  py: 3
                }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                    Edit Program Item
                  </Typography>
                  <Typography variant="body2" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                    {selectedProgram.title} - {selectedProgram.location}
                  </Typography>
                </DialogTitle>
                <DialogContent sx={{ p: 3 }}>
                  <Stack spacing={3}>
                    {/* Item Info */}
                    <Box sx={{ 
                      p: 2, 
                      borderRadius: 1,
                      backgroundColor: theme === 'dark' ? '#1e293b' : '#f8f9fa',
                      border: theme === 'dark' ? '1px solid #334155' : '1px solid #e5e7eb'
                    }}>
                      <Typography variant="body2" sx={{ color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                        Editing item in: <strong>{selectedProgram.title}</strong>
                      </Typography>
                      <Typography variant="caption" sx={{ color: theme === 'dark' ? '#a8b2d1' : '#666666', display: 'block', mt: 0.5 }}>
                        Author: {selectedItem.author?.name || 'N/A'} • Class: {selectedItem.meetingClass}
                      </Typography>
                      <Typography variant="caption" sx={{ color: theme === 'dark' ? '#a8b2d1' : '#666666', display: 'block' }}>
                        Status: <strong>{selectedItem.status}</strong> • Created: {formatDate(selectedItem.createdAt)}
                      </Typography>
                    </Box>

                    {/* Title */}
                    <TextField
                      fullWidth
                      size="small"
                      label="Item Title *"
                      value={formData.title}
                      onChange={(e) => handleFormChange('title', e.target.value)}
                      placeholder="Enter item title..."
                      required
                      sx={textFieldStyle}
                    />

                    {/* Description */}
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      label="Description *"
                      value={formData.description}
                      onChange={(e) => handleFormChange('description', e.target.value)}
                      placeholder="Enter item description..."
                      required
                      sx={textFieldStyle}
                    />

                    {/* Estimated Duration */}
                    <TextField
                      fullWidth
                      size="small"
                      label="Estimated Duration (minutes) *"
                      value={formData.estimatedDuration}
                      onChange={(e) => handleFormChange('estimatedDuration', e.target.value)}
                      placeholder="Enter duration in minutes (1-480)"
                      type="number"
                      inputProps={{ min: 1, max: 480 }}
                      required
                      sx={textFieldStyle}
                      InputProps={{
                        endAdornment: (
                          <Typography variant="caption" sx={{ color: theme === 'dark' ? '#a8b2d1' : '#666666' }}>
                            minutes
                          </Typography>
                        ),
                      }}
                    />

                    {/* Note */}
                    <Box sx={{ 
                      p: 2, 
                      borderRadius: 1,
                      backgroundColor: theme === 'dark' ? '#1e293b' : '#f8f9fa',
                      border: theme === 'dark' ? '1px solid #334155' : '1px solid #e5e7eb'
                    }}>
                      <Typography variant="caption" sx={{ color: theme === 'dark' ? '#a8b2d1' : '#666666', display: 'block' }}>
                        <strong>Note:</strong> Only pending items can be edited. Author and class cannot be changed.
                      </Typography>
                    </Box>
                  </Stack>
                </DialogContent>
                <DialogActions sx={{ 
                  p: 3,
                  borderTop: theme === 'dark' ? '1px solid #334155' : '1px solid #e5e7eb',
                  backgroundColor: theme === 'dark' ? '#0f172a' : 'white'
                }}>
                  <Button 
                    onClick={() => setOpenEditItemDialog(false)}
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
                    onClick={handleEditProgramItem}
                    variant="contained"
                    disabled={!formData.title || !formData.description || !formData.estimatedDuration}
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
                    Update Item
                  </Button>
                </DialogActions>
              </>
            )}
          </Dialog>

          {/* Delete Item Dialog */}
          <Dialog 
            open={openDeleteItemDialog} 
            onClose={() => setOpenDeleteItemDialog(false)}
            PaperProps={{
              sx: { 
                borderRadius: 2,
                backgroundColor: theme === 'dark' ? '#0f172a' : 'white',
                color: theme === 'dark' ? '#ccd6f6' : '#333333'
              }
            }}
          >
            {selectedItem && (
              <>
                <DialogTitle sx={{ 
                  backgroundColor: theme === 'dark' ? '#0f172a' : 'white',
                  borderBottom: theme === 'dark' ? '1px solid #334155' : '1px solid #e5e7eb',
                  py: 3
                }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                    Delete Program Item
                  </Typography>
                </DialogTitle>
                <DialogContent sx={{ p: 3 }}>
                  <Typography variant="body1" color={theme === 'dark' ? '#a8b2d1' : '#666666'} sx={{ mb: 2 }}>
                    Are you sure you want to delete the item <strong style={{color: theme === 'dark' ? '#ff0000' : '#dc3545'}}>
                      "{selectedItem?.title}"
                    </strong>?
                  </Typography>
                  <Typography variant="body2" color={theme === 'dark' ? '#94a3b8' : '#999999'}>
                    This action cannot be undone. Only pending items can be deleted.
                  </Typography>
                </DialogContent>
                <DialogActions sx={{ 
                  p: 3,
                  borderTop: theme === 'dark' ? '1px solid #334155' : '1px solid #e5e7eb',
                  backgroundColor: theme === 'dark' ? '#0f172a' : 'white'
                }}>
                  <Button 
                    onClick={() => setOpenDeleteItemDialog(false)}
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
                    onClick={handleDeleteProgramItem} 
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
                    Delete Item
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

export default AddProgramItemsPage;