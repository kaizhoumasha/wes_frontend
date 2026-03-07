/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: 'class', // 启用基于 class 的暗黑模式
  theme: {
    extend: {
      colors: {
        // 科技蓝主色（与 Login.vue 保持一致）
        primary: {
          DEFAULT: '#00f3ff',
          light: '#33f6ff',
          dark: '#00c2cc',
          DEFAULT_RGB: 'rgb(0 243 255)',
          light_RGB: 'rgb(51 246 255)',
          dark_RGB: 'rgb(0 194 204)'
        },
        // 绿色辅助色（与 Login.vue 保持一致）
        success: {
          DEFAULT: '#0f8',
          DEFAULT_RGB: 'rgb(0 255 136)'
        },
        // 表面色（深色玻璃态）
        surface: {
          DEFAULT: 'rgb(13 17 23 / 80%)',
          hover: 'rgb(0 243 255 / 8%)',
          border: 'rgb(0 243 255 / 10%)',
          elevated: 'rgb(13 17 23 / 95%)'
        },
        // 背景色（深色渐变）
        background: {
          DEFAULT: '#0d1117',
          dark: '#0a0e27',
          light: '#1a1f3a'
        }
      },
      boxShadow: {
        // 统一的发光效果等级体系 - 科技蓝
        'glow-xs': '0 0 10px rgb(0 243 255 / 8%)',
        'glow-sm': '0 0 20px rgb(0 243 255 / 12%)',
        glow: '0 0 40px rgb(0 243 255 / 15%)', // 默认
        'glow-md': '0 0 40px rgb(0 243 255 / 15%)', // 别名
        'glow-lg': '0 0 60px rgb(0 243 255 / 20%)',
        'glow-xl': '0 0 80px rgb(0 243 255 / 25%)',
        // 成功色发光效果等级体系
        'success-glow-xs': '0 0 10px rgb(0 255 136 / 20%)',
        'success-glow-sm': '0 0 20px rgb(0 255 136 / 30%)',
        'success-glow': '0 0 30px rgb(0 255 136 / 40%)', // 默认
        'success-glow-md': '0 0 30px rgb(0 255 136 / 40%)', // 别名
        'success-glow-lg': '0 0 40px rgb(0 255 136 / 50%)',
        'success-glow-xl': '0 0 50px rgb(0 255 136 / 60%)'
      },
      backdropBlur: {
        // 细粒度模糊（用于玻璃态效果）
        xs: '2px'
      },
      animation: {
        // 脉冲动画（与 Login.vue 保持一致）
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        // 数据流动画
        'data-flow': 'dataFlow 2s linear infinite',
        // 状态脉冲动画
        'status-pulse': 'statusPulse 2s ease-in-out infinite'
      },
      keyframes: {
        // 数据流动画关键帧
        dataFlow: {
          '0%, 100%': { opacity: '0.8' },
          '50%': { opacity: '0.5' }
        },
        // 状态脉冲动画关键帧
        statusPulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' }
        }
      },
      transitionProperty: {
        height: 'height',
        spacing: 'margin, padding'
      }
    }
  },
  plugins: []
}
