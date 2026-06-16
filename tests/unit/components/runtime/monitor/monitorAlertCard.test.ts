import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import MonitorAlertCard from '@/components/runtime/monitor/MonitorAlertCard.vue'

describe('MonitorAlertCard', () => {
  it('renders danger tone with title, message, and source', () => {
    const wrapper = mount(MonitorAlertCard, {
      props: {
        tone: 'danger',
        title: 'ERR_CONVEYOR_JAM_102',
        message: '传送带 #2 检测到卡阻信号，等待现场清障。',
        source: 'ECS Event_Push @ 15:40:04'
      }
    })

    const card = wrapper.get('[data-test="monitor-alert-card"]')
    expect(card.attributes('data-tone')).toBe('danger')
    expect(card.classes()).toContain('monitor-alert-card--danger')
    expect(wrapper.get('[data-test="monitor-alert-card-title"]').text()).toBe(
      'ERR_CONVEYOR_JAM_102'
    )
    expect(wrapper.get('[data-test="monitor-alert-card-message"]').text()).toContain(
      '传送带'
    )
    expect(wrapper.get('[data-test="monitor-alert-card-source"]').text()).toBe(
      'ECS Event_Push @ 15:40:04'
    )
  })

  it('applies the warning tone modifier when tone="warning"', () => {
    const wrapper = mount(MonitorAlertCard, {
      props: {
        tone: 'warning',
        title: 'RECONCILE_FAILED',
        message: '运行态对账失败，需要人工确认。'
      }
    })

    const card = wrapper.get('[data-test="monitor-alert-card"]')
    expect(card.classes()).toContain('monitor-alert-card--warning')
    expect(card.classes()).not.toContain('monitor-alert-card--danger')
    expect(wrapper.find('[data-test="monitor-alert-card-source"]').exists()).toBe(false)
  })
})
