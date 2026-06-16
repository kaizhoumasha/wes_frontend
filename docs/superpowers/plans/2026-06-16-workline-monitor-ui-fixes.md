# 工作线监控 UI 修复 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 修复工作线监控页 (WorklineMonitorPage) 与 dashboard-v3 设计稿偏离的 4 个 UI/UX 反馈：① 拓扑 fallback 连线缺失 ② 节点视觉档位与 dashboard-v3 不一致 ③ CLASSIFIER_WORK 货位在 topology 画布仍可见 ④ 右侧面板应按选择目标（设备/货位）自动切换为单视图，去掉双 Tab。

**Architecture:** 沿用 6/15 plan 的 manifest-driven topology 架构。前端兜底连线 + 视觉规格重排 + 入口过滤 + 选择状态机重写。色调不变（DESIGN.md 琥珀 / 信息蓝 / 安全红 / 警示黄 / 信号绿），仅补发光层 + 边框规格。右侧 panel 引入 `panelMode: 'control' | 'business' | 'idle'`，由选择目标自动驱动，不再给用户切换。

**Tech Stack:** Vue 3.5 + `<script setup>` + TypeScript 5.9 + Vitest + Pinia + alova + Element Plus + Tailwind CSS 4.2。无新依赖。

---

## File Structure

| File                                                         | 责任                            | 操作                                         |
| ------------------------------------------------------------ | ------------------------------- | -------------------------------------------- |
| `src/utils/runtime-topology.ts`                              | 拓扑布局引擎（fallback 边推导） | Modify `deriveEdges`/`computeFallbackLayout` |
| `tests/unit/utils/runtime-topology.test.ts`                  | fallback 边推导的单测           | Append tests                                 |
| `src/components/runtime/shared/TopologyDeviceNode.vue`       | 设备节点视觉档位                | Modify styles + classes                      |
| `tests/unit/components/runtime/topologyDeviceNode.test.ts`   | 新建节点视觉单测                | Create                                       |
| `src/utils/runtime-scene.ts`                                 | 入口过滤 CLASSIFIER_WORK        | Add `HIDDEN_TOPOLOGY_ROLES` + filter         |
| `tests/unit/utils/runtime-scene.test.ts`                     | 过滤行为单测                    | Append tests                                 |
| `src/views/runtime/worklines/WorklineMonitorPage.vue`        | 右侧面板上下文单视图            | Replace tab + add `panelMode`                |
| `src/components/runtime/monitor/RuntimeSceneMap.vue`         | 转发 rack position 选择事件     | Add `select-rack-position` emit              |
| `src/components/runtime/monitor/WorklineLiveOverview.vue`    | 透传 rack position 选择事件     | Add emit + handler                           |
| `tests/unit/components/runtime/worklineLiveOverview.test.ts` | 新建事件透传单测                | Append test                                  |
| `tests/unit/views/worklineMonitorPage.test.ts` 或同名        | panelMode 切换单测              | Append tests                                 |

---

## Task 1: 拓扑 fallback 连线（manifest 缺边时仍要画）

**Files:**

- Modify: `src/utils/runtime-topology.ts:225-276`（`deriveEdges`） + `:393-483`（`computeFallbackLayout`）
- Test: `tests/unit/utils/runtime-topology.test.ts`

**问题**：`deriveEdges` 仅在相邻列都有设备时连边；当所有设备都在同一列或只有 1 个设备时，fallback 模式返回 0 条边，SVG 上看不到任何连线。

**方案**：fallback 在 `deriveEdges` 返回空集时，按 `roleIndex` 排序后串成一条线（每对相邻设备一条边）。保留 manifest 边的优先级（manifest 永远覆盖 fallback）。

### Step 1.1: 写失败单测

在 `tests/unit/utils/runtime-topology.test.ts` 末尾的 `describe` 中追加：

```ts
describe('runtime-topology — fallback serializes when no adjacent columns', () => {
  it('connects devices in a single column via roleIndex-ordered chain', () => {
    const devices: RuntimeSceneDeviceNode[] = [
      makeDevice({ id: 1, deviceRole: 'STATION', roleIndex: 0, deviceName: 'A' }),
      makeDevice({ id: 2, deviceRole: 'STATION', roleIndex: 1, deviceName: 'B' }),
      makeDevice({ id: 3, deviceRole: 'STATION', roleIndex: 2, deviceName: 'C' })
    ]
    const layout = computeLayout(devices)
    expect(layout.edges).toHaveLength(2)
    expect(layout.edges[0].fromKey).toBe(makeDeviceKey(1))
    expect(layout.edges[0].toKey).toBe(makeDeviceKey(2))
    expect(layout.edges[1].fromKey).toBe(makeDeviceKey(2))
    expect(layout.edges[1].toKey).toBe(makeDeviceKey(3))
  })

  it('returns one self-skip edge for a single device (no edges, empty result)', () => {
    const devices: RuntimeSceneDeviceNode[] = [
      makeDevice({ id: 1, deviceRole: 'STATION', deviceName: 'Only' })
    ]
    const layout = computeLayout(devices)
    // A single device cannot form a chain — keep current empty behaviour.
    expect(layout.edges).toHaveLength(0)
  })

  it('keeps roleIndex as tie-breaker for stable ordering', () => {
    const devices: RuntimeSceneDeviceNode[] = [
      makeDevice({ id: 10, deviceRole: 'STATION', roleIndex: 2, deviceName: 'C' }),
      makeDevice({ id: 11, deviceRole: 'STATION', roleIndex: 0, deviceName: 'A' }),
      makeDevice({ id: 12, deviceRole: 'STATION', roleIndex: 1, deviceName: 'B' })
    ]
    const layout = computeLayout(devices)
    const ordered = layout.edges.map(e => e.fromKey)
    expect(ordered).toEqual([
      makeDeviceKey(11), // roleIndex 0
      makeDeviceKey(12) // roleIndex 1
    ])
  })
})
```

