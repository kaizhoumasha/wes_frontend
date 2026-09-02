import { describe, expect, it, vi } from 'vitest'
import { useCrudPageActions } from '@/components/common/crud-page/controller/useCrudPageActions'
import type { CrudPageConfig } from '@/components/common/crud-page/types'

interface TestDevice {
  id: number
  device_code: string
}

interface TestCreate {
  device_code: string
}

interface TestUpdate {
  device_code?: string
}

describe('useCrudPageActions create result boundary', () => {
  it('propagates a create conflict without reporting a successful create result', async () => {
    const conflict = new Error('设备编码已存在，请检查回收站')
    const onCreateResult = vi.fn()
    const handleCreate = vi.fn().mockRejectedValue(conflict)
    const config = {
      form: {},
      resource: { onCreateResult }
    } as unknown as CrudPageConfig<TestDevice, TestCreate, TestUpdate>
    const actions = useCrudPageActions({
      config,
      state: {
        selection: {
          handleBatchDelete: vi.fn(),
          handleBatchRestore: vi.fn(),
          handleBatchPermanentDelete: vi.fn(),
          clearSelectionState: vi.fn(),
          handleSelectionChange: vi.fn()
        },
        dialogs: {
          close: vi.fn(),
          editingId: { value: null }
        },
        view: { setViewMode: vi.fn() },
        search: { handleSearch: vi.fn() },
        state: {
          viewMode: { value: 'active' },
          pagination: { page: 1 }
        },
        apiActions: {
          handleEdit: vi.fn(),
          handleCreate
        }
      },
      clearTableSelection: vi.fn()
    })

    await expect(actions.handleSubmit({ device_code: 'DEVICE-01' })).rejects.toBe(conflict)
    expect(handleCreate).toHaveBeenCalledWith({ device_code: 'DEVICE-01' })
    expect(onCreateResult).not.toHaveBeenCalled()
  })
})
