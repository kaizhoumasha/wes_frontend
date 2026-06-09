# Runtime Monitor Resource Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the reviewed runtime monitor resource layout, monitor focus panel, evidence panel, and shared device flow convergence across monitor, sandbox, and trace topology.

**Architecture:** `buildRuntimeSceneModel` remains the only adapter entrypoint for resource grouping and attention-state derivation. Vue components render already-normalized scene data: `RuntimeSceneDeviceFlow` handles shared device topology, `RuntimeSceneMap` owns monitor composition, and small monitor-only components render position/resource/focus/evidence details. Old `WorklineRouteMap` is removed because this is an unpublished feature and no compatibility wrapper is needed.

**Tech Stack:** Vue 3 `<script setup>`, TypeScript strict mode, Vitest, Vue Test Utils, Element Plus, `agent-browser` smoke script, existing runtime CSS variables.

---

## File Structure

- Modify `src/utils/runtime-scene.ts`: extend scene model, export `toRuntimeSceneDeviceNode`, group evidence into position groups/stacks/children, derive `attentionState`.
- Create `src/components/runtime/shared/RuntimeSceneDeviceFlow.vue`: shared device topology component replacing `WorklineRouteMap`.
- Create `src/components/runtime/monitor/RuntimeScenePositionGroup.vue`: one station/position section.
- Create `src/components/runtime/monitor/RuntimeSceneResourceStack.vue`: one grouped resource stack with children.
- Create `src/components/runtime/monitor/RuntimeSceneFocusPanel.vue`: selected position/stack details.
- Create `src/components/runtime/monitor/RuntimeSceneEvidencePanel.vue`: evidence audit rows only.
- Modify `src/components/runtime/monitor/RuntimeSceneMap.vue`: compose device flow, position groups, global unlocated audit, focus panel; remove flat evidence grid.
- Modify `src/components/runtime/monitor/WorklineLiveOverview.vue`: keep scene model integration and pass trace path to the shared device flow through `RuntimeSceneMap`.
- Modify `src/views/runtime/sandbox/SandboxWorkbenchPage.vue`: replace `WorklineRouteMap` with `RuntimeSceneDeviceFlow` using exported device-node adapter.
- Modify `src/components/runtime/trace/TraceTopologySummary.vue`: replace the full-topology details component with `RuntimeSceneDeviceFlow`; do not rewrite trace hero topology.
- Delete `src/components/runtime/monitor/WorklineRouteMap.vue`.
- Delete `tests/unit/components/runtime/worklineRouteMap.test.ts`.
- Add/modify Vitest files under `tests/unit/utils/`, `tests/unit/components/runtime/`, and `tests/unit/views/runtime/`.
- Modify `scripts/runtime-agent-browser-smoke.sh`: extend fixture and assertions for monitor, sandbox, trace.

## Task 1: Scene Model Grouping

**Files:**

- Modify: `src/utils/runtime-scene.ts`
- Test: `tests/unit/utils/runtime-scene.test.ts`

- [ ] **Step 1: Write failing adapter tests**

Add these tests inside `describe('buildRuntimeSceneModel', () => { ... })` in `tests/unit/utils/runtime-scene.test.ts`:

```ts
it('groups structured evidence by position, stack anchor, and child resources', () => {
  const model = buildRuntimeSceneModel({
    detail: createDetail({
      resource_evidence_total_count: 7,
      resource_evidence_truncated: true,
      resource_evidence_items: [
        {
          resource_kind: 'RACK',
          resource_code: 'RACK-001',
          display_label: 'Rack RACK-001',
          evidence_kind: 'WES_ACTIVE_SNAPSHOT',
          station_code: 'TARGET_ARM',
          position_code: 'SINGLE_LAYER_A',
          rack_code: 'RACK-001'
        },
        {
          resource_kind: 'BIN',
          resource_code: 'BIN-001',
          display_label: 'Bin BIN-001',
          evidence_kind: 'WMS_CALLBACK_EVIDENCE',
          station_code: 'TARGET_ARM',
          position_code: 'SINGLE_LAYER_A',
          rack_code: 'RACK-001',
          bin_code: 'BIN-001'
        },
        {
          resource_kind: 'SLOT',
          resource_code: 'SLOT-A1',
          display_label: 'Slot SLOT-A1',
          evidence_kind: 'TRACE_RESOURCE_EVIDENCE',
          station_code: 'TARGET_ARM',
          position_code: 'SINGLE_LAYER_A',
          rack_code: 'RACK-001',
          bin_code: 'BIN-001',
          slot_code: 'SLOT-A1'
        },
        {
          resource_kind: 'CELL',
          resource_code: 'CELL-A1',
          display_label: 'Cell CELL-A1',
          evidence_kind: 'TRACE_RESOURCE_EVIDENCE',
          station_code: 'TARGET_ARM',
          position_code: 'SINGLE_LAYER_A',
          rack_code: 'RACK-001',
          bin_code: 'BIN-001'
        },
        {
          resource_kind: 'PKG',
          resource_code: 'PKG-001',
          display_label: 'PKG PKG-001',
          evidence_kind: 'WMS_CALLBACK_EVIDENCE',
          station_code: 'TARGET_ARM',
          position_code: 'SINGLE_LAYER_A',
          rack_code: 'RACK-001',
          bin_code: 'BIN-001',
          pkg_code: 'PKG-001'
        },
        {
          resource_kind: 'PART_SN',
          resource_code: 'PART-001',
          display_label: 'Part SN PART-001',
          evidence_kind: 'TRACE_RESOURCE_EVIDENCE',
          station_code: 'TARGET_ARM',
          position_code: 'SINGLE_LAYER_A',
          rack_code: 'RACK-001',
          bin_code: 'BIN-001',
          part_sn: 'PART-001'
        },
        {
          resource_kind: 'PKG',
          resource_code: 'PKG-UNLOCATED',
          display_label: 'PKG PKG-UNLOCATED',
          evidence_kind: 'GENERIC_EVIDENCE',
          source_trace_id: 'trace-unlocated'
        }
      ]
    }),
    manifest
  })

  expect(model.resourceEvidence).toHaveLength(7)
  expect(model.resourceEvidenceTotalCount).toBe(7)
  expect(model.resourceEvidenceTruncated).toBe(true)
  expect(model.unlocatedAuditItems.map(item => item.resourceCode)).toEqual(['PKG-UNLOCATED'])
  expect(model.positionGroups).toHaveLength(1)
  expect(model.positionGroups[0]).toEqual(
    expect.objectContaining({
      stationCode: 'TARGET_ARM',
      positionCode: 'SINGLE_LAYER_A',
      attentionState: 'waiting'
    })
  )
  expect(model.positionGroups[0]?.auditItems.map(item => item.resourceCode)).toEqual([
    'RACK-001',
    'BIN-001',
    'SLOT-A1',
    'CELL-A1',
    'PKG-001',
    'PART-001'
  ])

  const stack = model.positionGroups[0]?.resourceStacks[0]
  expect(stack?.key).toBe('rack:RACK-001')
  expect(stack?.anchor).toEqual({
    kind: 'RACK',
    code: 'RACK-001',
    displayLabel: 'Rack RACK-001'
  })
  expect(stack?.children.map(child => `${child.kind}:${child.code}`)).toEqual([
    'BIN:BIN-001',
    'SLOT:SLOT-A1',
    'CELL:CELL-A1',
    'PKG:PKG-001',
    'PART_SN:PART-001'
  ])
  expect(stack?.evidenceKinds).toEqual([
    'WES_ACTIVE_SNAPSHOT',
    'WMS_CALLBACK_EVIDENCE',
    'TRACE_RESOURCE_EVIDENCE'
  ])
})

it.each([
  ['WAITING_WMS', 'waiting'],
  ['TIMEOUT', 'blocked'],
  ['FAILED', 'blocked'],
  ['NONE', 'normal'],
  ['WMS_CALLBACK_RECEIVED', 'normal'],
  ['UNKNOWN', 'unknown']
] as const)('derives attentionState %s -> %s', (rackOperationWait, attentionState) => {
  const model = buildRuntimeSceneModel({
    detail: createDetail({ rack_operation_wait: rackOperationWait }),
    manifest
  })

  expect(model.positionGroups[0]?.attentionState).toBe(attentionState)
})

it('uses resource kind and resource code as a stack anchor when rack and bin are absent', () => {
  const model = buildRuntimeSceneModel({
    detail: createDetail({
      resource_evidence_items: [
        {
          resource_kind: 'CELL',
          resource_code: 'CELL-STANDALONE',
          display_label: 'Cell CELL-STANDALONE',
          evidence_kind: 'TRACE_RESOURCE_EVIDENCE',
          position_code: 'SINGLE_LAYER_A'
        }
      ]
    }),
    manifest
  })

  expect(model.positionGroups[0]?.resourceStacks[0]).toEqual(
    expect.objectContaining({
      key: 'resource:CELL:CELL-STANDALONE',
      anchor: {
        kind: 'CELL',
        code: 'CELL-STANDALONE',
        displayLabel: 'Cell CELL-STANDALONE'
      }
    })
  )
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```bash
pnpm test -- tests/unit/utils/runtime-scene.test.ts
```

Expected: FAIL with TypeScript or assertion errors for missing `positionGroups`, `unlocatedAuditItems`, `attentionState`, `anchor`, and `children`.

- [ ] **Step 3: Extend scene model types**

In `src/utils/runtime-scene.ts`, add these exported types after `RuntimeSceneResourceEvidence` and before `RuntimeSceneModel`:

```ts
export type RuntimeSceneAttentionState = 'blocked' | 'waiting' | 'normal' | 'unknown'

export interface RuntimeSceneResourceStackAnchor {
  kind: RuntimeResourceKind
  code: string
  displayLabel: string
}

export interface RuntimeSceneResourceStackChild {
  key: string
  kind: RuntimeResourceKind
  code: string
  displayLabel: string
  evidenceKind: RuntimeResourceEvidenceKind
}

