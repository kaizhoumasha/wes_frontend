# 高级搜索对话框重构设计文档

> 版本: 1.2
> 创建日期: 2026-03-19
> 更新日期: 2026-03-19
> 状态: 设计阶段
> 依赖: [StandardDialog 组件设计](./STANDARD_DIALOG_DESIGN.md)

---

## 一、背景与目标

### 1.1 当前问题

| 问题                 | 描述                                                                       |
| -------------------- | -------------------------------------------------------------------------- |
| **数据模型不匹配**   | 前端 `SearchCondition` 是扁平结构，后端 `FilterGroup` 支持嵌套，两者不一致 |
| **无法表达复杂查询** | 不支持 `AND` 嵌套 `OR` 的条件组合，如 `(A AND B) OR (C AND D)`             |
| **多值输入体验差**   | `in`、`between` 等操作符缺乏专用输入组件                                   |
| **UI 布局不合理**    | 左右分栏设计不适合展示嵌套层级关系                                         |

### 1.2 重构目标

1. **完整支持 FilterGroupSchema** - 支持任意层级的嵌套条件组
2. **统一数据模型** - 前端直接使用 `FilterGroup` 结构，减少转换
3. **优化多值输入** - 根据操作符和数据类型提供最佳输入组件
4. **清晰的可视化层级** - 树形/嵌套式 UI，直观展示逻辑关系
5. **标准化对话框** - 基于 `StandardDialog` 组件，使用 `size="xl"` 预设

---

## 二、数据模型设计

### 2.1 后端 FilterGroup 结构（已定义）

```typescript
// 来自 src/api/base/crud-api.ts
interface FilterGroup {
  couple: 'and' | 'or' | 'not'
  conditions: (FilterCondition | FilterGroup)[] // 支持递归嵌套
}

interface FilterCondition {
  field: string
  op:
    | 'eq'
    | 'ne'
    | 'gt'
    | 'ge'
    | 'lt'
    | 'le'
    | 'in'
    | 'nin'
    | 'ilike'
    | 'between'
    | 'is_null'
    | 'not_null'
  value?: unknown
}
```

### 2.2 前端扩展结构

```typescript
// src/types/search.ts 新增

/** 前端 UI 扩展的条件 */
interface UIFilterCondition extends FilterCondition {
  id: string // 前端生成的唯一标识，用于 Vue key 和状态管理
}

/** 前端 UI 扩展的条件组 */
interface UIFilterGroup {
  id: string
  couple: 'and' | 'or' | 'not'
  conditions: (UIFilterCondition | UIFilterGroup)[]
}

/** 创建空条件 */
function createEmptyCondition(fieldKey?: string): UIFilterCondition

/** 创建空条件组 */
function createEmptyGroup(): UIFilterGroup
```

### 2.3 操作符映射

```typescript
// 前端语义化操作符 → 后端 API 操作符
const OPERATOR_MAP: Record<string, FilterOperator> = {
  equals: 'eq',
  notEquals: 'ne',
  contains: 'ilike',
  greaterThan: 'gt',
  greaterOrEqual: 'ge',
  lessThan: 'lt',
  lessOrEqual: 'le',
  between: 'between',
  in: 'in',
  notIn: 'nin',
  isNull: 'is_null',
  isNotNull: 'not_null'
}

// 后端 API 操作符 → 前端语义化操作符（反向映射）
const OPERATOR_REVERSE_MAP: Record<FilterOperator, string>
```

### 2.4 嵌套深度限制

```typescript
const MAX_NESTING_DEPTH = 3 // 最多 3 层嵌套，避免过度复杂
```

---

## 三、UI 组件架构

### 3.1 组件层级图

```
AdvancedSearchDialog.vue          # 对话框容器
├── FilterGroupBuilder.vue        # 条件组构建器（递归组件）
│   ├── CoupleSelector.vue        # AND/OR/NOT 选择器
│   ├── FilterConditionRow.vue    # 单条件编辑行
│   │   ├── FieldSelect.vue       # 字段选择器
│   │   ├── OperatorSelect.vue    # 操作符选择器
│   │   └── ConditionValueInput.vue # 值输入（按类型分发）
│   └── FilterGroupBuilder.vue    # 递归嵌套子组
├── FavoritesPanel.vue            # 收藏夹面板
└── FilterJsonPreview.vue         # JSON 预览（调试用，可隐藏）
```

### 3.2 组件职责

