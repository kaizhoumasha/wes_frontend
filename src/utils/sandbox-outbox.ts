import type { SandboxPendingOutbox } from '@/types/runtime'

const ACK_WAIT_STATUSES = new Set(['NEW', 'DISPATCHING', 'SENT'])
type PayloadRecord = Record<string, unknown>

export function isCurrentSandboxAction(outbox: SandboxPendingOutbox | null | undefined): boolean {
  return outbox?.is_current_action !== false && outbox?.is_actionable !== false
}

export function canAckSandboxOutbox(outbox: SandboxPendingOutbox | null | undefined): boolean {
  return (
    isCurrentSandboxAction(outbox) &&
    outbox?.dispatch_type === 'DEVICE_COMMAND' &&
    ACK_WAIT_STATUSES.has(outbox.status ?? 'NEW')
  )
}

export function canSubmitSandboxResult(outbox: SandboxPendingOutbox | null | undefined): boolean {
  return (
    isCurrentSandboxAction(outbox) &&
    outbox?.dispatch_type === 'DEVICE_COMMAND' &&
    outbox?.status === 'ACKED'
  )
}

export function canSubmitSandboxExternalCallback(
  outbox: SandboxPendingOutbox | null | undefined
): boolean {
  return (
    isCurrentSandboxAction(outbox) &&
    outbox?.dispatch_type === 'EXTERNAL_HTTP' &&
    ACK_WAIT_STATUSES.has(outbox.status ?? 'NEW')
  )
}

function asPayloadRecord(value: unknown): PayloadRecord {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as PayloadRecord) : {}
}

function nonEmptyString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

function isRackArrivedCallback(callbackType: string | undefined): boolean {
  return callbackType === 'WMS_RACK_ARRIVED' || callbackType === 'RCS_RACK_ARRIVED'
}

function hasArrayPayload(value: unknown): value is unknown[] {
  return Array.isArray(value) && value.length > 0
}

function buildSandboxRackBinPayload(outboxId: number, rackCode: string): {
  active_bin_rack: PayloadRecord
  bin_mounts: PayloadRecord[]
} {
  const slots = ['A', 'B', 'C', 'D']
  const bin_mounts = slots.map(slot => ({
    rack_code: rackCode,
    rack_slot_code: slot,
    bin_code: `SANDBOX-BIN-${outboxId}-${slot}`
  }))
  const cells = bin_mounts.map(mount => ({
    rack_id: rackCode,
    rack_code: rackCode,
    rack_slot_code: mount.rack_slot_code,
    rack_slot_location_code: `${rackCode}-1${mount.rack_slot_code}-${mount.rack_slot_code === 'A' || mount.rack_slot_code === 'B' ? '0' : '1'}`,
    bin_id: mount.bin_code,
    bin_code: mount.bin_code,
    bin_orientation_code: `${mount.bin_code}-A`,
    bin_type: '6格箱',
    bin_cell_location: `${mount.bin_code}-1`,
    bin_cell_index: '1',
    status: 'EMPTY',
    capacity_depth_mm: 10,
    used_depth_mm: 0
  }))
  return {
    active_bin_rack: {
      rack_id: rackCode,
      rack_code: rackCode,
      cells
    },
    bin_mounts
  }
}

export function resolveSandboxExternalCallbackType(
  outbox: SandboxPendingOutbox | null | undefined
): string | undefined {
  const payload = asPayloadRecord(outbox?.payload_json)
  return nonEmptyString(payload.callback_type) || nonEmptyString(payload.resume_callback_type)
}

export function buildSandboxExternalCallbackPayload(
  outbox: SandboxPendingOutbox | null | undefined
): PayloadRecord {
  const payload = asPayloadRecord(outbox?.payload_json)
  const target = asPayloadRecord(payload.target)
  const activeBinRack = asPayloadRecord(payload.active_bin_rack)
  const callbackType = resolveSandboxExternalCallbackType(outbox)
  const positionCode =
    nonEmptyString(payload.position_code) ||
    nonEmptyString(payload.target_position_code) ||
    nonEmptyString(target.position_code)
  const rackCode =
    nonEmptyString(payload.rack_code) ||
    nonEmptyString(payload.rack_id) ||
    nonEmptyString(activeBinRack.rack_code) ||
    nonEmptyString(activeBinRack.rack_id) ||
    (isRackArrivedCallback(callbackType) && outbox?.id ? `SANDBOX-RACK-${outbox.id}` : undefined)
  const rackKind =
    nonEmptyString(payload.rack_kind) ||
    nonEmptyString(payload.rack_type) ||
    nonEmptyString(activeBinRack.rack_kind) ||
    nonEmptyString(activeBinRack.rack_type)
  const sandboxRackPayload =
    isRackArrivedCallback(callbackType) && rackCode && outbox?.id
      ? buildSandboxRackBinPayload(outbox.id, rackCode)
      : undefined

  return {
    ...payload,
    ...(callbackType ? { callback_type: callbackType } : {}),
    ...(positionCode ? { position_code: positionCode } : {}),
    ...(rackCode ? { rack_code: rackCode } : {}),
    ...(rackKind ? { rack_kind: rackKind } : {}),
    ...(sandboxRackPayload && !hasArrayPayload(payload.bin_mounts)
      ? { bin_mounts: sandboxRackPayload.bin_mounts }
      : {}),
    ...(sandboxRackPayload && !hasArrayPayload(activeBinRack.cells)
      ? { active_bin_rack: sandboxRackPayload.active_bin_rack }
      : {})
  }
}
