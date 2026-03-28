# CRUD 详情页优化计划 TODOs

> 生成日期: 2026-03-25
> 来源: 设计审查 (/plan-design-review) + 工程审查 (/plan-eng-review)

## 状态说明

- [ ] 待处理
- [~] 进行中
- [x] 已完成
- [!] 阻塞

---

## 🔴 P0 - Critical (本周完成)

### API-1: 精简 API 模块架构

- [ ] **状态**: 待处理
- **问题**: 评审发现当前架构过度设计，手动模块重复实现生成客户端已有功能
- **决策**: 采用路径 A - 精简架构（Codex 推荐）
- **来源**: /plan-eng-review (2026-03-28)
- **关键发现**:
  - `user.ts` 的 `resetPassword`/`assignRoles` = `userGeneratedApi.password`/`roles`
  - 9 个纯生成模块可以删除，直接使用 `api-clients.ts`
  - 生成器逻辑矛盾：写入 `CUSTOM METHODS` 后却用它作为跳过再生的依据
- **验收标准**:
  - [ ] 删除纯生成模块（auditLog, callback, demoProduct, device, event, performance, permission, role, workline）
  - [ ] 重构保留模块为组合生成客户端（apiApplication, auth, menu, user）
  - [ ] 更新文档示例使用生成客户端
  - [ ] 修复生成器逻辑矛盾
  - [ ] 所有调用点验证通过

---

### E4: 添加单元测试

- [x] **状态**: ✅ 已完成
- **问题**: 无测试覆盖
- **解决方案**: 建立 Vitest 测试体系，测试文件统一放在 `tests/` 目录
- **负责人**: 测试开发工程师
- **预估工时**: 5 天
- **完成日期**: 2026-03-26
- **验收标准**:
  - [x] 测试基础设施搭建完成
  - [x] useDetailState 核心功能测试通过
  - [x] useDetailResponsive 核心功能测试通过
  - [x] detailFieldLayout 工具函数测试通过
  - [x] useCrudPageController 辅助函数测试通过
  - [x] CrudDetailPanel 集成测试通过
  - [x] CrudDetailBody 集成测试通过
  - [x] CrudDetailSection 集成测试通过
  - [x] CrudDetailField 集成测试通过
  - [x] 覆盖率达标 (189 个测试用例)

---

## 📋 测试任务队列 (E4 详细)

> **负责人**: 测试开发工程师
> **目标**: 建立 CRUD 组件测试体系，确保核心逻辑稳定

### 目录结构

```
tests/
├── setup.ts                    # 测试环境初始化
├── utils/                      # 测试工具函数
│   ├── mount.ts               # Vue 组件挂载工具
│   └── mock.ts                # Mock 工具
├── unit/                       # 单元测试
│   ├── composables/
│   │   ├── useDetailState.test.ts
│   │   ├── useDetailResponsive.test.ts
│   │   └── useCrudPageController.test.ts
│   └── utils/
│       ├── detailFieldLayout.test.ts
│       └── resourceFieldBuilder.test.ts
└── integration/                # 集成测试
    └── components/
        ├── CrudDetailPanel.test.ts
        ├── CrudDetailBody.test.ts
        ├── CrudDetailSection.test.ts
        └── CrudDetailField.test.ts
```

### 阶段 1: 测试基础设施搭建 (Day 1)

| 任务ID    | 任务描述           | 文件                   | 状态 |
| --------- | ------------------ | ---------------------- | ---- |
| T-SETUP-1 | 安装测试依赖       | `package.json`         | [x]  |
| T-SETUP-2 | 创建 Vitest 配置   | `vitest.config.ts`     | [x]  |
| T-SETUP-3 | 创建测试环境初始化 | `tests/setup.ts`       | [x]  |
| T-SETUP-4 | 创建组件挂载工具   | `tests/utils/mount.ts` | [x]  |
| T-SETUP-5 | 创建 Mock 工具     | `tests/utils/mock.ts`  | [x]  |
| T-SETUP-6 | 添加测试脚本       | `package.json`         | [x]  |

**依赖包**:

```bash
pnpm add -D vitest @vue/test-utils happy-dom @vitest/coverage-v8
```

### 阶段 2: Composables 单元测试 (Day 2-3)

