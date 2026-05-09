import type { SandboxPendingOutbox } from '@/types/runtime'

const ACK_WAIT_STATUSES = new Set(['NEW', 'DISPATCHING', 'SENT'])

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
  return isCurrentSandboxAction(outbox) && outbox?.status === 'ACKED'
}
