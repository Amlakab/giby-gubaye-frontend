'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Box, Typography, Card, CardContent, Chip,
  IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, Button, Avatar, Divider,
  Stack, CircularProgress, useMediaQuery,
  Snackbar, Alert, Tooltip
} from '@mui/material';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import { useTheme } from '@/lib/theme-context';
import {
  Share, Facebook, WhatsApp, Telegram,
  ContentCopy, Email, CalendarToday,
  Person, AccessTime, RemoveRedEye,
  Category, Article, TrendingUp,
  Search, Close, OpenInNew
} from '@mui/icons-material';
import api from '@/app/utils/api';

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
  status: 'published';
  tags: string[];
  isFeatured: boolean;
  viewsCount: number;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  readingTime: number;
  createdAt: string;
  updatedAt: string;
}

interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalBlogs: number;
  hasNext: boolean;
  hasPrev: boolean;
}

const BlogPage = () => {
  const { theme } = useTheme();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(max-width: 1024px)');
  
  const [blogs, setBlogs] = useState<Blog[]>([]);
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
    featured: '',
    sortBy: 'blogDate',
    sortOrder: 'desc',
    page: 1,
    limit: 9
  });
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [copied, setCopied] = useState(false);

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

  const fetchApprovedBlogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await api.get(`/blogs/public/approved?${params}`);
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovedBlogs();
  }, [filters]);

  const handleOpenViewDialog = (blog: Blog) => {
    setSelectedBlog(blog);
    setOpenViewDialog(true);
  };

  const handleCloseViewDialog = () => {
    setOpenViewDialog(false);
    setSelectedBlog(null);
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
      page: 1
    }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Invalid date';
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

  const shareOnFacebook = () => {
    if (selectedBlog) {
      const url = window.location.href;
      const quote = `${selectedBlog.title}\n\n${selectedBlog.description}`;
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(quote)}`, '_blank');
    }
  };

  const shareOnWhatsApp = () => {
    if (selectedBlog) {
      const message = `*${selectedBlog.title}*\n\n${selectedBlog.description}\n\nRead more at: ${window.location.href}`;
      window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
    }
  };

  const shareOnTelegram = () => {
    if (selectedBlog) {
      const message = `<b>${selectedBlog.title}</b>\n\n${selectedBlog.description}`;
      window.open(`https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(message)}`, '_blank');
    }
  };

  const shareViaEmail = () => {
    if (selectedBlog) {
      const url = window.location.href;
      const subject = selectedBlog.title;
      const body = `
${selectedBlog.title}

${selectedBlog.description}

${selectedBlog.content.replace(/<[^>]*>/g, '').substring(0, 500)}...

Read full article: ${url}

--
Shared from ቴፒ ግቢ ጉባኤ ብሎግ
      `;
      window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }
  };

  const copyToClipboard = () => {
    if (selectedBlog) {
      const blogText = `
${selectedBlog.title}
${selectedBlog.description}

${selectedBlog.content.replace(/<[^>]*>/g, '').substring(0, 300)}...

Read full article: ${window.location.href}

--
Shared from ቴፒ ግቢ ጉባኤ ብሎግ
      `;
      navigator.clipboard.writeText(blogText)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
        .catch(err => console.error('Failed to copy: ', err));
    }
  };

  const shareFullBlogContent = () => {
    if (selectedBlog) {
      const shareText = `
📄 *${selectedBlog.title}*

${selectedBlog.description}

📖 *Content Preview:*
${selectedBlog.content.replace(/<[^>]*>/g, '').substring(0, 400)}...

👤 *Author:* ${selectedBlog.createdBy.firstName} ${selectedBlog.createdBy.lastName}
📅 *Date:* ${formatDate(selectedBlog.blogDate)}
⏱️ *Reading Time:* ${selectedBlog.readingTime} minutes
🏷️ *Category:* ${selectedBlog.category}
🔖 *Tags:* ${selectedBlog.tags.join(', ')}

