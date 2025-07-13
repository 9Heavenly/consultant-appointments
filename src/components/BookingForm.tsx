import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Divider,
  Paper,
} from '@mui/material';
import { format } from 'date-fns';
import { Consultant, Appointment } from '../types';

interface BookingFormProps {
  consultant: Consultant | null;
  selectedDate: Date | null;
  selectedTime: string;
  onSubmit: (appointmentData: Omit<Appointment, 'id'>) => void;
}

const BookingForm: React.FC<BookingFormProps> = ({
  consultant,
  selectedDate,
  selectedTime,
  onSubmit,
}) => {
  const [formData, setFormData] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.clientName.trim()) {
      newErrors.clientName = 'Name is required';
    }

    if (!formData.clientEmail.trim()) {
      newErrors.clientEmail = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.clientEmail)) {
      newErrors.clientEmail = 'Please enter a valid email';
    }

    if (!formData.clientPhone.trim()) {
      newErrors.clientPhone = 'Phone number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!consultant || !selectedDate || !selectedTime) {
      return;
    }

    if (!validateForm()) {
      return;
    }

    const appointmentData: Omit<Appointment, 'id'> = {
      consultantId: consultant.id,
      consultantName: consultant.name,
      date: selectedDate,
      time: selectedTime,
      clientName: formData.clientName,
      clientEmail: formData.clientEmail,
      clientPhone: formData.clientPhone,
      notes: formData.notes,
      status: 'pending',
    };

    onSubmit(appointmentData);
    
    // Reset form
    setFormData({
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      notes: '',
    });
  };

  const isFormComplete = consultant && selectedDate && selectedTime;

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {!isFormComplete ? (
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100%',
          color: 'text.secondary'
        }}>
          <Typography variant="body1" textAlign="center">
            Please select a consultant, date, and time to book your appointment
          </Typography>
        </Box>
      ) : (
        <>
          {/* Appointment Summary */}
          <Paper sx={{ p: 2, mb: 3, bgcolor: 'primary.50' }}>
            <Typography variant="h6" gutterBottom>
              Appointment Summary
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>Consultant:</strong> {consultant.name}
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>Date:</strong> {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>Time:</strong> {selectedTime}
            </Typography>
            <Typography variant="body2">
              <strong>Specialty:</strong> {consultant.specialty}
            </Typography>
          </Paper>

          <Divider sx={{ my: 2 }} />

          {/* Booking Form */}
          <Box component="form" onSubmit={handleSubmit} sx={{ flex: 1 }}>
            <Typography variant="subtitle1" gutterBottom>
              Your Information
            </Typography>
            
            <TextField
              fullWidth
              label="Full Name"
              value={formData.clientName}
              onChange={(e) => handleInputChange('clientName', e.target.value)}
              error={!!errors.clientName}
              helperText={errors.clientName}
              margin="normal"
              required
            />

            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={formData.clientEmail}
              onChange={(e) => handleInputChange('clientEmail', e.target.value)}
              error={!!errors.clientEmail}
              helperText={errors.clientEmail}
              margin="normal"
              required
            />

            <TextField
              fullWidth
              label="Phone Number"
              value={formData.clientPhone}
              onChange={(e) => handleInputChange('clientPhone', e.target.value)}
              error={!!errors.clientPhone}
              helperText={errors.clientPhone}
              margin="normal"
              required
            />

            <TextField
              fullWidth
              label="Additional Notes (Optional)"
              multiline
              rows={3}
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              margin="normal"
              placeholder="Any specific topics you'd like to discuss..."
            />

            <Box sx={{ mt: 3 }}>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                sx={{ py: 1.5 }}
              >
                Book Appointment
              </Button>
            </Box>

            <Alert severity="info" sx={{ mt: 2 }}>
              You will receive a confirmation email once your appointment is booked.
            </Alert>
          </Box>
        </>
      )}
    </Box>
  );
};

export default BookingForm; 