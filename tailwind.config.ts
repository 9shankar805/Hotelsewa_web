import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#E60023',
        'primary-light': '#FF4D6A',
        'primary-dark': '#B8001C',
        secondary: '#FF6B6B',
        background: '#F7F8FA',
        'dark-gray': '#1A1A2E',
        gray: '#6B7280',
        'light-gray': '#E8ECF0',
        placeholder: '#ADB5BD',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6',
        gold: '#FFB800',
        surface: '#F0F2F5',
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        card: '0 4px 20px rgba(0,0,0,0.06)',
        elevated: '0 8px 32px rgba(0,0,0,0.12)',
        primary: '0 8px 20px rgba(230,0,35,0.35)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.25rem',
        '4xl': '1.5rem',
      },
    },
  },
  plugins: [],
}
export default config
