import { describe, expect, it } from 'vitest'
import { parseWorklineIntegrationDebugEvent } from '@/api/streaming/worklineIntegrationDebugStream'

describe('worklineIntegrationDebugStream', () => {
  it('accepts only the fixed run update event shape', () => {
    const payload = { run_id: 'run-1', version: 2, current_phase: 'POINT2_SCAN', steps: [] }

    expect(
      parseWorklineIntegrationDebugEvent('workline_integration_debug.updated', payload)
    ).toEqual({
      type: 'workline_integration_debug.updated',
      payload
    })
    expect(parseWorklineIntegrationDebugEvent('other.updated', payload)).toBeNull()
    expect(
      parseWorklineIntegrationDebugEvent('workline_integration_debug.updated', {
        ...payload,
        steps: null
      })
    ).toBeNull()
  })
})
