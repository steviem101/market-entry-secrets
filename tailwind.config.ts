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
				'rc-success':     'hsl(var(--rc-success))',
				// report_v2 renderer palette — fixed print-faithful hexes mapped from
				// the redesign prototypes (design_handoff_mes_report_redesign/tokens.md).
				// report.sky intentionally equals --primary; the report surface never
				// theme-inverts, so these stay literal rather than HSL vars.
				report: {
					sky:     '#29a3e3',
					action:  '#178fc9',
					ink:     '#23272e',
					surface: '#171c26',
					bg:      '#f4f6f8',
					border:  '#e8ecef',
					rule:    '#eef1f4',
					muted:   '#67707e',
					caption: '#8a94a3',
					tint:    '#f2f9fd',
					'tint-border': '#cfe6f4',
					good:    '#0ea371',
					warn:    '#d97706',
					'warn-accent': '#f5b84b',
					'warn-tint': '#fdf5e7',
					risk:    '#dc2626',
					// identity-slot monogram fills (README identity assets)
					'person-bg': '#e3f2fb',
					'company-bg': '#eef4f8',
					// sources-band tier headers + inferred pill (reference markup)
					'sky-soft':  '#7cc9ef',
					'grey-soft': '#b4bcc8',
					'surface-rule': '#2a3140',
					'ink-soft': '#434b56',
					// request hooks + confirmations (README interactions)
					dash: '#c9d2da',
					'hook-bg': '#fafbfc',
					'confirm-bg': '#e9f7f1',
					'confirm-border': '#b9e4d2',
					'confirm-text': '#0b7a55',
					'inferred-text': '#57606d',
					'inferred-bg':  '#eef0f3'
				}
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
