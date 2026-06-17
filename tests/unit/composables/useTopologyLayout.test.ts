/**
 * Tests for useTopologyLayout composable.
 *
 * Coverage:
 *  1. Late-arriving explicitEdges trigger layout recomputation
 *  2. compact option reactive change updates canvas size
 *  3. linear option reactive change collapses to single row
 *  4. explicitNodes reactive change adds rack-position nodes
 *  5. Getter form (() => state.compact) works reactively
 *  6. Ref form (back-compat) still works
 */

import { describe, it, expect } from 'vitest'
import { nextTick, reactive, ref } from 'vue'
import { useTopologyLayout } from '@/composables/useTopologyLayout'
import {
  COMPACT_LAYOUT_CONFIG,
  DEFAULT_LAYOUT_CONFIG,
  makeDeviceKey,
  makeRackPositionKey,
  type ExplicitLayoutEdge,
  type LayoutNodeInput
} from '@/utils/runtime-topology'
import type { RuntimeSceneDeviceNode } from '@/utils/runtime-scene'

function makeDevice(
  id: number,
  deviceRole: string,
  deviceName: string,
  roleIndex = 0
): RuntimeSceneDeviceNode {
  return {
    id,
    deviceCode: `D${id}`,
    deviceName,
    deviceRole,
    roleIndex,
    status: 'IDLE',
    maintenanceMode: false,
    currentCommandId: null,
    openCommandCount: 0,
    blockedOutboxCount: 0,
    runtimeHoldCount: 0,
    errorCode: null
  }
}

describe('useTopologyLayout', () => {
  it('recomputes layout when explicitEdges arrive after mount (manifest late)', async () => {
    const devices = [
      makeDevice(1, 'inlet', '入料机械臂', 0),
      makeDevice(2, 'station', '工位A', 0),
      makeDevice(3, 'outlet', '出料机械臂', 0)
    ]

    const explicitNodes = ref<LayoutNodeInput[] | undefined>(undefined)
    const explicitEdges = ref<ExplicitLayoutEdge[] | undefined>(undefined)

    const { layout } = useTopologyLayout(devices, {
      explicitNodes,
      explicitEdges
    })

    // Mount: no explicit -> fallback (device-only) edges derived from columns.
    const initialEdgeCount = layout.value.edges.length
    expect(initialEdgeCount).toBeGreaterThan(0)
    expect(layout.value.nodes.every(n => n.kind === 'device')).toBe(true)
    const initialTargetKeys = new Set(layout.value.edges.map(e => e.toKey))

    // Manifest arrives late: explicit nodes + edges with a rack-position.
    explicitNodes.value = [
      { kind: 'device', device: devices[0] },
      { kind: 'device', device: devices[1] },
      { kind: 'device', device: devices[2] },
      { kind: 'rack_position', code: 'RP1', label: 'Rack-1' }
    ]
    explicitEdges.value = [
      {
        fromKey: makeDeviceKey(1),
        toKey: makeRackPositionKey('RP1'),
        type: 'MATERIAL_FLOW'
      },
      {
        fromKey: makeRackPositionKey('RP1'),
        toKey: makeDeviceKey(2),
        type: 'MATERIAL_FLOW'
      }
    ]
    await nextTick()

    expect(layout.value.edges.length).toBe(2)
    const newTargetKeys = new Set(layout.value.edges.map(e => e.toKey))
    expect(newTargetKeys).not.toEqual(initialTargetKeys)
    expect(newTargetKeys.has(makeRackPositionKey('RP1'))).toBe(true)
    expect(newTargetKeys.has(makeDeviceKey(2))).toBe(true)
    // Node set now includes a rack-position
    expect(layout.value.nodes.some(n => n.kind === 'rack_position')).toBe(true)
  })

  it('reacts to compact option change', async () => {
    const devices = [
      makeDevice(1, 'inlet', '入口'),
      makeDevice(2, 'outlet', '出口')
    ]
    const compact = ref(false)
    const { layout } = useTopologyLayout(devices, { compact })

    const wideWidth = layout.value.canvasWidth
    expect(wideWidth).toBeGreaterThan(0)
    // Default-config node width (190) implies canvas > compact (120).
    expect(wideWidth).toBeGreaterThan(COMPACT_LAYOUT_CONFIG.nodeWidth)

    compact.value = true
    await nextTick()

    const compactWidth = layout.value.canvasWidth
    expect(compactWidth).toBeLessThan(wideWidth)
    // Sanity: compact canvas reflects compact node sizing.
    expect(compactWidth).toBeLessThan(DEFAULT_LAYOUT_CONFIG.nodeWidth * devices.length)
  })

  it('reacts to linear option change', async () => {
    const devices = [
      makeDevice(1, 'inlet', '入口'),
      makeDevice(2, 'station', '工位'),
      makeDevice(3, 'outlet', '出口')
    ]
    const linear = ref(false)
    const { layout } = useTopologyLayout(devices, { linear })

    // Multi-column fallback: node y values may match (one per column) but
    // we don't assume a specific arrangement. Switch to linear and assert
    // every node lands on the same y (single row).
    linear.value = true
    await nextTick()

    const ys = new Set(layout.value.nodes.map(n => n.y))
    expect(ys.size).toBe(1)
    // Linear layout produces (n - 1) sequential edges
    expect(layout.value.edges.length).toBe(devices.length - 1)
  })

  it('reacts to explicitNodes change adding rack-position node', async () => {
    const devices = [makeDevice(1, 'inlet', '入口')]
    const explicitNodes = ref<LayoutNodeInput[] | undefined>(undefined)
    const { layout } = useTopologyLayout(devices, { explicitNodes })

    // Fallback: device-only
    expect(layout.value.nodes.length).toBe(1)
    expect(layout.value.nodes[0].kind).toBe('device')

    explicitNodes.value = [
      { kind: 'device', device: devices[0] },
      { kind: 'rack_position', code: 'RACK1', label: 'Rack-1' }
    ]
    await nextTick()

    expect(layout.value.nodes.length).toBe(2)
    expect(layout.value.nodes.some(n => n.kind === 'rack_position')).toBe(true)
  })

  it('reacts when options are passed as getters over reactive state', async () => {
    const state = reactive({ compact: false })
    const devices = [
      makeDevice(1, 'inlet', '入口'),
      makeDevice(2, 'outlet', '出口')
    ]
    const { layout } = useTopologyLayout(devices, {
      compact: () => state.compact
    })

    const wideWidth = layout.value.canvasWidth
    state.compact = true
    await nextTick()
    expect(layout.value.canvasWidth).toBeLessThan(wideWidth)
  })

  it('still accepts a Ref<RuntimeSceneDeviceNode[]> for back-compat', async () => {
    const devicesRef = ref<RuntimeSceneDeviceNode[]>([
      makeDevice(1, 'inlet', '入口')
    ])
    const compactRef = ref(false)
    const { layout } = useTopologyLayout(devicesRef, { compact: compactRef })

    expect(layout.value.nodes.length).toBe(1)

    devicesRef.value = [
      makeDevice(1, 'inlet', '入口'),
      makeDevice(2, 'outlet', '出口')
    ]
    await nextTick()
    expect(layout.value.nodes.length).toBe(2)

    const widthBefore = layout.value.canvasWidth
    compactRef.value = true
    await nextTick()
    expect(layout.value.canvasWidth).toBeLessThan(widthBefore)
  })
})
