import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import MonitorRackOccupancyMatrix from '@/components/runtime/monitor/MonitorRackOccupancyMatrix.vue'
import type { RuntimeSceneRackOccupancyView } from '@/utils/runtime-scene'

function buildView(
  overrides: Partial<RuntimeSceneRackOccupancyView> = {}
): RuntimeSceneRackOccupancyView {
  return {
    columns: 4,
    slots: [
      { key: 'slot-A', code: 'A1', state: 'empty', tote: null, alarm: null },
      { key: 'slot-B', code: 'A2', state: 'occupied', tote: 'BIN-002', alarm: null },
      { key: 'slot-C', code: 'A3', state: 'reconciling', tote: null, alarm: 'WAIT' }
    ],
    ...overrides
  }
}

describe('MonitorRackOccupancyMatrix', () => {
  it('renders nothing when view is null', () => {
    const wrapper = mount(MonitorRackOccupancyMatrix, { props: { view: null } })
    expect(wrapper.find('[data-test="monitor-rack-occupancy-matrix"]').exists()).toBe(
      false
    )
  })

  it('renders one slot per view entry with the correct state class', () => {
    const wrapper = mount(MonitorRackOccupancyMatrix, { props: { view: buildView() } })

    const slots = wrapper.findAll('[data-test="monitor-rack-occupancy-matrix-slot"]')
    expect(slots).toHaveLength(3)
    expect(slots[0]?.classes()).toContain('monitor-rack-occupancy-matrix__slot--empty')
    expect(slots[1]?.classes()).toContain('monitor-rack-occupancy-matrix__slot--occupied')
    expect(slots[2]?.classes()).toContain(
      'monitor-rack-occupancy-matrix__slot--reconciling'
    )
  })

  it('honors the columns count via inline grid-template-columns', () => {
    const wrapper = mount(MonitorRackOccupancyMatrix, {
      props: { view: buildView({ columns: 6 }) }
    })

    const grid = wrapper.get('.monitor-rack-occupancy-matrix__grid')
    expect(grid.attributes('style')).toContain('grid-template-columns: repeat(6, minmax(0, 1fr))')
  })

  it('emits select with the slot key when a slot is clicked', async () => {
    const wrapper = mount(MonitorRackOccupancyMatrix, { props: { view: buildView() } })

    const occupied = wrapper
      .findAll('[data-test="monitor-rack-occupancy-matrix-slot"]')
      .find(item => item.attributes('data-state') === 'occupied')

    expect(occupied).toBeTruthy()
    await occupied!.trigger('click')

    expect(wrapper.emitted('select')).toEqual([['slot-B']])
  })
})
