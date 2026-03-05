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
    ]
  },
  overrides: [
    // Vue 单文件组件配置
    {
      files: ['*.vue', '**/*.vue'],
      extends: ['stylelint-config-standard-vue']
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
