import React, { createContext, useState, useCallback, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check initial authentication status upon loading application by verifying HttpOnly cookie validity
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await api.get('/api/auth/me');
        if (data && data.data && data.data.user) {
          setIsLoggedIn(true);
          setUser(data.data.user);
        } else if (data && data.user) {
          setIsLoggedIn(true);
          setUser(data.user);
        }
      } catch (error) {
        // Soft fail if unauthenticated, cookie invalid
        setIsLoggedIn(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/api/auth/login', { email, password });
    setIsLoggedIn(true);
    setUser(data.user);
    return data;
  }, []);

  const register = useCallback(async (userData) => {
    const { data } = await api.post('/api/auth/register', userData);
    setIsLoggedIn(true);
    setUser(data.user);

    try {
      const rawGuestLinks = localStorage.getItem('beakon_guest_links');
      const guestLinks = rawGuestLinks ? JSON.parse(rawGuestLinks) : [];
      const shortCodes = Array.isArray(guestLinks)
        ? guestLinks.map((link) => link?.shortCode).filter(Boolean)
        : [];

      if (shortCodes.length > 0) {
        await api.post('/api/links/claim', { shortCodes });
        localStorage.removeItem('beakon_guest_links');
      }
    } catch (claimError) {
      console.error('Guest link claim failed after registration:', claimError);
    }

    return data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout request failed:', error);
    } finally {
      setIsLoggedIn(false);
      setUser(null);
    }
  }, []);

  if (isLoading) {
    return null; // Return empty/spinner during initial boot flash
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, setUser, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
