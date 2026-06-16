/**
 * Runtime Topology Layout Engine
 *
 * Pure functions for computing multi-column DAG topology layout.
 * No Vue dependencies.
 *
 * Two modes:
 *  1. Fallback mode (no `options.explicitNodes`): build a device-only layout
 *     using role-column rules and `deriveEdges()`. Backwards-compatible with
 *     callers that pass only `devices`.
 *  2. Manifest mode (`options.explicitNodes` provided): build a layout with
 *     device nodes and rack-position nodes as first-class citizens. Edges
 *     come from `options.explicitEdges` if provided; manifest edges that
 *     reference DEVICE_ROLE are fanned out to all devices in that role.
 *
 * Architecture:
 *   devices[] (+ explicitNodes/Edges?) → assignColumns()
 *     → deriveEdges() OR explicit edges → computeLayout()
 *     → { nodes: LayoutNode[], edges: LayoutEdge[], canvasSize }
 *
 * Stable string keys:
 *  - device node:        `device:${id}`
 *  - rack position node: `rack:${positionCode}`
 */

import type { RuntimeSceneDeviceNode } from '@/utils/runtime-scene'

// ---------------------------------------------------------------------------
// Stable key helpers
// ---------------------------------------------------------------------------

export function makeDeviceKey(deviceId: number): string {
  return `device:${deviceId}`
}

export function makeRackPositionKey(positionCode: string): string {
  return `rack:${positionCode}`
}

// ---------------------------------------------------------------------------
// Layout config
// ---------------------------------------------------------------------------

export interface LayoutConfig {
  nodeWidth: number
  nodeHeight: number
  columnGap: number
  rowGap: number
  paddingX: number
  paddingY: number
}

export const DEFAULT_LAYOUT_CONFIG: LayoutConfig = {
  nodeWidth: 190,
  nodeHeight: 140,
  columnGap: 80,
  rowGap: 48,
  paddingX: 24,
  paddingY: 24,
}

export const COMPACT_LAYOUT_CONFIG: LayoutConfig = {
  nodeWidth: 120,
  nodeHeight: 90,
  columnGap: 48,
  rowGap: 24,
  paddingX: 16,
  paddingY: 16,
}

// ---------------------------------------------------------------------------
// Layout result types (string-keyed)
// ---------------------------------------------------------------------------

export type LayoutNodeKind = 'device' | 'rack_position'

export interface LayoutRackPositionInfo {
  code: string
  label?: string
}

export interface LayoutNode {
  id: string
  kind: LayoutNodeKind
  column: number
  row: number
  x: number
  y: number
  device?: RuntimeSceneDeviceNode
  rackPosition?: LayoutRackPositionInfo
}

export type EdgeStatus = 'idle' | 'active' | 'warning' | 'fault'

export type LayoutEdgeType = 'MATERIAL_FLOW' | 'OPERATION'

export interface LayoutEdge {
  id: string
  fromKey: string
  toKey: string
  type: LayoutEdgeType
  status: EdgeStatus
  path: string
}

export interface LayoutResult {
  nodes: LayoutNode[]
  edges: LayoutEdge[]
  canvasWidth: number
  canvasHeight: number
}

// ---------------------------------------------------------------------------
// Explicit input types (manifest-driven mode)
// ---------------------------------------------------------------------------

export interface LayoutDeviceNodeInput {
  kind: 'device'
  device: RuntimeSceneDeviceNode
}

export interface LayoutRackPositionNodeInput {
  kind: 'rack_position'
  code: string
  label?: string
}

export type LayoutNodeInput = LayoutDeviceNodeInput | LayoutRackPositionNodeInput

export interface ExplicitLayoutEdge {
  fromKey: string
  toKey: string
  type: LayoutEdgeType
  status?: EdgeStatus
}

export interface ComputeLayoutOptions {
  explicitNodes?: LayoutNodeInput[]
  explicitEdges?: ExplicitLayoutEdge[]
}

