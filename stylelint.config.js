// Modeled hardcoded color denylist — SPEC P3 (2026-06-17)
// 任何属性匹配以下 regex 时,值不允许为列表中的硬编码已建模色;必须改为 var(--color-*) / var(--runtime-*) / var(--el-*)
// globals.css 自身需要硬编码原始值(token 定义),通过下方 overrides 排除
const modeledHardcodedColorProperties =
  '/^(?:color|background(?:-color|-image)?|border(?:-(?:color|top|right|bottom|left|block|block-start|block-end|inline|inline-start|inline-end))?(?:-color)?|border-image(?:-source)?|box-shadow|text-shadow|filter|outline(?:-color)?|text-decoration(?:-color)?|caret-color|accent-color|fill|stroke|stop-color|flood-color|lighting-color|scrollbar-color|column-rule(?:-color)?|--.*(?:color|bg|background|border|shadow|surface|text|decoration|accent|fill|stroke).*)$/'

const modeledHardcodedColorValues = [
  '/#[fF]59[eE]0[bB]/', // primary #F59E0B
  '/#[dD]97706/', // primary-dark #D97706
  '/rgba?\\(\\s*245(?:\\s*,\\s*|\\s+)158(?:\\s*,\\s*|\\s+)11\\b/',
  '/#[dD][cC]2626/', // danger #DC2626
  '/rgba?\\(\\s*220(?:\\s*,\\s*|\\s+)38(?:\\s*,\\s*|\\s+)38\\b/',
  '/#16[aA]34[aA]/', // success #16A34A
  '/rgba?\\(\\s*22(?:\\s*,\\s*|\\s+)163(?:\\s*,\\s*|\\s+)74\\b/',
  '/#[eE][aA][bB]308/', // warning #EAB308
  '/rgba?\\(\\s*234(?:\\s*,\\s*|\\s+)179(?:\\s*,\\s*|\\s+)8\\b/',
  '/#3[bB]82[fF]6/', // info / safety-blue #3B82F6
  '/rgba?\\(\\s*59(?:\\s*,\\s*|\\s+)130(?:\\s*,\\s*|\\s+)246\\b/',
  '/#[fF]8[fF][aA][fF][cC]/', // industrial-light-bg / dark-text #F8FAFC
  '/#0[fF]172[aA]/', // industrial-dark-bg / light-text #0F172A
  '/#1[eE]293[bB]/', // industrial-dark-surface #1E293B
  '/#334155/', // industrial-dark-surface-elevated
  '/#475569/', // industrial-light-text-secondary / dark-text-disabled
  '/#64748[bB]/', // industrial-dark-text-muted
  '/#94[aA]3[bB]8/' // industrial-dark-text-secondary / light-text-muted
]

export default {
  extends: ['stylelint-config-standard'],
  rules: {
    // Tailwind CSS 兼容性
    'at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: ['tailwind', 'apply', 'layer', 'config', 'source', 'import', 'reference']
      }
    ],
    // 允许 Element Plus BEM 命名风格
    'selector-class-pattern': null,
    // 允许 CSS 变量和自定义属性
    'declaration-block-no-duplicate-properties': [
      true,
      {
        ignore: ['consecutive-duplicates-with-different-values']
      }
    ],
    // 允许使用 rgba() 颜色函数(不强制要求现代 rgb() 语法)
    'color-function-notation': null,
    // 允许使用 legacy rgba() 语法
    'alpha-value-notation': null,
    // 允许 camelCase 的 keyframe 名称
    'keyframes-name-pattern': null,
    // 允许灵活的空行规则
    'rule-empty-line-before': null,
    // 允许灵活的选择器顺序
    'no-descending-specificity': null
  },
  overrides: [
    // Vue 单文件组件配置
    {
      files: ['*.vue', '**/*.vue'],
      extends: ['stylelint-config-standard-vue'],
      rules: {
        // Vue 文件中也禁用颜色函数严格规则
        'color-function-notation': null,
        'alpha-value-notation': null,
        // 允许 camelCase 的 keyframe 名称
        'keyframes-name-pattern': null,
        // 允许灵活的空行规则
        'rule-empty-line-before': null,
        // 允许灵活的选择器顺序
        'no-descending-specificity': null,
        // SPEC P3: 拦截 SFC <style> 中的硬编码已建模色
        'declaration-property-value-disallowed-list': [
          {
            [modeledHardcodedColorProperties]: modeledHardcodedColorValues
          },
          { severity: 'error' }
        ]
      }
    },
    // SCSS 文件配置(如果使用)
    {
      files: ['*.scss', '**/*.scss'],
      customSyntax: 'postcss-scss'
    },
    // SPEC P3: globals.css 是 token 定义源头,必须含硬编码原始值,豁免拦截
    {
      files: ['src/assets/styles/globals.css'],
      rules: {
        'declaration-property-value-disallowed-list': null
      }
    }
  ],
  // 忽略文件
  ignoreFiles: ['node_modules/**', 'dist/**', '*.min.css']
}
