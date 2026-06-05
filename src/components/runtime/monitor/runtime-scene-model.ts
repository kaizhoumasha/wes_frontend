import type {
  RuntimeSceneFlow,
  RuntimeSceneGap,
  RuntimeSceneLane,
  RuntimeSceneModel,
  RuntimeSceneNode,
  RuntimeSceneNodeBadge,
  RuntimeSceneNodeState,
  RuntimeSceneOverlay,
  RuntimeScenePluginManifestSummary,
  RuntimeTraceDevicePathNode,
  RuntimeTraceListItem,
  RuntimeWorklineDetailResponse,
  RuntimeWorklineDeviceItem
} from '@/types/runtime'

export interface BuildRuntimeSceneModelOptions {
  manifest?: RuntimeScenePluginManifestSummary | null
  manifestError?: unknown
  selectedDeviceId?: number | null
  tracePathNodes?: RuntimeTraceDevicePathNode[]
  blockingDeviceId?: number | null
}

const UNCATEGORIZED_ROLE = '__uncategorized__'

function normalizeRole(role?: string | null): string {
  return role?.trim() || UNCATEGORIZED_ROLE
}

function roleLabel(role: string): string {
  return role === UNCATEGORIZED_ROLE ? '未归类设备' : role
}

function laneId(role: string): string {
  return `role:${role}`
}

function nodeId(deviceId: number): string {
  return `device:${deviceId}`
}

function gapId(role: string): string {
  return `gap:${role}`
}

function getOpenCommandCount(device: RuntimeWorklineDeviceItem): number {
  return device.open_command_count ?? device.pending_command_count ?? 0
}

function getRuntimeHoldCount(device: RuntimeWorklineDeviceItem): number {
  return device.active_runtime_hold_ids?.length || device.open_issue_count || 0
}

function getSessionOwnerDeviceId(session: RuntimeTraceListItem): number | null | undefined {
  return session.current_device_id ?? session.device_id
}

function getActiveSessionCount(deviceId: number, sessions: RuntimeTraceListItem[]): number {
  return sessions.filter(session => getSessionOwnerDeviceId(session) === deviceId).length
}

function getNodeState(device: RuntimeWorklineDeviceItem, activeSessionCount: number): RuntimeSceneNodeState {
  if (device.error_code) return 'error'
  if (getRuntimeHoldCount(device) > 0) return 'hold'
  if ((device.blocked_outbox_count ?? 0) > 0 || activeSessionCount > 0) return 'waiting'
  if (device.current_command_id || getOpenCommandCount(device) > 0) return 'running'
  return 'idle'
}

function createBadges(
  device: RuntimeWorklineDeviceItem,
  activeSessionCount: number
): RuntimeSceneNodeBadge[] {
  const badges: RuntimeSceneNodeBadge[] = []
  if (device.current_command_id) {
    badges.push({ kind: 'current-command', label: '执行中', tone: 'primary' })
  }
  const openCommandCount = getOpenCommandCount(device)
  if (openCommandCount > 0) {
    badges.push({
      kind: 'open-command',
      label: `${openCommandCount} 未完成命令`,
      tone: 'warning',
      count: openCommandCount
    })
  }
  const holdCount = getRuntimeHoldCount(device)
  if (holdCount > 0) {
    badges.push({
      kind: 'runtime-hold',
      label: `Runtime Hold ${holdCount}`,
      tone: 'danger',
      count: holdCount
    })
  }
  const parkedCount = device.blocked_outbox_count ?? 0
  if (parkedCount > 0) {
    badges.push({
      kind: 'parked-outbox',
      label: `${parkedCount} 已停靠`,
      tone: 'warning',
      count: parkedCount
    })
  }
  if (activeSessionCount > 0) {
    badges.push({
      kind: 'active-session',
      label: `${activeSessionCount} 活跃 Session`,
      tone: 'info',
      count: activeSessionCount
    })
  }
  return badges
}

function createManifestLanes(
  manifest: RuntimeScenePluginManifestSummary | null | undefined
): RuntimeSceneLane[] {
  return (manifest?.required_device_roles ?? []).map((role, index) => {
    const normalizedRole = normalizeRole(role.role)
    return {
      id: laneId(normalizedRole),
      label: roleLabel(normalizedRole),
      role: normalizedRole,
      order: index,
      kind: 'manifest'
    }
  })
}

function compareDevices(a: RuntimeWorklineDeviceItem, b: RuntimeWorklineDeviceItem): number {
  return a.role_index - b.role_index || a.id - b.id
}

function createFallbackLanes(
  devices: RuntimeWorklineDeviceItem[],
  existingRoles: Set<string>
): RuntimeSceneLane[] {
  const roles = [...devices]
    .sort(compareDevices)
    .map(device => normalizeRole(device.device_role))
    .filter((role, index, allRoles) => !existingRoles.has(role) && allRoles.indexOf(role) === index)

  return roles.map((role, index) => ({
    id: laneId(role),
    label: roleLabel(role),
    role,
    order: 1000 + index,
    kind: role === UNCATEGORIZED_ROLE ? 'uncategorized' : 'fallback'
  }))
}

