import type { Config } from 'tailwindcss'
import typography from '@tailwindcss/typography'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'space-navy': '#070A12',
        'card-dark': '#171E2D',
        'slate-rich': '#253252',
        'accent-indigo': '#7C8BFF',
        'accent-blue': '#58A4FF',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glass: '0 18px 65px rgba(2, 6, 23, 0.48)',
      },
      backgroundImage: {
        'fluid-dark': 'linear-gradient(165deg, #060911 0%, #0e1421 36%, #151e32 100%)',
      },
    },
  },
  plugins: [typography],
}
export default config
