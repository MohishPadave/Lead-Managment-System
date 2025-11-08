'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Helper function to get initial theme
function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  
  try {
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }
    
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

// Helper function to apply theme
function applyTheme(theme: Theme) {
  const root = document.documentElement;
  const isDark = theme === 'dark';
  
  console.log(`[Theme] Applying ${theme} mode`);
  
  if (isDark) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
  
  try {
    localStorage.setItem('theme', theme);
  } catch (e) {
    console.error('[Theme] Failed to save to localStorage:', e);
  }
  
  console.log(`[Theme] HTML classes:`, root.className);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [mounted, setMounted] = useState(false);

  // Mount effect
  useEffect(() => {
    setMounted(true);
    const initialTheme = getInitialTheme();
    console.log('[Theme] Initial theme:', initialTheme);
    setTheme(initialTheme);
    applyTheme(initialTheme);
  }, []);

  // Theme change effect
  useEffect(() => {
    if (mounted) {
      applyTheme(theme);
    }
  }, [theme, mounted]);

  const toggleTheme = () => {
    console.log('[Theme] Toggle clicked, current:', theme);
    setTheme(prevTheme => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      console.log('[Theme] Switching from', prevTheme, 'to', newTheme);
      return newTheme;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
