export interface Consultant {
  id: string;
  name: string;
  specialty: string;
  experience: string;
  rating: number;
  image: string;
  availableHours: string[];
}

export interface Appointment {
  id: string;
  consultantId: string;
  consultantName: string;
  date: Date;
  time: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  createdAt: Date;
  emailVerified?: boolean;
  role?: 'user' | 'admin';
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
} 