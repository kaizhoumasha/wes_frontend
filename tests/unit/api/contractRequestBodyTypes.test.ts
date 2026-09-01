import { describe, expectTypeOf, it } from 'vitest'
import type { ContractRequestBody } from '@/api/contract/types'
import type { components } from '@/api/generated/openapi-types'
import type { DebugTasksInput, ResetInput } from '@/api/modules/transport'

describe('ContractRequestBody', () => {
  it('extracts required, optional and missing JSON request bodies', () => {
    expectTypeOf<DebugTasksInput>().toEqualTypeOf<
      components['schemas']['_DebugTransportTaskRequest']
    >()
    expectTypeOf<ResetInput>().toEqualTypeOf<
      components['schemas']['_DebugTransportStepConfirmation'] | null
    >()
    expectTypeOf<
      ContractRequestBody<
        '/api/v1/transport/debug-tasks/{transport_task_id}/reset-preview',
        'get'
      >
    >().toBeNever()
  })
})
