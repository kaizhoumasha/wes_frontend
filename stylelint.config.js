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
    // 允许使用 rgba() 颜色函数（不强制要求现代 rgb() 语法）
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
        'no-descending-specificity': null
      }
    },
    // SCSS 文件配置（如果使用）
    {
      files: ['*.scss', '**/*.scss'],
      customSyntax: 'postcss-scss'
    }
  ],
  // 忽略文件
  ignoreFiles: ['node_modules/**', 'dist/**', '*.min.css']
}
