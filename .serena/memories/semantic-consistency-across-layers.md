# 跨层语义一致性原则

## 核心原则

**Composable 暴露的接口应该成为唯一的语义来源,跨层代码应使用统一的语义标志**

## 问题场景

当 composable 定义了语义接口,但消费层直接访问内部状态时,会导致语义不一致:

```typescript
// useMenu.ts 中定义
export const isMenuLoaded = computed(() => hasLoaded.value)

// DefaultLayout.vue 中直接访问
if (menuTree.value.length === 0) {
  // ❌ 语义不一致
  await loadMenus()
}
```

## 正确做法

**直接使用 composable 暴露的语义接口**

```typescript
const { selectMenu, isMenuLoaded, loadMenus } = useMenu()

if (!isMenuLoaded.value) {
  // ✅ 语义一致
  await loadMenus()
}
```

## 设计原则

1. **接口完整性**: Composable 应暴露所有需要的语义接口
2. **封装性**: 消费层不应直接访问 composable 的内部状态
3. **单一真相来源**: 相同语义的表达应该统一

## 适用场景

- 状态判断(是否加载、是否错误、是否为空)
- 操作触发(加载数据、清除缓存)
- 计算属性(设备类型、权限状态)

## 代码审查检查点

在代码审查时检查:

1. 是否绕过 composable 直接访问内部状态?
2. 是否使用不同的语义表达相同概念?
3. composable 暴露的接口是否完整?

## 相关文件

- `.learnings/LEARNINGS.md` - LRN-20260307-003
