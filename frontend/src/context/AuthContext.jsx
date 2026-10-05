import React, { createContext, useState, useEffect, useContext } from 'react';
import { io } from 'socket.io-client';
import { getMeApi, getNotificationsApi } from '../api';

const AuthContext = createContext();

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('fitmirror_token') || null);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [toastNotification, setToastNotification] = useState(null);

  // Initialize Socket.io connection when user logs in
  useEffect(() => {
    if (user && token) {
      const newSocket = io(SOCKET_URL, {
        withCredentials: true,
      });

      newSocket.on('connect', () => {
        console.log('[Socket] Connected to server:', newSocket.id);
        newSocket.emit('join', user._id);
      });

      newSocket.on('notification', (newNotif) => {
        console.log('[Socket] Received notification:', newNotif);
        setNotifications((prev) => [newNotif, ...prev]);
        setToastNotification(newNotif);

        // Auto hide toast after 5 seconds
        setTimeout(() => {
          setToastNotification(null);
        }, 5000);
      });

      setSocket(newSocket);

      // Fetch initial notifications
      getNotificationsApi()
        .then((res) => {
          if (res.data?.notifications) {
            setNotifications(res.data.notifications);
          }
        })
        .catch((err) => console.log('Error fetching notifications:', err.message));

      return () => {
        newSocket.disconnect();
      };
    }
  }, [user, token]);

  // Load user profile on mount if token exists
  useEffect(() => {
    if (token) {
      getMeApi()
        .then((res) => {
          setUser(res.data.user);
        })
        .catch(() => {
          logout();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = (userData, authToken) => {
    localStorage.setItem('fitmirror_token', authToken);
    setToken(authToken);
    setUser(userData);
  };

  const register = (userData, authToken) => {
    localStorage.setItem('fitmirror_token', authToken);
    setToken(authToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('fitmirror_token');
    setToken(null);
    setUser(null);
    if (socket) socket.disconnect();
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        socket,
        notifications,
        toastNotification,
        setToastNotification,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
