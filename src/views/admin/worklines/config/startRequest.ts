import { ApiResponseError } from '@/api/client'
import { WorkLineStartErrorResponseSchema } from '@/types/zod-extensions'
import type { z } from 'zod'

export type WorkLineStartReason = z.infer<typeof WorkLineStartErrorResponseSchema>['reason']

function storageKey(worklineId: number): string {
  return `wes:workline:start:${worklineId}`
}

export function readPendingStartRequest(worklineId: number): string | null {
  const value = sessionStorage.getItem(storageKey(worklineId))
  return value && value.trim() ? value : null
}

export function ensurePendingStartRequest(
  worklineId: number,
  create: () => string = () => crypto.randomUUID()
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