🌐 *Read full article:* ${window.location.href}

--
Shared from ቴፒ ግቢ ጉባኤ ብሎግ
      `;
      
      // For mobile, use Web Share API
      if (navigator.share) {
        navigator.share({
          title: selectedBlog.title,
          text: shareText,
          url: window.location.href
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
    }
  };

  const themeStyles = {
    background: theme === 'dark' 
      ? 'linear-gradient(135deg, #0a192f, #112240)' 
      : 'linear-gradient(135deg, #f0f0f0, #ffffff)',
    textColor: theme === 'dark' ? '#ccd6f6' : '#333333',
    primaryColor: theme === 'dark' ? '#00ffff' : '#007bff',
    borderColor: theme === 'dark' ? '#00ffff' : '#007bff',
    surface: theme === 'dark' ? '#1e293b' : '#ffffff',
    cardBg: theme === 'dark' ? '#0f172a80' : 'white',
    cardBorder: theme === 'dark' ? '#334155' : '#e5e7eb',
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-[#0a192f] to-[#112240] text-white' 
        : 'bg-gradient-to-br from-[#f0f0f0] to-[#ffffff] text-[#333333]'
    }`}>
      <Navbar />
      
      <div className="pt-16">
        {/* Hero Section */}
        <section className={`py-12 px-4 ${
          theme === 'dark' ? 'bg-transparent' : 'bg-transparent'
        }`}>
          <div className="container mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ x: -100, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ duration: 1 }}
                viewport={{ once: true }}
              >
                <h1 className={`text-3xl md:text-4xl font-bold mb-6 ${
                  theme === 'dark' ? 'text-[#00ffff]' : 'text-[#007bff]'
                }`}>
                  ቴፒ ግቢ ጉባኤ ብሎግ እና ዜናዎች
                </h1>

                <p className={`text-base ${
                  theme === 'dark' ? 'text-gray-300' : 'text-[#666666]'
                } mb-4`}>
                  ከቴፒ ግቢ ጉባኤ የሚወጡ መልዕክቶች፣ ማስታወቂያዎችና መንፈሳዊ ጽሁፎችን በዚህ ገፅ ያግኙ፡፡
                  መድረኩ የመጽሐፍ ቅዱስ ትምህርቶችን፣ የጸሎት መርሃ ግብሮችንና የተማሪዎች መንፈሳዊ ተሞክሮዎችን ያቀርባል።
                  በግቢ ጉባኤ የሚካሄዱ የተለያዩ ፕሮግራሞችና አገልግሎቶች በዘመናዊ መንገድ ይቀርባሉ።
                  ይህ መድረክ ተማሪዎችን በእምነትና በባህሪ እድገት ለማጠናከር ይረዳል።
                  እንዲሁም ተማሪዎች በአገልግሎት ሕይወት እንዲተግብሩ ያበረታታል።
                </p>
              </motion.div>

              <motion.div
                initial={{ x: 100, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ duration: 1 }}
                viewport={{ once: true }}
              >
                <div className={`p-6 rounded-xl ${
                  theme === 'dark' ? 'bg-[#1e293b]' : 'bg-white'
                } shadow-lg`}>
                  <h2 className={`text-2xl font-bold mb-4 ${
                    theme === 'dark' ? 'text-[#00ffff]' : 'text-[#007bff]'
                  }`}>
                    የቅርብ ጊዜ ማሻሻያዎች
                  </h2>

                  <p className={`text-base ${
                    theme === 'dark' ? 'text-gray-300' : 'text-[#666666]'
                  } mb-4`}>
                    ቴፒ ግቢ ጉባኤ የመጽሐፍ ቅዱስ ትምህርቶች፣ የጸሎት መርሃ ግብሮች፣
                    የአመራር ስልጠናዎችና የማህበረሰብ አገልግሎቶችን በቀጣይነት ያካሂዳል።
                  </p>

                  <div className="flex flex-wrap gap-2">
                    <Chip label="እምነት" size="small" />
                    <Chip label="ህብረት" size="small" />
                    <Chip label="አመራር" size="small" />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Search and Filter Section */}
        <section className={`py-8 px-4 ${
          theme === 'dark' ? 'bg-transparent' : 'bg-transparent'
        }`}>
          <div className="container mx-auto">
            <div className={`flex ${isMobile ? 'flex-row flex-wrap gap-2' : 'flex-col md:flex-row gap-4'} items-center justify-between`}>
              <div className={`relative ${isMobile ? 'w-full min-w-[200px]' : 'w-full md:w-96'}`}>
                <input
                  type="text"
                  placeholder="Search blogs..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className={`w-full px-4 py-2 pl-10 rounded-lg border ${
                    theme === 'dark' 
                      ? 'bg-[#1e293b] border-[#334155] text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 ${
                    theme === 'dark' ? 'focus:ring-[#00ffff]' : 'focus:ring-[#007bff]'
                  } focus:border-transparent`}
                />
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`} />
              </div>
              
              {/* For mobile, use flex row with smaller gap */}
              <div className={`${isMobile ? 'flex flex-row gap-2 w-full' : 'flex flex-col md:flex-row gap-4'}`}>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className={`px-4 py-2 rounded-lg border ${
                    theme === 'dark' 
                      ? 'bg-[#1e293b] border-[#334155] text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 ${
                    theme === 'dark' ? 'focus:ring-[#00ffff]' : 'focus:ring-[#007bff]'
                  } focus:border-transparent ${isMobile ? 'flex-1 min-w-[120px]' : ''}`}
                >
                  <option value="">All Categories</option>
                  <option value="Technology">Technology</option>
                  <option value="Cybersecurity">Cybersecurity</option>
                  <option value="Innovation">Innovation</option>
                  <option value="Policy">Policy</option>
                  <option value="Education">Education</option>
                </select>

                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className={`px-4 py-2 rounded-lg border ${
                    theme === 'dark' 
                      ? 'bg-[#1e293b] border-[#334155] text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 ${
                    theme === 'dark' ? 'focus:ring-[#00ffff]' : 'focus:ring-[#007bff]'
                  } focus:border-transparent ${isMobile ? 'flex-1 min-w-[140px]' : ''}`}
                >
                  <option value="blogDate">Newest First</option>
                  <option value="viewsCount">Most Viewed</option>
                  <option value="title">Title A-Z</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Blogs Grid Section */}
        <section className={`py-8 px-4 ${
          theme === 'dark' ? 'bg-transparent' : 'bg-transparent'
        }`}>
          <div className="container mx-auto">
            {loading ? (
              <div className="flex justify-center items-center py-16">
                <CircularProgress sx={{ color: theme === 'dark' ? '#00ffff' : '#007bff' }} />
              </div>
            ) : blogs.length === 0 ? (
              <div className="text-center py-16">
                <Article sx={{ 
                  fontSize: 64, 
                  color: theme === 'dark' ? '#334155' : '#cbd5e1',
                  mb: 2
                }} />
                <Typography variant="h6" color={theme === 'dark' ? '#a8b2d1' : '#666666'} sx={{ mb: 1 }}>
                  No blogs found
                </Typography>
                <Typography variant="body2" color={theme === 'dark' ? '#94a3b8' : '#999999'}>
                  Try adjusting your search or check back later for new blogs
                </Typography>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {blogs.map((blog, index) => (
                    <motion.div
                      key={blog._id}
                      initial={{ y: 50, opacity: 0 }}
                      whileInView={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      whileHover={{ y: -5 }}
                      className="group"
                    >
                      <Card sx={{ 
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
                      }}>
                        {/* Blog Image - Using getImageUrl function */}
                        <Box sx={{ 
                          position: 'relative',
                          height: 200,
                          overflow: 'hidden',
                          borderTopLeftRadius: 8,
                          borderTopRightRadius: 8
                        }}>
                          {getImageUrl(blog) ? (
                            <img
                              src={getImageUrl(blog) || ''}
                              alt={blog.title}
                              style={{ 
                                width: '100%', 
                                height: '100%', 
                                objectFit: 'cover',
                                transition: 'transform 0.3s'
                              }}
                              className="group-hover:scale-105"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.onerror = null;
                                target.src = '/api/placeholder/400/250';
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
                          
                          {/* Featured Badge */}
                          {blog.isFeatured && (
                            <Chip
                              label="Featured"
                              size="small"
                              sx={{ 
                                position: 'absolute',
                                top: 8,
                                left: 8,
                                height: 24,
                                fontSize: '0.7rem',
                                backgroundColor: theme === 'dark' ? '#ffcc00' : '#ffcc00',
                                color: theme === 'dark' ? '#0a192f' : '#333333',
                                fontWeight: 'bold'
                              }}
                            />
                          )}
                          
                          {/* Category Badge */}
                          <Chip
                            label={blog.category}
                            size="small"
                            sx={{ 
                              position: 'absolute',
                              bottom: 8,
                              right: 8,
                              height: 24,
                              fontSize: '0.7rem',
                              backgroundColor: theme === 'dark' ? '#334155' : '#e5e7eb',
                              color: theme === 'dark' ? '#a8b2d1' : '#666666'
                            }}
                          />
                        </Box>
                        
                        <CardContent sx={{ p: 3, flexGrow: 1 }}>
                          {/* Title */}
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              fontWeight: 'bold',
                              color: theme === 'dark' ? '#ccd6f6' : '#333333',
                              mb: 1,
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              lineHeight: 1.3,
                              fontSize: '1.1rem'
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
                              fontSize: '0.9rem'
                            }}
                          >
                            {blog.description}
                          </Typography>
                          
                          {/* Author and Date */}
                          <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mt: 'auto',
                            pt: 2,
                            borderTop: theme === 'dark' ? '1px solid #334155' : '1px solid #e5e7eb'
                          }}>
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
                              <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                                {blog.createdBy.firstName}
                              </Typography>
                            </Box>
                            
                            <Typography variant="caption" color={theme === 'dark' ? '#94a3b8' : '#999999'}>
                              {formatDate(blog.blogDate)}
                            </Typography>
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
                            startIcon={<OpenInNew fontSize="small" />}
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
                            Read More
                          </Button>
                          
                          <Tooltip title="Share full blog content">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setSelectedBlog(blog);
                                shareFullBlogContent();
                              }}
                              sx={{
                                borderRadius: 1,
                                border: theme === 'dark' ? '1px solid #334155' : '1px solid #e5e7eb',
                                color: theme === 'dark' ? '#a8b2d1' : '#666666',
                                '&:hover': {
                                  backgroundColor: theme === 'dark' ? '#1e293b' : '#f8fafc'
                                }
                              }}
                            >
                              <Share fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center',
                    mt: 6,
                    gap: 2
                  }}>
                    <Button
                      onClick={() => handlePageChange(filters.page - 1)}
                      disabled={filters.page === 1}
                      variant="outlined"
                      sx={{
                        borderRadius: 1,
                        borderColor: theme === 'dark' ? '#00ffff' : '#007bff',
                        color: theme === 'dark' ? '#00ffff' : '#007bff',
                        '&:hover': {
                          backgroundColor: theme === 'dark' ? '#00ffff20' : '#007bff10'
                        },
                        '&.Mui-disabled': {
                          borderColor: theme === 'dark' ? '#334155' : '#e5e7eb',
                          color: theme === 'dark' ? '#94a3b8' : '#94a3b8'
                        }
                      }}
                    >
                      Previous
                    </Button>
                    
                    <Typography variant="body2" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                      Page {filters.page} of {pagination.totalPages}
                    </Typography>
                    
                    <Button
                      onClick={() => handlePageChange(filters.page + 1)}
                      disabled={filters.page === pagination.totalPages}
                      variant="outlined"
                      sx={{
                        borderRadius: 1,
                        borderColor: theme === 'dark' ? '#00ffff' : '#007bff',
                        color: theme === 'dark' ? '#00ffff' : '#007bff',
                        '&:hover': {
                          backgroundColor: theme === 'dark' ? '#00ffff20' : '#007bff10'
                        },
                        '&.Mui-disabled': {
                          borderColor: theme === 'dark' ? '#334155' : '#e5e7eb',
                          color: theme === 'dark' ? '#94a3b8' : '#94a3b8'
                        }
                      }}
                    >
                      Next
                    </Button>
                  </Box>
                )}
              </>
            )}
          </div>
        </section>

        {/* Key Focus Areas Section */}
        <section className={`py-16 px-4 ${
          theme === 'dark' ? 'bg-[#0f172a80]' : 'bg-gray-50'
        }`}>
          <div className="container mx-auto">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 1 }}
              viewport={{ once: true }}
            >
              <h2 className={`text-3xl font-bold mb-8 ${
                theme === 'dark' ? 'text-[#00ffff]' : 'text-[#007bff]'
              } text-center`}>
                ዋና ዋና የትኩረት መስኮች
              </h2>

              <p className={`text-base mb-8 text-center ${
                theme === 'dark' ? 'text-gray-300' : 'text-[#666666]'
              }`}>
                ቴፒ ግቢ ጉባኤ የተማሪዎችን መንፈሳዊ እድገትና አገልግሎት ለማጠናከር በሚከተሉት ዋና መስኮች ላይ ያተኮራል፡፡
              </p>

              <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${
                theme === 'dark' ? 'text-gray-300' : 'text-[#666666]'
              }`}>
                <div className={`p-4 rounded-lg ${
                  theme === 'dark' ? 'bg-[#1e293b]' : 'bg-white'
                } shadow`}>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#007bff] flex items-center justify-center">
                      <span className="text-white text-sm font-bold">1</span>
                    </div>
                    <span className="font-medium">
                      መንፈሳዊ እድገትና ደቀመዝሙርነት
                    </span>
                  </div>
                </div>

                <div className={`p-4 rounded-lg ${
                  theme === 'dark' ? 'bg-[#1e293b]' : 'bg-white'
                } shadow`}>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#007bff] flex items-center justify-center">
                      <span className="text-white text-sm font-bold">2</span>
                    </div>
                    <span className="font-medium">
                      የተማሪዎች አመራርና ተጠያቂነት
                    </span>
                  </div>
                </div>

                <div className={`p-4 rounded-lg ${
                  theme === 'dark' ? 'bg-[#1e293b]' : 'bg-white'
                } shadow`}>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#007bff] flex items-center justify-center">
                      <span className="text-white text-sm font-bold">3</span>
                    </div>
                    <span className="font-medium">
                      የመጽሐፍ ቅዱስ ትምህርትና ስልጠና
                    </span>
                  </div>
                </div>

                <div className={`p-4 rounded-lg ${
                  theme === 'dark' ? 'bg-[#1e293b]' : 'bg-white'
                } shadow`}>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#007bff] flex items-center justify-center">
                      <span className="text-white text-sm font-bold">4</span>
                    </div>
                    <span className="font-medium">
                      ህብረት፣ አንድነትና አገልግሎት
                    </span>
                  </div>
                </div>

                <div className={`p-4 rounded-lg ${
                  theme === 'dark' ? 'bg-[#1e293b]' : 'bg-white'
                } shadow`}>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#007bff] flex items-center justify-center">
                      <span className="text-white text-sm font-bold">5</span>
                    </div>
                    <span className="font-medium">
                      ወንጌል ስብከትና ማህበረሰብ አገልግሎት
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </div>

      {/* Blog Detail Dialog */}
      <Dialog 
        open={openViewDialog} 
        onClose={handleCloseViewDialog}
        maxWidth="lg"
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
        {selectedBlog && (
          <>
            <DialogTitle sx={{ 
              backgroundColor: theme === 'dark' ? '#0f172a' : 'white',
              borderBottom: theme === 'dark' ? '1px solid #334155' : '1px solid #e5e7eb',
              py: 3,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                {selectedBlog.title}
              </Typography>
              <IconButton
                onClick={handleCloseViewDialog}
                sx={{ 
                  color: theme === 'dark' ? '#a8b2d1' : '#666666',
                  '&:hover': {
                    backgroundColor: theme === 'dark' ? '#1e293b' : '#f8fafc'
                  }
                }}
              >
                <Close />
              </IconButton>
            </DialogTitle>
            
            <DialogContent sx={{ p: 0, overflowY: 'auto' }}>
              {/* Blog Image - Using getImageUrl function */}
              <Box sx={{ 
                width: '100%',
                height: { xs: 200, md: 300 },
                overflow: 'hidden',
                position: 'relative'
              }}>
                {getImageUrl(selectedBlog) ? (
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
              </Box>
              
              <Box sx={{ p: 3 }}>
                {/* Meta Information */}
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
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <AccessTime fontSize="small" sx={{ color: theme === 'dark' ? '#a8b2d1' : '#666666' }} />
                    <Typography variant="body2" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                      {selectedBlog.readingTime} min read
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <RemoveRedEye fontSize="small" sx={{ color: theme === 'dark' ? '#a8b2d1' : '#666666' }} />
                    <Typography variant="body2" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                      {selectedBlog.viewsCount} views
                    </Typography>
                  </Box>
                </Box>
                
                {/* Category and Tags */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                  <Chip
                    label={selectedBlog.category}
                    sx={{ 
                      backgroundColor: theme === 'dark' ? '#334155' : '#e5e7eb',
                      color: theme === 'dark' ? '#a8b2d1' : '#666666'
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
                
                <Divider sx={{ my: 3 }} />
                
                {/* Content */}
                <Box sx={{ 
                  color: theme === 'dark' ? '#ccd6f6' : '#333333',
                  '& p': { mb: 2 },
                  '& h1, & h2, & h3, & h4, & h5, & h6': {
                    mb: 2,
                    color: theme === 'dark' ? '#ccd6f6' : '#333333'
                  },
                  '& ul, & ol': { pl: 3, mb: 2 },
                  '& img': { 
                    maxWidth: '100%', 
                    height: 'auto', 
                    borderRadius: 1,
                    margin: '1rem 0'
                  },
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
              </Box>
            </DialogContent>
            
            <DialogActions sx={{ 
              p: 3,
              borderTop: theme === 'dark' ? '1px solid #334155' : '1px solid #e5e7eb',
              backgroundColor: theme === 'dark' ? '#0f172a' : 'white',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 2
            }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Typography variant="body2" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                  Share:
                </Typography>
                <Tooltip title="Share on Facebook">
                  <IconButton
                    size="small"
                    onClick={shareOnFacebook}
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
                    onClick={shareOnWhatsApp}
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
                    onClick={shareOnTelegram}
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
                    onClick={shareViaEmail}
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
                    onClick={copyToClipboard}
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
                    onClick={shareFullBlogContent}
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
              
              <Button 
                onClick={handleCloseViewDialog}
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

      {/* Notification for copied link */}
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

      {/* Success Notification */}
      <Snackbar 
        open={!!success} 
        autoHideDuration={3000} 
        onClose={() => setSuccess('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
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

      {/* Error Notification */}
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

      <Footer />
    </div>
  );
};

export default BlogPage;