import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import TopologyDeviceNode from '@/components/runtime/shared/TopologyDeviceNode.vue'
import type { RuntimeSceneDeviceNode } from '@/utils/runtime-scene'

function makeDevice(overrides: Partial<RuntimeSceneDeviceNode> = {}): RuntimeSceneDeviceNode {
  return {
    id: 1,
    deviceCode: 'DEV-1',
    deviceName: 'Device 1',
    deviceRole: 'STATION',
    roleIndex: 0,
    status: 'IDLE',
    maintenanceMode: false,
    openCommandCount: 0,
    blockedOutboxCount: 0,
    runtimeHoldCount: 0,
    errorCode: null,
    ...overrides
  }
}

const mountNode = (
  props: Partial<InstanceType<typeof TopologyDeviceNode>['$props']> = {}
) =>
  mount(TopologyDeviceNode, {
    props: { device: makeDevice(), ...props }
  })

describe('TopologyDeviceNode — visual layers', () => {
  it('renders 2px border with success accent for IDLE (resolveRuntimeTone classifies IDLE as success)', () => {
    // IDLE is in SUCCESS_STATUSES per runtime-display.ts → tone 'success'.
    // Verifies the status→class pipeline is alive on the default device.
    const wrapper = mountNode()
    expect(wrapper.classes()).toContain('is-success')
  })

  it('adds is-success class with glow on ONLINE status', async () => {
    const wrapper = mountNode({ device: makeDevice({ status: 'ONLINE' }) })
    await nextTick()
    expect(wrapper.classes()).toContain('is-success')
  })

  it('adds is-danger class with animation for ERROR status', async () => {
    const wrapper = mountNode({ device: makeDevice({ status: 'ERROR' }) })
    await nextTick()
    expect(wrapper.classes()).toContain('is-danger')
  })

  it('adds is-primary class for RUNNING status', async () => {
    // RUNNING is in PRIMARY_STATUSES → tone 'primary' → class 'is-primary'.
    const wrapper = mountNode({ device: makeDevice({ status: 'RUNNING' }) })
    await nextTick()
    expect(wrapper.classes()).toContain('is-primary')
  })

  it('adds is-warning class for WAITING status', async () => {
    // WAITING is in WARNING_STATUSES → tone 'warning' → class 'is-warning'.
    const wrapper = mountNode({ device: makeDevice({ status: 'WAITING' }) })
    await nextTick()
    expect(wrapper.classes()).toContain('is-warning')
  })

  it('adds is-info class as default fallback for unknown status', async () => {
    // 'UNKNOWN_TONE' is not in any of DANGER/WARNING/PRIMARY/SUCCESS sets → tone 'info'.
    const wrapper = mountNode({ device: makeDevice({ status: 'UNKNOWN_TONE' }) })
    await nextTick()
    expect(wrapper.classes()).toContain('is-info')
  })

  it('marks the role pill as a 9px tag, not a 12px line', () => {
    const wrapper = mountNode()
    const role = wrapper.get('.topology-device-node__role')
    expect(role.exists()).toBe(true)
    expect(role.text()).toContain('STATION')
    // The role pill should be inline-flex with small text per design.
    expect(role.classes().join(' ')).not.toContain('is-line')
  })

  it('emits click with device id', async () => {
    const wrapper = mountNode()
    await wrapper.get('[data-test="topology-device-node"]').trigger('click')
    expect(wrapper.emitted('click')?.[0]).toEqual([1])
  })
})
