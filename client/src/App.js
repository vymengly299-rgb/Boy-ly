import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';
import Layout from './components/layout/Layout';
import AdminLayout from './components/layout/AdminLayout';
import MobileLayout from './components/layout/MobileLayout';
import 
// Public routes
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import SignalsPage from './pages/SignalsPage';
import SignalDetailPage from './pages/SignalDetailPage';
import NewsPage from './pages/NewsPage';
import NewsDetailPage from './pages/NewsDetailPage';
import ChartsPage from './pages/ChartsPage';
import PricingPage from './pages/PricingPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';

// Protected routes
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import AlertsPage from './pages/AlertsPage';
import WatchlistPage from './pages/WatchlistPage';
import SettingsPage from './pages/SettingsPage';
import NotificationsPage from './pages/NotificationsPage';

// Admin routes
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminSignalsPage from './pages/admin/AdminSignalsPage';
import AdminNewsPage from './pages/admin/AdminNewsPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import AdminReportsPage from './pages/admin/AdminReportsPage';

// Mobile routes
import MobileDashboardPage from './pages/mobile/MobileDashboardPage';
import MobileSignalsPage from './pages/mobile/MobileSignalsPage';
import MobileNewsPage from './pages/mobile/MobileNewsPage';
import MobileAlertsPage from './pages/mobile/MobileAlertsPage';

function App() {
  const { user, isLoading } = useAuth();
  const { theme } = useTheme();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center bg-${theme === 'dark' ? 'gray-900' : 'gray-50'}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Determine layout based on route and user role
  const getLayout = (children) => {
    const isAdminRoute = location.pathname.startsWith('/admin');
    const isMobileRoute = location.pathname.startsWith('/mobile');
    
    if (isAdminRoute && user?.role === 'admin') {
      return <AdminLayout>{children}</AdminLayout>;
    }
    
    if (isMobileRoute || isMobile) {
      return <MobileLayout>{children}</MobileLayout>;
    }
    
    return <Layout>{children}</Layout>;
  };

  // Protected route component
  const ProtectedRoute = ({ children }) => {
    if (!user) {
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
    return children;
  };

  // Admin route component
  const AdminRoute = ({ children }) => {
    if (!user) {
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
    if (user.role !== 'admin' && user.role !== 'superadmin') {
      return <Navigate to="/dashboard" replace />;
    }
    return children;
  };

  // Public route component (redirect if already logged in)
  const PublicRoute = ({ children }) => {
    if (user) {
      return <Navigate to="/dashboard" replace />;
    }
    return children;
  };

  return (
    <div className={`min-h-screen bg-${theme === 'dark' ? 'gray-900' : 'gray-50'}`}>
      <Toaster 
        position="top-right" 
        toastOptions={{
          duration: 4000,
          style: {
            background: theme === 'dark' ? '#374151' : '#fff',
            color: theme === 'dark' ? '#fff' : '#374151',
          },
        }}
      />
      
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={getLayout(<HomePage />)} />
        <Route path="/signals" element={getLayout(<SignalsPage />)} />
        <Route path="/signals/:id" element={getLayout(<SignalDetailPage />)} />
        <Route path="/news" element={getLayout(<NewsPage />)} />
        <Route path="/news/:id" element={getLayout(<NewsDetailPage />)} />
        <Route path="/charts" element={getLayout(<ChartsPage />)} />
        <Route path="/pricing" element={getLayout(<PricingPage />)} />
        <Route path="/about" element={getLayout(<AboutPage />)} />
        <Route path="/contact" element={getLayout(<ContactPage />)} />
        
        {/* Auth Routes */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={getLayout(<LoginPage />)} />
          <Route path="/register" element={getLayout(<RegisterPage />)} />
          <Route path="/forgot-password" element={getLayout(<ForgotPasswordPage />)} />
          <Route path="/reset-password/:token" element={getLayout(<ResetPasswordPage />)} />
          <Route path="/verify-email/:token" element={getLayout(<VerifyEmailPage />)} />
        </Route>
        
        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={getLayout(<DashboardPage />)} />
          <Route path="/profile" element={getLayout(<ProfilePage />)} />
          <Route path="/alerts" element={getLayout(<AlertsPage />)} />
          <Route path="/watchlist" element={getLayout(<WatchlistPage />)} />
          <Route path="/settings" element={getLayout(<SettingsPage />)} />
          <Route path="/notifications" element={getLayout(<NotificationsPage />)} />
        </Route>
        
        {/* Admin Routes */}
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={getLayout(<AdminDashboardPage />)} />
          <Route path="/admin/dashboard" element={getLayout(<AdminDashboardPage />)} />
          <Route path="/admin/users" element={getLayout(<AdminUsersPage />)} />
          <Route path="/admin/signals" element={getLayout(<AdminSignalsPage />)} />
          <Route path="/admin/news" element={getLayout(<AdminNewsPage />)} />
          <Route path="/admin/settings" element={getLayout(<AdminSettingsPage />)} />
          <Route path="/admin/reports" element={getLayout(<AdminReportsPage />)} />
        </Route>
        
        {/* Mobile Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/mobile" element={getLayout(<MobileDashboardPage />)} />
          <Route path="/mobile/dashboard" element={getLayout(<MobileDashboardPage />)} />
          <Route path="/mobile/signals" element={getLayout(<MobileSignalsPage />)} />
          <Route path="/mobile/news" element={getLayout(<MobileNewsPage />)} />
          <Route path="/mobile/alerts" element={getLayout(<MobileAlertsPage />)} />
        </Route>
        
        {/* 404 Route */}
        <Route path="*" element={getLayout(<div>404 - Page Not Found</div>)} />
      </Routes>
    </div>
  );
}

export default App;