| 组件                   | 职责                          | Props                                                | Emits                                         |
| ---------------------- | ----------------------------- | ---------------------------------------------------- | --------------------------------------------- |
| `AdvancedSearchDialog` | 对话框容器，管理打开/关闭状态 | `modelValue`, `fields`, `favorites`, `initialFilter` | `update:modelValue`, `apply`, `save-favorite` |
| `FilterGroupBuilder`   | 递归渲染条件组，处理增删改    | `group`, `fields`, `depth`                           | `update`, `remove`                            |
| `CoupleSelector`       | 选择 AND/OR/NOT               | `modelValue`                                         | `update:modelValue`                           |
| `FilterConditionRow`   | 编辑单个条件                  | `condition`, `fields`                                | `update`, `remove`                            |
| `ConditionValueInput`  | 根据操作符+类型分发输入组件   | `operator`, `field`, `modelValue`                    | `update:modelValue`                           |
| `FavoritesPanel`       | 显示和应用收藏夹              | `favorites`                                          | `apply`, `save`, `delete`                     |

---

## 四、UI 视觉设计

> **对话框容器**：基于 `StandardDialog` 组件，使用 `size="xl"` 预设
>
> 详细尺寸策略参见 [StandardDialog 尺寸系统](./STANDARD_DIALOG_DESIGN.md#二尺寸系统设计)

### 4.1 对话框容器配置

```vue
<StandardDialog
  v-model="showAdvancedSearch"
  size="xl"
  title="高级搜索"
  :show-footer="false"
  :scrollable="true"
>
  <!-- 条件编辑区 -->
  <AdvancedSearchContent />

  <!-- 自定义 Footer -->
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

**`size="xl"` 预设值**（来自 StandardDialog）：

| 属性       | 值                 |
| ---------- | ------------------ |
| 宽度       | `min(900px, 85vw)` |
| 最大高度   | `85vh`             |
| 内容区滚动 | 自动启用           |

### 4.2 布局结构选择

**采用上下结构**，原因：

| 对比项         | 上下结构        | 左右结构          |
| -------------- | --------------- | ----------------- |
| 条件编辑区宽度 | 100%（~900px）  | ~70%（~630px）    |
| 嵌套结构适配   | ✅ 充足空间     | ⚠️ 空间紧张       |
| 主任务优先     | ✅ 视觉焦点集中 | ❌ 收藏夹分散注意 |
| F 型阅读模式   | ✅ 符合         | ❌ 不符合         |
| 收藏夹可见性   | ⚠️ 需滚动/折叠  | ✅ 始终可见       |

**结论**：主任务（条件编辑）占 80% 操作时间，应获得最大空间优先权。

### 4.3 主流分辨率适配效果

| 分辨率    | 对话框宽度   | 占屏幕比例 | 效果      |
| --------- | ------------ | ---------- | --------- |
| 1920×1080 | 900px        | 46.9%      | ✅ 理想   |
| 1680×1050 | 900px        | 53.6%      | ✅ 良好   |
| 1440×900  | 900px        | 62.5%      | ✅ 可接受 |
| 1366×768  | 900px        | 65.9%      | ✅ 可接受 |
| 1280×720  | 900px        | 70.3%      | ⚠️ 略宽   |
| 1024×768  | 870px (85vw) | 85%        | ⚠️ 紧凑   |

> 响应式适配由 StandardDialog 自动处理

### 4.4 布局示意图

**1920×1080 分辨率（理想效果）**：

```
┌─────────────────────────────────────────────────────────────────────┐
│  高级搜索                                                       [×]  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │                     条件编辑区 (flex: 1)                         ││
│  │  ╔═══════════════════════════════════════════════════════════╗  ││
│  │  ║ [AND ▼]                              [+ 条件] [+ 组] [清空]║  ││
│  │  ╠═══════════════════════════════════════════════════════════╣  ││
│  │  ║                                                             ║  ││
│  │  ║  ┌────────────────────────────────────────────────────────┐║  ││
│  │  ║  │ [字段选择 ▼] [操作符 ▼] [值输入________________] [删除]│║  ││
│  │  ║  └────────────────────────────────────────────────────────┘║  ││
│  │  ║                                                             ║  ││
│  │  ║  ┌────────────────────────────────────────────────────────┐║  ││
│  │  ║  │                [OR] 嵌套组                              │║  ││
│  │  ║  │  ┌────────────────────────────────────────────────────┐│║  ││
│  │  ║  │  │ [状态▼] [等于▼] [启用, 禁用 ×]              [删除]││║  ││
│  │  ║  │  └────────────────────────────────────────────────────┘│║  ││
│  │  ║  └────────────────────────────────────────────────────────┘║  ││
│  │  ║                                                             ║  ││
│  │  ╚═════════════════════════════════════════════════════════════╝  ││
│  └─────────────────────────────────────────────────────────────────┘│
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│  💾 收藏夹                                              [▼ 折叠]   │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐          │
│  │ 管理员    │ │ 待审用户  │ │ 今日新增  │ │ [+ 保存]  │          │
│  └───────────┘ └───────────┘ └───────────┘ └───────────┘          │
├─────────────────────────────────────────────────────────────────────┤
│                                            [取消]  [应用搜索]       │
└─────────────────────────────────────────────────────────────────────┘
```

**1366×768 分辨率（紧凑模式）**：

```
┌───────────────────────────────────────────────────┐
│  高级搜索                                    [×]  │
├───────────────────────────────────────────────────┤
│                                                   │
│  ┌───────────────────────────────────────────────┐│
│  │  条件编辑区 (滚动)                            ││
│  │  ╔═════════════════════════════════════════╗  ││
│  │  ║ [AND ▼]                [+ 条件] [+ 组]  ║  ││
│  │  ╠═════════════════════════════════════════╣  ││
│  │  ║ ┌──────────────────────────────────────┐║  ││
│  │  ║ │ [字段▼] [操作符▼] [值______] [删除] │║  ││
│  │  ║ └──────────────────────────────────────┘║  ││
│  │  ║ ... (滚动区域)                         ║  ││
│  │  ╚═════════════════════════════════════════╝  ││
│  └───────────────────────────────────────────────┘│
│                                                   │
├───────────────────────────────────────────────────┤
│  💾 收藏夹                            [▼ 折叠]   │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐             │
│  │ 管理员  │ │ 待审    │ [+ 保存] │             │
│  └─────────┘ └─────────┘ └─────────┘             │
├───────────────────────────────────────────────────┤
│                          [取消]  [应用搜索]       │
└───────────────────────────────────────────────────┘
```

**1024×768 分辨率（小屏模式，宽度 85vw）**：

```
┌────────────────────────────────────────────────┐
│  高级搜索                                 [×]  │
├────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────┐│
│  │  条件编辑区 (滚动)                         ││
│  │  ╔══════════════════════════════════════╗  ││
│  │  ║ [AND ▼]            [+ 条件] [+ 组]   ║  ││
│  │  ╠══════════════════════════════════════╣  ││
│  │  ║ ┌──────────────────────────────────┐ ║  ││
│  │  ║ │ [字段▼] [操作符▼] [值__] [删除] │ ║  ││
│  │  ║ └──────────────────────────────────┘ ║  ││
│  │  ╚══════════════════════════════════════╝  ││
│  └────────────────────────────────────────────┘│
├────────────────────────────────────────────────┤
│  💾 收藏夹 [▼ 折叠]                           │
├────────────────────────────────────────────────┤
│                    [取消]  [应用搜索]          │
└────────────────────────────────────────────────┘
```

### 4.5 条件组视觉层级

**使用缩进 + 边框 + 背景色区分层级**：

```css
/* 层级样式 */
.filter-group--depth-0 {
  border: 2px solid var(--el-border-color);
  background: var(--el-bg-color);
}

.filter-group--depth-1 {
  border: 1px dashed var(--el-color-primary-light-5);
  background: var(--el-fill-color-light);
  margin-left: 12px;
}

.filter-group--depth-2 {
  border: 1px dotted var(--el-color-success-light-5);
  background: var(--el-fill-color);
  margin-left: 24px;
}
```

**视觉效果预览**：

```
┌══════════════════════════════════════════┐  ← depth-0: 实线边框
│  [AND]                                    │
│                                           │
│  ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐  │  ← depth-1: 虚线边框
│    [OR]                                  │
│    条件1                                  │
│    条件2                                  │
│  └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘  │
│                                           │
│  ┌ · · · · · · · · · · · · · · · · · · · ┐ │  ← depth-2: 点线边框
│    [NOT]                                  │
│    条件3                                  │
│  └ · · · · · · · · · · · · · · · · · · · ┘ │
└══════════════════════════════════════════┘
```

### 4.6 CoupleSelector 设计

**使用 Radio Button Group**：

```
┌─────────────────────────────────────────┐
│  ╭────────╮ ╭───────╮ ╭───────╮        │
│  │ 且 AND │ │ 或 OR │ │ 非 NOT│        │
│  ╰────────╯ ╰───────╯ ╰───────╯        │
└─────────────────────────────────────────┘
```

**状态说明**：

- `AND`: 所有条件都满足
- `OR`: 任一条件满足
- `NOT`: 排除满足条件的记录

### 4.7 条件行设计

**单值输入**：

```
┌──────────────┬──────────────┬────────────────────┬──────┐
│ [用户名    ▼]│ [包含      ▼]│ [admin___________] │ [×]  │
└──────────────┴──────────────┴────────────────────┴──────┘
```

**between 数字范围**：

```
┌──────────────┬──────────────┬─────────────┬───┬─────────────┬──────┐
│ [创建时间  ▼]│ [介于      ▼]│ [___10____] │ - │ [___50____] │ [×]  │
└──────────────┴──────────────┴─────────────┴───┴─────────────┴──────┘
```

**between 日期范围**：

```
┌──────────────┬──────────────┬────────────────────────────────────┬──────┐
│ [创建时间  ▼]│ [介于      ▼]│ [📅 2024-01-01] 至 [📅 2024-12-31] │ [×]  │
└──────────────┴──────────────┴────────────────────────────────────┴──────┘
```

**in 多值（枚举）**：

```
┌──────────────┬──────────────┬─────────────────────────────────────┬──────┐
│ [状态      ▼]│ [属于      ▼]│ [启用, 禁用, 待审 ×]             [▼] │ [×]  │
└──────────────┴──────────────┴─────────────────────────────────────┴──────┘
```

**in 多值（自由输入）**：

```
┌──────────────┬──────────────┬─────────────────────────────────────┬──────┐
│ [标签      ▼]│ [属于      ▼]│ [VIP, 活跃, 新用户 ×]   [输入...] │ [×]  │
└──────────────┴──────────────┴─────────────────────────────────────┴──────┘
```

**is_null / not_null**：

```
┌──────────────┬──────────────┬─────────────────────┬──────┐
│ [删除时间  ▼]│ [为空      ▼]│ (无需输入值)        │ [×]  │
└──────────────┴──────────────┴─────────────────────┴──────┘
```

---

## 五、交互设计

### 5.1 条件组操作

| 操作             | 触发方式                       | 结果                         |
| ---------------- | ------------------------------ | ---------------------------- |
| **添加条件**     | 点击 `[+ 条件]` 按钮           | 在当前组末尾添加一个空条件行 |
| **添加子组**     | 点击 `[+ 组]` 按钮             | 在当前组末尾添加一个嵌套子组 |
| **删除条件**     | 点击条件行的 `[×]` 按钮        | 移除该条件                   |
| **删除子组**     | 点击子组标题栏的 `[×]` 按钮    | 移除整个子组（含所有子条件） |
| **切换组合类型** | 点击 AND/OR/NOT 选择器         | 改变当前组的逻辑关系         |
| **清空所有**     | 点击对话框顶部的 `[清空]` 按钮 | 重置为单个空条件组           |

### 5.2 条件编辑流程

```
用户点击 [+ 条件]
        ↓
创建空条件（默认选中第一个字段）
        ↓
用户选择字段 → 自动选择该类型的默认操作符
        ↓
用户选择操作符 → 根据操作符显示对应的值输入组件
        ↓
用户输入值 → 条件变为有效状态
        ↓
点击 [应用搜索] → 提交 FilterGroup 到父组件
```

### 5.3 字段切换时的值处理

```typescript
// 字段切换时，智能处理值的转换
function handleFieldChange(newField: SearchFieldDef, currentValue: unknown): unknown {
  switch (newField.dataType) {
    case 'boolean':
      return true // 布尔类型默认 true
    case 'enum':
      return newField.options?.[0]?.value // 枚举类型默认第一个选项
    case 'number':
      return typeof currentValue === 'number' ? currentValue : undefined
    case 'date':
    case 'text':
    default:
      return typeof currentValue === 'string' ? currentValue : ''
  }
}
```

### 5.4 操作符切换时的值处理

```typescript
// 操作符切换时，智能处理值的转换
function handleOperatorChange(newOperator: string, currentValue: unknown): unknown {
  switch (newOperator) {
    case 'between':
      return [undefined, undefined] // between 需要数组
    case 'in':
    case 'nin':
      return Array.isArray(currentValue) ? currentValue : []
    case 'is_null':
    case 'not_null':
      return undefined // 这些操作符不需要值
    default:
      // 单值操作符，从数组中提取
      if (Array.isArray(currentValue)) {
        return currentValue[0]
      }
      return currentValue
  }
}
```

### 5.5 收藏夹交互

| 操作         | 触发方式                | 结果                           |
| ------------ | ----------------------- | ------------------------------ |
| **应用收藏** | 点击收藏项              | 用收藏的条件组替换当前编辑区   |
| **保存收藏** | 点击 `[+ 保存当前条件]` | 弹出命名对话框，保存当前条件组 |
| **删除收藏** | 点击收藏项的删除图标    | 确认后删除该收藏               |

---

## 六、值输入组件映射表

### 6.1 完整映射规则

| 操作符                    | 数据类型      | Element Plus 组件     | 配置                               |
| ------------------------- | ------------- | --------------------- | ---------------------------------- |
| `eq/ne/gt/ge/lt/le/ilike` | `text`        | `el-input`            | -                                  |
| `eq/ne/gt/ge/lt/le`       | `number`      | `el-input-number`     | -                                  |
| `eq/ne/gt/ge/lt/le`       | `date`        | `el-date-picker`      | `type="date"`                      |
| `eq/ne`                   | `boolean`     | `el-select`           | `true/false` 选项                  |
| `eq/ne`                   | `enum`        | `el-select`           | 动态 options                       |
| `between`                 | `number`      | `el-input-number` × 2 | 双输入框 + 分隔符                  |
| `between`                 | `date`        | `el-date-picker`      | `type="daterange"`                 |
| `in/nin`                  | `enum`        | `el-select`           | `multiple collapse-tags`           |
| `in/nin`                  | `text/number` | `el-select`           | `multiple filterable allow-create` |
| `in/nin`                  | `关联实体`    | `el-select`           | `multiple filterable remote`       |
| `is_null/not_null`        | \*            | 无                    | 隐藏值输入区域                     |

### 6.2 ConditionValueInput 组件伪代码

```vue
<template>
  <!-- 根据 inputType 渲染对应组件 -->
  <component
    :is="componentMap[inputType]"
    v-bind="componentProps"
    v-model="value"
  />
</template>

<script setup lang="ts">
const inputType = computed(() => {
  const { operator } = props
  const { dataType, options, remoteSearch } = props.field

  // 1. 无需输入
  if (operator === 'is_null' || operator === 'not_null') return 'none'

  // 2. between 范围
  if (operator === 'between') {
    return dataType === 'date' ? 'date-range' : 'number-range'
  }

  // 3. in/nin 多值
  if (operator === 'in' || operator === 'nin') {
    if (options?.length) return 'select-multiple'
    if (remoteSearch) return 'remote-select-multiple'
    return 'tag-input' // allow-create 模式
  }

  // 4. 单值
  return SINGLE_VALUE_MAP[dataType] || 'text'
})
</script>
```

---

## 七、边界情况处理

### 7.1 空状态

**空条件组**：

```
┌─────────────────────────────────────────┐
│  [AND ▼]                  [+ 条件] [+ 组]│
│  ┌─────────────────────────────────────┐│
│  │                                     ││
│  │      📋 暂无条件                     ││
│  │      点击上方按钮添加                ││
│  │                                     ││
│  └─────────────────────────────────────┘│
└─────────────────────────────────────────┘
```

**空条件（未完成）**：

```
┌──────────────┬──────────────┬────────────────────┐
│ [请选择字段▼]│ [等于      ▼]│ (请先选择字段)     │  ← 灰色提示
└──────────────┴──────────────┴────────────────────┘
```

### 7.2 无效条件处理

**应用搜索时校验**：

```typescript
function validateGroup(group: UIFilterGroup): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  group.conditions.forEach((item, index) => {
    if ('conditions' in item) {
      // 递归校验子组
      const subResult = validateGroup(item)
      errors.push(...subResult.errors.map(e => `组${index}: ${e}`))
    } else {
      // 校验条件
      if (!item.field) {
        errors.push(`条件${index + 1}: 未选择字段`)
      }
      if (needsValue(item.op) && item.value === undefined) {
        errors.push(`条件${index + 1}: 未输入值`)
      }
    }
  })

  return { valid: errors.length === 0, errors }
}
```

**校验失败提示**：

```
┌─────────────────────────────────────────┐
│  ⚠️ 条件不完整，请检查：                 │
│  • 条件2: 未输入值                       │
│  • 组3: 未选择字段                       │
└─────────────────────────────────────────┘
```

### 7.3 深度限制

**达到最大深度时**：

```
┌─────────────────────────────────────────┐
│  [AND ▼]                  [+ 条件]       │  ← [+ 组] 按钮禁用
│  ⚠️ 已达到最大嵌套深度 (3层)             │
└─────────────────────────────────────────┘
```

### 7.4 大量条件处理

**条件超过 5 个时折叠显示**：

```
┌─────────────────────────────────────────┐
│  [AND ▼]        [+ 条件] [+ 组] [展开 ▼]│
│  • 用户名 包含 admin                     │
│  • 状态 等于 启用                        │
│  • ... 还有 8 个条件                     │
└─────────────────────────────────────────┘
```

---

## 八、响应式设计

> **对话框响应式**：由 `StandardDialog` 组件自动处理，使用 `size="xl"` 预设
>
> 详细策略参见 [StandardDialog 响应式设计](./STANDARD_DIALOG_DESIGN.md#六响应式设计)

### 8.1 条件行布局适配

```css
/* 桌面端/平板：横向排列 */
.condition-row {
  display: flex;
  flex-direction: row;
  gap: 8px;
}

