import React, { useState } from 'react';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Container,
  Box,
  Typography,
  AppBar,
  Toolbar,
  Paper,
  Button,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { AccountCircle, Logout, Person, AdminPanelSettings } from '@mui/icons-material';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ConsultantList from './components/ConsultantList';
import AppointmentCalendar from './components/AppointmentCalendar';
import BookingForm from './components/BookingForm';
import Login from './components/Login';
import Signup from './components/Signup';
import UserProfile from './components/UserProfile';
import PasswordReset from './components/PasswordReset';
import AdminDashboard from './components/AdminDashboard';
import EmailVerification from './components/EmailVerification';
import { Consultant, Appointment } from './types';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

const AppContent: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [selectedConsultant, setSelectedConsultant] = useState<Consultant | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [showSignup, setShowSignup] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleConsultantSelect = (consultant: Consultant) => {
    setSelectedConsultant(consultant);
    setSelectedDate(null);
    setSelectedTime('');
  };

  const handleDateSelect = (date: Date | null) => {
    setSelectedDate(date);
    setSelectedTime('');
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const handleBookingSubmit = (appointmentData: Omit<Appointment, 'id'>) => {
    const newAppointment: Appointment = {
      ...appointmentData,
      id: Date.now().toString(),
    };
    setAppointments([...appointments, newAppointment]);
    
    // Reset form
    setSelectedDate(null);
    setSelectedTime('');
    
    alert('Appointment booked successfully!');
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
  };

  const handleProfileClick = () => {
    setShowProfile(true);
    handleMenuClose();
  };

  // Show login/signup/password reset if not authenticated
  if (!isAuthenticated) {
    if (showPasswordReset) {
      return <PasswordReset onBackToLogin={() => setShowPasswordReset(false)} />;
    }
    
    return showSignup ? (
      <Signup onSwitchToLogin={() => setShowSignup(false)} />
    ) : (
      <Login 
        onSwitchToSignup={() => setShowSignup(true)}
        onForgotPassword={() => setShowPasswordReset(true)}
      />
    );
  }

  // Show email verification if user is authenticated but email is not verified
  if (isAuthenticated && user && !user.emailVerified && user.email !== 'admin@example.com') {
    return <EmailVerification onVerificationComplete={() => window.location.reload()} />;
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Consultant Appointment Booking
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" color="inherit">
              Welcome, {user?.name}
            </Typography>
            <IconButton
              size="large"
              onClick={handleMenuOpen}
              color="inherit"
            >
              <AccountCircle />
            </IconButton>
                          <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem onClick={handleProfileClick}>
                  <Person sx={{ mr: 1 }} />
                  Profile
                </MenuItem>
                {user?.role === 'admin' && (
                  <MenuItem onClick={() => {
                    setShowAdminDashboard(true);
                    handleMenuClose();
                  }}>
                    <AdminPanelSettings sx={{ mr: 1 }} />
                    Admin Dashboard
                  </MenuItem>
                )}
                <MenuItem onClick={handleLogout}>
                  <Logout sx={{ mr: 1 }} />
                  Logout
                </MenuItem>
              </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 600 }}>
            <Typography variant="h6" gutterBottom>
              Select Consultant
            </Typography>
            <ConsultantList
              selectedConsultant={selectedConsultant}
              onConsultantSelect={handleConsultantSelect}
            />
          </Paper>
          
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 600 }}>
            <Typography variant="h6" gutterBottom>
              Select Date & Time
            </Typography>
            <AppointmentCalendar
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              onDateSelect={handleDateSelect}
              onTimeSelect={handleTimeSelect}
              consultant={selectedConsultant}
            />
          </Paper>
          
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 600 }}>
            <Typography variant="h6" gutterBottom>
              Book Appointment
            </Typography>
            <BookingForm
              consultant={selectedConsultant}
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              onSubmit={handleBookingSubmit}
            />
          </Paper>
        </Box>
      </Container>

      {/* User Profile Modal */}
      {showProfile && (
        <UserProfile onClose={() => setShowProfile(false)} />
      )}

      {/* Admin Dashboard Modal */}
      {showAdminDashboard && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'background.default',
            zIndex: 1000,
            overflow: 'auto',
          }}
        >
          <Box sx={{ position: 'relative' }}>
            <Button
              onClick={() => setShowAdminDashboard(false)}
              sx={{ position: 'absolute', top: 16, right: 16, zIndex: 1 }}
              variant="outlined"
            >
              Close Dashboard
            </Button>
            <AdminDashboard />
          </Box>
        </Box>
      )}
    </Box>
  );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <CssBaseline />
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;
