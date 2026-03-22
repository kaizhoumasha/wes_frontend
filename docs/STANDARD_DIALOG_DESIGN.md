# StandardDialog 组件设计文档

> 版本: 1.1
> 创建日期: 2026-03-19
> 更新日期: 2026-03-19
> 状态: ✅ 实现完成

---

## 一、背景与目标

### 1.1 问题分析

**当前痛点**：

```vue
<!-- 每个 Dialog 都要重复这些逻辑 -->
<el-dialog
  :width="computed(() => Math.min(800, windowWidth * 0.9))"
  :style="{ maxHeight: '80vh' }"
  :close-on-click-modal="false"
>
  <template #header>标题</template>
  <template #default>内容</template>
  <template #footer>
    <el-button @click="close">取消</el-button>
    <el-button type="primary" @click="confirm">确定</el-button>
  </template>
</el-dialog>
```

| 问题 | 影响 |
|------|------|
| 宽度计算逻辑分散 | 维护成本高，不同对话框尺寸不一致 |
| 高度限制不统一 | 用户体验不一致 |
| 结构布局不规范 | 代码风格各异 |
| Footer 按钮重复 | 样式和行为不统一 |
| 缺少加载状态 | 每次都要自己实现 |

### 1.2 设计目标

1. **标准化尺寸**：通过 `size` 属性快速应用标准窗口大小
2. **统一结构**：Header / Body / Footer 三区清晰分离
3. **简化使用**：减少样板代码，开箱即用
4. **灵活扩展**：支持自定义内容、插槽覆盖
5. **类型安全**：完整的 TypeScript 类型定义

---

## 二、尺寸系统设计

### 2.1 Size 映射表

根据**信息密度**定义 6 级标准尺寸：

| Size | 宽度 | 宽度上限 | 适用场景 | 典型用例 |
|------|------|----------|----------|----------|
| `xs` | 400px | 90vw | 简单确认 | 删除确认、提示信息、警告 |
| `sm` | 520px | 90vw | 轻量表单 | 单字段编辑、简单设置、密码修改 |
| `md` | 640px | 90vw | 标准表单 | 创建/编辑表单、详情查看、用户信息 |
| `lg` | 800px | 90vw | 复杂表单 | 多字段表单、批量操作、配置面板 |
| `xl` | 900px | 85vw | 高密度内容 | 高级搜索、复杂配置、数据导入 |
| `full` | 95vw | 95vw | 全屏内容 | 大数据表格、复杂向导、报表预览 |

### 2.2 尺寸选择指南

```
信息密度判断流程：

内容项数 ≤ 2 个？
├─ 是 → xs (400px)
└─ 否 → 表单字段数？
        ├─ 1-2 个 → sm (520px)
        ├─ 3-5 个 → md (640px)
        ├─ 6-10 个 → lg (800px)
        └─ >10 个或需嵌套结构 → xl (900px)

特殊场景：
- 需要展示表格/列表 → lg 或 xl
- 全屏沉浸式操作 → full
```

### 2.3 主流分辨率适配

| 分辨率 | xs | sm | md | lg | xl | full |
|--------|-----|-----|-----|-----|------|------|
| 1920×1080 | 400px | 520px | 640px | 800px | 900px | 1824px |
| 1680×1050 | 400px | 520px | 640px | 800px | 900px | 1596px |
| 1440×900 | 400px | 520px | 640px | 800px | 900px | 1368px |
| 1366×768 | 400px | 520px | 640px | 800px | 900px | 1297px |
| 1280×720 | 400px | 520px | 640px | 800px | 900px | 1216px |
| 1024×768 | 400px | 520px | 640px | 800px | 870px | 973px |
| 768px (平板) | 691px | 691px | 691px | 691px | 653px | 730px |

> 当窗口宽度小于尺寸预设时，自动使用 `maxWidth` 上限

---

## 三、组件 API 设计

### 3.1 Props

