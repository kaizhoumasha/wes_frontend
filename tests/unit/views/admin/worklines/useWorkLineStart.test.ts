import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiResponseError } from '@/api/client'
import type { WorkLinesItem as Workline } from '@/api/modules/workLines'
import type { WorklinesStartResult } from '@/api/modules/workline'
import { worklineApiMethods } from '@/api/modules/workline'
import {
  ensurePendingStartRequest,
  readPendingStartRequest
} from '@/views/admin/worklines/config/startRequest'
import { useWorkLineStart } from '@/views/admin/worklines/composables/useWorkLineStart'

const mocks = vi.hoisted(() => ({
  send: vi.fn(),
  worklinesStart: vi.fn()
}))

vi.mock('@/api/modules/workline', () => ({
  worklineApiMethods: {
    worklinesStart: mocks.worklinesStart
  }
}))

const workline = {
  id: 7,
  line_code: 'LINE-007',
  line_name: '七号线',
  line_type: 'AUTO',
  run_mode: 'AUTO',
  is_active: true,
  version: 1
} satisfies Workline

const otherWorkline = {
  ...workline,
  id: 8,
  line_code: 'LINE-008',
  line_name: '八号线'
} satisfies Workline

const successResponse = {
  line_run_epoch_id: 71,
  epoch_code: 'request-7',
  workline_id: 7,
  plugin_key: 'rough_sorter',
  plugin_version: '1.0.0',
  flow_mode: 'AUTO',
  epoch_status: 'CLOSED',
  epoch_started_at: '2026-08-20T01:00:00Z',
  epoch_closed_at: '2026-08-20T02:00:00Z',
  current_workline_runtime_status: 'RUNNING',
  created: true
} satisfies WorklinesStartResult

