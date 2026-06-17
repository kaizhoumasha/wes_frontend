import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import MonitorRackOccupancyMatrix from '@/components/runtime/monitor/MonitorRackOccupancyMatrix.vue'
import type { RuntimeSceneRackHierarchyView } from '@/utils/runtime-scene'

function buildView(
  overrides: Partial<RuntimeSceneRackHierarchyView> = {}
): RuntimeSceneRackHierarchyView {
  return {
    rackCode: 'RACK-001',
    totalCellCount: 3,
    slotGroups: [
      {
        key: 'RACK-001:A',
        code: 'A',
        binCode: 'BIN-001',
        binDisplayLabel: 'BIN BIN-001',
        cells: [
          { key: 'RACK-001:BIN-001-1', code: 'BIN-001-1', state: 'empty', tote: null, alarm: null }
        ]
      },
      {
        key: 'RACK-001:B',
        code: 'B',
        binCode: 'BIN-002',
        binDisplayLabel: 'BIN BIN-002',
        cells: [
          { key: 'RACK-001:BIN-002-1', code: 'BIN-002-1', state: 'occupied', tote: 'PKG-X', alarm: null }
        ]
      },
      {
        key: 'RACK-001:C',
        code: 'C',
        binCode: 'BIN-003',
        binDisplayLabel: 'BIN BIN-003',
        cells: [
          { key: 'RACK-001:BIN-003-1', code: 'BIN-003-1', state: 'reconciling', tote: null, alarm: 'WAIT' }
        ]
      }
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

  it('renders one cell per slot group entry with the correct state class', () => {
    const wrapper = mount(MonitorRackOccupancyMatrix, { props: { view: buildView() } })

    const groups = wrapper.findAll('[data-test="monitor-rack-occupancy-matrix-slot-group"]')
    expect(groups).toHaveLength(3)
    expect(groups[0]?.attributes('data-slot-code')).toBe('A')
    expect(groups[1]?.attributes('data-slot-code')).toBe('B')
    expect(groups[2]?.attributes('data-slot-code')).toBe('C')

    const cells = wrapper.findAll('[data-test="monitor-rack-occupancy-matrix-slot"]')
    expect(cells).toHaveLength(3)
    expect(cells[0]?.classes()).toContain('monitor-rack-occupancy-matrix__cell--empty')
    expect(cells[1]?.classes()).toContain('monitor-rack-occupancy-matrix__cell--occupied')
    expect(cells[2]?.classes()).toContain(
      'monitor-rack-occupancy-matrix__cell--reconciling'
    )
  })

  it('lays out cells in a grid sized to the cell count per slot group', () => {
    const wrapper = mount(MonitorRackOccupancyMatrix, { props: { view: buildView() } })
    const grids = wrapper.findAll('.monitor-rack-occupancy-matrix__cell-grid')
    expect(grids).toHaveLength(3)
    for (const grid of grids) {
      expect(grid.attributes('style')).toContain(
        'grid-template-columns: repeat(1, minmax(0, 1fr))'
      )
    }
  })

  it('emits select with the cell key when a cell is clicked', async () => {
    const wrapper = mount(MonitorRackOccupancyMatrix, { props: { view: buildView() } })

    const occupied = wrapper
      .findAll('[data-test="monitor-rack-occupancy-matrix-slot"]')
      .find(item => item.attributes('data-state') === 'occupied')

    expect(occupied).toBeTruthy()
    await occupied!.trigger('click')

    expect(wrapper.emitted('select')).toEqual([['RACK-001:BIN-002-1']])
  })

  it('marks the cell whose key matches selectedSlotKey with the selected class', () => {
    const wrapper = mount(MonitorRackOccupancyMatrix, {
      props: { view: buildView(), selectedSlotKey: 'RACK-001:BIN-002-1' }
    })

    const cells = wrapper.findAll('[data-test="monitor-rack-occupancy-matrix-slot"]')
    const selected = cells.find(
      item => item.attributes('data-slot-key') === 'RACK-001:BIN-002-1'
    )
    expect(selected).toBeTruthy()
    expect(selected!.classes()).toContain('monitor-rack-occupancy-matrix__cell--selected')
    expect(selected!.attributes('data-selected')).toBe('true')

    const notSelected = cells.find(
      item => item.attributes('data-slot-key') === 'RACK-001:BIN-001-1'
    )
    expect(notSelected!.classes()).not.toContain('monitor-rack-occupancy-matrix__cell--selected')
    expect(notSelected!.attributes('data-selected')).toBeUndefined()
  })
})