```typescript
interface StandardDialogProps {
  // ==================== 基础属性 ====================

  /** 控制显示状态 */
  modelValue: boolean

  /** 对话框标题 */
  title?: string

  /** 尺寸预设 */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full'

  /** 自定义宽度（覆盖 size 预设） */
  width?: string | number

  // ==================== 行为属性 ====================

  /** 是否显示关闭按钮 */
  closable?: boolean          // default: true

  /** 点击遮罩是否关闭 */
  closeOnClickModal?: boolean // default: false

  /** 关闭时销毁内容 */
  destroyOnClose?: boolean    // default: true

  /** 内容区滚动模式 */
  scrollable?: boolean        // default: true

  // ==================== Footer 属性 ====================

  /** 是否显示底部区域 */
  showFooter?: boolean        // default: true

  /** 确认按钮文本 */
  confirmText?: string        // default: '确定'

  /** 取消按钮文本 */
  cancelText?: string         // default: '取消'

  /** 确认按钮类型 */
  confirmType?: 'primary' | 'success' | 'warning' | 'danger'  // default: 'primary'

  /** 确认按钮加载状态 */
  confirmLoading?: boolean    // default: false

  /** 确认按钮禁用状态 */
  confirmDisabled?: boolean   // default: false

  /** 是否隐藏取消按钮 */
  hideCancel?: boolean        // default: false

  // ==================== 高级属性 ====================

  /** 自定义类名 */
  customClass?: string

  /** 是否居中显示 */
  center?: boolean            // default: false

  /** 打开时的动画方向 */
  direction?: 'rtl' | 'ltr' | 'ttb' | 'btt'  // default: 'rtl'
}
```

### 3.2 Emits

```typescript
interface StandardDialogEmits {
  /** 更新显示状态 */
  (e: 'update:modelValue', value: boolean): void

  /** 点击确认按钮 */
  (e: 'confirm'): void

  /** 点击取消按钮 */
  (e: 'cancel'): void

  /** 对话框关闭（任意方式） */
  (e: 'close'): void

  /** 对话框打开 */
  (e: 'open'): void
}
```

### 3.3 Slots

| 插槽名 | 说明 | 参数 |
|--------|------|------|
| `default` | 内容区 | - |
| `header` | 自定义标题区 | - |
| `footer` | 自定义底部区 | - |
| `footer-left` | 底部左侧区域 | - |

### 3.4 Expose

```typescript
interface StandardDialogExpose {
  /** 打开对话框 */
  open: () => void

  /** 关闭对话框 */
  close: () => void

  /** 获取内容区 DOM */
  getBodyElement: () => HTMLElement | null
}
```

---

## 四、组件结构

### 4.1 DOM 结构

```
┌─────────────────────────────────────────────────────────────┐
│  [图标?] 标题                                         [×]   │  ← Header (.standard-dialog__header)
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                                                             │
│                      内容区 (滚动)                           │  ← Body (.standard-dialog__body)
│                                                             │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  [左侧内容]                         [取消]  [确认]           │  ← Footer (.standard-dialog__footer)
└─────────────────────────────────────────────────────────────┘
```

### 4.2 CSS 类名规范

```css
.standard-dialog                    /* 根容器 */
.standard-dialog--{size}            /* 尺寸变体：xs/sm/md/lg/xl/full */
.standard-dialog--center            /* 居中布局 */

.standard-dialog__header            /* 标题区 */
.standard-dialog__header-title      /* 标题文本 */
.standard-dialog__header-close      /* 关闭按钮 */

.standard-dialog__body              /* 内容区 */
.standard-dialog__body--scrollable  /* 滚动模式 */

.standard-dialog__footer            /* 底部区 */
.standard-dialog__footer-left       /* 底部左侧 */
.standard-dialog__footer-actions    /* 底部操作按钮组 */
```

---

## 五、使用示例

### 5.1 确认对话框 (xs)

```vue
<StandardDialog
  v-model="showDelete"
  size="xs"
  title="确认删除"
  confirm-type="danger"
  confirm-text="删除"
  @confirm="handleDelete"
>
  <p>确定要删除用户 <strong>{{ user.name }}</strong> 吗？</p>
  <p class="text-gray-500">此操作不可撤销。</p>
</StandardDialog>
```

**效果**：
```
┌────────────────────────────────┐
│  确认删除                   [×]│
├────────────────────────────────┤
│  确定要删除用户 张三 吗？      │
│  此操作不可撤销。              │
├────────────────────────────────┤
│                    [取消] [删除]│
└────────────────────────────────┘
```

### 5.2 简单表单 (sm)

```vue
<StandardDialog
  v-model="showEdit"
  size="sm"
  title="修改密码"
  :confirm-loading="submitting"
  @confirm="handleSubmit"
>
  <el-form :model="form" label-position="top">
    <el-form-item label="当前密码">
      <el-input v-model="form.oldPassword" type="password" />
    </el-form-item>
    <el-form-item label="新密码">
      <el-input v-model="form.newPassword" type="password" />
    </el-form-item>
    <el-form-item label="确认密码">
      <el-input v-model="form.confirmPassword" type="password" />
    </el-form-item>
  </el-form>
</StandardDialog>
```

