// 已建模硬编码颜色禁用清单
// 任何属性匹配以下 regex 时，值不允许使用已建模的硬编码色；必须改为 var(--color-*) / var(--el-*)
// globals.css 自身需要硬编码原始值(token 定义),通过下方 overrides 排除
const modeledHardcodedColorProperties =
  '/^(?:color|background(?:-color|-image)?|border(?:-(?:color|top|right|bottom|left|block|block-start|block-end|inline|inline-start|inline-end))?(?:-color)?|border-image(?:-source)?|box-shadow|text-shadow|filter|outline(?:-color)?|text-decoration(?:-color)?|caret-color|accent-color|fill|stroke|stop-color|flood-color|lighting-color|scrollbar-color|column-rule(?:-color)?|--.*(?:color|bg|background|border|shadow|surface|text|decoration|accent|fill|stroke).*)$/'

const modeledHardcodedColorValues = [
  // === 主色族 ===
  '/#[fF]59[eE]0[bB]/', // primary #F59E0B
  '/#[dD]97706/', // primary-dark #D97706
  '/#[fF][bB][bB][fF]24/', // primary-light #FBBF24
  '/#[bB]45309/', // primary-700 #B45309
  '/#[fF][eE][fF]3[cC]7/', // primary-100 #FEF3C7
  '/#[fF][dD][eE]68[aA]/', // primary-200 #FDE68A
  '/rgba?\\(\\s*245(?:\\s*,\\s*|\\s+)158(?:\\s*,\\s*|\\s+)11\\b/',

  // === Danger 系 ===
  '/#[dD][cC]2626/', // danger #DC2626
  '/#[bB]91[cC]1[cC]/', // danger-dark #B91C1C
  '/#[eE][fF]4444/', // danger-light #EF4444
  '/#[fF]87171/', // danger-light alt #F87171
  '/#[fF][cC][aA]5[aA]5/', // danger-light alt #FCA5A5
  '/#[fF][eE][cC][aA][cC][aA]/', // danger-100 #FECACA
  '/rgba?\\(\\s*220(?:\\s*,\\s*|\\s+)38(?:\\s*,\\s*|\\s+)38\\b/',

  // === Success 系 ===
  '/#16[aA]34[aA]/', // success #16A34A
  '/#15803[dD]/', // success-dark #15803D
  '/#22[cC]55[eE]/', // success-light #22C55E
  '/#86[eE][fF][aA][cC]/', // success-200 #86EFAC
  '/#[bB][bB][fF]7[dD]0/', // success-300 #BBF7D0
  '/#[dD][cC][fF][cC][eE]7/', // success-100 #DCFCE7
  '/rgba?\\(\\s*22(?:\\s*,\\s*|\\s+)163(?:\\s*,\\s*|\\s+)74\\b/',
  '/rgba?\\(\\s*34(?:\\s*,\\s*|\\s+)197(?:\\s*,\\s*|\\s+)94\\b/', // #22C55E success-light RGB

  // === Warning 系 ===
  '/#[eE][aA][bB]308/', // warning #EAB308
  '/#[cC][aA]8[aA]04/', // warning-dark #CA8A04
  '/#[fF][aA][cC][cC]15/', // warning-light #FACC15
  '/#[fF][dD][eE]047/', // warning-200 #FDE047
  '/rgba?\\(\\s*234(?:\\s*,\\s*|\\s+)179(?:\\s*,\\s*|\\s+)8\\b/',

  // === Info / safety-blue 系 ===
  '/#3[bB]82[fF]6/', // info #3B82F6
  '/#2563[eE][bB]/', // info-dark #2563EB
  '/#60[aA]5[fF][aA]/', // info-light #60A5FA
  '/#93[cC]5[fF][dD]/', // info-200 #93C5FD
  '/#[bB][fF][dD][bB][fF][eE]/', // info-300 #BFDBFE
  '/#[dD][bB][eE][aA][fF][eE]/', // info-100 #DBEAFE
  '/rgba?\\(\\s*59(?:\\s*,\\s*|\\s+)130(?:\\s*,\\s*|\\s+)246\\b/',

  // === Industrial-dark 中性色 ===
  '/#0[fF]172[aA]/', // industrial-dark-bg #0F172A
  '/#1[eE]293[bB]/', // industrial-dark-surface #1E293B
  '/#334155/', // industrial-dark-surface-elevated
  '/#[fF]8[fF][aA][fF][cC]/', // industrial-light-bg / dark-text #F8FAFC
  '/#475569/', // industrial-light-text-secondary
  '/#64748[bB]/', // industrial-dark-text-muted
  '/#94[aA]3[bB]8/', // industrial-dark-text-secondary

  // === Industrial-light 中性色 ===
  '/#[eE]2[eE]8[fF]0/', // industrial-light-border #E2E8F0
  '/#[cC][bB][dD]5[eE]1/', // industrial-light-border-hover #CBD5E1
  '/#[fF]1[fF]5[fF]9/', // industrial-light-surface-elevated #F1F5F9
  '/(?<![0-9a-fA-F])#[fF][fF][fF](?![0-9a-fA-F])/', // industrial-light-surface #FFF (短,边界匹配)
  '/(?<![0-9a-fA-F])#[fF][fF][fF][fF][fF][fF](?![0-9a-fA-F])/', // industrial-light-surface #FFFFFF (长,边界匹配)
  '/rgba?\\(\\s*255(?:\\s*,\\s*|\\s+)255(?:\\s*,\\s*|\\s+)255\\b/', // 白色 RGB

  // === Industrial 中性色 RGB 字面量(防 #94A3B8 / #1E293B 等的 RGB 形式漏拦)===
  '/rgba?\\(\\s*148(?:\\s*,\\s*|\\s+)163(?:\\s*,\\s*|\\s+)184\\b/', // #94A3B8 RGB
  '/rgba?\\(\\s*100(?:\\s*,\\s*|\\s+)116(?:\\s*,\\s*|\\s+)139\\b/', // #64748B RGB
  '/rgba?\\(\\s*71(?:\\s*,\\s*|\\s+)85(?:\\s*,\\s*|\\s+)105\\b/', // #475569 RGB
  '/rgba?\\(\\s*15(?:\\s*,\\s*|\\s+)23(?:\\s*,\\s*|\\s+)42\\b/', // #0F172A RGB
  '/rgba?\\(\\s*30(?:\\s*,\\s*|\\s+)41(?:\\s*,\\s*|\\s+)59\\b/', // #1E293B RGB
  '/rgba?\\(\\s*51(?:\\s*,\\s*|\\s+)65(?:\\s*,\\s*|\\s+)85\\b/', // #334155 RGB
  '/rgba?\\(\\s*248(?:\\s*,\\s*|\\s+)250(?:\\s*,\\s*|\\s+)252\\b/' // #F8FAFC RGB
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
        // 拦截 SFC <style> 中已由全局 token 建模的硬编码颜色
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
    // globals.css 是 token 定义源，必须包含硬编码原始值，因此豁免拦截
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
