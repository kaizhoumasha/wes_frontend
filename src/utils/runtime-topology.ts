/**
 * Runtime Topology Layout Engine
 *
 * Pure functions for computing multi-column DAG topology layout
 * from a flat device node array. No Vue dependencies.
 *
 * Architecture:
 *   devices[] → assignColumns() → deriveEdges() → computeLayout() → { nodes[], edges[], canvasSize }
 */

import type { RuntimeSceneDeviceNode } from '@/utils/runtime-scene'

// ---------------------------------------------------------------------------
// Types
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

export interface LayoutNode {
  id: number
  device: RuntimeSceneDeviceNode
  column: number
  row: number
  x: number
  y: number
}

export type EdgeStatus = 'idle' | 'active' | 'warning' | 'fault'

export interface LayoutEdge {
  id: string
  fromNodeId: number
  toNodeId: number
  path: string
  status: EdgeStatus
}

export interface LayoutResult {
  nodes: LayoutNode[]
  edges: LayoutEdge[]
  canvasWidth: number
  canvasHeight: number
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
// Column Assignment
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
    // Match against both role and name — name often carries flow-position hints
    const matchText = `${device.deviceRole} ${device.deviceName}`
    const matchedRule = rules.find(r => r.pattern.test(matchText))
    if (matchedRule) {
      return { device, column: matchedRule.column }
    }
    // Fallback: proportional column assignment based on original order
    const fallbackColumn = devices.length <= 1
      ? 0
      : Math.round((index / (devices.length - 1)) * (fallbackColumnCount - 1))
    return { device, column: fallbackColumn }
  })
}

// ---------------------------------------------------------------------------
// Edge Derivation
// ---------------------------------------------------------------------------

interface DerivedEdge {
  fromNodeId: number
  toNodeId: number
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

  // Group by column
  const columnMap = new Map<number, RuntimeSceneDeviceNode[]>()
  for (const cd of columnedDevices) {
    const group = columnMap.get(cd.column) ?? []
    group.push(cd.device)
    columnMap.set(cd.column, group)
  }

  // Get sorted column indices
  const sortedColumns = [...columnMap.keys()].sort((a, b) => a - b)
  if (sortedColumns.length < 2) return edges

  // Connect adjacent non-empty columns
  for (let i = 0; i < sortedColumns.length - 1; i++) {
    const sourceCol = columnMap.get(sortedColumns[i])!
    const targetCol = columnMap.get(sortedColumns[i + 1])!

    if (sourceCol.length === 0 || targetCol.length === 0) continue

    // Generate connections between source and target columns
    if (sourceCol.length === targetCol.length) {
      // 1:1 mapping
      for (let j = 0; j < sourceCol.length; j++) {
        edges.push({ fromNodeId: sourceCol[j].id, toNodeId: targetCol[j].id })
      }
    } else if (sourceCol.length < targetCol.length) {
      // Fan-out: each source connects to proportional targets
      for (const src of sourceCol) {
        const startIdx = Math.round(
          (sourceCol.indexOf(src) / sourceCol.length) * targetCol.length
        )
        const endIdx = Math.round(
          ((sourceCol.indexOf(src) + 1) / sourceCol.length) * targetCol.length
        )
        for (let j = startIdx; j < endIdx && j < targetCol.length; j++) {
          edges.push({ fromNodeId: src.id, toNodeId: targetCol[j].id })
        }
      }
    } else {
      // Fan-in: each target connects from proportional sources
      for (const tgt of targetCol) {
        const startIdx = Math.round(
          (targetCol.indexOf(tgt) / targetCol.length) * sourceCol.length
        )
        const endIdx = Math.round(
          ((targetCol.indexOf(tgt) + 1) / targetCol.length) * sourceCol.length
        )
        for (let j = startIdx; j < endIdx && j < sourceCol.length; j++) {
          edges.push({ fromNodeId: sourceCol[j].id, toNodeId: tgt.id })
        }
      }
    }
  }

  return edges
}

// ---------------------------------------------------------------------------
// Edge Status Derivation
// ---------------------------------------------------------------------------

/**
 * Derive edge status from connected device states.
 */