### 5.3 标准表单 (md)

```vue
<StandardDialog
  v-model="showCreate"
  size="md"
  title="创建用户"
  :confirm-loading="submitting"
  @confirm="handleCreate"
>
  <UserForm v-model="formData" />
</StandardDialog>
```

### 5.4 复杂表单 (lg)

```vue
<StandardDialog
  v-model="showConfig"
  size="lg"
  title="系统配置"
  :show-footer="false"
>
  <el-tabs>
    <el-tab-pane label="基础配置">
      <BasicConfigForm />
    </el-tab-pane>
    <el-tab-pane label="高级配置">
      <AdvancedConfigForm />
    </el-tab-pane>
  </el-tabs>

  <template #footer>
    <el-button @click="resetConfig">重置</el-button>
    <el-button @click="showConfig = false">取消</el-button>
    <el-button type="primary" @click="saveConfig">保存</el-button>
  </template>
</StandardDialog>
```

### 5.5 高级搜索 (xl)

```vue
<StandardDialog
  v-model="showAdvancedSearch"
  size="xl"
  title="高级搜索"
  :show-footer="false"
>
  <AdvancedSearchContent
    :fields="searchFields"
    @apply="handleSearch"
  />

  <template #footer>
    <div class="flex justify-between w-full">
      <el-button text @click="saveAsFavorite">保存为收藏</el-button>
      <div>
        <el-button @click="showAdvancedSearch = false">取消</el-button>
        <el-button type="primary" @click="handleSearch">应用搜索</el-button>
      </div>
    </div>
  </template>
</StandardDialog>
```

### 5.6 全屏内容 (full)

```vue
<StandardDialog
  v-model="showPreview"
  size="full"
  title="数据预览"
  :show-footer="false"
>
  <DataTable :data="previewData" :columns="columns" />

  <template #footer>
    <el-button @click="exportData">导出</el-button>
    <el-button type="primary" @click="showPreview = false">关闭</el-button>
  </template>
</StandardDialog>
```

---

## 六、响应式设计

### 6.1 断点适配

| 断点 | 行为 |
|------|------|
| ≥1280px | 使用预设尺寸 |
| 768-1279px | 宽度使用 90vw 上限 |
| <768px | 宽度 100vw，全屏显示 |

### 6.2 高度策略

```css
/* 所有尺寸统一高度策略 */
--dialog-max-height: 85vh;
--dialog-header-height: 56px;
--dialog-footer-height: 64px;
--dialog-body-max-height: calc(85vh - 56px - 64px);
```

### 6.3 移动端特殊处理

```typescript
// 小屏幕自动转为全屏
const resolvedWidth = computed(() => {
  if (windowWidth.value < 768) return '100%'
  // ... 正常尺寸逻辑
})
```

---

## 七、可访问性设计

### 7.1 ARIA 属性

```html
<div
  role="dialog"
  aria-modal="true"
  :aria-labelledby="titleId"
  :aria-describedby="descriptionId"
>
  <h2 :id="titleId">{{ title }}</h2>
  <div :id="descriptionId">
    <slot />
  </div>
</div>
```

### 7.2 焦点管理

| 时机 | 行为 |
|------|------|
| 打开时 | 焦点移至内容区首个可聚焦元素 |
| 关闭时 | 焦点返回触发元素 |
| Tab 循环 | 焦点限制在对话框内 |

### 7.3 键盘快捷键

| 快捷键 | 功能 |
|--------|------|
| `Escape` | 关闭对话框 |
| `Enter` | 提交（当焦点在表单内） |
| `Tab` | 在可聚焦元素间切换 |

---

## 八、视觉设计规范

### 8.1 颜色变量

