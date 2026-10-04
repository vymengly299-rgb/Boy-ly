import { createContext, useContext, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { alertService } from '../services/alertService';
import { useAuth } from './AuthContext';

const AlertContext = createContext(null);

export const AlertProvider = ({ children }) => {
  const { user, getAuthHeaders } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all alerts
  const fetchAlerts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await alertService.getAllAlerts(getAuthHeaders());
      setAlerts(response.data.data);
      
      return response.data;
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to fetch alerts';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [getAuthHeaders]);

  // Create alert
  const createAlert = useCallback(async (alertData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await alertService.createAlert(alertData, getAuthHeaders());
      setAlerts(prev => [response.data.data, ...prev]);
      
      toast.success('Alert created successfully');
      return response.data;
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to create alert';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [getAuthHeaders]);

  // Update alert
  const updateAlert = useCallback(async (id, alertData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await alertService.updateAlert(id, alertData, getAuthHeaders());
      setAlerts(prev => 
        prev.map(alert => alert._id === id ? response.data.data : alert)
      );
      
      toast.success('Alert updated successfully');
      return response.data;
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to update alert';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [getAuthHeaders]);

  // Delete alert
  const deleteAlert = useCallback(async (id) => {
    try {
      setIsLoading(true);
      setError(null);
      
      await alertService.deleteAlert(id, getAuthHeaders());
      setAlerts(prev => prev.filter(alert => alert._id !== id));
      
      toast.success('Alert deleted successfully');
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to delete alert';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [getAuthHeaders]);

  // Create price alert
  const createPriceAlert = useCallback(async (symbol, condition, value, value2 = null) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const alertData = {
        type: 'price_alert',
        symbol: symbol.toUpperCase(),
        title: `${condition.toUpperCase()} alert for ${symbol}`,
        condition,
        value,
        value2: condition === 'between' ? value2 : undefined
      };
      
      const response = await alertService.createPriceAlert(alertData, getAuthHeaders());
      setAlerts(prev => [response.data.data, ...prev]);
      
      toast.success(`Price alert created for ${symbol}`);
      return response.data;
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to create price alert';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [getAuthHeaders]);

  // Create signal alert
  const createSignalAlert = useCallback(async (signalId) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const alertData = {
        type: 'signal_alert',
        signal: signalId,
        title: `Alert for signal`,
        condition: 'new_signal'
      };
      
      const response = await alertService.createSignalAlert(alertData, getAuthHeaders());
      setAlerts(prev => [response.data.data, ...prev]);
      
      toast.success('Signal alert created successfully');
      return response.data;
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to create signal alert';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [getAuthHeaders]);

  // Get active alerts
  const getActiveAlerts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await alertService.getActiveAlerts(getAuthHeaders());
      return response.data;
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to fetch active alerts';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [getAuthHeaders]);

  // Get notification preferences
  const getNotificationPreferences = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await alertService.getNotificationPreferences(getAuthHeaders());
      return response.data;
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to fetch notification preferences';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [getAuthHeaders]);

  // Update notification preferences
  const updateNotificationPreferences = useCallback(async (preferences) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await alertService.updateNotificationPreferences(preferences, getAuthHeaders());
      toast.success('Notification preferences updated');
      return response.data;
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to update notification preferences';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [getAuthHeaders]);

  // Get unread alerts count
  const getUnreadAlertsCount = useCallback(() => {
    return alerts.filter(alert => !alert.read).length;
  }, [alerts]);

  // Mark alert as read
  const markAlertAsRead = useCallback((id) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert._id === id ? { ...alert, read: true } : alert
      )
    );
  }, []);

  const value = {
    alerts,
    isLoading,
    error,
    fetchAlerts,
    createAlert,
    updateAlert,
    deleteAlert,
    createPriceAlert,
    createSignalAlert,
    getActiveAlerts,
    getNotificationPreferences,
    updateNotificationPreferences,
    getUnreadAlertsCount,
    markAlertAsRead
  };

  return (
    <AlertContext.Provider value={value}>
      {children}
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};
