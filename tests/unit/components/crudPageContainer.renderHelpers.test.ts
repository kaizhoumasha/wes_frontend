import { describe, expect, it, vi } from 'vitest'
import { resolveCrudTableData, resolveCrudTreeModeConfig } from '@/components/common/crud-page/container/render-helpers'

describe('crud page container render helpers', () => {
  it('uses tree data in active tree mode without search', () => {
    expect(resolveCrudTableData({
      isTreeMode: true,
      isTrashMode: false,
      isSearchMode: false,
      data: [{ id: 1, name: 'flat' }],
      treeData: [{ id: 2, name: 'tree' }],
    })).toEqual([{ id: 2, name: 'tree' }])
  })

  it('uses flat data in tree search mode', () => {
    expect(resolveCrudTableData({
      isTreeMode: true,
      isTrashMode: false,
      isSearchMode: true,
      data: [{ id: 1, name: 'flat' }],
      treeData: [{ id: 2, name: 'tree' }],
    })).toEqual([{ id: 1, name: 'flat' }])
  })

  it('uses flat data in trash mode even for tree pages', () => {
    expect(resolveCrudTableData({
      isTreeMode: true,
      isTrashMode: true,
      isSearchMode: false,
      data: [{ id: 3, name: 'trash-flat' }],
      treeData: [{ id: 4, name: 'tree' }],
    })).toEqual([{ id: 3, name: 'trash-flat' }])
  })

  it('disables tree mode config in trash mode', () => {
    const config = resolveCrudTreeModeConfig({
      isTreeMode: true,
      isTrashMode: true,
      treeState: {
        loadChildren: vi.fn(),
        expandedKeys: new Set([1, 2]),
      },
      config: {
        childrenKey: 'children',
        hasChildrenKey: 'has_children',
        lazyLoad: true,
      },
    })

    expect(config).toBeUndefined()
  })

  it('builds tree mode config in active tree mode', () => {
    const loadChildren = vi.fn()
    const config = resolveCrudTreeModeConfig({
      isTreeMode: true,
      isTrashMode: false,
      treeState: {
        loadChildren,
        expandedKeys: new Set([5]),
      },
      config: {
        childrenKey: 'nodes',
        hasChildrenKey: 'hasNodes',
        lazyLoad: false,
      },
    })

    expect(config).toEqual({
      treeProps: {
        children: 'nodes',
        hasChildren: 'hasNodes',
      },
      rowKey: 'id',
      lazy: false,
      load: loadChildren,
      defaultExpandRowKeys: [5],
    })
  })
})
