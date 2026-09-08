import { effectScope } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useWmsDiagnostics } from '@/views/ops/wms-diagnostics/useWmsDiagnostics'

afterEach(() => vi.useRealTimers())

function exchange(attemptId: string, body = '{}') {
  return {
    attempt_id: attemptId,
    observed_at: '2026-09-08T12:00:00Z',
    direction: 'WES_TO_WMS' as const,
    operation: 'sample@v1',
    operation_id: 'same-operation',
    business_reference: null,
    method: 'POST',
    path: '/sample',
    status_code: 200,
    elapsed_ms: 10,
    result: 'REJECTED',
    contract_status: 'PASS' as const,
    error_code: null,
    incomplete: false,
    exchange_id: null,
    request: { body, headers: [], state: 'CAPTURED' as const, source: 'WIRE' as const },
    response: { body: '{}', headers: [], state: 'CAPTURED' as const, source: 'WIRE' as const },
    comparisons: [],
    build_version: 'test'
  }
}

function harness() {
  const scope = effectScope()
  type Connector = NonNullable<
    NonNullable<Parameters<typeof useWmsDiagnostics>[0]>['connectStream']
  >
  const attempts: Parameters<Connector>[0][] = []
  const api = {
    listExchanges: vi.fn().mockResolvedValue({
      items: [],
      next_cursor: '1-0',
      scan_incomplete: true,
      retention_hours: 24
    }),
    getExchange: vi.fn()
  }
  const state = scope.run(() =>
    useWmsDiagnostics({
      api,
      connectStream: options => {
        attempts.push(options)
        options.onOpen?.()
        return new Promise<void>(resolve =>
          options.signal.addEventListener('abort', () => resolve(), { once: true })
        )
      }
    })
  )!
  return { state, api, attempts, stop: () => scope.stop() }
}

describe('WMS 有界实时视图', () => {
  it('已选请求收到当次响应后补齐详情，其他尝试不抢走当前选择', async () => {
    const { state, attempts, stop } = harness()
    state.connect()
    await state.select({ phase: 'started', exchange: { ...exchange('a'), result: 'NOT_OBSERVED' } })
    attempts[0]!.onEvent({ phase: 'completed', exchange: exchange('a') })
    expect(state.detail.value?.result).toBe('REJECTED')
    attempts[0]!.onEvent({ phase: 'completed', exchange: exchange('b') })
    expect(state.detail.value?.attempt_id).toBe('a')
    stop()
  })

  it('清空后忽略在途历史响应，隐藏页面断开且恢复时提示间隙', async () => {
    const { state, api, attempts, stop } = harness()
    state.connect()
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden')
    document.dispatchEvent(new Event('visibilitychange'))
    expect(attempts[0]!.signal.aborted).toBe(true)
    vi.restoreAllMocks()
    document.dispatchEvent(new Event('visibilitychange'))
    expect(attempts).toHaveLength(2)
    expect(state.hasGap.value).toBe(true)
    let resolvePage!: (value: unknown) => void
    api.listExchanges.mockImplementationOnce(
      () =>
        new Promise(resolve => {
          resolvePage = resolve
        })
    )
    const pending = state.setMode('recent')
    state.clearView()
    resolvePage({
      items: [exchange('old')],
      next_cursor: null,
      scan_incomplete: false,
      retention_hours: 24
    })
    await pending
    expect(state.exchanges.value).toEqual([])
    stop()
  })

  it('后到的旧详情不覆盖当前选择，已选实时详情只保留一条快照', async () => {
    const { state, api, stop } = harness()
    let resolveDetail!: (value: unknown) => void
    api.getExchange.mockImplementationOnce(
      () =>
        new Promise(resolve => {
          resolveDetail = resolve
        })
    )
    const old = state.select({
      phase: 'recorded',
      exchange: { ...exchange('old'), exchange_id: '1-0' }
    })
    await state.select({ phase: 'completed', exchange: exchange('new') })
    resolveDetail({ ...exchange('old'), exchange_id: '1-0' })
    await old
    expect(state.detail.value?.attempt_id).toBe('new')
    state.closeDetail()
    expect(state.detail.value).toBeNull()
    stop()
  })

  it('按尝试归并阶段，迟到 started 不覆盖 completed，同一业务身份保留独立尝试', async () => {
    vi.useFakeTimers()
    const { state, attempts, stop } = harness()
    state.connect()
    const emit = attempts[0]!.onEvent
    emit({ phase: 'completed', exchange: exchange('a') })
    emit({ phase: 'started', exchange: exchange('a') })
    emit({ phase: 'started', exchange: exchange('b') })
    await vi.advanceTimersByTimeAsync(100)
    expect(state.exchanges.value).toHaveLength(2)
    expect(state.exchanges.value.find(row => row.exchange.attempt_id === 'a')?.phase).toBe(
      'completed'
    )
    expect(state.exchanges.value.find(row => row.exchange.attempt_id === 'b')?.phase).toBe(
      'started'
    )
    stop()
    expect(attempts[0]!.signal.aborted).toBe(true)
  })

  it('暂停仍有界接收；清空仅改变本地视图，不查询历史', async () => {
    vi.useFakeTimers()
    const { state, api, attempts, stop } = harness()
    state.connect()
    state.paused.value = true
    for (let index = 0; index < 600; index++)
      attempts[0]!.onEvent({
        phase: 'completed',
        exchange: exchange(String(index), 'x'.repeat(16000))
      })
    await vi.advanceTimersByTimeAsync(100)
    expect(state.exchanges.value.length).toBeLessThanOrEqual(500)
    expect(state.bufferBytes.value).toBeLessThanOrEqual(2 * 1024 * 1024)
    expect(state.evictedCount.value).toBeGreaterThan(0)
    expect(state.pendingCount.value).toBeGreaterThan(0)
    state.clearView()
    expect(state.exchanges.value).toEqual([])
    expect(state.bufferBytes.value).toBe(0)
    expect(api.listExchanges).not.toHaveBeenCalled()
    stop()
  })

  it('近期模式断开实时流；稀疏空页保留游标，由用户手动继续查询', async () => {
    const { state, api, attempts, stop } = harness()
    state.connect()
    await state.setMode('recent')
    expect(attempts[0]!.signal.aborted).toBe(true)
    expect(api.listExchanges).toHaveBeenCalledTimes(1)
    expect(state.scanIncomplete.value).toBe(true)
    expect(state.nextCursor.value).toBe('1-0')
    await state.loadMore()
    expect(api.listExchanges).toHaveBeenLastCalledWith(expect.objectContaining({ cursor: '1-0' }))
    await state.setMode('live')
    expect(state.hasGap.value).toBe(true)
    expect(attempts).toHaveLength(2)
    stop()
  })
})
