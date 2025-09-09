import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		fontFamily: {
  			sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
  		},
  		fontSize: {
  			'xs': ['12px', { lineHeight: '18px', letterSpacing: '0.005em' }],
  			'sm': ['14px', { lineHeight: '22px', letterSpacing: '0' }],
  			'base': ['16px', { lineHeight: '26px', letterSpacing: '-0.003em' }],
  			'lg': ['18px', { lineHeight: '28px', letterSpacing: '-0.006em' }],
  			'xl': ['20px', { lineHeight: '30px', letterSpacing: '-0.01em' }],
  			'2xl': ['24px', { lineHeight: '34px', letterSpacing: '-0.014em' }],
  			'3xl': ['28px', { lineHeight: '38px', letterSpacing: '-0.017em' }],
  			'4xl': ['36px', { lineHeight: '44px', letterSpacing: '-0.019em' }],
  			'5xl': ['48px', { lineHeight: '56px', letterSpacing: '-0.021em' }],
  		},
  		colors: {
  			border: {
  				DEFAULT: 'hsl(var(--border))',
  				subtle: 'hsl(var(--border-subtle))',
  				strong: 'hsl(var(--border-strong))',
  			},
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))',
  				hover: 'hsl(var(--primary-hover))',
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))',
  				hover: 'hsl(var(--card-hover))',
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		},
  		boxShadow: {
  			'xs': 'var(--shadow-xs)',
  			'sm': 'var(--shadow-sm)',
  			'md': 'var(--shadow-md)',
  			'lg': 'var(--shadow-lg)',
  			'glow': '0 0 0 3px hsl(var(--ring) / 0.25)',
  			'inner-sm': 'inset 0 1px 1px 0 rgb(0 0 0 / 0.05)',
  		},
  		transitionTimingFunction: {
  			'out-expo': 'var(--ease-out-expo)',
  			'spring': 'var(--ease-spring)',
  		},
  		transitionDuration: {
  			'250': '250ms',
  			'350': '350ms',
  			'400': '400ms',
  		}
  	}
  },
  plugins: [tailwindcssAnimate],
};
export default config;