// ---------------------------------------------------------------------------
// Role → Column Mapping
// ---------------------------------------------------------------------------

export interface RoleColumnRule {
  /** Regex pattern to match against deviceRole (case-insensitive) */
  pattern: RegExp
  /** Column index */
  column: number
}

/**
 * Default role-to-column rules, ordered by specificity (most specific first).
 * Devices matching earlier rules are assigned first.
 * More specific patterns (入料/出料 prefixes) come before generic ones (机械臂/工位)
 * to prevent "入料机械臂" from matching the generic ARM rule.
 * Unmatched devices fall back to proportional index-based assignment.
 */
export const DEFAULT_ROLE_COLUMN_RULES: RoleColumnRule[] = [
  // Column 0: Inlet / Entry — specific patterns first
  { pattern: /inlet|conveyor_in|agv_in|entry|入口|进料|入料|上料|喂料/i, column: 0 },
  // Column 3: Outlet / Exit — specific patterns before generic
  { pattern: /outlet|conveyor_out|agv_out|exit|出口|出料|下料|卸料/i, column: 3 },
  // Column 2: Sorting / Merging
  { pattern: /sorter|merger|分拣|合流/i, column: 2 },
  // Column 1: Storage / Processing stations — generic, catches leftovers
  { pattern: /rack|station|arm|buffer|cass|shuttle|输送|货架|工位|机械臂|缓存|穿梭/i, column: 1 },
]

// ---------------------------------------------------------------------------
// Column Assignment (devices only)
// ---------------------------------------------------------------------------

interface ColumnedDevice {
  device: RuntimeSceneDeviceNode
  column: number
}

/**
 * Assign each device to a column based on its role AND name.
 * The device name often contains flow position hints (e.g. "入料机械臂" vs "出料机械臂")
 * that the role alone doesn't capture.
 * Unmatched devices get a proportional column based on their array index.
 */
export function assignColumns(
  devices: RuntimeSceneDeviceNode[],
  rules: RoleColumnRule[] = DEFAULT_ROLE_COLUMN_RULES,
  fallbackColumnCount: number = 4
): ColumnedDevice[] {
  if (devices.length === 0) return []

  return devices.map((device, index) => {
    const matchText = `${device.deviceRole} ${device.deviceName}`
    const matchedRule = rules.find(r => r.pattern.test(matchText))
    if (matchedRule) {
      return { device, column: matchedRule.column }
    }
    const fallbackColumn = devices.length <= 1
      ? 0
      : Math.round((index / (devices.length - 1)) * (fallbackColumnCount - 1))
    return { device, column: fallbackColumn }
  })
}

// ---------------------------------------------------------------------------
// Edge Derivation (devices only, fallback mode)
// ---------------------------------------------------------------------------

interface DerivedEdge {
  fromDeviceId: number
  toDeviceId: number
}

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

/**
 * Derive edges between adjacent columns.
 * Strategy:
 * - Group devices by column
 * - For each pair of adjacent columns, connect devices in order:
 *   - If both columns have same count: 1:1 mapping
 *   - If source has fewer: fan-out (each source → multiple targets)
 *   - If source has more: fan-in (multiple sources → each target)
 *   - Empty columns are skipped
 */
