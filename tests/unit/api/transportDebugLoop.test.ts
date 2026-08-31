import { describe, expect, it, vi } from 'vitest'
import { confirmTransportDebugStep } from '@/api/modules/transportDebugLoop'

const apiClientMocks = vi.hoisted(() => ({ Post: vi.fn() }))

vi.mock('@/api/client', () => ({ apiClient: { Post: apiClientMocks.Post } }))

describe('confirmTransportDebugStep', () => {
  it('encodes the task id and sends the physical-target assertion as the request body', async () => {
    const result = { transport_task_id: 'transport/1' }
    apiClientMocks.Post.mockResolvedValueOnce(result)
    const confirmation = {
      step: 'BINS_TO_INFEED' as const,
      assertion: 'PHYSICAL_TARGET_REACHED' as const
    }

    await expect(confirmTransportDebugStep('transport/1', confirmation)).resolves.toBe(result)

    expect(apiClientMocks.Post).toHaveBeenCalledWith(
      '/api/v1/transport/debug-tasks/transport%2F1/reset',
      confirmation
    )
  })
})