/* 移动端：纵向堆叠 */
@media (max-width: 768px) {
  .condition-row {
    flex-direction: column;
    gap: 12px;
  }

  /* 移动端删除按钮右对齐 */
  .condition-row__delete {
    align-self: flex-end;
  }
}
```

### 8.2 移动端视觉效果

**全屏对话框 + 纵向条件布局**：

```
┌─────────────────────────────────┐
│  高级搜索                    [×] │
├─────────────────────────────────┤
│  [AND ▼]         [+ 条件] [+ 组]│
│                                 │
│  ┌─────────────────────────────┐│
│  │ [字段          ▼]           ││
│  │ [操作符        ▼]           ││
│  │ [值_________________]       ││
│  │                    [删除]   ││
│  └─────────────────────────────┘│
│                                 │
│  ┌─────────────────────────────┐│
│  │      [OR] 组                ││
│  │  ...                        ││
│  └─────────────────────────────┘│
├─────────────────────────────────┤
│  💾 收藏夹            [▼ 折叠] │
│  ┌──────┐ ┌──────┐ [+ 保存]    │
│  └──────┘ └──────┘             │
├─────────────────────────────────┤
│  [取消]          [应用搜索]     │
└─────────────────────────────────┘
```

### 8.3 CSS 变量定义

> 对话框相关变量由 `StandardDialog` 组件提供，此处仅定义高级搜索特有变量

```css
:root {
  /* 条件编辑区 */
  --filter-editor-min-height: 300px;

  /* 收藏夹面板 */
  --favorites-panel-height: 120px;
}
```

---

## 九、视觉设计规范

> **对话框容器样式**：由 `StandardDialog` 组件提供
>
> - 尺寸系统：参见 [StandardDialog 尺寸系统](./STANDARD_DIALOG_DESIGN.md#二尺寸系统设计)
> - 响应式设计：参见 [StandardDialog 响应式设计](./STANDARD_DIALOG_DESIGN.md#六响应式设计)
> - 动画规范：参见 [StandardDialog 视觉规范](./STANDARD_DIALOG_DESIGN.md#八视觉设计规范)

### 9.1 颜色变量定义

```css
:root {
  /* 条件组层级背景 */
  --filter-group-depth-0-bg: var(--el-bg-color);
  --filter-group-depth-0-border: var(--el-border-color);
  --filter-group-depth-1-bg: var(--el-fill-color-light);
  --filter-group-depth-1-border: var(--el-color-primary-light-5);
  --filter-group-depth-2-bg: var(--el-fill-color);
  --filter-group-depth-2-border: var(--el-color-success-light-5);

  /* 条件行状态 */
  --condition-row-bg: transparent;
  --condition-row-hover-bg: var(--el-fill-color-light);
  --condition-row-active-bg: var(--el-fill-color);
  --condition-row-invalid-bg: var(--el-color-danger-light-9);
  --condition-row-invalid-border: var(--el-color-danger-light-5);

  /* 收藏项 */
  --favorite-item-bg: var(--el-fill-color-light);
  --favorite-item-hover-bg: var(--el-fill-color);
  --favorite-item-active-border: var(--el-color-primary);
  --favorite-item-active-indicator: 3px solid var(--el-color-primary);

  /* 条件编辑区 */
  --filter-editor-min-height: 300px;
  --filter-editor-max-height: calc(85vh - 200px);

  /* 收藏夹面板 */
  --favorites-panel-height: 120px;
  --favorites-panel-collapsed-height: 48px;
}