function createFlows(
  devices: RuntimeWorklineDeviceItem[],
  lanes: RuntimeSceneLane[]
): RuntimeSceneFlow[] {
  const devicesById = new Map(devices.map(device => [device.id, device]))
  const roleOrder = new Map(
    lanes
      .filter(lane => lane.kind === 'manifest')
      .map((lane, index) => [lane.role, index])
  )
  const orderedDevices = [...devices].sort((a, b) => {
    const aRoleOrder = roleOrder.get(normalizeRole(a.device_role))
    const bRoleOrder = roleOrder.get(normalizeRole(b.device_role))
    if (aRoleOrder !== undefined && bRoleOrder !== undefined && aRoleOrder !== bRoleOrder) {
      return aRoleOrder - bRoleOrder
    }
    if (aRoleOrder !== undefined && bRoleOrder === undefined) return -1
    if (aRoleOrder === undefined && bRoleOrder !== undefined) return 1
    return compareDevices(a, b)
  })
  const upstreamTargetIds = new Set<number>()
  const upstreamFlows = devices.flatMap(device => {
    const upstreamDeviceId = device.upstream_device_id
    if (!upstreamDeviceId || !devicesById.has(upstreamDeviceId)) return []
    upstreamTargetIds.add(device.id)
    return [
      {
        id: `flow:${upstreamDeviceId}:${device.id}`,
        fromNodeId: nodeId(upstreamDeviceId),
        toNodeId: nodeId(device.id),
        source: 'upstream' as const
      }
    ]
  })
  const existingFlowIds = new Set(upstreamFlows.map(flow => flow.id))

  const fallbackFlows = orderedDevices.slice(1).flatMap((device, index) => {
    if (upstreamTargetIds.has(device.id)) return []
    const previous = orderedDevices[index]
    const id = `flow:${previous.id}:${device.id}`
    if (existingFlowIds.has(id)) return []
    return [
      {
        id,
        fromNodeId: nodeId(previous.id),
        toNodeId: nodeId(device.id),
        source: 'fallback-order' as const
      }
    ]
  })

  return [...upstreamFlows, ...fallbackFlows]
}

function createOverlays(
  detail: RuntimeWorklineDetailResponse,
  blockingDeviceId?: number | null
): RuntimeSceneOverlay[] {
  const overlays: RuntimeSceneOverlay[] = []
  const activeDeviceIds = new Set<number>()

  for (const session of detail.active_sessions ?? []) {
    const deviceId = getSessionOwnerDeviceId(session)
    if (!deviceId || activeDeviceIds.has(deviceId)) continue
    activeDeviceIds.add(deviceId)
    overlays.push({
      id: `active-session:${deviceId}`,
      kind: 'active-session',
      deviceId,
      label: '活跃 Session',
      tone: 'info'
    })
  }

  if (blockingDeviceId) {
    overlays.push({
      id: `blocking-device:${blockingDeviceId}`,
      kind: 'blocking-device',
      deviceId: blockingDeviceId,
      label: '阻塞点',
      tone: 'danger'
    })
  }

  return overlays
}

function createGaps(
  manifest: RuntimeScenePluginManifestSummary | null | undefined,
  devices: RuntimeWorklineDeviceItem[]
): RuntimeSceneGap[] {
  const deviceCountByRole = devices.reduce((counts, device) => {
    const role = normalizeRole(device.device_role)
    counts.set(role, (counts.get(role) ?? 0) + 1)
    return counts
  }, new Map<string, number>())

  return (manifest?.required_device_roles ?? []).flatMap(role => {
    const normalizedRole = normalizeRole(role.role)
    const actualCount = deviceCountByRole.get(normalizedRole) ?? 0
    if (actualCount >= role.min_count) return []
    return [
      {
        id: gapId(normalizedRole),
        role: normalizedRole,
        label: roleLabel(normalizedRole),
        requiredCount: role.min_count,
        actualCount
      }
    ]
  })
}

function createManifestWarning(manifestError?: unknown): string | null {
  return manifestError ? '插件语义未加载，按设备角色原样展示' : null
}

export function buildRuntimeSceneModel(
  detail: RuntimeWorklineDetailResponse,
  options: BuildRuntimeSceneModelOptions = {}
): RuntimeSceneModel {
  const manifest = options.manifest ?? null
  const devices = [...(detail.devices ?? [])].sort(compareDevices)
  const manifestLanes = createManifestLanes(manifest)
  const manifestRoles = new Set(manifestLanes.map(lane => lane.role))
  const lanes = [...manifestLanes, ...createFallbackLanes(devices, manifestRoles)].sort(
    (a, b) => a.order - b.order || a.label.localeCompare(b.label)
  )
  const traceCurrentDeviceIds = new Set(
    (options.tracePathNodes ?? []).filter(node => node.is_current).map(node => node.device_id)
  )

  const nodes: RuntimeSceneNode[] = devices.map(device => {
    const role = normalizeRole(device.device_role)
    const activeSessionCount = getActiveSessionCount(device.id, detail.active_sessions ?? [])
    return {
      id: nodeId(device.id),
      deviceId: device.id,
      laneId: laneId(role),
      role,
      roleIndex: device.role_index,
      deviceCode: device.device_code,
      deviceName: device.device_name,
      status: device.device_status,
      state: getNodeState(device, activeSessionCount),
      isSelected: options.selectedDeviceId === device.id,
      isCurrent: traceCurrentDeviceIds.has(device.id),
      maintenanceMode: device.maintenance_mode,
      errorCode: device.error_code,
      badges: createBadges(device, activeSessionCount)
    }
  })

  return {
    workline: detail.summary,
    verdict: {
      status: detail.summary.runtime_status,
      label: detail.summary.runtime_status || 'UNKNOWN',
      manifestLoaded: manifest !== null,
      manifestWarning: createManifestWarning(options.manifestError)
    },
    lanes,
    nodes,
    flows: createFlows(devices, lanes),
    overlays: createOverlays(detail, options.blockingDeviceId),
    gaps: createGaps(manifest, devices)
  }
}
