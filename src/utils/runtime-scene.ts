import type {
  RuntimeRackOperationWait,
  RuntimeResourceEvidenceItem,
  RuntimeResourceEvidenceKind,
  RuntimeResourceKind,
  RuntimeSingleLayerRackSnapshot,
  RuntimeStationLease,
  RuntimeWorklineDetailResponse,
  RuntimeWorklineDeviceItem,
  RuntimeWorklineReadiness,
  WorkLinePluginManifestSummary,
  WorkLineSingleLayerRackBoundarySummary
} from '@/types/runtime'

export interface RuntimeSceneBoundary {
  key: string
  stationRole: string
  stationCode: string
  positionCode: string
  rackKind: string
  snapshotKind?: string | null
  stationLease: RuntimeStationLease
  stationLeaseLabel: string
  rackSnapshot: RuntimeSingleLayerRackSnapshot
  rackSnapshotLabel: string
  rackOperationWait: RuntimeRackOperationWait
  rackOperationWaitLabel: string
  resourceEvidenceKind: RuntimeResourceEvidenceKind
  resourceEvidenceKindLabel: string
  evidenceCount: number
}

export interface RuntimeSceneDeviceNode {
  id: number
  deviceCode: string
  deviceName: string
  deviceRole: string
  roleIndex: number
  status: string
  maintenanceMode: boolean
  currentCommandId?: number | null
  openCommandCount: number
  blockedOutboxCount: number
  runtimeHoldCount: number
  errorCode?: string | null
}

export interface RuntimeSceneResourceEvidence {
  resourceKind: RuntimeResourceKind
  resourceKindLabel: string
  resourceCode: string
  displayLabel: string
  evidenceKind: RuntimeResourceEvidenceKind
  evidenceKindLabel: string
  stationCode?: string | null
  positionCode?: string | null
  rackCode?: string | null
  binCode?: string | null
  slotCode?: string | null
  pkgCode?: string | null
  partSn?: string | null
  sourceSessionId?: number | null
  sourceTraceId?: string | null
  occurredAt?: string | null
}

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

export interface RuntimeSceneModel {
  worklineId: number
  worklineName: string
  worklineCode: string
  readiness: RuntimeWorklineReadiness
  readinessLabel: string
  runtimeStatusLabel: string
  boundaries: RuntimeSceneBoundary[]
  deviceNodes: RuntimeSceneDeviceNode[]
  resourceEvidence: RuntimeSceneResourceEvidence[]
  positionGroups: RuntimeScenePositionGroup[]
  unlocatedAuditItems: RuntimeSceneResourceEvidence[]
  resourceEvidenceTotalCount: number
  resourceEvidenceTruncated: boolean
  semanticFallback: boolean
  semanticFallbackMessage: string | null
}

export interface BuildRuntimeSceneModelInput {
  detail: RuntimeWorklineDetailResponse
  manifest?: WorkLinePluginManifestSummary | null
  manifestLoadFailed?: boolean
}

interface RuntimeSceneEvidencePlacement {
  item: RuntimeSceneResourceEvidence
  physicalPositionKey: string | null
}

const READINESS_VALUES = ['READY', 'NOT_READY', 'UNKNOWN'] as const
const STATION_LEASE_VALUES = [
  'IDLE',
  'ACTIVE_RACK_BOUND',
  'ACTIVE_DISPATCH_LEASE',
  'ACTIVE_SESSION_BOUND',
  'UNKNOWN'
] as const
const RACK_SNAPSHOT_VALUES = [
  'ACTIVE',
  'MISSING',
  'INVALID',
  'NON_SINGLE_LAYER_EVIDENCE',
  'UNKNOWN'
] as const
const RACK_OPERATION_WAIT_VALUES = [
  'WAITING_WMS',
  'WMS_CALLBACK_RECEIVED',
  'TIMEOUT',
  'FAILED',
  'NONE',
  'UNKNOWN'
] as const
const EVIDENCE_KIND_VALUES = [
  'WES_ACTIVE_SNAPSHOT',
  'WMS_CALLBACK_EVIDENCE',
  'TRACE_RESOURCE_EVIDENCE',
  'GENERIC_EVIDENCE',
  'UNKNOWN'
] as const
const RESOURCE_KIND_VALUES = [
  'RACK',
  'BIN',
  'PKG',
  'SLOT',
  'CELL',
  'MAGAZINE',
  'PART_SN',
  'UNKNOWN'
] as const