export function deriveEdges(columnedDevices: ColumnedDevice[]): DerivedEdge[] {
  const edges: DerivedEdge[] = []

  const columnMap = new Map<number, RuntimeSceneDeviceNode[]>()
  for (const cd of columnedDevices) {
    const group = columnMap.get(cd.column) ?? []
    group.push(cd.device)
    columnMap.set(cd.column, group)
  }

  const sortedColumns = [...columnMap.keys()].sort((a, b) => a - b)
  if (sortedColumns.length < 2) return edges

  for (let i = 0; i < sortedColumns.length - 1; i++) {
    const sourceCol = columnMap.get(sortedColumns[i])!
    const targetCol = columnMap.get(sortedColumns[i + 1])!

    if (sourceCol.length === 0 || targetCol.length === 0) continue

    if (sourceCol.length === targetCol.length) {
      for (let j = 0; j < sourceCol.length; j++) {
        edges.push({ fromDeviceId: sourceCol[j].id, toDeviceId: targetCol[j].id })
      }
    } else if (sourceCol.length < targetCol.length) {
      for (const src of sourceCol) {
        const startIdx = Math.round(
          (sourceCol.indexOf(src) / sourceCol.length) * targetCol.length
        )
        const endIdx = Math.round(
          ((sourceCol.indexOf(src) + 1) / sourceCol.length) * targetCol.length
        )
        for (let j = startIdx; j < endIdx && j < targetCol.length; j++) {
          edges.push({ fromDeviceId: src.id, toDeviceId: targetCol[j].id })
        }
      }
    } else {
      for (const tgt of targetCol) {
        const startIdx = Math.round(
          (targetCol.indexOf(tgt) / targetCol.length) * sourceCol.length
        )
        const endIdx = Math.round(
          ((targetCol.indexOf(tgt) + 1) / targetCol.length) * sourceCol.length
        )
        for (let j = startIdx; j < endIdx && j < sourceCol.length; j++) {
          edges.push({ fromDeviceId: sourceCol[j].id, toDeviceId: tgt.id })
        }
      }
    }
  }

  return edges
}

// ---------------------------------------------------------------------------
// Edge Status Derivation
// ---------------------------------------------------------------------------

export function deriveEdgeStatus(
  fromDevice: RuntimeSceneDeviceNode,
  toDevice: RuntimeSceneDeviceNode
): EdgeStatus {
  if (isDangerStatus(fromDevice.status) || isDangerStatus(toDevice.status)) {
    return 'fault'
  }
  if (isWarningStatus(fromDevice.status) || isWarningStatus(toDevice.status)) {
    return 'warning'
  }
  if (fromDevice.currentCommandId || toDevice.currentCommandId) {
    return 'active'
  }
  return 'idle'
}

function isDangerStatus(status: string): boolean {
  const s = status.toUpperCase()
  return ['DANGER', 'ERROR', 'FAULT', 'E-STOP', 'ESTOP', 'EMERGENCY', 'ALARM'].some(
    keyword => s.includes(keyword)
  )
}

function isWarningStatus(status: string): boolean {
  const s = status.toUpperCase()
  return ['WARNING', 'WARN', 'RECONCILING', 'HOLD', 'BLOCKED'].some(
    keyword => s.includes(keyword)
  )
}

// ---------------------------------------------------------------------------
// Bezier Path Computation
// ---------------------------------------------------------------------------

/**
 * Compute an SVG cubic bezier path between two node positions.
 * Source: right-center of source node
 * Target: left-center of target node
 */
export function computeBezierPath(
  sourceX: number,
  sourceY: number,
  targetX: number,
  targetY: number,
  nodeWidth: number,
  nodeHeight: number
): string {
  const sx = sourceX + nodeWidth
  const sy = sourceY + nodeHeight / 2
  const tx = targetX
  const ty = targetY + nodeHeight / 2

  const dx = tx - sx
  const controlOffset = Math.min(Math.abs(dx) * 0.4, 80)

  const cx1 = sx + controlOffset
  const cy1 = sy
  const cx2 = tx - controlOffset
  const cy2 = ty

  return `M ${sx} ${sy} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${tx} ${ty}`
}

/**
 * Compute a simple horizontal bezier path for the linear strip layout.
 */
export function computeHorizontalPath(
  sourceX: number,
  sourceY: number,
  targetX: number,
  targetY: number,
  nodeWidth: number,
  nodeHeight: number
): string {
  return computeBezierPath(sourceX, sourceY, targetX, targetY, nodeWidth, nodeHeight)
}

// ---------------------------------------------------------------------------
// Full Layout Computation
// ---------------------------------------------------------------------------

