# TODOS

## To-Do

### 移动端日志页筛选工具栏自适应

**What**: 在 375px 宽度下让审计日志与 API 访问日志的搜索框、快速筛选和表格工具按钮在卡片内完整换行，避免搜索框右端超出视口。

**Why**: 2026-08-22 Standard QA 在 `/logs/api-access` 的 375×812 视口稳定复现搜索框右侧被裁切；桌面端和筛选功能正常，因此当前为低优先级视觉问题。

**Context**: 复现证据见 `.gstack/qa-reports/screenshots/front-back-2026-08-22/15-mobile-api-access.png`。

**Priority**: P3

---

### CI 引入死代码静态分析（knip 或 ts-prune）

**What**: 在 `pnpm lint` 闸门中加一个 `knip` 步骤，自动检测未使用的 export / 未注册组件 / 未引用文件，CI 强制 0 warnings。

**Why**: 2026-06 死代码清理证明仓库会自然累积死代码（5 个零引用 composables、5 个零引用组件、1 个测试孤儿）。靠人肉 grep 复盘不可持续。

**Pros**: 未来死代码不会再累积成需要专项 PR 清理的程度；新增组件 / composable 后若未挂上即被 CI 拦截。

**Cons**: knip 需要配置忽略名单（OpenAPI 自动生成模块、DEV-only 路由等）；初次接入预计 30-60min 调优误报。

**Context**: 本仓库为 Vue 3 + Vite + unplugin-vue-components 项目，knip 对该栈支持良好（参考其 docs 中的 vue plugin 配置）；ts-prune 是更轻的备选但对 Vue SFC 支持差。

**Depends on**: 死代码清理 PR (`chore/dead-code-cleanup-2026-06`) 合入 develop。

**Priority**: P3

---

## Completed
