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
  Article, Edit, Visibility,
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
  Gavel,
  ThumbUp,
  ThumbDown,
  Save,
  Close,
  Share,
  Facebook,
  WhatsApp,
  Telegram,
  ContentCopy,
  Email,
  OpenInNew
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
  imageData?: {
    data: {
      $binary?: {
        base64: string;
        subType: string;
      };
      type?: string;
      data?: number[];
    } | string;
    contentType: string;
    fileName: string;
  };
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
  status: 'draft' | 'pending' | 'published' | 'archived' | 'rejected';
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

const BlogApprovePage = () => {
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
    status: '', // Changed from 'pending' to '' to show all blogs
    featured: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    page: 1,
    limit: 10
  });

  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openApproveDialog, setOpenApproveDialog] = useState(false);
  const [openShareDialog, setOpenShareDialog] = useState(false);
  const [openSharePrompt, setOpenSharePrompt] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [content, setContent] = useState('');
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject'>('approve');
  const [approvalNotes, setApprovalNotes] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [copied, setCopied] = useState(false);

  const [formData, setFormData] = useState<BlogFormData>({
    title: '',
    description: '',
    content: '',
    category: '',
    tags: [],
    metaTitle: '',
    metaDescription: '',
    metaKeywords: [],
    status: 'pending',
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

  // Function to get image URL from blog data
  const getImageUrl = (blog: Blog): string | null => {
    try {
      // Check if imageData exists and has the expected structure
      if (blog.imageData && blog.imageData.data) {
        let base64String: string;
        
        // Extract base64 string based on the structure
        if (typeof blog.imageData.data === 'string') {
          // Already a string
          base64String = blog.imageData.data;
        } else if (blog.imageData.data.$binary && blog.imageData.data.$binary.base64) {
          // MongoDB BSON format
          base64String = blog.imageData.data.$binary.base64;
        } else if (blog.imageData.data.data && Array.isArray(blog.imageData.data.data)) {
          // Buffer format
          base64String = Buffer.from(blog.imageData.data.data).toString('base64');
        } else {
          throw new Error('Unknown image data structure');
        }
        
        // Clean and construct the data URL
        const cleanBase64 = base64String.replace(/\s/g, '');
        const contentType = blog.imageData.contentType || 'image/jpeg';
        return `data:${contentType};base64,${cleanBase64}`;
      }
      
      // Fallback to image field if it's a data URL
      if (blog.image && blog.image.startsWith('data:image')) {
        return blog.image;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting image URL:', error);
      return null;
    }
  };

  const getBlogPublicUrl = (blog: Blog): string => {
    if (typeof window === 'undefined') {
      return '';
    }
    // Construct the public URL for the blog
    return `${window.location.origin}/blog/${blog.slug}`;
  };

  // Share functions
  const shareOnFacebook = (blog: Blog) => {
    const url = getBlogPublicUrl(blog);
    const quote = `${blog.title}\n\n${blog.description}`;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(quote)}`, '_blank');
  };

  const shareOnWhatsApp = (blog: Blog) => {
    const url = getBlogPublicUrl(blog);
    const message = `*${blog.title}*\n\n${blog.description}\n\nRead more at: ${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  const shareOnTelegram = (blog: Blog) => {
    const url = getBlogPublicUrl(blog);
    const message = `<b>${blog.title}</b>\n\n${blog.description}`;
    window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(message)}`, '_blank');
  };

  const shareViaEmail = (blog: Blog) => {
    const url = getBlogPublicUrl(blog);
    const subject = blog.title;
    const body = `
${blog.title}

${blog.description}

${blog.content.replace(/<[^>]*>/g, '').substring(0, 500)}...

Read full article: ${url}

--
Shared from ቴፒ ግቢ ጉባኤ ብሎግ
      `;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const copyToClipboard = (blog: Blog) => {
    const url = getBlogPublicUrl(blog);
    const blogText = `
${blog.title}
${blog.description}

${blog.content.replace(/<[^>]*>/g, '').substring(0, 300)}...

Read full article: ${url}

--
Shared from ቴፒ ግቢ ጉባኤ ብሎግ
      `;
    navigator.clipboard.writeText(blogText)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => console.error('Failed to copy: ', err));
  };

  const shareFullBlogContent = (blog: Blog) => {
    const url = getBlogPublicUrl(blog);
    const shareText = `
📄 *${blog.title}*

${blog.description}

📖 *Content Preview:*
${blog.content.replace(/<[^>]*>/g, '').substring(0, 400)}...

👤 *Author:* ${blog.createdBy.firstName} ${blog.createdBy.lastName}
📅 *Date:* ${formatDate(blog.blogDate)}
⏱️ *Reading Time:* ${blog.readingTime} minutes
🏷️ *Category:* ${blog.category}
🔖 *Tags:* ${blog.tags.join(', ')}

🌐 *Read full article:* ${url}

--
Shared from ቴፒ ግቢ ጉባኤ ብሎግ
      `;
    
    // For mobile, use Web Share API
    if (navigator.share) {
      navigator.share({
        title: blog.title,
        text: shareText,
        url: url
      });
    } else {
      // Copy to clipboard as fallback
      navigator.clipboard.writeText(shareText)
        .then(() => {
          setSuccess('Blog content copied to clipboard!');
          setTimeout(() => setSuccess(''), 3000);
        })
        .catch(err => console.error('Failed to copy: ', err));
    }
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
      status: blog.status,
      isFeatured: blog.isFeatured,
      blogDate: blog.blogDate ? parseISO(blog.blogDate) : null
    });
    setContent(blog.content);
    setImagePreview(getImageUrl(blog));
    setImageFile(null);
    setOpenEditDialog(true);
  };

  const handleOpenViewDialog = (blog: Blog) => {
    setSelectedBlog(blog);
    setOpenViewDialog(true);
  };

  const handleOpenApproveDialog = (blog: Blog, action: 'approve' | 'reject') => {
    setSelectedBlog(blog);
    setApprovalAction(action);
    setApprovalNotes('');
    setOpenApproveDialog(true);
  };

  const handleOpenShareDialog = (blog: Blog) => {
    setSelectedBlog(blog);
    setOpenShareDialog(true);
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
      formDataToSend.append('status', formData.status);
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

  const handleApproveBlog = async () => {
    if (!selectedBlog) return;

    try {
      const payload = {
        status: approvalAction === 'approve' ? 'published' : 'rejected',
        approvalNotes: approvalNotes.trim() || undefined
      };

      await api.patch(`/blogs/${selectedBlog._id}/approve`, payload);
      
      const successMessage = `Blog ${approvalAction === 'approve' ? 'approved' : 'rejected'} successfully`;
      setSuccess(successMessage);
      setOpenApproveDialog(false);
      setOpenViewDialog(false);

       // Refresh all data
    await refreshAllData();
      
      // If approved, ask if they want to share
      if (approvalAction === 'approve') {
        setOpenSharePrompt(true);
      } else {
        setSelectedBlog(null);
        setApprovalNotes('');
      }
      
      fetchBlogs();
      fetchStats();
    } catch (error: any) {
      setError(error.response?.data?.message || `Failed to ${approvalAction} blog`);
    }
  };

  // Function to refresh all data
const refreshAllData = async () => {
  try {
    // Fetch blogs with current filters
    await fetchBlogs();
    
    // Fetch updated stats
    await fetchStats();
    
    // Refresh filter options (in case categories/authors changed)
    await fetchFilterOptions();
    
    // Optional: Refresh any other related data
    // For example, if you have notification counts or other dashboard data
    await refreshDashboardData();
    
  } catch (error: any) {
    console.error('Error refreshing data:', error);
    // Don't show error to user for background refresh
  }
};

// Function to fetch dashboard data (optional)
const refreshDashboardData = async () => {
  try {
    // If you have other models that need refreshing
    // Example: User stats, notification counts, etc.
    // await api.get('/dashboard/stats');
    
    // If you have a cache system, you might want to clear it
    // Example: clear any cached blog data
    // localStorage.removeItem('cached_blogs');
    
  } catch (error) {
    console.error('Error refreshing dashboard data:', error);
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
      status: 'pending',
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

   // Form field styles
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

  const statCards = [
    {
      title: 'Pending Approval',
      value: stats?.totalPending || 0,
      icon: <HourglassEmpty sx={{ fontSize: 28 }} />,
      color: theme === 'dark' ? '#ff9900' : '#ff9900',
      description: 'Awaiting review'
    },
    {
      title: 'Published',
      value: stats?.totalPublished || 0,
      icon: <CheckCircle sx={{ fontSize: 28 }} />,
      color: theme === 'dark' ? '#00ff00' : '#28a745',
      description: 'Approved blogs'
    },
    {
      title: 'Total Blogs',
      value: stats?.totalBlogs || 0,
      icon: <Article sx={{ fontSize: 28 }} />,
      color: theme === 'dark' ? '#00ffff' : '#007bff',
      description: 'All blogs'
    },
    {
      title: 'Rejected',
      value: stats?.totalRejected || 0,
      icon: <Cancel sx={{ fontSize: 28 }} />,
      color: theme === 'dark' ? '#ff0000' : '#dc3545',
      description: 'Not approved'
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
                Blog Approval Dashboard
              </Typography>
              <Typography variant={isMobile ? "body2" : "body1"} color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                Review, edit, and approve blog posts
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
                    <Gavel /> Blog Approval Management
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
                    <InputLabel sx={{ color: theme === 'dark' ? '#a8b2d1' : '#666666' }}>Category</InputLabel>
                    <Select
                      value={filters.category}
                      label="Category"
                      onChange={(e) => handleFilterChange('category', e.target.value)}
                      sx={{
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
                      }}
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
                    <InputLabel sx={{ color: theme === 'dark' ? '#a8b2d1' : '#666666' }}>Status</InputLabel>
                    <Select
                      value={filters.status}
                      label="Status"
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                      sx={{
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
                      }}
                    >
                      <MenuItem value="">All Status</MenuItem>
                      <MenuItem value="pending">Pending Review</MenuItem>
                      <MenuItem value="published">Published</MenuItem>
                      <MenuItem value="rejected">Rejected</MenuItem>
                      <MenuItem value="draft">Draft</MenuItem>
                      <MenuItem value="archived">Archived</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <FormControl fullWidth size="small">
                    <InputLabel sx={{ color: theme === 'dark' ? '#a8b2d1' : '#666666' }}>Author</InputLabel>
                    <Select
                      value={filters.author}
                      label="Author"
                      onChange={(e) => handleFilterChange('author', e.target.value)}
                      sx={{
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
                      }}
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
                </Box>
              </CardContent>
            </Card>
          </motion.div>

          {/* Blogs List */}
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
                    const imageUrl = getImageUrl(blog);
                    
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
                        
                        {/* Action Buttons */}
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
                        
                        {/* Approval Buttons - Only show for pending blogs */}
                        {blog.status === 'pending' && (
                          <Box sx={{ 
                            p: 2, 
                            pt: 0,
                            display: 'flex', 
                            gap: 1
                          }}>
                            <Button
                              size="small"
                              fullWidth
                              variant="contained"
                              startIcon={<ThumbUp fontSize="small" />}
                              onClick={() => handleOpenApproveDialog(blog, 'approve')}
                              sx={{
                                borderRadius: 1,
                                backgroundColor: theme === 'dark' ? '#00ff00' : '#28a745',
                                color: theme === 'dark' ? '#0a192f' : 'white',
                                fontSize: '0.75rem',
                                py: 0.5,
                                '&:hover': {
                                  backgroundColor: theme === 'dark' ? '#00b300' : '#218838'
                                }
                              }}
                            >
                              Approve
                            </Button>
                            <Button
                              size="small"
                              fullWidth
                              variant="contained"
                              color="error"
                              startIcon={<ThumbDown fontSize="small" />}
                              onClick={() => handleOpenApproveDialog(blog, 'reject')}
                              sx={{
                                borderRadius: 1,
                                fontSize: '0.75rem',
                                py: 0.5
                              }}
                            >
                              Reject
                            </Button>
                          </Box>
                        )}

                        {/* Share Button - Only for published blogs */}
                        {blog.status === 'published' && (
                          <Box sx={{ 
                            p: 2, 
                            pt: 0
                          }}>
                            <Tooltip title="Share blog">
                              <Button
                                size="small"
                                fullWidth
                                variant="outlined"
                                startIcon={<Share fontSize="small" />}
                                onClick={() => handleOpenShareDialog(blog)}
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
                                Share
                              </Button>
                            </Tooltip>
                          </Box>
                        )}
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
                          const imageUrl = getImageUrl(blog);
                          
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
                                  
                                  {/* Show Share button for published blogs */}
                                  {blog.status === 'published' && (
                                    <Tooltip title="Share blog">
                                      <IconButton
                                        size="small"
                                        onClick={() => handleOpenShareDialog(blog)}
                                        sx={{ 
                                          color: theme === 'dark' ? '#00ffff' : '#007bff',
                                          '&:hover': {
                                            backgroundColor: theme === 'dark' ? '#00ffff20' : '#007bff10'
                                          }
                                        }}
                                      >
                                        <Share fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  )}
                                  
                                  {/* Show Approve/Reject buttons only for pending blogs */}
                                  {blog.status === 'pending' && (
                                    <>
                                      <Tooltip title="Approve blog">
                                        <IconButton
                                          size="small"
                                          onClick={() => handleOpenApproveDialog(blog, 'approve')}
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
                                      <Tooltip title="Reject blog">
                                        <IconButton
                                          size="small"
                                          onClick={() => handleOpenApproveDialog(blog, 'reject')}
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
                      <Gavel sx={{ 
                        fontSize: 64, 
                        color: theme === 'dark' ? '#334155' : '#cbd5e1',
                        mb: 2
                      }} />
                      <Typography variant="h6" color={theme === 'dark' ? '#a8b2d1' : '#666666'} sx={{ mb: 1 }}>
                        No blogs found
                      </Typography>
                      <Typography variant="body2" color={theme === 'dark' ? '#94a3b8' : '#999999'}>
                        Try adjusting your filters
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
                      Blog Review
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
                    {selectedBlog.imageData && (
                      <Box sx={{ 
                        width: '100%',
                        height: { xs: 200, md: 300 },
                        overflow: 'hidden'
                      }}>
                        <img 
                          src={getImageUrl(selectedBlog) || ''} 
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
                            Created: {formatDate(selectedBlog.createdAt)}
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
                  {/* Share section for published blogs */}
                  {selectedBlog.status === 'published' && (
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      width: '100%',
                      mb: 2
                    }}>
                      <Typography variant="subtitle2" sx={{ 
                        mb: 1,
                        color: theme === 'dark' ? '#a8b2d1' : '#666666'
                      }}>
                        Share this blog:
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Tooltip title="Share on Facebook">
                          <IconButton
                            size="small"
                            onClick={() => shareOnFacebook(selectedBlog)}
                            sx={{ 
                              color: theme === 'dark' ? '#1877F2' : '#1877F2',
                              '&:hover': {
                                backgroundColor: theme === 'dark' ? '#1877F220' : '#1877F210'
                              }
                            }}
                          >
                            <Facebook />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Share on WhatsApp">
                          <IconButton
                            size="small"
                            onClick={() => shareOnWhatsApp(selectedBlog)}
                            sx={{ 
                              color: theme === 'dark' ? '#25D366' : '#25D366',
                              '&:hover': {
                                backgroundColor: theme === 'dark' ? '#25D36620' : '#25D36610'
                              }
                            }}
                          >
                            <WhatsApp />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Share on Telegram">
                          <IconButton
                            size="small"
                            onClick={() => shareOnTelegram(selectedBlog)}
                            sx={{ 
                              color: theme === 'dark' ? '#0088cc' : '#0088cc',
                              '&:hover': {
                                backgroundColor: theme === 'dark' ? '#0088cc20' : '#0088cc10'
                              }
                            }}
                          >
                            <Telegram />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Share via Email">
                          <IconButton
                            size="small"
                            onClick={() => shareViaEmail(selectedBlog)}
                            sx={{ 
                              color: theme === 'dark' ? '#EA4335' : '#EA4335',
                              '&:hover': {
                                backgroundColor: theme === 'dark' ? '#EA433520' : '#EA433510'
                              }
                            }}
                          >
                            <Email />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title={copied ? "Copied!" : "Copy blog content"}>
                          <IconButton
                            size="small"
                            onClick={() => copyToClipboard(selectedBlog)}
                            sx={{ 
                              color: theme === 'dark' ? '#a8b2d1' : '#666666',
                              '&:hover': {
                                backgroundColor: theme === 'dark' ? '#1e293b' : '#f8fafc'
                              }
                            }}
                          >
                            <ContentCopy />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Share full blog content">
                          <IconButton
                            size="small"
                            onClick={() => shareFullBlogContent(selectedBlog)}
                            sx={{ 
                              color: theme === 'dark' ? '#00ffff' : '#007bff',
                              '&:hover': {
                                backgroundColor: theme === 'dark' ? '#00ffff20' : '#007bff10'
                              }
                            }}
                          >
                            <Share />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  )}

                  <Box sx={{ display: 'flex', gap: 2, width: '100%', justifyContent: 'space-between' }}>
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
                    
                    {selectedBlog.status === 'pending' && (
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button 
                          onClick={() => handleOpenApproveDialog(selectedBlog, 'reject')}
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
                          onClick={() => handleOpenApproveDialog(selectedBlog, 'approve')}
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
                  </Box>
                </DialogActions>
              </>
            )}
          </Dialog>

          {/* Edit Blog Dialog */}
          <Dialog 
            open={openEditDialog} 
            onClose={() => setOpenEditDialog(false)} 
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
                Edit Blog
              </Typography>
            </DialogTitle>
            <DialogContent sx={{ p: 3, overflowY: 'auto' }}>
              {/* Edit dialog content remains the same */}
            </DialogContent>
          </Dialog>

         {/* Approve/Reject Dialog - Keep as is */}
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
              backgroundColor: approvalAction === 'approve' 
                ? (theme === 'dark' ? '#00ff0020' : '#28a74520')
                : (theme === 'dark' ? '#ff000020' : '#dc354520'),
              borderBottom: theme === 'dark' ? '1px solid #334155' : '1px solid #e5e7eb',
              py: 3
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {approvalAction === 'approve' ? (
                  <CheckCircle sx={{ color: theme === 'dark' ? '#00ff00' : '#28a745', fontSize: 32 }} />
                ) : (
                  <Cancel sx={{ color: theme === 'dark' ? '#ff0000' : '#dc3545', fontSize: 32 }} />
                )}
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                  {approvalAction === 'approve' ? 'Approve Blog' : 'Reject Blog'}
                </Typography>
              </Box>
            </DialogTitle>
            <DialogContent sx={{ p: 3 }}>
              <Typography variant="body1" color={theme === 'dark' ? '#a8b2d1' : '#666666'} sx={{ mb: 2 }}>
                {approvalAction === 'approve' 
                  ? `You are about to approve the blog post "${selectedBlog?.title}". This will publish it immediately.`
                  : `You are about to reject the blog post "${selectedBlog?.title}". Please provide a reason for rejection.`
                }
              </Typography>
              
              <TextField
                fullWidth
                multiline
                rows={4}
                label={approvalAction === 'approve' ? 'Approval Notes (Optional)' : 'Rejection Reason *'}
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                placeholder={approvalAction === 'approve' 
                  ? 'Add any notes for the author...'
                  : 'Explain why this blog is being rejected...'
                }
                required={approvalAction === 'reject'}
                sx={textFieldStyle}
              />
              
              {approvalAction === 'reject' && (
                <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'} sx={{ display: 'block', mt: 1 }}>
                  Rejection reason is required and will be visible to the author.
                </Typography>
              )}
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
                onClick={handleApproveBlog}
                variant="contained"
                disabled={approvalAction === 'reject' && !approvalNotes.trim()}
                color={approvalAction === 'approve' ? 'success' : 'error'}
                sx={{
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
                {approvalAction === 'approve' ? 'Approve Blog' : 'Reject Blog'}
              </Button>
            </DialogActions>
          </Dialog>

          {/* Share Blog Dialog */}
          <Dialog 
            open={openShareDialog} 
            onClose={() => setOpenShareDialog(false)}
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
            {/* Share dialog content remains the same */}
          </Dialog>

          {/* Share Prompt Dialog */}
          <Dialog 
            open={openSharePrompt} 
            onClose={() => {
              setOpenSharePrompt(false);
              setSelectedBlog(null);
              setApprovalNotes('');
            }}
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
            {/* Share prompt dialog content remains the same */}
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

          {/* Copy notification */}
          <Snackbar 
            open={copied} 
            autoHideDuration={2000} 
            onClose={() => setCopied(false)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >
            <Alert 
              severity="success" 
              onClose={() => setCopied(false)}
              sx={{ 
                borderRadius: 1,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                backgroundColor: theme === 'dark' ? '#0f172a' : 'white',
                color: theme === 'dark' ? '#00ff00' : '#28a745'
              }}
            >
              Blog content copied to clipboard!
            </Alert>
          </Snackbar>
        </Box>
      </div>
    </LocalizationProvider>
  );
};

export default BlogApprovePage;