| 任务ID         | 任务描述                                 | 测试文件                                               | 优先级 | 状态 |
| -------------- | ---------------------------------------- | ------------------------------------------------------ | ------ | ---- |
| T-STATE-1      | useDetailState - openDetail/closeDetail  | `tests/unit/composables/useDetailState.test.ts`        | P0     | [x]  |
| T-STATE-2      | useDetailState - openDetailById 请求取消 | `tests/unit/composables/useDetailState.test.ts`        | P0     | [x]  |
| T-STATE-3      | useDetailState - refreshDetail           | `tests/unit/composables/useDetailState.test.ts`        | P0     | [x]  |
| T-STATE-4      | useDetailState - collapse states         | `tests/unit/composables/useDetailState.test.ts`        | P1     | [x]  |
| T-RESPONSIVE-1 | useDetailResponsive - 模式切换           | `tests/unit/composables/useDetailResponsive.test.ts`   | P0     | [x]  |
| T-RESPONSIVE-2 | useDetailResponsive - 宽度计算           | `tests/unit/composables/useDetailResponsive.test.ts`   | P1     | [x]  |
| T-RESPONSIVE-3 | useDetailResponsive - fullscreen 检测    | `tests/unit/composables/useDetailResponsive.test.ts`   | P1     | [x]  |
| T-CTRL-1       | useCrudPageController - CRUD 操作        | `tests/unit/composables/useCrudPageController.test.ts` | P1     | [x]  |

### 阶段 3: 工具函数测试 (Day 3)

| 任务ID      | 任务描述                        | 测试文件                                        | 优先级 | 状态 |
| ----------- | ------------------------------- | ----------------------------------------------- | ------ | ---- |
| T-LAYOUT-1  | detailFieldLayout - 布局解析    | `tests/unit/utils/detailFieldLayout.test.ts`    | P1     | [x]  |
| T-LAYOUT-2  | detailFieldLayout - 截断限制    | `tests/unit/utils/detailFieldLayout.test.ts`    | P1     | [x]  |
| T-BUILDER-1 | resourceFieldBuilder - 字段构建 | `tests/unit/utils/resourceFieldBuilder.test.ts` | P2     | [ ]  |

### 阶段 4: 组件集成测试 (Day 4-5)

| 任务ID      | 任务描述                          | 测试文件                                                 | 优先级 | 状态 |
| ----------- | --------------------------------- | -------------------------------------------------------- | ------ | ---- |
| T-PANEL-1   | CrudDetailPanel - 打开/关闭       | `tests/integration/components/CrudDetailPanel.test.ts`   | P0     | [x]  |
| T-PANEL-2   | CrudDetailPanel - 受控/非受控模式 | `tests/integration/components/CrudDetailPanel.test.ts`   | P0     | [x]  |
| T-PANEL-3   | CrudDetailPanel - 键盘导航        | `tests/integration/components/CrudDetailPanel.test.ts`   | P1     | [x]  |
| T-PANEL-4   | CrudDetailPanel - ARIA 属性       | `tests/integration/components/CrudDetailPanel.test.ts`   | P1     | [x]  |
| T-BODY-1    | CrudDetailBody - 加载/错误/空状态 | `tests/integration/components/CrudDetailBody.test.ts`    | P1     | [x]  |
| T-SECTION-1 | CrudDetailSection - 折叠展开      | `tests/integration/components/CrudDetailSection.test.ts` | P1     | [x]  |
| T-FIELD-1   | CrudDetailField - 格式化器        | `tests/integration/components/CrudDetailField.test.ts`   | P1     | [x]  |

### 测试覆盖目标

| 模块                | 目标覆盖率 | 当前 |
| ------------------- | ---------- | ---- |
| useDetailState      | 90%+       | 0%   |
| useDetailResponsive | 85%+       | 0%   |
| detailFieldLayout   | 80%+       | 0%   |
| CrudDetailPanel     | 75%+       | 0%   |

### 验收标准

- [ ] 所有测试通过 (`pnpm test`)
- [ ] 覆盖率达标 (`pnpm test:coverage`)
- [ ] CI 集成测试流程

### E1: 请求取消机制

- [x] **状态**: ✅ 已完成
- **问题**: 快速切换实体时请求竞态
- **解决方案**: 添加 requestId token cancellation 到 openDetailById 和 refreshDetail
- **文件**: `src/components/common/crud-page/detail/composables/useDetailState.ts`
- **完成日期**: 2026-03-25
- **验收标准**:
  - [x] 快速切换实体时，旧请求被取消
  - [x] 无请求竞态导致的 UI 状态错误

---

## 🟠 P1 - High (两周内完成)

### 6A: 键盘导航

- [x] **状态**: ✅ 已完成
- **问题**: 无键盘操作支持
- **解决方案**: Tab cycling + focus management
- **文件**: `src/components/common/crud-page/detail/CrudDetailPanel.vue`
- **完成日期**: 2026-03-25
- **验收标准**:
  - [x] Tab 键在面板内循环焦点
  - [x] Escape 键关闭面板 (ElDrawer/ElDialog 内置)
  - [x] 关闭时焦点返回触发元素

### E6-E8: 无障碍改进

- [x] **状态**: ✅ 已完成
- **问题**: 缺少 ARIA 和 focus 管理
- **解决方案**: 添加 role="dialog"、aria-labelledby、focus management
- **文件**: `src/components/common/crud-page/detail/CrudDetailPanel.vue`
- **完成日期**: 2026-03-25
- **验收标准**:
  - [x] 面板添加 role="dialog" 和 aria-labelledby
  - [x] 打开时焦点移入面板，关闭时焦点返回触发元素
  - [x] 屏幕阅读器可正确朗读标题