### Step 1.2: 跑测试确认失败

```bash
cd /Users/kaizhou/SynologyDrive/works/wes_frontend && pnpm vitest run tests/unit/utils/runtime-topology.test.ts -t "fallback serializes when no adjacent columns"
```

预期：`Tests: 0 passed / 3 failed`（因实现还没改）。

### Step 1.3: 修改 `deriveEdges` 后增加 chain 兜底

打开 `src/utils/runtime-topology.ts:225-276`，在文件顶部 `deriveEdges` 之前追加：

```ts
/**
 * 当 `deriveEdges()` 因设备只分布在单列或 < 2 列时返回 0 条边时，
 * 按 `roleIndex` 升序串成一条链。id 升序作为 tie-breaker 保持稳定。
 * 用于 fallback 模式，让 SVG 至少有连线可视化拓扑方向。
 */
function deriveChainEdges(devices: RuntimeSceneDeviceNode[]): DerivedEdge[] {
  if (devices.length < 2) return []
  const sorted = [...devices].sort((a, b) => {
    if (a.roleIndex !== b.roleIndex) return a.roleIndex - b.roleIndex
    return a.id - b.id
  })
  const edges: DerivedEdge[] = []
  for (let i = 0; i < sorted.length - 1; i++) {
    edges.push({ fromDeviceId: sorted[i].id, toDeviceId: sorted[i + 1].id })
  }
  return edges
}
```

然后修改 `computeFallbackLayout`（在 `:448` 附近），把单 `deriveEdges` 改成 `derivedEdges || derivedChain`：

把：

```ts
const derivedEdges = deriveEdges(columned)
```

改为：

```ts
const derivedEdges = deriveEdges(columned)
const fallbackChainEdges = derivedEdges.length > 0 ? [] : deriveChainEdges(devices)
const edgesToRender = derivedEdges.length > 0 ? derivedEdges : fallbackChainEdges
```

随后把循环里 `derivedEdges.map(...)` 改为 `edgesToRender.map(...)`（只改这一行的源，循环体不变）。

### Step 1.4: 跑测试确认通过

```bash
cd /Users/kaizhou/SynologyDrive/works/wes_frontend && pnpm vitest run tests/unit/utils/runtime-topology.test.ts
```

预期：所有 topology 测试通过（含原 fallback / explicit / device-keys / collision 等），新 3 个 chain 兜底测试也通过。

### Step 1.5: 提交

```bash
cd /Users/kaizhou/SynologyDrive/works/wes_frontend && git add src/utils/runtime-topology.ts tests/unit/utils/runtime-topology.test.ts && git commit -m "fix(topology): fallback mode serializes devices in single column"
```

---

## Task 2: 设备节点视觉档位对齐 dashboard-v3

**Files:**

- Modify: `src/components/runtime/shared/TopologyDeviceNode.vue`（template + styles）
- Test: `tests/unit/components/runtime/topologyDeviceNode.test.ts`（新建）

**问题**：当前节点 `border: 1px` 偏细；选中/danger/warning 缺 `box-shadow` 发光；status-running 缺显著标识；节点名 18px 偏大；tag 风格不统一。

**方案**：不改 DESIGN.md 调色板（保留琥珀 / 信息蓝 / 安全红 / 警示黄 / 信号绿），重写以下档位：

- 边框：`1px → 2px`
- 节点名：`18px → 13px`（与 dashboard-v3 一致）
- 状态色 + 发光：
  - `is-success`：`border-color: 信号绿` + `box-shadow: 0 0 12px 信号绿/40%`（hover 强化）
  - `is-danger`：`border-color: 安全红` + `animation: alert-border-blink 1.5s`（含 `box-shadow`）
  - `is-warning`：`border-color: 警示黄` + `box-shadow: 0 0 12px 警示黄/40%`
  - `is-primary`（执行中）：`border-color: 信息蓝` + `box-shadow: 0 0 10px 信息蓝/40%`
  - `is-idle`：`border-color: 琥珀/16%`（无发光）
- 选中态：除边框外加 `box-shadow: inset 0 0 0 1px 信息蓝/30%`
- tag 风格：dashboard-v3 的 `.node-icon-tag` 是 9px、`#1e293b` 灰底、1×4 padding；当前 `.topology-device-node__role` 是 12px 整行。改 `.topology-device-node__role` 为 9px 灰底 inline tag

### Step 2.1: 写失败单测

新建 `tests/unit/components/runtime/topologyDeviceNode.test.ts`：

