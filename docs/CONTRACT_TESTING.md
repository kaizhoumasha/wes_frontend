# 契约测试指南

## 验证层级

四类命令回答不同问题，不能互相替代：

| 命令                                                            | 证明内容                                       | 是否需要后端 checkout |
| --------------------------------------------------------------- | ---------------------------------------------- | --------------------- |
| `pnpm contract:test`                                            | 当前 DTO、路径、端点所有权和退役符号不变量     | 否                    |
| `pnpm contract:verify`                                          | 已提交快照、同步记录和生成入口 marker 完全一致 | 否                    |
| `pnpm permission:verify -- --backend-root /path/to/wes_backend` | 当前后端提交的权限扫描结果与前端基线一致       | 是                    |
| `pnpm type:check`                                               | 当前生成类型与维护代码能够完成严格类型检查     | 否                    |

前端单仓绿灯不能证明后端权限扫描通过；合同同步通过也不能代替类型检查。

## 当前合同不变量

`contract:test` 检查以下机器事实：

- WorkLine DTO 包含 `runtime_config_json`、`diagnostic_profile`，不再包含 `plugin_key`、`contract_version`；本轮只验证合同，不提供这两个配置的编辑器。
- Device DTO 只保留静态拓扑、排序、启停和诊断字段，不包含连接、协议、心跳、运行状态或当前命令字段。
- 作业线 `plane/scene` 与 `plane/snapshot` 路径存在。
- 已退役的 workline runtime 与 plugin 路径不存在。
- `/api/v1/wms/events` 存在于 raw type mirror，但浏览器模块没有对应方法。
- 精确入站回调不生成浏览器方法，callback 日志管理端点仍保留。
- 类型与 Zod 入口包含当前整份快照的 SHA-256 marker。
- 已删除的 Runtime API、SSE client/session 文件和旧权限记录字段不会被生成器带回。

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
pnpm permission:verify -- --backend-root /path/to/wes_backend
pnpm type:check
```

## Fail-closed 检查

合同验证必须对输入缺失和漂移非零退出。可在本地做一次受控故障注入：

1. 用补丁只修改 canonical 快照中的一处无害描述。
2. 运行 `pnpm contract:verify`，确认非零退出并报告 SHA-256 不匹配。
3. 用补丁精确恢复该行。
4. 再次运行 `pnpm contract:verify`，确认通过。

不要使用宽泛的 Git 恢复命令，以免覆盖同一工作树中的其它修改。

权限验证同样 fail-closed。以下情况必须失败：后端目录缺失、不是 `develop`、工作树不干净、提交不匹配、扫描命令失败、记录格式不精确、数量或 SHA-256 漂移。

## 零差异再生成

合同与权限产物的最终验收是“同一输入再次生成无 diff”：

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

若出现权限文件路径变化、旧模块复活、metadata 缺失、marker 变化或同步记录变化，说明生成基线尚未闭合。

## 自动门禁

lint 相关 package scripts 只检查，不修改工作树。pre-commit 离线验证合同；pre-push 和 CI 都执行测试与合同门禁。前端 CI 不执行跨仓权限验证，权限基线必须在具有明确后端 checkout 的本地或集成环境完成。
