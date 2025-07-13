import React from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Divider,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format, addDays, isToday, isTomorrow } from 'date-fns';
import { Consultant } from '../types';

interface AppointmentCalendarProps {
  selectedDate: Date | null;
  selectedTime: string;
  onDateSelect: (date: Date | null) => void;
  onTimeSelect: (time: string) => void;
  consultant: Consultant | null;
}

const timeSlots = [
  '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'
];

const AppointmentCalendar: React.FC<AppointmentCalendarProps> = ({
  selectedDate,
  selectedTime,
  onDateSelect,
  onTimeSelect,
  consultant,
}) => {
  const isTimeSlotAvailable = (time: string) => {
    if (!consultant) return false;
    return consultant.availableHours.includes(time);
  };

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'EEE, MMM d');
  };

  const quickDates = [
    addDays(new Date(), 0), // Today
    addDays(new Date(), 1), // Tomorrow
    addDays(new Date(), 2),
    addDays(new Date(), 3),
    addDays(new Date(), 7), // Next week
  ];

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {!consultant ? (
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100%',
          color: 'text.secondary'
        }}>
          <Typography variant="body1">
            Please select a consultant first
          </Typography>
        </Box>
      ) : (
        <>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Select Date
            </Typography>
            
            {/* Quick date selection */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Quick Select:
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {quickDates.map((date) => (
                  <Button
                    key={date.toISOString()}
                    variant={selectedDate && format(selectedDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd') ? 'contained' : 'outlined'}
                    size="small"
                    onClick={() => onDateSelect(date)}
                    sx={{ minWidth: 'auto', px: 1 }}
                  >
                    {getDateLabel(date)}
                  </Button>
                ))}
              </Box>
            </Box>

            {/* Date picker */}
            <DatePicker
              label="Or pick a specific date"
              value={selectedDate}
              onChange={onDateSelect}
              disablePast
              slotProps={{
                textField: {
                  fullWidth: true,
                  size: 'small',
                },
              }}
            />
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Time slots */}
          {selectedDate && (
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle1" gutterBottom>
                Select Time
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Available times for {format(selectedDate, 'EEEE, MMMM d, yyyy')}:
              </Typography>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
                {timeSlots.map((time) => {
                  const isAvailable = isTimeSlotAvailable(time);
                  const isSelected = selectedTime === time;
                  
                  return (
                    <Button
                      key={time}
                      variant={isSelected ? 'contained' : 'outlined'}
                      fullWidth
                      disabled={!isAvailable}
                      onClick={() => onTimeSelect(time)}
                      sx={{
                        py: 1,
                        opacity: isAvailable ? 1 : 0.5,
                      }}
                    >
                      {time}
                    </Button>
                  );
                })}
              </Box>
            </Box>
          )}

          {!selectedDate && (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              flex: 1,
              color: 'text.secondary'
            }}>
              <Typography variant="body2">
                Select a date to see available times
              </Typography>
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default AppointmentCalendar; 