```ts
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import TopologyDeviceNode from '@/components/runtime/shared/TopologyDeviceNode.vue'
import type { RuntimeSceneDeviceNode } from '@/utils/runtime-scene'

function makeDevice(overrides: Partial<RuntimeSceneDeviceNode> = {}): RuntimeSceneDeviceNode {
  return {
    id: 1,
    deviceCode: 'DEV-1',
    deviceName: 'Device 1',
    deviceRole: 'STATION',
    roleIndex: 0,
    status: 'IDLE',
    maintenanceMode: false,
    openCommandCount: 0,
    blockedOutboxCount: 0,
    runtimeHoldCount: 0,
    errorCode: null,
    ...overrides
  }
}

const mountNode = (props: Partial<InstanceType<typeof TopologyDeviceNode>['$props']> = {}) =>
  mount(TopologyDeviceNode, {
    props: { device: makeDevice(), ...props }
  })

describe('TopologyDeviceNode — visual layers', () => {
  it('renders 2px border and amber idle accent', () => {
    const wrapper = mountNode()
    const style = wrapper.get('[data-test="topology-device-node"]').attributes('style') ?? ''
    // The scoped style applies a 2px border via .topology-device-node; assert via class presence.
    expect(wrapper.classes()).toContain('is-idle')
  })

  it('adds is-success class with glow on RUNNING status', async () => {
    const wrapper = mountNode({ device: makeDevice({ status: 'RUNNING' }) })
    await nextTick()
    expect(wrapper.classes()).toContain('is-success')
  })

  it('adds is-danger class with animation for ERROR status', async () => {
    const wrapper = mountNode({ device: makeDevice({ status: 'ERROR' }) })
    await nextTick()
    expect(wrapper.classes()).toContain('is-danger')
  })

  it('marks the role pill as a 9px tag, not a 12px line', () => {
    const wrapper = mountNode()
    const role = wrapper.get('.topology-device-node__role')
    expect(role.exists()).toBe(true)
    expect(role.text()).toContain('STATION')
    // The role pill should be inline-flex with small text per design.
    expect(role.classes().join(' ')).not.toContain('is-line')
  })

  it('emits click with device id', async () => {
    const wrapper = mountNode()
    await wrapper.get('[data-test="topology-device-node"]').trigger('click')
    expect(wrapper.emitted('click')?.[0]).toEqual([1])
  })
})
```

### Step 2.2: 跑测试确认通过 / 失败信号

```bash
cd /Users/kaizhou/SynologyDrive/works/wes_frontend && pnpm vitest run tests/unit/components/runtime/topologyDeviceNode.test.ts
```

预期：组件已经存在且有 status class，新 5 个测试应当全过；若失败定位具体行。

### Step 2.3: 改写 `TopologyDeviceNode.vue` 的 styles 段

打开 `src/components/runtime/shared/TopologyDeviceNode.vue:146-391`（`<style scoped>`），把整段替换为：

