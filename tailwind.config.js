/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],

  theme: {
    /* ========================================================================
       CONTAINER — uses design system tokens
       ======================================================================== */
    container: {
      center: true,
      padding: 'var(--container-padding)',
      screens: {
        DEFAULT: 'var(--container-wide)',
      },
    },

    extend: {
      /* ====================================================================
         COLORS — mapped to CSS variable role/surface/text system
         ==================================================================== */
      colors: {
        /* Role colors (semantic) */
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        secondary: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87',
        },
        // Answer colors for game
        teal: {
          DEFAULT: '#14b8a6',
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
        pink: {
          DEFAULT: '#ec4899',
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#ec4899',
          600: '#db2777',
          700: '#be185d',
          800: '#9d174d',
          900: '#831843',
        },
        purple: {
          DEFAULT: '#a855f7',
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87',
        },
        orange: {
          DEFAULT: '#f97316',
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
      },

      /* ====================================================================
         FONT SIZE — fluid tokens (clamp + calc)
         Usage: text-sm, text-base, text-2xl etc.
         ==================================================================== */
      fontSize: {
        'xs': 'var(--fs-xs-fluid)',
        'sm': 'var(--fs-sm-fluid)',
        'base': 'var(--fs-base-fluid)',
        'lg': 'var(--fs-lg-fluid)',
        'xl': 'var(--fs-xl-fluid)',
        '2xl': 'var(--fs-2xl-fluid)',
        '3xl': 'var(--fs-3xl-fluid)',
        '4xl': 'var(--fs-4xl-fluid)',
        '5xl': 'var(--fs-5xl-fluid)',
        '6xl': 'var(--fs-6xl-fluid)',
        '7xl': 'var(--fs-7xl-fluid)',
      },

      /* ====================================================================
         FONT FAMILY — from design system
         ==================================================================== */
      fontFamily: {
        sans: ['var(--font-sans)'],
        mono: ['var(--font-mono)'],
      },

      /* ====================================================================
         FONT WEIGHT — from design system
         ==================================================================== */
      fontWeight: {
        light: 'var(--font-light)',
        normal: 'var(--font-normal)',
        medium: 'var(--font-medium)',
        semibold: 'var(--font-semibold)',
        bold: 'var(--font-bold)',
        extrabold: 'var(--font-extrabold)',
      },

      /* ====================================================================
         LINE HEIGHT — from design system
         ==================================================================== */
      lineHeight: {
        none: 'var(--leading-none)',
        tight: 'var(--leading-tight)',
        snug: 'var(--leading-snug)',
        normal: 'var(--leading-normal)',
        relaxed: 'var(--leading-relaxed)',
        loose: 'var(--leading-loose)',
        fluid: 'var(--leading-fluid)',
      },

      /* ====================================================================
         LETTER SPACING — from design system
         ==================================================================== */
      letterSpacing: {
        tight: 'var(--tracking-tight)',
        normal: 'var(--tracking-normal)',
        wide: 'var(--tracking-wide)',
      },

      /* ====================================================================
         SPACING — fluid tokens (clamp + calc)
         Applies to: p-*, m-*, gap-*, w-*, h-*, etc.
         ==================================================================== */
      spacing: {
        '0': 'var(--spacing-0)',
        '1': 'var(--space-1-fluid)',
        '2': 'var(--space-2-fluid)',
        '3': 'var(--space-3-fluid)',
        '4': 'var(--space-4-fluid)',
        '5': 'var(--space-5-fluid)',
        '6': 'var(--space-6-fluid)',
        '8': 'var(--space-8-fluid)',
        '10': 'var(--space-10-fluid)',
        '12': 'var(--space-12-fluid)',
        '16': 'var(--space-16-fluid)',
        '20': 'var(--space-20-fluid)',
        '24': 'var(--space-24-fluid)',
        '32': 'var(--space-32-fluid)',
        '128': '32rem',
        '144': '36rem',
      },

      /* ====================================================================
         BORDER RADIUS — from design system
         ==================================================================== */
      borderRadius: {
        'sm': 'var(--radius-sm)',
        DEFAULT: 'var(--radius-base)',
        'md': 'var(--radius-md)',
        'lg': 'var(--radius-lg)',
        'xl': 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
        'full': 'var(--radius-full)',
      },

      /* ====================================================================
         BOX SHADOW — from design system
         ==================================================================== */
      boxShadow: {
        'sm': 'var(--shadow-sm)',
        DEFAULT: 'var(--shadow-base)',
        'md': 'var(--shadow-md)',
        'lg': 'var(--shadow-lg)',
        'xl': 'var(--shadow-xl)',
        '2xl': 'var(--shadow-2xl)',
        'inner': 'var(--shadow-inner)',
      },

      /* ====================================================================
         TRANSITION — from design system
         ==================================================================== */
      transitionDuration: {
        fast: 'var(--duration-fast)',
        DEFAULT: 'var(--duration-normal)',
        slow: 'var(--duration-slow)',
        slower: 'var(--duration-slower)',
      },

      transitionTimingFunction: {
        linear: 'var(--ease-linear)',
        in: 'var(--ease-in)',
        out: 'var(--ease-out)',
        'in-out': 'var(--ease-in-out)',
      },

      /* ====================================================================
         Z-INDEX — from design system
         ==================================================================== */
      zIndex: {
        dropdown: 'var(--z-dropdown)',
        sticky: 'var(--z-sticky)',
        fixed: 'var(--z-fixed)',
        'modal-backdrop': 'var(--z-modal-backdrop)',
        modal: 'var(--z-modal)',
        popover: 'var(--z-popover)',
        tooltip: 'var(--z-tooltip)',
      },

      /* ====================================================================
         MAX WIDTH — container widths from design system
         ==================================================================== */
      maxWidth: {
        narrow: 'var(--container-narrow)',
        wide: 'var(--container-wide)',
        content: 'var(--layout-max-content-width)',
        '8xl': '88rem',
        '9xl': '96rem',
      },

      /* ====================================================================
         ANIMATIONS — preserved from existing config
         ==================================================================== */
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'bounce-slow': 'bounce 3s infinite',
        'flame-flicker': 'flame-flicker 1s ease-in-out infinite',
        'confetti-fall': 'confetti-fall 3s linear infinite',
      },
      keyframes: {
        'flame-flicker': {
          '0%, 100%': { transform: 'scale(1) rotate(-2deg)', filter: 'brightness(1)' },
          '50%': { transform: 'scale(1.1) rotate(2deg)', filter: 'brightness(1.2)' },
        },
        'confetti-fall': {
          '0%': { transform: 'translateY(-100vh) rotate(0deg)' },
          '100%': { transform: 'translateY(100vh) rotate(720deg)' },
        },
      },
    },
  },

  /* ========================================================================
     PLUGINS — custom size utilities
     ======================================================================== */
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        /* Fluid sizing utilities: .size-xs through .size-xl */
        '.size-xs': { width: 'var(--size-xs-fluid)', height: 'var(--size-xs-fluid)' },
        '.size-sm': { width: 'var(--size-sm-fluid)', height: 'var(--size-sm-fluid)' },
        '.size-md': { width: 'var(--size-md-fluid)', height: 'var(--size-md-fluid)' },
        '.size-lg': { width: 'var(--size-lg-fluid)', height: 'var(--size-lg-fluid)' },
        '.size-xl': { width: 'var(--size-xl-fluid)', height: 'var(--size-xl-fluid)' },

        /* Transition shorthand utilities */
        '.transition-fast': { transition: 'var(--transition-fast)' },
        '.transition-normal': { transition: 'var(--transition-normal)' },
      });
    },
  ],
}
