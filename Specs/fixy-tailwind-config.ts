// ============================================
// FILE: tailwind.config.ts
// C74 Production Configuration
// Based on: Friendly/Clean + Emerald Green Design System
// ============================================

import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'], // Future dark mode support
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        // Brand Colors
        primary: {
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#10B981', // Main brand color (TaskRabbit-style green)
          600: '#059669',
          700: '#047857',
          800: '#065F46',
          900: '#064E3B',
          950: '#022C22',
        },
        secondary: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6', // Trust blue for secondary actions
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
          950: '#172554',
        },
        accent: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B', // Amber for highlights/urgency
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
          900: '#78350F',
        },
        success: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          500: '#22C55E', // Completion/success states
          600: '#16A34A',
        },
        warning: {
          50: '#FEF3C7',
          500: '#F59E0B',
          600: '#D97706',
        },
        error: {
          50: '#FEF2F2',
          500: '#EF4444', // Errors/cancellations
          600: '#DC2626',
        },
        
        // Neutral Grays
        neutral: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        },

        // ShadCN UI Design Tokens
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      
      borderRadius: {
        lg: '0.75rem',  // 12px - friendly rounded corners
        md: '0.5rem',   // 8px
        sm: '0.375rem', // 6px
      },
      
      fontFamily: {
        sans: [
          'Inter',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        arabic: [
          // System fonts for best Arabic rendering
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
      },
      
      fontSize: {
        // Mobile-optimized sizes
        'xs': ['0.75rem', { lineHeight: '1rem' }],      // 12px
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],  // 14px
        'base': ['1rem', { lineHeight: '1.5rem' }],     // 16px
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],  // 18px
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],   // 20px
        '2xl': ['1.5rem', { lineHeight: '2rem' }],      // 24px
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],   // 36px
      },
      
      spacing: {
        // Consistent spacing scale
        '18': '4.5rem',  // 72px
        '22': '5.5rem',  // 88px
        '128': '32rem',  // 512px
      },
      
      boxShadow: {
        // Friendly, soft shadows
        'sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'DEFAULT': '0 2px 8px -2px rgb(0 0 0 / 0.1)',
        'md': '0 4px 12px -2px rgb(0 0 0 / 0.1)',
        'lg': '0 8px 24px -4px rgb(0 0 0 / 0.1)',
        'xl': '0 16px 40px -8px rgb(0 0 0 / 0.15)',
      },
      
      animation: {
        // Subtle, friendly animations
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      
      // Custom utilities
      screens: {
        'xs': '475px',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    require('tailwindcss-rtl'), // RTL support for Arabic
    require('@tailwindcss/forms'), // Better form styling
  ],
}

export default config

// ============================================
// FILE: app/globals.css
// CSS Variables for ShadCN UI
// ============================================

/*
Paste this into your app/globals.css file:

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 160 84% 39%;        (Green #10B981)
    --primary-foreground: 0 0% 100%;
    --secondary: 217.2 91.2% 59.8%; (Blue #3B82F6)
    --secondary-foreground: 0 0% 100%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 38 92% 50%;          (Amber #F59E0B)
    --accent-foreground: 0 0% 100%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 100%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 160 84% 39%;           (Green ring on focus)
    --radius: 0.75rem;             (12px rounded corners)
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 160 84% 39%;
    --primary-foreground: 0 0% 100%;
    --secondary: 217.2 91.2% 59.8%;
    --secondary-foreground: 0 0% 100%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 38 92% 50%;
    --accent-foreground: 0 0% 100%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 0 0% 100%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 160 84% 39%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
    font-feature-settings: "rlig" 1, "calt" 1;
  }
}

(RTL Support)
[dir="rtl"] {
  direction: rtl;
}

[dir="rtl"] .rtl\:space-x-reverse > :not([hidden]) ~ :not([hidden]) {
  --tw-space-x-reverse: 1;
}

(Arabic font optimization)
:lang(ar) {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
*/

// ============================================
// USAGE EXAMPLES
// ============================================

/*
// Primary Button
<button className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg">
  Create Job
</button>

// Success Badge
<span className="bg-success-100 text-success-700 px-3 py-1 rounded-full text-sm">
  Completed
</span>

// Card with shadow
<div className="bg-white rounded-lg shadow-md p-6">
  Content
</div>

// Mobile-first responsive
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  Cards
</div>

// RTL-aware margin
<div className="ml-4 rtl:mr-4 rtl:ml-0">
  Content
</div>
*/