const READINESS_LABELS: Record<RuntimeWorklineReadiness, string> = {
  READY: '待机 / 可接收生产事件',
  NOT_READY: '未就绪，暂不可接收',
  UNKNOWN: '准入语义未加载'
}

const STATION_LEASE_LABELS: Record<RuntimeStationLease, string> = {
  IDLE: 'Station lease：空闲',
  ACTIVE_RACK_BOUND: 'Station lease：执行货架占用',
  ACTIVE_DISPATCH_LEASE: 'Station lease：调度租约占用',
  ACTIVE_SESSION_BOUND: 'Station lease：会话占用',
  UNKNOWN: 'Station lease：语义未加载'
}

const RACK_SNAPSHOT_LABELS: Record<RuntimeSingleLayerRackSnapshot, string> = {
  ACTIVE: '执行快照：当前执行货架',
  MISSING: '执行快照：未找到当前执行货架',
  INVALID: '执行快照：无效',
  NON_SINGLE_LAYER_EVIDENCE: '执行快照：非单层 evidence',
  UNKNOWN: '执行快照：语义未加载'
}

const RACK_OPERATION_WAIT_LABELS: Record<RuntimeRackOperationWait, string> = {
  WAITING_WMS: 'Rack operation：等待 WMS 搬运到位',
  WMS_CALLBACK_RECEIVED: 'Rack operation：WMS 回调证据已收到',
  TIMEOUT: 'Rack operation：等待 WMS 超时',
  FAILED: 'Rack operation：WMS 搬运结果失败',
  NONE: 'Rack operation：无等待',
  UNKNOWN: 'Rack operation：语义未加载'
}

const EVIDENCE_KIND_LABELS: Record<RuntimeResourceEvidenceKind, string> = {
  WES_ACTIVE_SNAPSHOT: 'WES active snapshot evidence',
  WMS_CALLBACK_EVIDENCE: 'WMS 回调证据',
  TRACE_RESOURCE_EVIDENCE: 'Trace 资源证据',
  GENERIC_EVIDENCE: '通用 evidence',
  UNKNOWN: '证据语义未加载'
}

const RESOURCE_KIND_LABELS: Record<RuntimeResourceKind, string> = {
  RACK: 'Rack',
  BIN: 'Bin',
  PKG: 'PKG',
  SLOT: 'Slot',
  CELL: 'Cell',
  MAGAZINE: 'Magazine',
  PART_SN: 'Part SN',
  UNKNOWN: 'Unknown'
}

const LEGACY_NG_ARM_ROLE = 'NG_ARM'
const NG_PLACEMENT_DISPLAY_ROLE = 'TARGET_ARM'

export function getRuntimeSceneEvidenceKey(item: RuntimeSceneResourceEvidence): string {
  return [
    item.evidenceKind,
    item.resourceKind,
    item.resourceCode,
    item.sourceSessionId ?? '',
    item.sourceTraceId ?? '',
    item.stationCode ? normalizeRuntimeSceneDisplayRole(item.stationCode) : '',
    item.positionCode ?? ''
  ].join(':')
}

