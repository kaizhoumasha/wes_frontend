# 已完成卡片设备分组重构 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将"已完成"卡片的展开层级从 物料→平铺命令 改为 物料→设备→命令，使用户能直观看到物料经过每个设备执行的动作序列。

**Architecture:** 在 `SandboxActionList.vue` 中新增一个 computed `groupCompletedByDevice`，按 `target_code` 对每个 session 的 `outbox_items` 分组，模板从平铺循环改为两层嵌套（设备组 → 命令）。不新增文件，仅修改现有组件。

**Tech Stack:** Vue 3 Composition API, TypeScript, Element Plus

---

## 第一性原理分析

### 用户视角：沙箱操作员展开"已完成"卡片时真正想知道什么

1. **什么物料？** — 已回答（物料 ID/扫码值，第一层标题）
2. **物料走了什么路径？** — 未回答（当前命令平铺，看不出流转路径）
3. **哪个设备做了什么？** — 未回答（`→ target_code` 是 inline 文字，不是分组维度）
4. **哪里出了问题？** — 部分回答（有 badge，但需要逐个读）

在仓储现场，物料是**通过设备序列流动**的：

```
入库 → CONVEYOR_01 (传送) → STACKER_02 (堆垛) → SCANNER_03 (扫码) → 出库
```

用户诊断问题时，思维是空间化的："堆垛机那一段有没有出问题？"而不是"第几条命令失败了？"

### 当前设计的问题

```
当前展开 (平铺命令):
└─ 物料 P001
   ├─ move_start → CONVEYOR_01 [ACKED]
   ├─ move_end → CONVEYOR_01 [ACKED]
   ├─ lift_up → STACKER_02 [ACKED]
   ├─ place → STACKER_02 [FAILED]   ← 要肉眼扫描才能发现
   ├─ scan → SCANNER_03 [ACKED]
   └─ unload → CONVEYOR_01 [ACKED]   ← 又回到了 CONVEYOR
```

问题：

- 设备来回出现，没有空间聚合
- 无法一眼看出"STACKER_02 这一段有失败"
- 无法回答"这个物料经过了几个设备"

### 目标设计

```
目标展开 (设备分组):
└─ 物料 P001
   ├─ 📍 CONVEYOR_01 [3]
   │  ├─ move_start [ACKED]
   │  ├─ move_end [ACKED]
   │  └─ unload [ACKED]
   ├─ 📍 STACKER_02 [2] ⚠️
   │  ├─ lift_up [ACKED]
   │  └─ place [FAILED] ← 红色高亮
   └─ 📍 SCANNER_03 [1]
      └─ scan [ACKED]
```

优势：

- **空间聚合**：每个设备一个区块，一眼看到物料经过了哪些设备
- **失败扫描**：设备组头有聚合状态（有失败 → 红色标记），不用逐条读
- **保持可追溯**：每条命令仍然可见，状态、错误信息不变

---

## 文件结构

仅修改 1 个文件：

| 文件                                                   | 操作 | 职责                                           |
| ------------------------------------------------------ | ---- | ---------------------------------------------- |
| `src/components/runtime/sandbox/SandboxActionList.vue` | 修改 | 新增设备分组 computed + 模板从平铺改为两层嵌套 |

不新增文件的原因：

- 逻辑足够轻量（一个 computed + 模板改动）
- 设备分组只在"已完成"区域使用，不需要抽离为独立组件
- 遵循 KISS 原则

---

### Task 1: 新增设备分组 Computed

**Files:**

- Modify: `src/components/runtime/sandbox/SandboxActionList.vue` (在 `<script setup>` 中新增)

- [ ] **Step 1: 在 computed 定义区域新增设备分组逻辑**

在 `completedSessionViews` computed 之后（约第 449 行），添加以下接口和 computed：

