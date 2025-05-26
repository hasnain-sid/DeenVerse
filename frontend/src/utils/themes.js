/**
 * Font families for the application
 * Optimized for cross-platform compatibility and Arabic text rendering
 */
export const fontFamilies = [
  'STIX Two Text',
  'Amiri',
  'Scheherazade New',
  'Lateef',
  'Noto Naskh Arabic',
  'Almarai',
  'system-ui, sans-serif'
];

/**
 * Responsive breakpoints used throughout the application
 * Values should match those in tailwind.config.js
 */
export const breakpoints = {
  'xs-mobile': 320,  // Small mobile
  'mobile': 375,     // Medium mobile
  'lg-mobile': 425,  // Large mobile
  'xs': 475,         // Extra small breakpoint
  'sm': 640,         // Small tablet
  'md': 768,         // Tablet
  'lg': 1024,        // Desktop
  'xl': 1280,        // Large desktop
  '2xl': 1440,       // Extra large desktop
  '3xl': 1920        // Ultra large screens
};

/**
 * Theme definitions for the application
 * All themes include responsive design variables and optimizations
 */
export const themes = {
  default: {
    // CSS Variables
    '--color-background-rgb': '245, 245, 245',       // #F5F5F5 (off-white)
    '--color-text-primary-rgb': '31, 41, 55',        // #1F2937 (dark charcoal)
    '--color-text-secondary-rgb': '75, 85, 99',      // #4B5563 (gray-600)
    '--color-card-background-rgb': '255, 255, 255',  // #FFFFFF (white)
    '--color-primary-accent-rgb': '230, 255, 250',   // #E6FFFA (light green)
    '--color-border-rgb': '229, 231, 235',           // #E5E7EB (light gray)
    '--color-button-primary-bg-rgb': '31, 41, 55',   // #1F2937 (dark charcoal)
    '--color-button-primary-text-rgb': '255, 255, 255', // #FFFFFF (white)
    '--color-focus-ring-rgb': '167, 243, 208',       // #A7F3D0 (light green)
    '--color-hyperlink-rgb': '29, 78, 216',          // #1D4ED8 (blue-700)
    '--color-icon-rgb': '75, 85, 99',                // #4B5563 (gray-600)
    '--color-hover-rgb': '243, 244, 246',            // #F3F4F6 (gray-100)
    '--color-controls-background-rgb': '249, 250, 251', // #F9FAFB (slight off-white)
    '--color-active-rgb': '243, 244, 246',           // #F3F4F6 (gray-100)
    
    // Responsive spacing values
    '--content-max-width': 'min(65ch, 100%)',        // Optimal reading width
    '--content-padding': 'clamp(1rem, 5vw, 2rem)',   // Responsive padding
    
    // Component class mappings
    background: 'bg-theme-background',
    text: 'text-theme-text-primary',
    card: 'bg-theme-card-background',
    border: 'border-theme-border',
    accent: 'text-theme-primary-accent',
    hover: 'hover:bg-theme-hover',
    hadith: 'text-theme-text-primary font-bold'
  },
  dark: {
    // CSS Variables
    '--color-background-rgb': '17, 24, 39',          // #111827 (dark blue/black)
    '--color-text-primary-rgb': '249, 250, 251',     // #F9FAFB (almost white)
    '--color-text-secondary-rgb': '156, 163, 175',   // #9CA3AF (light gray)
    '--color-card-background-rgb': '31, 41, 55',     // #1F2937 (dark blue-gray)
    '--color-primary-accent-rgb': '52, 211, 153',    // #34D399 (vibrant green)
    '--color-border-rgb': '55, 65, 81',              // #374151 (medium gray)
    '--color-button-primary-bg-rgb': '52, 211, 153', // #34D399 (vibrant green)
    '--color-button-primary-text-rgb': '17, 24, 39', // #111827 (dark text)
    '--color-focus-ring-rgb': '110, 231, 183',       // #6EE7B7 (medium green)
    '--color-hyperlink-rgb': '96, 165, 250',         // #60A5FA (light blue)
    '--color-icon-rgb': '156, 163, 175',             // #9CA3AF (light gray)
    '--color-hover-rgb': '55, 65, 81',               // #374151 (gray-700)
    '--color-controls-background-rgb': '31, 41, 55', // #1F2937 (dark blue-gray)
    '--color-active-rgb': '55, 65, 81',              // #374151 (gray-700)
    
    // Responsive spacing values
    '--content-max-width': 'min(65ch, 100%)',        // Optimal reading width
    '--content-padding': 'clamp(1rem, 5vw, 2rem)',   // Responsive padding
    
    // Component class mappings
    background: 'bg-theme-background',
    text: 'text-theme-text-primary',
    card: 'bg-theme-card-background',
    border: 'border-theme-border',
    accent: 'text-theme-primary-accent',
    hover: 'hover:bg-theme-hover',
    hadith: 'text-theme-text-primary font-bold'
  },
  sepia: {
    // CSS Variables
    '--color-background-rgb': '250, 246, 230',       // #FAF6E6 (warm paper)
    '--color-text-primary-rgb': '60, 36, 21',        // #3C2415 (dark brown)
    '--color-text-secondary-rgb': '93, 78, 55',      // #5D4E37 (medium brown)
    '--color-card-background-rgb': '252, 249, 240',  // #FCF9F0 (lighter paper)
    '--color-primary-accent-rgb': '210, 180, 140',   // #D2B48C (tan)
    '--color-border-rgb': '227, 214, 188',           // #E3D6BC (light tan)
    '--color-button-primary-bg-rgb': '93, 78, 55',   // #5D4E37 (medium brown)
    '--color-button-primary-text-rgb': '250, 246, 230', // #FAF6E6 (warm paper)
    '--color-focus-ring-rgb': '210, 180, 140',       // #D2B48C (tan)
    '--color-hyperlink-rgb': '150, 100, 70',         // #96644A (reddish brown)
    '--color-icon-rgb': '93, 78, 55',                // #5D4E37 (medium brown)
    '--color-hover-rgb': '242, 235, 219',            // #F2EBDB (slightly darker paper)
    '--color-controls-background-rgb': '248, 242, 226', // #F8F2E2 (slightly darker than bg)
    '--color-active-rgb': '242, 235, 219',           // #F2EBDB (slightly darker paper)
    
    // Responsive spacing values
    '--content-max-width': 'min(65ch, 100%)',        // Optimal reading width
    '--content-padding': 'clamp(1rem, 5vw, 2rem)',   // Responsive padding
    
    // Component class mappings
    background: 'bg-theme-background',
    text: 'text-theme-text-primary',
    card: 'bg-theme-card-background',
    border: 'border-theme-border',
    accent: 'text-theme-primary-accent',
    hover: 'hover:bg-theme-hover',
    hadith: 'text-theme-text-primary font-bold'
  }
};