export interface RuntimeSceneResourceStack {
  key: string
  anchor: RuntimeSceneResourceStackAnchor
  rackCode?: string | null
  binCode?: string | null
  children: RuntimeSceneResourceStackChild[]
  evidenceCount: number
  evidenceKinds: RuntimeResourceEvidenceKind[]
  auditItems: RuntimeSceneResourceEvidence[]
}

export interface RuntimeScenePositionGroup {
  key: string
  stationCode: string
  stationRole: string
  positionCode: string
  boundary: RuntimeSceneBoundary
  attentionState: RuntimeSceneAttentionState
  resourceStacks: RuntimeSceneResourceStack[]
  auditItems: RuntimeSceneResourceEvidence[]
}
```

Then add the new fields to `RuntimeSceneModel`:

```ts
  positionGroups: RuntimeScenePositionGroup[]
  unlocatedAuditItems: RuntimeSceneResourceEvidence[]
```

- [ ] **Step 4: Export the device node adapter**

Rename the existing private `toSceneDeviceNode` function to `toRuntimeSceneDeviceNode`, export it, and update the `buildRuntimeSceneModel` call site:

```ts
deviceNodes: detail.devices.map(toRuntimeSceneDeviceNode),
```

```ts
export function toRuntimeSceneDeviceNode(
  device: RuntimeWorklineDeviceItem
): RuntimeSceneDeviceNode {
  const deviceRole = normalizeRuntimeSceneDisplayRole(device.device_role)
  return {
    id: device.id,
    deviceCode: device.device_code,
    deviceName: normalizeRuntimeSceneDeviceName(device.device_name, device.device_role, deviceRole),
    deviceRole,
    roleIndex: device.role_index,
    status: device.device_status,
    maintenanceMode: device.maintenance_mode,
    currentCommandId: device.current_command_id,
    openCommandCount: device.open_command_count ?? device.pending_command_count ?? 0,
    blockedOutboxCount: device.blocked_outbox_count ?? 0,
    runtimeHoldCount: device.active_runtime_hold_ids?.length || device.open_issue_count || 0,
    errorCode: device.error_code
  }
}
```

- [ ] **Step 5: Add grouping helpers**

Add these helpers below `toSceneResourceEvidence`:

```ts
function derivePositionAttentionState(boundary: RuntimeSceneBoundary): RuntimeSceneAttentionState {
  if (boundary.rackOperationWait === 'WAITING_WMS') return 'waiting'
  if (boundary.rackOperationWait === 'TIMEOUT' || boundary.rackOperationWait === 'FAILED') {
    return 'blocked'
  }
  if (
    boundary.rackOperationWait === 'NONE' ||
    boundary.rackOperationWait === 'WMS_CALLBACK_RECEIVED'
  ) {
    return 'normal'
  }
  return 'unknown'
}

function getResourceStackKey(item: RuntimeSceneResourceEvidence): string {
  if (item.rackCode) return `rack:${item.rackCode}`
  if (item.binCode) return `bin:${item.binCode}`
  return `resource:${item.resourceKind}:${item.resourceCode}`
}

function getResourceStackAnchor(
  item: RuntimeSceneResourceEvidence
): RuntimeSceneResourceStackAnchor {
  if (item.rackCode) {
    return {
      kind: 'RACK',
      code: item.rackCode,
      displayLabel:
        item.resourceKind === 'RACK' && item.resourceCode === item.rackCode
          ? item.displayLabel
          : `Rack ${item.rackCode}`
    }
  }

  if (item.binCode) {
    return {
      kind: 'BIN',
      code: item.binCode,
      displayLabel:
        item.resourceKind === 'BIN' && item.resourceCode === item.binCode
          ? item.displayLabel
          : `Bin ${item.binCode}`
    }
  }

  return {
    kind: item.resourceKind,
    code: item.resourceCode,
    displayLabel: item.displayLabel || `${item.resourceKind} ${item.resourceCode}`
  }
}

function toResourceStackChild(item: RuntimeSceneResourceEvidence): RuntimeSceneResourceStackChild {
  return {
    key: getRuntimeSceneEvidenceKey(item),
    kind: item.resourceKind,
    code: item.resourceCode,
    displayLabel: item.displayLabel || `${item.resourceKind} ${item.resourceCode}`,
    evidenceKind: item.evidenceKind
  }
}

function appendUniqueEvidenceKind(
  target: RuntimeResourceEvidenceKind[],
  kind: RuntimeResourceEvidenceKind
) {
  if (!target.includes(kind)) target.push(kind)
}

function buildResourceStacks(items: RuntimeSceneResourceEvidence[]): RuntimeSceneResourceStack[] {
  const stacks = new Map<string, RuntimeSceneResourceStack>()

  for (const item of items) {
    const key = getResourceStackKey(item)
    const existing = stacks.get(key)
    if (!existing) {
      const stack: RuntimeSceneResourceStack = {
        key,
        anchor: getResourceStackAnchor(item),
        rackCode: item.rackCode,
        binCode: item.binCode,
        children: [],
        evidenceCount: 1,
        evidenceKinds: [item.evidenceKind],
        auditItems: [item]
      }
      if (item.resourceKind !== stack.anchor.kind || item.resourceCode !== stack.anchor.code) {
        stack.children.push(toResourceStackChild(item))
      }
      stacks.set(key, stack)
      continue
    }

    existing.evidenceCount += 1
    existing.auditItems.push(item)
    appendUniqueEvidenceKind(existing.evidenceKinds, item.evidenceKind)
    if (item.resourceKind !== existing.anchor.kind || item.resourceCode !== existing.anchor.code) {
      existing.children.push(toResourceStackChild(item))
    }
  }

  return Array.from(stacks.values())
}

function buildPositionGroups(
  boundaries: RuntimeSceneBoundary[],
  resourceEvidence: RuntimeSceneResourceEvidence[]
): RuntimeScenePositionGroup[] {
  const itemsByPosition = new Map<string, RuntimeSceneResourceEvidence[]>()
  for (const item of resourceEvidence) {
    if (!item.positionCode) continue
    const items = itemsByPosition.get(item.positionCode) ?? []
    items.push(item)
    itemsByPosition.set(item.positionCode, items)
  }

  return boundaries.map(boundary => {
    const auditItems = itemsByPosition.get(boundary.positionCode) ?? []
    return {
      key: boundary.key,
      stationCode: boundary.stationCode,
      stationRole: boundary.stationRole,
      positionCode: boundary.positionCode,
      boundary,
      attentionState: derivePositionAttentionState(boundary),
      resourceStacks: buildResourceStacks(auditItems),
      auditItems
    }
  })
}
```

- [ ] **Step 6: Return grouped fields from the adapter**

Inside `buildRuntimeSceneModel`, compute and return the grouped fields:

```ts
const positionGroups = buildPositionGroups(boundaries, resourceEvidence)
const unlocatedAuditItems = resourceEvidence.filter(item => !item.positionCode)
```

Add to the returned object:

```ts
    positionGroups,
    unlocatedAuditItems,
```

- [ ] **Step 7: Run adapter tests**

Run:

```bash
pnpm test -- tests/unit/utils/runtime-scene.test.ts
```

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/utils/runtime-scene.ts tests/unit/utils/runtime-scene.test.ts
git commit -m "feat(runtime): group scene resource evidence"
```

## Task 2: Shared RuntimeSceneDeviceFlow

**Files:**

- Create: `src/components/runtime/shared/RuntimeSceneDeviceFlow.vue`
- Create: `tests/unit/components/runtime/runtimeSceneDeviceFlow.test.ts`
- Delete: `tests/unit/components/runtime/worklineRouteMap.test.ts`

- [ ] **Step 1: Write failing shared device flow tests**

Create `tests/unit/components/runtime/runtimeSceneDeviceFlow.test.ts`:

```ts
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import RuntimeSceneDeviceFlow from '@/components/runtime/shared/RuntimeSceneDeviceFlow.vue'
import type { RuntimeSceneDeviceNode } from '@/utils/runtime-scene'

function createNode(overrides: Partial<RuntimeSceneDeviceNode> = {}): RuntimeSceneDeviceNode {
  return {
    id: 101,
    deviceCode: 'ARM03',
    deviceName: '三号机械臂',
    deviceRole: 'ARM',
    roleIndex: 3,
    status: 'IDLE',
    maintenanceMode: false,
    currentCommandId: null,
    openCommandCount: 0,
    blockedOutboxCount: 0,
    runtimeHoldCount: 0,
    errorCode: null,
    ...overrides
  }
}

describe('RuntimeSceneDeviceFlow', () => {
  it('separates unfinished commands, runtime holds, and parked outboxes', () => {
    const wrapper = mount(RuntimeSceneDeviceFlow, {
      props: {
        devices: [
          createNode({
            openCommandCount: 2,
            blockedOutboxCount: 1,
            runtimeHoldCount: 1
          })
        ]
      },
      global: {
        stubs: {
          RuntimeStatusBadge: true
        }
      }
    })

    expect(wrapper.text()).toContain('2 未完成命令')
    expect(wrapper.text()).toContain('Runtime Hold 1')
    expect(wrapper.text()).toContain('1 已停靠')
    expect(wrapper.text()).not.toContain('待处理')
  })

  it('preserves selected, traced, dimmed, and blocking states', () => {
    const wrapper = mount(RuntimeSceneDeviceFlow, {
      props: {
        devices: [createNode({ id: 101 }), createNode({ id: 102, deviceCode: 'PLC01' })],
        selectedDeviceId: 101,
        tracePathNodes: [
          {
            device_id: 101,
            device_code: 'ARM03',
            device_name: '三号机械臂',
            actions: []
          }
        ],
        blockingDeviceId: 102
      },
      global: {
        stubs: {
          RuntimeStatusBadge: true
        }
      }
    })

    const nodes = wrapper.findAll('[data-test="runtime-scene-device"]')
    expect(nodes[0]?.classes()).toContain('is-selected')
    expect(nodes[0]?.classes()).toContain('is-traced')
    expect(nodes[1]?.classes()).toContain('is-dimmed')
    expect(nodes[1]?.classes()).toContain('is-blocking')
  })

  it('emits select, sendEvent, and showContextMenu', async () => {
    const wrapper = mount(RuntimeSceneDeviceFlow, {
      props: {
        devices: [createNode()]
      },
      global: {
        stubs: {
          RuntimeStatusBadge: true
        }
      }
    })
    const device = wrapper.get('[data-test="runtime-scene-device"]')

    await device.trigger('click')
    await device.trigger('dblclick')
    await device.trigger('contextmenu', { clientX: 10, clientY: 20 })

    expect(wrapper.emitted('select')).toEqual([[101], [101]])
    expect(wrapper.emitted('sendEvent')).toEqual([[101]])
    expect(wrapper.emitted('showContextMenu')).toEqual([[{ deviceId: 101, x: 10, y: 20 }]])
  })

  it('uses session counts without treating parked outboxes as unfinished commands', () => {
    const wrapper = mount(RuntimeSceneDeviceFlow, {
      props: {
        devices: [createNode({ openCommandCount: 0, blockedOutboxCount: 1 })],
        sessionCountsByDevice: new Map([[101, 3]])
      },
      global: {
        stubs: {
          RuntimeStatusBadge: true
        }
      }
    })

    expect(wrapper.text()).toContain('3条等待')
    expect(wrapper.text()).toContain('1 已停靠')
    expect(wrapper.text()).not.toContain('未完成命令')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```bash
