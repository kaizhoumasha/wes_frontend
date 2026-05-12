/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    screens: {
      sm: '480px',
      md: '768px',
      xl: '1280px'
    },
    extend: {
      colors: {
        /* ============================================
         * 工业仓储风格设计系统 - 颜色配置
         * ============================================ */

        // 主色调 - 工业琥珀/安全黄
        primary: {
          DEFAULT: '#F59E0B',
          light: '#FBBF24',
          dark: '#D97706',
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B', // 主色
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
          900: '#78350F'
        },

        // 次要色 - 工业橙
        secondary: {
          DEFAULT: '#EA580C',
          light: '#FB923C',
          dark: '#C2410C',
          50: '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FB923C',
          500: '#EA580C',
          600: '#C2410C',
          700: '#9A3412',
          800: '#7C2D12',
          900: '#431407'
        },

        // 语义色 - 安全信号系统
        safety: {
          red: '#DC2626', // 危险/紧急
          green: '#16A34A', // 安全/正常
          yellow: '#EAB308', // 警告/注意
          blue: '#3B82F6' // 信息/提示
        },

        // 工业表面色 - 深色模式
        'industrial-dark': {
          bg: '#0F172A', // 主背景
          surface: '#1E293B', // 卡片表面
          'surface-elevated': '#334155', // 提升表面
          border: 'rgba(245, 158, 11, 0.15)', // 边框
          'border-hover': 'rgba(245, 158, 11, 0.3)',
          text: '#F8FAFC', // 主文字
          'text-secondary': '#94A3B8', // 次要文字
          'text-muted': '#64748B' // 弱化文字
        },

        // 工业表面色 - 浅色模式
        'industrial-light': {
          bg: '#F8FAFC',
          surface: '#FFFFFF',
          'surface-elevated': '#F1F5F9',
          border: '#E2E8F0',
          'border-hover': '#CBD5E1',
          text: '#0F172A',
          'text-secondary': '#475569',
          'text-muted': '#94A3B8'
        },

        // 成功色 - 信号绿
        success: {
          DEFAULT: '#16A34A',
          light: '#22C55E',
          dark: '#15803D',
          glow: 'rgba(22, 163, 74, 0.2)'
        },

        // 警告色
        warning: {
          DEFAULT: '#EAB308',
          light: '#FACC15',
          dark: '#CA8A04'
        },

        // 危险色 - 安全红
        danger: {
          DEFAULT: '#DC2626',
          light: '#EF4444',
          dark: '#B91C1C'
        }
      },

      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        display: ['Inter', 'sans-serif'],
        data: ['JetBrains Mono', 'monospace']
      },

      fontSize: {
        'display-xl': ['4rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-lg': ['3rem', { lineHeight: '1.15', letterSpacing: '-0.02em' }],
        display: ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        'heading-1': ['1.875rem', { lineHeight: '1.25', fontWeight: '700' }],
        'heading-2': ['1.5rem', { lineHeight: '1.3', fontWeight: '600' }],
        'heading-3': ['1.25rem', { lineHeight: '1.4', fontWeight: '600' }],
        'data-xl': ['2rem', { lineHeight: '1.2', fontWeight: '600' }],
        'data-lg': ['1.5rem', { lineHeight: '1.25', fontWeight: '600' }],
        data: ['1.25rem', { lineHeight: '1.3', fontWeight: '600' }],
        body: ['0.875rem', { lineHeight: '1.6' }],
        caption: ['0.75rem', { lineHeight: '1.5', letterSpacing: '0.05em' }]
      },

      spacing: {
        '4xs': '2px',
        '3xs': '4px',
        '2xs': '8px',
        xs: '12px',
        sm: '16px',
        md: '24px',
        lg: '32px',
        xl: '48px',
        '2xl': '64px',
        '3xl': '96px'
      },

      borderRadius: {
        'industrial-sm': '4px',
        industrial: '8px',
        'industrial-lg': '12px',
        'industrial-xl': '16px'
      },

      boxShadow: {
        // 工业风格阴影 - 提升 opacity
        'industrial-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.08)',
        industrial: '0 4px 6px -1px rgba(0, 0, 0, 0.15), 0 2px 4px -2px rgba(0, 0, 0, 0.12)',
        'industrial-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -4px rgba(0, 0, 0, 0.15)',
        'industrial-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.25), 0 8px 10px -6px rgba(0, 0, 0, 0.2)',
        'industrial-2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.35)',

        // 发光效果 - 工业琥珀
        'amber-glow-sm': '0 0 10px rgba(245, 158, 11, 0.3)',
        'amber-glow': '0 0 20px rgba(245, 158, 11, 0.4)',
        'amber-glow-lg': '0 0 30px rgba(245, 158, 11, 0.5)',

        // 发光效果 - 信号绿
        'green-glow-sm': '0 0 10px rgba(22, 163, 74, 0.3)',
        'green-glow': '0 0 20px rgba(22, 163, 74, 0.4)',

        // 发光效果 - 安全红
        'red-glow-sm': '0 0 10px rgba(220, 38, 38, 0.3)'
      },

      backgroundImage: {
        // 工业渐变
        'industrial-gradient': 'linear-gradient(135deg, #F59E0B 0%, #EA580C 100%)',
        'industrial-gradient-subtle':
          'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(234, 88, 12, 0.05) 100%)',
        'dark-gradient': 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
        'light-gradient': 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)',

        // 警示条纹
        'warning-stripes':
          'repeating-linear-gradient(45deg, #F59E0B, #F59E0B 10px, #DC2626 10px, #DC2626 20px)',
        'warning-stripes-horizontal':
          'repeating-linear-gradient(90deg, #F59E0B, #F59E0B 40px, #DC2626 40px, #DC2626 80px)'
      },

      animation: {
        // 工业风格动画
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'pulse-amber': 'pulseAmber 2s ease-in-out infinite',
        'data-flow': 'dataFlow 2s linear infinite',
        'status-pulse': 'statusPulse 2s ease-in-out infinite',
        float: 'float 6s ease-in-out infinite',
        'scan-line': 'scanLine 3s linear infinite',
        blink: 'blink 1s step-end infinite'
      },

      keyframes: {
        pulseAmber: {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 20px rgba(245, 158, 11, 0.4)' },
          '50%': { opacity: '0.8', boxShadow: '0 0 10px rgba(245, 158, 11, 0.2)' }
        },
        dataFlow: {
          '0%, 100%': { opacity: '0.8' },
          '50%': { opacity: '0.4' }
        },
        statusPulse: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.5', transform: 'scale(0.95)' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        scanLine: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' }
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' }
        }
      },

      transitionProperty: {
        height: 'height',
        spacing: 'margin, padding',
        colors: 'background-color, border-color, color, fill, stroke',
        shadow: 'box-shadow'
      }
    }
  },
  plugins: [
    // 添加工业风格实用类
    function ({ addComponents, addUtilities, theme }) {
      const monoFontStack = theme('fontFamily.mono').join(', ')

      // 工业卡片组件
      addComponents({
        '.industrial-card': {
          backgroundColor: 'rgba(30, 41, 59, 0.8)',
          border: '1px solid rgba(245, 158, 11, 0.15)',
          borderRadius: '12px',
          padding: '24px',
          transition: 'all 0.3s ease',
          '&:hover': {
            borderColor: 'rgba(245, 158, 11, 0.3)',
            transform: 'translateY(-2px)'
          }
        },
        '.industrial-card-light': {
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
          transition: 'all 0.3s ease',
          '&:hover': {
            borderColor: '#F59E0B',
            boxShadow: '0 4px 16px rgba(245, 158, 11, 0.1)'
          }
        },
        '.industrial-input': {
          width: '100%',
          height: '48px',
          padding: '0 16px',
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(245, 158, 11, 0.2)',
          borderRadius: '8px',
          color: '#F8FAFC',
          fontFamily: monoFontStack,
          transition: 'all 0.2s ease',
          '&:focus': {
            outline: 'none',
            borderColor: '#F59E0B',
            boxShadow: '0 0 0 3px rgba(245, 158, 11, 0.1)'
          }
        },
        '.industrial-button': {
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '48px',
          padding: '0 24px',
          background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
          border: 'none',
          borderRadius: '8px',
          color: '#0F172A',
          fontWeight: '600',
          fontSize: '0.875rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 10px 20px rgba(245, 158, 11, 0.3)'
          },
          '&:active': {
            transform: 'translateY(0)'
          }
        },
        '.industrial-status-badge': {
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 10px',
          borderRadius: '6px',
          fontSize: '0.75rem',
          fontWeight: '500'
        },
        '.industrial-grid-bg': {
          backgroundImage: `
            linear-gradient(rgba(245, 158, 11, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(245, 158, 11, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }
      })

      // 实用工具类
      addUtilities({
        '.text-industrial-label': {
          fontSize: '0.75rem',
          fontWeight: '500',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: '#94A3B8'
        },
        '.font-data': {
          fontFamily: monoFontStack,
          fontVariantNumeric: 'tabular-nums'
        },
        '.border-industrial': {
          border: '1px solid rgba(245, 158, 11, 0.2)'
        },
        '.border-industrial-hover': {
          border: '1px solid rgba(245, 158, 11, 0.4)'
        },
        '.glow-amber': {
          boxShadow: '0 0 20px rgba(245, 158, 11, 0.3)'
        },
        '.glow-amber-lg': {
          boxShadow: '0 0 40px rgba(245, 158, 11, 0.4)'
        }
      })
    }
  ]
}
