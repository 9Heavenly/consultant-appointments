# Firebase Setup Guide for Consultant Appointment App

## Step 1: Create Firebase Project

### 1.1 Go to Firebase Console
- Visit [https://console.firebase.google.com/](https://console.firebase.google.com/)
- Click "Create a project" or "Add project"

### 1.2 Project Setup
- **Project name**: `consultant-appointments` (or your preferred name)
- **Enable Google Analytics**: Optional (recommended for production)
- Click "Create project"

### 1.3 Project Configuration
- Wait for project creation to complete
- Click "Continue" when ready

## Step 2: Enable Authentication

### 2.1 Navigate to Authentication
- In the left sidebar, click "Authentication"
- Click "Get started"

### 2.2 Configure Sign-in Methods
- Click on "Email/Password" in the sign-in providers list
- **Enable** Email/Password authentication
- **Enable** Email link (passwordless sign-in) - Optional
- Click "Save"

### 2.3 Configure Email Templates (Optional)
- Go to "Templates" tab
- Customize verification email template
- Update sender name and email if needed

## Step 3: Set Up Firestore Database

### 3.1 Create Database
- In the left sidebar, click "Firestore Database"
- Click "Create database"

### 3.2 Choose Security Rules
- Select "Start in test mode" (we'll update rules later)
- Click "Next"

### 3.3 Choose Location
- Select a location close to your users
- Click "Done"

### 3.4 Set Up Security Rules
- Go to "Rules" tab
- Replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Appointments - users can read/write their own appointments
    match /appointments/{appointmentId} {
      allow read, write: if request.auth != null && 
        (request.auth.uid == resource.data.userId || 
         request.auth.uid == resource.data.consultantId);
    }
    
    // Consultants - anyone can read, only admins can write
    match /consultants/{consultantId} {
      allow read: if true;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

## Step 4: Get Project Credentials

### 4.1 Project Settings
- Click the gear icon (⚙️) next to "Project Overview"
- Select "Project settings"

### 4.2 Web App Configuration
- Scroll down to "Your apps" section
- Click the web icon (</>)
- **App nickname**: `consultant-appointments-web`
- **Enable Firebase Hosting**: Optional
- Click "Register app"

### 4.3 Copy Configuration
- Copy the Firebase config object
- It looks like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

## Step 5: Update Your App

### 5.1 Update Firebase Config
- Open `src/firebase/config.ts`
- Replace the placeholder config with your real credentials

### 5.2 Test the Setup
- Start your app: `npm start`
- Try creating a new account
- Check your email for verification link
- Test login functionality

## Step 6: Production Considerations

### 6.1 Security Rules
- Update Firestore rules for production
- Enable additional security features

### 6.2 Email Templates
- Customize email templates for your brand
- Set up custom domain for emails

### 6.3 Monitoring
- Set up Firebase Analytics
- Configure error reporting

## Troubleshooting

### Common Issues:
1. **"Firebase App named '[DEFAULT]' already exists"**
   - Solution: Check if Firebase is initialized multiple times

2. **"Permission denied" errors**
   - Solution: Update Firestore security rules

3. **Email verification not working**
   - Solution: Check Firebase Authentication settings

4. **"Invalid API key"**
   - Solution: Verify your Firebase config credentials

### Support:
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Support](https://firebase.google.com/support)

## Next Steps

After setup, you can:
1. Add password reset functionality
2. Create admin dashboard
3. Add social login (Google, Facebook)
4. Set up email notifications
5. Add payment integration 