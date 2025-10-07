import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  // Load theme from localStorage first for instant application
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });
  // Load logo from localStorage first for instant application
  const [logo, setLogo] = useState(() => {
    return localStorage.getItem('logo') || '';
  });

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    // Apply theme to document and save to localStorage
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    // Save logo to localStorage whenever it changes
    localStorage.setItem('logo', logo);
  }, [logo]);

  const loadSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await axios.get('/api/settings');
        if (response.data.theme) {
          setTheme(response.data.theme);
        }
        if (response.data.logo) {
          setLogo(response.data.logo);
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    
    try {
      await axios.put('/api/settings', { theme: newTheme });
    } catch (error) {
      console.error('Error updating theme:', error);
    }
  };

  const updateLogo = (newLogo) => {
    setLogo(newLogo);
  };

  const value = {
    theme,
    logo,
    toggleTheme,
    updateLogo,
    loadSettings
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export default ThemeContext;

