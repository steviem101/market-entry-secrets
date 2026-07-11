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
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
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
				},
				'mes-teal':       'hsl(var(--mes-teal))',
				'mes-teal-dark':  'hsl(var(--mes-teal-dark))',
				'mes-blue-light': 'hsl(var(--mes-blue-light))',
				'mes-ink':        'hsl(var(--mes-ink))',
				'mes-ink-surface':'hsl(var(--mes-ink-surface))',
				'mes-ink-soft':   'hsl(var(--mes-ink-soft))',
				'mes-ink-muted':  'hsl(var(--mes-ink-muted))',
				'mes-success':    'hsl(var(--mes-success))',
				'mes-warning':    'hsl(var(--mes-warning))',
				'mes-border':     'hsl(var(--mes-border))',
				'mes-bg':         'hsl(var(--mes-bg))',
				'mes-card':       'hsl(var(--mes-card))',

				/* Report Creator v2 redesign palette (docs/redesign/handoff/README.md §Design tokens) */
				'rc-primary':     'hsl(var(--rc-primary))',
				'rc-primary-700': 'hsl(var(--rc-primary-700))',
				'rc-ink':         'hsl(var(--rc-ink))',
				'rc-body':        'hsl(var(--rc-body))',
				'rc-muted':       'hsl(var(--rc-muted))',
				'rc-line':        'hsl(var(--rc-line))',
				'rc-canvas':      'hsl(var(--rc-canvas))',
				'rc-sky-soft':    'hsl(var(--rc-sky-soft))',
				'rc-sky-tint':    'hsl(var(--rc-sky-tint))',
				'rc-success':     'hsl(var(--rc-success))'
			},
			fontFamily: {
				mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
				rc:   ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif']
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
			}
		}
	},
	plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