/* 暗色模式适配 */
.dark {
  --filter-group-depth-1-border: var(--el-color-primary-light-3);
  --filter-group-depth-2-border: var(--el-color-success-light-3);
}
```

### 9.2 条件行状态样式

| 状态        | 背景                             | 边框                                       | 变换     |
| ----------- | -------------------------------- | ------------------------------------------ | -------- |
| **默认**    | `transparent`                    | none                                       | -        |
| **hover**   | `var(--el-fill-color-light)`     | none                                       | -        |
| **active**  | `var(--el-fill-color)`           | none                                       | -        |
| **invalid** | `var(--el-color-danger-light-9)` | `1px solid var(--el-color-danger-light-5)` | 轻微抖动 |

```css
.condition-row {
  background: var(--condition-row-bg);
  border-radius: 6px;
  padding: 12px 16px;
  transition: background 0.15s ease;
}

.condition-row:hover {
  background: var(--condition-row-hover-bg);
}

.condition-row--invalid {
  background: var(--condition-row-invalid-bg);
  border: 1px solid var(--condition-row-invalid-border);
  animation: condition-shake 0.3s ease;
}

@keyframes condition-shake {
  0%,
  100% {
    transform: translateX(0);
  }
  20%,
  60% {
    transform: translateX(-4px);
  }
  40%,
  80% {
    transform: translateX(4px);
  }
}
```

### 9.3 条件组嵌套视觉

```css
/* 层级 0 - 根组 */
.filter-group--depth-0 {
  background: var(--filter-group-depth-0-bg);
  border: 2px solid var(--filter-group-depth-0-border);
  border-radius: 8px;
  padding: 16px;
}

