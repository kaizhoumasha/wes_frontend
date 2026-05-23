import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import WorklineRouteMap from '@/components/runtime/monitor/WorklineRouteMap.vue'
import type { RuntimeWorklineDeviceItem } from '@/types/runtime'

function createDevice(
  overrides: Partial<RuntimeWorklineDeviceItem> = {}
): RuntimeWorklineDeviceItem {
  return {
    id: 101,
    device_code: 'ARM03',
    device_name: '三号机械臂',
    device_role: 'ARM',
    role_index: 3,
    device_status: 'IDLE',
    maintenance_mode: false,
    pending_command_count: 0,
    ...overrides
  }
}

describe('WorklineRouteMap', () => {
  it('separates unfinished commands, runtime holds, and parked outboxes', () => {
    const wrapper = mount(WorklineRouteMap, {
      props: {
        devices: [
          createDevice({
            open_command_count: 2,
            blocked_outbox_count: 1,
            open_issue_count: 1,
            active_runtime_hold_ids: [77]
          })
        ]
      },
      global: {
        stubs: {
          RuntimeStatusBadge: true
        }
      }
    })

    expect(wrapper.text()).toContain('2 未完成命令')
    expect(wrapper.text()).toContain('Runtime Hold 1')
    expect(wrapper.text()).toContain('1 已停靠')
    expect(wrapper.text()).not.toContain('待处理')
  })

  it('does not count parked outboxes as unfinished commands', () => {
    const wrapper = mount(WorklineRouteMap, {
      props: {
        devices: [
          createDevice({
            open_command_count: 0,
            blocked_outbox_count: 1
          })
        ]
      },
      global: {
        stubs: {
          RuntimeStatusBadge: true
        }
      }
    })

    expect(wrapper.text()).toContain('1 已停靠')
    expect(wrapper.text()).not.toContain('未完成命令')
  })
})
