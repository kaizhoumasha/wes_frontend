import { describe, expect, it, vi } from 'vitest'
import type { ContractResponseData } from '@/api/contract/types'
import { workLinesApiMethods } from '@/api/modules/workLines'
import { PlaneCurrentTaskV2Schema } from '@/types/generated/zod-schemas'

describe('WorkLine current-task v2 contract', () => {
  it('exposes the generated response shape and route method', async () => {
    type Result = ContractResponseData<
      '/api/v1/workline/work_lines/{id}/plane/current-task/v2',
      'get'
    >
    const payload = {
      schema_version: 'plane.current-task.v2',
      generated_at: '2026-09-17T22:00:00Z',
      current_task: {
        task_id: 'PT-001',
        status: 'EXECUTING',
        target_rack_id: 'RACK-01',
        target_rack_face: 'A',
        last_applied_plan_revision: 2
      }
    } satisfies Result
    expect(PlaneCurrentTaskV2Schema.safeParse(payload).success).toBe(true)

    const send = vi.fn().mockResolvedValue(payload)
    const method = vi
      .spyOn(workLinesApiMethods, 'planeCurrentTaskV2')
      .mockReturnValue({ send } as never)
    await workLinesApiMethods.planeCurrentTaskV2({ id: 7 }).send()
    expect(method).toHaveBeenCalledWith({ id: 7 })
  })
})
