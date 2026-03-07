import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import pluginVue from 'eslint-plugin-vue'
import vueParser from 'vue-eslint-parser'
import globals from 'globals'

export default [
  // 忽略的文件和目录
  { ignores: ['dist', 'node_modules', '**/*.d.ts'] },

  // JavaScript 配置
  eslint.configs.recommended,

  // TypeScript 配置
  ...tseslint.configs.recommended,

  // Vue 配置
  ...pluginVue.configs['flat/recommended'],

  // 禁用 Vue 格式化规则，让 Prettier 处理（放在 Vue 配置之后）
  {
    rules: {
      'vue/max-attributes-per-line': 'off',
      'vue/first-attribute-linebreak': 'off',
      'vue/html-indent': 'off',
      'vue/html-closing-bracket-newline': 'off',
      'vue/html-self-closing': 'off',
      'vue/singleline-html-element-content-newline': 'off',
      'vue/multiline-html-element-content-newline': 'off'
    }
  },

  // Vue 文件的 TypeScript 解析器配置
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        parser: tseslint.parser
      },
      globals: {
        ...globals.browser,
        ...globals.node
      }
    }
  },

  // TypeScript 文件配置
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
      },
      globals: {
        ...globals.browser,
        ...globals.node
      }
    }
  },

  // 自定义规则
  {
    rules: {
      'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      'vue/multi-word-component-names': 'off',
      'preserve-caught-error': 'off'
    }
  }
]