export function deriveEdgeStatus(
  fromDevice: RuntimeSceneDeviceNode,
  toDevice: RuntimeSceneDeviceNode
): EdgeStatus {
  // Danger takes priority
  if (isDangerStatus(fromDevice.status) || isDangerStatus(toDevice.status)) {
    return 'fault'
  }
  // Warning
  if (isWarningStatus(fromDevice.status) || isWarningStatus(toDevice.status)) {
    return 'warning'
  }
  // Active (device has ongoing command)
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
 */
export function computeLayout(
  devices: RuntimeSceneDeviceNode[],
  config: LayoutConfig = DEFAULT_LAYOUT_CONFIG,
  rules: RoleColumnRule[] = DEFAULT_ROLE_COLUMN_RULES
): LayoutResult {
  if (devices.length === 0) {
    return { nodes: [], edges: [], canvasWidth: 0, canvasHeight: 0 }
  }

  // Step 1: Assign columns
  const columned = assignColumns(devices, rules)

  // Step 2: Group by column and compute positions
  const columnMap = new Map<number, ColumnedDevice[]>()
  for (const cd of columned) {
    const group = columnMap.get(cd.column) ?? []
    group.push(cd)
    columnMap.set(cd.column, group)
  }

  const sortedColumns = [...columnMap.keys()].sort((a, b) => a - b)
  const columnCount = sortedColumns.length

  // Compute node positions (normalize column indices to start at 0)
  const nodePositionMap = new Map<number, { x: number; y: number; column: number; row: number }>()
  let maxColumnHeight = 0

  for (let displayCol = 0; displayCol < sortedColumns.length; displayCol++) {
    const originalCol = sortedColumns[displayCol]
    const group = columnMap.get(originalCol)!
    const columnX = config.paddingX + displayCol * (config.nodeWidth + config.columnGap)

    for (let row = 0; row < group.length; row++) {
      const device = group[row].device
      const y = config.paddingY + row * (config.nodeHeight + config.rowGap)

      nodePositionMap.set(device.id, {
        x: columnX,
        y,
        column: originalCol,
        row,
      })
    }

    const columnHeight = group.length * config.nodeHeight + (group.length - 1) * config.rowGap
    maxColumnHeight = Math.max(maxColumnHeight, columnHeight)
  }

  // Build layout nodes
  const nodes: LayoutNode[] = devices.map(device => {
    const pos = nodePositionMap.get(device.id)!
    return {
      id: device.id,
      device,
      column: pos.column,
      row: pos.row,
      x: pos.x,
      y: pos.y,
    }
  })

  // Step 3: Derive and compute edges
  const derivedEdges = deriveEdges(columned)
  const deviceMap = new Map(devices.map(d => [d.id, d]))

  const edges: LayoutEdge[] = derivedEdges.map(edge => {
    const fromPos = nodePositionMap.get(edge.fromNodeId)!
    const toPos = nodePositionMap.get(edge.toNodeId)!
    const fromDevice = deviceMap.get(edge.fromNodeId)!
    const toDevice = deviceMap.get(edge.toNodeId)!

    return {
      id: `edge-${edge.fromNodeId}-${edge.toNodeId}`,
      fromNodeId: edge.fromNodeId,
      toNodeId: edge.toNodeId,
      path: computeBezierPath(
        fromPos.x,
        fromPos.y,
        toPos.x,
        toPos.y,
        config.nodeWidth,
        config.nodeHeight
      ),
      status: deriveEdgeStatus(fromDevice, toDevice),
    }
  })

  // Canvas dimensions
  const canvasWidth =
    config.paddingX * 2 +
    columnCount * config.nodeWidth +
    (columnCount - 1) * config.columnGap
  const canvasHeight = config.paddingY * 2 + maxColumnHeight

  return { nodes, edges, canvasWidth, canvasHeight }
}

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
    id: device.id,
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
      id: `edge-${from.id}-${to.id}`,
      fromNodeId: from.id,
      toNodeId: to.id,
      path: computeBezierPath(
        from.x,
        from.y,
        to.x,
        to.y,
        config.nodeWidth,
        config.nodeHeight
      ),
      status: deriveEdgeStatus(from.device, to.device),
    })
  }

  const canvasWidth =
    config.paddingX * 2 +
    devices.length * config.nodeWidth +
    (devices.length - 1) * config.columnGap
  const canvasHeight = config.paddingY * 2 + config.nodeHeight

  return { nodes, edges, canvasWidth, canvasHeight }
}
