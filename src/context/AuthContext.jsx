import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { getAuthSession } from '../data/mockDb';
import * as authApi from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getAuthSession());

  const verifySession = useCallback(() => {
    const valid = getAuthSession();
    setUser((prev) => {
      if (!valid) return null;
      if (prev && prev.id === valid.id && prev.email === valid.email && prev.name === valid.name) {
        return prev;
      }
      return valid;
    });
    return valid;
  }, []);

  useEffect(() => {
    const handleStorage = () => {
      verifySession();
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [verifySession]);

  const login = useCallback(async (credentials) => {
    const loggedIn = await authApi.login(credentials);
    setUser(loggedIn);
    return loggedIn;
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    setUser(null);
  }, []);

  const updateUserProfile = useCallback(async (data) => {
    const updated = await authApi.updateProfile(data);
    setUser(updated);
    return updated;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        verifySession,
        login,
        logout,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
