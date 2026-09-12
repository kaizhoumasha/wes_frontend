import type { IntegrationPhase, IntegrationRun } from '@/api/manualOutboundIntegrationApi'

export function buildRackTransportResources(run: IntegrationRun) {
  const plan = run.plan_resources
  if (!plan) return []
  const workPosition = run.site_configuration.bin_rack_positions[0] ?? ''
  const activeSource = run.operation_context.current_source_rack
  const activeRackId =
    activeSource && typeof activeSource === 'object' && 'rack_id' in activeSource
      ? activeSource.rack_id
      : null
  const activeRackFace =
    activeSource && typeof activeSource === 'object' && 'rack_face' in activeSource
      ? activeSource.rack_face
      : null
  const sourceRacks = new Map<string, (typeof plan.bin_source_racks)[number]>()
  for (const rack of plan.bin_source_racks) {
    const selectedFace =
      rack.rack_id === activeRackId &&
      typeof activeRackFace === 'string' &&
      rack.rack_face === activeRackFace
    if (!sourceRacks.has(rack.rack_id) || selectedFace) sourceRacks.set(rack.rack_id, rack)
  }
  return [
    {
      rackId: plan.target_rack.rack_id,
      role: '转运货架',
      template: 'F01' as const,
      target: run.site_configuration.outbound_transfer_position,
      face: plan.target_rack.rack_face
    },
    ...[...sourceRacks.values()].map(rack => ({
      rackId: rack.rack_id,
      role: '五层货架',
      template: 'CTU01' as const,
      target: workPosition,
      face: rack.rack_face
    }))
  ]
}

export type WmsOutboundPhase =
  | 'TASK_PREPARE'
  | 'BIN_INBOUND_BATCH'
  | 'WORK_ADMISSION'
  | 'BIN_RETURN_BATCH'
  | 'RACK_DEPARTURE'
  | 'TASK_COMPLETION'

const WMS_OUTBOUND_PHASES = new Set<IntegrationPhase>([
  'TASK_PREPARE',
  'BIN_INBOUND_BATCH',
  'WORK_ADMISSION',
  'BIN_RETURN_BATCH',
  'RACK_DEPARTURE',
  'TASK_COMPLETION'
])

export function isWmsOutboundPhase(phase: IntegrationPhase): phase is WmsOutboundPhase {
  return WMS_OUTBOUND_PHASES.has(phase)
}

export function buildDefaultWmsData(
  run: IntegrationRun,
  phase: WmsOutboundPhase
): Record<string, unknown> {
  const activeSource = run.operation_context.current_source_rack
  const sourceRack =
    activeSource &&
    typeof activeSource === 'object' &&
    'rack_id' in activeSource &&
    'rack_face' in activeSource &&
    typeof activeSource.rack_id === 'string' &&
    typeof activeSource.rack_face === 'string'
      ? activeSource
      : null
  const activeDeparture = run.operation_context.departure_candidate
  const departure =
    activeDeparture &&
    typeof activeDeparture === 'object' &&
    'rack_id' in activeDeparture &&
    'rack_face' in activeDeparture &&
    'current_location' in activeDeparture &&
    typeof activeDeparture.rack_id === 'string' &&
    typeof activeDeparture.rack_face === 'string' &&
    typeof activeDeparture.current_location === 'string'
      ? activeDeparture
      : null
  const outfeedPosition = run.site_configuration?.outfeed_position ?? 'CNV0302'
  const point2Scan = [...run.steps].reverse().find(step => step.phase === 'POINT2_SCAN')

  switch (phase) {
    case 'TASK_PREPARE':
      return { task_id: run.task_id ?? '', workline_code: run.workline_code }
    case 'BIN_INBOUND_BATCH':
      return {
        task_id: run.task_id ?? '',
        rack_id: sourceRack?.rack_id ?? '',
        rack_face: sourceRack?.rack_face ?? '',
        max_bin_count: 4
      }
    case 'WORK_ADMISSION':
      return {
        task_id: run.task_id ?? '',
        bin_code: run.bin_code ?? '',
        scanned_at:
          typeof point2Scan?.result.scanned_at === 'number'
            ? point2Scan.result.scanned_at
            : Date.now()
      }
    case 'BIN_RETURN_BATCH':
      return {
        workline_code: run.workline_code,
        rack_id: sourceRack?.rack_id ?? '',
        rack_face: sourceRack?.rack_face ?? '',
        return_candidates: [
          {
            sequence_no: 1,
            bin_code: run.bin_code ?? '',
            source: { type: 'HANDOFF_POSITION', location_code: outfeedPosition }
          }
        ]
      }
    case 'RACK_DEPARTURE':
      return {
        task_id: run.task_id ?? '',
        rack_id: departure?.rack_id ?? '',
        current_location: {
          type: 'RACK_POSITION',
          location_code: departure?.current_location ?? ''
        },
        current_face: departure?.rack_face ?? ''
      }
    case 'TASK_COMPLETION':
      return {
        task_id: run.task_id ?? '',
        last_applied_plan_revision: run.plan_resources?.plan_revision ?? 0
      }
  }
}

export function buildDefaultDeviceData(
  run: IntegrationRun,
  phase: 'POINT2_RELEASE' | 'POINT3_ROUTE'
): Record<string, unknown> {
  const completionResult = [...run.steps]
    .reverse()
    .find(step => step.operation === 'outbound.manual_bin.work_completed@v1')?.result.result
  const scanDeviceCodes = run.site_configuration?.scan_device_codes ?? []
  return {
    device_code:
      phase === 'POINT2_RELEASE'
        ? (scanDeviceCodes[1] ?? 'STATION_SCAN10')
        : (scanDeviceCodes[2] ?? 'STATION_SCAN11'),
    task_type: phase === 'POINT3_ROUTE' && completionResult === 'NG' ? 'MOVE_LEFT' : 'MOVE_FORWARD',
    params: {},
    timeout_ms: 30000,
    reason: '人工出库现场联调'
  }
}

export function parseEditableJsonObject(text: string, label: string): Record<string, unknown> {
  let value: unknown
  try {
    value = JSON.parse(text) as unknown
  } catch {
    throw new Error(`${label} 必须是合法 JSON object`)
  }
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${label} 必须是 JSON object`)
  }
  return value as Record<string, unknown>
}

interface InboundBatchBin {
  bin_code: string
  source_locator: { type: 'RACK_BIN_SLOT'; rack_id: string; rack_face: string; slot_id: string }
}

export function buildInboundBatchTransport(run: IntegrationRun) {
  const value = run.operation_context.inbound_bins
  if (!Array.isArray(value) || value.length < 1 || value.length > 4) {
    throw new Error('请先取得 WMS 返回的完整投料批次（1–4 箱）')
  }
  const bins = value as InboundBatchBin[]
  const rackId = bins[0]?.source_locator?.rack_id
  if (
    !rackId ||
    bins.some(
      bin =>
        !bin.bin_code ||
        bin.source_locator?.type !== 'RACK_BIN_SLOT' ||
        bin.source_locator.rack_id !== rackId ||
        !bin.source_locator.rack_face ||
        !bin.source_locator.slot_id
    )
  ) {
    throw new Error('WMS 投料批次缺少有效的料箱来源储位')
  }
  return {
    bins,
    action: {
      kind: 'MOVE_BINS' as const,
      rack_id: rackId,
      source: { kind: 'RACK' as const, location_code: rackId },
      target: {
        kind: 'HANDOFF_POSITION' as const,
        location_code: run.site_configuration.infeed_position
      }
    }
  }
}