/* 层级 1 - 第一层嵌套 */
.filter-group--depth-1 {
  background: var(--filter-group-depth-1-bg);
  border: 1px dashed var(--filter-group-depth-1-border);
  border-radius: 6px;
  margin-left: 12px;
  padding: 12px;
}

/* 层级 2 - 第二层嵌套 */
.filter-group--depth-2 {
  background: var(--filter-group-depth-2-bg);
  border: 1px dotted var(--filter-group-depth-2-border);
  border-radius: 4px;
  margin-left: 24px;
  padding: 10px;
}
```

### 9.4 收藏夹面板设计

#### 收藏项样式

```css
.favorite-item {
  display: inline-flex;
  align-items: center;
  height: 36px;
  padding: 0 12px;
  background: var(--favorite-item-bg);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
  user-select: none;
}

.favorite-item:hover {
  background: var(--favorite-item-hover-bg);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.favorite-item:active {
  transform: translateY(0);
}

.favorite-item--active {
  border-left: var(--favorite-item-active-indicator);
  background: var(--favorite-item-hover-bg);
}

.favorite-item__delete {
  opacity: 0;
  margin-left: 8px;
  transition: opacity 0.15s ease;
}

.favorite-item:hover .favorite-item__delete {
  opacity: 1;
}
```

#### 面板折叠动画

```css
.favorites-panel {
  overflow: hidden;
  transition: max-height 0.25s ease;
}

.favorites-panel--collapsed {
  max-height: var(--favorites-panel-collapsed-height);
}

.favorites-panel--expanded {
  max-height: var(--favorites-panel-height);
}
```

### 9.5 条件操作动画

#### 添加条件动画

```css
.condition-row-enter-active {
  animation: condition-enter 200ms ease-out;
}

@keyframes condition-enter {
  from {
    opacity: 0;
    transform: translateY(-8px);
    max-height: 0;
  }
  to {
    opacity: 1;
    transform: translateY(0);
    max-height: 80px;
  }
}
```

#### 删除条件动画

```css
.condition-row-leave-active {
  animation: condition-leave 150ms ease-in;
}

@keyframes condition-leave {
  from {
    opacity: 1;
    transform: translateX(0);
    max-height: 80px;
  }
  to {
    opacity: 0;
    transform: translateX(20px);
    max-height: 0;
  }
}
```

#### 子组展开/折叠

```css
.filter-group__children-enter-active,
.filter-group__children-leave-active {
  transition: all 0.2s ease;
  overflow: hidden;
}

.filter-group__children-enter-from,
.filter-group__children-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-10px);
}
```

### 9.6 按钮组设计

```css
/* 工具栏按钮 */
.filter-toolbar__btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 13px;
  transition: all 0.15s ease;
}

