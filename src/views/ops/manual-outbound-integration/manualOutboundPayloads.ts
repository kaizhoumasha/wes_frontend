import type { IntegrationPhase, IntegrationRun } from '@/api/manualOutboundIntegrationApi'

export type WmsOutboundPhase =
  | 'TASK_PREPARE'
  | 'BIN_INBOUND_BATCH'
  | 'WORK_ADMISSION'
  | 'COMPLETION_REPORT'
  | 'BIN_RETURN_BATCH'
  | 'RACK_DEPARTURE'
  | 'TASK_COMPLETION'

const WMS_OUTBOUND_PHASES = new Set<IntegrationPhase>([
  'TASK_PREPARE',
  'BIN_INBOUND_BATCH',
  'WORK_ADMISSION',
  'COMPLETION_REPORT',
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
  const sourceRack = run.plan_resources?.bin_source_racks[0]
  const outfeedPosition = run.site_configuration?.outfeed_position ?? 'CNV0302'
  const outboundTransferPosition =
    run.site_configuration?.outbound_transfer_position ?? 'OUT65'
  const completion = [...run.steps]
    .reverse()
    .find(step => step.operation === 'outbound.manual_bin.work_completed@v1')
  const point2Scan = [...run.steps].reverse().find(step => step.phase === 'POINT2_SCAN')

  switch (phase) {
    case 'TASK_PREPARE':
      return { task_id: run.task_id ?? '', workline_code: run.workline_code }
    case 'BIN_INBOUND_BATCH':
      return {
        task_id: run.task_id ?? '',
        rack_id: sourceRack?.rack_id ?? '',
        rack_face: sourceRack?.rack_face ?? '',
        max_bin_count: 1
      }
    case 'WORK_ADMISSION':
      return {
        bin_code: run.bin_code ?? '',
        scanned_at:
          typeof point2Scan?.result.scanned_at === 'number'
            ? point2Scan.result.scanned_at
            : Date.now()
      }
    case 'COMPLETION_REPORT':
      return {
        completion_operation_id: completion?.operation_id ?? '',
        task_id:
          typeof run.operation_context.admission_task_id === 'string'
            ? run.operation_context.admission_task_id
            : '',
        bin_code: run.bin_code ?? '',
        apply_revision: 1,
        apply_result: 'APPLIED',
        occurred_at: Date.now()
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
        rack_id:
          typeof run.operation_context.departure_ready_rack_id === 'string'
            ? run.operation_context.departure_ready_rack_id
            : run.plan_resources?.target_rack.rack_id ?? '',
        current_location: {
          type: 'RACK_POSITION',
          location_code: outboundTransferPosition
        },
        current_face: run.plan_resources?.target_rack.rack_face ?? '0'
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