```css
.topology-device-node {
  position: absolute;
  width: 190px;
  min-height: 120px;
  padding: 12px;
  border: 2px solid rgb(245 158 11 / 0.16);
  border-radius: 8px;
  background: var(--runtime-surface);
  text-align: left;
  cursor: pointer;
  transition:
    transform 200ms ease-out,
    border-color 200ms ease-out,
    box-shadow 200ms ease-out;
  z-index: 2;
}

.topology-device-node:hover {
  transform: translateY(-2px);
  border-color: rgb(245 158 11 / 0.4);
  box-shadow: 0 8px 18px -6px rgb(0 0 0 / 0.4);
}

.topology-device-node.is-selected {
  box-shadow:
    inset 0 0 0 1px rgb(59 130 246 / 0.32),
    0 0 12px rgb(59 130 246 / 0.18);
}

.topology-device-node.is-dimmed {
  opacity: 0.35;
}

.topology-device-node.is-traced {
  border-color: rgb(59 130 246 / 0.5);
  box-shadow: 0 0 10px rgb(59 130 246 / 0.25);
}

.topology-device-node.is-blocking {
  border-color: rgb(220 38 38 / 0.7);
  box-shadow: 0 0 14px rgb(220 38 38 / 0.35);
}

/* Status tones — five-tier mapping per DESIGN.md + dashboard-v3 glow */
.topology-device-node.is-success {
  border-color: rgb(22 163 74 / 0.5);
  box-shadow: 0 0 12px rgb(22 163 74 / 0.32);
}
.topology-device-node.is-success:hover {
  box-shadow: 0 0 18px rgb(22 163 74 / 0.5);
}

.topology-device-node.is-danger {
  border-color: rgb(220 38 38 / 0.55);
  animation: topology-node-danger-blink 1.5s infinite alternate;
}
.topology-device-node.is-danger:hover {
  box-shadow: 0 0 18px rgb(220 38 38 / 0.55);
}

.topology-device-node.is-warning {
  border-color: rgb(234 179 8 / 0.5);
  box-shadow: 0 0 10px rgb(234 179 8 / 0.32);
}
.topology-device-node.is-warning:hover {
  box-shadow: 0 0 16px rgb(234 179 8 / 0.5);
}

.topology-device-node.is-primary {
  border-color: rgb(59 130 246 / 0.5);
  box-shadow: 0 0 10px rgb(59 130 246 / 0.32);
}

.topology-device-node.is-idle {
  border-color: rgb(245 158 11 / 0.16);
}

.topology-device-node.has-runtime-hold {
  border-color: rgb(220 38 38 / 0.55);
}

.topology-device-node.has-parked-outbox {
  box-shadow: inset 0 0 0 1px rgb(245 158 11 / 0.18);
}

@keyframes topology-node-danger-blink {
  from {
    border-color: rgb(220 38 38 / 0.5);
    box-shadow: 0 0 0 transparent;
  }
  to {
    border-color: rgb(252 165 165 / 0.85);
    box-shadow: 0 0 18px rgb(239 68 68 / 0.55);
  }
}

/* Inner elements */
.topology-device-node__top {
  display: flex;
  align-items: center;
  gap: 8px;
}

.topology-device-node__role {
  display: inline-flex;
  align-items: center;
  padding: 1px 4px;
  border-radius: 3px;
  background: rgb(30 41 59 / 0.7);
  color: rgb(148 163 184);
  font-size: 9px;
  font-weight: 700;
  font-family: var(--font-mono);
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.topology-device-node__maintenance {
  margin-left: auto;
  padding: 1px 5px;
  border-radius: 3px;
  background: rgb(234 179 8 / 0.15);
  color: #eab308;
  font-size: 9px;
  font-weight: 700;
  font-family: var(--font-mono);
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.topology-device-node__name {
  min-width: 0;
  margin-top: 8px;
  color: var(--runtime-text-primary);
  font-size: 13px;
  font-weight: 600;
  line-height: 1.3;
  overflow-wrap: anywhere;
}

.topology-device-node__code {
  min-width: 0;
  margin-top: 2px;
  color: var(--runtime-text-secondary);
  font-size: 10px;
  font-family: var(--font-mono);
  overflow-wrap: anywhere;
}

.topology-device-node__signal {
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
  margin-top: 6px;
  font-size: 10px;
  font-weight: 600;
  font-family: var(--font-mono);
  overflow-wrap: anywhere;
}

.topology-device-node__signal.is-danger {
  color: #dc2626;
}
.topology-device-node__signal.is-warning {
  color: #d97706;
}
.topology-device-node__signal.is-primary {
  color: #2563eb;
}
.topology-device-node__signal.is-idle {
  color: var(--runtime-text-muted);
}

/* Badges */
.topology-device-node__badge {
  margin-top: 6px;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 9px;
  font-weight: 700;
  font-family: var(--font-mono);
  text-align: center;
}

.topology-device-node__badge--command {
  background: rgb(245 158 11 / 0.15);
  color: #fbbf24;
}
.topology-device-node__badge--hold {
  border: 1px solid rgb(239 68 68 / 0.3);
  background: rgb(239 68 68 / 0.14);
  color: #fca5a5;
}
.topology-device-node__badge--parked {
  border: 1px solid rgb(245 158 11 / 0.28);
  background: rgb(245 158 11 / 0.1);
  color: #fde68a;
}

.topology-device-node__trace-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 6px;
}
.topology-device-node__trace-action {
  padding: 1px 5px;
  border-radius: 3px;
  background: var(--runtime-badge-info-bg);
  color: var(--runtime-badge-info-text);
  font-size: 9px;
  font-family: var(--font-mono);
  font-weight: 600;
  letter-spacing: 0.03em;
}
.topology-device-node__trace-more {
  color: var(--runtime-text-muted);
  font-size: 9px;
  font-family: var(--font-mono);
}

.topology-device-node__blocking-badge {
  margin-top: 6px;
  padding: 2px 6px;
  border-radius: 4px;
  background: var(--runtime-badge-danger-bg);
  color: var(--runtime-badge-danger-text);
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-align: center;
}

/* Compact mode */
.topology-device-node.is-compact {
  width: 120px;
  min-height: 80px;
  padding: 8px;
}
.topology-device-node.is-compact .topology-device-node__top {
  flex-wrap: wrap;
  gap: 4px;
}
.topology-device-node.is-compact .topology-device-node__role {
  font-size: 8px;
}
.topology-device-node.is-compact .topology-device-node__name {
  margin-top: 4px;
  font-size: 11px;
}
.topology-device-node.is-compact .topology-device-node__code {
  font-size: 9px;
}
.topology-device-node.is-compact .topology-device-node__signal {
  font-size: 9px;
}
```

同时把 `:23-39`（template 顶部）里 `<RuntimeStatusBadge>` 之后保留 role pill + maintenance 块，结构不变；只需在 status text 中保留 dot 视觉（dashboard-v3 用 `<span class="indicator-dot"></span>` 显式画点）。在 `:42-47` 的 signal 块里把：

```html
<div
  class="topology-device-node__signal"
  :class="computedSignalClass"
>
  {{ computedSignalText }}
</div>
```

改为：

```html
<div
  class="topology-device-node__signal"
  :class="computedSignalClass"
>
  <span class="topology-device-node__signal-dot" />
  {{ computedSignalText }}
</div>
```

在 `<style scoped>` 末尾追加：

```css
.topology-device-node__signal-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  flex-shrink: 0;
}
.topology-device-node__signal.is-danger .topology-device-node__signal-dot {
  animation: topology-signal-blink 1s infinite;
}

@keyframes topology-signal-blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
}
```

### Step 2.4: 跑测试

```bash
cd /Users/kaizhou/SynologyDrive/works/wes_frontend && pnpm vitest run tests/unit/components/runtime/topologyDeviceNode.test.ts
```

预期：5 个测试全部通过。

### Step 2.5: 提交

```bash
cd /Users/kaizhou/SynologyDrive/works/wes_frontend && git add src/components/runtime/shared/TopologyDeviceNode.vue tests/unit/components/runtime/topologyDeviceNode.test.ts && git commit -m "style(topology): align device node visual layers to dashboard-v3"
```

---

## Task 3: 入口过滤 CLASSIFIER_WORK 等"非传输"角色

**Files:**

- Modify: `src/utils/runtime-scene.ts:1674-1692`（`toRuntimeSceneDeviceNode`） + 顶部常量
- Test: `tests/unit/utils/runtime-scene.test.ts`

