import { apiClient } from '@/api/client'
import type { ResetResult } from '@/api/modules/transport'

export type TransportDebugConfirmationStep =
  | 'RACK_TO_STATION'
  | 'BINS_TO_INFEED'
  | 'BINS_TO_RACK'
  | 'RACK_TO_STORAGE'

export interface TransportDebugStepConfirmationInput {
  step: TransportDebugConfirmationStep
  assertion: 'PHYSICAL_TARGET_REACHED'
}

export async function confirmTransportDebugStep(
  transportTaskId: string,
  confirmation: TransportDebugStepConfirmationInput
): Promise<ResetResult> {
  const encodedTaskId = encodeURIComponent(transportTaskId)
  return await apiClient.Post<ResetResult>(
    `/api/v1/transport/debug-tasks/${encodedTaskId}/reset`,
    confirmation
  )
}
