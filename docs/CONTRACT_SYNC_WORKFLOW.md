# 前后端契约同步工作流

## 📋 概述

本文档定义了当后端模型变化时，前端验证规则的同步流程。

### 核心机制

```
后端 Pydantic Model → OpenAPI → Zod Schema → 前端表单验证
        ↓                    ↓            ↓           ↓
    唯一权威源          自动同步      类型安全     用户反馈
```

---

## 🔄 同步触发条件

### 需要同步的场景

| 场景             | 说明                                  | 是否需要同步 |
| ---------------- | ------------------------------------- | ------------ |
| 修改字段长度约束 | 如 `min_length=3` 改为 `min_length=5` | ✅ 需要      |
| 添加/删除字段    | 如新增 `phone` 字段                   | ✅ 需要      |
| 修改字段类型     | 如 `int` 改为 `str`                   | ✅ 需要      |
| 添加新模型       | 如新增 `DeviceCreate`                 | ✅ 需要      |
| 修改字段可选性   | 如 `required` 改为 `optional`         | ✅ 需要      |
| 仅修改后端逻辑   | 如业务逻辑变化，接口契约不变          | ❌ 不需要    |

---

## 📝 同步步骤

### 1. 确认后端已运行

```bash
# 检查后端是否运行
curl -s http://localhost:8001/api/openapi.json | jq '.info.title'

# 应该返回：WES Backend API
```

### 2. 运行同步脚本

```bash
# 在前端项目根目录执行
pnpm zod:generate
```

### 3. 验证生成结果

脚本成功执行后会显示：

```
🚀 开始生成 Zod schemas...

📡 从后端获取 OpenAPI schema: http://localhost:8001/api/openapi.json
📊 找到 42 个 schemas

📝 生成 Zod schemas...
✅ 生成文件: src/types/generated/zod-schemas.ts
✅ 生成文件: src/types/zod-extensions.ts

✨ 完成！

📖 使用方法:
  import { UserCreateSchema } from "@/types/zod-extensions"
  import { useForm } from "vee-validate"
  const { handleSubmit } = useForm({
    validationSchema: UserCreateSchema
  })
```

### 4. 检查生成时间戳

生成的文件头部包含同步时间戳：

```typescript
/**
 * Zod Validation Schemas
 *
 * 此文件由 scripts/generate-zod-from-openapi.ts 自动生成
 * 从后端 FastAPI OpenAPI schema 提取验证规则
 *
 * ⚠️ 请勿手动编辑此文件
 * 如需自定义验证规则，请修改 src/types/zod-extensions.ts
 *
 * 生成时间: 2026-03-10T08:30:45.123Z  ← 检查这个时间
 */
```

### 5. 运行类型检查

```bash
# 确保没有类型错误
pnpm type:check
```

### 6. 测试表单验证

启动开发服务器测试表单：

```bash
pnpm dev
```

访问受影响的表单页面，验证：

- 字段必填/可选状态正确
- 字段长度限制生效
- 错误提示准确显示

---

## ⚠️ 常见问题

### 问题 1：后端未运行

**错误信息**：

```
❌ 生成失败: Error: fetch failed
```

**解决方案**：

```bash
# 启动后端服务
cd ../wes_backend
python -m uvicorn src.main:app --reload
```

### 问题 2：端口被占用

**错误信息**：

```
❌ 生成失败: Error: connect ECONNREFUSED
```

**解决方案**：

检查后端运行端口，修改 `scripts/generate-zod-from-openapi.ts` 中的 `BACKEND_OPENAPI_URL`：

```typescript
const BACKEND_OPENAPI_URL = 'http://localhost:8001/api/openapi.json'
// 改为实际端口，如 8000, 8080 等
```

### 问题 3：生成后发现验证规则不对

**可能原因**：后端 OpenAPI 未正确暴露验证规则

**检查方法**：

```bash
# 查看特定 schema 的 OpenAPI 定义
curl -s http://localhost:8001/api/openapi.json | jq '.components.schemas.UserCreate'
```

**解决方案**：修复后端 Pydantic 模型，确保约束正确暴露到 OpenAPI。

---

## 🔍 漂移检测

### 当前生成时间

```bash
# 查看最后生成时间
head -15 src/types/generated/zod-schemas.ts | grep "生成时间"
```

### 与后端对比

```bash
# 1. 获取后端 schema 摘要
curl -s http://localhost:8001/api/openapi.json | jq '.components.schemas | keys'

# 2. 与前端生成的 schema 对比
grep "^export const.*Schema = z.object" src/types/generated/zod-schemas.ts | wc -l
```

---

## 🚀 自动化建议

### 开发环境

在开发时，可以设置 `watch` 模式自动检测变化：

```bash
# 方案 1：使用 concurrently 同时运行前后端
# (需要安装 pnpm add -D concurrently)
pnpm add -D concurrently

# package.json
{
  "dev:full": "concurrently \"pnpm dev\" \"cd ../wes_backend && pnpm dev\""
}
```

### CI/CD 集成

在 CI 流程中添加契约同步检查：

```yaml
# .github/workflows/contract-check.yml
name: Contract Sync Check

on:
  pull_request:
    paths:
      - 'wes_backend/src/app/admin/models/**'
      - 'wes_frontend/src/types/generated/**'

jobs:
  check-sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Python
        run: |
          cd wes_backend
          python -m uvicorn src.main:app --port 8001 &
          sleep 5
      - name: Sync Schemas
        run: |
          cd wes_frontend
          pnpm install
          pnpm zod:generate
      - name: Check for Changes
        run: |
          git diff --exit-code src/types/generated/
```

---

## 📚 相关文档

- [表单验证方案](./ZOD_VALIDATION.md)
- [用户管理模块规范](./PHASE3_USER_MANAGEMENT_GUIDE.md)
- [后端 API 文档](../wes_backend/docs/API.md)

---

## ✅ 同步检查清单

使用此清单确保同步完成：

- [ ] 后端服务正在运行
- [ ] 后端模型修改已提交
- [ ] 运行 `pnpm zod:generate` 成功
- [ ] 生成时间戳已更新
- [ ] 类型检查通过 `pnpm type:check`
- [ ] 受影响的表单已测试
- [ ] 提交更新后的 `src/types/generated/zod-schemas.ts`
