import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => {
  const send = vi.fn()
  const method = vi.fn(() => ({ send }))
  return {
    send,
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
      replayInboxes: method,
      manualSessions: method
    }
  }
})

vi.mock('@/api/modules/workline', () => ({
  worklineApiMethods: mocks.methods
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
      step_code: undefined,
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
})
