import React, { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

const defaultUser = {
  name: 'Alex Morgan',
  email: 'alex.morgan@example.com',
  plan: 'Pro',
  initials: 'AM',
};

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  const login = useCallback((userData) => {
    setIsLoggedIn(true);
    setUser(userData || defaultUser);
  }, []);

  const logout = useCallback(() => {
    setIsLoggedIn(false);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export default AuthContext;