/**
 * Compute the complete topology layout: node positions + edge paths.
 *
 * If `options.explicitNodes` is provided, layout includes those nodes
 * (devices and rack-positions) as first-class citizens. Otherwise the
 * layout is built from `devices` only, using `deriveEdges()` for edges.
 *
 * If `options.explicitEdges` is provided, those replace derived edges
 * (with DEVICE_ROLE refs fanned out across all matching devices).
 */
export function computeLayout(
  devices: RuntimeSceneDeviceNode[],
  config: LayoutConfig = DEFAULT_LAYOUT_CONFIG,
  rules: RoleColumnRule[] = DEFAULT_ROLE_COLUMN_RULES,
  options: ComputeLayoutOptions = {}
): LayoutResult {
  const hasExplicitNodes = Array.isArray(options.explicitNodes)
  const hasExplicitEdges = Array.isArray(options.explicitEdges)

  if (hasExplicitNodes || hasExplicitEdges) {
    return computeExplicitLayout(devices, config, rules, options)
  }

  return computeFallbackLayout(devices, config, rules)
}

// ---------------------------------------------------------------------------
// Fallback layout: devices only, derived edges
// ---------------------------------------------------------------------------

function computeFallbackLayout(
  devices: RuntimeSceneDeviceNode[],
  config: LayoutConfig,
  rules: RoleColumnRule[]
): LayoutResult {
  if (devices.length === 0) {
    return { nodes: [], edges: [], canvasWidth: 0, canvasHeight: 0 }
  }

  const columned = assignColumns(devices, rules)

  const columnMap = new Map<number, ColumnedDevice[]>()
  for (const cd of columned) {
    const group = columnMap.get(cd.column) ?? []
    group.push(cd)
    columnMap.set(cd.column, group)
  }

  const sortedColumns = [...columnMap.keys()].sort((a, b) => a - b)
  const columnCount = sortedColumns.length

  const nodePositionByDeviceId = new Map<
    number,
    { x: number; y: number; column: number; row: number }
  >()
  let maxColumnHeight = 0

  for (let displayCol = 0; displayCol < sortedColumns.length; displayCol++) {
    const originalCol = sortedColumns[displayCol]
    const group = columnMap.get(originalCol)!
    const columnX = config.paddingX + displayCol * (config.nodeWidth + config.columnGap)

    for (let row = 0; row < group.length; row++) {
      const device = group[row].device
      const y = config.paddingY + row * (config.nodeHeight + config.rowGap)
      nodePositionByDeviceId.set(device.id, { x: columnX, y, column: originalCol, row })
    }

    const columnHeight = group.length * config.nodeHeight + (group.length - 1) * config.rowGap
    maxColumnHeight = Math.max(maxColumnHeight, columnHeight)
  }

  const nodes: LayoutNode[] = devices.map(device => {
    const pos = nodePositionByDeviceId.get(device.id)!
    return {
      id: makeDeviceKey(device.id),
      kind: 'device',
      device,
      column: pos.column,
      row: pos.row,
      x: pos.x,
      y: pos.y,
    }
  })

  const derivedEdges = deriveEdges(columned)
  const edgesToRender = derivedEdges.length > 0 ? derivedEdges : deriveChainEdges(devices)
  const deviceMap = new Map(devices.map(d => [d.id, d]))

  const edges: LayoutEdge[] = edgesToRender.map(edge => {
    const fromPos = nodePositionByDeviceId.get(edge.fromDeviceId)!
    const toPos = nodePositionByDeviceId.get(edge.toDeviceId)!
    const fromDevice = deviceMap.get(edge.fromDeviceId)!
    const toDevice = deviceMap.get(edge.toDeviceId)!
    const fromKey = makeDeviceKey(edge.fromDeviceId)
    const toKey = makeDeviceKey(edge.toDeviceId)

    return {
      id: makeEdgeId(fromKey, toKey, 'MATERIAL_FLOW'),
      fromKey,
      toKey,
      type: 'MATERIAL_FLOW',
      status: deriveEdgeStatus(fromDevice, toDevice),
      path: computeBezierPath(
        fromPos.x,
        fromPos.y,
        toPos.x,
        toPos.y,
        config.nodeWidth,
        config.nodeHeight
      ),
    }
  })

  const canvasWidth =
    config.paddingX * 2 +
    columnCount * config.nodeWidth +
    (columnCount - 1) * config.columnGap
  const canvasHeight = config.paddingY * 2 + maxColumnHeight

  return { nodes, edges, canvasWidth, canvasHeight }
}

