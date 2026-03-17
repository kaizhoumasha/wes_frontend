---
name: form-field-readonly-pattern
description: 统一字段配置中 formReadonly 属性的行为和用途
type: reference
---

## UnifiedFieldConfig 的 formReadonly 属性

在 `useTableColumns.ts` 的 `UnifiedFieldConfig` 接口中，`formReadonly` 属性控制表单字段在**编辑模式下**的行为：

```typescript
interface UnifiedFieldConfig {
  formReadonly?: boolean // 是否只读（编辑模式下）
}
```

### 行为规则

| formReadonly | 创建模式 | 编辑模式         |
| ------------ | -------- | ---------------- |
| `true`       | 可编辑   | **只读（禁用）** |
| `false`      | 可编辑   | 可编辑           |
| `undefined`  | 可编辑   | 可编辑（默认）   |

### CrudFormDialog 实现逻辑

```vue
:disabled="field.readonly && isEditMode"
```

- 当 `readonly: true` 且处于编辑模式时，输入框会被 `disabled`
- 创建模式下该字段始终可编辑（除非单独设置 `disabled: true`）

### 使用场景

**用户名字段示例**：

```typescript
{
  key: 'username',
  formType: 'input',
  formReadonly: true,  // ✅ 编辑模式下只读，防止用户修改用户名
  formRequired: true
}
```

**为什么需要这样设计**：

- 用户名通常不允许修改（后端可能不支持或业务逻辑禁止）
- 创建时需要填写，编辑时只读显示
- 保持统一配置源，无需为创建/编辑维护两套配置

### 相关文件

- `src/composables/useTableColumns.ts` - `UnifiedFieldConfig` 定义
- `src/components/common/CrudFormDialog.vue` - 实现 `:disabled="field.readonly && isEditMode"`
- `src/views/admin/users/composables/useUserTableColumns.ts` - 实际使用示例