export function buildRuntimeSceneModel(input: BuildRuntimeSceneModelInput): RuntimeSceneModel {
  const { detail, manifest, manifestLoadFailed = false } = input
  const detailRecord = detail as RuntimeWorklineDetailResponse & Record<string, unknown>
  const resourceEvidenceItems = Array.isArray(detailRecord.resource_evidence_items)
    ? (detailRecord.resource_evidence_items as RuntimeResourceEvidenceItem[])
    : []
  const hasManifestBoundaries = Boolean(manifest?.single_layer_boundaries?.length)
  const hasRuntimeSceneSemantics =
    hasRuntimeSceneContractFields(detailRecord) &&
    manifestLoadFailed === false &&
    hasManifestBoundaries
  const readiness = normalizeEnum(
    detailRecord.workline_readiness,
    READINESS_VALUES,
    'UNKNOWN'
  ) as RuntimeWorklineReadiness
  const resourceEvidence = resourceEvidenceItems.map(toSceneResourceEvidence)
  const resolvedBoundaries = resolveBoundaries(
    detail,
    manifest,
    resourceEvidence,
    hasRuntimeSceneSemantics
  )
  const evidencePlacements = resolveResourceEvidencePlacements(
    resolvedBoundaries,
    resourceEvidence,
    !hasManifestBoundaries
  )
  const boundaries = applyBoundaryEvidenceCounts(resolvedBoundaries, evidencePlacements)
  const positionGroups = buildPositionGroups(boundaries, evidencePlacements)
  const unlocatedAuditItems = getUnlocatedAuditItems(evidencePlacements)
  const semanticFallbackMessage = getSemanticFallbackMessage(
    detailRecord,
    manifest,
    manifestLoadFailed
  )

  return {
    worklineId: detail.summary.id,
    worklineName: detail.summary.line_name,
    worklineCode: detail.summary.line_code,
    readiness,
    readinessLabel: READINESS_LABELS[readiness],
    runtimeStatusLabel: toRuntimeStatusLabel(detail.summary.runtime_status),
    boundaries,
    deviceNodes: detail.devices.map(toRuntimeSceneDeviceNode),
    resourceEvidence,
    positionGroups,
    unlocatedAuditItems,
    resourceEvidenceTotalCount:
      isFiniteNumber(detailRecord.resource_evidence_total_count)
        ? detailRecord.resource_evidence_total_count
        : resourceEvidence.length,
    resourceEvidenceTruncated:
      typeof detailRecord.resource_evidence_truncated === 'boolean'
        ? detailRecord.resource_evidence_truncated
        : false,
    semanticFallback: Boolean(semanticFallbackMessage),
    semanticFallbackMessage
  }
}

function resolveBoundaries(
  detail: RuntimeWorklineDetailResponse,
  manifest: WorkLinePluginManifestSummary | null | undefined,
  resourceEvidence: RuntimeSceneResourceEvidence[],
  hasRuntimeSceneSemantics: boolean
): RuntimeSceneBoundary[] {
  const manifestBoundaries = manifest?.single_layer_boundaries ?? []
  if (manifestBoundaries.length > 0) {
    return manifestBoundaries.map(boundary =>
      toSceneBoundary(boundary, detail, hasRuntimeSceneSemantics)
    )
  }

  return getFallbackBoundarySummaries(resourceEvidence).map(boundary =>
    toSceneBoundary(boundary, detail, hasRuntimeSceneSemantics)
  )
}

function getFallbackBoundarySummaries(
  resourceEvidence: RuntimeSceneResourceEvidence[]
): WorkLineSingleLayerRackBoundarySummary[] {
  const seenPhysicalPositionKeys = new Set<string>()
  const boundaries: WorkLineSingleLayerRackBoundarySummary[] = []

  for (const item of resourceEvidence) {
    if (!item.positionCode) continue

    const stationCode = item.stationCode
      ? normalizeRuntimeSceneDisplayRole(item.stationCode)
      : item.positionCode
    const physicalPositionKey = getPhysicalPositionKey(stationCode, item.positionCode)
    if (seenPhysicalPositionKeys.has(physicalPositionKey)) continue

    seenPhysicalPositionKeys.add(physicalPositionKey)
    boundaries.push({
      station_role: stationCode,
      station_code: stationCode,
      position_code: item.positionCode,
      rack_kind: 'UNKNOWN',
      snapshot_kind: 'UNKNOWN',
      lease_scope: 'UNKNOWN',
      business_demand_type: 'UNKNOWN',
      wms_operation_type: 'UNKNOWN'
    })
  }

  return boundaries
}

