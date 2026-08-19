import { ApiResponseError } from '@/api/client'
import { WorkLineStartErrorResponseSchema } from '@/types/zod-extensions'
import type { z } from 'zod'

export type WorkLineStartReason = z.infer<typeof WorkLineStartErrorResponseSchema>['reason']

function storageKey(worklineId: number): string {
  return `wes:workline:start:${worklineId}`
}

export function generateStartRequestId(): string {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  bytes[6] = (bytes[6] & 0x0f) | 0x40
  bytes[8] = (bytes[8] & 0x3f) | 0x80
  const hex = Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('')

  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

export function readPendingStartRequest(worklineId: number): string | null {
  const value = sessionStorage.getItem(storageKey(worklineId))
  return value && value.trim() ? value : null
}

export function ensurePendingStartRequest(
  worklineId: number,
  create: () => string = generateStartRequestId
): string {
  const existing = readPendingStartRequest(worklineId)
  if (existing) return existing

  const requestId = create()
  sessionStorage.setItem(storageKey(worklineId), requestId)
  return requestId
}

export function clearPendingStartRequest(worklineId: number): void {
  sessionStorage.removeItem(storageKey(worklineId))
}

export function getStableStartReason(error: unknown): WorkLineStartReason | null {
  if (!(error instanceof ApiResponseError)) return null

  const parsed = WorkLineStartErrorResponseSchema.safeParse(error.data)
  return parsed.success ? parsed.data.reason : null
}