```typescript
// 设备分组接口，用于 completed session 内的命令按设备聚合
interface CompletedDeviceGroup {
  targetCode: string
  items: SandboxPendingOutbox[]
  hasFailure: boolean
}

/**
 * 将单个 completed session 的 outbox_items 按 target_code 分组。
 * 按 item.id 升序排列（即时间顺序），保留物料流转的设备顺序。
 */
function groupItemsByDevice(items: SandboxPendingOutbox[]): CompletedDeviceGroup[] {
  const groupMap = new Map<string, SandboxPendingOutbox[]>()

  for (const item of items) {
    const device = item.target_code || '__unknown__'
    if (!groupMap.has(device)) groupMap.set(device, [])
    groupMap.get(device)!.push(item)
  }

  // 保持设备首次出现的顺序（Map 遍历顺序 = 插入顺序 = item.id 升序下的首次出现）
  return Array.from(groupMap.entries()).map(([targetCode, groupItems]) => ({
    targetCode,
    items: groupItems,
    hasFailure: groupItems.some(i => i.status === 'FAILED' || i.status === 'CANCELLED')
  }))
}
```

- [ ] **Step 2: 在 `completedSessionViews` 的返回值中注入设备分组**

找到 `completedSessionViews` computed（约第 444-449 行），将返回值从：

```typescript
const completedSessionViews = computed(() =>
  completedItemsResolved.value.map(sessionGroup => ({
    sessionGroup,
    identity: buildSessionIdentity(sessionGroup)
  }))
)
```

改为：

```typescript
const completedSessionViews = computed(() =>
  completedItemsResolved.value.map(sessionGroup => ({
    sessionGroup,
    identity: buildSessionIdentity(sessionGroup),
    deviceGroups: groupItemsByDevice(sessionGroup.outbox_items)
  }))
)
```

- [ ] **Step 3: 更新 `CompletedSessionView` 的隐式类型推断**

不需要显式 interface，因为 TypeScript 会从 computed 返回值自动推断。但需要确认模板中访问 `sessionView.deviceGroups` 时不会报类型错误（Vue 的 computed 推断是直接的，不会有问题）。

- [ ] **Step 4: 运行类型检查验证**

Run: `pnpm type:check`
Expected: 无新增错误

---

### Task 2: 重构已完成卡片的展开模板

**Files:**

- Modify: `src/components/runtime/sandbox/SandboxActionList.vue` (模板部分，约第 282-315 行)

- [ ] **Step 1: 替换平铺命令区域为设备分组区域**

找到以下两处需要修改的位置：

**位置 A：头部计数**

在模板 `<div class="sandbox-action-list__completed-session-header">` 中，找到：

```vue
<span class="sandbox-action-list__completed-session-count">
  {{ sessionView.sessionGroup.outbox_items.length }} 条命令
</span>
```

替换为：

```vue
<span class="sandbox-action-list__completed-session-count">
  {{ sessionView.deviceGroups.length }} 台设备
</span>
```

**位置 B：命令列表区域**

找到当前模板中 `<div class="sandbox-action-list__completed-items">` 及其子元素（约第 282-315 行），将其整体替换为设备分组结构：

```vue
<div class="sandbox-action-list__completed-device-groups">
  <div
    v-for="deviceGroup in sessionView.deviceGroups"
    :key="deviceGroup.targetCode"
    class="sandbox-action-list__completed-device-group"
  >
    <!-- Device Group Header -->
    <div
      class="sandbox-action-list__completed-device-header"
      :class="{ 'has-failure': deviceGroup.hasFailure }"
    >
      <div class="sandbox-action-list__completed-device-identity">
        <svg class="sandbox-action-list__completed-device-icon" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M2 4.25A2.25 2.25 0 014.25 2h11.5A2.25 2.25 0 0118 4.25v8.5A2.25 2.25 0 0115.75 15h-3.105a3.5 3.5 0 00-1.621.423l-1.374.716a1.5 1.5 0 01-.676.161H4.25A2.25 2.25 0 012 12.75v-8.5zM6 6a.75.75 0 01.75-.75h6.5a.75.75 0 010 1.5h-6.5A.75.75 0 016 6zm0 4a.75.75 0 01.75-.75h4.5a.75.75 0 010 1.5h-4.5A.75.75 0 016 10z" clip-rule="evenodd" />
        </svg>
        <span class="sandbox-action-list__completed-device-name">{{ deviceGroup.targetCode }}</span>
        <span class="sandbox-action-list__completed-device-count">{{ deviceGroup.items.length }}</span>
      </div>
      <span v-if="deviceGroup.hasFailure" class="sandbox-action-list__completed-device-badge">
        <svg viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
        </svg>
      </span>
    </div>

    <!-- Device Commands -->
    <div class="sandbox-action-list__completed-device-commands">
      <div
        v-for="item in deviceGroup.items"
        :key="`outbox-${item.id}`"
        class="sandbox-action-list__completed-item"
        :class="{ 'is-failed': item.status === 'FAILED' || item.status === 'CANCELLED' }"
      >
        <span class="sandbox-action-list__completed-item-key">
          {{ commandLabel(item) }}
        </span>
        <RuntimeStatusBadge
          :status="item.status ?? 'ACKED'"
          size="small"
        />
        <span
          v-if="itemNote(item)"
          class="sandbox-action-list__completed-item-error"
        >
          {{ itemNote(item) }}
          <RouterLink
            v-if="runtimeHoldId(item)"
            class="sandbox-action-list__hold-link"
            :to="{
              name: 'RuntimeHoldDetail',
              params: { holdId: runtimeHoldId(item) }
            }"
          >
            Runtime Hold #{{ runtimeHoldId(item) }}
          </RouterLink>
        </span>
      </div>
    </div>
  </div>
</div>
```

