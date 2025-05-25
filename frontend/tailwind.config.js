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
      },
      screens: {
        'xs': '475px',  // Added extra small breakpoint
        // Tailwind's defaults:
        // 'sm': '640px',
        // 'md': '768px',
        // 'lg': '1024px',
        // 'xl': '1280px',
        // '2xl': '1536px',
      },
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '2rem',
          lg: '4rem',
          xl: '5rem',
        },
      },
    },
  },
  plugins: [
    require('tailwind-scrollbar')
  ],
}