function toSceneBoundary(
  boundary: WorkLineSingleLayerRackBoundarySummary,
  detail: RuntimeWorklineDetailResponse,
  hasRuntimeSceneSemantics: boolean
): RuntimeSceneBoundary {
  const detailRecord = detail as RuntimeWorklineDetailResponse & Record<string, unknown>
  const stationLease = hasRuntimeSceneSemantics
    ? (normalizeEnum(detailRecord.station_lease, STATION_LEASE_VALUES, 'UNKNOWN') as RuntimeStationLease)
    : 'UNKNOWN'
  const rackSnapshot = hasRuntimeSceneSemantics
    ? (normalizeEnum(
        detailRecord.single_layer_rack_snapshot,
        RACK_SNAPSHOT_VALUES,
        'UNKNOWN'
      ) as RuntimeSingleLayerRackSnapshot)
    : 'UNKNOWN'
  const rackOperationWait = hasRuntimeSceneSemantics
    ? (normalizeEnum(
        detailRecord.rack_operation_wait,
        RACK_OPERATION_WAIT_VALUES,
        'UNKNOWN'
      ) as RuntimeRackOperationWait)
    : 'UNKNOWN'
  const resourceEvidenceKind = hasRuntimeSceneSemantics
    ? (normalizeEnum(
        detailRecord.resource_evidence_kind,
        EVIDENCE_KIND_VALUES,
        'GENERIC_EVIDENCE'
      ) as RuntimeResourceEvidenceKind)
    : 'GENERIC_EVIDENCE'
  const stationRole = normalizeRuntimeSceneDisplayRole(boundary.station_role)
  const stationCode = normalizeRuntimeSceneDisplayRole(boundary.station_code)

  return {
    key: getBoundaryKey(boundary),
    stationRole,
    stationCode,
    positionCode: boundary.position_code,
    rackKind: boundary.rack_kind,
    snapshotKind: boundary.snapshot_kind,
    stationLease,
    stationLeaseLabel: STATION_LEASE_LABELS[stationLease],
    rackSnapshot,
    rackSnapshotLabel: RACK_SNAPSHOT_LABELS[rackSnapshot],
    rackOperationWait,
    rackOperationWaitLabel: RACK_OPERATION_WAIT_LABELS[rackOperationWait],
    resourceEvidenceKind,
    resourceEvidenceKindLabel: EVIDENCE_KIND_LABELS[resourceEvidenceKind],
    evidenceCount: 0
  }
}

function getBoundaryKey(boundary: WorkLineSingleLayerRackBoundarySummary): string {
  return [
    normalizeRuntimeSceneDisplayRole(boundary.station_role),
    normalizeRuntimeSceneDisplayRole(boundary.station_code),
    boundary.position_code,
    boundary.rack_kind,
    boundary.snapshot_kind ?? '',
    boundary.lease_scope,
    boundary.business_demand_type,
    boundary.wms_operation_type
  ].join(':')
}

function derivePositionAttentionState(
  boundary: RuntimeSceneBoundary
): RuntimeSceneAttentionState {
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
      displayLabel: getResourceStackAnchorDisplayLabel(item, 'RACK', item.rackCode)
    }
  }
  if (item.binCode) {
    return {
      kind: 'BIN',
      code: item.binCode,
      displayLabel: getResourceStackAnchorDisplayLabel(item, 'BIN', item.binCode)
    }
  }
  return {
    kind: item.resourceKind,
    code: item.resourceCode,
    displayLabel: item.displayLabel
  }
}

function getResourceStackAnchorDisplayLabel(
  item: RuntimeSceneResourceEvidence,
  kind: RuntimeResourceKind,
  code: string
): string {
  if (item.resourceKind === kind && item.resourceCode === code) return item.displayLabel
  return `${RESOURCE_KIND_LABELS[kind]} ${code}`
}

