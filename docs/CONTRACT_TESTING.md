# 前后端契约测试

本文档说明如何使用契约测试工具确保前后端 API 类型一致性。

## 🎯 目的

防止前后端 API 契约漂移，在开发早期发现类型不一致问题：

- 字段缺失
- 类型不匹配
- 枚举值不一致
- 可选字段错误

## 📁 文件结构

```
wes_frontend/
├── scripts/
│   ├── generate-api-types.ts  # OpenAPI 类型生成工具
│   └── contract-test.ts        # 契约测试工具
└── src/api/
    ├── generated/               # 自动生成的类型（可选）
    │   └── openapi-types.ts
    ├── modules/                 # API 模块
    │   ├── user.ts
    │   └── device.ts
    └── types/                   # 类型定义
        └── models/
            └── auth.ts
```

## 🚀 使用方法

### 本地开发

#### 1. 运行契约测试

```bash
# 测试前后端类型一致性
pnpm run contract:test
```

输出示例：

```
🔍 前后端契约测试

📋 检查 User DTO 契约...
📋 检查 Device DTO 契约...
📋 检查认证响应契约...

✅ 所有契约检查通过！
前后端类型定义一致
```

#### 2. 生成 OpenAPI 类型（可选）

```bash
# 从后端 OpenAPI 端点生成类型
pnpm run type:generate
```

配置后端 URL：

```bash
# 使用默认地址（localhost:8001）
pnpm run type:generate

# 指定后端地址
BACKEND_URL=http://localhost:9001/api/openapi.json pnpm run type:generate
```

### CI/CD 集成

契约测试已集成到 CI/CD 流程：

```yaml
jobs:
  contract-test: # 契约测试（最先执行）
  lint-and-test: # 代码检查（依赖契约测试）
  build: # 构建（依赖代码检查）
```

**执行顺序：**

```
契约测试 → 代码检查 → 构建 → 部署
    ↓
   失败则停止
```

## 🔧 契约检查项

当前契约测试验证以下项目：

### User DTO

- ✅ `id` 字段存在
- ✅ `username` 字段存在
- ✅ `is_multi_login` 字段存在
- ✅ `roles` 字段存在
- ⚠️ 不应包含 `phone`、`status`、`last_login_at` 等已废弃字段

### Device DTO

- ✅ `device_code` 字段存在
- ✅ `device_name` 字段存在
- ✅ `device_status` 字段存在
- ✅ `device_type` 枚举值完整（PDA、INDUSTRIAL_PC、CONVEYOR 等）

### 认证响应

- ✅ `expires_in` 字段存在（OAuth 2.0 标准）
- ✅ `refresh_expires_in` 字段存在

### 会话响应

- ✅ `/api/v1/auth/sessions` 的 `SessionInfo` 包含 `last_active`
- ❌ 不应使用历史字段 `last_active_at`

### API 配置

- ✅ `credentials: 'include'` 配置（支持 HttpOnly Cookie）

## 📝 扩展契约测试

在 `scripts/contract-test.ts` 中添加新的检查项：

```typescript
/**
 * 检查新的 DTO 契约
 */
function checkNewDtoContract(): FieldIssue[] {
  const issues: FieldIssue[] = []

  // 1. 检查文件存在
  const dtoPath = join(TYPES_DIR, 'models/new-dto.ts')
  if (!existsSync(dtoPath)) {
    issues.push({ field: 'NewDto', type: 'missing', severity: 'error' })
    return issues
  }

  // 2. 检查必需字段
  const content = readFileSync(dtoPath, 'utf-8')
  const requiredFields = ['id', 'name', 'status']

  for (const field of requiredFields) {
    if (!content.includes(field)) {
      issues.push({
        field,
        type: 'missing',
        severity: 'error',
        expected: `NewDto 应包含 ${field} 字段`
      })
    }
  }

  return issues
}
```

然后在 `main()` 函数中调用：

```typescript
// 新 DTO 契约检查
console.log('📋 检查 NewDto 契约...')
const newDtoIssues = checkNewDtoContract()
if (newDtoIssues.length > 0) {
  allIssues.push({
    endpoint: 'NewDto',
    method: 'DTO',
    issues: newDtoIssues
  })
}
```

## 🐛 故障排查

### 契约测试失败

```
❌ 发现契约不一致问题：

📌 User (DTO)
  ❌ username: User 应包含 username 字段
```

**解决方案：**

1. 检查后端 API 定义：

   ```bash
   # 访问后端 Swagger 文档
   open http://localhost:8001/api/docs
   ```

2. 更新前端类型定义：

   ```typescript
   // src/api/types/models/auth.ts
   export interface UserResponse {
     username: string // 添加缺失字段
   }
   ```

3. 重新运行测试：
   ```bash
   pnpm run contract:test
   ```

### 后端未运行

```
❌ 获取 OpenAPI 规范失败: 500 Internal Server Error
```

**解决方案：**

1. 启动后端服务
2. 确认 OpenAPI 端点可访问：
   ```bash
   curl http://localhost:8001/api/openapi.json
   ```

### 枚举值不匹配

```
📌 Device (DTO)
  ❌ DeviceType: DeviceType 应包含 ROBOT
```

**解决方案：**

同步前端枚举定义与后端：

```typescript
// 后端: src/app/device/models/device.py
class DeviceType(str, Enum):
    ROBOT = "ROBOT"

// 前端: src/api/modules/device.ts
export enum DeviceType {
  ROBOT = 'ROBOT'  // 添加缺失枚举值
}
```

## 🔄 工作流程

### 推荐的开发流程

```
1. 后端开发 → 2. 前端类型更新 → 3. 契约测试 → 4. 功能开发
                                         ↓
                                       失败
                                         ↓
                                  修复类型定义
                                         ↓
                                    重新测试
```

### 后端 API 变更时

1. 后端更新 Pydantic Schema
2. 前端同步类型定义
3. 运行 `pnpm run contract:test` 验证
4. 提交代码（CI 会再次验证）

## 📚 参考资源

- [FastAPI OpenAPI 文档](https://fastapi.tiangolo.com/tutorial/metadata/)
- [OpenAPI 规范](https://swagger.io/specification/)
- [TypeScript 类型系统](https://www.typescriptlang.org/docs/handbook/2/types-from-types.html)
