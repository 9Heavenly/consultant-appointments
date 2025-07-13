const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { initializeApp } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore } = require("firebase-admin/firestore");

// Initialize Firebase Admin SDK
initializeApp();

/**
 * Cloud Function to delete a user from Firebase Authentication
 * This function can be called from the client app to delete users
 */
exports.deleteUser = onCall({ 
  region: "us-central1",
  maxInstances: 10
}, async (request) => {
  // Check if the request is authenticated
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "User must be authenticated");
  }

  // Check if the user is an admin by checking their Firestore document
  const userDoc = await getFirestore().collection("users").doc(request.auth.uid).get();
  if (!userDoc.exists || userDoc.data().role !== "admin") {
    throw new HttpsError("permission-denied", "Admin access required");
  }

  const { email } = request.data;

  if (!email) {
    throw new HttpsError("invalid-argument", "Email is required");
  }

  try {
    // Find user by email
    const userRecord = await getAuth().getUserByEmail(email);
    
    // Delete the user from Authentication
    await getAuth().deleteUser(userRecord.uid);
    
    // Also delete from Firestore if needed
    try {
      await getFirestore().collection("users").doc(userRecord.uid).delete();
    } catch (firestoreError) {
      console.log("User not found in Firestore or already deleted:", firestoreError.message);
    }

    return {
      success: true,
      message: `User ${email} deleted successfully`,
      uid: userRecord.uid
    };
  } catch (error) {
    console.error("Error deleting user:", error);
    
    if (error.code === "auth/user-not-found") {
      throw new HttpsError("not-found", "User not found in Authentication");
    }
    
    throw new HttpsError("internal", `Failed to delete user: ${error.message}`);
  }
});

/**
 * Cloud Function to get all users (for admin dashboard)
 */
exports.getUsers = onCall({ 
  region: "us-central1",
  maxInstances: 10
}, async (request) => {
  // Check if the request is authenticated
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "User must be authenticated");
  }

  // Check if the user is an admin by checking their Firestore document
  const userDoc = await getFirestore().collection("users").doc(request.auth.uid).get();
  if (!userDoc.exists || userDoc.data().role !== "admin") {
    throw new HttpsError("permission-denied", "Admin access required");
  }

  try {
    // List all users (limited to 1000 for performance)
    const listUsersResult = await getAuth().listUsers(1000);
    
    return {
      success: true,
      users: listUsersResult.users.map(user => ({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        emailVerified: user.emailVerified,
        disabled: user.disabled,
        createdAt: user.metadata.creationTime,
        lastSignIn: user.metadata.lastSignInTime
      }))
    };
  } catch (error) {
    console.error("Error listing users:", error);
    throw new HttpsError("internal", `Failed to list users: ${error.message}`);
  }
});
