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
  Stack, Tooltip,
  Paper, Divider
} from '@mui/material';
import { motion } from 'framer-motion';
import { useTheme } from '@/lib/theme-context';
import {
  VideoLibrary, Description, Image,
  Visibility, CalendarToday, Person, Category,
  Search, Refresh,
  CheckCircle, Cancel, HourglassEmpty,
  Star, DateRange,
  ThumbUp, ThumbDown, Gavel,
  YouTube, PictureAsPdf, InsertPhoto,
  CloudDownload
} from '@mui/icons-material';
import api from '@/app/utils/api';
import { format, parseISO } from 'date-fns';

interface Resource {
  _id: string;
  title: string;
  description: string;
  type: 'video' | 'document' | 'image';
  status: 'pending' | 'approved' | 'rejected';
  visibility: 'visible' | 'hidden';
  category: string;
  createdBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
  tags: string[];
  isFeatured: boolean;
  viewsCount: number;
  downloadsCount: number;
  
  // Video specific
  youtubeUrl?: string;
  videoId?: string;
  thumbnail?: string;
  
  // Document specific
  downloadLink?: string;
  previewImageData?: {
    data?: any;
    contentType: string;
    fileName: string;
  };
  documentData?: {
    contentType: string;
    fileName: string;
    fileSize: number;
  };
  
  // Image specific
  imageGallery?: Array<{
    _id: string;
    contentType: string;
    fileName: string;
    caption?: string;
    order: number;
  }>;
  imageCount?: number;
  
  createdAt: string;
  updatedAt: string;
  approvalNotes?: string;
  approvedBy?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  approvedAt?: string;
}

interface ResourceStats {
  totalResources: number;
  pendingResources: number;
  approvedResources: number;
  rejectedResources: number;
  videoResources: number;
  documentResources: number;
  imageResources: number;
}

interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalResources: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface FilterOptions {
  categories: string[];
  tags: string[];
  authors: { _id: string; firstName: string; lastName: string; email: string }[];
}

