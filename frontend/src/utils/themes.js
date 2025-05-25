/**
 * Theme definitions for the application
 */
export const themes = {
  default: {
    '--color-background-rgb': '249, 250, 251',      // #F9FAFB (brand-off-white)
    '--color-text-primary-rgb': '31, 41, 55',        // #1F2937 (brand-charcoal)
    '--color-text-secondary-rgb': '75, 85, 99',      // #4B5563 (gray-600)
    '--color-card-background-rgb': '255, 255, 255', // #FFFFFF (brand-white)
    '--color-primary-accent-rgb': '230, 255, 250',   // #E6FFFA (brand-light-green)
    '--color-border-rgb': '229, 231, 235',           // #E5E7EB (gray-200)
    '--color-button-primary-bg-rgb': '31, 41, 55',   // #1F2937 (brand-charcoal)
    '--color-button-primary-text-rgb': '255, 255, 255',// #FFFFFF (brand-white)
    '--color-focus-ring-rgb': '167, 243, 208',       // #A7F3D0 (a shade for focus rings)
    '--color-hyperlink-rgb': '29, 78, 216', // Example: blue-700 for links
  },
  dark: {
    '--color-background-rgb': '17, 24, 39',         // #111827 (gray-900)
    '--color-text-primary-rgb': '249, 250, 251',     // #F9FAFB (gray-50)
    '--color-text-secondary-rgb': '156, 163, 175',   // #9CA3AF (gray-400)
    '--color-card-background-rgb': '31, 41, 55',      // #1F2937 (gray-800)
    '--color-primary-accent-rgb': '52, 211, 153',    // #34D399 (a more vibrant green for dark mode)
    '--color-border-rgb': '55, 65, 81',              // #374151 (gray-700)
    '--color-button-primary-bg-rgb': '52, 211, 153', // #34D399 (vibrant green)
    '--color-button-primary-text-rgb': '17, 24, 39',  // #111827 (dark text for contrast)
    '--color-focus-ring-rgb': '110, 231, 183',       // #6EE7B7
    '--color-hyperlink-rgb': '96, 165, 250', // Example: blue-400 for links in dark mode
  },
  sepia: {
    '--color-background-rgb': '251, 239, 222', // amber-50 variant
    '--color-text-primary-rgb': '60, 51, 42', // darker sepia text
    '--color-text-secondary-rgb': '120, 100, 80',
    '--color-card-background-rgb': '253, 246, 236', // lighter amber for cards
    '--color-primary-accent-rgb': '217, 187, 148',
    '--color-border-rgb': '234, 217, 196',
    '--color-button-primary-bg-rgb': '120, 80, 50',
    '--color-button-primary-text-rgb': '251, 239, 222',
    '--color-focus-ring-rgb': '217, 187, 148',
    '--color-hyperlink-rgb': '150, 100, 70',
  },
};

/**
 * Available font families for the application
 */
export const fontFamilies = [
  "STIX Two Text",
  "Amiri",
  "Scheherazade New",
  "Lateef",
  "Noto Naskh Arabic",
  "Almarai",
  "sans-serif", // Fallback
];
