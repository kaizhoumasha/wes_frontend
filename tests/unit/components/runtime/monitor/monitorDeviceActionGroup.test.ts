import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import MonitorDeviceActionGroup from '@/components/runtime/monitor/MonitorDeviceActionGroup.vue'

describe('MonitorDeviceActionGroup', () => {
  it('shows the empty placeholder when no real action is available', () => {
    const wrapper = mount(MonitorDeviceActionGroup, {
      props: { mode: 'idle', canManageMaintenance: false }
    })

    expect(wrapper.get('[data-test="monitor-device-action-empty"]').text()).toContain(
      '暂无可用直控动作'
    )
    expect(wrapper.find('[data-test="monitor-device-action-clear-estop"]').exists()).toBe(
      false
    )
    expect(
      wrapper.find('[data-test="monitor-device-action-resolve-reconciliation"]').exists()
    ).toBe(false)
  })

  it('emits clear-estop only when permissions allow', async () => {
    const wrapper = mount(MonitorDeviceActionGroup, {
      props: {
        mode: 'estop',
        canClearEstop: true,
        canAttemptClear: true
      }
    })

    const button = wrapper.get('[data-test="monitor-device-action-clear-estop"]')
    expect(button.attributes('disabled')).toBeUndefined()
    await button.trigger('click')
    expect(wrapper.emitted('clear-estop')).toEqual([[]])
  })

  it('disables the clear-estop button when permission is missing', () => {
    const wrapper = mount(MonitorDeviceActionGroup, {
      props: {
        mode: 'estop',
        canClearEstop: false,
        canAttemptClear: true,
        blockedReason: '权限不足'
      }
    })

    const button = wrapper.get('[data-test="monitor-device-action-clear-estop"]')
    expect(button.attributes('disabled')).toBeDefined()
    expect(
      wrapper.get('[data-test="monitor-device-action-blocked-reason"]').text()
    ).toContain('权限不足')
  })

  it('shows resolve-reconciliation in reconciliation mode and emits on click', async () => {
    const wrapper = mount(MonitorDeviceActionGroup, {
      props: { mode: 'reconciliation', canResolve: true }
    })

    const button = wrapper.get(
      '[data-test="monitor-device-action-resolve-reconciliation"]'
    )
    await button.trigger('click')
    expect(wrapper.emitted('resolve-reconciliation')).toEqual([[]])
  })

  it('toggles maintenance label between enter and exit based on maintenanceActive', async () => {
    const wrapper = mount(MonitorDeviceActionGroup, {
      props: {
        mode: 'idle',
        canManageMaintenance: true,
        maintenanceActive: false
      }
    })

    expect(
      wrapper.get('[data-test="monitor-device-action-enter-maintenance"]').text()
    ).toContain('进入维护')

    await wrapper.setProps({ maintenanceActive: true })

    expect(
      wrapper.get('[data-test="monitor-device-action-exit-maintenance"]').text()
    ).toContain('退出维护')
    expect(
      wrapper.find('[data-test="monitor-device-action-enter-maintenance"]').exists()
    ).toBe(false)
  })

  it('does NOT render bypass / unlock affordances (no-fake-button rule)', () => {
    const wrapper = mount(MonitorDeviceActionGroup, {
      props: {
        mode: 'estop',
        canClearEstop: true,
        canAttemptClear: true,
        canManageMaintenance: true
      }
    })

    const text = wrapper.text()
    expect(text).not.toMatch(/旁路/)
    expect(text).not.toMatch(/释放库位锁/)
    expect(text).not.toMatch(/bypass/i)
    expect(text).not.toMatch(/unlock/i)
  })
})
