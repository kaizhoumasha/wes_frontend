# 契约测试指南

## 验证层级

四类命令回答不同问题，不能互相替代：

| 命令                           | 证明内容                                                    | 是否需要后端 checkout |
| ------------------------------ | ----------------------------------------------------------- | --------------------- |
| `pnpm contract:test`           | 当前 DTO、路径、端点所有权和退役符号不变量                  | 否                    |
| `pnpm contract:verify`         | 已提交 OpenAPI 快照、同步记录和生成入口 marker 完全一致     | 否                    |
| `pnpm permission:verify`       | 已提交权限快照、同步记录与生成权限常量完全一致              | 否                    |
| `pnpm export:release-consumer` | consumer OpenAPI、实际 operations 与 permissions 可重复导出 | 否                    |
| `pnpm type:check`              | 当前生成类型与维护代码能够完成严格类型检查                  | 否                    |

前端单仓绿灯证明已提交 canonical 基线内部一致，但不证明任意候选后端兼容；候选兼容性由独立发布作业读取镜像 raw artifacts 判定。合同同步通过也不能代替类型检查。

## 当前合同不变量

`contract:test` 检查以下机器事实：

- WorkLine DTO 包含 `runtime_config_json`、`diagnostic_profile`，不再包含 `plugin_key`、`contract_version`；本轮只验证合同，不提供这两个配置的编辑器。
- Device DTO 保留静态拓扑、排序、启停、诊断和 `endpoint_base_url`；不包含协议、心跳、运行状态或当前命令字段。
- 作业线 `plane/scene` 与 `plane/snapshot` 路径存在。
- 已退役的 workline runtime 与 plugin 路径不存在。
- `/api/v1/wms/events` 存在于 raw type mirror，但浏览器模块没有对应方法。
- `/api/v1/callback/event`、`/api/v1/callback/result` 两个精确入站回调不生成浏览器方法，callback 日志管理端点仍保留。
- 类型与 Zod 入口包含当前整份快照的 SHA-256 marker。
- 已删除的 Runtime API、Runtime SSE client/session 文件和旧权限记录字段不会被生成器带回。

## 日常检查

只修改前端维护代码时执行：

```bash
pnpm contract:test
pnpm contract:verify
pnpm type:check
```

后端合同或权限发生变更时，先按同步流程冻结并生成，再执行：

```bash
pnpm contract:test
pnpm contract:verify
pnpm permission:verify
pnpm export:release-consumer
pnpm type:check
```

## Fail-closed 检查

合同验证必须对输入缺失和漂移非零退出。可在本地做一次受控故障注入：

1. 用补丁只修改 canonical 快照中的一处无害描述。
2. 运行 `pnpm contract:verify`，确认非零退出并报告 SHA-256 不匹配。
3. 用补丁精确恢复该行。
4. 再次运行 `pnpm contract:verify`，确认通过。

不要使用宽泛的 Git 恢复命令，以免覆盖同一工作树中的其它修改。

权限验证同样 fail-closed。以下情况必须失败：canonical 权限快照缺失、记录格式不精确、OpenAPI/权限记录不是同一次 freeze、数量或 SHA-256 漂移、生成权限常量不一致。后端目录、分支和工作树只由显式 `contract:freeze` 检查；普通验证不访问后端。

## 零差异再生成

合同与权限产物的最终验收是“同一输入再次生成无 diff”：

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

若出现权限文件路径变化、旧模块复活、metadata 缺失、marker 变化或同步记录变化，说明生成基线尚未闭合。

## 自动门禁

lint 相关 package scripts 只检查，不修改工作树。pre-commit 离线验证合同；pre-push 和 CI 都执行测试、合同/权限门禁与 consumer artifact 导出。只有显式 `contract:freeze` 需要明确的后端 checkout；普通生成、验证和 frontend producer 均离线于后端。
