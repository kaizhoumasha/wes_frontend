import { describe, expect, it } from 'vitest'
import {
  COMPACT_LAYOUT_CONFIG,
  DEFAULT_LAYOUT_CONFIG,
  computeLayout,
  expandManifestEdgesForLayout,
  makeDeviceKey,
  makeRackPositionKey,
  type ExplicitLayoutEdge,
  type LayoutNodeInput,
  type ManifestTopologyEdgeInput,
} from '@/utils/runtime-topology'
import type { RuntimeSceneDeviceNode } from '@/utils/runtime-scene'

function makeDevice(overrides: Partial<RuntimeSceneDeviceNode> = {}): RuntimeSceneDeviceNode {
  return {
    id: overrides.id ?? 1,
    deviceCode: overrides.deviceCode ?? 'DEV-1',
    deviceName: overrides.deviceName ?? 'Device 1',
    deviceRole: overrides.deviceRole ?? 'STATION',
    roleIndex: overrides.roleIndex ?? 0,
    status: overrides.status ?? 'IDLE',
    maintenanceMode: overrides.maintenanceMode ?? false,
    currentCommandId: overrides.currentCommandId ?? null,
    openCommandCount: overrides.openCommandCount ?? 0,
    blockedOutboxCount: overrides.blockedOutboxCount ?? 0,
    runtimeHoldCount: overrides.runtimeHoldCount ?? 0,
    errorCode: overrides.errorCode ?? null,
  }
}

describe('runtime-topology — fallback (devices only, no explicit nodes/edges)', () => {
  it('builds device-only layout with derived edges and stable string keys', () => {
    const devices: RuntimeSceneDeviceNode[] = [
      makeDevice({ id: 1, deviceRole: 'CONVEYOR_IN', deviceName: '入料输送' }),
      makeDevice({ id: 2, deviceRole: 'STATION', deviceName: '工位 A' }),
      makeDevice({ id: 3, deviceRole: 'CONVEYOR_OUT', deviceName: '出料输送' }),
    ]

    const layout = computeLayout(devices)

    expect(layout.nodes).toHaveLength(3)
    expect(layout.nodes.every(n => typeof n.id === 'string')).toBe(true)
    expect(layout.nodes.every(n => n.kind === 'device')).toBe(true)
    expect(layout.nodes.map(n => n.id).sort()).toEqual([
      makeDeviceKey(1),
      makeDeviceKey(2),
      makeDeviceKey(3),
    ])
    // Derived layout produces at least one edge per adjacent column pair.
    expect(layout.edges.length).toBeGreaterThan(0)
    expect(layout.edges.every(e => e.type === 'MATERIAL_FLOW')).toBe(true)
    expect(layout.canvasWidth).toBeGreaterThan(0)
    expect(layout.canvasHeight).toBeGreaterThan(0)
  })

  it('returns empty layout when no devices and no explicit input', () => {
    const layout = computeLayout([])
    expect(layout.nodes).toHaveLength(0)
    expect(layout.edges).toHaveLength(0)
    expect(layout.canvasWidth).toBe(0)
    expect(layout.canvasHeight).toBe(0)
  })
})

describe('runtime-topology — explicit edges override derived edges', () => {
  it('uses explicit edges instead of deriveEdges() output', () => {
    const devices: RuntimeSceneDeviceNode[] = [
      makeDevice({ id: 10, deviceRole: 'CONVEYOR_IN', deviceName: '入料' }),
      makeDevice({ id: 20, deviceRole: 'STATION', deviceName: '工位' }),
      makeDevice({ id: 30, deviceRole: 'CONVEYOR_OUT', deviceName: '出料' }),
    ]
    const fallback = computeLayout(devices)
    expect(fallback.edges.length).toBeGreaterThan(0)

    // Explicit nodes + only one explicit edge: 10 -> 30 (skipping 20).
    const explicitNodes: LayoutNodeInput[] = devices.map(d => ({ kind: 'device', device: d }))
    const explicitEdges: ExplicitLayoutEdge[] = [
      { fromKey: makeDeviceKey(10), toKey: makeDeviceKey(30), type: 'MATERIAL_FLOW' },
    ]

    const layout = computeLayout(devices, DEFAULT_LAYOUT_CONFIG, undefined, {
      explicitNodes,
      explicitEdges,
    })

    expect(layout.edges).toHaveLength(1)
    expect(layout.edges[0].fromKey).toBe(makeDeviceKey(10))
    expect(layout.edges[0].toKey).toBe(makeDeviceKey(30))
    expect(layout.edges[0].id).toBe(`${makeDeviceKey(10)}->${makeDeviceKey(30)}:MATERIAL_FLOW`)

    // Sanity: explicit-edge layout differs from fallback's derived edge set.
    const fallbackEdgeKeys = fallback.edges.map(e => `${e.fromKey}->${e.toKey}`)
    expect(fallbackEdgeKeys.length).not.toBe(1)
  })
})

