import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import {
  People,
  Business,
  Event,
  Add,
  Edit,
  Delete,
  Visibility,
  AdminPanelSettings,
} from '@mui/icons-material';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { User, Consultant, Appointment } from '../types';
import { AuthService } from '../services/authService';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getAuth } from 'firebase/auth';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const AdminDashboard: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [users, setUsers] = useState<User[]>([]);
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedConsultant, setSelectedConsultant] = useState<Consultant | null>(null);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [showConsultantDialog, setShowConsultantDialog] = useState(false);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  const functions = getFunctions();
  const deleteUserFunction = httpsCallable(functions, 'deleteUser');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load users
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersData = usersSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as User[];
      setUsers(usersData);

      // Load consultants
      const consultantsSnapshot = await getDocs(collection(db, 'consultants'));
      const consultantsData = consultantsSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Consultant[];
      setConsultants(consultantsData);

      // Load appointments
      const appointmentsSnapshot = await getDocs(collection(db, 'appointments'));
      const appointmentsData = appointmentsSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Appointment[];
      setAppointments(appointmentsData);
    } catch (error) {
      setError('Failed to load data');
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleUserEdit = (user: User) => {
    setSelectedUser(user);
    setShowUserDialog(true);
  };

  const handleConsultantEdit = (consultant: Consultant) => {
    setSelectedConsultant(consultant);
    setShowConsultantDialog(true);
  };

  const handleUserSave = async (updatedUser: User) => {
    try {
      const { id, ...userData } = updatedUser;
      await updateDoc(doc(db, 'users', id), userData);
      setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
      setShowUserDialog(false);
      setSelectedUser(null);
    } catch (error) {
      setError('Failed to update user');
    }
  };

  const handleConsultantSave = async (updatedConsultant: Consultant) => {
    try {
      const { id, ...consultantData } = updatedConsultant;
      await updateDoc(doc(db, 'consultants', id), consultantData);
      setConsultants(consultants.map(c => c.id === updatedConsultant.id ? updatedConsultant : c));
      setShowConsultantDialog(false);
      setSelectedConsultant(null);
    } catch (error) {
      setError('Failed to update consultant');
    }
  };

  const handleDelete = async (collection: string, id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        if (collection === 'users') {
          const userToDelete = users.find(u => u.id === id);
          if (userToDelete) {
            setLoading(true);
            // Call the cloud function
            const auth = getAuth();
            await auth.currentUser?.getIdToken(true); // Ensure fresh token with custom claims
            try {
              const result = await deleteUserFunction({ email: userToDelete.email });
              const data = result.data as { success?: boolean; message?: string };
              if (data.success) {
                setUsers(users.filter(u => u.id !== id));
                setSuccessMessage(`User ${userToDelete.email} deleted from Authentication and database.`);
                setTimeout(() => setSuccessMessage(''), 8000);
              } else {
                setError(data.message || 'Failed to delete user.');
              }
            } catch (err: any) {
              setError(err.message || 'Failed to delete user.');
            } finally {
              setLoading(false);
            }
          }
        } else {
          // For other collections, just delete from Firestore
          await deleteDoc(doc(db, collection, id));
          if (collection === 'consultants') {
            setConsultants(consultants.filter(c => c.id !== id));
          }
        }
      } catch (error) {
        setError('Failed to delete item');
        setLoading(false);
      }
    }
  };

  const handleVerifyEmail = async (userId: string) => {
    try {
      await AuthService.verifyUserEmail(userId);
      setUsers(users.map(u => 
        u.id === userId ? { ...u, emailVerified: true } : u
      ));
      setError(''); // Clear any previous errors
      setSuccessMessage('User email verified successfully!');
      setTimeout(() => setSuccessMessage(''), 3000); // Clear after 3 seconds
    } catch (error) {
      setError('Failed to verify user email');
    }
  };

  const handleResendVerification = async (userId: string) => {
    try {
      await AuthService.resendVerificationEmailToUser(userId);
      setError(''); // Clear any previous errors
    } catch (error) {
      setError('Failed to resend verification email');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <AdminPanelSettings sx={{ fontSize: 32, mr: 2, color: 'primary.main' }} />
        <Typography variant="h4" component="h1">
          Admin Dashboard
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3, mb: 3 }}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Total Users
            </Typography>
            <Typography variant="h4">
              {users.length}
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Total Consultants
            </Typography>
            <Typography variant="h4">
              {consultants.length}
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Total Appointments
            </Typography>
            <Typography variant="h4">
              {appointments.length}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Paper sx={{ width: '100%' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="admin tabs">
          <Tab icon={<People />} label="Users" />
          <Tab icon={<Business />} label="Consultants" />
          <Tab icon={<Event />} label="Appointments" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Email Verified</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone || 'N/A'}</TableCell>
                    <TableCell>
                      <Chip
                        label={user.emailVerified ? 'Verified' : 'Not Verified'}
                        color={user.emailVerified ? 'success' : 'warning'}
                        size="small"
                      />
                      {!user.emailVerified && (
                        <Box sx={{ mt: 1 }}>
                          <Button
                            size="small"
                            variant="outlined"
                            color="primary"
                            onClick={() => handleVerifyEmail(user.id)}
                            sx={{ mr: 1 }}
                          >
                            Verify Email
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="secondary"
                            onClick={() => handleResendVerification(user.id)}
                            title="User must login first to resend verification email"
                          >
                            Resend Email
                          </Button>
                        </Box>
                      )}
                    </TableCell>
                    <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleUserEdit(user)}>
                        <Edit />
                      </IconButton>
                      <IconButton onClick={() => handleDelete('users', user.id)}>
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Specialty</TableCell>
                  <TableCell>Experience</TableCell>
                  <TableCell>Rating</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {consultants.map((consultant) => (
                  <TableRow key={consultant.id}>
                    <TableCell>{consultant.name}</TableCell>
                    <TableCell>{consultant.specialty}</TableCell>
                    <TableCell>{consultant.experience}</TableCell>
                    <TableCell>{consultant.rating}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleConsultantEdit(consultant)}>
                        <Edit />
                      </IconButton>
                      <IconButton onClick={() => handleDelete('consultants', consultant.id)}>
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Client</TableCell>
                  <TableCell>Consultant</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Time</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {appointments.map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell>{appointment.clientName}</TableCell>
                    <TableCell>{appointment.consultantName}</TableCell>
                    <TableCell>{new Date(appointment.date).toLocaleDateString()}</TableCell>
                    <TableCell>{appointment.time}</TableCell>
                    <TableCell>
                      <Chip
                        label={appointment.status}
                        color={
                          appointment.status === 'confirmed' ? 'success' :
                          appointment.status === 'pending' ? 'warning' : 'error'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton>
                        <Visibility />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default AdminDashboard; 