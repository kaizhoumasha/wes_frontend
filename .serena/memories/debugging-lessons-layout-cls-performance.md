# Layout & CLS Performance Debugging Lessons

记录 Vue 3 + Element Plus 项目中关于布局、响应式和性能优化的调试经验。

---

## 🎯 经验 1: 骨架屏组件必须精确匹配实际渲染尺寸

### 问题描述

用户管理模块违反《通用CRUD页面设计规范》强制要求（第 105-106 行："强制: 使用骨架屏"），使用的是 Element Plus 默认的 loading spinner。

### 根本原因

1. Element Plus 的 `el-table` 的 `:loading` prop 仅显示简单 spinner，无法模拟表格结构
2. 使用自定义骨架屏但使用固定行高 44px，与实际表格行高不匹配

### 解决方案

#### 创建 DataTableSkeleton.vue 组件

```vue
<template>
  <div class="data-table-skeleton">
    <!-- 模拟表头 -->
    <div class="data-table-skeleton__header">
      <div
        v-for="n in skeletonRowCount"
        :key="`header-${n}`"
        class="data-table-skeleton__header-cell"
      >
        <el-skeleton animated />
      </div>
    </div>

    <!-- 模拟表格行 -->
    <div class="data-table-skeleton__body">
      <div
        v-for="row in SKELETON_ROW_COUNT"
        :key="`row-${row}`"
        class="data-table-skeleton__row"
      >
        <div
          v-for="n in skeletonRowCount"
          :key="`cell-${row}-${n}`"
          class="data-table-skeleton__cell"
          :style="{ height: `${rowHeight}px` }"
        >
          <el-skeleton animated />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { TableColumnConfig } from './table.types'
import type { TableDensity } from '@/types/table'

interface Props {
  columns: TableColumnConfig[]
  density?: TableDensity
}

const props = withDefaults(defineProps<Props>(), {
  density: 'compact'
})

// 关键：映射 density 到实际 Element Plus 行高
const rowHeightMap: Record<TableDensity, number> = {
  comfortable: 60,
  compact: 48,
  small: 40
}

const rowHeight = computed(() => rowHeightMap[props.density] || 48)
</script>
```

#### 在 DataTable.vue 中集成

```vue
<template>
  <div class="data-table-wrapper">
    <!-- 骨架屏加载状态 - 使用绝对定位覆盖 -->
    <div v-if="loading" class="data-table__skeleton">
      <DataTableSkeleton :columns="visibleColumns" :density="density" />
    </div>

    <!-- 数据表格 - 移除 :loading prop -->
    <el-table
      ref="tableRef"
      :data="data"
      :border="border"
      :stripe="stripe"
      <!-- 不要使用 :loading -->
    >
      <!-- ... columns ... -->
    </el-table>
  </div>
</template>

<style scoped>
.data-table-wrapper {
  position: relative;  /* 关键：为绝对定位的骨架屏提供参考 */
  width: 100%;
  height: 100%;
}

.data-table__skeleton {
  position: absolute;
  inset: 0;
  z-index: 10;
  background: var(--el-bg-color);
}
</style>
```

### 关键经验

1. **骨架屏必须模拟真实内容结构**：表头 + 行 + 列
2. **动态高度匹配至关重要**：使用 `rowHeightMap` 精确映射不同 density 的行高
3. **使用绝对定位覆盖**：`position: absolute` + `position: relative` 确保骨架屏完美覆盖表格区域
4. **移除默认 loading**：删除 `el-table` 的 `:loading` prop，避免默认 spinner 冲突

### 预防措施

- 创建任何骨架屏组件前，先确认实际渲染尺寸
- 使用 `:style` 动态绑定高度，而非 CSS 固定值
- 使用 Chrome DevTools 的 Layout Shift 功能验证 CLS 分数

---

## 🎯 经验 2: 响应式断点设计必须基于设备类型

### 问题描述

用户反馈："页面宽度 < 1280px 时，折叠按钮消失"，但实际应该在平板设备（768-1279px）上正常显示。

### 根本原因

AppHeader.vue 中错误地使用了 `@media (width < 1280px)` 断点：

```css
/* ❌ 错误：导致平板端（768-1279px）按钮消失 */
@media (width < 1280px) {
  .app-header {
    left: 0;
  }
}
```

### 解决方案

#### 修正断点为 768px

```css
/* ✅ 正确：仅在小屏移动设备（<768px）应用 */
@media (width < 768px) {
  .app-header {
    left: 0;
  }
}
```

### 关键经验

1. **断点应基于设备类型，而非随意选择**
   - `≥1280px`: 桌面端（默认布局）
   - `768px-1279px`: 平板端（工具栏垂直布局）
   - `<768px`: 小平板/大屏手机（搜索框换行）
   - `<480px`: 手机端（FAB 浮动按钮）

2. **断点选择的黄金法则**：
   - 768px = iPad 竖屏宽度（平板/手机分界）
   - 1024px = iPad 横屏宽度（小平板/桌面分界）
   - 1280px = 常见笔记本分辨率（不建议作为断点）

### 预防措施

