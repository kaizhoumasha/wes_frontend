import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import TraceTimeline from '@/components/runtime/trace/TraceTimeline.vue'
import type { TraceTimelineItem } from '@/types/runtime'

const baseItem: TraceTimelineItem = {
  id: 1,
  session_id: 1,
  workline_id: 1,
  trace_id: 'trace-1',
  seq_no: 1,
  occurred_at: '2026-06-04T10:00:00Z',
  stage: 'DECISION',
  action_type: 'DECISION_MADE',
  actor_type: 'PLUGIN',
  actor_code: null,
  from_status: 'NEW',
  to_status: 'RUNNING',
  status: 'RUNNING',
  failure_domain: null,
  message: null,
  payload_json: null,
  related_inbox_id: null,
  related_command_id: null
}

function mountTimeline(items: TraceTimelineItem[]) {
  return mount(TraceTimeline, {
    props: {
      items
    },
    global: {
      stubs: {
        RuntimeStatusBadge: {
          props: ['label'],
          template: '<span class="runtime-status-badge">{{ label }}</span>'
        }
      }
    }
  })
}

describe('TraceTimeline', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('shows an explicit empty state when no timeline events exist', () => {
    const wrapper = mountTimeline([])

    const text = wrapper.text()
    expect(text).toContain('暂无过程记录')
    expect(text).toContain('当前案件没有过程事件记录')
    expect(wrapper.find('.trace-timeline__item').exists()).toBe(false)
  })

  it('presents timeline items as business process steps for ordinary users', () => {
    const wrapper = mountTimeline([
      baseItem,
      {
        ...baseItem,
        id: 2,
        seq_no: 2,
        stage: 'DISPATCH_PREPARE',
        action_type: 'COMMAND_SENT',
        actor_code: 'RS-INPUT-ARM-01',
        from_status: 'RUNNING',
        to_status: 'WAITING_DEVICE_RESULT',
        status: 'WAITING_DEVICE_RESULT',
        related_command_id: 1001,
        payload_json: { command: 'rough_sort' }
      }
    ])

    const titles = wrapper.findAll('.trace-timeline__title').map(node => node.text())
    const descriptions = wrapper
      .findAll('.trace-timeline__description')
      .map(node => node.text())

    expect(titles).toEqual(['系统完成决策', '下发设备动作'])
    expect(descriptions[0]).toContain('系统已根据当前案件上下文选择下一步动作')
    expect(descriptions[1]).toContain('已发送给 RS-INPUT-ARM-01')
    const groupLabels = wrapper.findAll('.trace-timeline__group-device').map(node => node.text())
    expect(groupLabels).toEqual(['系统处理', '设备 RS-INPUT-ARM-01'])
  })

  it('keeps raw enum fields available only in technical details', () => {
    const wrapper = mountTimeline([
      {
        ...baseItem,
        action_type: 'COMMAND_SENT',
        stage: 'DISPATCH_PREPARE',
        actor_code: 'RS-INPUT-ARM-01',
        payload_json: { command: 'rough_sort' }
      }
    ])

    expect(wrapper.find('.trace-timeline__title').text()).toBe('下发设备动作')
    expect(wrapper.find('.trace-timeline__description').text()).not.toContain('COMMAND_SENT')
    expect(wrapper.find('.trace-timeline__tech').text()).toContain('技术细节')
    expect(wrapper.find('.trace-timeline__tech').text()).toContain('COMMAND_SENT')
    expect(wrapper.find('.trace-timeline__tech').text()).toContain('DISPATCH_PREPARE')
  })
})
