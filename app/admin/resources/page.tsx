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
  Stack, Tooltip, Switch, Tab, Tabs, Paper,
  CardActionArea,
  Accordion, AccordionSummary, AccordionDetails,
  List, ListItem, ListItemIcon, ListItemText,
  Radio, RadioGroup, FormLabel
} from '@mui/material';
import { motion } from 'framer-motion';
import { useTheme } from '@/lib/theme-context';
import {
  VideoLibrary, Description, Image,
  Edit, Delete, Visibility, VisibilityOff,
  CalendarToday, Person, Category,
  TrendingUp, FeaturedPlayList,
  Search, Refresh,
  CloudUpload, CloudDownload,
  CheckCircle, Cancel, HourglassEmpty,
  Star, DateRange, Add, Save, Close,
  ExpandMore, PlayCircle, PictureAsPdf,
  InsertPhoto, YouTube, Download,
  MoreVert, FilterList, Sort
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
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
    firstName?: string;
    lastName?: string;
    email?: string;
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
    data: any;
    contentType: string;
    fileName: string;
  };
  
  // Image specific
  imageGallery?: Array<{
    data: any;
    contentType: string;
    fileName: string;
    caption?: string;
    order: number;
  }>;
  
  createdAt: string;
  updatedAt: string;
  approvalNotes?: string;
  approvedBy?: {
    _id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
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
  featuredResources: number;
  visibleResources: number;
  hiddenResources: number;
  totalViews: number;
  totalDownloads: number;
  categoryStats: { _id: string; count: number }[];
  typeStats: { _id: string; count: number }[];
  statusStats: { _id: string; count: number }[];
  topViewedResources: { _id: string; title: string; type: string; viewsCount: number; category: string }[];
  topDownloadedResources: { _id: string; title: string; downloadsCount: number; category: string }[];
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

interface ResourceFormData {
  title: string;
  description: string;
  type: 'video' | 'document' | 'image';
  category: string;
  tags: string[];
  youtubeUrl?: string;
  isFeatured: boolean;
  visibility: 'visible' | 'hidden';
  status?: 'pending' | 'approved' | 'rejected';
}

const categories = [
  'Spiritual',
  'Educational',
  'Event',
  'Documentation',
  'Training',
  'Workshop',
  'Conference',
  'Seminar',
  'Others'
];

const tagsOptions = [
  'ትምህርት', 'መንፈሳዊ', 'ወጣቶች', 'ህብረተሰብ',
  'ግቢ ጉባኤ', 'ቤተክርስቲያን', 'አገልግሎት', 'እምነት',
  'መረዳእታ', 'ትግል', 'ማህበራዊ', 'ባህላዊ',
  'ሥነ ምግባር', 'ሥነ ልቦና', 'ቤተሰብ', 'ልጆች'
];

// Helper component for safe avatar display
const SafeAvatar = ({ user, size = 32 }: { user: any; size?: number }) => {
  const { theme } = useTheme();
  const initials = user?.firstName?.charAt(0) || 
                  user?.email?.charAt(0)?.toUpperCase() || 
                  'U';
  
  // Generate consistent color based on user ID or email
  const getAvatarColor = (userId: string | undefined) => {
    if (!userId) return theme === 'dark' ? '#00ffff' : '#007bff';
    
    const colors = ['#1976d2', '#2e7d32', '#ed6c02', '#d32f2f', '#7b1fa2', '#00796b', '#388e3c', '#f57c00', '#0288d1', '#c2185b'];
    const index = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };

  return (
    <Avatar
      sx={{
        width: size,
        height: size,
        fontSize: size >= 40 ? '1rem' : '0.875rem',
        bgcolor: getAvatarColor(user?._id || user?.email)
      }}
    >
      {initials}
    </Avatar>
  );
};

// Helper function to get image data URL
const getImageDataUrl = (imageData: any, contentType: string = 'image/jpeg'): string => {
  try {
    if (!imageData) return '';
    
    let base64Data: string;
    
    if (typeof imageData === 'string') {
      // Already a base64 string
      base64Data = imageData;
    } else if (imageData.$binary && imageData.$binary.base64) {
      // MongoDB BSON format
      base64Data = imageData.$binary.base64;
    } else if (imageData.data && Array.isArray(imageData.data)) {
      // Buffer data array
      base64Data = Buffer.from(imageData.data).toString('base64');
    } else if (Buffer.isBuffer(imageData)) {
      // Buffer object
      base64Data = imageData.toString('base64');
    } else {
      console.error('Invalid image data format');
      return '';
    }

    // Clean base64 string
    const cleanBase64 = base64Data.replace(/\s/g, '');
    
    // Return data URL
    return `data:${contentType};base64,${cleanBase64}`;
  } catch (error) {
    console.error('Error creating image data URL:', error);
    return '';
  }
};

// Helper function to get document preview image URL
const getDocumentImageUrl = (resource: Resource): string => {
  if (resource.previewImageData) {
    return getImageDataUrl(resource.previewImageData.data, resource.previewImageData.contentType);
  }
  return '';
};

// Helper function to get gallery image URL
const getGalleryImageUrl = (resource: Resource, index: number = 0): string => {
  if (resource.imageGallery && resource.imageGallery[index]) {
    return getImageDataUrl(resource.imageGallery[index].data, resource.imageGallery[index].contentType);
  }
  return '';
};

const ResourcePage = () => {
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
    visibility: '',
    tag: '',
    author: '',
    featured: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    page: 1,
    limit: 10
  });

  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [selectedTab, setSelectedTab] = useState('all');
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [previewImageFile, setPreviewImageFile] = useState<File | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [documentPreview, setDocumentPreview] = useState<string | null>(null);
  const [previewImagePreview, setPreviewImagePreview] = useState<string | null>(null);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const [formData, setFormData] = useState<ResourceFormData>({
    title: '',
    description: '',
    type: 'video',
    category: '',
    tags: [],
    youtubeUrl: '',
    isFeatured: false,
    visibility: 'visible'
  });

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

      const response = await api.get(`/resources?${params}`);
      setResources(response.data.data.resources || []);
      setPagination(response.data.data.pagination || {
        currentPage: 1,
        totalPages: 1,
        totalResources: 0,
        hasNext: false,
        hasPrev: false
      });
      setError('');
    } catch (error: any) {
      console.error('Error fetching resources:', error);
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

  const handleOpenCreateDialog = () => {
    resetForm();
    setOpenCreateDialog(true);
  };

  const handleOpenEditDialog = (resource: Resource) => {
    setSelectedResource(resource);
    setFormData({
      title: resource.title,
      description: resource.description,
      type: resource.type,
      category: resource.category,
      tags: resource.tags || [],
      youtubeUrl: resource.youtubeUrl || '',
      isFeatured: resource.isFeatured,
      visibility: resource.visibility,
      status: resource.status
    });
    setOpenEditDialog(true);
  };

  const handleOpenViewDialog = (resource: Resource) => {
    setSelectedResource(resource);
    setOpenViewDialog(true);
  };

  const handleOpenDeleteDialog = (resource: Resource) => {
    setSelectedResource(resource);
    setOpenDeleteDialog(true);
  };

  const handleCreateResource = async () => {
    try {
      const formDataToSend = new FormData();
      
      // Add basic fields
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('type', formData.type);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('tags', formData.tags.join(','));
      formDataToSend.append('isFeatured', formData.isFeatured.toString());
      formDataToSend.append('visibility', formData.visibility);

      // Handle different resource types
      if (formData.type === 'video') {
        if (!formData.youtubeUrl) {
          setError('YouTube URL is required for video resources');
          return;
        }
        formDataToSend.append('youtubeUrl', formData.youtubeUrl);
      }
      
      if (formData.type === 'document') {
        if (!documentFile || !previewImageFile) {
          setError('Document file and preview image are required');
          return;
        }
        formDataToSend.append('document', documentFile);
        formDataToSend.append('previewImage', previewImageFile);
      }
      
      if (formData.type === 'image') {
        if (imageFiles.length === 0) {
          setError('At least one image is required');
          return;
        }
        imageFiles.forEach(file => {
          formDataToSend.append('images', file);
        });
      }

      await api.post('/resources', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      setSuccess('Resource created successfully');
      setOpenCreateDialog(false);
      resetForm();
      fetchResources();
      fetchStats();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to create resource');
    }
  };

  const handleUpdateResource = async () => {
    if (!selectedResource) return;

    try {
      const formDataToSend = new FormData();
      
      // Add basic fields
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('tags', formData.tags.join(','));
      formDataToSend.append('isFeatured', formData.isFeatured.toString());
      formDataToSend.append('visibility', formData.visibility);
      
      if (formData.status) {
        formDataToSend.append('status', formData.status);
      }

      // Handle different resource types
      if (formData.type === 'video' && formData.youtubeUrl) {
        formDataToSend.append('youtubeUrl', formData.youtubeUrl);
      }
      
      if (formData.type === 'document') {
        if (documentFile) {
          formDataToSend.append('document', documentFile);
        }
        if (previewImageFile) {
          formDataToSend.append('previewImage', previewImageFile);
        }
      }
      
      if (formData.type === 'image' && imageFiles.length > 0) {
        imageFiles.forEach(file => {
          formDataToSend.append('images', file);
        });
      }

      await api.put(`/resources/${selectedResource._id}`, formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      setSuccess('Resource updated successfully');
      setOpenEditDialog(false);
      resetForm();
      fetchResources();
      fetchStats();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to update resource');
    }
  };

  const handleDeleteResource = async () => {
    if (!selectedResource) return;

    try {
      await api.delete(`/resources/${selectedResource._id}`);
      setSuccess('Resource deleted successfully');
      setOpenDeleteDialog(false);
      setSelectedResource(null);
      fetchResources();
      fetchStats();
    } catch (error: any) {
      setError('Failed to delete resource');
    }
  };

  const handleToggleVisibility = async (resource: Resource) => {
    try {
      const newVisibility = resource.visibility === 'visible' ? 'hidden' : 'visible';
      await api.patch(`/resources/${resource._id}/visibility`, {
        visibility: newVisibility
      });
      setSuccess(`Resource ${newVisibility === 'hidden' ? 'hidden' : 'made visible'} successfully`);
      fetchResources();
      fetchStats();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to toggle visibility');
    }
  };

  const handleToggleFeatured = async (resource: Resource) => {
    try {
      await api.patch(`/resources/${resource._id}/featured`, {
        isFeatured: !resource.isFeatured
      });
      setSuccess(`Resource ${!resource.isFeatured ? 'featured' : 'unfeatured'} successfully`);
      fetchResources();
      fetchStats();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to toggle featured status');
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

  const handleFormChange = (field: keyof ResourceFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDocumentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setDocumentFile(file);
      if (file.type === 'application/pdf') {
        setDocumentPreview('/images/pdf-icon.png');
      } else if (file.type.includes('word') || file.type.includes('document')) {
        setDocumentPreview('/images/doc-icon.png');
      } else {
        setDocumentPreview('/images/file-icon.png');
      }
    }
  };

  const handlePreviewImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPreviewImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageFilesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      setImageFiles(files);
      const previews: string[] = [];
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          previews.push(reader.result as string);
          if (previews.length === files.length) {
            setImagePreviews(previews);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'video',
      category: '',
      tags: [],
      youtubeUrl: '',
      isFeatured: false,
      visibility: 'visible'
    });
    setDocumentFile(null);
    setPreviewImageFile(null);
    setImageFiles([]);
    setDocumentPreview(null);
    setPreviewImagePreview(null);
    setImagePreviews([]);
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      type: '',
      category: '',
      status: '',
      visibility: '',
      tag: '',
      author: '',
      featured: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
      page: 1,
      limit: 10
    });
    setSelectedTab('all');
  };

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy');
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
      case 'document': return <Description />;
      case 'image': return <Image />;
      default: return <Description />;
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

  const statCards = [
    {
      title: 'Total Resources',
      value: stats?.totalResources || 0,
      icon: <VideoLibrary sx={{ fontSize: 28 }} />,
      color: theme === 'dark' ? '#00ffff' : '#007bff',
      description: 'All resources'
    },
    {
      title: 'Pending',
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
      title: 'Documents',
      value: stats?.documentResources || 0,
      icon: <Description sx={{ fontSize: 28 }} />,
      color: theme === 'dark' ? '#1976d2' : '#1976d2',
      description: 'Document files'
    }
  ];

  const typeCards = [
    {
      type: 'video',
      title: 'Video Resources',
      count: stats?.videoResources || 0,
      icon: <YouTube sx={{ fontSize: 32 }} />,
      color: '#ff0000',
      description: 'YouTube videos'
    },
    {
      type: 'document',
      title: 'Documents',
      count: stats?.documentResources || 0,
      icon: <PictureAsPdf sx={{ fontSize: 32 }} />,
      color: '#1976d2',
      description: 'PDF & Document files'
    },
    {
      type: 'image',
      title: 'Image Galleries',
      count: stats?.imageResources || 0,
      icon: <InsertPhoto sx={{ fontSize: 32 }} />,
      color: '#2e7d32',
      description: 'Image collections'
    }
  ];

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
                Resource Management
              </Typography>
              <Typography variant={isMobile ? "body2" : "body1"} color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                Manage video, document, and image resources
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
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(4, 1fr)'
              },
              gap: 2,
              mb: 4
            }}>
              {statCards.map((stat, index) => (
                <Card 
                  key={index}
                  sx={{ 
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

          {/* Resource Type Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ 
                mb: 2,
                color: theme === 'dark' ? '#ccd6f6' : '#333333',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <Category /> Resource Types
              </Typography>
              <Box sx={{ 
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(3, 1fr)'
                },
                gap: 2
              }}>
                {typeCards.map((typeCard, index) => (
                  <Card 
                    key={index}
                    sx={{ 
                      borderRadius: 2,
                      boxShadow: theme === 'dark' 
                        ? '0 2px 8px rgba(0,0,0,0.3)' 
                        : '0 2px 8px rgba(0,0,0,0.1)',
                      backgroundColor: theme === 'dark' ? '#0f172a80' : 'white',
                      backdropFilter: theme === 'dark' ? 'blur(10px)' : 'none',
                      cursor: 'pointer',
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: theme === 'dark' 
                          ? '0 4px 12px rgba(0,0,0,0.4)' 
                          : '0 4px 12px rgba(0,0,0,0.15)'
                      }
                    }}
                    onClick={() => {
                      handleFilterChange('type', typeCard.type);
                      setSelectedTab(typeCard.type);
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Box sx={{ 
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 56,
                          height: 56,
                          borderRadius: '50%',
                          bgcolor: theme === 'dark' ? `${typeCard.color}20` : `${typeCard.color}10`,
                          mr: 2
                        }}>
                          <Box sx={{ color: typeCard.color }}>
                            {typeCard.icon}
                          </Box>
                        </Box>
                        <Box>
                          <Typography variant="h3" sx={{ 
                            fontWeight: 'bold', 
                            color: theme === 'dark' ? '#ccd6f6' : '#333333'
                          }}>
                            {typeCard.count}
                          </Typography>
                          <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                            {typeCard.title}
                          </Typography>
                        </Box>
                      </Box>
                      <Typography variant="body2" color={theme === 'dark' ? '#94a3b8' : '#999999'}>
                        {typeCard.description}
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </Box>
          </motion.div>

          {/* Filter and Action Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
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
                    <VideoLibrary /> All Resources
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
                      New Resource
                    </Button>
                  </Box>
                </Box>
                
                {/* Tabs */}
                <Box sx={{ mb: 3 }}>
                  <Tabs 
                    value={selectedTab}
                    onChange={(e, newValue) => {
                      setSelectedTab(newValue);
                      handleFilterChange('type', newValue === 'all' ? '' : newValue);
                    }}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{
                      '& .MuiTab-root': {
                        color: theme === 'dark' ? '#a8b2d1' : '#666666',
                        '&.Mui-selected': {
                          color: theme === 'dark' ? '#00ffff' : '#007bff',
                        }
                      },
                      '& .MuiTabs-indicator': {
                        backgroundColor: theme === 'dark' ? '#00ffff' : '#007bff',
                      }
                    }}
                  >
                    <Tab label="All Resources" value="all" />
                    <Tab label="Videos" value="video" />
                    <Tab label="Documents" value="document" />
                    <Tab label="Images" value="image" />
                    <Tab label="Pending" value="pending" />
                    <Tab label="Featured" value="featured" />
                  </Tabs>
                </Box>
                
                {/* Filter Controls */}
                <Box sx={{ 
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(2, 1fr)',
                    md: 'repeat(4, 1fr)'
                  },
                  gap: 2
                }}>
                  <TextField
                    fullWidth
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
                    sx={textFieldStyle}
                  />
                  
                  <FormControl fullWidth size="small">
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
                  
                  <FormControl fullWidth size="small">
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
                  
                  <FormControl fullWidth size="small">
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
                  
                  <FormControl fullWidth size="small">
                    <InputLabel sx={{ color: theme === 'dark' ? '#a8b2d1' : '#666666' }}>Visibility</InputLabel>
                    <Select
                      value={filters.visibility}
                      label="Visibility"
                      onChange={(e) => handleFilterChange('visibility', e.target.value)}
                      sx={selectStyle}
                    >
                      <MenuItem value="">All Visibility</MenuItem>
                      <MenuItem value="visible">Visible</MenuItem>
                      <MenuItem value="hidden">Hidden</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl fullWidth size="small">
                    <InputLabel sx={{ color: theme === 'dark' ? '#a8b2d1' : '#666666' }}>Author</InputLabel>
                    <Select
                      value={filters.author}
                      label="Author"
                      onChange={(e) => handleFilterChange('author', e.target.value)}
                      sx={selectStyle}
                    >
                      <MenuItem value="">All Authors</MenuItem>
                      {filterOptions.authors.map((author) => (
                        <MenuItem key={author._id} value={author._id}>
                          <Typography variant="body2" color={theme === 'dark' ? '#ccd6f6' : '#333333'}>
                            {author.firstName} {author.lastName}
                          </Typography>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl fullWidth size="small">
                    <InputLabel sx={{ color: theme === 'dark' ? '#a8b2d1' : '#666666' }}>Featured</InputLabel>
                    <Select
                      value={filters.featured}
                      label="Featured"
                      onChange={(e) => handleFilterChange('featured', e.target.value)}
                      sx={selectStyle}
                    >
                      <MenuItem value="">All</MenuItem>
                      <MenuItem value="true">Featured</MenuItem>
                      <MenuItem value="false">Not Featured</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl fullWidth size="small">
                    <InputLabel sx={{ color: theme === 'dark' ? '#a8b2d1' : '#666666' }}>Per Page</InputLabel>
                    <Select
                      value={filters.limit}
                      label="Per Page"
                      onChange={(e) => handleFilterChange('limit', Number(e.target.value))}
                      sx={selectStyle}
                    >
                      <MenuItem value={10}>10</MenuItem>
                      <MenuItem value={25}>25</MenuItem>
                      <MenuItem value={50}>50</MenuItem>
                      <MenuItem value={100}>100</MenuItem>
                    </Select>
                  </FormControl>
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
              transition={{ duration: 0.5, delay: 0.4 }}
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
                          Type/Status
                        </TableCell>
                        <TableCell sx={{ 
                          color: 'white', 
                          fontWeight: 'bold',
                          fontSize: '0.875rem',
                          py: 2
                        }}>
                          Category/Visibility
                        </TableCell>
                        <TableCell sx={{ 
                          color: 'white', 
                          fontWeight: 'bold',
                          fontSize: '0.875rem',
                          py: 2
                        }}>
                          Stats
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
                                backgroundColor: theme === 'dark' ? '#334155' : '#e5e7eb'
                              }}>
                                {/* Show preview image for documents, first image for galleries, or thumbnail for videos */}
                                {resource.type === 'document' && getDocumentImageUrl(resource) ? (
                                  <img 
                                    src={getDocumentImageUrl(resource)} 
                                    alt={resource.title}
                                    style={{ 
                                      width: '100%', 
                                      height: '100%', 
                                      objectFit: 'cover' 
                                    }}
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.onerror = null;
                                      target.parentElement!.innerHTML = `
                                        <div style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%;">
                                          <Description style="color: ${getTypeColor(resource.type)}" />
                                        </div>
                                      `;
                                    }}
                                  />
                                ) : resource.type === 'image' && getGalleryImageUrl(resource) ? (
                                  <img 
                                    src={getGalleryImageUrl(resource)} 
                                    alt={resource.title}
                                    style={{ 
                                      width: '100%', 
                                      height: '100%', 
                                      objectFit: 'cover' 
                                    }}
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.onerror = null;
                                      target.parentElement!.innerHTML = `
                                        <div style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%;">
                                          <Image style="color: ${getTypeColor(resource.type)}" />
                                        </div>
                                      `;
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
                                      target.parentElement!.innerHTML = `
                                        <div style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%;">
                                          <YouTube style="color: ${getTypeColor(resource.type)}" />
                                        </div>
                                      `;
                                    }}
                                  />
                                ) : (
                                  <Box sx={{ color: getTypeColor(resource.type) }}>
                                    {getTypeIcon(resource.type)}
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
                                label={getStatusText(resource.status)}
                                size="small"
                                icon={getStatusIcon(resource.status)}
                                color={getStatusColor(resource.status)}
                                sx={{ height: 22, fontSize: '0.7rem' }}
                              />
                              {resource.isFeatured && (
                                <Chip
                                  label="Featured"
                                  size="small"
                                  icon={<Star fontSize="small" />}
                                  sx={{ 
                                    height: 22,
                                    fontSize: '0.7rem',
                                    backgroundColor: theme === 'dark' ? '#ffcc00' : '#ffcc00',
                                    color: theme === 'dark' ? '#0a192f' : '#333333'
                                  }}
                                />
                              )}
                            </Stack>
                          </TableCell>
                          <TableCell sx={{ py: 2.5 }}>
                            <Stack spacing={0.5}>
                              <Chip
                                label={resource.category}
                                size="small"
                                sx={{ 
                                  height: 22,
                                  fontSize: '0.7rem',
                                  backgroundColor: theme === 'dark' ? '#334155' : '#e5e7eb'
                                }}
                              />
                              <Chip
                                label={resource.visibility === 'visible' ? 'Visible' : 'Hidden'}
                                size="small"
                                icon={resource.visibility === 'visible' ? <Visibility fontSize="small" /> : <VisibilityOff fontSize="small" />}
                                color={resource.visibility === 'visible' ? 'success' : 'default'}
                                sx={{ height: 22, fontSize: '0.7rem' }}
                              />
                            </Stack>
                          </TableCell>
                          <TableCell sx={{ py: 2.5 }}>
                            <Stack spacing={0.5}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Visibility fontSize="small" sx={{ fontSize: '0.9rem', color: theme === 'dark' ? '#a8b2d1' : '#666666' }} />
                                <Typography variant="body2" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                                  {resource.viewsCount} views
                                </Typography>
                              </Box>
                              {resource.type === 'document' && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Download fontSize="small" sx={{ fontSize: '0.9rem', color: theme === 'dark' ? '#a8b2d1' : '#666666' }} />
                                  <Typography variant="body2" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                                    {resource.downloadsCount} downloads
                                  </Typography>
                                </Box>
                              )}
                            </Stack>
                          </TableCell>
                          <TableCell sx={{ py: 2.5 }}>
                            <Typography variant="body2" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                              {formatDate(resource.createdAt)}
                            </Typography>
                            <Typography variant="caption" color={theme === 'dark' ? '#94a3b8' : '#999999'}>
                              By {resource.createdBy?.firstName || 'Unknown'}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ py: 2.5 }}>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                              <Tooltip title="View">
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
                              
                              <Tooltip title="Edit">
                                <IconButton
                                  size="small"
                                  onClick={() => handleOpenEditDialog(resource)}
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
                              
                              <Tooltip title={resource.visibility === 'visible' ? 'Hide' : 'Show'}>
                                <IconButton
                                  size="small"
                                  onClick={() => handleToggleVisibility(resource)}
                                  sx={{ 
                                    color: resource.visibility === 'visible' 
                                      ? (theme === 'dark' ? '#ff9900' : '#ff9900')
                                      : (theme === 'dark' ? '#00ffff' : '#007bff'),
                                    '&:hover': {
                                      backgroundColor: theme === 'dark' ? '#ff990020' : '#ff990010'
                                    }
                                  }}
                                >
                                  {resource.visibility === 'visible' ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                </IconButton>
                              </Tooltip>
                              
                              <Tooltip title={resource.isFeatured ? 'Unfeature' : 'Feature'}>
                                <IconButton
                                  size="small"
                                  onClick={() => handleToggleFeatured(resource)}
                                  sx={{ 
                                    color: resource.isFeatured 
                                      ? (theme === 'dark' ? '#ffcc00' : '#ffcc00')
                                      : (theme === 'dark' ? '#a8b2d1' : '#666666'),
                                    '&:hover': {
                                      backgroundColor: theme === 'dark' ? '#ffcc0020' : '#ffcc0010'
                                    }
                                  }}
                                >
                                  <Star fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              
                              <Tooltip title="Delete">
                                <IconButton
                                  size="small"
                                  onClick={() => handleOpenDeleteDialog(resource)}
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
                    <VideoLibrary sx={{ 
                      fontSize: 64, 
                      color: theme === 'dark' ? '#334155' : '#cbd5e1',
                      mb: 2
                    }} />
                    <Typography variant="h6" color={theme === 'dark' ? '#a8b2d1' : '#666666'} sx={{ mb: 1 }}>
                      No resources found
                    </Typography>
                    <Typography variant="body2" color={theme === 'dark' ? '#94a3b8' : '#999999'}>
                      Try adjusting your filters or create a new resource
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

          {/* Create/Edit Resource Dialog */}
          <Dialog 
            open={openCreateDialog || openEditDialog} 
            onClose={() => {
              setOpenCreateDialog(false);
              setOpenEditDialog(false);
              resetForm();
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
                {openEditDialog ? 'Edit Resource' : 'Create New Resource'}
              </Typography>
            </DialogTitle>
            <DialogContent sx={{ p: 3, overflowY: 'auto' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Resource Type Selection */}
                <Box>
                  <FormLabel sx={{ 
                    mb: 2, 
                    display: 'block',
                    color: theme === 'dark' ? '#a8b2d1' : '#666666'
                  }}>
                    Resource Type *
                  </FormLabel>
                  <RadioGroup
                    row
                    value={formData.type}
                    onChange={(e) => handleFormChange('type', e.target.value as 'video' | 'document' | 'image')}
                    sx={{ gap: 2 }}
                  >
                    <FormControlLabel
                      value="video"
                      control={
                        <Radio sx={{
                          color: theme === 'dark' ? '#a8b2d1' : '#666666',
                          '&.Mui-checked': {
                            color: '#ff0000',
                          },
                        }} />
                      }
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <YouTube sx={{ color: '#ff0000' }} />
                          <Typography variant="body2" color={theme === 'dark' ? '#ccd6f6' : '#333333'}>
                            Video (YouTube)
                          </Typography>
                        </Box>
                      }
                    />
                    <FormControlLabel
                      value="document"
                      control={
                        <Radio sx={{
                          color: theme === 'dark' ? '#a8b2d1' : '#666666',
                          '&.Mui-checked': {
                            color: '#1976d2',
                          },
                        }} />
                      }
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Description sx={{ color: '#1976d2' }} />
                          <Typography variant="body2" color={theme === 'dark' ? '#ccd6f6' : '#333333'}>
                            Document
                          </Typography>
                        </Box>
                      }
                    />
                    <FormControlLabel
                      value="image"
                      control={
                        <Radio sx={{
                          color: theme === 'dark' ? '#a8b2d1' : '#666666',
                          '&.Mui-checked': {
                            color: '#2e7d32',
                          },
                        }} />
                      }
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Image sx={{ color: '#2e7d32' }} />
                          <Typography variant="body2" color={theme === 'dark' ? '#ccd6f6' : '#333333'}>
                            Image Gallery
                          </Typography>
                        </Box>
                      }
                    />
                  </RadioGroup>
                </Box>

                {/* Basic Information */}
                <Divider />
                <Typography variant="h6" sx={{ 
                  color: theme === 'dark' ? '#00ffff' : '#007bff', 
                  mb: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <Description /> Basic Information
                </Typography>
                
                <TextField
                  fullWidth
                  label="Title"
                  value={formData.title}
                  onChange={(e) => handleFormChange('title', e.target.value)}
                  required
                  size="small"
                  placeholder="Enter resource title..."
                  helperText="Title should be 5-200 characters"
                  sx={textFieldStyle}
                />
                
                <TextField
                  fullWidth
                  label="Description"
                  value={formData.description}
                  onChange={(e) => handleFormChange('description', e.target.value)}
                  required
                  multiline
                  rows={3}
                  placeholder="Enter resource description..."
                  helperText="Description should be 20-1000 characters"
                  sx={textFieldStyle}
                />
                
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel sx={{ color: theme === 'dark' ? '#a8b2d1' : '#666666' }}>Category *</InputLabel>
                    <Select
                      value={formData.category}
                      label="Category *"
                      onChange={(e) => handleFormChange('category', e.target.value)}
                      sx={selectStyle}
                      required
                    >
                      <MenuItem value="">
                        <Typography variant="body2" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                          Select Category
                        </Typography>
                      </MenuItem>
                      {categories.map((category) => (
                        <MenuItem key={category} value={category}>
                          <Typography variant="body2" color={theme === 'dark' ? '#ccd6f6' : '#333333'}>
                            {category}
                          </Typography>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  
                  <Autocomplete
                    multiple
                    options={tagsOptions}
                    freeSolo
                    value={formData.tags}
                    onChange={(event, newValue) => {
                      handleFormChange('tags', newValue);
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Tags"
                        size="small"
                        placeholder="Add tags..."
                        helperText="Press Enter to add new tags"
                        sx={textFieldStyle}
                      />
                    )}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => {
                        const { key, ...otherProps } = getTagProps({ index });
                        return (
                          <Chip
                            key={key}
                            label={option}
                            size="small"
                            {...otherProps}
                            sx={{
                              height: 24,
                              fontSize: '0.75rem',
                              backgroundColor: theme === 'dark' ? '#334155' : '#e5e7eb',
                              '& .MuiChip-deleteIcon': {
                                fontSize: '0.875rem',
                                color: theme === 'dark' ? '#94a3b8' : '#6b7280'
                              }
                            }}
                          />
                        );
                      })
                    }
                  />
                </Box>

                {/* Type Specific Fields */}
                <Divider />
                <Typography variant="h6" sx={{ 
                  color: theme === 'dark' ? '#00ffff' : '#007bff', 
                  mb: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  {formData.type === 'video' && <YouTube />}
                  {formData.type === 'document' && <Description />}
                  {formData.type === 'image' && <Image />}
                  {formData.type === 'video' ? 'Video Information' : 
                   formData.type === 'document' ? 'Document Information' : 'Image Gallery Information'}
                </Typography>

                {formData.type === 'video' && (
                  <TextField
                    fullWidth
                    label="YouTube URL"
                    value={formData.youtubeUrl}
                    onChange={(e) => handleFormChange('youtubeUrl', e.target.value)}
                    required
                    size="small"
                    placeholder="https://www.youtube.com/watch?v=..."
                    helperText="Enter a valid YouTube video URL"
                    sx={textFieldStyle}
                    InputProps={{
                      startAdornment: (
                        <YouTube sx={{ 
                          color: theme === 'dark' ? '#a8b2d1' : '#666666',
                          mr: 1 
                        }} />
                      ),
                    }}
                  />
                )}

                {formData.type === 'document' && (
                  <>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1, color: theme === 'dark' ? '#a8b2d1' : '#666666' }}>
                        Document File *
                      </Typography>
                      <Box
                        sx={{
                          border: `2px dashed ${theme === 'dark' ? '#334155' : '#e5e7eb'}`,
                          borderRadius: 1,
                          p: 3,
                          textAlign: 'center',
                          backgroundColor: theme === 'dark' ? '#1e293b' : '#f8fafc',
                          cursor: 'pointer',
                          '&:hover': {
                            borderColor: theme === 'dark' ? '#00ffff' : '#007bff',
                            backgroundColor: theme === 'dark' ? '#1e293b' : '#f0f8ff'
                          }
                        }}
                        onClick={() => document.getElementById('document-upload')?.click()}
                      >
                        <CloudUpload sx={{ 
                          fontSize: 48, 
                          color: theme === 'dark' ? '#a8b2d1' : '#666666',
                          mb: 1 
                        }} />
                        <Typography variant="body2" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                          {documentFile ? documentFile.name : 'Click to upload document (PDF, DOCX, etc.)'}
                        </Typography>
                        <Typography variant="caption" color={theme === 'dark' ? '#94a3b8' : '#999999'}>
                          Maximum file size: 10MB
                        </Typography>
                        <input
                          id="document-upload"
                          type="file"
                          hidden
                          accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
                          onChange={handleDocumentChange}
                        />
                      </Box>
                    </Box>
                    
                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 1, color: theme === 'dark' ? '#a8b2d1' : '#666666' }}>
                        Preview Image *
                      </Typography>
                      <Box
                        sx={{
                          border: `2px dashed ${theme === 'dark' ? '#334155' : '#e5e7eb'}`,
                          borderRadius: 1,
                          p: 3,
                          textAlign: 'center',
                          backgroundColor: theme === 'dark' ? '#1e293b' : '#f8fafc',
                          cursor: 'pointer',
                          '&:hover': {
                            borderColor: theme === 'dark' ? '#00ffff' : '#007bff',
                            backgroundColor: theme === 'dark' ? '#1e293b' : '#f0f8ff'
                          }
                        }}
                        onClick={() => document.getElementById('preview-image-upload')?.click()}
                      >
                        {previewImagePreview ? (
                          <Box sx={{ position: 'relative', width: '100%', maxWidth: 200, margin: '0 auto' }}>
                            <img 
                              src={previewImagePreview} 
                              alt="Preview"
                              style={{ 
                                width: '100%', 
                                height: 'auto', 
                                borderRadius: 4 
                              }}
                            />
                          </Box>
                        ) : (
                          <>
                            <CloudUpload sx={{ 
                              fontSize: 48, 
                              color: theme === 'dark' ? '#a8b2d1' : '#666666',
                              mb: 1 
                            }} />
                            <Typography variant="body2" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                              Click to upload preview image
                            </Typography>
                            <Typography variant="caption" color={theme === 'dark' ? '#94a3b8' : '#999999'}>
                              Recommended: 800x600px
                            </Typography>
                          </>
                        )}
                        <input
                          id="preview-image-upload"
                          type="file"
                          hidden
                          accept="image/*"
                          onChange={handlePreviewImageChange}
                        />
                      </Box>
                    </Box>
                  </>
                )}

                {formData.type === 'image' && (
                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 1, color: theme === 'dark' ? '#a8b2d1' : '#666666' }}>
                      Gallery Images * (At least one required)
                    </Typography>
                    <Box
                      sx={{
                        border: `2px dashed ${theme === 'dark' ? '#334155' : '#e5e7eb'}`,
                        borderRadius: 1,
                        p: 3,
                        textAlign: 'center',
                        backgroundColor: theme === 'dark' ? '#1e293b' : '#f8fafc',
                        cursor: 'pointer',
                        '&:hover': {
                          borderColor: theme === 'dark' ? '#00ffff' : '#007bff',
                          backgroundColor: theme === 'dark' ? '#1e293b' : '#f0f8ff'
                        }
                      }}
                      onClick={() => document.getElementById('gallery-upload')?.click()}
                    >
                      <CloudUpload sx={{ 
                        fontSize: 48, 
                        color: theme === 'dark' ? '#a8b2d1' : '#666666',
                        mb: 1 
                      }} />
                      <Typography variant="body2" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                        Click to upload images (Multiple allowed)
                      </Typography>
                      <Typography variant="caption" color={theme === 'dark' ? '#94a3b8' : '#999999'}>
                        Maximum 10 images, 5MB each
                      </Typography>
                      <input
                        id="gallery-upload"
                        type="file"
                        hidden
                        multiple
                        accept="image/*"
                        onChange={handleImageFilesChange}
                      />
                    </Box>
                    
                    {/* Image Previews */}
                    {imagePreviews.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                          Selected images ({imagePreviews.length}):
                        </Typography>
                        <Box sx={{ 
                          display: 'flex', 
                          flexWrap: 'wrap', 
                          gap: 1,
                          mt: 1 
                        }}>
                          {imagePreviews.map((preview, index) => (
                            <Box 
                              key={index}
                              sx={{ 
                                width: 80, 
                                height: 80,
                                borderRadius: 1,
                                overflow: 'hidden',
                                position: 'relative'
                              }}
                            >
                              <img 
                                src={preview} 
                                alt={`Preview ${index + 1}`}
                                style={{ 
                                  width: '100%', 
                                  height: '100%', 
                                  objectFit: 'cover' 
                                }}
                              />
                            </Box>
                          ))}
                        </Box>
                      </Box>
                    )}
                  </Box>
                )}

                {/* Settings */}
                <Divider />
                <Typography variant="h6" sx={{ 
                  color: theme === 'dark' ? '#00ffff' : '#007bff', 
                  mb: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <FeaturedPlayList /> Settings
                </Typography>
                
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.isFeatured}
                        onChange={(e) => handleFormChange('isFeatured', e.target.checked)}
                        sx={{
                          color: theme === 'dark' ? '#00ffff' : '#007bff',
                          '&.Mui-checked': {
                            color: theme === 'dark' ? '#00ffff' : '#007bff',
                          },
                        }}
                      />
                    }
                    label="Featured Resource"
                    sx={{
                      color: theme === 'dark' ? '#ccd6f6' : '#333333',
                    }}
                  />
                  
                  <FormControl fullWidth size="small">
                    <InputLabel sx={{ color: theme === 'dark' ? '#a8b2d1' : '#666666' }}>Visibility</InputLabel>
                    <Select
                      value={formData.visibility}
                      label="Visibility"
                      onChange={(e) => handleFormChange('visibility', e.target.value as 'visible' | 'hidden')}
                      sx={selectStyle}
                    >
                      <MenuItem value="visible">Visible</MenuItem>
                      <MenuItem value="hidden">Hidden</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                
                {openEditDialog && (
                  <FormControl fullWidth size="small">
                    <InputLabel sx={{ color: theme === 'dark' ? '#a8b2d1' : '#666666' }}>Status</InputLabel>
                    <Select
                      value={formData.status || 'pending'}
                      label="Status"
                      onChange={(e) => handleFormChange('status', e.target.value as 'pending' | 'approved' | 'rejected')}
                      sx={selectStyle}
                    >
                      <MenuItem value="pending">Pending</MenuItem>
                      <MenuItem value="approved">Approved</MenuItem>
                      <MenuItem value="rejected">Rejected</MenuItem>
                    </Select>
                  </FormControl>
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
                  resetForm();
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
                onClick={openEditDialog ? handleUpdateResource : handleCreateResource}
                variant="contained"
                disabled={!formData.title || !formData.description || !formData.category}
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
                {openEditDialog ? 'Update Resource' : 'Create Resource'}
              </Button>
            </DialogActions>
          </Dialog>

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
                      Resource Details
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
                      <>
                        {/* Preview Image */}
                        {getDocumentImageUrl(selectedResource) && (
                          <Card sx={{ mb: 3 }}>
                            <CardContent sx={{ p: 3 }}>
                              <Typography variant="h6" sx={{ 
                                mb: 2,
                                color: theme === 'dark' ? '#ccd6f6' : '#333333'
                              }}>
                                Document Preview
                              </Typography>
                              <Box sx={{ 
                                width: '100%',
                                maxWidth: 400,
                                height: 200,
                                margin: '0 auto',
                                borderRadius: 2,
                                overflow: 'hidden',
                                backgroundColor: theme === 'dark' ? '#334155' : '#e5e7eb'
                              }}>
                                <img
                                  src={getDocumentImageUrl(selectedResource)}
                                  alt={selectedResource.title}
                                  style={{ 
                                    width: '100%', 
                                    height: '100%', 
                                    objectFit: 'contain' 
                                  }}
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.onerror = null;
                                    target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjIwMCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmaWxsPSIjNjY2Ij5Eb2N1bWVudCBQcmV2aWV3PC90ZXh0Pjwvc3ZnPg==';
                                  }}
                                />
                              </Box>
                              <Button
                                variant="contained"
                                startIcon={<CloudDownload />}
                                href={`/api/resources/${selectedResource._id}/document`}
                                target="_blank"
                                sx={{
                                  mt: 2,
                                  backgroundColor: theme === 'dark' ? '#00ffff' : '#007bff',
                                  color: theme === 'dark' ? '#0a192f' : 'white',
                                  '&:hover': {
                                    backgroundColor: theme === 'dark' ? '#00b3b3' : '#0056b3'
                                  }
                                }}
                              >
                                Download Document
                              </Button>
                            </CardContent>
                          </Card>
                        )}
                      </>
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
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                            gap: 2
                          }}>
                            {selectedResource.imageGallery.map((image, index) => {
                              const imageUrl = getImageDataUrl(image.data, image.contentType);
                              return (
                                <Box 
                                  key={index}
                                  sx={{ 
                                    width: '100%',
                                    height: 150,
                                    borderRadius: 1,
                                    overflow: 'hidden',
                                    backgroundColor: theme === 'dark' ? '#334155' : '#e5e7eb',
                                    cursor: 'pointer',
                                    '&:hover': {
                                      transform: 'scale(1.02)',
                                      transition: 'transform 0.2s'
                                    }
                                  }}
                                >
                                  {imageUrl && (
                                    <img
                                      src={imageUrl}
                                      alt={`${selectedResource.title} - Image ${index + 1}`}
                                      style={{ 
                                        width: '100%', 
                                        height: '100%', 
                                        objectFit: 'cover' 
                                      }}
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.onerror = null;
                                        target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjEwMCIgeT0iNzUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iIGZpbGw9IiM2NjYiPkltYWdlIHt7aW5kZXggKyAxfX08L3RleHQ+PC9zdmc+';
                                      }}
                                    />
                                  )}
                                </Box>
                              );
                            })}
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
                    
                    {/* Stats and Metadata */}
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                      <Box sx={{ flex: 1, minWidth: 200 }}>
                        <Card sx={{ 
                          backgroundColor: theme === 'dark' ? '#1e293b' : '#f8f9fa',
                          border: theme === 'dark' ? '1px solid #334155' : '1px solid #e5e7eb',
                          height: '100%'
                        }}>
                          <CardContent>
                            <Typography variant="subtitle2" sx={{ 
                              mb: 2,
                              color: theme === 'dark' ? '#ccd6f6' : '#333333'
                            }}>
                              Statistics
                            </Typography>
                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                              <Box>
                                <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                                  Views
                                </Typography>
                                <Typography variant="body2" sx={{ color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                                  {selectedResource.viewsCount}
                                </Typography>
                              </Box>
                              {selectedResource.type === 'document' && (
                                <Box>
                                  <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                                    Downloads
                                  </Typography>
                                  <Typography variant="body2" sx={{ color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                                    {selectedResource.downloadsCount}
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          </CardContent>
                        </Card>
                      </Box>
                      
                      <Box sx={{ flex: 1, minWidth: 200 }}>
                        <Card sx={{ 
                          backgroundColor: theme === 'dark' ? '#1e293b' : '#f8f9fa',
                          border: theme === 'dark' ? '1px solid #334155' : '1px solid #e5e7eb',
                          height: '100%'
                        }}>
                          <CardContent>
                            <Typography variant="subtitle2" sx={{ 
                              mb: 2,
                              color: theme === 'dark' ? '#ccd6f6' : '#333333'
                            }}>
                              Metadata
                            </Typography>
                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                              <Box>
                                <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                                  Status
                                </Typography>
                                <Chip
                                  label={getStatusText(selectedResource.status)}
                                  size="small"
                                  color={getStatusColor(selectedResource.status)}
                                  sx={{ height: 20, fontSize: '0.7rem' }}
                                />
                              </Box>
                              <Box>
                                <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                                  Visibility
                                </Typography>
                                <Chip
                                  label={selectedResource.visibility === 'visible' ? 'Visible' : 'Hidden'}
                                  size="small"
                                  color={selectedResource.visibility === 'visible' ? 'success' : 'default'}
                                  sx={{ height: 20, fontSize: '0.7rem' }}
                                />
                              </Box>
                              {selectedResource.isFeatured && (
                                <Box>
                                  <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                                    Featured
                                  </Typography>
                                  <Chip
                                    label="Yes"
                                    size="small"
                                    sx={{ 
                                      height: 20,
                                      fontSize: '0.7rem',
                                      backgroundColor: theme === 'dark' ? '#ffcc00' : '#ffcc00'
                                    }}
                                  />
                                </Box>
                              )}
                            </Box>
                          </CardContent>
                        </Card>
                      </Box>
                    </Box>
                    
                    {/* Author and Dates */}
                    <Card sx={{ 
                      backgroundColor: theme === 'dark' ? '#1e293b' : '#f8f9fa',
                      border: theme === 'dark' ? '1px solid #334155' : '1px solid #e5e7eb'
                    }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                          <Box sx={{ flex: 1, minWidth: 250 }}>
                            <Typography variant="subtitle2" sx={{ 
                              mb: 1,
                              color: theme === 'dark' ? '#ccd6f6' : '#333333'
                            }}>
                              Created By
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <SafeAvatar user={selectedResource.createdBy} size={32} />
                              <Box>
                                <Typography variant="body2" sx={{ color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                                  {selectedResource.createdBy?.firstName || 'Unknown'} {selectedResource.createdBy?.lastName || ''}
                                </Typography>
                                <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                                  {selectedResource.createdBy?.email || 'No email provided'}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                          
                          <Box sx={{ flex: 1, minWidth: 250 }}>
                            <Typography variant="subtitle2" sx={{ 
                              mb: 1,
                              color: theme === 'dark' ? '#ccd6f6' : '#333333'
                            }}>
                              Dates
                            </Typography>
                            <Box>
                              <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                                Created: {formatDate(selectedResource.createdAt)}
                              </Typography>
                              <br />
                              <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                                Updated: {formatDate(selectedResource.updatedAt)}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
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
                  <Button 
                    onClick={() => {
                      setOpenViewDialog(false);
                      handleOpenEditDialog(selectedResource);
                    }}
                    variant="contained"
                    sx={{
                      background: theme === 'dark'
                        ? 'linear-gradient(135deg, #00ffff, #00b3b3)'
                        : 'linear-gradient(135deg, #007bff, #0056b3)',
                      borderRadius: 1,
                      '&:hover': {
                        background: theme === 'dark'
                          ? 'linear-gradient(135deg, #00b3b3, #008080)'
                          : 'linear-gradient(135deg, #0056b3, #004080)'
                      }
                    }}
                  >
                    Edit Resource
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
                Are you sure you want to delete resource <strong style={{color: theme === 'dark' ? '#ff0000' : '#dc3545'}}>
                  "{selectedResource?.title}"
                </strong>? This action cannot be undone.
              </Typography>
              {selectedResource?.type === 'document' && (
                <Typography variant="caption" color={theme === 'dark' ? '#94a3b8' : '#999999'} sx={{ display: 'block', mt: 1 }}>
                  Note: The document file and preview image will also be deleted.
                </Typography>
              )}
              {selectedResource?.type === 'image' && (
                <Typography variant="caption" color={theme === 'dark' ? '#94a3b8' : '#999999'} sx={{ display: 'block', mt: 1 }}>
                  Note: All gallery images will also be deleted.
                </Typography>
              )}
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
                onClick={handleDeleteResource} 
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
                Delete Resource
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
    </LocalizationProvider>
  );
};

export default ResourcePage;