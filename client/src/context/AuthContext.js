import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authService } from '../services/authService';
import { userService } from '../services/userService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');
        const storedRefreshToken = localStorage.getItem('refreshToken');
        
        if (storedToken && storedUser) {
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
          setRefreshToken(storedRefreshToken);
          
          // Verify token is still valid
          try {
            const response = await userService.getProfile();
            setUser(response.data.user);
          } catch (err) {
            // Token might be expired, try to refresh
            if (storedRefreshToken) {
              try {
                const response = await authService.refreshToken(storedRefreshToken);
                setUser(response.data.user);
                setToken(response.data.token);
                setRefreshToken(response.data.refreshToken);
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('refreshToken', response.data.refreshToken);
                localStorage.setItem('user', JSON.stringify(response.data.user));
              } catch (refreshError) {
                logout();
              }
            } else {
              logout();
            }
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = useCallback(async (email, password) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await authService.login(email, password);
      
      setUser(response.data.user);
      setToken(response.data.token);
      setRefreshToken(response.data.refreshToken);
      
      // Store in localStorage
      localStorage.setItem('user', JSON.stringify(response.data.user));
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      
      toast.success(`Welcome back, ${response.data.user.firstName || response.data.user.username}!`);
      navigate('/dashboard');
      
      return response.data.user;
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Login failed';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  // Register function
  const register = useCallback(async (userData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await authService.register(userData);
      
      setUser(response.data.user);
      setToken(response.data.token);
      setRefreshToken(response.data.refreshToken);
      
      // Store in localStorage
      localStorage.setItem('user', JSON.stringify(response.data.user));
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      
      toast.success('Registration successful! Please check your email to verify your account.');
      navigate('/dashboard');
      
      return response.data.user;
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Registration failed';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  // Logout function
  const logout = useCallback(() => {
    // Clear state
    setUser(null);
    setToken(null);
    setRefreshToken(null);
    setError(null);
    
    // Clear localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    
    // Call logout API
    authService.logout().catch(() => {});
    
    toast.success('Logged out successfully');
    navigate('/login');
  }, [navigate]);

  // Forgot password function
  const forgotPassword = useCallback(async (email) => {
    try {
      setIsLoading(true);
      setError(null);
      
      await authService.forgotPassword(email);
      toast.success('Password reset email sent. Check your inbox.');
      navigate('/login');
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to send reset email';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  // Reset password function
  const resetPassword = useCallback(async (token, password) => {
    try {
      setIsLoading(true);
      setError(null);
      
      await authService.resetPassword(token, password);
      toast.success('Password reset successful. Please login.');
      navigate('/login');
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Password reset failed';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  // Verify email function
  const verifyEmail = useCallback(async (token) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await authService.verifyEmail(token);
      
      setUser(response.data.user);
      setToken(response.data.token);
      
      // Store in localStorage
      localStorage.setItem('user', JSON.stringify(response.data.user));
      localStorage.setItem('token', response.data.token);
      
      toast.success('Email verified successfully!');
      navigate('/dashboard');
      
      return response.data.user;
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Email verification failed';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  // Update profile function
  const updateProfile = useCallback(async (profileData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await userService.updateProfile(profileData);
      
      setUser(response.data.user);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      toast.success('Profile updated successfully');
      return response.data.user;
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to update profile';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update password function
  const updatePassword = useCallback(async (currentPassword, newPassword) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await authService.updatePassword(currentPassword, newPassword);
      
      setUser(response.data.user);
      setToken(response.data.token);
      
      localStorage.setItem('user', JSON.stringify(response.data.user));
      localStorage.setItem('token', response.data.token);
      
      toast.success('Password updated successfully');
      return response.data.user;
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to update password';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Google login function
  const googleLogin = useCallback(async (credential) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await authService.googleAuth(credential);
      
      setUser(response.data.user);
      setToken(response.data.token);
      setRefreshToken(response.data.refreshToken);
      
      localStorage.setItem('user', JSON.stringify(response.data.user));
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      
      toast.success(`Welcome, ${response.data.user.firstName || response.data.user.username}!`);
      navigate('/dashboard');
      
      return response.data.user;
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Google login failed';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  // Check if user is authenticated
  const isAuthenticated = useCallback(() => {
    return !!user && !!token;
  }, [user, token]);

  // Check if user has role
  const hasRole = useCallback((role) => {
    return user?.role === role;
  }, [user]);

  // Check if user is admin
  const isAdmin = useCallback(() => {
    return user?.role === 'admin' || user?.role === 'superadmin';
  }, [user]);

  // Get auth headers
  const getAuthHeaders = useCallback(() => {
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }, [token]);

  const value = {
    user,
    token,
    refreshToken,
    isLoading,
    error,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    verifyEmail,
    updateProfile,
    updatePassword,
    googleLogin,
    isAuthenticated,
    hasRole,
    isAdmin,
    getAuthHeaders
  };

  return (
    <AuthContext.Provider value={value}>
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
