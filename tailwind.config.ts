import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
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
				success: {
					DEFAULT: 'hsl(var(--success))',
					foreground: 'hsl(var(--success-foreground))'
				},
				warning: {
					DEFAULT: 'hsl(var(--warning))',
					foreground: 'hsl(var(--warning-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				// Природная палитра
				nature: {
					'deep-pine': 'hsl(var(--deep-pine))',
					'young-spruce': 'hsl(var(--young-spruce))',
					'cold-moss': 'hsl(var(--cold-moss))',
					'forest-grass': 'hsl(var(--forest-grass))',
					'pine-cone': 'hsl(var(--pine-cone))',
					'morning-mist': 'hsl(var(--morning-mist))',
					'dark-bark': 'hsl(var(--dark-bark))',
					'young-bark': 'hsl(var(--young-bark))',
					'summer-leaf': 'hsl(var(--summer-leaf))',
					'spring-leaf': 'hsl(var(--spring-leaf))',
					'dry-leaf': 'hsl(var(--dry-leaf))',
					'silver-birch': 'hsl(var(--silver-birch))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			backgroundImage: {
				'gradient-forest': 'var(--gradient-forest)',
				'gradient-nature': 'var(--gradient-nature)',
				'gradient-earth': 'var(--gradient-earth)',
				'gradient-subtle': 'var(--gradient-subtle)',
				'gradient-card': 'var(--gradient-card)'
			},
			boxShadow: {
				'nature': 'var(--shadow-nature)',
				'elevated': 'var(--shadow-elevated)',
				'glow': 'var(--shadow-glow)'
			},
			transitionTimingFunction: {
				'smooth': 'var(--transition-smooth)',
				'bounce': 'var(--transition-bounce)'
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
				},
				'fade-in': {
					from: {
						opacity: '0',
						transform: 'translateY(10px)'
					},
					to: {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'slide-in': {
					from: {
						transform: 'translateX(-10px)',
						opacity: '0'
					},
					to: {
						transform: 'translateX(0)',
						opacity: '1'
					}
				},
				'leaf-float': {
					'0%, 100%': { 
						transform: 'translateY(0px) rotate(0deg)' 
					},
					'33%': { 
						transform: 'translateY(-10px) rotate(2deg)' 
					},
					'66%': { 
						transform: 'translateY(-5px) rotate(-1deg)' 
					}
				},
				'nature-pulse': {
					'0%, 100%': { 
						opacity: '1', 
						transform: 'scale(1)' 
					},
					'50%': { 
						opacity: '0.8', 
						transform: 'scale(1.05)' 
					}
				},
				'scale-bounce': {
					'0%, 100%': { transform: 'scale(1)' },
					'50%': { transform: 'scale(1.1)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.5s ease-out',
				'slide-in': 'slide-in 0.3s ease-out',
				'leaf-float': 'leaf-float 6s ease-in-out infinite',
				'nature-pulse': 'nature-pulse 2s ease-in-out infinite',
				'scale-bounce': 'scale-bounce 0.6s ease-in-out infinite'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
