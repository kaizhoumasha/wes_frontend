# API 契约对齐规范

## 强制规则

**前端类型必须与后端 Pydantic 模型精确匹配,包括:**

- 必填/可选(`?`)
- 可空类型(`| null`)
- 数组/单值
- 枚举值范围

## 类型映射对照表

| 后端 Pydantic       | 前端 TypeScript | 说明       |
| ------------------- | --------------- | ---------- | ----- | ---------- |
| `str`               | `string`        | 必填字符串 |
| `str                | None`           | `string    | null` | 可空字符串 |
| `str                | None = None`    | `string?   | null` | 可选可空   |
| `list[str]`         | `string[]`      | 字符串数组 |
| `Literal["a", "b"]` | `"a"            | "b"`       | 枚举  |
| `int                | None`           | `number    | null` | 可空数字   |

## 验证清单

在对接 API 前,必须:

- [ ] 阅读后端 `src/app/*/v1/*.py` 中的 Pydantic 模型
- [ ] 对比 OpenAPI 文档(http://localhost:8001/docs)的 JSON Schema
- [ ] 运行 `pnpm run zod:generate` 自动生成并对比
- [ ] 检查 Nullable 字段是否使用 `| null`

## 常见错误

❌ **错误**: 后端 `str | None`,前端 `string`

```typescript
export interface ApiPermissionInfo {
  method: string // ❌ 缺少 `| null`
  path: string // ❌ 缺少 `| null`
}
```

✅ **正确**: 精确匹配后端类型

```typescript
export interface ApiPermissionInfo {
  method?: string | null // ✅
  path?: string | null // ✅
}
```

## 自动类型生成

项目配置了从 OpenAPI 自动生成 Zod schemas:

```bash
# 生成类型定义
pnpm run zod:generate

# 输出文件
# src/types/generated/zod-schemas.ts (请勿手动编辑)
# src/types/zod-extensions.ts (自定义扩展)
```

## 项目实践

- 后端路径: `/Users/kaizhou/SynologyDrive/works/wes_backend`
- API 文档: http://localhost:8001/docs
- 类型生成: `pnpm run zod:generate`

## 相关文件

- `.learnings/LEARNINGS.md` - LRN-20260307-002, LRN-20260306-003
