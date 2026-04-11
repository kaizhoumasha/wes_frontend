# 菜单树懒加载参数缺失导致子节点数据丢失

## 问题现象

SessionStorage 中 `wes_menu-tree` 只存储了第一层数据，没有子节点（`children` 为空数组）。

## 根本原因

后端树形接口支持懒加载模式，通过 `tree_depth` 参数控制：

- `tree_depth=0`（默认）：仅返回顶层节点，`children=[]`，配合前端懒加载
- `tree_depth=-1`：返回完整树，包含所有子节点

前端调用 `menuApi.tree()` 时未传参数，后端使用默认懒加载模式，导致只返回第一层数据。

## 解决方案

修改 API 调用，传递 `tree_depth=-1` 获取完整树：

```typescript
// 修改前（错误）
const response = await menuApi.tree()

// 修改后（正确）
const response = await menuApi.tree({ tree_depth: -1 })
```

## 关键知识点

### 后端树形 API 设计模式

**懒加载模式适用场景**：

- 树节点数量大（> 500 节点）
- 用户通常只访问部分分支
- 需要减少单次请求数据量

**完整树模式适用场景**：

- 树节点数量小（< 200 节点）
- 需要前端缓存完整树（如菜单导航）
- 需要前端计算路径、面包屑等

### 前端集成注意事项

**检查 OpenAPI 类型定义**：

```typescript
// src/api/generated/openapi-types.ts
admin_menus_tree_get: {
  parameters: {
    query?: {
      tree_depth?: number;  // ⚠️ 注意这个参数
    }
  }
}
```

**缓存策略与数据完整性**：

- 懒加载模式：前端需实现展开时调用 `/children` 接口
- 完整树模式：一次加载，缓存整个树，适合 sessionStorage

### 调试技巧

**检查后端实现**：

```bash
# 查看树形服务实现
../wes_backend/src/core/tree_service.py

# 关键方法：get_tree() 的 tree_depth 参数处理
if tree_depth == 0:
  return await self._get_tree_lazy(...)  # 懒加载
else:
  return await self._query_tree(...)     # 完整树
```

**验证 sessionStorage 数据结构**：

```javascript
// 浏览器 DevTools → Application → Session Storage
const menuTree = JSON.parse(sessionStorage.getItem('wes_menu-tree'))
console.log(menuTree[0].children) // 应该有子节点，而非 []
```

## 防止再次发生

**API 集成清单**（新增树形接口时）：

1. ✅ 查看 OpenAPI 类型定义，识别所有 query 参数
2. ✅ 理解后端参数默认行为（懒加载 vs 完整数据）
3. ✅ 根据前端需求选择合适的参数值
4. ✅ 验证返回数据结构（检查 children 字段）

**文档更新建议**：
在 `CLAUDE.md` 或 API 模块注释中标注：

```typescript
/**
 * 获取菜单树
 *
 * ⚠️ 重要：传递 tree_depth=-1 获取完整树
 * - tree_depth=0（默认）：仅顶层节点（懒加载）
 * - tree_depth=-1：完整树（包含所有子节点）
 */
async tree(query?: { tree_depth?: number })
```

## 相关文件

- 修复位置：`src/composables/useMenu.ts:138`
- 后端实现：`../wes_backend/src/core/tree_service.py`
- 类型定义：`src/api/generated/openapi-types.ts`

## 发现时间

2026-04-09