describe('runtime-topology — DEVICE_ROLE fan-out via expandManifestEdgesForLayout', () => {
  it('fans out a single role-to-rack manifest edge into N edges (sorted by roleIndex+id)', () => {
    const devices: RuntimeSceneDeviceNode[] = [
      // Intentionally out-of-order on input to verify sort.
      makeDevice({ id: 102, deviceRole: 'STATION', roleIndex: 1, deviceName: 'Station 2' }),
      makeDevice({ id: 101, deviceRole: 'STATION', roleIndex: 0, deviceName: 'Station 1' }),
      makeDevice({ id: 999, deviceRole: 'OTHER', roleIndex: 0, deviceName: 'Other' }),
    ]
    const manifestEdges: ManifestTopologyEdgeInput[] = [
      {
        fromNode: { kind: 'DEVICE_ROLE', ref: 'STATION' },
        toNode: { kind: 'RACK_POSITION', ref: 'RACK-01' },
        type: 'OPERATION',
      },
    ]
    const knownRackPositions = new Set(['RACK-01'])

    const explicitEdges = expandManifestEdgesForLayout(
      manifestEdges,
      devices,
      knownRackPositions
    )

    expect(explicitEdges).toHaveLength(2)
    expect(explicitEdges.map(e => e.fromKey)).toEqual([
      makeDeviceKey(101), // roleIndex 0 first
      makeDeviceKey(102), // roleIndex 1 second
    ])
    expect(explicitEdges.every(e => e.toKey === makeRackPositionKey('RACK-01'))).toBe(true)
    expect(explicitEdges.every(e => e.type === 'OPERATION')).toBe(true)

    // Plug the expanded edges into computeLayout to confirm fan-out renders.
    const explicitNodes: LayoutNodeInput[] = [
      { kind: 'device', device: devices[1] }, // 101
      { kind: 'device', device: devices[0] }, // 102
      { kind: 'rack_position', code: 'RACK-01' },
    ]
    const layout = computeLayout(devices, DEFAULT_LAYOUT_CONFIG, undefined, {
      explicitNodes,
      explicitEdges,
    })
    expect(layout.edges).toHaveLength(2)
    expect(layout.edges.every(e => e.type === 'OPERATION')).toBe(true)
  })
})

describe('runtime-topology — RACK_POSITION → RACK_POSITION material flow', () => {
  it('renders a layout with only rack-position nodes connected by an edge', () => {
    const explicitNodes: LayoutNodeInput[] = [
      { kind: 'rack_position', code: 'RACK-A' },
      { kind: 'rack_position', code: 'RACK-B' },
    ]
    const explicitEdges: ExplicitLayoutEdge[] = [
      {
        fromKey: makeRackPositionKey('RACK-A'),
        toKey: makeRackPositionKey('RACK-B'),
        type: 'MATERIAL_FLOW',
      },
    ]

    const layout = computeLayout([], DEFAULT_LAYOUT_CONFIG, undefined, {
      explicitNodes,
      explicitEdges,
    })

    expect(layout.nodes).toHaveLength(2)
    expect(layout.nodes.every(n => n.kind === 'rack_position')).toBe(true)
    expect(layout.nodes.map(n => n.id).sort()).toEqual([
      makeRackPositionKey('RACK-A'),
      makeRackPositionKey('RACK-B'),
    ])
    // No device nodes whatsoever.
    expect(layout.nodes.some(n => n.kind === 'device')).toBe(false)

    expect(layout.edges).toHaveLength(1)
    expect(layout.edges[0].fromKey).toBe(makeRackPositionKey('RACK-A'))
    expect(layout.edges[0].toKey).toBe(makeRackPositionKey('RACK-B'))
    expect(layout.edges[0].type).toBe('MATERIAL_FLOW')

    // Rack-A column < Rack-B column (one to the right of the other).
    const a = layout.nodes.find(n => n.id === makeRackPositionKey('RACK-A'))!
    const b = layout.nodes.find(n => n.id === makeRackPositionKey('RACK-B'))!
    expect(a.column).toBeLessThan(b.column)
  })
})

