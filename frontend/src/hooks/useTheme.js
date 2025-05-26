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
  
  // Initialize theme state from localStorage or Redux
  const [currentThemeName, setCurrentThemeName] = useState('default');
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const themeMenuRef = useRef(null);
  const isInitialMount = useRef(true);

  // Initialize theme on mount
  useEffect(() => {
    if (isInitialMount.current) {
      let initialTheme = 'default';
      
      if (typeof window !== 'undefined') {
        const savedTheme = localStorage.getItem('selectedTheme');
        if (savedTheme && themes[savedTheme]) {
          initialTheme = savedTheme;
        } else if (reduxThemeName && themes[reduxThemeName]) {
          initialTheme = reduxThemeName;
        }
      }

      setCurrentThemeName(initialTheme);
      isInitialMount.current = false;
    }
  }, [reduxThemeName]);

  // Effect to apply theme to DOM and save to localStorage
  useEffect(() => {
    if (!isInitialMount.current) {
      // Apply theme to DOM
      const themeToApply = themes[currentThemeName] || themes.default;
      const root = document.documentElement;
      
      Object.keys(themeToApply).forEach(key => {
        root.style.setProperty(key, themeToApply[key]);
      });

      // Update body classes
      const body = document.body;
      Object.keys(themes).forEach(themeKey => {
        body.classList.remove(`theme-${themeKey}`);
      });
      body.classList.add(`theme-${currentThemeName}`);

      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('selectedTheme', currentThemeName);
      }
    }
  }, [currentThemeName]);

  // Handle theme change
  const handleThemeChange = useCallback((themeName) => {
    if (!themes[themeName] || themeName === currentThemeName) {
      return;
    }

    setCurrentThemeName(themeName);
    // Dispatch Redux action separately from the effect
    if (themeName !== reduxThemeName) {
      dispatch(setReduxTheme(themeName));
    }
    setIsThemeMenuOpen(false);
  }, [currentThemeName, reduxThemeName, dispatch]);

  // Effect to handle clicks outside theme menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isThemeMenuOpen && themeMenuRef.current && !themeMenuRef.current.contains(event.target)) {
        setIsThemeMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isThemeMenuOpen]);

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
   * Handle font family change
   * @param {Event} event - Change event from select element
   */
  const handleFontFamilyChange = useCallback((event) => {
    dispatch(setFontFamily(event.target.value));
  }, [dispatch]);
  /**
   * Toggle theme menu open/closed
   */
  const toggleThemeMenu = useCallback((forceState) => {
    if (typeof forceState === 'boolean') {
      setIsThemeMenuOpen(forceState);
    } else {
      setIsThemeMenuOpen(prev => !prev);
    }
  }, []);

  return {
    currentTheme: currentThemeName, // Renamed to match component expectations
    fontSize: reduxFontSize,
    fontFamily: reduxFontFamily,
    isThemeMenuOpen,
    themeMenuRef,
    handleThemeChange,
    handleFontSizeChange,
    handleFontFamilyChange,
    toggleThemeMenu,
    setIsThemeMenuOpen,
    availableThemes: Object.keys(themes)
  };
};

export default useTheme;
