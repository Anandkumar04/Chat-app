import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // You might want to verify token validity here
      const userData = localStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      console.log('Login attempt with:', { email, password }); // Debug log
      
      const response = await axios.post('https://chat-app-backend-gz6q.onrender.com/api/auth/login', {
        email,
        password
      });
      
      console.log('Login response:', response.data); // Debug log
      
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      
      console.log('Login successful!'); // Debug log
      return true;
    } catch (error) {
      console.error('Login error:', error); // Enhanced error log
      console.error('Error response:', error.response?.data); // Debug log
      return false;
    }
  };

  const register = async (username, email, password) => {
    try {
      console.log('Register attempt with:', { username, email, password }); // Debug log
      
      const response = await axios.post('https://chat-app-backend-gz6q.onrender.com/api/auth/register', {
        username,
        email,
        password
      });
      
      console.log('Register response:', response.data); // Debug log
      
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      
      console.log('Registration successful!'); // Debug log
      return true;
    } catch (error) {
      console.error('Register error:', error); // Enhanced error log
      console.error('Error response:', error.response?.data); // Debug log
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