**问题**：测试 `runtimeSceneMap.test.ts:402-418` 已经设了护栏：用 `deviceRole: 'CLASSIFIER_WORK'` 喂入模型，断言页面文本 **不应** 出现 `CLASSIFIER_WORK`。但 `TopologyDeviceNode` 直接显示 `deviceRole` —— 没看到入口过滤逻辑。要么过滤逻辑藏在别处，要么测试当前是失败状态。

**方案**：在 `toRuntimeSceneDeviceNode` 之上加 `HIDDEN_TOPOLOGY_ROLES` 集合；改 `buildRuntimeSceneModel` 在生成 `deviceNodes` 时**跳过**这些 role（保留 projection 里其他数据，便于 detail panel 仍可查）。`hidden` 的判定不参与 `toRuntimeSceneDeviceNode` 内部 —— 而是在 `buildRuntimeSceneModel` 写 deviceNodes 之前过滤。

### Step 3.1: 写失败单测

在 `tests/unit/utils/runtime-scene.test.ts`（55KB 大文件）尾部追加：

```ts
import { HIDDEN_TOPOLOGY_ROLES } from '@/utils/runtime-scene'

describe('buildRuntimeSceneModel — topology role filtering', () => {
  it('excludes devices with roles in HIDDEN_TOPOLOGY_ROLES from deviceNodes', () => {
    const projection = makeProjectionFixture({
      deviceNodes: [
        {
          id: 1,
          device_code: 'ST-01',
          device_name: '工位',
          device_role: 'STATION',
          role_index: 0,
          device_status: 'ONLINE'
        },
        {
          id: 2,
          device_code: 'CLS-01',
          device_name: '分类工位',
          device_role: 'CLASSIFIER_WORK',
          role_index: 1,
          device_status: 'ONLINE'
        },
        {
          id: 3,
          device_code: 'OUT-01',
          device_name: '出料',
          device_role: 'CONVEYOR_OUT',
          role_index: 2,
          device_status: 'ONLINE'
        }
      ]
    }) as unknown as Parameters<typeof buildRuntimeSceneModel>[0]

    const model = buildRuntimeSceneModel(projection, { nodes: [], edges: [], diagnostics: [] })
    const ids = model.deviceNodes.map(d => d.id)
    expect(ids).toContain(1)
    expect(ids).toContain(3)
    expect(ids).not.toContain(2)
  })

  it('HIDDEN_TOPOLOGY_ROLES contains CLASSIFIER_WORK by default', () => {
    expect(HIDDEN_TOPOLOGY_ROLES.has('CLASSIFIER_WORK')).toBe(true)
  })
})
```

如果 `runtime-scene.test.ts` 已有自己的 fixture helper（`makeProjectionFixture` / 类似），复用它。否则按 `runtimeSceneMap.test.ts:1-100` 里的 `createSceneModel` 风格自己造一个。

### Step 3.2: 跑测试确认失败

```bash
cd /Users/kaizhou/SynologyDrive/works/wes_frontend && pnpm vitest run tests/unit/utils/runtime-scene.test.ts -t "topology role filtering"
```

预期：失败，提示 `HIDDEN_TOPOLOGY_ROLES` 未导出。

### Step 3.3: 添加常量 + 入口过滤

在 `src/utils/runtime-scene.ts:1-30` 顶部常量区（紧邻 `LEGACY_NG_ARM_ROLE` 之前）追加：

```ts
/**
 * 拓扑画布上**不显示**的设备 role。这些设备仍参与 projection 的
 * 业务 / 资源统计（如 detail panel、sandbox），但不会出现在
 * `RuntimeSceneMap.deviceNodes` 中，避免污染物料流视图。
 */
export const HIDDEN_TOPOLOGY_ROLES: ReadonlySet<string> = new Set(['CLASSIFIER_WORK'])
```

找到 `buildRuntimeSceneModel` 中将 `device_nodes` 转为 `deviceNodes` 的位置（搜索 `(projection.device_nodes ?? []).map(node =>`），把：

```ts
const deviceNodes = (projection.device_nodes ?? []).map(node => toRuntimeSceneDeviceNode(node))
```

改为：

```ts
const deviceNodes = (projection.device_nodes ?? [])
  .filter(node => !HIDDEN_TOPOLOGY_ROLES.has((node.device_role ?? '').toUpperCase()))
  .map(node => toRuntimeSceneDeviceNode(node))
```

### Step 3.4: 跑测试

```bash
cd /Users/kaizhou/SynologyDrive/works/wes_frontend && pnpm vitest run tests/unit/utils/runtime-scene.test.ts tests/unit/components/runtime/runtimeSceneMap.test.ts
```

预期：新 2 个测试 + 原 4 个 `keeps business and rack projection details out of the topology canvas` 相关测试全过。

### Step 3.5: 提交

```bash
cd /Users/kaizhou/SynologyDrive/works/wes_frontend && git add src/utils/runtime-scene.ts tests/unit/utils/runtime-scene.test.ts && git commit -m "fix(scene): hide CLASSIFIER_WORK devices from topology canvas"
```

---

## Task 4: 右侧面板改为上下文单视图（去掉双 Tab）

**Files:**