```css
:root {
  /* 对话框基础色 */
  --dialog-bg: var(--el-bg-color);
  --dialog-border: var(--el-border-color-lighter);
  --dialog-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  --dialog-shadow-hover: 0 12px 48px rgba(0, 0, 0, 0.16);

  /* Header 区域 */
  --dialog-header-bg: var(--el-bg-color);
  --dialog-header-border: var(--el-border-color-light);
  --dialog-header-height: 56px;
  --dialog-title-color: var(--el-text-color-primary);
  --dialog-title-size: 16px;
  --dialog-title-weight: 600;

  /* Body 区域 */
  --dialog-body-bg: var(--el-bg-color);
  --dialog-body-padding-sm: 16px;
  --dialog-body-padding-md: 20px;
  --dialog-body-padding-lg: 24px;

  /* Footer 区域 */
  --dialog-footer-bg: var(--el-bg-color);
  --dialog-footer-border: var(--el-border-color-light);
  --dialog-footer-height: 64px;
  --dialog-footer-gap: 8px;
  --dialog-footer-btn-min-width: 80px;

  /* 关闭按钮 */
  --dialog-close-size: 24px;
  --dialog-close-color: var(--el-text-color-secondary);
  --dialog-close-hover-bg: var(--el-fill-color-light);
  --dialog-close-hover-color: var(--el-text-color-primary);

  /* 遮罩层 */
  --dialog-overlay-bg: rgba(0, 0, 0, 0.5);
}

/* 暗色模式适配 */
.dark {
  --dialog-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  --dialog-shadow-hover: 0 12px 48px rgba(0, 0, 0, 0.5);
  --dialog-overlay-bg: rgba(0, 0, 0, 0.7);
}
```

### 8.2 视觉层级与权重

| 区域 | 视觉处理 | 设计意图 |
|------|----------|----------|
| **Header** | `position: sticky` + `z-index: 10` | 固定可见，标题始终清晰 |
| **Body** | 背景色区分 + 内边距层次 | 内容焦点区，视觉呼吸感 |
| **Footer** | `border-top: 1px` 分隔 + 浅灰背景（可选） | 操作区与内容区明确分离 |

**Body 内边距响应式**：

```css
.standard-dialog__body {
  padding: var(--dialog-body-padding-lg); /* 默认 lg/xl */
}

.standard-dialog--md .standard-dialog__body {
  padding: var(--dialog-body-padding-md);
}

.standard-dialog--xs .standard-dialog__body,
.standard-dialog--sm .standard-dialog__body {
  padding: var(--dialog-body-padding-sm);
}
```

### 8.3 动画时序规范

#### 入场动画序列

```
时间轴：
0ms      → 遮罩层开始淡入
50ms     → 对话框开始缩放入场
150ms    → 内容区开始淡入
250ms    → 动画完成
```

#### CSS 动画定义

