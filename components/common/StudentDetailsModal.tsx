'use client';

import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Typography, Avatar, Chip, IconButton,
  Divider, Button
} from '@mui/material';
import {
  Close, Male, Female, Fingerprint,
  Email, Phone, School, CalendarToday,
  LocationOn, Church, Work, Translate,
  Cake, Badge as BadgeIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
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
  dateOfBirth?: string;
  motherName?: string;
  emergencyContact?: string;
  university?: string;
  college?: string;
  department?: string;
  block?: string;
  dorm?: string;
  region?: string;
  zone?: string;
  wereda?: string;
  kebele?: string;
  church?: string;
  authority?: string;
  job?: string;
  motherTongue?: string;
  additionalLanguages?: string[];
}

interface StudentDetailsModalProps {
  open: boolean;
  onClose: () => void;
  student: Student | null;
}

const StudentDetailsModal: React.FC<StudentDetailsModalProps> = ({ open, onClose, student }) => {
  const theme = useTheme();
  const isMobile = window.innerWidth < 768;

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

  if (!student) return null;

  const photoUrl = getPhotoUrl(student);
  const fullName = `${student.firstName} ${student.middleName || ''} ${student.lastName}`.trim();
  const age = student.dateOfBirth ? 
    Math.floor((new Date().getTime() - new Date(student.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : 
    null;

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
          bgcolor: theme.palette.background.paper,
          color: theme.palette.text.primary
        }
      }}
    >
      <DialogTitle sx={{
        background: theme.palette.mode === 'dark'
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
      
      <DialogContent sx={{ p: 3, overflowY: 'auto', maxHeight: '80vh' }}>
        <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Avatar
              src={photoUrl || undefined}
              sx={{
                width: 120,
                height: 120,
                mb: 2,
                border: `4px solid ${theme.palette.primary.main}`,
                fontSize: '2.5rem',
                fontWeight: 'bold',
                bgcolor: theme.palette.mode === 'dark' ? '#334155' : '#e5e7eb'
              }}
            >
              {student.firstName?.charAt(0)}{student.lastName?.charAt(0)}
            </Avatar>
            <Chip
              label={student.gender === 'male' ? 'Male' : 'Female'}
              icon={student.gender === 'male' ? <Male /> : <Female />}
              sx={{
                backgroundColor: student.gender === 'male' 
                  ? (theme.palette.mode === 'dark' ? '#00ffff20' : '#007bff20')
                  : (theme.palette.mode === 'dark' ? '#ff00ff20' : '#9c27b020'),
                color: student.gender === 'male' 
                  ? (theme.palette.mode === 'dark' ? '#00ffff' : '#007bff')
                  : (theme.palette.mode === 'dark' ? '#ff00ff' : '#9c27b0')
              }}
            />
          </Box>
          
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5" sx={{ 
              fontWeight: 'bold',
              color: theme.palette.text.primary,
              mb: 1
            }}>
              {fullName}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Fingerprint fontSize="small" sx={{ color: theme.palette.text.secondary }} />
              <Typography variant="body2" color="text.secondary">
                ID: {student.gibyGubayeId || 'N/A'}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Box>
                <Typography variant="caption" color="text.disabled">
                  Batch
                </Typography>
                <Typography variant="body2" sx={{ color: theme.palette.text.primary }}>
                  {student.batch}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="caption" color="text.disabled">
                  Phone
                </Typography>
                <Typography variant="body2" sx={{ color: theme.palette.text.primary }}>
                  {student.phone}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="caption" color="text.disabled">
                  Email
                </Typography>
                <Typography variant="body2" sx={{ color: theme.palette.text.primary }}>
                  {student.email}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        {/* Personal Information */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ 
            color: theme.palette.primary.main,
            mb: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <BadgeIcon /> Personal Information
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            <Box sx={{ minWidth: isMobile ? '100%' : '200px' }}>
              <Typography variant="caption" color="text.disabled">
                Date of Birth
              </Typography>
              <Typography variant="body2" sx={{ color: theme.palette.text.primary }}>
                {student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : 'N/A'}
                {age && ` (${age} years)`}
              </Typography>
            </Box>
            
            <Box sx={{ minWidth: isMobile ? '100%' : '200px' }}>
              <Typography variant="caption" color="text.disabled">
                Mother's Name
              </Typography>
              <Typography variant="body2" sx={{ color: theme.palette.text.primary }}>
                {student.motherName || 'N/A'}
              </Typography>
            </Box>
            
            <Box sx={{ minWidth: isMobile ? '100%' : '200px' }}>
              <Typography variant="caption" color="text.disabled">
                Emergency Contact
              </Typography>
              <Typography variant="body2" sx={{ color: theme.palette.text.primary }}>
                {student.emergencyContact || 'N/A'}
              </Typography>
            </Box>
          </Box>
        </Box>
        
        {/* Academic Information */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ 
            color: theme.palette.primary.main,
            mb: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <School /> Academic Information
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            <Box sx={{ minWidth: isMobile ? '100%' : '200px' }}>
              <Typography variant="caption" color="text.disabled">
                University
              </Typography>
              <Typography variant="body2" sx={{ color: theme.palette.text.primary }}>
                {student.university || 'N/A'}
              </Typography>
            </Box>
            
            <Box sx={{ minWidth: isMobile ? '100%' : '200px' }}>
              <Typography variant="caption" color="text.disabled">
                College
              </Typography>
              <Typography variant="body2" sx={{ color: theme.palette.text.primary }}>
                {student.college || 'N/A'}
              </Typography>
            </Box>
            
            <Box sx={{ minWidth: isMobile ? '100%' : '200px' }}>
              <Typography variant="caption" color="text.disabled">
                Department
              </Typography>
              <Typography variant="body2" sx={{ color: theme.palette.text.primary }}>
                {student.department || 'N/A'}
              </Typography>
            </Box>
            
            <Box sx={{ minWidth: isMobile ? '100%' : '200px' }}>
              <Typography variant="caption" color="text.disabled">
                Block & Dorm
              </Typography>
              <Typography variant="body2" sx={{ color: theme.palette.text.primary }}>
                {student.block || 'N/A'} / {student.dorm || 'N/A'}
              </Typography>
            </Box>
          </Box>
        </Box>
        
        {/* Address Information */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ 
            color: theme.palette.primary.main,
            mb: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <LocationOn /> Address Information
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            <Box sx={{ minWidth: isMobile ? '100%' : '200px' }}>
              <Typography variant="caption" color="text.disabled">
                Region
              </Typography>
              <Typography variant="body2" sx={{ color: theme.palette.text.primary }}>
                {student.region || 'N/A'}
              </Typography>
            </Box>
            
            <Box sx={{ minWidth: isMobile ? '100%' : '200px' }}>
              <Typography variant="caption" color="text.disabled">
                Zone
              </Typography>
              <Typography variant="body2" sx={{ color: theme.palette.text.primary }}>
                {student.zone || 'N/A'}
              </Typography>
            </Box>
            
            <Box sx={{ minWidth: isMobile ? '100%' : '200px' }}>
              <Typography variant="caption" color="text.disabled">
                Wereda & Kebele
              </Typography>
              <Typography variant="body2" sx={{ color: theme.palette.text.primary }}>
                {student.wereda || 'N/A'} / {student.kebele || 'N/A'}
              </Typography>
            </Box>
          </Box>
        </Box>
        
        {/* Religious & Language Information */}
        <Box>
          <Typography variant="subtitle1" sx={{ 
            color: theme.palette.primary.main,
            mb: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <Church /> Religious & Language Information
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            <Box sx={{ minWidth: isMobile ? '100%' : '200px' }}>
              <Typography variant="caption" color="text.disabled">
                Church
              </Typography>
              <Typography variant="body2" sx={{ color: theme.palette.text.primary }}>
                {student.church || 'N/A'}
              </Typography>
            </Box>
            
            <Box sx={{ minWidth: isMobile ? '100%' : '200px' }}>
              <Typography variant="caption" color="text.disabled">
                Authority
              </Typography>
              <Typography variant="body2" sx={{ color: theme.palette.text.primary }}>
                {student.authority || 'N/A'}
              </Typography>
            </Box>
            
            <Box sx={{ minWidth: isMobile ? '100%' : '200px' }}>
              <Typography variant="caption" color="text.disabled">
                Job/Profession
              </Typography>
              <Typography variant="body2" sx={{ color: theme.palette.text.primary }}>
                {student.job || 'N/A'}
              </Typography>
            </Box>
            
            <Box sx={{ minWidth: isMobile ? '100%' : '200px' }}>
              <Typography variant="caption" color="text.disabled">
                Mother Tongue
              </Typography>
              <Typography variant="body2" sx={{ color: theme.palette.text.primary }}>
                {student.motherTongue || 'N/A'}
              </Typography>
            </Box>
            
            <Box sx={{ width: '100%' }}>
              <Typography variant="caption" color="text.disabled">
                Additional Languages
              </Typography>
              <Typography variant="body2" sx={{ color: theme.palette.text.primary }}>
                {student.additionalLanguages?.join(', ') || 'None'}
              </Typography>
            </Box>
          </Box>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ 
        p: 2,
        borderTop: `1px solid ${theme.palette.divider}`
      }}>
        <Button 
          onClick={onClose}
          sx={{
            color: theme.palette.primary.main
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StudentDetailsModal;