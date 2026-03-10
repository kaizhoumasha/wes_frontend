# Element Plus 固定列背景透明问题修复

## 问题现象

暗模式下，el-table 使用 `stripe` + 双侧固定列时，固定列背景透明，会透视下方滚动内容。

## 根本原因

1. Element Plus 固定列使用 `background: inherit` 继承背景色
2. 但 `tr` 元素本身没有明确设置背景色，导致 inherit 继承到透明色
3. 项目中 `globals.css` 覆盖了表格原生样式，加剧了问题

## 解决方案

### 1. 清理 globals.css 中的表格覆盖样式

删除所有 `.el-table` 相关的自定义覆盖，让 Element Plus 原生样式生效：

```css
/* 删除这些覆盖 */
html.dark .el-table { ... }
html.dark .el-table th.el-table__cell { ... }
html.dark .el-table td.el-table__cell { ... }
html:not(.dark) .el-table { ... }
```

### 2. UserTable.vue 添加全局样式修复

使用与 Element Plus 相同优先级的选择器，为固定列设置明确背景色：

```vue
<style>
/* 表头固定列 */
.el-table__header-wrapper tr th.el-table-fixed-column--left,
.el-table__header-wrapper tr th.el-table-fixed-column--right {
  background-color: var(--el-fill-color-blank) !important;
}

/* 表格体固定列 - 默认状态 */
.el-table__body-wrapper tr td.el-table-fixed-column--left,
.el-table__body-wrapper tr td.el-table-fixed-column--right {
  background-color: var(--el-fill-color-blank) !important;
}

/* 条纹行偶数行 */
.el-table--striped .el-table__body-wrapper tr.el-table__row--striped td.el-table-fixed-column--left,
.el-table--striped
  .el-table__body-wrapper
  tr.el-table__row--striped
  td.el-table-fixed-column--right {
  background-color: var(--el-fill-color-lighter) !important;
}

/* 悬停行 */
.el-table__body-wrapper tr.hover-row td.el-table-fixed-column--left,
.el-table__body-wrapper tr.hover-row td.el-table-fixed-column--right {
  background-color: var(--el-fill-color-light) !important;
}
</style>
```

## 关键教训

1. **避免过度覆盖 Element Plus 原生样式** - 特别是 `el-table` 这种复杂组件
2. **固定列需要特殊处理** - Element Plus 的 `background: inherit` 在某些场景下不够可靠
3. **使用全局样式修复** - scoped 样式无法覆盖 Element Plus 内部元素
4. **选择器优先级要匹配** - 使用与 Element Plus 相同的选择器路径 + `!important`

## 相关文件

- `src/views/admin/users/components/UserTable.vue` - 表格组件
- `src/assets/styles/globals.css` - 全局样式

## 清理原则（2026-03-09）

Element Plus 主题定制推荐方式：

**只通过 CSS 变量定制主题，而不是覆盖组件样式**

参考：https://element-plus.org/zh-CN/guide/dark-mode

```css
/* ✅ 推荐：通过 CSS 变量定制 */
html.dark {
  --el-bg-color: #626aef;
}

/* ❌ 不推荐：覆盖组件样式 */
html.dark .el-button {
  background-color: xxx !important;
}
```

清理后的 `globals.css` 只包含：

1. CSS 变量定义（主题色）
2. 滚动条样式
3. 基础层样式（margin/padding/box-sizing）
4. 动画降级（可访问性）
5. 极少数必要的全局样式覆盖（如 `.el-form-item` 间距）

组件样式应该在组件自己的 `.vue` 文件中定义。