describe('runtime-topology — unknown refs are tolerated', () => {
  it('expandManifestEdgesForLayout silently skips edges with unknown refs', () => {
    const devices = [makeDevice({ id: 1, deviceRole: 'STATION' })]
    const manifestEdges: ManifestTopologyEdgeInput[] = [
      {
        fromNode: { kind: 'DEVICE_ROLE', ref: 'NON_EXISTENT_ROLE' },
        toNode: { kind: 'RACK_POSITION', ref: 'RACK-X' },
        type: 'MATERIAL_FLOW',
      },
      {
        fromNode: { kind: 'DEVICE_ROLE', ref: 'STATION' },
        toNode: { kind: 'RACK_POSITION', ref: 'UNKNOWN-RACK' },
        type: 'MATERIAL_FLOW',
      },
    ]
    const knownRackPositions = new Set(['RACK-X'])

    const expanded = expandManifestEdgesForLayout(manifestEdges, devices, knownRackPositions)
    // First edge skipped (unknown role); second skipped (unknown rack position).
    expect(expanded).toHaveLength(0)
  })

  it('computeLayout silently skips explicit edges referencing unknown keys', () => {
    const explicitNodes: LayoutNodeInput[] = [
      { kind: 'device', device: makeDevice({ id: 1 }) },
    ]
    const explicitEdges: ExplicitLayoutEdge[] = [
      {
        fromKey: makeDeviceKey(1),
        toKey: makeRackPositionKey('PHANTOM-RACK'),
        type: 'OPERATION',
      },
      {
        fromKey: makeDeviceKey(999),
        toKey: makeDeviceKey(1),
        type: 'MATERIAL_FLOW',
      },
    ]

    expect(() =>
      computeLayout([makeDevice({ id: 1 })], DEFAULT_LAYOUT_CONFIG, undefined, {
        explicitNodes,
        explicitEdges,
      })
    ).not.toThrow()

    const layout = computeLayout([makeDevice({ id: 1 })], DEFAULT_LAYOUT_CONFIG, undefined, {
      explicitNodes,
      explicitEdges,
    })
    expect(layout.edges).toHaveLength(0)
    expect(layout.nodes).toHaveLength(1)
  })
})

describe('runtime-topology — stable string ids with prefix conventions', () => {
  it('all node ids in fallback mode are device:* strings', () => {
    const devices = [
      makeDevice({ id: 1 }),
      makeDevice({ id: 2 }),
      makeDevice({ id: 3 }),
    ]
    const layout = computeLayout(devices)
    for (const node of layout.nodes) {
      expect(typeof node.id).toBe('string')
      expect(node.id.startsWith('device:')).toBe(true)
    }
  })

  it('mixed explicit layout uses device:* and rack:* prefixes correctly', () => {
    const explicitNodes: LayoutNodeInput[] = [
      { kind: 'device', device: makeDevice({ id: 7 }) },
      { kind: 'rack_position', code: 'RACK-7' },
    ]
    const layout = computeLayout([makeDevice({ id: 7 })], DEFAULT_LAYOUT_CONFIG, undefined, {
      explicitNodes,
    })

    const devNode = layout.nodes.find(n => n.kind === 'device')!
    const rackNode = layout.nodes.find(n => n.kind === 'rack_position')!
    expect(devNode.id).toBe('device:7')
    expect(rackNode.id).toBe('rack:RACK-7')
  })
})

