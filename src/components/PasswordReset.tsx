import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  Link,
  CircularProgress,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Email, CheckCircle, ArrowBack } from '@mui/icons-material';
import { AuthService } from '../services/authService';

interface PasswordResetProps {
  onBackToLogin: () => void;
}

const PasswordReset: React.FC<PasswordResetProps> = ({ onBackToLogin }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await AuthService.sendPasswordResetEmail(email);
      setShowSuccessDialog(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (error) setError('');
  };

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
          maxWidth: 400,
          borderRadius: 2,
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom color="primary">
            Reset Password
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Enter your email address and we'll send you a link to reset your password
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => handleEmailChange(e.target.value)}
            margin="normal"
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Email color="action" />
                </InputAdornment>
              ),
            }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={isLoading}
            sx={{ mt: 3, mb: 2, py: 1.5 }}
          >
            {isLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Send Reset Link'
            )}
          </Button>

          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Link
              component="button"
              variant="body2"
              onClick={onBackToLogin}
              sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}
            >
              <ArrowBack fontSize="small" />
              Back to Login
            </Link>
          </Box>
        </Box>
      </Paper>

      {/* Success Dialog */}
      <Dialog
        open={showSuccessDialog}
        onClose={() => setShowSuccessDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ textAlign: 'center' }}>
          <CheckCircle color="success" sx={{ fontSize: 48, mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Check Your Email
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            We've sent a password reset link to:
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 2 }}>
            {email}
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Click the link in the email to reset your password. The link will expire in 1 hour.
          </Typography>
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Note:</strong> If you don't see the email, check your spam folder.
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button
            variant="contained"
            onClick={() => {
              setShowSuccessDialog(false);
              onBackToLogin();
            }}
          >
            Back to Login
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PasswordReset; 