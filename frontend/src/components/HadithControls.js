import React, { useState } from 'react';
import { MoreVertical, Type, Globe } from 'lucide-react';
import { themes, fontFamilies } from '../utils/themes';
import { useSelector } from 'react-redux';

/**
 * Component for Hadith reading controls (font size, family, theme, language)
 */
const HadithControls = ({
  currentTheme,
  fontFamily,
  isThemeMenuOpen,
  onFontFamilyChange,
  onDecreaseFontSize,
  onIncreaseFontSize,
  onToggleThemeMenu,
  onThemeChange,
  onLanguageChange
}) => {
  // Make sure themes exists before trying to get its keys
  const themeNames = themes ? Object.keys(themes) : [];
  const { translations, lang } = useSelector((store) => store.content);
  
  // State for font/language dropdowns
  const [isFontMenuOpen, setIsFontMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  
  // Current language display name
  const getCurrentLanguage = () => {
    switch(lang) {
      case 'en': return 'English';
      case 'hi': return 'Hindi';
      case 'ar': return 'Arabic';
      default: return 'English';
    }
  };
  
  return (
    <div className="sticky top-0 z-10 bg-theme-controls-background backdrop-blur border-b border-theme-border">
      <div className="flex flex-wrap items-center justify-between p-3 gap-2">
        {/* Font Controls Group */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              className="px-3 py-2 rounded-md hover:bg-theme-hover text-theme-text-primary border border-theme-border bg-theme-card-background flex items-center gap-2"
              onClick={() => setIsFontMenuOpen(!isFontMenuOpen)}
            >
              <Type size={16} />
              <span className="hidden sm:inline">{fontFamily.length > 12 ? fontFamily.substring(0, 12) + '...' : fontFamily}</span>
            </button>
            
            {isFontMenuOpen && (
              <div className="absolute left-0 mt-2 w-48 rounded-lg shadow-lg border border-theme-border bg-theme-card-background z-20">
                {fontFamilies && fontFamilies.map(font => (
                  <button
                    key={font}
                    onClick={() => {
                      onFontFamilyChange({ target: { value: font } });
                      setIsFontMenuOpen(false);
                    }}
                    className={`w-full px-4 py-2 text-left text-theme-text-primary ${
                      fontFamily === font ? 'bg-theme-hover' : ''
                    } hover:bg-theme-hover`}
                  >
                    {font}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <button 
            className="px-3 py-2 rounded-md hover:bg-theme-hover text-theme-text-primary border border-theme-border bg-theme-card-background"
            onClick={onDecreaseFontSize}
          >
            A-
          </button>
          <button 
            className="px-3 py-2 rounded-md hover:bg-theme-hover text-theme-text-primary border border-theme-border bg-theme-card-background"
            onClick={onIncreaseFontSize}
          >
            A+
          </button>
        </div>
        
        {/* Language & Theme Controls Group */}
        <div className="flex items-center gap-2">
          {/* Language Selection */}
          <div className="relative">
            <button
              className="px-3 py-2 rounded-md hover:bg-theme-hover text-theme-text-primary border border-theme-border bg-theme-card-background flex items-center gap-2"
              onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
            >
              <Globe size={16} />
              <span className="hidden sm:inline">{getCurrentLanguage()}</span>
            </button>
            
            {isLangMenuOpen && translations && (
              <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg border border-theme-border bg-theme-card-background z-20">
                {translations.map((language) => (
                  <button
                    key={language}
                    onClick={() => {
                      const langCode = language === 'English' ? 'en' : language === 'Hindi' ? 'hi' : 'ar';
                      onLanguageChange(langCode);
                      setIsLangMenuOpen(false);
                    }}
                    className={`w-full px-4 py-2 text-left text-theme-text-primary ${
                      getCurrentLanguage() === language ? 'bg-theme-hover' : ''
                    } hover:bg-theme-hover`}
                  >
                    {language}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Theme Selection */}
          <div className="relative">
            <button
              className="p-2 rounded-md hover:bg-theme-hover text-theme-text-primary border border-theme-border bg-theme-card-background"
              onClick={onToggleThemeMenu}
            >
              <MoreVertical className="h-5 w-5" />
            </button>
            
            {isThemeMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg border border-theme-border bg-theme-card-background z-20">
                {themeNames.map((themeName) => (
                  <button
                    key={themeName}
                    onClick={() => onThemeChange(themeName)}
                    className={`w-full px-4 py-2 text-left text-theme-text-primary ${
                      currentTheme === themeName ? 'bg-theme-hover' : ''
                    } hover:bg-theme-hover`}
                  >
                    {themeName.charAt(0).toUpperCase() + themeName.slice(1)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HadithControls;
