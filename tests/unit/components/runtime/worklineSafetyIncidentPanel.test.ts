import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import WorklineSafetyIncidentPanel from '@/components/common/runtime/WorklineSafetyIncidentPanel.vue'
import type { RuntimeWorklineSummary } from '@/types/runtime'
import { getWorklineRuntimeVerdict } from '@/utils/runtime-safety'

function createSummary(): RuntimeWorklineSummary {
  return {
    id: 1,
    line_code: 'LINE-1',
    line_name: 'Line 1',
    line_type: 'SMT',
    is_active: true,
    device_count: 2,
    active_session_count: 0,
    waiting_session_count: 0,
    failed_session_count: 0,
    error_device_count: 0,
    offline_device_count: 0,
    maintenance_device_count: 0,
    run_mode: 'SIMULATION',
    runtime_status: 'ESTOPPED',
    active_safety_incident_id: 3001,
    stopped_at: '2026-05-06T09:31:00Z',
    stopped_reason: 'ESTOP_PRESSED'
  }
}

describe('WorklineSafetyIncidentPanel', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('shows software safety boundary and incident source', async () => {
    const summary = createSummary()
    const wrapper = mount(WorklineSafetyIncidentPanel, {
      props: {
        summary,
        verdict: getWorklineRuntimeVerdict(summary),
        canClearEstop: true
      },
      global: {
        stubs: {
          RuntimeStatusBadge: true,
          ElButton: {
            props: ['disabled', 'loading', 'title'],
            template:
              '<button :disabled="disabled" :title="title" :data-loading="loading ? true : undefined" @click="$emit(`click`)"><slot /></button>'
          }
        }
      }
    })

    expect(wrapper.text()).toContain('软件急停冻结')
    expect(wrapper.text()).toContain('仅表示 WES 软件侧已阻断新流程接收')
    expect(wrapper.text()).toContain('Incident #3001')
    const clearButton = wrapper.findAll('button').find(button => button.text().includes('恢复接收'))
    if (!clearButton) throw new Error('missing clear-estop button')
    expect(clearButton.attributes('disabled')).toBeUndefined()
    expect(clearButton.text()).toContain('解除软件冻结 / 恢复接收')

    await clearButton.trigger('click')

    expect(wrapper.emitted('clearEstop')?.length).toBeGreaterThan(0)
  })

  it('shows device safety evidence source when summary safety fields have not synced', () => {
    const summary = {
      ...createSummary(),
      runtime_status: null,
      active_safety_incident_id: null,
      stopped_at: null,
      stopped_reason: null
    }
    const wrapper = mount(WorklineSafetyIncidentPanel, {
      props: {
        summary,
        verdict: getWorklineRuntimeVerdict(summary, null, {
          state: 'ready',
          locked: true,
          blockedReason: '已有 1 台设备回推 WORKLINE_ESTOPPED，等待后端 safety incident 状态同步。'
        })
      },
      global: {
        stubs: {
          RuntimeStatusBadge: true,
          ElButton: {
            props: ['disabled'],
            template: '<button :disabled="disabled"><slot /></button>'
          }
        }
      }
    })

    expect(wrapper.text()).toContain('设备安全错误回推')
    expect(wrapper.text()).toContain('等待 safety incident 证据')
  })
})