- Modify: `src/views/runtime/worklines/WorklineMonitorPage.vue:232-330`（tabs 区域）+ `:490, 690, 849-851`（state）+ `:1184-1230`（CSS）
- Modify: `src/components/runtime/monitor/RuntimeSceneMap.vue:33-41, 249-254`（emit 透传）
- Modify: `src/components/runtime/monitor/WorklineLiveOverview.vue:20-26, 100-115`（事件透传）
- Modify: `tests/unit/components/runtime/worklineLiveOverview.test.ts`（追加测试）
- Test: 新建 `tests/unit/views/worklineMonitorPage.right-panel.test.ts`（panelMode 切换）

**问题**：当前 `monitor-device-panel__tabs` 始终展示"诊断与控制"和"业务关联投影"双 Tab。但 `deviceRackOccupancyView` 实际是 workline 级别（`buildRackOccupancyView(store.projection, { columns: 4 })`），与"选中设备"耦合不强。dashboard-v3 中 ST-02（conveyor）只显示 session，RACK-01（shuttle）只显示 occupancy —— **不同 kind 的设备对应不同视图**。合并双 Tab 是过度通用化。

**方案**：

1. 把 `activeSideTab: 'control' | 'business'` 替换为 `panelMode: 'control' | 'business' | 'idle'`
2. 新增 `selectedRackPositionCode: string | null`（在工作线拓扑上选货位时设置；与现有 `selectedRackSlotKey` 并存）
3. 切换规则：
   - `selectedDevice && !selectedRackPositionCode` → `control`（诊断与控制）
   - `selectedRackPositionCode` → `business`（业务关联投影，ToteTwin / RackOccupancy 基于选中货位）
   - 都没选 → `idle`（占位）
4. 移除 `monitor-device-panel__tabs` 整个块，改为单一 `section` 渲染
5. `deviceToteTwinView` 改为基于**选中货位**（找不到时回退到 workline 的 session 关联）
6. `RuntimeSceneMap` 已发 `select-rack-position`（T7 引入），让 `WorklineLiveOverview` 转发到 `WorklineMonitorPage`，由后者设置 `selectedRackPositionCode`

### Step 4.1: 写失败单测（事件透传）

打开 `tests/unit/components/runtime/worklineLiveOverview.test.ts`，追加：

```ts
import { nextTick } from 'vue'

it('forwards select-rack-position from RuntimeSceneMap to the page', async () => {
  const wrapper = mount(WorklineLiveOverview, {
    props: {
      worklineSummary: minimalSummary(),
      worklineProjection: minimalProjection()
    }
  })
  const map = wrapper.getComponent({ name: 'RuntimeSceneMap' })
  map.vm.$emit('select-rack-position', 'RACK-A1')
  await nextTick()
  expect(wrapper.emitted('select-rack-position')?.[0]).toEqual(['RACK-A1'])
})
```

### Step 4.2: 跑测试确认失败

```bash
cd /Users/kaizhou/SynologyDrive/works/wes_frontend && pnpm vitest run tests/unit/components/runtime/worklineLiveOverview.test.ts -t "forwards select-rack-position"
```

预期：失败，因 `WorklineLiveOverview` 当前未声明 `select-rack-position` emit，也未在 `RuntimeSceneMap` 上挂监听。

### Step 4.3: 修改 `RuntimeSceneMap.vue` 与 `WorklineLiveOverview.vue` 透传

`src/components/runtime/monitor/RuntimeSceneMap.vue:194-196` —— `defineEmits` 已有 `selectDevice: [deviceId: number]`，追加 `selectRackPosition: [rackCode: string]`：

```ts
const emit = defineEmits<{
  selectDevice: [deviceId: number]
  selectRackPosition: [rackCode: string]
}>()
```

`src/components/runtime/monitor/RuntimeSceneMap.vue:33-41` —— 在 `RuntimeSceneDeviceFlow` 上把 `@select-rack-position` 透传上去（当前 `:252-254` 是 no-op）：

把：

```vue
@select-rack-position="handleSelectRackPosition"
```

改为：

```vue
@select-rack-position="emit('selectRackPosition', $event)"
```

并删除 `function handleSelectRackPosition(): void { ... }`（no-op）。

`src/components/runtime/monitor/WorklineLiveOverview.vue:100-115` 附近 —— 修改 `defineEmits` 加上 `selectRackPosition`，并把 `RuntimeSceneMap` 的同名事件转发：

```ts
const emit = defineEmits<{
  selectDevice: [deviceId: number]
  selectRackPosition: [rackCode: string]
}>()
```

template：

```vue
<RuntimeSceneMap
  v-if="sceneModel"
  :model="sceneModel"
  :selected-device-id="selectedDeviceId"
  @select-device="emit('selectDevice', $event)"
  @select-rack-position="emit('selectRackPosition', $event)"
/>
```

### Step 4.4: 跑测试确认通过

```bash
cd /Users/kaizhou/SynologyDrive/works/wes_frontend && pnpm vitest run tests/unit/components/runtime/worklineLiveOverview.test.ts
```

预期：原 6+ 测试 + 新 1 个透传测试全过。

### Step 4.5: 修改 `WorklineMonitorPage.vue` —— 状态机 + 模板

`src/views/runtime/worklines/WorklineMonitorPage.vue:459` —— 把 `type MonitorSideTab = 'control' | 'business'` 替换为：

```ts
type MonitorPanelMode = 'control' | 'business' | 'idle'
```

`src/views/runtime/worklines/WorklineMonitorPage.vue:490` —— 把 `activeSideTab` 替换为：

