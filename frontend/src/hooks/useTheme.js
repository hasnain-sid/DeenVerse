import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setTheme, setFontSize, setFontFamily } from '../redux/contentSlice';

/**
 * Custom hook for managing theme, font size, and font family
 * @returns {Object} Theme state and functions to manage it
 */
export const useTheme = () => {
  const dispatch = useDispatch();
  const { theme: storeTheme, fontSize: storeFontSize, fontFamily: storeFontFamily } = 
    useSelector((state) => state.content);
  
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(storeTheme || 'default');

  /**
   * Handle font size change
   * @param {number} increment - Amount to increase/decrease font size
   */
  const handleFontSizeChange = (increment) => {
    const newSize = storeFontSize + increment;
    if (newSize >= 70 && newSize <= 130) {
      dispatch(setFontSize(newSize));
    }
  };

  /**
   * Handle theme change
   * @param {string} themeName - Name of the theme to switch to
   */
  const handleThemeChange = (themeName) => {
    setCurrentTheme(themeName);
    dispatch(setTheme(themeName));
    setIsThemeMenuOpen(false);
  };

  /**
   * Handle font family change
   * @param {Event} event - Change event from select element
   */
  const handleFontFamilyChange = (event) => {
    dispatch(setFontFamily(event.target.value));
  };

  /**
   * Toggle theme menu open/closed
   */
  const toggleThemeMenu = () => setIsThemeMenuOpen(!isThemeMenuOpen);

  return {
    currentTheme,
    fontSize: storeFontSize,
    fontFamily: storeFontFamily,
    isThemeMenuOpen,
    handleFontSizeChange,
    handleThemeChange,
    handleFontFamilyChange,
    toggleThemeMenu
  };
};

export default useTheme;
