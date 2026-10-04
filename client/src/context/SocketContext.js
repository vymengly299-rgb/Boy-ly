import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [newSignal, setNewSignal] = useState(null);
  const [newAlert, setNewAlert] = useState(null);
  const [notifications, setNotifications] = useState([]);

  // Connect to WebSocket server
  useEffect(() => {
    if (!user || !token) return;

    // Connect to WebSocket server
    const newSocket = io(process.env.REACT_APP_WS_URL || 'http://localhost:5000', {
      auth: {
        token: token
      },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      transports: ['websocket']
    });

    // Connection events
    newSocket.on('connect', () => {
      console.log('WebSocket connected');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      setIsConnected(false);
    });

    // Handle new signals
    newSocket.on('NEW_SIGNAL', (data) => {
      console.log('New signal received:', data);
      setNewSignal(data);
      
      // Show notification
      toast.success(`New ${data.signalType.toUpperCase()} signal: ${data.symbol}`);
      
      // Add to notifications
      setNotifications(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          type: 'signal',
          title: `New ${data.signalType.toUpperCase()} Signal`,
          message: `${data.symbol}: $${data.entryPrice}`,
          data: data,
          timestamp: new Date().toISOString(),
          read: false
        }
      ]);
    });

    // Handle price alerts
    newSocket.on('PRICE_ALERT', (data) => {
      console.log('Price alert received:', data);
      setNewAlert(data);
      
      toast.info(`Price alert: ${data.symbol} is now ${data.condition} $${data.value}`);
      
      setNotifications(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          type: 'price_alert',
          title: `Price Alert: ${data.symbol}`,
          message: `${data.symbol} is now ${data.condition} $${data.value}`,
          data: data,
          timestamp: new Date().toISOString(),
          read: false
        }
      ]);
    });

    // Handle news alerts
    newSocket.on('NEWS_ALERT', (data) => {
      console.log('News alert received:', data);
      
      toast.info(`Breaking news: ${data.title}`);
      
      setNotifications(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          type: 'news',
          title: `Breaking News: ${data.category}`,
          message: data.title,
          data: data,
          timestamp: new Date().toISOString(),
          read: false
        }
      ]);
    });

    // Handle broadcast notifications
    newSocket.on('BROADCAST', (data) => {
      console.log('Broadcast received:', data);
      
      toast.info(data.title || 'New announcement');
      
      setNotifications(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          type: 'broadcast',
          title: data.title || 'Announcement',
          message: data.message || '',
          data: data,
          timestamp: new Date().toISOString(),
          read: false
        }
      ]);
    });

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      newSocket.disconnect();
      setSocket(null);
      setIsConnected(false);
    };
  }, [user, token]);

  // Subscribe to user-specific channels
  useEffect(() => {
    if (!socket || !user) return;

    // Subscribe to user's watchlist
    socket.emit('subscribe', { type: 'watchlist', userId: user._id });
    
    // Subscribe to user's alerts
    socket.emit('subscribe', { type: 'alerts', userId: user._id });

    return () => {
      if (socket) {
        socket.emit('unsubscribe', { type: 'watchlist', userId: user._id });
        socket.emit('unsubscribe', { type: 'alerts', userId: user._id });
      }
    };
  }, [socket, user]);

  // Mark notification as read
  const markNotificationAsRead = useCallback((id) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  }, []);

  // Mark all notifications as read
  const markAllNotificationsAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  }, []);

  // Clear notifications
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Subscribe to symbol
  const subscribeToSymbol = useCallback((symbol) => {
    if (socket) {
      socket.emit('subscribe', { type: 'symbol', symbol: symbol.toUpperCase() });
    }
  }, [socket]);

  // Unsubscribe from symbol
  const unsubscribeFromSymbol = useCallback((symbol) => {
    if (socket) {
      socket.emit('unsubscribe', { type: 'symbol', symbol: symbol.toUpperCase() });
    }
  }, [socket]);

  const value = {
    socket,
    isConnected,
    newSignal,
    newAlert,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearNotifications,
    subscribeToSymbol,
    unsubscribeFromSymbol
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