describe('useWorkLineStart', () => {
  beforeEach(() => {
    sessionStorage.clear()
    vi.clearAllMocks()
    mocks.worklinesStart.mockImplementation(() => ({ send: mocks.send }))
  })

  it('reuses the stored id after network failure and suppresses double submit', async () => {
    let rejectRequest!: (reason?: unknown) => void
    const pendingRequest = new Promise<never>((_resolve, reject) => {
      rejectRequest = reject
    })
    mocks.send.mockReturnValueOnce(pendingRequest)
    const start = useWorkLineStart({ createRequestId: () => 'request-7' })
    start.open(workline)

    const first = start.submit()
    const second = start.submit()

    expect(mocks.send).toHaveBeenCalledOnce()
    expect(readPendingStartRequest(workline.id)).toBe('request-7')
    rejectRequest(new TypeError('Failed to fetch'))
    await expect(first).resolves.toBeUndefined()
    await expect(second).resolves.toBeUndefined()
    expect(start.state.value).toBe('delivery-unknown')

    mocks.send.mockResolvedValueOnce({ ...successResponse, created: false })
    await start.submit()

    expect(worklineApiMethods.worklinesStart).toHaveBeenNthCalledWith(
      2,
      { workline_id: 7 },
      { request_id: 'request-7' }
    )
  })

  it('clears the stored id on success and exposes each START result fact', async () => {
    mocks.send.mockResolvedValue(successResponse)
    const start = useWorkLineStart({ createRequestId: () => 'request-7' })

    start.open(workline)
    await start.submit()

    expect(readPendingStartRequest(workline.id)).toBeNull()
    expect(start.state.value).toBe('succeeded')
    expect(start.result.value?.created).toBe(true)
    expect(start.result.value?.epoch_status).toBe('CLOSED')
    expect(start.result.value?.current_workline_runtime_status).toBe('RUNNING')
  })

  it('creates a new id for the next explicit intent after success', async () => {
    const createRequestId = vi
      .fn()
      .mockReturnValueOnce('request-7-a')
      .mockReturnValueOnce('request-7-b')
    mocks.send.mockResolvedValue(successResponse)
    const start = useWorkLineStart({ createRequestId })

    start.open(workline)
    await start.submit()
    start.open(workline)
    await start.submit()

    expect(worklineApiMethods.worklinesStart).toHaveBeenNthCalledWith(
      1,
      { workline_id: 7 },
      { request_id: 'request-7-a' }
    )
    expect(worklineApiMethods.worklinesStart).toHaveBeenNthCalledWith(
      2,
      { workline_id: 7 },
      { request_id: 'request-7-b' }
    )
  })

  it('reports local preparation failure and sends only one intent after a safe retry', async () => {
    const createRequestId = vi
      .fn()
      .mockImplementationOnce(() => {
        throw new Error('random source unavailable')
      })
      .mockReturnValueOnce('request-7')
    mocks.send.mockResolvedValue(successResponse)
    const start = useWorkLineStart({ createRequestId })

    start.open(workline)
    await start.submit()

    expect(start.state.value).toBe('preparation-failed')
    expect(readPendingStartRequest(workline.id)).toBeNull()
    expect(worklineApiMethods.worklinesStart).not.toHaveBeenCalled()

    await start.submit()

    expect(worklineApiMethods.worklinesStart).toHaveBeenCalledOnce()
    expect(worklineApiMethods.worklinesStart).toHaveBeenCalledWith(
      { workline_id: 7 },
      { request_id: 'request-7' }
    )
    expect(start.state.value).toBe('succeeded')
  })

  it('does not send when session storage cannot persist the request id', async () => {
    const setItem = vi.spyOn(sessionStorage, 'setItem').mockImplementationOnce(() => {
      throw new DOMException('storage unavailable', 'QuotaExceededError')
    })
    const start = useWorkLineStart({ createRequestId: () => 'request-7' })

    start.open(workline)
    await start.submit()

    expect(start.state.value).toBe('preparation-failed')
    expect(worklineApiMethods.worklinesStart).not.toHaveBeenCalled()
    expect(readPendingStartRequest(workline.id)).toBeNull()
    setItem.mockRestore()

    mocks.send.mockResolvedValueOnce(successResponse)
    await start.submit()

    expect(worklineApiMethods.worklinesStart).toHaveBeenCalledOnce()
    expect(start.state.value).toBe('succeeded')
  })

  it('does not turn a terminal result into another intent without reopen', async () => {
    mocks.send.mockResolvedValue(successResponse)
    const start = useWorkLineStart({ createRequestId: () => 'request-7' })

    start.open(workline)
    await start.submit()
    await start.submit()

    expect(mocks.send).toHaveBeenCalledOnce()
    expect(start.state.value).toBe('succeeded')
  })

  it.each([
    'WORKLINE_NOT_FOUND',
    'INVALID_STATE',
    'CONFIGURATION_INVALID',
    'IDEMPOTENCY_CONFLICT',
    'SERVICE_UNAVAILABLE'
  ] as const)('clears the stored id and rejects stable reason %s', async reason => {
    mocks.send.mockRejectedValue(
      new ApiResponseError('4000', 'definite rejection', 'now', { reason })
    )
    const start = useWorkLineStart({ createRequestId: () => 'request-7' })

    start.open(workline)
    await start.submit()

    expect(readPendingStartRequest(workline.id)).toBeNull()
    expect(start.state.value).toBe('rejected')
    expect(start.rejectionReason.value).toBe(reason)
  })

  it.each([
    ['transport failure', new TypeError('Failed to fetch')],
    ['timeout', new Error('request timeout')],
    ['proxy plain 503', new Error('503 Service Unavailable')],
    ['5xx without stable data', new ApiResponseError('5003', 'unavailable', 'now')],
    ['malformed error data', new ApiResponseError('5003', 'unavailable', 'now', { reason: 503 })]
  ])('retains the stored id and marks %s as delivery unknown', async (_label, error) => {
    mocks.send.mockRejectedValue(error)
    const start = useWorkLineStart({ createRequestId: () => 'request-7' })

    start.open(workline)
    await start.submit()

    expect(readPendingStartRequest(workline.id)).toBe('request-7')
    expect(start.state.value).toBe('delivery-unknown')
    expect(start.rejectionReason.value).toBeNull()
  })

  it('does not replace the current WorkLine while submitting', async () => {
    let rejectRequest!: (reason?: unknown) => void
    mocks.send.mockReturnValueOnce(
      new Promise<never>((_resolve, reject) => {
        rejectRequest = reject
      })
    )
    const start = useWorkLineStart({ createRequestId: () => 'request-7' })
    start.open(workline)

    const pending = start.submit()
    start.open(otherWorkline)

    expect(start.workline.value?.id).toBe(7)
    expect(start.state.value).toBe('submitting')
    expect(readPendingStartRequest(8)).toBeNull()

    rejectRequest(new TypeError('Failed to fetch'))
    await pending
    expect(start.state.value).toBe('delivery-unknown')
  })

  it('opens an existing WorkLine identity as delivery unknown', () => {
    ensurePendingStartRequest(workline.id, () => 'request-7')
    const start = useWorkLineStart()

    start.open(workline)

    expect(start.state.value).toBe('delivery-unknown')
  })

  it('keeps a definite rejection terminal until reopen', async () => {
    mocks.send
      .mockRejectedValueOnce(
        new ApiResponseError('4000', 'invalid', 'now', {
          reason: 'INVALID_STATE'
        })
      )
      .mockResolvedValueOnce(successResponse)
    const start = useWorkLineStart({ createRequestId: () => 'request-7' })

    start.open(workline)
    await start.submit()
    await start.submit()

    expect(mocks.send).toHaveBeenCalledOnce()
    expect(start.state.value).toBe('rejected')

    start.open(workline)
    await start.submit()
    expect(mocks.send).toHaveBeenCalledTimes(2)
  })
})
