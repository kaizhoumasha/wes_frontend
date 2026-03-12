# TypeScript + 框架集成调试经验教训

## 问题场景

vee-validate + Zod 类型兼容性问题，反复尝试多次才解决。

## 用户管理模块表单验证修复 (2026-03-10)

### 问题

`UserFormDialog.vue` 使用 Element Plus 原生表单验证，不符合规范要求的 `vee-validate` + Zod schemas。

### 解决方案

使用 `computed` 动态切换 `validationSchema`：

```typescript
// 定义包含所有可能字段的表单值类型
interface FormValues {
  username: string
  email: string
  full_name?: string
  password?: string
}

// 使用 computed 动态切换 schema
const { handleSubmit, errors, defineField, resetForm } = useForm<FormValues>({
  validationSchema: computed(() => (isEditMode.value ? UserUpdateSchema : UserCreateSchema)),
  initialValues: {
    username: '',
    email: '',
    full_name: '',
    password: ''
  }
})

// 提交时根据模式选择数据
const onSubmit = handleSubmit(async values => {
  if (isEditMode.value) {
    const updateData: UpdateUserInput = {
      email: values.email,
      full_name: values.full_name
    }
    emit('submit', updateData)
  } else {
    const createData: CreateUserInput = {
      username: values.username,
      email: values.email,
      full_name: values.full_name,
      password: values.password!
    }
    emit('submit', createData)
  }
})
```

### 关键点

1. **单一表单实例**：不要创建两个 `useForm` 实例，字段不兼容会报错
2. **动态 schema**：使用 `computed` 根据 `isEditMode` 切换验证 schema
3. **类型转换**：提交时根据模式手动构造正确的 API 类型

## 根本原因

1. 没有第一时间查看类型定义文件（.d.ts）
2. 没有确认包版本就查看文档（v4 vs v5 API 差异）
3. 过度工程化，尝试复杂绕过方法而非找到根本原因

## 正确的调试流程

### 1. 快速诊断（1-2分钟）

```bash
# 确认包版本
pnpm list package-name

# 查看类型定义
cat node_modules/package/dist/*.d.ts | grep "function"
```

### 2. 查看对应版本的文档（2-3分钟）

- 直接跳到官方文档对应版本的示例
- 不要跨版本查阅 API（v4 vs v5 可能完全不同）

### 3. 最小化实现（1分钟）

```typescript
// ✅ 使用最简单的 API
const { handleSubmit } = useForm<Type>({
  validationSchema: schema
})

// ❌ 避免复杂绕过
validationSchema: toTypedSchema(schema) as any
```

## vee-validate + Zod 正确用法

### v4.6+（当前稳定版）

```typescript
import { useForm } from 'vee-validate'
import { UserCreateSchema } from '@/types/zod-extensions'
import { userApi, type CreateUserInput } from '@/api/modules/user'

// 关键：使用泛型参数
const { handleSubmit, errors, defineField } = useForm<CreateUserInput>({
  validationSchema: UserCreateSchema // 直接传递，无需转换
})

const onSubmit = handleSubmit(async values => {
  // values 自动推断为 CreateUserInput
  await userApi.create(values) // 无需类型断言
})
```

### v5（beta 版）

```typescript
// v5 不需要泛型，可以自动推断
const { handleSubmit } = useForm({
  validationSchema: UserCreateSchema
})
```

## 关键原则

### KISS 原则

- 从最简单、最直接的 API 开始
- 类型系统是来帮你的，不是和你作对的

### 文档优先

- 在尝试绕过问题之前，确认你用的是正确的 API
- 类型定义文件比文档更准确

### 版本敏感

- 不同版本的 API 可能完全不同
- 确认版本后再看文档

## 浪费时间统计

- 盲目尝试各种 API：30分钟
- 正确流程：5分钟
- 浪费：约25分钟/次

## 相关文件

- 示例：src/views/examples/UserFormExample.vue
- Zod 生成：scripts/generate-zod-from-openapi.ts
- 类型定义：src/types/zod-extensions.ts