function toResourceStackChild(
  item: RuntimeSceneResourceEvidence
): RuntimeSceneResourceStackChild {
  return {
    key: getRuntimeSceneEvidenceKey(item),
    kind: item.resourceKind,
    code: item.resourceCode,
    displayLabel: item.displayLabel,
    evidenceKind: item.evidenceKind
  }
}

function appendUniqueEvidenceKind(
  target: RuntimeResourceEvidenceKind[],
  kind: RuntimeResourceEvidenceKind
): void {
  if (!target.includes(kind)) {
    target.push(kind)
  }
}

function getPhysicalPositionKey(
  stationCode: string | null | undefined,
  positionCode: string
): string {
  return `${stationCode ? normalizeRuntimeSceneDisplayRole(stationCode) : ''}:${positionCode}`
}

function resolveResourceEvidencePlacements(
  boundaries: RuntimeSceneBoundary[],
  resourceEvidence: RuntimeSceneResourceEvidence[],
  preferStationlessFallbackBoundary: boolean
): RuntimeSceneEvidencePlacement[] {
  const physicalPositionKeysByPosition = getPhysicalPositionKeysByPosition(boundaries)
  return resourceEvidence.map(item => ({
    item,
    physicalPositionKey: resolveEvidencePhysicalPositionKey(
      item,
      physicalPositionKeysByPosition,
      preferStationlessFallbackBoundary
    )
  }))
}

function getPhysicalPositionKeysByPosition(
  boundaries: RuntimeSceneBoundary[]
): Map<string, Set<string>> {
  const keysByPosition = new Map<string, Set<string>>()

  for (const boundary of boundaries) {
    const positionKeys = keysByPosition.get(boundary.positionCode) ?? new Set<string>()
    positionKeys.add(getPhysicalPositionKey(boundary.stationCode, boundary.positionCode))
    keysByPosition.set(boundary.positionCode, positionKeys)
  }

  return keysByPosition
}

function resolveEvidencePhysicalPositionKey(
  item: RuntimeSceneResourceEvidence,
  physicalPositionKeysByPosition: Map<string, Set<string>>,
  preferStationlessFallbackBoundary: boolean
): string | null {
  if (!item.positionCode) return null
  if (item.stationCode) {
    return getPhysicalPositionKey(item.stationCode, item.positionCode)
  }

  const matchingPositionKeys = physicalPositionKeysByPosition.get(item.positionCode)
  const stationlessFallbackKey = getPhysicalPositionKey(item.positionCode, item.positionCode)
  if (
    preferStationlessFallbackBoundary &&
    matchingPositionKeys?.has(stationlessFallbackKey)
  ) {
    return stationlessFallbackKey
  }

  if (matchingPositionKeys?.size === 1) {
    return Array.from(matchingPositionKeys)[0] ?? null
  }

  return getPhysicalPositionKey(null, item.positionCode)
}

function applyBoundaryEvidenceCounts(
  boundaries: RuntimeSceneBoundary[],
  evidencePlacements: RuntimeSceneEvidencePlacement[]
): RuntimeSceneBoundary[] {
  const evidenceCountByPositionKey = new Map<string, number>()

  for (const placement of evidencePlacements) {
    if (!placement.physicalPositionKey) continue
    evidenceCountByPositionKey.set(
      placement.physicalPositionKey,
      (evidenceCountByPositionKey.get(placement.physicalPositionKey) ?? 0) + 1
    )
  }

  return boundaries.map(boundary => ({
    ...boundary,
    evidenceCount:
      evidenceCountByPositionKey.get(
        getPhysicalPositionKey(boundary.stationCode, boundary.positionCode)
      ) ?? 0
  }))
}

function getUnlocatedAuditItems(
  evidencePlacements: RuntimeSceneEvidencePlacement[]
): RuntimeSceneResourceEvidence[] {
  return evidencePlacements
    .filter(placement => !placement.physicalPositionKey)
    .map(placement => placement.item)
}

