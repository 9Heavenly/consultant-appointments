import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Email, CheckCircle } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { AuthService } from '../services/authService';

interface EmailVerificationProps {
  onVerificationComplete: () => void;
}

const EmailVerification: React.FC<EmailVerificationProps> = ({ onVerificationComplete }) => {
  const { user, isAuthenticated } = useAuth();
  const [isChecking, setIsChecking] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [message, setMessage] = useState<string>('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info');

  useEffect(() => {
    if (user?.emailVerified) {
      onVerificationComplete();
    }
  }, [user, onVerificationComplete]);

  const handleCheckVerification = async () => {
    if (!user) return;

    setIsChecking(true);
    setMessage('');

    try {
      const isVerified = await AuthService.checkEmailVerificationStatus(user.id);
      if (isVerified) {
        setMessage('Email verified successfully! You can now access the app.');
        setMessageType('success');
        setTimeout(() => {
          onVerificationComplete();
        }, 2000);
      } else {
        setMessage('Email not yet verified. Please check your inbox and click the verification link.');
        setMessageType('info');
      }
    } catch (error: any) {
      setMessage(error?.message || 'Failed to check verification status');
      setMessageType('error');
    } finally {
      setIsChecking(false);
    }
  };

  const handleResendVerification = async () => {
    if (!user) return;

    setIsResending(true);
    setMessage('');

    try {
      await AuthService.resendEmailVerification();
      setMessage('Verification email sent! Please check your inbox.');
      setMessageType('success');
    } catch (error: any) {
      setMessage(error?.message || 'Failed to resend verification email');
      setMessageType('error');
    } finally {
      setIsResending(false);
    }
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        p: 2,
      }}
    >
      <Paper
        elevation={8}
        sx={{
          p: 4,
          width: '100%',
          maxWidth: 500,
          borderRadius: 2,
          textAlign: 'center',
        }}
      >
        <Box sx={{ mb: 3 }}>
          <Email sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" component="h1" gutterBottom color="primary">
            Verify Your Email
          </Typography>
          <Typography variant="body1" color="text.secondary">
            We've sent a verification link to:
          </Typography>
          <Typography variant="h6" sx={{ mt: 1, fontWeight: 'bold' }}>
            {user.email}
          </Typography>
        </Box>

        {message && (
          <Alert severity={messageType} sx={{ mb: 3 }}>
            {message}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Please check your email and click the verification link to continue.
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            If you don't see the email, check your spam folder.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={handleCheckVerification}
            disabled={isChecking}
            startIcon={isChecking ? <CircularProgress size={20} /> : <CheckCircle />}
          >
            {isChecking ? 'Checking...' : 'I\'ve Verified My Email'}
          </Button>

          <Button
            fullWidth
            variant="outlined"
            size="large"
            onClick={handleResendVerification}
            disabled={isResending}
            startIcon={isResending ? <CircularProgress size={20} /> : <Email />}
          >
            {isResending ? 'Sending...' : 'Resend Verification Email'}
          </Button>
        </Box>

        <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary">
            <strong>Need help?</strong> Contact support if you're having trouble verifying your email.
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default EmailVerification; 