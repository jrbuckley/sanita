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
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('daisyui')
  ],
  daisyui: {
    themes: [
      {
        sanita: {
          primary: '#22c55e',
          secondary: '#0ea5e9',
          accent: '#37cdbe',
          neutral: '#3d4451',
          'base-100': '#ffffff',
        },
      },
    ],
  },
}

export default config 