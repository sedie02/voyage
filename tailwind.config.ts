import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Voyage Design System Colors
      colors: {
        // Base colors
        bg: '#F8FBFC', // cool white background
        surface: '#FFFFFF',

        // Text colors
        text: {
          DEFAULT: '#1A1A1A',
          muted: '#475569', // WCAG AA compliant
          secondary: '#6B7280',
        },

        // Primary - Mint Green
        primary: {
          DEFAULT: '#13C892',
          hover: '#10B07F',
          50: '#E6F9F3',
          100: '#CCF3E7',
          200: '#99E7CF',
          300: '#66DBB7',
          400: '#33CF9F',
          500: '#13C892',
          600: '#10B07F',
          700: '#0D9869',
          800: '#0A8053',
          900: '#07683D',
        },

        // Accent - Sky Blue (for maps/empty states)
        sky: {
          DEFAULT: '#A8D3E0',
          light: '#DDEFF4',
          50: '#F0F8FA',
          100: '#DDEFF4',
          200: '#BBE0E9',
          300: '#A8D3E0',
          400: '#8AC4D4',
          500: '#6BB5C8',
          600: '#4DA6BC',
          700: '#3E8497',
          800: '#2F6372',
          900: '#20424D',
        },

        // Border & Shadow
        border: '#E6ECEF',

        // Semantic colors
        success: '#13C892',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#A8D3E0',
      },

      // Custom spacing voor consistent design
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },

      // Typography
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
      },

      // Border radius voor consistent design
      borderRadius: {
        '4xl': '2rem',
      },

      // Box shadows - soft, blurry, low-opacity
      boxShadow: {
        sm: '0 1px 2px 0 rgba(16, 24, 40, 0.06), 0 1px 3px 0 rgba(16, 24, 40, 0.10)',
        DEFAULT: '0 2px 4px -1px rgba(16, 24, 40, 0.06), 0 4px 6px -1px rgba(16, 24, 40, 0.10)',
        md: '0 4px 6px -1px rgba(16, 24, 40, 0.08), 0 8px 12px -2px rgba(16, 24, 40, 0.12)',
        lg: '0 10px 15px -3px rgba(16, 24, 40, 0.08), 0 16px 24px -4px rgba(16, 24, 40, 0.12)',
        xl: '0 20px 25px -5px rgba(16, 24, 40, 0.10), 0 10px 10px -5px rgba(16, 24, 40, 0.04)',
        '2xl': '0 25px 50px -12px rgba(16, 24, 40, 0.25)',
      },

      // Travel-inspired gradients
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'travel-gradient': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'sunset-gradient': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'ocean-gradient': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'forest-gradient': 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      },

      // Animations
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-in-up': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-in-down': {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'blob': {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-in-up': 'slide-in-up 0.3s ease-out',
        'slide-in-down': 'slide-in-down 0.3s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
        'spin-slow': 'spin-slow 3s linear infinite',
        'blob': 'blob 7s infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },

      // Screens voor responsive design
      screens: {
        xs: '475px',
        // sm: 640px (default)
        // md: 768px (default)
        // lg: 1024px (default)
        // xl: 1280px (default)
        '2xl': '1536px',
      },
    },
  },
  plugins: [
    // Forms plugin voor betere form styling
    require('@tailwindcss/forms'),
    // Typography plugin voor rich text
    require('@tailwindcss/typography'),
    // Aspect ratio plugin
    require('@tailwindcss/aspect-ratio'),
  ],
};

export default config;
