import { ref } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import { useCrudPageRowActions } from '@/components/common/crud-page/controller/useCrudPageRowActions'
import { useCrudPageToolbarActions } from '@/components/common/crud-page/controller/useCrudPageToolbarActions'
import {
  buildDefaultRowActions,
  buildDefaultToolbarActions
} from '@/components/common/crud-page/helpers/actions'
import { resolveCrudPageFeatures } from '@/components/common/crud-page/helpers/features'
import type {
  CrudPageConfig,
  CrudPagePermissionConfig
} from '@/components/common/crud-page/types'

type TestItem = {
  id: number
}

const SPLIT_PERMISSIONS = {
  update: 'test:update',
  delete: 'test:delete',
  restore: 'test:restore',
  permanentDelete: 'test:permanent-delete',
  batchRestore: 'test:batch-restore',
  batchPermanentDelete: 'test:batch-permanent-delete',
  move: 'test:move',
  batchSort: 'test:batch-sort'
} satisfies CrudPagePermissionConfig

function createConfig(): CrudPageConfig<TestItem, Record<string, never>, Record<string, never>> {
  return {
    resource: {
      key: 'test',
      title: { text: 'Test' },
      requestAdapter: {} as CrudPageConfig<
        TestItem,
        Record<string, never>,
        Record<string, never>
      >['resource']['requestAdapter'],
      permissions: SPLIT_PERMISSIONS
    },
    search: { fields: [] },
    table: {
      columns: {
        defaultColumns: [],
        createManager: vi.fn()
      }
    }
  }
}

function createState(viewMode: 'active' | 'trash') {
  return {
    state: {
      viewMode: ref(viewMode),
      selectedCount: ref(1),
      batchDeleteLoading: ref(false),
      batchRestoreLoading: ref(false),
      batchPermanentDeleteLoading: ref(false)
    },
    dialogs: {
      openCreate: vi.fn(),
      openEdit: vi.fn()
    },
    permissions: {
      update: ref(true),
      delete: ref(true),
      restore: ref(true),
      permanentDelete: ref(true)
    }
  }
}

describe('split CRUD permission bindings', () => {
  it('binds row and batch trash actions to their route-specific permissions', () => {
    const config = createConfig()
    const features = resolveCrudPageFeatures({
      trash: true,
      restore: true,
      batchRestore: true,
      permanentDelete: true,
      batchPermanentDelete: true
    })
    const state = createState('trash')
    state.permissions.delete.value = false

    const toolbarActions = buildDefaultToolbarActions({
      config,
      features,
      state,
      onBatchDelete: vi.fn(),
      onBatchRestore: vi.fn(),
      onBatchPermanentDelete: vi.fn()
    })
    const rowActions = buildDefaultRowActions({
      config,
      features,
      state,
      onDelete: vi.fn(),
      onRestore: vi.fn(),
      onPermanentDelete: vi.fn()
    })

    expect(toolbarActions.map(action => [action.key, action.permission])).toEqual([
      ['test-batch-restore', 'test:batch-restore'],
      ['test-batch-permanent-delete', 'test:batch-permanent-delete']
    ])
    expect(rowActions.map(action => [action.key, action.permission])).toEqual([
      ['test-restore', 'test:restore'],
      ['test-permanent-delete', 'test:permanent-delete']
    ])
    const permanentDeleteShow = rowActions.find(
      action => action.key === 'test-permanent-delete'
    )?.show
    expect(typeof permanentDeleteShow).toBe('function')
    expect((permanentDeleteShow as (row: TestItem) => boolean)({ id: 1 })).toBe(true)
  })

  it('binds tree move and sort actions to their route-specific permissions', () => {
    const config = createConfig()
    const features = resolveCrudPageFeatures({ move: { enabled: true }, sort: { enabled: true } })
    const state = {
      ...createState('active'),
      tree: {
        isTreeMode: ref(true),
        move: vi.fn(),
        fetchTree: vi.fn()
      }
    }

    const rowActions = useCrudPageRowActions({
      config,
      features,
      state,
      handlers: {
        onDelete: vi.fn(),
        onRestore: vi.fn(),
        onPermanentDelete: vi.fn(),
        onMove: vi.fn(),
        onCreateChild: vi.fn(),
        onViewDetail: vi.fn()
      }
    })
    const toolbarActions = useCrudPageToolbarActions({
      config,
      features,
      state,
      toolbarActionContext: {
        applyQuickPreset: vi.fn(),
        clearFilters: vi.fn(),
        refresh: vi.fn()
      },
      handlers: {
        handleBatchDelete: vi.fn(),
        handleBatchRestore: vi.fn(),
        handleBatchPermanentDelete: vi.fn(),
        handleCreate: vi.fn(),
        handleSort: vi.fn()
      }
    })

    expect(rowActions.value.find(action => action.key === 'test-move')?.permission).toBe('test:move')
    expect(toolbarActions.value.find(action => action.key === 'test-sort')?.permission).toBe(
      'test:batch-sort'
    )
  })
})
