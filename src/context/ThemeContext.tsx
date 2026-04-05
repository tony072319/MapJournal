import React, { createContext, useContext, useState, useEffect } from 'react';
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
    profileDb.getProfile().then((p) => setIsDark(p.darkMode));
  }, []);

  const toggleDark = async () => {
    const newVal = !isDark;
    setIsDark(newVal);
    await profileDb.updateProfile({ darkMode: newVal });
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