pnpm test -- tests/unit/components/runtime/runtimeSceneDeviceFlow.test.ts
```

Expected: FAIL because `RuntimeSceneDeviceFlow.vue` does not exist.

- [ ] **Step 3: Create the component**

Create `src/components/runtime/shared/RuntimeSceneDeviceFlow.vue`:

```vue
<template>
  <div
    class="runtime-scene-device-flow"
    :class="{ 'is-compact': compact }"
    data-test="runtime-scene-device-flow"
  >
    <template
      v-for="(device, index) in devices"
      :key="device.id"
    >
      <button
        type="button"
        class="runtime-scene-device-flow__node"
        :class="[
          statusClass(device.status),
          {
            'is-selected': selectedDeviceId === device.id,
            'is-traced': tracePathNodes.length > 0 && isTraced(device.id),
            'is-blocking': isBlocking(device.id),
            'has-runtime-hold': hasRuntimeHold(device),
            'has-parked-outbox': device.blockedOutboxCount > 0,
            'is-dimmed': tracePathNodes.length > 0 && !isTraced(device.id)
          }
        ]"
        data-test="runtime-scene-device"
        @click="emit('select', device.id)"
        @dblclick="emit('sendEvent', device.id)"
        @contextmenu.prevent="handleContextMenu($event, device.id)"
      >
        <div class="runtime-scene-device-flow__node-top">
          <RuntimeStatusBadge
            :status="device.status"
            size="small"
          />
          <span class="runtime-scene-device-flow__role">
            {{ device.deviceRole }} · #{{ device.roleIndex }}
          </span>
          <span
            v-if="device.maintenanceMode"
            class="runtime-scene-device-flow__maintenance"
          >
            维护
          </span>
        </div>
        <div class="runtime-scene-device-flow__name">{{ device.deviceName }}</div>
        <div class="runtime-scene-device-flow__code">{{ device.deviceCode }}</div>
        <div
          class="runtime-scene-device-flow__signal"
          :class="signalClass(device)"
          data-test="runtime-scene-device-signal"
        >
          {{ signalText(device) }}
        </div>
        <div
          v-if="device.openCommandCount > 0"
          class="runtime-scene-device-flow__badge"
          data-test="runtime-scene-device-open-command"
        >
          {{ device.openCommandCount }} 未完成命令
        </div>
        <div
          v-if="hasRuntimeHold(device)"
          class="runtime-scene-device-flow__badge is-danger"
          data-test="runtime-scene-device-runtime-hold"
        >
          Runtime Hold {{ device.runtimeHoldCount }}
        </div>
        <div
          v-if="device.blockedOutboxCount > 0"
          class="runtime-scene-device-flow__badge is-warning"
          data-test="runtime-scene-device-parked-outbox"
        >
          {{ device.blockedOutboxCount }} 已停靠
        </div>
        <div
          v-if="isTraced(device.id) && traceActionsFor(device.id).length"
          class="runtime-scene-device-flow__trace-actions"
        >
          <span
            v-for="(action, idx) in traceActionsFor(device.id).slice(0, 3)"
            :key="idx"
            class="runtime-scene-device-flow__trace-action"
          >
            {{ action.label }}
          </span>
          <span
            v-if="traceActionsFor(device.id).length > 3"
            class="runtime-scene-device-flow__trace-more"
          >
            +{{ traceActionsFor(device.id).length - 3 }}
          </span>
        </div>
        <div
          v-if="isBlocking(device.id)"
          class="runtime-scene-device-flow__badge is-danger"
        >
          BLOCKED
        </div>
      </button>
      <div
        v-if="index < devices.length - 1"
        class="runtime-scene-device-flow__edge"
      >
        <span class="runtime-scene-device-flow__edge-line" />
        <span class="runtime-scene-device-flow__edge-arrow">-&gt;</span>
      </div>
    </template>

    <div
      v-if="!devices.length"
      class="runtime-scene-device-flow__empty"
    >
      暂无设备拓扑数据
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import RuntimeStatusBadge from '@/components/common/runtime/RuntimeStatusBadge.vue'
import type { RuntimeTraceDeviceAction, RuntimeTraceDevicePathNode } from '@/types/runtime'
import { resolveRuntimeTone } from '@/utils/runtime-display'
import type { RuntimeSceneDeviceNode } from '@/utils/runtime-scene'

const props = withDefaults(
  defineProps<{
    devices?: RuntimeSceneDeviceNode[]
    selectedDeviceId?: number | null
    sessionCountsByDevice?: Map<number, number> | Record<number, number>
    tracePathNodes?: RuntimeTraceDevicePathNode[]
    blockingDeviceId?: number | null
    compact?: boolean
  }>(),
  {
    devices: () => [],
    selectedDeviceId: null,
    sessionCountsByDevice: undefined,
    tracePathNodes: () => [],
    blockingDeviceId: null,
    compact: false
  }
)

const emit = defineEmits<{
  select: [deviceId: number]
  sendEvent: [deviceId: number]
  showContextMenu: [payload: { deviceId: number; x: number; y: number }]
}>()

const tracedDeviceIds = computed(() => new Set(props.tracePathNodes.map(node => node.device_id)))

function isTraced(deviceId: number): boolean {
  return tracedDeviceIds.value.has(deviceId)
}

function isBlocking(deviceId: number): boolean {
  return props.blockingDeviceId === deviceId
}

function hasRuntimeHold(device: RuntimeSceneDeviceNode): boolean {
  return device.runtimeHoldCount > 0
}

function traceNodeFor(deviceId: number): RuntimeTraceDevicePathNode | undefined {
  return props.tracePathNodes.find(node => node.device_id === deviceId)
}

function traceActionsFor(deviceId: number): RuntimeTraceDeviceAction[] {
  return traceNodeFor(deviceId)?.actions ?? []
}

function getSessionCount(deviceId: number): number {
  const map = props.sessionCountsByDevice
  if (!map) return 0
  if (map instanceof Map) return map.get(deviceId) ?? 0
  return map[deviceId] ?? 0
}

function signalText(device: RuntimeSceneDeviceNode): string {
  if (device.errorCode) return `ERROR: ${device.errorCode}`
  if (hasRuntimeHold(device)) return '异常待处置'
  if (device.blockedOutboxCount > 0) return '等待设备空闲'
  const sessionCount = getSessionCount(device.id)
  if (sessionCount > 0) return `${sessionCount}条等待`
  if (device.currentCommandId) return '执行中'
  return '空闲'
}

function signalClass(device: RuntimeSceneDeviceNode): string {
  if (device.errorCode) return 'is-danger'
  if (hasRuntimeHold(device)) return 'is-danger'
  if (device.blockedOutboxCount > 0) return 'is-warning'
  const sessionCount = getSessionCount(device.id)
  if (sessionCount > 0) return 'is-warning'
  if (device.currentCommandId) return 'is-primary'
  return 'is-idle'
}

function statusClass(status: string): string {
  return `is-${resolveRuntimeTone(status)}`
}

function handleContextMenu(event: MouseEvent, deviceId: number) {
  emit('select', deviceId)
  emit('showContextMenu', { deviceId, x: event.clientX, y: event.clientY })
}
</script>

<style scoped>
.runtime-scene-device-flow {
  display: flex;
  min-width: 0;
  align-items: stretch;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 6px;
}

.runtime-scene-device-flow__node {
  flex: 0 0 220px;
  min-width: 0;
  min-height: 116px;
  padding: 14px;
  border: 1px solid rgb(245 158 11 / 0.18);
  border-radius: 8px;
  background: var(--runtime-surface);
  color: var(--runtime-text);
  text-align: left;
  cursor: pointer;
}

.runtime-scene-device-flow__node.is-selected {
  border-color: rgb(245 158 11 / 0.68);
}

.runtime-scene-device-flow__node.is-blocking,
.runtime-scene-device-flow__node.has-runtime-hold {
  border-color: rgb(239 68 68 / 0.72);
}

.runtime-scene-device-flow__node.is-dimmed {
  opacity: 0.46;
}

.runtime-scene-device-flow__node-top,
.runtime-scene-device-flow__edge {
  display: flex;
  align-items: center;
  gap: 8px;
}

.runtime-scene-device-flow__role,
.runtime-scene-device-flow__maintenance,
.runtime-scene-device-flow__signal,
.runtime-scene-device-flow__badge,
.runtime-scene-device-flow__trace-action,
.runtime-scene-device-flow__trace-more {
  font-size: 12px;
}

.runtime-scene-device-flow__name,
.runtime-scene-device-flow__code,
.runtime-scene-device-flow__signal,
.runtime-scene-device-flow__badge {
  overflow-wrap: anywhere;
}

.runtime-scene-device-flow__name {
  margin-top: 10px;
  font-weight: 700;
}

.runtime-scene-device-flow__code {
  margin-top: 4px;
  color: var(--runtime-text-muted);
  font-family: 'JetBrains Mono', monospace;
}

.runtime-scene-device-flow__signal {
  margin-top: 10px;
  color: var(--runtime-text-muted);
}