**关键变更说明：**

- 移除了原来的 `→ {{ item.target_code || '—' }}` 文字（不再需要，设备名已在组头显示）
- 保留了 `commandLabel`, `RuntimeStatusBadge`, `itemNote`, `runtimeHoldId` 等所有现有逻辑
- 为失败命令添加了 `is-failed` class，用于样式高亮
- 设备组头显示设备名称 + 命令数量 + 失败警告图标

- [ ] **Step 2: 运行 dev server 并验证**

Run: `pnpm dev`
Open: http://localhost:5173/runtime/sandbox/45
Verify: 展开已完成卡片后，命令按设备分组显示

---

### Task 3: 新增设备分组样式

**Files:**

- Modify: `src/components/runtime/sandbox/SandboxActionList.vue` (模板中的 `<style scoped>` 区域)

- [ ] **Step 1: 在样式区域末尾新增设备分组样式**

在现有 `.sandbox-action-list__completed-items` 和 `.sandbox-action-list__completed-item` 样式之后（约第 1220 行之后），添加以下样式：

```css
/* ===== Device Groups (within completed session) ===== */
.sandbox-action-list__completed-device-groups {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sandbox-action-list__completed-device-group {
  border: 1px solid var(--runtime-border-neutral);
  border-radius: 8px;
  background: var(--runtime-surface-subtle);
  overflow: hidden;
}

.sandbox-action-list__completed-device-group:has(.has-failure) {
  border-color: rgb(239, 68, 68, 0.2);
}

.sandbox-action-list__completed-device-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 10px;
  background: rgb(245, 158, 11, 0.04);
  border-bottom: 1px solid var(--runtime-border-neutral);
}

.sandbox-action-list__completed-device-header.has-failure {
  background: rgb(239, 68, 68, 0.06);
}

.sandbox-action-list__completed-device-identity {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.sandbox-action-list__completed-device-icon {
  width: 14px;
  height: 14px;
  color: var(--runtime-text-muted);
  flex-shrink: 0;
}

.has-failure .sandbox-action-list__completed-device-icon {
  color: #ef4444;
}

.sandbox-action-list__completed-device-name {
  color: var(--runtime-text-primary);
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sandbox-action-list__completed-device-count {
  color: var(--runtime-text-muted);
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 500;
}

.sandbox-action-list__completed-device-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: rgb(239, 68, 68, 0.12);
  color: #ef4444;
  flex-shrink: 0;
}

.sandbox-action-list__completed-device-badge svg {
  width: 12px;
  height: 12px;
}

.sandbox-action-list__completed-device-commands {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 4px 6px;
}

/* Existing item styles, add .is-failed modifier */
.sandbox-action-list__completed-item.is-failed {
  border-left: 2px solid rgb(239, 68, 68, 0.4);
  background: rgb(239, 68, 68, 0.04);
  opacity: 1;
}
```

**设计要点：**

- 设备组用独立卡片容器，有边框和圆角
- 设备组头有浅色背景（正常=琥珀浅，失败=红浅），形成视觉区分
- 失败命令左侧加红色边框条，背景微红，透明度恢复为 1（原 opacity 0.7 太弱）
- 设备图标使用 Element Plus 风格的设备/盒子 SVG
- 所有颜色使用现有 CSS 变量 + 语义色，不引入新颜色

