import { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../services/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  sendEmailVerification
} from 'firebase/auth';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  const clearError = () => setAuthError(null);

  const signup = async (email, password) => {
  clearError();
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await sendEmailVerification(userCredential.user);
    await signOut(auth); // Immediately log out after signup
    return userCredential;
  } catch (error) {
    setAuthError(error.code);
    throw error;
  }
};

  const login = async (email, password) => {
  clearError();
  try {
    // 1. Attempt Firebase authentication
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // 2. Force refresh of user data
    await firebaseUser.reload(); // Critical for fresh verification status

    // 3. Double-check email verification
    if (!firebaseUser.emailVerified) {
      await signOut(auth);
      throw { 
        code: 'auth/email-not-verified',
        message: 'Email not verified. Please check your inbox.' 
      };
    }

    // 4. Additional security checks (optional)
    if (firebaseUser.disabled) {
      throw { code: 'auth/user-disabled' };
    }

    // 5. Update application state
    setUser(firebaseUser);
    return userCredential;

  } catch (error) {
    console.error('Login error:', error.code);
    
    // Special handling for email-not-verified
    if (error.code === 'auth/email-not-verified') {
      await sendEmailVerification(auth.currentUser);
    }

    setAuthError(error.code);
    throw error;
  }
};

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      return true;
    } catch (error) {
      setAuthError(error.code);
      return false;
    }
  };

  useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
    setUser(currentUser);
    setLoading(false);
  });
  return unsubscribe;
}, []);

  return (
  <AuthContext.Provider value={{
    user,
    signup,
    login,
    logout,
    loading,
    authError,
    clearError
    // Remove setPendingSignup from here
  }}>
    {!loading && children}
  </AuthContext.Provider>
);
}

export function useAuth() {
  return useContext(AuthContext);
}