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
  Stack, ToggleButton, ToggleButtonGroup,
  Tooltip, Switch
} from '@mui/material';
import { motion } from 'framer-motion';
import { useTheme } from '@/lib/theme-context';
import {
  Article, Edit, Delete, Visibility,
  CalendarToday, Person, Category,
  TrendingUp, FeaturedPlayList,
  Archive, Drafts, Publish,
  Search, Refresh,
  Image as ImageIcon,
  Description,
  AccessTime, RemoveRedEye,
  Star,
  DateRange,
  CloudUpload,
  CheckCircle,
  Cancel,
  HourglassEmpty,
  Add,
  Save,
  Close
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import api from '@/app/utils/api';
import { format, parseISO } from 'date-fns';

import dynamic from 'next/dynamic';
const ReactQuill = dynamic(() => import('react-quill'), { 
  ssr: false,
  loading: () => (
    <div className="h-[300px] bg-gray-100 dark:bg-gray-800 animate-pulse rounded"></div>
  )
});

import 'react-quill/dist/quill.snow.css';

interface Blog {
  _id: string;
  title: string;
  description: string;
  content: string;
  image?: string;
  category: string;
  createdBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
  blogDate: string;
  slug: string;
  status: 'draft' | 'pending' | 'published' | 'archived' | 'rejected';
  tags: string[];
  isFeatured: boolean;
  viewsCount: number;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  readingTime: number;
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

interface BlogStats {
  totalPending: number;
  totalPublished: number;
  totalRejected: number;
  totalDraft: number;
  totalBlogs: number;
  archivedBlogs: number;
  featuredBlogs: number;
  totalViews: number;
  categoryStats: { _id: string; count: number }[];
  statusStats: { _id: string; count: number }[];
  monthlyStats: { _id: { year: number; month: number }; count: number }[];
  topViewedBlogs: { _id: string; title: string; viewsCount: number; slug: string; category: string }[];
  topAuthors: { _id: { _id: string; firstName?: string; lastName?: string; email?: string }; count: number; totalViews: number }[];
}

interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalBlogs: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface FilterOptions {
  categories: string[];
  tags: string[];
  authors: { _id: string; firstName: string; lastName: string; email: string }[];
}

interface BlogFormData {
  title: string;
  description: string;
  content: string;
  category: string;
  tags: string[];
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string[];
  isFeatured: boolean;
  blogDate: Date | null;
}

const categories = [
  'Technology',
  'Science',
  'Health',
  'Education',
  'Business',
  'Entertainment',
  'Sports',
  'Lifestyle',
  'Travel',
  'Food',
  'Politics',
  'Finance',
  'Career',
  'Personal Development',
  'Others'
];

const tagsOptions = [
  'React', 'Node.js', 'TypeScript', 'JavaScript',
  'Web Development', 'Mobile Development', 'AI', 'Machine Learning',
  'Blockchain', 'Cloud Computing', 'DevOps', 'Cybersecurity',
  'Startup', 'Marketing', 'Productivity', 'Design',
  'Data Science', 'Big Data', 'IoT', 'AR/VR'
];

const FormRow = ({ children, columns = 1, spacing = 2 }: { 
  children: React.ReactNode; 
  columns?: number;
  spacing?: number;
}) => {
  const { theme } = useTheme();
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  return (
    <Box sx={{ 
      display: 'grid',
      gridTemplateColumns: { 
        xs: '1fr',
        sm: columns === 1 ? '1fr' : `repeat(${Math.min(columns, 2)}, 1fr)`,
        md: columns === 1 ? '1fr' : `repeat(${Math.min(columns, 3)}, 1fr)`,
        lg: columns === 1 ? '1fr' : `repeat(${columns}, 1fr)`
      },
      gap: spacing,
      mb: 3
    }}>
      {children}
    </Box>
  );
};

const BlogsPage = () => {
  const { theme } = useTheme();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(max-width: 1024px)');
  
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [stats, setStats] = useState<BlogStats | null>(null);
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
    totalBlogs: 0,
    hasNext: false,
    hasPrev: false
  });

  const [filters, setFilters] = useState({
    search: '',
    category: '',
    tag: '',
    author: '',
    status: '',
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
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [content, setContent] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const [formData, setFormData] = useState<BlogFormData>({
    title: '',
    description: '',
    content: '',
    category: '',
    tags: [],
    metaTitle: '',
    metaDescription: '',
    metaKeywords: [],
    isFeatured: false,
    blogDate: null
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
    disabledText: theme === 'dark' ? '#94a3b8' : '#94a3b8',
    tableHeader: theme === 'dark' 
      ? 'linear-gradient(135deg, #00ffff, #00b3b3)' 
      : 'linear-gradient(135deg, #007bff, #0056b3)',
    buttonBg: theme === 'dark' 
      ? 'border-[#00ffff] text-[#00ffff] hover:bg-[#00ffff] hover:text-white' 
      : 'border-[#007bff] text-[#007bff] hover:bg-[#007bff] hover:text-white'
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
    },
    '& .MuiFormHelperText-root': {
      color: theme === 'dark' ? '#ff6b6b' : '#dc3545',
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

  const labelStyle = {
    color: theme === 'dark' ? '#a8b2d1' : '#666666',
    '&.Mui-focused': {
      color: theme === 'dark' ? '#00ffff' : '#007bff',
    }
  };

  const datePickerStyle = {
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

  const quillStyle = {
    '& .ql-toolbar': {
      backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff',
      borderColor: theme === 'dark' ? '#334155' : '#e5e7eb',
      color: theme === 'dark' ? '#ccd6f6' : '#333333',
    },
    '& .ql-container': {
      backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff',
      borderColor: theme === 'dark' ? '#334155' : '#e5e7eb',
      color: theme === 'dark' ? '#ccd6f6' : '#333333',
      height: '300px',
    },
    '& .ql-editor': {
      color: theme === 'dark' ? '#ccd6f6' : '#333333',
    }
  };

  const statCards = [
    {
      title: 'Total Blogs',
      value: stats?.totalBlogs || 0,
      icon: <Article sx={{ fontSize: 28 }} />,
      color: theme === 'dark' ? '#00ffff' : '#007bff',
      description: 'All blogs'
    },
    {
      title: 'Published',
      value: stats?.totalPublished || 0,
      icon: <CheckCircle sx={{ fontSize: 28 }} />,
      color: theme === 'dark' ? '#00ff00' : '#28a745',
      description: 'Approved blogs'
    },
    {
      title: 'Pending',
      value: stats?.totalPending || 0,
      icon: <HourglassEmpty sx={{ fontSize: 28 }} />,
      color: theme === 'dark' ? '#ff9900' : '#ff9900',
      description: 'Awaiting review'
    },
    {
      title: 'Drafts',
      value: stats?.totalDraft || 0,
      icon: <Drafts sx={{ fontSize: 28 }} />,
      color: theme === 'dark' ? '#00ffff' : '#007bff',
      description: 'In progress'
    }
  ];

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'script': 'sub'}, { 'script': 'super' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'direction': 'rtl' }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'font': [] }],
      [{ 'align': [] }],
      ['link', 'image', 'video'],
      ['clean']
    ],
  };

  const fetchBlogs = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await api.get(`/blogs?${params}`);
      setBlogs(response.data.data.blogs || []);
      setPagination(response.data.data.pagination || {
        currentPage: 1,
        totalPages: 1,
        totalBlogs: 0,
        hasNext: false,
        hasPrev: false
      });
      setError('');
    } catch (error: any) {
      console.error('Error fetching blogs:', error);
      setError(error.response?.data?.message || 'Failed to fetch blogs');
      setBlogs([]);
      setPagination({
        currentPage: 1,
        totalPages: 1,
        totalBlogs: 0,
        hasNext: false,
        hasPrev: false
      });
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await api.get('/blogs/stats');
      setStats(response.data.data);
    } catch (error: any) {
      console.error('Failed to fetch stats:', error);
    }
  }, []);

  const fetchFilterOptions = useCallback(async () => {
    try {
      const response = await api.get('/blogs/filter-options');
      setFilterOptions(response.data.data);
    } catch (error: any) {
      console.error('Failed to fetch filter options:', error);
    }
  }, []);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  useEffect(() => {
    fetchStats();
    fetchFilterOptions();
  }, [fetchStats, fetchFilterOptions]);

  const handleOpenCreateDialog = () => {
    resetForm();
    setOpenCreateDialog(true);
  };

  const handleOpenEditDialog = (blog: Blog) => {
    setSelectedBlog(blog);
    setFormData({
      title: blog.title,
      description: blog.description,
      content: blog.content,
      category: blog.category,
      tags: blog.tags || [],
      metaTitle: blog.metaTitle || blog.title,
      metaDescription: blog.metaDescription || blog.description.substring(0, 150),
      metaKeywords: blog.metaKeywords || [],
      isFeatured: blog.isFeatured,
      blogDate: blog.blogDate ? parseISO(blog.blogDate) : null
    });
    setContent(blog.content);
    setImagePreview(blog.image ? getImageUrl(blog.image) : null);
    setImageFile(null);
    setOpenEditDialog(true);
  };

  const handleOpenViewDialog = (blog: Blog) => {
    setSelectedBlog(blog);
    setOpenViewDialog(true);
  };

  const handleOpenDeleteDialog = (blog: Blog) => {
    setSelectedBlog(blog);
    setOpenDeleteDialog(true);
  };

  const handleCreateBlog = async () => {
    try {
      const formDataToSend = new FormData();
      
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('content', content);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('tags', formData.tags.join(','));
      formDataToSend.append('metaTitle', formData.metaTitle);
      formDataToSend.append('metaDescription', formData.metaDescription);
      formDataToSend.append('metaKeywords', formData.metaKeywords.join(','));
      
      if (formData.blogDate) {
        formDataToSend.append('blogDate', formData.blogDate.toISOString());
      }
      
      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }

      await api.post('/blogs', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      setSuccess('Blog created successfully');
      setOpenCreateDialog(false);
      resetForm();
      fetchBlogs();
      fetchStats();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to create blog');
    }
  };

  const handleUpdateBlog = async () => {
    if (!selectedBlog) return;

    try {
      const formDataToSend = new FormData();
      
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('content', content);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('tags', formData.tags.join(','));
      formDataToSend.append('metaTitle', formData.metaTitle);
      formDataToSend.append('metaDescription', formData.metaDescription);
      formDataToSend.append('metaKeywords', formData.metaKeywords.join(','));
      formDataToSend.append('isFeatured', formData.isFeatured.toString());
      
      if (formData.blogDate) {
        formDataToSend.append('blogDate', formData.blogDate.toISOString());
      }
      
      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }

      await api.put(`/blogs/${selectedBlog._id}`, formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      setSuccess('Blog updated successfully');
      setOpenEditDialog(false);
      resetForm();
      fetchBlogs();
      fetchStats();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to update blog');
    }
  };

  const handleDeleteBlog = async () => {
    if (!selectedBlog) return;

    try {
      await api.delete(`/blogs/${selectedBlog._id}`);
      setSuccess('Blog deleted successfully');
      setOpenDeleteDialog(false);
      setSelectedBlog(null);
      fetchBlogs();
      fetchStats();
    } catch (error: any) {
      setError('Failed to delete blog');
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

  const handleFormChange = (field: keyof BlogFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      content: '',
      category: '',
      tags: [],
      metaTitle: '',
      metaDescription: '',
      metaKeywords: [],
      isFeatured: false,
      blogDate: null
    });
    setContent('');
    setImagePreview(null);
    setImageFile(null);
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      category: '',
      tag: '',
      author: '',
      status: '',
      featured: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
      page: 1,
      limit: 10
    });
  };

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy');
    } catch {
      return 'Invalid date';
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
      case 'published': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'error';
      case 'draft': return 'info';
      case 'archived': return 'default';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published': return <CheckCircle fontSize="small" />;
      case 'pending': return <HourglassEmpty fontSize="small" />;
      case 'rejected': return <Cancel fontSize="small" />;
      case 'draft': return <Drafts fontSize="small" />;
      case 'archived': return <Archive fontSize="small" />;
      default: return <Drafts fontSize="small" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'published': return 'Published';
      case 'pending': return 'Pending Review';
      case 'rejected': return 'Rejected';
      case 'draft': return 'Draft';
      case 'archived': return 'Archived';
      default: return status;
    }
  };

  const getImageUrl = (imagePath: string | undefined): string | null => {
    if (!imagePath) return null;
    
    if (imagePath.startsWith('http')) return imagePath;
    
    // Check if it's already a full path
    if (imagePath.startsWith('/uploads')) {
      const serverUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      return `${serverUrl}${imagePath}`;
    }
    
    // Handle relative paths
    const serverUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    return `${serverUrl}/uploads/blogs/${imagePath}`;
  };

  const getAuthorInitials = (author: { firstName?: string; lastName?: string }): string => {
    const first = author?.firstName?.charAt(0) || '';
    const last = author?.lastName?.charAt(0) || '';
    return `${first}${last}`.toUpperCase() || 'A';
  };

  const getAuthorAvatarColor = (authorId: string): string => {
    const colors = ['#1976d2', '#2e7d32', '#ed6c02', '#d32f2f', '#7b1fa2', '#00796b', '#388e3c', '#f57c00', '#0288d1', '#c2185b'];
    const index = authorId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };

  const renderFormSection = (title: string, icon: React.ReactNode, content: React.ReactNode) => (
    <>
      <Typography variant="h6" sx={{ 
        color: theme === 'dark' ? '#00ffff' : '#007bff', 
        mb: 2,
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}>
        {icon} {title}
      </Typography>
      {content}
      <Divider sx={{ my: 3 }} />
    </>
  );

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
                Blog Management
              </Typography>
              <Typography variant={isMobile ? "body2" : "body1"} color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                Create, edit, and manage blog posts
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
                    <Article /> All Blogs
                  </Typography>
                  
                  <Box sx={{ 
                    display: 'flex', 
                    gap: 2,
                    flexDirection: { xs: 'column', sm: 'row' }
                  }}>
                    <ToggleButtonGroup
                      value={viewMode}
                      exclusive
                      onChange={(e, newMode) => newMode && setViewMode(newMode)}
                      size="small"
                      sx={{
                        '& .MuiToggleButton-root': {
                          borderColor: theme === 'dark' ? '#334155' : '#e5e7eb',
                          color: theme === 'dark' ? '#a8b2d1' : '#666666',
                          '&.Mui-selected': {
                            backgroundColor: theme === 'dark' ? '#00ffff20' : '#007bff10',
                            color: theme === 'dark' ? '#00ffff' : '#007bff',
                            borderColor: theme === 'dark' ? '#00ffff' : '#007bff',
                          }
                        }
                      }}
                    >
                      <ToggleButton value="list">
                        List
                      </ToggleButton>
                      <ToggleButton value="grid">
                        Grid
                      </ToggleButton>
                    </ToggleButtonGroup>
                    
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
                      New Blog
                    </Button>
                  </Box>
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
                    label="Search Blogs"
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    placeholder="Title, description, or content..."
                    InputProps={{
                      startAdornment: (
                        <Search sx={{ 
                          color: theme === 'dark' ? '#a8b2d1' : '#666666',
                          mr: 1 
                        }} />
                      ),
                    }}
                    sx={{
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
                      },
                      '& .MuiInputLabel-root': {
                        color: theme === 'dark' ? '#a8b2d1' : '#666666',
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: theme === 'dark' ? '#00ffff' : '#007bff',
                      }
                    }}
                  />
                  
                  <FormControl fullWidth size="small">
                    <InputLabel sx={labelStyle}>Category</InputLabel>
                    <Select
                      value={filters.category}
                      label="Category"
                      onChange={(e) => handleFilterChange('category', e.target.value)}
                      sx={selectStyle}
                    >
                      <MenuItem value="">
                        <Typography variant="body2" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                          All Categories
                        </Typography>
                      </MenuItem>
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
                    <InputLabel sx={labelStyle}>Status</InputLabel>
                    <Select
                      value={filters.status}
                      label="Status"
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                      sx={selectStyle}
                    >
                      <MenuItem value="">All Status</MenuItem>
                      <MenuItem value="pending">Pending</MenuItem>
                      <MenuItem value="published">Published</MenuItem>
                      <MenuItem value="rejected">Rejected</MenuItem>
                      <MenuItem value="draft">Draft</MenuItem>
                      <MenuItem value="archived">Archived</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <FormControl fullWidth size="small">
                    <InputLabel sx={labelStyle}>Author</InputLabel>
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
                    <InputLabel sx={labelStyle}>Featured</InputLabel>
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
                    <InputLabel sx={labelStyle}>Sort By</InputLabel>
                    <Select
                      value={filters.sortBy}
                      label="Sort By"
                      onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                      sx={selectStyle}
                    >
                      <MenuItem value="createdAt">Created Date</MenuItem>
                      <MenuItem value="updatedAt">Updated Date</MenuItem>
                      <MenuItem value="blogDate">Publish Date</MenuItem>
                      <MenuItem value="title">Title</MenuItem>
                      <MenuItem value="viewsCount">Views</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl fullWidth size="small">
                    <InputLabel sx={labelStyle}>Order</InputLabel>
                    <Select
                      value={filters.sortOrder}
                      label="Order"
                      onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                      sx={selectStyle}
                    >
                      <MenuItem value="desc">Descending</MenuItem>
                      <MenuItem value="asc">Ascending</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl fullWidth size="small">
                    <InputLabel sx={labelStyle}>Per Page</InputLabel>
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

          {/* Blogs List - Removed status update buttons */}
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
              {viewMode === 'grid' ? (
                /* Grid View */
                <Box sx={{ 
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(2, 1fr)',
                    md: 'repeat(3, 1fr)',
                    lg: 'repeat(4, 1fr)'
                  },
                  gap: 3
                }}>
                  {blogs.map((blog) => {
                    const imageUrl = getImageUrl(blog.image);
                    
                    return (
                      <Card 
                        key={blog._id}
                        sx={{ 
                          height: '100%',
                          borderRadius: 2,
                          boxShadow: theme === 'dark' 
                            ? '0 2px 8px rgba(0,0,0,0.3)' 
                            : '0 2px 8px rgba(0,0,0,0.1)',
                          border: theme === 'dark' 
                            ? '1px solid #334155' 
                            : '1px solid #e5e7eb',
                          backgroundColor: theme === 'dark' ? '#0f172a80' : 'white',
                          backdropFilter: theme === 'dark' ? 'blur(10px)' : 'none',
                          display: 'flex',
                          flexDirection: 'column',
                          transition: 'transform 0.2s, box-shadow 0.2s',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: theme === 'dark' 
                              ? '0 8px 24px rgba(0, 255, 255, 0.2)' 
                              : '0 8px 24px rgba(37, 99, 235, 0.2)'
                          }
                        }}
                      >
                        {/* Blog Image */}
                        <Box sx={{ 
                          position: 'relative',
                          height: 160,
                          overflow: 'hidden',
                          borderTopLeftRadius: 8,
                          borderTopRightRadius: 8
                        }}>
                          {imageUrl ? (
                            <img 
                              src={imageUrl} 
                              alt={blog.title}
                              style={{ 
                                width: '100%', 
                                height: '100%', 
                                objectFit: 'cover' 
                              }}
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.onerror = null;
                                target.src = '/api/placeholder/400/200';
                              }}
                            />
                          ) : (
                            <Box sx={{ 
                              width: '100%', 
                              height: '100%', 
                              backgroundColor: theme === 'dark' ? '#334155' : '#e5e7eb',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              <Article sx={{ 
                                fontSize: 48, 
                                color: theme === 'dark' ? '#a8b2d1' : '#94a3b8' 
                              }} />
                            </Box>
                          )}
                          
                          {/* Status Badge */}
                          <Chip
                            label={getStatusText(blog.status)}
                            size="small"
                            icon={getStatusIcon(blog.status)}
                            color={getStatusColor(blog.status)}
                            sx={{ 
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              height: 24,
                              fontSize: '0.7rem'
                            }}
                          />
                          
                          {/* Featured Badge */}
                          {blog.isFeatured && (
                            <Chip
                              label="Featured"
                              size="small"
                              icon={<Star fontSize="small" />}
                              sx={{ 
                                position: 'absolute',
                                top: 8,
                                left: 8,
                                height: 24,
                                fontSize: '0.7rem',
                                backgroundColor: theme === 'dark' ? '#ffcc00' : '#ffcc00',
                                color: theme === 'dark' ? '#0a192f' : '#333333'
                              }}
                            />
                          )}
                        </Box>
                        
                        <CardContent sx={{ p: 2, flexGrow: 1 }}>
                          {/* Category */}
                          <Chip
                            label={blog.category}
                            size="small"
                            sx={{ 
                              mb: 1.5,
                              height: 20,
                              fontSize: '0.65rem',
                              backgroundColor: theme === 'dark' ? '#334155' : '#e5e7eb'
                            }}
                          />
                          
                          {/* Title */}
                          <Typography 
                            variant="subtitle1" 
                            sx={{ 
                              fontWeight: 'bold',
                              color: theme === 'dark' ? '#ccd6f6' : '#333333',
                              mb: 1,
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              lineHeight: 1.3
                            }}
                          >
                            {blog.title}
                          </Typography>
                          
                          {/* Description */}
                          <Typography 
                            variant="body2" 
                            color={theme === 'dark' ? '#a8b2d1' : '#666666'}
                            sx={{ 
                              mb: 2,
                              display: '-webkit-box',
                              WebkitLineClamp: 3,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              fontSize: '0.8rem'
                            }}
                          >
                            {blog.description}
                          </Typography>
                          
                          {/* Stats */}
                          <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mt: 'auto',
                            pt: 1,
                            borderTop: theme === 'dark' ? '1px solid #334155' : '1px solid #e5e7eb'
                          }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Avatar
                                sx={{ 
                                  width: 24, 
                                  height: 24,
                                  fontSize: '0.75rem',
                                  bgcolor: getAuthorAvatarColor(blog.createdBy._id)
                                }}
                              >
                                {getAuthorInitials(blog.createdBy)}
                              </Avatar>
                              <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                                {blog.createdBy.firstName}
                              </Typography>
                            </Box>
                            
                            <Box sx={{ display: 'flex', gap: 1.5 }}>
                              <Tooltip title="Views">
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <RemoveRedEye fontSize="small" sx={{ fontSize: '0.9rem', color: theme === 'dark' ? '#a8b2d1' : '#666666' }} />
                                  <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                                    {blog.viewsCount}
                                  </Typography>
                                </Box>
                              </Tooltip>
                              
                              <Tooltip title="Reading Time">
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <AccessTime fontSize="small" sx={{ fontSize: '0.9rem', color: theme === 'dark' ? '#a8b2d1' : '#666666' }} />
                                  <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                                    {blog.readingTime}m
                                  </Typography>
                                </Box>
                              </Tooltip>
                            </Box>
                          </Box>
                        </CardContent>
                        
                        {/* Action Buttons - Only View, Edit, Delete */}
                        <Box sx={{ 
                          p: 2, 
                          pt: 0,
                          display: 'flex', 
                          gap: 1,
                          borderTop: theme === 'dark' ? '1px solid #334155' : '1px solid #e5e7eb'
                        }}>
                          <Button
                            size="small"
                            fullWidth
                            variant="outlined"
                            startIcon={<Visibility fontSize="small" />}
                            onClick={() => handleOpenViewDialog(blog)}
                            sx={{
                              borderRadius: 1,
                              borderColor: theme === 'dark' ? '#00ffff' : '#007bff',
                              color: theme === 'dark' ? '#00ffff' : '#007bff',
                              fontSize: '0.75rem',
                              py: 0.5,
                              '&:hover': {
                                backgroundColor: theme === 'dark' ? '#00ffff20' : '#007bff10'
                              }
                            }}
                          >
                            View
                          </Button>
                          <Button
                            size="small"
                            fullWidth
                            variant="outlined"
                            startIcon={<Edit fontSize="small" />}
                            onClick={() => handleOpenEditDialog(blog)}
                            sx={{
                              borderRadius: 1,
                              borderColor: theme === 'dark' ? '#00ff00' : '#28a745',
                              color: theme === 'dark' ? '#00ff00' : '#28a745',
                              fontSize: '0.75rem',
                              py: 0.5,
                              '&:hover': {
                                backgroundColor: theme === 'dark' ? '#00ff0020' : '#28a74510'
                              }
                            }}
                          >
                            Edit
                          </Button>
                        </Box>
                      </Card>
                    );
                  })}
                </Box>
              ) : (
                /* Table View */
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
                            Blog
                          </TableCell>
                          <TableCell sx={{ 
                            color: 'white', 
                            fontWeight: 'bold',
                            fontSize: '0.875rem',
                            py: 2
                          }}>
                            Category/Status
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
                        {blogs.map((blog) => {
                          const imageUrl = getImageUrl(blog.image);
                          
                          return (
                            <TableRow 
                              key={blog._id} 
                              hover
                              sx={{ 
                                '&:hover': {
                                  backgroundColor: theme === 'dark' ? '#1e293b' : '#f8fafc'
                                }
                              }}
                            >
                              <TableCell sx={{ py: 2.5 }}>
                                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                                  {imageUrl ? (
                                    <Box sx={{ 
                                      width: 60, 
                                      height: 40,
                                      borderRadius: 1,
                                      overflow: 'hidden',
                                      flexShrink: 0
                                    }}>
                                      <img 
                                        src={imageUrl} 
                                        alt={blog.title}
                                        style={{ 
                                          width: '100%', 
                                          height: '100%', 
                                          objectFit: 'cover' 
                                        }}
                                        onError={(e) => {
                                          const target = e.target as HTMLImageElement;
                                          target.onerror = null;
                                          target.src = '/api/placeholder/60/40';
                                        }}
                                      />
                                    </Box>
                                  ) : (
                                    <Box sx={{ 
                                      width: 60, 
                                      height: 40,
                                      borderRadius: 1,
                                      backgroundColor: theme === 'dark' ? '#334155' : '#e5e7eb',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      flexShrink: 0
                                    }}>
                                      <Article sx={{ 
                                        fontSize: 20, 
                                        color: theme === 'dark' ? '#a8b2d1' : '#94a3b8' 
                                      }} />
                                    </Box>
                                  )}
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
                                      {blog.title}
                                    </Typography>
                                    <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                                      {blog.description.substring(0, 60)}...
                                    </Typography>
                                  </Box>
                                </Box>
                              </TableCell>
                              <TableCell sx={{ py: 2.5 }}>
                                <Stack spacing={0.5}>
                                  <Chip
                                    label={blog.category}
                                    size="small"
                                    sx={{ 
                                      height: 22,
                                      fontSize: '0.7rem',
                                      backgroundColor: theme === 'dark' ? '#334155' : '#e5e7eb'
                                    }}
                                  />
                                  <Chip
                                    label={getStatusText(blog.status)}
                                    size="small"
                                    icon={getStatusIcon(blog.status)}
                                    color={getStatusColor(blog.status)}
                                    sx={{ height: 22, fontSize: '0.7rem' }}
                                  />
                                  {blog.isFeatured && (
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
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Avatar
                                    sx={{ 
                                      width: 32, 
                                      height: 32,
                                      fontSize: '0.875rem',
                                      bgcolor: getAuthorAvatarColor(blog.createdBy._id)
                                    }}
                                  >
                                    {getAuthorInitials(blog.createdBy)}
                                  </Avatar>
                                  <Box>
                                    <Typography variant="body2" sx={{ fontWeight: 'medium', color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                                      {blog.createdBy.firstName} {blog.createdBy.lastName}
                                    </Typography>
                                    <Typography variant="caption" color={theme === 'dark' ? '#94a3b8' : '#999999'}>
                                      {blog.createdBy.email}
                                    </Typography>
                                  </Box>
                                </Box>
                              </TableCell>
                              <TableCell sx={{ py: 2.5 }}>
                                <Stack spacing={0.5}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <RemoveRedEye fontSize="small" sx={{ fontSize: '0.9rem', color: theme === 'dark' ? '#a8b2d1' : '#666666' }} />
                                    <Typography variant="body2" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                                      {blog.viewsCount} views
                                    </Typography>
                                  </Box>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <AccessTime fontSize="small" sx={{ fontSize: '0.9rem', color: theme === 'dark' ? '#a8b2d1' : '#666666' }} />
                                    <Typography variant="body2" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                                      {blog.readingTime} min read
                                    </Typography>
                                  </Box>
                                </Stack>
                              </TableCell>
                              <TableCell sx={{ py: 2.5 }}>
                                <Typography variant="body2" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                                  {formatDate(blog.createdAt)}
                                </Typography>
                                <Typography variant="caption" color={theme === 'dark' ? '#94a3b8' : '#999999'}>
                                  {blog.status === 'pending' ? 'Awaiting review' : 
                                   blog.approvedAt ? `Approved: ${formatDate(blog.approvedAt)}` : ''}
                                </Typography>
                              </TableCell>
                              <TableCell sx={{ py: 2.5 }}>
                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleOpenViewDialog(blog)}
                                    sx={{ 
                                      color: theme === 'dark' ? '#00ffff' : '#007bff',
                                      '&:hover': {
                                        backgroundColor: theme === 'dark' ? '#00ffff20' : '#007bff10'
                                      }
                                    }}
                                  >
                                    <Visibility fontSize="small" />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleOpenEditDialog(blog)}
                                    sx={{ 
                                      color: theme === 'dark' ? '#00ff00' : '#28a745',
                                      '&:hover': {
                                        backgroundColor: theme === 'dark' ? '#00ff0020' : '#28a74510'
                                      }
                                    }}
                                  >
                                    <Edit fontSize="small" />
                                  </IconButton>
                                  
                                  <IconButton
                                    size="small"
                                    onClick={() => handleOpenDeleteDialog(blog)}
                                    sx={{ 
                                      color: theme === 'dark' ? '#ff0000' : '#dc3545',
                                      '&:hover': {
                                        backgroundColor: theme === 'dark' ? '#ff000020' : '#dc354510'
                                      }
                                    }}
                                  >
                                    <Delete fontSize="small" />
                                  </IconButton>
                                </Box>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  {blogs.length === 0 && !loading && (
                    <Box sx={{ 
                      textAlign: 'center', 
                      py: 8,
                      px: 2
                    }}>
                      <Article sx={{ 
                        fontSize: 64, 
                        color: theme === 'dark' ? '#334155' : '#cbd5e1',
                        mb: 2
                      }} />
                      <Typography variant="h6" color={theme === 'dark' ? '#a8b2d1' : '#666666'} sx={{ mb: 1 }}>
                        No blogs found
                      </Typography>
                      <Typography variant="body2" color={theme === 'dark' ? '#94a3b8' : '#999999'}>
                        Try adjusting your filters or create a new blog
                      </Typography>
                    </Box>
                  )}
                </Card>
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
                    Showing {((filters.page - 1) * filters.limit) + 1} to {Math.min(filters.page * filters.limit, pagination.totalBlogs)} of {pagination.totalBlogs} blogs
                  </Typography>
                </Box>
              )}
            </motion.div>
          )}

          {/* Create/Edit Blog Dialog - REMOVED STATUS FIELD */}
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
                {openEditDialog ? 'Edit Blog' : 'Create New Blog'}
              </Typography>
            </DialogTitle>
            <DialogContent sx={{ p: 3, overflowY: 'auto' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Image Upload */}
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <Box sx={{ position: 'relative', width: '100%', maxWidth: 400 }}>
                    <Box
                      sx={{
                        width: '100%',
                        height: 200,
                        borderRadius: 2,
                        overflow: 'hidden',
                        border: `2px dashed ${theme === 'dark' ? '#334155' : '#e5e7eb'}`,
                        backgroundColor: theme === 'dark' ? '#1e293b' : '#f8fafc',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        '&:hover': {
                          borderColor: theme === 'dark' ? '#00ffff' : '#007bff',
                          backgroundColor: theme === 'dark' ? '#1e293b' : '#f0f8ff'
                        }
                      }}
                      onClick={() => document.getElementById('blog-image-upload')?.click()}
                    >
                      {imagePreview ? (
                        <img 
                          src={imagePreview} 
                          alt="Blog preview"
                          style={{ 
                            width: '100%', 
                            height: '100%', 
                            objectFit: 'cover' 
                          }}
                        />
                      ) : (
                        <Stack alignItems="center" spacing={1}>
                          <CloudUpload sx={{ 
                            fontSize: 48, 
                            color: theme === 'dark' ? '#a8b2d1' : '#666666' 
                          }} />
                          <Typography variant="body2" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                            Click to upload blog image
                          </Typography>
                          <Typography variant="caption" color={theme === 'dark' ? '#94a3b8' : '#999999'}>
                            Recommended: 1200x630px
                          </Typography>
                        </Stack>
                      )}
                    </Box>
                    <input
                      id="blog-image-upload"
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                    {imagePreview && (
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        onClick={() => {
                          setImagePreview(null);
                          setImageFile(null);
                        }}
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          minWidth: 'auto',
                          padding: '4px 8px'
                        }}
                      >
                        Remove
                      </Button>
                    )}
                  </Box>
                </Box>

                {/* Basic Information Section */}
                {renderFormSection(
                  "Basic Information",
                  <Article />,
                  <>
                    <FormRow columns={1}>
                      <TextField
                        fullWidth
                        label="Blog Title"
                        value={formData.title}
                        onChange={(e) => handleFormChange('title', e.target.value)}
                        required
                        size="small"
                        placeholder="Enter blog title..."
                        helperText="Title should be 10-200 characters"
                        sx={textFieldStyle}
                      />
                    </FormRow>

                    <FormRow columns={1}>
                      <TextField
                        fullWidth
                        label="Description"
                        value={formData.description}
                        onChange={(e) => handleFormChange('description', e.target.value)}
                        required
                        multiline
                        rows={3}
                        placeholder="Enter blog description..."
                        helperText="Description should be 50-500 characters"
                        sx={textFieldStyle}
                      />
                    </FormRow>

                    <FormRow columns={isMobile ? 1 : 2}>
                      <FormControl fullWidth size="small">
                        <InputLabel sx={labelStyle}>Category *</InputLabel>
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
                      
                      <DatePicker
                        label="Publish Date"
                        value={formData.blogDate}
                        onChange={(date) => handleFormChange('blogDate', date)}
                        slotProps={{ 
                          textField: { 
                            fullWidth: true, 
                            size: 'small',
                            sx: datePickerStyle
                          } 
                        }}
                      />
                    </FormRow>

                    <FormRow columns={1}>
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
                          value.map((option, index) => (
                            <Chip
                              label={option}
                              size="small"
                              {...getTagProps({ index })}
                              sx={{
                                height: 24,
                                fontSize: '0.75rem',
                                backgroundColor: theme === 'dark' ? '#334155' : '#e5e7eb'
                              }}
                            />
                          ))
                        }
                      />
                    </FormRow>
                  </>
                )}

                {/* Content Section */}
                {renderFormSection(
                  "Content",
                  <Description />,
                  <>
                    <Typography variant="body2" color={theme === 'dark' ? '#a8b2d1' : '#666666'} sx={{ mb: 1 }}>
                      Blog Content
                    </Typography>
                    <Box sx={quillStyle}>
                      <ReactQuill
                        theme="snow"
                        value={content}
                        onChange={setContent}
                        modules={quillModules}
                        style={{ 
                          height: '300px',
                          marginBottom: '50px'
                        }}
                      />
                    </Box>
                  </>
                )}

                {/* Settings Section - REMOVED STATUS FIELD */}
                {renderFormSection(
                  "Settings",
                  <FeaturedPlayList />,
                  <>
                    <FormRow columns={1}>
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
                        label="Featured Blog"
                        sx={{
                          color: theme === 'dark' ? '#ccd6f6' : '#333333',
                        }}
                      />
                    </FormRow>
                  </>
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
                onClick={openEditDialog ? handleUpdateBlog : handleCreateBlog}
                variant="contained"
                disabled={!formData.title || !formData.description || !formData.category || !content}
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
                {openEditDialog ? 'Update Blog' : 'Create Blog'}
              </Button>
            </DialogActions>
          </Dialog>

          {/* View Blog Dialog */}
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
            {selectedBlog && (
              <>
                <DialogTitle sx={{ 
                  backgroundColor: theme === 'dark' ? '#0f172a' : 'white',
                  borderBottom: theme === 'dark' ? '1px solid #334155' : '1px solid #e5e7eb',
                  py: 3
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                      Blog Preview
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Chip
                        label={getStatusText(selectedBlog.status)}
                        color={getStatusColor(selectedBlog.status)}
                        size="small"
                        icon={getStatusIcon(selectedBlog.status)}
                      />
                      {selectedBlog.isFeatured && (
                        <Chip
                          label="Featured"
                          size="small"
                          icon={<Star fontSize="small" />}
                          sx={{ 
                            backgroundColor: theme === 'dark' ? '#ffcc00' : '#ffcc00',
                            color: theme === 'dark' ? '#0a192f' : '#333333'
                          }}
                        />
                      )}
                    </Box>
                  </Box>
                </DialogTitle>
                <DialogContent sx={{ p: 0 }}>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    {/* Blog Header Image */}
                    {selectedBlog.image && (
                      <Box sx={{ 
                        width: '100%',
                        height: { xs: 200, md: 300 },
                        overflow: 'hidden'
                      }}>
                        <img 
                          src={getImageUrl(selectedBlog.image) || ''} 
                          alt={selectedBlog.title}
                          style={{ 
                            width: '100%', 
                            height: '100%', 
                            objectFit: 'cover' 
                          }}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.onerror = null;
                            target.src = '/api/placeholder/1200/300';
                          }}
                        />
                      </Box>
                    )}
                    
                    <Box sx={{ p: 3 }}>
                      {/* Blog Title */}
                      <Typography variant="h4" sx={{ 
                        fontWeight: 'bold',
                        color: theme === 'dark' ? '#ccd6f6' : '#333333',
                        mb: 2
                      }}>
                        {selectedBlog.title}
                      </Typography>
                      
                      {/* Blog Meta Info */}
                      <Box sx={{ 
                        display: 'flex', 
                        flexWrap: 'wrap',
                        gap: 2,
                        mb: 3,
                        alignItems: 'center'
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar
                            sx={{ 
                              width: 32, 
                              height: 32,
                              fontSize: '0.875rem',
                              bgcolor: getAuthorAvatarColor(selectedBlog.createdBy._id)
                            }}
                          >
                            {getAuthorInitials(selectedBlog.createdBy)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                              {selectedBlog.createdBy.firstName} {selectedBlog.createdBy.lastName}
                            </Typography>
                            <Typography variant="caption" color={theme === 'dark' ? '#94a3b8' : '#999999'}>
                              Author
                            </Typography>
                          </Box>
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <CalendarToday fontSize="small" sx={{ color: theme === 'dark' ? '#a8b2d1' : '#666666' }} />
                          <Typography variant="body2" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                            {formatDate(selectedBlog.blogDate)}
                          </Typography>
                        </Box>
                        
                        {selectedBlog.approvedBy && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar
                              sx={{ 
                                width: 32, 
                                height: 32,
                                fontSize: '0.75rem',
                                bgcolor: getAuthorAvatarColor(selectedBlog.approvedBy._id)
                              }}
                            >
                              {getAuthorInitials(selectedBlog.approvedBy)}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                                {selectedBlog.approvedBy.firstName} {selectedBlog.approvedBy.lastName}
                              </Typography>
                              <Typography variant="caption" color={theme === 'dark' ? '#94a3b8' : '#999999'}>
                                Reviewer
                              </Typography>
                            </Box>
                          </Box>
                        )}
                      </Box>
                      
                      {/* Approval Info */}
                      {selectedBlog.approvalNotes && (
                        <Card sx={{ 
                          mb: 3,
                          backgroundColor: theme === 'dark' ? '#1e293b' : '#f8f9fa',
                          border: theme === 'dark' ? '1px solid #334155' : '1px solid #e5e7eb'
                        }}>
                          <CardContent>
                            <Typography variant="subtitle2" sx={{ 
                              mb: 1,
                              color: theme === 'dark' ? '#ccd6f6' : '#333333',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1
                            }}>
                              {selectedBlog.status === 'rejected' ? <Cancel /> : <CheckCircle />}
                              Reviewer Notes
                            </Typography>
                            <Typography variant="body2" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                              {selectedBlog.approvalNotes}
                            </Typography>
                            {selectedBlog.approvedAt && (
                              <Typography variant="caption" color={theme === 'dark' ? '#94a3b8' : '#999999'} sx={{ display: 'block', mt: 1 }}>
                                Reviewed on: {formatDateTime(selectedBlog.approvedAt)}
                              </Typography>
                            )}
                          </CardContent>
                        </Card>
                      )}
                      
                      {/* Category and Tags */}
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                        <Chip
                          label={selectedBlog.category}
                          sx={{ 
                            backgroundColor: theme === 'dark' ? '#334155' : '#e5e7eb'
                          }}
                        />
                        {selectedBlog.tags.map((tag, index) => (
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
                      
                      {/* Description */}
                      <Typography variant="body1" sx={{ 
                        color: theme === 'dark' ? '#a8b2d1' : '#666666',
                        mb: 3,
                        fontSize: '1.1rem',
                        lineHeight: 1.6
                      }}>
                        {selectedBlog.description}
                      </Typography>
                      
                      {/* Content */}
                      <Box sx={{ 
                        color: theme === 'dark' ? '#ccd6f6' : '#333333',
                        '& p': { mb: 2 },
                        '& h1, & h2, & h3, & h4, & h5, & h6': {
                          mb: 2,
                          color: theme === 'dark' ? '#ccd6f6' : '#333333'
                        },
                        '& ul, & ol': { pl: 3, mb: 2 },
                        '& img': { maxWidth: '100%', height: 'auto', borderRadius: 1 },
                        '& blockquote': {
                          borderLeft: `4px solid ${theme === 'dark' ? '#00ffff' : '#007bff'}`,
                          pl: 2,
                          ml: 0,
                          fontStyle: 'italic',
                          color: theme === 'dark' ? '#a8b2d1' : '#666666'
                        }
                      }}>
                        <div dangerouslySetInnerHTML={{ __html: selectedBlog.content }} />
                      </Box>
                      
                      {/* Stats */}
                      <Card sx={{ 
                        mt: 3,
                        backgroundColor: theme === 'dark' ? '#1e293b' : '#f8f9fa',
                        border: theme === 'dark' ? '1px solid #334155' : '1px solid #e5e7eb'
                      }}>
                        <CardContent>
                          <Typography variant="h6" sx={{ 
                            mb: 2,
                            color: theme === 'dark' ? '#ccd6f6' : '#333333',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1
                          }}>
                            <TrendingUp /> Statistics
                          </Typography>
                          
                          <Box sx={{ 
                            display: 'grid',
                            gridTemplateColumns: {
                              xs: '1fr',
                              sm: '1fr 1fr'
                            },
                            gap: 2
                          }}>
                            <Box>
                              <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                                Views
                              </Typography>
                              <Typography variant="body2" sx={{ color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                                {selectedBlog.viewsCount}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                                Reading Time
                              </Typography>
                              <Typography variant="body2" sx={{ color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                                {selectedBlog.readingTime} minutes
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                                Created Date
                              </Typography>
                              <Typography variant="body2" sx={{ color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                                {formatDateTime(selectedBlog.createdAt)}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                                Last Updated
                              </Typography>
                              <Typography variant="body2" sx={{ color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                                {formatDateTime(selectedBlog.updatedAt)}
                              </Typography>
                            </Box>
                          </Box>
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
                  <Button 
                    onClick={() => {
                      setOpenViewDialog(false);
                      handleOpenEditDialog(selectedBlog);
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
                    Edit Blog
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
                Are you sure you want to delete blog post <strong style={{color: theme === 'dark' ? '#ff0000' : '#dc3545'}}>
                  "{selectedBlog?.title}"
                </strong>? This action cannot be undone.
              </Typography>
              {selectedBlog?.image && (
                <Typography variant="caption" color={theme === 'dark' ? '#94a3b8' : '#999999'} sx={{ display: 'block', mt: 1 }}>
                  Note: The blog image will also be deleted.
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
                onClick={handleDeleteBlog} 
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
                Delete Blog
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

export default BlogsPage;