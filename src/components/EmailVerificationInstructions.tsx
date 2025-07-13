import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
} from '@mui/material';
import { Email, CheckCircle } from '@mui/icons-material';

interface EmailVerificationInstructionsProps {
  email: string;
  onResendEmail: () => void;
  onCheckVerification: () => void;
}

const EmailVerificationInstructions: React.FC<EmailVerificationInstructionsProps> = ({
  email,
  onResendEmail,
  onCheckVerification,
}) => {
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
            {email}
          </Typography>
        </Box>

        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            Please check your email and click the verification link to continue using the app.
          </Typography>
        </Alert>

        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            <strong>Steps to verify:</strong>
          </Typography>
          <Box sx={{ textAlign: 'left', pl: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              1. Check your email inbox (and spam folder)
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              2. Click the verification link in the email
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              3. Return here and click "I've Verified My Email"
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={onCheckVerification}
            startIcon={<CheckCircle />}
          >
            I've Verified My Email
          </Button>

          <Button
            fullWidth
            variant="outlined"
            size="large"
            onClick={onResendEmail}
            startIcon={<Email />}
          >
            Resend Verification Email
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

export default EmailVerificationInstructions; 