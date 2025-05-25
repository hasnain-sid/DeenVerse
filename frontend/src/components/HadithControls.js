import React from 'react';
import { MoreVertical } from 'lucide-react';
import { themes, fontFamilies } from '../utils/themes';

/**
 * Component for Hadith reading controls (font size, family, theme)
 */
const HadithControls = ({
  currentTheme,
  fontFamily,
  isThemeMenuOpen,
  onFontFamilyChange,
  onDecreaseFontSize,
  onIncreaseFontSize,
  onToggleThemeMenu,
  onThemeChange
}) => {
  return (
    <div className={`sticky top-0 z-10 ${themes[currentTheme].controls} backdrop-blur border-b ${themes[currentTheme].border}`}>
      <div className="flex items-center justify-between p-3">
        <select 
          value={fontFamily}
          onChange={onFontFamilyChange}
          className={`w-40 px-3 py-2 rounded-md border ${themes[currentTheme].border} ${themes[currentTheme].text} ${themes[currentTheme].card}`}
        >
          {fontFamilies.map(font => (
            <option key={font} value={font}>{font}</option>
          ))}
        </select>

        <div className="flex items-center gap-2">
          <button 
            className={`px-3 py-1 rounded-md ${themes[currentTheme].hover} ${themes[currentTheme].text}`}
            onClick={onDecreaseFontSize}
          >
            A-
          </button>
          <button 
            className={`px-3 py-1 rounded-md ${themes[currentTheme].hover} ${themes[currentTheme].text}`}
            onClick={onIncreaseFontSize}
          >
            A+
          </button>
          <div className="relative">
            <button
              className={`p-2 rounded-md ${themes[currentTheme].hover} ${themes[currentTheme].text}`}
              onClick={onToggleThemeMenu}
            >
              <MoreVertical className="h-4 w-4" />
            </button>
            
            {isThemeMenuOpen && (
              <div className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg border ${themes[currentTheme].card} ${themes[currentTheme].border}`}>
                {Object.keys(themes).map((themeName) => (
                  <button
                    key={themeName}
                    onClick={() => onThemeChange(themeName)}
                    className={`w-full px-4 py-2 text-left ${themes[currentTheme].text} ${
                      currentTheme === themeName ? themes[currentTheme].hover : ''
                    } hover:${themes[currentTheme].hover}`}
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
