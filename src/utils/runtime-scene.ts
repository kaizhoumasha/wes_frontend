import type {
  RuntimeRackOperationWait,
  RuntimeResourceEvidenceItem,
  RuntimeResourceEvidenceKind,
  RuntimeResourceKind,
  RuntimeSingleLayerRackSnapshot,
  RuntimeStationLease,
  RuntimeMonitorDeviceNode,
  RuntimeWorklineMonitorProjectionResponse,
  RuntimeWorklineReadiness,
  WorkLinePluginManifestSummary
} from '@/types/runtime'

type RuntimeSceneManifestPosition = NonNullable<WorkLinePluginManifestSummary['positions']>[number]
type RuntimeSceneManifestResourceBoundary = NonNullable<
  WorkLinePluginManifestSummary['resource_boundaries']
>[number]

interface RuntimeSceneBoundarySummary {
  station_role: string
  station_code: string
  position_code: string
  rack_kind: string
  snapshot_kind?: string | null
  lease_scope: string
  business_demand_type: string
  wms_operation_type: string
}

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
  cellCode?: string | null
  pkgCode?: string | null
  partSn?: string | null
  materialCode?: string | null
  dateCode?: string | null
  lotCode?: string | null
  reelCount?: number | null
  reelCode?: string | null
  positionIndex?: number | null
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

export type RuntimeSceneRackSlotState = 'empty' | 'occupied' | 'material'
export type RuntimeSceneRackCellBatchStatus = 'empty' | 'single' | 'mixed' | 'unknown'

export interface RuntimeSceneRackCellMaterialSummary {
  materialCode?: string | null
  dateCode?: string | null
  lotCode?: string | null
  reelCount: number
  batchStatus: RuntimeSceneRackCellBatchStatus
  hasBatchFields: boolean
}

export interface RuntimeSceneRackMaterialReel {
  key: string
  reelCode: string
  materialCode?: string | null
  dateCode?: string | null
  lotCode?: string | null
  positionIndex?: number | null
  displayLabel: string
  evidenceKind: RuntimeResourceEvidenceKind
  auditItems: RuntimeSceneResourceEvidence[]
}

export interface RuntimeSceneRackMaterial {
  key: string
  kind: RuntimeResourceKind
  code: string
  displayLabel: string
  evidenceKind: RuntimeResourceEvidenceKind
  materialCode?: string | null
  dateCode?: string | null
  lotCode?: string | null
  reelCount?: number | null
  reelCode?: string | null
  positionIndex?: number | null
  auditItems: RuntimeSceneResourceEvidence[]
}

export interface RuntimeSceneRackCell {
  key: string
  code: string
  displayLabel: string
  materials: RuntimeSceneRackMaterial[]
  materialSummary: RuntimeSceneRackCellMaterialSummary | null
  materialReels: RuntimeSceneRackMaterialReel[]
  evidenceCount: number
  evidenceKinds: RuntimeResourceEvidenceKind[]
  auditItems: RuntimeSceneResourceEvidence[]
}

export interface RuntimeSceneRackBin {
  key: string
  code: string
  displayLabel: string
  slotCode?: string | null
  cells: RuntimeSceneRackCell[]
  looseMaterials: RuntimeSceneRackMaterial[]
  evidenceCount: number
  evidenceKinds: RuntimeResourceEvidenceKind[]
  auditItems: RuntimeSceneResourceEvidence[]
}

export interface RuntimeSceneRackSlot {
  key: string
  code: string
  displayLabel: string
  bin: RuntimeSceneRackBin | null
  looseMaterials: RuntimeSceneRackMaterial[]
  state: RuntimeSceneRackSlotState
  evidenceCount: number
  evidenceKinds: RuntimeResourceEvidenceKind[]
  auditItems: RuntimeSceneResourceEvidence[]
}

