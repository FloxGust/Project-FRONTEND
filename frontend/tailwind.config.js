/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        soc: {
          bg:       '#000000',
          surface:  '#000000',
          border:   '#1f2937',
          accent:   '#00d4ff',
          critical: '#ff3b3b',
          high:     '#ff8c00',
          medium:   '#ffd700',
          low:      '#00d48a',
          muted:    '#6b7280',
        },
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'monospace'],
        sans: ['"IBM Plex Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
