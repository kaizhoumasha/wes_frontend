import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import WmsDiagnosticsPage from '@/views/ops/wms-diagnostics/WmsDiagnosticsPage.vue'

const ports = vi.hoisted(() => ({ permissions: new Set<string>(), list: vi.fn(), stream: vi.fn() }))
vi.mock('@/composables/usePermission', () => ({
  usePermission: () => ({ hasPermission: (code: string) => ports.permissions.has(code) })
}))
vi.mock('@/api/modules/wmsDiagnostics', () => ({
  wmsDiagnosticsApiMethods: {
    exchanges: (query: unknown) => ({ send: () => ports.list(query) }),
    getByExchangeId: vi.fn()
  }
}))
vi.mock('@/api/streaming/wmsDiagnosticsStream', () => ({
  consumeWmsDiagnosticsStream: (...args: unknown[]) => ports.stream(...args)
}))

beforeEach(() => {
  ports.permissions.clear()
  ports.list
    .mockReset()
    .mockResolvedValue({
      items: [],
      next_cursor: null,
      scan_incomplete: false,
      retention_hours: 24
    })
  ports.stream.mockReset().mockImplementation(() => new Promise(() => {}))
})
afterEach(() => vi.useRealTimers())

describe('WMS 联调页面权限与现场含义', () => {
  it('只有查询权限时打开近期记录，不启动实时流', async () => {
    ports.permissions.add('ops:wms-diagnostics:query')
    const wrapper = mount(WmsDiagnosticsPage)
    await flushPromises()
    expect(ports.list).toHaveBeenCalledTimes(1)
    expect(ports.stream).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('暂无匹配记录')
    expect(wrapper.get('[data-mode="live"]').attributes('disabled')).toBeDefined()
    wrapper.unmount()
  })
  it('合法业务拒绝与合同判定分开展示；暂停、清空不会触发历史查询', async () => {
    vi.useFakeTimers()
    ports.permissions.add('ops:wms-diagnostics:stream')
    const wrapper = mount(WmsDiagnosticsPage)
    const options = ports.stream.mock.calls[0]![0]
    options.onEvent({
      phase: 'completed',
      exchange: {
        attempt_id: 'attempt-a',
        observed_at: '2026-09-08T12:00:00Z',
        direction: 'WES_TO_WMS',
        operation: 'sample@v1',
        operation_id: 'business-a',
        result: 'REJECTED',
        contract_status: 'PASS',
        status_code: 200,
        elapsed_ms: 12,
        error_code: null,
        exchange_id: null
      }
    })
    await vi.advanceTimersByTimeAsync(100)
    expect(wrapper.text()).toContain('REJECTED')
    expect(wrapper.text()).toContain('接口符合合同')
    expect(wrapper.find('.console-row.is-error').exists()).toBe(false)
    await wrapper.get('[data-action="pause"]').trigger('click')
    await wrapper.get('[data-action="clear"]').trigger('click')
    expect(wrapper.findAll('.console-row')).toHaveLength(0)
    expect(ports.list).not.toHaveBeenCalled()
    wrapper.unmount()
  })
})
