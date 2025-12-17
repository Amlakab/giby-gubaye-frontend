'use client';

import { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent,
  TextField, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow,
  Chip, Alert, Snackbar, CircularProgress,
  useMediaQuery, Pagination,
  MenuItem, Select, FormControl, InputLabel,
  IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, Button, Avatar, Tooltip,
  InputAdornment
} from '@mui/material';
import { motion } from 'framer-motion';
import { useTheme } from '@/lib/theme-context';
import {
  Assignment, AssignmentTurnedIn, AssignmentInd,
  Category, FilterList, Search, PersonAdd,
  Delete, Visibility, Assignment as AssignmentIcon,
  AdminPanelSettings, SupervisorAccount, Person, Description,
  School, Phone, Email, Cake, Work, Church,
  Female, Male, Home as HomeIcon, AccessTime, PersonPin,
  CalendarToday, Call, Business, Badge as BadgeIcon,
  Refresh, Block, CheckCircle, People, ExpandMore, ExpandLess,
  Translate, Language, AccountBalance, Home, Flag, LocationCity,
  Apartment, Translate as TranslateIcon, MenuBook, Language as LanguageIcon
} from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';
import { useAuth } from '@/lib/auth';
import { jobApi } from '@/app/utils/jobApi';
import api from '@/app/utils/api';

// Types
interface Student {
  _id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  motherName: string;
  phone: string;
  email: string;
  gender: 'male' | 'female';
  block: string;
  dorm: string;
  university: string;
  college: string;
  department: string;
  batch: string;
  region: string;
  zone: string;
  wereda: string;
  kebele: string;
  church: string;
  authority: string;
  job: string;
  motherTongue: string;
  additionalLanguages: string[];
  attendsCourse: boolean;
  courseName?: string;
  courseChurch?: string;
  dateOfBirth: string;
  emergencyContact: string;
  photo?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  numberOfJob: number;
  age?: number;
}

interface Job {
  _id: string;
  studentId: Student;
  class: string;
  sub_class?: string;
  type?: string;
  background?: string;
  createdAt: string;
  updatedAt: string;
}

interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalJobs: number;
  limit: number;
}

interface Filters {
  search: string;
  sub_class_filter: string;
  sub_class_value: string;
  page: number;
  limit: number;
}

interface JobStats {
  totalJobs: number;
  assignedWithSubClass: number;
  withoutSubClass: number;
  subClassStats: Array<{
    _id: string;
    count: number;
  }>;
  typeStats: Array<{
    _id: string;
    count: number;
  }>;
}

interface SubClassForm {
  sub_class: string;
  type: string;
  background: string;
}

interface ApiResponse {
  data: {
    data: {
      jobs: Job[];
      pagination: PaginationData;
    };
  };
}

interface StatsResponse {
  data: {
    data: JobStats;
  };
}

interface EligibleStudentsResponse {
  data: {
    data: Student[];
  };
}

// Type options with icons
const TYPE_OPTIONS = [
  { value: 'member', label: 'Member', icon: <Person fontSize="small" /> },
  { value: 'leader', label: 'Leader', icon: <AdminPanelSettings fontSize="small" /> },
  { value: 'sub_leader', label: 'Sub Leader', icon: <SupervisorAccount fontSize="small" /> },
  { value: 'Secretary', label: 'Secretary', icon: <Description fontSize="small" /> },
];

// Sub-class options
const SUBCLASS_OPTIONS = [
  'Timhrt',
  'Mikikir', 
  'Aseltagn',
  'Muya',
  'Family Leader'
];