const ApproveResourcesPage = () => {
  const { theme } = useTheme();
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  const [resources, setResources] = useState<Resource[]>([]);
  const [stats, setStats] = useState<ResourceStats | null>(null);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    categories: [],
    tags: [],
    authors: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [pagination, setPagination] = useState<PaginationData>({
    currentPage: 1,
    totalPages: 1,
    totalResources: 0,
    hasNext: false,
    hasPrev: false
  });

  const [filters, setFilters] = useState({
    search: '',
    type: '',
    category: '',
    status: '',
    author: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    page: 1,
    limit: 10
  });

  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openApproveDialog, setOpenApproveDialog] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject'>('approve');
  const [approvalNotes, setApprovalNotes] = useState('');

  const themeStyles = {
    background: theme === 'dark' 
      ? 'linear-gradient(135deg, #0a192f, #112240)' 
      : 'linear-gradient(135deg, #f0f0f0, #ffffff)',
    textColor: theme === 'dark' ? '#ccd6f6' : '#333333',
    primaryColor: theme === 'dark' ? '#00ffff' : '#007bff',
    borderColor: theme === 'dark' ? '#00ffff' : '#007bff',
    surface: theme === 'dark' ? '#1e293b' : '#ffffff',
    cardBg: theme === 'dark' ? '#0f172a80' : '#ffffff',
    cardBorder: theme === 'dark' ? '#334155' : '#e5e7eb',
    headerBg: theme === 'dark' 
      ? 'linear-gradient(135deg, #00ffff, #00b3b3)' 
      : 'linear-gradient(135deg, #007bff, #0056b3)',
    hoverBg: theme === 'dark' ? '#1e293b' : '#f8fafc',
    disabledBg: theme === 'dark' ? '#334155' : '#e5e7eb',
    disabledText: theme === 'dark' ? '#94a3b8' : '#94a3b8'
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

  const fetchResources = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== '') {
          params.append(key, value.toString());
        }
      });

      console.log('Fetching approval resources with params:', params.toString());
      
      const response = await api.get(`/resources?${params}`);
      console.log('Approval resources API response:', response.data);
      
      // Handle both response structures
      let resourcesData: Resource[] = [];
      let paginationData: PaginationData = {
        currentPage: 1,
        totalPages: 1,
        totalResources: 0,
        hasNext: false,
        hasPrev: false
      };
      
      if (response.data.data && response.data.data.resources) {
        resourcesData = response.data.data.resources;
        paginationData = response.data.data.pagination;
      } else if (response.data.resources) {
        resourcesData = response.data.resources;
        paginationData = response.data.pagination;
      }
      
      console.log('Processed approval resources:', resourcesData);
      setResources(resourcesData);
      setPagination(paginationData);
      setError('');
    } catch (error: any) {
      console.error('Error fetching approval resources:', error);
      setError(error.response?.data?.message || 'Failed to fetch resources');
      setResources([]);
      setPagination({
        currentPage: 1,
        totalPages: 1,
        totalResources: 0,
        hasNext: false,
        hasPrev: false
      });
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await api.get('/resources/stats');
      setStats(response.data.data);
    } catch (error: any) {
      console.error('Failed to fetch stats:', error);
    }
  }, []);

  const fetchFilterOptions = useCallback(async () => {
    try {
      const response = await api.get('/resources/filter-options');
      setFilterOptions(response.data.data);
    } catch (error: any) {
      console.error('Failed to fetch filter options:', error);
    }
  }, []);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  useEffect(() => {
    fetchStats();
    fetchFilterOptions();
  }, [fetchStats, fetchFilterOptions]);

  const handleOpenViewDialog = (resource: Resource) => {
    setSelectedResource(resource);
    setOpenViewDialog(true);
  };

  const handleOpenApproveDialog = (resource: Resource, action: 'approve' | 'reject') => {
    setSelectedResource(resource);
    setApprovalAction(action);
    setApprovalNotes('');
    setOpenApproveDialog(true);
  };

  const handleApproveResource = async () => {
    if (!selectedResource) return;

    try {
      await api.patch(`/resources/${selectedResource._id}/approve`, {
        status: approvalAction === 'approve' ? 'approved' : 'rejected',
        approvalNotes: approvalNotes.trim() || undefined
      });
      
      const successMessage = `Resource ${approvalAction === 'approve' ? 'approved' : 'rejected'} successfully`;
      setSuccess(successMessage);
      setOpenApproveDialog(false);
      setSelectedResource(null);
      setApprovalNotes('');
      
      fetchResources();
      fetchStats();
    } catch (error: any) {
      setError(error.response?.data?.message || `Failed to ${approvalAction} resource`);
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
      type: '',
      category: '',
      status: '',
      author: '',
      sortBy: 'createdAt',
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
      case 'approved': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle fontSize="small" />;
      case 'pending': return <HourglassEmpty fontSize="small" />;
      case 'rejected': return <Cancel fontSize="small" />;
      default: return <HourglassEmpty fontSize="small" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return 'Approved';
      case 'pending': return 'Pending Review';
      case 'rejected': return 'Rejected';
      default: return status;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <YouTube />;
      case 'document': return <PictureAsPdf />;
      case 'image': return <InsertPhoto />;
      default: return <PictureAsPdf />;
    }
  };

  const getTypeColor = (type: string): string => {
    switch (type) {
      case 'video': return '#ff0000';
      case 'document': return '#1976d2';
      case 'image': return '#2e7d32';
      default: return '#666666';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'video': return 'Video';
      case 'document': return 'Document';
      case 'image': return 'Image Gallery';
      default: return type;
    }
  };

  const getAuthorAvatarColor = (authorId: string): string => {
    if (!authorId || authorId === 'default') {
      return theme === 'dark' ? '#00ffff' : '#007bff';
    }
    
    const colors = ['#1976d2', '#2e7d32', '#ed6c02', '#d32f2f', '#7b1fa2', '#00796b', '#388e3c', '#f57c00', '#0288d1', '#c2185b'];
    const index = authorId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };

  const getPreviewImageUrl = (resource: Resource): string => {
    return `${process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000/api'}/resources/${resource._id}/preview-image`;
  };

  const getGalleryImageUrl = (resource: Resource, index: number = 0): string => {
    return `${process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000/api'}/resources/${resource._id}/gallery/${index}`;
  };

  const getDocumentDownloadUrl = (resource: Resource): string => {
    return `${process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000/api'}/resources/${resource._id}/document`;
  };

  const statCards = [
    {
      title: 'Pending Approval',
      value: stats?.pendingResources || 0,
      icon: <HourglassEmpty sx={{ fontSize: 28 }} />,
      color: theme === 'dark' ? '#ff9900' : '#ff9900',
      description: 'Awaiting review'
    },
    {
      title: 'Approved',
      value: stats?.approvedResources || 0,
      icon: <CheckCircle sx={{ fontSize: 28 }} />,
      color: theme === 'dark' ? '#00ff00' : '#28a745',
      description: 'Approved resources'
    },
    {
      title: 'Total Resources',
      value: stats?.totalResources || 0,
      icon: <VideoLibrary sx={{ fontSize: 28 }} />,
      color: theme === 'dark' ? '#00ffff' : '#007bff',
      description: 'All resources'
    },
    {
      title: 'Rejected',
      value: stats?.rejectedResources || 0,
      icon: <Cancel sx={{ fontSize: 28 }} />,
      color: theme === 'dark' ? '#ff0000' : '#dc3545',
      description: 'Not approved'
    }
  ];

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
              Resource Approval Dashboard
            </Typography>
            <Typography variant={isMobile ? "body2" : "body1"} color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
              Review and approve pending resources
            </Typography>
          </Box>
        </motion.div>

        {/* Statistics Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Box sx={{ 
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            flexWrap: 'wrap',
            gap: 2,
            mb: 4
          }}>
            {statCards.map((stat, index) => (
              <Card 
                key={index}
                sx={{ 
                  flex: '1 1 200px',
                  minWidth: { xs: '100%', sm: '200px' },
                  borderRadius: 2,
                  boxShadow: theme === 'dark' 
                    ? '0 2px 8px rgba(0,0,0,0.3)' 
                    : '0 2px 8px rgba(0,0,0,0.1)',
                  borderLeft: `4px solid ${stat.color}`,
                  backgroundColor: theme === 'dark' ? '#0f172a80' : 'white',
                  height: '100%',
                  backdropFilter: theme === 'dark' ? 'blur(10px)' : 'none'
                }}
              >
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ 
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      bgcolor: theme === 'dark' ? `${stat.color}20` : `${stat.color}10`,
                      mr: 2
                    }}>
                      <Box sx={{ color: stat.color }}>
                        {stat.icon}
                      </Box>
                    </Box>
                    <Box>
                      <Typography variant="h4" sx={{ 
                        fontWeight: 'bold', 
                        color: theme === 'dark' ? '#ccd6f6' : '#333333',
                        fontSize: { xs: '1.5rem', md: '1.75rem' },
                        mb: 0.5
                      }}>
                        {stat.value.toLocaleString()}
                      </Typography>
                      <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'} sx={{ fontWeight: 500 }}>
                        {stat.title}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="caption" color={theme === 'dark' ? '#94a3b8' : '#999999'}>
                    {stat.description}
                  </Typography>
                </CardContent>
              </Card>
            ))}
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
                  <Gavel /> Approval Queue
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
                flexDirection: 'column',
                gap: 2
              }}>
                <Box sx={{ 
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  flexWrap: 'wrap',
                  gap: 2
                }}>
                  <TextField
                    sx={{ flex: '1 1 200px', ...textFieldStyle }}
                    size="small"
                    label="Search Resources"
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    placeholder="Title, description, or tags..."
                    InputProps={{
                      startAdornment: (
                        <Search sx={{ 
                          color: theme === 'dark' ? '#a8b2d1' : '#666666',
                          mr: 1 
                        }} />
                      ),
                    }}
                  />
                  
                  <FormControl sx={{ flex: '1 1 150px' }} size="small">
                    <InputLabel sx={{ color: theme === 'dark' ? '#a8b2d1' : '#666666' }}>Type</InputLabel>
                    <Select
                      value={filters.type}
                      label="Type"
                      onChange={(e) => handleFilterChange('type', e.target.value)}
                      sx={selectStyle}
                    >
                      <MenuItem value="">All Types</MenuItem>
                      <MenuItem value="video">Video</MenuItem>
                      <MenuItem value="document">Document</MenuItem>
                      <MenuItem value="image">Image</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <FormControl sx={{ flex: '1 1 150px' }} size="small">
                    <InputLabel sx={{ color: theme === 'dark' ? '#a8b2d1' : '#666666' }}>Category</InputLabel>
                    <Select
                      value={filters.category}
                      label="Category"
                      onChange={(e) => handleFilterChange('category', e.target.value)}
                      sx={selectStyle}
                    >
                      <MenuItem value="">All Categories</MenuItem>
                      {filterOptions.categories.map((category) => (
                        <MenuItem key={category} value={category}>
                          <Typography variant="body2" color={theme === 'dark' ? '#ccd6f6' : '#333333'}>
                            {category}
                          </Typography>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  
                  <FormControl sx={{ flex: '1 1 150px' }} size="small">
                    <InputLabel sx={{ color: theme === 'dark' ? '#a8b2d1' : '#666666' }}>Status</InputLabel>
                    <Select
                      value={filters.status}
                      label="Status"
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                      sx={selectStyle}
                    >
                      <MenuItem value="">All Status</MenuItem>
                      <MenuItem value="pending">Pending</MenuItem>
                      <MenuItem value="approved">Approved</MenuItem>
                      <MenuItem value="rejected">Rejected</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </motion.div>

        {/* Resources List */}
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
                        ? 'linear-gradient(135deg, #00ffff, #00b3b3)'
                        : 'linear-gradient(135deg, #007bff, #0056b3)'
                    }}>
                      <TableCell sx={{ 
                        color: 'white', 
                        fontWeight: 'bold',
                        fontSize: '0.875rem',
                        py: 2,
                        width: '30%'
                      }}>
                        Resource
                      </TableCell>
                      <TableCell sx={{ 
                        color: 'white', 
                        fontWeight: 'bold',
                        fontSize: '0.875rem',
                        py: 2
                      }}>
                        Type/Category
                      </TableCell>
                      <TableCell sx={{ 
                        color: 'white', 
                        fontWeight: 'bold',
                        fontSize: '0.875rem',
                        py: 2
                      }}>
                        Author
                      </TableCell>
                      <TableCell sx={{ 
                        color: 'white', 
                        fontWeight: 'bold',
                        fontSize: '0.875rem',
                        py: 2
                      }}>
                        Created
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
                    {resources.map((resource) => (
                      <TableRow 
                        key={resource._id} 
                        hover
                        sx={{ 
                          '&:hover': {
                            backgroundColor: theme === 'dark' ? '#1e293b' : '#f8fafc'
                          }
                        }}
                      >
                        <TableCell sx={{ py: 2.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                            <Box sx={{ 
                              width: 60, 
                              height: 40,
                              borderRadius: 1,
                              overflow: 'hidden',
                              flexShrink: 0,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: theme === 'dark' ? '#334155' : '#e5e7eb',
                              position: 'relative'
                            }}>
                              {/* Show preview image for documents, first image for galleries, or thumbnail for videos */}
                              {resource.type === 'document' && resource.previewImageData ? (
                                <img 
                                  src={getPreviewImageUrl(resource)} 
                                  alt={resource.title}
                                  style={{ 
                                    width: '100%', 
                                    height: '100%', 
                                    objectFit: 'cover' 
                                  }}
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.onerror = null;
                                    target.style.display = 'none';
                                    const parent = target.parentElement;
                                    if (parent) {
                                      parent.innerHTML = `
                                        <div style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%;">
                                          <svg style="color: ${getTypeColor(resource.type)}; width: 24px; height: 24px;" viewBox="0 0 24 24">
                                            <path fill="currentColor" d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20M10,10V11H8V17H10V18H14V17H16V11H14V10H10M10,12H14V16H10V12Z"/>
                                          </svg>
                                        </div>
                                      `;
                                    }
                                  }}
                                />
                              ) : resource.type === 'image' && resource.imageGallery && resource.imageGallery.length > 0 ? (
                                <img 
                                  src={getGalleryImageUrl(resource, 0)} 
                                  alt={resource.title}
                                  style={{ 
                                    width: '100%', 
                                    height: '100%', 
                                    objectFit: 'cover' 
                                  }}
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.onerror = null;
                                    target.style.display = 'none';
                                    const parent = target.parentElement;
                                    if (parent) {
                                      parent.innerHTML = `
                                        <div style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%;">
                                          <svg style="color: ${getTypeColor(resource.type)}; width: 24px; height: 24px;" viewBox="0 0 24 24">
                                            <path fill="currentColor" d="M8.5,13.5L11,16.5L14.5,12L19,18H5M21,19V5C21,3.9 20.1,3 19,3H5C3.9,3 3,3.9 3,5V19C3,20.1 3.9,21 5,21H19C20.1,21 21,20.1 21,19Z"/>
                                          </svg>
                                        </div>
                                      `;
                                    }
                                  }}
                                />
                              ) : resource.type === 'video' && resource.thumbnail ? (
                                <img 
                                  src={resource.thumbnail} 
                                  alt={resource.title}
                                  style={{ 
                                    width: '100%', 
                                    height: '100%', 
                                    objectFit: 'cover' 
                                  }}
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.onerror = null;
                                    target.style.display = 'none';
                                    const parent = target.parentElement;
                                    if (parent) {
                                      parent.innerHTML = `
                                        <div style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%;">
                                          <svg style="color: ${getTypeColor(resource.type)}; width: 24px; height: 24px;" viewBox="0 0 24 24">
                                            <path fill="currentColor" d="M10,15L15.19,12L10,9V15M21.56,7.17C21.69,7.64 21.78,8.27 21.84,9.07C21.91,9.87 21.94,10.56 21.94,11.16L22,12C22,14.19 21.84,15.8 21.56,16.83C21.31,17.73 20.73,18.31 19.83,18.56C19.36,18.69 18.5,18.78 17.18,18.84C15.88,18.91 14.69,18.94 13.59,18.94L12,19C7.81,19 5.2,18.84 4.17,18.56C3.27,18.31 2.69,17.73 2.44,16.83C2.31,16.36 2.22,15.73 2.16,14.93C2.09,14.13 2.06,13.44 2.06,12.84L2,12C2,9.81 2.16,8.2 2.44,7.17C2.69,6.27 3.27,5.69 4.17,5.44C4.64,5.31 5.5,5.22 6.82,5.16C8.12,5.09 9.31,5.06 10.41,5.06L12,5C16.19,5 18.8,5.16 19.83,5.44C20.73,5.69 21.31,6.27 21.56,7.17Z"/>
                                          </svg>
                                        </div>
                                      `;
                                    }
                                  }}
                                />
                              ) : (
                                <Box sx={{ color: getTypeColor(resource.type) }}>
                                  {getTypeIcon(resource.type)}
                                </Box>
                              )}
                              
                              {/* Image count badge for galleries */}
                              {resource.type === 'image' && resource.imageGallery && resource.imageGallery.length > 0 && (
                                <Box sx={{
                                  position: 'absolute',
                                  bottom: 0,
                                  right: 0,
                                  backgroundColor: 'rgba(0,0,0,0.7)',
                                  color: 'white',
                                  fontSize: '0.6rem',
                                  padding: '1px 4px',
                                  borderTopLeftRadius: '4px'
                                }}>
                                  {resource.imageGallery.length}
                                </Box>
                              )}
                            </Box>
                            <Box>
                              <Typography variant="body2" sx={{ 
                                fontWeight: 500,
                                color: theme === 'dark' ? '#ccd6f6' : '#333333',
                                mb: 0.5,
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}>
                                {resource.title}
                              </Typography>
                              <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                                {resource.description.substring(0, 60)}...
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ py: 2.5 }}>
                          <Stack spacing={0.5}>
                            <Chip
                              label={getTypeText(resource.type)}
                              size="small"
                              icon={getTypeIcon(resource.type)}
                              sx={{ 
                                height: 22,
                                fontSize: '0.7rem',
                                backgroundColor: theme === 'dark' ? '#334155' : '#e5e7eb',
                                color: getTypeColor(resource.type)
                              }}
                            />
                            <Chip
                              label={resource.category}
                              size="small"
                              sx={{ 
                                height: 22,
                                fontSize: '0.7rem',
                                backgroundColor: theme === 'dark' ? '#334155' : '#e5e7eb'
                              }}
                            />
                          </Stack>
                        </TableCell>
                        <TableCell sx={{ py: 2.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ 
                              width: 32, 
                              height: 32,
                              fontSize: '0.875rem',
                              bgcolor: getAuthorAvatarColor(resource.createdBy?._id || 'default')
                            }}>
                              {resource.createdBy?.firstName?.charAt(0) || 'U'}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" sx={{ 
                                fontWeight: 'medium', 
                                color: theme === 'dark' ? '#ccd6f6' : '#333333' 
                              }}>
                                {resource.createdBy?.firstName || 'Unknown'} {resource.createdBy?.lastName || ''}
                              </Typography>
                              <Typography variant="caption" color={theme === 'dark' ? '#94a3b8' : '#999999'}>
                                {resource.createdBy?.email || ''}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ py: 2.5 }}>
                          <Typography variant="body2" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                            {formatDate(resource.createdAt)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ py: 2.5 }}>
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            <Tooltip title="Review">
                              <IconButton
                                size="small"
                                onClick={() => handleOpenViewDialog(resource)}
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
                            
                            {resource.status === 'pending' && (
                              <>
                                <Tooltip title="Approve">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleOpenApproveDialog(resource, 'approve')}
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
                                
                                <Tooltip title="Reject">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleOpenApproveDialog(resource, 'reject')}
                                    sx={{ 
                                      color: theme === 'dark' ? '#ff0000' : '#dc3545',
                                      '&:hover': {
                                        backgroundColor: theme === 'dark' ? '#ff000020' : '#dc354510'
                                      }
                                    }}
                                  >
                                    <ThumbDown fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {resources.length === 0 && !loading && (
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
                    No resources found
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
                  Showing {((filters.page - 1) * filters.limit) + 1} to {Math.min(filters.page * filters.limit, pagination.totalResources)} of {pagination.totalResources} resources
                </Typography>
              </Box>
            )}
          </motion.div>
        )}

        {/* View Resource Dialog */}
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
          {selectedResource && (
            <>
              <DialogTitle sx={{ 
                backgroundColor: theme === 'dark' ? '#0f172a' : 'white',
                borderBottom: theme === 'dark' ? '1px solid #334155' : '1px solid #e5e7eb',
                py: 3
              }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                    Resource Review
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Chip
                      label={getTypeText(selectedResource.type)}
                      color="primary"
                      size="small"
                      icon={getTypeIcon(selectedResource.type)}
                    />
                    <Chip
                      label={getStatusText(selectedResource.status)}
                      color={getStatusColor(selectedResource.status)}
                      size="small"
                      icon={getStatusIcon(selectedResource.status)}
                    />
                  </Box>
                </Box>
              </DialogTitle>
              <DialogContent sx={{ p: 3 }}>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  {/* Resource Preview based on type */}
                  {selectedResource.type === 'video' && selectedResource.videoId && (
                    <Box sx={{ mb: 3 }}>
                      <Box sx={{ 
                        width: '100%',
                        height: { xs: 200, md: 400 },
                        borderRadius: 2,
                        overflow: 'hidden',
                        backgroundColor: theme === 'dark' ? '#000' : '#f0f0f0'
                      }}>
                        <iframe
                          width="100%"
                          height="100%"
                          src={`https://www.youtube.com/embed/${selectedResource.videoId}`}
                          title={selectedResource.title}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          style={{ border: 'none' }}
                        />
                      </Box>
                      {selectedResource.youtubeUrl && (
                        <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'} sx={{ mt: 1, display: 'block' }}>
                          YouTube URL: <a href={selectedResource.youtubeUrl} target="_blank" rel="noopener noreferrer" 
                            style={{ color: theme === 'dark' ? '#00ffff' : '#007bff' }}>
                            {selectedResource.youtubeUrl}
                          </a>
                        </Typography>
                      )}
                    </Box>
                  )}

                  {selectedResource.type === 'document' && (
                    <Card sx={{ mb: 3 }}>
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                          <PictureAsPdf sx={{ fontSize: 48, color: '#f44336' }} />
                          <Box>
                            <Typography variant="h6" color={theme === 'dark' ? '#ccd6f6' : '#333333'}>
                              Document File
                            </Typography>
                            <Typography variant="body2" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                              {selectedResource.documentData?.fileName || 'Document file'}
                            </Typography>
                          </Box>
                        </Box>
                        
                        {/* Document Preview Image */}
                        <Box sx={{ 
                          width: '100%',
                          maxWidth: 300,
                          height: 200,
                          margin: '0 auto 16px',
                          borderRadius: 2,
                          overflow: 'hidden',
                          backgroundColor: theme === 'dark' ? '#334155' : '#e5e7eb',
                          position: 'relative'
                        }}>
                          {selectedResource.previewImageData ? (
                            <img
                              src={getPreviewImageUrl(selectedResource)}
                              alt="Document Preview"
                              style={{ 
                                width: '100%', 
                                height: '100%', 
                                objectFit: 'contain' 
                              }}
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const parent = target.parentElement;
                                if (parent) {
                                  parent.innerHTML = `
                                    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; background: ${theme === 'dark' ? '#1e293b' : '#f5f5f5'}">
                                      <svg style="color: #f44336; width: 48px; height: 48px; margin-bottom: 8px;" viewBox="0 0 24 24">
                                        <path fill="currentColor" d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20M10,10V11H8V17H10V18H14V17H16V11H14V10H10M10,12H14V16H10V12Z"/>
                                      </svg>
                                      <span style="color: ${theme === 'dark' ? '#94a3b8' : '#666666'}; font-size: 12px;">PDF Document</span>
                                    </div>
                                  `;
                                }
                              }}
                            />
                          ) : (
                            <Box sx={{ 
                              display: 'flex', 
                              flexDirection: 'column', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              width: '100%',
                              height: '100%'
                            }}>
                              <PictureAsPdf sx={{ fontSize: 48, color: '#f44336', mb: 1 }} />
                              <Typography variant="caption" color={theme === 'dark' ? '#94a3b8' : '#666666'}>
                                Document Preview
                              </Typography>
                            </Box>
                          )}
                        </Box>
                        
                        {selectedResource.status === 'approved' && (
                          <Button
                            variant="contained"
                            startIcon={<CloudDownload />}
                            href={getDocumentDownloadUrl(selectedResource)}
                            target="_blank"
                            sx={{
                              backgroundColor: theme === 'dark' ? '#f44336' : '#f44336',
                              color: 'white',
                              '&:hover': {
                                backgroundColor: theme === 'dark' ? '#d32f2f' : '#d32f2f'
                              }
                            }}
                          >
                            Download Document
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {selectedResource.type === 'image' && selectedResource.imageGallery && selectedResource.imageGallery.length > 0 && (
                    <Card sx={{ mb: 3 }}>
                      <CardContent sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ 
                          mb: 2,
                          color: theme === 'dark' ? '#ccd6f6' : '#333333'
                        }}>
                          Image Gallery ({selectedResource.imageGallery.length} images)
                        </Typography>
                        
                        <Box sx={{ 
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: 2,
                          justifyContent: 'center'
                        }}>
                          {selectedResource.imageGallery.slice(0, 6).map((image, index) => (
                            <Box 
                              key={index}
                              sx={{ 
                                width: 120,
                                height: 90,
                                borderRadius: 1,
                                overflow: 'hidden',
                                backgroundColor: theme === 'dark' ? '#334155' : '#e5e7eb',
                                cursor: 'pointer',
                                position: 'relative',
                                '&:hover': {
                                  transform: 'scale(1.05)',
                                  transition: 'transform 0.2s'
                                }
                              }}
                              onClick={() => {
                                window.open(getGalleryImageUrl(selectedResource, index), '_blank');
                              }}
                            >
                              <img
                                src={getGalleryImageUrl(selectedResource, index)}
                                alt={`${selectedResource.title} - Image ${index + 1}`}
                                style={{ 
                                  width: '100%', 
                                  height: '100%', 
                                  objectFit: 'cover' 
                                }}
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  const parent = target.parentElement;
                                  if (parent) {
                                    parent.innerHTML = `
                                      <div style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; background: ${theme === 'dark' ? '#1e293b' : '#f5f5f5'}">
                                        <svg style="color: #4caf50; width: 32px; height: 32px;" viewBox="0 0 24 24">
                                          <path fill="currentColor" d="M8.5,13.5L11,16.5L14.5,12L19,18H5M21,19V5C21,3.9 20.1,3 19,3H5C3.9,3 3,3.9 3,5V19C3,20.1 3.9,21 5,21H19C20.1,21 21,20.1 21,19Z"/>
                                        </svg>
                                      </div>
                                    `;
                                  }
                                }}
                              />
                              
                              {/* Image number overlay */}
                              <Box sx={{
                                position: 'absolute',
                                top: 4,
                                right: 4,
                                backgroundColor: 'rgba(0,0,0,0.7)',
                                color: 'white',
                                fontSize: '0.6rem',
                                padding: '1px 4px',
                                borderRadius: '4px'
                              }}>
                                {index + 1}
                              </Box>
                            </Box>
                          ))}
                          
                          {selectedResource.imageGallery.length > 6 && (
                            <Box 
                              sx={{ 
                                width: 120,
                                height: 90,
                                borderRadius: 1,
                                backgroundColor: theme === 'dark' ? '#334155' : '#e5e7eb',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                '&:hover': {
                                  backgroundColor: theme === 'dark' ? '#475569' : '#d1d5db'
                                }
                              }}
                              onClick={() => {
                                window.open(getGalleryImageUrl(selectedResource, 0), '_blank');
                              }}
                            >
                              <Typography variant="body2" color={theme === 'dark' ? '#94a3b8' : '#666666'}>
                                +{selectedResource.imageGallery.length - 6} more
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  )}

                  {/* Resource Details */}
                  <Typography variant="h5" sx={{ 
                    fontWeight: 'bold',
                    color: theme === 'dark' ? '#ccd6f6' : '#333333',
                    mb: 2
                  }}>
                    {selectedResource.title}
                  </Typography>
                  
                  <Typography variant="body1" sx={{ 
                    color: theme === 'dark' ? '#a8b2d1' : '#666666',
                    mb: 3,
                    lineHeight: 1.6
                  }}>
                    {selectedResource.description}
                  </Typography>
                  
                  {/* Tags and Category */}
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                    <Chip
                      label={selectedResource.category}
                      sx={{ 
                        backgroundColor: theme === 'dark' ? '#334155' : '#e5e7eb'
                      }}
                    />
                    {selectedResource.tags.map((tag, index) => (
                      <Chip
                        key={index}
                        label={tag}
                        size="small"
                        variant="outlined"
                        sx={{ 
                          borderColor: theme === 'dark' ? '#334155' : '#e5e7eb',
                          color: theme === 'dark' ? '#a8b2d1' : '#666666'
                        }}
                      />
                    ))}
                  </Box>
                  
                  <Divider sx={{ my: 3 }} />
                  
                  {/* Author and Dates */}
                  <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, flexWrap: 'wrap', gap: 3 }}>
                    {/* Author Card */}
                    <Card sx={{ 
                      flex: '1 1 300px',
                      minWidth: { xs: '100%', md: '300px' },
                      backgroundColor: theme === 'dark' ? '#1e293b' : '#f8f9fa',
                      border: theme === 'dark' ? '1px solid #334155' : '1px solid #e5e7eb'
                    }}>
                      <CardContent>
                        <Typography variant="subtitle2" sx={{ 
                          mb: 2,
                          color: theme === 'dark' ? '#ccd6f6' : '#333333'
                        }}>
                          Submitted By
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ 
                            width: 40, 
                            height: 40,
                            fontSize: '1rem',
                            bgcolor: getAuthorAvatarColor(selectedResource.createdBy?._id || 'default')
                          }}>
                            {selectedResource.createdBy?.firstName?.charAt(0) || 'U'}
                          </Avatar>
                          <Box>
                            <Typography variant="body1" sx={{ 
                              fontWeight: 'medium',
                              color: theme === 'dark' ? '#ccd6f6' : '#333333'
                            }}>
                              {selectedResource.createdBy?.firstName || 'Unknown'} {selectedResource.createdBy?.lastName || ''}
                            </Typography>
                            <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                              {selectedResource.createdBy?.email || 'No email provided'}
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                    
                    {/* Dates Card */}
                    <Card sx={{ 
                      flex: '1 1 300px',
                      minWidth: { xs: '100%', md: '300px' },
                      backgroundColor: theme === 'dark' ? '#1e293b' : '#f8f9fa',
                      border: theme === 'dark' ? '1px solid #334155' : '1px solid #e5e7eb'
                    }}>
                      <CardContent>
                        <Typography variant="subtitle2" sx={{ 
                          mb: 2,
                          color: theme === 'dark' ? '#ccd6f6' : '#333333'
                        }}>
                          Submission Date
                        </Typography>
                        <Typography variant="h6" sx={{ color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                          {formatDate(selectedResource.createdAt)}
                        </Typography>
                        <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                          {selectedResource.status === 'pending' 
                            ? `Waiting for review since ${format(parseISO(selectedResource.createdAt), 'MMM dd, yyyy')}`
                            : `Submitted on ${format(parseISO(selectedResource.createdAt), 'MMM dd, yyyy')}`
                          }
                        </Typography>
                      </CardContent>
                    </Card>
                  </Box>
                </motion.div>
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
                {selectedResource.status === 'pending' && (
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button 
                      onClick={() => handleOpenApproveDialog(selectedResource, 'reject')}
                      variant="outlined"
                      color="error"
                      startIcon={<ThumbDown />}
                      sx={{
                        borderColor: theme === 'dark' ? '#ff0000' : '#dc3545',
                        color: theme === 'dark' ? '#ff0000' : '#dc3545',
                        '&:hover': {
                          backgroundColor: theme === 'dark' ? '#ff000020' : '#dc354510'
                        }
                      }}
                    >
                      Reject
                    </Button>
                    <Button 
                      onClick={() => handleOpenApproveDialog(selectedResource, 'approve')}
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
                      Approve
                    </Button>
                  </Box>
                )}
              </DialogActions>
            </>
          )}
        </Dialog>

        {/* Approve/Reject Dialog */}
        <Dialog 
          open={openApproveDialog} 
          onClose={() => setOpenApproveDialog(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: { 
              borderRadius: 2,
              backgroundColor: theme === 'dark' ? '#0f172a' : 'white',
              color: theme === 'dark' ? '#ccd6f6' : '#333333'
            }
          }}
        >
          <DialogTitle sx={{ 
            backgroundColor: theme === 'dark' ? '#0f172a' : 'white',
            borderBottom: theme === 'dark' ? '1px solid #334155' : '1px solid #e5e7eb',
            py: 3
          }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
              {approvalAction === 'approve' ? 'Approve Resource' : 'Reject Resource'}
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            {selectedResource && (
              <Box>
                <Typography variant="body1" sx={{ mb: 2, color: theme === 'dark' ? '#a8b2d1' : '#666666' }}>
                  You are about to <strong style={{color: approvalAction === 'approve' ? '#28a745' : '#dc3545'}}>
                    {approvalAction === 'approve' ? 'approve' : 'reject'}
                  </strong> the following resource:
                </Typography>
                
                <Card sx={{ 
                  mb: 3,
                  backgroundColor: theme === 'dark' ? '#1e293b' : '#f8f9fa',
                  border: theme === 'dark' ? '1px solid #334155' : '1px solid #e5e7eb'
                }}>
                  <CardContent>
                    <Typography variant="subtitle1" sx={{ 
                      fontWeight: 'bold',
                      color: theme === 'dark' ? '#ccd6f6' : '#333333',
                      mb: 1
                    }}>
                      {selectedResource.title}
                    </Typography>
                    <Typography variant="body2" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                      {selectedResource.description.substring(0, 100)}...
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                      <Chip
                        label={getTypeText(selectedResource.type)}
                        size="small"
                        sx={{ 
                          fontSize: '0.7rem',
                          backgroundColor: theme === 'dark' ? '#334155' : '#e5e7eb'
                        }}
                      />
                      <Chip
                        label={selectedResource.category}
                        size="small"
                        sx={{ 
                          fontSize: '0.7rem',
                          backgroundColor: theme === 'dark' ? '#334155' : '#e5e7eb'
                        }}
                      />
                    </Box>
                  </CardContent>
                </Card>
                
                <Typography variant="subtitle2" sx={{ 
                  mb: 1,
                  color: theme === 'dark' ? '#a8b2d1' : '#666666'
                }}>
                  {approvalAction === 'approve' ? 'Approval Notes (Optional)' : 'Rejection Reason (Required)'}
                </Typography>
                <TextField
                  multiline
                  rows={3}
                  fullWidth
                  placeholder={approvalAction === 'approve' 
                    ? 'Add any notes about this approval...' 
                    : 'Explain why this resource is being rejected...'}
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e.target.value)}
                  sx={textFieldStyle}
                />
                {approvalAction === 'reject' && !approvalNotes.trim() && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                    Please provide a reason for rejection
                  </Typography>
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ 
            p: 3,
            borderTop: theme === 'dark' ? '1px solid #334155' : '1px solid #e5e7eb',
            backgroundColor: theme === 'dark' ? '#0f172a' : 'white'
          }}>
            <Button 
              onClick={() => {
                setOpenApproveDialog(false);
                setApprovalNotes('');
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
              onClick={handleApproveResource}
              variant="contained"
              disabled={approvalAction === 'reject' && !approvalNotes.trim()}
              color={approvalAction === 'approve' ? 'success' : 'error'}
              sx={{
                borderRadius: 1,
                backgroundColor: approvalAction === 'approve' 
                  ? (theme === 'dark' ? '#00ff00' : '#28a745')
                  : (theme === 'dark' ? '#ff0000' : '#dc3545'),
                color: theme === 'dark' ? '#0a192f' : 'white',
                '&:hover': {
                  backgroundColor: approvalAction === 'approve' 
                    ? (theme === 'dark' ? '#00b300' : '#218838')
                    : (theme === 'dark' ? '#cc0000' : '#c82333')
                },
                '&.Mui-disabled': {
                  backgroundColor: theme === 'dark' ? '#334155' : '#e5e7eb',
                  color: theme === 'dark' ? '#94a3b8' : '#94a3b8'
                }
              }}
            >
              {approvalAction === 'approve' ? 'Approve Resource' : 'Reject Resource'}
            </Button>
          </DialogActions>
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

export default ApproveResourcesPage;