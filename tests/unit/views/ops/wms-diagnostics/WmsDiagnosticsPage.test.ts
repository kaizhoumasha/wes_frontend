import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthenticatedSseHttpError } from '@/api/streaming/authenticatedSseStream'
import WmsDiagnosticsPage from '@/views/ops/wms-diagnostics/WmsDiagnosticsPage.vue'

const ports = vi.hoisted(() => ({
  permissions: new Set<string>(),
  list: vi.fn(),
  stream: vi.fn(),
  confirmation: vi.fn(),
  evidence: vi.fn()
}))
vi.mock('@/composables/usePermission', () => ({
  usePermission: () => ({ hasPermission: (code: string) => ports.permissions.has(code) })
}))
vi.mock('@/api/modules/wmsDiagnostics', () => ({
  wmsDiagnosticsApiMethods: {
    exchanges: (query: unknown) => ({ send: () => ports.list(query) }),
    confirmations: (query: unknown) => ({ send: () => ports.confirmation(query) }),
    evidences: (query: unknown) => ({ send: () => ports.evidence(query) }),
    getByExchangeId: vi.fn()
  }
}))
vi.mock('@/api/streaming/wmsDiagnosticsStream', () => ({
  consumeWmsDiagnosticsStream: (...args: unknown[]) => ports.stream(...args)
}))

beforeEach(() => {
  ports.permissions.clear()
  ports.list.mockReset().mockResolvedValue({
    items: [],
    next_cursor: null,
    scan_incomplete: false,
    retention_hours: 24
  })
  ports.stream.mockReset().mockImplementation(() => new Promise(() => {}))
  ports.confirmation.mockReset()
  ports.evidence.mockReset()
})
afterEach(() => vi.useRealTimers())

describe('WMS 联调页面权限与现场含义', () => {
  it('以各自权限独立查询并并列展示可靠发送与接收事实', async () => {
    ports.permissions.add('ops:wms-confirmation:read')
    ports.permissions.add('ops:wms-evidence:read')
    ports.confirmation.mockResolvedValue({
      operation: 'transport.task.resulted@v1',
      operation_id: 'op-1',
      status: 'COMPLETED',
      attempt_count: 1,
      deadline_at: '2026-09-09T12:00:00Z',
      last_dispatch_at: '2026-09-09T11:00:00Z',
      next_attempt_at: null,
      response_evidence_id: 9,
      response_result: 'RECEIVED',
      retry_eligible: false,
      updated_at: '2026-09-09T11:00:01Z'
    })
    ports.evidence.mockResolvedValue({
      operation: 'transport.task.resulted@v1',
      operation_id: 'op-1',
      apply_status: 'PENDING',
      decision_attempt_count: 0,
      decision_next_attempt_at: null,
      processed_at: null,
      published_at: null,
      received_at: '2026-09-09T11:00:01Z'
    })
    const wrapper = mount(WmsDiagnosticsPage)
    await wrapper.get('[aria-label="operation"]').setValue('transport.task.resulted@v1')
    await wrapper.get('[aria-label="operation_id"]').setValue('op-1')
    await wrapper.get('[data-action="query-reliable"]').trigger('submit')
    await flushPromises()

    expect(ports.confirmation).toHaveBeenCalledWith({
      operation: 'transport.task.resulted@v1',
      operation_id: 'op-1'
    })
    expect(ports.evidence).toHaveBeenCalledWith({
      operation: 'transport.task.resulted@v1',
      operation_id: 'op-1'
    })
    expect(wrapper.text()).toContain('可靠发送义务')
    expect(wrapper.text()).toContain('COMPLETED')
    expect(wrapper.text()).toContain('持久化接收与应用事实')
    expect(wrapper.text()).toContain('PENDING')
    expect(wrapper.text()).toContain('HTTP 202 与应用 PENDING 可以同时成立')
    expect(wrapper.text()).not.toContain('PickingTask 已完成')
    wrapper.unmount()
  })

  it('缺少某项读取权限时不请求对应可靠事实', async () => {
    ports.permissions.add('ops:wms-confirmation:read')
    ports.confirmation.mockResolvedValue({
      operation: 'prepare@v1',
      operation_id: 'op-2',
      status: 'PENDING'
    })
    const wrapper = mount(WmsDiagnosticsPage)
    await wrapper.get('[aria-label="operation"]').setValue('prepare@v1')
    await wrapper.get('[aria-label="operation_id"]').setValue('op-2')
    await wrapper.get('[data-action="query-reliable"]').trigger('submit')
    await flushPromises()
    expect(ports.confirmation).toHaveBeenCalledTimes(1)
    expect(ports.evidence).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('无接收事实读取权限')
    wrapper.unmount()
  })

  it.each([
    ['3000', '未找到对应可靠记录'],
    ['5030', '当前无法确认可靠记录状态']
  ])('查询错误 code %s 保留不确定性', async (code, message) => {
    ports.permissions.add('ops:wms-confirmation:read')
    ports.confirmation.mockRejectedValue(Object.assign(new Error(`code ${code}`), { code }))
    const wrapper = mount(WmsDiagnosticsPage)
    await wrapper.get('[aria-label="operation"]').setValue('prepare@v1')
    await wrapper.get('[aria-label="operation_id"]').setValue('op-3')
    await wrapper.get('[data-action="query-reliable"]').trigger('submit')
    await flushPromises()
    expect(wrapper.text()).toContain(message)
    expect(wrapper.text()).not.toContain('从未接收')
    wrapper.unmount()
  })
  it.each([401, 403])('HTTP %s 停止重试时不承诺自动恢复', async status => {
    ports.permissions.add('ops:wms-diagnostics:stream')
    ports.stream.mockRejectedValue(new AuthenticatedSseHttpError(status))
    const wrapper = mount(WmsDiagnosticsPage)
    await flushPromises()
    expect(wrapper.text()).toContain('已断开')
    expect(wrapper.text()).toContain('连接已停止')
    expect(wrapper.text()).not.toContain('正在按连接策略重试')
    wrapper.unmount()
  })
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
