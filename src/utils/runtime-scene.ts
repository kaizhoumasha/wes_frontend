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
    item.positionCode ?? ''
  ].join(':')
}

export function buildRuntimeSceneModel(input: BuildRuntimeSceneModelInput): RuntimeSceneModel {
  const { detail, manifest, manifestLoadFailed = false } = input
  const detailRecord = detail as RuntimeWorklineDetailResponse & Record<string, unknown>
  const resourceEvidenceItems = Array.isArray(detailRecord.resource_evidence_items)
    ? (detailRecord.resource_evidence_items as RuntimeResourceEvidenceItem[])
    : []
  const hasRuntimeSceneSemantics =
    hasRuntimeSceneContractFields(detailRecord) &&
    manifestLoadFailed === false &&
    Boolean(manifest?.single_layer_boundaries?.length)
  const readiness = normalizeEnum(
    detailRecord.workline_readiness,
    READINESS_VALUES,
    'UNKNOWN'
  ) as RuntimeWorklineReadiness
  const resourceEvidence = resourceEvidenceItems.map(toSceneResourceEvidence)
  const boundaries = resolveBoundaries(detail, manifest, resourceEvidence, hasRuntimeSceneSemantics)
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
    deviceNodes: detail.devices.map(toSceneDeviceNode),
    resourceEvidence,
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
      toSceneBoundary(boundary, detail, resourceEvidence, hasRuntimeSceneSemantics)
    )
  }

  const positionCodes = Array.from(
    new Set(
      resourceEvidence
        .map(item => item.positionCode)
        .filter((item): item is string => Boolean(item))
    )
  )
  return positionCodes.map(positionCode =>
    toSceneBoundary(
      {
        station_role: positionCode,
        station_code: positionCode,
        position_code: positionCode,
        rack_kind: 'UNKNOWN',
        snapshot_kind: 'UNKNOWN',
        lease_scope: 'UNKNOWN',
        business_demand_type: 'UNKNOWN',
        wms_operation_type: 'UNKNOWN'
      },
      detail,
      resourceEvidence,
      hasRuntimeSceneSemantics
    )
  )
}

function toSceneBoundary(
  boundary: WorkLineSingleLayerRackBoundarySummary,
  detail: RuntimeWorklineDetailResponse,
  resourceEvidence: RuntimeSceneResourceEvidence[],
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

  return {
    key: getBoundaryKey(boundary),
    stationRole: normalizeRuntimeSceneDisplayRole(boundary.station_role),
    stationCode: normalizeRuntimeSceneDisplayRole(boundary.station_code),
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
    evidenceCount: resourceEvidence.filter(item => item.positionCode === boundary.position_code)
      .length
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

function toSceneDeviceNode(device: RuntimeWorklineDeviceItem): RuntimeSceneDeviceNode {
  return {
    id: device.id,
    deviceCode: device.device_code,
    deviceName: device.device_name,
    deviceRole: normalizeRuntimeSceneDisplayRole(device.device_role),
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
  return normalized.toUpperCase() === LEGACY_NG_ARM_ROLE ? NG_PLACEMENT_DISPLAY_ROLE : normalized
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