function buildResourceStacks(
  items: RuntimeSceneResourceEvidence[]
): RuntimeSceneResourceStack[] {
  const stacks = new Map<string, RuntimeSceneResourceStack>()

  for (const item of items) {
    const key = getResourceStackKey(item)
    let stack = stacks.get(key)
    if (!stack) {
      stack = {
        key,
        anchor: getResourceStackAnchor(item),
        rackCode: item.rackCode,
        binCode: item.binCode,
        children: [],
        evidenceCount: 0,
        evidenceKinds: [],
        auditItems: []
      }
      stacks.set(key, stack)
    }

    stack.auditItems.push(item)
    stack.evidenceCount += 1
    appendUniqueEvidenceKind(stack.evidenceKinds, item.evidenceKind)

    const child = toResourceStackChild(item)
    const childMatchesAnchor =
      child.kind === stack.anchor.kind && child.code === stack.anchor.code
    const childExists = stack.children.some(existing => existing.key === child.key)
    if (!childMatchesAnchor && !childExists) {
      stack.children.push(child)
    }
  }

  return Array.from(stacks.values())
}

function buildPositionGroups(
  boundaries: RuntimeSceneBoundary[],
  evidencePlacements: RuntimeSceneEvidencePlacement[]
): RuntimeScenePositionGroup[] {
  const evidenceByPhysicalPosition = new Map<string, RuntimeSceneResourceEvidence[]>()
  for (const placement of evidencePlacements) {
    if (!placement.physicalPositionKey) continue
    const positionItems = evidenceByPhysicalPosition.get(placement.physicalPositionKey) ?? []
    positionItems.push(placement.item)
    evidenceByPhysicalPosition.set(placement.physicalPositionKey, positionItems)
  }

  const groupedPhysicalPositionKeys = new Set<string>()
  const groups: RuntimeScenePositionGroup[] = []
  for (const boundary of boundaries) {
    const physicalPositionKey = getPhysicalPositionKey(boundary.stationCode, boundary.positionCode)
    if (groupedPhysicalPositionKeys.has(physicalPositionKey)) continue
    groupedPhysicalPositionKeys.add(physicalPositionKey)
    groups.push(
      toPositionGroup(boundary, evidenceByPhysicalPosition.get(physicalPositionKey) ?? [])
    )
  }

  for (const [physicalPositionKey, items] of evidenceByPhysicalPosition) {
    if (groupedPhysicalPositionKeys.has(physicalPositionKey)) continue
    const positionCode = items[0]?.positionCode
    if (!positionCode) continue
    groups.push(toPositionGroup(toFallbackPositionBoundary(positionCode, items), items))
  }

  return groups
}

function toPositionGroup(
  boundary: RuntimeSceneBoundary,
  auditItems: RuntimeSceneResourceEvidence[]
): RuntimeScenePositionGroup {
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
}

function toFallbackPositionBoundary(
  positionCode: string,
  items: RuntimeSceneResourceEvidence[]
): RuntimeSceneBoundary {
  const firstItem = items[0]
  const stationCode = normalizeRuntimeSceneDisplayRole(firstItem?.stationCode ?? positionCode)
  const resourceEvidenceKind = firstItem?.evidenceKind ?? 'GENERIC_EVIDENCE'
  return {
    key: `fallback:${stationCode}:${positionCode}`,
    stationRole: stationCode,
    stationCode,
    positionCode,
    rackKind: 'UNKNOWN',
    snapshotKind: 'UNKNOWN',
    stationLease: 'UNKNOWN',
    stationLeaseLabel: STATION_LEASE_LABELS.UNKNOWN,
    rackSnapshot: 'UNKNOWN',
    rackSnapshotLabel: RACK_SNAPSHOT_LABELS.UNKNOWN,
    rackOperationWait: 'UNKNOWN',
    rackOperationWaitLabel: RACK_OPERATION_WAIT_LABELS.UNKNOWN,
    resourceEvidenceKind,
    resourceEvidenceKindLabel: EVIDENCE_KIND_LABELS[resourceEvidenceKind],
    evidenceCount: items.length
  }
}

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