.filter-toolbar__btn:hover {
  background: var(--el-fill-color-light);
}

.filter-toolbar__btn--primary {
  color: var(--el-color-primary);
}

.filter-toolbar__btn--primary:hover {
  background: var(--el-color-primary-light-9);
}

/* 添加按钮强调 */
.filter-toolbar__btn--add {
  border: 1px dashed var(--el-border-color);
}

.filter-toolbar__btn--add:hover {
  border-color: var(--el-color-primary);
  color: var(--el-color-primary);
}
```

### 9.7 空状态设计

```css
.filter-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 160px;
  padding: 32px;
  color: var(--el-text-color-placeholder);
}

.filter-empty-state__icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.6;
}

.filter-empty-state__text {
  font-size: 14px;
  margin-bottom: 16px;
}

.filter-empty-state__action {
  color: var(--el-color-primary);
  cursor: pointer;
  font-size: 13px;
}

.filter-empty-state__action:hover {
  text-decoration: underline;
}
```

### 9.8 暗色模式特殊处理

```css
.dark {
  /* 嵌套层级边框增强 */
  .filter-group--depth-1 {
    border-style: solid; /* 虚线在暗色模式下不明显，改为实线 */
  }

  .filter-group--depth-2 {
    border-style: solid;
  }

  /* hover 状态增强 */
  .condition-row:hover {
    background: rgba(255, 255, 255, 0.05);
  }

  /* 收藏项阴影调整 */
  .favorite-item:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }
}
```

---

## 十、可访问性设计

> **对话框可访问性**：由 `StandardDialog` 组件处理，参见 [StandardDialog 可访问性设计](./STANDARD_DIALOG_DESIGN.md#七可访问性设计)

### 10.1 条件组键盘导航

| 快捷键   | 功能               |
| -------- | ------------------ |
| `Tab`    | 在条件之间切换焦点 |
| `Enter`  | 在输入框中确认值   |
| `Delete` | 删除当前聚焦的条件 |
| `Escape` | 关闭对话框         |

### 10.2 条件组 ARIA 标签

```vue
<div role="group" :aria-label="`条件组，逻辑关系：${coupleLabel}`">
  <button
    :aria-label="`添加条件到${coupleLabel}组`"
    @click="addCondition"
  >
    + 条件
  </button>
