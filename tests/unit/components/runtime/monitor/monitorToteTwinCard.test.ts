import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import MonitorToteTwinCard from '@/components/runtime/monitor/MonitorToteTwinCard.vue'
import type { RuntimeSceneToteTwinView } from '@/utils/runtime-scene'

function buildView(
  overrides: Partial<RuntimeSceneToteTwinView> = {}
): RuntimeSceneToteTwinView {
  return {
    lpn: 'LPN-001',
    typeLabel: 'PICK_BIN',
    tone: 'info',
    rows: [
      { label: '会话状态', value: 'ACTIVE', emphasis: 'info' },
      { label: '等待类型', value: 'WAIT_RACK' }
    ],
    ...overrides
  }
}

describe('MonitorToteTwinCard', () => {
  it('renders nothing when view is null', () => {
    const wrapper = mount(MonitorToteTwinCard, { props: { view: null } })

    expect(wrapper.find('[data-test="monitor-tote-twin-card"]').exists()).toBe(false)
  })

  it('renders LPN, type label, and rows when a view is provided', () => {
    const wrapper = mount(MonitorToteTwinCard, { props: { view: buildView() } })

    const card = wrapper.get('[data-test="monitor-tote-twin-card"]')
    expect(card.classes()).toContain('monitor-tote-twin-card--info')
    expect(wrapper.get('[data-test="monitor-tote-twin-card-lpn"]').text()).toBe('LPN-001')
    expect(wrapper.get('[data-test="monitor-tote-twin-card-type"]').text()).toBe(
      'PICK_BIN'
    )

    const rowsRoot = wrapper.get('[data-test="monitor-tote-twin-card-rows"]')
    const rows = rowsRoot.findAll('.monitor-tote-twin-card__row')
    expect(rows).toHaveLength(2)
    expect(rows[0]?.text()).toContain('会话状态')
    expect(rows[0]?.text()).toContain('ACTIVE')
    expect(rows[0]?.classes()).toContain('monitor-tote-twin-card__row--info')
  })

  it('applies warning tone modifier when view tone is warning', () => {
    const wrapper = mount(MonitorToteTwinCard, {
      props: {
        view: buildView({
          tone: 'warning',
          rows: [{ label: '失败编码', value: 'ERR_X', emphasis: 'danger' }]
        })
      }
    })

    expect(wrapper.get('[data-test="monitor-tote-twin-card"]').classes()).toContain(
      'monitor-tote-twin-card--warning'
    )
    expect(
      wrapper.get('[data-test="monitor-tote-twin-card-rows"] .monitor-tote-twin-card__row')
        .classes()
    ).toContain('monitor-tote-twin-card__row--danger')
  })
})
