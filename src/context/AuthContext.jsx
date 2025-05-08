import React, { createContext, useState, useEffect, useContext } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        // Check if token is expired
        if (decoded.exp * 1000 < Date.now()) {
          localStorage.removeItem('token');
          setUser(null);
        } else {
          setUser(decoded);
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
      } catch (error) {
        localStorage.removeItem('token');
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      // In a real app, this would be an API call
      // For demo purposes, we'll use mock data
      const mockUsers = [
        { id: 1, email: 'admin@hospital.com', password: 'admin123', name: 'Admin User', role: 'admin' },
        { id: 2, email: 'doctor@hospital.com', password: 'doctor123', name: 'Dr. Smith', role: 'doctor', specialty: 'Cardiology' },
        { id: 3, email: 'patient@hospital.com', password: 'patient123', name: 'John Doe', role: 'patient' }
      ];

      const foundUser = mockUsers.find(u => u.email === email && u.password === password);
      
      if (!foundUser) {
        throw new Error('Invalid email or password');
      }

      // Create a mock token
      const token = `mock_token_${foundUser.role}_${foundUser.id}`;
      
      // In a real app, we would receive a JWT from the server
      // For demo, we'll create a mock user object
      const userData = {
        id: foundUser.id,
        name: foundUser.name,
        email: foundUser.email,
        role: foundUser.role,
        exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour from now
      };

      // Store token in localStorage
      localStorage.setItem('token', token);
      
      // Set user in state
      setUser(userData);
      
      // Set default Authorization header
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      toast.success(`Welcome back, ${userData.name}!`);
      return userData;
    } catch (error) {
      setError(error.message);
      toast.error(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      // In a real app, this would be an API call to register the user
      // For demo purposes, we'll simulate a successful registration
      
      // Create a mock user with patient role
      const newUser = {
        id: Math.floor(Math.random() * 1000),
        name: userData.name,
        email: userData.email,
        role: 'patient',
        exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour from now
      };
      
      // Create a mock token
      const token = `mock_token_patient_${newUser.id}`;
      
      // Store token in localStorage
      localStorage.setItem('token', token);
      
      // Set user in state
      setUser(newUser);
      
      // Set default Authorization header
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      toast.success('Registration successful!');
      return newUser;
    } catch (error) {
      setError(error.message);
      toast.error(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    delete api.defaults.headers.common['Authorization'];
    toast.success('Logged out successfully');
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};