export interface RuntimeSceneRackLayout {
  key: string
  rackCode: string
  displayLabel: string
  stationCode: string
  positionCode: string
  attentionState: RuntimeSceneAttentionState
  slots: RuntimeSceneRackSlot[]
  unlocatedBins: RuntimeSceneRackBin[]
  looseMaterials: RuntimeSceneRackMaterial[]
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
  rackLayouts: RuntimeSceneRackLayout[]
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
  projection: RuntimeWorklineMonitorProjectionResponse
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
  const { projection, manifest, manifestLoadFailed = false } = input
  const projectionRecord = projection as RuntimeWorklineMonitorProjectionResponse & Record<string, unknown>
  const evidenceObj = (projectionRecord.resource_evidence || {}) as Record<string, unknown>
  const resourceEvidenceItems = Array.isArray(evidenceObj.items)
    ? (evidenceObj.items as RuntimeResourceEvidenceItem[])
    : []
  const hasManifestBoundaries = Boolean(manifest?.resource_boundaries?.length)
  const hasRuntimeSceneSemantics =
    hasRuntimeSceneContractFields(projectionRecord) &&
    manifestLoadFailed === false &&
    hasManifestBoundaries
  const boundaryObj = (projectionRecord.boundary || {}) as Record<string, unknown>
  const readiness = normalizeEnum(
    boundaryObj.workline_readiness,
    READINESS_VALUES,
    'UNKNOWN'
  ) as RuntimeWorklineReadiness
  const resourceEvidence = resourceEvidenceItems.map(toSceneResourceEvidence)
  const resolvedBoundaries = resolveBoundaries(
    projection,
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
    projectionRecord,
    manifest,
    manifestLoadFailed
  )

  return {
    worklineId: projection.summary.id,
    worklineName: projection.summary.line_name,
    worklineCode: projection.summary.line_code,
    readiness,
    readinessLabel: READINESS_LABELS[readiness],
    runtimeStatusLabel: toRuntimeStatusLabel(projection.summary.runtime_status),
    boundaries,
    deviceNodes: (projection.device_nodes ?? []).map(toRuntimeSceneDeviceNode),
    resourceEvidence,
    positionGroups,
    unlocatedAuditItems,
    resourceEvidenceTotalCount: isFiniteNumber(evidenceObj.total_count)
      ? (evidenceObj.total_count as number)
      : resourceEvidence.length,
    resourceEvidenceTruncated:
      typeof evidenceObj.truncated === 'boolean'
        ? (evidenceObj.truncated as boolean)
        : false,
    semanticFallback: Boolean(semanticFallbackMessage),
    semanticFallbackMessage
  }
}

function resolveBoundaries(
  projection: RuntimeWorklineMonitorProjectionResponse,
  manifest: WorkLinePluginManifestSummary | null | undefined,
  resourceEvidence: RuntimeSceneResourceEvidence[],
  hasRuntimeSceneSemantics: boolean
): RuntimeSceneBoundary[] {
  const manifestBoundaries = getManifestBoundarySummaries(manifest)
  if (manifestBoundaries.length > 0) {
    return manifestBoundaries.map(boundary =>
      toSceneBoundary(boundary, projection, hasRuntimeSceneSemantics)
    )
  }

  return getFallbackBoundarySummaries(resourceEvidence).map(boundary =>
    toSceneBoundary(boundary, projection, hasRuntimeSceneSemantics)
  )
}

function getManifestBoundarySummaries(
  manifest: WorkLinePluginManifestSummary | null | undefined
): RuntimeSceneBoundarySummary[] {
  const resourceBoundaries = manifest?.resource_boundaries ?? []
  if (resourceBoundaries.length === 0) return []

  const positionsByCode = new Map<string, RuntimeSceneManifestPosition>(
    (manifest?.positions ?? []).map(position => [position.code, position])
  )

  return resourceBoundaries.map(boundary =>
    toBoundarySummary(boundary, positionsByCode.get(boundary.position_code))
  )
}

function toBoundarySummary(
  boundary: RuntimeSceneManifestResourceBoundary,
  position: RuntimeSceneManifestPosition | undefined
): RuntimeSceneBoundarySummary {
  const stationRole = position?.role ?? boundary.position_code
  const stationCode = position?.station_code ?? boundary.position_code

  return {
    station_role: stationRole,
    station_code: stationCode,
    position_code: boundary.position_code,
    rack_kind: boundary.rack_kind,
    snapshot_kind: boundary.snapshot_kind,
    lease_scope: boundary.lease_scope,
    business_demand_type: boundary.business_demand_type,
    wms_operation_type: boundary.wms_operation_type
  }
}