// ---------------------------------------------------------------------------
// Explicit layout: device + rack-position nodes, manifest-driven edges
// ---------------------------------------------------------------------------

interface ColumnedNodeInput {
  input: LayoutNodeInput
  column: number
}

function computeExplicitLayout(
  devices: RuntimeSceneDeviceNode[],
  config: LayoutConfig,
  rules: RoleColumnRule[],
  options: ComputeLayoutOptions
): LayoutResult {
  const explicitNodes = options.explicitNodes ?? []
  const explicitEdges = options.explicitEdges ?? []

  if (explicitNodes.length === 0 && explicitEdges.length === 0) {
    return { nodes: [], edges: [], canvasWidth: 0, canvasHeight: 0 }
  }

  // Index devices by role for fan-out resolution.
  // Stable ordering: roleIndex ascending, then id ascending.
  const devicesByRole = new Map<string, RuntimeSceneDeviceNode[]>()
  for (const device of devices) {
    const list = devicesByRole.get(device.deviceRole) ?? []
    list.push(device)
    devicesByRole.set(device.deviceRole, list)
  }
  for (const list of devicesByRole.values()) {
    list.sort((a, b) => {
      if (a.roleIndex !== b.roleIndex) return a.roleIndex - b.roleIndex
      return a.id - b.id
    })
  }

  // Step 1: assign columns to explicit device nodes via role rules; rack
  // positions get a placeholder column, refined after device columns settle.
  const explicitDeviceInputs = explicitNodes.filter(
    (n): n is LayoutDeviceNodeInput => n.kind === 'device'
  )
  const explicitDevices = explicitDeviceInputs.map(n => n.device)
  const columnedDevices = assignColumns(explicitDevices, rules)
  const deviceColumnByDeviceId = new Map<number, number>()
  for (const cd of columnedDevices) {
    deviceColumnByDeviceId.set(cd.device.id, cd.column)
  }

  // Step 2: derive rack-position columns based on adjacency in explicit edges.
  // Heuristic:
  //  - If a rack-position is the target of an edge whose source is a device,
  //    place it just right (column + 1) of the source's column.
  //  - If it's only the source of an edge whose target is a device, place it
  //    just left (column - 1) of the target's column.
  //  - If both, pick whichever rule yields the rightmost placement so it
  //    does not collide with an upstream device column.
  //  - For rack→rack edges, propagate columns through a simple 2-pass scan.
  //  - Rack positions with no edges fall to column 0.
  const rackPositionColumns = new Map<string, number>()
  for (const node of explicitNodes) {
    if (node.kind === 'rack_position') rackPositionColumns.set(node.code, 0)
  }

  const isRackKey = (key: string) => key.startsWith('rack:')
  const rackCodeFromKey = (key: string) => key.slice('rack:'.length)
  const deviceIdFromKey = (key: string) => Number(key.slice('device:'.length))

  function devicesInColumn(deviceKey: string): number | undefined {
    const id = deviceIdFromKey(deviceKey)
    return deviceColumnByDeviceId.get(id)
  }

  // First pass: rack columns from device-rack edges.
  for (const edge of explicitEdges) {
    if (isRackKey(edge.fromKey) && !isRackKey(edge.toKey)) {
      // rack -> device: rack sits at device.column - 1 (min 0)
      const targetCol = devicesInColumn(edge.toKey)
      if (targetCol !== undefined) {
        const code = rackCodeFromKey(edge.fromKey)
        const candidate = Math.max(0, targetCol - 1)
        const current = rackPositionColumns.get(code) ?? candidate
        rackPositionColumns.set(code, Math.min(current, candidate))
      }
    }
    if (!isRackKey(edge.fromKey) && isRackKey(edge.toKey)) {
      // device -> rack: rack sits at device.column + 1
      const sourceCol = devicesInColumn(edge.fromKey)
      if (sourceCol !== undefined) {
        const code = rackCodeFromKey(edge.toKey)
        const candidate = sourceCol + 1
        const current = rackPositionColumns.get(code) ?? candidate
        rackPositionColumns.set(code, Math.max(current, candidate))
      }
    }
  }

  // For rack -> rack edges (manifest can describe RACK→RACK material flow),
  // ensure target rack > source rack column. Iterate until stable (bounded
  // by rack count to avoid infinite loops).
  const rackNodeCount = rackPositionColumns.size
  for (let pass = 0; pass < rackNodeCount + 1; pass++) {
    let changed = false
    for (const edge of explicitEdges) {
      if (isRackKey(edge.fromKey) && isRackKey(edge.toKey)) {
        const fromCode = rackCodeFromKey(edge.fromKey)
        const toCode = rackCodeFromKey(edge.toKey)
        const fromCol = rackPositionColumns.get(fromCode) ?? 0
        const toCol = rackPositionColumns.get(toCode) ?? 0
        if (toCol <= fromCol) {
          rackPositionColumns.set(toCode, fromCol + 1)
          changed = true
        }
      }
    }
    if (!changed) break
  }

  // Step 3: place rack-position-only layouts (no devices) starting at column 0.
  // If there are no device columns at all, normalize rack columns to start at 0.
  if (explicitDevices.length === 0 && rackPositionColumns.size > 0) {
    const minCol = Math.min(...rackPositionColumns.values())
    if (minCol > 0) {
      for (const [code, col] of rackPositionColumns) {
        rackPositionColumns.set(code, col - minCol)
      }
    }
  }

  // Step 4: merge into a unified column map.
  const allInputs: ColumnedNodeInput[] = []
  for (const node of explicitNodes) {
    if (node.kind === 'device') {
      const col = deviceColumnByDeviceId.get(node.device.id) ?? 0
      allInputs.push({ input: node, column: col })
    } else {
      const col = rackPositionColumns.get(node.code) ?? 0
      allInputs.push({ input: node, column: col })
    }
  }

  const groupByColumn = new Map<number, ColumnedNodeInput[]>()
  for (const item of allInputs) {
    const list = groupByColumn.get(item.column) ?? []
    list.push(item)
    groupByColumn.set(item.column, list)
  }

  const sortedColumns = [...groupByColumn.keys()].sort((a, b) => a - b)
  const columnCount = sortedColumns.length

  const positions = new Map<
    string,
    { x: number; y: number; column: number; row: number }
  >()
  let maxColumnHeight = 0

  for (let displayCol = 0; displayCol < sortedColumns.length; displayCol++) {
    const originalCol = sortedColumns[displayCol]
    const group = groupByColumn.get(originalCol)!
    const columnX = config.paddingX + displayCol * (config.nodeWidth + config.columnGap)

    // Sort within column for stability
    const sortedGroup = [...group].sort((a, b) => {
      const ka = nodeKeyOf(a.input)
      const kb = nodeKeyOf(b.input)
      return ka.localeCompare(kb)
    })

    for (let row = 0; row < sortedGroup.length; row++) {
      const item = sortedGroup[row]
      const y = config.paddingY + row * (config.nodeHeight + config.rowGap)
      positions.set(nodeKeyOf(item.input), {
        x: columnX,
        y,
        column: originalCol,
        row,
      })
    }

    const columnHeight =
      sortedGroup.length * config.nodeHeight +
      Math.max(0, sortedGroup.length - 1) * config.rowGap
    maxColumnHeight = Math.max(maxColumnHeight, columnHeight)
  }

  const nodes: LayoutNode[] = explicitNodes.map(input => {
    const key = nodeKeyOf(input)
    const pos = positions.get(key)!
    if (input.kind === 'device') {
      return {
        id: key,
        kind: 'device',
        device: input.device,
        column: pos.column,
        row: pos.row,
        x: pos.x,
        y: pos.y,
      }
    }
    return {
      id: key,
      kind: 'rack_position',
      rackPosition: { code: input.code, label: input.label },
      column: pos.column,
      row: pos.row,
      x: pos.x,
      y: pos.y,
    }
  })

  // Step 5: build edges from explicit edges with DEVICE_ROLE fan-out.
  // We treat any device-keyed edge endpoint that does NOT match an explicit
  // device input as a potential role reference (DEVICE_ROLE), to be resolved
  // against `devicesByRole`. Callers building manifest edges typically pass
  // role-name-based keys via a different convention; for parity with the
  // `RuntimeSceneTopologyEdge` shape, we expose a helper:
  // `expandManifestEdgesForLayout()` below. The edges passed into this
  // engine are assumed to already reference concrete device keys (after
  // fan-out has been applied externally), OR refer to rack-position keys
  // we know about. Unknown keys are skipped silently.
  const knownKeys = new Set(positions.keys())
  const edges: LayoutEdge[] = []
  // Track id occurrence count to disambiguate manifest authors who declare
  // multiple edges with the same (fromKey, toKey, type) tuple. The first
  // occurrence keeps its base id (backward compat); subsequent occurrences
  // get an `:i1`, `:i2`, … suffix in input order to remain deterministic.
  const idOccurrences = new Map<string, number>()
  for (const edge of explicitEdges) {
    if (!knownKeys.has(edge.fromKey) || !knownKeys.has(edge.toKey)) {
      continue
    }
    const fromPos = positions.get(edge.fromKey)!
    const toPos = positions.get(edge.toKey)!
    const baseId = makeEdgeId(edge.fromKey, edge.toKey, edge.type)
    const seen = idOccurrences.get(baseId) ?? 0
    idOccurrences.set(baseId, seen + 1)
    const id = seen === 0 ? baseId : `${baseId}:i${seen}`
    edges.push({
      id,
      fromKey: edge.fromKey,
      toKey: edge.toKey,
      type: edge.type,
      status: edge.status ?? 'idle',
      path: computeBezierPath(
        fromPos.x,
        fromPos.y,
        toPos.x,
        toPos.y,
        config.nodeWidth,
        config.nodeHeight
      ),
    })
  }

  const canvasWidth =
    columnCount === 0
      ? 0
      : config.paddingX * 2 +
        columnCount * config.nodeWidth +
        Math.max(0, columnCount - 1) * config.columnGap
  const canvasHeight =
    columnCount === 0 ? 0 : config.paddingY * 2 + maxColumnHeight

  return { nodes, edges, canvasWidth, canvasHeight }
}

