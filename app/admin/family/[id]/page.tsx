'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box, Typography, Card, CardContent,
  TextField, Chip, Alert, Snackbar,
  CircularProgress, useMediaQuery,
  IconButton, Button,
  Autocomplete, Stack, Tooltip,
  Accordion, AccordionSummary, AccordionDetails,
  Paper, Divider, Tabs, Tab,
  List, ListItem, ListItemText, ListItemIcon,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Badge, Avatar,
  Dialog, DialogTitle, DialogContent,
  DialogActions, FormControl, InputLabel,
  Select, MenuItem, RadioGroup, Radio,
  FormControlLabel, Switch, Fab
} from '@mui/material';
import { motion } from 'framer-motion';
import { useTheme } from '@/lib/theme-context';
import {
  FamilyRestroom, Edit, Delete, Visibility,
  CalendarToday, Person, LocationOn,
  ExpandMore, Add, Home, People,
  Save, Close, ArrowForward,
  Check, Clear, Male, Female,
  ChildCare, Group, Elderly,
  SupervisorAccount, AdminPanelSettings,
  PersonOutline, Edit as EditIcon,
  Delete as DeleteIcon, Add as AddIcon,
  Remove as RemoveIcon, PersonAdd,
  FamilyRestroom as FamilyIcon,
  ArrowBack,
  Woman
} from '@mui/icons-material';
import api from '@/app/utils/api';
import { format, parseISO } from 'date-fns';
import { useAuth } from '@/lib/auth';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface Student {
  _id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  gender: 'male' | 'female';
  gibyGubayeId?: string;
  phone: string;
  email: string;
}

interface FamilyChild {
  student: Student;
  relationship: 'son' | 'daughter';
  birthOrder?: number;
  addedAt: string;
}

interface FamilyMember {
  father: {
    name: string;
    phone?: string;
    email?: string;
    occupation?: string;
  };
  mother: {
    name: string;
    phone?: string;
    email?: string;
    occupation?: string;
  };
  children: FamilyChild[];
  createdAt: string;
}

interface GrandParent {
  title: string;
  fatherName?: string;
  motherName?: string;
  families: FamilyMember[];
}

interface Family {
  _id: string;
  title: string;
  location: string;
  familyDate: string;
  familyLeader: User;
  familyCoLeader: User;
  familySecretary: User;
  grandParents: GrandParent[];
  status: 'current' | 'finished';
  createdBy: User;
  createdAt: string;
  updatedAt: string;
}

const FamilyPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const { theme } = useTheme();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { user } = useAuth();
  
  const [family, setFamily] = useState<Family | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [isManageMode, setIsManageMode] = useState(false);
  
  // Manage mode states
  const [selectedStudents, setSelectedStudents] = useState<Student[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [batchFilter, setBatchFilter] = useState('');
  const [selectedGrandParent, setSelectedGrandParent] = useState<number | null>(null);
  const [selectedFamily, setSelectedFamily] = useState<{gpIndex: number; fIndex: number} | null>(null);
  const [openAddChildrenDialog, setOpenAddChildrenDialog] = useState(false);
  const [openEditFamilyDialog, setOpenEditFamilyDialog] = useState(false);
  const [openRemoveChildDialog, setOpenRemoveChildDialog] = useState(false);
  
  // Edit form states
  const [editForm, setEditForm] = useState<FamilyMember | null>(null);

  const themeStyles = {
    background: theme === 'dark' 
      ? 'linear-gradient(135deg, #0a192f, #112240)' 
      : 'linear-gradient(135deg, #f0f0f0, #ffffff)',
    textColor: theme === 'dark' ? '#ccd6f6' : '#333333',
    primaryColor: theme === 'dark' ? '#00ffff' : '#007bff',
    cardBg: theme === 'dark' ? '#0f172a80' : '#ffffff',
    cardBorder: theme === 'dark' ? '#334155' : '#e5e7eb',
  };

  // Helper functions
  const getUserName = (user: User | undefined) => {
    if (!user) return 'N/A';
    return user.name || 'N/A';
  };

  const getStudentFullName = (student: Student) => {
    return `${student.firstName} ${student.middleName || ''} ${student.lastName}`.trim();
  };

  const getStudentDisplayName = (student: Student) => {
    const fullName = getStudentFullName(student);
    const gibyId = student.gibyGubayeId ? ` (${student.gibyGubayeId})` : '';
    return `${fullName}${gibyId}`;
  };

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy');
    } catch {
      return 'Invalid date';
    }
  };

  // Fetch family data
  const fetchFamily = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/families/${id}`);
      setFamily(response.data.data);
      setError('');
    } catch (error: any) {
      console.error('Error fetching family:', error);
      setError(error.response?.data?.message || 'Failed to fetch family');
      setFamily(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Fetch students for selection
  const fetchStudents = useCallback(async () => {
    try {
      const response = await api.get('/families/filter-options');
      setStudents(response.data.data.allStudents || []);
    } catch (error: any) {
      console.error('Error fetching students:', error);
    }
  }, []);

  // Initialize data
  useEffect(() => {
    if (id) {
      fetchFamily();
      fetchStudents();
    }
  }, [id, fetchFamily, fetchStudents]);

  // Filter students by batch
  const filteredStudents = students.filter(student => {
    if (!batchFilter) return true;
    return student.gibyGubayeId?.includes(batchFilter) || 
           student.email.includes(batchFilter);
  });

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Calculate total members
  const calculateTotalMembers = () => {
    if (!family) return 0;
    let total = 0;
    family.grandParents.forEach(gp => {
      gp.families.forEach(family => {
        total += 2; // Father and mother
        total += family.children.length;
      });
    });
    return total;
  };

  // Calculate total children
  const calculateTotalChildren = () => {
    if (!family) return 0;
    let total = 0;
    family.grandParents.forEach(gp => {
      gp.families.forEach(family => {
        total += family.children.length;
      });
    });
    return total;
  };

  // Handle manage mode actions
  const handleEnterManageMode = () => {
    setIsManageMode(true);
    setSelectedStudents([]);
  };

  const handleExitManageMode = () => {
    setIsManageMode(false);
    setSelectedStudents([]);
    setSelectedGrandParent(null);
    setSelectedFamily(null);
  };

  const handleSelectGrandParent = (index: number) => {
    setSelectedGrandParent(index);
    setSelectedFamily(null);
  };

  const handleSelectFamily = (gpIndex: number, fIndex: number) => {
    setSelectedFamily({ gpIndex, fIndex });
  };

  const handleOpenAddChildrenDialog = (gpIndex: number, fIndex: number) => {
    setSelectedGrandParent(gpIndex);
    setSelectedFamily({ gpIndex, fIndex });
    setOpenAddChildrenDialog(true);
  };

  const handleOpenEditFamilyDialog = (gpIndex: number, fIndex: number) => {
    if (!family) return;
    setSelectedGrandParent(gpIndex);
    setSelectedFamily({ gpIndex, fIndex });
    setEditForm(family.grandParents[gpIndex].families[fIndex]);
    setOpenEditFamilyDialog(true);
  };

  const handleOpenRemoveChildDialog = (gpIndex: number, fIndex: number, childIndex: number) => {
    setSelectedGrandParent(gpIndex);
    setSelectedFamily({ gpIndex, fIndex });
    setOpenRemoveChildDialog(true);
  };

  // Handle adding children
  const handleAddChildren = async () => {
    if (!family || !selectedFamily) return;

    try {
      const payload = {
        grandParentIndex: selectedFamily.gpIndex,
        familyIndex: selectedFamily.fIndex,
        children: selectedStudents.map(student => ({
          student: student._id,
          relationship: 'son', // Default, can be enhanced with relationship selection
          birthOrder: selectedStudents.indexOf(student) + 1
        }))
      };

      await api.post(`/families/${family._id}/children`, payload);
      
      setSuccess('Children added successfully');
      setOpenAddChildrenDialog(false);
      setSelectedStudents([]);
      fetchFamily();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to add children');
    }
  };

  // Handle removing child
  const handleRemoveChild = async (childId: string) => {
    if (!family || !selectedFamily) return;

    try {
      const payload = {
        grandParentIndex: selectedFamily.gpIndex,
        familyIndex: selectedFamily.fIndex,
        childId
      };

      await api.delete(`/families/${family._id}/children`, { data: payload });
      
      setSuccess('Child removed successfully');
      setOpenRemoveChildDialog(false);
      fetchFamily();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to remove child');
    }
  };

  // Handle update family member
  const handleUpdateFamilyMember = async () => {
    if (!family || !selectedFamily || !editForm) return;

    try {
      const updatedGrandParents = [...family.grandParents];
      updatedGrandParents[selectedFamily.gpIndex].families[selectedFamily.fIndex] = editForm;

      const payload = {
        grandParents: updatedGrandParents
      };

      await api.put(`/families/${family._id}`, payload);
      
      setSuccess('Family updated successfully');
      setOpenEditFamilyDialog(false);
      setEditForm(null);
      fetchFamily();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to update family');
    }
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        minHeight: '400px' 
      }}>
        <CircularProgress size={60} sx={{ color: theme === 'dark' ? '#00ffff' : '#007bff' }} />
      </Box>
    );
  }

  if (!family) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <FamilyRestroom sx={{ fontSize: 64, color: theme === 'dark' ? '#334155' : '#cbd5e1', mb: 2 }} />
        <Typography variant="h6" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
          Family not found
        </Typography>
        <Button 
          onClick={() => router.back()}
          sx={{ mt: 2 }}
        >
          Go Back
        </Button>
      </Box>
    );
  }

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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box>
                <Button
                  startIcon={<ArrowBack />}
                  onClick={() => router.back()}
                  sx={{
                    color: theme === 'dark' ? '#00ffff' : '#007bff',
                    mb: 2
                  }}
                >
                  Back to Families
                </Button>
                <Typography variant={isMobile ? "h5" : "h4"} sx={{ 
                  fontWeight: 'bold', 
                  color: theme === 'dark' ? '#ccd6f6' : '#333333',
                  mb: 0.5
                }}>
                  {family.title}
                </Typography>
                <Typography variant={isMobile ? "body2" : "body1"} color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                  {family.location} • {formatDate(family.familyDate)}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                {!isManageMode ? (
                  <Button
                    variant="contained"
                    startIcon={<EditIcon />}
                    onClick={handleEnterManageMode}
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
                    Manage Family
                  </Button>
                ) : (
                  <Button
                    variant="outlined"
                    startIcon={<Close />}
                    onClick={handleExitManageMode}
                    sx={{
                      borderColor: theme === 'dark' ? '#ff0000' : '#dc3545',
                      color: theme === 'dark' ? '#ff0000' : '#dc3545',
                      '&:hover': {
                        borderColor: theme === 'dark' ? '#cc0000' : '#bd2130',
                        backgroundColor: theme === 'dark' ? '#ff000020' : '#dc354510'
                      }
                    }}
                  >
                    Exit Manage Mode
                  </Button>
                )}
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Chip 
                label={`Status: ${family.status}`} 
                sx={{ 
                  backgroundColor: family.status === 'current' 
                    ? (theme === 'dark' ? '#00ff0020' : '#28a74520')
                    : (theme === 'dark' ? '#ff990020' : '#ff990020'),
                  color: family.status === 'current' 
                    ? (theme === 'dark' ? '#00ff00' : '#28a745')
                    : (theme === 'dark' ? '#ff9900' : '#ff9900'),
                  fontWeight: 'medium'
                }}
              />
              <Chip 
                label={`Total Members: ${calculateTotalMembers()}`} 
                sx={{ 
                  backgroundColor: theme === 'dark' ? '#00ffff20' : '#007bff20',
                  color: theme === 'dark' ? '#00ffff' : '#007bff'
                }}
                icon={<People />}
              />
              <Chip 
                label={`Children: ${calculateTotalChildren()}`} 
                sx={{ 
                  backgroundColor: theme === 'dark' ? '#00ff0020' : '#28a74520',
                  color: theme === 'dark' ? '#00ff00' : '#28a745'
                }}
                icon={<ChildCare />}
              />
              <Chip 
                label={`Created: ${formatDate(family.createdAt)}`} 
                sx={{ 
                  backgroundColor: theme === 'dark' ? '#334155' : '#e5e7eb',
                  color: theme === 'dark' ? '#a8b2d1' : '#666666'
                }}
                icon={<CalendarToday />}
              />
            </Box>
          </Box>
        </motion.div>

        {/* Family Leaders Card */}
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
                flexDirection: { xs: 'column', md: 'row' },
                gap: 3
              }}>
                {/* Leader */}
                <Box sx={{ 
                  flex: 1,
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: theme === 'dark' ? '#1e293b' : '#f8f9fa',
                  border: theme === 'dark' ? '1px solid #00ffff' : '1px solid #007bff'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <SupervisorAccount sx={{ color: theme === 'dark' ? '#00ffff' : '#007bff' }} />
                    <Typography variant="subtitle2" sx={{ color: theme === 'dark' ? '#00ffff' : '#007bff' }}>
                      Family Leader
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ 
                    fontWeight: 'bold',
                    color: theme === 'dark' ? '#ccd6f6' : '#333333'
                  }}>
                    {getUserName(family.familyLeader)}
                  </Typography>
                  <Typography variant="caption" color={theme === 'dark' ? '#94a3b8' : '#999999'}>
                    {family.familyLeader.email}
                  </Typography>
                </Box>
                
                {/* Co-Leader */}
                <Box sx={{ 
                  flex: 1,
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: theme === 'dark' ? '#1e293b' : '#f8f9fa',
                  border: theme === 'dark' ? '1px solid #00ff00' : '1px solid #28a745'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <AdminPanelSettings sx={{ color: theme === 'dark' ? '#00ff00' : '#28a745' }} />
                    <Typography variant="subtitle2" sx={{ color: theme === 'dark' ? '#00ff00' : '#28a745' }}>
                      Co-Leader
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ 
                    fontWeight: 'bold',
                    color: theme === 'dark' ? '#ccd6f6' : '#333333'
                  }}>
                    {getUserName(family.familyCoLeader)}
                  </Typography>
                  <Typography variant="caption" color={theme === 'dark' ? '#94a3b8' : '#999999'}>
                    {family.familyCoLeader.email}
                  </Typography>
                </Box>
                
                {/* Secretary */}
                <Box sx={{ 
                  flex: 1,
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: theme === 'dark' ? '#1e293b' : '#f8f9fa',
                  border: theme === 'dark' ? '1px solid #ff9900' : '1px solid #ff9900'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <PersonOutline sx={{ color: theme === 'dark' ? '#ff9900' : '#ff9900' }} />
                    <Typography variant="subtitle2" sx={{ color: theme === 'dark' ? '#ff9900' : '#ff9900' }}>
                      Secretary
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ 
                    fontWeight: 'bold',
                    color: theme === 'dark' ? '#ccd6f6' : '#333333'
                  }}>
                    {getUserName(family.familySecretary)}
                  </Typography>
                  <Typography variant="caption" color={theme === 'dark' ? '#94a3b8' : '#999999'}>
                    {family.familySecretary.email}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
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
            {/* Tabs */}
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange} 
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
              <Tab label="Family Tree" icon={<People />} iconPosition="start" />
              <Tab label="Member Details" icon={<Person />} iconPosition="start" />
            </Tabs>

            {/* Tab Content */}
            <Box sx={{ p: 3 }}>
              {activeTab === 0 && (
                <Box>
                  {isManageMode && (
                    <Box sx={{ 
                      mb: 4,
                      p: 2,
                      borderRadius: 2,
                      backgroundColor: theme === 'dark' ? '#1e293b' : '#f0f8ff',
                      border: theme === 'dark' ? '2px solid #00ffff' : '2px solid #007bff'
                    }}>
                      <Typography variant="subtitle1" sx={{ 
                        mb: 2,
                        color: theme === 'dark' ? '#00ffff' : '#007bff',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}>
                        🛠️ Manage Mode Active
                      </Typography>
                      <Typography variant="body2" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                        Click on a family to select it, then use the action buttons to manage members.
                      </Typography>
                      
                      {/* Batch Filter for Students */}
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                          Filter Students by Batch/ID:
                        </Typography>
                        <TextField
                          fullWidth
                          size="small"
                          value={batchFilter}
                          onChange={(e) => setBatchFilter(e.target.value)}
                          placeholder="Enter batch number or student ID..."
                          sx={{
                            mt: 1,
                            '& .MuiOutlinedInput-root': {
                              backgroundColor: theme === 'dark' ? '#1e293b' : 'white',
                              color: theme === 'dark' ? '#ccd6f6' : '#333333',
                              '& fieldset': {
                                borderColor: theme === 'dark' ? '#334155' : '#e5e7eb',
                              }
                            }
                          }}
                        />
                      </Box>
                    </Box>
                  )}

                  {family.grandParents.map((grandParent, gpIndex) => (
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
                          <Elderly sx={{ 
                            color: selectedGrandParent === gpIndex && isManageMode 
                              ? '#ff0000' 
                              : theme === 'dark' ? '#ff9900' : '#ff9900'
                          }} />
                          <Box sx={{ flex: 1 }}>
                            <Typography sx={{ fontWeight: 'medium', color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                              {grandParent.title}
                            </Typography>
                            {grandParent.fatherName || grandParent.motherName ? (
                              <Typography variant="caption" color={theme === 'dark' ? '#94a3b8' : '#999999'}>
                                {grandParent.fatherName || ''} & {grandParent.motherName || ''}
                              </Typography>
                            ) : null}
                          </Box>
                          {isManageMode && (
                            <Button
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectGrandParent(gpIndex);
                              }}
                              variant={selectedGrandParent === gpIndex ? "contained" : "outlined"}
                              sx={{
                                minWidth: 'auto',
                                px: 1,
                                py: 0.5,
                                borderRadius: 1
                              }}
                            >
                              {selectedGrandParent === gpIndex ? 'Selected' : 'Select'}
                            </Button>
                          )}
                        </Box>
                      </AccordionSummary>
                      
                      <AccordionDetails>
                        {grandParent.families.length > 0 ? (
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {grandParent.families.map((familyMember, fIndex) => (
                              <Card 
                                key={fIndex}
                                sx={{ 
                                  backgroundColor: theme === 'dark' ? '#0f172a' : '#f8f9fa',
                                  border: theme === 'dark' ? '1px solid #334155' : '1px solid #e5e7eb',
                                  ...(selectedFamily?.gpIndex === gpIndex && selectedFamily?.fIndex === fIndex && isManageMode && {
                                    border: '2px solid #00ff00',
                                    boxShadow: '0 0 10px rgba(0, 255, 0, 0.2)'
                                  })
                                }}
                              >
                                <CardContent>
                                  <Box sx={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    alignItems: 'flex-start',
                                    mb: 2
                                  }}>
                                    <Typography variant="subtitle2" sx={{ color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                                      Family {fIndex + 1}
                                    </Typography>
                                    
                                    {isManageMode && (
                                      <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Tooltip title="Select this family">
                                          <IconButton
                                            size="small"
                                            onClick={() => handleSelectFamily(gpIndex, fIndex)}
                                            sx={{ 
                                              color: selectedFamily?.gpIndex === gpIndex && selectedFamily?.fIndex === fIndex
                                                ? '#00ff00'
                                                : theme === 'dark' ? '#00ffff' : '#007bff'
                                            }}
                                          >
                                            <Check />
                                          </IconButton>
                                        </Tooltip>
                                        
                                        <Tooltip title="Edit Family">
                                          <IconButton
                                            size="small"
                                            onClick={() => handleOpenEditFamilyDialog(gpIndex, fIndex)}
                                            sx={{ color: theme === 'dark' ? '#00ff00' : '#28a745' }}
                                          >
                                            <Edit fontSize="small" />
                                          </IconButton>
                                        </Tooltip>
                                        
                                        <Tooltip title="Add Children">
                                          <IconButton
                                            size="small"
                                            onClick={() => handleOpenAddChildrenDialog(gpIndex, fIndex)}
                                            sx={{ color: theme === 'dark' ? '#00ffff' : '#007bff' }}
                                          >
                                            <PersonAdd fontSize="small" />
                                          </IconButton>
                                        </Tooltip>
                                      </Box>
                                    )}
                                  </Box>
                                  
                                  {/* Family Members */}
                                  <Box sx={{ 
                                    display: 'flex',
                                    flexDirection: { xs: 'column', md: 'row' },
                                    gap: 3,
                                    mb: 2
                                  }}>
                                    {/* Father */}
                                    <Box sx={{ flex: 1 }}>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                        <Male sx={{ color: theme === 'dark' ? '#00ffff' : '#007bff' }} />
                                        <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                                          Father
                                        </Typography>
                                      </Box>
                                      <Typography variant="body2" sx={{ 
                                        fontWeight: 'medium',
                                        color: theme === 'dark' ? '#ccd6f6' : '#333333'
                                      }}>
                                        {familyMember.father.name}
                                      </Typography>
                                      {familyMember.father.phone && (
                                        <Typography variant="caption" color={theme === 'dark' ? '#94a3b8' : '#999999'} sx={{ display: 'block' }}>
                                          📞 {familyMember.father.phone}
                                        </Typography>
                                      )}
                                      {familyMember.father.email && (
                                        <Typography variant="caption" color={theme === 'dark' ? '#94a3b8' : '#999999'} sx={{ display: 'block' }}>
                                          ✉️ {familyMember.father.email}
                                        </Typography>
                                      )}
                                      {familyMember.father.occupation && (
                                        <Typography variant="caption" color={theme === 'dark' ? '#94a3b8' : '#999999'} sx={{ display: 'block' }}>
                                          💼 {familyMember.father.occupation}
                                        </Typography>
                                      )}
                                    </Box>
                                    
                                    {/* Mother */}
                                    <Box sx={{ flex: 1 }}>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                        <Female sx={{ color: theme === 'dark' ? '#ff00ff' : '#9c27b0' }} />
                                        <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                                          Mother
                                        </Typography>
                                      </Box>
                                      <Typography variant="body2" sx={{ 
                                        fontWeight: 'medium',
                                        color: theme === 'dark' ? '#ccd6f6' : '#333333'
                                      }}>
                                        {familyMember.mother.name}
                                      </Typography>
                                      {familyMember.mother.phone && (
                                        <Typography variant="caption" color={theme === 'dark' ? '#94a3b8' : '#999999'} sx={{ display: 'block' }}>
                                          📞 {familyMember.mother.phone}
                                        </Typography>
                                      )}
                                      {familyMember.mother.email && (
                                        <Typography variant="caption" color={theme === 'dark' ? '#94a3b8' : '#999999'} sx={{ display: 'block' }}>
                                          ✉️ {familyMember.mother.email}
                                        </Typography>
                                      )}
                                      {familyMember.mother.occupation && (
                                        <Typography variant="caption" color={theme === 'dark' ? '#94a3b8' : '#999999'} sx={{ display: 'block' }}>
                                          💼 {familyMember.mother.occupation}
                                        </Typography>
                                      )}
                                    </Box>
                                  </Box>
                                  
                                  {/* Children */}
                                  {familyMember.children.length > 0 && (
                                    <Box sx={{ mt: 2 }}>
                                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                        <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                                          Children ({familyMember.children.length})
                                        </Typography>
                                        {isManageMode && selectedFamily?.gpIndex === gpIndex && selectedFamily?.fIndex === fIndex && (
                                          <Typography variant="caption" color={theme === 'dark' ? '#00ff00' : '#28a745'}>
                                            Selected for management
                                          </Typography>
                                        )}
                                      </Box>
                                      
                                      <List dense sx={{ 
                                        maxHeight: '200px',
                                        overflow: 'auto'
                                      }}>
                                        {familyMember.children.map((child, cIndex) => (
                                          <ListItem 
                                            key={cIndex}
                                            sx={{ 
                                              py: 0.5,
                                              borderBottom: theme === 'dark' ? '1px solid #334155' : '1px solid #e5e7eb',
                                              '&:hover': {
                                                backgroundColor: theme === 'dark' ? '#1e293b' : '#f5f5f5'
                                              }
                                            }}
                                          >
                                            <ListItemIcon>
                                              {child.relationship === 'son' ? (
                                                <Male fontSize="small" sx={{ color: theme === 'dark' ? '#00ffff' : '#007bff' }} />
                                              ) : (
                                                <Female fontSize="small" sx={{ color: theme === 'dark' ? '#ff00ff' : '#9c27b0' }} />
                                              )}
                                            </ListItemIcon>
                                            <ListItemText
                                              primary={
                                                <Typography variant="body2" sx={{ color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                                                  {getStudentFullName(child.student)}
                                                  {child.birthOrder && (
                                                    <Typography component="span" variant="caption" color={theme === 'dark' ? '#94a3b8' : '#999999'} sx={{ ml: 1 }}>
                                                      #{child.birthOrder}
                                                    </Typography>
                                                  )}
                                                </Typography>
                                              }
                                              secondary={
                                                <Typography variant="caption" color={theme === 'dark' ? '#94a3b8' : '#999999'}>
                                                  {child.student.gibyGubayeId} • {child.student.gender} • {child.student.email}
                                                </Typography>
                                              }
                                            />
                                            {isManageMode && selectedFamily?.gpIndex === gpIndex && selectedFamily?.fIndex === fIndex && (
                                              <IconButton
                                                size="small"
                                                onClick={() => handleOpenRemoveChildDialog(gpIndex, fIndex, cIndex)}
                                                sx={{ color: theme === 'dark' ? '#ff0000' : '#dc3545' }}
                                              >
                                                <DeleteIcon fontSize="small" />
                                              </IconButton>
                                            )}
                                          </ListItem>
                                        ))}
                                      </List>
                                    </Box>
                                  )}
                                  
                                  {/* Empty Children State */}
                                  {familyMember.children.length === 0 && (
                                    <Box sx={{ 
                                      textAlign: 'center', 
                                      py: 2,
                                      backgroundColor: theme === 'dark' ? '#1e293b' : '#f8f9fa',
                                      borderRadius: 1,
                                      mt: 2
                                    }}>
                                      <Typography variant="caption" color={theme === 'dark' ? '#94a3b8' : '#999999'}>
                                        No children added yet
                                      </Typography>
                                      {isManageMode && selectedFamily?.gpIndex === gpIndex && selectedFamily?.fIndex === fIndex && (
                                        <Button
                                          size="small"
                                          startIcon={<AddIcon />}
                                          onClick={() => handleOpenAddChildrenDialog(gpIndex, fIndex)}
                                          sx={{ mt: 1 }}
                                        >
                                          Add Children
                                        </Button>
                                      )}
                                    </Box>
                                  )}
                                </CardContent>
                              </Card>
                            ))}
                          </Box>
                        ) : (
                          <Typography variant="body2" color={theme === 'dark' ? '#a8b2d1' : '#666666'} sx={{ textAlign: 'center', py: 3 }}>
                            No families added under this grand parent.
                          </Typography>
                        )}
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </Box>
              )}

              {activeTab === 1 && (
                <Box>
                  <Typography variant="h6" sx={{ 
                    mb: 3,
                    color: theme === 'dark' ? '#ccd6f6' : '#333333'
                  }}>
                    Family Tree Visualization
                  </Typography>
                  
                  <Card sx={{ 
                    p: 3,
                    backgroundColor: theme === 'dark' ? '#1e293b' : '#f8f9fa',
                    border: theme === 'dark' ? '1px solid #334155' : '1px solid #e5e7eb',
                    overflow: 'auto'
                  }}>
                    {family.grandParents.map((grandParent, gpIndex) => (
                      <Box key={gpIndex} sx={{ mb: 4 }}>
                        {/* Grand Parent Level */}
                        <Box sx={{ 
                          display: 'flex', 
                          flexDirection: 'column',
                          alignItems: 'center',
                          mb: 3,
                          position: 'relative'
                        }}>
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            gap: 2,
                            p: 2,
                            borderRadius: 2,
                            backgroundColor: theme === 'dark' ? '#0f172a' : '#e5e7eb',
                            border: theme === 'dark' ? '2px solid #ff9900' : '2px solid #ff9900',
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
                          
                          {/* Connecting Line */}
                          {grandParent.families.length > 0 && (
                            <Box sx={{ 
                              height: '20px',
                              width: '2px',
                              backgroundColor: theme === 'dark' ? '#334155' : '#e5e7eb',
                              my: 1
                            }} />
                          )}
                          
                          {/* Children (Families) Level */}
                          <Box sx={{ 
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 3,
                            justifyContent: 'center',
                            alignItems: 'flex-start'
                          }}>
                            {grandParent.families.map((familyMember, fIndex) => (
                              <Box key={fIndex} sx={{ 
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                position: 'relative',
                                minWidth: '280px'
                              }}>
                                {/* Connecting Line */}
                                <Box sx={{ 
                                  height: '20px',
                                  width: '2px',
                                  backgroundColor: theme === 'dark' ? '#334155' : '#e5e7eb',
                                  mb: 1
                                }} />
                                
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
                                      {familyMember.father.name}
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
                                      {familyMember.mother.name}
                                    </Typography>
                                  </Box>
                                </Box>
                                
                                {/* Children */}
                                {familyMember.children.length > 0 && (
                                  <>
                                    {/* Connecting Line */}
                                    <Box sx={{ 
                                      height: '20px',
                                      width: '2px',
                                      backgroundColor: theme === 'dark' ? '#334155' : '#e5e7eb',
                                      mt: 2
                                    }} />
                                    
                                    {/* Children Container */}
                                    <Box sx={{ 
                                      display: 'flex',
                                      flexWrap: 'wrap',
                                      gap: 1,
                                      justifyContent: 'center',
                                      mt: 2,
                                      maxWidth: '100%'
                                    }}>
                                      {familyMember.children.map((child, cIndex) => (
                                        <Tooltip 
                                          key={cIndex}
                                          title={`${getStudentFullName(child.student)} - ${child.student.gibyGubayeId}`}
                                        >
                                          <Box sx={{ 
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            p: 1,
                                            borderRadius: 1,
                                            backgroundColor: theme === 'dark' ? '#1e293b' : '#f8f9fa',
                                            border: theme === 'dark' ? '1px solid #334155' : '1px solid #e5e7eb',
                                            maxWidth: '100px'
                                          }}>
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
                        
                        {gpIndex < family.grandParents.length - 1 && (
                          <Divider sx={{ my: 3 }} />
                        )}
                      </Box>
                    ))}
                  </Card>
                </Box>
              )}

              {activeTab === 2 && (
                <Box>
                  <Typography variant="h6" sx={{ 
                    mb: 3,
                    color: theme === 'dark' ? '#ccd6f6' : '#333333'
                  }}>
                    Detailed Member Information
                  </Typography>
                  
                  <TableContainer component={Paper} sx={{ 
                    backgroundColor: theme === 'dark' ? '#1e293b' : 'white',
                    border: theme === 'dark' ? '1px solid #334155' : '1px solid #e5e7eb'
                  }}>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ 
                          backgroundColor: theme === 'dark' ? '#0f172a' : '#e5e7eb'
                        }}>
                          <TableCell sx={{ 
                            color: theme === 'dark' ? '#ccd6f6' : '#333333',
                            fontWeight: 'bold'
                          }}>Role</TableCell>
                          <TableCell sx={{ 
                            color: theme === 'dark' ? '#ccd6f6' : '#333333',
                            fontWeight: 'bold'
                          }}>Name</TableCell>
                          <TableCell sx={{ 
                            color: theme === 'dark' ? '#ccd6f6' : '#333333',
                            fontWeight: 'bold'
                          }}>Contact</TableCell>
                          <TableCell sx={{ 
                            color: theme === 'dark' ? '#ccd6f6' : '#333333',
                            fontWeight: 'bold'
                          }}>Details</TableCell>
                          <TableCell sx={{ 
                            color: theme === 'dark' ? '#ccd6f6' : '#333333',
                            fontWeight: 'bold'
                          }}>Family</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {/* Family Leaders */}
                        <TableRow sx={{ 
                          backgroundColor: theme === 'dark' ? '#1e293b' : '#f8f9fa'
                        }}>
                          <TableCell sx={{ color: theme === 'dark' ? '#00ffff' : '#007bff' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <SupervisorAccount fontSize="small" />
                              <Typography variant="body2">Family Leader</Typography>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                            {getUserName(family.familyLeader)}
                          </TableCell>
                          <TableCell sx={{ color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                            {family.familyLeader.email}
                          </TableCell>
                          <TableCell sx={{ color: theme === 'dark' ? '#94a3b8' : '#999999' }}>
                            Role: {family.familyLeader.role}
                          </TableCell>
                          <TableCell sx={{ color: theme === 'dark' ? '#94a3b8' : '#999999' }}>
                            Leadership
                          </TableCell>
                        </TableRow>
                        
                        <TableRow sx={{ 
                          backgroundColor: theme === 'dark' ? '#1e293b' : '#f8f9fa'
                        }}>
                          <TableCell sx={{ color: theme === 'dark' ? '#00ff00' : '#28a745' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <AdminPanelSettings fontSize="small" />
                              <Typography variant="body2">Co-Leader</Typography>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                            {getUserName(family.familyCoLeader)}
                          </TableCell>
                          <TableCell sx={{ color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                            {family.familyCoLeader.email}
                          </TableCell>
                          <TableCell sx={{ color: theme === 'dark' ? '#94a3b8' : '#999999' }}>
                            Role: {family.familyCoLeader.role}
                          </TableCell>
                          <TableCell sx={{ color: theme === 'dark' ? '#94a3b8' : '#999999' }}>
                            Leadership
                          </TableCell>
                        </TableRow>
                        
                        <TableRow sx={{ 
                          backgroundColor: theme === 'dark' ? '#1e293b' : '#f8f9fa'
                        }}>
                          <TableCell sx={{ color: theme === 'dark' ? '#ff9900' : '#ff9900' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <PersonOutline fontSize="small" />
                              <Typography variant="body2">Secretary</Typography>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                            {getUserName(family.familySecretary)}
                          </TableCell>
                          <TableCell sx={{ color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                            {family.familySecretary.email}
                          </TableCell>
                          <TableCell sx={{ color: theme === 'dark' ? '#94a3b8' : '#999999' }}>
                            Role: {family.familySecretary.role}
                          </TableCell>
                          <TableCell sx={{ color: theme === 'dark' ? '#94a3b8' : '#999999' }}>
                            Leadership
                          </TableCell>
                        </TableRow>
                        
                        {/* Family Members */}
                        {family.grandParents.map((grandParent, gpIndex) => (
                          <React.Fragment key={gpIndex}>
                            {grandParent.families.map((familyMember, fIndex) => (
                              <React.Fragment key={fIndex}>
                                {/* Father */}
                                <TableRow>
                                  <TableCell sx={{ color: theme === 'dark' ? '#00ffff' : '#007bff' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <Male fontSize="small" />
                                      <Typography variant="body2">Father</Typography>
                                    </Box>
                                  </TableCell>
                                  <TableCell sx={{ color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                                    {familyMember.father.name}
                                  </TableCell>
                                  <TableCell sx={{ color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                                    {familyMember.father.phone || 'N/A'}
                                    {familyMember.father.email && (
                                      <Typography variant="caption" sx={{ display: 'block', color: theme === 'dark' ? '#94a3b8' : '#999999' }}>
                                        {familyMember.father.email}
                                      </Typography>
                                    )}
                                  </TableCell>
                                  <TableCell sx={{ color: theme === 'dark' ? '#94a3b8' : '#999999' }}>
                                    {familyMember.father.occupation || 'N/A'}
                                  </TableCell>
                                  <TableCell sx={{ color: theme === 'dark' ? '#94a3b8' : '#999999' }}>
                                    {grandParent.title} - Family {fIndex + 1}
                                  </TableCell>
                                </TableRow>
                                
                                {/* Mother */}
                                <TableRow>
                                  <TableCell sx={{ color: theme === 'dark' ? '#ff00ff' : '#9c27b0' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <Female fontSize="small" />
                                      <Typography variant="body2">Mother</Typography>
                                    </Box>
                                  </TableCell>
                                  <TableCell sx={{ color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                                    {familyMember.mother.name}
                                  </TableCell>
                                  <TableCell sx={{ color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                                    {familyMember.mother.phone || 'N/A'}
                                    {familyMember.mother.email && (
                                      <Typography variant="caption" sx={{ display: 'block', color: theme === 'dark' ? '#94a3b8' : '#999999' }}>
                                        {familyMember.mother.email}
                                      </Typography>
                                    )}
                                  </TableCell>
                                  <TableCell sx={{ color: theme === 'dark' ? '#94a3b8' : '#999999' }}>
                                    {familyMember.mother.occupation || 'N/A'}
                                  </TableCell>
                                  <TableCell sx={{ color: theme === 'dark' ? '#94a3b8' : '#999999' }}>
                                    {grandParent.title} - Family {fIndex + 1}
                                  </TableCell>
                                </TableRow>
                                
                                {/* Children */}
                                {familyMember.children.map((child, cIndex) => (
                                  <TableRow key={cIndex}>
                                    <TableCell sx={{ 
                                      color: child.relationship === 'son' 
                                        ? (theme === 'dark' ? '#00ffff' : '#007bff')
                                        : (theme === 'dark' ? '#ff00ff' : '#9c27b0')
                                    }}>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        {child.relationship === 'son' ? (
                                          <Male fontSize="small" />
                                        ) : (
                                          <Female fontSize="small" />
                                        )}
                                        <Typography variant="body2">
                                          {child.relationship === 'son' ? 'Son' : 'Daughter'}
                                          {child.birthOrder && ` #${child.birthOrder}`}
                                        </Typography>
                                      </Box>
                                    </TableCell>
                                    <TableCell sx={{ color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                                      {getStudentFullName(child.student)}
                                    </TableCell>
                                    <TableCell sx={{ color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
                                      {child.student.phone}
                                      <Typography variant="caption" sx={{ display: 'block', color: theme === 'dark' ? '#94a3b8' : '#999999' }}>
                                        {child.student.email}
                                      </Typography>
                                    </TableCell>
                                    <TableCell sx={{ color: theme === 'dark' ? '#94a3b8' : '#999999' }}>
                                      {child.student.gibyGubayeId} • {child.student.gender}
                                    </TableCell>
                                    <TableCell sx={{ color: theme === 'dark' ? '#94a3b8' : '#999999' }}>
                                      {grandParent.title} - Family {fIndex + 1}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </React.Fragment>
                            ))}
                          </React.Fragment>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}
            </Box>
          </Card>
        </motion.div>

        {/* Add Children Dialog */}
        <Dialog 
          open={openAddChildrenDialog} 
          onClose={() => setOpenAddChildrenDialog(false)} 
          maxWidth="md" 
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
              Add Children to Family
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            <Typography variant="body2" color={theme === 'dark' ? '#a8b2d1' : '#666666'} sx={{ mb: 2 }}>
              Select students to add as children to the selected family.
            </Typography>
            
            <Autocomplete
              multiple
              options={filteredStudents}
              getOptionLabel={(option) => getStudentDisplayName(option)}
              value={selectedStudents}
              onChange={(event, newValue) => setSelectedStudents(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Students"
                  placeholder="Type to search students..."
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: theme === 'dark' ? '#1e293b' : 'white',
                      color: theme === 'dark' ? '#ccd6f6' : '#333333',
                      '& fieldset': {
                        borderColor: theme === 'dark' ? '#334155' : '#e5e7eb',
                      }
                    }
                  }}
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
                      backgroundColor: theme === 'dark' ? '#00ff0020' : '#28a74520',
                      color: theme === 'dark' ? '#00ff00' : '#28a745'
                    }}
                  />
                ))
              }
            />
            
            <Box sx={{ mt: 2 }}>
              <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                Filter by Batch:
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={batchFilter}
                onChange={(e) => setBatchFilter(e.target.value)}
                placeholder="Enter batch number (e.g., 2023)"
                sx={{
                  mt: 1,
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: theme === 'dark' ? '#1e293b' : 'white',
                    color: theme === 'dark' ? '#ccd6f6' : '#333333',
                    '& fieldset': {
                      borderColor: theme === 'dark' ? '#334155' : '#e5e7eb',
                    }
                  }
                }}
              />
            </Box>
            
            {selectedStudents.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" color={theme === 'dark' ? '#ccd6f6' : '#333333'} sx={{ mb: 1 }}>
                  Selected Students ({selectedStudents.length})
                </Typography>
                <List dense>
                  {selectedStudents.map((student, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={getStudentFullName(student)}
                        secondary={`${student.gibyGubayeId} • ${student.gender} • ${student.email}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ 
            p: 3,
            borderTop: theme === 'dark' ? '1px solid #334155' : '1px solid #e5e7eb',
            backgroundColor: theme === 'dark' ? '#0f172a' : 'white'
          }}>
            <Button 
              onClick={() => setOpenAddChildrenDialog(false)}
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
              onClick={handleAddChildren}
              variant="contained"
              disabled={selectedStudents.length === 0}
              sx={{
                background: theme === 'dark'
                  ? 'linear-gradient(135deg, #00ff00, #00b300)'
                  : 'linear-gradient(135deg, #28a745, #218838)',
                borderRadius: 1,
                '&:hover': {
                  background: theme === 'dark'
                    ? 'linear-gradient(135deg, #00b300, #008000)'
                    : 'linear-gradient(135deg, #218838, #1e7e34)'
                }
              }}
            >
              Add Selected Students
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Family Dialog */}
        <Dialog 
          open={openEditFamilyDialog} 
          onClose={() => setOpenEditFamilyDialog(false)} 
          maxWidth="md" 
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
              Edit Family Details
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            {editForm && (
              <Stack spacing={2}>
                {/* Father Details */}
                <Box>
                  <Typography variant="subtitle2" sx={{ color: theme === 'dark' ? '#00ffff' : '#007bff', mb: 1 }}>
                    Father Information
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    label="Father's Name"
                    value={editForm.father.name}
                    onChange={(e) => setEditForm({
                      ...editForm,
                      father: { ...editForm.father, name: e.target.value }
                    })}
                    sx={{
                      mb: 2,
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: theme === 'dark' ? '#1e293b' : 'white',
                        color: theme === 'dark' ? '#ccd6f6' : '#333333',
                        '& fieldset': {
                          borderColor: theme === 'dark' ? '#334155' : '#e5e7eb',
                        }
                      }
                    }}
                  />
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Phone"
                      value={editForm.father.phone || ''}
                      onChange={(e) => setEditForm({
                        ...editForm,
                        father: { ...editForm.father, phone: e.target.value }
                      })}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: theme === 'dark' ? '#1e293b' : 'white',
                          color: theme === 'dark' ? '#ccd6f6' : '#333333',
                          '& fieldset': {
                            borderColor: theme === 'dark' ? '#334155' : '#e5e7eb',
                          }
                        }
                      }}
                    />
                    <TextField
                      fullWidth
                      size="small"
                      label="Occupation"
                      value={editForm.father.occupation || ''}
                      onChange={(e) => setEditForm({
                        ...editForm,
                        father: { ...editForm.father, occupation: e.target.value }
                      })}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: theme === 'dark' ? '#1e293b' : 'white',
                          color: theme === 'dark' ? '#ccd6f6' : '#333333',
                          '& fieldset': {
                            borderColor: theme === 'dark' ? '#334155' : '#e5e7eb',
                          }
                        }
                      }}
                    />
                  </Box>
                </Box>
                
                {/* Mother Details */}
                <Box>
                  <Typography variant="subtitle2" sx={{ color: theme === 'dark' ? '#ff00ff' : '#9c27b0', mb: 1 }}>
                    Mother Information
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    label="Mother's Name"
                    value={editForm.mother.name}
                    onChange={(e) => setEditForm({
                      ...editForm,
                      mother: { ...editForm.mother, name: e.target.value }
                    })}
                    sx={{
                      mb: 2,
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: theme === 'dark' ? '#1e293b' : 'white',
                        color: theme === 'dark' ? '#ccd6f6' : '#333333',
                        '& fieldset': {
                          borderColor: theme === 'dark' ? '#334155' : '#e5e7eb',
                        }
                      }
                    }}
                  />
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Phone"
                      value={editForm.mother.phone || ''}
                      onChange={(e) => setEditForm({
                        ...editForm,
                        mother: { ...editForm.mother, phone: e.target.value }
                      })}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: theme === 'dark' ? '#1e293b' : 'white',
                          color: theme === 'dark' ? '#ccd6f6' : '#333333',
                          '& fieldset': {
                            borderColor: theme === 'dark' ? '#334155' : '#e5e7eb',
                          }
                        }
                      }}
                    />
                    <TextField
                      fullWidth
                      size="small"
                      label="Occupation"
                      value={editForm.mother.occupation || ''}
                      onChange={(e) => setEditForm({
                        ...editForm,
                        mother: { ...editForm.mother, occupation: e.target.value }
                      })}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: theme === 'dark' ? '#1e293b' : 'white',
                          color: theme === 'dark' ? '#ccd6f6' : '#333333',
                          '& fieldset': {
                            borderColor: theme === 'dark' ? '#334155' : '#e5e7eb',
                          }
                        }
                      }}
                    />
                  </Box>
                </Box>
              </Stack>
            )}
          </DialogContent>
          <DialogActions sx={{ 
            p: 3,
            borderTop: theme === 'dark' ? '1px solid #334155' : '1px solid #e5e7eb',
            backgroundColor: theme === 'dark' ? '#0f172a' : 'white'
          }}>
            <Button 
              onClick={() => setOpenEditFamilyDialog(false)}
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
              onClick={handleUpdateFamilyMember}
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
              Update Family
            </Button>
          </DialogActions>
        </Dialog>

        {/* Remove Child Dialog */}
        <Dialog 
          open={openRemoveChildDialog} 
          onClose={() => setOpenRemoveChildDialog(false)}
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
              Remove Child from Family
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            <Typography variant="body1" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
              Are you sure you want to remove this child from the family? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ 
            p: 3,
            borderTop: theme === 'dark' ? '1px solid #334155' : '1px solid #e5e7eb',
            backgroundColor: theme === 'dark' ? '#0f172a' : 'white'
          }}>
            <Button 
              onClick={() => setOpenRemoveChildDialog(false)}
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
              onClick={() => {
                // This would be implemented to remove a specific child
                setOpenRemoveChildDialog(false);
              }}
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
              Remove Child
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

export default FamilyPage;