- 所有响应式样式必须先在真实设备测试
- 使用 Chrome DevTools 的 Device Toolbar 模拟不同尺寸
- 记录项目统一的断点规范到 CLAUDE.md

---

## 🎯 经验 3: z-index 层级管理需要明确体系

### 问题描述

移动端抽屉模式下，遮罩层无法覆盖整个视口，且菜单内容显示异常。

### 根本原因分析

#### 问题 1：Overlay z-index 冲突

```
Header z-index: 99
Overlay z-index: 99  ← 相同，被 Header 覆盖
Sidebar z-index: 100
```

#### 问题 2：Overlay 定位错误

Overlay 在 `<aside>` 元素内部，宽度受限为 240px，无法覆盖全屏：

```vue
<!-- ❌ 错误：overlay 在 aside 内部 -->
<aside class="app-sidebar" style="width: 240px">
  <div class="sidebar-overlay" />  <!-- 宽度被限制 -->
  <div class="sidebar-menu">...</div>
</aside>
```

### 解决方案

#### 1. 明确定义 z-index 体系

```css
/* z-index 层级体系（从高到低） */
.app-sidebar {
  z-index: 1000; /* 抽屉模式时最高 */
}

.sidebar-overlay {
  z-index: 999; /* 次高，在 Sidebar 下方，Header 上方 */
}

.app-header {
  z-index: 99; /* 再次 */
}
```

#### 2. 将 Overlay 移至根布局

```vue
<!-- DefaultLayout.vue -->
<template>
  <div class="default-layout">
    <app-sidebar />

    <!-- ✅ 正确：overlay 作为直接子元素，不受 sidebar 宽度限制 -->
    <div
      v-if="isMobile && isMobileMenuOpen"
      class="sidebar-overlay"
      @click="closeMobileMenu"
    />

    <div class="main-content">
      <app-header />
      <main class="page-main">...</main>
    </div>
  </div>
</template>

<style scoped>
.sidebar-overlay {
  position: fixed;
  inset: 0; /* 关键：覆盖整个视口 */
  background: rgb(0 0 0 / 50%);
  backdrop-filter: blur(4px);
  z-index: 999;
  animation: fadeIn 0.3s ease;
}
</style>
```

### 关键经验

1. **z-index 管理黄金法则**：
   - 在项目开始时明确定义层级体系
   - 使用 100、200、300 这样的档位，避免 99、100、101 这样的连续值
   - 记录到 CLAUDE.md 或设计系统文档中

2. **绝对定位元素应放在正确的容器中**：
   - 需要覆盖全屏的元素 → 放在根布局的直接子级
   - 需要覆盖特定区域的元素 → 放在该区域的 relative 容器中

3. **Overlay 模式的标准实现**：
   ```css
   .overlay {
     position: fixed;
     inset: 0;
     z-index: [比被覆盖元素高一级];
     background: rgb(0 0 0 / 50%);
     backdrop-filter: blur(4px);
   }
   ```

### 预防措施

- 在 CLAUDE.md 中定义项目的 z-index 体系
- 使用 CSS 变量管理 z-index：`--z-sidebar: 1000; --z-overlay: 999`
- 所有 fixed/absolute 元素必须标注其 z-index 用途

---

## 🎯 经验 4: CLS 优化需要精确的尺寸匹配

### 问题描述

用户报告 CLS 分数为 0.20，远超推荐的 <0.1 阈值：

```
Layout shift score: 0.1741  div.el-table__body-wrapper
Layout shift score: 0.0201   span.el-table__empty-text
Layout shift score: 0.0069   div.el-pagination
Total: 0.20
```

### 根本原因

骨架屏使用固定 44px 行高，但实际表格根据 density 使用不同行高：

- comfortable: 60px
- compact: 48px
- small: 40px

导致加载完成后内容高度变化，触发布局偏移。

### 解决方案

#### 1. 骨架屏接受 density prop

```typescript
// DataTableSkeleton.vue
interface Props {
  columns: TableColumnConfig[]
  density?: TableDensity // ← 添加 density prop
}

const props = withDefaults(defineProps<Props>(), {
  density: 'compact'
})
```

#### 2. 创建精确的行高映射

```typescript
// 必须与 Element Plus 的 size 配置完全一致
const rowHeightMap: Record<TableDensity, number> = {
  comfortable: 60, // size="large"
  compact: 48, // size="default"
  small: 40 // size="small"
}
```

#### 3. 应用动态高度

```vue
<div
  class="data-table-skeleton__cell"
  :style="{ height: `${rowHeight}px` }"  <!-- 动态高度 -->
>
  <el-skeleton animated />
</div>
```

#### 4. DataTable 传递 density prop

```vue
<DataTableSkeleton
  :columns="visibleColumns"
  :density="density"  <!-- ← 传递 density -->
/>
```

### 关键经验

1. **CLS 优化的核心原则**：
   - 骨架屏的尺寸必须与实际内容精确匹配
   - 使用动态高度计算，而非固定值
   - 所有容器元素都应预留空间

