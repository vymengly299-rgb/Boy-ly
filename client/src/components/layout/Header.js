import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Bell, Search, User, Settings, Sun, Moon, LogOut } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import Logo from '../common/Logo';
import NotificationDropdown from '../common/NotificationDropdown';
import SearchBar from '../common/SearchBar';

function Header({ isSidebarOpen, setIsSidebarOpen, isMobile, user, theme, toggleTheme, onLogout }) {
  const navigate = useNavigate();
  const { notifications } = useSocket();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Count unread notifications
  useEffect(() => {
    const count = notifications.filter(n => !n.read).length;
    setUnreadCount(count);
  }, [notifications]);

  // Toggle sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Navigate to dashboard
  const goToDashboard = () => {
    navigate('/dashboard');
  };

  // Navigate to profile
  const goToProfile = () => {
    navigate('/profile');
    setIsProfileOpen(false);
  };

  // Navigate to settings
  const goToSettings = () => {
    navigate('/settings');
    setIsProfileOpen(false);
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm transition-all duration-300`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side */}
          <div className="flex items-center space-x-4">
            {/* Mobile menu button */}
            {isMobile && (
              <button 
                onClick={toggleSidebar}
                className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100 transition-colors duration-200"
              >
                {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            )}

            {/* Logo */}
            <button onClick={goToDashboard} className="flex items-center space-x-2">
              <Logo className="h-8 w-auto" />
              {!isMobile && (
                <span className="text-xl font-bold text-gray-900 dark:text-gray-100">Boy-ly</span>
              )}
            </button>
          </div>

          {/* Center - Search (Desktop only) */}
          {!isMobile && (
            <div className="flex-1 max-w-2xl mx-8">
              <SearchBar 
                isOpen={isSearchOpen} 
                setIsOpen={setIsSearchOpen}
                placeholder="Search signals, news, symbols..."
              />
            </div>
          )}

          {/* Right side */}
          <div className="flex items-center space-x-2">
            {/* Theme toggle */}
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100 transition-colors duration-200"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Notification bell */}
            <button 
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className="relative p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100 transition-colors duration-200"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification dropdown */}
            <NotificationDropdown 
              isOpen={isNotificationOpen} 
              setIsOpen={setIsNotificationOpen}
              notifications={notifications}
            />

            {/* User profile dropdown */}
            {user && (
              <>
                <button 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100 transition-colors duration-200"
                >
                  <User size={20} />
                  {!isMobile && (
                    <span className="text-sm font-medium">{user.firstName || user.username}</span>
                  )}
                </button>

                {/* Profile dropdown */}
                <div 
                  className={`absolute top-14 right-4 z-50 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-1 border border-gray-200 dark:border-gray-700 transition-opacity duration-300 ${
                    isProfileOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
                  }`}
                >
                  <button 
                    onClick={goToProfile}
                    className="w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                  >
                    <User size={16} />
                    <span>Profile</span>
                  </button>
                  
                  <button 
                    onClick={goToSettings}
                    className="w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                  >
                    <Settings size={16} />
                    <span>Settings</span>
                  </button>
                  
                  <button 
                    onClick={() => {
                      onLogout();
                      setIsProfileOpen(false);
                    }}
                    className="w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 flex items-center space-x-2"
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            )}

            {/* Mobile search button */}
            {isMobile && (
              <button 
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100 transition-colors duration-200"
              >
                <Search size={20} />
              </button>
            )}
          </div>
        </div>

        {/* Mobile search bar */}
        {isMobile && isSearchOpen && (
          <div className="absolute top-16 left-0 right-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4">
            <SearchBar 
              isOpen={isSearchOpen} 
              setIsOpen={setIsSearchOpen}
              placeholder="Search signals, news..."
              autoFocus
            />
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