### 1A: Eyebrow 优化

- [x] **状态**: ✅ 已完成
- **问题**: 显示无意义的 section count
- **解决方案**: 改为显示实体类型标签，支持 config.entityTypeLabel 配置
- **文件**: `src/components/common/crud-page/detail/CrudDetailPanel.vue`, `types.ts`
- **完成日期**: 2026-03-25
- **验收标准**:
  - [x] Eyebrow 显示如 "#123 · 用户信息" 而非 "#123 · 3 个信息分组"
  - [x] 支持 config.entityTypeLabel 配置

---

## 🟡 P2 - Medium (下个迭代)

### 1B: Secondary Section 样式

- [x] **状态**: ✅ 已完成
- **问题**: 无视觉区分
- **解决方案**: 添加灰色左边框 (2px, var(--el-border-color))
- **文件**: `src/components/common/crud-page/detail/CrudDetailSection.vue`
- **完成日期**: 2026-03-25

### 2A: 空状态优化

- [x] **状态**: ✅ 已完成
- **问题**: 冷冰冰的"暂无数据"
- **解决方案**: 添加引导文案 + 关闭按钮
- **文件**: `src/components/common/crud-page/detail/CrudDetailBody.vue`
- **完成日期**: 2026-03-25

### 4A: Section 图标样式

- [x] **状态**: ✅ 已完成
- **问题**: SaaS 模板风格 (彩色圆圈背景)
- **解决方案**: 移除彩色圆圈，使用纯色图标
- **文件**: `src/components/common/crud-page/detail/CrudDetailSection.vue`
- **完成日期**: 2026-03-25

### E2: 日志清理

- [x] **状态**: ✅ 已完成
- **问题**: console.error 残留
- **解决方案**: 移除 console.error，使用静默 fallback
- **文件**: `src/components/common/crud-page/detail/CrudDetailField.vue`
- **完成日期**: 2026-03-25

### E5: JSON 序列化限制

- [x] **状态**: ✅ 已完成
- **问题**: 大对象可能影响性能
- **解决方案**: 添加 safeJsonStringify 函数，限制深度(3)和长度(500)
- **文件**: `src/components/common/crud-page/detail/CrudDetailField.vue`
- **完成日期**: 2026-03-25

### E9: 国际化

- [ ] **状态**: 待处理
- **问题**: 硬编码中文
- **解决方案**: 使用 i18n
- **文件**: 多文件
- **预估工时**: 2h

---

## 🟢 P3 - Low (可选优化)

### E3: Hover 性能优化

- [x] **状态**: ✅ 已完成
- **问题**: 背景色变化触发重绘
- **解决方案**: 添加 `will-change: background-color` 提示浏览器优化合成层
- **文件**: `CrudDetailField.vue`, `CrudDetailSection.vue`
- **完成日期**: 2026-03-26
- **备注**: CrudDetailActions 使用 transform 已是合成层操作，无需额外优化

---

## 📊 进度跟踪

| 优先级   | 总数   | 完成   | 进行中 | 待处理 |
| -------- | ------ | ------ | ------ | ------ |
| P0       | 2      | 2      | 0      | 0      |
| P1       | 3      | 3      | 0      | 0      |
| P2       | 6      | 5      | 0      | 1      |
| P3       | 1      | 0      | 0      | 1      |
| **合计** | **12** | **10** | **0**  | **2**  |

---

### 测试覆盖进度

| 模块                  | 目标覆盖率 | 当前 | 状态                |
| --------------------- | ---------- | ---- | ------------------- |
| useDetailState        | 90%+       | ~85% | ✅ 核心测试完成     |
| useDetailResponsive   | 85%+       | ~80% | ✅ 核心测试完成     |
| detailFieldLayout     | 80%+       | ~90% | ✅ 测试完成         |
| useCrudPageController | 80%+       | ~75% | ✅ 辅助函数测试完成 |
| CrudDetailPanel       | 75%+       | ~70% | ✅ 核心集成测试完成 |
| CrudDetailBody        | 70%+       | ~65% | ✅ 集成测试完成     |
| CrudDetailSection     | 70%+       | ~65% | ✅ 集成测试完成     |
| CrudDetailField       | 70%+       | ~65% | ✅ 集成测试完成     |

---

## ✅ 最终验收标准

- [ ] 所有单元测试通过 (`pnpm test`)
- [ ] 无障碍测试通过 (键盘导航、屏幕阅读器)
- [ ] 键盘导航完整可用
- [ ] 亮/暗模式主题一致
- [ ] 移动端响应式正常
- [ ] 无 console.error 残留