function toSceneResourceEvidence(item: RuntimeResourceEvidenceItem): RuntimeSceneResourceEvidence {
  const resourceKind = normalizeEnum(
    item.resource_kind,
    RESOURCE_KIND_VALUES,
    'UNKNOWN'
  ) as RuntimeResourceKind
  const evidenceKind = normalizeEnum(
    item.evidence_kind,
    EVIDENCE_KIND_VALUES,
    'GENERIC_EVIDENCE'
  ) as RuntimeResourceEvidenceKind

  return {
    resourceKind,
    resourceKindLabel: RESOURCE_KIND_LABELS[resourceKind],
    resourceCode: item.resource_code,
    displayLabel: item.display_label,
    evidenceKind,
    evidenceKindLabel: EVIDENCE_KIND_LABELS[evidenceKind],
    stationCode: item.station_code,
    positionCode: item.position_code,
    rackCode: item.rack_code,
    binCode: item.bin_code,
    slotCode: item.slot_code,
    pkgCode: item.pkg_code,
    partSn: item.part_sn,
    sourceSessionId: item.source_session_id,
    sourceTraceId: item.source_trace_id,
    occurredAt: item.occurred_at
  }
}

function normalizeEnum<T extends string>(
  value: unknown,
  allowedValues: readonly T[],
  fallback: T
): T {
  return typeof value === 'string' && allowedValues.includes(value as T) ? (value as T) : fallback
}

function normalizeRuntimeSceneDisplayRole(value: string): string {
  const normalized = value.trim()
  const upperValue = normalized.toUpperCase()
  if (upperValue === LEGACY_NG_ARM_ROLE) return NG_PLACEMENT_DISPLAY_ROLE
  if (upperValue.endsWith(`_${LEGACY_NG_ARM_ROLE}`)) {
    return `${normalized.slice(0, -LEGACY_NG_ARM_ROLE.length)}${NG_PLACEMENT_DISPLAY_ROLE}`
  }
  return normalized
}

function normalizeRuntimeSceneDeviceName(
  value: string,
  rawRole: string,
  displayRole: string
): string {
  if (rawRole === displayRole) return value
  return value
    .replace(/\s*NG\s*机械臂/gi, '目标机械臂')
    .replace(/NG\s*arm/gi, 'target arm')
    .replace(/NG_ARM/g, NG_PLACEMENT_DISPLAY_ROLE)
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function hasRuntimeSceneContractFields(detail: Record<string, unknown>): boolean {
  const requiredFields = [
    'workline_readiness',
    'station_lease',
    'single_layer_rack_snapshot',
    'rack_operation_wait',
    'resource_evidence_kind'
  ]
  if (requiredFields.some(field => detail[field] == null)) return false
  return (
    (detail.resource_evidence_items == null || Array.isArray(detail.resource_evidence_items)) &&
    (detail.resource_evidence_total_count == null ||
      isFiniteNumber(detail.resource_evidence_total_count)) &&
    (detail.resource_evidence_truncated == null ||
      typeof detail.resource_evidence_truncated === 'boolean')
  )
}

function getSemanticFallbackMessage(
  detail: Record<string, unknown>,
  manifest: WorkLinePluginManifestSummary | null | undefined,
  manifestLoadFailed: boolean
): string | null {
  if (manifestLoadFailed) {
    return '插件边界 manifest 加载失败，当前仅展示通用 evidence。'
  }

  if (!hasRuntimeSceneContractFields(detail)) {
    return '运行态边界字段未加载，当前仅展示通用 evidence。'
  }
  if (!manifest?.single_layer_boundaries?.length) {
    return '插件边界 manifest 未加载，当前仅展示通用 evidence。'
  }
  return null
}

function toRuntimeStatusLabel(runtimeStatus?: string | null): string {
  if (runtimeStatus === 'READY') return '现场 START 后待机 / 可接收'
  if (runtimeStatus === 'STOPPED') return '等待现场硬件 START'
  if (runtimeStatus === 'ESTOPPED') return '软件安全冻结'
  if (runtimeStatus === 'RECONCILING') return '运行态对账中'
  return runtimeStatus || '运行状态未加载'
}
