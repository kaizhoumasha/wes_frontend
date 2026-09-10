import { shallowMount, flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { OPS_PERMISSIONS } from '@/api/generated/permissions'
import TransportDebugRunPage from '@/views/ops/transport-debug/TransportDebugRunPage.vue'
import TransportDebugRunPanel from '@/views/ops/transport-debug/TransportDebugRunPanel.vue'

const mocks = vi.hoisted(() => ({
  granted: new Set<string>(),
  selectTask: vi.fn(),
  loadCallbackReceipt: vi.fn()
}))
vi.mock('@/composables/usePermission', () => ({
  usePermission: () => ({ hasPermission: (permission: string) => mocks.granted.has(permission) })
}))
vi.mock('@/views/ops/transport-diagnostics/useTransportDiagnostics', () => ({
  useTransportDiagnostics: () => ({
    selectTask: mocks.selectTask,
    lastError: { value: null },
    selectedTaskId: { value: null },
    detail: { value: null },
    loadingDetail: { value: false },
    callbackReceipt: { value: null },
    callbackReceiptUnknown: { value: false },
    callbackReceiptError: { value: '' },
    loadingCallbackReceipt: { value: false },
    loadCallbackReceipt: mocks.loadCallbackReceipt
  })
}))

beforeEach(() => {
  vi.clearAllMocks()
  mocks.granted.clear()
  Object.values(OPS_PERMISSIONS.transportDebugRun).forEach(permission =>
    mocks.granted.add(permission)
  )
  mocks.granted.add(OPS_PERMISSIONS.transportTask.read)
  mocks.granted.add(OPS_PERMISSIONS.transportCallbackReceipt.read)
})

describe('TransportDebugRunPage', () => {
  it('owns its entry, permissions and task drilldown independently of diagnostics', async () => {
    const wrapper = shallowMount(TransportDebugRunPage)
    const panel = wrapper.getComponent(TransportDebugRunPanel)
    expect(wrapper.get('h1').text()).toBe('自动联调')
    expect(panel.props()).toMatchObject({
      canStart: true,
      canRead: true,
      canAbort: true,
      canStream: true,
      canReadTask: true
    })
    panel.vm.$emit('selectTask', 'transport-2')
    await flushPromises()
    expect(mocks.selectTask).toHaveBeenCalledWith('transport-2')
    expect(wrapper.findComponent(TransportDebugRunPanel).exists()).toBe(true)
  })

  it('does not mount or query runs without list permission', () => {
    mocks.granted.delete(OPS_PERMISSIONS.transportDebugRun.list)
    expect(shallowMount(TransportDebugRunPage).findComponent(TransportDebugRunPanel).exists()).toBe(
      false
    )
  })

  it('preserves read-only access and separately gates physical actions and task details', async () => {
    mocks.granted.clear()
    mocks.granted.add(OPS_PERMISSIONS.transportDebugRun.list)
    const wrapper = shallowMount(TransportDebugRunPage)
    const panel = wrapper.getComponent(TransportDebugRunPanel)
    expect(panel.props()).toMatchObject({
      canStart: false,
      canRead: false,
      canAbort: false,
      canStream: false,
      canReadTask: false
    })
    panel.vm.$emit('selectTask', 'transport-2')
    await flushPromises()
    expect(mocks.selectTask).not.toHaveBeenCalled()
  })

  it('keeps the run mounted if a historical task cannot be queried', async () => {
    mocks.selectTask.mockRejectedValueOnce(new Error('TransportTask not found'))
    const wrapper = shallowMount(TransportDebugRunPage)
    wrapper.getComponent(TransportDebugRunPanel).vm.$emit('selectTask', 'deleted')
    await flushPromises()
    expect(mocks.selectTask).toHaveBeenCalledWith('deleted')
    expect(wrapper.findComponent(TransportDebugRunPanel).exists()).toBe(true)
  })
})
