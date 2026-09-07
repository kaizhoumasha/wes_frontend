import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiResponseError } from '@/api/client'
import type { WorkLinesItem as Workline } from '@/api/modules/workLines'
import { useWorkLineStart } from '@/views/admin/worklines/composables/useWorkLineStart'

const mocks = vi.hoisted(() => ({
  send: vi.fn(),
  worklinesStart: vi.fn(),
  getById: vi.fn(),
  read: vi.fn()
}))
vi.mock('@/api/modules/workline', () => ({
  worklineApiMethods: { worklinesStart: mocks.worklinesStart }
}))
vi.mock('@/api/modules/workLines', () => ({ workLinesApiMethods: { getById: mocks.getById } }))
const workline = {
  id: 7,
  line_code: 'LINE-007',
  line_name: '七号线',
  line_type: 'AUTO',
  run_mode: 'AUTO',
  is_active: false,
  version: 1
} satisfies Workline
const success = {
  workline_id: 7,
  version: 2,
  plugin_key: 'fake',
  plugin_version: '1.0.0',
  flow_mode: 'AUTO',
  is_active: true
}

describe('useWorkLineStart', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.worklinesStart.mockImplementation(() => ({ send: mocks.send }))
    mocks.getById.mockImplementation(() => ({ send: mocks.read }))
    mocks.read.mockResolvedValue({ ...workline, version: 2, is_active: true })
  })
  it('submits the selected version once and exposes the WorkLine result', async () => {
    mocks.send.mockResolvedValue(success)
    const start = useWorkLineStart()
    start.open(workline)
    await start.submit()
    await start.submit()
    expect(mocks.worklinesStart).toHaveBeenCalledExactlyOnceWith({ workline_id: 7 }, { version: 1 })
    expect(start.result.value).toEqual(success)
    expect(start.state.value).toBe('succeeded')
  })
  it('suppresses duplicate submission and replacement while pending', async () => {
    let resolve!: (value: typeof success) => void
    mocks.send.mockReturnValue(
      new Promise(resolvePromise => {
        resolve = resolvePromise
      })
    )
    const start = useWorkLineStart()
    start.open(workline)
    const pending = start.submit()
    await start.submit()
    start.open({ ...workline, id: 8 })
    expect(start.workline.value?.id).toBe(7)
    expect(mocks.send).toHaveBeenCalledOnce()
    resolve(success)
    await pending
  })
  it.each([
    ['lost response', new TypeError('Failed to fetch'), 'delivery-unknown'],
    [
      'conflict',
      new ApiResponseError('3012', 'conflict', 'now', { reason: 'VERSION_CONFLICT' }),
      'rejected'
    ]
  ])(
    'only rereads after %s and never retries with the refreshed version',
    async (_label, error, state) => {
      mocks.send.mockRejectedValue(error)
      const start = useWorkLineStart()
      start.open(workline)
      await start.submit()
      expect(mocks.getById).toHaveBeenCalledExactlyOnceWith(7, {
        config: { cacheFor: 0, shareRequest: false }
      })
      expect(start.workline.value?.version).toBe(2)
      expect(start.state.value).toBe(state)
      await start.submit()
      expect(mocks.send).toHaveBeenCalledOnce()
    }
  )
  it('keeps an unsuccessful reread visible and allows only another read', async () => {
    mocks.send.mockRejectedValue(new TypeError('Failed to fetch'))
    mocks.read.mockRejectedValueOnce(new Error('offline'))
    const start = useWorkLineStart()
    start.open(workline)
    await start.submit()
    expect(start.refreshFailed.value).toBe(true)
    await start.refresh()
    expect(start.refreshFailed.value).toBe(false)
    expect(start.workline.value?.version).toBe(2)
    await start.submit()
    expect(mocks.send).toHaveBeenCalledOnce()
  })
  it.each(['WORKLINE_NOT_FOUND', 'INVALID_STATE', 'CONFIGURATION_INVALID', 'SERVICE_UNAVAILABLE'])(
    'keeps %s terminal',
    async reason => {
      mocks.send.mockRejectedValue(new ApiResponseError('4000', 'rejected', 'now', { reason }))
      const start = useWorkLineStart()
      start.open(workline)
      await start.submit()
      await start.submit()
      expect(start.rejectionReason.value).toBe(reason)
      expect(mocks.send).toHaveBeenCalledOnce()
      expect(mocks.read).not.toHaveBeenCalled()
    }
  )
})
