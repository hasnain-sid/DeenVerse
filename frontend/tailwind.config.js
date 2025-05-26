/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Themeable colors using CSS variables (RGB format for opacity)
        'theme-background': 'rgba(var(--color-background-rgb), <alpha-value>)',
        'theme-text-primary': 'rgba(var(--color-text-primary-rgb), <alpha-value>)',
        'theme-text-secondary': 'rgba(var(--color-text-secondary-rgb), <alpha-value>)',
        'theme-card-bg': 'rgba(var(--color-card-background-rgb), <alpha-value>)',
        'theme-primary-accent': 'rgba(var(--color-primary-accent-rgb), <alpha-value>)',
        'theme-border': 'rgba(var(--color-border-rgb), <alpha-value>)',
        'theme-button-primary-bg': 'rgba(var(--color-button-primary-bg-rgb), <alpha-value>)',
        'theme-button-primary-text': 'rgba(var(--color-button-primary-text-rgb), <alpha-value>)',
        'theme-focus-ring': 'rgba(var(--color-focus-ring-rgb), <alpha-value>)',
        'theme-hyperlink': 'rgba(var(--color-hyperlink-rgb), <alpha-value>)',

        // Keep your specific brand colors if needed for non-themeable elements, 
        // but prefer using the themeable versions above for general UI.
        'brand-light-green': '#E6FFFA',
        'brand-charcoal': '#1F2937',
        'brand-white': '#FFFFFF',
        'brand-off-white': '#F9FAFB',
      },      screens: {
        'xs-mobile': '320px', // Small mobile
        'mobile': '375px',    // Medium mobile
        'lg-mobile': '425px', // Large mobile
        'xs': '475px',        // Extra small breakpoint (existing)
        'sm': '640px',        // Small tablet
        'md': '768px',        // Tablet
        'lg': '1024px',       // Desktop
        'xl': '1280px',       // Large desktop
        '2xl': '1440px',      // Extra large desktop
        '3xl': '1920px',      // Ultra large screens
      },      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          'xs-mobile': '1rem',
          'mobile': '1.25rem',
          'lg-mobile': '1.5rem',
          'sm': '2rem',
          'md': '2.5rem',
          'lg': '4rem',
          'xl': '5rem',
          '2xl': '6rem',
        },
      },
      fontSize: {
        'fluid-xs': 'clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem)',
        'fluid-sm': 'clamp(0.875rem, 0.8rem + 0.375vw, 1rem)',
        'fluid-base': 'clamp(1rem, 0.95rem + 0.25vw, 1.125rem)',
        'fluid-lg': 'clamp(1.125rem, 1.05rem + 0.375vw, 1.25rem)',
        'fluid-xl': 'clamp(1.25rem, 1.15rem + 0.5vw, 1.5rem)',
        'fluid-2xl': 'clamp(1.5rem, 1.3rem + 1vw, 1.875rem)',
        'fluid-3xl': 'clamp(1.875rem, 1.65rem + 1.125vw, 2.25rem)',
        'fluid-4xl': 'clamp(2.25rem, 1.95rem + 1.5vw, 3rem)',
        'fluid-5xl': 'clamp(3rem, 2.5rem + 2.5vw, 4rem)',
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
        'fluid-1': 'clamp(0.25rem, 0.2rem + 0.25vw, 0.5rem)',
        'fluid-2': 'clamp(0.5rem, 0.4rem + 0.5vw, 0.75rem)',
        'fluid-3': 'clamp(0.75rem, 0.65rem + 0.5vw, 1rem)',
        'fluid-4': 'clamp(1rem, 0.85rem + 0.75vw, 1.5rem)',
        'fluid-6': 'clamp(1.5rem, 1.3rem + 1vw, 2rem)',
        'fluid-8': 'clamp(2rem, 1.7rem + 1.5vw, 3rem)',
        'fluid-12': 'clamp(3rem, 2.5rem + 2.5vw, 5rem)',
        'fluid-16': 'clamp(4rem, 3.3rem + 3.5vw, 7rem)',
      },
    },
  },
  plugins: [
    require('tailwind-scrollbar')
  ],
}

