'use client';

import { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Chip,
  Avatar, Paper, Divider, IconButton,
  Button, Tabs, Tab, useMediaQuery,
  CircularProgress, Alert, AlertTitle,
  Stack, Container
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/lib/theme-context';
import { useAuth } from '@/lib/auth';
import api from '@/app/utils/api';
import {
  Person, Email, Phone, School, Work, Cake,
  LocationOn, Home, Language, Translate, Church,
  Business, CalendarToday, AccessTime, Security,
  Badge as BadgeIcon, Fingerprint, Edit,
  Female, Male, Emergency, BusinessCenter,
  AccountBalance, LocalLibrary, Group,
  Description, PersonPin, ExpandMore, ExpandLess,
  Download, Share, Verified, Star, CheckCircle,
  Warning, Error as ErrorIcon,
  PhoneAndroid, ContactPhone, ContactMail,
  Map, Public, Flag, Apartment,
  MenuBook, History, Update,
  Lock, VpnKey, AdminPanelSettings,
  SupervisedUserCircle,
  WorkOutline, WorkHistory,
  LocalHospital, FamilyRestroom,
  AccountCircle, ContactEmergency,
  ContactSupport, ContactPage,
  People, CardMembership,
  AssignmentInd, RecentActors
} from '@mui/icons-material';
import { format, differenceInYears } from 'date-fns';

// Types
interface Student {
  _id: string;
  gibyGubayeId: string;
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
}

interface User {
  _id: string;
  gibyGubayeId?: string;
  name: string;
  email: string;
  phone: string;
  background?: string;
  studentId: Student;
  role:
    | 'user'
    | 'disk-user'
    | 'spinner-user'
    | 'accountant'
    | 'admin'
    | 'Abalat-Guday'
    | 'Mezmur'
    | 'Timhrt'
    | 'Muyana-Terado'
    | 'Priesedant'
    | 'Vice-Priesedant'
    | 'Secretary'
    | 'Bachna-Department'
    | 'Audite'
    | 'Limat';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ProfileStats {
  totalCourses?: number;
  assignmentsCompleted?: number;
  attendanceRate?: number;
  memberSince?: string;
}

interface SectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  expanded?: boolean;
  onToggle?: () => void;
}

const ProfilePage = () => {
  const { theme } = useTheme();
  const { user: authUser } = useAuth();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(max-width: 1024px)');
  
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    personal: true,
    academic: true,
    contact: true,
    religious: true,
    languages: true,
    system: true
  });
  
  const [profileStats, setProfileStats] = useState<ProfileStats>({});

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  // Theme styles
  const themeStyles = {
    background: theme === 'dark' 
      ? 'linear-gradient(135deg, #0a192f, #112240)' 
      : 'linear-gradient(135deg, #f0f4f8, #ffffff)',
    textColor: theme === 'dark' ? '#e2e8f0' : '#1e293b',
    primaryColor: theme === 'dark' ? '#00ffff' : '#007bff',
    secondaryColor: theme === 'dark' ? '#9333ea' : '#8b5cf6',
    surface: theme === 'dark' ? '#1e293b' : '#ffffff',
    cardBg: theme === 'dark' ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.95)',
    cardBorder: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0',
    shadow: theme === 'dark' 
      ? '0 4px 20px rgba(0, 255, 255, 0.1)' 
      : '0 4px 20px rgba(0, 0, 0, 0.08)',
    headerGradient: theme === 'dark'
      ? 'linear-gradient(135deg, #00ffff, #00b3b3)'
      : 'linear-gradient(135deg, #007bff, #0056b3)',
    accentColor: theme === 'dark' ? '#ff6b6b' : '#ef4444'
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!authUser?._id) {
        throw new Error('No authenticated user found');
      }

      const response = await api.get(`/user/${authUser._id}`);
      
      if (response.data.success && response.data.data) {
        setUserData(response.data.data);
        calculateStats(response.data.data);
      } else {
        throw new Error('Failed to load profile data');
      }
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      setError(error.message || 'Failed to load profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (user: User) => {
    const stats: ProfileStats = {
      memberSince: format(new Date(user.createdAt), 'MMMM yyyy')
    };
    
    // You can add more stats calculations here
    // For example: total courses completed, etc.
    
    setProfileStats(stats);
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Helper functions
  const getPhotoUrl = (student: Student): string | null => {
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

  const calculateAge = (dateOfBirth: string): number => {
    try {
      return differenceInYears(new Date(), new Date(dateOfBirth));
    } catch {
      return 0;
    }
  };

  const formatDate = (dateString: string): string => {
    try {
      return format(new Date(dateString), 'MMMM dd, yyyy');
    } catch {
      return 'Invalid Date';
    }
  };

  const formatDateTime = (dateString: string): string => {
    try {
      return format(new Date(dateString), 'MMMM dd, yyyy HH:mm');
    } catch {
      return 'Invalid Date';
    }
  };

  const getRoleDisplayName = (role: string): string => {
    const roleMap: Record<string, string> = {
      'user': 'User',
      'disk-user': 'Disk User',
      'spinner-user': 'Spinner User',
      'accountant': 'Accountant',
      'admin': 'Administrator',
      'Abalat-Guday': 'Abalat Guday',
      'Mezmur': 'Mezmur',
      'Timhrt': 'Timhrt',
      'Muyana-Terado': 'Muyana Terado',
      'Priesedant': 'President',
      'Vice-Priesedant': 'Vice President',
      'Secretary': 'Secretary',
      'Bachna-Department': 'Bachna Department',
      'Audite': 'Auditor',
      'Limat': 'Limat'
    };
    return roleMap[role] || role;
  };

  const getRoleIcon = (role: string): React.ReactNode => {
    const roleIcons: Record<string, React.ReactNode> = {
      'admin': <AdminPanelSettings />,
      'accountant': <Description />,
      'Abalat-Guday': <Group />,
      'Mezmur': <MenuBook />,
      'Timhrt': <School />,
      'Muyana-Terado': <Work />,
      'Priesedant': <BusinessCenter />,
      'Vice-Priesedant': <BusinessCenter />,
      'Secretary': <Description />,
      'Bachna-Department': <Group />,
      'Audite': <Description />,
      'Limat': <WorkHistory />
    };
    return roleIcons[role] || <Person />;
  };

  const getGenderIcon = (gender: string): React.ReactNode => {
    return gender === 'male' ? <Male /> : <Female />;
  };

  const getStatusColor = (isActive: boolean): "success" | "error" => {
    return isActive ? "success" : "error";
  };

  // Section Component
  const Section: React.FC<SectionProps> = ({ title, icon, children, expanded = true, onToggle }) => (
    <Card 
      component={motion.div}
      initial="hidden"
      animate="visible"
      variants={fadeInUp}
      transition={{ duration: 0.3 }}
      sx={{ 
        mb: 3, 
        borderRadius: 2,
        backgroundColor: themeStyles.cardBg,
        border: themeStyles.cardBorder,
        boxShadow: themeStyles.shadow,
        overflow: 'hidden'
      }}
    >
      <CardContent sx={{ p: 0 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 3,
            pb: expanded ? 2 : 3,
            background: themeStyles.headerGradient
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              width: 40,
              height: 40,
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.2)'
            }}>
              {icon}
            </Box>
            <Typography variant="h6" sx={{ 
              fontWeight: 'bold', 
              color: 'white',
              fontSize: isMobile ? '1rem' : '1.25rem'
            }}>
              {title}
            </Typography>
          </Box>
          {onToggle && (
            <IconButton 
              onClick={onToggle}
              sx={{ color: 'white' }}
            >
              {expanded ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          )}
        </Box>
        
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Box sx={{ p: 3, pt: 2 }}>
                {children}
              </Box>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );

  // Info Item Component
  const InfoItem: React.FC<{
    label: string;
    value: string | number | React.ReactNode;
    icon?: React.ReactNode;
    secondary?: boolean;
  }> = ({ label, value, icon, secondary }) => (
    <Box sx={{ 
      mb: 2,
      p: 2,
      borderRadius: 1,
      backgroundColor: secondary ? (theme === 'dark' ? '#1e293b' : '#f8fafc') : 'transparent',
      border: secondary ? (theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0') : 'none'
    }}>
      <Typography variant="caption" sx={{ 
        color: theme === 'dark' ? '#94a3b8' : '#64748b',
        fontWeight: 500,
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        mb: 0.5
      }}>
        {icon && <Box sx={{ display: 'flex', alignItems: 'center' }}>{icon}</Box>}
        {label}
      </Typography>
      {typeof value === 'string' || typeof value === 'number' ? (
        <Typography variant="body2" sx={{ 
          fontWeight: 500,
          color: theme === 'dark' ? '#e2e8f0' : '#1e293b',
          wordBreak: 'break-word'
        }}>
          {value}
        </Typography>
      ) : (
        value
      )}
    </Box>
  );

  // Loading State
  if (loading) {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        background: themeStyles.background,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress size={60} sx={{ 
              color: themeStyles.primaryColor,
              mb: 3
            }} />
            <Typography variant="h6" sx={{ 
              color: themeStyles.textColor,
              fontWeight: 'medium'
            }}>
              Loading Profile...
            </Typography>
          </Box>
        </motion.div>
      </Box>
    );
  }

  // Error State
  if (error || !userData) {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        background: themeStyles.background,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ width: '100%', maxWidth: 600 }}
        >
          <Alert 
            severity="error"
            sx={{ 
              borderRadius: 2,
              backgroundColor: themeStyles.cardBg,
              color: themeStyles.textColor
            }}
          >
            <AlertTitle>Profile Error</AlertTitle>
            {error || 'Failed to load profile data. Please try again.'}
            <Box sx={{ mt: 2 }}>
              <Button 
                variant="contained"
                onClick={fetchUserProfile}
                sx={{
                  background: themeStyles.headerGradient,
                  '&:hover': {
                    opacity: 0.9
                  }
                }}
              >
                Retry
              </Button>
            </Box>
          </Alert>
        </motion.div>
      </Box>
    );
  }

  const student = userData.studentId;
  const photoUrl = getPhotoUrl(student);

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: themeStyles.background,
      color: themeStyles.textColor,
      pb: 6
    }}>
      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
        {/* Header Section */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={{ duration: 0.6 }}
        >
          <Card sx={{ 
            mt: 3, 
            mb: 4, 
            borderRadius: 2,
            background: themeStyles.headerGradient,
            color: 'white',
            overflow: 'hidden',
            boxShadow: themeStyles.shadow
          }}>
            <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: isMobile ? 'column' : 'row',
                alignItems: isMobile ? 'center' : 'flex-start',
                gap: 3
              }}>
                {/* Profile Image */}
                <Box sx={{ 
                  position: 'relative',
                  flexShrink: 0
                }}>
                  <Avatar
                    src={photoUrl || undefined}
                    sx={{
                      width: isMobile ? 120 : 150,
                      height: isMobile ? 120 : 150,
                      border: '4px solid white',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
                    }}
                  >
                    {student.firstName?.charAt(0)}{student.lastName?.charAt(0)}
                  </Avatar>
                  <Chip
                    label={userData.isActive ? 'Active' : 'Inactive'}
                    color={getStatusColor(userData.isActive)}
                    size="small"
                    sx={{
                      position: 'absolute',
                      bottom: -10,
                      right: isMobile ? '50%' : -10,
                      transform: isMobile ? 'translateX(50%)' : 'none',
                      fontWeight: 'bold',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                    }}
                  />
                </Box>

                {/* Profile Info */}
                <Box sx={{ 
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isMobile ? 'center' : 'flex-start',
                  textAlign: isMobile ? 'center' : 'left'
                }}>
                  <Typography variant="h4" sx={{ 
                    fontWeight: 'bold', 
                    mb: 1,
                    fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' }
                  }}>
                    {student.firstName} {student.middleName} {student.lastName}
                  </Typography>
                  
                  <Box sx={{ 
                    display: 'flex', 
                    flexWrap: 'wrap',
                    gap: 1,
                    mb: 2,
                    justifyContent: isMobile ? 'center' : 'flex-start'
                  }}>
                    <Chip
                      icon={<Fingerprint />}
                      label={getRoleDisplayName(userData.role)}
                      sx={{
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        color: 'white',
                        fontWeight: 'medium'
                      }}
                    />
                    <Chip
                      icon={<Fingerprint />}
                      label={student.gender}
                      sx={{
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        color: 'white',
                        fontWeight: 'medium'
                      }}
                    />
                    <Chip
                      icon={<Fingerprint />}
                      label={`ID: ${student.gibyGubayeId}`}
                      sx={{
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        color: 'white',
                        fontWeight: 'medium',
                        fontFamily: 'monospace'
                      }}
                    />
                  </Box>

                  <Typography variant="body1" sx={{ 
                    opacity: 0.9,
                    mb: 3,
                    maxWidth: 600
                  }}>
                    {userData.background || 'Welcome to your profile dashboard. All your information is securely stored and organized.'}
                  </Typography>

                  <Box sx={{ 
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 2,
                    justifyContent: isMobile ? 'center' : 'flex-start'
                  }}>
                    <Button
                      variant="contained"
                      startIcon={<Edit />}
                      sx={{
                        backgroundColor: 'white',
                        color: themeStyles.primaryColor,
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.9)'
                        }
                      }}
                    >
                      Edit Profile
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Download />}
                      sx={{
                        borderColor: 'white',
                        color: 'white',
                        '&:hover': {
                          borderColor: 'white',
                          backgroundColor: 'rgba(255, 255, 255, 0.1)'
                        }
                      }}
                    >
                      Export Data
                    </Button>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}
        >
          {[
            { label: 'Student ID', value: student.gibyGubayeId, icon: <Fingerprint />, color: themeStyles.primaryColor },
            { label: 'Age', value: `${calculateAge(student.dateOfBirth)} years`, icon: <Cake />, color: themeStyles.accentColor },
            { label: 'University', value: student.university, icon: <AccountBalance />, color: themeStyles.secondaryColor },
            { label: 'Member Since', value: profileStats.memberSince || formatDate(userData.createdAt), icon: <History />, color: '#10b981' }
          ].map((stat, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              style={{ flex: '1 1 200px', minWidth: 200 }}
            >
              <Card sx={{ 
                height: '100%',
                borderRadius: 2,
                backgroundColor: themeStyles.cardBg,
                border: themeStyles.cardBorder,
                boxShadow: themeStyles.shadow
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      backgroundColor: `${stat.color}20`
                    }}>
                      <Box sx={{ color: stat.color }}>
                        {stat.icon}
                      </Box>
                    </Box>
                    <Typography variant="body2" sx={{ 
                      color: theme === 'dark' ? '#94a3b8' : '#64748b',
                      fontWeight: 500
                    }}>
                      {stat.label}
                    </Typography>
                  </Box>
                  <Typography variant="h5" sx={{ 
                    fontWeight: 'bold',
                    color: themeStyles.textColor
                  }}>
                    {stat.value}
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Main Content - Two Column Layout on Desktop */}
        <Box sx={{ 
          display: 'flex',
          flexDirection: isTablet ? 'column' : 'row',
          gap: 3
        }}>
          {/* Left Column */}
          <Box sx={{ 
            flex: isTablet ? 'none' : 1,
            width: isTablet ? '100%' : 'auto'
          }}>
            {/* Personal Information */}
            <Section
              title="Personal Information"
              icon={<Person />}
              expanded={expandedSections.personal}
              onToggle={() => toggleSection('personal')}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  <Box sx={{ flex: '1 1 200px' }}>
                    <InfoItem
                      label="Full Name"
                      value={`${student.firstName} ${student.middleName || ''} ${student.lastName}`.trim()}
                      icon={<PersonPin />}
                    />
                  </Box>
                  <Box sx={{ flex: '1 1 200px' }}>
                    <InfoItem
                      label="Mother's Name"
                      value={student.motherName}
                      icon={<FamilyRestroom />}
                    />
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  <Box sx={{ flex: '1 1 200px' }}>
                    <InfoItem
                      label="Date of Birth"
                      value={`${formatDate(student.dateOfBirth)} (${calculateAge(student.dateOfBirth)} years)`}
                      icon={<Cake />}
                    />
                  </Box>
                  <Box sx={{ flex: '1 1 200px' }}>
                    <InfoItem
                      label="Gender"
                      value={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getGenderIcon(student.gender)}
                          {student.gender.charAt(0).toUpperCase() + student.gender.slice(1)}
                        </Box>
                      }
                      icon={<Person />}
                    />
                  </Box>
                </Box>

                <InfoItem
                  label="Job/Profession"
                  value={student.job}
                  icon={<Work />}
                  secondary
                />
              </Box>
            </Section>

            {/* Contact Information */}
            <Section
              title="Contact Information"
              icon={<ContactPhone />}
              expanded={expandedSections.contact}
              onToggle={() => toggleSection('contact')}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  <Box sx={{ flex: '1 1 200px' }}>
                    <InfoItem
                      label="Phone Number"
                      value={student.phone}
                      icon={<Phone />}
                    />
                  </Box>
                  <Box sx={{ flex: '1 1 200px' }}>
                    <InfoItem
                      label="Email Address"
                      value={student.email}
                      icon={<Email />}
                    />
                  </Box>
                </Box>

                <InfoItem
                  label="Emergency Contact"
                  value={student.emergencyContact}
                  icon={<Emergency />}
                  secondary
                />

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  <Box sx={{ flex: '1 1 200px' }}>
                    <InfoItem
                      label="Account Email"
                      value={userData.email}
                      icon={<ContactMail />}
                    />
                  </Box>
                  <Box sx={{ flex: '1 1 200px' }}>
                    <InfoItem
                      label="Account Phone"
                      value={userData.phone}
                      icon={<PhoneAndroid />}
                    />
                  </Box>
                </Box>
              </Box>
            </Section>

            {/* Academic Information */}
            <Section
              title="Academic Information"
              icon={<School />}
              expanded={expandedSections.academic}
              onToggle={() => toggleSection('academic')}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  <Box sx={{ flex: '1 1 200px' }}>
                    <InfoItem
                      label="University"
                      value={student.university}
                      icon={<AccountBalance />}
                    />
                  </Box>
                  <Box sx={{ flex: '1 1 200px' }}>
                    <InfoItem
                      label="College"
                      value={student.college}
                      icon={<LocalLibrary />}
                    />
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  <Box sx={{ flex: '1 1 200px' }}>
                    <InfoItem
                      label="Department"
                      value={student.department}
                      icon={<Business />}
                    />
                  </Box>
                  <Box sx={{ flex: '1 1 200px' }}>
                    <InfoItem
                      label="Batch"
                      value={student.batch}
                      icon={<CalendarToday />}
                    />
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  <Box sx={{ flex: '1 1 200px' }}>
                    <InfoItem
                      label="Block"
                      value={student.block}
                      icon={<Apartment />}
                    />
                  </Box>
                  <Box sx={{ flex: '1 1 200px' }}>
                    <InfoItem
                      label="Dorm"
                      value={student.dorm}
                      icon={<Home />}
                    />
                  </Box>
                </Box>

                {student.attendsCourse && (
                  <>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="subtitle2" sx={{ 
                      color: themeStyles.primaryColor,
                      fontWeight: 'bold',
                      mb: 1
                    }}>
                      Course Information
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                      <Box sx={{ flex: '1 1 200px' }}>
                        <InfoItem
                          label="Course Name"
                          value={student.courseName || 'Not specified'}
                          icon={<MenuBook />}
                          secondary
                        />
                      </Box>
                      <Box sx={{ flex: '1 1 200px' }}>
                        <InfoItem
                          label="Course Church"
                          value={student.courseChurch || 'Not specified'}
                          icon={<Church />}
                          secondary
                        />
                      </Box>
                    </Box>
                  </>
                )}
              </Box>
            </Section>
          </Box>

          {/* Right Column */}
          <Box sx={{ 
            flex: isTablet ? 'none' : 1,
            width: isTablet ? '100%' : 'auto'
          }}>
            {/* Address Information */}
            <Section
              title="Address Information"
              icon={<LocationOn />}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  <Box sx={{ flex: '1 1 200px' }}>
                    <InfoItem
                      label="Region"
                      value={student.region}
                      icon={<Public />}
                    />
                  </Box>
                  <Box sx={{ flex: '1 1 200px' }}>
                    <InfoItem
                      label="Zone"
                      value={student.zone}
                      icon={<Map />}
                    />
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  <Box sx={{ flex: '1 1 200px' }}>
                    <InfoItem
                      label="Wereda"
                      value={student.wereda}
                      icon={<Flag />}
                    />
                  </Box>
                  <Box sx={{ flex: '1 1 200px' }}>
                    <InfoItem
                      label="Kebele"
                      value={student.kebele}
                      icon={<LocationOn />}
                    />
                  </Box>
                </Box>
              </Box>
            </Section>

            {/* Religious Information */}
            <Section
              title="Religious Information"
              icon={<Church />}
              expanded={expandedSections.religious}
              onToggle={() => toggleSection('religious')}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  <Box sx={{ flex: '1 1 200px' }}>
                    <InfoItem
                      label="Church"
                      value={student.church}
                      icon={<Church />}
                    />
                  </Box>
                  <Box sx={{ flex: '1 1 200px' }}>
                    <InfoItem
                      label="Authority"
                      value={student.authority}
                      icon={<BusinessCenter />}
                    />
                  </Box>
                </Box>
              </Box>
            </Section>

            {/* Language Information */}
            <Section
              title="Language Information"
              icon={<Translate />}
              expanded={expandedSections.languages}
              onToggle={() => toggleSection('languages')}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <InfoItem
                  label="Mother Tongue"
                  value={student.motherTongue}
                  icon={<Language />}
                />
                
                {student.additionalLanguages && student.additionalLanguages.length > 0 && (
                  <InfoItem
                    label="Additional Languages"
                    value={
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {student.additionalLanguages.map((lang, index) => (
                          <Chip
                            key={index}
                            label={lang}
                            size="small"
                            sx={{
                              backgroundColor: theme === 'dark' ? '#334155' : '#e2e8f0',
                              color: themeStyles.textColor
                            }}
                          />
                        ))}
                      </Box>
                    }
                    icon={<Translate />}
                    secondary
                  />
                )}
              </Box>
            </Section>

            {/* System Information */}
            <Section
              title="System Information"
              icon={<Security />}
              expanded={expandedSections.system}
              onToggle={() => toggleSection('system')}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  <Box sx={{ flex: '1 1 200px' }}>
                    <InfoItem
                      label="Account Role"
                      value={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getRoleIcon(userData.role)}
                          {getRoleDisplayName(userData.role)}
                        </Box>
                      }
                      icon={<AdminPanelSettings />}
                    />
                  </Box>
                  <Box sx={{ flex: '1 1 200px' }}>
                    <InfoItem
                      label="Account Status"
                      value={
                        <Chip
                          label={userData.isActive ? 'Active' : 'Inactive'}
                          color={getStatusColor(userData.isActive)}
                          size="small"
                          icon={userData.isActive ? <CheckCircle /> : <ErrorIcon />}
                        />
                      }
                      icon={<Security />}
                    />
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  <Box sx={{ flex: '1 1 200px' }}>
                    <InfoItem
                      label="Student Status"
                      value={
                        <Chip
                          label={student.isActive ? 'Active' : 'Inactive'}
                          color={getStatusColor(student.isActive)}
                          size="small"
                          icon={student.isActive ? <CheckCircle /> : <ErrorIcon />}
                        />
                      }
                      icon={<Person />}
                    />
                  </Box>
                </Box>

                <Divider sx={{ my: 1 }} />

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  <Box sx={{ flex: '1 1 200px' }}>
                    <InfoItem
                      label="Profile Created"
                      value={formatDateTime(userData.createdAt)}
                      icon={<History />}
                      secondary
                    />
                  </Box>
                  <Box sx={{ flex: '1 1 200px' }}>
                    <InfoItem
                      label="Last Updated"
                      value={formatDateTime(userData.updatedAt)}
                      icon={<Update />}
                      secondary
                    />
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  <Box sx={{ flex: '1 1 200px' }}>
                    <InfoItem
                      label="Student Created"
                      value={formatDateTime(student.createdAt)}
                      icon={<CalendarToday />}
                      secondary
                    />
                  </Box>
                  <Box sx={{ flex: '1 1 200px' }}>
                    <InfoItem
                      label="Student Updated"
                      value={formatDateTime(student.updatedAt)}
                      icon={<AccessTime />}
                      secondary
                    />
                  </Box>
                </Box>
              </Box>
            </Section>
          </Box>
        </Box>

        {/* Quick Actions */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card sx={{ 
            mt: 3,
            borderRadius: 2,
            backgroundColor: themeStyles.cardBg,
            border: themeStyles.cardBorder,
            boxShadow: themeStyles.shadow
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ 
                mb: 2,
                color: themeStyles.primaryColor,
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <Security /> Quick Actions
              </Typography>
              <Box sx={{ 
                display: 'flex', 
                flexWrap: 'wrap',
                gap: 2
              }}>
                <Button
                  variant="outlined"
                  startIcon={<Edit />}
                  sx={{
                    borderColor: themeStyles.primaryColor,
                    color: themeStyles.primaryColor,
                    '&:hover': {
                      borderColor: themeStyles.primaryColor,
                      backgroundColor: `${themeStyles.primaryColor}10`
                    }
                  }}
                >
                  Edit Profile
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<VpnKey />}
                  sx={{
                    borderColor: themeStyles.secondaryColor,
                    color: themeStyles.secondaryColor,
                    '&:hover': {
                      borderColor: themeStyles.secondaryColor,
                      backgroundColor: `${themeStyles.secondaryColor}10`
                    }
                  }}
                >
                  Change Password
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Download />}
                  sx={{
                    borderColor: '#10b981',
                    color: '#10b981',
                    '&:hover': {
                      borderColor: '#10b981',
                      backgroundColor: '#10b98110'
                    }
                  }}
                >
                  Export Data
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Share />}
                  sx={{
                    borderColor: '#f59e0b',
                    color: '#f59e0b',
                    '&:hover': {
                      borderColor: '#f59e0b',
                      backgroundColor: '#f59e0b10'
                    }
                  }}
                >
                  Share Profile
                </Button>
              </Box>
            </CardContent>
          </Card>
        </motion.div>
      </Container>
    </Box>
  );
};

export default ProfilePage;