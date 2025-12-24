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
  DialogActions, Button, Avatar,
  Autocomplete, Stack, Tooltip,
  Accordion, AccordionSummary, AccordionDetails,
  Paper, Collapse
} from '@mui/material';
import { motion } from 'framer-motion';
import { useTheme } from '@/lib/theme-context';
import {
  Event, Edit, Delete, Visibility,
  CalendarToday, Person, LocationOn,
  ExpandMore, Add,
  Search, Refresh, CheckCircle,
  HourglassEmpty, AssignmentTurnedIn,
  Save, Close, ArrowForward,
  Check, Clear, KeyboardArrowDown,
  KeyboardArrowUp, PersonOutline
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import api from '@/app/utils/api';
import { format, parseISO, startOfDay, endOfDay } from 'date-fns';
import { useAuth } from '@/lib/auth';

interface Student {
  _id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  gender: 'male' | 'female';
  gibyGubayeId?: string;
  phone: string;
  email: string;
}

interface User {
  _id: string;
  name: string;       // Add this - matches backend User model
  email: string;
  role: string;
}

interface AgendaDiscussion {
  question: string;
  answer: string;
  summary: string;
  discussedAt: string;
}

interface AgendaTitle {
  title: string;
  discussions: AgendaDiscussion[];
}

interface Agenda {
  _id: string;
  meetingClass: string;
  location: string;
  draftContributors: Student[];
  agendaTitles: AgendaTitle[];
  generalMeetingSummary?: string;
  meetingContributors: Student[];
  status: 'draft' | 'pending' | 'approved' | 'completed';
  draftDate: string;
  meetingDate?: string;
  createdBy: User;
  approvedBy?: User;
  createdAt: string;
  updatedAt: string;
}

interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalAgendas: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface FilterOptions {
  meetingClasses: string[];
  locations: string[];
  creators: User[];
}

const AgendaApprovePage = () => {
  const { theme } = useTheme();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { user } = useAuth();
  
  const [agendas, setAgendas] = useState<Agenda[]>([]);
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
    totalAgendas: 0,
    hasNext: false,
    hasPrev: false
  });

  // Changed status from 'pending' to '' to show all agendas by default
  const [filters, setFilters] = useState({
    search: '',
    meetingClass: '',
    location: '',
    status: '', // Changed from 'pending' to empty string
    createdBy: '',
    fromDate: null as Date | null,
    toDate: null as Date | null,
    sortBy: 'draftDate',
    sortOrder: 'desc',
    page: 1,
    limit: 10
  });

  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openApproveDialog, setOpenApproveDialog] = useState(false);
  const [selectedAgenda, setSelectedAgenda] = useState<Agenda | null>(null);
  
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

  const fetchAgendas = useCallback(async () => {
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

      const response = await api.get(`/agendas?${params}`);
      setAgendas(response.data.data.agendas || []);
      setPagination(response.data.data.pagination || {
        currentPage: 1,
        totalPages: 1,
        totalAgendas: 0,
        hasNext: false,
        hasPrev: false
      });
      setError('');
    } catch (error: any) {
      console.error('Error fetching agendas:', error);
      setError(error.response?.data?.message || 'Failed to fetch agendas');
      setAgendas([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchFilterOptions = useCallback(async () => {
    try {
      const response = await api.get('/agendas/filter-options');
      setFilterOptions(response.data.data);
    } catch (error: any) {
      console.error('Failed to fetch filter options:', error);
    }
  }, []);

  const toggleRowExpansion = (agendaId: string, type: 'draft' | 'meeting') => {
    const key = `${agendaId}-${type}`;
    setExpandedRows(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

 const getUserName = (user: User | undefined) => {
  if (!user) return 'N/A';
  return user.name || 'N/A';  // User model has a single 'name' field
};

  const getStudentFullName = (student: Student) => {
    return `${student.firstName} ${student.middleName || ''} ${student.lastName}`.trim();
  };

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy HH:mm');
    } catch {
      return 'Invalid date';
    }
  };

  const getStatusColor = (status: string): 'success' | 'warning' | 'error' | 'info' | 'default' => {
    switch (status) {
      case 'completed': return 'success';
      case 'approved': return 'info';
      case 'pending': return 'warning';
      case 'draft': return 'default';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle fontSize="small" />;
      case 'approved': return <Check fontSize="small" />;
      case 'pending': return <HourglassEmpty fontSize="small" />;
      case 'draft': return <Edit fontSize="small" />;
      default: return <Event fontSize="small" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'approved': return 'Approved';
      case 'pending': return 'Pending Review';
      case 'draft': return 'Draft';
      default: return status;
    }
  };

  const renderContributors = (contributors: Student[], agendaId: string, type: 'draft' | 'meeting') => {
    const isExpanded = expandedRows[`${agendaId}-${type}`];
    
    return (
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
            {contributors.length} {type === 'draft' ? 'draft' : 'meeting'} contributor(s)
          </Typography>
          <Tooltip title={isExpanded ? "Hide contributors" : "View contributors"}>
            <IconButton 
              size="small" 
              onClick={() => toggleRowExpansion(agendaId, type)}
              sx={{ 
                p: 0.5,
                color: theme === 'dark' ? '#00ffff' : '#007bff'
              }}
            >
              <Visibility fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
        
        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
          <Box sx={{ 
            mt: 1, 
            p: 2, 
            backgroundColor: theme === 'dark' ? '#1e293b' : '#f8f9fa', 
            borderRadius: 1,
            border: theme === 'dark' ? '1px solid #334155' : '1px solid #e5e7eb'
          }}>
            <Typography variant="subtitle2" sx={{ 
              mb: 1, 
              color: theme === 'dark' ? '#ccd6f6' : '#333333',
              fontWeight: 'bold'
            }}>
              {type === 'draft' ? 'Draft Contributors' : 'Meeting Contributors'}
            </Typography>
            
            <TableContainer component={Paper} elevation={0} sx={{ 
              backgroundColor: 'transparent',
              border: theme === 'dark' ? '1px solid #334155' : '1px solid #e5e7eb'
            }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ 
                    backgroundColor: theme === 'dark' ? '#0f172a' : '#e5e7eb'
                  }}>
                    <TableCell sx={{ 
                      color: theme === 'dark' ? '#ccd6f6' : '#333333',
                      fontWeight: 'bold',
                      py: 1
                    }}>#</TableCell>
                    <TableCell sx={{ 
                      color: theme === 'dark' ? '#ccd6f6' : '#333333',
                      fontWeight: 'bold',
                      py: 1
                    }}>First Name</TableCell>
                    <TableCell sx={{ 
                      color: theme === 'dark' ? '#ccd6f6' : '#333333',
                      fontWeight: 'bold',
                      py: 1
                    }}>Middle Name</TableCell>
                    <TableCell sx={{ 
                      color: theme === 'dark' ? '#ccd6f6' : '#333333',
                      fontWeight: 'bold',
                      py: 1
                    }}>Last Name</TableCell>
                    <TableCell sx={{ 
                      color: theme === 'dark' ? '#ccd6f6' : '#333333',
                      fontWeight: 'bold',
                      py: 1
                    }}>Gender</TableCell>
                    <TableCell sx={{ 
                      color: theme === 'dark' ? '#ccd6f6' : '#333333',
                      fontWeight: 'bold',
                      py: 1
                    }}>Student ID</TableCell>
                    <TableCell sx={{ 
                      color: theme === 'dark' ? '#ccd6f6' : '#333333',
                      fontWeight: 'bold',
                      py: 1
                    }}>Phone</TableCell>
                    <TableCell sx={{ 
                      color: theme === 'dark' ? '#ccd6f6' : '#333333',
                      fontWeight: 'bold',
                      py: 1
                    }}>Email</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {contributors.map((student, index) => (
                    <TableRow 
                      key={student._id}
                      sx={{ 
                        '&:hover': {
                          backgroundColor: theme === 'dark' ? '#1e293b' : '#f5f5f5'
                        }
                      }}
                    >
                      <TableCell sx={{ 
                        color: theme === 'dark' ? '#a8b2d1' : '#666666',
                        py: 1
                      }}>{index + 1}</TableCell>
                      <TableCell sx={{ 
                        color: theme === 'dark' ? '#ccd6f6' : '#333333',
                        py: 1
                      }}>{student.firstName || 'N/A'}</TableCell>
                      <TableCell sx={{ 
                        color: theme === 'dark' ? '#ccd6f6' : '#333333',
                        py: 1
                      }}>{student.middleName || 'N/A'}</TableCell>
                      <TableCell sx={{ 
                        color: theme === 'dark' ? '#ccd6f6' : '#333333',
                        py: 1
                      }}>{student.lastName || 'N/A'}</TableCell>
                      <TableCell sx={{ 
                        color: theme === 'dark' ? '#ccd6f6' : '#333333',
                        py: 1
                      }}>{student.gender || 'N/A'}</TableCell>
                      <TableCell sx={{ 
                        color: theme === 'dark' ? '#ccd6f6' : '#333333',
                        py: 1
                      }}>{student.gibyGubayeId || 'N/A'}</TableCell>
                      <TableCell sx={{ 
                        color: theme === 'dark' ? '#ccd6f6' : '#333333',
                        py: 1
                      }}>{student.phone || 'N/A'}</TableCell>
                      <TableCell sx={{ 
                        color: theme === 'dark' ? '#ccd6f6' : '#333333',
                        py: 1
                      }}>{student.email || 'N/A'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Collapse>
      </Box>
    );
  };

  useEffect(() => {
    if (user) {
      fetchAgendas();
      fetchFilterOptions();
    }
  }, [fetchAgendas, fetchFilterOptions, user]);

  const handleOpenViewDialog = (agenda: Agenda) => {
    setSelectedAgenda(agenda);
    setOpenViewDialog(true);
  };

  const handleOpenApproveDialog = (agenda: Agenda) => {
    setSelectedAgenda(agenda);
    setOpenApproveDialog(true);
  };

  const handleApproveAgenda = async () => {
    if (!selectedAgenda) return;

    try {
      await api.patch(`/agendas/${selectedAgenda._id}/approve`);
      
      setSuccess('Agenda approved successfully');
      setOpenApproveDialog(false);
      fetchAgendas();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to approve agenda');
    }
  };

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

  // Updated to reset status to empty string
  const resetFilters = () => {
    setFilters({
      search: '',
      meetingClass: '',
      location: '',
      status: '', // Changed from 'pending' to empty string
      createdBy: '',
      fromDate: null,
      toDate: null,
      sortBy: 'draftDate',
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
                Agenda Approval Dashboard
              </Typography>
              <Typography variant={isMobile ? "body2" : "body1"} color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                Review and approve agendas across all classes
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
                  {/* Updated header text */}
                  <Typography variant="h6" sx={{ 
                    fontWeight: 'bold',
                    color: theme === 'dark' ? '#ccd6f6' : '#333333',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    <CheckCircle /> All Agendas (Approval Dashboard)
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
                    label="Search Agendas"
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    placeholder="Meeting class, location, or title..."
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
                  
                  {/* Updated Status filter with "All Statuses" option */}
                  <FormControl size="small" sx={{ flex: { xs: '1 1 100%', md: '1 1 200px' } }}>
                    <InputLabel sx={{ color: theme === 'dark' ? '#a8b2d1' : '#666666' }}>Status</InputLabel>
                    <Select
                      value={filters.status}
                      label="Status"
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                      sx={selectStyle}
                    >
                      <MenuItem value="">All Statuses</MenuItem>
                      <MenuItem value="pending">Pending</MenuItem>
                      <MenuItem value="approved">Approved</MenuItem>
                      <MenuItem value="completed">Completed</MenuItem>
                      <MenuItem value="draft">Draft</MenuItem>
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

          {/* Agendas List */}
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
                              Meeting Details
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
                              Meeting Details
                            </TableCell>
                            <TableCell sx={{ 
                              color: 'white', 
                              fontWeight: 'bold',
                              fontSize: '0.875rem',
                              py: 2,
                              minWidth: '150px'
                            }}>
                              Contributors
                            </TableCell>
                            <TableCell sx={{ 
                              color: 'white', 
                              fontWeight: 'bold',
                              fontSize: '0.875rem',
                              py: 2,
                              minWidth: '150px'
                            }}>
                              Agenda Titles
                            </TableCell>
                            <TableCell sx={{ 
                              color: 'white', 
                              fontWeight: 'bold',
                              fontSize: '0.875rem',
                              py: 2,
                              minWidth: '150px'
                            }}>
                              Status & Dates
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
                      {agendas.map((agenda) => (
                        <TableRow 
                          key={agenda._id} 
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
                                    {agenda.meetingClass}
                                  </Typography>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                    <LocationOn fontSize="small" sx={{ color: theme === 'dark' ? '#a8b2d1' : '#666666' }} />
                                    <Typography variant="body2" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                                      {agenda.location}
                                    </Typography>
                                  </Box>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                    <Person fontSize="small" sx={{ color: theme === 'dark' ? '#a8b2d1' : '#666666' }} />
                                    <Typography variant="caption" color={theme === 'dark' ? '#94a3b8' : '#999999'}>
                                      Created by: {getUserName(agenda.createdBy)}
                                    </Typography>
                                  </Box>
                                  <Box sx={{ mb: 1 }}>
                                    <Typography variant="body2" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                                      {agenda.draftContributors.length} draft contributor(s)
                                    </Typography>
                                  </Box>
                                  <Chip
                                    label={getStatusText(agenda.status)}
                                    size="small"
                                    icon={getStatusIcon(agenda.status)}
                                    color={getStatusColor(agenda.status)}
                                    sx={{ height: 24, fontSize: '0.7rem', mb: 1 }}
                                  />
                                  <Typography variant="caption" color={theme === 'dark' ? '#94a3b8' : '#999999'}>
                                    Draft: {formatDate(agenda.draftDate)}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell sx={{ py: 2.5 }}>
                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                  <Tooltip title="View">
                                    <IconButton
                                      size="small"
                                      onClick={() => handleOpenViewDialog(agenda)}
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
                                  
                                  {/* Only show approve button for pending agendas */}
                                  {agenda.status === 'pending' && (
                                    <Tooltip title="Approve">
                                      <IconButton
                                        size="small"
                                        onClick={() => handleOpenApproveDialog(agenda)}
                                        sx={{ 
                                          color: theme === 'dark' ? '#00ff00' : '#28a745',
                                          '&:hover': {
                                            backgroundColor: theme === 'dark' ? '#00ff0020' : '#28a74510'
                                          }
                                        }}
                                      >
                                        <Check fontSize="small" />
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
                                    {agenda.meetingClass}
                                  </Typography>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                    <LocationOn fontSize="small" sx={{ color: theme === 'dark' ? '#a8b2d1' : '#666666' }} />
                                    <Typography variant="body2" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                                      {agenda.location}
                                    </Typography>
                                  </Box>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Person fontSize="small" sx={{ color: theme === 'dark' ? '#a8b2d1' : '#666666' }} />
                                    <Typography variant="caption" color={theme === 'dark' ? '#94a3b8' : '#999999'}>
                                      Created by: {getUserName(agenda.createdBy)}
                                    </Typography>
                                  </Box>
                                </Box>
                              </TableCell>
                              
                              <TableCell sx={{ py: 2.5 }}>
                                <Typography variant="body2" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                                  {agenda.draftContributors.length} draft contributor(s)
                                </Typography>
                              </TableCell>
                              
                              <TableCell sx={{ py: 2.5 }}>
                                <Box>
                                  <Typography variant="body2" color={theme === 'dark' ? '#a8b2d1' : '#666666'} sx={{ mb: 0.5 }}>
                                    {agenda.agendaTitles.length} title(s)
                                  </Typography>
                                  <Typography variant="caption" color={theme === 'dark' ? '#94a3b8' : '#999999'} sx={{ 
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                  }}>
                                    {agenda.agendaTitles.map(t => t.title).join(', ')}
                                  </Typography>
                                </Box>
                              </TableCell>
                              
                              <TableCell sx={{ py: 2.5 }}>
                                <Stack spacing={1}>
                                  <Chip
                                    label={getStatusText(agenda.status)}
                                    size="small"
                                    icon={getStatusIcon(agenda.status)}
                                    color={getStatusColor(agenda.status)}
                                    sx={{ height: 24, fontSize: '0.7rem' }}
                                  />
                                  <Typography variant="caption" color={theme === 'dark' ? '#94a3b8' : '#999999'}>
                                    Draft: {formatDate(agenda.draftDate)}
                                  </Typography>
                                  {agenda.meetingDate && (
                                    <Typography variant="caption" color={theme === 'dark' ? '#94a3b8' : '#999999'}>
                                      Meeting: {formatDate(agenda.meetingDate)}
                                    </Typography>
                                  )}
                                </Stack>
                              </TableCell>
                              
                              <TableCell sx={{ py: 2.5 }}>
                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                  <Tooltip title="View">
                                    <IconButton
                                      size="small"
                                      onClick={() => handleOpenViewDialog(agenda)}
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
                                  
                                  {/* Only show approve button for pending agendas */}
                                  {agenda.status === 'pending' && (
                                    <Tooltip title="Approve">
                                      <IconButton
                                        size="small"
                                        onClick={() => handleOpenApproveDialog(agenda)}
                                        sx={{ 
                                          color: theme === 'dark' ? '#00ff00' : '#28a745',
                                          '&:hover': {
                                            backgroundColor: theme === 'dark' ? '#00ff0020' : '#28a74510'
                                          }
                                        }}
                                      >
                                        <Check fontSize="small" />
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

                {agendas.length === 0 && !loading && (
                  <Box sx={{ 
                    textAlign: 'center', 
                    py: 8,
                    px: 2
                  }}>
                    <CheckCircle sx={{ 
                      fontSize: 64, 
                      color: theme === 'dark' ? '#334155' : '#cbd5e1',
                      mb: 2
                    }} />
                    <Typography variant="h6" color={theme === 'dark' ? '#a8b2d1' : '#666666'} sx={{ mb: 1 }}>
                      No agendas found
                    </Typography>
                    <Typography variant="body2" color={theme === 'dark' ? '#94a3b8' : '#999999'}>
                      Try adjusting your filters
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
                    Showing {((filters.page - 1) * filters.limit) + 1} to {Math.min(filters.page * filters.limit, pagination.totalAgendas)} of {pagination.totalAgendas} agendas
                  </Typography>
                </Box>
              )}
            </motion.div>
          )}

          {/* View Agenda Dialog */}
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
            {selectedAgenda && (
              <>
                <DialogTitle sx={{ 
                  backgroundColor: theme === 'dark' ? '#0f172a' : 'white',
                  borderBottom: theme === 'dark' ? '1px solid #334155' : '1px solid #e5e7eb',
                  py: 3
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                        Agenda Details
                      </Typography>
                      <Typography variant="body2" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                        {selectedAgenda.meetingClass} - {selectedAgenda.location}
                      </Typography>
                    </Box>
                    <Chip
                      label={getStatusText(selectedAgenda.status)}
                      color={getStatusColor(selectedAgenda.status)}
                      icon={getStatusIcon(selectedAgenda.status)}
                    />
                  </Box>
                </DialogTitle>
                <DialogContent sx={{ p: 3, overflowY: 'auto' }}>
                  {/* Meeting Details */}
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
                        📋 Meeting Details
                      </Typography>
                      
                      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3, mb: 2 }}>
                        <Box>
                          <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                            Meeting Class
                          </Typography>
                          <Typography variant="body2" sx={{ color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                            {selectedAgenda.meetingClass}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                            Location
                          </Typography>
                          <Typography variant="body2" sx={{ color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                            {selectedAgenda.location}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                            Draft Date
                          </Typography>
                          <Typography variant="body2" sx={{ color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                            {formatDate(selectedAgenda.draftDate)}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                            Created By
                          </Typography>
                          <Typography variant="body2" sx={{ color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                            {getUserName(selectedAgenda.createdBy)}
                          </Typography>
                        </Box>
                        {selectedAgenda.approvedBy && (
                          <Box>
                            <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                              Approved By
                            </Typography>
                            <Typography variant="body2" sx={{ color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                              {getUserName(selectedAgenda.approvedBy)}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                      
                      <Box sx={{ mb: 2 }}>
                        {renderContributors(selectedAgenda.draftContributors, selectedAgenda._id, 'draft')}
                      </Box>
                    </CardContent>
                  </Card>

                  {/* Agenda Titles */}
                  <Typography variant="h6" sx={{ 
                    mb: 2,
                    color: theme === 'dark' ? '#ccd6f6' : '#333333'
                  }}>
                    Agenda Titles
                  </Typography>
                  
                  {selectedAgenda.agendaTitles.map((title, titleIndex) => (
                    <Accordion 
                      key={titleIndex}
                      sx={{
                        mb: 2,
                        backgroundColor: theme === 'dark' ? '#1e293b' : 'white',
                        border: theme === 'dark' ? '1px solid #334155' : '1px solid #e5e7eb',
                        '&:before': { display: 'none' }
                      }}
                    >
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Typography sx={{ fontWeight: 'medium', color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                          {title.title}
                        </Typography>
                        {title.discussions.length > 0 && (
                          <Chip
                            label={`${title.discussions.length} discussion(s)`}
                            size="small"
                            sx={{ ml: 2, height: 20, fontSize: '0.6rem' }}
                          />
                        )}
                      </AccordionSummary>
                      
                      {title.discussions.length > 0 ? (
                        <AccordionDetails>
                          {title.discussions.map((discussion, discIndex) => (
                            <Paper 
                              key={discIndex}
                              sx={{ 
                                p: 2, 
                                mb: 2,
                                backgroundColor: theme === 'dark' ? '#0f172a' : '#f8f9fa',
                                border: theme === 'dark' ? '1px solid #334155' : '1px solid #e5e7eb'
                              }}
                            >
                              <Typography variant="caption" color={theme === 'dark' ? '#94a3b8' : '#999999'}>
                                Discussion {discIndex + 1} • {formatDate(discussion.discussedAt)}
                              </Typography>
                              
                              <Stack spacing={2} sx={{ mt: 1 }}>
                                <Box>
                                  <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                                    Question
                                  </Typography>
                                  <Typography variant="body2" sx={{ color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                                    {discussion.question}
                                  </Typography>
                                </Box>
                                
                                <Box>
                                  <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                                    Answer
                                  </Typography>
                                  <Typography variant="body2" sx={{ color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                                    {discussion.answer}
                                  </Typography>
                                </Box>
                                
                                <Box>
                                  <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                                    Summary
                                  </Typography>
                                  <Typography variant="body2" sx={{ color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                                    {discussion.summary}
                                  </Typography>
                                </Box>
                              </Stack>
                            </Paper>
                          ))}
                        </AccordionDetails>
                      ) : (
                        <AccordionDetails>
                          <Typography variant="body2" color={theme === 'dark' ? '#a8b2d1' : '#666666'} sx={{ textAlign: 'center', py: 2 }}>
                            No discussions recorded for this title.
                          </Typography>
                        </AccordionDetails>
                      )}
                    </Accordion>
                  ))}

                  {/* Day 2 Data (if exists) */}
                  {(selectedAgenda.generalMeetingSummary || selectedAgenda.meetingDate || selectedAgenda.meetingContributors.length > 0) && (
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
                          📝 Day 2 Meeting Details
                        </Typography>
                        
                        {selectedAgenda.meetingDate && (
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                              Meeting Date
                            </Typography>
                            <Typography variant="body2" sx={{ color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                              {formatDate(selectedAgenda.meetingDate)}
                            </Typography>
                          </Box>
                        )}
                        
                        {selectedAgenda.generalMeetingSummary && (
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                              General Meeting Summary
                            </Typography>
                            <Typography variant="body2" sx={{ 
                              color: theme === 'dark' ? '#ccd6f6' : '#333333',
                              whiteSpace: 'pre-wrap'
                            }}>
                              {selectedAgenda.generalMeetingSummary}
                            </Typography>
                          </Box>
                        )}
                        
                        {selectedAgenda.meetingContributors.length > 0 && (
                          <Box>
                            {renderContributors(selectedAgenda.meetingContributors, selectedAgenda._id, 'meeting')}
                          </Box>
                        )}
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
                  {/* Only show approve button in dialog for pending agendas */}
                  {selectedAgenda.status === 'pending' && (
                    <Button 
                      onClick={() => {
                        setOpenViewDialog(false);
                        handleOpenApproveDialog(selectedAgenda);
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
                      Approve Agenda
                    </Button>
                  )}
                </DialogActions>
              </>
            )}
          </Dialog>

          {/* Approve Confirmation Dialog */}
          <Dialog 
            open={openApproveDialog} 
            onClose={() => setOpenApproveDialog(false)}
            PaperProps={{
              sx: { 
                borderRadius: 2,
                backgroundColor: theme === 'dark' ? '#0f172a' : 'white',
                color: theme === 'dark' ? '#ccd6f6' : '#333333'
              }
            }}
          >
            {selectedAgenda && (
              <>
                <DialogTitle sx={{ 
                  backgroundColor: theme === 'dark' ? '#0f172a' : 'white',
                  borderBottom: theme === 'dark' ? '1px solid #334155' : '1px solid #e5e7eb',
                  py: 3
                }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                    Confirm Approval
                  </Typography>
                </DialogTitle>
                <DialogContent sx={{ p: 3 }}>
                  <Typography variant="body1" color={theme === 'dark' ? '#a8b2d1' : '#666666'} sx={{ mb: 2 }}>
                    Are you sure you want to approve the agenda for <strong style={{color: theme === 'dark' ? '#00ff00' : '#28a745'}}>
                      "{selectedAgenda?.meetingClass}"
                    </strong> meeting?
                  </Typography>
                  <Typography variant="body2" color={theme === 'dark' ? '#94a3b8' : '#999999'}>
                    Once approved, the agenda will be available for discussion and cannot be edited by the creator.
                  </Typography>
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
                    onClick={handleApproveAgenda} 
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
                    Approve Agenda
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

export default AgendaApprovePage;