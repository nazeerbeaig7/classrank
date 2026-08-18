import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('classrank_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await authService.getMe();
        setUser(res.data.user);
        setRole(res.data.user.role);
      } catch (err) {
        console.error('[AuthContext] Session expired or invalid token');
        logout();
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, [token]);

  const loginStudent = async (identifier, password) => {
    const res = await authService.loginStudent({ identifier, password });
    const { token: authToken, user: userData } = res.data;
    localStorage.setItem('classrank_token', authToken);
    setToken(authToken);
    setUser(userData);
    setRole('student');
    return userData;
  };

  const registerStudent = async (studentData) => {
    const res = await authService.registerStudent(studentData);
    const { token: authToken, user: userData } = res.data;
    localStorage.setItem('classrank_token', authToken);
    setToken(authToken);
    setUser(userData);
    setRole('student');
    return userData;
  };

  const loginAdmin = async (email, password) => {
    const res = await authService.loginAdmin({ email, password });
    const { token: authToken, user: userData } = res.data;
    localStorage.setItem('classrank_token', authToken);
    setToken(authToken);
    setUser(userData);
    setRole('admin');
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('classrank_token');
    setToken(null);
    setUser(null);
    setRole(null);
  };

  const refreshProfile = async () => {
    if (token) {
      const res = await authService.getMe();
      setUser(res.data.user);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        token,
        loading,
        isAuthenticated: !!user,
        isAdmin: role === 'admin',
        isStudent: role === 'student',
        loginStudent,
        registerStudent,
        loginAdmin,
        logout,
        refreshProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
