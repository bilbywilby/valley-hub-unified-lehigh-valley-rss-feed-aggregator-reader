/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
  	extend: {
  		fontFamily: {
  			sans: [
  				'Inter',
  				'-apple-system',
  				'sans-serif'
  			],
			display: [
				'Inter',
				'system-ui',
				'sans-serif'
			],
  			mono: [
  				'JetBrains Mono',
  				'Fira Code',
  				'monospace'
  			],
        terminal: [
          'JetBrains Mono',
          'Fira Code',
          'ui-monospace',
          'monospace'
        ]
  		},
  		borderRadius: {
  			'3xl': '24px',
  			'4xl': '32px',
        '5xl': '40px',
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
        terminal: {
          bg: '#020205',
          green: '#4ade80',
          orange: '#f38020'
        },
  			brand: {
  				orange: 'hsl(var(--brand-orange))',
  				'red-orange': 'hsl(var(--brand-red-orange))',
  			},
        surface: {
          DEFAULT: 'hsl(var(--surface))',
          variant: 'hsl(var(--surface-variant))',
          container: {
            low: 'hsl(var(--surface-container-low))',
            DEFAULT: 'hsl(var(--surface-container))',
            high: 'hsl(var(--surface-container-high))',
            highest: 'hsl(var(--surface-container-highest))',
          }
        },
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))',
          container: 'hsl(var(--primary-container))',
          'on-container': 'hsl(var(--on-primary-container))'
  			},
  			border: 'hsl(var(--border))',
  			ring: 'hsl(var(--ring))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			input: 'hsl(var(--input))'
  		},
  		boxShadow: {
  			soft: '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
  			glow: '0 0 20px -5px rgba(243, 128, 32, 0.4)',
        'md3-1': '0 1px 2px rgba(0,0,0,0.3), 0 1px 3px 1px rgba(0,0,0,0.15)',
        'md3-2': '0 1px 2px rgba(0,0,0,0.3), 0 2px 6px 2px rgba(0,0,0,0.15)',
        'md3-3': '0 4px 8px 3px rgba(0,0,0,0.15), 0 1px 3px rgba(0,0,0,0.3)',
        'md3-4': '0 6px 10px 4px rgba(0,0,0,0.15), 0 2px 3px rgba(0,0,0,0.3)',
        'md3-5': '0 8px 12px 6px rgba(0,0,0,0.15), 0 4px 4px rgba(0,0,0,0.3)'
  		},
  		keyframes: {
  			'scanline': {
  				'0%': { transform: 'translateY(-100%)' },
  				'100%': { transform: 'translateY(100%)' }
  			},
        'flicker': {
          '0%': { opacity: '0.97' },
          '5%': { opacity: '0.92' },
          '10%': { opacity: '0.98' },
          '15%': { opacity: '0.94' },
          '20%': { opacity: '0.99' },
          '100%': { opacity: '1.0' }
        },
        'pulse-fast': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.3' }
        }
  		},
  		animation: {
  			'scanline': 'scanline 8s linear infinite',
  			'flicker': 'flicker 0.15s infinite',
        'spin-slow': 'spin 3s linear infinite',
        'pulse-fast': 'pulse-fast 0.5s ease-in-out infinite'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")]
}