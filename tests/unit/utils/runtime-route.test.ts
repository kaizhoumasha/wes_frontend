import { describe, expect, it } from 'vitest'
import { buildRuntimeTraceQuery, buildRuntimeWorklineQuery } from '@/utils/runtime-route'

describe('runtime-route', () => {
  it('keeps workline and device selection query values shareable as strings', () => {
    expect(buildRuntimeWorklineQuery(101, 201)).toEqual({
      worklineId: '101',
      deviceId: '201'
    })
  })

  it('drops empty trace lookup values without dropping valid identifiers', () => {
    expect(
      buildRuntimeTraceQuery({
        traceId: 'trace-001',
        sessionId: null,
        requestId: '',
        commandCode: undefined,
        dispatchKey: 'dispatch-1',
        barcode: 'PKG-001',
        worklineId: 101,
        deviceId: 201
      })
    ).toEqual({
      traceId: 'trace-001',
      sessionId: undefined,
      requestId: undefined,
      commandCode: undefined,
      dispatchKey: 'dispatch-1',
      barcode: 'PKG-001',
      worklineId: '101',
      deviceId: '201'
    })
  })
})