describe('runtime-topology — canvas size includes rack-position nodes', () => {
  it('canvas dimensions accommodate all nodes (devices + rack-positions)', () => {
    const explicitNodes: LayoutNodeInput[] = [
      { kind: 'device', device: makeDevice({ id: 1, deviceRole: 'STATION' }) },
      { kind: 'rack_position', code: 'RACK-A' },
    ]
    const explicitEdges: ExplicitLayoutEdge[] = [
      {
        fromKey: makeDeviceKey(1),
        toKey: makeRackPositionKey('RACK-A'),
        type: 'OPERATION',
      },
    ]

    const config = COMPACT_LAYOUT_CONFIG
    const layout = computeLayout([makeDevice({ id: 1, deviceRole: 'STATION' })], config, undefined, {
      explicitNodes,
      explicitEdges,
    })

    expect(layout.nodes).toHaveLength(2)
    for (const node of layout.nodes) {
      expect(node.x).toBeGreaterThanOrEqual(0)
      expect(node.y).toBeGreaterThanOrEqual(0)
      // Right edge of node fits inside canvas
      expect(node.x + config.nodeWidth).toBeLessThanOrEqual(layout.canvasWidth)
      expect(node.y + config.nodeHeight).toBeLessThanOrEqual(layout.canvasHeight)
    }
    // Rack-position must be in a column to the right of the device column.
    const dev = layout.nodes.find(n => n.kind === 'device')!
    const rack = layout.nodes.find(n => n.kind === 'rack_position')!
    expect(rack.column).toBeGreaterThan(dev.column)
    expect(rack.x).toBeGreaterThan(dev.x)
  })
})

describe('runtime-topology — duplicate explicit edges get distinct ids', () => {
  it('two explicit edges with same fromKey/toKey/type render as 2 LayoutEdges with distinct ids', () => {
    const explicitNodes: LayoutNodeInput[] = [
      { kind: 'device', device: makeDevice({ id: 1, deviceRole: 'STATION' }) },
      { kind: 'rack_position', code: 'RACK-A' },
    ]
    const explicitEdges: ExplicitLayoutEdge[] = [
      {
        fromKey: makeDeviceKey(1),
        toKey: makeRackPositionKey('RACK-A'),
        type: 'OPERATION',
      },
      {
        fromKey: makeDeviceKey(1),
        toKey: makeRackPositionKey('RACK-A'),
        type: 'OPERATION',
      },
    ]

    const layout = computeLayout(
      [makeDevice({ id: 1, deviceRole: 'STATION' })],
      DEFAULT_LAYOUT_CONFIG,
      undefined,
      { explicitNodes, explicitEdges }
    )

    expect(layout.edges).toHaveLength(2)
    const ids = layout.edges.map(e => e.id)
    expect(new Set(ids).size).toBe(2)
    // First occurrence keeps base id for backward compat; second gets `:i1` suffix.
    const baseId = `${makeDeviceKey(1)}->${makeRackPositionKey('RACK-A')}:OPERATION`
    expect(ids).toEqual([baseId, `${baseId}:i1`])
    // Both edges still reference the same endpoints and type.
    expect(layout.edges.every(e => e.fromKey === makeDeviceKey(1))).toBe(true)
    expect(layout.edges.every(e => e.toKey === makeRackPositionKey('RACK-A'))).toBe(true)
    expect(layout.edges.every(e => e.type === 'OPERATION')).toBe(true)
  })
})

describe('runtime-topology — fallback serializes when no adjacent columns', () => {
  it('connects devices in a single column via roleIndex-ordered chain', () => {
    const devices: RuntimeSceneDeviceNode[] = [
      makeDevice({ id: 1, deviceRole: 'STATION', roleIndex: 0, deviceName: 'A' }),
      makeDevice({ id: 2, deviceRole: 'STATION', roleIndex: 1, deviceName: 'B' }),
      makeDevice({ id: 3, deviceRole: 'STATION', roleIndex: 2, deviceName: 'C' }),
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
      makeDevice({ id: 1, deviceRole: 'STATION', deviceName: 'Only' }),
    ]
    const layout = computeLayout(devices)
    // A single device cannot form a chain — keep current empty behaviour.
    expect(layout.edges).toHaveLength(0)
  })

  it('keeps roleIndex as tie-breaker for stable ordering', () => {
    const devices: RuntimeSceneDeviceNode[] = [
      makeDevice({ id: 10, deviceRole: 'STATION', roleIndex: 2, deviceName: 'C' }),
      makeDevice({ id: 11, deviceRole: 'STATION', roleIndex: 0, deviceName: 'A' }),
      makeDevice({ id: 12, deviceRole: 'STATION', roleIndex: 1, deviceName: 'B' }),
    ]
    const layout = computeLayout(devices)
    const ordered = layout.edges.map(e => e.fromKey)
    expect(ordered).toEqual([
      makeDeviceKey(11), // roleIndex 0
      makeDeviceKey(12), // roleIndex 1
    ])
  })
})
