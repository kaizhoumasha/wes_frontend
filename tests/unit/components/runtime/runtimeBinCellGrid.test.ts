import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import RuntimeBinCellGrid from '@/components/runtime/monitor/RuntimeBinCellGrid.vue'
import type { RuntimeSceneRackBin, RuntimeSceneRackCell } from '@/utils/runtime-scene'

function createCell(
  code: string,
  overrides: Partial<RuntimeSceneRackCell> = {}
): RuntimeSceneRackCell {
  return {
    key: `cell:${code}`,
    code,
    displayLabel: `Cell ${code}`,
    materials: [],
    materialSummary: null,
    materialReels: [],
    evidenceCount: 1,
    evidenceKinds: ['TRACE_RESOURCE_EVIDENCE'],
    auditItems: [],
    ...overrides
  }
}

function createBin(cells: RuntimeSceneRackCell[]): RuntimeSceneRackBin {
  return {
    key: 'bin:BIN-001',
    code: 'BIN-001',
    displayLabel: 'Bin BIN-001',
    cells,
    looseMaterials: [],
    evidenceCount: cells.length,
    evidenceKinds: ['TRACE_RESOURCE_EVIDENCE'],
    auditItems: []
  }
}

describe('RuntimeBinCellGrid', () => {
  it('keeps the vertical divider between cells 2 and 1 in three-cell layout', () => {
    const wrapper = mount(RuntimeBinCellGrid, {
      props: {
        bin: createBin([createCell('CELL-7'), createCell('CELL-2'), createCell('CELL-1')])
      }
    })

    const cells = wrapper.findAll('[data-test="runtime-bin-cell"]')

    expect(wrapper.get('[data-test="runtime-bin-cell-grid"]').text()).toContain('C')
    expect(cells.map(cell => cell.text())).toEqual([
      '7CELL-7 无料',
      '2CELL-2 无料',
      '1CELL-1 无料'
    ])
    expect(cells[1]?.classes()).toContain('is-left-cell')
    expect(cells[2]?.classes()).toContain('is-right-cell')
  })

  it('shows material batch summary and reel count by default in occupied cells', () => {
    const wrapper = mount(RuntimeBinCellGrid, {
      props: {
        bin: createBin([
          createCell('CELL-1', {
            materialSummary: {
              materialCode: '620100L00-011-G',
              dateCode: '2401',
              lotCode: 'LOT-A',
              reelCount: 2,
              batchStatus: 'single',
              hasBatchFields: true
            },
            materialReels: [
              {
                key: 'reel:bottom',
                reelCode: 'REEL-BOTTOM',
                materialCode: '620100L00-011-G',
                dateCode: '2401',
                lotCode: 'LOT-A',
                positionIndex: 1,
                displayLabel: 'REEL-BOTTOM'
              },
              {
                key: 'reel:top',
                reelCode: 'REEL-TOP',
                materialCode: '620100L00-011-G',
                dateCode: '2401',
                lotCode: 'LOT-A',
                positionIndex: 2,
                displayLabel: 'REEL-TOP'
              }
            ]
          })
        ])
      }
    })

    const cell = wrapper
      .findAll('[data-test="runtime-bin-cell"]')
      .find(item => item.text().includes('CELL-1'))
    expect(cell).toBeTruthy()
    expect(cell!.text()).toContain('620100L00-011-G')
    expect(cell!.text()).toContain('DC 2401')
    expect(cell!.text()).toContain('LC LOT-A')
    expect(cell!.text()).toContain('2 盘')
  })

  it('emits selected cell key when an occupied cell is clicked', async () => {
    const wrapper = mount(RuntimeBinCellGrid, {
      props: {
        bin: createBin([createCell('CELL-1')])
      }
    })

    const cell = wrapper
      .findAll('[data-test="runtime-bin-cell"]')
      .find(item => item.text().includes('CELL-1'))
    expect(cell).toBeTruthy()

    await cell!.trigger('click')

    expect(wrapper.emitted('selectCell')).toEqual([[expect.objectContaining({ code: 'CELL-1' })]])
  })
})
