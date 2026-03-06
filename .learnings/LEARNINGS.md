# Learnings

Corrections, insights, and knowledge gaps captured during development.

**Categories**: correction | insight | knowledge_gap | best_practice
**Areas**: frontend | backend | infra | tests | docs | config
**Statuses**: pending | in_progress | resolved | wont_fix | promoted | promoted_to_skill

## Status Definitions

| Status              | Meaning                                                      |
| ------------------- | ------------------------------------------------------------ |
| `pending`           | Not yet addressed                                            |
| `in_progress`       | Actively being worked on                                     |
| `resolved`          | Issue fixed or knowledge integrated                          |
| `wont_fix`          | Decided not to address (reason in Resolution)                |
| `promoted`          | Elevated to CLAUDE.md, AGENTS.md, or copilot-instructions.md |
| `promoted_to_skill` | Extracted as a reusable skill                                |

## Skill Extraction Fields

When a learning is promoted to a skill, add these fields:

```markdown
**Status**: promoted_to_skill
**Skill-Path**: skills/skill-name
```

---

## [LRN-20260306-001] git_worktree_workflow_enforcement

**Logged**: 2026-03-06T18:55:00+08:00
**Priority**: critical
**Status**: pending
**Area**: config

### Summary

Git Worktree 工作流必须强制执行,禁止在 develop/main 分支直接开发

### Details

项目 CLAUDE.md 明确规定禁止在 develop/main 分支直接开发,必须使用 Git Worktree 创建功能分支。但在实际开发中,开发者可能忽略此规则直接在 develop 分支提交代码。

**违规场景**:

- 直接在 develop 分支执行 `git add` + `git commit`
- 未使用 `./scripts/git-worktree.sh add feature-xxx` 创建 worktree

**正确流程**:

1. `./scripts/git-worktree.sh add feature-xxx`
2. `cd ../wes_frontend-worktrees/feature-xxx`
3. 开发 → commit → push
4. 创建 PR 合并到 develop
5. `./scripts/git-worktree.sh remove feature-xxx`

### Suggested Action

1. 添加 pre-commit hook 检测当前分支,拒绝在 develop/main 分支提交
2. 在 CI/CD 中添加分支保护规则
3. 在 CLAUDE.md 中增加违规后果说明

### Metadata

- Source: user_feedback
- Related Files: scripts/git-worktree.sh, CLAUDE.md
- Tags: git, workflow, enforcement
- Recurrence-Count: 1
- First-Seen: 2026-03-06
- Last-Seen: 2026-03-06

---

## [LRN-20260306-002] non_functional_commit_exception

**Logged**: 2026-03-06T18:55:00+08:00
**Priority**: medium
**Status**: pending
**Area**: config

### Summary

非功能性提交(如修复 .gitignore)可以例外直接在 develop 分支提交

### Details

Git Worktree 工作流规定所有开发必须在功能分支进行,但存在例外场景:

- 修复配置文件错误(.gitignore, .eslintrc 等)
- 修复脚本 bug(如 git-worktree.sh)
- 紧急安全补丁
- 文档更新(README, CLAUDE.md)

这些非功能性提交如果也走 worktree 流程,会增加不必要的复杂度。

**判断标准**:

- 不涉及业务逻辑代码
- 不影响功能实现
- 修复影响所有开发者的基础设施问题
- 需要立即生效

### Suggested Action

在 CLAUDE.md 中明确定义"非功能性提交"的范围和审批流程:

1. 配置文件修复
2. 脚本 bug 修复
3. 文档更新
4. 需要技术负责人审批

### Metadata

- Source: user_feedback
- Related Files: CLAUDE.md
- Tags: git, workflow, exception
- Recurrence-Count: 1
- First-Seen: 2026-03-06
- Last-Seen: 2026-03-06

---

## [LRN-20260306-003] frontend_backend_contract_validation

**Logged**: 2026-03-06T18:55:00+08:00
**Priority**: high
**Status**: pending
**Area**: frontend

### Summary

前端开发必须参考后端实际代码,不能凭空想象 API 契约

### Details

在实现权限模块时,用户明确要求"参考后端代码,不要凭空想象"。这暴露了一个常见问题:前端开发者可能基于假设或过时文档实现功能,导致:

- API 调用参数错误
- 响应数据结构不匹配
- 权限逻辑与后端不一致
- 集成测试失败

**正确做法**:

1. 阅读后端源码(FastAPI 路由定义、Pydantic 模型)
2. 查看 OpenAPI 文档(/docs)
3. 与后端开发者确认契约
4. 使用 TypeScript 类型定义强制契约

**本项目实践**:

- 后端路径: `/Users/kaizhou/SynologyDrive/works/wes_backend`
- API 文档: http://localhost:8001/docs
- 类型生成: `pnpm run zod:generate`

### Suggested Action

1. 在 CLAUDE.md 中添加"前后端契约验证"章节
2. 要求所有 API 对接前先阅读后端代码
3. 建立前后端类型同步机制(OpenAPI → TypeScript)
4. Code Review 时检查 API 调用是否与后端一致

### Metadata

- Source: user_feedback
- Related Files: CLAUDE.md, src/api/
- Tags: api, contract, validation, frontend-backend
- Recurrence-Count: 1
- First-Seen: 2026-03-06
- Last-Seen: 2026-03-06

---

## [LRN-20260306-004] code_review_priority_system

**Logged**: 2026-03-06T18:55:00+08:00
**Priority**: medium
**Status**: pending
**Area**: docs

### Summary

建立代码审查优先级系统(P0/P1/P2/P3)提高修复效率

### Details

在权限模块开发中,用户进行了多轮代码审查,使用优先级标记问题:

- **P0**: 阻塞性问题,必须立即修复(如权限加载失败不抛出错误)
- **P1**: 重要问题,影响核心功能(如登出顺序错误)
- **P2**: 一般问题,影响用户体验(如缺少权限提示)
- **P3**: 优化建议,不影响功能(如删除未使用代码)

这种优先级系统的优势:

1. 明确修复顺序,避免纠结次要问题
2. 提高沟通效率,减少来回讨论
3. 帮助开发者理解问题严重性
4. 便于追踪修复进度

### Suggested Action

1. 在 CLAUDE.md 中添加"代码审查优先级定义"
2. 制定每个优先级的修复时限(P0: 立即, P1: 当天, P2: 本周, P3: 下次迭代)
3. 在 PR 模板中添加优先级标签
4. 建立优先级与测试覆盖率的关联(P0 必须有测试)

### Metadata

- Source: user_feedback
- Related Files: CLAUDE.md, .github/pull_request_template.md
- Tags: code-review, priority, workflow
- Recurrence-Count: 1
- First-Seen: 2026-03-06
- Last-Seen: 2026-03-06

---