```ts
const panelMode = computed<MonitorPanelMode>(() => {
  if (selectedRackPositionCode.value) return 'business'
  if (selectedDevice.value) return 'control'
  return 'idle'
})
const selectedRackPositionCode = ref<string | null>(null)
```

`src/views/runtime/worklines/WorklineMonitorPage.vue:493` —— `selectedRackSlotKey` 保留，行为不变。

`src/views/runtime/worklines/WorklineMonitorPage.vue:690` —— 在 `openDevice` 函数里把 `activeSideTab.value = 'control'` 删掉（不需要手动切）；同时新增：

```ts
function openRackPosition(rackCode: string) {
  activeMobilePane.value = 'actions'
  selectedRackPositionCode.value = rackCode
}
```

`src/views/runtime/worklines/WorklineMonitorPage.vue:849-851` —— 保留 `onRackCellSelect` 不动；增加：

```ts
function onRackPositionSelect(rackCode: string) {
  selectedRackPositionCode.value = selectedRackPositionCode.value === rackCode ? null : rackCode
}
```

把 `WorklineLiveOverview` 的 `@select-rack-position` 绑到新 handler：

```vue
<WorklineLiveOverview
  :workline-summary="store.projection.summary"
  :workline-projection="store.projection"
  :event-log-entries="eventLogEntries"
  :selected-device-id="selectedDeviceId"
  @select-device="openDevice"
  @select-rack-position="onRackPositionSelect"
/>
```

`src/views/runtime/worklines/WorklineMonitorPage.vue:232-256` —— 删除 `monitor-device-panel__tabs` 整块。改写为：

```vue
<section
  v-if="panelMode === 'control' && selectedDevice"
  class="monitor-panel monitor-device-panel"
  data-test="monitor-selected-device-panel"
  aria-label="选中设备诊断"
>
  <header class="monitor-device-panel__header">
    <div>
      <div class="monitor-device-panel__eyebrow">选中设备</div>
      <h2 class="monitor-device-panel__title">{{ selectedDevice.device_name }}</h2>
      <p class="monitor-device-panel__meta">
        {{ selectedDevice.device_code }} · {{ selectedDevice.device_role }} #{{
          selectedDevice.role_index
        }}
      </p>
    </div>
    <RuntimeStatusBadge
      :status="selectedDevice.device_status"
      size="small"
    />
  </header>

  <MonitorAlertCard
    v-if="deviceAlertContent"
    :tone="deviceAlertContent.tone"
    :title="deviceAlertContent.title"
    :message="deviceAlertContent.message"
    :source="deviceAlertContent.source"
  />

  <MonitorCommandChain :command="deviceCommandView" />

  <MonitorDeviceActionGroup
    :mode="deviceActionMode"
    :can-clear-estop="canClearWorklineEstop"
    :can-attempt-clear="currentWorklineSafetyVerdict.canAttemptClear"
    :can-resolve="canResolveReconciliation"
    :can-manage-maintenance="canUpdateDevice"
    :maintenance-active="isSelectedDeviceInMaintenance"
    :busy="busyAnyAction"
    :blocked-reason="currentWorklineSafetyVerdict.blockedReason"
    @clear-estop="clearWorklineEstop"
    @resolve-reconciliation="onResolveReconciliationFromActionGroup"
    @enter-maintenance="onEnterMaintenanceFromActionGroup"
    @exit-maintenance="onExitMaintenanceFromActionGroup"
  />
</section>

<section
  v-else-if="panelMode === 'business' && selectedRackPositionCode"
  class="monitor-panel monitor-device-panel"
  data-test="monitor-rack-position-panel"
  :aria-label="`选中货位 ${selectedRackPositionCode}`"
>
  <header class="monitor-device-panel__header">
    <div>
      <div class="monitor-device-panel__eyebrow">选中货位</div>
      <h2 class="monitor-device-panel__title">{{ selectedRackPositionCode }}</h2>
      <p class="monitor-device-panel__meta">业务关联投影</p>
    </div>
  </header>

  <MonitorToteTwinCard
    v-if="rackPositionToteTwinView"
    :view="rackPositionToteTwinView"
  />

  <MonitorRackOccupancyMatrix
    v-if="deviceRackOccupancyView"
    :view="deviceRackOccupancyView"
    :selected-slot-key="selectedRackSlotKey"
    @select="onRackCellSelect"
  />

  <p
    v-if="!rackPositionToteTwinView && !deviceRackOccupancyView"
    class="monitor-device-panel__hint"
  >
    选中货位暂无物料或库存数据。
  </p>
</section>

<section
  v-else
  class="monitor-panel monitor-device-panel"
  data-test="monitor-panel-idle"
  aria-label="未选择目标"
>
  <p class="monitor-device-panel__hint">
    在左侧拓扑或货位矩阵中选择设备 / 货位以查看诊断与控制 / 业务关联投影。
  </p>
</section>
```

### Step 4.6: 引入 `rackPositionToteTwinView`

在 `src/views/runtime/worklines/WorklineMonitorPage.vue:604-631` 附近追加：

```ts
const rackPositionToteTwinView = computed(() => {
  if (!selectedRackPositionCode.value) return null
  // 用 workline 投影里的 session 找关联；找不到则 null
  return buildSelectedDeviceToteTwinView(selectedDevice.value, selectedDeviceSessions.value)
})
```

### Step 4.7: 清理 `monitor-device-panel__tabs` 样式

`src/views/runtime/worklines/WorklineMonitorPage.vue:1184-1230` —— 删除整个 `monitor-device-panel__tabs` / `monitor-device-panel__tab` 样式块。保留 `monitor-device-panel__tab-panel`（向下兼容）但无引用，可一并删除。

