import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import RuntimeSceneDeviceFlow from '@/components/runtime/shared/RuntimeSceneDeviceFlow.vue'
import type { RuntimeTraceDevicePathNode } from '@/types/runtime'
import type { RuntimeSceneDeviceNode } from '@/utils/runtime-scene'
import {
  makeDeviceKey,
  makeRackPositionKey,
  type ExplicitLayoutEdge,
  type LayoutNodeInput
} from '@/utils/runtime-topology'

function createDevice(overrides: Partial<RuntimeSceneDeviceNode> = {}): RuntimeSceneDeviceNode {
  return {
    id: 101,
    deviceCode: 'ARM03',
    deviceName: '三号机械臂',
    deviceRole: 'ARM',
    roleIndex: 3,
    status: 'IDLE',
    maintenanceMode: false,
    currentCommandId: null,
    openCommandCount: 0,
    blockedOutboxCount: 0,
    runtimeHoldCount: 0,
    errorCode: null,
    ...overrides
  }
}

function mountFlow(props: InstanceType<typeof RuntimeSceneDeviceFlow>['$props']) {
  return mount(RuntimeSceneDeviceFlow, {
    props,
    global: {
      stubs: {
        RuntimeStatusBadge: {
          props: ['status', 'size'],
          template: '<span data-test="runtime-status-badge">{{ status }}:{{ size }}</span>'
        }
      }
    }
  })
}