function getFallbackBoundarySummaries(
  resourceEvidence: RuntimeSceneResourceEvidence[]
): RuntimeSceneBoundarySummary[] {
  const seenPhysicalPositionKeys = new Set<string>()
  const boundaries: RuntimeSceneBoundarySummary[] = []

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
  boundary: RuntimeSceneBoundarySummary,
  projection: RuntimeWorklineMonitorProjectionResponse,
  hasRuntimeSceneSemantics: boolean
): RuntimeSceneBoundary {
  const boundaryObj = (projection.boundary || {}) as Record<string, unknown>
  const evidenceObj = (projection.resource_evidence || {}) as Record<string, unknown>
  const stationLease = hasRuntimeSceneSemantics
    ? (normalizeEnum(
        boundaryObj.station_lease,
        STATION_LEASE_VALUES,
        'UNKNOWN'
      ) as RuntimeStationLease)
    : 'UNKNOWN'
  const rackSnapshot = hasRuntimeSceneSemantics
    ? (normalizeEnum(
        boundaryObj.single_layer_rack_snapshot,
        RACK_SNAPSHOT_VALUES,
        'UNKNOWN'
      ) as RuntimeSingleLayerRackSnapshot)
    : 'UNKNOWN'
  const rackOperationWait = hasRuntimeSceneSemantics
    ? (normalizeEnum(
        boundaryObj.rack_operation_wait,
        RACK_OPERATION_WAIT_VALUES,
        'UNKNOWN'
      ) as RuntimeRackOperationWait)
    : 'UNKNOWN'
  const resourceEvidenceKind = hasRuntimeSceneSemantics
    ? (normalizeEnum(
        evidenceObj.kind,
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

function getBoundaryKey(boundary: RuntimeSceneBoundarySummary): string {
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

function toResourceStackChild(item: RuntimeSceneResourceEvidence): RuntimeSceneResourceStackChild {
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
  if (preferStationlessFallbackBoundary && matchingPositionKeys?.has(stationlessFallbackKey)) {
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

function buildResourceStacks(items: RuntimeSceneResourceEvidence[]): RuntimeSceneResourceStack[] {
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
    const childMatchesAnchor = child.kind === stack.anchor.kind && child.code === stack.anchor.code
    const childExists = stack.children.some(existing => existing.key === child.key)
    if (!childMatchesAnchor && !childExists) {
      stack.children.push(child)
    }
  }

  return Array.from(stacks.values())
}

function buildRackLayouts(
  boundary: RuntimeSceneBoundary,
  attentionState: RuntimeSceneAttentionState,
  items: RuntimeSceneResourceEvidence[]
): RuntimeSceneRackLayout[] {
  const layouts = new Map<string, RuntimeSceneRackLayout>()
  const racksWithPlacementEvidence = new Set<string>()

  for (const item of items) {
    const rackCode = getRackCode(item)
    if (!rackCode) continue
    if (getSlotCode(item) || getBinCode(item) || getCellCode(item)) {
      racksWithPlacementEvidence.add(rackCode)
    }
  }

  for (const item of items) {
    const rackCode = getRackCode(item)
    if (!rackCode) continue

    const slotCode = getSlotCode(item)
    const binCode = getBinCode(item)
    const cellCode = getCellCode(item)
    if (!slotCode && !binCode && !cellCode && !racksWithPlacementEvidence.has(rackCode)) continue

    const layout = ensureRackLayout(layouts, boundary, attentionState, item, rackCode)
    appendRackAuditItem(layout, item)

    const slot = slotCode
      ? ensureRackSlot(layout, item, slotCode)
      : getExistingRackSlotByBin(layout, item)
    if (slot) appendRackAuditItem(slot, item)

    const bin = binCode
      ? slot
        ? ensureRackSlotBin(layout, slot, item, binCode)
        : ensureUnlocatedRackBin(layout, item, binCode)
      : null
    if (bin) appendRackAuditItem(bin, item)

    const cell = cellCode && bin ? ensureRackCell(bin, item, cellCode) : null
    if (cell) appendRackAuditItem(cell, item)
  }

  for (const item of items) {
    const material = toRackMaterial(item)
    if (!material) continue

    const layout = getExistingRackLayout(layouts, item)
    if (!layout) continue

    const slot = getExistingRackSlot(layout, item) ?? getExistingRackSlotByBin(layout, item)
    const bin = slot?.bin ?? getExistingUnlocatedRackBin(layout, item)
    const cell = bin ? getExistingRackCell(bin, item) : null

    if (cell) {
      appendRackMaterial(cell.materials, material)
      appendRackAuditItem(cell, item)
    } else if (bin) {
      appendRackMaterial(bin.looseMaterials, material)
    } else if (slot) {
      appendRackMaterial(slot.looseMaterials, material)
    } else {
      appendRackMaterial(layout.looseMaterials, material)
    }
  }

  for (const layout of layouts.values()) {
    for (const slot of layout.slots) {
      for (const cell of slot.bin?.cells ?? []) {
        finalizeRackCellMaterialState(cell)
      }
      slot.state = deriveRackSlotState(slot)
    }
    for (const bin of layout.unlocatedBins) {
      for (const cell of bin.cells) {
        finalizeRackCellMaterialState(cell)
      }
    }
  }

  return Array.from(layouts.values())
}

function getRackCode(item: RuntimeSceneResourceEvidence): string | null {
  return item.rackCode ?? (item.resourceKind === 'RACK' ? item.resourceCode : null)
}

function getSlotCode(item: RuntimeSceneResourceEvidence): string | null {
  return item.slotCode ?? (item.resourceKind === 'SLOT' ? item.resourceCode : null)
}

function getBinCode(item: RuntimeSceneResourceEvidence): string | null {
  return item.binCode ?? (item.resourceKind === 'BIN' ? item.resourceCode : null)
}

function getCellCode(item: RuntimeSceneResourceEvidence): string | null {
  return item.cellCode ?? (item.resourceKind === 'CELL' ? item.resourceCode : null)
}

function getMaterialIdentity(
  item: RuntimeSceneResourceEvidence
): { kind: RuntimeResourceKind; code: string } | null {
  if (item.partSn || item.resourceKind === 'PART_SN') {
    return { kind: 'PART_SN', code: item.partSn ?? item.resourceCode }
  }
  if (item.pkgCode || item.resourceKind === 'PKG') {
    return { kind: 'PKG', code: item.pkgCode ?? item.resourceCode }
  }
  if (item.resourceKind === 'MAGAZINE') {
    return { kind: 'MAGAZINE', code: item.resourceCode }
  }
  return null
}

function toRackMaterial(item: RuntimeSceneResourceEvidence): RuntimeSceneRackMaterial | null {
  const identity = getMaterialIdentity(item)
  if (!identity) return null

  return {
    key: `material:${identity.kind}:${identity.code}`,
    kind: identity.kind,
    code: identity.code,
    displayLabel:
      item.resourceKind === identity.kind && item.resourceCode === identity.code
        ? item.displayLabel
        : `${RESOURCE_KIND_LABELS[identity.kind]} ${identity.code}`,
    evidenceKind: item.evidenceKind,
    materialCode: item.materialCode,
    dateCode: item.dateCode,
    lotCode: item.lotCode,
    reelCount: item.reelCount,
    reelCode: item.reelCode,
    positionIndex: item.positionIndex,
    auditItems: [item]
  }
}

function getRackLayoutKey(rackCode: string): string {
  return `rack-layout:${rackCode}`
}

function ensureRackLayout(
  layouts: Map<string, RuntimeSceneRackLayout>,
  boundary: RuntimeSceneBoundary,
  attentionState: RuntimeSceneAttentionState,
  item: RuntimeSceneResourceEvidence,
  rackCode: string
): RuntimeSceneRackLayout {
  const key = getRackLayoutKey(rackCode)
  let layout = layouts.get(key)
  if (!layout) {
    layout = {
      key,
      rackCode,
      displayLabel:
        item.resourceKind === 'RACK' && item.resourceCode === rackCode
          ? item.displayLabel
          : `${RESOURCE_KIND_LABELS.RACK} ${rackCode}`,
      stationCode: boundary.stationCode,
      positionCode: boundary.positionCode,
      attentionState,
      slots: [],
      unlocatedBins: [],
      looseMaterials: [],
      evidenceCount: 0,
      evidenceKinds: [],
      auditItems: []
    }
    layouts.set(key, layout)
  }
  return layout
}

function getExistingRackLayout(
  layouts: Map<string, RuntimeSceneRackLayout>,
  item: RuntimeSceneResourceEvidence
): RuntimeSceneRackLayout | null {
  const rackCode = getRackCode(item)
  return rackCode ? (layouts.get(getRackLayoutKey(rackCode)) ?? null) : null
}

function getRackSlotKey(layout: RuntimeSceneRackLayout, slotCode: string): string {
  return `${layout.key}:slot:${slotCode}`
}

function ensureRackSlot(
  layout: RuntimeSceneRackLayout,
  item: RuntimeSceneResourceEvidence,
  slotCode: string
): RuntimeSceneRackSlot {
  const key = getRackSlotKey(layout, slotCode)
  let slot = layout.slots.find(existing => existing.key === key)
  if (!slot) {
    slot = {
      key,
      code: slotCode,
      displayLabel:
        item.resourceKind === 'SLOT' && item.resourceCode === slotCode
          ? item.displayLabel
          : `${RESOURCE_KIND_LABELS.SLOT} ${slotCode}`,
      bin: null,
      looseMaterials: [],
      state: 'empty',
      evidenceCount: 0,
      evidenceKinds: [],
      auditItems: []
    }
    layout.slots.push(slot)
  }
  return slot
}

function getExistingRackSlot(
  layout: RuntimeSceneRackLayout,
  item: RuntimeSceneResourceEvidence
): RuntimeSceneRackSlot | null {
  const slotCode = getSlotCode(item)
  return slotCode
    ? (layout.slots.find(slot => slot.key === getRackSlotKey(layout, slotCode)) ?? null)
    : null
}

function getExistingRackSlotByBin(
  layout: RuntimeSceneRackLayout,
  item: RuntimeSceneResourceEvidence
): RuntimeSceneRackSlot | null {
  const binCode = getBinCode(item)
  return binCode ? (layout.slots.find(slot => slot.bin?.code === binCode) ?? null) : null
}

function createRackBin(
  layout: RuntimeSceneRackLayout,
  item: RuntimeSceneResourceEvidence,
  binCode: string,
  slotCode?: string | null
): RuntimeSceneRackBin {
  return {
    key: `${layout.key}:bin:${binCode}`,
    code: binCode,
    displayLabel:
      item.resourceKind === 'BIN' && item.resourceCode === binCode
        ? item.displayLabel
        : `${RESOURCE_KIND_LABELS.BIN} ${binCode}`,
    slotCode,
    cells: [],
    looseMaterials: [],
    evidenceCount: 0,
    evidenceKinds: [],
    auditItems: []
  }
}

function ensureRackSlotBin(
  layout: RuntimeSceneRackLayout,
  slot: RuntimeSceneRackSlot,
  item: RuntimeSceneResourceEvidence,
  binCode: string
): RuntimeSceneRackBin {
  if (!slot.bin || slot.bin.code !== binCode) {
    const unlocatedBinIndex = layout.unlocatedBins.findIndex(bin => bin.code === binCode)
    const unlocatedBin = unlocatedBinIndex >= 0 ? layout.unlocatedBins[unlocatedBinIndex] : null
    if (unlocatedBin) {
      unlocatedBin.slotCode = slot.code
      slot.bin = unlocatedBin
      layout.unlocatedBins.splice(unlocatedBinIndex, 1)
    } else {
      slot.bin = createRackBin(layout, item, binCode, slot.code)
    }
  }
  return slot.bin
}

function ensureUnlocatedRackBin(
  layout: RuntimeSceneRackLayout,
  item: RuntimeSceneResourceEvidence,
  binCode: string
): RuntimeSceneRackBin {
  let bin = layout.unlocatedBins.find(existing => existing.code === binCode)
  if (!bin) {
    bin = createRackBin(layout, item, binCode)
    layout.unlocatedBins.push(bin)
  }
  return bin
}

function getExistingUnlocatedRackBin(
  layout: RuntimeSceneRackLayout,
  item: RuntimeSceneResourceEvidence
): RuntimeSceneRackBin | null {
  const binCode = getBinCode(item)
  return binCode ? (layout.unlocatedBins.find(bin => bin.code === binCode) ?? null) : null
}

function getRackCellKey(bin: RuntimeSceneRackBin, cellCode: string): string {
  return `${bin.key}:cell:${cellCode}`
}

function ensureRackCell(
  bin: RuntimeSceneRackBin,
  item: RuntimeSceneResourceEvidence,
  cellCode: string
): RuntimeSceneRackCell {
  const key = getRackCellKey(bin, cellCode)
  let cell = bin.cells.find(existing => existing.key === key)
  if (!cell) {
    cell = {
      key,
      code: cellCode,
      displayLabel: item.displayLabel,
      materials: [],
      materialSummary: null,
      materialReels: [],
      evidenceCount: 0,
      evidenceKinds: [],
      auditItems: []
    }
    bin.cells.push(cell)
  }
  return cell
}

function getExistingRackCell(
  bin: RuntimeSceneRackBin,
  item: RuntimeSceneResourceEvidence
): RuntimeSceneRackCell | null {
  const cellCode = getCellCode(item)
  return cellCode
    ? (bin.cells.find(cell => cell.key === getRackCellKey(bin, cellCode)) ?? null)
    : null
}

function appendRackAuditItem(
  target: {
    auditItems: RuntimeSceneResourceEvidence[]
    evidenceCount: number
    evidenceKinds: RuntimeResourceEvidenceKind[]
  },
  item: RuntimeSceneResourceEvidence
): void {
  const key = getRuntimeSceneEvidenceKey(item)
  if (!target.auditItems.some(existing => getRuntimeSceneEvidenceKey(existing) === key)) {
    target.auditItems.push(item)
  }
  target.evidenceCount = target.auditItems.length
  appendUniqueEvidenceKind(target.evidenceKinds, item.evidenceKind)
}

function appendRackMaterial(
  target: RuntimeSceneRackMaterial[],
  material: RuntimeSceneRackMaterial
): void {
  const existing = target.find(item => item.key === material.key)
  if (existing) {
    existing.materialCode ??= material.materialCode
    existing.dateCode ??= material.dateCode
    existing.lotCode ??= material.lotCode
    existing.reelCount ??= material.reelCount
    existing.reelCode ??= material.reelCode
    existing.positionIndex ??= material.positionIndex
    for (const auditItem of material.auditItems) {
      if (
        !existing.auditItems.some(
          existingItem =>
            getRuntimeSceneEvidenceKey(existingItem) === getRuntimeSceneEvidenceKey(auditItem)
        )
      ) {
        existing.auditItems.push(auditItem)
      }
    }
    return
  }
  target.push(material)
}

function rackBinHasMaterial(bin: RuntimeSceneRackBin): boolean {
  return bin.looseMaterials.length > 0 || bin.cells.some(cell => cell.materials.length > 0)
}

function deriveRackSlotState(slot: RuntimeSceneRackSlot): RuntimeSceneRackSlotState {
  if (slot.looseMaterials.length > 0 || (slot.bin && rackBinHasMaterial(slot.bin))) {
    return 'material'
  }
  return slot.bin ? 'occupied' : 'empty'
}

function finalizeRackCellMaterialState(cell: RuntimeSceneRackCell): void {
  cell.materialReels = buildRackCellMaterialReels(cell)
  cell.materialSummary = buildRackCellMaterialSummary(cell)
}

function buildRackCellMaterialReels(
  cell: RuntimeSceneRackCell
): RuntimeSceneRackMaterialReel[] {
  return cell.materials
    .map((material, index) => ({
      key: `${material.key}:reel:${material.reelCode ?? material.code}:${index}`,
      reelCode: material.reelCode ?? material.code,
      materialCode: material.materialCode,
      dateCode: material.dateCode,
      lotCode: material.lotCode,
      positionIndex: material.positionIndex ?? index + 1,
      displayLabel: material.displayLabel,
      evidenceKind: material.evidenceKind,
      auditItems: material.auditItems
    }))
    .sort((left, right) => {
      const leftIndex = left.positionIndex ?? Number.MAX_SAFE_INTEGER
      const rightIndex = right.positionIndex ?? Number.MAX_SAFE_INTEGER
      if (leftIndex !== rightIndex) return leftIndex - rightIndex
      return left.reelCode.localeCompare(right.reelCode)
    })
}

function buildRackCellMaterialSummary(
  cell: RuntimeSceneRackCell
): RuntimeSceneRackCellMaterialSummary | null {
  const materialCodes = getUniquePresentValues([
    ...cell.auditItems.map(item => item.materialCode),
    ...cell.materials.map(material => material.materialCode)
  ])
  const dateCodes = getUniquePresentValues([
    ...cell.auditItems.map(item => item.dateCode),
    ...cell.materials.map(material => material.dateCode)
  ])
  const lotCodes = getUniquePresentValues([
    ...cell.auditItems.map(item => item.lotCode),
    ...cell.materials.map(material => material.lotCode)
  ])
  const hasBatchFields = Boolean(materialCodes.length || dateCodes.length || lotCodes.length)
  const reelCount = getRackCellReelCount(cell)

  if (!hasBatchFields && reelCount === 0) return null

  const hasMixedBatch = materialCodes.length > 1 || dateCodes.length > 1 || lotCodes.length > 1
  const batchStatus: RuntimeSceneRackCellBatchStatus = hasMixedBatch
    ? 'mixed'
    : hasBatchFields
      ? 'single'
      : 'unknown'

  return {
    materialCode: materialCodes[0] ?? null,
    dateCode: dateCodes[0] ?? null,
    lotCode: lotCodes[0] ?? null,
    reelCount,
    batchStatus,
    hasBatchFields
  }
}

function getRackCellReelCount(cell: RuntimeSceneRackCell): number {
  const explicitCellCounts = cell.auditItems
    .filter(item => item.resourceKind === 'CELL')
    .map(item => item.reelCount)
    .filter(isPositiveFiniteNumber)
  if (explicitCellCounts.length) return Math.max(...explicitCellCounts)

  const explicitMaterialCounts = cell.materials
    .map(material => material.reelCount)
    .filter(isPositiveFiniteNumber)
  if (explicitMaterialCounts.length) {
    return explicitMaterialCounts.reduce((total, count) => total + count, 0)
  }

  return cell.materials.length
}

function getUniquePresentValues(values: Array<string | null | undefined>): string[] {
  return Array.from(new Set(values.filter(isPresentString)))
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
  const attentionState = derivePositionAttentionState(boundary)
  return {
    key: boundary.key,
    stationCode: boundary.stationCode,
    stationRole: boundary.stationRole,
    positionCode: boundary.positionCode,
    boundary,
    attentionState,
    resourceStacks: buildResourceStacks(auditItems),
    rackLayouts: buildRackLayouts(boundary, attentionState, auditItems),
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
  device: RuntimeMonitorDeviceNode
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
  const itemRecord = item as RuntimeResourceEvidenceItem & Record<string, unknown>
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
    cellCode:
      getOptionalStringField(itemRecord, 'cell_code') ??
      getOptionalStringField(itemRecord, 'bin_cell_code') ??
      getOptionalStringField(itemRecord, 'bin_cell_index'),
    pkgCode: item.pkg_code,
    partSn: item.part_sn,
    materialCode: getOptionalStringField(itemRecord, 'material_code'),
    dateCode: getOptionalStringField(itemRecord, 'date_code'),
    lotCode: getOptionalStringField(itemRecord, 'lot_code'),
    reelCount: getOptionalNumberField(itemRecord, 'reel_count'),
    reelCode: getOptionalStringField(itemRecord, 'reel_code'),
    positionIndex:
      getOptionalNumberField(itemRecord, 'position_index') ??
      getOptionalNumberField(itemRecord, 'stack_index'),
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

function isPositiveFiniteNumber(value: unknown): value is number {
  return isFiniteNumber(value) && value > 0
}

function isPresentString(value: string | null | undefined): value is string {
  return typeof value === 'string' && value.length > 0
}

function getOptionalStringField(
  record: Record<string, unknown>,
  field: string
): string | null | undefined {
  const value = record[field]
  if (value == null) return value as null | undefined
  if (typeof value !== 'string') return undefined

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function getOptionalNumberField(
  record: Record<string, unknown>,
  field: string
): number | null | undefined {
  const value = record[field]
  if (value == null) return value as null | undefined
  return isFiniteNumber(value) ? value : undefined
}

function hasRuntimeSceneContractFields(projection: Record<string, unknown>): boolean {
  const boundary = (projection.boundary || {}) as Record<string, unknown>
  const evidence = (projection.resource_evidence || {}) as Record<string, unknown>
  const requiredBoundaryFields = [
    'workline_readiness',
    'station_lease',
    'single_layer_rack_snapshot',
    'rack_operation_wait'
  ]
  if (requiredBoundaryFields.some(field => boundary[field] == null)) return false
  if (evidence.kind == null) return false
  return (
    (evidence.items == null || Array.isArray(evidence.items)) &&
    (evidence.total_count == null || isFiniteNumber(evidence.total_count)) &&
    (evidence.truncated == null || typeof evidence.truncated === 'boolean')
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
  if (!manifest?.resource_boundaries?.length) {
    return '插件 resource boundaries manifest 未加载，当前仅展示通用 evidence。'
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
