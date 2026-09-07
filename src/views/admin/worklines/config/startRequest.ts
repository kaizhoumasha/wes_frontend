import { ApiResponseError } from '@/api/client'
import { WorkLineStartErrorResponseSchema } from '@/types/zod-extensions'
import type { z } from 'zod'

export type WorkLineStartReason = z.infer<typeof WorkLineStartErrorResponseSchema>['reason']

export function getStableStartReason(error: unknown): WorkLineStartReason | null {
  if (!(error instanceof ApiResponseError)) return null

  const parsed = WorkLineStartErrorResponseSchema.safeParse(error.data)
  return parsed.success ? parsed.data.reason : null
}
