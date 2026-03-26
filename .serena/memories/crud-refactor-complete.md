# CRUD 重构完成 - 通用组件架构

## 完成时间

2026-03-14

## 重构内容

### 创建的通用组件

1. **CrudPageLayout** - 三段式布局组件（Toolbar + Table + Footer）
2. **CrudToolbar** - 通用工具栏（搜索、批量操作、视图控制）
3. **CrudTable** - 通用表格组件（集成选择、分页、列配置）
4. **CrudFormDialog** - 通用表单对话框（创建/编辑模式、Zod 验证、乐观锁）
5. **TableColumnConfigDialog** - 通用列配置对话框

### 创建的 Composables

1. **useTableColumns** - 通用表格列管理（断点可见性 + localStorage 持久化）
2. **useCrudListPage** - 通用 CRUD 列表页逻辑（API 集成、状态管理、批量操作）
3. **useCrudToolbar** - 工具栏状态管理（全屏、密度、列配置）

### 表格格式化器工厂 (`src/components/common/table/formatters.ts`)

- `createBooleanTagFormatter` - 布尔值标签
- `createDateTimeFormatter` - 日期时间格式化（支持相对时间）
- `createDateFormatter` - 纯日期格式化
- `createArrayTagFormatter` - 数组标签（多对多关系）
- `createStatusTagFormatter` - 状态标签映射
- `createActionsFormatter` - 操作按钮组
- `buildActionsColumn` - 构建操作列

## 架构设计原则

### 三层架构

```
View 层 (UserListPageV2.vue)
    ↓
Logic 层 (useCrudListPage, useCrudToolbar)
    ↓
Formatter 层 (formatters.ts)
```

### 断点系统

- **Mobile**: < 768px
- **Tablet**: 768px - 1279px
- **Desktop**: ≥ 1280px

### 列可见性继承规则

- desktop 可见 → tablet 可见 → mobile 可见
- 继承链：desktop → tablet → mobile

## TypeScript 类型修复

### Vee-validate 集成

使用 `any` 类型配合 eslint-disable 注释处理 vee-validate 的复杂泛型：

```typescript
/* eslint-disable @typescript-eslint/no-explicit-any */
const fieldBindings = computed((): Record<string, [any, any]> => {
  // ...
})
/* eslint-enable @typescript-eslint/no-explicit-any */
```

### 相对时间格式化

在 `createDateTimeFormatter` 中实现内联相对时间逻辑：

- 刚刚、N 分钟前、N 小时前、N 天前、N 个月前、N 年前

## 验证通过

- ✅ TypeScript 类型检查
- ✅ ESLint 检查
- ✅ Prettier 格式化
- ✅ Stylelint 检查

## 后续模块开发建议

1. 复制 `useUserTableColumns.ts` 模式，定义新模块的列配置
2. 复制 `tableColumns.ts` 模式，定义操作列
3. 复制 `UserListPageV2.vue` 模式，组合通用组件
4. 使用 `useCrudListPage` 统一 API 和状态管理
5. 使用 `CrudFormDialog` 统一表单处理

## 详细文档

参考 `docs/CRUD_DEVELOPMENT_GUIDE.md`