.runtime-scene-device-flow__signal.is-danger,
.runtime-scene-device-flow__badge.is-danger {
  color: rgb(248 113 113);
}

.runtime-scene-device-flow__signal.is-warning,
.runtime-scene-device-flow__badge.is-warning {
  color: rgb(251 191 36);
}

.runtime-scene-device-flow__badge,
.runtime-scene-device-flow__trace-actions {
  margin-top: 8px;
}

.runtime-scene-device-flow__edge {
  flex: 0 0 28px;
  justify-content: center;
  color: var(--runtime-text-muted);
}

.runtime-scene-device-flow__edge-line {
  width: 18px;
  height: 1px;
  background: rgb(148 163 184 / 0.36);
}

.runtime-scene-device-flow__empty {
  color: var(--runtime-text-muted);
}
</style>
```

- [ ] **Step 4: Remove the old test file**

Delete `tests/unit/components/runtime/worklineRouteMap.test.ts`.

- [ ] **Step 5: Run shared device flow tests**

Run:

```bash
pnpm test -- tests/unit/components/runtime/runtimeSceneDeviceFlow.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/runtime/shared/RuntimeSceneDeviceFlow.vue tests/unit/components/runtime/runtimeSceneDeviceFlow.test.ts tests/unit/components/runtime/worklineRouteMap.test.ts
git commit -m "feat(runtime): add shared scene device flow"
```

## Task 3: Position, Resource, Focus, and Evidence Components

**Files:**

- Create: `src/components/runtime/monitor/RuntimeScenePositionGroup.vue`
- Create: `src/components/runtime/monitor/RuntimeSceneResourceStack.vue`
- Create: `src/components/runtime/monitor/RuntimeSceneEvidencePanel.vue`
- Create: `src/components/runtime/monitor/RuntimeSceneFocusPanel.vue`
- Test: `tests/unit/components/runtime/runtimeSceneFocusPanel.test.ts`

- [ ] **Step 1: Write failing focus panel tests**

Create `tests/unit/components/runtime/runtimeSceneFocusPanel.test.ts`:

```ts
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import RuntimeSceneFocusPanel from '@/components/runtime/monitor/RuntimeSceneFocusPanel.vue'
import type { RuntimeScenePositionGroup, RuntimeSceneResourceStack } from '@/utils/runtime-scene'

function createGroup(): RuntimeScenePositionGroup {
  const auditItem = {
    resourceKind: 'RACK' as const,
    resourceKindLabel: 'Rack',
    resourceCode: 'RACK-001',
    displayLabel: 'Rack RACK-001',
    evidenceKind: 'WES_ACTIVE_SNAPSHOT' as const,
    evidenceKindLabel: 'WES active snapshot evidence',
    stationCode: 'TARGET_ARM',
    positionCode: 'SINGLE_LAYER_A',
    rackCode: 'RACK-001',
    sourceSessionId: 20,
    sourceTraceId: 'trace-20',
    occurredAt: '2026-06-08T00:00:00Z'
  }

  return {
    key: 'TARGET_ARM:TARGET_ARM:SINGLE_LAYER_A:SINGLE_LAYER:ACTIVE_BIN_RACK:POSITION:SORTING_TARGET:RACK_MOVE',
    stationCode: 'TARGET_ARM',
    stationRole: 'TARGET',
    positionCode: 'SINGLE_LAYER_A',
    attentionState: 'waiting',
    boundary: {
      key: 'TARGET_ARM:TARGET_ARM:SINGLE_LAYER_A:SINGLE_LAYER:ACTIVE_BIN_RACK:POSITION:SORTING_TARGET:RACK_MOVE',
      stationRole: 'TARGET',
      stationCode: 'TARGET_ARM',
      positionCode: 'SINGLE_LAYER_A',
      rackKind: 'SINGLE_LAYER',
      snapshotKind: 'ACTIVE_BIN_RACK',
      stationLease: 'ACTIVE_DISPATCH_LEASE',
      stationLeaseLabel: 'Station lease：调度租约占用',
      rackSnapshot: 'ACTIVE',
      rackSnapshotLabel: '执行快照：当前执行货架',
      rackOperationWait: 'WAITING_WMS',
      rackOperationWaitLabel: 'Rack operation：等待 WMS 搬运到位',
      resourceEvidenceKind: 'WMS_CALLBACK_EVIDENCE',
      resourceEvidenceKindLabel: 'WMS 回调证据',
      evidenceCount: 1
    },
    auditItems: [auditItem],
    resourceStacks: [
      {
        key: 'rack:RACK-001',
        anchor: { kind: 'RACK', code: 'RACK-001', displayLabel: 'Rack RACK-001' },
        rackCode: 'RACK-001',
        binCode: null,
        children: [
          {
            key: 'child-bin',
            kind: 'BIN',
            code: 'BIN-001',
            displayLabel: 'Bin BIN-001',
            evidenceKind: 'WMS_CALLBACK_EVIDENCE'
          }
        ],
        evidenceCount: 1,
        evidenceKinds: ['WES_ACTIVE_SNAPSHOT'],
        auditItems: [auditItem]
      }
    ]
  }
}

