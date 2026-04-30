/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1E3A5F',
          accent: '#2E86C1',
          light: '#D6E4F0',
        },
        success: '#1A6B3A',
        warning: '#E65100',
        danger: '#B71C1C',
        platine: '#4A148C',
        text: {
          DEFAULT: '#212121',
          muted: '#757575',
        },
        bg: {
          DEFAULT: '#F5F5F5',
          card: '#FFFFFF',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Roboto Mono', 'monospace'],
      },
      fontSize: {
        'page-title': ['22px', { fontWeight: '700', lineHeight: '1.3' }],
        'section-title': ['18px', { fontWeight: '600', lineHeight: '1.4' }],
        body: ['14px', { fontWeight: '400', lineHeight: '1.5' }],
        label: ['13px', { fontWeight: '500', lineHeight: '1.4' }],
        code: ['13px', { fontWeight: '400', lineHeight: '1.4' }],
      },
      minHeight: {
        touch: '44px',
      },
      minWidth: {
        touch: '44px',
      },
    },
  },
  plugins: [],
};
