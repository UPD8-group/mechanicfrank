/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: '#0c0a09',
        amber: {
          DEFAULT: '#fbbf24',
          dim: '#d99e1c',
        },
        line: '#1e1e22',
        muted: '#a8a29e',
        body: '#e7e5e4',
      },
      fontFamily: {
        display: ['Anton', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