```css
/* 遮罩层动画 */
.dialog-overlay-enter-active {
  animation: overlay-fade-in 150ms ease-out;
}

@keyframes overlay-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* 对话框入场动画 */
.dialog-enter-active {
  animation: dialog-slide-in 250ms cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes dialog-slide-in {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* 对话框退场动画 */
.dialog-leave-active {
  animation: dialog-fade-out 200ms ease-in;
}

@keyframes dialog-fade-out {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.98);
  }
}

/* 内容区延迟淡入 */
.dialog-content-enter-active {
  animation: content-fade-in 150ms ease-out 100ms both;
}

@keyframes content-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

#### 方向动画变体

```css
/* 从右侧滑入（默认） */
.dialog-direction-rtl.dialog-enter-active {
  animation: dialog-slide-right 250ms cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes dialog-slide-right {
  from {
    opacity: 0;
    transform: translateX(20px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
}

/* 从左侧滑入 */
.dialog-direction-ltr.dialog-enter-active {
  animation: dialog-slide-left 250ms cubic-bezier(0.4, 0, 0.2, 1);
}

/* 从顶部滑入 */
.dialog-direction-ttb.dialog-enter-active {
  animation: dialog-slide-top 250ms cubic-bezier(0.4, 0, 0.2, 1);
}

/* 从底部滑入 */
.dialog-direction-btt.dialog-enter-active {
  animation: dialog-slide-bottom 250ms cubic-bezier(0.4, 0, 0.2, 1);
}
```

### 8.4 组件状态样式

#### 关闭按钮

```css
.standard-dialog__header-close {
  width: var(--dialog-close-size);
  height: var(--dialog-close-size);
  color: var(--dialog-close-color);
  border-radius: 4px;
  transition: all 0.15s ease;
}

.standard-dialog__header-close:hover {
  background: var(--dialog-close-hover-bg);
  color: var(--dialog-close-hover-color);
}

.standard-dialog__header-close:active {
  transform: scale(0.95);
}
```

#### Footer 按钮

```css
.standard-dialog__footer-actions {
  display: flex;
  gap: var(--dialog-footer-gap);
}

.standard-dialog__footer-actions .el-button {
  min-width: var(--dialog-footer-btn-min-width);
}

/* 主按钮 hover 增强 */
.standard-dialog__footer-actions .el-button--primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(var(--el-color-primary-rgb), 0.3);
}

/* 危险按钮 */
.standard-dialog__footer-actions .el-button--danger:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(var(--el-color-danger-rgb), 0.3);
}
```

### 8.5 滚动条样式

```css
.standard-dialog__body--scrollable {
  scrollbar-width: thin;
  scrollbar-color: var(--el-border-color) transparent;
}

.standard-dialog__body--scrollable::-webkit-scrollbar {
  width: 6px;
}

.standard-dialog__body--scrollable::-webkit-scrollbar-track {
  background: transparent;
}

.standard-dialog__body--scrollable::-webkit-scrollbar-thumb {
  background: var(--el-border-color);
  border-radius: 3px;
}

.standard-dialog__body--scrollable::-webkit-scrollbar-thumb:hover {
  background: var(--el-border-color-dark);
}
```

### 8.6 动态高度计算

```typescript
// Footer 隐藏时 Body 高度自适应
const bodyMaxHeight = computed(() => {
  const headerHeight = 56
  const footerHeight = props.showFooter ? 64 : 0
  const maxHeight = props.maxHeight || 85 // vh

  return `calc(${maxHeight}vh - ${headerHeight}px - ${footerHeight}px)`
})
```

---

## 九、实现规范

### 9.1 文件结构

```
src/components/ui/StandardDialog/
├── index.ts                 # 导出入口
├── StandardDialog.vue       # 主组件
├── StandardDialogHeader.vue # 标题区组件（可选）
├── StandardDialogFooter.vue # 底部区组件（可选）
├── types.ts                 # 类型定义
├── constants.ts             # 常量定义
└── useStandardDialog.ts     # Composable（可选）
```

### 9.2 依赖关系

```
StandardDialog
├── Element Plus
│   ├── el-dialog
│   └── el-button
├── 内部组件
│   └── AppIcon              # 统一图标组件（基于 Iconify）
├── @vueuse/core
│   └── useWindowSize
└── 内部工具
    └── useDialogSize (计算尺寸)
```

---

## 十、与其他组件对比

### 10.1 vs Element Plus Dialog

| 对比项 | el-dialog | StandardDialog |
|--------|-----------|----------------|
| 尺寸预设 | 需手动计算 | `size` 属性 |
| Footer 按钮 | 自行实现 | 内置，可配置 |
| 加载状态 | 自行实现 | `confirmLoading` |
| 响应式 | 自行实现 | 自动适配 |
| 类型提示 | 基础 | 完整业务类型 |

### 10.2 vs shadcn-vue Dialog

```vue
<!-- shadcn-vue: 复合组件模式 -->
<Dialog>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>标题</DialogTitle>
    </DialogHeader>
    内容
    <DialogFooter>
      <Button>确定</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

<!-- StandardDialog: 单组件模式 -->
<StandardDialog v-model="show" title="标题">
  内容
</StandardDialog>
```

| 对比项 | shadcn-vue | StandardDialog |
|--------|------------|----------------|
| 组件数量 | 多个子组件 | 单组件 |
| 学习成本 | 较高 | 较低 |
| 灵活性 | 更高 | 适中 |
| 业务适配 | 需封装 | 开箱即用 |

---

## 十一、测试用例

### 11.1 单元测试

- [ ] 各 size 宽度计算正确
- [ ] modelValue 双向绑定正常
- [ ] confirm/cancel 事件触发正确
- [ ] confirmLoading 状态显示正确
- [ ] closeOnClickModal 行为正确
- [ ] destroyOnClose 销毁内容

### 11.2 集成测试

- [ ] 嵌套表单提交正常
- [ ] 滚动内容不溢出
- [ ] 自定义 footer 插槽生效
- [ ] 响应式尺寸切换正确

### 11.3 E2E 测试

- [ ] 打开/关闭动画流畅
- [ ] 遮罩层点击关闭
- [ ] ESC 键关闭
- [ ] Tab 焦点循环

---

## 十二、变更记录

| 版本 | 日期 | 变更内容 |
|------|------|----------|
| 1.1 | 2026-03-19 | 补充视觉设计规范：颜色变量、动画时序、状态样式、滚动条样式、暗色模式适配 |
| 1.0 | 2026-03-19 | 初始设计文档 |
