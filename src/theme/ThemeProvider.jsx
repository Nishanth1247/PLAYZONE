import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { THEMES, getThemeById, getThemeForSection } from './themeTokens';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children, platformMode = 'home', activePage, broadcastArena }) => {
  // Determine active theme ID based on application section
  const themeId = useMemo(() => {
    return getThemeForSection(platformMode, activePage, broadcastArena);
  }, [platformMode, activePage, broadcastArena]);

  const activeTheme = useMemo(() => {
    return getThemeById(themeId);
  }, [themeId]);

  // Apply CSS custom properties and data-theme to documentElement
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', activeTheme.id);

    // Apply all css variables
    Object.entries(activeTheme.cssVars).forEach(([key, val]) => {
      root.style.setProperty(key, val);
    });

    // Also update body background & text to match
    document.body.style.backgroundColor = activeTheme.colors.bg;
    document.body.style.color = activeTheme.colors.text;

    return () => {
      // Clean up when unmounting
    };
  }, [activeTheme]);

  const value = useMemo(() => ({
    theme: activeTheme,
    themeId: activeTheme.id,
    themeName: activeTheme.name,
    colors: activeTheme.colors,
    typography: activeTheme.typography,
    shadows: activeTheme.shadows,
    isDark: activeTheme.id === 'auction' || activeTheme.id === 'battle',
    isLight: activeTheme.id === 'website' || activeTheme.id === 'party',
  }), [activeTheme]);

  return (
    <ThemeContext.Provider value={value}>
      <div 
        className="min-h-screen transition-colors duration-200"
        style={{
          backgroundColor: activeTheme.colors.bg,
          color: activeTheme.colors.text,
        }}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    // Fallback if rendered outside ThemeProvider
    return {
      theme: THEMES.website,
      themeId: 'website',
      themeName: 'Alpine Editorial',
      colors: THEMES.website.colors,
      typography: THEMES.website.typography,
      shadows: THEMES.website.shadows,
      isDark: false,
      isLight: true,
    };
  }
  return context;
};
