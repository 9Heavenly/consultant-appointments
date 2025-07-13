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
  IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff, Email, Lock } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { LoginCredentials } from '../types';
import { AuthService } from '../services/authService';

interface LoginProps {
  onSwitchToSignup: () => void;
  onForgotPassword: () => void;
}

const Login: React.FC<LoginProps> = ({ onSwitchToSignup, onForgotPassword }) => {
  const { login, isLoading } = useAuth();
  const [formData, setFormData] = useState<LoginCredentials>({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string>('');

  const handleInputChange = (field: keyof LoginCredentials, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      await login(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  const handleCreateDemoAdmin = async () => {
    try {
      await AuthService.createDemoAdmin();
      setError('Demo admin account created! You can now login with admin@example.com / admin123');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create demo admin');
    }
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
            Welcome Back
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Login to your account to continue
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
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
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

          <TextField
            fullWidth
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            margin="normal"
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
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
                'Login'
              )}
            </Button>

            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Link
                component="button"
                variant="body2"
                onClick={onForgotPassword}
                sx={{ cursor: 'pointer', mb: 1, display: 'block' }}
              >
                Forgot your password?
              </Link>
              <Typography variant="body2" color="text.secondary">
                Don't have an account?{' '}
                <Link
                  component="button"
                  variant="body2"
                  onClick={onSwitchToSignup}
                  sx={{ cursor: 'pointer' }}
                >
                  Sign up here
                </Link>
              </Typography>
            </Box>

          <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary" textAlign="center" gutterBottom>
              <strong>Admin Account:</strong><br />
              Email: admin@example.com<br />
              Password: admin123
            </Typography>
            <Button
              fullWidth
              variant="outlined"
              size="small"
              onClick={handleCreateDemoAdmin}
              sx={{ mt: 1 }}
            >
              Create Demo Admin Account
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default Login; 