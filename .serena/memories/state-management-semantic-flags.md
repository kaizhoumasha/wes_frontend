# 语义化状态管理最佳实践

## 核心原则

**使用独立的状态标志表示"加载状态",而非依赖数据本身**

空数组 `[]`、空对象 `{}`、空字符串 `""` 都是合法的业务状态,不能用作"未加载"的判断依据。

## 标准模式

```typescript
// 1. 定义语义标志
const hasLoaded = ref(false)
const isLoading = ref(false)
const loadError = ref<Error | null>(null)

// 2. 导出计算属性供外部使用
export const isLoaded = computed(() => hasLoaded.value)
export const isPending = computed(() => isLoading.value)

// 3. 加载函数
const loadData = async (forceRefresh = false) => {
  if (!forceRefresh && hasLoaded.value) {
    return // 已尝试加载,无论结果如何都跳过
  }

  isLoading.value = true
  try {
    const data = await api.fetch()
    setData(data)
    hasLoaded.value = true
  } catch (error) {
    loadError.value = error
    hasLoaded.value = true // 失败也算"已尝试加载"
  } finally {
    isLoading.value = false
  }
}

// 4. 直接注入数据时也要设置
const hydrateData = (data: DataType) => {
  setData(data)
  hasLoaded.value = true
}
```

## 状态生命周期

| 状态         | hasLoaded | isLoading | loadError | 说明     |
| ------------ | --------- | --------- | --------- | -------- |
| 未开始       | false     | false     | null      | 初始状态 |
| 加载中       | false     | true      | null      | 正在请求 |
| 成功(有数据) | true      | false     | null      | 正常完成 |
| 成功(空)     | true      | false     | null      | 合法状态 |
| 失败         | true      | false     | Error     | 需要重试 |

## 常见错误

❌ **错误**: 使用数据长度判断

```typescript
if (data.value.length === 0) {
  await loadData() // 会重复请求
}
```

✅ **正确**: 使用语义标志

```typescript
if (!isLoaded.value) {
  await loadData()
}
```

## 适用场景

- 数据初始化(权限、菜单、配置等)
- 可能返回空结果的异步操作
- 需要区分"未开始"、"进行中"、"成功"、"失败"等状态

## 项目实践

已在以下文件应用:

- `src/composables/useMenu.ts` - 菜单加载状态
- `src/composables/usePermission.ts` - 权限加载状态

## 相关文件

- `.learnings/LEARNINGS.md` - LRN-20260307-001