const JobAssignmentPage = () => {
  const { theme } = useTheme();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(max-width: 1024px)');
  const { user } = useAuth();

  // State for job assignments
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [stats, setStats] = useState<JobStats | null>(null);
  
  // Pagination state
  const [pagination, setPagination] = useState<PaginationData>({
    currentPage: 1,
    totalPages: 1,
    totalJobs: 0,
    limit: 10,
  });

  // Filter states
  const [filters, setFilters] = useState<Filters>({
    search: '',
    sub_class_filter: '',
    sub_class_value: '',
    page: 1,
    limit: 10,
  });

  // Dialog states
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openAssignSubClassDialog, setOpenAssignSubClassDialog] = useState(false);
  const [openViewStudentDialog, setOpenViewStudentDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [expandedJob, setExpandedJob] = useState<string | null>(null);
  
  // Selected items
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  
  // Eligible students for assignment
  const [eligibleStudents, setEligibleStudents] = useState<Student[]>([]);
  const [eligibleLoading, setEligibleLoading] = useState(false);
  const [eligibleSearch, setEligibleSearch] = useState('');

  // Sub-class form state
  const [subClassForm, setSubClassForm] = useState<SubClassForm>({
    sub_class: '',
    type: 'member',
    background: '',
  });

  // Track already assigned types for selected sub-class
  const [assignedTypes, setAssignedTypes] = useState<string[]>([]);

  // State for student's ALL jobs (across all classes)
  const [studentAllJobs, setStudentAllJobs] = useState<Job[]>([]);
  const [loadingStudentAllJobs, setLoadingStudentAllJobs] = useState(false);

  // Theme styles - MATCHING STUDENT PAGE
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

  // Stats cards colors - MATCHING STUDENT PAGE
  const statCards = [
    {
      title: 'Total Assignments',
      value: stats?.totalJobs || 0,
      icon: <Assignment sx={{ fontSize: 28 }} />,
      color: theme === 'dark' ? '#00ffff' : '#007bff'
    },
    {
      title: 'With Sub-class',
      value: stats?.assignedWithSubClass || 0,
      icon: <AssignmentTurnedIn sx={{ fontSize: 28 }} />,
      color: theme === 'dark' ? '#00ff00' : '#28a745'
    },
    {
      title: 'Without Sub-class',
      value: stats?.withoutSubClass || 0,
      icon: <AssignmentInd sx={{ fontSize: 28 }} />,
      color: theme === 'dark' ? '#ff0000' : '#dc3545'
    },
    {
      title: 'Sub-class Types',
      value: stats?.subClassStats?.length || 0,
      icon: <Category sx={{ fontSize: 28 }} />,
      color: theme === 'dark' ? '#ff00ff' : '#9333ea'
    }
  ];

  useEffect(() => {
    if (user) {
      fetchJobs();
      fetchStats();
    }
  }, [filters.page, filters.limit, filters.search, filters.sub_class_filter, filters.sub_class_value, user]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      
      const params = {
        page: filters.page,
        limit: filters.limit,
        search: filters.search,
        sub_class: filters.sub_class_filter,
        sub_class_value: filters.sub_class_value,
      };

      const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([_, value]) => 
          value !== '' && value !== null && value !== undefined
        )
      );

      const response = await jobApi.getJobs(cleanParams) as ApiResponse;
      setJobs(response.data.data.jobs || []);
      setPagination(response.data.data.pagination || {
        currentPage: 1,
        totalPages: 1,
        totalJobs: 0,
        limit: 10,
      });
      setError('');
    } catch (error: any) {
      console.error('Error fetching jobs:', error);
      setError(error.response?.data?.message || 'Failed to fetch job assignments');
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await jobApi.getJobStats() as StatsResponse;
      setStats(response.data.data);
    } catch (error) {
      console.error('Failed to fetch job stats:', error);
    }
  };

  const fetchEligibleStudents = async (search = '') => {
    try {
      setEligibleLoading(true);
      const response = await jobApi.getEligibleStudents(search) as EligibleStudentsResponse;
      setEligibleStudents(response.data.data || []);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to fetch eligible students');
      setEligibleStudents([]);
    } finally {
      setEligibleLoading(false);
    }
  };

  const fetchStudentAllJobs = async (studentId: string) => {
    try {
      setLoadingStudentAllJobs(true);
      const response = await api.get(`/jobs/student/${studentId}/all`);
      setStudentAllJobs(response.data.data.jobs || []);
    } catch (error: any) {
      console.error('Failed to fetch student all jobs:', error);
      setStudentAllJobs([]);
    } finally {
      setLoadingStudentAllJobs(false);
    }
  };

  const handleAssignJob = async (student: Student) => {
    try {
      await jobApi.assignJob(student._id);
      setSuccess(`Job assigned successfully to ${student.firstName} ${student.lastName}`);
      setOpenAddDialog(false);
      fetchJobs();
      fetchStats();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to assign job');
    }
  };

  const handleUpdateSubClass = async () => {
    if (!selectedJob) return;

    try {
      await jobApi.updateJob(selectedJob._id, subClassForm);
      setSuccess('Job details updated successfully');
      setOpenAssignSubClassDialog(false);
      setSubClassForm({ sub_class: '', type: 'member', background: '' });
      setAssignedTypes([]);
      fetchJobs();
      fetchStats();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to update job details');
    }
  };

  const handleDeleteJob = async () => {
    if (!selectedJob) return;

    try {
      await jobApi.deleteJob(selectedJob._id);
      setSuccess('Job assignment deleted successfully');
      setOpenDeleteDialog(false);
      setSelectedJob(null);
      fetchJobs();
      fetchStats();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to delete job assignment');
    }
  };

  const handleOpenAddDialog = () => {
    setOpenAddDialog(true);
    fetchEligibleStudents();
  };

  const handleOpenAssignSubClassDialog = (job: Job) => {
    setSelectedJob(job);
    setSubClassForm({
      sub_class: job.sub_class || '',
      type: job.type || 'member',
      background: job.background || '',
    });

    const currentSubClass = job.sub_class || '';
    if (currentSubClass) {
      const typesInSameSubClass = jobs
        .filter(j => j._id !== job._id && j.sub_class === currentSubClass && j.type)
        .map(j => j.type!);
      setAssignedTypes(typesInSameSubClass);
    } else {
      setAssignedTypes([]);
    }

    setOpenAssignSubClassDialog(true);
  };

  const handleOpenViewStudentDialog = async (student: Student) => {
    setSelectedStudent(student);
    setOpenViewStudentDialog(true);
    
    const studentJob = jobs.find(job => job.studentId._id === student._id);
    setSelectedJob(studentJob || null);
    
    await fetchStudentAllJobs(student._id);
  };

  const handleSubClassChange = (value: string) => {
    setSubClassForm(prev => ({ ...prev, sub_class: value }));
    
    if (value) {
      const typesInSameSubClass = jobs
        .filter(j => j.sub_class === value && j.type)
        .map(j => j.type!);
      setAssignedTypes(typesInSameSubClass);
    } else {
      setAssignedTypes([]);
    }
  };

  const handleFilterChange = (field: keyof Filters, value: string | number) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
      ...(field !== 'page' && { page: 1 }),
    }));
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    handleFilterChange('page', value);
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      sub_class_filter: '',
      sub_class_value: '',
      page: 1,
      limit: 10,
    });
  };

  const toggleExpandJob = (jobId: string) => {
    setExpandedJob(expandedJob === jobId ? null : jobId);
  };

  // Helper functions
  const getPhotoUrl = (photoPath?: string): string | null => {
    if (!photoPath) return null;
    if (photoPath.startsWith('http')) return photoPath;
    
    const serverUrl = 'http://localhost:3001';
    let cleanPath = photoPath;
    
    if (!cleanPath.startsWith('/uploads')) {
      if (cleanPath.startsWith('uploads')) {
        cleanPath = '/' + cleanPath;
      } else {
        cleanPath = `/uploads/students/${cleanPath}`;
      }
    }
    
    return `${serverUrl}${cleanPath}`;
  };

  const getStudentInitials = (student: Student): string => {
    return `${student.firstName.charAt(0)}${student.lastName.charAt(0)}`.toUpperCase();
  };

  const getAvatarColor = (id: string): string => {
    const colors = [
      '#1976d2', '#2e7d32', '#ed6c02', '#d32f2f', '#7b1fa2',
      '#00796b', '#388e3c', '#f57c00', '#0288d1', '#c2185b'
    ];
    const index = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMMM dd, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  const calculateAge = (dateOfBirth: string): string => {
    if (!dateOfBirth) return 'N/A';
    try {
      const today = new Date();
      const birthDate = new Date(dateOfBirth);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return `${age} years`;
    } catch (error) {
      return 'N/A';
    }
  };

  const getJobStatusColor = (job: Job): 'success' | 'warning' => {
    if (job.sub_class) return 'success';
    return 'warning';
  };

  const getTypeIcon = (type?: string) => {
    switch (type) {
      case 'leader': return <AdminPanelSettings fontSize="small" />;
      case 'sub_leader': return <SupervisorAccount fontSize="small" />;
      case 'Secretary': return <Description fontSize="small" />;
      default: return <Person fontSize="small" />;
    }
  };

  const getTypeColor = (type?: string) => {
    switch (type) {
      case 'leader': return 'error';
      case 'sub_leader': return 'warning';
      case 'Secretary': return 'info';
      default: return 'default';
    }
  };

  const getTypeLabel = (type?: string) => {
    switch (type) {
      case 'leader': return 'Leader';
      case 'sub_leader': return 'Sub Leader';
      case 'Secretary': return 'Secretary';
      case 'member': return 'Member';
      default: return 'Not Set';
    }
  };

  const isTypeAlreadyAssigned = (type: string, currentJobId?: string) => {
    if (type === 'member') return false;
    return assignedTypes.includes(type);
  };

  const getGenderIcon = (gender: string) => {
    return gender === 'male' ? <Male /> : <Female />;
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'success' : 'error';
  };

  // Safe display function for optional fields
  const safeDisplay = (value: any, defaultValue: string = 'N/A'): string => {
    if (value === null || value === undefined || value === '') return defaultValue;
    return value;
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
          {/* Header - MATCHING STUDENT PAGE */}
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
                Job Assignment Management
              </Typography>
              <Typography variant={isMobile ? "body2" : "body1"} color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                Assign and manage job classes for students
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
                  icon={<AssignmentIcon sx={{ fontSize: 16 }} />}
                />
              </Box>
            </Box>
          </motion.div>

          {/* Statistics Cards - MATCHING STUDENT PAGE STYLE */}
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
              gap: 3,
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
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Box sx={{ 
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        bgcolor: theme === 'dark' ? `${stat.color}20` : `${stat.color}10`,
                        mr: 2
                      }}>
                        <Box sx={{ color: stat.color }}>
                          {stat.icon}
                        </Box>
                      </Box>
                      <Box>
                        <Typography variant="body2" color={theme === 'dark' ? '#a8b2d1' : '#666666'} sx={{ fontWeight: 500 }}>
                          {stat.title}
                        </Typography>
                        <Typography variant="h4" sx={{ 
                          fontWeight: 'bold', 
                          color: theme === 'dark' ? '#ccd6f6' : '#333333',
                          fontSize: { xs: '1.75rem', md: '2rem' }
                        }}>
                          {stat.value}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </motion.div>

          {/* Filter and Action Section - MATCHING STUDENT PAGE STYLE */}
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
                    <FilterList /> Assignment Filters
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
                      Reset
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<PersonAdd />}
                      onClick={handleOpenAddDialog}
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
                      Assign Class
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
                  gap: 3
                }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Search Assignments"
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    placeholder="Search by student name, phone, or email..."
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
                    <InputLabel sx={{ 
                      color: theme === 'dark' ? '#a8b2d1' : '#666666',
                      '&.Mui-focused': {
                        color: theme === 'dark' ? '#00ffff' : '#007bff',
                      }
                    }}>
                      Sub-class Status
                    </InputLabel>
                    <Select
                      value={filters.sub_class_filter}
                      label="Sub-class Status"
                      onChange={(e) => handleFilterChange('sub_class_filter', e.target.value)}
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
                          All Status
                        </Typography>
                      </MenuItem>
                      <MenuItem value="assigned">With Sub-class</MenuItem>
                      <MenuItem value="not_assigned">Without Sub-class</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <FormControl fullWidth size="small">
                    <InputLabel sx={{ 
                      color: theme === 'dark' ? '#a8b2d1' : '#666666',
                      '&.Mui-focused': {
                        color: theme === 'dark' ? '#00ffff' : '#007bff',
                      }
                    }}>
                      Sub-class Value
                    </InputLabel>
                    <Select
                      value={filters.sub_class_value}
                      label="Sub-class Value"
                      onChange={(e) => handleFilterChange('sub_class_value', e.target.value)}
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
                      <MenuItem value="">All Sub-classes</MenuItem>
                      {SUBCLASS_OPTIONS.map((option) => (
                        <MenuItem key={option} value={option}>
                          <Typography variant="body2" color={theme === 'dark' ? '#ccd6f6' : '#333333'}>
                            {option}
                          </Typography>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  
                  <FormControl fullWidth size="small">
                    <InputLabel sx={{ 
                      color: theme === 'dark' ? '#a8b2d1' : '#666666',
                      '&.Mui-focused': {
                        color: theme === 'dark' ? '#00ffff' : '#007bff',
                      }
                    }}>
                      Per Page
                    </InputLabel>
                    <Select
                      value={filters.limit}
                      label="Per Page"
                      onChange={(e) => handleFilterChange('limit', Number(e.target.value))}
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
                      <MenuItem value={5}>5</MenuItem>
                      <MenuItem value={10}>10</MenuItem>
                      <MenuItem value={25}>25</MenuItem>
                      <MenuItem value={50}>50</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </CardContent>
            </Card>
          </motion.div>

          {/* Job Assignments List */}
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
              {/* Mobile View - Cards */}
              {isMobile ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {jobs.map((job) => {
                    const student = job.studentId;
                    const isExpanded = expandedJob === job._id;
                    const photoUrl = getPhotoUrl(student.photo);
                    
                    return (
                      <Card 
                        key={job._id} 
                        sx={{ 
                          borderRadius: 2,
                          boxShadow: theme === 'dark' 
                            ? '0 2px 8px rgba(0,0,0,0.3)' 
                            : '0 2px 8px rgba(0,0,0,0.1)',
                          border: theme === 'dark' 
                            ? '1px solid #334155' 
                            : '1px solid #e5e7eb',
                          backgroundColor: theme === 'dark' ? '#0f172a80' : 'white',
                          backdropFilter: theme === 'dark' ? 'blur(10px)' : 'none'
                        }}
                      >
                        <CardContent sx={{ p: 3 }}>
                          <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'flex-start',
                            mb: 2
                          }}>
                            <Box>
                              <Typography variant="subtitle1" sx={{ 
                                fontWeight: 'bold',
                                color: theme === 'dark' ? '#ccd6f6' : '#333333',
                                mb: 0.5
                              }}>
                                {student.firstName} {student.lastName}
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                <Chip
                                  label={job.class}
                                  size="small"
                                  icon={<Assignment />}
                                  sx={{ height: 24 }}
                                />
                                {job.sub_class && (
                                  <Chip
                                    label={job.sub_class}
                                    size="small"
                                    icon={<AssignmentTurnedIn />}
                                    sx={{ height: 24 }}
                                  />
                                )}
                              </Box>
                            </Box>
                            <IconButton 
                              size="small" 
                              onClick={() => toggleExpandJob(job._id)}
                              sx={{ color: theme === 'dark' ? '#a8b2d1' : '#666666' }}
                            >
                              {isExpanded ? <ExpandLess /> : <ExpandMore />}
                            </IconButton>
                          </Box>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                            <Phone fontSize="small" sx={{ color: theme === 'dark' ? '#a8b2d1' : '#666666' }} />
                            <Typography variant="body2" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                              {student.phone}
                            </Typography>
                          </Box>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                            <School fontSize="small" sx={{ color: theme === 'dark' ? '#a8b2d1' : '#666666' }} />
                            <Typography variant="body2" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                              {student.college}
                            </Typography>
                          </Box>

                          <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            mb: 2
                          }}>
                            <Typography variant="body2" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                              Status:
                            </Typography>
                            <Chip
                              label={job.sub_class ? 'Sub-class Assigned' : 'Pending Sub-class'}
                              color={getJobStatusColor(job)}
                              size="small"
                              sx={{ height: 24, fontSize: '0.75rem' }}
                            />
                          </Box>

                          {isExpanded && (
                            <Box sx={{ 
                              pt: 2,
                              borderTop: theme === 'dark' ? '1px solid #334155' : '1px solid #e5e7eb',
                              mt: 2
                            }}>
                              <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color={theme === 'dark' ? '#a8b2d1' : '#666666'} sx={{ fontWeight: 500, mb: 0.5 }}>
                                  Type:
                                </Typography>
                                {job.type ? (
                                  <Chip
                                    icon={getTypeIcon(job.type)}
                                    label={getTypeLabel(job.type)}
                                    color={getTypeColor(job.type)}
                                    size="small"
                                    sx={{ height: 24 }}
                                  />
                                ) : (
                                  <Typography variant="body2" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                                    Not set
                                  </Typography>
                                )}
                              </Box>
                              
                              {job.background && (
                                <Box sx={{ mb: 2 }}>
                                  <Typography variant="body2" color={theme === 'dark' ? '#a8b2d1' : '#666666'} sx={{ fontWeight: 500, mb: 0.5 }}>
                                    Background:
                                  </Typography>
                                  <Typography variant="body2" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                                    {job.background}
                                  </Typography>
                                </Box>
                              )}
                              
                              <Box sx={{ 
                                display: 'flex', 
                                justifyContent: 'space-between',
                                mb: 2
                              }}>
                                <Typography variant="body2" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                                  Assigned:
                                </Typography>
                                <Typography variant="body2" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                                  {formatDate(job.createdAt)}
                                </Typography>
                              </Box>
                              
                              <Box sx={{ 
                                display: 'grid',
                                gridTemplateColumns: 'repeat(2, 1fr)',
                                gap: 1,
                                mt: 2
                              }}>
                                <Button
                                  variant="outlined"
                                  startIcon={<Visibility />}
                                  onClick={() => handleOpenViewStudentDialog(student)}
                                  size="small"
                                  sx={{
                                    borderRadius: 1,
                                    borderColor: theme === 'dark' ? '#00ffff' : '#007bff',
                                    color: theme === 'dark' ? '#00ffff' : '#007bff',
                                    '&:hover': {
                                      backgroundColor: theme === 'dark' ? '#00ffff20' : '#007bff10'
                                    }
                                  }}
                                >
                                  View
                                </Button>
                                <Button
                                  variant="outlined"
                                  startIcon={<AssignmentTurnedIn />}
                                  onClick={() => handleOpenAssignSubClassDialog(job)}
                                  size="small"
                                  sx={{
                                    borderRadius: 1,
                                    borderColor: theme === 'dark' ? '#00ffff' : '#007bff',
                                    color: theme === 'dark' ? '#00ffff' : '#007bff',
                                    '&:hover': {
                                      backgroundColor: theme === 'dark' ? '#00ffff20' : '#007bff10'
                                    }
                                  }}
                                >
                                  Assign
                                </Button>
                                <Button
                                  variant="outlined"
                                  startIcon={<Delete />}
                                  onClick={() => {
                                    setSelectedJob(job);
                                    setOpenDeleteDialog(true);
                                  }}
                                  size="small"
                                  color="error"
                                  sx={{ 
                                    borderRadius: 1,
                                    borderColor: theme === 'dark' ? '#ff0000' : '#dc3545',
                                    color: theme === 'dark' ? '#ff0000' : '#dc3545',
                                    '&:hover': {
                                      backgroundColor: theme === 'dark' ? '#ff000020' : '#dc354510'
                                    }
                                  }}
                                >
                                  Delete
                                </Button>
                              </Box>
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </Box>
              ) : (
                /* Desktop/Tablet View - Table */
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
                            py: 2
                          }}>
                            Student
                          </TableCell>
                          <TableCell sx={{ 
                            color: 'white', 
                            fontWeight: 'bold',
                            fontSize: '0.875rem',
                            py: 2
                          }}>
                            College/Dept
                          </TableCell>
                          <TableCell sx={{ 
                            color: 'white', 
                            fontWeight: 'bold',
                            fontSize: '0.875rem',
                            py: 2
                          }}>
                            Class
                          </TableCell>
                          <TableCell sx={{ 
                            color: 'white', 
                            fontWeight: 'bold',
                            fontSize: '0.875rem',
                            py: 2
                          }}>
                            Sub-class
                          </TableCell>
                          <TableCell sx={{ 
                            color: 'white', 
                            fontWeight: 'bold',
                            fontSize: '0.875rem',
                            py: 2
                          }}>
                            Type
                          </TableCell>
                          <TableCell sx={{ 
                            color: 'white', 
                            fontWeight: 'bold',
                            fontSize: '0.875rem',
                            py: 2
                          }}>
                            Status
                          </TableCell>
                          <TableCell sx={{ 
                            color: 'white', 
                            fontWeight: 'bold',
                            fontSize: '0.875rem',
                            py: 2
                          }}>
                            Assigned Date
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
                        {jobs.map((job) => {
                          const student = job.studentId;
                          const photoUrl = getPhotoUrl(student.photo);
                          
                          return (
                            <TableRow 
                              key={job._id} 
                              hover
                              sx={{ 
                                '&:hover': {
                                  backgroundColor: theme === 'dark' ? '#1e293b' : '#f8fafc'
                                }
                              }}
                            >
                              <TableCell sx={{ py: 2.5 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                  <Avatar
                                    src={photoUrl || undefined}
                                    sx={{ 
                                      width: 40, 
                                      height: 40,
                                      bgcolor: getAvatarColor(student._id),
                                      fontSize: '0.875rem',
                                      fontWeight: 'bold'
                                    }}
                                  >
                                    {getStudentInitials(student)}
                                  </Avatar>
                                  <Box>
                                    <Typography variant="body2" sx={{ 
                                      fontWeight: 500,
                                      color: theme === 'dark' ? '#ccd6f6' : '#333333'
                                    }}>
                                      {student.firstName} {student.lastName}
                                    </Typography>
                                    <Typography variant="body2" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                                      {student.phone}
                                    </Typography>
                                  </Box>
                                </Box>
                              </TableCell>
                              <TableCell sx={{ py: 2.5 }}>
                                <Typography variant="body2" sx={{ fontWeight: 'medium', color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                                  {student.college}
                                </Typography>
                                <Typography variant="body2" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                                  {student.department}
                                </Typography>
                              </TableCell>
                              <TableCell sx={{ py: 2.5 }}>
                                <Chip
                                  label={job.class}
                                  color="primary"
                                  size="small"
                                  sx={{ height: 24, fontSize: '0.75rem' }}
                                />
                              </TableCell>
                              <TableCell sx={{ py: 2.5 }}>
                                {job.sub_class ? (
                                  <Chip
                                    label={job.sub_class}
                                    color="success"
                                    size="small"
                                    sx={{ height: 24, fontSize: '0.75rem' }}
                                  />
                                ) : (
                                  <Typography variant="body2" color={theme === 'dark' ? '#94a3b8' : '#999999'} sx={{ fontSize: '0.75rem' }}>
                                    Not assigned
                                  </Typography>
                                )}
                              </TableCell>
                              <TableCell sx={{ py: 2.5 }}>
                                {job.type ? (
                                  <Chip
                                    icon={getTypeIcon(job.type)}
                                    label={getTypeLabel(job.type)}
                                    color={getTypeColor(job.type)}
                                    size="small"
                                    sx={{ height: 24, fontSize: '0.75rem' }}
                                  />
                                ) : (
                                  <Typography variant="body2" color={theme === 'dark' ? '#94a3b8' : '#999999'} sx={{ fontSize: '0.75rem' }}>
                                    Not set
                                  </Typography>
                                )}
                              </TableCell>
                              <TableCell sx={{ py: 2.5 }}>
                                <Chip
                                  label={job.sub_class ? 'Sub-class Assigned' : 'Pending Sub-class'}
                                  color={getJobStatusColor(job)}
                                  size="small"
                                  sx={{ 
                                    height: 24,
                                    fontSize: '0.75rem'
                                  }}
                                />
                              </TableCell>
                              <TableCell sx={{ py: 2.5 }}>
                                <Typography variant="body2" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                                  {formatDate(job.createdAt)}
                                </Typography>
                              </TableCell>
                              <TableCell sx={{ py: 2.5 }}>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                  <Tooltip title="View Student">
                                    <IconButton
                                      size="small"
                                      onClick={() => handleOpenViewStudentDialog(student)}
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
                                  <Tooltip title="Assign Sub-class">
                                    <IconButton
                                      size="small"
                                      onClick={() => handleOpenAssignSubClassDialog(job)}
                                      sx={{ 
                                        color: theme === 'dark' ? '#00ffff' : '#007bff',
                                        '&:hover': {
                                          backgroundColor: theme === 'dark' ? '#00ffff20' : '#007bff10'
                                        }
                                      }}
                                    >
                                      <AssignmentTurnedIn fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Delete Assignment">
                                    <IconButton
                                      size="small"
                                      onClick={() => {
                                        setSelectedJob(job);
                                        setOpenDeleteDialog(true);
                                      }}
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
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  {jobs.length === 0 && !loading && (
                    <Box sx={{ 
                      textAlign: 'center', 
                      py: 8,
                      px: 2
                    }}>
                      <Assignment sx={{ 
                        fontSize: 64, 
                        color: theme === 'dark' ? '#334155' : '#cbd5e1',
                        mb: 2
                      }} />
                      <Typography variant="h6" color={theme === 'dark' ? '#a8b2d1' : '#666666'} sx={{ mb: 1 }}>
                        No job assignments found
                      </Typography>
                      <Typography variant="body2" color={theme === 'dark' ? '#94a3b8' : '#999999'}>
                        Start by assigning a class to students
                      </Typography>
                    </Box>
                  )}
                </Card>
              )}

              {/* Pagination - MATCHING STUDENT PAGE STYLE */}
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
                    Showing {((filters.page - 1) * filters.limit) + 1} to {Math.min(filters.page * filters.limit, pagination.totalJobs)} of {pagination.totalJobs} assignments
                  </Typography>
                </Box>
              )}
            </motion.div>
          )}

          {/* Add Class Dialog - MATCHING STUDENT PAGE STYLE */}
          <Dialog 
            open={openAddDialog} 
            onClose={() => setOpenAddDialog(false)} 
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
            <DialogTitle sx={{ 
              background: theme === 'dark'
                ? 'linear-gradient(135deg, #00ffff, #00b3b3)'
                : 'linear-gradient(135deg, #007bff, #0056b3)',
              color: 'white',
              py: 3
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonAdd /> Assign Class to Students
              </Box>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', display: 'block', mt: 1 }}>
                Only students with less than 3 job assignments are shown
              </Typography>
            </DialogTitle>
            <DialogContent sx={{ p: 3 }}>
              <Box sx={{ pt: 2 }}>
                {/* Search for eligible students */}
                <TextField
                  fullWidth
                  size="small"
                  label="Search Students"
                  value={eligibleSearch}
                  onChange={(e) => {
                    setEligibleSearch(e.target.value);
                    fetchEligibleStudents(e.target.value);
                  }}
                  placeholder="Search by name, phone, or email..."
                  InputProps={{
                    startAdornment: (
                      <Search sx={{ 
                        color: theme === 'dark' ? '#a8b2d1' : '#666666',
                        mr: 1 
                      }} />
                    ),
                  }}
                  sx={{ mb: 2,
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
                  }}
                />

                {eligibleLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress size={30} sx={{ color: theme === 'dark' ? '#00ffff' : '#007bff' }} />
                  </Box>
                ) : (
                  <Box sx={{ maxHeight: '400px', overflow: 'auto' }}>
                    {eligibleStudents.length === 0 ? (
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <People sx={{ 
                          fontSize: 48, 
                          color: theme === 'dark' ? '#334155' : '#cbd5e1',
                          mb: 2
                        }} />
                        <Typography variant="body1" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                          {eligibleSearch ? 'No matching students found' : 'No eligible students available'}
                        </Typography>
                      </Box>
                    ) : (
                      eligibleStudents.map((student) => (
                        <Card key={student._id} sx={{ 
                          mb: 1, 
                          border: theme === 'dark' ? '1px solid #334155' : '1px solid #e5e7eb',
                          backgroundColor: theme === 'dark' ? '#0f172a80' : '#f8fafc',
                          borderRadius: 1
                        }}>
                          <CardContent sx={{ p: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Avatar
                                src={getPhotoUrl(student.photo) || undefined}
                                sx={{ 
                                  bgcolor: getAvatarColor(student._id),
                                  width: 40,
                                  height: 40
                                }}
                              >
                                {getStudentInitials(student)}
                              </Avatar>
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="body1" sx={{ fontWeight: 'medium', color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                                  {student.firstName} {student.middleName} {student.lastName}
                                </Typography>
                                <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                                  {student.phone} • {student.email}
                                </Typography>
                                <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'} sx={{ display: 'block' }}>
                                  {student.college} • {student.department}
                                </Typography>
                                <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'} sx={{ display: 'block' }}>
                                  Current jobs: {student.numberOfJob}/3
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button
                                  variant="outlined"
                                  size="small"
                                  startIcon={<Visibility />}
                                  onClick={() => handleOpenViewStudentDialog(student)}
                                  sx={{
                                    borderRadius: 1,
                                    borderColor: theme === 'dark' ? '#00ffff' : '#007bff',
                                    color: theme === 'dark' ? '#00ffff' : '#007bff',
                                    '&:hover': {
                                      backgroundColor: theme === 'dark' ? '#00ffff20' : '#007bff10'
                                    }
                                  }}
                                >
                                  View
                                </Button>
                                <Button
                                  variant="contained"
                                  size="small"
                                  startIcon={<Assignment />}
                                  onClick={() => handleAssignJob(student)}
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
                                  Assign Class
                                </Button>
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>
                      ))
                    )}
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
                onClick={() => setOpenAddDialog(false)}
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
          </Dialog>

          {/* Assign Sub-class Dialog - MATCHING STUDENT PAGE STYLE */}
          <Dialog 
            open={openAssignSubClassDialog} 
            onClose={() => setOpenAssignSubClassDialog(false)} 
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
            <DialogTitle sx={{ 
              background: theme === 'dark'
                ? 'linear-gradient(135deg, #00ffff, #00b3b3)'
                : 'linear-gradient(135deg, #007bff, #0056b3)',
              color: 'white',
              py: 3
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AssignmentTurnedIn /> Assign Sub-class and Type
              </Box>
            </DialogTitle>
            <DialogContent>
              {selectedJob && (
                <Box sx={{ pt: 3 }}>
                  {/* Student Info */}
                  <Card sx={{ 
                    mb: 3, 
                    borderRadius: 1,
                    backgroundColor: theme === 'dark' ? '#1e293b' : '#f8f9fa',
                    border: theme === 'dark' ? '1px solid #334155' : '1px solid #e5e7eb'
                  }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Avatar
                          src={getPhotoUrl(selectedJob.studentId.photo) || undefined}
                          sx={{ 
                            width: 60, 
                            height: 60,
                            bgcolor: getAvatarColor(selectedJob.studentId._id),
                            fontSize: '1.2rem',
                            fontWeight: 'bold'
                          }}
                        >
                          {getStudentInitials(selectedJob.studentId)}
                        </Avatar>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 'bold', color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                            {selectedJob.studentId.firstName} {selectedJob.studentId.lastName}
                          </Typography>
                          <Typography variant="body2" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                            {selectedJob.studentId.phone} • {selectedJob.studentId.email}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        <Chip
                          label={`Class: ${selectedJob.class}`}
                          color="primary"
                          size="small"
                          sx={{ 
                            backgroundColor: theme === 'dark' ? '#00ffff20' : '#007bff20',
                            color: theme === 'dark' ? '#00ffff' : '#007bff'
                          }}
                        />
                        <Chip
                          label={`Jobs: ${selectedJob.studentId.numberOfJob}/3`}
                          color={selectedJob.studentId.numberOfJob >= 3 ? "error" : "success"}
                          size="small"
                        />
                      </Box>
                    </CardContent>
                  </Card>

                  {/* Sub-class Form */}
                  <FormControl fullWidth sx={{ mb: 3 }}>
                    <InputLabel sx={{ 
                      color: theme === 'dark' ? '#a8b2d1' : '#666666',
                      '&.Mui-focused': {
                        color: theme === 'dark' ? '#00ffff' : '#007bff',
                      }
                    }}>
                      Select Sub-class
                    </InputLabel>
                    <Select
                      value={subClassForm.sub_class}
                      label="Select Sub-class"
                      onChange={(e) => handleSubClassChange(e.target.value)}
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
                          Select a sub-class
                        </Typography>
                      </MenuItem>
                      {SUBCLASS_OPTIONS.map((option) => (
                        <MenuItem key={option} value={option}>
                          <Typography variant="body2" color={theme === 'dark' ? '#ccd6f6' : '#333333'}>
                            {option}
                          </Typography>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {/* Type Selection */}
                  {subClassForm.sub_class && (
                    <FormControl fullWidth sx={{ mb: 3 }}>
                      <InputLabel sx={{ 
                        color: theme === 'dark' ? '#a8b2d1' : '#666666',
                        '&.Mui-focused': {
                          color: theme === 'dark' ? '#00ffff' : '#007bff',
                        }
                      }}>
                        Select Type
                      </InputLabel>
                      <Select
                        value={subClassForm.type}
                        label="Select Type"
                        onChange={(e) => setSubClassForm({ ...subClassForm, type: e.target.value })}
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
                        {TYPE_OPTIONS.map((option) => (
                          <MenuItem 
                            key={option.value} 
                            value={option.value}
                            disabled={isTypeAlreadyAssigned(option.value, selectedJob._id)}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box sx={{ color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                                {option.icon}
                              </Box>
                              <Typography variant="body2" color={theme === 'dark' ? '#ccd6f6' : '#333333'}>
                                {option.label}
                              </Typography>
                              {isTypeAlreadyAssigned(option.value, selectedJob._id) && (
                                <Typography variant="caption" color="error" sx={{ ml: 'auto' }}>
                                  Already assigned
                                </Typography>
                              )}
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}

                  <TextField
                    fullWidth
                    label="Background (Optional)"
                    multiline
                    rows={4}
                    value={subClassForm.background}
                    onChange={(e) => setSubClassForm({ ...subClassForm, background: e.target.value })}
                    placeholder="Enter background information..."
                    sx={{ mb: 2,
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
                    }}
                  />

                  {/* Validation Rules Alert */}
                  {subClassForm.sub_class && subClassForm.type && subClassForm.type !== 'member' && (
                    <Alert severity="info" sx={{ 
                      mb: 2,
                      backgroundColor: theme === 'dark' ? '#00ffff20' : '#007bff10',
                      color: theme === 'dark' ? '#ccd6f6' : '#333333'
                    }}>
                      <Typography variant="body2" fontWeight="bold">
                        Type Rules:
                      </Typography>
                      <Typography variant="caption">
                        • Only one {subClassForm.type} allowed per sub-class
                        <br />
                        • Members can be duplicated
                      </Typography>
                    </Alert>
                  )}

                  {selectedJob.sub_class && (
                    <Alert severity="info" sx={{ 
                      mb: 2,
                      backgroundColor: theme === 'dark' ? '#00ffff20' : '#007bff10',
                      color: theme === 'dark' ? '#ccd6f6' : '#333333'
                    }}>
                      <Typography variant="body2">
                        Current sub-class: <strong style={{color: theme === 'dark' ? '#00ffff' : '#007bff'}}>{selectedJob.sub_class}</strong>
                        {selectedJob.type && (
                          <div>Current type: <strong style={{color: theme === 'dark' ? '#00ffff' : '#007bff'}}>{getTypeLabel(selectedJob.type)}</strong></div>
                        )}
                        {selectedJob.background && (
                          <div>Current background: {selectedJob.background}</div>
                        )}
                      </Typography>
                    </Alert>
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
                onClick={() => setOpenAssignSubClassDialog(false)}
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
                onClick={handleUpdateSubClass}
                variant="contained"
                disabled={!subClassForm.sub_class}
                startIcon={<AssignmentTurnedIn />}
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
                {selectedJob?.sub_class ? 'Update Details' : 'Assign Sub-class'}
              </Button>
            </DialogActions>
          </Dialog>

          {/* View Student Dialog - COMPLETE VERSION with all student attributes */}
          <Dialog 
            open={openViewStudentDialog} 
            onClose={() => setOpenViewStudentDialog(false)} 
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
            {selectedStudent && (
              <>
                <DialogTitle sx={{ 
                  background: theme === 'dark'
                    ? 'linear-gradient(135deg, #00ffff, #00b3b3)'
                    : 'linear-gradient(135deg, #007bff, #0056b3)',
                  color: 'white',
                  py: 3
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar
                      src={getPhotoUrl(selectedStudent.photo) || undefined}
                      sx={{ 
                        width: 50, 
                        height: 50,
                        bgcolor: getAvatarColor(selectedStudent._id),
                        fontSize: '1.2rem',
                        fontWeight: 'bold'
                      }}
                    >
                      {getStudentInitials(selectedStudent)}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {selectedStudent.firstName} {selectedStudent.middleName} {selectedStudent.lastName}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                        Student Profile
                      </Typography>
                    </Box>
                  </Box>
                </DialogTitle>
                <DialogContent sx={{ p: 3 }}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Box sx={{ pt: 3, pb: 2 }}>
                      {/* Profile Header */}
                      <Box sx={{ 
                        display: 'flex', 
                        flexDirection: isMobile ? 'column' : 'row', 
                        gap: 3,
                        mb: 4,
                        p: 3,
                        background: theme === 'dark' ? '#1e293b' : '#f8f9fa',
                        borderRadius: 2
                      }}>
                        <Box sx={{ 
                          display: 'flex', 
                          flexDirection: 'column', 
                          alignItems: 'center',
                          flex: 1 
                        }}>
                          <Avatar
                            src={getPhotoUrl(selectedStudent.photo) || undefined}
                            sx={{ 
                              width: 120, 
                              height: 120,
                              mb: 2,
                              border: '4px solid white',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                              bgcolor: getAvatarColor(selectedStudent._id),
                              fontSize: '2.5rem',
                              fontWeight: 'bold'
                            }}
                          >
                            {getStudentInitials(selectedStudent)}
                          </Avatar>
                          <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                            <Chip
                              label={selectedStudent.isActive ? 'Active' : 'Inactive'}
                              color={getStatusColor(selectedStudent.isActive)}
                              size="medium"
                            />
                            <Chip
                              label={selectedStudent.gender}
                              icon={getGenderIcon(selectedStudent.gender)}
                              variant="outlined"
                              size="medium"
                            />
                          </Box>
                          <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                            Student ID: {selectedStudent._id.substring(0, 8)}...
                          </Typography>
                        </Box>

                        <Box sx={{ flex: 2 }}>
                          <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', color: theme === 'dark' ? '#ccd6f6' : '#2c3e50' }}>
                            {selectedStudent.firstName} {selectedStudent.middleName} {selectedStudent.lastName}
                          </Typography>
                          
                          <Box sx={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 2, mb: 2 }}>
                            <Box>
                              <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                                <PersonPin fontSize="small" /> Mother's Name
                              </Typography>
                              <Typography variant="body1" sx={{ fontWeight: 'medium', color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                                {safeDisplay(selectedStudent.motherName)}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                                <CalendarToday fontSize="small" /> Date of Birth
                              </Typography>
                              <Typography variant="body1" sx={{ fontWeight: 'medium', color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                                {formatDate(selectedStudent.dateOfBirth)} ({calculateAge(selectedStudent.dateOfBirth)})
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                                <Work fontSize="small" /> Job
                              </Typography>
                              <Typography variant="body1" sx={{ fontWeight: 'medium', color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                                {safeDisplay(selectedStudent.job)}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                                <BadgeIcon fontSize="small" /> Number of Jobs
                              </Typography>
                              <Chip 
                                label={`${selectedStudent.numberOfJob}/3`} 
                                color={selectedStudent.numberOfJob >= 3 ? "error" : "success"}
                                size="medium"
                              />
                            </Box>
                          </Box>
                        </Box>
                      </Box>

                      {/* ALL Job Information Section */}
                      <Card sx={{ 
                        mb: 3, 
                        borderRadius: 2, 
                        boxShadow: theme === 'dark' 
                          ? '0 2px 8px rgba(0,0,0,0.3)' 
                          : '0 2px 8px rgba(0,0,0,0.1)',
                        backgroundColor: theme === 'dark' ? '#0f172a80' : 'white',
                        borderLeft: '4px solid #4CAF50'
                      }}>
                        <CardContent>
                          <Typography variant="h6" sx={{ 
                            mb: 2, 
                            fontWeight: 'bold',
                            color: theme === 'dark' ? '#ccd6f6' : '#333333',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1
                          }}>
                            <Assignment /> All Job Assignments ({studentAllJobs.length})
                          </Typography>
                          
                          {loadingStudentAllJobs ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                              <CircularProgress size={30} sx={{ color: theme === 'dark' ? '#00ffff' : '#007bff' }} />
                            </Box>
                          ) : studentAllJobs.length === 0 ? (
                            <Box sx={{ textAlign: 'center', py: 2 }}>
                              <Typography variant="body1" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                                No job assignments found for this student.
                              </Typography>
                            </Box>
                          ) : (
                            <Box>
                              {studentAllJobs.map((job, index) => (
                                <Box key={job._id} sx={{ 
                                  mb: index < studentAllJobs.length - 1 ? 3 : 0, 
                                  pb: index < studentAllJobs.length - 1 ? 3 : 0, 
                                  borderBottom: index < studentAllJobs.length - 1 ? (theme === 'dark' ? '1px solid #334155' : '1px solid #eee') : 'none' 
                                }}>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                                      Job #{index + 1} - {job.class}
                                      {selectedJob?._id === job._id && (
                                        <Chip
                                          label="Current"
                                          color="primary"
                                          size="small"
                                          sx={{ ml: 1 }}
                                        />
                                      )}
                                    </Typography>
                                    <Chip
                                      label={job.sub_class ? 'Sub-class Assigned' : 'Pending Sub-class'}
                                      color={getJobStatusColor(job)}
                                      size="small"
                                    />
                                  </Box>
                                  
                                  <Box sx={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: 2 }}>
                                    <Box>
                                      <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                                        Class
                                      </Typography>
                                      <Typography variant="body1" sx={{ fontWeight: 'medium', color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                                        {job.class}
                                      </Typography>
                                    </Box>
                                    <Box>
                                      <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                                        Sub-class
                                      </Typography>
                                      <Typography variant="body1" sx={{ fontWeight: 'medium', color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                                        {job.sub_class || 'Not assigned'}
                                      </Typography>
                                    </Box>
                                    <Box>
                                      <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                                        Type
                                      </Typography>
                                      <Box sx={{ mt: 0.5 }}>
                                        {job.type ? (
                                          <Chip
                                            icon={getTypeIcon(job.type)}
                                            label={getTypeLabel(job.type)}
                                            color={getTypeColor(job.type)}
                                            size="small"
                                          />
                                        ) : (
                                          <Typography variant="body2" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                                            Not set
                                          </Typography>
                                        )}
                                      </Box>
                                    </Box>
                                    <Box>
                                      <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                                        Assigned Date
                                      </Typography>
                                      <Typography variant="body1" sx={{ fontWeight: 'medium', color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                                        {formatDate(job.createdAt)}
                                      </Typography>
                                    </Box>
                                  </Box>
                                  {job.background && (
                                    <Box sx={{ mt: 2 }}>
                                      <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                                        Background
                                      </Typography>
                                      <Typography variant="body2" sx={{ mt: 0.5, color: theme === 'dark' ? '#a8b2d1' : '#666666' }}>
                                        {job.background}
                                      </Typography>
                                    </Box>
                                  )}
                                </Box>
                              ))}
                            </Box>
                          )}
                        </CardContent>
                      </Card>

                      {/* Contact Information */}
                      <Card sx={{ 
                        mb: 3, 
                        borderRadius: 2, 
                        boxShadow: theme === 'dark' 
                          ? '0 2px 8px rgba(0,0,0,0.3)' 
                          : '0 2px 8px rgba(0,0,0,0.1)',
                        backgroundColor: theme === 'dark' ? '#0f172a80' : 'white'
                      }}>
                        <CardContent>
                          <Typography variant="h6" sx={{ 
                            mb: 2, 
                            fontWeight: 'bold',
                            color: theme === 'dark' ? '#ccd6f6' : '#333333',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1
                          }}>
                            <Call /> Contact Information
                          </Typography>
                          <Box sx={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: 2 }}>
                            <Box>
                              <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                                Phone Number
                              </Typography>
                              <Typography variant="body1" sx={{ fontWeight: 'medium', color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                                {selectedStudent.phone}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                                Emergency Contact
                              </Typography>
                              <Typography variant="body1" sx={{ fontWeight: 'medium', color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                                {safeDisplay(selectedStudent.emergencyContact)}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                                Email Address
                              </Typography>
                              <Typography variant="body1" sx={{ fontWeight: 'medium', color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                                {selectedStudent.email}
                              </Typography>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>

                      {/* Academic Information */}
                      <Card sx={{ 
                        mb: 3, 
                        borderRadius: 2, 
                        boxShadow: theme === 'dark' 
                          ? '0 2px 8px rgba(0,0,0,0.3)' 
                          : '0 2px 8px rgba(0,0,0,0.1)',
                        backgroundColor: theme === 'dark' ? '#0f172a80' : 'white'
                      }}>
                        <CardContent>
                          <Typography variant="h6" sx={{ 
                            mb: 2, 
                            fontWeight: 'bold',
                            color: theme === 'dark' ? '#ccd6f6' : '#333333',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1
                          }}>
                            <School /> Academic Information
                          </Typography>
                          <Box sx={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: 2 }}>
                            <Box>
                              <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                                University
                              </Typography>
                              <Typography variant="body1" sx={{ fontWeight: 'medium', color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                                {safeDisplay(selectedStudent.university)}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                                College
                              </Typography>
                              <Typography variant="body1" sx={{ fontWeight: 'medium', color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                                {safeDisplay(selectedStudent.college)}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                                Department
                              </Typography>
                              <Typography variant="body1" sx={{ fontWeight: 'medium', color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                                {safeDisplay(selectedStudent.department)}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                                Batch
                              </Typography>
                              <Typography variant="body1" sx={{ fontWeight: 'medium', color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                                {safeDisplay(selectedStudent.batch)}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                                Block
                              </Typography>
                              <Typography variant="body1" sx={{ fontWeight: 'medium', color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                                {safeDisplay(selectedStudent.block)}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                                Dorm
                              </Typography>
                              <Typography variant="body1" sx={{ fontWeight: 'medium', color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                                {safeDisplay(selectedStudent.dorm)}
                              </Typography>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>

                      {/* Address Information */}
                      <Card sx={{ 
                        mb: 3, 
                        borderRadius: 2, 
                        boxShadow: theme === 'dark' 
                          ? '0 2px 8px rgba(0,0,0,0.3)' 
                          : '0 2px 8px rgba(0,0,0,0.1)',
                        backgroundColor: theme === 'dark' ? '#0f172a80' : 'white'
                      }}>
                        <CardContent>
                          <Typography variant="h6" sx={{ 
                            mb: 2, 
                            fontWeight: 'bold',
                            color: theme === 'dark' ? '#ccd6f6' : '#333333',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1
                          }}>
                            <Home /> Address Information
                          </Typography>
                          <Box sx={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: 2 }}>
                            <Box>
                              <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                                Region
                              </Typography>
                              <Typography variant="body1" sx={{ fontWeight: 'medium', color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                                {safeDisplay(selectedStudent.region)}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                                Zone
                              </Typography>
                              <Typography variant="body1" sx={{ fontWeight: 'medium', color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                                {safeDisplay(selectedStudent.zone)}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                                Wereda
                              </Typography>
                              <Typography variant="body1" sx={{ fontWeight: 'medium', color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                                {safeDisplay(selectedStudent.wereda)}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                                Kebele
                              </Typography>
                              <Typography variant="body1" sx={{ fontWeight: 'medium', color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                                {safeDisplay(selectedStudent.kebele)}
                              </Typography>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>

                      {/* Language Information */}
                      <Card sx={{ 
                        mb: 3, 
                        borderRadius: 2, 
                        boxShadow: theme === 'dark' 
                          ? '0 2px 8px rgba(0,0,0,0.3)' 
                          : '0 2px 8px rgba(0,0,0,0.1)',
                        backgroundColor: theme === 'dark' ? '#0f172a80' : 'white'
                      }}>
                        <CardContent>
                          <Typography variant="h6" sx={{ 
                            mb: 2, 
                            fontWeight: 'bold',
                            color: theme === 'dark' ? '#ccd6f6' : '#333333',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1
                          }}>
                            <Translate /> Language Information
                          </Typography>
                          <Box sx={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 2 }}>
                            <Box>
                              <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                                Mother Tongue
                              </Typography>
                              <Typography variant="body1" sx={{ fontWeight: 'medium', color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                                {safeDisplay(selectedStudent.motherTongue)}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                                Additional Languages
                              </Typography>
                              <Typography variant="body1" sx={{ fontWeight: 'medium', color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                                {selectedStudent.additionalLanguages?.join(', ') || 'None'}
                              </Typography>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>

                      {/* Course Information (if attends course) */}
                      {selectedStudent.attendsCourse && (
                        <Card sx={{ 
                          mb: 3, 
                          borderRadius: 2, 
                          boxShadow: theme === 'dark' 
                            ? '0 2px 8px rgba(0,0,0,0.3)' 
                            : '0 2px 8px rgba(0,0,0,0.1)',
                          backgroundColor: theme === 'dark' ? '#0f172a80' : 'white',
                          borderLeft: '4px solid #4CAF50'
                        }}>
                          <CardContent>
                            <Typography variant="h6" sx={{ 
                              mb: 2, 
                              fontWeight: 'bold',
                              color: theme === 'dark' ? '#ccd6f6' : '#333333',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1
                            }}>
                              <LanguageIcon /> Course Information
                            </Typography>
                            <Box sx={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 2 }}>
                              <Box>
                                <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                                  Course Name
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 'medium', color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                                  {safeDisplay(selectedStudent.courseName)}
                                </Typography>
                              </Box>
                              <Box>
                                <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                                  Course Church
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 'medium', color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                                  {safeDisplay(selectedStudent.courseChurch)}
                                </Typography>
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>
                      )}

                      {/* Other Information */}
                      <Card sx={{ 
                        mb: 3, 
                        borderRadius: 2, 
                        boxShadow: theme === 'dark' 
                          ? '0 2px 8px rgba(0,0,0,0.3)' 
                          : '0 2px 8px rgba(0,0,0,0.1)',
                        backgroundColor: theme === 'dark' ? '#0f172a80' : 'white'
                      }}>
                        <CardContent>
                          <Typography variant="h6" sx={{ 
                            mb: 2, 
                            fontWeight: 'bold',
                            color: theme === 'dark' ? '#ccd6f6' : '#333333',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1
                          }}>
                            <Business /> Other Information
                          </Typography>
                          <Box sx={{ 
                            display: 'grid', 
                            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', 
                            gap: 2 
                          }}>
                            <Box>
                              <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                                Church
                              </Typography>
                              <Typography variant="body1" sx={{ fontWeight: 'medium', color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                                {safeDisplay(selectedStudent.church)}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                                Authority
                              </Typography>
                              <Typography variant="body1" sx={{ fontWeight: 'medium', color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                                {safeDisplay(selectedStudent.authority)}
                              </Typography>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>

                      {/* System Information */}
                      <Card sx={{ 
                        borderRadius: 2, 
                        boxShadow: theme === 'dark' 
                          ? '0 2px 8px rgba(0,0,0,0.3)' 
                          : '0 2px 8px rgba(0,0,0,0.1)',
                        backgroundColor: theme === 'dark' ? '#0f172a80' : 'white'
                      }}>
                        <CardContent>
                          <Typography variant="h6" sx={{ 
                            mb: 2, 
                            fontWeight: 'bold',
                            color: theme === 'dark' ? '#ccd6f6' : '#333333',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1
                          }}>
                            <AccessTime /> System Information
                          </Typography>
                          <Box sx={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 2 }}>
                            <Box>
                              <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                                Created Date
                              </Typography>
                              <Typography variant="body1" sx={{ fontWeight: 'medium', color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                                {formatDate(selectedStudent.createdAt)}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                                Last Updated
                              </Typography>
                              <Typography variant="body1" sx={{ fontWeight: 'medium', color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                                {formatDate(selectedStudent.updatedAt)}
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
                    onClick={() => setOpenViewStudentDialog(false)}
                    sx={{
                      color: theme === 'dark' ? '#00ffff' : '#007bff',
                      '&:hover': {
                        backgroundColor: theme === 'dark' ? '#00ffff20' : '#007bff10'
                      }
                    }}
                  >
                    Close
                  </Button>
                  {selectedJob && (
                    <Button 
                      onClick={() => {
                        setOpenViewStudentDialog(false);
                        handleOpenAssignSubClassDialog(selectedJob);
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
                      Edit Job Assignment
                    </Button>
                  )}
                </DialogActions>
              </>
            )}
          </Dialog>

          {/* Delete Confirmation Dialog - MATCHING STUDENT PAGE STYLE */}
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
                Are you sure you want to delete this job assignment for{" "}
                <strong style={{color: theme === 'dark' ? '#ff0000' : '#dc3545'}}>
                  {selectedJob?.studentId?.firstName} {selectedJob?.studentId?.lastName}
                </strong>?
              </Typography>
              <Alert severity="warning" sx={{ 
                mt: 2,
                backgroundColor: theme === 'dark' ? '#ff000020' : '#dc354510',
                color: theme === 'dark' ? '#ff0000' : '#dc3545'
              }}>
                This action will reduce the student's job count and cannot be undone.
              </Alert>
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
                onClick={handleDeleteJob} 
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
                startIcon={<Delete />}
              >
                Delete Assignment
              </Button>
            </DialogActions>
          </Dialog>

          {/* Notifications - MATCHING STUDENT PAGE STYLE */}
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

export default JobAssignmentPage;