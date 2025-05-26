import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MdFormatSize, MdLanguage, MdPalette } from 'react-icons/md';
import { useTheme } from '../hooks/useTheme';
import { fontFamilies } from '../utils/themes';
import { CSSTransition } from 'react-transition-group';
import useClickOutside from '../hooks/useClickOutside';
import { useSelector, useDispatch } from 'react-redux';
import { getLang, setFontFamily } from '../redux/contentSlice';
import '../utils/dropdownStyles.css';

const HadithControls = ({
  fontFamily,
  onFontFamilyChange,
  onThemeChange,
  showIcons,
  onLanguageChange,
}) => {
  const dispatch = useDispatch();
  const { lang } = useSelector((state) => state.content);
  
  // Convert lang code to display language
  const getDisplayLanguage = (langCode) => {
    if (langCode === 'en') return 'english';
    if (langCode === 'ar') return 'arabic';
    if (langCode === 'hi') return 'hindi';
    return langCode;
  };
  
  const language = getDisplayLanguage(lang);  const [fontMenuOpen, setFontMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({
    font: { horizontal: 'right', vertical: 'bottom' },
    lang: { horizontal: 'right', vertical: 'bottom' },
    theme: { horizontal: 'right', vertical: 'bottom' }
  });
  const { theme } = useTheme();
  
  // Window size tracking for responsive adjustments
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });
  
  // Refs for dropdown buttons
  const fontButtonRef = useRef(null);
  const langButtonRef = useRef(null);
  const themeButtonRef = useRef(null);

  // Refs for dropdown divs for CSSTransition nodeRef
  const fontDropdownRef = useRef(null);
  const langDropdownRef = useRef(null);
  const themeDropdownRef = useRef(null);
  // Function to calculate optimal dropdown position - memoized to prevent unnecessary rerenders
  const calculatePosition = useCallback((buttonRef, key) => {
    if (!buttonRef.current) return;
    
    const rect = buttonRef.current.getBoundingClientRect();
    const viewportWidth = windowSize.width;
    const viewportHeight = windowSize.height;
    
    // Calculate horizontal position with improved logic
    // Check if there's enough space on the right side for the dropdown
    // If not, check if there's more space on the left than the right
    const minDropdownWidth = viewportWidth < 640 ? 150 : 180;
    const rightSpace = viewportWidth - rect.right;
    const leftSpace = rect.left;
    
    // For very small screens, always center
    if (viewportWidth <= 380) {
      const horizontal = 'center';
      const vertical = viewportHeight - rect.bottom < 250 ? 'top' : 'bottom';
      
      setDropdownPosition(prev => ({
        ...prev,
        [key]: { horizontal, vertical }
      }));
      return;
    }
    
    // For normal screens, position based on available space
    const horizontal = rightSpace < minDropdownWidth && leftSpace > rightSpace ? 'left' : 'right';
    
    // Calculate vertical position - determine if there's enough space below
    // Use different threshold based on the dropdown type
    let verticalThreshold = 250;
    if (key === 'font') {
      // Font dropdown is taller
      verticalThreshold = viewportHeight < 700 ? 200 : 300;
    } else if (key === 'lang' || key === 'theme') {
      // Language and theme dropdowns are shorter
      verticalThreshold = 180;
    }
    
    const bottomSpace = viewportHeight - rect.bottom;
    const vertical = bottomSpace < verticalThreshold ? 'top' : 'bottom';
    
    setDropdownPosition(prev => ({
      ...prev,
      [key]: { horizontal, vertical }
    }));
  }, [windowSize]);
    // Check screen position and calculate optimal dropdown positioning
  useEffect(() => {
    // Add/remove body class to prevent scrolling on mobile when dropdown is open
    if (fontMenuOpen || langMenuOpen || themeMenuOpen) {
      if (window.innerWidth <= 640) {
        document.body.classList.add('dropdown-open');
      }
    } else {
      document.body.classList.remove('dropdown-open');
    }
    
    // Only calculate positions for open dropdowns
    if (fontMenuOpen) calculatePosition(fontButtonRef, 'font');
    if (langMenuOpen) calculatePosition(langButtonRef, 'lang');
    if (themeMenuOpen) calculatePosition(themeButtonRef, 'theme');
  }, [fontMenuOpen, langMenuOpen, themeMenuOpen, calculatePosition]);  // Handle window resize to recalculate positions
  useEffect(() => {
    const handleResize = () => {
      // Update window size
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
      
      // Recalculate positions for open dropdowns
      if (fontMenuOpen) calculatePosition(fontButtonRef, 'font');
      if (langMenuOpen) calculatePosition(langButtonRef, 'lang');
      if (themeMenuOpen) calculatePosition(themeButtonRef, 'theme');
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [fontMenuOpen, langMenuOpen, themeMenuOpen, calculatePosition]);
    // Debug log for dropdown positions if they're not defined properly
  useEffect(() => {
    if (fontMenuOpen && (!dropdownPosition?.font?.horizontal || !dropdownPosition?.font?.vertical)) {
      console.warn('Font dropdown position not properly defined:', dropdownPosition?.font);
    }
    if (langMenuOpen && (!dropdownPosition?.lang?.horizontal || !dropdownPosition?.lang?.vertical)) {
      console.warn('Language dropdown position not properly defined:', dropdownPosition?.lang);
    }
    if (themeMenuOpen && (!dropdownPosition?.theme?.horizontal || !dropdownPosition?.theme?.vertical)) {
      console.warn('Theme dropdown position not properly defined:', dropdownPosition?.theme);
    }
  }, [fontMenuOpen, langMenuOpen, themeMenuOpen, dropdownPosition]);

  // Setup refs for click outside detection
  const fontMenuRef = useClickOutside(() => setFontMenuOpen(false), fontMenuOpen);
  const langMenuRef = useClickOutside(() => setLangMenuOpen(false), langMenuOpen);
  const themeMenuRef = useClickOutside(() => setThemeMenuOpen(false), themeMenuOpen);

  // Toggle dropdown states
  const toggleFontMenu = () => {
    setLangMenuOpen(false);
    setThemeMenuOpen(false);
    setFontMenuOpen(!fontMenuOpen);
  };
  
  const toggleLangMenu = () => {
    setFontMenuOpen(false);
    setThemeMenuOpen(false);
    setLangMenuOpen(!langMenuOpen);
  };
  
  const toggleThemeMenu = () => {
    setFontMenuOpen(false);
    setLangMenuOpen(false);
    setThemeMenuOpen(!themeMenuOpen);
  };

  // Setup keyboard accessibility
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        // Close all dropdowns on Escape
        setFontMenuOpen(false);
        setLangMenuOpen(false);
        setThemeMenuOpen(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleFontChange = (font) => {
    if (onFontFamilyChange) {
      // If it's coming from Daily.js which passes the handleFontFamilyChange from useTheme
      // Create an event-like object with target.value to match what the function expects
      onFontFamilyChange({ target: { value: font } });
    } else {
      // Direct Redux dispatch if no handler provided
      dispatch(setFontFamily(font));
    }
    setFontMenuOpen(false);
  };

  const handleLangChange = (lang) => {
    // Convert to language code
    let langCode;
    if (lang === 'english') langCode = 'en';
    else if (lang === 'hindi') langCode = 'hi';
    else if (lang === 'arabic') langCode = 'ar';
    else langCode = lang;
    
    if (onLanguageChange) {
      onLanguageChange(langCode);
    } else {
      dispatch(getLang(langCode));
    }
    setLangMenuOpen(false);
  };

  const handleThemeChange = (newTheme) => {
    if (onThemeChange) {
      onThemeChange(newTheme);
    }
    setThemeMenuOpen(false);
  };  return (
    <div className="flex items-center space-x-3 md:space-x-4">
      {/* Font Selection Dropdown */}
      <div className="relative" ref={fontMenuRef}>
        <button
          ref={fontButtonRef}
          onClick={toggleFontMenu}
          className="flex items-center justify-center p-2 rounded-md bg-theme-controls-background text-theme-text-primary hover:bg-theme-hover transition-colors touch-target"
          aria-label="Change font"
          aria-expanded={fontMenuOpen}
          aria-haspopup="true"
        >
          <MdFormatSize className={showIcons ? 'text-theme-icon' : 'hidden'} size={20} />
          {!showIcons && <span className="text-sm">Font</span>}
        </button><CSSTransition
          nodeRef={fontDropdownRef}
          in={fontMenuOpen}
          timeout={200}
          classNames="dropdown-menu"
          unmountOnExit
        >
          <div 
            ref={fontDropdownRef}
            className={`dropdown-menu position-${dropdownPosition?.font?.horizontal || 'right'} position-${dropdownPosition?.font?.vertical || 'bottom'}`}
            style={{ maxWidth: windowSize.width < 640 ? 'calc(100vw - 2rem)' : '250px' }}
          >
            <div className="dropdown-header">Select Font</div>
            <div className="font-dropdown-content">
              {fontFamilies.map((font) => (
                <button
                  key={font}
                  onClick={() => handleFontChange(font)}
                  className={`dropdown-item ${fontFamily === font ? 'active' : ''}`}
                  style={{ 
                    fontFamily: font, 
                    textOverflow: 'ellipsis', 
                    overflow: 'hidden', 
                    whiteSpace: 'nowrap' 
                  }}
                >
                  {fontFamily === font && <span className="mr-2">✓</span>}
                  {font}
                </button>
              ))}
            </div>
          </div>
        </CSSTransition>
      </div>      {/* Language Selection Dropdown */}
      <div className="relative" ref={langMenuRef}>
        <button
          ref={langButtonRef}
          onClick={toggleLangMenu}
          className="flex items-center justify-center p-2 rounded-md bg-theme-controls-background text-theme-text-primary hover:bg-theme-hover transition-colors touch-target"
          aria-label="Change language"
          aria-expanded={langMenuOpen}
          aria-haspopup="true"
        >
          <MdLanguage className={showIcons ? 'text-theme-icon' : 'hidden'} size={20} />
          {!showIcons && <span className="text-sm">Language</span>}
        </button>
          <CSSTransition
          nodeRef={langDropdownRef}
          in={langMenuOpen}
          timeout={200}
          classNames="dropdown-menu"
          unmountOnExit
        >
          <div
            ref={langDropdownRef}
            className={`dropdown-menu position-${dropdownPosition?.lang?.horizontal || 'right'} position-${dropdownPosition?.lang?.vertical || 'bottom'}`}>
            <div className="dropdown-header">Select Language</div>
            <button
              onClick={() => handleLangChange('arabic')}
              className={`dropdown-item ${language === 'arabic' ? 'active' : ''}`}
            >
              {language === 'arabic' && <span className="mr-2">✓</span>}
              Arabic
            </button>
            <button
              onClick={() => handleLangChange('english')}
              className={`dropdown-item ${language === 'english' ? 'active' : ''}`}
            >
              {language === 'english' && <span className="mr-2">✓</span>}
              English
            </button>
            <button
              onClick={() => handleLangChange('hindi')}
              className={`dropdown-item ${language === 'hindi' ? 'active' : ''}`}
            >
              {language === 'hindi' && <span className="mr-2">✓</span>}
              Hindi
            </button>
          </div>
        </CSSTransition>
      </div>      {/* Theme Selection Dropdown */}
      <div className="relative" ref={themeMenuRef}>
        <button
          ref={themeButtonRef}
          onClick={toggleThemeMenu}
          className="flex items-center justify-center p-2 rounded-md bg-theme-controls-background text-theme-text-primary hover:bg-theme-hover transition-colors touch-target"
          aria-label="Change theme"
          aria-expanded={themeMenuOpen}
          aria-haspopup="true"
        >
          <MdPalette className={showIcons ? 'text-theme-icon' : 'hidden'} size={20} />
          {!showIcons && <span className="text-sm">Theme</span>}
        </button>
          <CSSTransition
          nodeRef={themeDropdownRef}
          in={themeMenuOpen}
          timeout={200}
          classNames="dropdown-menu"
          unmountOnExit
        >
          <div
            ref={themeDropdownRef}
            className={`dropdown-menu position-${dropdownPosition?.theme?.horizontal || 'right'} position-${dropdownPosition?.theme?.vertical || 'bottom'}`}>
            <div className="dropdown-header">Select Theme</div>
            <button
              onClick={() => handleThemeChange('default')}
              className={`dropdown-item ${theme === 'default' ? 'active' : ''}`}
            >
              <div className="color-swatch bg-[#F5F5F5] border border-gray-300"></div>
              Default
            </button>
            <button
              onClick={() => handleThemeChange('dark')}
              className={`dropdown-item ${theme === 'dark' ? 'active' : ''}`}
            >
              <div className="color-swatch bg-[#111827] border border-gray-700"></div>
              Dark
            </button>
            <button
              onClick={() => handleThemeChange('sepia')}
              className={`dropdown-item ${theme === 'sepia' ? 'active' : ''}`}
            >
              <div className="color-swatch bg-[#FAF6E6] border border-[#E3D6BC]"></div>
              Sepia
            </button>
          </div>
        </CSSTransition>
      </div>
    </div>
  );
};

export default HadithControls;
