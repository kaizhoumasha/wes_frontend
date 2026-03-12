# Vue Router 页面组件高度计算

## 问题

Vue Router 渲染页面时，父链为：
`DefaultLayout → RouterView → Anonymous Component → BaseTransition → PageComponent`

`BaseTransition` 和 `Anonymous Component` 均无明确高度，导致页面组件的 `height: 100%` 失效（基于内容高度而非视口）。

## 解决方案

### 1. 在布局组件定义 CSS 变量

```css
/* DefaultLayout.vue */
.default-layout {
  --layout-header-height: 64px;
  --layout-page-padding: 24px;
}
```

### 2. 页面组件直接用 calc() 计算，绕过父链继承

```css
/* UserListPage.vue（或任何需要占满视口的页面） */
.page-container {
  height: calc(100vh - var(--layout-header-height) - var(--layout-page-padding) * 2);
}
```

## el-table 内部滚动的正确写法

el-table 必须传入 `height` 属性才会启用内部滚动，纯 CSS 无法替代：

```html
<!-- 包装器占据剩余空间 -->
<div class="table-wrapper">
  <!-- flex: 1; min-height: 0; overflow: hidden -->
  <DataTable
    height="100%"
    ...
  />
  <!-- 100% 相对于包装器 -->
</div>
<!-- 分页器固定底部 -->
<div class="pagination"><!-- flex-shrink: 0 --></div>
```

## Flex 布局关键规则

- `min-height: 0`：允许 flex 子元素缩小（默认 auto 会阻止缩小）
- `flex: 1` + `min-height: 0` + `overflow: hidden` = 占据剩余空间且不溢出

## 相关文件

- `src/layouts/DefaultLayout.vue` — 定义 `--layout-header-height`, `--layout-page-padding`
- `src/views/admin/users/UserListPage.vue` — 使用 calc() 计算高度
- `src/views/admin/users/components/UserTable.vue` — 包装器 + DataTable height="100%"
