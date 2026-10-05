import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

let app = null;
let auth = null;
let isConfigured = false;

if (firebaseConfig.apiKey && firebaseConfig.projectId) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    isConfigured = true;
  } catch (err) {
    console.warn('[Firebase Frontend] Warning during initialization:', err.message);
  }
}

/**
 * Authenticates user with Firebase Email/Password Auth & returns Firebase ID Token
 */
export const loginWithFirebaseEmail = async (email, password) => {
  if (!isConfigured || !auth) {
    throw new Error('Firebase Auth is not configured. Add VITE_FIREBASE_* credentials to frontend .env file.');
  }

  let userCredential;
  try {
    userCredential = await signInWithEmailAndPassword(auth, email, password);
  } catch (err) {
    if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
      // Auto-create Firebase account if it does not exist yet
      userCredential = await createUserWithEmailAndPassword(auth, email, password);
    } else {
      throw err;
    }
  }

  const idToken = await userCredential.user.getIdToken();
  return idToken;
};

export { app, auth, isConfigured };
