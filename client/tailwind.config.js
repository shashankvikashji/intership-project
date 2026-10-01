/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#111318',
        surface: '#181A21',
        surface2: '#1E212A',
        border: '#2A2D36',
        muted: '#9CA3AF',
        paper: '#F3F4F6',
        accent: '#8B5CF6',
        accentHover: '#A78BFA'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        serif: ['Source Serif 4', 'Georgia', 'serif']
      }
    }
  },
  plugins: []
};
