import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('gomoku_token'));
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (token) {
      axios.get('http://localhost:4000/api/user/me', {
        headers: { Authorization: 'Bearer ' + token }
      }).then(res => setUser(res.data)).catch(() => { logout(); });
    }
  }, [token]);

  const login = (newToken, userData) => {
    localStorage.setItem('gomoku_token', newToken);
    setToken(newToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('gomoku_token');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    if (token) {
      try {
        const res = await axios.get('http://localhost:4000/api/user/me', {
          headers: { Authorization: 'Bearer ' + token }
        });
        setUser(res.data);
      } catch(e) { /* ignore */ }
    }
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() { return useContext(AuthContext); }