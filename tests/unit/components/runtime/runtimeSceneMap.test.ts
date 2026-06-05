import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import RuntimeSceneMap from '@/components/runtime/monitor/RuntimeSceneMap.vue'
import type { RuntimeSceneModel } from '@/types/runtime'

function createModel(): RuntimeSceneModel {
  return {
    workline: {
      id: 45,
      line_code: 'WL-45',
      line_name: '粗分线',
      line_type: 'SORTING',
      is_active: true,
      device_count: 1,
      active_session_count: 1,
      waiting_session_count: 0,
      failed_session_count: 0,
      error_device_count: 0,
      offline_device_count: 0,
      maintenance_device_count: 0,
      run_mode: 'AUTO'
    },
    verdict: {
      label: 'READY',
      manifestLoaded: false,
      manifestWarning: '插件语义未加载，按设备角色原样展示'
    },
    lanes: [
      {
        id: 'role:scanner',
        label: '扫描段',
        role: 'scanner',
        order: 1,
        kind: 'manifest'
      }
    ],
    nodes: [
      {
        id: 'device:101',
        deviceId: 101,
        laneId: 'role:scanner',
        role: 'scanner',
        roleIndex: 1,
        deviceCode: 'DV-101',
        deviceName: '扫描设备',
        status: 'ONLINE',
        state: 'waiting',
        isSelected: true,
        isCurrent: false,
        maintenanceMode: false,
        badges: [
          {
            kind: 'active-session',
            label: '1 活跃 Session',
            tone: 'info',
            count: 1
          }
        ]
      }
    ],
    flows: [
      {
        id: 'flow:101:102',
        fromNodeId: 'device:101',
        toNodeId: 'device:102',
        source: 'fallback-order'
      }
    ],
    overlays: [
      {
        id: 'blocking-device:101',
        kind: 'blocking-device',
        deviceId: 101,
        label: '阻塞点',
        tone: 'danger'
      }
    ],
    gaps: [
      {
        id: 'gap:arm',
        role: 'arm',
        label: '机械臂段',
        requiredCount: 1,
        actualCount: 0
      }
    ]
  }
}

describe('RuntimeSceneMap', () => {
  it('renders scene warnings, config gaps, nodes, and badges', async () => {
    const wrapper = mount(RuntimeSceneMap, {
      props: {
        model: createModel()
      },
      global: {
        stubs: {
          RuntimeStatusBadge: true
        }
      }
    })

    expect(wrapper.text()).toContain('插件语义未加载')
    expect(wrapper.text()).toContain('缺少 机械臂段 0/1')
    expect(wrapper.text()).toContain('扫描设备')
    expect(wrapper.text()).toContain('DV-101')
    expect(wrapper.text()).toContain('1 活跃 Session')
    expect(wrapper.text()).toContain('阻塞点')
    expect(wrapper.text()).toContain('DV-101 → #102')

    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('select')).toEqual([[101]])
  })

  it('renders manifest gap lanes even when there are no devices', () => {
    const model = createModel()
    model.nodes = []
    model.flows = []

    const wrapper = mount(RuntimeSceneMap, {
      props: { model },
      global: {
        stubs: {
          RuntimeStatusBadge: true
        }
      }
    })

    expect(wrapper.find('.runtime-scene-map__canvas').exists()).toBe(true)
    expect(wrapper.text()).toContain('扫描段')
    expect(wrapper.text()).toContain('0 设备')
    expect(wrapper.text()).not.toContain('暂无设备现场数据')
  })
})