2. **Element Plus 表格尺寸对应关系**：
   | Element Plus Size | 行高 | TableDensity |
   |-------------------|------|---------------|
   | large | 60px | comfortable |
   | default | 48px | compact |
   | small | 40px | small |

3. **验证 CLS 的方法**：
   - Chrome DevTools → Performance → 录制加载过程
   - 查看 Layout Shift 详情，定位具体偏移元素
   - 使用 Web Vitals 库在 CI 中监控 CLS

### 预防措施

- 所有骨架屏组件必须接受 `density` / `size` prop
- 建立组件尺寸映射表（Button、Input、Table 等的尺寸）
- 在 PR Review 中检查骨架屏尺寸是否匹配实际内容

---

## 🎯 经验 5: ESLint 警告往往揭示潜在问题

### 问题描述

在实现骨架屏功能时，ESLint 报告两个警告：

1. `'SKELETON_ROW_COUNT' is assigned a value but never used`
2. `'$index' is assigned a value but never used`

### 根本原因

#### 警告 1：常量定义后未使用

```typescript
const SKELETON_ROW_COUNT = 5  // ← ESLint 报告未使用

// 但模板中应该使用它
<div v-for="row in skeletonRowCount">  // ← 错误：使用了变量而非常量
```

#### 警告 2：未使用的参数

```typescript
function renderFormatterValue(
  row: Record<string, unknown>,
  column: { property?: string },
  $index: number, // ← ESLint 报告未使用
  config: TableColumnConfig
): string {
  // 函数体中确实没有使用 $index
}
```

### 解决方案

#### 1. 修正常量使用

```vue
<!-- ✅ 正确：使用常量 -->
<div v-for="row in SKELETON_ROW_COUNT" :key="`row-${row}`">
```

#### 2. 未使用参数添加下划线前缀

```typescript
// ✅ 正确：明确标识为故意未使用
function renderFormatterValue(
  row: Record<string, unknown>,
  column: { property?: string },
  _index: number, // ← 添加下划线前缀
  config: TableColumnConfig
): string
```

### 关键经验

1. **ESLint 警告的三种处理方式**：
   - **修复**：如果确实是 bug（如未使用的变量）
   - **标识**：添加 `_` 前缀表示故意未使用
   - **禁用**：仅在确实需要时使用 `// eslint-disable-next-line`

2. **未使用参数的命名约定**：

   ```typescript
   // 明确表示"我知道这个参数未使用，但必须保留（接口兼容）"
   function handleEvent(event: Event, _unused: unknown) {
     // ...
   }
   ```

3. **常量 vs 变量的选择**：
   - 使用 `const` 定义常量（全大写命名）
   - 使用 `computed` 定义响应式值（驼峰命名）

### 预防措施

- CI 流程必须包含 ESLint 检查
- 使用 `--fix` 自动修复可修复的问题
- 在提交前运行 `pnpm lint:eslint`

---

## 📚 相关资源

### 文档链接

- [Web Vitals - CLS](https://web.dev/cls/)
- [Element Plus Table - Size](https://element-plus.org/zh-CN/component/table.html#table-%E5%B1%9E%E6%80%A7)
- [MDN - z-index](https://developer.mozilla.org/zh-CN/docs/Web/CSS/z-index)

### 项目文件

- `/src/components/ui/table/DataTableSkeleton.vue` - 骨架屏组件
- `/src/components/ui/table/DataTable.vue` - 数据表格组件
- `/src/layouts/DefaultLayout.vue` - 默认布局
- `/src/components/common/AppHeader.vue` - 顶部导航
- `/src/components/common/AppSidebar.vue` - 侧边栏

### 相关 Memory

- `通用CRUD页面设计规范` - 包含骨架屏强制要求
- `debugging-lessons-typescript-framework-integration` - TypeScript + 框架集成调试经验

---

## 🔍 快速诊断清单

当遇到类似问题时，按以下清单排查：

### 骨架屏相关问题

- [ ] 骨架屏是否模拟了真实内容结构？
- [ ] 骨架屏尺寸是否与实际内容精确匹配？
- [ ] 是否使用了 `:style` 动态绑定高度？
- [ ] 是否移除了组件默认的 loading 状态？

### 响应式断点问题

- [ ] 断点是否基于设备类型（768px、1024px）？
- [ ] 是否在真实设备上测试过？
- [ ] 是否记录到项目的断点规范文档？

### z-index 层级问题

- [ ] 是否明确定义了项目的 z-index 体系？
- [ ] fixed/absolute 元素是否在正确的容器中？
- [ ] Overlay 模式是否放在根布局的直接子级？

### CLS 性能问题

- [ ] 骨架屏行高是否与实际渲染一致？
- [ ] 是否建立了组件尺寸映射表？
- [ ] 是否使用 Chrome DevTools 验证了 Layout Shift？

### ESLint 警告问题

- [ ] 未使用的变量/参数是否添加了 `_` 前缀？
- [ ] 是否在 CI 中包含了 ESLint 检查？
- [ ] 是否使用 `--fix` 自动修复了可修复的问题？

---

最后更新：2026-03-12
修复范围：骨架屏实现、响应式断点、z-index 管理、CLS 优化