</div>
```

### 10.3 条件状态提示

- 条件无效时，使用 `aria-invalid="true"`
- 错误信息使用 `aria-describedby` 关联

---

## 十一、性能考虑

### 11.1 大量条件优化

- 使用 `v-show` 代替 `v-if` 保持组件状态
- 条件超过 10 个时启用虚拟滚动
- 使用 `shallowRef` 减少深层响应式开销

### 11.2 防抖处理

```typescript
// 远程搜索防抖
const debouncedRemoteSearch = useDebounceFn(searchEntities, 300)
```

### 11.3 懒加载

- 收藏夹面板默认折叠，展开时才加载数据
- JSON 预览面板按需渲染

---

## 十二、测试用例

### 12.1 单元测试

- [ ] `createEmptyCondition` 返回正确结构
- [ ] `createEmptyGroup` 返回正确结构
- [ ] `toAPIFilter` 正确去除前端扩展字段
- [ ] `toUIFilter` 正确添加 ID
- [ ] `validateGroup` 正确识别无效条件

### 12.2 集成测试

- [ ] 添加条件 → 条件出现在列表中
- [ ] 删除条件 → 条件从列表中移除
- [ ] 切换 AND/OR/NOT → 条件组逻辑改变
- [ ] 嵌套子组 → 子组正确缩进显示
- [ ] 应用搜索 → FilterGroup 正确提交

### 12.3 E2E 测试

- [ ] 完整流程：打开 → 添加条件 → 编辑 → 应用
- [ ] 收藏夹：保存 → 应用 → 删除
- [ ] 边界：最大嵌套深度限制
- [ ] 边界：空条件校验提示

---

## 十三、迁移计划

### 13.1 兼容性处理

**保留现有 `SearchCondition` 类型**，提供转换函数：

```typescript
// 旧格式 → 新格式
function legacyToFilterGroup(conditions: SearchCondition[]): UIFilterGroup

