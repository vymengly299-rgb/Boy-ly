import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  Home, 
  TrendingUp, 
  Newspaper, 
  BarChart3, 
  Bell, 
  Heart, 
  Bookmark, 
  User, 
  Settings,
  LayoutDashboard,
  Eye,
  Users,
  FileText,
  Activity,
  PieChart,
  AlertTriangle
} from 'lucide-react';
import Logo from '../common/Logo';

function Sidebar({ isOpen, setIsOpen, isMobile, user }) {
  const location = useLocation();
  const { theme } = useTheme();
  const [activeItem, setActiveItem] = useState(null);

  // Update active item based on current route
  useEffect(() => {
    const path = location.pathname;
    if (path.startsWith('/dashboard')) setActiveItem('dashboard');
    else if (path.startsWith('/signals')) setActiveItem('signals');
    else if (path.startsWith('/news')) setActiveItem('news');
    else if (path.startsWith('/charts')) setActiveItem('charts');
    else if (path.startsWith('/alerts')) setActiveItem('alerts');
    else if (path.startsWith('/watchlist')) setActiveItem('watchlist');
    else if (path.startsWith('/favorites')) setActiveItem('favorites');
    else if (path.startsWith('/bookmarks')) setActiveItem('bookmarks');
    else if (path.startsWith('/profile')) setActiveItem('profile');
    else if (path.startsWith('/settings')) setActiveItem('settings');
    else if (path.startsWith('/admin')) setActiveItem('admin');
    else setActiveItem('dashboard');
  }, [location]);

  // Close sidebar when clicking outside (mobile)
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isMobile && isOpen && !e.target.closest('.sidebar')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile, isOpen, setIsOpen]);

  // Navigation items
  const mainNavItems = [
    { 
      name: 'Dashboard', 
      href: '/dashboard', 
      icon: LayoutDashboard,
      key: 'dashboard'
    },
    { 
      name: 'Signals', 
      href: '/signals', 
      icon: TrendingUp,
      key: 'signals'
    },
    { 
      name: 'News', 
      href: '/news', 
      icon: Newspaper,
      key: 'news'
    },
    { 
      name: 'Charts', 
      href: '/charts', 
      icon: BarChart3,
      key: 'charts'
    },
    { 
      name: 'Alerts', 
      href: '/alerts', 
      icon: Bell,
      key: 'alerts'
    },
  ];

  const userNavItems = [
    { 
      name: 'Watchlist', 
      href: '/watchlist', 
      icon: Eye,
      key: 'watchlist'
    },
    { 
      name: 'Favorites', 
      href: '/favorites', 
      icon: Heart,
      key: 'favorites'
    },
    { 
      name: 'Bookmarks', 
      href: '/bookmarks', 
      icon: Bookmark,
      key: 'bookmarks'
    },
  ];

  const adminNavItems = [
    { 
      name: 'Admin Dashboard', 
      href: '/admin/dashboard', 
      icon: LayoutDashboard,
      key: 'admin-dashboard'
    },
    { 
      name: 'Users', 
      href: '/admin/users', 
      icon: Users,
      key: 'admin-users'
    },
    { 
      name: 'Signals', 
      href: '/admin/signals', 
      icon: TrendingUp,
      key: 'admin-signals'
    },
    { 
      name: 'News', 
      href: '/admin/news', 
      icon: Newspaper,
      key: 'admin-news'
    },
    { 
      name: 'Reports', 
      href: '/admin/reports', 
      icon: FileText,
      key: 'admin-reports'
    },
    { 
      name: 'Settings', 
      href: '/admin/settings', 
      icon: Settings,
      key: 'admin-settings'
    },
  ];

  const bottomNavItems = [
    { 
      name: 'Profile', 
      href: '/profile', 
      icon: User,
      key: 'profile'
    },
    { 
      name: 'Settings', 
      href: '/settings', 
      icon: Settings,
      key: 'settings'
    },
  ];

  // Check if item is active
  const isActive = (key) => activeItem === key;

  // Sidebar classes
  const sidebarClasses = `fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out sidebar`;

  // Close sidebar on mobile
  const handleClose = () => {
    if (isMobile) {
      setIsOpen(false);
    }
  };

  return (
    <aside className={sidebarClasses} style={{ transform: isOpen ? 'translateX(0)' : 'translateX(-100%)' }}>
      {/* Sidebar header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
        <Link to="/dashboard" onClick={handleClose} className="flex items-center space-x-2">
          <Logo className="h-8 w-auto" />
          <span className="text-xl font-bold text-gray-900 dark:text-gray-100">Boy-ly</span>
        </Link>
        
        {/* Close button for mobile */}
        {isMobile && (
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex flex-col h-[calc(100vh-4rem)] p-4">
        {/* Main navigation */}
        <div className="flex-1 space-y-1">
          <p className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Main
          </p>
          
          <ul className="space-y-1">
            {mainNavItems.map((item) => (
              <li key={item.key}>
                <Link 
                  to={item.href} 
                  onClick={handleClose}
                  className={`flex items-center space-x-3 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    isActive(item.key) 
                      ? 'bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-400' 
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
                >
                  <item.icon size={20} />
                  <span>{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>

          {/* User section */}
          <p className="px-4 py-2 mt-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Personal
          </p>
          
          <ul className="space-y-1">
            {userNavItems.map((item) => (
              <li key={item.key}>
                <Link 
                  to={item.href} 
                  onClick={handleClose}
                  className={`flex items-center space-x-3 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    isActive(item.key) 
                      ? 'bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-400' 
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
                >
                  <item.icon size={20} />
                  <span>{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>

          {/* Admin section */}
          {user?.role === 'admin' && (
            <>
              <p className="px-4 py-2 mt-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Admin
              </p>
              
              <ul className="space-y-1">
                {adminNavItems.map((item) => (
                  <li key={item.key}>
                    <Link 
                      to={item.href} 
                      onClick={handleClose}
                      className={`flex items-center space-x-3 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
                        isActive(item.key) 
                          ? 'bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-400' 
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
                      }`}
                    >
                      <item.icon size={20} />
                      <span>{item.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        {/* Bottom navigation */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <ul className="space-y-1">
            {bottomNavItems.map((item) => (
              <li key={item.key}>
                <Link 
                  to={item.href} 
                  onClick={handleClose}
                  className={`flex items-center space-x-3 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    isActive(item.key) 
                      ? 'bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-400' 
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
                >
                  <item.icon size={20} />
                  <span>{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </aside>
  );
}

export default Sidebar;
