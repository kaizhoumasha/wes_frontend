# 前后端契约同步流程

## 真源与边界

前端只消费已提交的 `contracts/openapi.current.json` 与 `contracts/permissions.current.json`。两份 canonical 快照必须由一个明确指定的、`develop` 分支且工作树干净的后端 checkout 在同一次 `contract:freeze` 中原子冻结得到，不能从正在运行的服务、网络地址或开发环境配置推断。

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
  "permissionCount": 115
}
```

记录不保存机器目录、服务地址或易变元数据。OpenAPI 和权限记录必须绑定同一次冻结所使用的后端提交，防止产生撕裂快照；`backendCommit` 仅是 freeze provenance，不是部署时要求候选后端 Commit 相等的配对条件。运行兼容性由独立发布作业根据前后端镜像内的 raw artifacts 做方向性判断。

## 原子冻结 OpenAPI 与权限

先确认后端 checkout 是预期提交，再从前端仓库执行：

```bash
git -C /path/to/wes_backend branch --show-current
git -C /path/to/wes_backend status --porcelain=v1
git -C /path/to/wes_backend rev-parse HEAD

pnpm contract:freeze -- --backend-root /path/to/wes_backend
```

冻结命令会在后端目录内执行唯一 provider exporter，一次取得 OpenAPI 与经验证的权限叶子。提取结果先写入私有临时目录；只有两份 raw artifact、对应指纹、前后 HEAD 一致性和后端干净状态全部通过后，才原子写入两份 canonical 快照及同步记录。失败不会留下新的部分产物。

冻结结束后，`.contract-sync-record.json.backendCommit` 必须等于操作前确认的提交。若不同，停止同步并重新做影响评审。

## 再生成合同与权限

按顺序执行：

```bash
pnpm generate:types
pnpm generate:zod
pnpm generate:permissions
```

类型和 Zod 生成器只读取 canonical OpenAPI 快照。两者的入口文件写入相同的 `@openapi-sha256` marker。权限生成器只读取 canonical 权限快照，并校验两份同步记录来自同一次 freeze；普通生成过程不访问后端 checkout。

`/api/v1/wms/**` 以及精确路径 `/api/v1/callback/event`、`/api/v1/callback/result` 是系统间端点：它们保留在 raw OpenAPI type mirror 中，但不生成浏览器 API 方法或模块。callback 日志和管理读取端点仍属于浏览器端。

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

权限检查同样离线，只读取已提交的 canonical 权限快照、同步记录和生成文件：

```bash
pnpm permission:verify
pnpm export:release-consumer
```

权限快照或生成文件缺失、同步记录不是同一次 freeze、权限数量或 SHA-256 不匹配都会失败，不存在成功跳过模式。`export:release-consumer` 只读取 canonical 快照与生产源码，生成 consumer OpenAPI、实际使用的 operations 和实际使用的 permissions；它不需要后端 checkout、后端 job 或后端镜像。

## 可复现性门禁

提交生成基线后，在同一干净快照上重跑生成器：

```bash
pnpm generate:types
pnpm generate:zod
pnpm generate:permissions
pnpm permission:verify
pnpm export:release-consumer
git diff --exit-code -- \
  .contract-sync-record.json \
  .permission-sync-record.json \
  contracts/openapi.current.json \
  contracts/permissions.current.json \
  src/api/generated \
  src/api/modules \
  src/types/generated/zod-schemas.ts
```

任何 diff 都表示已提交基线不完整，不能进入后续任务。

## 仓库门禁

- pre-commit：离线执行 `contract:verify --silent`，失败直接中止，然后运行 `lint-staged`。
- pre-push：依赖缺失时失败；依次执行单元测试、合同不变量测试和离线合同同步检查。
- 前端 CI：执行只读 lint/type 检查、单元测试、合同与权限不变量、离线同步检查和 consumer artifact 导出。
- `contract:freeze` 是唯一需要后端 checkout 的显式开发动作；普通前端 CI、生成、验证和 producer 发布均不依赖后端 checkout、job 或镜像。
