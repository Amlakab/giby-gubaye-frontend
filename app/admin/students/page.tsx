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
  DialogActions, Button, Avatar, Checkbox,
  FormControlLabel, Autocomplete, Divider
} from '@mui/material';
import { motion } from 'framer-motion';
import { useTheme } from '@/lib/theme-context';
import {
  People, Block, CheckCircle, PersonAdd,
  Refresh, Delete, Edit, FilterList,
  ExpandMore, ExpandLess, Search,
  School, Phone, Email,
  Cake, Work, Church, Female, Male,
  AccessTime, Upload,
  Home, Badge as BadgeIcon,
  Visibility, CalendarToday, Call,
  Business, PersonPin,
  AssignmentTurnedIn, Work as WorkIcon,
  AdminPanelSettings, SupervisorAccount, Description,
  Translate, Language, AccountBalance,
  LocationOn,
  Person,
  Fingerprint // Add this icon for student ID
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import api from '@/app/utils/api';
import { format } from 'date-fns';

interface Student {
  _id: string;
  gibyGubayeId: string; // Added this field
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
  photoData?: {
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
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  numberOfJob?: number;
  age?: number;
}

interface StudentStats {
  totalStudents: number;
  activeStudents: number;
  inactiveStudents: number;
  universityStats: { _id: string; count: number }[];
  collegeStats: { _id: string; count: number }[];
  departmentStats: { _id: string; count: number }[];
  batchStats: { _id: string; count: number }[];
  genderStats: { _id: string; count: number }[];
  regionStats: { _id: string; count: number }[];
  recentStudents: Student[];
}

interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalStudents: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface FilterOptions {
  universities: string[];
  colleges: string[];
  departments: string[];
  batches: string[];
  regions: string[];
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

// Define FormData type - MATCHING REGISTRATION PAGE
interface StudentFormData {
  // Personal Information
  firstName: string;
  middleName: string;
  lastName: string;
  motherName: string;
  phone: string;
  email: string;
  gender: 'male' | 'female';
  dateOfBirth: Date | null;
  emergencyContact: string;
  job: string;
  
  // Academic Information
  university: string;
  college: string;
  department: string;
  batch: string;
  block: string;
  dorm: string;
  
  // Address Information
  region: string;
  zone: string;
  wereda: string;
  kebele: string;
  
  // Religious Information
  church: string;
  authority: string;
  
  // Language Information
  motherTongue: string;
  additionalLanguages: string[];
  
  // Course Information
  attendsCourse: boolean;
  courseName: string;
  courseChurch: string;
}

// Options arrays - MATCHING REGISTRATION PAGE
const universities = [
  'Addis Ababa University',
  'Addis Ababa Science and Technology University',
  'Bahir Dar University',
  'Hawassa University',
  'Mekelle University',
  'Jimma University',
  'University of Gondar',
  'Arba Minch University',
  'Haramaya University',
  'Wollega University',
  'Debre Markos University',
  'Dire Dawa University',
  'Wollo University',
  'Dilla University',
  'Mizan-Tepi University',
  'Wolaita Sodo University'
];

const colleges = [
  'College of Engineering and Technology',
  'College of Natural and Computational Sciences',
  'College of Social Sciences and Humanities',
  'College of Business and Economics',
  'College of Agriculture and Environmental Sciences',
  'College of Health Sciences',
  'College of Law and Governance',
  'College of Education and Behavioral Sciences'
];

const departments = [
  'Computer Science',
  'Software Engineering',
  'Information Technology',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Chemical Engineering',
  'Biomedical Engineering',
  'Biology',
  'Chemistry',
  'Physics',
  'Mathematics',
  'Statistics',
  'Economics',
  'Business Administration',
  'Accounting',
  'Finance',
  'Marketing',
  'Psychology',
  'Sociology',
  'Law',
  'Medicine',
  'Nursing',
  'Pharmacy',
  'Public Health'
];

const batches = [
  '2019/2014',
  '2019/2015',
  '2019/2016',
  '2019/2017',
  '2019/2018',
  '2019/2019',
  '2019/2020',
  '2020/2021',
  '2021/2022',
  '2022/2023',
  '2023/2024',
  '2024/2025'
];

const regions = [
  'Addis Ababa',
  'Oromia',
  'Amhara',
  'Tigray',
  'SNNPR',
  'Somali',
  'Afar',
  'Benishangul-Gumuz',
  'Gambela',
  'Harari',
  'Dire Dawa'
];

const motherTongues = [
  'Amharic',
  'Oromiffa',
  'Tigrinya',
  'Somali',
  'Afar',
  'Sidamo',
  'Wolaytta',
  'Gurage',
  'Hadiyya',
  'English',
  'Other'
];

const languages = [
  'English',
  'Amharic',
  'Oromiffa',
  'Tigrinya',
  'French',
  'Arabic',
  'Spanish',
  'German',
  'Italian',
  'Chinese',
  'Japanese',
  'Korean'
];

const jobs = [
  'Student',
  'Teacher',
  'Engineer',
  'Doctor',
  'Nurse',
  'Accountant',
  'Manager',
  'Administrator',
  'Technician',
  'Researcher',
  'Entrepreneur',
  'Other'
];

// Helper component for form rows
const FormRow = ({ children, columns = 1, spacing = 2 }: { 
  children: React.ReactNode; 
  columns?: 1 | 2 | 3 | 4;
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

const StudentsPage = () => {
  const { theme } = useTheme();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(max-width: 1024px)');
  
  const [students, setStudents] = useState<Student[]>([]);
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    universities: [],
    colleges: [],
    departments: [],
    batches: [],
    regions: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [pagination, setPagination] = useState<PaginationData>({
    currentPage: 1,
    totalPages: 1,
    totalStudents: 0,
    hasNext: false,
    hasPrev: false
  });

  // Filter states
  const [filters, setFilters] = useState({
    search: '',
    university: '',
    college: '',
    department: '',
    batch: '',
    region: '',
    gender: '',
    status: '',
    page: 1,
    limit: 10
  });

  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  // State for student's jobs
  const [studentJobs, setStudentJobs] = useState<Job[]>([]);
  const [loadingStudentJobs, setLoadingStudentJobs] = useState(false);

  // Form states with proper typing - MATCHING REGISTRATION PAGE
  const [formData, setFormData] = useState<StudentFormData>({
    // Personal Information
    firstName: '',
    middleName: '',
    lastName: '',
    motherName: '',
    phone: '',
    email: '',
    gender: 'male',
    dateOfBirth: null,
    emergencyContact: '',
    job: '',
    
    // Academic Information
    university: '',
    college: '',
    department: '',
    batch: '',
    block: '',
    dorm: '',
    
    // Address Information
    region: '',
    zone: '',
    wereda: '',
    kebele: '',
    
    // Religious Information
    church: '',
    authority: '',
    
    // Language Information
    motherTongue: '',
    additionalLanguages: [],
    
    // Course Information
    attendsCourse: false,
    courseName: '',
    courseChurch: '',
  });

  // Theme styles - MATCHING USER PAGE
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

  // Form field styles - MATCHING REGISTRATION PAGE
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

  // Function to get photo URL from student data
  const getPhotoUrl = (student: Student): string | null => {
    try {
      // Check if photoData exists and has the expected structure
      if (student.photoData && student.photoData.data) {
        let base64String: string;
        
        // Extract base64 string based on the structure
        if (typeof student.photoData.data === 'string') {
          // Already a string
          base64String = student.photoData.data;
        } else if (student.photoData.data.$binary && student.photoData.data.$binary.base64) {
          // MongoDB BSON format
          base64String = student.photoData.data.$binary.base64;
        } else if (student.photoData.data.data && Array.isArray(student.photoData.data.data)) {
          // Buffer format
          base64String = Buffer.from(student.photoData.data.data).toString('base64');
        } else {
          console.error('Unknown photo data structure:', student.photoData.data);
          return null;
        }
        
        // Clean and construct the data URL
        const cleanBase64 = base64String.replace(/\s/g, '');
        const contentType = student.photoData.contentType || 'image/jpeg';
        return `data:${contentType};base64,${cleanBase64}`;
      }
      
      // Fallback to photo field if it's a data URL
      if (student.photo && student.photo.startsWith('data:image')) {
        return student.photo;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting photo URL:', error);
      return null;
    }
  };

  // Stats cards colors - MATCHING USER PAGE
  const statCards = [
    {
      title: 'Total Students',
      value: stats?.totalStudents || 0,
      icon: <People sx={{ fontSize: 28 }} />,
      color: theme === 'dark' ? '#00ffff' : '#007bff'
    },
    {
      title: 'Active Students',
      value: stats?.activeStudents || 0,
      icon: <CheckCircle sx={{ fontSize: 28 }} />,
      color: theme === 'dark' ? '#00ff00' : '#28a745'
    },
    {
      title: 'Inactive Students',
      value: stats?.inactiveStudents || 0,
      icon: <Block sx={{ fontSize: 28 }} />,
      color: theme === 'dark' ? '#ff0000' : '#dc3545'
    },
    {
      title: 'Universities',
      value: stats?.universityStats?.length || 0,
      icon: <AccountBalance sx={{ fontSize: 28 }} />,
      color: theme === 'dark' ? '#ff00ff' : '#9333ea'
    }
  ];

  useEffect(() => {
    fetchStudents();
    fetchStats();
    fetchFilterOptions();
  }, [filters.page, filters.limit, filters.university, filters.college, filters.department, filters.batch, filters.region, filters.gender, filters.status, filters.search]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString());
      });

      const response = await api.get(`/students?${params}`);
      setStudents(response.data.data.students || []);
      setPagination(response.data.data.pagination || {
        currentPage: 1,
        totalPages: 1,
        totalStudents: 0,
        hasNext: false,
        hasPrev: false
      });
      setError('');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to fetch students');
      setStudents([]);
      setPagination({
        currentPage: 1,
        totalPages: 1,
        totalStudents: 0,
        hasNext: false,
        hasPrev: false
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/students/stats');
      setStats(response.data.data);
    } catch (error: any) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchFilterOptions = async () => {
    try {
      const response = await api.get('/students/filter-options');
      setFilterOptions(response.data.data);
    } catch (error: any) {
      console.error('Failed to fetch filter options:', error);
    }
  };

  const fetchStudentJobs = async (studentId: string) => {
    try {
      setLoadingStudentJobs(true);
      const response = await api.get(`/jobs/student/${studentId}/all`);
      setStudentJobs(response.data.data.jobs || []);
    } catch (error: any) {
      console.error('Failed to fetch student jobs:', error);
      setStudentJobs([]);
    } finally {
      setLoadingStudentJobs(false);
    }
  };

  const handleCreateStudent = async () => {
    try {
      const formDataToSend = new FormData();
      
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'dateOfBirth' && value instanceof Date) {
          formDataToSend.append(key, value.toISOString());
        } else if (key === 'additionalLanguages') {
          if (Array.isArray(value) && value.length > 0) {
            formDataToSend.append(key, value.join(','));
          }
        } else if (key === 'attendsCourse') {
          formDataToSend.append(key, value.toString());
        } else if (value !== null && value !== undefined && value !== '') {
          formDataToSend.append(key, value.toString());
        }
      });
      
      if (photoFile) {
        formDataToSend.append('photo', photoFile);
      }

      await api.post('/students', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      setSuccess('Student created successfully');
      setOpenDialog(false);
      resetForm();
      fetchStudents();
      fetchStats();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to create student');
    }
  };

  const handleUpdateStudent = async () => {
    if (!selectedStudent) return;

    try {
      const formDataToSend = new FormData();
      
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'dateOfBirth' && value instanceof Date) {
          formDataToSend.append(key, value.toISOString());
        } else if (key === 'additionalLanguages') {
          if (Array.isArray(value) && value.length > 0) {
            formDataToSend.append(key, value.join(','));
          }
        } else if (key === 'attendsCourse') {
          formDataToSend.append(key, value.toString());
        } else if (value !== null && value !== undefined) {
          formDataToSend.append(key, value.toString());
        }
      });
      
      if (photoFile) {
        formDataToSend.append('photo', photoFile);
      }

      await api.put(`/students/${selectedStudent._id}`, formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      setSuccess('Student updated successfully');
      setOpenDialog(false);
      resetForm();
      fetchStudents();
      fetchStats();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to update student');
    }
  };

  const handleStatusUpdate = async (studentId: string, isActive: boolean) => {
    try {
      await api.patch(`/students/${studentId}/status`, { isActive });
      setSuccess(`Student ${isActive ? 'activated' : 'deactivated'} successfully`);
      fetchStudents();
      fetchStats();
    } catch (error: any) {
      setError('Failed to update student status');
    }
  };

  const handleDeleteStudent = async () => {
    if (!selectedStudent) return;

    try {
      await api.delete(`/students/${selectedStudent._id}`);
      setSuccess('Student deleted successfully');
      setOpenDeleteDialog(false);
      setSelectedStudent(null);
      fetchStudents();
      fetchStats();
    } catch (error: any) {
      setError('Failed to delete student');
    }
  };

  const handleOpenEditDialog = (student: Student) => {
    setSelectedStudent(student);
    setIsEditMode(true);
    setFormData({
      firstName: student.firstName,
      middleName: student.middleName || '',
      lastName: student.lastName,
      motherName: student.motherName,
      phone: student.phone,
      email: student.email,
      gender: student.gender,
      dateOfBirth: student.dateOfBirth ? new Date(student.dateOfBirth) : null,
      emergencyContact: student.emergencyContact,
      job: student.job,
      university: student.university,
      college: student.college,
      department: student.department,
      batch: student.batch,
      block: student.block,
      dorm: student.dorm,
      region: student.region,
      zone: student.zone,
      wereda: student.wereda,
      kebele: student.kebele,
      church: student.church,
      authority: student.authority,
      motherTongue: student.motherTongue,
      additionalLanguages: student.additionalLanguages || [],
      attendsCourse: student.attendsCourse || false,
      courseName: student.courseName || '',
      courseChurch: student.courseChurch || ''
    });
    // Use the new getPhotoUrl function
    setPhotoPreview(getPhotoUrl(student));
    setPhotoFile(null);
    setOpenDialog(true);
  };

  const handleOpenViewDialog = async (student: Student) => {
    setSelectedStudent(student);
    setOpenViewDialog(true);
    await fetchStudentJobs(student._id);
  };

  const handleOpenCreateDialog = () => {
    setIsEditMode(false);
    resetForm();
    setOpenDialog(true);
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

  const handleFormChange = (field: keyof StudentFormData, value: string | boolean | string[] | Date | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      middleName: '',
      lastName: '',
      motherName: '',
      phone: '',
      email: '',
      gender: 'male',
      dateOfBirth: null,
      emergencyContact: '',
      job: '',
      university: '',
      college: '',
      department: '',
      batch: '',
      block: '',
      dorm: '',
      region: '',
      zone: '',
      wereda: '',
      kebele: '',
      church: '',
      authority: '',
      motherTongue: '',
      additionalLanguages: [],
      attendsCourse: false,
      courseName: '',
      courseChurch: ''
    });
    setPhotoPreview(null);
    setPhotoFile(null);
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      university: '',
      college: '',
      department: '',
      batch: '',
      region: '',
      gender: '',
      status: '',
      page: 1,
      limit: 10
    });
  };

  const toggleExpandStudent = (studentId: string) => {
    setExpandedStudent(expandedStudent === studentId ? null : studentId);
  };

  const formatDate = (dateString: string | Date) => {
    return format(new Date(dateString), 'MMMM dd, yyyy');
  };

  const getGenderIcon = (gender: string) => {
    return gender === 'male' ? <Male /> : <Female />;
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'success' : 'error';
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const getStudentInitials = (student: Student) => {
    return `${student.firstName.charAt(0)}${student.lastName.charAt(0)}`.toUpperCase();
  };

  const getAvatarColor = (studentId: string) => {
    const colors = ['#1976d2', '#2e7d32', '#ed6c02', '#d32f2f', '#7b1fa2', '#00796b', '#388e3c', '#f57c00', '#0288d1', '#c2185b'];
    const index = studentId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
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
      default: return <Work fontSize="small" />;
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

  // Form sections rendering function
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
                Student Management
              </Typography>
              <Typography variant={isMobile ? "body2" : "body1"} color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                Manage student records, profiles, and information
              </Typography>
            </Box>
          </motion.div>

          {/* Statistics Cards - MATCHING USER PAGE STYLE */}
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

          {/* Filter and Action Section - MATCHING USER PAGE STYLE */}
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
                    <FilterList /> Student Filters
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
                      Add Student
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
                    label="Search Students"
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    placeholder="Name, phone, email, or student ID..."
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
                      University
                    </InputLabel>
                    <Select
                      value={filters.university}
                      label="University"
                      onChange={(e) => handleFilterChange('university', e.target.value)}
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
                          All Universities
                        </Typography>
                      </MenuItem>
                      {filterOptions.universities.map((university) => (
                        <MenuItem key={university} value={university}>
                          <Typography variant="body2" color={theme === 'dark' ? '#ccd6f6' : '#333333'}>
                            {university}
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
                      College
                    </InputLabel>
                    <Select
                      value={filters.college}
                      label="College"
                      onChange={(e) => handleFilterChange('college', e.target.value)}
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
                      <MenuItem value="">All Colleges</MenuItem>
                      {filterOptions.colleges.map((college) => (
                        <MenuItem key={college} value={college}>
                          <Typography variant="body2" color={theme === 'dark' ? '#ccd6f6' : '#333333'}>
                            {college}
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
                      Department
                    </InputLabel>
                    <Select
                      value={filters.department}
                      label="Department"
                      onChange={(e) => handleFilterChange('department', e.target.value)}
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
                      <MenuItem value="">All Departments</MenuItem>
                      {filterOptions.departments.map((dept) => (
                        <MenuItem key={dept} value={dept}>
                          <Typography variant="body2" color={theme === 'dark' ? '#ccd6f6' : '#333333'}>
                            {dept}
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
                      Batch
                    </InputLabel>
                    <Select
                      value={filters.batch}
                      label="Batch"
                      onChange={(e) => handleFilterChange('batch', e.target.value)}
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
                      <MenuItem value="">All Batches</MenuItem>
                      {filterOptions.batches.map((batch) => (
                        <MenuItem key={batch} value={batch}>
                          <Typography variant="body2" color={theme === 'dark' ? '#ccd6f6' : '#333333'}>
                            {batch}
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
                      Region
                    </InputLabel>
                    <Select
                      value={filters.region}
                      label="Region"
                      onChange={(e) => handleFilterChange('region', e.target.value)}
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
                      <MenuItem value="">All Regions</MenuItem>
                      {filterOptions.regions.map((region) => (
                        <MenuItem key={region} value={region}>
                          <Typography variant="body2" color={theme === 'dark' ? '#ccd6f6' : '#333333'}>
                            {region}
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
                      Status
                    </InputLabel>
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
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="inactive">Inactive</MenuItem>
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

          {/* Students List */}
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
                  {students.map((student) => {
                    const isExpanded = expandedStudent === student._id;
                    const photoUrl = getPhotoUrl(student);
                    
                    return (
                      <Card 
                        key={student._id} 
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
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Avatar
                                src={photoUrl || undefined}
                                sx={{ 
                                  width: 50, 
                                  height: 50,
                                  bgcolor: getAvatarColor(student._id),
                                  fontSize: '1rem',
                                  fontWeight: 'bold'
                                }}
                              >
                                {getStudentInitials(student)}
                              </Avatar>
                              <Box>
                                <Typography variant="subtitle1" sx={{ 
                                  fontWeight: 'bold',
                                  color: theme === 'dark' ? '#ccd6f6' : '#333333',
                                  mb: 0.5
                                }}>
                                  {student.firstName} {student.lastName}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                                  <Fingerprint fontSize="small" sx={{ color: theme === 'dark' ? '#a8b2d1' : '#666666' }} />
                                  <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                                    {student.gibyGubayeId}
                                  </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                  <Chip
                                    label={student.university}
                                    size="small"
                                    icon={<AccountBalance />}
                                    sx={{ height: 24 }}
                                  />
                                  <Chip
                                    label={student.gender}
                                    size="small"
                                    icon={getGenderIcon(student.gender)}
                                    sx={{ height: 24 }}
                                  />
                                </Box>
                              </Box>
                            </Box>
                            <IconButton 
                              size="small" 
                              onClick={() => toggleExpandStudent(student._id)}
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
                            <Email fontSize="small" sx={{ color: theme === 'dark' ? '#a8b2d1' : '#666666' }} />
                            <Typography variant="body2" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                              {student.email}
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
                              label={student.isActive ? 'Active' : 'Inactive'}
                              color={getStatusColor(student.isActive)}
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
                                  University:
                                </Typography>
                                <Typography variant="body2" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                                  {student.university}
                                </Typography>
                              </Box>

                              <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color={theme === 'dark' ? '#a8b2d1' : '#666666'} sx={{ fontWeight: 500, mb: 0.5 }}>
                                  Batch:
                                </Typography>
                                <Typography variant="body2" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                                  {student.batch}
                                </Typography>
                              </Box>

                              <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color={theme === 'dark' ? '#a8b2d1' : '#666666'} sx={{ fontWeight: 500, mb: 0.5 }}>
                                  Department:
                                </Typography>
                                <Typography variant="body2" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                                  {student.department}
                                </Typography>
                              </Box>
                              
                              <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color={theme === 'dark' ? '#a8b2d1' : '#666666'} sx={{ fontWeight: 500, mb: 0.5 }}>
                                  Region:
                                </Typography>
                                <Typography variant="body2" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                                  {student.region}
                                </Typography>
                              </Box>
                              
                              <Box sx={{ 
                                display: 'flex', 
                                justifyContent: 'space-between',
                                mb: 2
                              }}>
                                <Typography variant="body2" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                                  Created:
                                </Typography>
                                <Typography variant="body2" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                                  {formatDate(student.createdAt)}
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
                                  onClick={() => handleOpenViewDialog(student)}
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
                                  startIcon={<Edit />}
                                  onClick={() => handleOpenEditDialog(student)}
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
                                  Edit
                                </Button>
                                <Button
                                  variant="outlined"
                                  startIcon={student.isActive ? <Block /> : <CheckCircle />}
                                  onClick={() => handleStatusUpdate(student._id, !student.isActive)}
                                  size="small"
                                  color={student.isActive ? 'error' : 'success'}
                                  sx={{ 
                                    borderRadius: 1,
                                    borderColor: student.isActive ? 
                                      (theme === 'dark' ? '#ff0000' : '#dc3545') : 
                                      (theme === 'dark' ? '#00ff00' : '#28a745'),
                                    color: student.isActive ? 
                                      (theme === 'dark' ? '#ff0000' : '#dc3545') : 
                                      (theme === 'dark' ? '#00ff00' : '#28a745'),
                                    '&:hover': {
                                      backgroundColor: student.isActive ? 
                                        (theme === 'dark' ? '#ff000020' : '#dc354510') : 
                                        (theme === 'dark' ? '#00ff0020' : '#28a74510')
                                    }
                                  }}
                                >
                                  {student.isActive ? 'Deactivate' : 'Activate'}
                                </Button>
                                <Button
                                  variant="outlined"
                                  startIcon={<Delete />}
                                  onClick={() => {
                                    setSelectedStudent(student);
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
                            Student ID
                          </TableCell>
                          <TableCell sx={{ 
                            color: 'white', 
                            fontWeight: 'bold',
                            fontSize: '0.875rem',
                            py: 2
                          }}>
                            University/College
                          </TableCell>
                          <TableCell sx={{ 
                            color: 'white', 
                            fontWeight: 'bold',
                            fontSize: '0.875rem',
                            py: 2
                          }}>
                            Department/Batch
                          </TableCell>
                          <TableCell sx={{ 
                            color: 'white', 
                            fontWeight: 'bold',
                            fontSize: '0.875rem',
                            py: 2
                          }}>
                            Contact
                          </TableCell>
                          <TableCell sx={{ 
                            color: 'white', 
                            fontWeight: 'bold',
                            fontSize: '0.875rem',
                            py: 2
                          }}>
                            Gender
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
                            Actions
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {students.map((student) => {
                          const photoUrl = getPhotoUrl(student);
                          
                          return (
                            <TableRow 
                              key={student._id} 
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
                                      {student.motherName}
                                    </Typography>
                                  </Box>
                                </Box>
                              </TableCell>
                              <TableCell sx={{ py: 2.5 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Fingerprint fontSize="small" sx={{ color: theme === 'dark' ? '#a8b2d1' : '#666666' }} />
                                  <Typography variant="body2" sx={{ 
                                    fontWeight: 'medium', 
                                    color: theme === 'dark' ? '#ccd6f6' : '#333333',
                                    fontFamily: 'monospace'
                                  }}>
                                    {student.gibyGubayeId}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell sx={{ py: 2.5 }}>
                                <Box>
                                  <Typography variant="body2" sx={{ fontWeight: 'medium', color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                                    {student.university}
                                  </Typography>
                                  <Typography variant="body2" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                                    {student.college}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell sx={{ py: 2.5 }}>
                                <Typography variant="body2" sx={{ fontWeight: 'medium', color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                                  {student.department}
                                </Typography>
                                <Typography variant="body2" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                                  Batch: {student.batch}
                                </Typography>
                              </TableCell>
                              <TableCell sx={{ py: 2.5 }}>
                                <Box>
                                  <Typography variant="body2" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                                    {student.phone}
                                  </Typography>
                                  <Typography variant="body2" color={theme === 'dark' ? '#94a3b8' : '#999999'} sx={{ fontSize: '0.75rem' }}>
                                    {student.email}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell sx={{ py: 2.5 }}>
                                <Chip
                                  label={student.gender}
                                  size="small"
                                  icon={getGenderIcon(student.gender)}
                                  sx={{ 
                                    height: 24,
                                    fontSize: '0.75rem'
                                  }}
                                />
                              </TableCell>
                              <TableCell sx={{ py: 2.5 }}>
                                <Chip
                                  label={student.isActive ? 'Active' : 'Inactive'}
                                  color={getStatusColor(student.isActive)}
                                  size="small"
                                  sx={{ 
                                    height: 24,
                                    fontSize: '0.75rem'
                                  }}
                                />
                              </TableCell>
                              <TableCell sx={{ py: 2.5 }}>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleOpenViewDialog(student)}
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
                                    onClick={() => handleOpenEditDialog(student)}
                                    sx={{ 
                                      color: theme === 'dark' ? '#00ffff' : '#007bff',
                                      '&:hover': {
                                        backgroundColor: theme === 'dark' ? '#00ffff20' : '#007bff10'
                                      }
                                    }}
                                  >
                                    <Edit fontSize="small" />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleStatusUpdate(student._id, !student.isActive)}
                                    sx={{ 
                                      color: student.isActive ? 
                                        (theme === 'dark' ? '#ff0000' : '#dc3545') : 
                                        (theme === 'dark' ? '#00ff00' : '#28a745'),
                                      '&:hover': {
                                        backgroundColor: student.isActive ? 
                                          (theme === 'dark' ? '#ff000020' : '#dc354510') : 
                                          (theme === 'dark' ? '#00ff0020' : '#28a74510')
                                      }
                                    }}
                                  >
                                    {student.isActive ? <Block fontSize="small" /> : <CheckCircle fontSize="small" />}
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    onClick={() => {
                                      setSelectedStudent(student);
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
                                </Box>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  {students.length === 0 && !loading && (
                    <Box sx={{ 
                      textAlign: 'center', 
                      py: 8,
                      px: 2
                    }}>
                      <People sx={{ 
                        fontSize: 64, 
                        color: theme === 'dark' ? '#334155' : '#cbd5e1',
                        mb: 2
                      }} />
                      <Typography variant="h6" color={theme === 'dark' ? '#a8b2d1' : '#666666'} sx={{ mb: 1 }}>
                        No students found
                      </Typography>
                      <Typography variant="body2" color={theme === 'dark' ? '#94a3b8' : '#999999'}>
                        Try adjusting your filters or add a new student
                      </Typography>
                    </Box>
                  )}
                </Card>
              )}

              {/* Pagination - MATCHING USER PAGE STYLE */}
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
                    Showing {((filters.page - 1) * filters.limit) + 1} to {Math.min(filters.page * filters.limit, pagination.totalStudents)} of {pagination.totalStudents} students
                  </Typography>
                </Box>
              )}
            </motion.div>
          )}

          {/* Add/Edit Student Dialog - UPDATED TO MATCH REGISTRATION PAGE */}
          <Dialog 
            open={openDialog} 
            onClose={() => setOpenDialog(false)} 
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
                {isEditMode ? 'Edit Student' : 'Add New Student'}
              </Typography>
            </DialogTitle>
            <DialogContent sx={{ p: 3, overflowY: 'auto' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Photo Upload */}
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <Box sx={{ position: 'relative' }}>
                    <Avatar
                      src={photoPreview || (selectedStudent && getPhotoUrl(selectedStudent)) || undefined}
                      sx={{ 
                        width: 100, 
                        height: 100,
                        fontSize: '2rem',
                        fontWeight: 'bold',
                        backgroundColor: theme === 'dark' ? '#334155' : '#e5e7eb',
                        border: `2px solid ${theme === 'dark' ? '#00ffff' : '#007bff'}`
                      }}
                    >
                      {photoPreview || (selectedStudent && getPhotoUrl(selectedStudent)) ? '' : 'Upload'}
                    </Avatar>
                    <Button
                      component="label"
                      variant="contained"
                      size="small"
                      startIcon={<Upload />}
                      sx={{ 
                        position: 'absolute', 
                        bottom: -10, 
                        right: -10,
                        background: theme === 'dark'
                          ? 'linear-gradient(135deg, #00ffff, #00b3b3)'
                          : 'linear-gradient(135deg, #007bff, #0056b3)',
                        '&:hover': {
                          background: theme === 'dark'
                            ? 'linear-gradient(135deg, #00b3b3, #008080)'
                            : 'linear-gradient(135deg, #0056b3, #004080)'
                        }
                      }}
                    >
                      Upload
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={handlePhotoChange}
                      />
                    </Button>
                  </Box>
                </Box>

                {/* Personal Information Section */}
                {renderFormSection(
                  "Personal Information",
                  <Person />,
                  <>
                    <FormRow columns={3}>
                      <TextField
                        fullWidth
                        label="First Name"
                        value={formData.firstName}
                        onChange={(e) => handleFormChange('firstName', e.target.value)}
                        required
                        size="small"
                        InputProps={{
                          startAdornment: <Person fontSize="small" sx={{ mr: 1, color: theme === 'dark' ? '#a8b2d1' : '#666666' }} />,
                        }}
                        sx={textFieldStyle}
                      />
                      <TextField
                        fullWidth
                        label="Middle Name"
                        value={formData.middleName}
                        onChange={(e) => handleFormChange('middleName', e.target.value)}
                        size="small"
                        sx={textFieldStyle}
                      />
                      <TextField
                        fullWidth
                        label="Last Name"
                        value={formData.lastName}
                        onChange={(e) => handleFormChange('lastName', e.target.value)}
                        required
                        size="small"
                        sx={textFieldStyle}
                      />
                    </FormRow>

                    <FormRow columns={2}>
                      <TextField
                        fullWidth
                        label="Mother's Name"
                        value={formData.motherName}
                        onChange={(e) => handleFormChange('motherName', e.target.value)}
                        required
                        size="small"
                        InputProps={{
                          startAdornment: <Person fontSize="small" sx={{ mr: 1, color: theme === 'dark' ? '#a8b2d1' : '#666666' }} />,
                        }}
                        sx={textFieldStyle}
                      />
                      <FormControl fullWidth size="small">
                        <InputLabel sx={labelStyle}>Gender</InputLabel>
                        <Select
                          value={formData.gender}
                          label="Gender"
                          onChange={(e) => handleFormChange('gender', e.target.value)}
                          sx={selectStyle}
                        >
                          <MenuItem value="male">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Male fontSize="small" /> Male
                            </Box>
                          </MenuItem>
                          <MenuItem value="female">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Female fontSize="small" /> Female
                            </Box>
                          </MenuItem>
                        </Select>
                      </FormControl>
                    </FormRow>

                    <FormRow columns={2}>
                      <DatePicker
                        label="Date of Birth"
                        value={formData.dateOfBirth}
                        onChange={(date) => handleFormChange('dateOfBirth', date)}
                        slotProps={{ 
                          textField: { 
                            fullWidth: true, 
                            size: 'small',
                            InputProps: {
                              startAdornment: <Cake fontSize="small" sx={{ mr: 1, color: theme === 'dark' ? '#a8b2d1' : '#666666' }} />,
                            },
                            sx: datePickerStyle
                          } 
                        }}
                      />
                      <TextField
                        fullWidth
                        label="Job/Profession"
                        value={formData.job}
                        onChange={(e) => handleFormChange('job', e.target.value)}
                        required
                        size="small"
                        select
                        SelectProps={{
                          MenuProps: {
                            PaperProps: {
                              sx: {
                                backgroundColor: theme === 'dark' ? '#1e293b' : 'white',
                                color: theme === 'dark' ? '#ccd6f6' : '#333333',
                              }
                            }
                          }
                        }}
                        InputProps={{
                          startAdornment: <Work fontSize="small" sx={{ mr: 1, color: theme === 'dark' ? '#a8b2d1' : '#666666' }} />,
                        }}
                        sx={textFieldStyle}
                      >
                        <MenuItem value="">
                          <Typography variant="body2" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                            Select Job
                          </Typography>
                        </MenuItem>
                        {jobs.map((job) => (
                          <MenuItem key={job} value={job}>
                            {job}
                          </MenuItem>
                        ))}
                      </TextField>
                    </FormRow>

                    <FormRow columns={2}>
                      <TextField
                        fullWidth
                        label="Phone Number"
                        value={formData.phone}
                        onChange={(e) => handleFormChange('phone', e.target.value)}
                        required
                        size="small"
                        placeholder="0912345678"
                        InputProps={{
                          startAdornment: <Phone fontSize="small" sx={{ mr: 1, color: theme === 'dark' ? '#a8b2d1' : '#666666' }} />,
                        }}
                        sx={textFieldStyle}
                      />
                      
                      <TextField
                        fullWidth
                        label="Emergency Contact"
                        value={formData.emergencyContact}
                        onChange={(e) => handleFormChange('emergencyContact', e.target.value)}
                        required
                        size="small"
                        placeholder="0912345678"
                        InputProps={{
                          startAdornment: <Phone fontSize="small" sx={{ mr: 1, color: theme === 'dark' ? '#a8b2d1' : '#666666' }} />,
                        }}
                        sx={textFieldStyle}
                      />
                    </FormRow>

                    <FormRow columns={1}>
                      <TextField
                        fullWidth
                        label="Email Address"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleFormChange('email', e.target.value)}
                        required
                        size="small"
                        placeholder="example@domain.com"
                        InputProps={{
                          startAdornment: <Email fontSize="small" sx={{ mr: 1, color: theme === 'dark' ? '#a8b2d1' : '#666666' }} />,
                        }}
                        sx={textFieldStyle}
                      />
                    </FormRow>
                  </>
                )}

                {/* Academic Information Section */}
                {renderFormSection(
                  "Academic Information",
                  <School />,
                  <>
                    <FormRow columns={isMobile ? 1 : 2}>
                      <FormControl fullWidth size="small">
                        <InputLabel sx={labelStyle}>University</InputLabel>
                        <Select
                          value={formData.university}
                          label="University"
                          onChange={(e) => handleFormChange('university', e.target.value)}
                          sx={selectStyle}
                          required
                        >
                          <MenuItem value="">
                            <Typography variant="body2" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                              Select University
                            </Typography>
                          </MenuItem>
                          {universities.map((university) => (
                            <MenuItem key={university} value={university}>
                              <Typography variant="body2" color={theme === 'dark' ? '#ccd6f6' : '#333333'}>
                                {university}
                              </Typography>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      
                      <FormControl fullWidth size="small">
                        <InputLabel sx={labelStyle}>College</InputLabel>
                        <Select
                          value={formData.college}
                          label="College"
                          onChange={(e) => handleFormChange('college', e.target.value)}
                          sx={selectStyle}
                          required
                        >
                          <MenuItem value="">
                            <Typography variant="body2" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                              Select College
                            </Typography>
                          </MenuItem>
                          {colleges.map((college) => (
                            <MenuItem key={college} value={college}>
                              <Typography variant="body2" color={theme === 'dark' ? '#ccd6f6' : '#333333'}>
                                {college}
                              </Typography>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </FormRow>

                    <FormRow columns={isMobile ? 1 : 2}>
                      <FormControl fullWidth size="small">
                        <InputLabel sx={labelStyle}>Department</InputLabel>
                        <Select
                          value={formData.department}
                          label="Department"
                          onChange={(e) => handleFormChange('department', e.target.value)}
                          sx={selectStyle}
                          required
                        >
                          <MenuItem value="">
                            <Typography variant="body2" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                              Select Department
                            </Typography>
                          </MenuItem>
                          {departments.map((dept) => (
                            <MenuItem key={dept} value={dept}>
                              <Typography variant="body2" color={theme === 'dark' ? '#ccd6f6' : '#333333'}>
                                {dept}
                              </Typography>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      
                      <FormControl fullWidth size="small">
                        <InputLabel sx={labelStyle}>Batch</InputLabel>
                        <Select
                          value={formData.batch}
                          label="Batch"
                          onChange={(e) => handleFormChange('batch', e.target.value)}
                          sx={selectStyle}
                          required
                        >
                          <MenuItem value="">
                            <Typography variant="body2" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                              Select Batch
                            </Typography>
                          </MenuItem>
                          {batches.map((batch) => (
                            <MenuItem key={batch} value={batch}>
                              <Typography variant="body2" color={theme === 'dark' ? '#ccd6f6' : '#333333'}>
                                {batch}
                              </Typography>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </FormRow>

                    <FormRow columns={isMobile ? 1 : 2}>
                      <TextField
                        fullWidth
                        label="Block"
                        value={formData.block}
                        onChange={(e) => handleFormChange('block', e.target.value)}
                        required
                        size="small"
                        placeholder="Block A"
                        sx={textFieldStyle}
                      />
                      
                      <TextField
                        fullWidth
                        label="Dorm"
                        value={formData.dorm}
                        onChange={(e) => handleFormChange('dorm', e.target.value)}
                        required
                        size="small"
                        placeholder="Dorm 101"
                        sx={textFieldStyle}
                      />
                    </FormRow>
                  </>
                )}

                {/* Address Information Section */}
                {renderFormSection(
                  "Address Information",
                  <LocationOn />,
                  <>
                    <FormRow columns={isMobile ? 1 : 4}>
                      <FormControl fullWidth size="small">
                        <InputLabel sx={labelStyle}>Region</InputLabel>
                        <Select
                          value={formData.region}
                          label="Region"
                          onChange={(e) => handleFormChange('region', e.target.value)}
                          sx={selectStyle}
                          required
                        >
                          <MenuItem value="">
                            <Typography variant="body2" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                              Select Region
                            </Typography>
                          </MenuItem>
                          {regions.map((region) => (
                            <MenuItem key={region} value={region}>
                              <Typography variant="body2" color={theme === 'dark' ? '#ccd6f6' : '#333333'}>
                                {region}
                              </Typography>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      
                      <TextField
                        fullWidth
                        label="Zone"
                        value={formData.zone}
                        onChange={(e) => handleFormChange('zone', e.target.value)}
                        required
                        size="small"
                        placeholder="Central Zone"
                        sx={textFieldStyle}
                      />
                      
                      <TextField
                        fullWidth
                        label="Wereda"
                        value={formData.wereda}
                        onChange={(e) => handleFormChange('wereda', e.target.value)}
                        required
                        size="small"
                        placeholder="Wereda 01"
                        sx={textFieldStyle}
                      />
                      
                      <TextField
                        fullWidth
                        label="Kebele"
                        value={formData.kebele}
                        onChange={(e) => handleFormChange('kebele', e.target.value)}
                        required
                        size="small"
                        placeholder="Kebele 02"
                        sx={textFieldStyle}
                      />
                    </FormRow>
                  </>
                )}

                {/* Religious Information Section */}
                {renderFormSection(
                  "Religious Information",
                  <Church />,
                  <>
                    <FormRow columns={isMobile ? 1 : 2}>
                      <TextField
                        fullWidth
                        label="Church"
                        value={formData.church}
                        onChange={(e) => handleFormChange('church', e.target.value)}
                        required
                        size="small"
                        placeholder="St. Mary Church"
                        InputProps={{
                          startAdornment: <Church fontSize="small" sx={{ mr: 1, color: theme === 'dark' ? '#a8b2d1' : '#666666' }} />,
                        }}
                        sx={textFieldStyle}
                      />
                      
                      <TextField
                        fullWidth
                        label="Authority"
                        value={formData.authority}
                        onChange={(e) => handleFormChange('authority', e.target.value)}
                        required
                        size="small"
                        placeholder="Local Authority"
                        InputProps={{
                          startAdornment: <Business fontSize="small" sx={{ mr: 1, color: theme === 'dark' ? '#a8b2d1' : '#666666' }} />,
                        }}
                        sx={textFieldStyle}
                      />
                    </FormRow>
                  </>
                )}

                {/* Language Information Section */}
                {renderFormSection(
                  "Language Information",
                  <Translate />,
                  <>
                    <FormRow columns={isMobile ? 1 : 2}>
                      <FormControl fullWidth size="small">
                        <InputLabel sx={labelStyle}>Mother Tongue</InputLabel>
                        <Select
                          value={formData.motherTongue}
                          label="Mother Tongue"
                          onChange={(e) => handleFormChange('motherTongue', e.target.value)}
                          sx={selectStyle}
                          required
                        >
                          <MenuItem value="">
                            <Typography variant="body2" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                              Select Mother Tongue
                            </Typography>
                          </MenuItem>
                          {motherTongues.map((language) => (
                            <MenuItem key={language} value={language}>
                              <Typography variant="body2" color={theme === 'dark' ? '#ccd6f6' : '#333333'}>
                                {language}
                              </Typography>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      
                      <Autocomplete
                        multiple
                        options={languages}
                        value={formData.additionalLanguages}
                        onChange={(event, newValue) => {
                          handleFormChange('additionalLanguages', newValue);
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Additional Languages"
                            size="small"
                            placeholder="Select languages you speak"
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
                                height: 22,
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

                {/* Course Information Section */}
                {renderFormSection(
                  "Course Information",
                  <School />,
                  <>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.attendsCourse}
                          onChange={(e) => handleFormChange('attendsCourse', e.target.checked)}
                          sx={{
                            color: theme === 'dark' ? '#00ffff' : '#007bff',
                            '&.Mui-checked': {
                              color: theme === 'dark' ? '#00ffff' : '#007bff',
                            },
                          }}
                        />
                      }
                      label="Attends Course"
                      sx={{
                        color: theme === 'dark' ? '#ccd6f6' : '#333333',
                        mb: 2
                      }}
                    />
                    
                    {formData.attendsCourse && (
                      <FormRow columns={isMobile ? 1 : 2}>
                        <TextField
                          fullWidth
                          label="Course Name"
                          value={formData.courseName}
                          onChange={(e) => handleFormChange('courseName', e.target.value)}
                          size="small"
                          placeholder="Bible Study, Religious Education, etc."
                          sx={textFieldStyle}
                        />
                        
                        <TextField
                          fullWidth
                          label="Course Church"
                          value={formData.courseChurch}
                          onChange={(e) => handleFormChange('courseChurch', e.target.value)}
                          size="small"
                          placeholder="Church where course is held"
                          sx={textFieldStyle}
                        />
                      </FormRow>
                    )}
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
                onClick={() => setOpenDialog(false)}
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
                onClick={isEditMode ? handleUpdateStudent : handleCreateStudent}
                variant="contained"
                disabled={!formData.firstName || !formData.lastName || !formData.phone || !formData.email || !formData.university || !formData.college || !formData.department || !formData.batch || !formData.motherTongue}
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
                {isEditMode ? 'Update Student' : 'Create Student'}
              </Button>
            </DialogActions>
          </Dialog>

          {/* View Student Dialog - UPDATED with gibyGubayeId */}
          <Dialog 
            open={openViewDialog} 
            onClose={() => setOpenViewDialog(false)} 
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
                      src={getPhotoUrl(selectedStudent) || undefined}
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
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Fingerprint fontSize="small" sx={{ color: 'rgba(255,255,255,0.8)' }} />
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                          Student ID: {selectedStudent.gibyGubayeId}
                        </Typography>
                      </Box>
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
                            src={getPhotoUrl(selectedStudent) || undefined}
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
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Fingerprint fontSize="small" sx={{ color: theme === 'dark' ? '#a8b2d1' : '#666666' }} />
                            <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                              Student ID: {selectedStudent.gibyGubayeId}
                            </Typography>
                          </Box>
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
                                {selectedStudent.motherName}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                                <CalendarToday fontSize="small" /> Date of Birth
                              </Typography>
                              <Typography variant="body1" sx={{ fontWeight: 'medium', color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                                {formatDate(selectedStudent.dateOfBirth)} ({calculateAge(selectedStudent.dateOfBirth)} years)
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                                <Work fontSize="small" /> Job
                              </Typography>
                              <Typography variant="body1" sx={{ fontWeight: 'medium', color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                                {selectedStudent.job}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </Box>

                      {/* Job Information Section */}
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
                            <WorkIcon /> Job Assignments ({studentJobs.length})
                          </Typography>
                          
                          {loadingStudentJobs ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                              <CircularProgress size={30} />
                            </Box>
                          ) : studentJobs.length === 0 ? (
                            <Box sx={{ textAlign: 'center', py: 2 }}>
                              <Typography variant="body1" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                                No job assignments found for this student.
                              </Typography>
                            </Box>
                          ) : (
                            <Box>
                              {studentJobs.map((job, index) => (
                                <Box key={job._id} sx={{ 
                                  mb: index < studentJobs.length - 1 ? 3 : 0, 
                                  pb: index < studentJobs.length - 1 ? 3 : 0, 
                                  borderBottom: index < studentJobs.length - 1 ? (theme === 'dark' ? '1px solid #334155' : '1px solid #eee') : 'none' 
                                }}>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                                      Job #{index + 1} - {job.class}
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
                                {selectedStudent.emergencyContact}
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
                                {selectedStudent.university}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                                College
                              </Typography>
                              <Typography variant="body1" sx={{ fontWeight: 'medium', color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                                {selectedStudent.college}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                                Department
                              </Typography>
                              <Typography variant="body1" sx={{ fontWeight: 'medium', color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                                {selectedStudent.department}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                                Batch
                              </Typography>
                              <Typography variant="body1" sx={{ fontWeight: 'medium', color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                                {selectedStudent.batch}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                                Block
                              </Typography>
                              <Typography variant="body1" sx={{ fontWeight: 'medium', color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                                {selectedStudent.block}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                                Dorm
                              </Typography>
                              <Typography variant="body1" sx={{ fontWeight: 'medium', color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                                {selectedStudent.dorm}
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
                                {selectedStudent.region}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                                Zone
                              </Typography>
                              <Typography variant="body1" sx={{ fontWeight: 'medium', color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                                {selectedStudent.zone}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                                Wereda
                              </Typography>
                              <Typography variant="body1" sx={{ fontWeight: 'medium', color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                                {selectedStudent.wereda}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                                Kebele
                              </Typography>
                              <Typography variant="body1" sx={{ fontWeight: 'medium', color: theme === 'dark' ? '#ccd6f6' : '#333333'}}>
                                {selectedStudent.kebele}
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
                                {selectedStudent.motherTongue}
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

                      {/* Other Information (Combined with Course Information) */}
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
                            gridTemplateColumns: isMobile ? '1fr' : selectedStudent.attendsCourse ? '1fr 1fr' : '1fr 1fr', 
                            gap: 2 
                          }}>
                            <Box>
                              <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                                Church
                              </Typography>
                              <Typography variant="body1" sx={{ fontWeight: 'medium', color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                                {selectedStudent.church}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                                Authority
                              </Typography>
                              <Typography variant="body1" sx={{ fontWeight: 'medium', color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                                {selectedStudent.authority}
                              </Typography>
                            </Box>
                            {selectedStudent.attendsCourse && (
                              <>
                                <Box>
                                  <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                                    Course Name
                                  </Typography>
                                  <Typography variant="body1" sx={{ fontWeight: 'medium', color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                                    {selectedStudent.courseName || 'Not specified'}
                                  </Typography>
                                </Box>
                                <Box>
                                  <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                                    Course Church
                                  </Typography>
                                  <Typography variant="body1" sx={{ fontWeight: 'medium', color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                                    {selectedStudent.courseChurch || 'Not specified'}
                                  </Typography>
                                </Box>
                              </>
                            )}
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
                      handleOpenEditDialog(selectedStudent);
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
                    Edit Student
                  </Button>
                </DialogActions>
              </>
            )}
          </Dialog>

          {/* Delete Confirmation Dialog - MATCHING USER PAGE STYLE */}
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
                Are you sure you want to delete student <strong style={{color: theme === 'dark' ? '#ff0000' : '#dc3545'}}>
                  {selectedStudent?.firstName} {selectedStudent?.lastName}
                </strong>? This action cannot be undone.
              </Typography>
              {selectedStudent?.photo && (
                <Typography variant="caption" color={theme === 'dark' ? '#94a3b8' : '#999999'} sx={{ display: 'block', mt: 1 }}>
                  Note: The student's photo will also be deleted.
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
                onClick={handleDeleteStudent} 
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
                Delete
              </Button>
            </DialogActions>
          </Dialog>

          {/* Notifications - MATCHING USER PAGE STYLE */}
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

export default StudentsPage;