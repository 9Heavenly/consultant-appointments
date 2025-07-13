import React from 'react';
import {
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  Box,
  Rating,
  Chip,
  Card,
  CardContent,
} from '@mui/material';
import { Person, Star } from '@mui/icons-material';
import { Consultant } from '../types';

interface ConsultantListProps {
  selectedConsultant: Consultant | null;
  onConsultantSelect: (consultant: Consultant) => void;
}

const mockConsultants: Consultant[] = [
  {
    id: '1',
    name: 'Dr. Sarah Johnson',
    specialty: 'Business Strategy',
    experience: '15 years',
    rating: 4.8,
    image: '',
    availableHours: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
  },
  {
    id: '2',
    name: 'Michael Chen',
    specialty: 'Technology Consulting',
    experience: '12 years',
    rating: 4.9,
    image: '',
    availableHours: ['10:00', '11:00', '13:00', '14:00', '15:00', '16:00'],
  },
  {
    id: '3',
    name: 'Dr. Emily Rodriguez',
    specialty: 'Marketing & Branding',
    experience: '10 years',
    rating: 4.7,
    image: '',
    availableHours: ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00'],
  },
  {
    id: '4',
    name: 'James Wilson',
    specialty: 'Financial Planning',
    experience: '18 years',
    rating: 4.9,
    image: '',
    availableHours: ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00'],
  },
];

const ConsultantList: React.FC<ConsultantListProps> = ({
  selectedConsultant,
  onConsultantSelect,
}) => {
  return (
    <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
      {mockConsultants.map((consultant) => (
        <Card
          key={consultant.id}
          sx={{
            mb: 2,
            cursor: 'pointer',
            border: selectedConsultant?.id === consultant.id ? 2 : 1,
            borderColor: selectedConsultant?.id === consultant.id ? 'primary.main' : 'divider',
            '&:hover': {
              borderColor: 'primary.main',
              boxShadow: 2,
            },
          }}
          onClick={() => onConsultantSelect(consultant)}
        >
          <CardContent sx={{ py: 2, px: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                <Person sx={{ fontSize: 32 }} />
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" component="div" gutterBottom>
                  {consultant.name}
                </Typography>
                <Chip
                  label={consultant.specialty}
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{ mb: 1 }}
                />
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Experience: {consultant.experience}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Rating
                    value={consultant.rating}
                    precision={0.1}
                    size="small"
                    readOnly
                  />
                  <Typography variant="body2" color="text.secondary">
                    {consultant.rating}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>
      ))}
    </List>
  );
};

export default ConsultantList; 