- [ ] **Step 2: 运行样式检查**

Run: `pnpm lint:stylelint`
Expected: 无错误

---

### Task 4: 完整验证与提交

**Files:**

- All changed files from Tasks 1-3

- [ ] **Step 1: 运行完整 lint**

Run: `pnpm lint`
Expected: 全部通过

- [ ] **Step 2: 运行 dev server 验证 UI**

Run: `pnpm dev`
Open: http://localhost:5173/runtime/sandbox/45

验证清单：

- ✅ 在途物料区域无变化（未修改）
- ✅ 已完成区域第一层仍按物料展示
- ✅ 展开已完成卡片后，命令按设备分组
- ✅ 每个设备组显示设备名称 + 命令数量
- ✅ 有失败命令的设备组头部显示红色警告图标 + 红色背景
- ✅ 失败命令左侧有红色边框条
- ✅ 正常命令外观与之前一致
- ✅ 展开/折叠动画正常
- ✅ 错误信息和 Hold 链接正常显示

- [ ] **Step 3: 提交**

```bash
git add src/components/runtime/sandbox/SandboxActionList.vue
git commit -m "refactor(sandbox): 已完成卡片按设备分组展示命令

将已完成 session 的展开层级从 物料→平铺命令 改为 物料→设备→命令，
使用户能直观看到物料经过每个设备执行的动作序列。失败设备组有红色标记。"
```

---

## UX 视觉对比

### Before（当前）

```
已完成  3
────────────────────────────────────
▼ PkgID  PKG-20240101-001
   HHPN: HH-1234  |  MfrPN: MF-5678
   [Status: COMPLETED]  5 条命令  >
   ────────────────────────────────
   HHPN: HH-1234
   MfrPN: MF-5678
   Location: Zone-A
   事件: inbound  |  进度: COMPLETED
   { "data": { ... } }
   ─────────────────────────────────
   move_start        → CONVEYOR_01  [ACKED]
   move_end          → CONVEYOR_01  [ACKED]
   lift_up           → STACKER_02   [ACKED]
   place             → STACKER_02   [FAILED]  error msg...
   scan              → SCANNER_03   [ACKED]
```

问题：设备名散布在每行，需要逐行扫描才能理解物料路径

### After（目标）

```
已完成  3
────────────────────────────────────
▼ PkgID  PKG-20240101-001
   HHPN: HH-1234  |  MfrPN: MF-5678
   [Status: COMPLETED]  3 台设备  >
   ────────────────────────────────
   HHPN: HH-1234
   MfrPN: MF-5678
   Location: Zone-A
   事件: inbound  |  进度: COMPLETED
   { "data": { ... } }
   ─────────────────────────────────
   ┌─ 🖥 CONVEYOR_01  [3] ───────────┐
   │  move_start           [ACKED]   │
   │  move_end             [ACKED]   │
   │  unload               [ACKED]   │
   └─────────────────────────────────┘
   ┌─ 🖥 STACKER_02  [2]  ⚠️ ────────┐  ← 红色标记
   │  lift_up              [ACKED]   │
   │  place                [FAILED]  │
   │    error message...             │
   └─────────────────────────────────┘
   ┌─ 🖥 SCANNER_03  [1] ────────────┐
   │  scan                 [ACKED]   │
   └─────────────────────────────────┘
```

优势：

- 一眼看到 3 台设备
- STACKER_02 的失败状态在设备组头就可见
- 保留了所有原有信息（payload、trace、错误信息）
- 头部计数从"5 条命令"改为"3 台设备"，更符合分组后的认知

---

## 边界情况处理

| 场景                | 处理方式                       |
| ------------------- | ------------------------------ |
| `target_code` 为空  | 归入 `__unknown__` 虚拟设备组  |
| 所有命令同一设备    | 只有一组，不增加认知负担       |
| 设备组只有 1 条命令 | 正常显示，不特殊处理           |
| 多个设备都有失败    | 每个失败设备组独立显示红色标记 |
| 无 outbox_items     | 显示"暂无命令"（已有逻辑覆盖） |