describe('RuntimeSceneFocusPanel', () => {
  it('renders selected position, selected stack, and evidence audit fields', () => {
    const group = createGroup()
    const stack = group.resourceStacks[0] as RuntimeSceneResourceStack
    const wrapper = mount(RuntimeSceneFocusPanel, {
      props: {
        group,
        stack,
        resourceEvidenceTruncated: true,
        resourceEvidenceVisibleCount: 1,
        resourceEvidenceTotalCount: 7
      }
    })

    expect(wrapper.text()).toContain('TARGET_ARM')
    expect(wrapper.text()).toContain('SINGLE_LAYER_A')
    expect(wrapper.text()).toContain('Rack operation：等待 WMS 搬运到位')
    expect(wrapper.text()).toContain('RACK-001')
    expect(wrapper.text()).toContain('BIN-001')
    expect(wrapper.text()).toContain('trace-20')
    expect(wrapper.text()).toContain('20')
    expect(wrapper.text()).toContain('仅展示前 1 条证据 / 共 7 条')
  })

  it('renders an empty state when no position is selected', () => {
    const wrapper = mount(RuntimeSceneFocusPanel, {
      props: {
        group: null,
        stack: null,
        resourceEvidenceTruncated: false,
        resourceEvidenceVisibleCount: 0,
        resourceEvidenceTotalCount: 0
      }
    })

    expect(wrapper.get('[data-test="runtime-scene-focus-empty"]').text()).toContain(
      '请选择现场位置'
    )
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
pnpm test -- tests/unit/components/runtime/runtimeSceneFocusPanel.test.ts
```

Expected: FAIL because the focus/evidence components do not exist.

- [ ] **Step 3: Create `RuntimeSceneEvidencePanel.vue`**

Create `src/components/runtime/monitor/RuntimeSceneEvidencePanel.vue`:

```vue
<template>
  <section
    class="runtime-scene-evidence-panel"
    data-test="runtime-scene-evidence-panel"
  >
    <div
      v-if="resourceEvidenceTruncated"
      class="runtime-scene-evidence-panel__truncated"
      data-test="runtime-scene-evidence-truncated"
    >
      仅展示前 {{ resourceEvidenceVisibleCount }} 条证据 / 共 {{ resourceEvidenceTotalCount }} 条
    </div>

    <div
      v-if="items.length"
      class="runtime-scene-evidence-panel__list"
    >
      <article
        v-for="item in items"
        :key="getRuntimeSceneEvidenceKey(item)"
        class="runtime-scene-evidence-panel__item"
        data-test="runtime-scene-evidence-row"
      >
        <div class="runtime-scene-evidence-panel__main">
          <strong>{{ item.resourceKindLabel }} {{ item.resourceCode }}</strong>
          <span>{{ item.evidenceKindLabel }}</span>
        </div>
        <dl class="runtime-scene-evidence-panel__facts">
          <div v-if="item.positionCode">
            <dt>Position</dt>
            <dd>{{ item.positionCode }}</dd>
          </div>
          <div v-if="item.rackCode">
            <dt>Rack</dt>
            <dd>{{ item.rackCode }}</dd>
          </div>
          <div v-if="item.binCode">
            <dt>Bin</dt>
            <dd>{{ item.binCode }}</dd>
          </div>
          <div v-if="item.slotCode">
            <dt>Slot</dt>
            <dd>{{ item.slotCode }}</dd>
          </div>
          <div v-if="item.pkgCode">
            <dt>PKG</dt>
            <dd>{{ item.pkgCode }}</dd>
          </div>
          <div v-if="item.partSn">
            <dt>Part SN</dt>
            <dd>{{ item.partSn }}</dd>
          </div>
          <div v-if="item.sourceTraceId">
            <dt>Trace</dt>
            <dd>{{ item.sourceTraceId }}</dd>
          </div>
          <div v-if="item.sourceSessionId">
            <dt>Session</dt>
            <dd>{{ item.sourceSessionId }}</dd>
          </div>
          <div v-if="item.occurredAt">
            <dt>Time</dt>
            <dd>{{ item.occurredAt }}</dd>
          </div>
        </dl>
      </article>
    </div>

    <div
      v-else
      class="runtime-scene-evidence-panel__empty"
    >
      暂无审计证据
    </div>
  </section>
</template>

<script setup lang="ts">
import {
  getRuntimeSceneEvidenceKey,
  type RuntimeSceneResourceEvidence
} from '@/utils/runtime-scene'

defineProps<{
  items: RuntimeSceneResourceEvidence[]
  resourceEvidenceTruncated: boolean
  resourceEvidenceVisibleCount: number
  resourceEvidenceTotalCount: number
}>()
</script>

<style scoped>
.runtime-scene-evidence-panel {
  min-width: 0;
}

.runtime-scene-evidence-panel__truncated,
.runtime-scene-evidence-panel__item {
  border: 1px solid rgb(245 158 11 / 0.16);
  border-radius: 8px;
  background: rgb(15 23 42 / 0.72);
}

.runtime-scene-evidence-panel__truncated {
  margin-bottom: 10px;
  padding: 8px 10px;
  color: rgb(251 191 36);
  font-size: 12px;
}

.runtime-scene-evidence-panel__list {
  display: grid;
  gap: 10px;
}

.runtime-scene-evidence-panel__item {
  padding: 12px;
}

.runtime-scene-evidence-panel__main {
  display: flex;
  min-width: 0;
  flex-wrap: wrap;
  gap: 8px;
}

.runtime-scene-evidence-panel__main strong,
.runtime-scene-evidence-panel__facts dd {
  overflow-wrap: anywhere;
  font-family: 'JetBrains Mono', monospace;
}

.runtime-scene-evidence-panel__main span,
.runtime-scene-evidence-panel__facts dt,
.runtime-scene-evidence-panel__empty {
  color: var(--runtime-text-muted);
}

.runtime-scene-evidence-panel__facts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 8px;
  margin: 10px 0 0;
}

.runtime-scene-evidence-panel__facts div {
  min-width: 0;
}

.runtime-scene-evidence-panel__facts dt,
.runtime-scene-evidence-panel__facts dd {
  margin: 0;
  font-size: 12px;
}
</style>
```

- [ ] **Step 4: Create `RuntimeSceneResourceStack.vue`**

Create `src/components/runtime/monitor/RuntimeSceneResourceStack.vue`:

```vue
<template>
  <button
    type="button"
    class="runtime-scene-resource-stack"
    :class="{ 'is-selected': selected }"
    data-test="runtime-scene-resource-stack"
    @click="emit('select')"
  >
    <div class="runtime-scene-resource-stack__top">
      <span>{{ stack.anchor.kind }}</span>
      <strong>{{ stack.anchor.code }}</strong>
    </div>
    <div class="runtime-scene-resource-stack__label">{{ stack.anchor.displayLabel }}</div>
    <div
      v-if="stack.children.length"
      class="runtime-scene-resource-stack__children"
    >
      <span
        v-for="child in stack.children"
        :key="child.key"
        class="runtime-scene-resource-stack__child"
      >
        {{ child.kind }} {{ child.code }}
      </span>
    </div>
    <div class="runtime-scene-resource-stack__meta">{{ stack.evidenceCount }} 条 evidence</div>
  </button>
</template>

<script setup lang="ts">
import type { RuntimeSceneResourceStack } from '@/utils/runtime-scene'

defineProps<{
  stack: RuntimeSceneResourceStack
  selected: boolean
}>()

const emit = defineEmits<{
  select: []
}>()
</script>

<style scoped>
.runtime-scene-resource-stack {
  width: 100%;
  min-width: 0;
  padding: 12px;
  border: 1px solid rgb(245 158 11 / 0.16);
  border-radius: 8px;
  background: rgb(15 23 42 / 0.72);
  color: var(--runtime-text);
  text-align: left;
  cursor: pointer;
}

.runtime-scene-resource-stack.is-selected {
  border-color: rgb(245 158 11 / 0.72);
}

.runtime-scene-resource-stack__top,
.runtime-scene-resource-stack__children {
  display: flex;
  min-width: 0;
  flex-wrap: wrap;
  gap: 8px;
}

.runtime-scene-resource-stack__top strong,
.runtime-scene-resource-stack__label,
.runtime-scene-resource-stack__child {
  overflow-wrap: anywhere;
  font-family: 'JetBrains Mono', monospace;
}

.runtime-scene-resource-stack__label,
.runtime-scene-resource-stack__meta {
  margin-top: 6px;
  color: var(--runtime-text-muted);
  font-size: 12px;
}

.runtime-scene-resource-stack__children {
  margin-top: 10px;
}

.runtime-scene-resource-stack__child {
  border: 1px solid rgb(148 163 184 / 0.24);
  border-radius: 6px;
  padding: 2px 6px;
  color: var(--runtime-text-muted);
  font-size: 11px;
}
</style>
```

- [ ] **Step 5: Create `RuntimeScenePositionGroup.vue`**

Create `src/components/runtime/monitor/RuntimeScenePositionGroup.vue`:

```vue
<template>
  <section
    class="runtime-scene-position-group"
    :class="[`is-${group.attentionState}`, { 'is-selected': selected }]"
    data-test="runtime-scene-position-group"
    @click="emit('selectPosition')"
  >
    <header class="runtime-scene-position-group__header">
      <div>
        <div class="runtime-scene-position-group__role">{{ group.stationRole }}</div>
        <strong>{{ group.stationCode }} / {{ group.positionCode }}</strong>
      </div>
      <span class="runtime-scene-position-group__state">{{ group.attentionState }}</span>
    </header>

    <dl class="runtime-scene-position-group__facts">
      <div>
        <dt>Station lease</dt>
        <dd data-test="runtime-scene-station-lease">{{ group.boundary.stationLeaseLabel }}</dd>
      </div>
      <div>
        <dt>Rack snapshot</dt>
        <dd data-test="runtime-scene-rack-snapshot">{{ group.boundary.rackSnapshotLabel }}</dd>
      </div>
      <div>
        <dt>Rack operation</dt>
        <dd data-test="runtime-scene-rack-operation">
          {{ group.boundary.rackOperationWaitLabel }}
        </dd>
      </div>
    </dl>

    <div class="runtime-scene-position-group__stacks">
      <RuntimeSceneResourceStack
        v-for="stack in group.resourceStacks"
        :key="stack.key"
        :stack="stack"
        :selected="selectedStackKey === stack.key"
        @select.stop="emit('selectStack', stack.key)"
      />
      <div
        v-if="!group.resourceStacks.length"
        class="runtime-scene-position-group__empty"
      >
        暂无挂载资源
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import RuntimeSceneResourceStack from '@/components/runtime/monitor/RuntimeSceneResourceStack.vue'
import type { RuntimeScenePositionGroup } from '@/utils/runtime-scene'

defineProps<{
  group: RuntimeScenePositionGroup
  selected: boolean
  selectedStackKey?: string | null
}>()

const emit = defineEmits<{
  selectPosition: []
  selectStack: [stackKey: string]
}>()
</script>

<style scoped>
.runtime-scene-position-group {
  min-width: 0;
  padding: 14px;
  border: 1px solid rgb(148 163 184 / 0.22);
  border-radius: 8px;
  background: rgb(2 6 23 / 0.62);
  color: var(--runtime-text);
  cursor: pointer;
}

.runtime-scene-position-group.is-selected {
  border-color: rgb(245 158 11 / 0.68);
}

.runtime-scene-position-group.is-blocked {
  border-color: rgb(239 68 68 / 0.72);
}

.runtime-scene-position-group.is-waiting {
  border-color: rgb(251 191 36 / 0.72);
}

.runtime-scene-position-group__header {
  display: flex;
  min-width: 0;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.runtime-scene-position-group__header strong,
.runtime-scene-position-group__facts dd {
  overflow-wrap: anywhere;
  font-family: 'JetBrains Mono', monospace;
}

.runtime-scene-position-group__role,
.runtime-scene-position-group__state,
.runtime-scene-position-group__facts dt,
.runtime-scene-position-group__empty {
  color: var(--runtime-text-muted);
  font-size: 12px;
}

.runtime-scene-position-group__facts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 10px;
  margin: 12px 0;
}

.runtime-scene-position-group__facts dt,
.runtime-scene-position-group__facts dd {
  margin: 0;
  font-size: 12px;
}

.runtime-scene-position-group__stacks {
  display: grid;
  gap: 10px;
}
</style>
```

- [ ] **Step 6: Create `RuntimeSceneFocusPanel.vue`**

Create `src/components/runtime/monitor/RuntimeSceneFocusPanel.vue`:

```vue
<template>
  <aside
    class="runtime-scene-focus-panel"
    data-test="runtime-scene-focus-panel"
  >
    <div
      v-if="!group"
      class="runtime-scene-focus-panel__empty"
      data-test="runtime-scene-focus-empty"
    >
      请选择现场位置
    </div>

    <template v-else>
      <header class="runtime-scene-focus-panel__header">
        <div>
          <span>{{ group.stationRole }}</span>
          <strong>{{ group.stationCode }} / {{ group.positionCode }}</strong>
        </div>
        <span class="runtime-scene-focus-panel__state">{{ group.attentionState }}</span>
      </header>

      <dl class="runtime-scene-focus-panel__facts">
        <div>
          <dt>Station lease</dt>
          <dd>{{ group.boundary.stationLeaseLabel }}</dd>
        </div>
        <div>
          <dt>Rack snapshot</dt>
          <dd>{{ group.boundary.rackSnapshotLabel }}</dd>
        </div>
        <div>
          <dt>Rack operation</dt>
          <dd>{{ group.boundary.rackOperationWaitLabel }}</dd>
        </div>
      </dl>

      <section
        v-if="stack"
        class="runtime-scene-focus-panel__stack"
      >
        <span>{{ stack.anchor.kind }}</span>
        <strong>{{ stack.anchor.code }}</strong>
        <p>{{ stack.anchor.displayLabel }}</p>
        <div
          v-if="stack.children.length"
          class="runtime-scene-focus-panel__children"
        >
          <span
            v-for="child in stack.children"
            :key="child.key"
          >
            {{ child.kind }} {{ child.code }}
          </span>
        </div>
      </section>

      <RuntimeSceneEvidencePanel
        :items="stack?.auditItems ?? group.auditItems"
        :resource-evidence-truncated="resourceEvidenceTruncated"
        :resource-evidence-visible-count="resourceEvidenceVisibleCount"
        :resource-evidence-total-count="resourceEvidenceTotalCount"
      />
    </template>
  </aside>
</template>

<script setup lang="ts">
import RuntimeSceneEvidencePanel from '@/components/runtime/monitor/RuntimeSceneEvidencePanel.vue'
import type { RuntimeScenePositionGroup, RuntimeSceneResourceStack } from '@/utils/runtime-scene'

defineProps<{
  group: RuntimeScenePositionGroup | null
  stack: RuntimeSceneResourceStack | null
  resourceEvidenceTruncated: boolean
  resourceEvidenceVisibleCount: number
  resourceEvidenceTotalCount: number
}>()
</script>

<style scoped>
.runtime-scene-focus-panel {
  min-width: 0;
  padding: 14px;
  border: 1px solid rgb(245 158 11 / 0.18);
  border-radius: 8px;
  background: rgb(2 6 23 / 0.74);
  color: var(--runtime-text);
}

.runtime-scene-focus-panel__header {
  display: flex;
  min-width: 0;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.runtime-scene-focus-panel__header strong,
.runtime-scene-focus-panel__facts dd,
.runtime-scene-focus-panel__stack strong,
.runtime-scene-focus-panel__stack p,
.runtime-scene-focus-panel__children span {
  overflow-wrap: anywhere;
  font-family: 'JetBrains Mono', monospace;
}

.runtime-scene-focus-panel__header span,
.runtime-scene-focus-panel__state,
.runtime-scene-focus-panel__facts dt,
.runtime-scene-focus-panel__empty {
  color: var(--runtime-text-muted);
  font-size: 12px;
}

.runtime-scene-focus-panel__facts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 10px;
  margin: 12px 0;
}

.runtime-scene-focus-panel__facts dt,
.runtime-scene-focus-panel__facts dd {
  margin: 0;
  font-size: 12px;
}

.runtime-scene-focus-panel__stack {
  margin-bottom: 12px;
  padding: 12px;
  border: 1px solid rgb(148 163 184 / 0.2);
  border-radius: 8px;
}

.runtime-scene-focus-panel__children {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}
</style>
```

- [ ] **Step 7: Run focus panel tests**

Run:

```bash
pnpm test -- tests/unit/components/runtime/runtimeSceneFocusPanel.test.ts
```

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/components/runtime/monitor/RuntimeScenePositionGroup.vue src/components/runtime/monitor/RuntimeSceneResourceStack.vue src/components/runtime/monitor/RuntimeSceneEvidencePanel.vue src/components/runtime/monitor/RuntimeSceneFocusPanel.vue tests/unit/components/runtime/runtimeSceneFocusPanel.test.ts
git commit -m "feat(runtime): add scene resource focus components"
```

## Task 4: RuntimeSceneMap Integration

**Files:**

- Modify: `src/components/runtime/monitor/RuntimeSceneMap.vue`
- Modify: `tests/unit/components/runtime/runtimeSceneMap.test.ts`
- Modify: `src/components/runtime/monitor/WorklineLiveOverview.vue`
- Modify: `tests/unit/components/runtime/worklineLiveOverview.test.ts`

- [ ] **Step 1: Update map tests for grouped UI**

In `tests/unit/components/runtime/runtimeSceneMap.test.ts`, update `createSceneModel()` so the returned model includes `positionGroups` and `unlocatedAuditItems`. Use this object shape:

```ts
    positionGroups: [
      {
        key: 'SINGLE_LAYER_A',
        stationRole: 'TARGET',
        stationCode: 'TARGET_ARM',
        positionCode: 'SINGLE_LAYER_A',
        boundary: {
          key: 'SINGLE_LAYER_A',
          stationRole: 'TARGET',
          stationCode: 'TARGET_ARM',
          positionCode: 'SINGLE_LAYER_A',
          rackKind: 'SINGLE_LAYER',
          snapshotKind: 'ACTIVE_BIN_RACK',
          stationLease: 'ACTIVE_DISPATCH_LEASE',
          stationLeaseLabel: 'Station lease：调度租约占用',
          rackSnapshot: 'ACTIVE',
          rackSnapshotLabel: '执行快照：当前执行货架',
          rackOperationWait: 'WAITING_WMS',
          rackOperationWaitLabel: 'Rack operation：等待 WMS 搬运到位',
          resourceEvidenceKind: 'WMS_CALLBACK_EVIDENCE',
          resourceEvidenceKindLabel: 'WMS 回调证据',
          evidenceCount: 2
        },
        attentionState: 'waiting',
        auditItems: [
          {
            resourceKind: 'RACK',
            resourceKindLabel: 'Rack',
            resourceCode: 'RACK-001',
            displayLabel: 'RACK RACK-001',
            evidenceKind: 'WES_ACTIVE_SNAPSHOT',
            evidenceKindLabel: 'WES active snapshot evidence',
            positionCode: 'SINGLE_LAYER_A',
            rackCode: 'RACK-001'
          }
        ],
        resourceStacks: [
          {
            key: 'rack:RACK-001',
            anchor: { kind: 'RACK', code: 'RACK-001', displayLabel: 'RACK RACK-001' },
            rackCode: 'RACK-001',
            binCode: 'BIN-001',
            children: [
              {
                key: 'child-bin',
                kind: 'BIN',
                code: 'BIN-001',
                displayLabel: 'BIN BIN-001',
                evidenceKind: 'WMS_CALLBACK_EVIDENCE'
              }
            ],
            evidenceCount: 2,
            evidenceKinds: ['WES_ACTIVE_SNAPSHOT', 'WMS_CALLBACK_EVIDENCE'],
            auditItems: [
              {
                resourceKind: 'RACK',
                resourceKindLabel: 'Rack',
                resourceCode: 'RACK-001',
                displayLabel: 'RACK RACK-001',
                evidenceKind: 'WES_ACTIVE_SNAPSHOT',
                evidenceKindLabel: 'WES active snapshot evidence',
                positionCode: 'SINGLE_LAYER_A',
                rackCode: 'RACK-001',
                sourceTraceId: 'trace-20'
              }
            ]
          }
        ]
      }
    ],
    unlocatedAuditItems: [
      {
        resourceKind: 'PKG',
        resourceKindLabel: 'PKG',
        resourceCode: 'PKG-UNLOCATED',
        displayLabel: 'PKG PKG-UNLOCATED',
        evidenceKind: 'GENERIC_EVIDENCE',
        evidenceKindLabel: '通用 evidence',
        sourceTraceId: 'trace-unlocated'
      }
    ],
```

Replace the old item-level evidence rendering test with these assertions:

```ts
it('renders grouped position stacks, focus panel, and global unlocated audit', async () => {
  const wrapper = mount(RuntimeSceneMap, {
    props: {
      model: createSceneModel()
    },
    global: {
      stubs: {
        RuntimeStatusBadge: true
      }
    }
  })

  expect(wrapper.findAll('[data-test="runtime-scene-evidence-item"]')).toHaveLength(0)
  expect(wrapper.get('[data-test="runtime-scene-position-group"]').text()).toContain(
    'SINGLE_LAYER_A'
  )
  expect(wrapper.get('[data-test="runtime-scene-resource-stack"]').text()).toContain('RACK-001')
  expect(wrapper.get('[data-test="runtime-scene-focus-panel"]').text()).toContain('trace-20')
  expect(wrapper.get('[data-test="runtime-scene-unlocated-audit"]').text()).toContain(
    'PKG-UNLOCATED'
  )

  await wrapper.get('[data-test="runtime-scene-resource-stack"]').trigger('click')
  expect(wrapper.get('[data-test="runtime-scene-focus-panel"]').text()).toContain('BIN-001')
})
```

- [ ] **Step 2: Run map test to verify it fails**

Run:

```bash
pnpm test -- tests/unit/components/runtime/runtimeSceneMap.test.ts
```

Expected: FAIL because `RuntimeSceneMap` still renders flat evidence rows or does not render the new components.

- [ ] **Step 3: Replace the flat evidence grid in `RuntimeSceneMap.vue`**

In `src/components/runtime/monitor/RuntimeSceneMap.vue`, import new components:

```ts
import RuntimeSceneDeviceFlow from '@/components/runtime/shared/RuntimeSceneDeviceFlow.vue'
import RuntimeSceneEvidencePanel from '@/components/runtime/monitor/RuntimeSceneEvidencePanel.vue'
import RuntimeSceneFocusPanel from '@/components/runtime/monitor/RuntimeSceneFocusPanel.vue'
import RuntimeScenePositionGroup from '@/components/runtime/monitor/RuntimeScenePositionGroup.vue'
import type { RuntimeScenePositionGroup as PositionGroup } from '@/utils/runtime-scene'
```

Add state and selection helpers:

```ts
const selectedPositionKey = ref<string | null>(null)
const selectedStackKey = ref<string | null>(null)

const selectedGroup = computed(() => {
  return props.model.positionGroups.find(group => group.key === selectedPositionKey.value) ?? null
})

const selectedStack = computed(() => {
  const group = selectedGroup.value
  if (!group || !selectedStackKey.value) return null
  return group.resourceStacks.find(stack => stack.key === selectedStackKey.value) ?? null
})

watch(
  () => props.model.positionGroups,
  groups => {
    const existing = groups.find(group => group.key === selectedPositionKey.value)
    if (existing) return
    const next =
      groups.find(
        group => group.attentionState === 'blocked' || group.attentionState === 'waiting'
      ) ??
      groups.find(group => group.resourceStacks.length > 0) ??
      groups[0] ??
      null
    selectedPositionKey.value = next?.key ?? null
    selectedStackKey.value = next?.resourceStacks[0]?.key ?? null
  },
  { immediate: true }
)

function selectGroup(group: PositionGroup) {
  selectedPositionKey.value = group.key
  selectedStackKey.value = group.resourceStacks[0]?.key ?? null
}

function selectStack(group: PositionGroup, stackKey: string) {
  selectedPositionKey.value = group.key
  selectedStackKey.value = stackKey
}
```

Replace the old device lane and evidence grid with this structure:

```vue
    <RuntimeSceneDeviceFlow
      :devices="model.deviceNodes"
      :selected-device-id="selectedDeviceId"
      :session-counts-by-device="sessionCountsByDevice"
      :blocking-device-id="blockingDeviceId"
      @select="emit('selectDevice', $event)"
    />

    <div
      v-if="model.positionGroups.length"
      class="runtime-scene-map__layout"
    >
      <div class="runtime-scene-map__positions">
        <RuntimeScenePositionGroup
          v-for="group in model.positionGroups"
          :key="group.key"
          :group="group"
          :selected="selectedPositionKey === group.key"
          :selected-stack-key="selectedPositionKey === group.key ? selectedStackKey : null"
          @select-position="selectGroup(group)"
          @select-stack="selectStack(group, $event)"
        />
      </div>

      <RuntimeSceneFocusPanel
        :group="selectedGroup"
        :stack="selectedStack"
        :resource-evidence-truncated="model.resourceEvidenceTruncated"
        :resource-evidence-visible-count="model.resourceEvidence.length"
        :resource-evidence-total-count="model.resourceEvidenceTotalCount"
      />
    </div>

    <details
      v-if="model.unlocatedAuditItems.length"
      class="runtime-scene-map__unlocated"
      data-test="runtime-scene-unlocated-audit"
    >
      <summary>未定位证据 {{ model.unlocatedAuditItems.length }}</summary>
      <RuntimeSceneEvidencePanel
        :items="model.unlocatedAuditItems"
        :resource-evidence-truncated="model.resourceEvidenceTruncated"
        :resource-evidence-visible-count="model.resourceEvidence.length"
        :resource-evidence-total-count="model.resourceEvidenceTotalCount"
      />
    </details>
```

- [ ] **Step 4: Remove obsolete functions from `RuntimeSceneMap.vue`**

Remove local `signalText`, `signalClass`, `getSessionCount`, and `hasRuntimeHold` from `RuntimeSceneMap.vue` because `RuntimeSceneDeviceFlow` owns that behavior.

- [ ] **Step 5: Add responsive layout styles**

Add these styles to `RuntimeSceneMap.vue`:

```css
.runtime-scene-map__layout {
  display: grid;
  grid-template-columns: minmax(0, 1.3fr) minmax(280px, 0.7fr);
  gap: 14px;
  min-width: 0;
}

.runtime-scene-map__positions {
  display: grid;
  min-width: 0;
  gap: 12px;
}

.runtime-scene-map__unlocated {
  min-width: 0;
  border: 1px solid rgb(148 163 184 / 0.18);
  border-radius: 8px;
  padding: 10px;
  background: rgb(2 6 23 / 0.48);
}

.runtime-scene-map__unlocated summary {
  cursor: pointer;
  color: var(--runtime-text-muted);
}

@media (max-width: 768px) {
  .runtime-scene-map__layout {
    grid-template-columns: minmax(0, 1fr);
  }
}
```

- [ ] **Step 6: Run map and live overview tests**

Run:

```bash
pnpm test -- tests/unit/components/runtime/runtimeSceneMap.test.ts tests/unit/components/runtime/worklineLiveOverview.test.ts
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/components/runtime/monitor/RuntimeSceneMap.vue src/components/runtime/monitor/WorklineLiveOverview.vue tests/unit/components/runtime/runtimeSceneMap.test.ts tests/unit/components/runtime/worklineLiveOverview.test.ts
git commit -m "feat(runtime): render grouped monitor resource layout"
```

## Task 5: Sandbox and Trace Topology Convergence

**Files:**

- Modify: `src/views/runtime/sandbox/SandboxWorkbenchPage.vue`
- Modify: `src/components/runtime/trace/TraceTopologySummary.vue`
- Modify: `tests/unit/views/runtime/sandboxWorkbenchCleanup.test.ts`
- Modify: `tests/unit/components/runtime/traceTopologySummary.test.ts`
- Delete: `src/components/runtime/monitor/WorklineRouteMap.vue`

- [ ] **Step 1: Update sandbox and trace tests to expect `RuntimeSceneDeviceFlow`**

In `tests/unit/views/runtime/sandboxWorkbenchCleanup.test.ts`, replace the assertion that references `WorklineRouteMap` with:

```ts
expect(
  wrapper
    .find('[data-test="sandbox-start-verdict"]')
    .element.compareDocumentPosition(
      wrapper.findComponent({ name: 'RuntimeSceneDeviceFlow' }).element
    ) & Node.DOCUMENT_POSITION_FOLLOWING
).toBeTruthy()
```

In sandbox page test stubs, replace `WorklineRouteMap: true` with:

```ts
        RuntimeSceneDeviceFlow: {
          name: 'RuntimeSceneDeviceFlow',
          template: '<div class="runtime-scene-device-flow-stub" />'
        },
```

In `tests/unit/components/runtime/traceTopologySummary.test.ts`, replace the `WorklineRouteMap` stub with:

```ts
RuntimeSceneDeviceFlow: {
  template: '<div>完整工作线拓扑</div>'
}
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```bash
pnpm test -- tests/unit/views/runtime/sandboxWorkbenchCleanup.test.ts tests/unit/components/runtime/traceTopologySummary.test.ts
```

Expected: FAIL because the pages still import and render `WorklineRouteMap`.

- [ ] **Step 3: Replace sandbox topology component**

In `src/views/runtime/sandbox/SandboxWorkbenchPage.vue`, replace:

```ts
import WorklineRouteMap from '@/components/runtime/monitor/WorklineRouteMap.vue'
```

with:

```ts
import RuntimeSceneDeviceFlow from '@/components/runtime/shared/RuntimeSceneDeviceFlow.vue'
import { toRuntimeSceneDeviceNode } from '@/utils/runtime-scene'
```

Add this computed near `deviceListWithCounters`:

```ts
const deviceFlowNodes = computed(() => deviceListWithCounters.value.map(toRuntimeSceneDeviceNode))
```

Replace the template component:

```vue
<RuntimeSceneDeviceFlow
  :devices="deviceFlowNodes"
  :selected-device-id="selectedDeviceId"
  @select="handleSelectDevice"
  @send-event="handleSendEventFromTopology"
  @show-context-menu="handleShowContextMenu"
/>
```

Remove `@view-outbox` because the old component did not expose a visible view-outbox control in the rendered template and the new component keeps only used events.

- [ ] **Step 4: Replace trace full topology component**

In `src/components/runtime/trace/TraceTopologySummary.vue`, replace:

```ts
import WorklineRouteMap from '@/components/runtime/monitor/WorklineRouteMap.vue'
```

with:

```ts
import RuntimeSceneDeviceFlow from '@/components/runtime/shared/RuntimeSceneDeviceFlow.vue'
import { toRuntimeSceneDeviceNode } from '@/utils/runtime-scene'
```

Add:

```ts
const worklineDeviceNodes = computed(() => worklineDevices.value.map(toRuntimeSceneDeviceNode))
```

Replace the details component:

```vue
<RuntimeSceneDeviceFlow
  class="trace-topology-summary__route-map"
  :devices="worklineDeviceNodes"
  :selected-device-id="selectedDeviceId"
  :trace-path-nodes="path?.devices ?? []"
  :blocking-device-id="path?.current_blocking_device_id ?? null"
  compact
  @select="selectedDeviceId = $event"
/>
```

- [ ] **Step 5: Delete old `WorklineRouteMap.vue`**

Delete:

```text
src/components/runtime/monitor/WorklineRouteMap.vue
```

- [ ] **Step 6: Remove remaining references**

Run:

```bash
rg "WorklineRouteMap" src tests
```

Expected: no output.

- [ ] **Step 7: Run convergence tests**

Run:

```bash
pnpm test -- tests/unit/views/runtime/sandboxWorkbenchCleanup.test.ts tests/unit/components/runtime/traceTopologySummary.test.ts tests/unit/components/runtime/runtimeSceneDeviceFlow.test.ts
```

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/views/runtime/sandbox/SandboxWorkbenchPage.vue src/components/runtime/trace/TraceTopologySummary.vue src/components/runtime/monitor/WorklineRouteMap.vue tests/unit/views/runtime/sandboxWorkbenchCleanup.test.ts tests/unit/components/runtime/traceTopologySummary.test.ts
git commit -m "refactor(runtime): converge topology on scene device flow"
```

## Task 6: Smoke Fixture and Browser Assertions

**Files:**

- Modify: `scripts/runtime-agent-browser-smoke.sh`

- [ ] **Step 1: Extend fixed monitor fixture resource evidence**

In `install_monitor_fixture_routes()`, replace the fixed `resource_evidence_items` array with:

```python
    "resource_evidence_items": [
        {
            "resource_kind": "RACK",
            "resource_code": "RACK-SMOKE-001",
            "display_label": "Rack RACK-SMOKE-001",
            "evidence_kind": "WES_ACTIVE_SNAPSHOT",
            "station_code": "TARGET_ARM",
            "position_code": "SINGLE_LAYER_A",
            "rack_code": "RACK-SMOKE-001",
            "occurred_at": "2026-06-08T00:00:00Z",
        },
        {
            "resource_kind": "BIN",
            "resource_code": "BIN-SMOKE-001",
            "display_label": "Bin BIN-SMOKE-001",
            "evidence_kind": "WMS_CALLBACK_EVIDENCE",
            "station_code": "TARGET_ARM",
            "position_code": "SINGLE_LAYER_A",
            "rack_code": "RACK-SMOKE-001",
            "bin_code": "BIN-SMOKE-001",
            "source_session_id": 88001,
            "source_trace_id": "trace-smoke-wms-callback",
            "occurred_at": "2026-06-08T00:00:01Z",
        },
        {
            "resource_kind": "SLOT",
            "resource_code": "SLOT-SMOKE-A1",
            "display_label": "Slot SLOT-SMOKE-A1",
            "evidence_kind": "TRACE_RESOURCE_EVIDENCE",
            "station_code": "TARGET_ARM",
            "position_code": "SINGLE_LAYER_A",
            "rack_code": "RACK-SMOKE-001",
            "bin_code": "BIN-SMOKE-001",
            "slot_code": "SLOT-SMOKE-A1",
            "source_trace_id": "trace-smoke-slot",
            "occurred_at": "2026-06-08T00:00:02Z",
        },
        {
            "resource_kind": "CELL",
            "resource_code": "CELL-SMOKE-A1",
            "display_label": "Cell CELL-SMOKE-A1",
            "evidence_kind": "TRACE_RESOURCE_EVIDENCE",
            "station_code": "TARGET_ARM",
            "position_code": "SINGLE_LAYER_A",
            "rack_code": "RACK-SMOKE-001",
            "bin_code": "BIN-SMOKE-001",
            "source_trace_id": "trace-smoke-cell",
            "occurred_at": "2026-06-08T00:00:03Z",
        },
        {
            "resource_kind": "PKG",
            "resource_code": "PKG-SMOKE-001",
            "display_label": "PKG PKG-SMOKE-001",
            "evidence_kind": "WMS_CALLBACK_EVIDENCE",
            "station_code": "TARGET_ARM",
            "position_code": "SINGLE_LAYER_A",
            "rack_code": "RACK-SMOKE-001",
            "bin_code": "BIN-SMOKE-001",
            "pkg_code": "PKG-SMOKE-001",
            "source_trace_id": "trace-smoke-pkg",
            "occurred_at": "2026-06-08T00:00:04Z",
        },
        {
            "resource_kind": "PART_SN",
            "resource_code": "PART-SMOKE-001",
            "display_label": "Part SN PART-SMOKE-001",
            "evidence_kind": "TRACE_RESOURCE_EVIDENCE",
            "station_code": "TARGET_ARM",
            "position_code": "SINGLE_LAYER_A",
            "rack_code": "RACK-SMOKE-001",
            "bin_code": "BIN-SMOKE-001",
            "part_sn": "PART-SMOKE-001",
            "source_trace_id": "trace-smoke-part",
            "occurred_at": "2026-06-08T00:00:05Z",
        },
        {
            "resource_kind": "PKG",
            "resource_code": "PKG-SMOKE-UNLOCATED",
            "display_label": "PKG PKG-SMOKE-UNLOCATED",
            "evidence_kind": "GENERIC_EVIDENCE",
            "source_trace_id": "trace-smoke-unlocated",
            "occurred_at": "2026-06-08T00:00:06Z",
        },
    ],
```

Keep:

```python
    "resource_evidence_total_count": 8,
    "resource_evidence_truncated": True,
```

- [ ] **Step 2: Extend monitor DOM assertions**

In `assert_monitor_scene_dom()`, for scenario `"happy"`, require these texts:

```python
        "RACK-SMOKE-001",
        "BIN-SMOKE-001",
        "SLOT-SMOKE-A1",
        "CELL-SMOKE-A1",
        "PKG-SMOKE-001",
        "PART-SMOKE-001",
        "PKG-SMOKE-UNLOCATED",
```

Add required selectors for monitor happy and seeded scenarios:

```python
    required_selectors.extend([
        '[data-test="runtime-scene-device-flow"]',
        '[data-test="runtime-scene-position-group"]',
        '[data-test="runtime-scene-resource-stack"]',
        '[data-test="runtime-scene-focus-panel"]',
    ])
```

- [ ] **Step 3: Add sandbox and trace smoke assertions**

After monitor fallback assertions and before the devices page block, add:

```bash
ab console --clear >/dev/null || true
ab errors --clear >/dev/null || true
ab network requests --clear >/dev/null || true

ab set viewport 1440 900 >/dev/null
ab open "${BASE_URL}/runtime/sandbox/${workline_id}" >/dev/null
ab wait 5000 >/dev/null
sandbox_text="$(ab get text body)"
sandbox_console_log="$(ab console || true)"
sandbox_page_errors="$(ab errors || true)"
assert_contains "${sandbox_text}" "设备拓扑" "sandbox 页面未渲染设备拓扑，页面内容: ${sandbox_text}"
assert_contains "${sandbox_text}" "SMOKE-TARGET-ARM" "sandbox 页面未渲染共享设备流节点，页面内容: ${sandbox_text}"

ab console --clear >/dev/null || true
ab errors --clear >/dev/null || true
ab network requests --clear >/dev/null || true

ab set viewport 390 844 >/dev/null
ab open "${BASE_URL}/runtime/sandbox/${workline_id}" >/dev/null
ab wait 5000 >/dev/null
sandbox_mobile_text="$(ab get text body)"
sandbox_mobile_console_log="$(ab console || true)"
sandbox_mobile_page_errors="$(ab errors || true)"
assert_contains "${sandbox_mobile_text}" "设备拓扑" "移动 sandbox 页面未渲染设备拓扑，页面内容: ${sandbox_mobile_text}"

ab console --clear >/dev/null || true
ab errors --clear >/dev/null || true
ab network requests --clear >/dev/null || true
```

If no stable trace fixture exists in the script, add trace coverage only when a seeded trace id is available from the backend seed output. Extend `run_monitor_scene_seed()` to read an optional `trace_id`:

```bash
SEEDED_TRACE_ID="$(json_field "${seed_output}" "data.get('trace_id', '')")"
```

Then add guarded trace assertions:

```bash
if [[ -n "${SEEDED_TRACE_ID:-}" ]]; then
  ab set viewport 1440 900 >/dev/null
  ab open "${BASE_URL}/runtime/cases?traceId=${SEEDED_TRACE_ID}" >/dev/null
  ab wait 5000 >/dev/null
  trace_text="$(ab get text body)"
  trace_console_log="$(ab console || true)"
  trace_page_errors="$(ab errors || true)"
  assert_contains "${trace_text}" "工作线拓扑" "trace 页面未渲染工作线拓扑，页面内容: ${trace_text}"
  assert_contains "${trace_text}" "完整设备拓扑" "trace 页面未渲染完整设备拓扑，页面内容: ${trace_text}"

  ab console --clear >/dev/null || true
  ab errors --clear >/dev/null || true
  ab set viewport 390 844 >/dev/null
  ab open "${BASE_URL}/runtime/cases?traceId=${SEEDED_TRACE_ID}" >/dev/null
  ab wait 5000 >/dev/null
  trace_mobile_text="$(ab get text body)"
  trace_mobile_console_log="$(ab console || true)"
  trace_mobile_page_errors="$(ab errors || true)"
  assert_contains "${trace_mobile_text}" "工作线拓扑" "移动 trace 页面未渲染工作线拓扑，页面内容: ${trace_mobile_text}"
fi
```

Append the new console/error variables into `combined_console` and `combined_errors`:

```bash
combined_console="$(printf '%s\n%s\n%s\n%s\n%s\n%s\n%s\n%s\n%s\n%s\n%s' "${console_log}" "${mobile_console_log}" "${fallback_console_log}" "${fallback_mobile_console_log}" "${sandbox_console_log:-}" "${sandbox_mobile_console_log:-}" "${trace_console_log:-}" "${trace_mobile_console_log:-}" "${device_console_log}")"
combined_errors="$(printf '%s\n%s\n%s\n%s\n%s\n%s\n%s\n%s\n%s\n%s\n%s' "${page_errors}" "${mobile_page_errors}" "${fallback_page_errors}" "${fallback_mobile_page_errors}" "${sandbox_page_errors:-}" "${sandbox_mobile_page_errors:-}" "${trace_page_errors:-}" "${trace_mobile_page_errors:-}" "${device_page_errors}")"
```

- [ ] **Step 4: Run script syntax check**

Run:

```bash
bash -n scripts/runtime-agent-browser-smoke.sh
```

Expected: no output and exit code 0.

- [ ] **Step 5: Commit**

```bash
git add scripts/runtime-agent-browser-smoke.sh
git commit -m "test(runtime): expand resource layout smoke coverage"
```

## Task 7: Final Verification

**Files:**

- Modify generated component declarations only if `vue-tsc` reports missing global component declarations.
- No source edits are expected before running the first verification command.

- [ ] **Step 1: Run focused tests**

```bash
pnpm test -- tests/unit/utils/runtime-scene.test.ts tests/unit/components/runtime/runtimeSceneDeviceFlow.test.ts tests/unit/components/runtime/runtimeSceneFocusPanel.test.ts tests/unit/components/runtime/runtimeSceneMap.test.ts tests/unit/components/runtime/worklineLiveOverview.test.ts tests/unit/components/runtime/traceTopologySummary.test.ts tests/unit/views/runtime/sandboxWorkbenchCleanup.test.ts
```

Expected: PASS.

- [ ] **Step 2: Run type check**

```bash
pnpm type:check
```

Expected: PASS.

- [ ] **Step 3: Run lint**

```bash
pnpm lint
```

Expected: PASS. This repository's lint command may rewrite formatting; inspect `git diff` after it runs and keep only formatting changes related to files in this plan.

- [ ] **Step 4: Run runtime smoke**

Start the dev server if one is not already running:

```bash
pnpm dev
```

In a second shell, run:

```bash
RUNTIME_SMOKE_USE_FIXED_MONITOR_FIXTURE=1 pnpm smoke:runtime:agent-browser
```

Expected: PASS, with monitor desktop/mobile screenshots and no unfiltered console/page errors.

- [ ] **Step 5: Confirm old topology component is gone**

```bash
rg "WorklineRouteMap" src tests
```

Expected: no output.

- [ ] **Step 6: Review diff**

```bash
git diff --stat
git diff -- docs/superpowers/specs/2026-06-08-runtime-monitor-resource-layout-design.md docs/superpowers/plans/2026-06-08-runtime-monitor-resource-layout-implementation.md
git diff -- src/utils/runtime-scene.ts src/components/runtime/monitor src/views/runtime/sandbox/SandboxWorkbenchPage.vue src/components/runtime/trace/TraceTopologySummary.vue scripts/runtime-agent-browser-smoke.sh
```

Expected: diff only contains runtime scene model, monitor layout components, topology convergence, tests, and smoke coverage from this plan.

- [ ] **Step 7: Commit final verification fixes**

If Step 3 produced formatting changes or Step 4 required smoke assertion fixes, commit them:

```bash
git add src tests scripts docs
git commit -m "chore(runtime): finalize resource layout verification"
```

If there are no new changes after verification, skip this commit and record the passing commands in the implementation summary.

## Self-Review

- Spec coverage: adapter grouping, `attentionState`, global unlocated audit, `anchor/children`, focus/evidence panel, shared `RuntimeSceneDeviceFlow`, deletion of `WorklineRouteMap`, and three-page browser smoke are each covered by a task.
- Placeholder scan: no open-ended validation instructions or undefined function references remain; all new public helpers and components are defined before use.
- Type consistency: the plan consistently uses `RuntimeSceneDeviceNode`, `RuntimeScenePositionGroup`, `RuntimeSceneResourceStack`, `RuntimeSceneEvidencePanel`, `RuntimeSceneFocusPanel`, `RuntimeSceneDeviceFlow`, `attentionState`, `anchor`, and `children`.