describe('RuntimeSceneDeviceFlow', () => {
  it('separates unfinished commands, runtime holds, and parked outboxes', () => {
    const wrapper = mountFlow({
      devices: [
        createDevice({
          openCommandCount: 2,
          blockedOutboxCount: 1,
          runtimeHoldCount: 1
        })
      ]
    })

    expect(wrapper.get('[data-test="topology-device-open-command"]').text()).toBe(
      '2 未完成命令'
    )
    expect(wrapper.get('[data-test="topology-device-runtime-hold"]').text()).toBe(
      'Runtime Hold 1'
    )
    expect(wrapper.get('[data-test="topology-device-parked-outbox"]').text()).toBe(
      '1 已停靠'
    )
    expect(wrapper.text()).toContain('异常待处置')
    expect(wrapper.text()).not.toContain('待处理')
  })

  it('applies selected, traced, dimmed, blocking, and trace action states', () => {
    const tracePathNodes: RuntimeTraceDevicePathNode[] = [
      {
        device_id: 101,
        device_code: 'ARM03',
        device_name: '三号机械臂',
        device_role: 'ARM',
        is_current: false,
        actions: [
          { kind: 'sent', label: '发送' },
          { kind: 'ack', label: '确认' },
          { kind: 'done', label: '完成' },
          { kind: 'extra', label: '补充' }
        ]
      }
    ]
    const wrapper = mountFlow({
      devices: [
        createDevice({ id: 101, status: 'IDLE' }),
        createDevice({ id: 102, status: 'ERROR', deviceCode: 'ARM04' }),
        createDevice({ id: 103, status: 'RUNNING', deviceCode: 'ARM05' })
      ],
      selectedDeviceId: 102,
      tracePathNodes,
      blockingDeviceId: 102
    })

    const nodes = wrapper.findAll('[data-test="runtime-scene-device"]')

    expect(nodes[0]?.classes()).toEqual(
      expect.arrayContaining(['is-traced', 'is-success'])
    )
    expect(nodes[0]?.classes()).not.toContain('is-dimmed')
    expect(nodes[0]?.text()).toContain('发送')
    expect(nodes[0]?.text()).toContain('确认')
    expect(nodes[0]?.text()).toContain('完成')
    expect(nodes[0]?.text()).toContain('+1')

    expect(nodes[1]?.classes()).toEqual(
      expect.arrayContaining(['is-selected', 'is-blocking', 'is-dimmed', 'is-danger'])
    )
    expect(nodes[2]?.classes()).toEqual(expect.arrayContaining(['is-dimmed', 'is-primary']))
  })

  it('emits select, sendEvent, and showContextMenu interactions', async () => {
    const wrapper = mountFlow({
      devices: [createDevice()]
    })
    const node = wrapper.get('[data-test="runtime-scene-device"]')

    await node.trigger('click')
    await node.trigger('dblclick')
    await node.trigger('contextmenu', {
      clientX: 44,
      clientY: 55
    })

    const customEmitted = Object.fromEntries(
      Object.entries(wrapper.emitted()).filter(
        ([event]) => !['click', 'dblclick', 'contextmenu'].includes(event)
      )
    )

    expect(Object.keys(customEmitted).sort()).toEqual([
      'select',
      'sendEvent',
      'showContextMenu'
    ])
    expect(wrapper.emitted('select')).toEqual([[101], [101]])
    expect(wrapper.emitted('sendEvent')).toEqual([[101]])
    expect(wrapper.emitted('showContextMenu')).toEqual([
      [{ deviceId: 101, x: 44, y: 55 }]
    ])
  })

  it('does not turn parked outboxes into unfinished command copy', () => {
    const wrapper = mountFlow({
      devices: [
        createDevice({
          blockedOutboxCount: 2
        })
      ]
    })

    expect(wrapper.text()).toContain('等待设备空闲')
    expect(wrapper.get('[data-test="topology-device-parked-outbox"]').text()).toBe(
      '2 已停靠'
    )
    expect(wrapper.text()).not.toContain('未完成命令')
    expect(wrapper.text()).not.toContain('待处理')
  })

  it('marks the selected device with is-selected and danger devices with is-danger', () => {
    const wrapper = mountFlow({
      devices: [
        createDevice({ id: 201, status: 'IDLE', deviceCode: 'ARM-A' }),
        createDevice({ id: 202, status: 'ERROR', deviceCode: 'ARM-B' })
      ],
      selectedDeviceId: 201
    })

    const nodes = wrapper.findAll('[data-test="runtime-scene-device"]')
    expect(nodes).toHaveLength(2)
    expect(nodes[0]?.classes()).toContain('is-selected')
    expect(nodes[1]?.classes()).not.toContain('is-selected')
    expect(nodes[1]?.classes()).toContain('is-danger')
  })

  it('renders rack-position nodes when explicit topology nodes are provided', () => {
    const device = createDevice({ id: 301, deviceRole: 'ARM' })
    const explicitNodes: LayoutNodeInput[] = [
      { kind: 'device', device },
      { kind: 'rack_position', code: 'P_INLET', label: '上料货位' },
      { kind: 'rack_position', code: 'P_OUTLET' }
    ]

    const wrapper = mountFlow({
      devices: [device],
      explicitNodes,
      explicitEdges: []
    })

    const rackNodes = wrapper.findAll('[data-test="runtime-scene-rack-position"]')
    expect(rackNodes).toHaveLength(2)
    expect(rackNodes[0]?.text()).toContain('上料货位')
    expect(rackNodes[0]?.text()).toContain('P_INLET')
    expect(rackNodes[1]?.text()).toContain('P_OUTLET')
  })

  it('renders one SVG path per explicit edge', () => {
    const inletDevice = createDevice({ id: 401, deviceRole: 'INLET' })
    const armDevice = createDevice({ id: 402, deviceRole: 'ARM', deviceCode: 'ARM-X' })
    const outletDevice = createDevice({ id: 403, deviceRole: 'OUTLET' })

    const explicitNodes: LayoutNodeInput[] = [
      { kind: 'device', device: inletDevice },
      { kind: 'device', device: armDevice },
      { kind: 'device', device: outletDevice },
      { kind: 'rack_position', code: 'P_BUFFER' }
    ]
    const explicitEdges: ExplicitLayoutEdge[] = [
      { fromKey: makeDeviceKey(401), toKey: makeDeviceKey(402), type: 'MATERIAL_FLOW' },
      { fromKey: makeDeviceKey(402), toKey: makeRackPositionKey('P_BUFFER'), type: 'OPERATION' },
      { fromKey: makeRackPositionKey('P_BUFFER'), toKey: makeDeviceKey(403), type: 'MATERIAL_FLOW' }
    ]

    const wrapper = mountFlow({
      devices: [inletDevice, armDevice, outletDevice],
      explicitNodes,
      explicitEdges
    })

    const flowEdges = wrapper.findAll('[data-test="runtime-scene-flow-edge"]')
    expect(flowEdges).toHaveLength(3)
  })

  it('clicking a rack-position node emits selectRackPosition without firing device events', async () => {
    const device = createDevice({ id: 501 })
    const explicitNodes: LayoutNodeInput[] = [
      { kind: 'device', device },
      { kind: 'rack_position', code: 'P_INLET', label: '上料货位' }
    ]

    const wrapper = mountFlow({
      devices: [device],
      explicitNodes,
      explicitEdges: []
    })

    const rackNode = wrapper.get('[data-test="runtime-scene-rack-position"]')
    await rackNode.trigger('click')
    await rackNode.trigger('contextmenu', { clientX: 10, clientY: 20 })

    expect(wrapper.emitted('selectRackPosition')).toEqual([['P_INLET']])
    expect(wrapper.emitted('select')).toBeUndefined()
    expect(wrapper.emitted('sendEvent')).toBeUndefined()
    expect(wrapper.emitted('showContextMenu')).toBeUndefined()
  })
})
