import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useSocket } from '../../context/SocketContext';
import Header from './Header';
import Sidebar from './Sidebar';
import MobileNavbar from './MobileNavbar';
import Footer from './Footer';
import NotificationCenter from '../common/NotificationCenter';

function Layout({ children }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { notifications } = useSocket();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close sidebar on route change
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location]);

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Don't show layout for auth pages
  const isAuthPage = location.pathname.startsWith('/login') ||
    location.pathname.startsWith('/register') ||
    location.pathname.startsWith('/forgot-password') ||
    location.pathname.startsWith('/reset-password') ||
    location.pathname.startsWith('/verify-email');

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className={`min-h-screen bg-${theme === 'dark' ? 'gray-900' : 'gray-50'} transition-colors duration-300`}>
      {/* Header */}
      <Header 
        isSidebarOpen={isSidebarOpen} 
        setIsSidebarOpen={setIsSidebarOpen} 
        isMobile={isMobile}
        user={user}
        theme={theme}
        toggleTheme={toggleTheme}
        onLogout={handleLogout}
      />

      {/* Sidebar */}
      {(!isMobile || isSidebarOpen) && (
        <Sidebar 
          isOpen={isSidebarOpen} 
          setIsOpen={setIsSidebarOpen} 
          isMobile={isMobile}
          user={user}
        />
      )}

      {/* Main Content */}
      <main 
        className={`min-h-screen pt-16 ${isSidebarOpen && !isMobile ? 'ml-64' : ''} transition-all duration-300`}
      >
        {children || <Outlet />}
      </main>

      {/* Mobile Navigation */}
      {isMobile && <MobileNavbar user={user} onLogout={handleLogout} />}

      {/* Notification Center */}
      <NotificationCenter notifications={notifications} />

      {/* Footer */}
      <Footer />

      {/* Sidebar overlay for mobile */}
      {isSidebarOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}

export default Layout;
