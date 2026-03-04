import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import pluginVue from 'eslint-plugin-vue'

export default [
  // 忽略的文件和目录
  { ignores: ['dist', 'node_modules', '**/*.d.ts'] },

  // JavaScript 配置
  eslint.configs.recommended,

  // TypeScript 配置
  ...tseslint.configs.recommended,

  // Vue 配置
  ...pluginVue.configs['flat/recommended'],

  // 自定义规则
  {
    rules: {
      'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      'vue/multi-word-component-names': 'off'
    }
  }
]
