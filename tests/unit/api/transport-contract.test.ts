import { describe, expect, expectTypeOf, it, vi } from 'vitest'
import type { ContractRequestBody, ContractResponseData } from '@/api/contract/types'
import { transportApiMethods, transportDebugRunApi } from '@/api/modules/transport'

describe('Transport automatic-run canonical contract', () => {
  it('preserves opaque faces and exposes persistent terminal/attention states', () => {
    type CreateRun = ContractRequestBody<'/api/v1/transport/debug-runs', 'post'>
    type Run = ContractResponseData<'/api/v1/transport/debug-runs/{run_id}', 'get'>
    const input: CreateRun = {
      rack_id: '510056',
      face_groups: [{ face: ' 90 ', bins: [{ bin_id: 'A000001922', slot_id: 'S1' }] }]
    }
    const statuses: Run['status'][] = ['RUNNING', 'NEEDS_ATTENTION', 'COMPLETED', 'FAILED', 'ABORTED']
    expect(input.face_groups[0]?.face).toBe(' 90 ')
    expect(statuses).toContain('NEEDS_ATTENTION')
    expectTypeOf<Run['can_abort']>().toEqualTypeOf<boolean>()
  })

  it('accepts a RACK reference for the formal rotate request', () => {
    type DebugTask = ContractRequestBody<'/api/v1/transport/debug-tasks', 'post'>
    const rotate: DebugTask = {
      kind: 'RACK_ROTATE',
      client_request_id: '019f12d0-58d7-7b4d-a23a-1b90aa5d4471',
      data: {
        rack_id: '510056',
        position: { kind: 'RACK', location_code: '510056' },
        target_face: '270',
        rcs_template_id: 'CTU02'
      }
    }
    expect(rotate.data.position.kind).toBe('RACK')
  })

  it('always reads persisted run snapshots without GET cache or request sharing', async () => {
    const send = vi.fn().mockResolvedValue({})
    const get = vi.spyOn(transportApiMethods, 'getByRunId').mockReturnValue({ send } as never)
    await transportDebugRunApi.get('run-1')
    expect(get).toHaveBeenCalledWith(
      { run_id: 'run-1' },
      { cacheFor: 0, shareRequest: false }
    )
  })
})
