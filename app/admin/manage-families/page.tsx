'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box, Typography, Card, CardContent,
  TextField, Chip, Alert, Snackbar,
  CircularProgress, useMediaQuery,
  IconButton, Button, Checkbox, FormControlLabel,
  Autocomplete, Stack, Tooltip,
  Accordion, AccordionSummary, AccordionDetails,
  Paper, Dialog, DialogTitle, DialogContent,
  DialogActions, FormControl, InputLabel,
  Select, MenuItem, Avatar,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Divider,
  Tabs, Tab
} from '@mui/material';
import AutoAssignChildrenDialog from '@/components/common/AutoAssignChildrenDialog';
import { motion } from 'framer-motion';
import { useTheme } from '@/lib/theme-context';
import {
  FamilyRestroom, Edit, Delete, Visibility,
  CalendarToday, Person, LocationOn,
  ExpandMore, Add, Home, People,
  Search, Refresh, CheckCircle,
  Save, Close, ArrowForward,
  Check, Clear, Male, Female,
  ChildCare, Group, Elderly,
  SupervisorAccount, AdminPanelSettings,
  PersonOutline, Edit as EditIcon,
  Delete as DeleteIcon, Add as AddIcon,
  Remove as RemoveIcon, PersonAdd,
  FamilyRestroom as FamilyIcon,
  ArrowBack, Woman, Badge as BadgeIcon,
  FilterList, MoreVert, MoreHoriz,
  School, Phone, Email, Cake,
  Fingerprint, Block, Check as CheckIcon,
  AccountTree
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import api from '@/app/utils/api';
import { format, parseISO } from 'date-fns';
import { useAuth } from '@/lib/auth';

// Types
interface Student {
  _id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  gender: 'male' | 'female';
  gibyGubayeId?: string;
  phone: string;
  email: string;
  batch: string;
  photo?: string;
  photoData?: any;
  motherName?: string;
  university?: string;
  college?: string;
  department?: string;
  region?: string;
  job?: string;
  dateOfBirth?: string;
  emergencyContact?: string;
}

interface FamilyChild {
  student: Student;
  relationship: 'son' | 'daughter';
  birthOrder?: number;
  addedAt: string;
}

interface FamilyMember {
  father: {
    student: Student;
    phone?: string;
    email?: string;
    occupation?: string;
  };
  mother: {
    student: Student;
    phone?: string;
    email?: string;
    occupation?: string;
  };
  children: FamilyChild[];
  createdAt: string;
}

interface GrandParent {
  title: string;
  grandFather?: Student;
  grandMother?: Student;
  families: FamilyMember[];
}

interface Family {
  _id: string;
  title: string;
  location: string;
  batch: string;
  allowOtherBatches: boolean;
  familyDate: string;
  familyLeader: string; // This is the ID
  familyCoLeader: string; // This is the ID
  familySecretary: string; // This is the ID
  // Add virtual fields
  leader?: Student; // This will be populated
  coLeader?: Student; // This will be populated
  secretary?: Student; // This will be populated
  grandParents: GrandParent[];
  status: 'current' | 'finished';
  createdBy: any;
  createdAt: string;
  updatedAt: string;
}

// Student Details Modal Component
const StudentDetailsModal = ({ 
  open, 
  onClose, 
  student 
}: { 
  open: boolean; 
  onClose: () => void; 
  student: Student | null;
}) => {
  const { theme } = useTheme();
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  const getPhotoUrl = (student: Student): string | null => {
    if (!student) return null;
    try {
      if (student.photoData && student.photoData.data) {
        let base64String: string;
        
        if (typeof student.photoData.data === 'string') {
          base64String = student.photoData.data;
        } else if (student.photoData.data.$binary && student.photoData.data.$binary.base64) {
          base64String = student.photoData.data.$binary.base64;
        } else if (student.photoData.data.data && Array.isArray(student.photoData.data.data)) {
          base64String = Buffer.from(student.photoData.data.data).toString('base64');
        } else {
          return null;
        }
        
        const cleanBase64 = base64String.replace(/\s/g, '');
        const contentType = student.photoData.contentType || 'image/jpeg';
        return `data:${contentType};base64,${cleanBase64}`;
      }
      
      if (student.photo && student.photo.startsWith('data:image')) {
        return student.photo;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting photo URL:', error);
      return null;
    }
  };

  const calculateAge = (dateOfBirth?: string) => {
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
    } catch {
      return 'N/A';
    }
  };

  const getAvatarColor = (studentId?: string | null) => {
    if (!studentId) return '#1976d2';
    
    const colors = ['#1976d2', '#2e7d32', '#ed6c02', '#d32f2f', '#7b1fa2', '#00796b', '#388e3c', '#f57c00', '#0288d1', '#c2185b'];
    
    try {
      const index = studentId.split('').reduce((acc, char) => acc + (char?.charCodeAt(0) || 0), 0) % colors.length;
      return colors[index];
    } catch (error) {
      return '#1976d2';
    }
  };

  const getStudentInitials = (student: Student) => {
    return `${student.firstName?.charAt(0) || ''}${student.lastName?.charAt(0) || ''}`.toUpperCase();
  };

  if (!student) return null;

  const photoUrl = getPhotoUrl(student);
  
  return (
    <Dialog
      open={open}
      onClose={onClose}
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
        py: 2,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          Student Details
        </Typography>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <Close />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Avatar
              src={photoUrl || undefined}
              sx={{
                width: 120,
                height: 120,
                mb: 2,
                border: `4px solid ${theme === 'dark' ? '#00ffff' : '#007bff'}`,
                fontSize: '2.5rem',
                fontWeight: 'bold',
                bgcolor: photoUrl ? 'transparent' : getAvatarColor(student._id)
              }}
            >
              {photoUrl ? '' : getStudentInitials(student)}
            </Avatar>
            <Chip
              label={student.gender === 'male' ? 'Male' : 'Female'}
              icon={student.gender === 'male' ? <Male /> : <Female />}
              sx={{
                backgroundColor: student.gender === 'male' 
                  ? (theme === 'dark' ? '#00ffff20' : '#007bff20')
                  : (theme === 'dark' ? '#ff00ff20' : '#9c27b020'),
                color: student.gender === 'male' 
                  ? (theme === 'dark' ? '#00ffff' : '#007bff')
                  : (theme === 'dark' ? '#ff00ff' : '#9c27b0')
              }}
            />
          </Box>
          
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5" sx={{ 
              fontWeight: 'bold',
              color: theme === 'dark' ? '#ccd6f6' : '#333333',
              mb: 1
            }}>
              {student.firstName} {student.middleName || ''} {student.lastName}
            </Typography>
            
            {student.motherName && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Person fontSize="small" sx={{ color: theme === 'dark' ? '#a8b2d1' : '#666666' }} />
                <Typography variant="body2" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                  Mother: {student.motherName}
                </Typography>
              </Box>
            )}
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Fingerprint fontSize="small" sx={{ color: theme === 'dark' ? '#a8b2d1' : '#666666' }} />
              <Typography variant="body2" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                ID: {student.gibyGubayeId || 'N/A'}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <School fontSize="small" sx={{ color: theme === 'dark' ? '#a8b2d1' : '#666666' }} />
                <Typography variant="body2" sx={{ color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                  {student.batch} • {student.university || 'N/A'}
                </Typography>
              </Box>
              
              {student.college && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AccountTree fontSize="small" sx={{ color: theme === 'dark' ? '#a8b2d1' : '#666666' }} />
                  <Typography variant="body2" sx={{ color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                    {student.college} • {student.department || 'N/A'}
                  </Typography>
                </Box>
              )}
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Phone fontSize="small" sx={{ color: theme === 'dark' ? '#a8b2d1' : '#666666' }} />
                <Typography variant="body2" sx={{ color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                  {student.phone}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Email fontSize="small" sx={{ color: theme === 'dark' ? '#a8b2d1' : '#666666' }} />
                <Typography variant="body2" sx={{ color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                  {student.email}
                </Typography>
              </Box>

              {student.region && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationOn fontSize="small" sx={{ color: theme === 'dark' ? '#a8b2d1' : '#666666' }} />
                  <Typography variant="body2" sx={{ color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                    {student.region}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Box>
          <Typography variant="subtitle2" sx={{ 
            color: theme === 'dark' ? '#00ffff' : '#007bff',
            mb: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <BadgeIcon /> Complete Information
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption" color={theme === 'dark' ? '#94a3b8' : '#999999'}>
                First Name
              </Typography>
              <Typography variant="body2" sx={{ color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                {student.firstName}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption" color={theme === 'dark' ? '#94a3b8' : '#999999'}>
                Last Name
              </Typography>
              <Typography variant="body2" sx={{ color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                {student.lastName}
              </Typography>
            </Box>
            
            {student.middleName && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" color={theme === 'dark' ? '#94a3b8' : '#999999'}>
                  Middle Name
                </Typography>
                <Typography variant="body2" sx={{ color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                  {student.middleName}
                </Typography>
              </Box>
            )}
            
            {student.motherName && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" color={theme === 'dark' ? '#94a3b8' : '#999999'}>
                  Mother's Name
                </Typography>
                <Typography variant="body2" sx={{ color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                  {student.motherName}
                </Typography>
              </Box>
            )}
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption" color={theme === 'dark' ? '#94a3b8' : '#999999'}>
                Student ID
              </Typography>
              <Typography variant="body2" sx={{ 
                color: theme === 'dark' ? '#ccd6f6' : '#333333',
                fontFamily: 'monospace'
              }}>
                {student.gibyGubayeId || 'N/A'}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption" color={theme === 'dark' ? '#94a3b8' : '#999999'}>
                Gender
              </Typography>
              <Typography variant="body2" sx={{ color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                {student.gender === 'male' ? 'Male' : 'Female'}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption" color={theme === 'dark' ? '#94a3b8' : '#999999'}>
                Batch
              </Typography>
              <Typography variant="body2" sx={{ color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                {student.batch}
              </Typography>
            </Box>
            
            {student.dateOfBirth && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" color={theme === 'dark' ? '#94a3b8' : '#999999'}>
                  Date of Birth
                </Typography>
                <Typography variant="body2" sx={{ color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                  {format(new Date(student.dateOfBirth), 'MMMM dd, yyyy')} ({calculateAge(student.dateOfBirth)})
                </Typography>
              </Box>
            )}
            
            {student.job && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" color={theme === 'dark' ? '#94a3b8' : '#999999'}>
                  Job/Profession
                </Typography>
                <Typography variant="body2" sx={{ color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                  {student.job}
                </Typography>
              </Box>
            )}
            
            {student.emergencyContact && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" color={theme === 'dark' ? '#94a3b8' : '#999999'}>
                  Emergency Contact
                </Typography>
                <Typography variant="body2" sx={{ color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                  {student.emergencyContact}
                </Typography>
              </Box>
            )}
            
            {student.university && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" color={theme === 'dark' ? '#94a3b8' : '#999999'}>
                  University
                </Typography>
                <Typography variant="body2" sx={{ color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                  {student.university}
                </Typography>
              </Box>
            )}
            
            {student.college && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" color={theme === 'dark' ? '#94a3b8' : '#999999'}>
                  College
                </Typography>
                <Typography variant="body2" sx={{ color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                  {student.college}
                </Typography>
              </Box>
            )}
            
            {student.department && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" color={theme === 'dark' ? '#94a3b8' : '#999999'}>
                  Department
                </Typography>
                <Typography variant="body2" sx={{ color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                  {student.department}
                </Typography>
              </Box>
            )}
            
            {student.region && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" color={theme === 'dark' ? '#94a3b8' : '#999999'}>
                  Region
                </Typography>
                <Typography variant="body2" sx={{ color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                  {student.region}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ 
        p: 2,
        borderTop: theme === 'dark' ? '1px solid #334155' : '1px solid #e5e7eb'
      }}>
        <Button 
          onClick={onClose}
          sx={{
            color: theme === 'dark' ? '#00ffff' : '#007bff'
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Main Component
const ManageFamilyPage = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { user } = useAuth();
  
  const [families, setFamilies] = useState<Family[]>([]);
  const [batches, setBatches] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalFamilies: 0,
    hasNext: false,
    hasPrev: false
  });

  const [filters, setFilters] = useState({
    search: '',
    location: '',
    batch: '',
    status: '',
    page: 1,
    limit: 10
  });

  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openStatusDialog, setOpenStatusDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedFamily, setSelectedFamily] = useState<Family | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentModalOpen, setStudentModalOpen] = useState(false);
  const [viewFamilyTab, setViewFamilyTab] = useState(0);
  
  const [formData, setFormData] = useState<{
    title: string;
    location: string;
    batch: string;
    allowOtherBatches: boolean;
    familyDate: Date | null;
    familyLeader: string;
    familyCoLeader: string;
    familySecretary: string;
    grandParents: GrandParent[];
  }>({
    title: '',
    location: '',
    batch: '',
    allowOtherBatches: false,
    familyDate: new Date(),
    familyLeader: '',
    familyCoLeader: '',
    familySecretary: '',
    grandParents: []
  });

  // Store all fetched students
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  // Add state for the dialog
const [openAutoAssignDialog, setOpenAutoAssignDialog] = useState(false);

// Add these calculations to determine eligibility
const [eligibleFamilies, setEligibleFamilies] = useState<Family[]>([]);
const [availableStudents, setAvailableStudents] = useState(0);

// Add this effect to calculate eligibility
useEffect(() => {
  // Filter families that have both parents
  const familiesWithBothParents = families.filter(family => 
    family.grandParents?.some(gp => 
      gp.families?.some(f => f.father?.student && f.mother?.student)
    )
  );
  
  setEligibleFamilies(familiesWithBothParents);
  
  // You might want to fetch available students count here
  // This is a simplified version
  if (familiesWithBothParents.length > 0) {
    // Calculate total children already assigned
    const totalAssignedChildren = families.reduce((total, family) => {
      return total + (family.grandParents?.reduce((gpTotal, gp) => {
        return gpTotal + (gp.families?.reduce((fTotal, f) => {
          return fTotal + (f.children?.length || 0);
        }, 0) || 0);
      }, 0) || 0);
    }, 0);
    
    // This is a placeholder - you'll need to fetch actual student count
    setAvailableStudents(Math.max(0, 100 - totalAssignedChildren)); // Example
  }
}, [families]);

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

  // Helper functions
  const getStudentDisplayName = (student: Student) => {
    const fullName = `${student.firstName} ${student.middleName || ''} ${student.lastName}`.trim();
    const id = student.gibyGubayeId ? ` (${student.gibyGubayeId})` : '';
    const batch = student.batch ? ` - ${student.batch}` : '';
    return `${fullName}${id}${batch}`;
  };

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy');
    } catch {
      return 'Invalid date';
    }
  };

  const calculateTotalMembers = (family: Family) => {
    let total = 3; // leaders
    family.grandParents.forEach(gp => {
      if (gp.grandFather) total++;
      if (gp.grandMother) total++;
      gp.families.forEach(family => {
        total += 2; // father + mother
        total += family.children.length;
      });
    });
    return total;
  };

  // Get all currently selected student IDs
  const getSelectedStudentIds = useCallback(() => {
    const selectedIds = new Set<string>();
    
    // Add leaders
    if (formData.familyLeader) selectedIds.add(formData.familyLeader);
    if (formData.familyCoLeader) selectedIds.add(formData.familyCoLeader);
    if (formData.familySecretary) selectedIds.add(formData.familySecretary);
    
    // Add grand parents
    formData.grandParents.forEach(gp => {
      if (gp.grandFather?._id) selectedIds.add(gp.grandFather._id);
      if (gp.grandMother?._id) selectedIds.add(gp.grandMother._id);
      
      // Add families
      gp.families.forEach(family => {
        if (family.father?.student?._id) selectedIds.add(family.father.student._id);
        if (family.mother?.student?._id) selectedIds.add(family.mother.student._id);
        
        // Add children
        family.children.forEach(child => {
          if (child.student?._id) selectedIds.add(child.student._id);
        });
      });
    });
    
    return selectedIds;
  }, [formData]);

  // Fetch data
  const fetchFamilies = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await api.get(`/families?${params}`);
      setFamilies(response.data.data.families || []);
      setPagination(response.data.data.pagination || {
        currentPage: 1,
        totalPages: 1,
        totalFamilies: 0,
        hasNext: false,
        hasPrev: false
      });
      setError('');
    } catch (error: any) {
      console.error('Error fetching families:', error);
      setError(error.response?.data?.message || 'Failed to fetch families');
      setFamilies([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchBatches = useCallback(async () => {
    try {
      const response = await api.get('/families/batches');
      setBatches(response.data.data.batches || []);
    } catch (error: any) {
      console.error('Failed to fetch batches:', error);
    }
  }, []);

  // Fetch all students
  const fetchAllStudents = useCallback(async () => {
    try {
      setLoadingStudents(true);
      const response = await api.get('/families/students/selection');
      const fetchedStudents = response.data.data.students || [];
      
      setAllStudents(fetchedStudents);
      return fetchedStudents;
    } catch (error: any) {
      console.error('Failed to fetch students:', error);
      setAllStudents([]);
      return [];
    } finally {
      setLoadingStudents(false);
    }
  }, []);

  // Initialize data
  useEffect(() => {
    if (user) {
      fetchFamilies();
      fetchBatches();
    }
  }, [fetchFamilies, fetchBatches, user, filters.page, filters.limit, filters.batch, filters.status, filters.search]);

  // Fetch students when dialog opens
  useEffect(() => {
    if (openCreateDialog || openEditDialog) {
      fetchAllStudents();
    }
  }, [openCreateDialog, openEditDialog, fetchAllStudents]);

  // Get filtered students for specific roles
  const getFilteredStudents = useCallback((role: string, currentStudentId?: string) => {
    const selectedIds = getSelectedStudentIds();
    
    let filtered = allStudents.filter(student => {
      // Exclude currently selected students (except the current one being edited)
      if (student._id === currentStudentId) return true;
      return !selectedIds.has(student._id);
    });
    
    // Apply gender filters
    switch (role) {
      case 'grandFather':
      case 'father':
        filtered = filtered.filter(s => s.gender === 'male');
        break;
      case 'grandMother':
      case 'mother':
        filtered = filtered.filter(s => s.gender === 'female');
        break;
      case 'child':
        if (!formData.allowOtherBatches && formData.batch) {
          filtered = filtered.filter(s => s.batch === formData.batch);
        }
        break;
    }
    
    return filtered;
  }, [allStudents, formData.allowOtherBatches, formData.batch, getSelectedStudentIds]);

  // Find student by ID
  const findStudentById = (id: string): Student | null => {
    return allStudents.find(s => s._id === id) || null;
  };

  // Handlers
  const handleOpenCreateDialog = () => {
    setFormData({
      title: '',
      location: '',
      batch: '',
      allowOtherBatches: false,
      familyDate: new Date(),
      familyLeader: '',
      familyCoLeader: '',
      familySecretary: '',
      grandParents: []
    });
    
    setOpenCreateDialog(true);
  };

  const handleOpenEditDialog = async (family: Family) => {
    setSelectedFamily(family);
    setFormData({
      title: family.title,
      location: family.location,
      batch: family.batch,
      allowOtherBatches: family.allowOtherBatches,
      familyDate: parseISO(family.familyDate),
      familyLeader: family.familyLeader, // This is the ID
      familyCoLeader: family.familyCoLeader, // This is the ID
      familySecretary: family.familySecretary, // This is the ID
      grandParents: family.grandParents.map(gp => ({
        ...gp,
        families: gp.families.map(fam => ({
          ...fam,
          children: fam.children.map(child => ({
            ...child,
            addedAt: child.addedAt || new Date().toISOString()
          }))
        }))
      }))
    });
    
    setOpenEditDialog(true);
  };

  const handleViewStudent = (student: Student) => {
    setSelectedStudent(student);
    setStudentModalOpen(true);
  };

  const handleViewFamily = (family: Family) => {
    setSelectedFamily(family);
    setViewFamilyTab(0);
    setOpenViewDialog(true);
  };

  const handleOpenStatusDialog = (family: Family) => {
    setSelectedFamily(family);
    setOpenStatusDialog(true);
  };

  const handleOpenDeleteDialog = (family: Family) => {
    setSelectedFamily(family);
    setOpenDeleteDialog(true);
  };

  // Form handlers
  const addGrandParent = () => {
    setFormData(prev => ({
      ...prev,
      grandParents: [...prev.grandParents, { title: '', families: [] }]
    }));
  };

  const removeGrandParent = (index: number) => {
    const newGrandParents = [...formData.grandParents];
    newGrandParents.splice(index, 1);
    setFormData(prev => ({ ...prev, grandParents: newGrandParents }));
  };

  const updateGrandParent = (index: number, field: keyof GrandParent, value: any) => {
    const newGrandParents = [...formData.grandParents];
    newGrandParents[index] = { ...newGrandParents[index], [field]: value };
    setFormData(prev => ({ ...prev, grandParents: newGrandParents }));
  };

  const addFamily = (grandParentIndex: number) => {
    const newGrandParents = [...formData.grandParents];
    newGrandParents[grandParentIndex].families.push({
      father: { student: null as any },
      mother: { student: null as any },
      children: [],
      createdAt: new Date().toISOString()
    });
    setFormData(prev => ({ ...prev, grandParents: newGrandParents }));
  };

  const removeFamily = (grandParentIndex: number, familyIndex: number) => {
    const newGrandParents = [...formData.grandParents];
    newGrandParents[grandParentIndex].families.splice(familyIndex, 1);
    setFormData(prev => ({ ...prev, grandParents: newGrandParents }));
  };

  const addChildToFamily = (grandParentIndex: number, familyIndex: number) => {
    const newGrandParents = [...formData.grandParents];
    newGrandParents[grandParentIndex].families[familyIndex].children.push({
      student: null as any,
      relationship: 'son',
      birthOrder: newGrandParents[grandParentIndex].families[familyIndex].children.length + 1,
      addedAt: new Date().toISOString()
    });
    setFormData(prev => ({ ...prev, grandParents: newGrandParents }));
  };

  const removeChildFromFamily = (grandParentIndex: number, familyIndex: number, childIndex: number) => {
    const newGrandParents = [...formData.grandParents];
    newGrandParents[grandParentIndex].families[familyIndex].children.splice(childIndex, 1);
    setFormData(prev => ({ ...prev, grandParents: newGrandParents }));
  };

  // Create/Update family
  const handleSaveFamily = async () => {
    try {
      // Validate required fields
      if (!formData.title || !formData.location || !formData.batch || 
          !formData.familyLeader || !formData.familyCoLeader || !formData.familySecretary) {
        setError('Please fill all required fields: Title, Location, Batch, and all Leaders');
        return;
      }

      // Validate grand parents
      for (const gp of formData.grandParents) {
        if (!gp.title) {
          setError('Grand parent title is required');
          return;
        }
        if (!gp.grandFather && !gp.grandMother) {
          setError('At least one of grand father or grand mother is required');
          return;
        }
        
        // Validate families
        for (const family of gp.families) {
          if (!family.father?.student) {
            setError('Father is required for all families');
            return;
          }
          if (!family.mother?.student) {
            setError('Mother is required for all families');
            return;
          }
        }
      }

      const payload = {
        title: formData.title.trim(),
        location: formData.location.trim(),
        batch: formData.batch,
        allowOtherBatches: formData.allowOtherBatches,
        familyDate: formData.familyDate,
        familyLeader: formData.familyLeader,
        familyCoLeader: formData.familyCoLeader,
        familySecretary: formData.familySecretary,
        grandParents: formData.grandParents.map(gp => ({
          title: gp.title.trim(),
          grandFather: gp.grandFather?._id,
          grandMother: gp.grandMother?._id,
          families: gp.families.map(family => ({
            father: {
              student: family.father.student._id,
              phone: family.father.phone,
              email: family.father.email,
              occupation: family.father.occupation
            },
            mother: {
              student: family.mother.student._id,
              phone: family.mother.phone,
              email: family.mother.email,
              occupation: family.mother.occupation
            },
            children: family.children.map(child => ({
              student: child.student._id,
              relationship: child.relationship,
              birthOrder: child.birthOrder
            }))
          }))
        }))
      };

      const endpoint = openEditDialog && selectedFamily 
        ? `/families/${selectedFamily._id}`
        : '/families';
      
      const method = openEditDialog ? 'put' : 'post';
      
      const response = await api[method](endpoint, payload);
      
      setSuccess(openEditDialog ? 'Family updated successfully' : 'Family created successfully');
      setOpenCreateDialog(false);
      setOpenEditDialog(false);
      fetchFamilies();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to save family');
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedFamily) return;

    try {
      const newStatus = selectedFamily.status === 'current' ? 'finished' : 'current';
      await api.patch(`/families/${selectedFamily._id}/status`, { status: newStatus });
      
      setSuccess(`Family status updated to ${newStatus}`);
      setOpenStatusDialog(false);
      fetchFamilies();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to update status');
    }
  };

  const handleDeleteFamily = async () => {
    if (!selectedFamily) return;

    try {
      await api.delete(`/families/${selectedFamily._id}`);
      setSuccess('Family deleted successfully');
      setOpenDeleteDialog(false);
      fetchFamilies();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to delete family');
    }
  };

  // Filter handlers
 const handleFilterChange = (field: string, value: string | number) => {
  setFilters(prev => ({
    ...prev,
    [field]: value,
    page: 1
  }));
};

  const resetFilters = () => {
    setFilters({
      search: '',
      location: '',
      batch: '',
      status: '',
      page: 1,
      limit: 10
    });
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setFilters(prev => ({ ...prev, page: value }));
  };

  // Mobile responsive card view
  const renderMobileFamilyCard = (family: Family) => {
    const totalMembers = calculateTotalMembers(family);
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card sx={{ 
          mb: 2, 
          backgroundColor: themeStyles.cardBg, 
          border: `1px solid ${themeStyles.cardBorder}`,
          borderRadius: 2,
          overflow: 'hidden'
        }}>
          <CardContent sx={{ p: 2 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box>
                <Typography variant="subtitle1" sx={{ 
                  fontWeight: 'bold', 
                  color: themeStyles.textColor, 
                  mb: 0.5,
                  lineHeight: 1.2
                }}>
                  {family.title}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                  <Chip
                    label={family.batch}
                    size="small"
                    sx={{ 
                      height: 20,
                      fontSize: '0.7rem',
                      backgroundColor: theme === 'dark' ? '#00ffff20' : '#007bff20',
                      color: theme === 'dark' ? '#00ffff' : '#007bff'
                    }}
                  />
                  <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                    {family.location}
                  </Typography>
                </Box>
              </Box>
              <Chip
                label={family.status}
                size="small"
                color={family.status === 'current' ? 'success' : 'default'}
                sx={{ height: 24 }}
              />
            </Box>

            {/* Leaders */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'} sx={{ mb: 0.5, display: 'block' }}>
                Leaders:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                <Chip 
                  label={family.leader?.firstName || 'N/A'}
                  size="small"
                  onClick={() => family.leader && handleViewStudent(family.leader)}
                  sx={{ 
                    height: 20, 
                    fontSize: '0.7rem',
                    cursor: family.leader ? 'pointer' : 'default',
                    backgroundColor: theme === 'dark' ? '#00ffff20' : '#007bff20',
                    color: theme === 'dark' ? '#00ffff' : '#007bff'
                  }}
                />
                <Chip 
                  label={family.coLeader?.firstName || 'N/A'}
                  size="small"
                  onClick={() => family.coLeader && handleViewStudent(family.coLeader)}
                  sx={{ 
                    height: 20, 
                    fontSize: '0.7rem',
                    cursor: family.coLeader ? 'pointer' : 'default',
                    backgroundColor: theme === 'dark' ? '#00ff0020' : '#28a74520',
                    color: theme === 'dark' ? '#00ff00' : '#28a745'
                  }}
                />
                <Chip 
                  label={family.secretary?.firstName || 'N/A'}
                  size="small"
                  onClick={() => family.secretary && handleViewStudent(family.secretary)}
                  sx={{ 
                    height: 20, 
                    fontSize: '0.7rem',
                    cursor: family.secretary ? 'pointer' : 'default',
                    backgroundColor: theme === 'dark' ? '#ff990020' : '#ff990020',
                    color: theme === 'dark' ? '#ff9900' : '#ff9900'
                  }}
                />
              </Box>
            </Box>

            {/* Stats */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              mb: 2,
              p: 1,
              backgroundColor: theme === 'dark' ? '#1e293b' : '#f8f9fa',
              borderRadius: 1
            }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                  Members
                </Typography>
                <Typography variant="body2" sx={{ 
                  fontWeight: 'bold',
                  color: themeStyles.textColor
                }}>
                  {totalMembers}
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                  Parents
                </Typography>
                <Typography variant="body2" sx={{ 
                  fontWeight: 'bold',
                  color: themeStyles.textColor
                }}>
                  {family.grandParents.length}
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                  Date
                </Typography>
                <Typography variant="body2" sx={{ 
                  fontWeight: 'bold',
                  color: themeStyles.textColor
                }}>
                  {formatDate(family.familyDate)}
                </Typography>
              </Box>
            </Box>

            {/* Actions */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              borderTop: theme === 'dark' ? '1px solid #334155' : '1px solid #e5e7eb',
              pt: 1
            }}>
              <Button
                size="small"
                startIcon={<Visibility fontSize="small" />}
                onClick={() => handleViewFamily(family)}
                sx={{
                  color: theme === 'dark' ? '#00ffff' : '#007bff',
                  fontSize: '0.75rem',
                  minWidth: 'auto',
                  px: 1
                }}
              >
                View
              </Button>
              <Button
                size="small"
                startIcon={<Edit fontSize="small" />}
                onClick={() => handleOpenEditDialog(family)}
                sx={{
                  color: theme === 'dark' ? '#00ff00' : '#28a745',
                  fontSize: '0.75rem',
                  minWidth: 'auto',
                  px: 1
                }}
              >
                Edit
              </Button>
              <Button
                size="small"
                startIcon={family.status === 'current' ? <Block fontSize="small" /> : <CheckIcon fontSize="small" />}
                onClick={() => handleOpenStatusDialog(family)}
                sx={{
                  color: family.status === 'current' 
                    ? (theme === 'dark' ? '#ff9900' : '#ff9900')
                    : (theme === 'dark' ? '#00ff00' : '#28a745'),
                  fontSize: '0.75rem',
                  minWidth: 'auto',
                  px: 1
                }}
              >
                {family.status === 'current' ? 'Close' : 'Activate'}
              </Button>
              <Button
                size="small"
                startIcon={<Delete fontSize="small" />}
                onClick={() => handleOpenDeleteDialog(family)}
                sx={{
                  color: theme === 'dark' ? '#ff0000' : '#dc3545',
                  fontSize: '0.75rem',
                  minWidth: 'auto',
                  px: 1
                }}
              >
                Delete
              </Button>
            </Box>
          </CardContent>
        </Card>
      </motion.div>
    );
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
                color: themeStyles.textColor, 
                mb: 1 
              }}>
                Family Management
              </Typography>
              <Typography variant={isMobile ? "body2" : "body1"} color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                Create and manage family structures for students
              </Typography>
            </Box>
          </motion.div>

          {/* Filter Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
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
                    color: themeStyles.textColor,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    <FilterList /> Family Filters
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
                      Create Family
                    </Button>
                  </Box>
                </Box>
                
                {/* Filter Controls */}
                <Box sx={{ 
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: 2,
                  flexWrap: 'wrap'
                }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Search Families"
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    placeholder="Search by title, location, or leader name..."
                    sx={{ 
                      minWidth: { xs: '100%', sm: '250px' },
                      ...textFieldStyle 
                    }}
                  />
                  
                  <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: '150px' } }}>
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
                      onChange={(e) => handleFilterChange('batch', e.target.value)}
                      label="Batch"
                      sx={{
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
                      {batches.map(batch => (
                        <MenuItem key={batch} value={batch}>{batch}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: '150px' } }}>
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
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                      label="Status"
                      sx={{
                        backgroundColor: theme === 'dark' ? '#1e293b' : 'white',
                        color: theme === 'dark' ? '#ccd6f6' : '#333333',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: theme === 'dark' ? '#334155' : '#e5e7eb',
                        }
                      }}
                    >
                      <MenuItem value="">All Status</MenuItem>
                      <MenuItem value="current">Current</MenuItem>
                      <MenuItem value="finished">Finished</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: '150px' } }}>
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
                      onChange={(e) => handleFilterChange('limit', Number(e.target.value))}
                      label="Per Page"
                      sx={{
                        backgroundColor: theme === 'dark' ? '#1e293b' : 'white',
                        color: theme === 'dark' ? '#ccd6f6' : '#333333',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: theme === 'dark' ? '#334155' : '#e5e7eb',
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

          {/* Families List */}
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
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {isMobile ? (
                <Box>
                  {families.map(family => renderMobileFamilyCard(family))}
                </Box>
              ) : (
                <TableContainer component={Card} sx={{ 
                  backgroundColor: themeStyles.cardBg, 
                  border: `1px solid ${themeStyles.cardBorder}`,
                  borderRadius: 2,
                  overflow: 'hidden'
                }}>
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
                          Family Title
                        </TableCell>
                        <TableCell sx={{ 
                          color: 'white', 
                          fontWeight: 'bold',
                          fontSize: '0.875rem',
                          py: 2
                        }}>
                          Batch & Location
                        </TableCell>
                        <TableCell sx={{ 
                          color: 'white', 
                          fontWeight: 'bold',
                          fontSize: '0.875rem',
                          py: 2
                        }}>
                          Leaders
                        </TableCell>
                        <TableCell sx={{ 
                          color: 'white', 
                          fontWeight: 'bold',
                          fontSize: '0.875rem',
                          py: 2
                        }}>
                          Members
                        </TableCell>
                        <TableCell sx={{ 
                          color: 'white', 
                          fontWeight: 'bold',
                          fontSize: '0.875rem',
                          py: 2
                        }}>
                          Date
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
                      {families.map((family) => {
                        const totalMembers = calculateTotalMembers(family);
                        
                        return (
                          <TableRow 
                            key={family._id} 
                            hover
                            sx={{ 
                              '&:hover': {
                                backgroundColor: theme === 'dark' ? '#1e293b' : '#f8fafc'
                              }
                            }}
                          >
                            <TableCell sx={{ py: 2.5 }}>
                              <Typography sx={{ 
                                fontWeight: 'medium', 
                                color: themeStyles.textColor,
                                fontSize: '0.9rem'
                              }}>
                                {family.title}
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ py: 2.5 }}>
                              <Box>
                                <Typography variant="body2" sx={{ 
                                  fontWeight: 'medium',
                                  color: themeStyles.textColor
                                }}>
                                  {family.batch}
                                </Typography>
                                <Typography variant="caption" color={theme === 'dark' ? '#94a3b8' : '#999999'}>
                                  {family.location}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell sx={{ py: 2.5 }}>
                              <Stack spacing={0.5}>
                                <Tooltip title="View Leader">
                                  <Chip
                                    label={family.leader?.firstName || 'N/A'}
                                    size="small"
                                    onClick={() => family.leader && handleViewStudent(family.leader)}
                                    sx={{ 
                                      cursor: family.leader ? 'pointer' : 'default',
                                      backgroundColor: theme === 'dark' ? '#00ffff20' : '#007bff20',
                                      color: theme === 'dark' ? '#00ffff' : '#007bff'
                                    }}
                                  />
                                </Tooltip>
                                <Tooltip title="View Co-Leader">
                                  <Chip
                                    label={family.coLeader?.firstName || 'N/A'}
                                    size="small"
                                    onClick={() => family.coLeader && handleViewStudent(family.coLeader)}
                                    sx={{ 
                                      cursor: family.coLeader ? 'pointer' : 'default',
                                      backgroundColor: theme === 'dark' ? '#00ff0020' : '#28a74520',
                                      color: theme === 'dark' ? '#00ff00' : '#28a745'
                                    }}
                                  />
                                </Tooltip>
                                <Tooltip title="View Secretary">
                                  <Chip
                                    label={family.secretary?.firstName || 'N/A'}
                                    size="small"
                                    onClick={() => family.secretary && handleViewStudent(family.secretary)}
                                    sx={{ 
                                      cursor: family.secretary ? 'pointer' : 'default',
                                      backgroundColor: theme === 'dark' ? '#ff990020' : '#ff990020',
                                      color: theme === 'dark' ? '#ff9900' : '#ff9900'
                                    }}
                                  />
                                </Tooltip>
                              </Stack>
                            </TableCell>
                            <TableCell sx={{ py: 2.5 }}>
                              <Typography sx={{ 
                                fontWeight: 'medium',
                                color: themeStyles.textColor
                              }}>
                                {totalMembers} total
                              </Typography>
                              <Typography variant="caption" color={theme === 'dark' ? '#94a3b8' : '#999999'}>
                                {family.grandParents.length} parent(s)
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ py: 2.5 }}>
                              <Typography variant="body2" color={themeStyles.textColor}>
                                {formatDate(family.familyDate)}
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ py: 2.5 }}>
                              <Chip
                                label={family.status}
                                size="small"
                                color={family.status === 'current' ? 'success' : 'default'}
                                sx={{ 
                                  fontSize: '0.75rem',
                                  fontWeight: 'medium'
                                }}
                              />
                            </TableCell>
                            <TableCell sx={{ py: 2.5 }}>
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <Tooltip title="View">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleViewFamily(family)}
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
                                    onClick={() => handleOpenEditDialog(family)}
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
                                <Tooltip title={family.status === 'current' ? 'Close Family' : 'Activate Family'}>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleOpenStatusDialog(family)}
                                    sx={{ 
                                      color: family.status === 'current' 
                                        ? (theme === 'dark' ? '#ff9900' : '#ff9900')
                                        : (theme === 'dark' ? '#00ff00' : '#28a745'),
                                      '&:hover': {
                                        backgroundColor: family.status === 'current' 
                                          ? (theme === 'dark' ? '#ff990020' : '#ff990010')
                                          : (theme === 'dark' ? '#00ff0020' : '#28a74510')
                                      }
                                    }}
                                  >
                                    {family.status === 'current' ? <Block fontSize="small" /> : <CheckIcon fontSize="small" />}
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleOpenDeleteDialog(family)}
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

                  {families.length === 0 && !loading && (
                    <Box sx={{ 
                      textAlign: 'center', 
                      py: 8,
                      px: 2
                    }}>
                      <FamilyRestroom sx={{ 
                        fontSize: 64, 
                        color: theme === 'dark' ? '#334155' : '#cbd5e1',
                        mb: 2
                      }} />
                      <Typography variant="h6" color={theme === 'dark' ? '#a8b2d1' : '#666666'} sx={{ mb: 1 }}>
                        No families found
                      </Typography>
                      <Typography variant="body2" color={theme === 'dark' ? '#94a3b8' : '#999999'}>
                        Try adjusting your filters or create a new family
                      </Typography>
                    </Box>
                  )}
                </TableContainer>
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
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Button
                      disabled={!pagination.hasPrev}
                      onClick={() => handlePageChange(null as any, filters.page - 1)}
                      sx={{
                        color: theme === 'dark' ? '#00ffff' : '#007bff',
                        '&:disabled': {
                          color: theme === 'dark' ? '#334155' : '#cbd5e1'
                        }
                      }}
                    >
                      Previous
                    </Button>
                    <Typography variant="body2" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                      Page {filters.page} of {pagination.totalPages}
                    </Typography>
                    <Button
                      disabled={!pagination.hasNext}
                      onClick={() => handlePageChange(null as any, filters.page + 1)}
                      sx={{
                        color: theme === 'dark' ? '#00ffff' : '#007bff',
                        '&:disabled': {
                          color: theme === 'dark' ? '#334155' : '#cbd5e1'
                        }
                      }}
                    >
                      Next
                    </Button>
                  </Box>
                  
                  <Typography variant="body2" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                    Showing {((filters.page - 1) * filters.limit) + 1} to {Math.min(filters.page * filters.limit, pagination.totalFamilies)} of {pagination.totalFamilies} families
                  </Typography>
                </Box>
              )}
            </motion.div>
          )}

          {/* Create/Edit Family Dialog */}
          <Dialog
            open={openCreateDialog || openEditDialog}
            onClose={() => {
              setOpenCreateDialog(false);
              setOpenEditDialog(false);
            }}
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
            <DialogTitle sx={{ 
              backgroundColor: theme === 'dark' ? '#0f172a' : 'white',
              borderBottom: theme === 'dark' ? '1px solid #334155' : '1px solid #e5e7eb',
              py: 3
            }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                {openEditDialog ? 'Edit Family' : 'Create New Family'}
              </Typography>
            </DialogTitle>
            <DialogContent dividers sx={{ overflowY: 'auto', p: 3 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Basic Information */}
                <Box>
                  <Typography variant="subtitle1" gutterBottom sx={{ 
                    color: theme === 'dark' ? '#00ffff' : '#007bff',
                    mb: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    <Home /> Basic Information
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ 
                      display: 'flex',
                      flexDirection: { xs: 'column', sm: 'row' },
                      gap: 2
                    }}>
                      <TextField
                        label="Family Title *"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        fullWidth
                        size="small"
                        sx={textFieldStyle}
                      />
                      <TextField
                        label="Location *"
                        value={formData.location}
                        onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                        fullWidth
                        size="small"
                        sx={textFieldStyle}
                      />
                    </Box>
                    
                    <Box sx={{ 
                      display: 'flex',
                      flexDirection: { xs: 'column', sm: 'row' },
                      gap: 2
                    }}>
                      <FormControl fullWidth size="small">
                        <InputLabel sx={{ 
                          color: theme === 'dark' ? '#a8b2d1' : '#666666',
                          '&.Mui-focused': {
                            color: theme === 'dark' ? '#00ffff' : '#007bff',
                          }
                        }}>
                          Batch *
                        </InputLabel>
                        <Select
                          value={formData.batch}
                          onChange={(e) => setFormData(prev => ({ ...prev, batch: e.target.value }))}
                          label="Batch *"
                          sx={{
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
                          <MenuItem value="">Select Batch</MenuItem>
                          {batches.map(batch => (
                            <MenuItem key={batch} value={batch}>{batch}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      
                      <DatePicker
                        label="Family Date"
                        value={formData.familyDate}
                        onChange={(newValue) => setFormData(prev => ({ ...prev, familyDate: newValue }))}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            size: 'small',
                            sx: textFieldStyle
                          }
                        }}
                      />
                    </Box>
                    
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.allowOtherBatches}
                          onChange={(e) => setFormData(prev => ({ ...prev, allowOtherBatches: e.target.checked }))}
                          sx={{
                            color: theme === 'dark' ? '#00ffff' : '#007bff',
                            '&.Mui-checked': {
                              color: theme === 'dark' ? '#00ffff' : '#007bff',
                            }
                          }}
                        />
                      }
                      label={
                        <Typography variant="body2" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                          Allow children from other batches (not just selected batch)
                        </Typography>
                      }
                    />
                  </Box>
                </Box>

                {/* Leaders */}
                <Box>
                  <Typography variant="subtitle1" gutterBottom sx={{ 
                    color: theme === 'dark' ? '#00ff00' : '#28a745',
                    mb: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    <SupervisorAccount /> Family Leaders
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {/* Family Leader */}
                    <Autocomplete
                      options={getFilteredStudents('leader', formData.familyLeader)}
                      loading={loadingStudents}
                      getOptionLabel={(option) => getStudentDisplayName(option)}
                      value={findStudentById(formData.familyLeader) || null}
                      onChange={(_, value) => {
                        setFormData(prev => ({ 
                          ...prev, 
                          familyLeader: value?._id || '' 
                        }));
                      }}
                      renderInput={(params) => (
                        <TextField 
                          {...params} 
                          label="Family Leader *" 
                          size="small" 
                          sx={textFieldStyle}
                          placeholder="Select student..."
                          InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                              <>
                                {loadingStudents ? <CircularProgress color="inherit" size={20} /> : null}
                                {params.InputProps.endAdornment}
                              </>
                            ),
                          }}
                        />
                      )}
                      renderOption={(props, option) => (
                        <li {...props}>
                          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="body2">
                              {option.firstName} {option.middleName || ''} {option.lastName}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                              <Typography variant="caption" color={theme === 'dark' ? '#94a3b8' : '#999999'}>
                                ID: {option.gibyGubayeId || 'N/A'}
                              </Typography>
                              <Typography variant="caption" color={theme === 'dark' ? '#94a3b8' : '#999999'}>
                                Batch: {option.batch}
                              </Typography>
                              <Typography variant="caption" color={theme === 'dark' ? '#94a3b8' : '#999999'}>
                                {option.gender === 'male' ? '♂' : '♀'}
                              </Typography>
                            </Box>
                          </Box>
                        </li>
                      )}
                      isOptionEqualToValue={(option, value) => option._id === value._id}
                    />
                    
                    <Box sx={{ 
                      display: 'flex',
                      flexDirection: { xs: 'column', sm: 'row' },
                      gap: 2
                    }}>
                      {/* Co-Leader */}
                      <Autocomplete
                        options={getFilteredStudents('coLeader', formData.familyCoLeader)}
                        loading={loadingStudents}
                        getOptionLabel={(option) => getStudentDisplayName(option)}
                        value={findStudentById(formData.familyCoLeader) || null}
                        onChange={(_, value) => setFormData(prev => ({ 
                          ...prev, 
                          familyCoLeader: value?._id || '' 
                        }))}
                        renderInput={(params) => (
                          <TextField 
                            {...params} 
                            label="Co-Leader *" 
                            size="small" 
                            sx={textFieldStyle}
                            placeholder="Select student..."
                            InputProps={{
                              ...params.InputProps,
                              endAdornment: (
                                <>
                                  {loadingStudents ? <CircularProgress color="inherit" size={20} /> : null}
                                  {params.InputProps.endAdornment}
                                </>
                              ),
                            }}
                          />
                        )}
                        isOptionEqualToValue={(option, value) => option._id === value._id}
                        fullWidth
                      />
                      
                      {/* Secretary */}
                      <Autocomplete
                        options={getFilteredStudents('secretary', formData.familySecretary)}
                        loading={loadingStudents}
                        getOptionLabel={(option) => getStudentDisplayName(option)}
                        value={findStudentById(formData.familySecretary) || null}
                        onChange={(_, value) => setFormData(prev => ({ 
                          ...prev, 
                          familySecretary: value?._id || '' 
                        }))}
                        renderInput={(params) => (
                          <TextField 
                            {...params} 
                            label="Secretary *" 
                            size="small" 
                            sx={textFieldStyle}
                            placeholder="Select student..."
                            InputProps={{
                              ...params.InputProps,
                              endAdornment: (
                                <>
                                  {loadingStudents ? <CircularProgress color="inherit" size={20} /> : null}
                                  {params.InputProps.endAdornment}
                                </>
                              ),
                            }}
                          />
                        )}
                        isOptionEqualToValue={(option, value) => option._id === value._id}
                        fullWidth
                      />
                    </Box>
                  </Box>
                </Box>

                {/* Grand Parents */}
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle1" sx={{ 
                      color: theme === 'dark' ? '#ff9900' : '#ff9900',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}>
                      <Elderly /> Grand Parents
                    </Typography>
                    <Button 
                      startIcon={<Add />} 
                      onClick={addGrandParent}
                      size="small"
                      sx={{
                        color: theme === 'dark' ? '#00ffff' : '#007bff'
                      }}
                    >
                      Add Grand Parent
                    </Button>
                  </Box>
                  
                  {formData.grandParents.map((gp, gpIndex) => (
                    <Accordion 
                      key={gpIndex} 
                      defaultExpanded={gpIndex === 0}
                      sx={{
                        mb: 2,
                        backgroundColor: theme === 'dark' ? '#1e293b' : 'white',
                        border: theme === 'dark' ? '1px solid #334155' : '1px solid #e5e7eb',
                        '&:before': { display: 'none' }
                      }}
                    >
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                          <Elderly sx={{ color: theme === 'dark' ? '#ff9900' : '#ff9900' }} />
                          <Box sx={{ flex: 1 }}>
                            <Typography sx={{ fontWeight: 'medium', color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                              {gp.title || `Grand Parent ${gpIndex + 1}`}
                            </Typography>
                            {(gp.grandFather || gp.grandMother) && (
                              <Typography variant="caption" color={theme === 'dark' ? '#94a3b8' : '#999999'}>
                                {gp.grandFather?.firstName || ''} {gp.grandMother?.firstName ? '& ' + gp.grandMother.firstName : ''}
                              </Typography>
                            )}
                          </Box>
                          <IconButton 
                            size="small" 
                            onClick={(e) => {
                              e.stopPropagation();
                              removeGrandParent(gpIndex);
                            }}
                            sx={{ color: theme === 'dark' ? '#ff0000' : '#dc3545' }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Box>
                      </AccordionSummary>
                      
                      <AccordionDetails>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <TextField
                            label="Grand Parent Title *"
                            value={gp.title}
                            onChange={(e) => updateGrandParent(gpIndex, 'title', e.target.value)}
                            fullWidth
                            size="small"
                            sx={textFieldStyle}
                          />
                          
                          <Box sx={{ 
                            display: 'flex',
                            flexDirection: { xs: 'column', sm: 'row' },
                            gap: 2
                          }}>
                            {/* Grand Father */}
                            <Autocomplete
                              options={getFilteredStudents('grandFather', gp.grandFather?._id)}
                              loading={loadingStudents}
                              getOptionLabel={(option) => getStudentDisplayName(option)}
                              value={gp.grandFather || null}
                              onChange={(_, value) => updateGrandParent(gpIndex, 'grandFather', value)}
                              renderInput={(params) => (
                                <TextField 
                                  {...params} 
                                  label="Grand Father" 
                                  size="small" 
                                  sx={textFieldStyle}
                                  placeholder="Select male student..."
                                  InputProps={{
                                    ...params.InputProps,
                                    endAdornment: (
                                      <>
                                        {loadingStudents ? <CircularProgress color="inherit" size={20} /> : null}
                                        {params.InputProps.endAdornment}
                                      </>
                                    ),
                                  }}
                                />
                              )}
                              isOptionEqualToValue={(option, value) => option._id === value._id}
                              fullWidth
                            />
                            
                            {/* Grand Mother */}
                            <Autocomplete
                              options={getFilteredStudents('grandMother', gp.grandMother?._id)}
                              loading={loadingStudents}
                              getOptionLabel={(option) => getStudentDisplayName(option)}
                              value={gp.grandMother || null}
                              onChange={(_, value) => updateGrandParent(gpIndex, 'grandMother', value)}
                              renderInput={(params) => (
                                <TextField 
                                  {...params} 
                                  label="Grand Mother" 
                                  size="small" 
                                  sx={textFieldStyle}
                                  placeholder="Select female student..."
                                  InputProps={{
                                    ...params.InputProps,
                                    endAdornment: (
                                      <>
                                        {loadingStudents ? <CircularProgress color="inherit" size={20} /> : null}
                                        {params.InputProps.endAdornment}
                                      </>
                                    ),
                                  }}
                                />
                              )}
                              isOptionEqualToValue={(option, value) => option._id === value._id}
                              fullWidth
                            />
                          </Box>

                          {/* Families under this grand parent */}
                          <Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, mt: 2 }}>
                              <Typography variant="subtitle2" sx={{ color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                                Families
                              </Typography>
                              <Button 
                                startIcon={<Add />} 
                                onClick={() => addFamily(gpIndex)}
                                size="small"
                                sx={{
                                  color: theme === 'dark' ? '#00ffff' : '#007bff'
                                }}
                              >
                                Add Family
                              </Button>

                               {(eligibleFamilies.length > 0 && availableStudents > 0) && (
                                <Button
                                  variant="contained"
                                  startIcon={<People />}
                                  onClick={() => setOpenAutoAssignDialog(true)}
                                  sx={{
                                    background: theme === 'dark'
                                      ? 'linear-gradient(135deg, #ff9900, #cc7a00)'
                                      : 'linear-gradient(135deg, #ff9900, #cc7a00)',
                                    borderRadius: 1,
                                    boxShadow: theme === 'dark'
                                      ? '0 2px 4px rgba(255, 153, 0, 0.2)'
                                      : '0 2px 4px rgba(255, 153, 0, 0.2)',
                                    '&:hover': {
                                      background: theme === 'dark'
                                        ? 'linear-gradient(135deg, #cc7a00, #995c00)'
                                        : 'linear-gradient(135deg, #cc7a00, #995c00)',
                                      boxShadow: theme === 'dark'
                                        ? '0 4px 8px rgba(255, 153, 0, 0.3)'
                                        : '0 4px 8px rgba(255, 153, 0, 0.3)'
                                    }
                                  }}
                                >
                                  Auto-Assign Children
                                </Button>
                              )}
                              
                            </Box>
                            
                            {gp.families.map((family, fIndex) => (
                              <Paper 
                                key={fIndex} 
                                sx={{ 
                                  p: 2, 
                                  mb: 2,
                                  backgroundColor: theme === 'dark' ? '#0f172a' : '#f8f9fa',
                                  border: theme === 'dark' ? '1px solid #334155' : '1px solid #e5e7eb',
                                  borderRadius: 1
                                }}
                              >
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                  <Typography variant="subtitle2" sx={{ color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                                    Family {fIndex + 1}
                                  </Typography>
                                  <IconButton 
                                    size="small" 
                                    onClick={() => removeFamily(gpIndex, fIndex)}
                                    sx={{ color: theme === 'dark' ? '#ff0000' : '#dc3545' }}
                                  >
                                    <Delete fontSize="small" />
                                  </IconButton>
                                </Box>
                                
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                  <Box sx={{ 
                                    display: 'flex',
                                    flexDirection: { xs: 'column', sm: 'row' },
                                    gap: 2
                                  }}>
                                    {/* Father */}
                                    <Autocomplete
                                      options={getFilteredStudents('father', family.father?.student?._id)}
                                      loading={loadingStudents}
                                      getOptionLabel={(option) => getStudentDisplayName(option)}
                                      value={family.father?.student || null}
                                      onChange={(_, value) => {
                                        const newGrandParents = [...formData.grandParents];
                                        newGrandParents[gpIndex].families[fIndex].father.student = value as any;
                                        setFormData(prev => ({ ...prev, grandParents: newGrandParents }));
                                      }}
                                      renderInput={(params) => (
                                        <TextField 
                                          {...params} 
                                          label="Father *" 
                                          size="small" 
                                          sx={textFieldStyle}
                                          placeholder="Select male student..."
                                          InputProps={{
                                            ...params.InputProps,
                                            endAdornment: (
                                              <>
                                                {loadingStudents ? <CircularProgress color="inherit" size={20} /> : null}
                                                {params.InputProps.endAdornment}
                                              </>
                                            ),
                                          }}
                                        />
                                      )}
                                      isOptionEqualToValue={(option, value) => option._id === value._id}
                                      fullWidth
                                    />
                                    
                                    {/* Mother */}
                                    <Autocomplete
                                      options={getFilteredStudents('mother', family.mother?.student?._id)}
                                      loading={loadingStudents}
                                      getOptionLabel={(option) => getStudentDisplayName(option)}
                                      value={family.mother?.student || null}
                                      onChange={(_, value) => {
                                        const newGrandParents = [...formData.grandParents];
                                        newGrandParents[gpIndex].families[fIndex].mother.student = value as any;
                                        setFormData(prev => ({ ...prev, grandParents: newGrandParents }));
                                      }}
                                      renderInput={(params) => (
                                        <TextField 
                                          {...params} 
                                          label="Mother *" 
                                          size="small" 
                                          sx={textFieldStyle}
                                          placeholder="Select female student..."
                                          InputProps={{
                                            ...params.InputProps,
                                            endAdornment: (
                                              <>
                                                {loadingStudents ? <CircularProgress color="inherit" size={20} /> : null}
                                                {params.InputProps.endAdornment}
                                              </>
                                            ),
                                          }}
                                        />
                                      )}
                                      isOptionEqualToValue={(option, value) => option._id === value._id}
                                      fullWidth
                                    />
                                  </Box>

                                  {/* Children */}
                                  <Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                      <Typography variant="subtitle2" sx={{ color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                                        Children
                                      </Typography>
                                      <Button 
                                        startIcon={<Add />} 
                                        onClick={() => addChildToFamily(gpIndex, fIndex)}
                                        size="small"
                                        sx={{
                                          color: theme === 'dark' ? '#00ffff' : '#007bff'
                                        }}
                                      >
                                        Add Child
                                      </Button>
                                     
                                    </Box>
                                  
                                    
                                    {family.children.map((child, cIndex) => (
                                      <Paper 
                                        key={cIndex} 
                                        sx={{ 
                                          p: 1.5, 
                                          mb: 1,
                                          backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff',
                                          border: theme === 'dark' ? '1px solid #334155' : '1px solid #e5e7eb',
                                          borderRadius: 1
                                        }}
                                      >
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                                            {child.relationship === 'son' ? (
                                              <Male sx={{ color: theme === 'dark' ? '#00ffff' : '#007bff' }} />
                                            ) : (
                                              <Female sx={{ color: theme === 'dark' ? '#ff00ff' : '#9c27b0' }} />
                                            )}
                                            <Autocomplete
                                              options={getFilteredStudents('child', child.student?._id)}
                                              loading={loadingStudents}
                                              getOptionLabel={(option) => getStudentDisplayName(option)}
                                              value={child.student || null}
                                              onChange={(_, value) => {
                                                const newGrandParents = [...formData.grandParents];
                                                newGrandParents[gpIndex].families[fIndex].children[cIndex].student = value as any;
                                                setFormData(prev => ({ ...prev, grandParents: newGrandParents }));
                                              }}
                                              renderInput={(params) => (
                                                <TextField 
                                                  {...params} 
                                                  label="Child" 
                                                  size="small" 
                                                  sx={{
                                                    flex: 1,
                                                    '& .MuiOutlinedInput-root': {
                                                      backgroundColor: 'transparent',
                                                      color: theme === 'dark' ? '#ccd6f6' : '#333333',
                                                    }
                                                  }}
                                                  placeholder="Select student..."
                                                  InputProps={{
                                                    ...params.InputProps,
                                                    endAdornment: (
                                                      <>
                                                        {loadingStudents ? <CircularProgress color="inherit" size={20} /> : null}
                                                        {params.InputProps.endAdornment}
                                                      </>
                                                    ),
                                                  }}
                                                />
                                              )}
                                              isOptionEqualToValue={(option, value) => option._id === value._id}
                                              sx={{ flex: 1 }}
                                            />
                                          </Box>
                                          <IconButton 
                                            size="small" 
                                            onClick={() => removeChildFromFamily(gpIndex, fIndex, cIndex)}
                                            sx={{ color: theme === 'dark' ? '#ff0000' : '#dc3545' }}
                                          >
                                            <Delete fontSize="small" />
                                          </IconButton>
                                        </Box>
                                        {child.student && child.student.batch !== formData.batch && !formData.allowOtherBatches && (
                                          <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1 }}>
                                            Child is from batch {child.student.batch}, but family batch is {formData.batch}. 
                                            Enable "Allow other batches" to add this child.
                                          </Typography>
                                        )}
                                      </Paper>
                                    ))}
                                    
                                    {family.children.length === 0 && (
                                      <Typography variant="body2" color={theme === 'dark' ? '#94a3b8' : '#999999'} sx={{ textAlign: 'center', py: 2 }}>
                                        No children added yet
                                      </Typography>
                                    )}
                                  </Box>
                                </Box>
                              </Paper>
                            ))}
                            
                            {gp.families.length === 0 && (
                              <Typography variant="body2" color={theme === 'dark' ? '#94a3b8' : '#999999'} sx={{ textAlign: 'center', py: 3 }}>
                                No families added under this grand parent
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                  
                  {formData.grandParents.length === 0 && (
                    <Typography variant="body2" color={theme === 'dark' ? '#94a3b8' : '#999999'} sx={{ textAlign: 'center', py: 3 }}>
                      No grand parents added yet. Click "Add Grand Parent" to add one.
                    </Typography>
                  )}
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
                onClick={handleSaveFamily}
                variant="contained"
                disabled={!formData.title || !formData.location || !formData.batch || 
                         !formData.familyLeader || !formData.familyCoLeader || !formData.familySecretary ||
                         formData.grandParents.length === 0}
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
                {openEditDialog ? 'Update Family' : 'Create Family'}
              </Button>
            </DialogActions>
          </Dialog>

          {/* View Family Dialog */}
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
                color: theme === 'dark' ? '#ccd6f6' : '#333333',
                maxHeight: '90vh',
                overflow: 'hidden'
              }
            }}
          >
            {selectedFamily && (
              <>
                <DialogTitle sx={{ 
                  background: theme === 'dark'
                    ? 'linear-gradient(135deg, #00ffff, #00b3b3)'
                    : 'linear-gradient(135deg, #007bff, #0056b3)',
                  color: 'white',
                  py: 3
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <FamilyRestroom sx={{ fontSize: 40 }} />
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                        {selectedFamily.title}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                        {selectedFamily.location} • {selectedFamily.batch} • {formatDate(selectedFamily.familyDate)}
                      </Typography>
                    </Box>
                  </Box>
                </DialogTitle>
                
                <Tabs 
                  value={viewFamilyTab} 
                  onChange={(_, newValue) => setViewFamilyTab(newValue)}
                  sx={{ 
                    borderBottom: theme === 'dark' ? '1px solid #334155' : '1px solid #e5e7eb',
                    '& .MuiTab-root': {
                      color: theme === 'dark' ? '#a8b2d1' : '#666666',
                      '&.Mui-selected': {
                        color: theme === 'dark' ? '#00ffff' : '#007bff',
                      }
                    }
                  }}
                >
                  <Tab label="Family Structure" icon={<FamilyIcon />} iconPosition="start" />
                  <Tab label="Family Tree" icon={<AccountTree />} iconPosition="start" />
                </Tabs>
                
                <DialogContent dividers sx={{ overflowY: 'auto', p: 3 }}>
                  {viewFamilyTab === 0 ? (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      {/* Family Leaders */}
                      <Card sx={{ mb: 3, backgroundColor: theme === 'dark' ? '#1e293b' : '#f8f9fa' }}>
                        <CardContent>
                          <Typography variant="h6" sx={{ 
                            mb: 2,
                            color: theme === 'dark' ? '#ccd6f6' : '#333333',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1
                          }}>
                            <SupervisorAccount /> Family Leadership
                          </Typography>
                          
                          <Box sx={{ 
                            display: 'flex',
                            flexDirection: { xs: 'column', sm: 'row' },
                            gap: 2
                          }}>
                            {/* Leader */}
                            <Paper sx={{ 
                              flex: 1, 
                              p: 2,
                              backgroundColor: theme === 'dark' ? '#0f172a' : 'white',
                              border: theme === 'dark' ? '1px solid #00ffff' : '1px solid #007bff'
                            }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <SupervisorAccount sx={{ color: theme === 'dark' ? '#00ffff' : '#007bff' }} />
                                <Typography variant="subtitle2" sx={{ color: theme === 'dark' ? '#00ffff' : '#007bff' }}>
                                  Family Leader
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Avatar
                                  sx={{ width: 40, height: 40 }}
                                  src={selectedFamily.leader?.photo || undefined}
                                >
                                  {selectedFamily.leader?.firstName?.charAt(0) || '?'}
                                </Avatar>
                                <Box>
                                  <Typography variant="body2" sx={{ fontWeight: 'medium', color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                                    {selectedFamily.leader?.firstName || 'N/A'} {selectedFamily.leader?.lastName || ''}
                                  </Typography>
                                  <Typography variant="caption" color={theme === 'dark' ? '#94a3b8' : '#999999'}>
                                    {selectedFamily.leader?.gibyGubayeId || 'N/A'} • {selectedFamily.leader?.batch || 'N/A'}
                                  </Typography>
                                </Box>
                              </Box>
                              <Button
                                size="small"
                                startIcon={<Visibility />}
                                onClick={() => selectedFamily.leader && handleViewStudent(selectedFamily.leader)}
                                sx={{ mt: 1 }}
                                disabled={!selectedFamily.leader}
                              >
                                View Details
                              </Button>
                            </Paper>
                            
                            {/* Co-Leader */}
                            <Paper sx={{ 
                              flex: 1, 
                              p: 2,
                              backgroundColor: theme === 'dark' ? '#0f172a' : 'white',
                              border: theme === 'dark' ? '1px solid #00ff00' : '1px solid #28a745'
                            }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <AdminPanelSettings sx={{ color: theme === 'dark' ? '#00ff00' : '#28a745' }} />
                                <Typography variant="subtitle2" sx={{ color: theme === 'dark' ? '#00ff00' : '#28a745' }}>
                                  Co-Leader
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Avatar
                                  sx={{ width: 40, height: 40 }}
                                  src={selectedFamily.coLeader?.photo || undefined}
                                >
                                  {selectedFamily.coLeader?.firstName?.charAt(0) || '?'}
                                </Avatar>
                                <Box>
                                  <Typography variant="body2" sx={{ fontWeight: 'medium', color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                                    {selectedFamily.coLeader?.firstName || 'N/A'} {selectedFamily.coLeader?.lastName || ''}
                                  </Typography>
                                  <Typography variant="caption" color={theme === 'dark' ? '#94a3b8' : '#999999'}>
                                    {selectedFamily.coLeader?.gibyGubayeId || 'N/A'} • {selectedFamily.coLeader?.batch || 'N/A'}
                                  </Typography>
                                </Box>
                              </Box>
                              <Button
                                size="small"
                                startIcon={<Visibility />}
                                onClick={() => selectedFamily.coLeader && handleViewStudent(selectedFamily.coLeader)}
                                sx={{ mt: 1 }}
                                disabled={!selectedFamily.coLeader}
                              >
                                View Details
                              </Button>
                            </Paper>
                            
                            {/* Secretary */}
                            <Paper sx={{ 
                              flex: 1, 
                              p: 2,
                              backgroundColor: theme === 'dark' ? '#0f172a' : 'white',
                              border: theme === 'dark' ? '1px solid #ff9900' : '1px solid #ff9900'
                            }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <PersonOutline sx={{ color: theme === 'dark' ? '#ff9900' : '#ff9900' }} />
                                <Typography variant="subtitle2" sx={{ color: theme === 'dark' ? '#ff9900' : '#ff9900' }}>
                                  Secretary
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Avatar
                                  sx={{ width: 40, height: 40 }}
                                  src={selectedFamily.secretary?.photo || undefined}
                                >
                                  {selectedFamily.secretary?.firstName?.charAt(0) || '?'}
                                </Avatar>
                                <Box>
                                  <Typography variant="body2" sx={{ fontWeight: 'medium', color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                                    {selectedFamily.secretary?.firstName || 'N/A'} {selectedFamily.secretary?.lastName || ''}
                                  </Typography>
                                  <Typography variant="caption" color={theme === 'dark' ? '#94a3b8' : '#999999'}>
                                    {selectedFamily.secretary?.gibyGubayeId || 'N/A'} • {selectedFamily.secretary?.batch || 'N/A'}
                                  </Typography>
                                </Box>
                              </Box>
                              <Button
                                size="small"
                                startIcon={<Visibility />}
                                onClick={() => selectedFamily.secretary && handleViewStudent(selectedFamily.secretary)}
                                sx={{ mt: 1 }}
                                disabled={!selectedFamily.secretary}
                              >
                                View Details
                              </Button>
                            </Paper>
                          </Box>
                        </CardContent>
                      </Card>

                      {/* Grand Parents and Families */}
                      {selectedFamily.grandParents.map((grandParent, gpIndex) => (
                        <Card key={gpIndex} sx={{ mb: 3, backgroundColor: theme === 'dark' ? '#1e293b' : '#f8f9fa' }}>
                          <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                              <Typography variant="h6" sx={{ 
                                color: theme === 'dark' ? '#ff9900' : '#ff9900',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1
                              }}>
                                <Elderly /> {grandParent.title}
                              </Typography>
                            </Box>
                            
                            {/* Grand Parents */}
                            {(grandParent.grandFather || grandParent.grandMother) && (
                              <Paper sx={{ 
                                p: 2, 
                                mb: 2,
                                backgroundColor: theme === 'dark' ? '#0f172a' : 'white'
                              }}>
                                <Typography variant="subtitle2" sx={{ mb: 1, color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                                  Grand Parents
                                </Typography>
                                <Box sx={{ 
                                  display: 'flex',
                                  flexDirection: { xs: 'column', sm: 'row' },
                                  gap: 2
                                }}>
                                  {grandParent.grandFather && (
                                    <Box sx={{ flex: 1 }}>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                        <Male sx={{ color: theme === 'dark' ? '#00ffff' : '#007bff' }} />
                                        <Typography variant="body2" sx={{ color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                                          Grand Father
                                        </Typography>
                                      </Box>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Avatar
                                          sx={{ width: 40, height: 40 }}
                                          src={grandParent.grandFather.photo || undefined}
                                        >
                                          {grandParent.grandFather.firstName?.charAt(0)}
                                        </Avatar>
                                        <Box>
                                          <Typography variant="body2" sx={{ fontWeight: 'medium', color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                                            {grandParent.grandFather.firstName} {grandParent.grandFather.lastName}
                                          </Typography>
                                          <Typography variant="caption" color={theme === 'dark' ? '#94a3b8' : '#999999'}>
                                            {grandParent.grandFather.gibyGubayeId} • {grandParent.grandFather.batch}
                                          </Typography>
                                        </Box>
                                      </Box>
                                      <Button
                                        size="small"
                                        startIcon={<Visibility />}
                                        onClick={() => handleViewStudent(grandParent.grandFather!)}
                                        sx={{ mt: 1 }}
                                      >
                                        View Details
                                      </Button>
                                    </Box>
                                  )}
                                  
                                  {grandParent.grandMother && (
                                    <Box sx={{ flex: 1 }}>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                        <Female sx={{ color: theme === 'dark' ? '#ff00ff' : '#9c27b0' }} />
                                        <Typography variant="body2" sx={{ color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                                          Grand Mother
                                        </Typography>
                                      </Box>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Avatar
                                          sx={{ width: 40, height: 40 }}
                                          src={grandParent.grandMother.photo || undefined}
                                        >
                                          {grandParent.grandMother.firstName?.charAt(0)}
                                        </Avatar>
                                        <Box>
                                          <Typography variant="body2" sx={{ fontWeight: 'medium', color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                                            {grandParent.grandMother.firstName} {grandParent.grandMother.lastName}
                                          </Typography>
                                          <Typography variant="caption" color={theme === 'dark' ? '#94a3b8' : '#999999'}>
                                            {grandParent.grandMother.gibyGubayeId} • {grandParent.grandMother.batch}
                                          </Typography>
                                        </Box>
                                      </Box>
                                      <Button
                                        size="small"
                                        startIcon={<Visibility />}
                                        onClick={() => handleViewStudent(grandParent.grandMother!)}
                                        sx={{ mt: 1 }}
                                      >
                                        View Details
                                      </Button>
                                    </Box>
                                  )}
                                </Box>
                              </Paper>
                            )}
                            
                            {/* Families */}
                            {grandParent.families.map((family, fIndex) => (
                              <Paper 
                                key={fIndex} 
                                sx={{ 
                                  p: 2, 
                                  mb: 2,
                                  backgroundColor: theme === 'dark' ? '#0f172a' : 'white',
                                  border: theme === 'dark' ? '1px solid #334155' : '1px solid #e5e7eb'
                                }}
                              >
                                <Typography variant="subtitle2" sx={{ mb: 2, color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                                  Family {fIndex + 1}
                                </Typography>
                                
                                {/* Parents */}
                                <Box sx={{ 
                                  display: 'flex',
                                  flexDirection: { xs: 'column', sm: 'row' },
                                  gap: 2,
                                  mb: 2
                                }}>
                                  <Box sx={{ flex: 1 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                      <Male sx={{ color: theme === 'dark' ? '#00ffff' : '#007bff' }} />
                                      <Typography variant="body2" sx={{ color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                                        Father
                                      </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <Avatar
                                        sx={{ width: 40, height: 40 }}
                                        src={family.father.student.photo || undefined}
                                      >
                                        {family.father.student.firstName?.charAt(0)}
                                      </Avatar>
                                      <Box>
                                        <Typography variant="body2" sx={{ fontWeight: 'medium', color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                                          {family.father.student.firstName} {family.father.student.lastName}
                                        </Typography>
                                        <Typography variant="caption" color={theme === 'dark' ? '#94a3b8' : '#999999'}>
                                          {family.father.student.gibyGubayeId} • {family.father.student.batch}
                                        </Typography>
                                      </Box>
                                    </Box>
                                    <Button
                                      size="small"
                                      startIcon={<Visibility />}
                                      onClick={() => handleViewStudent(family.father.student)}
                                      sx={{ mt: 1 }}
                                    >
                                      View Details
                                    </Button>
                                  </Box>
                                  
                                  <Box sx={{ flex: 1 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                      <Female sx={{ color: theme === 'dark' ? '#ff00ff' : '#9c27b0' }} />
                                      <Typography variant="body2" sx={{ color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                                        Mother
                                      </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <Avatar
                                        sx={{ width: 40, height: 40 }}
                                        src={family.mother.student.photo || undefined}
                                      >
                                        {family.mother.student.firstName?.charAt(0)}
                                      </Avatar>
                                      <Box>
                                        <Typography variant="body2" sx={{ fontWeight: 'medium', color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                                          {family.mother.student.firstName} {family.mother.student.lastName}
                                        </Typography>
                                        <Typography variant="caption" color={theme === 'dark' ? '#94a3b8' : '#999999'}>
                                          {family.mother.student.gibyGubayeId} • {family.mother.student.batch}
                                        </Typography>
                                      </Box>
                                    </Box>
                                    <Button
                                      size="small"
                                      startIcon={<Visibility />}
                                      onClick={() => handleViewStudent(family.mother.student)}
                                      sx={{ mt: 1 }}
                                    >
                                      View Details
                                    </Button>
                                  </Box>
                                </Box>
                                
                                {/* Children */}
                                {family.children.length > 0 && (
                                  <Box>
                                    <Typography variant="subtitle2" sx={{ mb: 1, color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                                      Children ({family.children.length})
                                    </Typography>
                                    <Box sx={{ 
                                      display: 'flex',
                                      flexDirection: 'column',
                                      gap: 1
                                    }}>
                                      {family.children.map((child, cIndex) => (
                                        <Paper 
                                          key={cIndex} 
                                          sx={{ 
                                            p: 1.5,
                                            backgroundColor: theme === 'dark' ? '#1e293b' : '#f8f9fa',
                                            border: theme === 'dark' ? '1px solid #334155' : '1px solid #e5e7eb',
                                            borderRadius: 1
                                          }}
                                        >
                                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                              {child.relationship === 'son' ? (
                                                <Male sx={{ color: theme === 'dark' ? '#00ffff' : '#007bff' }} />
                                              ) : (
                                                <Female sx={{ color: theme === 'dark' ? '#ff00ff' : '#9c27b0' }} />
                                              )}
                                              <Avatar
                                                sx={{ width: 32, height: 32 }}
                                                src={child.student.photo || undefined}
                                              >
                                                {child.student.firstName?.charAt(0)}
                                              </Avatar>
                                              <Box>
                                                <Typography variant="body2" sx={{ fontWeight: 'medium', color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                                                  {child.student.firstName} {child.student.lastName}
                                                </Typography>
                                                <Typography variant="caption" color={theme === 'dark' ? '#94a3b8' : '#999999'}>
                                                  {child.student.gibyGubayeId} • {child.student.batch}
                                                  {child.birthOrder && ` • #${child.birthOrder}`}
                                                </Typography>
                                              </Box>
                                            </Box>
                                            <Button
                                              size="small"
                                              startIcon={<Visibility />}
                                              onClick={() => handleViewStudent(child.student)}
                                            >
                                              View
                                            </Button>
                                          </Box>
                                        </Paper>
                                      ))}
                                    </Box>
                                  </Box>
                                )}
                              </Paper>
                            ))}
                          </CardContent>
                        </Card>
                      ))}
                    </motion.div>
                  ) : (
                    // Family Tree Tab
                    <Box>
                      {/* Simple tree view */}
                      <Box sx={{ 
                        p: 3,
                        backgroundColor: theme === 'dark' ? '#1e293b' : '#f8f9fa',
                        border: theme === 'dark' ? '1px solid #334155' : '1px solid #e5e7eb',
                        borderRadius: 2,
                        overflow: 'auto'
                      }}>
                        <Typography variant="h6" sx={{ mb: 3, color: theme === 'dark' ? '#00ffff' : '#007bff', textAlign: 'center' }}>
                          {selectedFamily.title} Family Tree
                        </Typography>
                        
                        {/* Leaders */}
                        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
                          <Box sx={{ 
                            display: 'flex', 
                            flexDirection: 'column',
                            alignItems: 'center',
                            p: 2,
                            backgroundColor: theme === 'dark' ? '#0f172a' : 'white',
                            border: `2px solid ${theme === 'dark' ? '#00ffff' : '#007bff'}`,
                            borderRadius: 2,
                            minWidth: '300px'
                          }}>
                            <Typography variant="h6" sx={{ 
                              color: theme === 'dark' ? '#00ffff' : '#007bff',
                              mb: 2,
                              textAlign: 'center'
                            }}>
                              Family Leadership
                            </Typography>
                            
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 2 }}>
                              <Box sx={{ textAlign: 'center', minWidth: '120px' }}>
                                <Avatar
                                  sx={{ 
                                    width: 60, 
                                    height: 60,
                                    mx: 'auto',
                                    mb: 1,
                                    bgcolor: theme === 'dark' ? '#00ffff20' : '#007bff20',
                                    color: theme === 'dark' ? '#00ffff' : '#007bff'
                                  }}
                                >
                                  {selectedFamily.leader?.firstName?.charAt(0) || <SupervisorAccount />}
                                </Avatar>
                                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                  {selectedFamily.leader?.firstName || 'N/A'}
                                </Typography>
                                <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                                  Leader
                                </Typography>
                              </Box>
                              
                              <Box sx={{ textAlign: 'center', minWidth: '120px' }}>
                                <Avatar
                                  sx={{ 
                                    width: 60, 
                                    height: 60,
                                    mx: 'auto',
                                    mb: 1,
                                    bgcolor: theme === 'dark' ? '#00ff0020' : '#28a74520',
                                    color: theme === 'dark' ? '#00ff00' : '#28a745'
                                  }}
                                >
                                  {selectedFamily.coLeader?.firstName?.charAt(0) || <AdminPanelSettings />}
                                </Avatar>
                                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                  {selectedFamily.coLeader?.firstName || 'N/A'}
                                </Typography>
                                <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                                  Co-Leader
                                </Typography>
                              </Box>
                              
                              <Box sx={{ textAlign: 'center', minWidth: '120px' }}>
                                <Avatar
                                  sx={{ 
                                    width: 60, 
                                    height: 60,
                                    mx: 'auto',
                                    mb: 1,
                                    bgcolor: theme === 'dark' ? '#ff990020' : '#ff990020',
                                    color: theme === 'dark' ? '#ff9900' : '#ff9900'
                                  }}
                                >
                                  {selectedFamily.secretary?.firstName?.charAt(0) || <PersonOutline />}
                                </Avatar>
                                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                  {selectedFamily.secretary?.firstName || 'N/A'}
                                </Typography>
                                <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                                  Secretary
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        </Box>

                        {/* Grand Parents */}
                        {selectedFamily.grandParents.map((grandParent, gpIndex) => (
                          <Box key={gpIndex} sx={{ mb: 4 }}>
                            <Box sx={{ 
                              display: 'flex', 
                              flexDirection: 'column',
                              alignItems: 'center',
                              mb: 3,
                              position: 'relative'
                            }}>
                              {/* Grand Parent Box */}
                              <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center',
                                gap: 2,
                                p: 2,
                                borderRadius: 2,
                                backgroundColor: theme === 'dark' ? '#0f172a' : '#e5e7eb',
                                border: `2px solid ${theme === 'dark' ? '#ff9900' : '#ff9900'}`,
                                minWidth: '300px'
                              }}>
                                <Elderly sx={{ fontSize: 40, color: theme === 'dark' ? '#ff9900' : '#ff9900' }} />
                                <Box>
                                  <Typography variant="subtitle1" sx={{ 
                                    fontWeight: 'bold',
                                    color: theme === 'dark' ? '#ccd6f6' : '#333333'
                                  }}>
                                    {grandParent.title}
                                  </Typography>
                                  <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                                    Grand Parent
                                  </Typography>
                                </Box>
                              </Box>
                              
                              {/* Families Level */}
                              <Box sx={{ 
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: 3,
                                justifyContent: 'center',
                                alignItems: 'flex-start',
                                mt: 3
                              }}>
                                {grandParent.families.map((family, fIndex) => (
                                  <Box key={fIndex} sx={{ 
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    position: 'relative',
                                    minWidth: '280px'
                                  }}>
                                    {/* Family Unit */}
                                    <Box sx={{ 
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: 2,
                                      p: 2,
                                      borderRadius: 2,
                                      backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff',
                                      border: theme === 'dark' ? '1px solid #334155' : '1px solid #e5e7eb',
                                      width: '100%'
                                    }}>
                                      {/* Father */}
                                      <Box sx={{ 
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        flex: 1
                                      }}>
                                        <Male sx={{ fontSize: 30, color: theme === 'dark' ? '#00ffff' : '#007bff' }} />
                                        <Typography variant="body2" sx={{ 
                                          fontWeight: 'medium',
                                          color: theme === 'dark' ? '#ccd6f6' : '#333333',
                                          textAlign: 'center',
                                          mt: 1,
                                          fontSize: '0.75rem'
                                        }}>
                                          {family.father.student.firstName}
                                        </Typography>
                                      </Box>
                                      
                                      {/* Marriage Symbol */}
                                      <Box sx={{ 
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center'
                                      }}>
                                        <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                                          ❤️
                                        </Typography>
                                        <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                                          Family {fIndex + 1}
                                        </Typography>
                                      </Box>
                                      
                                      {/* Mother */}
                                      <Box sx={{ 
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        flex: 1
                                      }}>
                                        <Woman sx={{ fontSize: 30, color: theme === 'dark' ? '#ff00ff' : '#9c27b0' }} />
                                        <Typography variant="body2" sx={{ 
                                          fontWeight: 'medium',
                                          color: theme === 'dark' ? '#ccd6f6' : '#333333',
                                          textAlign: 'center',
                                          mt: 1,
                                          fontSize: '0.75rem'
                                        }}>
                                          {family.mother.student.firstName}
                                        </Typography>
                                      </Box>
                                    </Box>
                                    
                                    {/* Children */}
                                    {family.children.length > 0 && (
                                      <>
                                        {/* Children Container */}
                                        <Box sx={{ 
                                          display: 'flex',
                                          flexWrap: 'wrap',
                                          gap: 1,
                                          justifyContent: 'center',
                                          mt: 2,
                                          maxWidth: '100%'
                                        }}>
                                          {family.children.map((child, cIndex) => (
                                            <Tooltip 
                                              key={cIndex}
                                              title={`${child.student.firstName} ${child.student.lastName} - ${child.student.gibyGubayeId}`}
                                            >
                                              <Box sx={{ 
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                p: 1,
                                                borderRadius: 1,
                                                backgroundColor: theme === 'dark' ? '#1e293b' : '#f8f9fa',
                                                border: theme === 'dark' ? '1px solid #334155' : '1px solid #e5e7eb',
                                                maxWidth: '100px',
                                                cursor: 'pointer',
                                                '&:hover': {
                                                  backgroundColor: theme === 'dark' ? '#334155' : '#e5e7eb'
                                                }
                                              }}
                                              onClick={() => handleViewStudent(child.student)}
                                              >
                                                {child.relationship === 'son' ? (
                                                  <Male sx={{ fontSize: 16, color: theme === 'dark' ? '#00ffff' : '#007bff' }} />
                                                ) : (
                                                  <Female sx={{ fontSize: 16, color: theme === 'dark' ? '#ff00ff' : '#9c27b0' }} />
                                                )}
                                                <Typography variant="caption" sx={{ 
                                                  color: theme === 'dark' ? '#a8b2d1' : '#666666',
                                                  textAlign: 'center',
                                                  overflow: 'hidden',
                                                  textOverflow: 'ellipsis',
                                                  whiteSpace: 'nowrap',
                                                  width: '100%'
                                                }}>
                                                  {child.student.firstName}
                                                </Typography>
                                              </Box>
                                            </Tooltip>
                                          ))}
                                        </Box>
                                      </>
                                    )}
                                  </Box>
                                ))}
                              </Box>
                            </Box>
                            
                            {gpIndex < selectedFamily.grandParents.length - 1 && (
                              <Divider sx={{ my: 3 }} />
                            )}
                          </Box>
                        ))}
                      </Box>
                    </Box>
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
                  <Button 
                    onClick={() => {
                      setOpenViewDialog(false);
                      handleOpenEditDialog(selectedFamily);
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
                    Edit Family
                  </Button>
                </DialogActions>
              </>
            )}
          </Dialog>

          {/* Status Update Dialog */}
          <Dialog
            open={openStatusDialog}
            onClose={() => setOpenStatusDialog(false)}
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
                Update Family Status
              </Typography>
            </DialogTitle>
            <DialogContent sx={{ p: 3 }}>
              {selectedFamily && (
                <Typography variant="body1" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                  Are you sure you want to change the status of <strong style={{color: theme === 'dark' ? '#00ffff' : '#007bff'}}>{selectedFamily.title}</strong> from <strong>{selectedFamily.status}</strong> to <strong>{selectedFamily.status === 'current' ? 'finished' : 'current'}</strong>?
                </Typography>
              )}
            </DialogContent>
            <DialogActions sx={{ 
              p: 3,
              borderTop: theme === 'dark' ? '1px solid #334155' : '1px solid #e5e7eb',
              backgroundColor: theme === 'dark' ? '#0f172a' : 'white'
            }}>
              <Button 
                onClick={() => setOpenStatusDialog(false)}
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
                onClick={handleUpdateStatus}
                variant="contained"
                color={selectedFamily?.status === 'current' ? 'warning' : 'success'}
                sx={{
                  borderRadius: 1,
                  background: selectedFamily?.status === 'current'
                    ? (theme === 'dark'
                        ? 'linear-gradient(135deg, #ff9900, #cc7a00)'
                        : 'linear-gradient(135deg, #ff9900, #cc7a00)')
                    : (theme === 'dark'
                        ? 'linear-gradient(135deg, #00ff00, #00b300)'
                        : 'linear-gradient(135deg, #28a745, #218838)'),
                  '&:hover': {
                    background: selectedFamily?.status === 'current'
                      ? (theme === 'dark'
                          ? 'linear-gradient(135deg, #cc7a00, #995c00)'
                          : 'linear-gradient(135deg, #cc7a00, #995c00)')
                      : (theme === 'dark'
                          ? 'linear-gradient(135deg, #00b300, #008000)'
                          : 'linear-gradient(135deg, #218838, #1e7e34)')
                  }
                }}
              >
                {selectedFamily?.status === 'current' ? 'Close Family' : 'Activate Family'}
              </Button>
            </DialogActions>
          </Dialog>

          {/* Delete Dialog */}
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
                Delete Family
              </Typography>
            </DialogTitle>
            <DialogContent sx={{ p: 3 }}>
              {selectedFamily && (
                <Typography variant="body1" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                  Are you sure you want to delete the family <strong style={{color: theme === 'dark' ? '#ff0000' : '#dc3545'}}>{selectedFamily.title}</strong>? This action cannot be undone and will remove all family structure data.
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
                onClick={handleDeleteFamily}
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
                Delete Family
              </Button>
            </DialogActions>
          </Dialog>

          {/* Student Details Modal */}
          <StudentDetailsModal
            open={studentModalOpen}
            onClose={() => setStudentModalOpen(false)}
            student={selectedStudent}
          />

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

          <AutoAssignChildrenDialog
            open={openAutoAssignDialog}
            onClose={() => setOpenAutoAssignDialog(false)}
            onSuccess={() => {
              fetchFamilies(); // Refresh the family list
              setSuccess('Children assigned successfully!');
            }}
          />

        </Box>
      </div>
    </LocalizationProvider>
    
  );
};

export default ManageFamilyPage;