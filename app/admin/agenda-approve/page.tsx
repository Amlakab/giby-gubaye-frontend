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
  FormControlLabel, Autocomplete, Divider,
  Stack, Tooltip,
  Accordion, AccordionSummary, AccordionDetails,
  Paper
} from '@mui/material';
import { motion } from 'framer-motion';
import { useTheme } from '@/lib/theme-context';
import {
  Event, Edit, Delete, Visibility,
  CalendarToday, Person, LocationOn,
  TrendingUp, ExpandMore, Add,
  Search, Refresh, CheckCircle,
  Cancel, HourglassEmpty, AssignmentTurnedIn,
  People, Title, Notes, Chat,
  Save, Close, ArrowForward,
  PlayCircle, StopCircle,
  Check, Clear, ThumbUp,
  Gavel
} from '@mui/icons-material';
import api from '@/app/utils/api';
import { format, parseISO } from 'date-fns';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
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
  draftContributors: User[];
  agendaTitles: AgendaTitle[];
  generalMeetingSummary?: string;
  meetingContributors: User[];
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
  allUsers: User[];
}

const AgendaApprovePage = () => {
  const { theme } = useTheme();
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  const [agendas, setAgendas] = useState<Agenda[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    meetingClasses: [],
    locations: [],
    creators: [],
    allUsers: []
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

  const [filters, setFilters] = useState({
    search: '',
    meetingClass: '',
    location: '',
    status: 'pending', // Default to pending for approval queue
    createdBy: '',
    sortBy: 'draftDate',
    sortOrder: 'desc',
    page: 1,
    limit: 10
  });

  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openApproveDialog, setOpenApproveDialog] = useState(false);
  const [selectedAgenda, setSelectedAgenda] = useState<Agenda | null>(null);

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
        if (value && value !== '') {
          params.append(key, value.toString());
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

  useEffect(() => {
    fetchAgendas();
  }, [fetchAgendas]);

  useEffect(() => {
    fetchFilterOptions();
  }, [fetchFilterOptions]);

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

  const handleFilterChange = (field: string, value: string | number) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
      ...(field !== 'page' && { page: 1 })
    }));
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    handleFilterChange('page', value);
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      meetingClass: '',
      location: '',
      status: 'pending',
      createdBy: '',
      sortBy: 'draftDate',
      sortOrder: 'desc',
      page: 1,
      limit: 10
    });
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

  const getContributorInitials = (contributor: User) => {
    const first = contributor?.firstName?.charAt(0) || '';
    const last = contributor?.lastName?.charAt(0) || '';
    return `${first}${last}`.toUpperCase() || '?';
  };

  const getContributorName = (contributor: User) => {
    return `${contributor.firstName || ''} ${contributor.lastName || ''}`.trim() || 'Unknown';
  };

  const getAuthorAvatarColor = (userId: string): string => {
    const colors = ['#1976d2', '#2e7d32', '#ed6c02', '#d32f2f', '#7b1fa2', '#00796b', '#388e3c', '#f57c00', '#0288d1', '#c2185b'];
    const index = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };

  return (
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
              Review and approve pending agendas
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
                  <Gavel /> Agenda Approval Queue
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
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1,
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
                    }
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
                          {creator.firstName} {creator.lastName}
                        </Typography>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
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
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ 
                      background: theme === 'dark'
                        ? 'linear-gradient(135deg, #ff9900, #cc7a00)'
                        : 'linear-gradient(135deg, #ff9900, #cc7a00)'
                    }}>
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
                        Contributors
                      </TableCell>
                      <TableCell sx={{ 
                        color: 'white', 
                        fontWeight: 'bold',
                        fontSize: '0.875rem',
                        py: 2
                      }}>
                        Agenda Titles
                      </TableCell>
                      <TableCell sx={{ 
                        color: 'white', 
                        fontWeight: 'bold',
                        fontSize: '0.875rem',
                        py: 2
                      }}>
                        Draft Date
                      </TableCell>
                      <TableCell sx={{ 
                        color: 'white', 
                        fontWeight: 'bold',
                        fontSize: '0.875rem',
                        py: 2
                      }}>
                        Actions
                      </TableCell>
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
                                Created by {agenda.createdBy.firstName} {agenda.createdBy.lastName}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        
                        <TableCell sx={{ py: 2.5 }}>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, maxWidth: '200px' }}>
                            {agenda.draftContributors.slice(0, 3).map((contributor) => (
                              <Chip
                                key={contributor._id}
                                label={getContributorInitials(contributor)}
                                size="small"
                                sx={{
                                  height: 24,
                                  fontSize: '0.7rem',
                                  backgroundColor: getAuthorAvatarColor(contributor._id),
                                  color: 'white'
                                }}
                              />
                            ))}
                            {agenda.draftContributors.length > 3 && (
                              <Chip
                                label={`+${agenda.draftContributors.length - 3}`}
                                size="small"
                                sx={{
                                  height: 24,
                                  fontSize: '0.7rem',
                                  backgroundColor: theme === 'dark' ? '#334155' : '#e5e7eb'
                                }}
                              />
                            )}
                          </Box>
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
                          <Typography variant="body2" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                            {formatDate(agenda.draftDate)}
                          </Typography>
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
                            
                            {/* Approve button - only for pending agendas */}
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
                                  <ThumbUp fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Box>
                        </TableCell>
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
                  <Gavel sx={{ 
                    fontSize: 64, 
                    color: theme === 'dark' ? '#334155' : '#cbd5e1',
                    mb: 2
                  }} />
                  <Typography variant="h6" color={theme === 'dark' ? '#a8b2d1' : '#666666'} sx={{ mb: 1 }}>
                    No pending agendas found
                  </Typography>
                  <Typography variant="body2" color={theme === 'dark' ? '#94a3b8' : '#999999'}>
                    All agendas have been approved or try adjusting your filters
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
                        backgroundColor: theme === 'dark' ? '#ff9900' : '#ff9900',
                        color: theme === 'dark' ? '#0a192f' : 'white',
                      },
                      '&:hover': {
                        backgroundColor: theme === 'dark' ? '#ff990020' : '#ff990010'
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
                      Agenda Review
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
                          {selectedAgenda.createdBy.firstName} {selectedAgenda.createdBy.lastName}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                        Draft Contributors
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                        {selectedAgenda.draftContributors.map((contributor) => (
                          <Chip
                            key={contributor._id}
                            label={getContributorName(contributor)}
                            size="small"
                            sx={{
                              height: 24,
                              fontSize: '0.7rem',
                              backgroundColor: getAuthorAvatarColor(contributor._id),
                              color: 'white'
                            }}
                          />
                        ))}
                      </Box>
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
                  <Paper 
                    key={titleIndex}
                    sx={{ 
                      p: 2, 
                      mb: 2,
                      backgroundColor: theme === 'dark' ? '#1e293b' : '#f8f9fa',
                      border: theme === 'dark' ? '1px solid #334155' : '1px solid #e5e7eb'
                    }}
                  >
                    <Typography sx={{ 
                      fontWeight: 'medium', 
                      color: theme === 'dark' ? '#ccd6f6' : '#333333',
                      mb: 2
                    }}>
                      {titleIndex + 1}. {title.title}
                    </Typography>
                  </Paper>
                ))}
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
                {selectedAgenda.status === 'pending' && (
                  <Button 
                    onClick={() => {
                      setOpenViewDialog(false);
                      handleOpenApproveDialog(selectedAgenda);
                    }}
                    variant="contained"
                    color="success"
                    startIcon={<ThumbUp />}
                    sx={{
                      backgroundColor: theme === 'dark' ? '#00ff00' : '#28a745',
                      color: theme === 'dark' ? '#0a192f' : 'white',
                      '&:hover': {
                        backgroundColor: theme === 'dark' ? '#00b300' : '#218838'
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
                backgroundColor: theme === 'dark' ? '#00ff0020' : '#28a74520',
                borderBottom: theme === 'dark' ? '1px solid #334155' : '1px solid #e5e7eb',
                py: 3
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <ThumbUp sx={{ color: theme === 'dark' ? '#00ff00' : '#28a745', fontSize: 32 }} />
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                    Approve Agenda
                  </Typography>
                </Box>
              </DialogTitle>
              <DialogContent sx={{ p: 3 }}>
                <Typography variant="body1" color={theme === 'dark' ? '#a8b2d1' : '#666666'} sx={{ mb: 2 }}>
                  You are about to approve the agenda for <strong>{selectedAgenda.meetingClass}</strong> meeting.
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
                  color="success"
                  startIcon={<ThumbUp />}
                  sx={{
                    backgroundColor: theme === 'dark' ? '#00ff00' : '#28a745',
                    color: theme === 'dark' ? '#0a192f' : 'white',
                    '&:hover': {
                      backgroundColor: theme === 'dark' ? '#00b300' : '#218838'
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
  );
};

export default AgendaApprovePage;