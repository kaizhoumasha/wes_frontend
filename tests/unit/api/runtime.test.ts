import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => {
  const send = vi.fn()
  const method = vi.fn(() => ({ send }))
  const apiClientGet = vi.fn(() => ({ send }))
  const apiClientPost = vi.fn(() => ({ send }))
  return {
    send,
    apiClientGet,
    apiClientPost,
    methods: {
      overview: method,
      worklines: method,
      getWorklines: method,
      devices: method,
      getDevices: method,
      query: method,
      request: method,
      trace: method,
      blockingPoint: method,
      session: method,
      command: method,
      dispatch: method,
      sandboxPending: method,
      sandboxWorklinesStart: method,
      replayInboxes: method,
      manualSessions: method
    },
    runtimeHoldMethods: {
      runtimeHoldDetail: method,
      resolveRuntimeHold: method,
      runtimeHoldNgReasons: method,
      ngReturnItems: method
    }
  }
})

vi.mock('@/api/modules/workline', () => ({
  worklineApiMethods: mocks.methods,
  runtimeHoldApiMethods: mocks.runtimeHoldMethods
}))

vi.mock('@/api/client', () => ({
  apiClient: {
    Get: mocks.apiClientGet,
    Post: mocks.apiClientPost
  }
}))

describe('runtimeApiMethods', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.send.mockResolvedValue({ ok: true })
  })

  it('normalizes trace query defaults before delegating to workline API', async () => {
    const { runtimeApiMethods } = await import('@/api/modules/runtime')

    const result = await runtimeApiMethods
      .queryTraces({
        keyword: 'PKG-001',
        workline_id: 101,
        device_id: 201
      })
      .send()

    expect(mocks.methods.query).toHaveBeenCalledWith({
      limit: 20,
      offset: 0,
      only_active: false,
      only_failed: false,
      device_id: 201,
      keyword: 'PKG-001',
      status: undefined,
      plugin_state: undefined,
      workline_id: 101
    })
    expect(result).toEqual({ ok: true })
  })

  it('routes sandbox operation helpers with path params and payloads intact', async () => {
    const { runtimeApiMethods } = await import('@/api/modules/runtime')
    const replayPayload = { reason: 'retry after callback repair' }
    const manualPayload = {
      operation: 'MARK_FAILED',
      reason: 'operator cancelled stale session'
    }

    await runtimeApiMethods.sandboxPending(25).send()
    await runtimeApiMethods.replayInbox(501, replayPayload).send()
    await runtimeApiMethods.manualSessionOperation(601, manualPayload).send()

    expect(mocks.methods.sandboxPending).toHaveBeenCalledWith({ limit: 25 })
    expect(mocks.methods.replayInboxes).toHaveBeenCalledWith({ inbox_id: 501 }, replayPayload)
    expect(mocks.methods.manualSessions).toHaveBeenCalledWith({ session_id: 601 }, manualPayload)
  })

  it('queries runtime holds directly with filters', async () => {
    const { runtimeApiMethods } = await import('@/api/modules/runtime')

    await runtimeApiMethods
      .runtimeHolds({
        workline_id: 45,
        session_id: 93,
        status: 'OPEN',
        active_only: true,
        limit: 50
      })
      .send()

    expect(mocks.apiClientGet).toHaveBeenCalledWith(
      '/api/v1/workline/runtime-holds?workline_id=45&session_id=93&status=OPEN&active_only=true&limit=50'
    )
  })

  it('queries runtime holds base endpoint when no filters are provided', async () => {
    const { runtimeApiMethods } = await import('@/api/modules/runtime')

    await runtimeApiMethods.runtimeHolds().send()

    expect(mocks.apiClientGet).toHaveBeenCalledWith('/api/v1/workline/runtime-holds')
  })

  it('submits sandbox cleanup through direct workline operations endpoint', async () => {
    const { runtimeApiMethods } = await import('@/api/modules/runtime')

    await runtimeApiMethods
      .sandboxCleanup(45, { dry_run: false, confirmation: 'WL-SMT-SIM' })
      .send()

    expect(mocks.apiClientPost).toHaveBeenCalledWith(
      '/api/v1/workline/operations/sandbox/worklines/45/cleanup',
      { dry_run: false, confirmation: 'WL-SMT-SIM' }
    )
  })

  it('submits workline START request through user-auth sandbox operation endpoint', async () => {
    const { runtimeApiMethods } = await import('@/api/modules/runtime')

    await runtimeApiMethods
      .worklineStartRequested(45, {
        deviceCode: 'ARM03',
        traceId: 'sandbox:start:trace-1'
      })
      .send()

    expect(mocks.methods.sandboxWorklinesStart).toHaveBeenCalledWith(
      { workline_id: 45 },
      {
        device_code: 'ARM03',
        trace_id: 'sandbox:start:trace-1'
      }
    )
  })

  it('generates a sandbox START trace id when omitted', async () => {
    const { runtimeApiMethods } = await import('@/api/modules/runtime')

    await runtimeApiMethods
      .worklineStartRequested(45, {
        deviceCode: 'ARM03'
      })
      .send()

    expect(mocks.methods.sandboxWorklinesStart).toHaveBeenCalledWith(
      { workline_id: 45 },
      {
        device_code: 'ARM03',
        trace_id: expect.stringMatching(/^sandbox:start:45:/)
      }
    )
    expect(mocks.apiClientPost).not.toHaveBeenCalledWith('/api/v1/callback/event', expect.anything())
  })

  it('does not call API-app protected callback event ingress for sandbox START', async () => {
    const { runtimeApiMethods } = await import('@/api/modules/runtime')

    await runtimeApiMethods
      .worklineStartRequested(45, {
        deviceCode: 'ARM03',
        traceId: 'sandbox:start:trace-1'
      })
      .send()

    expect(mocks.methods.sandboxWorklinesStart).toHaveBeenCalledWith(
      { workline_id: 45 },
      {
        device_code: 'ARM03',
        trace_id: 'sandbox:start:trace-1'
      }
    )
    expect(mocks.apiClientPost).not.toHaveBeenCalledWith('/api/v1/callback/event', {
      device_code: 'ARM03',
      event_type: 'WORKLINE_START_REQUESTED',
      timestamp: expect.any(Number),
      trace_id: 'sandbox:start:trace-1',
      event_id: 'sandbox:start:trace-1',
      data: {
        source: 'sandbox',
        workline_id: 45
      }
    })
  })

  it('submits debug data cleanup through non-production operations endpoints', async () => {
    const { runtimeApiMethods } = await import('@/api/modules/runtime')

    await runtimeApiMethods
      .debugDataCleanupWorkline(45, { dry_run: false, confirmation: 'WL-SMT-AUTO' })
      .send()
    await runtimeApiMethods
      .debugDataCleanupAll({ dry_run: false, confirmation: 'CLEAR-ALL-DEBUG-DATA' })
      .send()

    expect(mocks.apiClientPost).toHaveBeenNthCalledWith(
      1,
      '/api/v1/workline/operations/debug-data/worklines/45/cleanup',
      { dry_run: false, confirmation: 'WL-SMT-AUTO' }
    )
    expect(mocks.apiClientPost).toHaveBeenNthCalledWith(
      2,
      '/api/v1/workline/operations/debug-data/cleanup-all',
      { dry_run: false, confirmation: 'CLEAR-ALL-DEBUG-DATA' }
    )
  })
})
