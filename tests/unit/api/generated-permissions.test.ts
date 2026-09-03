import { describe, expect, it } from 'vitest'
import { OPS_PERMISSIONS } from '@/api/generated/permissions'

describe('generated Transport debug-run permissions', () => {
  it('exposes the five independent capability leaves', () => {
    expect(OPS_PERMISSIONS.transportDebugRun).toEqual({
      page: 'ops:transport-debug-run:list',
      list: 'ops:transport-debug-run:list',
      abort: 'ops:transport-debug-run:abort',
      read: 'ops:transport-debug-run:read',
      start: 'ops:transport-debug-run:start',
      stream: 'ops:transport-debug-run:stream'
    })
  })
})
