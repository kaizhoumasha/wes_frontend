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

### E4: 添加单元测试

- [ ] **状态**: 待处理
- **问题**: 无测试覆盖
- **解决方案**: 为 useDetailState、useDetailResponsive 添加单元测试
- **文件**: `src/components/common/crud-page/detail/composables/__tests__/`
- **预估工时**: 4h
- **负责人**: 待分配
- **验收标准**:
  - [ ] useDetailState 测试覆盖 openDetail, openDetailById, refreshDetail, collapse states
  - [ ] useDetailResponsive 测试覆盖 mode switching, width calculation, fullscreen detection
  - [ ] 所有测试通过 `pnpm test`

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

- [ ] **状态**: 待处理
- **问题**: 背景色变化触发重绘
- **解决方案**: 当前可接受，后续可考虑 will-change
- **预估工时**: -
- **备注**: 非必要优化，性能影响可忽略

---

## 📊 进度跟踪

| 优先级   | 总数   | 完成  | 进行中 | 待处理 |
| -------- | ------ | ----- | ------ | ------ |
| P0       | 2      | 1     | 0      | 1      |
| P1       | 3      | 3     | 0      | 0      |
| P2       | 6      | 5     | 0      | 1      |
| P3       | 1      | 0     | 0      | 1      |
| **合计** | **12** | **9** | **0**  | **3**  |

---

## ✅ 最终验收标准

- [ ] 所有单元测试通过 (`pnpm test`)
- [ ] 无障碍测试通过 (键盘导航、屏幕阅读器)
- [ ] 键盘导航完整可用
- [ ] 亮/暗模式主题一致
- [ ] 移动端响应式正常
- [ ] 无 console.error 残留
