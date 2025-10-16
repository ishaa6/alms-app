import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useEffect, useState } from 'react';
import { currentOrg, themes } from '../../app/themes/theme';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState('dark');
  const [theme, setTheme] = useState(themes[currentOrg]['dark']);

  useEffect(() => {
  console.log("Current theme mode:", mode);
}, [mode]);

  useEffect(() => {
    const loadMode = async () => {
      const savedMode = await AsyncStorage.getItem('themeMode');
      if (savedMode) {
        setMode(savedMode);
        setTheme(themes[currentOrg][savedMode]);
      }
    };
    loadMode();
  }, []);

  const toggleMode = async () => {
    const newMode = mode === 'dark' ? 'light' : 'dark';
    setMode(newMode);
    setTheme(themes[currentOrg][newMode]);
    await AsyncStorage.setItem('themeMode', newMode);
  };

  return (
    <ThemeContext.Provider value={{ mode, theme, toggleMode }}>
      {children}
    </ThemeContext.Provider>
  );
};