function nodeKeyOf(input: LayoutNodeInput): string {
  return input.kind === 'device' ? makeDeviceKey(input.device.id) : makeRackPositionKey(input.code)
}

function makeEdgeId(fromKey: string, toKey: string, type: LayoutEdgeType): string {
  return `${fromKey}->${toKey}:${type}`
}

// ---------------------------------------------------------------------------
// Manifest edge expansion helpers
// ---------------------------------------------------------------------------

/**
 * Manifest topology edge as exposed by `RuntimeSceneModel.topologyEdges`,
 * minus implementation details. Use `expandManifestEdgesForLayout()` to
 * convert these (with DEVICE_ROLE fan-out) into `ExplicitLayoutEdge[]`
 * suitable for passing to `computeLayout(..., { explicitEdges })`.
 */
export interface ManifestTopologyEdgeInput {
  fromNode: { kind: 'DEVICE_ROLE' | 'RACK_POSITION'; ref: string }
  toNode: { kind: 'DEVICE_ROLE' | 'RACK_POSITION'; ref: string }
  type: LayoutEdgeType
}

/**
 * Expand manifest-level topology edges into concrete layout edges:
 *  - DEVICE_ROLE refs fan out to all matching devices in
 *    `devicesByRole[ref]` (already sorted by roleIndex+id by caller)
 *  - RACK_POSITION refs map directly to rack-position keys
 *  - Unknown refs (no matching device or rack position) are silently
 *    skipped — the caller's diagnostic layer (scene model) is expected
 *    to surface them
 */
