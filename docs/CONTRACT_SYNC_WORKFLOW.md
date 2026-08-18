# 前后端契约同步流程

## 真源与边界

前端只消费已提交的 `contracts/openapi.current.json`。该文件必须由一个明确指定的、`develop` 分支且工作树干净的后端 checkout 冻结得到，不能从正在运行的服务、网络地址或开发环境配置推断。

合同同步记录 `.contract-sync-record.json` 只有三个字段：

```json
{
  "backendCommit": "40 位 Git 提交哈希",
  "openApiSha256": "64 位 SHA-256",
  "snapshotPath": "contracts/openapi.current.json"
}
```

权限同步记录 `.permission-sync-record.json` 只有三个字段：

```json
{
  "backendCommit": "40 位 Git 提交哈希",
  "permissionsSha256": "64 位 SHA-256",
  "permissionCount": 110
}
```

记录不保存机器目录、服务地址或易变元数据。OpenAPI 和权限必须绑定同一个后端提交。

## 冻结 OpenAPI

先确认后端 checkout 是预期提交，再从前端仓库执行：

```bash
git -C /path/to/wes_backend branch --show-current
git -C /path/to/wes_backend status --porcelain=v1
git -C /path/to/wes_backend rev-parse HEAD

pnpm contract:freeze -- --backend-root /path/to/wes_backend
```

冻结命令会在后端目录内执行 `uv run python`，直接导入 `main.app` 并调用 `app.openapi()`。提取结果先写入私有临时目录；只有 OpenAPI 3 文档校验、前后 HEAD 一致性和后端干净状态全部通过后，才写 canonical 快照和同步记录。失败不会留下新的部分产物。

冻结结束后，`.contract-sync-record.json.backendCommit` 必须等于操作前确认的提交。若不同，停止同步并重新做影响评审。

## 再生成合同与权限

按顺序执行：

```bash
pnpm generate:types
pnpm generate:zod
pnpm generate:permissions -- --backend-root /path/to/wes_backend
```

类型和 Zod 生成器只读取 canonical 快照。两者的入口文件写入相同的 `@openapi-sha256` marker。权限生成器在扫描前后检查后端 HEAD，并要求其等于合同同步记录中的提交。

`/api/v1/wms/**` 以及精确路径 `/api/v1/callback/event`、`/api/v1/callback/external`、`/api/v1/callback/result` 是系统间端点：它们保留在 raw OpenAPI type mirror 中，但不生成浏览器 API 方法或模块。callback 日志和管理读取端点仍属于浏览器端。

生成文件不可手工修改。需要保留的通用自定义代码只能放在生成器管理的 custom markers 内；已经退役的 Runtime 自定义代码不得恢复。

## 验证

离线合同检查不需要后端 checkout：

```bash
pnpm contract:test
pnpm contract:verify
pnpm type:check
```

`contract:verify` 会校验：

- canonical 快照存在、格式有效并使用固定 JSON 序列化；
- 整份快照的 SHA-256 等于合同同步记录；
- TypeScript 与 Zod 入口 marker 都等于同一 SHA-256；
- 任一文件缺失、记录含旧字段或哈希不匹配时非零退出。

权限检查是显式跨仓门禁，必须提供可扫描的后端 checkout：

```bash
pnpm permission:verify -- --backend-root /path/to/wes_backend
```

后端目录缺失、不干净、分支错误、提交不匹配、扫描失败、权限数量或 SHA-256 不匹配都会失败，不存在成功跳过模式。

## 可复现性门禁

提交生成基线后，在同一干净快照上重跑生成器：

```bash
pnpm generate:types
pnpm generate:zod
pnpm generate:permissions -- --backend-root /path/to/wes_backend
git diff --exit-code -- \
  .contract-sync-record.json \
  .permission-sync-record.json \
  src/api/generated \
  src/api/modules \
  src/types/generated/zod-schemas.ts
```

任何 diff 都表示已提交基线不完整，不能进入后续任务。

## 仓库门禁

- pre-commit：离线执行 `contract:verify --silent`，失败直接中止，然后运行 `lint-staged`。
- pre-push：依赖缺失时失败；依次执行单元测试、合同不变量测试和离线合同同步检查。
- 前端 CI：执行只读 lint/type 检查、单元测试、合同不变量测试和离线合同同步检查。
- 跨仓权限检查不放入前端单仓 CI，因为该环境没有后端 checkout。