// 新格式 → 旧格式（降级兼容）
function filterGroupToLegacy(group: UIFilterGroup): SearchCondition[]
```

### 13.2 渐进式迁移

1. **Phase 1**: 实现新组件，与旧组件并存
2. **Phase 2**: 添加 Feature Flag 切换新旧版本
3. **Phase 3**: 灰度发布，收集反馈
4. **Phase 4**: 全量切换，移除旧组件

---

## 附录 A：参考资源

- [StandardDialog 组件设计](./STANDARD_DIALOG_DESIGN.md) - 标准对话框组件
- [Element Plus Select 组件文档](https://element-plus.org/zh-CN/component/select.html)
- [FilterGroupSchema 定义](src/types/generated/zod-schemas.ts)
- [后端 Swagger 文档](http://localhost:8001/api/docs)

---

## 附录 B：变更记录

| 版本 | 日期       | 变更内容                                                                                 |
| ---- | ---------- | ---------------------------------------------------------------------------------------- |
| 1.2  | 2026-03-19 | 补充视觉设计规范：颜色变量、条件行状态、嵌套层级样式、收藏夹设计、动画时序、暗色模式适配 |
| 1.1  | 2026-03-19 | 基于 StandardDialog 组件重构，简化对话框配置，更新布局结构为上下模式，宽度调整为 900px   |
| 1.0  | 2026-03-19 | 初始设计文档                                                                             |