export function expandManifestEdgesForLayout(
  manifestEdges: ManifestTopologyEdgeInput[],
  devices: RuntimeSceneDeviceNode[],
  knownRackPositionCodes: ReadonlySet<string>
): ExplicitLayoutEdge[] {
  const devicesByRole = new Map<string, RuntimeSceneDeviceNode[]>()
  for (const device of devices) {
    const list = devicesByRole.get(device.deviceRole) ?? []
    list.push(device)
    devicesByRole.set(device.deviceRole, list)
  }
  for (const list of devicesByRole.values()) {
    list.sort((a, b) => {
      if (a.roleIndex !== b.roleIndex) return a.roleIndex - b.roleIndex
      return a.id - b.id
    })
  }

  const result: ExplicitLayoutEdge[] = []
  for (const edge of manifestEdges) {
    const fromKeys = resolveManifestEndpoint(edge.fromNode, devicesByRole, knownRackPositionCodes)
    const toKeys = resolveManifestEndpoint(edge.toNode, devicesByRole, knownRackPositionCodes)
    if (fromKeys.length === 0 || toKeys.length === 0) continue

    for (const fk of fromKeys) {
      for (const tk of toKeys) {
        result.push({ fromKey: fk, toKey: tk, type: edge.type })
      }
    }
  }
  return result
}

