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
  Stack, Tooltip, Switch,
  Accordion, AccordionSummary, AccordionDetails,
  List, ListItem, ListItemText, ListItemAvatar,
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
  Check, Clear
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import api from '@/app/utils/api';
import { format, parseISO } from 'date-fns';

interface Student {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  college: string;
  department: string;
  gibyGubayeId?: string;
}

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

interface AgendaStats {
  totalPending: number;
  totalApproved: number;
  totalCompleted: number;
  totalDraft: number;
  totalAgendas: number;
  classStats: { _id: string; count: number }[];
  statusStats: { _id: string; count: number }[];
  monthlyStats: { _id: { year: number; month: number }; count: number }[];
  recentAgendas: Agenda[];
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

interface AgendaFormData {
  meetingClass: string;
  location: string;
  draftContributors: string[]; // Array of student IDs
  agendaTitles: { title: string }[];
}

const meetingClasses = [
  'Class A',
  'Class B', 
  'Class C',
  'Class D',
  'Class E',
  'General Meeting',
  'Special Session',
  'Emergency Meeting',
  'Weekly Review',
  'Monthly Planning'
];

const AgendaManagementPage = () => {
  const { theme } = useTheme();
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  const [agendas, setAgendas] = useState<Agenda[]>([]);
  const [stats, setStats] = useState<AgendaStats | null>(null);
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
    status: '',
    createdBy: '',
    sortBy: 'draftDate',
    sortOrder: 'desc',
    page: 1,
    limit: 10
  });

  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openContinueDialog, setOpenContinueDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedAgenda, setSelectedAgenda] = useState<Agenda | null>(null);
  
  const [formData, setFormData] = useState<AgendaFormData>({
    meetingClass: '',
    location: '',
    draftContributors: [],
    agendaTitles: [{ title: '' }]
  });

  const [continueFormData, setContinueFormData] = useState<{
    agendaTitles: AgendaTitle[];
    generalMeetingSummary: string;
    meetingContributors: string[];
    status: 'approved' | 'completed';
  }>({
    agendaTitles: [],
    generalMeetingSummary: '',
    meetingContributors: [],
    status: 'approved'
  });

  // Students for dropdown
  const [students, setStudents] = useState<Student[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedContributors, setSelectedContributors] = useState<Student[]>([]);
  const [selectedMeetingContributors, setSelectedMeetingContributors] = useState<Student[]>([]);

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

  const statCards = [
    {
      title: 'Total Agendas',
      value: stats?.totalAgendas || 0,
      icon: <Event sx={{ fontSize: 28 }} />,
      color: theme === 'dark' ? '#00ffff' : '#007bff',
      description: 'All agendas'
    },
    {
      title: 'Pending',
      value: stats?.totalPending || 0,
      icon: <HourglassEmpty sx={{ fontSize: 28 }} />,
      color: theme === 'dark' ? '#ff9900' : '#ff9900',
      description: 'Awaiting approval'
    },
    {
      title: 'Approved',
      value: stats?.totalApproved || 0,
      icon: <CheckCircle sx={{ fontSize: 28 }} />,
      color: theme === 'dark' ? '#00ff00' : '#28a745',
      description: 'Ready for discussion'
    },
    {
      title: 'Completed',
      value: stats?.totalCompleted || 0,
      icon: <AssignmentTurnedIn sx={{ fontSize: 28 }} />,
      color: theme === 'dark' ? '#00b3b3' : '#00b3b3',
      description: 'Meetings completed'
    }
  ];

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

  const fetchStats = useCallback(async () => {
    try {
      const response = await api.get('/agendas/stats');
      setStats(response.data.data);
    } catch (error: any) {
      console.error('Failed to fetch stats:', error);
    }
  }, []);

  const fetchFilterOptions = useCallback(async () => {
    try {
      const response = await api.get('/agendas/filter-options');
      setFilterOptions(response.data.data);
    } catch (error: any) {
      console.error('Failed to fetch filter options:', error);
    }
  }, []);

  const fetchStudents = useCallback(async () => {
    try {
      setStudentsLoading(true);
      const response = await api.get('/students?limit=100');
      setStudents(response.data.data.students || []);
    } catch (error: any) {
      console.error('Failed to fetch students:', error);
    } finally {
      setStudentsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAgendas();
  }, [fetchAgendas]);

  useEffect(() => {
    fetchStats();
    fetchFilterOptions();
  }, [fetchStats, fetchFilterOptions]);

  useEffect(() => {
    if (openCreateDialog || openEditDialog || openContinueDialog) {
      fetchStudents();
    }
  }, [openCreateDialog, openEditDialog, openContinueDialog, fetchStudents]);

  const handleOpenCreateDialog = () => {
    resetForm();
    setOpenCreateDialog(true);
  };

  const handleOpenEditDialog = (agenda: Agenda) => {
    if (agenda.status !== 'pending') {
      setError('Only pending agendas can be edited');
      return;
    }
    
    setSelectedAgenda(agenda);
    
    // Set form data with student IDs
    setFormData({
      meetingClass: agenda.meetingClass,
      location: agenda.location,
      draftContributors: agenda.draftContributors.map(user => user._id),
      agendaTitles: agenda.agendaTitles.map(title => ({ title: title.title }))
    });
    
    // Set selected contributors for display
    const contributors = agenda.draftContributors.map(user => ({
      _id: user._id,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phone: '',
      college: '',
      department: ''
    }));
    setSelectedContributors(contributors);
    
    setOpenEditDialog(true);
  };

  const handleOpenViewDialog = (agenda: Agenda) => {
    setSelectedAgenda(agenda);
    setOpenViewDialog(true);
  };

  const handleOpenContinueDialog = (agenda: Agenda) => {
    if (agenda.status !== 'approved') {
      setError('Only approved agendas can be continued');
      return;
    }
    
    setSelectedAgenda(agenda);
    setContinueFormData({
      agendaTitles: agenda.agendaTitles.map(title => ({
        title: title.title,
        discussions: title.discussions || []
      })),
      generalMeetingSummary: agenda.generalMeetingSummary || '',
      meetingContributors: agenda.meetingContributors.map(user => user._id),
      status: agenda.status
    });
    
    // Set selected meeting contributors for display
    const meetingContributors = agenda.meetingContributors.map(user => ({
      _id: user._id,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phone: '',
      college: '',
      department: ''
    }));
    setSelectedMeetingContributors(meetingContributors);
    
    setOpenContinueDialog(true);
  };

  const handleOpenDeleteDialog = (agenda: Agenda) => {
    setSelectedAgenda(agenda);
    setOpenDeleteDialog(true);
  };

  const handleCreateAgenda = async () => {
    try {
      // Validate form
      if (!formData.meetingClass.trim() || !formData.location.trim()) {
        setError('Meeting class and location are required');
        return;
      }

      if (formData.agendaTitles.length === 0 || !formData.agendaTitles[0].title.trim()) {
        setError('At least one agenda title is required');
        return;
      }

      const payload = {
        meetingClass: formData.meetingClass.trim(),
        location: formData.location.trim(),
        draftContributors: formData.draftContributors, // Already student IDs
        agendaTitles: formData.agendaTitles
          .filter(item => item.title.trim())
          .map(item => ({ title: item.title.trim() }))
      };

      await api.post('/agendas', payload);
      
      setSuccess('Agenda created successfully');
      setOpenCreateDialog(false);
      resetForm();
      fetchAgendas();
      fetchStats();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to create agenda');
    }
  };

  const handleUpdateAgenda = async () => {
    if (!selectedAgenda) return;

    try {
      const payload = {
        meetingClass: formData.meetingClass.trim(),
        location: formData.location.trim(),
        draftContributors: formData.draftContributors, // Already student IDs
        agendaTitles: formData.agendaTitles
          .filter(item => item.title.trim())
          .map(item => ({ title: item.title.trim() }))
      };

      await api.put(`/agendas/${selectedAgenda._id}`, payload);
      
      setSuccess('Agenda updated successfully');
      setOpenEditDialog(false);
      resetForm();
      fetchAgendas();
      fetchStats();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to update agenda');
    }
  };

  const handleContinueAgenda = async () => {
    if (!selectedAgenda) return;

    try {
      const payload = {
        agendaTitles: continueFormData.agendaTitles.map(title => ({
          title: title.title,
          discussions: title.discussions
        })),
        generalMeetingSummary: continueFormData.generalMeetingSummary.trim(),
        meetingContributors: continueFormData.meetingContributors, // Already student IDs
        status: continueFormData.status
      };

      await api.patch(`/agendas/${selectedAgenda._id}/continue`, payload);
      
      setSuccess(`Agenda ${continueFormData.status === 'completed' ? 'completed' : 'updated'} successfully`);
      setOpenContinueDialog(false);
      fetchAgendas();
      fetchStats();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to update agenda');
    }
  };

  const handleDeleteAgenda = async () => {
    if (!selectedAgenda) return;

    try {
      await api.delete(`/agendas/${selectedAgenda._id}`);
      setSuccess('Agenda deleted successfully');
      setOpenDeleteDialog(false);
      setSelectedAgenda(null);
      fetchAgendas();
      fetchStats();
    } catch (error: any) {
      setError('Failed to delete agenda');
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

  const handleFormChange = (field: keyof AgendaFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleContinueFormChange = (field: keyof typeof continueFormData, value: any) => {
    setContinueFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleContributorsChange = (selectedStudents: Student[]) => {
    setSelectedContributors(selectedStudents);
    const studentIds = selectedStudents.map(student => student._id);
    setFormData(prev => ({ ...prev, draftContributors: studentIds }));
  };

  const handleMeetingContributorsChange = (selectedStudents: Student[]) => {
    setSelectedMeetingContributors(selectedStudents);
    const studentIds = selectedStudents.map(student => student._id);
    setContinueFormData(prev => ({ ...prev, meetingContributors: studentIds }));
  };

  const addAgendaTitle = () => {
    setFormData(prev => ({
      ...prev,
      agendaTitles: [...prev.agendaTitles, { title: '' }]
    }));
  };

  const removeAgendaTitle = (index: number) => {
    if (formData.agendaTitles.length <= 1) return;
    
    setFormData(prev => ({
      ...prev,
      agendaTitles: prev.agendaTitles.filter((_, i) => i !== index)
    }));
  };

  const updateAgendaTitle = (index: number, title: string) => {
    const newTitles = [...formData.agendaTitles];
    newTitles[index] = { title };
    setFormData(prev => ({ ...prev, agendaTitles: newTitles }));
  };

  const addDiscussion = (titleIndex: number) => {
    const newTitles = [...continueFormData.agendaTitles];
    if (!newTitles[titleIndex].discussions) {
      newTitles[titleIndex].discussions = [];
    }
    newTitles[titleIndex].discussions.push({
      question: '',
      answer: '',
      summary: '',
      discussedAt: new Date().toISOString()
    });
    
    handleContinueFormChange('agendaTitles', newTitles);
  };

  const updateDiscussion = (titleIndex: number, discussionIndex: number, field: keyof AgendaDiscussion, value: string) => {
    const newTitles = [...continueFormData.agendaTitles];
    newTitles[titleIndex].discussions[discussionIndex][field] = value;
    handleContinueFormChange('agendaTitles', newTitles);
  };

  const removeDiscussion = (titleIndex: number, discussionIndex: number) => {
    const newTitles = [...continueFormData.agendaTitles];
    newTitles[titleIndex].discussions.splice(discussionIndex, 1);
    handleContinueFormChange('agendaTitles', newTitles);
  };

  const resetForm = () => {
    setFormData({
      meetingClass: '',
      location: '',
      draftContributors: [],
      agendaTitles: [{ title: '' }]
    });
    setSelectedContributors([]);
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      meetingClass: '',
      location: '',
      status: '',
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

  const getStudentFullName = (student: Student) => {
    return `${student.firstName} ${student.lastName}`.trim();
  };

  const getStudentDisplayName = (student: Student) => {
    const fullName = getStudentFullName(student);
    const gibyId = student.gibyGubayeId ? ` (${student.gibyGubayeId})` : '';
    return `${fullName}${gibyId}`;
  };

  // Filter students based on search
  const filteredStudents = students.filter(student => {
    const fullName = getStudentFullName(student).toLowerCase();
    const searchTerm = studentSearch.toLowerCase();
    return fullName.includes(searchTerm) || 
           (student.email && student.email.toLowerCase().includes(searchTerm)) ||
           student.phone.includes(searchTerm) ||
           (student.gibyGubayeId && student.gibyGubayeId.toLowerCase().includes(searchTerm));
  });

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
                Agenda Management
              </Typography>
              <Typography variant={isMobile ? "body2" : "body1"} color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                Create, edit, and manage meeting agendas
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
                    flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 16px)', md: '1 1 calc(25% - 16px)' },
                    borderRadius: 2,
                    boxShadow: theme === 'dark' 
                      ? '0 2px 8px rgba(0,0,0,0.3)' 
                      : '0 2px 8px rgba(0,0,0,0.1)',
                    borderLeft: `4px solid ${stat.color}`,
                    backgroundColor: theme === 'dark' ? '#0f172a80' : 'white',
                    minHeight: '100px',
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
                    <Event /> All Agendas
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
                      Create Agenda
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
                      },
                      '& .MuiInputLabel-root': {
                        color: theme === 'dark' ? '#a8b2d1' : '#666666',
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
                          ? 'linear-gradient(135deg, #00ffff, #00b3b3)'
                          : 'linear-gradient(135deg, #007bff, #0056b3)'
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
                          Status & Dates
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
                              
                              {/* Edit button - only for pending agendas */}
                              {agenda.status === 'pending' && (
                                <Tooltip title="Edit">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleOpenEditDialog(agenda)}
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
                              
                              {/* Continue button - only for approved agendas */}
                              {agenda.status === 'approved' && (
                                <Tooltip title="Continue">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleOpenContinueDialog(agenda)}
                                    sx={{ 
                                      color: theme === 'dark' ? '#ff9900' : '#ff9900',
                                      '&:hover': {
                                        backgroundColor: theme === 'dark' ? '#ff990020' : '#ff990010'
                                      }
                                    }}
                                  >
                                    <ArrowForward fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                              
                              <Tooltip title="Delete">
                                <IconButton
                                  size="small"
                                  onClick={() => handleOpenDeleteDialog(agenda)}
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

                {agendas.length === 0 && !loading && (
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
                      No agendas found
                    </Typography>
                    <Typography variant="body2" color={theme === 'dark' ? '#94a3b8' : '#999999'}>
                      Try adjusting your filters or create a new agenda
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

          {/* Create/Edit Agenda Dialog */}
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
                {openEditDialog ? 'Edit Agenda' : 'Create New Agenda'}
              </Typography>
            </DialogTitle>
            <DialogContent sx={{ p: 3, overflowY: 'auto' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Meeting Class and Location */}
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel sx={{ color: theme === 'dark' ? '#a8b2d1' : '#666666' }}>Meeting Class *</InputLabel>
                    <Select
                      value={formData.meetingClass}
                      label="Meeting Class *"
                      onChange={(e) => handleFormChange('meetingClass', e.target.value)}
                      sx={selectStyle}
                      required
                    >
                      <MenuItem value="">
                        <Typography variant="body2" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                          Select Class
                        </Typography>
                      </MenuItem>
                      {meetingClasses.map((meetingClass) => (
                        <MenuItem key={meetingClass} value={meetingClass}>
                          <Typography variant="body2" color={theme === 'dark' ? '#ccd6f6' : '#333333'}>
                            {meetingClass}
                          </Typography>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  
                  <TextField
                    fullWidth
                    size="small"
                    label="Location *"
                    value={formData.location}
                    onChange={(e) => handleFormChange('location', e.target.value)}
                    placeholder="Enter meeting location..."
                    required
                    sx={textFieldStyle}
                  />
                </Box>

                {/* Draft Contributors - Updated to use Student selection */}
                <Box>
                  <Typography variant="subtitle2" sx={{ 
                    mb: 1,
                    color: theme === 'dark' ? '#ccd6f6' : '#333333'
                  }}>
                    Draft Contributors (Select Students)
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Search Students"
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                      placeholder="Search by name, email, phone, or student ID..."
                      sx={textFieldStyle}
                    />
                  </Box>
                  
                  <Autocomplete
                    multiple
                    options={filteredStudents}
                    getOptionLabel={(option) => getStudentDisplayName(option)}
                    value={selectedContributors}
                    onChange={(event, newValue) => {
                      handleContributorsChange(newValue);
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        size="small"
                        placeholder="Select student contributors..."
                        sx={textFieldStyle}
                      />
                    )}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip
                          label={getStudentFullName(option)}
                          size="small"
                          {...getTagProps({ index })}
                          sx={{
                            height: 24,
                            fontSize: '0.75rem',
                            backgroundColor: getAuthorAvatarColor(option._id),
                            color: 'white'
                          }}
                        />
                      ))
                    }
                  />
                </Box>

                {/* Agenda Titles */}
                <Box>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 2
                  }}>
                    <Typography variant="subtitle2" sx={{ 
                      color: theme === 'dark' ? '#ccd6f6' : '#333333'
                    }}>
                      Agenda Titles *
                    </Typography>
                    <Button
                      size="small"
                      startIcon={<Add />}
                      onClick={addAgendaTitle}
                      sx={{
                        color: theme === 'dark' ? '#00ffff' : '#007bff',
                        '&:hover': {
                          backgroundColor: theme === 'dark' ? '#00ffff20' : '#007bff10'
                        }
                      }}
                    >
                      Add Title
                    </Button>
                  </Box>
                  
                  <Stack spacing={2}>
                    {formData.agendaTitles.map((title, index) => (
                      <Box key={index} sx={{ 
                        display: 'flex', 
                        alignItems: 'flex-start',
                        gap: 1 
                      }}>
                        <TextField
                          fullWidth
                          size="small"
                          label={`Title ${index + 1}`}
                          value={title.title}
                          onChange={(e) => updateAgendaTitle(index, e.target.value)}
                          placeholder="Enter agenda title..."
                          required={index === 0}
                          sx={textFieldStyle}
                        />
                        {formData.agendaTitles.length > 1 && (
                          <IconButton
                            size="small"
                            onClick={() => removeAgendaTitle(index)}
                            sx={{
                              color: theme === 'dark' ? '#ff0000' : '#dc3545',
                              mt: 0.5
                            }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        )}
                      </Box>
                    ))}
                  </Stack>
                </Box>
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
                onClick={openEditDialog ? handleUpdateAgenda : handleCreateAgenda}
                variant="contained"
                disabled={!formData.meetingClass || !formData.location || !formData.agendaTitles[0]?.title}
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
                {openEditDialog ? 'Update Agenda' : 'Create Agenda'}
              </Button>
            </DialogActions>
          </Dialog>

          {/* Continue Agenda Dialog */}
          <Dialog 
            open={openContinueDialog} 
            onClose={() => setOpenContinueDialog(false)} 
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
            {selectedAgenda && (
              <>
                <DialogTitle sx={{ 
                  backgroundColor: theme === 'dark' ? '#0f172a' : 'white',
                  borderBottom: theme === 'dark' ? '1px solid #334155' : '1px solid #e5e7eb',
                  py: 3
                }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                    Continue Agenda Discussion
                  </Typography>
                  <Typography variant="body2" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                    {selectedAgenda.meetingClass} - {selectedAgenda.location}
                  </Typography>
                </DialogTitle>
                <DialogContent sx={{ p: 3, overflowY: 'auto' }}>
                  {/* Read-only Day 1 Data */}
                  <Card sx={{ 
                    mb: 3,
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
                        📋 Day 1 Agenda Details (Read-only)
                      </Typography>
                      
                      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 3, mb: 2 }}>
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

                  {/* Agenda Titles with Discussions */}
                  <Typography variant="h6" sx={{ 
                    mb: 3,
                    color: theme === 'dark' ? '#ccd6f6' : '#333333'
                  }}>
                    Agenda Titles Discussion
                  </Typography>
                  
                  {continueFormData.agendaTitles.map((title, titleIndex) => (
                    <Accordion 
                      key={titleIndex}
                      defaultExpanded={titleIndex === 0}
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
                      </AccordionSummary>
                      <AccordionDetails>
                        <Box sx={{ mb: 3 }}>
                          <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mb: 2
                          }}>
                            <Typography variant="subtitle2" sx={{ color: theme === 'dark' ? '#a8b2d1' : '#666666' }}>
                              Discussions ({title.discussions.length})
                            </Typography>
                            <Button
                              size="small"
                              startIcon={<Add />}
                              onClick={() => addDiscussion(titleIndex)}
                              sx={{
                                color: theme === 'dark' ? '#00ffff' : '#007bff',
                                '&:hover': {
                                  backgroundColor: theme === 'dark' ? '#00ffff20' : '#007bff10'
                                }
                              }}
                            >
                              Add Discussion
                            </Button>
                          </Box>
                          
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
                              <Box sx={{ 
                                display: 'flex', 
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                                mb: 2
                              }}>
                                <Typography variant="caption" color={theme === 'dark' ? '#94a3b8' : '#999999'}>
                                  Discussion {discIndex + 1}
                                </Typography>
                                <IconButton
                                  size="small"
                                  onClick={() => removeDiscussion(titleIndex, discIndex)}
                                  sx={{
                                    color: theme === 'dark' ? '#ff0000' : '#dc3545'
                                  }}
                                >
                                  <Delete fontSize="small" />
                                </IconButton>
                              </Box>
                              
                              <Stack spacing={2}>
                                <TextField
                                  fullWidth
                                  size="small"
                                  label="Question"
                                  value={discussion.question}
                                  onChange={(e) => updateDiscussion(titleIndex, discIndex, 'question', e.target.value)}
                                  multiline
                                  rows={2}
                                  sx={textFieldStyle}
                                />
                                
                                <TextField
                                  fullWidth
                                  size="small"
                                  label="Answer"
                                  value={discussion.answer}
                                  onChange={(e) => updateDiscussion(titleIndex, discIndex, 'answer', e.target.value)}
                                  multiline
                                  rows={3}
                                  sx={textFieldStyle}
                                />
                                
                                <TextField
                                  fullWidth
                                  size="small"
                                  label="Discussion Summary"
                                  value={discussion.summary}
                                  onChange={(e) => updateDiscussion(titleIndex, discIndex, 'summary', e.target.value)}
                                  multiline
                                  rows={2}
                                  sx={textFieldStyle}
                                />
                              </Stack>
                            </Paper>
                          ))}
                          
                          {title.discussions.length === 0 && (
                            <Typography variant="body2" color={theme === 'dark' ? '#a8b2d1' : '#666666'} sx={{ textAlign: 'center', py: 3 }}>
                              No discussions added yet. Click "Add Discussion" to start.
                            </Typography>
                          )}
                        </Box>
                      </AccordionDetails>
                    </Accordion>
                  ))}

                  {/* General Meeting Summary */}
                  <Box sx={{ mt: 4, mb: 3 }}>
                    <Typography variant="subtitle1" sx={{ 
                      mb: 2,
                      color: theme === 'dark' ? '#ccd6f6' : '#333333'
                    }}>
                      General Meeting Summary
                    </Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      label="Meeting Summary"
                      value={continueFormData.generalMeetingSummary}
                      onChange={(e) => handleContinueFormChange('generalMeetingSummary', e.target.value)}
                      placeholder="Enter overall meeting summary..."
                      sx={textFieldStyle}
                    />
                  </Box>

                  {/* Meeting Contributors - Updated to use Student selection */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" sx={{ 
                      mb: 2,
                      color: theme === 'dark' ? '#ccd6f6' : '#333333'
                    }}>
                      Meeting Contributors (Select Students)
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Search Students"
                        value={studentSearch}
                        onChange={(e) => setStudentSearch(e.target.value)}
                        placeholder="Search by name, email, phone, or student ID..."
                        sx={textFieldStyle}
                      />
                    </Box>
                    
                    <Autocomplete
                      multiple
                      options={filteredStudents}
                      getOptionLabel={(option) => getStudentDisplayName(option)}
                      value={selectedMeetingContributors}
                      onChange={(event, newValue) => {
                        handleMeetingContributorsChange(newValue);
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          size="small"
                          placeholder="Select meeting contributors..."
                          sx={textFieldStyle}
                        />
                      )}
                      renderTags={(value, getTagProps) =>
                        value.map((option, index) => (
                          <Chip
                            label={getStudentFullName(option)}
                            size="small"
                            {...getTagProps({ index })}
                            sx={{
                              height: 24,
                              fontSize: '0.75rem',
                              backgroundColor: getAuthorAvatarColor(option._id),
                              color: 'white'
                            }}
                          />
                        ))
                      }
                    />
                  </Box>

                  {/* Status Selection */}
                  <FormControl fullWidth size="small" sx={{ mb: 3 }}>
                    <InputLabel sx={{ color: theme === 'dark' ? '#a8b2d1' : '#666666' }}>Meeting Status</InputLabel>
                    <Select
                      value={continueFormData.status}
                      label="Meeting Status"
                      onChange={(e) => handleContinueFormChange('status', e.target.value as 'approved' | 'completed')}
                      sx={selectStyle}
                    >
                      <MenuItem value="approved">
                        <Typography variant="body2" color={theme === 'dark' ? '#ccd6f6' : '#333333'}>
                          Save as Draft (Approved)
                        </Typography>
                      </MenuItem>
                      <MenuItem value="completed">
                        <Typography variant="body2" color={theme === 'dark' ? '#ccd6f6' : '#333333'}>
                          Finish / Complete Meeting
                        </Typography>
                      </MenuItem>
                    </Select>
                  </FormControl>
                </DialogContent>
                <DialogActions sx={{ 
                  p: 3,
                  borderTop: theme === 'dark' ? '1px solid #334155' : '1px solid #e5e7eb',
                  backgroundColor: theme === 'dark' ? '#0f172a' : 'white'
                }}>
                  <Button 
                    onClick={() => setOpenContinueDialog(false)}
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
                    onClick={handleContinueAgenda}
                    variant="contained"
                    sx={{
                      background: continueFormData.status === 'completed'
                        ? (theme === 'dark'
                            ? 'linear-gradient(135deg, #00ff00, #00b300)'
                            : 'linear-gradient(135deg, #28a745, #218838)')
                        : (theme === 'dark'
                            ? 'linear-gradient(135deg, #00ffff, #00b3b3)'
                            : 'linear-gradient(135deg, #007bff, #0056b3)'),
                      borderRadius: 1,
                      '&:hover': {
                        background: continueFormData.status === 'completed'
                          ? (theme === 'dark'
                              ? 'linear-gradient(135deg, #00b300, #008000)'
                              : 'linear-gradient(135deg, #218838, #1e7e34)')
                          : (theme === 'dark'
                              ? 'linear-gradient(135deg, #00b3b3, #008080)'
                              : 'linear-gradient(135deg, #0056b3, #004080)')
                      }
                    }}
                  >
                    {continueFormData.status === 'completed' ? 'Finish Meeting' : 'Save Draft'}
                  </Button>
                </DialogActions>
              </>
            )}
          </Dialog>

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
                  {/* Day 1 Data */}
                  <Card sx={{ 
                    mb: 3,
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
                        📋 Day 1 Agenda Details
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
                        {selectedAgenda.approvedBy && (
                          <Box>
                            <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                              Approved By
                            </Typography>
                            <Typography variant="body2" sx={{ color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                              {selectedAgenda.approvedBy.firstName} {selectedAgenda.approvedBy.lastName}
                            </Typography>
                          </Box>
                        )}
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
                  {(selectedAgenda.generalMeetingSummary || selectedAgenda.meetingDate) && (
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
                            <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                              Meeting Contributors
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                              {selectedAgenda.meetingContributors.map((contributor) => (
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
                Are you sure you want to delete the agenda for <strong style={{color: theme === 'dark' ? '#ff0000' : '#dc3545'}}>
                  "{selectedAgenda?.meetingClass}"
                </strong>? This action cannot be undone.
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
                onClick={handleDeleteAgenda} 
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
                Delete Agenda
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

export default AgendaManagementPage;