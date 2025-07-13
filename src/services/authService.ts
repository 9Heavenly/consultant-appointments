import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
  User as FirebaseUser,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { User, LoginCredentials, SignUpCredentials } from '../types';

export class AuthService {
  // Sign up with email validation
  static async signup(credentials: SignUpCredentials): Promise<User> {
    try {
      console.log('Starting signup process...', { email: credentials.email });
      
      // Check if user already exists
      const existingUser = await this.checkUserExists(credentials.email);
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      console.log('Creating Firebase user...');
      // Create user with Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );

      const firebaseUser = userCredential.user;
      console.log('Firebase user created:', firebaseUser.uid);

      // Send email verification
      console.log('Sending email verification...');
      await sendEmailVerification(firebaseUser);

      // Create user profile in Firestore
      const userData: User = {
        id: firebaseUser.uid,
        email: credentials.email,
        name: credentials.name,
        phone: credentials.phone || '',
        createdAt: new Date(),
        emailVerified: false,
      };

      console.log('Storing user data in Firestore...');
      // Store user data in Firestore
      await setDoc(doc(db, 'users', firebaseUser.uid), userData);

      // Update Firebase user profile
      await updateProfile(firebaseUser, {
        displayName: credentials.name,
      });

      console.log('Signup completed successfully');
      return userData;
    } catch (error: any) {
      console.error('Signup error:', error);
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('User with this email already exists');
      } else if (error.code === 'auth/weak-password') {
        throw new Error('Password should be at least 6 characters');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Please enter a valid email address');
      } else if (error.code === 'auth/invalid-credential') {
        throw new Error('Invalid credentials. Please check your Firebase configuration.');
      } else {
        throw new Error(error.message || 'Signup failed');
      }
    }
  }

  // Login with email validation
  static async login(credentials: LoginCredentials): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );

      const firebaseUser = userCredential.user;

      // Get user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      
      if (!userDoc.exists()) {
        throw new Error('User profile not found');
      }

      const userData = userDoc.data() as User;

      // Skip email verification for demo admin account
      if (credentials.email === 'admin@example.com') {
        return userData;
      }

      // Check if email is verified for other users
      if (!firebaseUser.emailVerified) {
        throw new Error('Please verify your email before logging in. Check your inbox for a verification link.');
      }

      return userData;
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        throw new Error('No account found with this email');
      } else if (error.code === 'auth/wrong-password') {
        throw new Error('Incorrect password');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Please enter a valid email address');
      } else if (error.code === 'auth/too-many-requests') {
        throw new Error('Too many failed attempts. Please try again later');
      } else {
        throw new Error(error.message || 'Login failed');
      }
    }
  }

  // Logout
  static async logout(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error: any) {
      throw new Error('Logout failed');
    }
  }

  // Check if user exists
  static async checkUserExists(email: string): Promise<boolean> {
    try {
      const q = query(collection(db, 'users'), where('email', '==', email));
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      return false;
    }
  }

  // Get current user
  static async getCurrentUser(): Promise<User | null> {
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) {
        return null;
      }

      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (!userDoc.exists()) {
        return null;
      }

      return userDoc.data() as User;
    } catch (error) {
      return null;
    }
  }

  // Update user profile
  static async updateUserProfile(userId: string, updates: Partial<User>): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, updates);
    } catch (error: any) {
      throw new Error('Failed to update profile');
    }
  }

  // Resend email verification
  static async resendEmailVerification(): Promise<void> {
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) {
        throw new Error('No user logged in');
      }

      await sendEmailVerification(firebaseUser);
    } catch (error: any) {
      throw new Error('Failed to send verification email');
    }
  }

  // Send password reset email
  static async sendPasswordResetEmail(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        throw new Error('No account found with this email address');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Please enter a valid email address');
      } else {
        throw new Error('Failed to send password reset email');
      }
    }
  }

  // Manually verify user email (admin function)
  static async verifyUserEmail(userId: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        emailVerified: true
      });
    } catch (error: any) {
      throw new Error('Failed to verify user email');
    }
  }

  // Resend verification email to user (admin function)
  static async resendVerificationEmailToUser(userId: string): Promise<void> {
    try {
      // Get user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) {
        throw new Error('User not found');
      }

      const userData = userDoc.data() as User;
      
      // Note: Firebase Auth requires the user to be logged in to resend verification email
      // This is a security limitation. The user needs to login first and then request resend
      throw new Error('User must login first to resend verification email. Please ask the user to login and use the "Resend Verification" option.');
    } catch (error: any) {
      throw new Error('Failed to resend verification email');
    }
  }

  // Check and update email verification status
  static async checkEmailVerificationStatus(userId: string): Promise<boolean> {
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) {
        throw new Error('No user logged in');
      }

      // Reload user to get latest verification status
      await firebaseUser.reload();
      
      // Update Firestore if email is now verified
      if (firebaseUser.emailVerified) {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
          emailVerified: true
        });
        return true;
      }
      
      return false;
    } catch (error: any) {
      throw new Error('Failed to check email verification status');
    }
  }

  // Force clear email from both Auth and Firestore (admin function)
  static async forceClearEmail(email: string): Promise<void> {
    try {
      // Check if user exists in Firestore
      const q = query(collection(db, 'users'), where('email', '==', email));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        // Delete from Firestore
        const userDoc = querySnapshot.docs[0];
        await deleteDoc(doc(db, 'users', userDoc.id));
        console.log('Deleted user from Firestore:', email);
      }

      // Note: We cannot directly delete from Firebase Auth without admin SDK
      // The user will need to be deleted manually from Firebase Console
      console.log('Please manually delete the user from Firebase Console Authentication if needed');
    } catch (error: any) {
      throw new Error('Failed to clear email');
    }
  }

  // Listen to auth state changes
  static onAuthStateChanged(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            callback(userDoc.data() as User);
          } else {
            callback(null);
          }
        } catch (error) {
          callback(null);
        }
      } else {
        callback(null);
      }
    });
  }

  // Create demo admin account
  static async createDemoAdmin(): Promise<void> {
    try {
      console.log('Creating demo admin account...');
      
      // Create user with Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        'admin@example.com',
        'admin123'
      );

      const firebaseUser = userCredential.user;
      console.log('Demo admin Firebase user created:', firebaseUser.uid);

      // Create admin profile in Firestore
      const adminData: User = {
        id: firebaseUser.uid,
        email: 'admin@example.com',
        name: 'Admin User',
        phone: '',
        createdAt: new Date(),
        emailVerified: true, // Set to true for demo
        role: 'admin'
      };

      // Store admin data in Firestore
      await setDoc(doc(db, 'users', firebaseUser.uid), adminData);

      // Update Firebase user profile
      await updateProfile(firebaseUser, {
        displayName: 'Admin User',
      });

      console.log('Demo admin account created successfully');
    } catch (error: any) {
      console.error('Demo admin creation error:', error);
      if (error.code === 'auth/email-already-in-use') {
        console.log('Demo admin account already exists');
        // Update existing admin account to be verified
        try {
          const existingUser = await this.getCurrentUser();
          if (existingUser) {
            await this.updateUserProfile(existingUser.id, {
              emailVerified: true,
              role: 'admin'
            });
            console.log('Updated existing admin account');
          }
        } catch (updateError) {
          console.error('Failed to update existing admin account:', updateError);
        }
      } else {
        throw new Error('Failed to create demo admin account');
      }
    }
  }
} 