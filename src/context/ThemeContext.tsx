import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as profileDb from '../database/profile';

interface ThemeContextType {
  isDark: boolean;
  toggleDark: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  toggleDark: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const p = await profileDb.getProfile();
        setIsDark(p.darkMode);
      } catch (e) {
        console.log('Theme load failed, using light mode');
      }
    };
    load();
  }, []);

  const toggleDark = useCallback(async () => {
    const newVal = !isDark;
    setIsDark(newVal);
    try {
      await profileDb.updateProfile({ darkMode: newVal });
    } catch (e) {
      console.log('Theme save failed');
    }
  }, [isDark]);

  return (
    <ThemeContext.Provider value={{ isDark, toggleDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
