import { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setTheme as setReduxTheme, setFontSize, setFontFamily } from '../redux/contentSlice';
import { themes } from '../utils/themes';

/**
 * Custom hook for managing theme, font size, and font family
 * @returns {Object} Theme state and functions to manage it
 */
export const useTheme = () => {
  const dispatch = useDispatch();
  const { 
    theme: reduxThemeName, 
    fontSize: reduxFontSize, 
    fontFamily: reduxFontFamily 
  } = useSelector((state) => state.content);
  
  // Use ref to track if we've already synced Redux with localStorage
  const hasInitializedRef = useRef(false);

  // Initialize currentThemeName from localStorage first, then Redux
  const [currentThemeName, setCurrentThemeName] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('selectedTheme');
      if (savedTheme) return savedTheme;
    }
    return reduxThemeName || 'default';
  });

  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);

  // Only run once on mount to sync initial theme state
  useEffect(() => {
    if (!hasInitializedRef.current) {
      const themeToApply = themes[currentThemeName] || themes.default;
      const root = document.documentElement;
      
      // Apply CSS custom properties
      Object.keys(themeToApply).forEach(key => {
        root.style.setProperty(key, themeToApply[key]);
      });
      
      // Save to localStorage if needed
      if (typeof window !== 'undefined' && !localStorage.getItem('selectedTheme')) {
        localStorage.setItem('selectedTheme', currentThemeName);
      }
      
      // Sync Redux if needed, but only once
      if (reduxThemeName !== currentThemeName) {
        dispatch(setReduxTheme(currentThemeName));
      }
      
      hasInitializedRef.current = true;
    }
  }, []); // Empty dependency array = run once on mount
  
  // Effect to apply theme when it changes via user action
  useEffect(() => {
    // Skip the first render, which is handled by the initialization effect
    if (hasInitializedRef.current) {
      const themeToApply = themes[currentThemeName] || themes.default;
      const root = document.documentElement;
      
      // Apply CSS custom properties
      Object.keys(themeToApply).forEach(key => {
        root.style.setProperty(key, themeToApply[key]);
      });
      
      // Persist to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('selectedTheme', currentThemeName);
      }
      
      // Update Redux
      if (reduxThemeName !== currentThemeName) {
        dispatch(setReduxTheme(currentThemeName));
      }
    }
  }, [currentThemeName]); // Only depends on currentThemeName changes
  /**
   * Handle font size change
   * @param {number} increment - Amount to increase/decrease font size
   */
  const handleFontSizeChange = useCallback((increment) => {
    const newSize = reduxFontSize + increment;
    if (newSize >= 70 && newSize <= 130) {
      dispatch(setFontSize(newSize));
    }
  }, [reduxFontSize, dispatch]);

  /**
   * Handle theme change - this is the primary function to call to change themes.
   * @param {string} themeName - Name of the theme to switch to
   */
  const handleThemeChange = useCallback((themeName) => {
    if (themes[themeName]) {
      setCurrentThemeName(themeName);
    }
    setIsThemeMenuOpen(false);
  }, []);

  /**
   * Handle font family change
   * @param {Event} event - Change event from select element
   */
  const handleFontFamilyChange = useCallback((event) => {
    dispatch(setFontFamily(event.target.value));
  }, [dispatch]);

  /**
   * Toggle theme menu open/closed
   */
  const toggleThemeMenu = useCallback(() => {
    setIsThemeMenuOpen(prev => !prev);
  }, []);

  return {
    currentThemeName, // This is the theme name (e.g., 'default', 'dark')
    fontSize: reduxFontSize,
    fontFamily: reduxFontFamily,
    isThemeMenuOpen,
    handleThemeChange,
    handleFontSizeChange,
    handleFontFamilyChange,
    toggleThemeMenu,
    availableThemes: Object.keys(themes), // Used for populating theme switcher UI
  };
};

export default useTheme;