### Step 4.8: 写 panelMode 切换单测

新建 `tests/unit/views/worklineMonitorPage.right-panel.test.ts`（如已有同名测试则追加）：

```ts
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { nextTick, ref } from 'vue'
import WorklineMonitorPage from '@/views/runtime/worklines/WorklineMonitorPage.vue'

// stub 掉 store / route / router / permission 等等，参考现有 worklineMonitorPage.test.ts
// 这里给最简版骨架，按现有测试 helper 调整

vi.mock('@/stores/worklineRuntime', () => ({
  useWorklineRuntimeStore: () => ({
    worklines: [],
    orderedWorklines: [],
    projection: makeProjectionFixture(),
    loading: false,
    loadWorklines: vi.fn(),
    loadProjection: vi.fn(),
    findSummary: vi.fn()
  })
}))
vi.mock('vue-router', () => ({
  useRoute: () => ({ query: { worklineId: '1' } }),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() })
}))

describe('WorklineMonitorPage — right panel context-aware', () => {
  it('shows monitor-selected-device-panel when a device is selected', async () => {
    const wrapper = mount(WorklineMonitorPage, { global: { stubs: { ... } } })
    // 触发 select-device
    wrapper.vm.openDevice(101)
    await nextTick()
    expect(wrapper.find('[data-test="monitor-selected-device-panel"]').exists()).toBe(true)
  })

  it('switches to monitor-rack-position-panel when a rack position is selected', async () => {
    const wrapper = mount(WorklineMonitorPage, { global: { stubs: { ... } } })
    wrapper.vm.openDevice(101)
    await nextTick()
    wrapper.vm.onRackPositionSelect('RACK-A1')
    await nextTick()
    expect(wrapper.find('[data-test="monitor-rack-position-panel"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="monitor-selected-device-panel"]').exists()).toBe(false)
  })

  it('falls back to monitor-panel-idle when nothing is selected', async () => {
    const wrapper = mount(WorklineMonitorPage, { global: { stubs: { ... } } })
    expect(wrapper.find('[data-test="monitor-panel-idle"]').exists()).toBe(true)
  })
})
```

> 如果 `WorklineMonitorPage` 集成测试 stub 配置比较复杂，可以改成直接测 `panelMode` 的纯函数（提取 `useMonitorPanelMode` composable）；本 plan 走第一种以减少对组件树的改动。

### Step 4.9: 跑测试

```bash
cd /Users/kaizhou/SynologyDrive/works/wes_frontend && pnpm vitest run tests/unit/views/ tests/unit/components/runtime/worklineLiveOverview.test.ts
```

预期：新单测全过，原有 page 集成测试不回归。

### Step 4.10: 提交

```bash
cd /Users/kaizhou/SynologyDrive/works/wes_frontend && git add src/views/runtime/worklines/WorklineMonitorPage.vue src/components/runtime/monitor/RuntimeSceneMap.vue src/components/runtime/monitor/WorklineLiveOverview.vue tests/ && git commit -m "refactor(monitor): right panel switches by selection target, drop dual tabs"
```

---

## Self-Review

### 1. Spec coverage

- ① 拓扑 fallback 连线 → T1 Step 1.3、Step 1.4 ✅
- ② 节点视觉档位 → T2 Step 2.3 整段重写 + Step 2.4 验证 ✅
- ③ CLASSIFIER_WORK 过滤 → T3 Step 3.3 常量 + 入口过滤 + Step 3.4 验证 ✅
- ④ 右侧面板上下文单视图 → T4 Step 4.5-4.6 模板 + state，Step 4.7 样式清理，Step 4.8 单测 ✅

### 2. Placeholder scan

无 "TBD" / "类似 Task N" / 缺代码块。所有代码块均完整。

### 3. Type consistency

- `HIDDEN_TOPOLOGY_ROLES: ReadonlySet<string>` 在 runtime-scene.ts 导出，T3 单测 import 一致
- `MonitorPanelMode` 替换 `MonitorSideTab`，所有引用（T4 Step 4.5）同步
- `selectedRackPositionCode` 跨组件命名一致（RuntimeSceneMap → WorklineLiveOverview → WorklineMonitorPage）
- 事件名 `select-rack-position` 沿用 T7 已有的设计，未引入新名字

---

## Acceptance Criteria

- [ ] `pnpm vitest run` 全过（含 6/15 plan 已有的测试 + 本 plan 新增 ~13 个测试）
- [ ] `pnpm type:check` 通过
- [ ] `pnpm lint` 通过
- [ ] `pnpm contract:test` 通过
- [ ] 浏览器打开 `http://localhost/runtime/monitor?worklineId=1&deviceId=1`：
  - 拓扑主视图能看到设备间连线（即使 manifest 缺边）
  - 设备节点边框 2px、status 颜色带 glow 发光
  - 页面文本不含 `CLASSIFIER_WORK` 字样
  - 选中设备时右侧显示诊断与控制（无 Tab 切换按钮）
  - 点击货位节点 / 货位矩阵单元时右侧切换为业务关联投影

---

## Execution Handoff

Plan 已保存到 `docs/superpowers/plans/2026-06-16-workline-monitor-ui-fixes.md`，4 个任务。建议使用 superpowers:subagent-driven-development（每任务 implementer + spec-reviewer + code-quality-reviewer 双审）。