function resolveManifestEndpoint(
  endpoint: { kind: 'DEVICE_ROLE' | 'RACK_POSITION'; ref: string },
  devicesByRole: Map<string, RuntimeSceneDeviceNode[]>,
  knownRackPositionCodes: ReadonlySet<string>
): string[] {
  if (endpoint.kind === 'RACK_POSITION') {
    return knownRackPositionCodes.has(endpoint.ref)
      ? [makeRackPositionKey(endpoint.ref)]
      : []
  }
  const list = devicesByRole.get(endpoint.ref)
  if (!list || list.length === 0) return []
  return list.map(d => makeDeviceKey(d.id))
}

// ---------------------------------------------------------------------------
// Linear strip layout (unchanged behavior; string keys)
// ---------------------------------------------------------------------------

/**
 * Compute a simple linear horizontal layout for the topology strip.
 * All devices are in a single row.
 */
export function computeLinearLayout(
  devices: RuntimeSceneDeviceNode[],
  config: LayoutConfig = DEFAULT_LAYOUT_CONFIG
): LayoutResult {
  if (devices.length === 0) {
    return { nodes: [], edges: [], canvasWidth: 0, canvasHeight: 0 }
  }

  const nodes: LayoutNode[] = devices.map((device, index) => ({
    id: makeDeviceKey(device.id),
    kind: 'device',
    device,
    column: index,
    row: 0,
    x: config.paddingX + index * (config.nodeWidth + config.columnGap),
    y: config.paddingY,
  }))

  const edges: LayoutEdge[] = []

  for (let i = 0; i < devices.length - 1; i++) {
    const from = nodes[i]
    const to = nodes[i + 1]

    edges.push({
      id: makeEdgeId(from.id, to.id, 'MATERIAL_FLOW'),
      fromKey: from.id,
      toKey: to.id,
      type: 'MATERIAL_FLOW',
      status: deriveEdgeStatus(from.device!, to.device!),
      path: computeBezierPath(
        from.x,
        from.y,
        to.x,
        to.y,
        config.nodeWidth,
        config.nodeHeight
      ),
    })
  }

  const canvasWidth =
    config.paddingX * 2 +
    devices.length * config.nodeWidth +
    (devices.length - 1) * config.columnGap
  const canvasHeight = config.paddingY * 2 + config.nodeHeight

  return { nodes, edges, canvasWidth, canvasHeight }
}
